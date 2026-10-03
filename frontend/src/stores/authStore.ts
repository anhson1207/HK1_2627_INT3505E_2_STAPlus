import { create } from "zustand";
import { persist } from "zustand/middleware";

import { configureApiAuth } from "../services/api";
import { authService } from "../services/authService";
import type { LoginRequest, User } from "../types/auth";

interface AuthState {
    user: User | null;
    accessToken: string | null;
    refreshToken: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (data: LoginRequest) => Promise<void>;
    loginWithGoogle: () => Promise<void>;
    logout: () => Promise<void>;
    setAccessToken: (accessToken: string | null) => void;
    setUser: (user: User | null) => void;
    restoreSession: () => Promise<void>;
}

const EMPTY_SESSION = {
    user: null,
    accessToken: null,
    refreshToken: null,
    isAuthenticated: false,
};

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            ...EMPTY_SESSION,
            isLoading: true,

            login: async (data) => {
                set({ isLoading: true });
                try {
                    const response = await authService.login(data);
                    set({
                        user: response.user,
                        accessToken: response.accessToken,
                        refreshToken: response.refreshToken,
                        isAuthenticated: true,
                    });
                } finally {
                    set({ isLoading: false });
                }
            },

            loginWithGoogle: async () => {
                set({ isLoading: true });
                try {
                    const response = await authService.loginWithGoogle();
                    set({
                        user: response.user,
                        accessToken: response.accessToken,
                        refreshToken: response.refreshToken,
                        isAuthenticated: true,
                    });
                } finally {
                    set({ isLoading: false });
                }
            },

            logout: async () => {
                set({ isLoading: true });
                try {
                    await authService.logout();
                } finally {
                    set({ ...EMPTY_SESSION, isLoading: false });
                }
            },

            setAccessToken: (accessToken) => set({ accessToken }),

            setUser: (user) => set({ user, isAuthenticated: Boolean(user && get().accessToken) }),

            restoreSession: async () => {
                const { accessToken, refreshToken, user } = get();
                if (!accessToken && !refreshToken) {
                    set({ ...EMPTY_SESSION, isLoading: false });
                    return;
                }

                set({ isLoading: true });
                try {
                    let activeAccessToken = accessToken;
                    if (!activeAccessToken && refreshToken) {
                        const response = await authService.refreshToken(refreshToken);
                        activeAccessToken = response.accessToken;
                    }
                    const currentUser = user ?? await authService.getCurrentUser();
                    set({
                        user: currentUser,
                        accessToken: activeAccessToken,
                        isAuthenticated: Boolean(activeAccessToken),
                    });
                } catch {
                    set(EMPTY_SESSION);
                } finally {
                    set({ isLoading: false });
                }
            },
        }),
        {
            name: "crm-soa.auth.v2",
            partialize: ({ user, accessToken, refreshToken, isAuthenticated }) => ({
                user,
                accessToken,
                refreshToken,
                isAuthenticated,
            }),
        },
    ),
);

function clearExpiredSession() {
    useAuthStore.setState({ ...EMPTY_SESSION, isLoading: false });
}

configureApiAuth({
    getAccessToken: () => useAuthStore.getState().accessToken,
    refreshAccessToken: async () => {
        const refreshToken = useAuthStore.getState().refreshToken;
        if (!refreshToken) throw new Error("Không có refresh token");
        const response = await authService.refreshToken(refreshToken);
        useAuthStore.getState().setAccessToken(response.accessToken);
        return response.accessToken;
    },
    onUnauthorized: clearExpiredSession,
});
