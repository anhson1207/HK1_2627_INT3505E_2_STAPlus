import type { Customer, CustomerPayload } from "../types/customer";

const STORAGE_KEY = "crm-soa.customers";
const MOCK_DELAY_MS = 250;

const seedCustomers: Customer[] = [
    { id: 1, name: "Nguyễn Minh Anh", email: "minhanh@anphat.vn", phone: "0901234567", company: "An Phát Technology", address: "Quận 1, TP. Hồ Chí Minh", status: "ACTIVE", ownerName: "Trần Hải", createdAt: "2026-09-12T08:30:00" },
    { id: 2, name: "Trần Quốc Bảo", email: "quocbao@vietlink.vn", phone: "0912345678", company: "VietLink", address: "Cầu Giấy, Hà Nội", status: "ACTIVE", ownerName: "Nguyễn Sơn", createdAt: "2026-09-11T10:15:00" },
    { id: 3, name: "Lê Thu Hà", email: "thuha@greentech.vn", phone: "0923456789", company: "GreenTech Việt Nam", address: "Hải Châu, Đà Nẵng", status: "INACTIVE", ownerName: "Phạm Trúc", createdAt: "2026-09-10T14:20:00" },
    { id: 4, name: "Phạm Hoàng Nam", email: "hoangnam@sunrise.vn", phone: "0934567890", company: "Sunrise Media", address: "Bình Thạnh, TP. Hồ Chí Minh", status: "ACTIVE", ownerName: "Trần Hải", createdAt: "2026-09-09T09:45:00" },
    { id: 5, name: "Vũ Ngọc Linh", email: "ngoclinh@bluewave.vn", phone: "0945678901", company: "BlueWave Logistics", status: "ACTIVE", ownerName: "Nguyễn Sơn", createdAt: "2026-09-08T11:00:00" },
    { id: 6, name: "Đặng Tuấn Kiệt", email: "tuankiet@novafoods.vn", phone: "0956789012", company: "Nova Foods", address: "Ninh Kiều, Cần Thơ", status: "INACTIVE", ownerName: "Phạm Trúc", createdAt: "2026-09-07T16:10:00" },
    { id: 7, name: "Bùi Thanh Thảo", email: "thanhthao@mekong.vn", phone: "0967890123", company: "Mekong Solutions", status: "ACTIVE", ownerName: "Trần Hải", createdAt: "2026-09-06T13:25:00" },
    { id: 8, name: "Đỗ Đức Long", email: "duclong@eaststar.vn", phone: "0978901234", company: "EastStar Trading", address: "Ngô Quyền, Hải Phòng", status: "ACTIVE", ownerName: "Nguyễn Sơn", createdAt: "2026-09-05T08:50:00" },
    { id: 9, name: "Hồ Khánh Vy", email: "khanhvy@cloudnine.vn", phone: "0989012345", company: "Cloud Nine", status: "INACTIVE", ownerName: "Phạm Trúc", createdAt: "2026-09-04T15:40:00" },
    { id: 10, name: "Ngô Quang Huy", email: "quanghuy@smartbiz.vn", phone: "0890123456", company: "SmartBiz", status: "ACTIVE", ownerName: "Trần Hải", createdAt: "2026-09-03T10:05:00" },
    { id: 11, name: "Dương Mai Chi", email: "maichi@lotus.vn", phone: "0881234567", company: "Lotus Design", address: "Đống Đa, Hà Nội", status: "ACTIVE", ownerName: "Nguyễn Sơn", createdAt: "2026-09-02T12:30:00" },
    { id: 12, name: "Mai Gia Hân", email: "giahan@oceanic.vn", phone: "0872345678", company: "Oceanic Services", status: "ACTIVE", ownerName: "Phạm Trúc", createdAt: "2026-09-01T09:10:00" },
];

function wait() {
    return new Promise<void>((resolve) => window.setTimeout(resolve, MOCK_DELAY_MS));
}

function cloneCustomers(customers: Customer[]) {
    return customers.map((customer) => ({ ...customer }));
}

function readCustomers(): Customer[] {
    const storedValue = localStorage.getItem(STORAGE_KEY);
    if (!storedValue) {
        const initialCustomers = cloneCustomers(seedCustomers);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(initialCustomers));
        return initialCustomers;
    }

    try {
        const customers = JSON.parse(storedValue) as Customer[];
        if (Array.isArray(customers)) return customers;
    } catch {
        // Khôi phục dữ liệu mẫu nếu localStorage bị hỏng.
    }

    const initialCustomers = cloneCustomers(seedCustomers);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialCustomers));
    return initialCustomers;
}

function writeCustomers(customers: Customer[]) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(customers));
}

export const customerMockApi = {
    getCustomers: async (page = 0, size = 10) => {
        await wait();
        const safePage = Math.max(0, page);
        const safeSize = Math.max(1, size);
        const customers = readCustomers().sort(
            (first, second) => new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime(),
        );
        const totalElements = customers.length;
        const totalPages = totalElements === 0 ? 0 : Math.ceil(totalElements / safeSize);
        const start = safePage * safeSize;

        return {
            content: cloneCustomers(customers.slice(start, start + safeSize)),
            page: safePage,
            size: safeSize,
            totalElements,
            totalPages,
        };
    },

    getCustomerById: async (id: number): Promise<Customer> => {
        await wait();
        const customer = readCustomers().find((item) => item.id === id);
        if (!customer) throw new Error("Không tìm thấy khách hàng.");
        return { ...customer };
    },

    createCustomer: async (data: CustomerPayload): Promise<Customer> => {
        await wait();
        const customers = readCustomers();
        const customer: Customer = {
            ...data,
            id: customers.reduce((largestId, item) => Math.max(largestId, item.id), 0) + 1,
            createdAt: new Date().toISOString(),
        };
        writeCustomers([...customers, customer]);
        return { ...customer };
    },

    updateCustomer: async (id: number, data: CustomerPayload): Promise<Customer> => {
        await wait();
        const customers = readCustomers();
        const customerIndex = customers.findIndex((item) => item.id === id);
        if (customerIndex === -1) throw new Error("Không tìm thấy khách hàng.");

        const updatedCustomer: Customer = {
            ...customers[customerIndex],
            ...data,
            id,
        };
        customers[customerIndex] = updatedCustomer;
        writeCustomers(customers);
        return { ...updatedCustomer };
    },

    deleteCustomer: async (id: number): Promise<void> => {
        await wait();
        const customers = readCustomers();
        if (!customers.some((item) => item.id === id)) throw new Error("Không tìm thấy khách hàng.");
        writeCustomers(customers.filter((item) => item.id !== id));
    },
};
