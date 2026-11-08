import {
    Alert,
    CircularProgress,
    Snackbar,
} from "@mui/material";
import {
    Check,
    ChevronDown,
    Clock,
    Globe,
    MessageSquare,
    Save,
    Sparkles,
    Volume2,
} from "lucide-react";
import { useEffect, useState } from "react";

import { authService } from "../../services/authService";
import { useSettingsStore } from "../../stores/settingsStore";
import type { UserPreferencesData } from "../../types/auth";

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

export default function NotificationSettingsPage() {
    const { notifications, saveNotifications } = useSettingsStore();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [browserPerm, setBrowserPerm] = useState<NotificationPermission>(
        typeof window !== "undefined" && "Notification" in window
            ? Notification.permission
            : "default"
    );

    const [form, setForm] = useState<UserPreferencesData>({
        chatToast: true,
        chatSound: true,
        chatBrowser: false,
        chatGroupEvents: true,
        notifyLeadAssigned: true,
        notifyDealStage: true,
        notifyTicket: true,
        notifySystem: true,
        reminderBefore: notifications.reminderBefore || "15m",
    });

    useEffect(() => {
        let isMounted = true;
        const fetchPreferences = async () => {
            try {
                setLoading(true);
                const data = await authService.getPreferences();
                if (isMounted) {
                    setForm({
                        chatToast: data.chatToast ?? true,
                        chatSound: data.chatSound ?? true,
                        chatBrowser: data.chatBrowser ?? false,
                        chatGroupEvents: data.chatGroupEvents ?? true,
                        notifyLeadAssigned: data.notifyLeadAssigned ?? true,
                        notifyDealStage: data.notifyDealStage ?? true,
                        notifyTicket: data.notifyTicket ?? true,
                        notifySystem: data.notifySystem ?? true,
                        reminderBefore: data.reminderBefore ?? "15m",
                    });
                }
            } catch {
                // fallback to default
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        void fetchPreferences();
        return () => {
            isMounted = false;
        };
    }, []);

    const handleRequestBrowserPermission = async () => {
        if (!("Notification" in window)) {
            setError("Trình duyệt của bạn không hỗ trợ tính năng Web Notification.");
            return;
        }

        try {
            const permission = await Notification.requestPermission();
            setBrowserPerm(permission);
            if (permission === "granted") {
                setForm((prev) => ({ ...prev, chatBrowser: true }));
                setMessage("Đã cấp quyền thông báo trình duyệt thành công!");
            } else if (permission === "denied") {
                setForm((prev) => ({ ...prev, chatBrowser: false }));
                setError("Quyền thông báo bị từ chối trong cài đặt trình duyệt.");
            }
        } catch {
            setError("Không thể yêu cầu quyền thông báo từ trình duyệt.");
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            setError("");
            setMessage("");

            const updated = await authService.updatePreferences(form);

            // Sync with local store
            saveNotifications({
                followUp: updated.notifyLeadAssigned ?? true,
                deal: updated.notifyDealStage ?? true,
                ticket: updated.notifyTicket ?? true,
                system: updated.notifySystem ?? true,
                email: false,
                reminderBefore: (updated.reminderBefore as "15m" | "30m" | "1h" | "1d") || "15m",
            });

            setMessage("Lưu tùy chọn thông báo thành công!");
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Không thể lưu cài đặt thông báo.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div>
                <h2 className="text-xl font-bold tracking-tight text-(--crm-heading)">
                    Cài đặt thông báo
                </h2>
                <p className="mt-1 text-sm text-(--crm-text-secondary)">
                    Tùy chỉnh nhận thông báo cho Trò chuyện nội bộ (Chat) và các sự kiện CRM quan trọng.
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
                    {/* Section 1: Chat Notifications */}
                    <div className="p-6 sm:p-7">
                        <div className="mb-5 flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-(--crm-primary)/10 text-(--crm-primary)">
                                <MessageSquare size={19} />
                            </div>
                            <div>
                                <h3 className="text-base font-semibold text-(--crm-heading)">
                                    Thông báo Trò chuyện nội bộ (Chat)
                                </h3>
                                <p className="text-xs text-(--crm-text-secondary)">
                                    Tùy chỉnh thông báo tin nhắn mới và sự kiện trong các phòng chat.
                                </p>
                            </div>
                        </div>

                        <div className="divide-y divide-(--crm-border-subtle)">
                            {/* Chat Toast */}
                            <div className="flex items-center justify-between py-4">
                                <div className="pr-6">
                                    <p className="text-sm font-semibold text-(--crm-heading)">
                                        Hiển thị Toast popup khi có tin nhắn mới
                                    </p>
                                    <p className="mt-0.5 text-xs text-(--crm-text-secondary)">
                                        Bật banner thông báo nổi ở góc màn hình khi nhận tin nhắn mới từ đồng nghiệp.
                                    </p>
                                </div>
                                <ToggleSwitch
                                    checked={Boolean(form.chatToast)}
                                    onChange={(checked) =>
                                        setForm((prev) => ({ ...prev, chatToast: checked }))
                                    }
                                    ariaLabel="Hiển thị Toast popup khi có tin nhắn mới"
                                />
                            </div>

                            {/* Chat Sound */}
                            <div className="flex items-center justify-between py-4">
                                <div className="pr-6">
                                    <p className="flex items-center gap-2 text-sm font-semibold text-(--crm-heading)">
                                        <Volume2 size={16} className="text-(--crm-primary)" />
                                        Âm thanh thông báo Chat
                                    </p>
                                    <p className="mt-0.5 text-xs text-(--crm-text-secondary)">
                                        Phát âm thanh nhẹ khi có tin nhắn trò chuyện gửi đến.
                                    </p>
                                </div>
                                <ToggleSwitch
                                    checked={Boolean(form.chatSound)}
                                    onChange={(checked) =>
                                        setForm((prev) => ({ ...prev, chatSound: checked }))
                                    }
                                    ariaLabel="Âm thanh thông báo Chat"
                                />
                            </div>

                            {/* Browser Push */}
                            <div className="flex flex-col justify-between gap-3 py-4 sm:flex-row sm:items-center">
                                <div className="pr-6">
                                    <p className="flex items-center gap-2 text-sm font-semibold text-(--crm-heading)">
                                        <Globe size={16} className="text-(--crm-primary)" />
                                        Thông báo trình duyệt (Browser Push)
                                    </p>
                                    <p className="mt-0.5 text-xs text-(--crm-text-secondary)">
                                        Nhận thông báo ngay cả khi bạn đang chuyển tab hoặc thu nhỏ cửa sổ làm việc.
                                    </p>
                                    <div className="mt-1.5 flex items-center gap-2">
                                        <span className="text-[11px] text-(--crm-text-muted)">Trạng thái quyền:</span>
                                        {browserPerm === "granted" ? (
                                            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                                                <Check size={11} /> Đã cấp quyền
                                            </span>
                                        ) : browserPerm === "denied" ? (
                                            <span className="rounded-full border border-rose-500/20 bg-rose-500/10 px-2 py-0.5 text-[11px] font-semibold text-rose-500">
                                                Bị chặn bởi trình duyệt
                                            </span>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={handleRequestBrowserPermission}
                                                className="text-[11px] font-semibold text-(--crm-primary) underline hover:opacity-80"
                                            >
                                                Yêu cầu cấp quyền ngay
                                            </button>
                                        )}
                                    </div>
                                </div>
                                <ToggleSwitch
                                    checked={Boolean(form.chatBrowser)}
                                    disabled={browserPerm === "denied"}
                                    onChange={(checked) => {
                                        if (checked && browserPerm !== "granted") {
                                            void handleRequestBrowserPermission();
                                        } else {
                                            setForm((prev) => ({
                                                ...prev,
                                                chatBrowser: checked,
                                            }));
                                        }
                                    }}
                                    ariaLabel="Thông báo trình duyệt"
                                />
                            </div>

                            {/* Group Events */}
                            <div className="flex items-center justify-between py-4">
                                <div className="pr-6">
                                    <p className="text-sm font-semibold text-(--crm-heading)">
                                        Sự kiện nhóm & Thành viên
                                    </p>
                                    <p className="mt-0.5 text-xs text-(--crm-text-secondary)">
                                        Thông báo khi bạn được thêm vào nhóm chat hoặc thay đổi quyền quản trị nhóm.
                                    </p>
                                </div>
                                <ToggleSwitch
                                    checked={Boolean(form.chatGroupEvents)}
                                    onChange={(checked) =>
                                        setForm((prev) => ({
                                            ...prev,
                                            chatGroupEvents: checked,
                                        }))
                                    }
                                    ariaLabel="Sự kiện nhóm & Thành viên"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Section 2: CRM Business Notifications */}
                    <div className="border-t border-(--crm-border) p-6 sm:p-7">
                        <div className="mb-5 flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-(--crm-primary)/10 text-(--crm-primary)">
                                <Sparkles size={19} />
                            </div>
                            <div>
                                <h3 className="text-base font-semibold text-(--crm-heading)">
                                    Thông báo nghiệp vụ CRM
                                </h3>
                                <p className="text-xs text-(--crm-text-secondary)">
                                    Nhận thông báo tự động theo luồng công việc bán hàng và chăm sóc khách hàng.
                                </p>
                            </div>
                        </div>

                        <div className="divide-y divide-(--crm-border-subtle)">
                            {/* Lead Assigned */}
                            <div className="flex items-center justify-between py-4">
                                <div className="pr-6">
                                    <p className="text-sm font-semibold text-(--crm-heading)">
                                        Phân công Lead tiềm năng mới
                                    </p>
                                    <p className="mt-0.5 text-xs text-(--crm-text-secondary)">
                                        Thông báo khi có Lead mới được phân bổ cho bạn phụ trách.
                                    </p>
                                </div>
                                <ToggleSwitch
                                    checked={Boolean(form.notifyLeadAssigned)}
                                    onChange={(checked) =>
                                        setForm((prev) => ({
                                            ...prev,
                                            notifyLeadAssigned: checked,
                                        }))
                                    }
                                    ariaLabel="Phân công Lead tiềm năng mới"
                                />
                            </div>

                            {/* Deal Stage Change */}
                            <div className="flex items-center justify-between py-4">
                                <div className="pr-6">
                                    <p className="text-sm font-semibold text-(--crm-heading)">
                                        Cập nhật giai đoạn Cơ hội (Deal)
                                    </p>
                                    <p className="mt-0.5 text-xs text-(--crm-text-secondary)">
                                        Theo dõi khi cơ hội kinh doanh chuyển bước tiếp theo hoặc kết thúc (Won/Lost).
                                    </p>
                                </div>
                                <ToggleSwitch
                                    checked={Boolean(form.notifyDealStage)}
                                    onChange={(checked) =>
                                        setForm((prev) => ({
                                            ...prev,
                                            notifyDealStage: checked,
                                        }))
                                    }
                                    ariaLabel="Cập nhật giai đoạn Cơ hội (Deal)"
                                />
                            </div>

                            {/* Ticket Update */}
                            <div className="flex items-center justify-between py-4">
                                <div className="pr-6">
                                    <p className="text-sm font-semibold text-(--crm-heading)">
                                        Yêu cầu hỗ trợ & Ticket khách hàng
                                    </p>
                                    <p className="mt-0.5 text-xs text-(--crm-text-secondary)">
                                        Thông báo khi có phản hồi mới hoặc thay đổi trạng thái yêu cầu hỗ trợ.
                                    </p>
                                </div>
                                <ToggleSwitch
                                    checked={Boolean(form.notifyTicket)}
                                    onChange={(checked) =>
                                        setForm((prev) => ({
                                            ...prev,
                                            notifyTicket: checked,
                                        }))
                                    }
                                    ariaLabel="Yêu cầu hỗ trợ & Ticket khách hàng"
                                />
                            </div>

                            {/* System Operations */}
                            <div className="flex items-center justify-between py-4">
                                <div className="pr-6">
                                    <p className="text-sm font-semibold text-(--crm-heading)">
                                        Thông báo vận hành hệ thống
                                    </p>
                                    <p className="mt-0.5 text-xs text-(--crm-text-secondary)">
                                        Các cảnh báo bảo trì, cập nhật tính năng hoặc phân quyền từ Admin.
                                    </p>
                                </div>
                                <ToggleSwitch
                                    checked={Boolean(form.notifySystem)}
                                    onChange={(checked) =>
                                        setForm((prev) => ({
                                            ...prev,
                                            notifySystem: checked,
                                        }))
                                    }
                                    ariaLabel="Thông báo vận hành hệ thống"
                                />
                            </div>
                        </div>

                        {/* Reminder select */}
                        <div className="mt-5 border-t border-(--crm-border-subtle) pt-5">
                            <label className="mb-2 block text-xs font-semibold text-(--crm-heading)">
                                Nhắc nhở lịch hẹn / Follow-up trước
                            </label>
                            <div className="relative max-w-xs flex items-center rounded-xl border border-(--crm-border) bg-(--crm-surface-subtle) transition-all focus-within:border-(--crm-primary) focus-within:bg-(--crm-surface) focus-within:ring-2 focus-within:ring-(--crm-primary)/15">
                                <div className="pointer-events-none pl-3.5 pr-2 text-(--crm-text-muted)">
                                    <Clock size={16} />
                                </div>
                                <select
                                    value={form.reminderBefore || "15m"}
                                    onChange={(e) =>
                                        setForm((prev) => ({
                                            ...prev,
                                            reminderBefore: e.target.value,
                                        }))
                                    }
                                    style={{ backgroundColor: "transparent" }}
                                    className="w-full appearance-none bg-transparent py-2.5 pr-10 text-sm text-(--crm-heading) outline-none cursor-pointer"
                                >
                                    <option value="15m" className="bg-(--crm-surface) text-(--crm-heading)">
                                        15 phút trước giờ hẹn
                                    </option>
                                    <option value="30m" className="bg-(--crm-surface) text-(--crm-heading)">
                                        30 phút trước giờ hẹn
                                    </option>
                                    <option value="1h" className="bg-(--crm-surface) text-(--crm-heading)">
                                        1 giờ trước giờ hẹn
                                    </option>
                                    <option value="1d" className="bg-(--crm-surface) text-(--crm-heading)">
                                        1 ngày trước giờ hẹn
                                    </option>
                                </select>
                                <div className="pointer-events-none absolute right-3.5 text-(--crm-text-muted)">
                                    <ChevronDown size={16} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="flex flex-col gap-3 border-t border-(--crm-border) bg-(--crm-surface-subtle)/40 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-7">
                        <p className="text-xs text-(--crm-text-secondary)">
                            Tùy chọn thông báo được lưu riêng cho tài khoản của bạn.
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
                                    <span>Lưu tùy chọn thông báo</span>
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
