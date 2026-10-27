import { zodResolver } from "@hookform/resolvers/zod";
import { Button, TextField, IconButton, InputAdornment, } from "@mui/material";
import { ArrowLeft, LockKeyhole, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Link } from "react-router-dom";

import AuthPageShell from "../../components/auth/AuthPageShell";
import {
    resetPasswordSchema,
    type ResetPasswordFormData,
} from "../../utils/resetPasswordSchema";

export default function ResetPasswordPage() {
    const [message, setMessage] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const {
        control,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<ResetPasswordFormData>({
        resolver: zodResolver(resetPasswordSchema),
        defaultValues: {
            password: "",
            confirmPassword: "",
        },
    });

    const handleResetPassword = (data: ResetPasswordFormData) => {
        setMessage(
            "Thông tin hợp lệ. Chức năng cập nhật mật khẩu chưa được kết nối."
        );
    };

    return (
        <AuthPageShell
            title="Đặt lại mật khẩu"
            description="Tạo mật khẩu mới để tiếp tục sử dụng tài khoản CRM."
        >
            <form
                onSubmit={handleSubmit(handleResetPassword)}
                className="crm-form"
                noValidate
            >
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
                                                onClick={() =>
                                                    setShowPassword((prev) => !prev)
                                                }
                                                edge="end"
                                                aria-label={
                                                    showPassword
                                                        ? "Ẩn mật khẩu"
                                                        : "Hiện mật khẩu"
                                                }
                                                disabled={isSubmitting}
                                            >
                                                {showPassword ? (
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
                                                onClick={() =>
                                                    setShowConfirmPassword((prev) => !prev)
                                                }
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

                {message && (
                    <div
                        role="status"
                        className="rounded-lg border border-sky-200 bg-sky-50 p-3 text-sm text-sky-800"
                    >
                        <div className="mb-1 flex items-center gap-2 font-semibold">
                            <LockKeyhole size={18} />
                            Thông báo
                        </div>
                        {message}
                    </div>
                )}

                <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    size="large"
                    disabled={isSubmitting}
                >
                    Đặt lại mật khẩu
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