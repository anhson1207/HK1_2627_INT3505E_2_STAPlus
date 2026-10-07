import type { Lead } from "../types/lead";

export const mockLeads: Lead[] = [
    {
        id: 1,
        firstName: "Nguyễn",
        lastName: "Văn An",
        email: "nguyenvana@gmail.com",
        phone: "0987654321",
        company: "ABC Technology",
        source: "WEBSITE",
        status: "NEW",
        ownerName: "Sơn",
        createdAt: "2026-09-10T08:30:00",
    },

    {
        id: 2,
        firstName: "Trần",
        lastName: "Thị Bình",
        email: "tranthib@gmail.com",
        phone: "0932456789",
        company: "XYZ Company",
        source: "FACEBOOK",
        status: "CONTACTED",
        ownerName: "Trúc",
        createdAt: "2026-09-09T16:20:00",
    },

    {
        id: 3,
        firstName: "Lê",
        lastName: "Văn C",
        email: "levanc@gmail.com",
        phone: "0912345678",
        company: "Global Corp",
        source: "REFERRAL",
        status: "QUALIFIED",
        ownerName: "Hải Anh",
        createdAt: "2026-09-09T14:15:00",
    },
];
