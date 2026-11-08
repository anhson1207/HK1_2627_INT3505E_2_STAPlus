interface BrandLogoProps {
    size?: "sm" | "md" | "lg";
    variant?: "dark" | "light" | "navy";
    showSubtitle?: boolean;
    subtitle?: string;
    className?: string;
    collapsed?: boolean;
}

export default function BrandLogo({
    size = "md",
    variant = "dark",
    showSubtitle = false,
    subtitle = "CRM Platform",
    className = "",
    collapsed = false,
}: BrandLogoProps) {
    const isDark = variant === "light" || variant === "navy"; // dark background => light text

    const markSizes = {
        sm: "w-7 h-7 rounded-lg text-xs",
        md: "w-9 h-9 rounded-xl text-sm",
        lg: "w-11 h-11 rounded-2xl text-base",
    };

    const textSizes = {
        sm: "text-base font-bold",
        md: "text-xl font-extrabold tracking-tight",
        lg: "text-2xl font-black tracking-tight",
    };

    const emblem = (
        <div
            className={`relative flex items-center justify-center font-black text-white shrink-0 shadow-xs transition-transform hover:scale-105 ${markSizes[size]} bg-gradient-to-br from-[#007f9b] via-[#0284c7] to-[#0369a1] ring-1 ring-white/20`}
            style={{
                boxShadow: "0 4px 12px -2px rgba(0, 127, 155, 0.35)",
            }}
        >
            {/* SVG Emblem: S+ mark */}
            <svg
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-5/6 h-5/6 drop-shadow-xs"
            >
                <path
                    d="M6 8.5C6 7.11929 7.11929 6 8.5 6H13C14.3807 6 15.5 7.11929 15.5 8.5C15.5 9.88071 14.3807 11 13 11H8.5C7.11929 11 6 12.1193 6 13.5C6 14.8807 7.11929 16 8.5 16H13.5C14.8807 16 16 14.8807 16 13.5"
                    stroke="white"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                <path
                    d="M18.5 7.5V11.5M16.5 9.5H20.5"
                    stroke="#38bdf8"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                />
            </svg>
        </div>
    );

    if (collapsed) {
        return (
            <div className={`inline-flex items-center justify-center select-none ${className}`}>
                {emblem}
            </div>
        );
    }

    return (
        <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
            {emblem}

            <div className="flex flex-col text-left">
                <div className="flex items-center gap-1.5">
                    <span className={`${textSizes[size]} ${isDark ? "text-white" : "text-slate-900"}`}>
                        STA<span className="text-[#007f9b]">plus</span>
                    </span>
                    <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                            isDark
                                ? "bg-white/10 text-cyan-300 border border-white/15"
                                : "bg-cyan-50 text-[#007f9b] border border-cyan-200"
                        }`}
                    >
                        CRM
                    </span>
                </div>
                {showSubtitle && (
                    <span
                        className={`text-xs font-medium -mt-0.5 ${
                            isDark ? "text-slate-400" : "text-slate-500"
                        }`}
                    >
                        {subtitle}
                    </span>
                )}
            </div>
        </div>
    );
}
