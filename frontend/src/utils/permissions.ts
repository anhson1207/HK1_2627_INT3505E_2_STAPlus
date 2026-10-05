import type { User, UserRole } from "../types/auth";

export function hasRole(
    user: User | null,
    roles: UserRole[]
): boolean {
    if (!user) {
        return false;
    }

    return roles.includes(user.role);
}