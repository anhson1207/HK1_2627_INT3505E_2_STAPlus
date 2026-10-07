import { zodResolver } from "@hookform/resolvers/zod";
import { Alert, Button, CircularProgress, TextField } from "@mui/material";
import { Controller, useForm } from "react-hook-form";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useRef, useState } from "react";

import AuthPageShell from "../../components/auth/AuthPageShell";
import { useAuthStore } from "../../stores/authStore";
import { loginSchema, type LoginFormData } from "../../utils/loginSchema";

interface LoginLocationState {
    from?: string;
    message?: string;
    username?: string;
}

export default function LoginPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const locationState = location.state as LoginLocationState | null;
    const [error, setError] = useState("");
    const submitting = useRef(false);
    const { login, isLoading } = useAuthStore();
    const { control, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
        defaultValues: { username: locationState?.username ?? "", password: "" },
    });
    const busy = isLoading || isSubmitting;

    const handleLogin = async (data: LoginFormData) => {
        if (submitting.current) return;
        submitting.current = true;
        setError("");
        try {
            await login(data);
            const from = locationState?.from;
            const destination = from?.startsWith("/") && !from.startsWith("//") && !from.includes("\\") ? from : "/dashboard";
            navigate(destination, { replace: true });
        } catch (loginError) {
            setError(loginError instanceof Error ? loginError.message : "Không thể đăng nhập. Vui lòng thử lại.");
        } finally {
            submitting.current = false;
        }
    };

    return (
        <AuthPageShell title="Đăng nhập" description="Đăng nhập vào không gian làm việc CRM.">
            <form onSubmit={(event) => void handleSubmit(handleLogin)(event)} className="crm-form" noValidate>
                {locationState?.message && <Alert severity="success">{locationState.message}</Alert>}
                {error && <Alert severity="error">{error}</Alert>}
                <Controller name="username" control={control} render={({ field }) => <TextField {...field} label="Tên đăng nhập" fullWidth autoComplete="username" disabled={busy} error={!!errors.username} helperText={errors.username?.message} />} />
                <Controller name="password" control={control} render={({ field }) => <TextField {...field} label="Mật khẩu" type="password" fullWidth autoComplete="current-password" disabled={busy} error={!!errors.password} helperText={errors.password?.message} />} />
                <Button type="submit" variant="contained" fullWidth size="large" disabled={busy} startIcon={busy ? <CircularProgress size={17} color="inherit" /> : undefined}>
                    {busy ? "Đang đăng nhập..." : "Đăng nhập"}
                </Button>
            </form>
            <p className="mt-5 text-center text-sm text-(--crm-text-secondary)">Chưa có tài khoản? <Link to="/register" className="font-medium text-(--crm-primary) hover:underline">Đăng ký</Link></p>
        </AuthPageShell>
    );
}
