import type { Deal, DealPayload, DealStage } from "../types/deal";

const STORAGE_KEY = "crm-soa.deals";
const MOCK_DELAY_MS = 350;

export const mockDeals: Deal[] = [
    { id: 1, name: "CRM Implementation", customerId: 1, customerName: "Nguyễn Minh Anh", value: 120_000_000, stage: "NEGOTIATION", probability: 70, expectedCloseDate: "2026-10-10", ownerName: "Sơn", description: "Triển khai CRM cho doanh nghiệp", createdAt: "2026-09-15T09:00:00" },
    { id: 2, name: "Website Upgrade", customerId: 2, customerName: "Trần Quốc Bảo", value: 50_000_000, stage: "PROPOSAL", probability: 55, expectedCloseDate: "2026-10-15", ownerName: "Trúc", createdAt: "2026-09-14T15:00:00" },
    { id: 3, name: "Cloud Migration", customerId: 3, customerName: "Lê Thu Hà", value: 210_000_000, stage: "QUALIFIED", probability: 40, expectedCloseDate: "2026-11-01", ownerName: "Hải", createdAt: "2026-09-14T10:30:00" },
    { id: 4, name: "Marketing Automation", customerId: 4, customerName: "Phạm Hoàng Nam", value: 85_000_000, stage: "NEW", probability: 20, expectedCloseDate: "2026-11-12", ownerName: "Sơn", createdAt: "2026-09-13T08:15:00" },
    { id: 5, name: "Logistics Dashboard", customerId: 5, customerName: "Vũ Ngọc Linh", value: 145_000_000, stage: "WON", probability: 100, expectedCloseDate: "2026-09-28", ownerName: "Trúc", createdAt: "2026-09-12T14:45:00" },
    { id: 6, name: "ERP Integration", customerId: 6, customerName: "Đặng Tuấn Kiệt", value: 320_000_000, stage: "LOST", probability: 0, expectedCloseDate: "2026-09-25", ownerName: "Hải", createdAt: "2026-09-11T11:20:00" },
    { id: 7, name: "Mobile Sales App", customerId: 7, customerName: "Bùi Thanh Thảo", value: 95_000_000, stage: "NEGOTIATION", probability: 75, expectedCloseDate: "2026-10-20", ownerName: "Sơn", createdAt: "2026-09-10T16:00:00" },
    { id: 8, name: "Trading Portal", customerId: 8, customerName: "Đỗ Đức Long", value: 180_000_000, stage: "PROPOSAL", probability: 60, expectedCloseDate: "2026-10-30", ownerName: "Trúc", createdAt: "2026-09-10T09:10:00" },
    { id: 9, name: "Data Warehouse", customerId: 9, customerName: "Hồ Khánh Vy", value: 260_000_000, stage: "QUALIFIED", probability: 45, expectedCloseDate: "2026-12-01", ownerName: "Hải", createdAt: "2026-09-09T13:35:00" },
    { id: 10, name: "Business Intelligence", customerId: 10, customerName: "Ngô Quang Huy", value: 135_000_000, stage: "NEW", probability: 15, expectedCloseDate: "2026-11-25", ownerName: "Sơn", createdAt: "2026-09-08T10:00:00" },
    { id: 11, name: "Brand Experience", customerId: 11, customerName: "Dương Mai Chi", value: 65_000_000, stage: "WON", probability: 100, expectedCloseDate: "2026-09-20", ownerName: "Trúc", createdAt: "2026-09-07T15:15:00" },
    { id: 12, name: "Customer Portal", customerId: 12, customerName: "Mai Gia Hân", value: 110_000_000, stage: "LOST", probability: 0, expectedCloseDate: "2026-09-18", ownerName: "Hải", createdAt: "2026-09-06T08:40:00" },
    { id: 13, name: "HR Management Suite", customerId: 1, customerName: "Nguyễn Minh Anh", value: 155_000_000, stage: "NEGOTIATION", probability: 80, expectedCloseDate: "2026-10-25", ownerName: "Sơn", createdAt: "2026-09-05T14:00:00" },
    { id: 14, name: "E-commerce Platform", customerId: 2, customerName: "Trần Quốc Bảo", value: 230_000_000, stage: "PROPOSAL", probability: 50, expectedCloseDate: "2026-11-15", ownerName: "Trúc", createdAt: "2026-09-04T09:30:00" },
    { id: 15, name: "Security Assessment", customerId: 3, customerName: "Lê Thu Hà", value: 75_000_000, stage: "QUALIFIED", probability: 35, expectedCloseDate: "2026-10-18", ownerName: "Hải", createdAt: "2026-09-03T12:20:00" },
    { id: 16, name: "Retail POS System", customerId: 4, customerName: "Phạm Hoàng Nam", value: 190_000_000, stage: "NEW", probability: 25, expectedCloseDate: "2026-12-10", ownerName: "Sơn", createdAt: "2026-09-02T16:10:00" },
    { id: 17, name: "Analytics Workspace", customerId: 5, customerName: "Vũ Ngọc Linh", value: 125_000_000, stage: "WON", probability: 100, expectedCloseDate: "2026-09-16", ownerName: "Trúc", createdAt: "2026-09-01T11:45:00" },
    { id: 18, name: "Document Management", customerId: 6, customerName: "Đặng Tuấn Kiệt", value: 90_000_000, stage: "LOST", probability: 0, expectedCloseDate: "2026-09-12", ownerName: "Hải", createdAt: "2026-08-31T08:30:00" },
];

