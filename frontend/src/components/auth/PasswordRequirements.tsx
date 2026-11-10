import { Check, Circle } from "lucide-react";
import { PASSWORD_REQUIREMENT_RULES } from "../../utils/passwordSchema";

interface PasswordRequirementsProps {
    password: string;
    className?: string;
}

export default function PasswordRequirements({
    password,
    className = "",
}: PasswordRequirementsProps) {
    return (
        <div
            className={`mt-2 grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-1 text-[11px] ${className}`}
        >
            {PASSWORD_REQUIREMENT_RULES.map((rule) => {
                const passed = rule.test(password);
                return (
                    <div
                        key={rule.id}
                        className={`flex items-center gap-1.5 transition-colors ${
                            passed
                                ? "text-emerald-600 font-medium"
                                : password.length > 0
                                ? "text-slate-500"
                                : "text-slate-400"
                        }`}
                    >
                        {passed ? (
                            <Check size={12} className="shrink-0 text-emerald-500 stroke-[2.5]" />
                        ) : (
                            <Circle size={8} className="shrink-0 mx-0.5 text-slate-300 fill-slate-200" />
                        )}
                        <span>{rule.label}</span>
                    </div>
                );
            })}
        </div>
    );
}
