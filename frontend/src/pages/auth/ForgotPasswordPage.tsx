import { Button, CircularProgress, TextField } from "@mui/material";
import { ArrowLeft, ArrowRight, Mail, MailCheck } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

import AuthPageShell from "../../components/auth/AuthPageShell";
import { authService } from "../../services/authService";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [demoToken, setDemoToken] = useState<string | null>(null);
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setMessage("");
        setError("");
        setDemoToken(null);

        const trimmedEmail = email.trim();

        if (!trimmedEmail) {
            setError("Vui lòng nhập địa chỉ email.");
            return;
        }

        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(trimmedEmail)) {
            setError("Vui lòng nhập địa chỉ email hợp lệ.");
            return;
        }

        setIsSubmitting(true);
        try {
            const res = await authService.forgotPassword({ email: trimmedEmail });
            setMessage(
                res.message ||
                    "Hướng dẫn đặt lại mật khẩu đã được gửi đến email của bạn. Vui lòng kiểm tra hộp thư đến (và mục Spam)."
            );
            if (res.resetToken) {
                setDemoToken(res.resetToken);
            }
        } catch (err) {
            const msg =
                err instanceof Error
                    ? err.message
                    : "Không thể gửi yêu cầu đặt lại mật khẩu. Vui lòng thử lại.";
            setError(msg);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <AuthPageShell
            title="Quên mật khẩu"
            description="Nhập email của bạn để nhận liên kết đặt lại mật khẩu."
        >
            <form onSubmit={handleSubmit} className="crm-form" noValidate>
                <TextField
                    label="Địa chỉ email"
                    type="email"
                    fullWidth
                    autoComplete="email"
                    disabled={isSubmitting}
                    value={email}
                    onChange={(event) => {
                        setEmail(event.target.value);
                        if (error) setError("");
                    }}
                    error={!!error}
                    helperText={error || "Nhập email đã đăng ký tài khoản CRM của bạn."}
                />

                {message && (
                    <div
                        role="status"
                        className="rounded-lg border border-sky-200 bg-sky-50 p-4 text-sm leading-relaxed text-sky-900"
                    >
                        <div className="mb-1.5 flex items-center gap-2 font-semibold text-sky-800">
                            <MailCheck size={18} className="text-sky-600" />
                            Đã tiếp nhận yêu cầu
                        </div>
                        <p>{message}</p>

                        {demoToken && (
                            <div className="mt-3 border-t border-sky-200 pt-3">
                                <p className="mb-2 text-xs text-sky-700">
                                    💡 <strong>Chế độ thử nghiệm (Demo):</strong> Bạn có thể dùng đường dẫn demo bên dưới để thử nghiệm đặt lại mật khẩu ngay mà không cần đợi email:
                                </p>
                                <Link
                                    to={`/reset-password?token=${demoToken}`}
                                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-950 underline hover:text-sky-800"
                                >
                                    Chuyển tới trang Đặt lại mật khẩu ngay
                                    <ArrowRight size={14} />
                                </Link>
                            </div>
                        )}
                    </div>
                )}

                <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    size="large"
                    disabled={isSubmitting}
                    startIcon={
                        isSubmitting ? (
                            <CircularProgress size={18} color="inherit" />
                        ) : (
                            <Mail size={18} />
                        )
                    }
                >
                    {isSubmitting ? "Đang gửi yêu cầu..." : "Gửi yêu cầu đặt lại mật khẩu"}
                </Button>
            </form>

            <p className="mt-5 text-center text-sm text-(--crm-text-secondary)">
                <Link
                    to="/login"
                    className="inline-flex items-center gap-2 font-medium text-(--crm-primary) hover:underline"
                >
                    <ArrowLeft size={16} />
                    Quay lại đăng nhập
                </Link>
            </p>
        </AuthPageShell>
    );
}
