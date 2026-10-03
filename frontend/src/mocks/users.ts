import type { CRMUser } from "../types/user";

export const mockUsers: CRMUser[] = [
    { id: 1, fullName: "Nguyễn Anh Sơn", email: "son@crm.com", phone: "0901234567", role: "ADMIN", status: "ACTIVE", department: "Điều hành", createdAt: "2026-01-08T09:00:00" },
    { id: 2, fullName: "Trần Minh Sales", email: "sales@crm.com", phone: "0902345678", role: "SALES", status: "ACTIVE", department: "Kinh doanh", createdAt: "2026-02-10T09:00:00" },
    { id: 3, fullName: "Lê Thu Support", email: "support@crm.com", phone: "0903456789", role: "SUPPORT", status: "ACTIVE", department: "Chăm sóc khách hàng", createdAt: "2026-02-18T09:00:00" },
    { id: 4, fullName: "Phạm Bảo Trúc", email: "truc@crm.com", phone: "0904567890", role: "SALES", status: "ACTIVE", department: "Kinh doanh", createdAt: "2026-03-04T09:00:00" },
    { id: 5, fullName: "Đỗ Hải Anh", email: "haianh@crm.com", phone: "0905678901", role: "SALES", status: "ACTIVE", department: "Kinh doanh", createdAt: "2026-03-22T09:00:00" },
    { id: 6, fullName: "Vũ Ngọc Linh", email: "linh@crm.com", role: "SUPPORT", status: "ACTIVE", department: "Chăm sóc khách hàng", createdAt: "2026-04-09T09:00:00" },
    { id: 7, fullName: "Bùi Hoàng Nam", email: "nam@crm.com", role: "SALES", status: "INACTIVE", department: "Kinh doanh", createdAt: "2026-04-16T09:00:00" },
    { id: 8, fullName: "Mai Thùy Dung", email: "dung@crm.com", role: "SUPPORT", status: "ACTIVE", department: "Chăm sóc khách hàng", createdAt: "2026-05-07T09:00:00" },
    { id: 9, fullName: "Ngô Quốc Huy", email: "huy@crm.com", role: "ADMIN", status: "ACTIVE", department: "Điều hành", createdAt: "2026-05-19T09:00:00" },
    { id: 10, fullName: "Đặng Thanh Hà", email: "thanhha@crm.com", role: "SALES", status: "INACTIVE", department: "Kinh doanh", createdAt: "2026-06-02T09:00:00" },
];
