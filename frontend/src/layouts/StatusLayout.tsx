import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import BrandLogo from "../components/common/BrandLogo";

interface StatusLayoutProps {
    icon: ReactNode;
    iconBg?: string;
    title: string;
    subtitle?: string;
    children?: ReactNode;
    actions?: ReactNode;
    footerNote?: ReactNode;
}

export default function StatusLayout({
    icon,
    iconBg = "bg-slate-100 text-slate-700 ring-slate-100",
    title,
    subtitle,
    children,
    actions,
    footerNote,
}: StatusLayoutProps) {
    return (
        <div className="min-h-screen flex flex-col justify-between bg-slate-50/80 text-slate-800 font-sans antialiased">
            {/* Top Minimal Bar */}
            <header className="bg-white/80 backdrop-blur-xs border-b border-slate-200/80 px-4 sm:px-8 py-3.5">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <Link to="/" className="hover:opacity-90 transition-opacity">
                        <BrandLogo size="sm" variant="dark" />
                    </Link>
                </div>
            </header>

            {/* Main Center Card */}
            <main className="my-auto mx-auto w-full max-w-[500px] px-4 py-8">
                <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-9 shadow-xs text-center">
                    {/* Status Icon */}
                    <div className="flex justify-center mb-5">
                        <div
                            className={`w-16 h-16 rounded-2xl flex items-center justify-center ring-8 transition-transform hover:scale-105 ${iconBg}`}
                        >
                            {icon}
                        </div>
                    </div>

                    {/* Title & Subtitle */}
                    <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                        {title}
                    </h1>
                    {subtitle && (
                        <p className="mt-2 text-sm text-slate-500 leading-relaxed max-w-md mx-auto">
                            {subtitle}
                        </p>
                    )}

                    {/* Body Content */}
                    {children && <div className="mt-6 text-left">{children}</div>}

                    {/* Actions */}
                    {actions && <div className="mt-7 space-y-3">{actions}</div>}
                </div>

                {footerNote && (
                    <div className="mt-6 text-center text-xs text-slate-400">
                        {footerNote}
                    </div>
                )}
            </main>

            {/* Bottom Footer */}
            <footer className="py-4 text-center text-xs text-slate-400 border-t border-slate-200/60">
                © 2026 STAPlus CRM. All rights reserved.
            </footer>
        </div>
    );
}
