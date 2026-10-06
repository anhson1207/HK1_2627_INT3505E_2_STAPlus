import { Building2, CalendarDays, Hash, Mail, MapPin, Phone, UserRound } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import type { Customer } from "../../types/customer";
import StatusChip from "../common/StatusChip";

interface CustomerOverviewProps {
    customer: Customer;
}

interface InformationRow {
    label: string;
    value: string;
    icon: LucideIcon;
}

function InformationCard({ title, rows }: { title: string; rows: InformationRow[] }) {
    return (
        <section className="crm-detail-card crm-detail-card__body">
            <h2 className="font-semibold text-(--crm-heading)">{title}</h2>
            <div className="mt-4 space-y-4 border-t border-(--crm-border-subtle) pt-4">
                {rows.map(({ label, value, icon: Icon }) => (
                    <div key={label} className="flex gap-3">
                        <Icon size={17} className="mt-0.5 shrink-0 text-(--crm-text-muted)" />
                        <div className="min-w-0">
                            <p className="crm-property__label">{label}</p>
                            <p className="crm-property__value break-words">{value}</p>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}

export default function CustomerOverview({ customer }: CustomerOverviewProps) {
    const createdAt = new Intl.DateTimeFormat("vi-VN", {
        dateStyle: "long",
        timeStyle: "short",
    }).format(new Date(customer.createdAt));

    return (
        <div className="crm-form-grid xl:grid-cols-3">
            <InformationCard
                title="Thông tin liên hệ"
                rows={[
                    { label: "Email", value: customer.email, icon: Mail },
                    { label: "Số điện thoại", value: customer.phone, icon: Phone },
                    { label: "Địa chỉ", value: customer.address || "—", icon: MapPin },
                ]}
            />

            <section className="crm-detail-card crm-detail-card__body">
                <h2 className="font-semibold text-(--crm-heading)">Thông tin doanh nghiệp</h2>
                <div className="mt-4 space-y-4 border-t border-(--crm-border-subtle) pt-4">
                    <div className="flex gap-3">
                        <Building2 size={17} className="mt-0.5 shrink-0 text-(--crm-text-muted)" />
                        <div><p className="crm-property__label">Công ty</p><p className="mt-0.5 text-sm font-medium text-(--crm-heading)">{customer.company}</p></div>
                    </div>
                    <div><p className="mb-1.5 text-xs text-(--crm-text-secondary)">Trạng thái</p><StatusChip status={customer.status} /></div>
                    <div className="flex gap-3">
                        <UserRound size={17} className="mt-0.5 shrink-0 text-(--crm-text-muted)" />
                        <div><p className="crm-property__label">Người phụ trách</p><p className="mt-0.5 text-sm font-medium text-(--crm-heading)">{customer.ownerName || "—"}</p></div>
                    </div>
                </div>
            </section>

            <InformationCard
                title="Thông tin hệ thống"
                rows={[
                    { label: "Customer ID", value: `#${customer.id}`, icon: Hash },
                    { label: "Ngày tạo", value: createdAt, icon: CalendarDays },
                ]}
            />
        </div>
    );
}
