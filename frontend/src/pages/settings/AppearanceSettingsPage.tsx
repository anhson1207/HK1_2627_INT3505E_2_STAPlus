import {
    Alert,
    CircularProgress,
    Snackbar,
} from "@mui/material";
import {
    Calendar,
    Check,
    ChevronDown,
    LayoutGrid,
    Moon,
    PanelLeftClose,
    Save,
    Sun,
    TableProperties,
} from "lucide-react";
import { useEffect, useState } from "react";

import { authService } from "../../services/authService";
import { useSettingsStore } from "../../stores/settingsStore";
import { useThemeStore, type ThemeMode } from "../../stores/themeStore";

interface ToggleSwitchProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
    disabled?: boolean;
    ariaLabel?: string;
}

function ToggleSwitch({ checked, onChange, disabled = false, ariaLabel }: ToggleSwitchProps) {
    return (
        <button
            type="button"
            role="switch"
            aria-label={ariaLabel}
            aria-checked={checked}
            disabled={disabled}
            onClick={() => onChange(!checked)}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-(--crm-primary)/20 disabled:cursor-not-allowed disabled:opacity-40 ${
                checked ? "bg-(--crm-primary)" : "bg-slate-300 dark:bg-slate-700"
            }`}
        >
            <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                    checked ? "translate-x-5" : "translate-x-0"
                }`}
            />
        </button>
    );
}

