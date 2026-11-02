import { zodResolver } from "@hookform/resolvers/zod";
import { Button, CircularProgress, IconButton, InputAdornment, TextField } from "@mui/material";
import { ArrowLeft, CheckCircle2, Eye, EyeOff, KeyRound, LockKeyhole } from "lucide-react";
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
    const emailFromUrl = searchParams.get("email") || "";
    const [customToken, setCustomToken] = useState(tokenFromUrl);
    const [email, setEmail] = useState(emailFromUrl);
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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

    const activeToken = customToken.trim();

    const handleResetPassword = async (data: ResetPasswordFormData) => {
        setErrorMessage("");
        setSuccessMessage("");

        const targetEmail = (emailFromUrl || email).trim();
        if (!targetEmail) {
            setErrorMessage("Vui lòng nhập địa chỉ email tài khoản của bạn.");
            return;
        }

        if (!activeToken) {
            setErrorMessage(
                "Vui lòng nhập mã xác nhận (OTP gồm 6 chữ số) được gửi về email của bạn."
            );
            return;
        }

        setIsSubmitting(true);
        try {
            const res = await authService.resetPassword({
                email: targetEmail,
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
            let msg =
                err instanceof Error
                    ? err.message
                    : "Mã xác thực không hợp lệ hoặc đã hết hạn. Vui lòng yêu cầu cấp lại mã mới.";

            const lowerMsg = msg.toLowerCase();
            if (lowerMsg.includes("invalid or expired otp") || lowerMsg.includes("invalid token")) {
                msg = "Mã OTP không chính xác hoặc đã hết hạn. Vui lòng kiểm tra lại.";
            } else if (lowerMsg.includes("validation failed")) {
                msg = "Dữ liệu nhập không hợp lệ. Vui lòng kiểm tra lại mã OTP và mật khẩu.";
            } else if (lowerMsg.includes("otp must contain exactly 6 digits")) {
                msg = "Mã OTP phải bao gồm đúng 6 chữ số.";
            } else if (lowerMsg.includes("user not found")) {
                msg = "Địa chỉ email không tồn tại trong hệ thống.";
            }

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
                    {!emailFromUrl && (
                        <TextField
                            label="Địa chỉ email"
                            type="email"
                            fullWidth
                            autoComplete="email"
                            disabled={isSubmitting}
                            value={email}
                            onChange={(e) => {
                                setEmail(e.target.value);
                                if (errorMessage) setErrorMessage("");
                            }}
                            helperText="Nhập email tài khoản CRM của bạn."
                        />
                    )}

                    <TextField
                        label="Mã xác thực (OTP 6 số)"
                        type="text"
                        fullWidth
                        disabled={isSubmitting}
                        value={customToken}
                        onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, "").slice(0, 6);
                            setCustomToken(val);
                            if (errorMessage) setErrorMessage("");
                        }}
                        slotProps={{
                            htmlInput: { maxLength: 6, inputMode: "numeric" },
                        }}
                        helperText="Nhập mã OTP gồm 6 chữ số nhận được trong email của bạn."
                    />

                    <Controller
                        name="password"
                        control={control}
                        render={({ field }) => (
                            <TextField
                                {...field}
                                label="Mật khẩu mới"
                                type={showPassword ? "text" : "password"}
                                fullWidth
                                autoComplete="new-password"
                                disabled={isSubmitting}
                                error={!!errors.password}
                                helperText={
                                    errors.password?.message ||
                                    "Mật khẩu cần có ít nhất 8 ký tự."
                                }
                                slotProps={{
                                    input: {
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton
                                                    onClick={() => setShowPassword((prev) => !prev)}
                                                    edge="end"
                                                    aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                                                    disabled={isSubmitting}
                                                >
                                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                    },
                                }}
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
                                type={showConfirmPassword ? "text" : "password"}
                                fullWidth
                                autoComplete="new-password"
                                disabled={isSubmitting}
                                error={!!errors.confirmPassword}
                                helperText={errors.confirmPassword?.message || " "}
                                slotProps={{
                                    input: {
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton
                                                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                                                    edge="end"
                                                    aria-label={
                                                        showConfirmPassword
                                                            ? "Ẩn mật khẩu xác nhận"
                                                            : "Hiện mật khẩu xác nhận"
                                                    }
                                                    disabled={isSubmitting}
                                                >
                                                    {showConfirmPassword ? (
                                                        <EyeOff size={20} />
                                                    ) : (
                                                        <Eye size={20} />
                                                    )}
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                    },
                                }}
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
