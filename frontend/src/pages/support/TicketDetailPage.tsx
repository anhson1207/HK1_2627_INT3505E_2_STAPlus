import React from "react";
import { useParams } from "react-router-dom";

import TicketDetail from "../../components/support/TicketDetail";

const MOCK_TICKET = {
    ticketNumber: "#TCK-101",
    subject: "Lỗi không xuất được báo cáo Excel hàng tháng",
    customerName: "Nguyễn Văn A",
    customerEmail: "anguyen@company.com",
    status: "Open",
    priority: "High",
    assignee: "Kỹ Thuật A",
    createdAt: "2026-09-25 09:30",
    description:
        'Khách hàng phản hồi khi bấm vào nút "Xuất Excel" ở trang Báo cáo thì hệ thống báo lỗi 500 Server Error.',
    replies: [
        {
            id: "r1",
            author: "Kỹ Thuật A",
            role: "Support Agent",
            content:
                "Chào anh A, bên em đã nhận được thông tin và đang kiểm tra log hệ thống.",
            time: "10:00 AM",
        },
    ],
};

export const TicketDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();

    const ticket = {
        id: id || "1",
        ...MOCK_TICKET,
    };

    return <TicketDetail ticket={ticket} />;
};

export default TicketDetailPage;