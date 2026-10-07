import { zodResolver } from "@hookform/resolvers/zod";
import { Alert, Button, CircularProgress, TextField } from "@mui/material";
import { Controller, useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { useRef, useState } from "react";

import AuthPageShell from "../../components/auth/AuthPageShell";
import { authService } from "../../services/authService";
import { registerSchema, type RegisterFormData } from "../../utils/registerSchema";

export default function RegisterPage() {
    const navigate = useNavigate();
    const [error, setError] = useState("");
    const submitting = useRef(false);
    const { control, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterFormData>({
        resolver: zodResolver(registerSchema),
        defaultValues: { username: "", email: "", password: "", confirmPassword: "" },
    });

    const handleRegister = async (formData: RegisterFormData) => {
        if (submitting.current) return;
        submitting.current = true;
        setError("");
        const data = {
            username: formData.username,
            email: formData.email,
            password: formData.password,
        };
        try {
            const response = await authService.register(data);
            navigate("/login", { replace: true, state: { username: response.username, message: "Đăng ký thành công. Bạn có thể đăng nhập." } });
        } catch (registerError) {
            setError(registerError instanceof Error ? registerError.message : "Không thể đăng ký. Vui lòng thử lại.");
        } finally {
            submitting.current = false;
        }
    };

    return (
        <AuthPageShell title="Tạo tài khoản" description="Bắt đầu quản lý khách hàng cùng CRM.">
            <form onSubmit={(event) => void handleSubmit(handleRegister)(event)} className="crm-form" noValidate>
                {error && <Alert severity="error">{error}</Alert>}
                <Controller name="username" control={control} render={({ field }) => <TextField {...field} label="Tên đăng nhập" fullWidth autoComplete="username" disabled={isSubmitting} error={!!errors.username} helperText={errors.username?.message} />} />
                <Controller name="email" control={control} render={({ field }) => <TextField {...field} label="Email" type="email" fullWidth autoComplete="email" disabled={isSubmitting} error={!!errors.email} helperText={errors.email?.message} />} />
                <Controller name="password" control={control} render={({ field }) => <TextField {...field} label="Mật khẩu" type="password" fullWidth autoComplete="new-password" disabled={isSubmitting} error={!!errors.password} helperText={errors.password?.message} />} />
                <Controller name="confirmPassword" control={control} render={({ field }) => <TextField {...field} label="Xác nhận mật khẩu" type="password" fullWidth autoComplete="new-password" disabled={isSubmitting} error={!!errors.confirmPassword} helperText={errors.confirmPassword?.message} />} />
                <Button type="submit" variant="contained" fullWidth size="large" disabled={isSubmitting} startIcon={isSubmitting ? <CircularProgress size={17} color="inherit" /> : undefined}>
                    {isSubmitting ? "Đang đăng ký..." : "Đăng ký"}
                </Button>
            </form>
            <p className="mt-5 text-center text-sm text-(--crm-text-secondary)">Đã có tài khoản? <Link to="/login" className="font-medium text-(--crm-primary) hover:underline">Đăng nhập</Link></p>
        </AuthPageShell>
    );
}
