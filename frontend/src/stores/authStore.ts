import { create } from "zustand";
import type { User } from "../types/auth";

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    setUser: (user: User) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: {
        id: "u001",
        name: "Nguyễn Anh Sơn",
        email: "son@example.com",
        role: "sales",
    },

    isAuthenticated: true,

    setUser: (user) =>
        set({
            user,
            isAuthenticated: true,
        }),

    logout: () =>
        set({
            user: null,
            isAuthenticated: false,
        }),
}));