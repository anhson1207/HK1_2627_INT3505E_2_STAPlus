import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import BrandLogo from "../components/common/BrandLogo";
import { TrendingUp, Users, ShieldCheck, Kanban, CheckCircle2 } from "lucide-react";

interface AuthSplitLayoutProps {
    title: string;
    description?: string;
    children: ReactNode;
    footer?: ReactNode;
}

export default function AuthSplitLayout({
    title,
    description,
    children,
    footer,
}: AuthSplitLayoutProps) {
    return (
        <div className="min-h-screen flex w-full bg-slate-50 font-sans antialiased text-slate-800">
            {/* LEFT COLUMN: BRANDING & PRODUCT OVERVIEW (Hidden on mobile/tablet < 1024px) */}
            <div className="hidden lg:flex lg:w-[44%] xl:w-[42%] relative flex-col justify-between p-10 xl:p-12 bg-[#091524] text-white overflow-hidden border-r border-slate-800/80">
                {/* Ambient subtle glow background */}
                <div
                    className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-[#007f9b]/20 blur-3xl pointer-events-none"
                    aria-hidden="true"
                />
                <div
                    className="absolute bottom-10 right-0 w-80 h-80 rounded-full bg-[#0284c7]/15 blur-3xl pointer-events-none"
                    aria-hidden="true"
                />

                {/* Top: Clean Logo Only */}
                <div className="relative z-10 flex items-center justify-between">
                    <Link to="/" className="hover:opacity-90 transition-opacity">
                        <BrandLogo size="md" variant="navy" />
                    </Link>
                </div>

                {/* Middle: Headline, Concise Highlights & Abstract Preview */}
                <div className="relative z-10 my-auto py-6 space-y-7 max-w-lg">
                    {/* Main Headline */}
                    <div className="space-y-3">
                        <h1 className="text-3xl xl:text-4xl font-extrabold tracking-tight text-white leading-tight">
                            Quản lý khách hàng.<br />
                            Kết nối đội ngũ.<br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-sky-400">
                                Tăng trưởng hiệu quả.
                            </span>
                        </h1>
                        <p className="text-slate-300 text-sm xl:text-base leading-relaxed">
                            Nền tảng CRM thế hệ mới tối ưu hoá quy trình kinh doanh và gắn kết đội ngũ theo thời gian thực.
                        </p>
                    </div>

                    {/* Minimalist Feature Points (Clean & uncluttered) */}
                    <div className="space-y-3 text-xs xl:text-sm text-slate-300">
                        <div className="flex items-center gap-3">
                            <div className="p-1.5 rounded-lg bg-cyan-500/15 text-cyan-400 shrink-0">
                                <TrendingUp size={16} />
                            </div>
                            <span>Quản lý phễu bán hàng & khách hàng tiềm năng xuyên suốt</span>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="p-1.5 rounded-lg bg-teal-500/15 text-teal-400 shrink-0">
                                <Users size={16} />
                            </div>
                            <span>Phối hợp thời gian thực giữa Sales, Support và Quản trị</span>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="p-1.5 rounded-lg bg-emerald-500/15 text-emerald-400 shrink-0">
                                <ShieldCheck size={16} />
                            </div>
                            <span>Bảo mật dữ liệu và phân quyền vai trò chặt chẽ</span>
                        </div>
                    </div>

                    {/* Abstract & Generalized UI Preview (No fake hardcoded numbers) */}
                    <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-3">
                        {/* Browser dots & status */}
                        <div className="flex items-center justify-between pb-2 border-b border-slate-800/80 text-xs">
                            <div className="flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-rose-500/80" />
                                <span className="w-2 h-2 rounded-full bg-amber-500/80" />
                                <span className="w-2 h-2 rounded-full bg-emerald-500/80" />
                            </div>
                            <span className="flex items-center gap-1.5 text-[11px] text-slate-400 font-mono">
                                <Kanban size={11} className="text-cyan-400" />
                                <span>crm.staplus.vn</span>
                            </span>
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        </div>

                        {/* Abstract Pipeline Representation */}
                        <div className="grid grid-cols-3 gap-2">
                            {/* Column 1 */}
                            <div className="p-2 rounded-lg bg-slate-800/50 border border-slate-700/40 space-y-1.5">
                                <div className="h-1.5 w-12 bg-cyan-400/80 rounded-full" />
                                <div className="h-2 w-full bg-slate-700/60 rounded-full" />
                                <div className="h-1.5 w-2/3 bg-slate-700/40 rounded-full" />
                            </div>

                            {/* Column 2 */}
                            <div className="p-2 rounded-lg bg-slate-800/50 border border-slate-700/40 space-y-1.5">
                                <div className="h-1.5 w-12 bg-amber-400/80 rounded-full" />
                                <div className="h-2 w-full bg-slate-700/60 rounded-full" />
                                <div className="h-1.5 w-3/4 bg-slate-700/40 rounded-full" />
                            </div>

                            {/* Column 3 */}
                            <div className="p-2 rounded-lg bg-slate-800/50 border border-emerald-500/30 space-y-1.5">
                                <div className="h-1.5 w-12 bg-emerald-400/80 rounded-full" />
                                <div className="h-2 w-full bg-slate-700/60 rounded-full" />
                                <div className="flex items-center gap-1 text-[9px] text-emerald-400 font-semibold pt-0.5">
                                    <CheckCircle2 size={10} /> Chốt deal
                                </div>
                            </div>
                        </div>

                        {/* Smooth Curve Wave */}
                        <div className="h-8 w-full pt-1">
                            <svg viewBox="0 0 200 30" className="w-full h-full" preserveAspectRatio="none">
                                <defs>
                                    <linearGradient id="splitCurveGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#007f9b" stopOpacity="0.4" />
                                        <stop offset="100%" stopColor="#007f9b" stopOpacity="0.0" />
                                    </linearGradient>
                                </defs>
                                <path
                                    d="M0,24 Q40,22 80,16 T140,10 T200,4 L200,30 L0,30 Z"
                                    fill="url(#splitCurveGradient)"
                                />
                                <path
                                    d="M0,24 Q40,22 80,16 T140,10 T200,4"
                                    fill="none"
                                    stroke="#38bdf8"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Bottom: Minimal Copyright */}
                <div className="relative z-10 text-xs text-slate-500 pt-4 border-t border-slate-800/80">
                    © 2026 STAPlus CRM. All rights reserved.
                </div>
            </div>

            {/* RIGHT COLUMN: FOCUSED FORM AREA (Desktop 56–58%, Mobile 100%) */}
            <div className="flex-1 flex flex-col justify-between p-6 sm:p-10 lg:p-12 overflow-y-auto bg-white lg:bg-slate-50/60">
                {/* Mobile Header (Hidden on lg+) */}
                <div className="lg:hidden flex items-center justify-between pb-6 border-b border-slate-200/80 mb-6">
                    <Link to="/" className="hover:opacity-90 transition-opacity">
                        <BrandLogo size="sm" variant="dark" />
                    </Link>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-cyan-50 text-[#007f9b] border border-cyan-200">
                        CRM Suite
                    </span>
                </div>

                {/* Main Centered Form Wrapper */}
                <div className="my-auto mx-auto w-full max-w-[440px] py-6">
                    {/* Page Header */}
                    <div className="mb-7">
                        <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                            {title}
                        </h2>
                        {description && (
                            <p className="mt-1.5 text-sm text-slate-500 leading-relaxed">
                                {description}
                            </p>
                        )}
                    </div>

                    {/* Content Card (On mobile pure clean, on desktop elevated card) */}
                    <div className="bg-white rounded-2xl lg:border lg:border-slate-200/90 lg:p-8 lg:shadow-xs">
                        {children}
                    </div>

                    {/* Optional Footer Links */}
                    {footer && (
                        <div className="mt-6 text-center text-sm text-slate-500">
                            {footer}
                        </div>
                    )}
                </div>

                {/* Mobile Footer */}
                <div className="lg:hidden pt-6 border-t border-slate-200 text-center text-xs text-slate-400">
                    © 2026 STAPlus CRM. Bản quyền thuộc về doanh nghiệp.
                </div>
            </div>
        </div>
    );
}
