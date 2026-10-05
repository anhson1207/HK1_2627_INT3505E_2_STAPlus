export type UserRole = "admin" | "sales" | "support";

export interface User {
    id: string;
    name: string;
    email: string;
    role: UserRole;
}