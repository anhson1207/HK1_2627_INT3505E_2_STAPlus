import { Alert, CircularProgress, Snackbar } from "@mui/material";
import { Check, LayoutGrid, Moon, Save, Sun } from "lucide-react";
import { useEffect, useState } from "react";

import { authService } from "../../services/authService";
import { useThemeStore, type ThemeMode } from "../../stores/themeStore";

export default function AppearanceSettingsPage() {
    const { mode, setMode } = useThemeStore();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const [selectedMode, setSelectedMode] = useState<ThemeMode>(mode);

    useEffect(() => {
        setSelectedMode(mode);
    }, [mode]);

    useEffect(() => {
        let isMounted = true;
        const fetchPreferences = async () => {
            try {
                setLoading(true);
                const data = await authService.getPreferences();
                if (isMounted) {
                    const hasLocalOverride = (() => {
                        try {
                            const saved =
                                localStorage.getItem("crm-theme-mode");
                            return saved === "light" || saved === "dark";
                        } catch {
                            return false;
                        }
                    })();
                    if (
                        !hasLocalOverride &&
                        (data.themeMode === "light" ||
                            data.themeMode === "dark")
                    ) {
                        setSelectedMode(data.themeMode as ThemeMode);
                        setMode(data.themeMode as ThemeMode);
                    }
                }
            } catch {
                // Keep local defaults
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        void fetchPreferences();
        return () => {
            isMounted = false;
        };
    }, [setMode]);

    const handleThemeSelect = (newMode: ThemeMode) => {
        setSelectedMode(newMode);
        setMode(newMode);
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            setError("");
            setMessage("");

            await authService.updatePreferences({
                themeMode: selectedMode,
            });

            setMessage(
                "Đã cập nhật cài đặt giao diện & trải nghiệm thành công!"
            );
        } catch (err: unknown) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Không thể lưu cài đặt giao diện."
            );
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h2 className="text-xl font-bold tracking-tight text-(--crm-heading)">
                    Giao diện & Trải nghiệm
                </h2>
            </div>

            {error && (
                <div>
                    <Alert severity="error">{error}</Alert>
                </div>
            )}
            {message && (
                <div>
                    <Alert severity="success">{message}</Alert>
                </div>
            )}

            {loading ? (
                <div className="flex justify-center p-12">
                    <CircularProgress size={32} />
                </div>
            ) : (
                <div className="overflow-hidden rounded-2xl border border-(--crm-border) bg-(--crm-surface) shadow-xs">
                    {/* Theme Mode Selection */}
                    <div className="p-6 sm:p-7">
                        <div className="mb-5 flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-(--crm-primary)/10 text-(--crm-primary)">
                                <LayoutGrid size={19} />
                            </div>
                            <div>
                                <h3 className="text-base font-semibold text-(--crm-heading)">
                                    Chế độ giao diện (Theme Mode)
                                </h3>
                                <p className="text-xs text-(--crm-text-secondary)">
                                    Lựa chọn gam màu phù hợp với môi trường làm
                                    việc của bạn.
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                            {/* Dark Mode Card */}
                            <div
                                onClick={() => handleThemeSelect("dark")}
                                className={`group relative cursor-pointer rounded-2xl border-2 p-5 transition-all ${
                                    selectedMode === "dark"
                                        ? "border-(--crm-primary) bg-(--crm-primary)/8 shadow-sm"
                                        : "border-(--crm-border) bg-(--crm-surface-subtle) hover:border-slate-400 dark:hover:border-slate-600"
                                }`}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2.5">
                                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-800 text-amber-400">
                                            <Moon size={18} />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-(--crm-heading)">
                                                Giao diện Tối (Dark Mode)
                                            </p>
                                            <p className="text-xs text-(--crm-text-muted)">
                                                Tối ưu làm việc ban đêm, giảm
                                                mỏi mắt
                                            </p>
                                        </div>
                                    </div>
                                    {selectedMode === "dark" && (
                                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-(--crm-primary) text-white shadow-xs">
                                            <Check size={14} />
                                        </span>
                                    )}
                                </div>

                                {/* Preview illustration */}
                                <div className="mt-4 rounded-xl border border-slate-700 bg-slate-900 p-3 shadow-inner">
                                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                                        <div className="flex items-center gap-1.5">
                                            <div className="h-2 w-2 rounded-full bg-rose-500" />
                                            <div className="h-2 w-2 rounded-full bg-amber-500" />
                                            <div className="h-2 w-2 rounded-full bg-emerald-500" />
                                        </div>
                                        <div className="h-2 w-12 rounded bg-slate-700" />
                                    </div>
                                    <div className="mt-2.5 space-y-1.5">
                                        <div className="h-3 w-3/4 rounded bg-slate-800" />
                                        <div className="h-3 w-1/2 rounded bg-indigo-600/40" />
                                    </div>
                                </div>
                            </div>

                            {/* Light Mode Card */}
                            <div
                                onClick={() => handleThemeSelect("light")}
                                className={`group relative cursor-pointer rounded-2xl border-2 p-5 transition-all ${
                                    selectedMode === "light"
                                        ? "border-(--crm-primary) bg-(--crm-primary)/8 shadow-sm"
                                        : "border-(--crm-border) bg-(--crm-surface-subtle) hover:border-slate-400 dark:hover:border-slate-600"
                                }`}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2.5">
                                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
                                            <Sun size={18} />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-(--crm-heading)">
                                                Giao diện Sáng (Light Mode)
                                            </p>
                                            <p className="text-xs text-(--crm-text-muted)">
                                                Trực quan, độ tương phản rõ ràng
                                                ban ngày
                                            </p>
                                        </div>
                                    </div>
                                    {selectedMode === "light" && (
                                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-(--crm-primary) text-white shadow-xs">
                                            <Check size={14} />
                                        </span>
                                    )}
                                </div>

                                {/* Preview illustration */}
                                <div className="mt-4 rounded-xl border border-slate-200 bg-white p-3 shadow-inner">
                                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                                        <div className="flex items-center gap-1.5">
                                            <div className="h-2 w-2 rounded-full bg-rose-400" />
                                            <div className="h-2 w-2 rounded-full bg-amber-400" />
                                            <div className="h-2 w-2 rounded-full bg-emerald-400" />
                                        </div>
                                        <div className="h-2 w-12 rounded bg-slate-200" />
                                    </div>
                                    <div className="mt-2.5 space-y-1.5">
                                        <div className="h-3 w-3/4 rounded bg-slate-100" />
                                        <div className="h-3 w-1/2 rounded bg-indigo-100" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="flex flex-col gap-3 border-t border-(--crm-border) bg-(--crm-surface-subtle)/40 p-4 sm:flex-row sm:items-center sm:justify-end sm:px-7">
                        <button
                            type="button"
                            disabled={saving}
                            onClick={handleSave}
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-(--crm-primary) px-5 py-2.5 text-sm font-semibold text-white shadow-xs transition-all hover:opacity-90 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {saving ? (
                                <>
                                    <CircularProgress
                                        size={16}
                                        color="inherit"
                                    />
                                    <span>Đang lưu...</span>
                                </>
                            ) : (
                                <>
                                    <Save size={16} />
                                    <span>Lưu tùy chọn giao diện</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            )}

            <Snackbar
                open={Boolean(message)}
                autoHideDuration={3500}
                onClose={() => setMessage("")}
                message={message}
            />
        </div>
    );
}
