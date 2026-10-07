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
                <p className="font-medium text-(--crm-text)">Chưa có khách hàng</p>
                <p className="crm-page-description">Thêm khách hàng mới để bắt đầu quản lý.</p>
            </div>
        );
    }

    return (
        <div className="crm-table-wrap">
            <table className="crm-table">
                <thead>
                    <tr className="border-b border-(--crm-border) bg-(--crm-surface-subtle)">
                        {["Tên", "Công ty", "Email", "Số điện thoại", "Trạng thái", "Người phụ trách", "Ngày tạo"].map((label) => (
                            <th key={label} className="px-4 py-3 text-left text-xs font-medium text-(--crm-text-secondary)">{label}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {customers.map((customer) => (
                        <tr key={customer.id} className="border-b border-(--crm-border-subtle) last:border-b-0 hover:bg-(--crm-surface-subtle)">
                            <td className="px-4 py-4">
                                <button type="button" onClick={() => onView(customer)} className="text-left text-sm font-medium text-(--crm-primary) hover:text-(--crm-primary) hover:underline">
                                    {customer.name}
                                </button>
                            </td>
                            <td className="px-4 py-4 text-sm text-(--crm-text)">{customer.company}</td>
                            <td className="px-4 py-4 text-sm text-(--crm-text-secondary)">{customer.email}</td>
                            <td className="px-4 py-4 text-sm text-(--crm-text-secondary)">{customer.phone}</td>
                            <td className="px-4 py-4"><StatusChip status={customer.status} /></td>
                            <td className="px-4 py-4 text-sm text-(--crm-text-secondary)">{customer.ownerName || "—"}</td>
                            <td className="px-4 py-4 text-sm text-(--crm-text-secondary)">{formatDate(customer.createdAt)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
