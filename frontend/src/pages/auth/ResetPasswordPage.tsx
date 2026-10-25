import { zodResolver } from "@hookform/resolvers/zod";
import { Button, TextField } from "@mui/material";
import { ArrowLeft, LockKeyhole } from "lucide-react";
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