import { TicketCheck } from "lucide-react";

import type { CustomerTicket, CustomerTicketPriority, CustomerTicketStatus } from "../../types/customer360";

interface CustomerTicketsProps {
    tickets: readonly CustomerTicket[];
}

const priorityConfig: Record<CustomerTicketPriority, { label: string; className: string }> = {
    LOW: { label: "Thấp", className: "bg-slate-100 text-slate-600" },
    MEDIUM: { label: "Trung bình", className: "bg-amber-50 text-amber-700" },
    HIGH: { label: "Cao", className: "bg-red-50 text-red-700" },
};

const statusConfig: Record<CustomerTicketStatus, { label: string; className: string }> = {
    OPEN: { label: "Đang mở", className: "bg-blue-50 text-blue-700" },
    IN_PROGRESS: { label: "Đang xử lý", className: "bg-violet-50 text-violet-700" },
    RESOLVED: { label: "Đã giải quyết", className: "bg-emerald-50 text-emerald-700" },
    CLOSED: { label: "Đã đóng", className: "bg-slate-100 text-slate-600" },
};

const dateTimeFormatter = new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
});

export default function CustomerTickets({ tickets }: CustomerTicketsProps) {
    if (tickets.length === 0) {
        return (
            <div className="flex min-h-64 flex-col items-center justify-center rounded-lg border border-slate-200 bg-white px-6 text-center">
                <div className="mb-3 rounded-full bg-slate-100 p-4 text-slate-400"><TicketCheck size={26} /></div>
                <p className="font-medium text-slate-700">Chưa có Ticket hỗ trợ</p>
            </div>
        );
    }

    return (
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
            <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] border-collapse">
                    <thead><tr className="border-b border-slate-200 bg-slate-50">
                        {["Ticket ID", "Subject", "Priority", "Status", "Created At"].map((label) => <th key={label} className="px-5 py-3 text-left text-xs font-medium text-slate-500">{label}</th>)}
                    </tr></thead>
                    <tbody>{tickets.map((ticket) => {
                        const priority = priorityConfig[ticket.priority];
                        const status = statusConfig[ticket.status];
                        return (
                            <tr key={ticket.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                                <td className="px-5 py-4 text-sm font-medium text-blue-600">#{ticket.id}</td>
                                <td className="px-5 py-4 text-sm font-medium text-slate-800">{ticket.subject}</td>
                                <td className="px-5 py-4"><span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${priority.className}`}>{priority.label}</span></td>
                                <td className="px-5 py-4"><span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${status.className}`}>{status.label}</span></td>
                                <td className="px-5 py-4 text-sm text-slate-600">{dateTimeFormatter.format(new Date(ticket.createdAt))}</td>
                            </tr>
                        );
                    })}</tbody>
                </table>
            </div>
        </div>
    );
}
