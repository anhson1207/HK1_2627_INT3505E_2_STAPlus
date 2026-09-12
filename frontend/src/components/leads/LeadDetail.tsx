import { Building2, CalendarDays, Mail, Phone, UserRound } from "lucide-react";

import type { Lead } from "../../types/lead";
import { getLeadSourceLabel } from "../../utils/constants";
import StatusChip from "../common/StatusChip";

interface LeadDetailProps {
    lead: Lead;
}

function formatDate(value?: string) {
    if (!value) return "—";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "—";
    return new Intl.DateTimeFormat("vi-VN", { dateStyle: "medium", timeStyle: "short" }).format(date);
}

export default function LeadDetail({ lead }: LeadDetailProps) {
    const items = [
        { label: "Email", value: lead.email, icon: Mail },
        { label: "Số điện thoại", value: lead.phone, icon: Phone },
        { label: "Công ty", value: lead.company || "Chưa cập nhật", icon: Building2 },
        { label: "Người phụ trách", value: lead.ownerName || "Chưa phân công", icon: UserRound },
        { label: "Ngày tạo", value: formatDate(lead.createdAt), icon: CalendarDays },
        { label: "Cập nhật gần nhất", value: formatDate(lead.updatedAt), icon: CalendarDays },
    ];

    return (
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 p-6">
                <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Lead #{lead.id}</p>
                    <h2 className="mt-1 text-xl font-semibold text-slate-900">{lead.firstName} {lead.lastName}</h2>
                </div>
                <StatusChip status={lead.status} />
            </div>

            <div className="grid grid-cols-1 gap-px bg-slate-200 md:grid-cols-2">
                {items.map(({ label, value, icon: Icon }) => (
                    <div key={label} className="flex gap-3 bg-white p-5">
                        <Icon size={18} className="mt-0.5 shrink-0 text-slate-400" />
                        <div>
                            <p className="text-xs text-slate-500">{label}</p>
                            <p className="mt-1 break-all text-sm font-medium text-slate-800">{value}</p>
                        </div>
                    </div>
                ))}
                <div className="bg-white p-5 md:col-span-2">
                    <p className="text-xs text-slate-500">Nguồn Lead</p>
                    <p className="mt-1 text-sm font-medium text-slate-800">{getLeadSourceLabel(lead.source)}</p>
                </div>
            </div>
        </div>
    );
}
