import { isUserRole, type AuthUser } from "../types/auth";

export const AUTH_STORAGE_KEY = "crm-soa.auth.backend.v1";

export interface AuthSession {
    token: string;
    user: AuthUser;
}

export function readAuthSession(): AuthSession | null {
    // Restore authenticated user session metadata from localStorage; backend authorizes protected requests.
    try {
        const raw = localStorage.getItem(AUTH_STORAGE_KEY);
        if (!raw) return null;
        const value = JSON.parse(raw);
        const u = value?.user;
        if (typeof value?.token !== "string" || !value.token.trim()
            || typeof u?.username !== "string" || !u.username.trim()
            || !isUserRole(u?.role)) return null;
        return {
            token: value.token,
            user: {
                ...(typeof u.id === "number" ? { id: u.id } : {}),
                username: u.username,
                ...(typeof u.fullName === "string" ? { fullName: u.fullName } : {}),
                ...(typeof u.email === "string" ? { email: u.email } : {}),
                ...(typeof u.phone === "string" ? { phone: u.phone } : {}),
                ...(typeof u.department === "string" ? { department: u.department } : {}),
                ...(typeof u.avatarUrl === "string" ? { avatarUrl: u.avatarUrl } : {}),
                role: u.role,
                ...(typeof u.status === "string" ? { status: u.status } : {}),
                ...(typeof u.provider === "string" ? { provider: u.provider } : {}),
                ...(typeof u.emailVerified === "boolean" ? { emailVerified: u.emailVerified } : {}),
                ...(typeof u.isOwner === "boolean" ? { isOwner: u.isOwner } : {}),
                ...(typeof u.companyName === "string" ? { companyName: u.companyName } : {}),
            },
        };
    } catch {
        return null;
    }
}

export function saveAuthSession(session: AuthSession) {
    try {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
    } catch {
        throw new Error("Không thể lưu phiên đăng nhập. Vui lòng cho phép lưu trữ trên trình duyệt.");
    }
}

export function removeAuthSession() {
    try {
        localStorage.removeItem(AUTH_STORAGE_KEY);
    } catch {
        // Clear in-memory state even when browser storage is unavailable.
    }
}
