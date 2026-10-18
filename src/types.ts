export interface PersonInput {
    firstName: string;
    lastName: string;
    company: string;
    jobTitle?: string;
    linkedinUrl?: string;
}

export type MatchStrategy =
    | 'name_company_job_title'
    | 'name_company'
    | 'linkedin_url'
    | 'name_job_title'
    | 'company_job_title'
    | 'name'
    | 'company'
    | 'job_title';

export interface ActorInput {
    people?: PersonInput[];
    /** Paste CSV with header: firstName,lastName,company,jobTitle,linkedinUrl */
    peopleCsv?: string;
    /** Uploaded CSV file URL from Apify fileupload editor */
    peopleFileUrl?: string;
    matchStrategy?: MatchStrategy;
    maxPeople?: number;
    concurrency?: number;
    resumeId?: string;
    freshStart?: boolean;
}

export interface ProfileLocale {
    country?: string;
    language?: string;
}

export interface ProfileResult {
    id?: string;
    profileId?: string;
    displayName?: string;
    firstName?: string;
    lastName?: string;
    headline?: string;
    summary?: string;
    profileUrl?: string;
    pictureUrl?: string;
    isPublic?: boolean;
    locale?: ProfileLocale;
    company?: string;
    location?: string;
    educationsCount?: number;
    positionsCount?: number;
    skillsCount?: number;
    skills?: string[];
    schools?: { educationsCount?: number; educationHistory?: unknown[] };
    positions?: { positionsCount?: number; positionHistory?: unknown[] };
}

export interface InfoSuccessResponse {
    success: true;
    method: string;
    firstName?: string;
    lastName?: string;
    company?: string;
    jobTitle?: string;
    linkedinUrl?: string;
    hasLinkedIn: boolean;
    matchType?: string;
    infoMatchStrategy?: string;
    profile: ProfileResult | null;
    checkedAt: string;
}

export interface InfoErrorResponse {
    success: false;
    method?: string;
    firstName?: string;
    lastName?: string;
    company?: string;
    error: string;
    statusCode?: number;
}

export type InfoApiResponse = InfoSuccessResponse | InfoErrorResponse;

export interface ProfileFlatFields {
    profileId: string;
    fullName: string;
    headline: string;
    summary: string;
    linkedinUrl: string;
    pictureUrl: string;
    matchedCompany: string;
    location: string;
    isPublic: string;
    localeCountry: string;
    localeLanguage: string;
    educationsCount: number;
    positionsCount: number;
    skillsCount: number;
    skills: string;
    educationHistory: string;
    positionHistory: string;
    profileRawJson: string;
    profileFlattenedJson: string;
}

export interface DatasetRow extends ProfileFlatFields {
    [key: string]: string | number | boolean | null;
    firstName: string;
    lastName: string;
    company: string;
    jobTitle: string;
    inputLinkedinUrl: string;
    hasLinkedIn: boolean;
    matchType: string;
    matchStrategy: string;
    checkedAt: string;
    success: boolean;
    error: string;
    statusCode: number | null;
}
