import { create } from "zustand";

export type ThemeMode = "light" | "dark";

const STORAGE_KEY = "crm-theme-mode";

export function isAuthPath(pathname?: string): boolean {
    if (typeof window === "undefined") return false;
    const path = pathname || window.location.pathname;
    return (
        path === "/login" ||
        path === "/register" ||
        path.startsWith("/forgot-password") ||
        path.startsWith("/reset-password") ||
        path.startsWith("/verify-email")
    );
}

function getInitialMode(): ThemeMode {
    if (typeof window === "undefined") return "light";

    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved === "light" || saved === "dark") {
            return saved;
        }
    } catch {
        // LocalStorage access might fail in strict private browsing environments
    }

    // Default theme is always light mode
    return "light";
}

export function applyThemeToDOM(mode: ThemeMode) {
    if (typeof document === "undefined") return;

    const isDark = mode === "dark";
    const root = document.documentElement;
    const body = document.body;

    if (isDark) {
        root.classList.add("dark", "crm-dark");
        body.classList.add("dark", "crm-dark");
        root.setAttribute("data-theme", "dark");
    } else {
        root.classList.remove("dark", "crm-dark");
        body.classList.remove("dark", "crm-dark");
        root.setAttribute("data-theme", "light");
    }
}

// Execute immediately when script evaluates to prevent Flash of Unstyled Content (FOUC).
// If opening an auth page directly (e.g. /login or /register), always start in light mode.
const initialMode = getInitialMode();
applyThemeToDOM(isAuthPath() ? "light" : initialMode);

interface ThemeState {
    mode: ThemeMode;
    toggleTheme: () => void;
    setMode: (mode: ThemeMode) => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
    mode: initialMode,
    toggleTheme: () => {
        set((state) => {
            const nextMode: ThemeMode = state.mode === "dark" ? "light" : "dark";
            try {
                localStorage.setItem(STORAGE_KEY, nextMode);
            } catch {
                // Ignore storage errors
            }
            applyThemeToDOM(nextMode);
            return { mode: nextMode };
        });
    },
    setMode: (nextMode: ThemeMode) => {
        try {
            localStorage.setItem(STORAGE_KEY, nextMode);
        } catch {
            // Ignore storage errors
        }
        applyThemeToDOM(nextMode);
        set({ mode: nextMode });
    },
}));
