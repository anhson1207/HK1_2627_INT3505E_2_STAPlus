import type { CustomerActivity, CustomerDeal, CustomerTicket } from "../types/customer360";

export const mockCustomerDeals: CustomerDeal[] = [
    {
        id: 1,
        customerId: 1,
        name: "CRM Implementation",
        value: 120_000_000,
        stage: "NEGOTIATION",
        expectedCloseDate: "2026-09-30",
    },
    {
        id: 2,
        customerId: 1,
        name: "Website Upgrade",
        value: 50_000_000,
        stage: "PROPOSAL",
        expectedCloseDate: "2026-10-15",
    },
];

export const mockCustomerActivities: CustomerActivity[] = [
    {
        id: 1,
        customerId: 1,
        type: "CALL",
        title: "Gọi tư vấn sản phẩm",
        description: "Trao đổi về nhu cầu CRM",
        createdAt: "2026-09-15T09:30:00",
    },
    {
        id: 2,
        customerId: 1,
        type: "EMAIL",
        title: "Gửi báo giá",
        description: "Đã gửi báo giá qua email",
        createdAt: "2026-09-14T15:00:00",
    },
];

export const mockCustomerTickets: CustomerTicket[] = [
    {
        id: 101,
        customerId: 1,
        subject: "Không đăng nhập được",
        priority: "HIGH",
        status: "OPEN",
        createdAt: "2026-09-15T08:00:00",
    },
    {
        id: 102,
        customerId: 1,
        subject: "Cần hỗ trợ xuất báo cáo",
        priority: "MEDIUM",
        status: "IN_PROGRESS",
        createdAt: "2026-09-14T11:30:00",
    },
];
