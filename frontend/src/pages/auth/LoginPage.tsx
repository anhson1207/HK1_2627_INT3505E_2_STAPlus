import { zodResolver } from "@hookform/resolvers/zod";
import { CircularProgress } from "@mui/material";
import { CheckCircle2, Clock, Info, Eye, EyeOff, User, Lock, ArrowRight, ChevronRight } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useRef, useState } from "react";

import AuthSplitLayout from "../../layouts/AuthSplitLayout";
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
    const [showPassword, setShowPassword] = useState(false);
    const submitting = useRef(false);
    const { login, isLoading } = useAuthStore();

    const {
        control,
        handleSubmit,
        setValue,
        formState: { errors, isSubmitting },
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
        defaultValues: { username: locationState?.username ?? "", password: "" },
    });

    const busy = isLoading || isSubmitting;

    const isPendingApproval =
        error.toLowerCase().includes("chờ admin") ||
        error.toLowerCase().includes("duyệt") ||
        error.toLowerCase().includes("kích hoạt") ||
        error.toLowerCase().includes("phân quyền");

    const handleLogin = async (data: LoginFormData) => {
        if (submitting.current) return;
        submitting.current = true;
        setError("");
        try {
            await login(data);
            const loggedInUser = useAuthStore.getState().user;
            if (loggedInUser?.status === "PENDING") {
                navigate("/pending-approval", { replace: true });
                return;
            }
            const from = locationState?.from;
            const destination =
                from?.startsWith("/") && !from.startsWith("//") && !from.includes("\\")
                    ? from
                    : "/dashboard";
            navigate(destination, { replace: true });
        } catch (loginError) {
            setError(
                loginError instanceof Error
                    ? loginError.message
                    : "Không thể đăng nhập. Vui lòng kiểm tra lại thông tin."
            );
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
        <AuthSplitLayout
            title="Chào mừng trở lại"
            description="Đăng nhập để truy cập không gian làm việc STAPlus CRM của bạn."
            footer={
                <p className="text-sm text-slate-600">
                    Chưa có tài khoản?{" "}
                    <Link
                        to="/register"
                        className="font-semibold text-[#007f9b] hover:underline"
                    >
                        Đăng ký
                    </Link>
                </p>
            }
        >
            <form onSubmit={(e) => void handleSubmit(handleLogin)(e)} className="space-y-4" noValidate>
                {/* Information notification */}
                {locationState?.message && (
                    <div className="flex items-start gap-3 rounded-xl border border-sky-200 bg-sky-50/90 p-3.5 text-left text-xs leading-relaxed">
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sky-100 text-sky-600 mt-0.5">
                            <CheckCircle2 size={16} />
                        </div>
                        <div className="flex-1">
                            <p className="font-semibold text-sky-900">Thông báo</p>
                            <p className="mt-0.5 text-sky-800">{locationState.message}</p>
                        </div>
                    </div>
                )}

                {/* Account Pending Approval banner */}
                {error && isPendingApproval && (
                    <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50/95 p-3.5 text-left text-xs leading-relaxed">
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-600 mt-0.5">
                            <Clock size={16} />
                        </div>
                        <div className="flex-1">
                            <p className="font-semibold text-amber-900">Tài khoản đang chờ duyệt</p>
                            <p className="mt-0.5 text-amber-800">
                                Tài khoản của bạn đã được ghi nhận vào hệ thống. Vui lòng đợi Quản trị viên (Admin) phê duyệt vai trò trước khi đăng nhập.
                            </p>
                        </div>
                    </div>
                )}

                {/* Normal Error banner */}
                {error && !isPendingApproval && (
                    <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50/95 p-3.5 text-left text-xs leading-relaxed">
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600 mt-0.5">
                            <Info size={16} />
                        </div>
                        <div className="flex-1">
                            <p className="font-semibold text-red-900">Không thể đăng nhập</p>
                            <p className="mt-0.5 text-red-700">{error}</p>
                        </div>
                    </div>
                )}

                {/* USERNAME / EMAIL INPUT */}
                <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Tên đăng nhập hoặc Email <span className="text-red-500">*</span>
                    </label>
                    <Controller
                        name="username"
                        control={control}
                        render={({ field }) => (
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                    <User size={17} />
                                </div>
                                <input
                                    {...field}
                                    type="text"
                                    autoComplete="username"
                                    disabled={busy}
                                    placeholder="admin@crm.local hoặc username"
                                    className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border text-sm transition-colors outline-none ${
                                        errors.username
                                            ? "border-red-300 focus:border-red-500 bg-red-50/30 text-red-900"
                                            : "border-slate-300 focus:border-[#007f9b] focus:ring-3 focus:ring-[#007f9b]/15 bg-white text-slate-900"
                                    }`}
                                />
                            </div>
                        )}
                    />
                    {errors.username && (
                        <p className="mt-1 text-xs text-red-600">{errors.username.message}</p>
                    )}
                </div>

                {/* PASSWORD INPUT */}
                <div>
                    <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-xs font-semibold text-slate-700">
                            Mật khẩu <span className="text-red-500">*</span>
                        </label>
                        <Link
                            to="/forgot-password"
                            className="text-xs font-semibold text-[#007f9b] hover:underline"
                            tabIndex={-1}
                        >
                            Quên mật khẩu?
                        </Link>
                    </div>
                    <Controller
                        name="password"
                        control={control}
                        render={({ field }) => (
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                    <Lock size={17} />
                                </div>
                                <input
                                    {...field}
                                    type={showPassword ? "text" : "password"}
                                    autoComplete="current-password"
                                    disabled={busy}
                                    placeholder="Nhập mật khẩu của bạn"
                                    className={`w-full pl-10 pr-11 py-2.5 rounded-xl border text-sm transition-colors outline-none ${
                                        errors.password
                                            ? "border-red-300 focus:border-red-500 bg-red-50/30 text-red-900"
                                            : "border-slate-300 focus:border-[#007f9b] focus:ring-3 focus:ring-[#007f9b]/15 bg-white text-slate-900"
                                    }`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((prev) => !prev)}
                                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 focus:outline-hidden cursor-pointer"
                                    aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        )}
                    />
                    {errors.password && (
                        <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>
                    )}
                </div>

                {/* SUBMIT BUTTON */}
                <div className="pt-2">
                    <button
                        type="submit"
                        disabled={busy}
                        className="w-full inline-flex items-center justify-center gap-2 h-12 py-3 px-4 rounded-xl text-base font-bold text-white bg-[#007f9b] hover:bg-[#006278] active:bg-[#004f61] disabled:opacity-60 disabled:cursor-not-allowed shadow-xs hover:shadow transition-all cursor-pointer"
                    >
                        {busy ? (
                            <>
                                <CircularProgress size={18} color="inherit" />
                                <span className="text-base font-semibold">Đang xác thực...</span>
                            </>
                        ) : (
                            <>
                                <span className="text-base font-bold tracking-wide">Đăng nhập</span>
                                <ArrowRight size={18} />
                            </>
                        )}
                    </button>
                </div>
            </form>

            {/* DEV-ONLY COLLAPSIBLE QUICK DEMO LOGIN */}
            {import.meta.env.DEV && (
                <details className="mt-6 border-t border-slate-200/80 pt-4 text-xs group">
                    <summary className="font-semibold text-slate-400 hover:text-slate-600 cursor-pointer flex items-center justify-between select-none py-1">
                        <span>🛠 Dành cho nhà phát triển (Demo Credentials)</span>
                        <ChevronRight size={14} className="group-open:rotate-90 transition-transform" />
                    </summary>
                    <div className="mt-3 grid grid-cols-3 gap-2">
                        <button
                            type="button"
                            disabled={busy}
                            onClick={() => void handleQuickLogin("admin", "Admin@123456")}
                            className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 font-medium text-slate-700 text-xs transition-colors"
                        >
                            Admin
                        </button>
                        <button
                            type="button"
                            disabled={busy}
                            onClick={() => void handleQuickLogin("sales", "123456")}
                            className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 font-medium text-slate-700 text-xs transition-colors"
                        >
                            Sales
                        </button>
                        <button
                            type="button"
                            disabled={busy}
                            onClick={() => void handleQuickLogin("support", "123456")}
                            className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 font-medium text-slate-700 text-xs transition-colors"
                        >
                            Support
                        </button>
                    </div>
                </details>
            )}
        </AuthSplitLayout>
    );
}
