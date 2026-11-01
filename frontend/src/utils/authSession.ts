import { isUserRole, type AuthUser } from "../types/auth";

export const AUTH_STORAGE_KEY = "crm-soa.auth.backend.v1";

export interface AuthSession {
    token: string;
    user: AuthUser;
}

export function readAuthSession(): AuthSession | null {
    // Temporary: restore auth state from localStorage.
    // Backend currently does not provide GET /api/auth/me.
    // This restores UI state only; the server must authorize protected requests.
    try {
        const raw = localStorage.getItem(AUTH_STORAGE_KEY);
        if (!raw) return null;
        const value = JSON.parse(raw);
        if (typeof value?.token !== "string" || !value.token.trim()
            || typeof value?.user?.username !== "string" || !value.user.username.trim()
            || !isUserRole(value?.user?.role)) return null;
        return { token: value.token, user: { username: value.user.username, role: value.user.role } };
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
