import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import BrandLogo from "../../components/common/BrandLogo";
import {
    LogIn,
    UserPlus,
    Kanban,
    Sparkles,
    CheckCircle2,
    Clock,
    FileCheck,
    Search,
    ArrowRight,
} from "lucide-react";
import { useAuthStore } from "../../stores/authStore";
import { useThemeStore, applyThemeToDOM } from "../../stores/themeStore";

export default function WelcomePage() {
    const navigate = useNavigate();
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const savedMode = useThemeStore((state) => state.mode);

    useEffect(() => {
        applyThemeToDOM("light");
        return () => {
            applyThemeToDOM(savedMode);
        };
    }, [savedMode]);

    return (
        <div className="min-h-screen flex flex-col justify-between bg-slate-50/70 text-slate-800 font-sans antialiased">
            {/* Top Navigation: Clean Header with BrandLogo Only (plus Dashboard shortcut if logged in) */}
            <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 py-4">
                <div className="max-w-6xl mx-auto flex items-center justify-between">
                    <Link to="/" className="hover:opacity-90 transition-opacity">
                        <BrandLogo size="md" variant="dark" />
                    </Link>
                    {isAuthenticated && (
                        <button
                            type="button"
                            onClick={() => navigate("/dashboard")}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-white bg-[#007f9b] hover:bg-[#006278] active:bg-[#004f61] shadow-xs hover:shadow transition-all cursor-pointer"
                        >
                            <span>Vào bảng điều khiển</span>
                            <ArrowRight size={15} />
                        </button>
                    )}
                </div>
            </header>

            {/* Hero Section */}
            <main className="my-auto max-w-6xl mx-auto px-4 sm:px-8 py-12 sm:py-20 w-full">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
                    {/* Left Column: Headline, Description & 2 CTAs */}
                    <div className="lg:col-span-6 space-y-6 text-left">
                        {/* Main Headline */}
                        <h1 className="text-3xl sm:text-4xl xl:text-5xl font-extrabold tracking-tight text-slate-900 leading-[1.18]">
                            Nền tảng quản trị khách hàng cho{" "}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#007f9b] via-[#0284c7] to-[#0369a1]">
                                doanh nghiệp tăng trưởng
                            </span>
                        </h1>

                        {/* Brief Intro */}
                        <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-xl">
                            Hợp nhất quản lý khách hàng tiềm năng, cơ hội kinh doanh, dịch vụ hỗ trợ và gắn kết đội ngũ Sales - Support trong một không gian làm việc chuyên nghiệp, trực quan.
                        </p>

                        {/* CTAS (Equal width & height) */}
                        {isAuthenticated ? (
                            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
                                <button
                                    type="button"
                                    onClick={() => navigate("/dashboard")}
                                    className="w-full sm:w-60 h-12 inline-flex items-center justify-center gap-2 rounded-xl font-bold text-sm text-white bg-[#007f9b] hover:bg-[#006278] active:bg-[#004f61] border-2 border-transparent shadow-md hover:shadow-lg transition-all cursor-pointer group"
                                >
                                    <span>VÀO BẢNG ĐIỀU KHIỂN</span>
                                    <ArrowRight size={17} className="group-hover:translate-x-1 transition-transform" />
                                </button>
                            </div>
                        ) : (
                            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
                                {/* CTA 1: ĐĂNG NHẬP */}
                                <button
                                    type="button"
                                    onClick={() => navigate("/login")}
                                    className="w-full sm:w-48 h-12 inline-flex items-center justify-center gap-2 rounded-xl font-bold text-sm text-white bg-[#007f9b] hover:bg-[#006278] active:bg-[#004f61] border-2 border-transparent shadow-md hover:shadow-lg transition-all cursor-pointer group"
                                >
                                    <LogIn size={17} />
                                    <span>ĐĂNG NHẬP</span>
                                </button>

                                {/* CTA 2: ĐĂNG KÝ */}
                                <button
                                    type="button"
                                    onClick={() => navigate("/register")}
                                    className="w-full sm:w-48 h-12 inline-flex items-center justify-center gap-2 rounded-xl font-bold text-sm text-slate-800 bg-white hover:bg-slate-50 active:bg-slate-100 border-2 border-slate-300 hover:border-[#007f9b]/60 shadow-xs hover:shadow transition-all cursor-pointer"
                                >
                                    <UserPlus size={17} className="text-[#007f9b]" />
                                    <span>ĐĂNG KÝ</span>
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Right Column: Abstract & Generalized SaaS UI Preview (No hardcoded specific numbers) */}
                    <div className="lg:col-span-6 relative">
                        <div className="relative mx-auto max-w-lg lg:max-w-none rounded-2xl bg-gradient-to-b from-slate-900 via-slate-900 to-[#0b1329] p-4 sm:p-5 shadow-2xl border border-slate-800 text-white overflow-hidden">
                            {/* Browser Top Window Frame */}
                            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800/80 text-xs text-slate-400">
                                <div className="flex items-center gap-1.5">
                                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                                </div>
                                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/60 border border-slate-700/50 text-[11px] text-slate-400 font-mono">
                                    <Search size={10} className="text-slate-500" />
                                    <span>app.staplus.vn</span>
                                </div>
                                <div className="w-8 flex justify-end">
                                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                                </div>
                            </div>

                            {/* Abstract Workspace Sub-header */}
                            <div className="flex items-center justify-between mb-3.5 px-1 text-xs">
                                <div className="flex items-center gap-2">
                                    <div className="p-1 rounded-md bg-[#007f9b]/20 text-cyan-400">
                                        <Kanban size={13} />
                                    </div>
                                    <span className="font-semibold text-slate-200">Quy trình Bán hàng & Chăm sóc</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                    <span>Đồng bộ thời gian thực</span>
                                </div>
                            </div>

                            {/* Generalized Pipeline Columns Representation (Abstract Kanban stages) */}
                            <div className="grid grid-cols-3 gap-2.5 mb-3.5">
                                {/* Column 1: Tiếp nhận */}
                                <div className="rounded-xl bg-white/[0.04] border border-white/5 p-2.5 space-y-2">
                                    <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 pb-1 border-b border-white/5">
                                        <span className="flex items-center gap-1">
                                            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                                            Tiềm năng
                                        </span>
                                    </div>
                                    {/* Abstract Card 1 */}
                                    <div className="p-2 rounded-lg bg-slate-800/60 border border-slate-700/40 space-y-1.5">
                                        <div className="h-2 w-3/4 bg-slate-600/70 rounded-full" />
                                        <div className="h-1.5 w-1/2 bg-slate-700/60 rounded-full" />
                                        <div className="flex items-center justify-between pt-1 text-[9px] text-slate-400">
                                            <span className="px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300">Mới</span>
                                            <Clock size={10} className="text-slate-500" />
                                        </div>
                                    </div>
                                    {/* Abstract Card 2 */}
                                    <div className="p-2 rounded-lg bg-slate-800/40 border border-slate-700/30 space-y-1.5">
                                        <div className="h-2 w-4/5 bg-slate-600/60 rounded-full" />
                                        <div className="h-1.5 w-2/3 bg-slate-700/50 rounded-full" />
                                    </div>
                                </div>

                                {/* Column 2: Đàm phán */}
                                <div className="rounded-xl bg-white/[0.04] border border-white/5 p-2.5 space-y-2">
                                    <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 pb-1 border-b border-white/5">
                                        <span className="flex items-center gap-1">
                                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                                            Đàm phán
                                        </span>
                                    </div>
                                    {/* Abstract Card 3 */}
                                    <div className="p-2 rounded-lg bg-slate-800/60 border border-slate-700/40 space-y-1.5">
                                        <div className="h-2 w-full bg-slate-600/70 rounded-full" />
                                        <div className="h-1.5 w-3/5 bg-slate-700/60 rounded-full" />
                                        <div className="w-full bg-slate-700/50 h-1 rounded-full overflow-hidden mt-1">
                                            <div className="bg-amber-400 h-full w-2/3 rounded-full" />
                                        </div>
                                        <div className="flex items-center justify-between pt-0.5 text-[9px] text-amber-300">
                                            <span>Tiến độ</span>
                                            <FileCheck size={10} />
                                        </div>
                                    </div>
                                    {/* Abstract Card 4 */}
                                    <div className="p-2 rounded-lg bg-slate-800/40 border border-slate-700/30 space-y-1.5">
                                        <div className="h-2 w-3/5 bg-slate-600/60 rounded-full" />
                                        <div className="h-1.5 w-2/5 bg-slate-700/50 rounded-full" />
                                    </div>
                                </div>

                                {/* Column 3: Thành công */}
                                <div className="rounded-xl bg-white/[0.04] border border-white/5 p-2.5 space-y-2">
                                    <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 pb-1 border-b border-white/5">
                                        <span className="flex items-center gap-1">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                            Chốt deal
                                        </span>
                                    </div>
                                    {/* Abstract Card 5 */}
                                    <div className="p-2 rounded-lg bg-slate-800/60 border border-emerald-500/30 space-y-1.5">
                                        <div className="h-2 w-4/5 bg-slate-600/70 rounded-full" />
                                        <div className="h-1.5 w-1/2 bg-slate-700/60 rounded-full" />
                                        <div className="flex items-center justify-between pt-1 text-[9px] text-emerald-400 font-semibold">
                                            <span className="inline-flex items-center gap-0.5">
                                                <CheckCircle2 size={10} /> Đã ký kết
                                            </span>
                                            <Sparkles size={10} />
                                        </div>
                                    </div>
                                    {/* Abstract Card 6 */}
                                    <div className="p-2 rounded-lg bg-slate-800/40 border border-slate-700/30 space-y-1.5">
                                        <div className="h-2 w-3/4 bg-slate-600/60 rounded-full" />
                                        <div className="h-1.5 w-1/3 bg-slate-700/50 rounded-full" />
                                    </div>
                                </div>
                            </div>

                            {/* Abstract Growth Trend Chart (Smooth Wave Curve, No Fake Numbers) */}
                            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 space-y-2">
                                <div className="flex items-center justify-between text-[11px] text-slate-400">
                                    <span className="font-medium text-slate-300">Biểu đồ Tăng trưởng & Xu hướng</span>
                                    <span className="text-[10px] text-emerald-400 font-semibold">Hiệu suất cao</span>
                                </div>

                                {/* Smooth SVG Area Chart */}
                                <div className="h-14 w-full">
                                    <svg viewBox="0 0 300 60" className="w-full h-full" preserveAspectRatio="none">
                                        <defs>
                                            <linearGradient id="curveGradient" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor="#007f9b" stopOpacity="0.45" />
                                                <stop offset="100%" stopColor="#007f9b" stopOpacity="0.0" />
                                            </linearGradient>
                                        </defs>
                                        <path
                                            d="M0,45 Q50,42 90,32 T180,24 T240,15 T300,8 L300,60 L0,60 Z"
                                            fill="url(#curveGradient)"
                                        />
                                        <path
                                            d="M0,45 Q50,42 90,32 T180,24 T240,15 T300,8"
                                            fill="none"
                                            stroke="#38bdf8"
                                            strokeWidth="2.5"
                                            strokeLinecap="round"
                                        />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Minimal Footer */}
            <footer className="py-4 text-center text-xs text-slate-400 border-t border-slate-200/60 bg-white">
                © 2026 STAPlus CRM. All rights reserved.
            </footer>
        </div>
    );
}
