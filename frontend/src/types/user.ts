
export type UserRole = "ADMIN" | "SALES" | "SUPPORT" | "UNASSIGNED";
export type UserStatus = "PENDING" | "ACTIVE" | "INACTIVE";

export interface CRMUser {
    id: number;
    fullName: string;
    email: string;
    phone?: string;
    role: UserRole;
    status: UserStatus;
    avatar?: string;
    department?: string;
    createdAt: string;
}

export type CRMUserPayload = Omit<CRMUser, "id" | "createdAt">;
