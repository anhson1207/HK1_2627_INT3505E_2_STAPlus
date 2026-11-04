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
    const normalized = (source || "OTHER").toUpperCase();

    let variant = "other";
    let Icon = Tag;

    switch (normalized) {
        case "WEBSITE":
            variant = "website";
            Icon = Globe;
            break;
        case "FACEBOOK":
            variant = "facebook";
            Icon = MessageSquare;
            break;
        case "ZALO":
            variant = "zalo";
            Icon = MessageCircle;
            break;
        case "GOOGLE_ADS":
            variant = "google_ads";
            Icon = Megaphone;
            break;
        case "PHONE":
            variant = "phone";
            Icon = PhoneCall;
            break;
        case "REFERRAL":
            variant = "referral";
            Icon = Users;
            break;
        case "EVENT":
            variant = "event";
            Icon = Calendar;
            break;
        default:
            variant = "other";
            Icon = Tag;
            break;
    }

    return (
        <span className={`crm-source-badge crm-source-badge--${variant} ${className}`}>
            <Icon size={13} aria-hidden="true" />
            <span>{label}</span>
        </span>
    );
}
