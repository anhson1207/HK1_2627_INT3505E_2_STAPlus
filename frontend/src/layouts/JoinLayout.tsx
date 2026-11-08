import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import BrandLogo from "../components/common/BrandLogo";
import { ArrowLeft } from "lucide-react";

interface JoinLayoutProps {
    currentStep?: 1 | 2;
    title: string;
    subtitle?: string;
    children: ReactNode;
    onBack?: () => void;
}

export default function JoinLayout({
    title,
    subtitle,
    children,
    onBack,
}: JoinLayoutProps) {
    return (
        <div className="min-h-screen flex flex-col justify-between bg-slate-50/70 text-slate-800 font-sans antialiased">
            {/* Top Bar */}
            <header className="bg-white border-b border-slate-200/80 px-4 sm:px-8 py-3.5">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <Link to="/" className="hover:opacity-90 transition-opacity">
                        <BrandLogo size="sm" variant="dark" />
                    </Link>
                </div>
            </header>

            {/* Centered Card */}
            <main className="my-auto mx-auto w-full max-w-[560px] px-4 py-8">
                {onBack && (
                    <div className="mb-4 px-1">
                        <button
                            type="button"
                            onClick={onBack}
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                        >
                            <ArrowLeft size={14} /> Quay lại
                        </button>
                    </div>
                )}

                <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-9 shadow-xs">
                    <div className="mb-6">
                        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                            {title}
                        </h1>
                        {subtitle && (
                            <p className="mt-1.5 text-sm text-slate-500 leading-relaxed">
                                {subtitle}
                            </p>
                        )}
                    </div>

                    {children}
                </div>
            </main>

            {/* Bottom Footer */}
            <footer className="py-4 text-center text-xs text-slate-400 border-t border-slate-200/60">
                © 2026 STAPlus CRM. All rights reserved.
            </footer>
        </div>
    );
}
