import { Actor, log } from 'apify';
import { createHash } from 'node:crypto';
import { collectPeople, resolveStrategy } from './inputParser.js';
import { lookupPerson, normalizePeople } from './lookupClient.js';
import { errorDatasetRow, toDatasetRow } from './rowMapper.js';
import type { ActorInput, PersonInput } from './types.js';

const CHARGE_EVENT = 'profile-lookup';
const HARD_MAX = 100_000;

function worthRetry(status: number | null, error: string): boolean {
    if (status === 403 || status === 408 || status === 425 || status === 429 || status === 500 || status === 502 || status === 503 || status === 504) return true;
    const text = error.toLowerCase();
    return text.includes('did not answer') || text.includes('fetch failed') || text.includes('network') || text.includes('unexpected response') || text.includes('temporarily') || text.includes('queue busy') || text.includes('timed out');
}

function recordKey(person: PersonInput): string {
    const key = `${person.firstName}|${person.lastName}|${person.company}|${person.jobTitle || ''}|${person.linkedinUrl || ''}`.toLowerCase();
    return createHash('sha256').update(key).digest('hex');
}

await Actor.init();

const input = (await Actor.getInput<ActorInput>()) || ({} as ActorInput);
const strategy = resolveStrategy(input.matchStrategy);

let collected;
try {
    collected = await collectPeople(input);
} catch (err) {
    const message = err instanceof Error ? err.message : 'Invalid people input';
    throw new Error(message);
}

const maxPeople = Math.min(Math.max(input.maxPeople ?? 100, 1), HARD_MAX);
const people = normalizePeople(collected).slice(0, maxPeople);

if (people.length === 0) {
    throw new Error(
        'No valid people found. Add rows in the People form, paste CSV (firstName,lastName,company,...), or upload a CSV file.',
    );
}

if (collected.length > people.length) {
    log.warning(`Processing ${people.length} valid people (skipped invalid/duplicate rows, or the list was over the cap).`);
}

const concurrency = Math.min(Math.max(Number(input.concurrency ?? 10), 1), 40);
const progressId = (input.resumeId || 'auto').replace(/[^a-zA-Z0-9-_]/g, '-').slice(0, 60) || 'auto';
const saveProgress = people.length > 20 || !!input.resumeId;
const skipFinished = saveProgress && !input.freshStart && (people.length > 200 || !!input.resumeId);
const resumeStore = saveProgress
    ? await Actor.openKeyValueStore(input.resumeId ? `mawsool-name-resume-${progressId}` : 'mawsool-name-progress-auto')
    : null;

log.info(`Starting ${people.length} LinkedIn profile lookup(s), concurrency=${concurrency}. Match strategy: ${strategy}.`);
if (skipFinished) log.info('Finished people from an earlier run of this list are skipped. Set freshStart to look them up again.');

let batch = people;
let deferFailures = people.length > 1;
let nextIndex = 0;
const deferred: PersonInput[] = [];
let processed = 0;
let found = 0;
let failed = 0;
let skipped = 0;
let stop = false;
let consecutiveOutages = 0;

function noteOutcome(message: string | null): void {
    if (!message) {
        consecutiveOutages = 0;
        return;
    }
    if (!worthRetry(null, message) && !/http 5\d\d|403|429|502|503|504/.test(message.toLowerCase())) {
        consecutiveOutages = 0;
        return;
    }
    consecutiveOutages += 1;
    if (consecutiveOutages >= 15 && !stop) {
        stop = true;
        log.error('The lookup service looks unavailable. Stopping so finished rows stay saved and the next run can continue.');
    }
}

async function recordPerson(person: PersonInput, allowDefer: boolean): Promise<void> {
    const label = `${person.firstName} ${person.lastName} @ ${person.company}`;
    const key = `done-${recordKey(person)}`;
    if (skipFinished && resumeStore && await resumeStore.getValue(key)) {
        skipped += 1;
        return;
    }
    try {
        const result = await lookupPerson(person, strategy);
        const row = toDatasetRow(person, result, strategy);
        if (allowDefer && !stop && !row.success && worthRetry(row.statusCode, row.error || '')) {
            noteOutcome(row.error || 'temporary failure');
            deferred.push(person);
            log.warning(`Profile lookup failed and will be retried at the end: ${row.error}`);
            return;
        }
        const charge = await Actor.pushData(row, CHARGE_EVENT);
        if (charge?.eventChargeLimitReached) stop = true;
        if (resumeStore && row.success) await resumeStore.setValue(key, { at: new Date().toISOString() });
        noteOutcome(row.success ? null : (worthRetry(row.statusCode, row.error || '') ? row.error || 'temporary failure' : null));
        processed += 1;
        if (row.success && row.hasLinkedIn) found += 1;
        if (!row.success) failed += 1;
        log.info(
            `Processed ${label}: ${
                row.success
                    ? row.hasLinkedIn
                        ? `LinkedIn matched (${row.matchType})`
                        : `no confident match (${row.matchType})`
                    : `error (${row.error})`
            }`,
        );
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Unexpected lookup error';
        noteOutcome(message);
        if (allowDefer && !stop && worthRetry(null, message)) {
            deferred.push(person);
            log.warning(`Profile lookup failed and will be retried at the end: ${message}`);
            return;
        }
        const charge = await Actor.pushData(errorDatasetRow(person, message, strategy), CHARGE_EVENT);
        if (charge?.eventChargeLimitReached) stop = true;
        failed += 1;
        processed += 1;
        log.error(`Lookup failed for ${label}: ${message}`);
    }
}

async function runBatch(): Promise<void> {
    nextIndex = 0;
    const workers = Math.min(concurrency, batch.length);
    if (!workers) return;
    await Promise.all(Array.from({ length: workers }, async () => {
        while (!stop) {
            const index = nextIndex++;
            if (index >= batch.length) return;
            await recordPerson(batch[index], deferFailures);
        }
    }));
}

await runBatch();
if (deferred.length && !stop) {
    log.info(`Retrying ${deferred.length} profile lookup(s) that failed on the first pass.`);
    await new Promise((resolve) => setTimeout(resolve, 3000));
    batch = deferred.splice(0, deferred.length);
    deferFailures = false;
    await runBatch();
}

await Actor.setValue('OUTPUT', {
    processed,
    found,
    failed,
    skipped,
    processedPeople: people.length,
    matchStrategy: strategy,
    stoppedByChargeLimit: stop,
});

log.info(`Finished. Processed: ${processed}, LinkedIn profiles found: ${found}, failed: ${failed}, skipped: ${skipped}`);
await Actor.exit();