function wait() {
    return new Promise<void>((resolve) => window.setTimeout(resolve, MOCK_DELAY_MS));
}

function readDeals(): Deal[] {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
        try {
            const deals = JSON.parse(stored) as Deal[];
            if (Array.isArray(deals)) return deals;
        } catch {
            // Khôi phục dữ liệu mẫu nếu localStorage bị hỏng.
        }
    }
    const deals = mockDeals.map((deal) => ({ ...deal }));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(deals));
    return deals;
}

function writeDeals(deals: Deal[]) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(deals));
}

export const dealMockApi = {
    getDeals: async (page = 0, size = 10, search = "", stage: DealStage | "" = "") => {
        await wait();
        const keyword = search.trim().toLocaleLowerCase("vi");
        const filtered = readDeals()
            .filter((deal) => !stage || deal.stage === stage)
            .filter((deal) => !keyword || [deal.name, deal.customerName, deal.ownerName].filter(Boolean).some((value) => value!.toLocaleLowerCase("vi").includes(keyword)))
            .sort((first, second) => new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime());
        const safePage = Math.max(0, page);
        const safeSize = Math.max(1, size);
        const totalElements = filtered.length;
        return {
            content: filtered.slice(safePage * safeSize, (safePage + 1) * safeSize).map((deal) => ({ ...deal })),
            page: safePage,
            size: safeSize,
            totalElements,
            totalPages: totalElements === 0 ? 0 : Math.ceil(totalElements / safeSize),
        };
    },
    getAllDeals: async () => {
        await wait();
        return readDeals().map((deal) => ({ ...deal }));
    },
    getDealById: async (id: number) => {
        await wait();
        const deal = readDeals().find((item) => item.id === id);
        if (!deal) throw new Error("Không tìm thấy Deal.");
        return { ...deal };
    },
    createDeal: async (data: DealPayload, customerName: string) => {
        await wait();
        const deals = readDeals();
        const deal: Deal = { ...data, customerName, id: deals.reduce((largest, item) => Math.max(largest, item.id), 0) + 1, createdAt: new Date().toISOString() };
        writeDeals([...deals, deal]);
        return { ...deal };
    },
    updateDeal: async (id: number, data: DealPayload, customerName: string) => {
        await wait();
        const deals = readDeals();
        const index = deals.findIndex((item) => item.id === id);
        if (index === -1) throw new Error("Không tìm thấy Deal.");
        const updated: Deal = { ...deals[index], ...data, id, customerName };
        deals[index] = updated;
        writeDeals(deals);
        return { ...updated };
    },
    deleteDeal: async (id: number) => {
        await wait();
        const deals = readDeals();
        if (!deals.some((item) => item.id === id)) throw new Error("Không tìm thấy Deal.");
        writeDeals(deals.filter((item) => item.id !== id));
    },
    updateDealStage: async (id: number, stage: DealStage) => {
        await wait();
        const deals = readDeals();
        const index = deals.findIndex((item) => item.id === id);
        if (index === -1) throw new Error("Không tìm thấy Deal.");
        deals[index] = { ...deals[index], stage };
        writeDeals(deals);
        return { ...deals[index] };
    },
};
