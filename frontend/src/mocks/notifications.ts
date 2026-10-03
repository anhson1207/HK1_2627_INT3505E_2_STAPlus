import type { Notification } from "../types/notification";

export const mockNotifications: Notification[] = [
    { id: 1, type: "FOLLOW_UP", title: "Follow-up sắp đến hạn", message: "Gọi lại Lead Nguyễn Văn An lúc 09:00 ngày mai.", read: false, createdAt: "2026-09-16T08:30:00", targetUrl: "/reminders" },
    { id: 2, type: "TICKET", title: "Ticket ưu tiên khẩn", message: "Ticket #103 cần được xử lý sớm.", read: false, createdAt: "2026-09-16T08:10:00", targetUrl: "/tickets/103" },
    { id: 3, type: "DEAL", title: "Deal chuyển giai đoạn", message: "CRM Implementation đã chuyển sang đàm phán.", read: false, createdAt: "2026-09-15T16:45:00", targetUrl: "/deals/1" },
    { id: 4, type: "FOLLOW_UP", title: "Follow-up quá hạn", message: "Liên hệ khách hàng Trần Quốc Bảo đã quá hạn.", read: false, createdAt: "2026-09-15T15:00:00", targetUrl: "/reminders" },
    { id: 5, type: "SYSTEM", title: "Chào mừng đến CRM", message: "Các tính năng Dashboard và Analytics đã sẵn sàng.", read: true, createdAt: "2026-09-15T09:00:00", targetUrl: "/dashboard" },
    { id: 6, type: "DEAL", title: "Deal đã thắng", message: "Logistics Dashboard đã được đánh dấu thành công.", read: true, createdAt: "2026-09-14T14:30:00", targetUrl: "/deals/5" },
    { id: 7, type: "TICKET", title: "Ticket đã giải quyết", message: "Ticket #104 đã được giải quyết.", read: true, createdAt: "2026-09-14T10:10:00", targetUrl: "/tickets/104" },
    { id: 8, type: "FOLLOW_UP", title: "Nhắc chăm sóc khách hàng", message: "Chuẩn bị cuộc gọi với Nguyễn Minh Anh.", read: true, createdAt: "2026-09-13T11:00:00", targetUrl: "/customers/1" },
    { id: 9, type: "SYSTEM", title: "Dữ liệu mẫu đã cập nhật", message: "Danh sách khách hàng mẫu đã được làm mới.", read: true, createdAt: "2026-09-12T08:00:00", targetUrl: "/customers" },
    { id: 10, type: "DEAL", title: "Deal mới", message: "Website Upgrade đã được tạo.", read: true, createdAt: "2026-09-11T13:00:00", targetUrl: "/deals/2" },
];
