import { useState, useMemo } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
    Building2,
    CheckCircle2,
    ArrowRight,
    ArrowLeft,
    ShieldCheck,
    User,
    Lock,
    Mail,
    Phone,
    Globe,
    MapPin,
    AlertCircle,
    Eye,
    EyeOff,
    Check,
} from "lucide-react";
import { CircularProgress } from "@mui/material";

import OnboardingLayout from "../../layouts/OnboardingLayout";
import { organizationService } from "../../services/organizationService";
import type { InitializeSetupData } from "../../types/auth";

const INDUSTRY_OPTIONS = [
    "Công nghệ / Phần mềm",
    "Thương mại điện tử & Bán lẻ",
    "Bất động sản & Xây dựng",
    "Tài chính / Bảo hiểm / Ngân hàng",
    "Sản xuất & Xuất nhập khẩu",
    "Giáo dục & Đào tạo",
    "Y tế & Chăm sóc sức khỏe",
    "Du lịch & Khách sạn",
    "Dịch vụ tư vấn / B2B",
    "Khác",
];

const COMPANY_SIZE_OPTIONS = [
    "1–10 nhân viên (Khởi nghiệp)",
    "11–50 nhân viên (Quy mô nhỏ)",
    "51–200 nhân viên (Vừa)",
    "201–500 nhân viên (Lớn)",
    "Trên 500 nhân viên (Doanh nghiệp lớn)",
];

