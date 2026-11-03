import {
    Calendar,
    Globe,
    Megaphone,
    MessageCircle,
    MessageSquare,
    PhoneCall,
    Tag,
    Users,
} from "lucide-react";
import type { LeadSource } from "../../types/lead";
import { getLeadSourceLabel } from "../../utils/constants";

interface LeadSourceBadgeProps {
    source: LeadSource;
    className?: string;
}

export default function LeadSourceBadge({ source, className = "" }: LeadSourceBadgeProps) {
    const label = getLeadSourceLabel(source);

    switch (source) {
        case "WEBSITE":
            return (
                <span className={`inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 ${className}`}>
                    <Globe size={13} aria-hidden="true" />
                    <span>{label}</span>
                </span>
            );
        case "FACEBOOK":
            return (
                <span className={`inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 ${className}`}>
                    <MessageSquare size={13} aria-hidden="true" />
                    <span>{label}</span>
                </span>
            );
        case "ZALO":
            return (
                <span className={`inline-flex items-center gap-1.5 rounded-full bg-cyan-50 px-2.5 py-1 text-xs font-medium text-cyan-800 dark:bg-cyan-950/40 dark:text-cyan-300 ${className}`}>
                    <MessageCircle size={13} aria-hidden="true" />
                    <span>{label}</span>
                </span>
            );
        case "GOOGLE_ADS":
            return (
                <span className={`inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 ${className}`}>
                    <Megaphone size={13} aria-hidden="true" />
                    <span>{label}</span>
                </span>
            );
        case "PHONE":
            return (
                <span className={`inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 ${className}`}>
                    <PhoneCall size={13} aria-hidden="true" />
                    <span>{label}</span>
                </span>
            );
        case "REFERRAL":
            return (
                <span className={`inline-flex items-center gap-1.5 rounded-full bg-purple-50 px-2.5 py-1 text-xs font-medium text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 ${className}`}>
                    <Users size={13} aria-hidden="true" />
                    <span>{label}</span>
                </span>
            );
        case "EVENT":
            return (
                <span className={`inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-2.5 py-1 text-xs font-medium text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 ${className}`}>
                    <Calendar size={13} aria-hidden="true" />
                    <span>{label}</span>
                </span>
            );
        default:
            return (
                <span className={`inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300 ${className}`}>
                    <Tag size={13} aria-hidden="true" />
                    <span>{label}</span>
                </span>
            );
    }
}
