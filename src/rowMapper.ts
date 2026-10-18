import type {
    DatasetRow,
    InfoApiResponse,
    PersonInput,
    ProfileFlatFields,
    ProfileResult,
} from './types.js';

function joinList(values?: string[]): string {
    return (values || []).filter(Boolean).join('; ');
}

function jsonString(value: unknown): string {
    if (value === null || value === undefined) return '';
    try {
        return JSON.stringify(value);
    } catch {
        return '';
    }
}

function boolString(value: boolean | undefined): string {
    if (value === undefined) return '';
    return value ? 'true' : 'false';
}

function sanitizeKey(key: string): string {
    return key.replace(/[^a-zA-Z0-9_]/g, '_');
}

function isPrimitive(value: unknown): value is string | number | boolean | null {
    return value === null || ['string', 'number', 'boolean'].includes(typeof value);
}

function flattenObject(
    input: unknown,
    prefix = 'profile',
    out: Record<string, string | number | boolean> = {},
    depth = 0,
): Record<string, string | number | boolean> {
    if (depth > 7) return out;
    if (isPrimitive(input)) {
        out[prefix] = input ?? '';
        return out;
    }
    if (Array.isArray(input)) {
        out[prefix] = jsonString(input);
        return out;
    }
    if (!input || typeof input !== 'object') return out;

    for (const [rawKey, rawVal] of Object.entries(input as Record<string, unknown>)) {
        if (['reportProfileUrl', 'contactId', 'olsPersonaId', 'hostAppPersonaId'].includes(rawKey)) {
            continue;
        }
        const key = `${prefix}_${sanitizeKey(rawKey)}`;
        if (isPrimitive(rawVal)) {
            out[key] = rawVal ?? '';
            continue;
        }
        if (Array.isArray(rawVal)) {
            out[key] = jsonString(rawVal);
            continue;
        }
        flattenObject(rawVal, key, out, depth + 1);
    }
    return out;
}

function emptyProfileFields(): ProfileFlatFields {
    return {
        profileId: '',
        fullName: '',
        headline: '',
        summary: '',
        linkedinUrl: '',
        pictureUrl: '',
        matchedCompany: '',
        location: '',
        isPublic: '',
        localeCountry: '',
        localeLanguage: '',
        educationsCount: 0,
        positionsCount: 0,
        skillsCount: 0,
        skills: '',
        educationHistory: '',
        positionHistory: '',
        profileRawJson: '',
        profileFlattenedJson: '',
    };
}

function profileToFields(profile: ProfileResult | null | undefined): ProfileFlatFields {
    if (!profile) return emptyProfileFields();

    const educationHistory = profile.schools?.educationHistory ?? [];
    const positionHistory = profile.positions?.positionHistory ?? [];
    const skills = profile.skills ?? [];
    const flat = flattenObject(profile);

    return {
        ...flat,
        profileId: profile.profileId || profile.id || '',
        fullName: profile.displayName || '',
        headline: profile.headline || '',
        summary: profile.summary || '',
        linkedinUrl: profile.profileUrl || '',
        pictureUrl: profile.pictureUrl || '',
        matchedCompany: profile.company || '',
        location: profile.location || '',
        isPublic: boolString(profile.isPublic),
        localeCountry: profile.locale?.country || '',
        localeLanguage: profile.locale?.language || '',
        educationsCount: profile.educationsCount ?? profile.schools?.educationsCount ?? educationHistory.length,
        positionsCount: profile.positionsCount ?? profile.positions?.positionsCount ?? positionHistory.length,
        skillsCount: profile.skillsCount ?? skills.length,
        skills: joinList(skills),
        educationHistory: jsonString(educationHistory),
        positionHistory: jsonString(positionHistory),
        profileRawJson: jsonString(profile),
        profileFlattenedJson: jsonString(flat),
    };
}

export function toDatasetRow(
    person: PersonInput,
    result: InfoApiResponse,
    fallbackStrategy: string,
): DatasetRow {
    const fields = profileToFields(result.success ? result.profile : null);

    if (result.success) {
        return {
            firstName: person.firstName,
            lastName: person.lastName,
            company: person.company,
            jobTitle: person.jobTitle || '',
            inputLinkedinUrl: person.linkedinUrl || '',
            hasLinkedIn: result.hasLinkedIn,
            matchType: result.matchType || (result.hasLinkedIn ? 'confident' : 'none'),
            matchStrategy: result.infoMatchStrategy || fallbackStrategy,
            ...fields,
            checkedAt: result.checkedAt,
            success: true,
            error: '',
            statusCode: 200,
        };
    }

    return {
        firstName: person.firstName,
        lastName: person.lastName,
        company: person.company,
        jobTitle: person.jobTitle || '',
        inputLinkedinUrl: person.linkedinUrl || '',
        hasLinkedIn: false,
        matchType: 'none',
        matchStrategy: fallbackStrategy,
        ...emptyProfileFields(),
        checkedAt: '',
        success: false,
        error: result.error || 'Lookup failed',
        statusCode: result.statusCode ?? null,
    };
}

export function errorDatasetRow(person: PersonInput, message: string, strategy: string): DatasetRow {
    return {
        firstName: person.firstName,
        lastName: person.lastName,
        company: person.company,
        jobTitle: person.jobTitle || '',
        inputLinkedinUrl: person.linkedinUrl || '',
        hasLinkedIn: false,
        matchType: 'none',
        matchStrategy: strategy,
        ...emptyProfileFields(),
        checkedAt: '',
        success: false,
        error: message,
        statusCode: null,
    };
}
