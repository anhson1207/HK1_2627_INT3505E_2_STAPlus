import { Alert, CircularProgress, Snackbar } from "@mui/material";
import {
    CheckCircle2,
    Eye,
    EyeOff,
    KeyRound,
    Lock,
    LogOut,
    ShieldCheck,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { authService } from "../../services/authService";
import { useAuthStore } from "../../stores/authStore";

export default function SecuritySettingsPage() {
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();

    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setMessage("");

        if (!currentPassword) {
            setError("Vui lòng nhập mật khẩu hiện tại.");
            return;
        }

        if (!newPassword) {
            setError("Vui lòng nhập mật khẩu mới.");
            return;
        }

        if (newPassword.length < 8) {
            setError("Mật khẩu mới phải có tối thiểu 8 ký tự.");
            return;
        }

        if (currentPassword === newPassword) {
            setError("Mật khẩu mới không được trùng với mật khẩu hiện tại.");
            return;
        }

        if (newPassword !== confirmPassword) {
            setError("Xác nhận mật khẩu mới không khớp.");
            return;
        }

        try {
            setLoading(true);
            await authService.changePassword({
                currentPassword,
                newPassword,
            });

            setMessage("Đổi mật khẩu thành công! Các phiên đăng nhập trên thiết bị khác đã được thu hồi bảo mật.");
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Đổi mật khẩu thất bại. Vui lòng kiểm tra lại.");
        } finally {
            setLoading(false);
        }
    };

    const isMatch = Boolean(newPassword && confirmPassword && newPassword === confirmPassword);
    const hasMismatch = Boolean(newPassword && confirmPassword && newPassword !== confirmPassword);

    return (
        <div className="space-y-6">
            {/* Page Title & Context Header */}
            <div>
                <h2 className="text-xl font-bold tracking-tight text-(--crm-heading)">
                    Bảo mật & Đổi mật khẩu
                </h2>
                <p className="mt-1 text-sm text-(--crm-text-secondary)">
                    Quản lý mật khẩu truy cập và bảo vệ an toàn cho tài khoản CRM của bạn.
                </p>
            </div>

            {/* Main Unified Security Card */}
            <div className="overflow-hidden rounded-2xl border border-(--crm-border) bg-(--crm-surface) shadow-xs">
                {/* Form Section */}
                <div className="p-6 sm:p-8">
                    <div className="mb-6 flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-(--crm-primary)/10 text-(--crm-primary)">
                            <KeyRound size={20} />
                        </div>
                        <div>
                            <h3 className="text-base font-semibold text-(--crm-heading)">
                                Thay đổi mật khẩu tài khoản
                            </h3>
                            <p className="text-xs text-(--crm-text-secondary)">
                                Sau khi đổi mật khẩu, toàn bộ phiên đăng nhập cũ trên thiết bị khác sẽ được tự động thu hồi.
                            </p>
                        </div>
                    </div>

                    {error && (
                        <div className="mb-6">
                            <Alert severity="error">{error}</Alert>
                        </div>
                    )}
                    {message && (
                        <div className="mb-6">
                            <Alert severity="success">{message}</Alert>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="max-w-xl space-y-5">
                        {/* Current Password */}
                        <div className="space-y-1.5">
                            <label className="block text-xs font-semibold text-(--crm-heading)">
                                Mật khẩu hiện tại <span className="text-rose-500">*</span>
                            </label>
                            <div className="relative flex items-center rounded-xl border border-(--crm-border) bg-(--crm-surface-subtle) transition-all focus-within:border-(--crm-primary) focus-within:bg-(--crm-surface) focus-within:ring-2 focus-within:ring-(--crm-primary)/15">
                                <div className="pointer-events-none pl-3.5 pr-2 text-(--crm-text-muted)">
                                    <Lock size={16} />
                                </div>
                                <input
                                    type={showCurrent ? "text" : "password"}
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    placeholder="Nhập mật khẩu đang sử dụng"
                                    required
                                    className="w-full bg-transparent py-2.5 pr-10 text-sm text-(--crm-heading) outline-none placeholder:text-(--crm-text-muted)"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowCurrent(!showCurrent)}
                                    className="absolute right-3 p-1 text-(--crm-text-muted) hover:text-(--crm-heading) transition-colors"
                                    aria-label={showCurrent ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                                >
                                    {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        {/* New Password */}
                        <div className="space-y-1.5">
                            <label className="block text-xs font-semibold text-(--crm-heading)">
                                Mật khẩu mới <span className="text-rose-500">*</span>
                            </label>
                            <div className="relative flex items-center rounded-xl border border-(--crm-border) bg-(--crm-surface-subtle) transition-all focus-within:border-(--crm-primary) focus-within:bg-(--crm-surface) focus-within:ring-2 focus-within:ring-(--crm-primary)/15">
                                <div className="pointer-events-none pl-3.5 pr-2 text-(--crm-text-muted)">
                                    <KeyRound size={16} />
                                </div>
                                <input
                                    type={showNew ? "text" : "password"}
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="Nhập mật khẩu mới (tối thiểu 8 ký tự)"
                                    required
                                    className="w-full bg-transparent py-2.5 pr-10 text-sm text-(--crm-heading) outline-none placeholder:text-(--crm-text-muted)"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowNew(!showNew)}
                                    className="absolute right-3 p-1 text-(--crm-text-muted) hover:text-(--crm-heading) transition-colors"
                                    aria-label={showNew ? "Ẩn mật khẩu mới" : "Hiện mật khẩu mới"}
                                >
                                    {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                            <p className="text-[11px] text-(--crm-text-muted)">
                                Gợi ý: Dùng từ 8 ký tự trở lên, gồm chữ hoa, chữ thường, số và ký tự đặc biệt (@, #, $, %, ...).
                            </p>
                        </div>

                        {/* Confirm New Password */}
                        <div className="space-y-1.5">
                            <label className="block text-xs font-semibold text-(--crm-heading)">
                                Xác nhận mật khẩu mới <span className="text-rose-500">*</span>
                            </label>
                            <div className={`relative flex items-center rounded-xl border bg-(--crm-surface-subtle) transition-all focus-within:bg-(--crm-surface) focus-within:ring-2 ${
                                hasMismatch
                                    ? "border-rose-400 focus-within:border-rose-500 focus-within:ring-rose-500/15"
                                    : isMatch
                                    ? "border-emerald-400 focus-within:border-emerald-500 focus-within:ring-emerald-500/15"
                                    : "border-(--crm-border) focus-within:border-(--crm-primary) focus-within:ring-(--crm-primary)/15"
                            }`}>
                                <div className="pointer-events-none pl-3.5 pr-2 text-(--crm-text-muted)">
                                    <KeyRound size={16} />
                                </div>
                                <input
                                    type={showConfirm ? "text" : "password"}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Nhập lại mật khẩu mới để xác nhận"
                                    required
                                    className="w-full bg-transparent py-2.5 pr-10 text-sm text-(--crm-heading) outline-none placeholder:text-(--crm-text-muted)"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirm(!showConfirm)}
                                    className="absolute right-3 p-1 text-(--crm-text-muted) hover:text-(--crm-heading) transition-colors"
                                    aria-label={showConfirm ? "Ẩn xác nhận mật khẩu" : "Hiện xác nhận mật khẩu"}
                                >
                                    {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                            {hasMismatch && (
                                <p className="text-[11px] font-medium text-rose-500">
                                    Mật khẩu xác nhận chưa trùng khớp với mật khẩu mới.
                                </p>
                            )}
                            {isMatch && (
                                <p className="text-[11px] font-medium text-emerald-500">
                                    Mật khẩu xác nhận đã khớp.
                                </p>
                            )}
                        </div>

                        {/* Action CTA */}
                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={loading || !currentPassword || !newPassword || !confirmPassword || hasMismatch}
                                className="inline-flex items-center justify-center gap-2 rounded-xl bg-(--crm-primary) px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:opacity-90 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                {loading ? (
                                    <>
                                        <CircularProgress size={16} color="inherit" />
                                        <span>Đang cập nhật...</span>
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle2 size={16} />
                                        <span>Cập nhật mật khẩu</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Session Management Section (Integrated in same card) */}
                <div className="border-t border-(--crm-border) bg-(--crm-surface-subtle)/40 px-6 py-5 sm:px-8">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-start gap-3">
                            <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
                                <ShieldCheck size={18} />
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <p className="text-sm font-semibold text-(--crm-heading)">
                                        Phiên đăng nhập hiện tại
                                    </p>
                                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                        Đang hoạt động
                                    </span>
                                </div>
                                <p className="mt-0.5 text-xs text-(--crm-text-secondary)">
                                    Đang đăng nhập tài khoản <span className="font-semibold text-(--crm-heading)">{user?.username}</span> trên trình duyệt này
                                </p>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={() => {
                                logout();
                                navigate("/login", { replace: true });
                            }}
                            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-rose-200 px-4 py-2 text-xs font-semibold text-rose-600 transition-colors hover:bg-rose-50 dark:border-rose-900/60 dark:text-rose-400 dark:hover:bg-rose-950/40"
                        >
                            <LogOut size={14} />
                            <span>Đăng xuất phiên này</span>
                        </button>
                    </div>
                </div>
            </div>

            <Snackbar
                open={Boolean(message)}
                autoHideDuration={4000}
                onClose={() => setMessage("")}
                message={message}
            />
        </div>
    );
}
