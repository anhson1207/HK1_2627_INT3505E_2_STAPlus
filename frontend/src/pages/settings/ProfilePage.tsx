import {
    Alert,
    CircularProgress,
    Snackbar,
} from "@mui/material";
import {
    BadgeCheck,
    Building2,
    Calendar,
    ChevronDown,
    Mail,
    Phone,
    Save,
    UserCheck,
    UserRound,
} from "lucide-react";
import { useEffect, useState } from "react";

import { authService } from "../../services/authService";
import { useAuthStore } from "../../stores/authStore";
import type { UserRole } from "../../types/auth";

const DEPARTMENT_OPTIONS = [
    "Ban Quản trị",
    "Phòng Kinh doanh",
    "Phòng Chăm sóc khách hàng & Hỗ trợ",
    "Phòng Kỹ thuật & Phát triển",
    "Phòng Marketing",
    "Phòng Tài chính & Kế toán",
    "Khác",
];

const roleLabels: Record<UserRole, string> = {
    ADMIN: "Quản trị viên (Admin)",
    SALES: "Nhân viên kinh doanh (Sales)",
    SUPPORT: "Nhân viên hỗ trợ (Support)",
    MANAGER: "Quản lý (Manager)",
    UNASSIGNED: "Chưa phân quyền",
};

