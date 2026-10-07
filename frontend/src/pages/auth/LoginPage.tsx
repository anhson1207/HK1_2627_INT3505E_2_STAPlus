import { zodResolver } from "@hookform/resolvers/zod";
import { Alert, Button, CircularProgress, Divider, Snackbar, TextField } from "@mui/material";
import { Controller, useForm } from "react-hook-form";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";

import AuthPageShell from "../../components/auth/AuthPageShell";
import GoogleLoginButton from "../../components/auth/GoogleLoginButton";
import { AuthServiceError, authService } from "../../services/authService";
import { useAuthStore } from "../../stores/authStore";
import { loginSchema, type LoginFormData } from "../../utils/loginSchema";

interface LoginLocationState {
    from?: string;
    message?: string;
}

export default function LoginPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const locationState = location.state as LoginLocationState | null;
    const [error, setError] = useState("");
    const [unverifiedEmail, setUnverifiedEmail] = useState("");
    const [resending, setResending] = useState(false);
    const [message, setMessage] = useState(locationState?.message ?? "");
    const { login, loginWithGoogle, isLoading } = useAuthStore();
    const { control, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
        defaultValues: { email: "", password: "" },
    });

    const navigateAfterLogin = () => navigate(locationState?.from ?? "/dashboard", { replace: true });

    const handleLogin = async (data: LoginFormData) => {
        setError("");
        setUnverifiedEmail("");
        try {
            await login(data);
            navigateAfterLogin();
        } catch (loginError) {
            if (loginError instanceof AuthServiceError && loginError.code === "EMAIL_NOT_VERIFIED") {
                setUnverifiedEmail(data.email);
            }
            setError(loginError instanceof Error ? loginError.message : "Không thể đăng nhập. Vui lòng thử lại.");
        }
    };

    const handleResendVerification = async () => {
        if (!unverifiedEmail) return;
        setResending(true);
        try {
            await authService.resendVerification(unverifiedEmail);
            navigate("/verify-email-pending", { state: { email: unverifiedEmail, message: "Đã gửi lại email xác nhận" } });
        } catch (resendError) {
            setError(resendError instanceof Error ? resendError.message : "Không thể gửi lại email xác nhận");
        } finally {
            setResending(false);
        }
    };

    return (
        <AuthPageShell title="Đăng nhập" description="Đăng nhập vào không gian làm việc CRM.">
            <form onSubmit={handleSubmit(handleLogin)} className="crm-form">
                {error && (
                    <Alert
                        severity="error"
                        action={unverifiedEmail ? (
                            <Button color="inherit" size="small" disabled={resending} onClick={() => void handleResendVerification()}>
                                {resending ? "Đang gửi..." : "Gửi lại xác nhận"}
                            </Button>
                        ) : undefined}
                    >
                        {error}
                    </Alert>
                )}
                <Controller name="email" control={control} render={({ field }) => <TextField {...field} label="Email" type="email" fullWidth autoComplete="email" disabled={isLoading} error={!!errors.email} helperText={errors.email?.message} />} />
                <Controller name="password" control={control} render={({ field }) => <TextField {...field} label="Mật khẩu" type="password" fullWidth autoComplete="current-password" disabled={isLoading} error={!!errors.password} helperText={errors.password?.message} />} />
                <div className="text-right"><Link to="/forgot-password" className="text-sm font-medium text-(--crm-primary) hover:underline">Quên mật khẩu?</Link></div>
                <Button type="submit" variant="contained" fullWidth size="large" disabled={isLoading} startIcon={isLoading ? <CircularProgress size={17} color="inherit" /> : undefined}>
                    {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
                </Button>
            </form>

            <Divider sx={{ my: 3 }}>hoặc</Divider>
            <GoogleLoginButton onLogin={loginWithGoogle} onSuccess={() => navigate("/dashboard", { replace: true })} />
            <p className="mt-5 text-center text-sm text-(--crm-text-secondary)">Chưa có tài khoản? <Link to="/register" className="font-medium text-(--crm-primary) hover:underline">Đăng ký</Link></p>
            <Snackbar open={Boolean(message)} autoHideDuration={3500} onClose={() => setMessage("")} message={message} />
        </AuthPageShell>
    );
}
