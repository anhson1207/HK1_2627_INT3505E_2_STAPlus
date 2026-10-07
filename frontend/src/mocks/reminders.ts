import type { FollowUpReminder } from "../types/reminder";

const day = 24 * 60 * 60 * 1000;
function relativeDate(daysFromNow: number, hour: number): string {
    const date = new Date(Date.now() + daysFromNow * day);
    date.setHours(hour, 0, 0, 0);
    return date.toISOString();
}

const createdAt = relativeDate(-4, 9);
export const mockReminders: FollowUpReminder[] = [
    { id: 1, title: "Gọi lại Lead Nguyễn Văn An", description: "Trao đổi về báo giá CRM", dueAt: relativeDate(1, 9), status: "PENDING", entityType: "LEAD", entityId: 1, entityName: "Nguyễn Văn An", ownerName: "Sơn", createdAt },
    { id: 2, title: "Gửi demo cho khách hàng", dueAt: relativeDate(2, 10), status: "PENDING", entityType: "CUSTOMER", entityId: 1, entityName: "Nguyễn Minh Anh", ownerName: "Trúc", createdAt },
    { id: 3, title: "Chốt báo giá Website Upgrade", dueAt: relativeDate(3, 14), status: "PENDING", entityType: "DEAL", entityId: 2, entityName: "Website Upgrade", ownerName: "Trúc", createdAt },
    { id: 4, title: "Trao đổi yêu cầu tích hợp", dueAt: relativeDate(5, 11), status: "PENDING", entityType: "DEAL", entityId: 1, entityName: "CRM Implementation", ownerName: "Sơn", createdAt },
    { id: 5, title: "Gửi tài liệu sản phẩm", dueAt: relativeDate(0, 17), status: "PENDING", entityType: "LEAD", entityId: 2, entityName: "Trần Thị Lan", ownerName: "Sơn", createdAt },
    { id: 6, title: "Kiểm tra tiến độ triển khai", dueAt: relativeDate(7, 9), status: "PENDING", entityType: "CUSTOMER", entityId: 3, entityName: "Lê Thu Hà", ownerName: "Hải Anh", createdAt },
    { id: 7, title: "Liên hệ khách hàng Trần Quốc Bảo", dueAt: relativeDate(-1, 9), status: "PENDING", entityType: "CUSTOMER", entityId: 2, entityName: "Trần Quốc Bảo", ownerName: "Sơn", createdAt },
    { id: 8, title: "Gọi lại về đề xuất ERP", dueAt: relativeDate(-2, 15), status: "PENDING", entityType: "DEAL", entityId: 6, entityName: "ERP Integration", ownerName: "Hải Anh", createdAt },
    { id: 9, title: "Xác nhận lịch gặp Lead", dueAt: relativeDate(-3, 10), status: "PENDING", entityType: "LEAD", entityId: 3, entityName: "Phạm Minh Đức", ownerName: "Trúc", createdAt },
    { id: 10, title: "Gửi hợp đồng thử nghiệm", dueAt: relativeDate(-4, 11), status: "COMPLETED", entityType: "CUSTOMER", entityId: 4, entityName: "Phạm Hoàng Nam", ownerName: "Sơn", createdAt },
    { id: 11, title: "Tư vấn giải pháp Cloud", dueAt: relativeDate(-5, 14), status: "COMPLETED", entityType: "DEAL", entityId: 3, entityName: "Cloud Migration", ownerName: "Hải Anh", createdAt },
    { id: 12, title: "Gọi xác nhận nhu cầu", dueAt: relativeDate(-6, 9), status: "COMPLETED", entityType: "LEAD", entityId: 1, entityName: "Nguyễn Văn An", ownerName: "Trúc", createdAt },
];
