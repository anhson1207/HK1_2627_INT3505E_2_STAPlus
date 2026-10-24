import { zodResolver } from "@hookform/resolvers/zod";
import { Button, CircularProgress, TextField } from "@mui/material";
import { CheckCircle2, Clock, Info } from "lucide-react";
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
    const { control, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
        defaultValues: { username: locationState?.username ?? "", password: "" },
    });
    const busy = isLoading || isSubmitting;

    const isPendingApproval = error.toLowerCase().includes("chờ admin") ||
        error.toLowerCase().includes("duyệt") ||
        error.toLowerCase().includes("kích hoạt") ||
        error.toLowerCase().includes("phân quyền");

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

    const handleQuickLogin = async (username: string, pass: string) => {
        setValue("username", username);
        setValue("password", pass);
        await handleLogin({ username, password: pass });
    };

    return (
        <AuthPageShell title="Đăng nhập" description="Đăng nhập vào không gian làm việc CRM.">
            <form onSubmit={(event) => void handleSubmit(handleLogin)(event)} className="crm-form" noValidate>
                {locationState?.message && (
                    <div className="flex items-start gap-3 rounded-xl border border-sky-200 bg-sky-50/90 p-3.5 text-left text-xs leading-relaxed shadow-xs">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sky-100 text-sky-600">
                            <CheckCircle2 size={18} />
                        </div>
                        <div className="flex-1">
                            <p className="font-semibold text-sky-900">Thông báo</p>
                            <p className="mt-0.5 text-sky-800">{locationState.message}</p>
                        </div>
                    </div>
                )}

                {error && isPendingApproval && (
                    <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50/95 p-3.5 text-left text-xs leading-relaxed shadow-xs">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-600">
                            <Clock size={18} />
                        </div>
                        <div className="flex-1">
                            <p className="font-semibold text-amber-900">Tài khoản đang chờ duyệt</p>
                            <p className="mt-0.5 text-amber-800">
                                Tài khoản đã được lưu vào hệ thống. Vui lòng đợi Quản trị viên (Admin) phê duyệt vai trò trước khi đăng nhập.
                            </p>
                            <p className="mt-1.5 font-medium text-amber-900/80">
                                👑 Gợi ý: Bấm nút <strong>Admin</strong> ở phần Đăng nhập nhanh để vào duyệt tài khoản này.
                            </p>
                        </div>
                    </div>
                )}

                {error && !isPendingApproval && (
                    <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50/95 p-3.5 text-left text-xs leading-relaxed shadow-xs">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-600">
                            <Info size={18} />
                        </div>
                        <div className="flex-1">
                            <p className="font-semibold text-amber-900">Lưu ý đăng nhập</p>
                            <p className="mt-0.5 text-amber-800">{error}</p>
                        </div>
                    </div>
                )}
                <Controller
                    name="username"
                    control={control}
                    render={({ field }) => (
                        <TextField
                            {...field}
                            label="Tên đăng nhập hoặc Email"
                            fullWidth
                            autoComplete="username"
                            disabled={busy}
                            error={!!errors.username}
                            helperText={errors.username?.message}
                        />
                    )}
                />
                <Controller
                    name="password"
                    control={control}
                    render={({ field }) => (
                        <TextField
                            {...field}
                            label="Mật khẩu"
                            type="password"
                            fullWidth
                            autoComplete="current-password"
                            disabled={busy}
                            error={!!errors.password}
                            helperText={errors.password?.message}
                        />
                    )}
                />
                <div className="flex justify-end -mt-2">
    <Link
        to="/forgot-password"
        className="text-sm font-medium text-(--crm-primary) hover:underline"
    >
        Quên mật khẩu?
    </Link>
</div>
                <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    size="large"
                    disabled={busy}
                    startIcon={busy ? <CircularProgress size={17} color="inherit" /> : undefined}
                >
                    {busy ? "Đang đăng nhập..." : "Đăng nhập"}
                </Button>
            </form>

            <div className="mt-5 rounded-lg border border-(--crm-border) bg-(--crm-surface-subtle) p-3">
                <p className="mb-2 text-xs font-semibold text-(--crm-heading)">Đăng nhập nhanh (Tài khoản mẫu):</p>
                <div className="grid grid-cols-3 gap-2">
                    <Button
                        size="small"
                        variant="outlined"
                        disabled={busy}
                        onClick={() => void handleQuickLogin("admin", "Admin@123456")}
                    >
                        Admin
                    </Button>
                    <Button
                        size="small"
                        variant="outlined"
                        disabled={busy}
                        onClick={() => void handleQuickLogin("sales", "123456")}
                    >
                        Sales
                    </Button>
                    <Button
                        size="small"
                        variant="outlined"
                        disabled={busy}
                        onClick={() => void handleQuickLogin("support", "123456")}
                    >
                        Support
                    </Button>
                </div>
            </div>
            

            <p className="mt-5 text-center text-sm text-(--crm-text-secondary)">
                Chưa có tài khoản?{" "}
                <Link to="/register" className="font-medium text-(--crm-primary) hover:underline">
                    Đăng ký
                </Link>
            </p>
        </AuthPageShell>
    );
}
