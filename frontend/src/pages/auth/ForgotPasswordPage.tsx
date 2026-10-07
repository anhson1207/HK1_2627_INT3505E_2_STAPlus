import { zodResolver } from "@hookform/resolvers/zod";
import { Alert, Button, CircularProgress, TextField } from "@mui/material";
import { Controller, useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { z } from "zod";

import AuthPageShell from "../../components/auth/AuthPageShell";
import { authService } from "../../services/authService";

const forgotPasswordSchema = z.object({
    email: z.string().trim().min(1, "Vui lòng nhập email").email("Email không hợp lệ"),
});
type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
    const navigate = useNavigate();
    const [error, setError] = useState("");
    const [resetToken, setResetToken] = useState("");
    const { control, handleSubmit, formState: { errors, isSubmitting } } = useForm<ForgotPasswordFormData>({
        resolver: zodResolver(forgotPasswordSchema),
        defaultValues: { email: "" },
    });

    const handleForgotPassword = async ({ email }: ForgotPasswordFormData) => {
        setError("");
        try {
            const response = await authService.forgotPassword(email);
            setResetToken(response.resetToken);
        } catch (forgotError) {
            setError(forgotError instanceof Error ? forgotError.message : "Không thể tạo link đặt lại mật khẩu");
        }
    };

    return (
        <AuthPageShell title="Quên mật khẩu" description="Nhập email để nhận link đặt lại mật khẩu.">
            {resetToken ? (
                <div className="space-y-4">
                    <Alert severity="success">Link đặt lại mật khẩu đã được tạo.</Alert>
                    <div className="rounded-lg border border-dashed border-(--crm-warning-soft) bg-(--crm-warning-soft) p-4 text-center">
                        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-(--crm-warning)">Dev mode</p>
                        <Button variant="contained" onClick={() => navigate(`/reset-password?token=${encodeURIComponent(resetToken)}`)}>Mở trang đặt lại mật khẩu</Button>
                    </div>
                </div>
            ) : (
                <form onSubmit={handleSubmit(handleForgotPassword)} className="crm-form">
                    {error && <Alert severity="error">{error}</Alert>}
                    <Controller name="email" control={control} render={({ field }) => <TextField {...field} label="Email" type="email" fullWidth autoComplete="email" disabled={isSubmitting} error={!!errors.email} helperText={errors.email?.message} />} />
                    <Button type="submit" variant="contained" fullWidth size="large" disabled={isSubmitting} startIcon={isSubmitting ? <CircularProgress size={17} color="inherit" /> : undefined}>{isSubmitting ? "Đang gửi..." : "Gửi link đặt lại"}</Button>
                </form>
            )}
            <p className="mt-5 text-center text-sm"><Link to="/login" className="font-medium text-(--crm-primary) hover:underline">Quay lại đăng nhập</Link></p>
        </AuthPageShell>
    );
}
