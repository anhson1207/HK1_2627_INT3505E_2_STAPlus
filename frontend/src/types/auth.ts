export type UserRole = "ADMIN" | "SALES" | "SUPPORT";
export type AuthProvider = "LOCAL" | "GOOGLE";

export interface User {
    id: number;
    fullName: string;
    email: string;
    role: UserRole;
    provider: AuthProvider;
    emailVerified: boolean;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    fullName: string;
    email: string;
    password: string;
}

export interface LoginResponse {
    accessToken: string;
    refreshToken: string;
    user: User;
}

export interface RefreshTokenResponse {
    accessToken: string;
}

export interface ForgotPasswordResponse {
    resetToken: string;
}
