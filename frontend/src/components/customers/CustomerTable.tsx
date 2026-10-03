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
                <div className="mb-3 rounded-full bg-slate-100 p-4 text-slate-400">
                    <Users size={28} />
                </div>
                <p className="font-medium text-slate-700">Chưa có khách hàng</p>
                <p className="mt-1 text-sm text-slate-500">Thêm khách hàng mới để bắt đầu quản lý.</p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] border-collapse">
                <thead>
                    <tr className="border-b border-slate-200 bg-slate-50">
                        {["Tên", "Công ty", "Email", "Số điện thoại", "Trạng thái", "Người phụ trách", "Ngày tạo"].map((label) => (
                            <th key={label} className="px-4 py-3 text-left text-xs font-medium text-slate-500">{label}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {customers.map((customer) => (
                        <tr key={customer.id} className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50">
                            <td className="px-4 py-4">
                                <button type="button" onClick={() => onView(customer)} className="text-left text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline">
                                    {customer.name}
                                </button>
                            </td>
                            <td className="px-4 py-4 text-sm text-slate-700">{customer.company}</td>
                            <td className="px-4 py-4 text-sm text-slate-600">{customer.email}</td>
                            <td className="px-4 py-4 text-sm text-slate-600">{customer.phone}</td>
                            <td className="px-4 py-4"><StatusChip status={customer.status} /></td>
                            <td className="px-4 py-4 text-sm text-slate-600">{customer.ownerName || "—"}</td>
                            <td className="px-4 py-4 text-sm text-slate-600">{formatDate(customer.createdAt)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
