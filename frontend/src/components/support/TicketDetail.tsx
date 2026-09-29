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
            <div className="flex items-center justify-between border-b border-gray-200 bg-white p-4 rounded-md shadow-sm">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate("/support")}
                        className="text-gray-500 hover:text-gray-700 text-sm"
                    >
                        ← Quay lại
                    </button>

                    <span className="text-gray-300">|</span>

                    <span className="font-bold text-blue-600">
                        {ticket.ticketNumber}
                    </span>

                    <h1 className="text-lg font-semibold text-gray-800">
                        {ticket.subject}
                    </h1>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={() =>
                            navigate(`/support/${ticket.id}/edit`)
                        }
                        className="px-3 py-1.5 text-xs bg-white border border-gray-300 rounded hover:bg-gray-50 font-medium"
                    >
                        Chỉnh sửa
                    </button>

                    <button
                        type="button"
                        className="px-3 py-1.5 text-xs bg-emerald-600 text-white rounded hover:bg-emerald-700 font-medium"
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
                        <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-line">
                            {ticket.description}
                        </p>
                    </Card>

                    <Card title="Trao đổi / Phản hồi">
                        <div className="space-y-4">
                            {ticket.replies.map((reply) => (
                                <div
                                    key={reply.id}
                                    className="p-3 bg-gray-50 rounded border border-gray-100 text-sm"
                                >
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="font-semibold text-gray-800">
                                            {reply.author}{" "}
                                            <span className="text-xs font-normal text-blue-600">
                                                ({reply.role})
                                            </span>
                                        </span>

                                        <span className="text-xs text-gray-400">
                                            {reply.time}
                                        </span>
                                    </div>

                                    <p className="text-gray-700">
                                        {reply.content}
                                    </p>
                                </div>
                            ))}

                            <div className="pt-2">
                                <textarea
                                    rows={3}
                                    placeholder="Nhập nội dung phản hồi cho khách hàng..."
                                    className="w-full p-2.5 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-blue-500 focus:outline-none"
                                />

                                <div className="flex justify-end mt-2">
                                    <button
                                        type="button"
                                        className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-4 py-2 rounded font-medium"
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
                            <span className="text-xs text-gray-400 block">
                                Trạng thái
                            </span>

                            <span className="inline-block mt-0.5 px-2 py-0.5 bg-blue-50 text-blue-600 text-xs font-semibold rounded border border-blue-200">
                                {ticket.status}
                            </span>
                        </div>

                        <div>
                            <span className="text-xs text-gray-400 block">
                                Độ ưu tiên
                            </span>

                            <span className="font-semibold text-orange-500 text-xs">
                                {ticket.priority}
                            </span>
                        </div>

                        <div>
                            <span className="text-xs text-gray-400 block">
                                Khách hàng
                            </span>

                            <div className="font-medium text-gray-800">
                                {ticket.customerName}
                            </div>

                            <div className="text-xs text-gray-500">
                                {ticket.customerEmail}
                            </div>
                        </div>

                        <div>
                            <span className="text-xs text-gray-400 block">
                                Người phụ trách
                            </span>

                            <div className="font-medium text-gray-800">
                                {ticket.assignee}
                            </div>
                        </div>

                        <div>
                            <span className="text-xs text-gray-400 block">
                                Ngày tạo
                            </span>

                            <div className="text-xs text-gray-600">
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