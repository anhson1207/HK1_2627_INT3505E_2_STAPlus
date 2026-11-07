import { create } from "zustand";

export type ThemeMode = "light" | "dark";

const STORAGE_KEY = "crm-theme-mode";

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

    if (typeof window.matchMedia === "function") {
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        return prefersDark ? "dark" : "light";
    }

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

// Execute immediately when script evaluates to prevent Flash of Unstyled Content (FOUC)
const initialMode = getInitialMode();
applyThemeToDOM(initialMode);

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
