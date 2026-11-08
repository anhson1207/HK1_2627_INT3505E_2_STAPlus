import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import BrandLogo from "../components/common/BrandLogo";
import { Check } from "lucide-react";

interface StepItem {
    id: number;
    title: string;
    description?: string;
}

interface OnboardingLayoutProps {
    currentStep: number;
    totalSteps?: number;
    steps?: StepItem[];
    title: string;
    subtitle?: string;
    children: ReactNode;
    isDevPreview?: boolean;
}

const DEFAULT_STEPS: StepItem[] = [
    { id: 1, title: "Doanh nghiệp" },
    { id: 2, title: "Quản trị viên" },
    { id: 3, title: "Xác nhận" },
];

export default function OnboardingLayout({
    currentStep,
    steps = DEFAULT_STEPS,
    title,
    subtitle,
    children,
}: OnboardingLayoutProps) {
    return (
        <div className="min-h-screen flex flex-col bg-slate-50/80 text-slate-800 font-sans antialiased">
            {/* Top Navigation Bar */}
            <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 py-3.5 shadow-2xs">
                <div className="max-w-5xl mx-auto flex items-center justify-between">
                    <Link to="/" className="hover:opacity-90 transition-opacity">
                        <BrandLogo size="sm" variant="dark" />
                    </Link>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12">
                {/* Step Progress Indicator (Only shown if wizard is active, steps > 1) */}
                {steps.length > 1 && currentStep <= steps.length && (
                    <div className="mb-8">
                        <div className="flex items-center justify-between max-w-2xl mx-auto relative">
                            {/* Connecting Line */}
                            <div className="absolute top-5 left-6 right-6 h-0.5 bg-slate-200 -z-0" />
                            <div
                                className="absolute top-5 left-6 h-0.5 bg-[#007f9b] transition-all duration-300 -z-0"
                                style={{
                                    width: `${((Math.min(currentStep, steps.length) - 1) / (steps.length - 1)) * 100}%`,
                                }}
                            />

                            {steps.map((step) => {
                                const isCompleted = currentStep > step.id;
                                const isCurrent = currentStep === step.id;

                                return (
                                    <div key={step.id} className="relative z-10 flex flex-col items-center">
                                        <div
                                            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-200 border-2 ${
                                                isCompleted
                                                    ? "bg-[#007f9b] border-[#007f9b] text-white shadow-xs"
                                                    : isCurrent
                                                    ? "bg-white border-[#007f9b] text-[#007f9b] ring-4 ring-[#007f9b]/15 shadow-xs"
                                                    : "bg-white border-slate-300 text-slate-400"
                                            }`}
                                        >
                                            {isCompleted ? <Check size={16} strokeWidth={2.8} /> : step.id}
                                        </div>
                                        <div className="mt-2 text-center">
                                            <p
                                                className={`text-xs font-semibold ${
                                                    isCurrent
                                                        ? "text-slate-900 font-bold"
                                                        : isCompleted
                                                        ? "text-slate-700"
                                                        : "text-slate-400"
                                                }`}
                                            >
                                                {step.title}
                                            </p>
                                            {step.description && (
                                                <p className="hidden sm:block text-[11px] text-slate-400 mt-0.5">
                                                    {step.description}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Card Header & Title */}
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
                    <div className="px-6 sm:px-10 pt-8 pb-5 border-b border-slate-100">
                        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                            {title}
                        </h2>
                        {subtitle && (
                            <p className="text-sm text-slate-500 mt-1.5 leading-relaxed">
                                {subtitle}
                            </p>
                        )}
                    </div>

                    {/* Step Card Body */}
                    <div className="p-6 sm:p-10">
                        {children}
                    </div>
                </div>

                {/* Footer Note */}
                <div className="mt-6 text-center text-xs text-slate-400">
                    © 2026 STAPlus CRM. All rights reserved.
                </div>
            </main>
        </div>
    );
}
