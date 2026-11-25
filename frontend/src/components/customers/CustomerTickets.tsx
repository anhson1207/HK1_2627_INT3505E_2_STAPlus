import { Plus, TicketCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";

import type { CustomerTicket, CustomerTicketPriority, CustomerTicketStatus } from "../../types/customer360";

interface CustomerTicketsProps {
    tickets: readonly CustomerTicket[];
    customerId?: number;
}

const priorityConfig: Record<CustomerTicketPriority, { label: string; className: string }> = {
    LOW: { label: "Thấp", className: "crm-status--inactive" },
    MEDIUM: { label: "Trung bình", className: "crm-status--contacted" },
    HIGH: { label: "Cao", className: "crm-status--proposal" },
    URGENT: { label: "Khẩn cấp", className: "crm-status--lost" },
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

export default function CustomerTickets({ tickets, customerId }: CustomerTicketsProps) {
    const navigate = useNavigate();

    if (tickets.length === 0) {
        return (
            <div className="flex min-h-64 flex-col items-center justify-center rounded-lg border border-(--crm-border) bg-(--crm-surface) px-6 text-center">
                <div className="mb-3 rounded-full bg-(--crm-surface-hover) p-4 text-(--crm-text-muted)"><TicketCheck size={26} /></div>
                <p className="font-medium text-(--crm-text)">Chưa có Ticket hỗ trợ</p>
                {customerId && (
                    <button
                        type="button"
                        onClick={() => navigate(`/tickets/new?customerId=${customerId}`)}
                        className="mt-4 crm-btn crm-btn--primary"
                    >
                        <Plus size={16} /> Tạo Ticket hỗ trợ
                    </button>
                )}
            </div>
        );
    }

    return (
        <div className="crm-board">
            <div className="flex items-center justify-between p-4 border-b border-(--crm-border)">
                <h3 className="text-sm font-semibold text-(--crm-heading)">Danh sách Ticket ({tickets.length})</h3>
                {customerId && (
                    <button
                        type="button"
                        onClick={() => navigate(`/tickets/new?customerId=${customerId}`)}
                        className="crm-btn crm-btn--primary text-xs"
                    >
                        <Plus size={14} /> Tạo Ticket hỗ trợ
                    </button>
                )}
            </div>
            <div className="crm-table-wrap">
                <table className="crm-table">
                    <thead>
                        <tr className="border-b border-(--crm-border) bg-(--crm-surface-subtle)">
                            <th style={{ width: "14%" }} className="px-5 py-3.5 text-center text-xs font-semibold text-(--crm-text-secondary)">Mã Ticket</th>
                            <th style={{ width: "36%" }} className="px-5 py-3.5 text-center text-xs font-semibold text-(--crm-text-secondary)">Tiêu đề</th>
                            <th style={{ width: "16%" }} className="px-5 py-3.5 text-center text-xs font-semibold text-(--crm-text-secondary)">Độ ưu tiên</th>
                            <th style={{ width: "16%" }} className="px-5 py-3.5 text-center text-xs font-semibold text-(--crm-text-secondary)">Trạng thái</th>
                            <th style={{ width: "18%" }} className="px-5 py-3.5 text-center text-xs font-semibold text-(--crm-text-secondary)">Ngày tạo</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tickets.map((ticket) => {
                            const priority = priorityConfig[ticket.priority];
                            const status = statusConfig[ticket.status];
                            return (
                                <tr
                                    key={ticket.id}
                                    onClick={() => navigate(`/tickets/${ticket.id}`)}
                                    className="border-b border-(--crm-border-subtle) last:border-0 hover:bg-(--crm-surface-subtle) cursor-pointer"
                                >
                                    <td className="whitespace-nowrap px-5 py-4 text-center text-sm font-medium text-(--crm-primary)">#{ticket.id}</td>
                                    <td className="px-5 py-4 text-center text-sm font-medium text-(--crm-heading) hover:text-(--crm-primary) hover:underline">
                                        <span className="block truncate text-center" title={ticket.subject}>{ticket.subject}</span>
                                    </td>
                                    <td className="whitespace-nowrap px-5 py-4 text-center"><span className={`crm-status ${priority.className}`}>{priority.label}</span></td>
                                    <td className="whitespace-nowrap px-5 py-4 text-center"><span className={`crm-status ${status.className}`}>{status.label}</span></td>
                                    <td className="whitespace-nowrap px-5 py-4 text-center text-sm text-(--crm-text-secondary)">{dateTimeFormatter.format(new Date(ticket.createdAt))}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
