import { create } from "zustand";

import { configureApiAuth } from "../services/api";
import { authService } from "../services/authService";
import type { AuthUser, LoginRequest } from "../types/auth";
import { readAuthSession, removeAuthSession, saveAuthSession } from "../utils/authSession";

interface AuthState {
    user: AuthUser | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (data: LoginRequest) => Promise<void>;
    logout: () => void;
    updateUser: (partial: Partial<AuthUser>) => void;
    refreshUser: () => Promise<AuthUser | null>;
}

const EMPTY_SESSION = { user: null, token: null, isAuthenticated: false };
const restored = readAuthSession();
let sessionRevision = 0;

export const useAuthStore = create<AuthState>((set, get) => ({
    user: restored?.user ?? null,
    token: restored?.token ?? null,
    isAuthenticated: Boolean(restored),
    isLoading: false,

    login: async (data) => {
        if (get().isLoading) throw new Error("Đang xử lý đăng nhập. Vui lòng chờ.");
        const revision = ++sessionRevision;
        set({ isLoading: true });
        try {
            const loginRes = await authService.login(data);
            // A logout during an in-flight login must not restore the session.
            if (revision !== sessionRevision) throw new Error("Yêu cầu đăng nhập đã bị hủy.");
            const token = loginRes.token;
            const user: AuthUser = {
                id: loginRes.userId,
                username: loginRes.username,
                fullName: loginRes.fullName,
                email: loginRes.email,
                role: loginRes.role,
                status: loginRes.status,
                isOwner: loginRes.isOwner,
                companyName: loginRes.companyName,
            };
            saveAuthSession({ token, user });
            set({ token, user, isAuthenticated: true });

            // Enrich with full profile in background
            try {
                const me = await authService.getMe();
                if (revision === sessionRevision) {
                    const fullUser: AuthUser = {
                        ...user,
                        id: me.id,
                        fullName: me.fullName || user.fullName || "",
                        email: me.email || user.email || "",
                        phone: me.phone || "",
                        department: me.department || "",
                        isOwner: me.isOwner ?? user.isOwner,
                        status: me.status ?? user.status,
                        role: me.role ?? user.role,
                    };
                    saveAuthSession({ token, user: fullUser });
                    set({ user: fullUser });
                }
            } catch {
                // Ignore fallback to basic user
            }
        } finally {
            if (revision === sessionRevision) set({ isLoading: false });
        }
    },

    refreshUser: async () => {
        const token = get().token;
        if (!token) return null;
        try {
            const me = await authService.getMe();
            const currentUser = get().user;
            const updated: AuthUser = {
                ...currentUser,
                id: me.id,
                username: me.username,
                fullName: me.fullName || "",
                email: me.email,
                phone: me.phone || "",
                department: me.department || "",
                role: me.role,
                status: me.status,
                isOwner: me.isOwner,
            };
            saveAuthSession({ token, user: updated });
            set({ user: updated });
            return updated;
        } catch {
            return get().user;
        }
    },

    logout: () => {
        sessionRevision += 1;
        removeAuthSession();
        // Client-side logout only: backend has no logout/revoke endpoint.
        set({ ...EMPTY_SESSION, isLoading: false });
    },

    updateUser: (partial) => {
        const currentUser = get().user;
        if (!currentUser) return;
        const updated = { ...currentUser, ...partial };
        const token = get().token;
        if (token) {
            saveAuthSession({ token, user: updated });
        }
        set({ user: updated });
    },
}));

configureApiAuth({
    getToken: () => useAuthStore.getState().token,
    onUnauthorized: () => useAuthStore.getState().logout(),
});
