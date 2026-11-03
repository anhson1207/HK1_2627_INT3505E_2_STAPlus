import { Users } from "lucide-react";

import type { Customer } from "../../types/customer";
import StatusChip from "../common/StatusChip";

interface CustomerTableProps {
    customers: Customer[];
    onView: (customer: Customer) => void;
}

function formatDate(value: string) {
    return new Intl.DateTimeFormat("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    }).format(new Date(value));
}

export default function CustomerTable({ customers, onView }: CustomerTableProps) {
    if (customers.length === 0) {
        return (
            <div className="flex min-h-72 flex-col items-center justify-center px-6 text-center">
                <div className="mb-3 rounded-full bg-(--crm-surface-hover) p-4 text-(--crm-text-muted)">
                    <Users size={28} />
                </div>
                <p className="font-medium text-(--crm-text)">Không tìm thấy khách hàng</p>
                <p className="crm-page-description">Thử thay đổi từ khóa hoặc bộ lọc hiện tại.</p>
            </div>
        );
    }

    return (
        <div className="crm-table-wrap">
            <table className="crm-table">
                <thead>
                    <tr className="border-b border-(--crm-border) bg-(--crm-surface-subtle)">
                        <th style={{ width: "20%" }} className="px-5 py-3.5 text-center text-xs font-semibold text-(--crm-text-secondary)">Tên</th>
                        <th style={{ width: "18%" }} className="px-5 py-3.5 text-center text-xs font-semibold text-(--crm-text-secondary)">Công ty</th>
                        <th style={{ width: "20%" }} className="px-5 py-3.5 text-center text-xs font-semibold text-(--crm-text-secondary)">Email</th>
                        <th style={{ width: "13%" }} className="px-5 py-3.5 text-center text-xs font-semibold text-(--crm-text-secondary)">Số điện thoại</th>
                        <th style={{ width: "11%" }} className="px-5 py-3.5 text-center text-xs font-semibold text-(--crm-text-secondary)">Trạng thái</th>
                        <th style={{ width: "10%" }} className="px-5 py-3.5 text-center text-xs font-semibold text-(--crm-text-secondary)">Người phụ trách</th>
                        <th style={{ width: "8%" }} className="px-5 py-3.5 text-center text-xs font-semibold text-(--crm-text-secondary)">Ngày tạo</th>
                    </tr>
                </thead>
                <tbody>
                    {customers.map((customer) => (
                        <tr key={customer.id} className="border-b border-(--crm-border-subtle) last:border-b-0 hover:bg-(--crm-surface-subtle)">
                            <td className="px-5 py-4 text-center">
                                <button type="button" onClick={() => onView(customer)} className="inline-block max-w-full truncate text-center text-sm font-semibold text-(--crm-primary) hover:underline" title={customer.name}>
                                    {customer.name}
                                </button>
                            </td>
                            <td className="px-5 py-4 text-center text-sm text-(--crm-text)">
                                <span className="block truncate text-center" title={customer.company}>{customer.company || "—"}</span>
                            </td>
                            <td className="px-5 py-4 text-center text-sm text-(--crm-text-secondary)">
                                <span className="block truncate text-center" title={customer.email}>{customer.email}</span>
                            </td>
                            <td className="whitespace-nowrap px-5 py-4 text-center text-sm text-(--crm-text-secondary)">{customer.phone}</td>
                            <td className="whitespace-nowrap px-5 py-4 text-center"><StatusChip status={customer.status} /></td>
                            <td className="px-5 py-4 text-center text-sm text-(--crm-text-secondary)">
                                <span className="block truncate text-center" title={customer.ownerName || undefined}>{customer.ownerName || "—"}</span>
                            </td>
                            <td className="whitespace-nowrap px-5 py-4 text-center text-sm text-(--crm-text-secondary)">{formatDate(customer.createdAt)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
