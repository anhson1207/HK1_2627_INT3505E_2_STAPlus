import { Building2, Mail, MapPin, Phone, UserRound } from "lucide-react";

import type { Customer } from "../../types/customer";
import StatusChip from "../common/StatusChip";

interface CustomerDetailProps {
    customer: Customer;
}

export default function CustomerDetail({ customer }: CustomerDetailProps) {
    const fields = [
        { label: "Email", value: customer.email, icon: Mail },
        { label: "Số điện thoại", value: customer.phone, icon: Phone },
        { label: "Công ty", value: customer.company, icon: Building2 },
        { label: "Địa chỉ", value: customer.address || "—", icon: MapPin },
        { label: "Người phụ trách", value: customer.ownerName || "—", icon: UserRound },
    ];

    return (
        <div className="space-y-5">
            <section className="crm-detail-card">
                <div className="crm-detail-card__header">
                    <h2 className="font-semibold text-(--crm-heading)">Thông tin khách hàng</h2>
                </div>
                <div className="crm-property-grid crm-detail-card__body">
                    {fields.map(({ label, value, icon: Icon }) => (
                        <div key={label} className="flex gap-3 min-w-0">
                            <Icon size={18} className="mt-0.5 shrink-0 text-(--crm-text-muted)" />
                            <div className="min-w-0">
                                <p className="crm-property__label">{label}</p>
                                <p className="mt-1 break-words text-sm font-medium text-(--crm-heading)">{value}</p>
                            </div>
                        </div>
                    ))}
                    <div className="min-w-0">
                        <p className="mb-2 text-xs text-(--crm-text-secondary)">Trạng thái</p>
                        <StatusChip status={customer.status} />
                    </div>
                </div>
            </section>

            <section className="crm-card crm-card__body">
                <h2 className="font-semibold text-(--crm-heading)">Thông tin hệ thống</h2>
                <div className="mt-4 border-t border-(--crm-border-subtle) pt-4">
                    <p className="crm-property__label">Ngày tạo</p>
                    <p className="crm-property__value">
                        {new Intl.DateTimeFormat("vi-VN", { dateStyle: "long", timeStyle: "short" }).format(new Date(customer.createdAt))}
                    </p>
                </div>
            </section>
        </div>
    );
}
