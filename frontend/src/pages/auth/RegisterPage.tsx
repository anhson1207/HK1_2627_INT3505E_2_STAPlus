import { zodResolver } from "@hookform/resolvers/zod";
import { Button, CircularProgress, TextField, IconButton, InputAdornment, } from "@mui/material";
import { Info, Eye, EyeOff } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { useRef, useState } from "react";

import AuthPageShell from "../../components/auth/AuthPageShell";
import { authService } from "../../services/authService";
import { registerSchema, type RegisterFormData } from "../../utils/registerSchema";

export default function RegisterPage() {
    const navigate = useNavigate();
    const [error, setError] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
            navigate("/login", {
                replace: true,
                state: {
                    username: response.username,
                    message: "Đăng ký thành công! Tài khoản đã được ghi nhận và đang chờ Quản trị viên (Admin) phê duyệt vai trò.",
                },
            });
        } catch (registerError) {
            setError(registerError instanceof Error ? registerError.message : "Không thể đăng ký. Vui lòng thử lại.");
        } finally {
            submitting.current = false;
        }
    };

    return (
        <AuthPageShell title="Tạo tài khoản" description="Bắt đầu quản lý khách hàng cùng CRM.">
            <form onSubmit={(event) => void handleSubmit(handleRegister)(event)} className="crm-form" noValidate>
                {error && (
                    <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50/95 p-3.5 text-left text-xs leading-relaxed shadow-xs">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-600">
                            <Info size={18} />
                        </div>
                        <div className="flex-1">
                            <p className="font-semibold text-amber-900">Lưu ý đăng ký</p>
                            <p className="mt-0.5 text-amber-800">{error}</p>
                        </div>
                    </div>
                )}
                <Controller name="username" control={control} render={({ field }) => <TextField {...field} label="Tên đăng nhập" fullWidth autoComplete="username" disabled={isSubmitting} error={!!errors.username} helperText={errors.username?.message} />} />
                <Controller name="email" control={control} render={({ field }) => <TextField {...field} label="Email" type="email" fullWidth autoComplete="email" disabled={isSubmitting} error={!!errors.email} helperText={errors.email?.message} />} />

                <Controller
                    name="password"
                    control={control}
                    render={({ field }) => (
                        <TextField
                            {...field}
                            label="Mật khẩu"
                            type={showPassword ? "text" : "password"}
                            fullWidth
                            autoComplete="new-password"
                            disabled={isSubmitting}
                            error={!!errors.password}
                            helperText={errors.password?.message}
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
                            label="Xác nhận mật khẩu"
                            type={showConfirmPassword ? "text" : "password"}
                            fullWidth
                            autoComplete="new-password"
                            disabled={isSubmitting}
                            error={!!errors.confirmPassword}
                            helperText={errors.confirmPassword?.message}
                            slotProps={{
                                input: {
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                onClick={() => setShowConfirmPassword((prev) => !prev)}
                                                edge="end"
                                                aria-label={showConfirmPassword ? "Ẩn mật khẩu xác nhận" : "Hiện mật khẩu xác nhận"}
                                                disabled={isSubmitting}
                                            >
                                                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                },
                            }}
                        />
                    )}
                />

                <Button type="submit" variant="contained" fullWidth size="large" disabled={isSubmitting} startIcon={isSubmitting ? <CircularProgress size={17} color="inherit" /> : undefined}>
                    {isSubmitting ? "Đang đăng ký..." : "Đăng ký"}
                </Button>
            </form>
            <p className="mt-5 text-center text-sm text-(--crm-text-secondary)">Đã có tài khoản? <Link to="/login" className="font-medium text-(--crm-primary) hover:underline">Đăng nhập</Link></p>
        </AuthPageShell>
    );
}
