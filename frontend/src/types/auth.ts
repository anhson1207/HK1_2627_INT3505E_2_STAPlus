export const USER_ROLES = ["ADMIN", "SALES", "MANAGER"] as const;
export type UserRole = typeof USER_ROLES[number];

export interface AuthUser {
    username: string;
    role: UserRole;
}

export interface LoginRequest {
    username: string;
    password: string;
}

export interface RegisterRequest {
    username: string;
    email: string;
    password: string;
}

export interface LoginResponse extends AuthUser {
    token: string;
    message: string;
}

// AuthServiceImpl.register returns AuthResponse without assigning a token.
export interface RegisterResponse extends AuthUser {
    token: null;
    message: string;
}

export function isUserRole(value: unknown): value is UserRole {
    return USER_ROLES.some((role) => role === value);
}
