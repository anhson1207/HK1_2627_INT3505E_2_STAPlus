import type { LucideIcon } from "lucide-react";

interface KpiCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    trend?: string;
    colorClassName?: string;
}

export default function KpiCard({ title, value, icon: Icon, trend, colorClassName = "bg-blue-50 text-blue-600" }: KpiCardProps) {
    return <article className="rounded-xl border border-slate-200 bg-white p-5"><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-medium text-slate-500">{title}</p><p className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">{value}</p></div><div className={`rounded-xl p-3 ${colorClassName}`}><Icon size={21} /></div></div>{trend && <p className="mt-3 text-xs font-medium text-emerald-600">{trend} <span className="font-normal text-slate-400">so với kỳ trước</span></p>}</article>;
}
