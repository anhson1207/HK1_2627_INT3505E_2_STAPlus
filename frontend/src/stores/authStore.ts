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
            const { token, username, role } = await authService.login(data);
            // A logout during an in-flight login must not restore the session.
            if (revision !== sessionRevision) throw new Error("Yêu cầu đăng nhập đã bị hủy.");
            const user = { username, role };
            saveAuthSession({ token, user });
            set({ token, user, isAuthenticated: true });
        } finally {
            if (revision === sessionRevision) set({ isLoading: false });
        }
    },

    logout: () => {
        sessionRevision += 1;
        removeAuthSession();
        // Client-side logout only: backend has no logout/revoke endpoint.
        set({ ...EMPTY_SESSION, isLoading: false });
    },
}));

configureApiAuth({
    getToken: () => useAuthStore.getState().token,
    onUnauthorized: () => useAuthStore.getState().logout(),
});
