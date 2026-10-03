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
            <section className="overflow-hidden rounded-lg border border-slate-200 bg-white">
                <div className="border-b border-slate-200 px-5 py-4">
                    <h2 className="font-semibold text-slate-900">Thông tin khách hàng</h2>
                </div>
                <div className="grid grid-cols-1 gap-px bg-slate-200 md:grid-cols-2">
                    {fields.map(({ label, value, icon: Icon }) => (
                        <div key={label} className="flex gap-3 bg-white p-5">
                            <Icon size={18} className="mt-0.5 shrink-0 text-slate-400" />
                            <div className="min-w-0">
                                <p className="text-xs text-slate-500">{label}</p>
                                <p className="mt-1 break-words text-sm font-medium text-slate-800">{value}</p>
                            </div>
                        </div>
                    ))}
                    <div className="bg-white p-5">
                        <p className="mb-2 text-xs text-slate-500">Trạng thái</p>
                        <StatusChip status={customer.status} />
                    </div>
                </div>
            </section>

            <section className="rounded-lg border border-slate-200 bg-white p-5">
                <h2 className="font-semibold text-slate-900">Thông tin hệ thống</h2>
                <div className="mt-4 border-t border-slate-100 pt-4">
                    <p className="text-xs text-slate-500">Ngày tạo</p>
                    <p className="mt-1 text-sm font-medium text-slate-800">
                        {new Intl.DateTimeFormat("vi-VN", { dateStyle: "long", timeStyle: "short" }).format(new Date(customer.createdAt))}
                    </p>
                </div>
            </section>
        </div>
    );
}
