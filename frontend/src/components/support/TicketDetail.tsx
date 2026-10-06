import React from "react";
import { useNavigate } from "react-router-dom";
import Card from "../shared/Card";

export interface TicketReply {
    id: string;
    author: string;
    role: string;
    content: string;
    time: string;
}

export interface TicketDetailData {
    id: string;
    ticketNumber: string;
    subject: string;
    customerName: string;
    customerEmail: string;
    status: string;
    priority: string;
    assignee: string;
    createdAt: string;
    description: string;
    replies: TicketReply[];
}

interface TicketDetailProps {
    ticket: TicketDetailData;
}

export const TicketDetail: React.FC<TicketDetailProps> = ({ ticket }) => {
    const navigate = useNavigate();

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-(--crm-border) bg-(--crm-surface) p-4 rounded-md shadow-sm">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate("/support")}
                        className="text-(--crm-text-secondary) hover:text-(--crm-text) text-sm"
                    >
                        ← Quay lại
                    </button>

                    <span className="text-(--crm-text-disabled)">|</span>

                    <span className="font-bold text-(--crm-primary)">
                        {ticket.ticketNumber}
                    </span>

                    <h1 className="crm-page-title">
                        {ticket.subject}
                    </h1>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={() =>
                            navigate(`/support/${ticket.id}/edit`)
                        }
                        className="px-3 py-1.5 text-xs bg-(--crm-surface) border border-(--crm-border) rounded hover:bg-(--crm-surface-subtle) font-medium"
                    >
                        Chỉnh sửa
                    </button>

                    <button
                        type="button"
                        className="px-3 py-1.5 text-xs bg-(--crm-success) text-(--crm-on-primary) rounded hover:bg-(--crm-success) font-medium"
                    >
                        Đóng Ticket
                    </button>
                </div>
            </div>

            {/* Main content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Cột chính */}
                <div className="lg:col-span-2 space-y-4">

                    <Card title="Mô tả sự cố">
                        <p className="text-sm text-(--crm-heading) leading-relaxed whitespace-pre-line">
                            {ticket.description}
                        </p>
                    </Card>

                    <Card title="Trao đổi / Phản hồi">
                        <div className="space-y-4">
                            {ticket.replies.map((reply) => (
                                <div
                                    key={reply.id}
                                    className="p-3 bg-(--crm-surface-subtle) rounded border border-(--crm-border-subtle) text-sm"
                                >
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="font-semibold text-(--crm-heading)">
                                            {reply.author}{" "}
                                            <span className="text-xs font-normal text-(--crm-primary)">
                                                ({reply.role})
                                            </span>
                                        </span>

                                        <span className="text-xs text-(--crm-text-muted)">
                                            {reply.time}
                                        </span>
                                    </div>

                                    <p className="text-(--crm-text)">
                                        {reply.content}
                                    </p>
                                </div>
                            ))}

                            <div className="pt-2">
                                <textarea
                                    rows={3}
                                    placeholder="Nhập nội dung phản hồi cho khách hàng..."
                                    className="w-full p-2.5 border border-(--crm-border) rounded-md text-sm focus:ring-1 focus:ring-(--crm-primary-soft) focus:outline-none"
                                />

                                <div className="flex justify-end mt-2">
                                    <button
                                        type="button"
                                        className="crm-btn crm-btn--primary"
                                    >
                                        Gửi Phản Hồi
                                    </button>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Cột thông tin */}
                <Card title="Thông tin Chi tiết">
                    <div className="space-y-3 text-sm">

                        <div>
                            <span className="text-xs text-(--crm-text-muted) block">
                                Trạng thái
                            </span>

                            <span className="inline-block mt-0.5 px-2 py-0.5 bg-(--crm-info-soft) text-(--crm-primary) text-xs font-semibold rounded border border-(--crm-primary-soft)">
                                {ticket.status}
                            </span>
                        </div>

                        <div>
                            <span className="text-xs text-(--crm-text-muted) block">
                                Độ ưu tiên
                            </span>

                            <span className="font-semibold text-(--crm-warning) text-xs">
                                {ticket.priority}
                            </span>
                        </div>

                        <div>
                            <span className="text-xs text-(--crm-text-muted) block">
                                Khách hàng
                            </span>

                            <div className="font-medium text-(--crm-heading)">
                                {ticket.customerName}
                            </div>

                            <div className="text-xs text-(--crm-text-secondary)">
                                {ticket.customerEmail}
                            </div>
                        </div>

                        <div>
                            <span className="text-xs text-(--crm-text-muted) block">
                                Người phụ trách
                            </span>

                            <div className="font-medium text-(--crm-heading)">
                                {ticket.assignee}
                            </div>
                        </div>

                        <div>
                            <span className="text-xs text-(--crm-text-muted) block">
                                Ngày tạo
                            </span>

                            <div className="text-xs text-(--crm-text-secondary)">
                                {ticket.createdAt}
                            </div>
                        </div>

                    </div>
                </Card>
            </div>
        </div>
    );
};

export default TicketDetail;
