import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
    Building2,
    CheckCircle2,
    Lock,
    Mail,
    User,
    KeyRound,
    AlertCircle,
    ArrowRight,
    Loader2,
    Eye,
    EyeOff,
    Check,
} from "lucide-react";

import JoinLayout from "../../layouts/JoinLayout";
import { invitationService } from "../../services/invitationService";
import { authService } from "../../services/authService";
import { useAuthStore } from "../../stores/authStore";
import type { ValidateInvitationResponse } from "../../types/auth";

export default function EmployeeJoinPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const initialCode = searchParams.get("code") || "";

    // Step 1 = Enter & Verify Code, Step 2 = Enter personal info
    const [currentStep, setCurrentStep] = useState<1 | 2>(1);

    const [inviteCode, setInviteCode] = useState(initialCode);
    const [isValidatingCode, setIsValidatingCode] = useState(false);
    const [validatedInfo, setValidatedInfo] = useState<ValidateInvitationResponse | null>(null);
    const [validationError, setValidationError] = useState("");

    // Registration Form State
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formError, setFormError] = useState("");

    const login = useAuthStore((state) => state.login);

    const handleValidateCode = async (codeToTest: string) => {
        if (!codeToTest.trim()) {
            setValidationError("Vui lòng nhập mã mời tham gia.");
            setValidatedInfo(null);
            return;
        }

        setIsValidatingCode(true);
        setValidationError("");
        try {
            const res = await invitationService.validateInvitation(codeToTest.trim());
            if (res.valid) {
                setValidatedInfo(res);
                setValidationError("");
            } else {
                setValidatedInfo(null);
                setValidationError(res.message || "Mã mời không hợp lệ hoặc đã hết hạn sử dụng.");
            }
        } catch (err: unknown) {
            setValidatedInfo(null);
            setValidationError(
                err instanceof Error ? err.message : "Không thể kiểm tra mã mời lúc này."
            );
        } finally {
            setIsValidatingCode(false);
        }
    };

    // Auto-validate if code is provided via URL query param
    useEffect(() => {
        if (initialCode) {
            void handleValidateCode(initialCode);
        }
    }, [initialCode]);

    const handleSubmitRegistration = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError("");

        if (!fullName.trim()) {
            setFormError("Vui lòng nhập họ và tên của bạn.");
            return;
        }
        if (!email.trim() || !email.includes("@")) {
            setFormError("Vui lòng nhập địa chỉ email hợp lệ.");
            return;
        }
        if (password.length < 8) {
            setFormError("Mật khẩu phải có ít nhất 8 ký tự.");
            return;
        }
        if (password !== confirmPassword) {
            setFormError("Mật khẩu xác nhận không khớp.");
            return;
        }
        if (!validatedInfo || !validatedInfo.valid) {
            setFormError("Mã mời chưa được xác thực hoặc đã hết hạn.");
            return;
        }

        setIsSubmitting(true);
        try {
            await authService.registerEmployee({
                fullName: fullName.trim(),
                email: email.trim().toLowerCase(),
                password,
                confirmPassword,
                invitationCode: inviteCode.trim().toUpperCase(),
            });

            // Automatically attempt login to set session and direct to /pending-approval
            try {
                await login({
                    username: email.trim().toLowerCase(),
                    password,
                });
                navigate("/pending-approval", { replace: true });
            } catch {
                navigate("/login", {
                    state: {
                        username: email.trim().toLowerCase(),
                        message:
                            "Đăng ký tham gia công ty thành công! Vui lòng đăng nhập để kiểm tra trạng thái phê duyệt.",
                    },
                });
            }
        } catch (err: unknown) {
            setFormError(err instanceof Error ? err.message : "Đăng ký thất bại. Vui lòng thử lại.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <JoinLayout
            currentStep={currentStep}
            title={
                currentStep === 1
                    ? "Nhập mã mời tham gia"
                    : "Đăng ký tài khoản nhân viên"
            }
            subtitle={
                currentStep === 1
                    ? "Nhập mã mời do Quản trị viên doanh nghiệp cấp để xác minh không gian làm việc."
                    : "Điền thông tin cá nhân của bạn để hoàn tất hồ sơ nhân viên trong tổ chức."
            }
            onBack={currentStep === 2 ? () => setCurrentStep(1) : () => navigate("/register")}
        >
            {/* STEP 1: VERIFY CODE */}
            {currentStep === 1 && (
                <div className="space-y-5">
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                            Mã mời tham gia doanh nghiệp <span className="text-red-500">*</span>
                        </label>
                        <div className="flex gap-2.5">
                            <div className="relative flex-1">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                    <KeyRound size={17} />
                                </div>
                                <input
                                    type="text"
                                    value={inviteCode}
                                    onChange={(e) => {
                                        setInviteCode(e.target.value);
                                        setValidatedInfo(null);
                                        setValidationError("");
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            e.preventDefault();
                                            void handleValidateCode(inviteCode);
                                        }
                                    }}
                                    placeholder="Ví dụ: STAPLUS-JOIN-XXXX"
                                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-[#007f9b] focus:ring-3 focus:ring-[#007f9b]/15 text-sm font-mono uppercase tracking-wider text-slate-900 outline-none transition-colors"
                                />
                            </div>
                            <button
                                type="button"
                                disabled={isValidatingCode || !inviteCode.trim()}
                                onClick={() => void handleValidateCode(inviteCode)}
                                className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-[#007f9b] hover:bg-[#006278] active:bg-[#004f61] disabled:opacity-50 disabled:cursor-not-allowed shadow-xs transition-all cursor-pointer shrink-0"
                            >
                                {isValidatingCode ? (
                                    <span className="flex items-center gap-1.5">
                                        <Loader2 size={16} className="animate-spin" />
                                        <span>Kiểm tra</span>
                                    </span>
                                ) : (
                                    "Kiểm tra mã"
                                )}
                            </button>
                        </div>

                        {validationError && (
                            <div className="mt-3 flex items-start gap-2.5 p-3 rounded-xl border border-red-200 bg-red-50 text-xs text-red-700">
                                <AlertCircle size={16} className="shrink-0 text-red-600 mt-0.5" />
                                <span>{validationError}</span>
                            </div>
                        )}
                    </div>

                    {/* Validated Workspace Banner */}
                    {validatedInfo?.valid && (
                        <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/90 text-xs text-emerald-900 space-y-3 animate-in fade-in duration-200">
                            <div className="flex items-start gap-3">
                                <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                                    <Building2 size={19} />
                                </div>
                                <div className="flex-1">
                                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded mb-1">
                                        <CheckCircle2 size={12} /> Mã mời hợp lệ
                                    </span>
                                    <h4 className="text-sm font-bold text-slate-900">
                                        {validatedInfo.companyName || "STAPlus CRM"}
                                    </h4>
                                    <p className="text-xs text-slate-600 mt-0.5">
                                        {validatedInfo.industry ? `${validatedInfo.industry} • ` : ""}
                                        Sẵn sàng tiếp nhận thành viên mới vào tổ chức.
                                    </p>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={() => setCurrentStep(2)}
                                className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-xs transition-colors cursor-pointer"
                            >
                                Tiếp tục tạo tài khoản nhân viên
                                <ArrowRight size={16} />
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* STEP 2: EMPLOYEE REGISTRATION FORM */}
            {currentStep === 2 && (
                <form onSubmit={handleSubmitRegistration} className="space-y-4">
                    {/* Workspace banner badge */}
                    <div className="flex items-center justify-between p-3 rounded-xl bg-cyan-50/70 border border-cyan-200 text-xs">
                        <div className="flex items-center gap-2">
                            <Building2 size={16} className="text-[#007f9b]" />
                            <span>
                                Đang tham gia: <strong className="text-slate-900">{validatedInfo?.companyName || "STAPlus CRM"}</strong>
                            </span>
                        </div>
                        <button
                            type="button"
                            onClick={() => setCurrentStep(1)}
                            className="font-semibold text-[#007f9b] hover:underline cursor-pointer"
                        >
                            Đổi mã
                        </button>
                    </div>

                    {formError && (
                        <div className="flex items-start gap-2.5 p-3 rounded-xl border border-red-200 bg-red-50 text-xs text-red-700">
                            <AlertCircle size={16} className="shrink-0 text-red-600 mt-0.5" />
                            <span>{formError}</span>
                        </div>
                    )}

                    {/* Full Name */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                            Họ và tên của bạn <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <User size={17} className="absolute left-3.5 top-3 text-slate-400" />
                            <input
                                type="text"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                placeholder="Ví dụ: Nguyễn Văn An"
                                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-[#007f9b] focus:ring-3 focus:ring-[#007f9b]/15 text-sm text-slate-900 outline-none transition-colors"
                            />
                        </div>
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                            Email làm việc <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <Mail size={17} className="absolute left-3.5 top-3 text-slate-400" />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="nhanvien@congty.com"
                                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-[#007f9b] focus:ring-3 focus:ring-[#007f9b]/15 text-sm text-slate-900 outline-none transition-colors"
                            />
                        </div>
                    </div>

                    {/* Password & Confirm */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                Mật khẩu <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <Lock size={17} className="absolute left-3.5 top-3 text-slate-400" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Tối thiểu 8 ký tự"
                                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-300 focus:border-[#007f9b] text-sm text-slate-900 outline-none transition-colors"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((p) => !p)}
                                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                                >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                Xác nhận mật khẩu <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <Lock size={17} className="absolute left-3.5 top-3 text-slate-400" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Nhập lại mật khẩu"
                                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-[#007f9b] text-sm text-slate-900 outline-none transition-colors"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Submit button */}
                    <div className="pt-3">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold text-white bg-[#007f9b] hover:bg-[#006278] active:bg-[#004f61] disabled:opacity-60 shadow-xs transition-all cursor-pointer"
                        >
                            {isSubmitting ? (
                                <span className="flex items-center gap-2">
                                    <Loader2 size={16} className="animate-spin" />
                                    <span>Đang gửi yêu cầu...</span>
                                </span>
                            ) : (
                                <span className="flex items-center gap-2">
                                    <span>Gửi yêu cầu tham gia</span>
                                    <Check size={16} />
                                </span>
                            )}
                        </button>
                    </div>
                </form>
            )}
        </JoinLayout>
    );
}
