import { TicketCheck } from "lucide-react";

import type { CustomerTicket, CustomerTicketPriority, CustomerTicketStatus } from "../../types/customer360";

interface CustomerTicketsProps {
    tickets: readonly CustomerTicket[];
}

const priorityConfig: Record<CustomerTicketPriority, { label: string; className: string }> = {
    LOW: { label: "Thấp", className: "crm-status--inactive" },
    MEDIUM: { label: "Trung bình", className: "crm-status--contacted" },
    HIGH: { label: "Cao", className: "crm-status--proposal" },
};

const statusConfig: Record<CustomerTicketStatus, { label: string; className: string }> = {
    OPEN: { label: "Đang mở", className: "crm-status--open" },
    IN_PROGRESS: { label: "Đang xử lý", className: "crm-status--progress" },
    RESOLVED: { label: "Đã giải quyết", className: "crm-status--resolved" },
    CLOSED: { label: "Đã đóng", className: "crm-status--closed" },
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
            <div className="flex min-h-64 flex-col items-center justify-center rounded-lg border border-(--crm-border) bg-(--crm-surface) px-6 text-center">
                <div className="mb-3 rounded-full bg-(--crm-surface-hover) p-4 text-(--crm-text-muted)"><TicketCheck size={26} /></div>
                <p className="font-medium text-(--crm-text)">Chưa có Ticket hỗ trợ</p>
            </div>
        );
    }

    return (
        <div className="crm-board">
            <div className="crm-table-wrap">
                <table className="crm-table">
                    <thead><tr className="border-b border-(--crm-border) bg-(--crm-surface-subtle)">
                        {["Ticket ID", "Subject", "Priority", "Status", "Created At"].map((label) => <th key={label} className="px-5 py-3 text-left text-xs font-medium text-(--crm-text-secondary)">{label}</th>)}
                    </tr></thead>
                    <tbody>{tickets.map((ticket) => {
                        const priority = priorityConfig[ticket.priority];
                        const status = statusConfig[ticket.status];
                        return (
                            <tr key={ticket.id} className="border-b border-(--crm-border-subtle) last:border-0 hover:bg-(--crm-surface-subtle)">
                                <td className="px-5 py-4 text-sm font-medium text-(--crm-primary)">#{ticket.id}</td>
                                <td className="px-5 py-4 text-sm font-medium text-(--crm-heading)">{ticket.subject}</td>
                                <td className="px-5 py-4"><span className={`crm-status ${priority.className}`}>{priority.label}</span></td>
                                <td className="px-5 py-4"><span className={`crm-status ${status.className}`}>{status.label}</span></td>
                                <td className="px-5 py-4 text-sm text-(--crm-text-secondary)">{dateTimeFormatter.format(new Date(ticket.createdAt))}</td>
                            </tr>
                        );
                    })}</tbody>
                </table>
            </div>
        </div>
    );
}
