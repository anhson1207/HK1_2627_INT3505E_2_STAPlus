import { zodResolver } from "@hookform/resolvers/zod";
import { Button, CircularProgress, TextField } from "@mui/material";
import { ArrowLeft, CheckCircle2, KeyRound, LockKeyhole } from "lucide-react";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

import AuthPageShell from "../../components/auth/AuthPageShell";
import { authService } from "../../services/authService";
import {
    resetPasswordSchema,
    type ResetPasswordFormData,
} from "../../utils/resetPasswordSchema";

export default function ResetPasswordPage() {
    const [searchParams] = useSearchParams();
    const tokenFromUrl = searchParams.get("token") || "";
    const [customToken, setCustomToken] = useState(tokenFromUrl);
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();

    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm<ResetPasswordFormData>({
        resolver: zodResolver(resetPasswordSchema),
        defaultValues: {
            password: "",
            confirmPassword: "",
        },
    });

    const activeToken = tokenFromUrl || customToken.trim();

    const handleResetPassword = async (data: ResetPasswordFormData) => {
        setErrorMessage("");
        setSuccessMessage("");

        if (!activeToken) {
            setErrorMessage(
                "Thiếu mã xác thực (Token). Vui lòng sử dụng liên kết trong email hoặc nhập mã token."
            );
            return;
        }

        setIsSubmitting(true);
        try {
            const res = await authService.resetPassword({
                token: activeToken,
                newPassword: data.password,
            });

            setSuccessMessage(
                res.message ||
                    "Đặt lại mật khẩu thành công! Đang chuyển hướng về trang đăng nhập..."
            );

            setTimeout(() => {
                navigate("/login");
            }, 2500);
        } catch (err) {
            const msg =
                err instanceof Error
                    ? err.message
                    : "Mã xác thực không hợp lệ hoặc đã hết hạn. Vui lòng yêu cầu cấp lại mã mới.";
            setErrorMessage(msg);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <AuthPageShell
            title="Đặt lại mật khẩu"
            description="Tạo mật khẩu mới để tiếp tục sử dụng tài khoản CRM của bạn."
        >
            {successMessage ? (
                <div className="space-y-4">
                    <div
                        role="status"
                        className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-emerald-900"
                    >
                        <div className="mb-1.5 flex items-center gap-2 font-semibold text-emerald-800">
                            <CheckCircle2 size={18} className="text-emerald-600" />
                            Thành công
                        </div>
                        <p className="text-sm leading-relaxed">{successMessage}</p>
                    </div>

                    <Button
                        variant="contained"
                        fullWidth
                        size="large"
                        onClick={() => navigate("/login")}
                    >
                        Đăng nhập ngay
                    </Button>
                </div>
            ) : (
                <form
                    onSubmit={handleSubmit(handleResetPassword)}
                    className="crm-form"
                    noValidate
                >
                    {!tokenFromUrl && (
                        <TextField
                            label="Mã xác thực (Token)"
                            type="text"
                            fullWidth
                            disabled={isSubmitting}
                            value={customToken}
                            onChange={(e) => {
                                setCustomToken(e.target.value);
                                if (errorMessage) setErrorMessage("");
                            }}
                            helperText="Nhập token đặt lại mật khẩu nhận được từ email của bạn."
                        />
                    )}

                    <Controller
                        name="password"
                        control={control}
                        render={({ field }) => (
                            <TextField
                                {...field}
                                label="Mật khẩu mới"
                                type="password"
                                fullWidth
                                autoComplete="new-password"
                                disabled={isSubmitting}
                                error={!!errors.password}
                                helperText={
                                    errors.password?.message ||
                                    "Mật khẩu cần có ít nhất 8 ký tự."
                                }
                            />
                        )}
                    />

                    <Controller
                        name="confirmPassword"
                        control={control}
                        render={({ field }) => (
                            <TextField
                                {...field}
                                label="Xác nhận mật khẩu mới"
                                type="password"
                                fullWidth
                                autoComplete="new-password"
                                disabled={isSubmitting}
                                error={!!errors.confirmPassword}
                                helperText={errors.confirmPassword?.message || " "}
                            />
                        )}
                    />

                    {errorMessage && (
                        <div
                            role="alert"
                            className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800"
                        >
                            <div className="mb-1 flex items-center gap-2 font-semibold">
                                <LockKeyhole size={18} className="text-red-600" />
                                Lỗi
                            </div>
                            {errorMessage}
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
                                <KeyRound size={18} />
                            )
                        }
                    >
                        {isSubmitting ? "Đang xử lý..." : "Đặt lại mật khẩu"}
                    </Button>
                </form>
            )}

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
