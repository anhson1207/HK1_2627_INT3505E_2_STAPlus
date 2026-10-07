import type { LucideIcon } from "lucide-react";

interface KpiCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    trend?: string;
    tone?: "teal" | "blue" | "purple" | "green" | "amber" | "rose";
}

export default function KpiCard({ title, value, icon: Icon, trend, tone = "teal" }: KpiCardProps) {
    return (
        <article className={`crm-kpi crm-kpi--accent crm-tone--${tone}`}>
            <div className="crm-kpi__top"><p className="crm-kpi__label">{title}</p><span className="crm-kpi__icon"><Icon size={18} /></span></div>
            <p className="crm-kpi__value">{value}</p>
            {trend && <p className="crm-kpi__trend is-up">{trend} <span className="crm-muted">so với kỳ trước</span></p>}
        </article>
    );
}
