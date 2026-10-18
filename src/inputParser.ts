import type { ActorInput, MatchStrategy, PersonInput } from './types.js';

const HEADER_ALIASES: Record<string, keyof PersonInput> = {
    firstname: 'firstName',
    first_name: 'firstName',
    first: 'firstName',
    lastname: 'lastName',
    last_name: 'lastName',
    last: 'lastName',
    company: 'company',
    companyname: 'company',
    company_name: 'company',
    employer: 'company',
    jobtitle: 'jobTitle',
    job_title: 'jobTitle',
    title: 'jobTitle',
    linkedinurl: 'linkedinUrl',
    linkedin_url: 'linkedinUrl',
    linkedin: 'linkedinUrl',
    profileurl: 'linkedinUrl',
    profile_url: 'linkedinUrl',
};

function splitCsvLine(line: string): string[] {
    const out: string[] = [];
    let cur = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i += 1) {
        const ch = line[i];
        if (ch === '"') {
            if (inQuotes && line[i + 1] === '"') {
                cur += '"';
                i += 1;
            } else {
                inQuotes = !inQuotes;
            }
            continue;
        }
        if (ch === ',' && !inQuotes) {
            out.push(cur.trim());
            cur = '';
            continue;
        }
        cur += ch;
    }
    out.push(cur.trim());
    return out;
}

function normalizeHeader(h: string): string {
    return h.trim().toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
}

/** Parse CSV text with header row into people. */
export function parsePeopleCsv(csvText: string | undefined | null): PersonInput[] {
    if (!csvText?.trim()) return [];

    const lines = csvText
        .replace(/^\uFEFF/, '')
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter((l) => l.length > 0);

    if (lines.length < 2) return [];

    const headers = splitCsvLine(lines[0]).map(normalizeHeader);
    const mapped = headers.map((h) => HEADER_ALIASES[h] || null);

    if (!mapped.includes('firstName') || !mapped.includes('lastName') || !mapped.includes('company')) {
        throw new Error(
            'CSV must include a header row with at least: firstName, lastName, company (optional: jobTitle, linkedinUrl).',
        );
    }

    const people: PersonInput[] = [];
    for (let i = 1; i < lines.length; i += 1) {
        const cols = splitCsvLine(lines[i]);
        const row: Partial<PersonInput> = {};
        mapped.forEach((field, idx) => {
            if (!field) return;
            const val = (cols[idx] || '').trim();
            if (val) (row as Record<string, string>)[field] = val;
        });
        if (row.firstName && row.lastName && row.company) {
            people.push(row as PersonInput);
        }
    }
    return people;
}

async function readFileContents(fileUrl: string): Promise<string> {
    const response = await fetch(fileUrl, { signal: AbortSignal.timeout(120_000) });
    if (!response.ok) {
        throw new Error(`Failed to download uploaded CSV (HTTP ${response.status}).`);
    }
    return response.text();
}

/** Merge form rows + pasted CSV + uploaded CSV into one people list. */
export async function collectPeople(input: ActorInput): Promise<PersonInput[]> {
    const fromForm = Array.isArray(input.people) ? input.people : [];
    const fromPaste = parsePeopleCsv(input.peopleCsv);

    let fromFile: PersonInput[] = [];
    if (input.peopleFileUrl?.trim()) {
        const text = await readFileContents(input.peopleFileUrl.trim());
        fromFile = parsePeopleCsv(text);
    }

    return [...fromForm, ...fromPaste, ...fromFile];
}

export function resolveStrategy(raw: string | undefined): MatchStrategy {
    const VALID = new Set<MatchStrategy>([
        'linkedin_url',
        'name_company_job_title',
        'name_company',
        'name_job_title',
        'company_job_title',
        'name',
        'company',
        'job_title',
    ]);
    if (raw && VALID.has(raw as MatchStrategy)) return raw as MatchStrategy;
    return 'linkedin_url';
}
