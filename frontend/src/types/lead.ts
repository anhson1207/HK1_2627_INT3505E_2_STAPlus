export type LeadStatus =
    | "NEW"
    | "CONTACTED"
    | "QUALIFIED"
    | "CONVERTED"
    | "LOST";

export type LeadSource =
    | "WEBSITE"
    | "FACEBOOK"
    | "ZALO"
    | "GOOGLE_ADS"
    | "REFERRAL"
    | "OTHER";

export interface Lead {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    company?: string;
    source: LeadSource;
    status: LeadStatus;
    ownerName?: string;
    createdAt: string;
    updatedAt?: string;
}

export type LeadPayload = Omit<Lead, "id" | "createdAt" | "updatedAt">;

export interface LeadQuery {
    page?: number;
    size?: number;
    search?: string;
    status?: LeadStatus | "";
    source?: LeadSource | "";
}
