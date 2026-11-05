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
    | "PHONE"
    | "REFERRAL"
    | "EVENT"
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
    ownerId?: number;
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

export type AssignmentStrategy = "ROUND_ROBIN" | "LOAD_BALANCED" | "MANUAL";

export interface AssignmentRule {
    enabled: boolean;
    strategy: AssignmentStrategy;
    activeSalesIds: number[];
    unassignedCount: number;
}

export interface AutoAssignResult {
    assignedCount: number;
    totalUnassignedBefore: number;
    strategyUsed: string;
    assignmentSummary: Record<number, number>;
}
