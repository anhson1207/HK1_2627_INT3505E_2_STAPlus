import { zodResolver } from "@hookform/resolvers/zod";
import { Alert, Button, CircularProgress, TextField } from "@mui/material";
import { Controller, useForm } from "react-hook-form";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useState } from "react";

import AuthPageShell from "../../components/auth/AuthPageShell";
import { authService } from "../../services/authService";
import { resetPasswordSchema, type ResetPasswordFormData } from "../../utils/resetPasswordSchema";

export default function ResetPasswordPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token") ?? "";
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const { control, handleSubmit, formState: { errors, isSubmitting } } = useForm<ResetPasswordFormData>({
        resolver: zodResolver(resetPasswordSchema),
        defaultValues: { password: "", confirmPassword: "" },
    });

    const handleResetPassword = async ({ password }: ResetPasswordFormData) => {
        setError("");
        try {
            await authService.resetPassword(token, password);
            setSuccess(true);
            window.setTimeout(() => navigate("/login", { replace: true, state: { message: "Đặt lại mật khẩu thành công" } }), 900);
        } catch (resetError) {
            setError(resetError instanceof Error ? resetError.message : "Không thể đặt lại mật khẩu");
        }
    };

    return (
        <AuthPageShell title="Đặt lại mật khẩu" description="Tạo mật khẩu mới cho tài khoản của bạn.">
            {!token && <Alert severity="error" sx={{ mb: 3 }}>Link đặt lại mật khẩu không hợp lệ.</Alert>}
            {success ? <Alert severity="success">Đặt lại mật khẩu thành công. Đang chuyển đến trang đăng nhập...</Alert> : (
                <form onSubmit={handleSubmit(handleResetPassword)} className="flex flex-col gap-5">
                    {error && <Alert severity="error">{error}</Alert>}
                    <Controller name="password" control={control} render={({ field }) => <TextField {...field} label="Mật khẩu mới" type="password" fullWidth autoComplete="new-password" disabled={isSubmitting} error={!!errors.password} helperText={errors.password?.message} />} />
                    <Controller name="confirmPassword" control={control} render={({ field }) => <TextField {...field} label="Xác nhận mật khẩu" type="password" fullWidth autoComplete="new-password" disabled={isSubmitting} error={!!errors.confirmPassword} helperText={errors.confirmPassword?.message} />} />
                    <Button type="submit" variant="contained" fullWidth size="large" disabled={!token || isSubmitting} startIcon={isSubmitting ? <CircularProgress size={17} color="inherit" /> : undefined}>{isSubmitting ? "Đang đặt lại..." : "Đặt lại mật khẩu"}</Button>
                </form>
            )}
            <p className="mt-5 text-center text-sm"><Link to="/login" className="font-medium text-blue-600 hover:underline">Quay lại đăng nhập</Link></p>
        </AuthPageShell>
    );
}
