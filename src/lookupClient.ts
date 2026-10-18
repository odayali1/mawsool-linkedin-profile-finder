import { log } from 'apify';
import type { InfoApiResponse, MatchStrategy, PersonInput } from './types.js';

const LOOKUP_ROUTE = 'info';
const DEFAULT_PRIMARY_BASE_URL = 'https://rev-api.173.212.217.163.sslip.io';
const DEFAULT_FALLBACK_BASE_URL = 'https://rev-api.mawsool.tech';
const RETRY_DELAY_MS = 1000;
const PRIMARY_ATTEMPTS = 4;
const FALLBACK_ATTEMPTS = 2;
const LOOKUP_TIMEOUT_MS = 45_000;

export function getApiBaseUrl(): string {
    return (process.env.MAWSOOL_API_BASE_URL || DEFAULT_PRIMARY_BASE_URL).replace(/\/$/, '');
}

export function getFallbackApiBaseUrl(): string {
    return (process.env.MAWSOOL_API_FALLBACK_BASE_URL || DEFAULT_FALLBACK_BASE_URL).replace(/\/$/, '');
}

export function getApiKey(): string {
    const key = process.env.MAWSOOL_API_KEY?.trim();
    if (!key) {
        throw new Error(
            'MAWSOOL_API_KEY is not configured. Set it as a Secret environment variable in the Apify Console.',
        );
    }
    return key;
}

function getFallbackApiKey(): string {
    return (process.env.MAWSOOL_API_FALLBACK_KEY || process.env.MAWSOOL_API_KEY || '').trim();
}

export function normalizePeople(raw: PersonInput[]): PersonInput[] {
    const out: PersonInput[] = [];
    const seen = new Set<string>();

    for (const person of raw || []) {
        if (!person || typeof person !== 'object') continue;
        const firstName = String(person.firstName || '').trim();
        const lastName = String(person.lastName || '').trim();
        const company = String(person.company || '').trim();
        if (!firstName || !lastName || !company) continue;

        const jobTitle = person.jobTitle ? String(person.jobTitle).trim() : '';
        const linkedinUrl = person.linkedinUrl ? String(person.linkedinUrl).trim() : '';
        const key = `${firstName.toLowerCase()}|${lastName.toLowerCase()}|${company.toLowerCase()}|${jobTitle.toLowerCase()}|${linkedinUrl.toLowerCase()}`;
        if (seen.has(key)) continue;
        seen.add(key);

        out.push({
            firstName,
            lastName,
            company,
            ...(jobTitle ? { jobTitle } : {}),
            ...(linkedinUrl ? { linkedinUrl } : {}),
        });
    }

    return out;
}

function parseJsonBody(text: string): (InfoApiResponse & { error?: string }) | null {
    const trimmed = text.trim();
    if (!trimmed || trimmed.startsWith('<')) return null;
    try {
        return JSON.parse(trimmed) as InfoApiResponse & { error?: string };
    } catch {
        return null;
    }
}

function htmlErrorHint(): string {
    return 'The lookup service returned an unexpected response. Please try again shortly.';
}

function publicError(message: string): string {
    return message.replace(/https?:\/\/\S+/gi, 'the lookup service');
}

function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

function isTransientLookupFailure(result: InfoApiResponse): boolean {
    if (result.success) return false;
    const status = result.statusCode || 0;
    const error = (result.error || '').toLowerCase();
    if (status === 403 || status === 408 || status === 425 || status === 429 || status === 500 || status === 502 || status === 503 || status === 504) return true;
    if (error.includes('temporarily unavailable')) return true;
    if (error.includes('lookup queue busy')) return true;
    if (error.includes('unexpected response') || error.includes('html instead of json')) return true;
    if (error.includes('did not answer in time')) return true;
    if (error.includes('network request failed') || error.includes('fetch failed') || error.includes('timed out') || error.includes('network')) return true;
    return false;
}

async function lookupPersonOnce(
    person: PersonInput,
    matchStrategy: MatchStrategy,
    baseUrl: string,
    apiKey: string,
): Promise<InfoApiResponse> {
    const url = `${baseUrl.replace(/\/$/, '')}/api/v1/lookup/${LOOKUP_ROUTE}`;

    const body: Record<string, string> = {
        firstName: person.firstName,
        lastName: person.lastName,
        company: person.company,
        infoMatchStrategy: matchStrategy,
    };
    if (person.jobTitle) body.jobTitle = person.jobTitle;
    if (person.linkedinUrl) body.linkedinUrl = person.linkedinUrl;

    let response: Response;
    try {
        response = await fetch(url, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                'User-Agent': 'Mawsool-Apify-Actor-ProfileFinder/1.2',
                'X-API-Key': apiKey,
            },
            body: JSON.stringify(body),
            signal: AbortSignal.timeout(LOOKUP_TIMEOUT_MS),
        });
    } catch (err) {
        const timedOut = err instanceof Error && (err.name === 'TimeoutError' || err.name === 'AbortError');
        const message = timedOut ? 'The lookup did not answer in time.' : publicError(err instanceof Error ? err.message : 'Network request failed');
        return {
            success: false,
            method: LOOKUP_ROUTE,
            firstName: person.firstName,
            lastName: person.lastName,
            company: person.company,
            error: message,
            statusCode: 502,
        };
    }

    const rawText = await response.text();
    const parsed = parseJsonBody(rawText);

    if (!parsed) {
        return {
            success: false,
            method: LOOKUP_ROUTE,
            firstName: person.firstName,
            lastName: person.lastName,
            company: person.company,
            error: htmlErrorHint(),
            statusCode: response.status || 502,
        };
    }

    if (!response.ok) {
        return {
            success: false,
            method: LOOKUP_ROUTE,
            firstName: person.firstName,
            lastName: person.lastName,
            company: person.company,
            error: parsed.error || `Lookup failed with HTTP ${response.status}`,
            statusCode: response.status,
        };
    }

    return parsed;
}

async function tryLookup(
    attempts: number,
    run: () => Promise<InfoApiResponse>,
): Promise<InfoApiResponse> {
    let result = await run();
    for (let attempt = 1; attempt < attempts && isTransientLookupFailure(result); attempt += 1) {
        log.warning(`Profile lookup attempt ${attempt} of ${attempts} did not succeed. Retrying.`);
        await sleep(Math.min(8000, RETRY_DELAY_MS * (2 ** (attempt - 1))));
        result = await run();
    }
    return result;
}

/**
 * Primary API, several retries on temporary failures, then the fallback API.
 */
export async function lookupPerson(
    person: PersonInput,
    matchStrategy: MatchStrategy,
): Promise<InfoApiResponse> {
    const primaryBase = getApiBaseUrl();
    const primaryKey = getApiKey();
    const fallbackBase = getFallbackApiBaseUrl();
    const fallbackKey = getFallbackApiKey();

    const result = await tryLookup(PRIMARY_ATTEMPTS, () => lookupPersonOnce(person, matchStrategy, primaryBase, primaryKey));
    if (!isTransientLookupFailure(result) || !fallbackKey || fallbackBase === primaryBase) return result;

    log.warning('Primary profile lookup did not succeed. Trying the backup lookup service.');
    return tryLookup(FALLBACK_ATTEMPTS, () => lookupPersonOnce(person, matchStrategy, fallbackBase, fallbackKey));
}
