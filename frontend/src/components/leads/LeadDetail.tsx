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
        <div className="crm-detail-card">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-(--crm-border) p-6">
                <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-(--crm-text-muted)">Lead #{lead.id}</p>
                    <h2 className="mt-1 text-xl font-semibold text-(--crm-heading)">{lead.firstName} {lead.lastName}</h2>
                </div>
                <StatusChip status={lead.status} />
            </div>

            <div className="crm-property-grid crm-detail-card__body">
                {items.map(({ label, value, icon: Icon }) => (
                    <div key={label} className="flex gap-3 min-w-0">
                        <Icon size={18} className="mt-0.5 shrink-0 text-(--crm-text-muted)" />
                        <div>
                            <p className="crm-property__label">{label}</p>
                            <p className="mt-1 break-all text-sm font-medium text-(--crm-heading)">{value}</p>
                        </div>
                    </div>
                ))}
                <div className="crm-field--full">
                    <p className="crm-property__label">Nguồn Lead</p>
                    <p className="crm-property__value">{getLeadSourceLabel(lead.source)}</p>
                </div>
            </div>
        </div>
    );
}