export default function CompanySetupPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const initialPreview = searchParams.get("mode") === "preview" || searchParams.get("test") === "true";
    const isDevPreview = initialPreview;

    // Wizard Step: 1 = Company, 2 = Owner, 3 = Review, 4 = Success
    const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formError, setFormError] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [customIndustry, setCustomIndustry] = useState("");

    // Form data
    const [formData, setFormData] = useState<InitializeSetupData>({
        companyName: "",
        industry: "Công nghệ / Phần mềm",
        companySize: "11–50 nhân viên (Quy mô nhỏ)",
        phone: "",
        email: "",
        website: "",
        address: "",
        timezone: "Asia/Ho_Chi_Minh",
        adminFullName: "",
        adminEmail: "",
        adminPassword: "",
        adminConfirmPassword: "",
        bootstrapToken: "",
    });

    const handleChange = (field: keyof InitializeSetupData, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        setFormError("");
    };

    // Password strength computation
    const passwordStrength = useMemo(() => {
        const p = formData.adminPassword;
        if (!p) return { score: 0, label: "Chưa nhập", color: "bg-slate-200" };
        let score = 0;
        if (p.length >= 8) score += 1;
        if (/[A-Z]/.test(p) && /[a-z]/.test(p)) score += 1;
        if (/[0-9]/.test(p) || /[^A-Za-z0-9]/.test(p)) score += 1;

        if (score === 1) return { score: 1, label: "Yếu", color: "bg-rose-500" };
        if (score === 2) return { score: 2, label: "Trung bình", color: "bg-amber-500" };
        return { score: 3, label: "Mạnh", color: "bg-emerald-500" };
    }, [formData.adminPassword]);

    // Validation for Step 1
    const handleNextStep1 = () => {
        if (!formData.companyName.trim()) {
            setFormError("Vui lòng nhập tên công ty / doanh nghiệp.");
            return;
        }
        if (formData.industry === "Khác" && !customIndustry.trim()) {
            setFormError("Vui lòng nhập lĩnh vực hoạt động của doanh nghiệp.");
            return;
        }
        setFormError("");
        setCurrentStep(2);
    };

    // Validation for Step 2
    const handleNextStep2 = () => {
        if (!formData.adminFullName.trim()) {
            setFormError("Vui lòng nhập họ và tên Quản trị viên.");
            return;
        }
        if (!formData.adminEmail.trim() || !formData.adminEmail.includes("@")) {
            setFormError("Vui lòng nhập địa chỉ email quản trị hợp lệ.");
            return;
        }
        if (formData.adminPassword.length < 8) {
            setFormError("Mật khẩu quản trị phải có ít nhất 8 ký tự.");
            return;
        }
        if (formData.adminPassword !== formData.adminConfirmPassword) {
            setFormError("Mật khẩu xác nhận không trùng khớp.");
            return;
        }
        setFormError("");
        setCurrentStep(3);
    };

    // Final Submit in Step 3
    const handleSubmitSetup = async () => {
        setIsSubmitting(true);
        setFormError("");

        const payload: InitializeSetupData = {
            ...formData,
            industry: formData.industry === "Khác" ? customIndustry.trim() : formData.industry,
        };

        if (isDevPreview) {
            // In Sandbox / Preview mode, simulate smooth successful setup without corrupting live DB
            setTimeout(() => {
                setIsSubmitting(false);
                setCurrentStep(4);
            }, 800);
            return;
        }

        try {
            await organizationService.initializeSetup(payload);
            setCurrentStep(4);
        } catch (err: unknown) {
            const msg =
                err instanceof Error
                    ? err.message
                    : "Khởi tạo hệ thống thất bại. Vui lòng kiểm tra lại.";
            setFormError(msg);
        } finally {
            setIsSubmitting(false);
        }
    };

    // STEP 4: REAL COMPLETION SCREEN
    if (currentStep === 4) {
        return (
            <OnboardingLayout
                currentStep={4}
                title="Khởi tạo không gian làm việc thành công!"
                subtitle="Hệ thống STAPlus CRM đã được thiết lập hoàn tất và sẵn sàng phục vụ đội ngũ của bạn."
                isDevPreview={isDevPreview}
            >
                <div className="text-center py-4 space-y-6 max-w-lg mx-auto">
                    <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 ring-8 ring-emerald-50/60 flex items-center justify-center mx-auto shadow-xs">
                        <CheckCircle2 size={36} />
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-6 text-left space-y-3.5">
                        <div className="flex items-start gap-3 pb-3 border-b border-slate-200">
                            <div className="p-2 rounded-lg bg-[#007f9b]/10 text-[#007f9b] shrink-0">
                                <Building2 size={20} />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500">Doanh nghiệp đã tạo</p>
                                <h3 className="text-base font-bold text-slate-900">
                                    {formData.companyName || "STAPlus CRM"}
                                </h3>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    {formData.industry === "Khác" ? customIndustry : formData.industry} • {formData.companySize}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <div className="p-2 rounded-lg bg-teal-500/10 text-teal-600 shrink-0">
                                <User size={20} />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500">Tài khoản Quản trị viên (Owner)</p>
                                <p className="text-sm font-semibold text-slate-900">
                                    {formData.adminFullName}
                                </p>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    {formData.adminEmail} • Toàn quyền quản trị & phân quyền
                                </p>
                            </div>
                        </div>
                    </div>

                    <p className="text-xs text-slate-500 leading-relaxed">
                        Mã mời thành viên ban đầu đã được tự động sinh. Bạn có thể đăng nhập ngay để cấu hình phân quyền và gửi mã mời cho nhân viên.
                    </p>

                    <div className="pt-2">
                        <button
                            type="button"
                            onClick={() => navigate("/login")}
                            className="w-full inline-flex items-center justify-center gap-2 py-3 px-5 rounded-xl text-sm font-semibold text-white bg-[#007f9b] hover:bg-[#006278] shadow-xs transition-all cursor-pointer"
                        >
                            Đến trang Đăng nhập
                            <ArrowRight size={16} />
                        </button>
                    </div>
                </div>
            </OnboardingLayout>
        );
    }

    // 4. ONBOARDING WIZARD (STEPS 1, 2, 3)
    return (
        <OnboardingLayout
            currentStep={currentStep}
            title={
                currentStep === 1
                    ? "Bước 1: Khai báo thông tin doanh nghiệp"
                    : currentStep === 2
                    ? "Bước 2: Tạo tài khoản Quản trị viên (Owner)"
                    : "Bước 3: Xem lại và Xác nhận khởi tạo"
            }
            subtitle={
                currentStep === 1
                    ? "Cung cấp các thông tin cơ bản về công ty hoặc tổ chức của bạn để thiết lập không gian CRM."
                    : currentStep === 2
                    ? "Tài khoản Quản trị tối cao nắm quyền sở hữu và quản lý toàn bộ nhân viên, vai trò trong hệ thống."
                    : "Kiểm tra lại toàn bộ thông tin trước khi hoàn tất quy trình khởi tạo cơ sở dữ liệu."
            }
            isDevPreview={isDevPreview}
        >
            {/* Error banner */}
            {formError && (
                <div className="mb-6 flex items-start gap-3 p-3.5 rounded-xl border border-red-200 bg-red-50 text-xs text-red-800 leading-relaxed">
                    <AlertCircle size={16} className="text-red-600 shrink-0 mt-0.5" />
                    <span>{formError}</span>
                </div>
            )}

            {/* STEP 1: COMPANY INFO */}
            {currentStep === 1 && (
                <div className="space-y-5">
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                            Tên doanh nghiệp / Tổ chức <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                <Building2 size={17} />
                            </div>
                            <input
                                type="text"
                                value={formData.companyName}
                                onChange={(e) => handleChange("companyName", e.target.value)}
                                placeholder="Ví dụ: Công ty Cổ phần Công nghệ STAPlus CRM"
                                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-[#007f9b] focus:ring-3 focus:ring-[#007f9b]/15 text-sm text-slate-900 outline-none transition-colors"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        {/* Industry */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                Lĩnh vực hoạt động <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={formData.industry}
                                onChange={(e) => handleChange("industry", e.target.value)}
                                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-[#007f9b] focus:ring-3 focus:ring-[#007f9b]/15 text-sm text-slate-900 bg-white outline-none transition-colors"
                            >
                                {INDUSTRY_OPTIONS.map((opt) => (
                                    <option key={opt} value={opt}>
                                        {opt}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Company Size */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                Quy mô nhân sự <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={formData.companySize}
                                onChange={(e) => handleChange("companySize", e.target.value)}
                                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-[#007f9b] focus:ring-3 focus:ring-[#007f9b]/15 text-sm text-slate-900 bg-white outline-none transition-colors"
                            >
                                {COMPANY_SIZE_OPTIONS.map((opt) => (
                                    <option key={opt} value={opt}>
                                        {opt}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Custom Industry Input if "Khác" */}
                    {formData.industry === "Khác" && (
                        <div className="p-3.5 rounded-xl bg-cyan-50/50 border border-cyan-200 space-y-1">
                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                                Nhập lĩnh vực hoạt động của bạn <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={customIndustry}
                                onChange={(e) => setCustomIndustry(e.target.value)}
                                placeholder="Ví dụ: Thiết kế nội thất, Nông nghiệp công nghệ cao..."
                                className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-sm bg-white outline-none focus:border-[#007f9b]"
                            />
                        </div>
                    )}

                    <div className="pt-2 border-t border-slate-100">
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                            Thông tin liên hệ (Tùy chọn)
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-slate-600 mb-1">
                                    Hotline / Điện thoại
                                </label>
                                <div className="relative">
                                    <Phone size={15} className="absolute left-3.5 top-3 text-slate-400" />
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => handleChange("phone", e.target.value)}
                                        placeholder="028 1234 5678"
                                        className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-200 outline-none focus:border-[#007f9b]"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-600 mb-1">
                                    Email công ty
                                </label>
                                <div className="relative">
                                    <Mail size={15} className="absolute left-3.5 top-3 text-slate-400" />
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => handleChange("email", e.target.value)}
                                        placeholder="contact@company.com"
                                        className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-200 outline-none focus:border-[#007f9b]"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-600 mb-1">
                                    Website
                                </label>
                                <div className="relative">
                                    <Globe size={15} className="absolute left-3.5 top-3 text-slate-400" />
                                    <input
                                        type="url"
                                        value={formData.website}
                                        onChange={(e) => handleChange("website", e.target.value)}
                                        placeholder="https://company.com"
                                        className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-200 outline-none focus:border-[#007f9b]"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-600 mb-1">
                                    Địa chỉ trụ sở
                                </label>
                                <div className="relative">
                                    <MapPin size={15} className="absolute left-3.5 top-3 text-slate-400" />
                                    <input
                                        type="text"
                                        value={formData.address}
                                        onChange={(e) => handleChange("address", e.target.value)}
                                        placeholder="Tầng 5, Tòa nhà ABC, Hà Nội"
                                        className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-200 outline-none focus:border-[#007f9b]"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Step 1 Actions */}
                    <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
                        <Link
                            to="/register"
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
                        >
                            <ArrowLeft size={14} /> Quay lại
                        </Link>
                        <button
                            type="button"
                            onClick={handleNextStep1}
                            className="inline-flex items-center gap-2 py-2.5 px-5 rounded-xl text-sm font-semibold text-white bg-[#007f9b] hover:bg-[#006278] shadow-xs transition-all cursor-pointer"
                        >
                            Tiếp tục: Tạo tài khoản Quản trị
                            <ArrowRight size={16} />
                        </button>
                    </div>
                </div>
            )}

            {/* STEP 2: OWNER ACCOUNT */}
            {currentStep === 2 && (
                <div className="space-y-5">
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2 text-slate-600">
                            <Building2 size={16} className="text-[#007f9b]" />
                            <span>Đang thiết lập cho: <strong className="text-slate-900">{formData.companyName}</strong></span>
                        </div>
                        <button
                            type="button"
                            onClick={() => setCurrentStep(1)}
                            className="text-xs font-semibold text-[#007f9b] hover:underline"
                        >
                            Đổi tên
                        </button>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                            Họ và tên Quản trị viên <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <User size={17} className="absolute left-3.5 top-3 text-slate-400" />
                            <input
                                type="text"
                                value={formData.adminFullName}
                                onChange={(e) => handleChange("adminFullName", e.target.value)}
                                placeholder="Ví dụ: Nguyễn Anh Sơn"
                                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-[#007f9b] focus:ring-3 focus:ring-[#007f9b]/15 text-sm text-slate-900 outline-none transition-colors"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                            Email quản trị (Dùng để đăng nhập) <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <Mail size={17} className="absolute left-3.5 top-3 text-slate-400" />
                            <input
                                type="email"
                                value={formData.adminEmail}
                                onChange={(e) => handleChange("adminEmail", e.target.value)}
                                placeholder="owner@company.com"
                                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-[#007f9b] focus:ring-3 focus:ring-[#007f9b]/15 text-sm text-slate-900 outline-none transition-colors"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        {/* Password */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                Mật khẩu quản trị <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <Lock size={17} className="absolute left-3.5 top-3 text-slate-400" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={formData.adminPassword}
                                    onChange={(e) => handleChange("adminPassword", e.target.value)}
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

                            {/* Password strength bar */}
                            {formData.adminPassword && (
                                <div className="mt-2 space-y-1">
                                    <div className="flex gap-1.5 h-1.5 w-full">
                                        <div
                                            className={`flex-1 rounded-full ${
                                                passwordStrength.score >= 1 ? passwordStrength.color : "bg-slate-200"
                                            }`}
                                        />
                                        <div
                                            className={`flex-1 rounded-full ${
                                                passwordStrength.score >= 2 ? passwordStrength.color : "bg-slate-200"
                                            }`}
                                        />
                                        <div
                                            className={`flex-1 rounded-full ${
                                                passwordStrength.score >= 3 ? passwordStrength.color : "bg-slate-200"
                                            }`}
                                        />
                                    </div>
                                    <p className="text-[11px] text-slate-500">
                                        Độ mạnh mật khẩu: <strong className="font-semibold">{passwordStrength.label}</strong>
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                Xác nhận mật khẩu <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <Lock size={17} className="absolute left-3.5 top-3 text-slate-400" />
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    value={formData.adminConfirmPassword}
                                    onChange={(e) => handleChange("adminConfirmPassword", e.target.value)}
                                    placeholder="Nhập lại mật khẩu"
                                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-300 focus:border-[#007f9b] text-sm text-slate-900 outline-none transition-colors"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword((p) => !p)}
                                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                                >
                                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Step 2 Actions */}
                    <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
                        <button
                            type="button"
                            onClick={() => setCurrentStep(1)}
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                        >
                            <ArrowLeft size={14} /> Quay lại Bước 1
                        </button>
                        <button
                            type="button"
                            onClick={handleNextStep2}
                            className="inline-flex items-center gap-2 py-2.5 px-5 rounded-xl text-sm font-semibold text-white bg-[#007f9b] hover:bg-[#006278] shadow-xs transition-all cursor-pointer"
                        >
                            Tiếp tục: Xem lại & Xác nhận
                            <ArrowRight size={16} />
                        </button>
                    </div>
                </div>
            )}

            {/* STEP 3: REVIEW & CONFIRM */}
            {currentStep === 3 && (
                <div className="space-y-6">
                    <div className="rounded-2xl border border-slate-200 divide-y divide-slate-100 overflow-hidden">
                        {/* Company Summary */}
                        <div className="p-5 bg-white">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <Building2 size={18} className="text-[#007f9b]" />
                                    <h4 className="text-sm font-bold text-slate-900">Thông tin doanh nghiệp</h4>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setCurrentStep(1)}
                                    className="text-xs font-semibold text-[#007f9b] hover:underline cursor-pointer"
                                >
                                    Chỉnh sửa
                                </button>
                            </div>
                            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-xs">
                                <div>
                                    <dt className="text-slate-400">Tên công ty:</dt>
                                    <dd className="font-semibold text-slate-800 mt-0.5">{formData.companyName}</dd>
                                </div>
                                <div>
                                    <dt className="text-slate-400">Lĩnh vực:</dt>
                                    <dd className="font-semibold text-slate-800 mt-0.5">
                                        {formData.industry === "Khác" ? customIndustry : formData.industry}
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-slate-400">Quy mô:</dt>
                                    <dd className="font-semibold text-slate-800 mt-0.5">{formData.companySize}</dd>
                                </div>
                                <div>
                                    <dt className="text-slate-400">Hotline:</dt>
                                    <dd className="font-semibold text-slate-800 mt-0.5">{formData.phone || "—"}</dd>
                                </div>
                            </dl>
                        </div>

                        {/* Owner Summary */}
                        <div className="p-5 bg-white">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <User size={18} className="text-[#007f9b]" />
                                    <h4 className="text-sm font-bold text-slate-900">Tài khoản Quản trị viên (Owner)</h4>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setCurrentStep(2)}
                                    className="text-xs font-semibold text-[#007f9b] hover:underline cursor-pointer"
                                >
                                    Chỉnh sửa
                                </button>
                            </div>
                            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-xs">
                                <div>
                                    <dt className="text-slate-400">Họ và tên:</dt>
                                    <dd className="font-semibold text-slate-800 mt-0.5">{formData.adminFullName}</dd>
                                </div>
                                <div>
                                    <dt className="text-slate-400">Email quản trị:</dt>
                                    <dd className="font-semibold text-slate-800 mt-0.5">{formData.adminEmail}</dd>
                                </div>
                                <div>
                                    <dt className="text-slate-400">Vai trò phân bổ:</dt>
                                    <dd className="font-semibold text-emerald-700 mt-0.5">OWNER & ADMIN tối cao</dd>
                                </div>
                                <div>
                                    <dt className="text-slate-400">Mật khẩu:</dt>
                                    <dd className="font-semibold text-slate-800 mt-0.5">•••••••• (Đã bảo mật)</dd>
                                </div>
                            </dl>
                        </div>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 leading-relaxed">
                        <p className="flex items-center gap-1.5 font-semibold text-slate-800 mb-1">
                            <ShieldCheck size={15} className="text-[#007f9b]" />
                            Cam kết bảo mật Single-Company
                        </p>
                        Bằng việc bấm xác nhận, hệ thống sẽ hoàn tất thiết lập không gian làm việc độc lập. Mọi dữ liệu bán hàng, khách hàng và nhân sự của doanh nghiệp sẽ được lưu trữ an toàn trong cơ sở dữ liệu riêng biệt.
                    </div>

                    {/* Step 3 Actions */}
                    <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
                        <button
                            type="button"
                            disabled={isSubmitting}
                            onClick={() => setCurrentStep(2)}
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                        >
                            <ArrowLeft size={14} /> Quay lại Bước 2
                        </button>
                        <button
                            type="button"
                            disabled={isSubmitting}
                            onClick={() => void handleSubmitSetup()}
                            className="inline-flex items-center gap-2 py-3 px-6 rounded-xl text-sm font-semibold text-white bg-[#007f9b] hover:bg-[#006278] active:bg-[#004f61] disabled:opacity-60 shadow-xs transition-all cursor-pointer"
                        >
                            {isSubmitting ? (
                                <>
                                    <CircularProgress size={16} color="inherit" />
                                    <span>Đang khởi tạo CRM...</span>
                                </>
                            ) : (
                                <>
                                    <span>Hoàn tất thiết lập CRM</span>
                                    <Check size={16} />
                                </>
                            )}
                        </button>
                    </div>
                </div>
            )}
        </OnboardingLayout>
    );
}