export default function ProfilePage() {
    const { user, updateUser } = useAuthStore();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const [formData, setFormData] = useState({
        username: user?.username || "",
        email: user?.email || "",
        fullName: user?.fullName || "",
        phone: user?.phone || "",
        department: user?.department || "Phòng Kinh doanh",
        role: user?.role || "SALES",
        status: user?.status || "ACTIVE",
        createdAt: "",
    });

    useEffect(() => {
        let isMounted = true;
        const fetchProfile = async () => {
            try {
                setLoading(true);
                const me = await authService.getMe();
                if (isMounted) {
                    setFormData({
                        username: me.username,
                        email: me.email,
                        fullName: me.fullName || "",
                        phone: me.phone || "",
                        department: me.department || "Phòng Kinh doanh",
                        role: me.role,
                        status: me.status,
                        createdAt: me.createdAt ? new Date(me.createdAt).toLocaleDateString("vi-VN") : "",
                    });
                    updateUser({
                        id: me.id,
                        username: me.username,
                        email: me.email,
                        fullName: me.fullName || "",
                        role: me.role,
                        status: me.status,
                    });
                }
            } catch {
                // Keep local fallback
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        void fetchProfile();
        return () => {
            isMounted = false;
        };
    }, [updateUser]);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setError("");
        setMessage("");

        if (!formData.fullName.trim()) {
            setError("Họ và tên không được để trống.");
            return;
        }

        try {
            setSaving(true);
            const updated = await authService.updateProfile({
                fullName: formData.fullName.trim(),
                phone: formData.phone.trim(),
                department: formData.department.trim(),
            });

            updateUser({
                fullName: updated.fullName || "",
                phone: updated.phone || "",
                department: updated.department || "",
            });

            setMessage("Cập nhật thông tin hồ sơ thành công!");
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Không thể cập nhật hồ sơ cá nhân.");
        } finally {
            setSaving(false);
        }
    };

    const displayName = formData.fullName.trim() || formData.username || "Người dùng";
    const avatarLetter = displayName.charAt(0).toLocaleUpperCase("vi");

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div>
                <h2 className="text-xl font-bold tracking-tight text-(--crm-heading)">
                    Hồ sơ cá nhân
                </h2>
                <p className="mt-1 text-sm text-(--crm-text-secondary)">
                    Xem và quản lý thông tin tài khoản, phòng ban và liên hệ cá nhân của bạn.
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
                    {/* User Hero Banner */}
                    <div className="border-b border-(--crm-border) bg-(--crm-surface-subtle)/50 p-6 sm:p-7">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-center gap-4">
                                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-indigo-500 to-purple-600 text-2xl font-bold text-white shadow-md">
                                    {avatarLetter}
                                </div>
                                <div className="space-y-1">
                                    <div className="flex flex-wrap items-center gap-2.5">
                                        <h3 className="text-lg font-bold text-(--crm-heading)">
                                            {displayName}
                                        </h3>
                                        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                            <UserCheck size={12} />
                                            Đang hoạt động
                                        </span>
                                    </div>
                                    <p className="text-xs text-(--crm-text-secondary)">
                                        @{formData.username} • {roleLabels[formData.role as UserRole] || formData.role}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* System Identity Grid (Read-only) */}
                    <div className="border-b border-(--crm-border) bg-(--crm-surface) p-6 sm:px-7">
                        <p className="mb-3.5 text-xs font-bold uppercase tracking-wider text-(--crm-text-muted)">
                            Định danh hệ thống (Chỉ xem)
                        </p>
                        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
                            <div className="rounded-xl border border-(--crm-border-subtle) bg-(--crm-surface-subtle) p-3.5">
                                <p className="text-[11px] font-medium text-(--crm-text-muted)">Tên đăng nhập</p>
                                <p className="mt-1 flex items-center gap-1.5 font-mono text-xs font-semibold text-(--crm-heading)">
                                    <UserRound size={14} className="text-(--crm-text-muted)" />
                                    {formData.username}
                                </p>
                            </div>

                            <div className="rounded-xl border border-(--crm-border-subtle) bg-(--crm-surface-subtle) p-3.5">
                                <p className="text-[11px] font-medium text-(--crm-text-muted)">Email đăng ký</p>
                                <p className="mt-1 flex items-center gap-1.5 truncate text-xs font-semibold text-(--crm-heading)">
                                    <Mail size={14} className="shrink-0 text-(--crm-text-muted)" />
                                    <span className="truncate">{formData.email}</span>
                                </p>
                            </div>

                            <div className="rounded-xl border border-(--crm-border-subtle) bg-(--crm-surface-subtle) p-3.5">
                                <p className="text-[11px] font-medium text-(--crm-text-muted)">Vai trò tài khoản</p>
                                <p className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-(--crm-primary)">
                                    <BadgeCheck size={14} />
                                    {roleLabels[formData.role as UserRole] || formData.role}
                                </p>
                            </div>

                            <div className="rounded-xl border border-(--crm-border-subtle) bg-(--crm-surface-subtle) p-3.5">
                                <p className="text-[11px] font-medium text-(--crm-text-muted)">Ngày khởi tạo</p>
                                <p className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-(--crm-heading)">
                                    <Calendar size={14} className="text-(--crm-text-muted)" />
                                    {formData.createdAt || "27/10/2026"}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Editable Form */}
                    <form onSubmit={handleSubmit} className="p-6 sm:p-7">
                        <p className="mb-4 text-xs font-bold uppercase tracking-wider text-(--crm-text-muted)">
                            Thông tin cá nhân & Liên hệ
                        </p>

                        <div className="max-w-xl space-y-5">
                            {/* Full Name */}
                            <div className="space-y-1.5">
                                <label className="block text-xs font-semibold text-(--crm-heading)">
                                    Họ và tên hiển thị <span className="text-rose-500">*</span>
                                </label>
                                <div className="relative flex items-center rounded-xl border border-(--crm-border) bg-(--crm-surface-subtle) transition-all focus-within:border-(--crm-primary) focus-within:bg-(--crm-surface) focus-within:ring-2 focus-within:ring-(--crm-primary)/15">
                                    <div className="pointer-events-none pl-3.5 pr-2 text-(--crm-text-muted)">
                                        <UserRound size={16} />
                                    </div>
                                    <input
                                        type="text"
                                        value={formData.fullName}
                                        onChange={(e) =>
                                            setFormData((prev) => ({ ...prev, fullName: e.target.value }))
                                        }
                                        placeholder="Ví dụ: Nguyễn Anh Sơn"
                                        required
                                        className="w-full bg-transparent py-2.5 pr-3.5 text-sm text-(--crm-heading) outline-none placeholder:text-(--crm-text-muted)"
                                    />
                                </div>
                                <p className="text-[11px] text-(--crm-text-muted)">
                                    Tên này sẽ hiển thị trên Header, Chat và toàn bộ giao diện làm việc.
                                </p>
                            </div>

                            {/* Phone Number */}
                            <div className="space-y-1.5">
                                <label className="block text-xs font-semibold text-(--crm-heading)">
                                    Số điện thoại liên hệ
                                </label>
                                <div className="relative flex items-center rounded-xl border border-(--crm-border) bg-(--crm-surface-subtle) transition-all focus-within:border-(--crm-primary) focus-within:bg-(--crm-surface) focus-within:ring-2 focus-within:ring-(--crm-primary)/15">
                                    <div className="pointer-events-none pl-3.5 pr-2 text-(--crm-text-muted)">
                                        <Phone size={16} />
                                    </div>
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) =>
                                            setFormData((prev) => ({ ...prev, phone: e.target.value }))
                                        }
                                        placeholder="Ví dụ: 0901 234 567"
                                        className="w-full bg-transparent py-2.5 pr-3.5 text-sm text-(--crm-heading) outline-none placeholder:text-(--crm-text-muted)"
                                    />
                                </div>
                            </div>

                            {/* Department */}
                            <div className="space-y-1.5">
                                <label className="block text-xs font-semibold text-(--crm-heading)">
                                    Phòng ban / Đơn vị phụ trách
                                </label>
                                <div className="relative flex items-center rounded-xl border border-(--crm-border) bg-(--crm-surface-subtle) transition-all focus-within:border-(--crm-primary) focus-within:bg-(--crm-surface) focus-within:ring-2 focus-within:ring-(--crm-primary)/15">
                                    <div className="pointer-events-none pl-3.5 pr-2 text-(--crm-text-muted)">
                                        <Building2 size={16} />
                                    </div>
                                    <select
                                        value={formData.department}
                                        onChange={(e) =>
                                            setFormData((prev) => ({ ...prev, department: e.target.value }))
                                        }
                                        style={{ backgroundColor: "transparent" }}
                                        className="w-full appearance-none bg-transparent py-2.5 pr-10 text-sm text-(--crm-heading) outline-none cursor-pointer"
                                    >
                                        {DEPARTMENT_OPTIONS.map((dept) => (
                                            <option key={dept} value={dept} className="bg-(--crm-surface) text-(--crm-heading)">
                                                {dept}
                                            </option>
                                        ))}
                                    </select>
                                    <div className="pointer-events-none absolute right-3.5 text-(--crm-text-muted)">
                                        <ChevronDown size={16} />
                                    </div>
                                </div>
                            </div>

                            {/* Action CTA */}
                            <div className="pt-2">
                                <button
                                    type="submit"
                                    disabled={saving || !formData.fullName.trim()}
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
                                            <span>Lưu thay đổi</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            )}

            <Snackbar
                open={Boolean(message)}
                autoHideDuration={4000}
                onClose={() => setMessage("")}
                message={message}
            />
        </div>
    );
}