export default function AppearanceSettingsPage() {
    const { mode, setMode } = useThemeStore();
    const { general, saveGeneral } = useSettingsStore();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const [selectedMode, setSelectedMode] = useState<ThemeMode>(mode);
    const [density, setDensity] = useState<"comfortable" | "compact">("comfortable");
    const [dateFormat, setDateFormat] = useState<string>(general.dateFormat || "dd/MM/yyyy");
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    useEffect(() => {
        let isMounted = true;
        const fetchPreferences = async () => {
            try {
                setLoading(true);
                const data = await authService.getPreferences();
                if (isMounted) {
                    if (data.themeMode === "light" || data.themeMode === "dark") {
                        setSelectedMode(data.themeMode as ThemeMode);
                    }
                    if (data.tableDensity === "compact" || data.tableDensity === "comfortable") {
                        setDensity(data.tableDensity as "comfortable" | "compact");
                    }
                    if (data.dateFormat) {
                        setDateFormat(data.dateFormat);
                    }
                    if (typeof data.sidebarCollapsed === "boolean") {
                        setSidebarCollapsed(data.sidebarCollapsed);
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
    }, []);

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
                tableDensity: density,
                dateFormat,
                sidebarCollapsed,
            });

            saveGeneral({
                ...general,
                dateFormat: dateFormat as "dd/MM/yyyy" | "MM/dd/yyyy" | "yyyy-MM-dd",
            });

            setMessage("Đã cập nhật cài đặt giao diện & trải nghiệm thành công!");
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Không thể lưu cài đặt giao diện.");
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
                <p className="mt-1 text-sm text-(--crm-text-secondary)">
                    Tùy chỉnh chế độ hiển thị sáng/tối, mật độ thông tin bảng và định dạng thời gian STAPlus CRM.
                </p>
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
                    {/* Section 1: Theme Mode Selection */}
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
                                    Lựa chọn gam màu phù hợp với môi trường làm việc của bạn.
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
                                                Tối ưu làm việc ban đêm, giảm mỏi mắt
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
                                                Trực quan, độ tương phản rõ ràng ban ngày
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

                    {/* Section 2: Table Density */}
                    <div className="border-t border-(--crm-border) p-6 sm:p-7">
                        <div className="mb-5 flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-(--crm-primary)/10 text-(--crm-primary)">
                                <TableProperties size={19} />
                            </div>
                            <div>
                                <h3 className="text-base font-semibold text-(--crm-heading)">
                                    Mật độ hiển thị bảng dữ liệu (Table Density)
                                </h3>
                                <p className="text-xs text-(--crm-text-secondary)">
                                    Điều chỉnh khoảng cách giữa các hàng dữ liệu danh sách khách hàng, lead và cơ hội.
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            {/* Comfortable */}
                            <div
                                onClick={() => setDensity("comfortable")}
                                className={`flex cursor-pointer items-center justify-between rounded-xl border-2 p-4 transition-all ${
                                    density === "comfortable"
                                        ? "border-(--crm-primary) bg-(--crm-primary)/8 shadow-2xs"
                                        : "border-(--crm-border) bg-(--crm-surface-subtle) hover:border-slate-400 dark:hover:border-slate-600"
                                }`}
                            >
                                <div>
                                    <p className="text-sm font-semibold text-(--crm-heading)">
                                        Tiêu chuẩn (Comfortable)
                                    </p>
                                    <p className="mt-0.5 text-xs text-(--crm-text-secondary)">
                                        Khoảng cách rộng rãi, dễ đọc và thao tác
                                    </p>
                                </div>
                                <div className={`flex h-5 w-5 items-center justify-center rounded-full border-2 transition-all ${
                                    density === "comfortable"
                                        ? "border-(--crm-primary) bg-(--crm-primary)"
                                        : "border-slate-300 dark:border-slate-600"
                                }`}>
                                    {density === "comfortable" && (
                                        <span className="h-2 w-2 rounded-full bg-white" />
                                    )}
                                </div>
                            </div>

                            {/* Compact */}
                            <div
                                onClick={() => setDensity("compact")}
                                className={`flex cursor-pointer items-center justify-between rounded-xl border-2 p-4 transition-all ${
                                    density === "compact"
                                        ? "border-(--crm-primary) bg-(--crm-primary)/8 shadow-2xs"
                                        : "border-(--crm-border) bg-(--crm-surface-subtle) hover:border-slate-400 dark:hover:border-slate-600"
                                }`}
                            >
                                <div>
                                    <p className="text-sm font-semibold text-(--crm-heading)">
                                        Gọn gàng (Compact)
                                    </p>
                                    <p className="mt-0.5 text-xs text-(--crm-text-secondary)">
                                        Hiển thị nhiều bản ghi hơn trên một khung nhìn màn hình
                                    </p>
                                </div>
                                <div className={`flex h-5 w-5 items-center justify-center rounded-full border-2 transition-all ${
                                    density === "compact"
                                        ? "border-(--crm-primary) bg-(--crm-primary)"
                                        : "border-slate-300 dark:border-slate-600"
                                }`}>
                                    {density === "compact" && (
                                        <span className="h-2 w-2 rounded-full bg-white" />
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Section 3: Regional & Sidebar */}
                    <div className="border-t border-(--crm-border) p-6 sm:p-7">
                        <div className="mb-5 flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-(--crm-primary)/10 text-(--crm-primary)">
                                <Calendar size={19} />
                            </div>
                            <div>
                                <h3 className="text-base font-semibold text-(--crm-heading)">
                                    Định dạng ngày & Thanh điều hướng
                                </h3>
                                <p className="text-xs text-(--crm-text-secondary)">
                                    Thiết lập cách hiển thị thời gian và trạng thái thanh điều hướng Sidebar.
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                            {/* Date format select */}
                            <div className="space-y-1.5">
                                <label className="block text-xs font-semibold text-(--crm-heading)">
                                    Định dạng ngày tháng
                                </label>
                                <div className="relative flex items-center rounded-xl border border-(--crm-border) bg-(--crm-surface-subtle) transition-all focus-within:border-(--crm-primary) focus-within:bg-(--crm-surface) focus-within:ring-2 focus-within:ring-(--crm-primary)/15">
                                    <div className="pointer-events-none pl-3.5 pr-2 text-(--crm-text-muted)">
                                        <Calendar size={16} />
                                    </div>
                                    <select
                                        value={dateFormat}
                                        onChange={(e) => setDateFormat(e.target.value)}
                                        style={{ backgroundColor: "transparent" }}
                                        className="w-full appearance-none bg-transparent py-2.5 pr-10 text-sm text-(--crm-heading) outline-none cursor-pointer"
                                    >
                                        <option value="dd/MM/yyyy" className="bg-(--crm-surface) text-(--crm-heading)">
                                            dd/MM/yyyy (Mặc định Việt Nam)
                                        </option>
                                        <option value="MM/dd/yyyy" className="bg-(--crm-surface) text-(--crm-heading)">
                                            MM/dd/yyyy (Định dạng Quốc tế)
                                        </option>
                                        <option value="yyyy-MM-dd" className="bg-(--crm-surface) text-(--crm-heading)">
                                            yyyy-MM-dd (Chuẩn ISO)
                                        </option>
                                    </select>
                                    <div className="pointer-events-none absolute right-3.5 text-(--crm-text-muted)">
                                        <ChevronDown size={16} />
                                    </div>
                                </div>
                            </div>

                            {/* Sidebar collapse toggle */}
                            <div className="space-y-1.5">
                                <label className="block text-xs font-semibold text-(--crm-heading)">
                                    Thanh điều hướng bên trái
                                </label>
                                <div className="flex items-center justify-between rounded-xl border border-(--crm-border) bg-(--crm-surface-subtle) p-3">
                                    <div className="flex items-center gap-2.5 pr-3">
                                        <PanelLeftClose size={16} className="text-(--crm-primary)" />
                                        <div>
                                            <p className="text-xs font-semibold text-(--crm-heading)">
                                                Ghi nhớ trạng thái thu gọn Sidebar
                                            </p>
                                            <p className="text-[11px] text-(--crm-text-secondary)">
                                                Mở rộng không gian làm việc chính
                                            </p>
                                        </div>
                                    </div>
                                    <ToggleSwitch
                                        checked={sidebarCollapsed}
                                        onChange={setSidebarCollapsed}
                                        ariaLabel="Ghi nhớ trạng thái thu gọn Sidebar"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="flex flex-col gap-3 border-t border-(--crm-border) bg-(--crm-surface-subtle)/40 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-7">
                        <p className="text-xs text-(--crm-text-secondary)">
                            Thay đổi giao diện sẽ có tác dụng ngay trong phiên làm việc hiện tại.
                        </p>
                        <button
                            type="button"
                            disabled={saving}
                            onClick={handleSave}
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-(--crm-primary) px-5 py-2.5 text-sm font-semibold text-white shadow-xs transition-all hover:opacity-90 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {saving ? (
                                <>
                                    <CircularProgress size={16} color="inherit" />
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
