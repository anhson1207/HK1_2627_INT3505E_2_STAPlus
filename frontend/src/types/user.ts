import type { UserRole, UserStatus } from "./auth";
export type { UserRole, UserStatus } from "./auth";

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
