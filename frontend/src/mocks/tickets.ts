import type { Ticket, TicketPayload, TicketPriority, TicketStatus } from "../types/ticket";

const STORAGE_KEY = "crm-soa.tickets";
const MOCK_DELAY_MS = 350;

export const mockTickets: Ticket[] = [
    { id: 101, subject: "Không đăng nhập được", description: "Khách hàng báo lỗi khi đăng nhập hệ thống.", customerId: 1, customerName: "Nguyễn Minh Anh", priority: "HIGH", status: "OPEN", assignedTo: "Trúc", createdAt: "2026-09-15T08:00:00", updatedAt: "2026-09-15T09:00:00" },
    { id: 102, subject: "Cần hỗ trợ xuất báo cáo", description: "Không tìm thấy chức năng xuất báo cáo doanh thu.", customerId: 2, customerName: "Trần Quốc Bảo", priority: "MEDIUM", status: "IN_PROGRESS", assignedTo: "Hải Anh", createdAt: "2026-09-14T11:30:00", updatedAt: "2026-09-15T08:20:00" },
    { id: 103, subject: "Dữ liệu đồng bộ bị thiếu", description: "Một số khách hàng chưa được đồng bộ từ hệ thống cũ.", customerId: 3, customerName: "Lê Thu Hà", priority: "URGENT", status: "OPEN", assignedTo: "Support Agent 1", createdAt: "2026-09-14T09:15:00" },
    { id: 104, subject: "Cấu hình email thành công", description: "Đã hỗ trợ cấu hình email gửi thông báo.", customerId: 4, customerName: "Phạm Hoàng Nam", priority: "LOW", status: "RESOLVED", assignedTo: "Trúc", createdAt: "2026-09-13T15:40:00", updatedAt: "2026-09-14T10:00:00" },
    { id: 105, subject: "Yêu cầu khóa tài khoản cũ", description: "Khách hàng yêu cầu khóa tài khoản nhân viên đã nghỉ việc.", customerId: 5, customerName: "Vũ Ngọc Linh", priority: "MEDIUM", status: "CLOSED", assignedTo: "Hải Anh", createdAt: "2026-09-12T13:20:00", updatedAt: "2026-09-13T09:00:00" },
    { id: 106, subject: "Trang dashboard tải chậm", description: "Dashboard mất hơn 15 giây để hiển thị.", customerId: 6, customerName: "Đặng Tuấn Kiệt", priority: "HIGH", status: "IN_PROGRESS", assignedTo: "Support Agent 1", createdAt: "2026-09-12T08:10:00" },
    { id: 107, subject: "Không tạo được Deal", description: "Nút lưu Deal không phản hồi trên trình duyệt.", customerId: 7, customerName: "Bùi Thanh Thảo", priority: "URGENT", status: "OPEN", assignedTo: "Trúc", createdAt: "2026-09-11T16:25:00" },
    { id: 108, subject: "Cập nhật thông tin công ty", description: "Đã hỗ trợ cập nhật tên và địa chỉ công ty.", customerId: 8, customerName: "Đỗ Đức Long", priority: "LOW", status: "RESOLVED", assignedTo: "Hải Anh", createdAt: "2026-09-10T10:45:00", updatedAt: "2026-09-11T08:30:00" },
    { id: 109, subject: "Phân quyền chưa chính xác", description: "User SALES đang nhìn thấy menu dành cho ADMIN.", customerId: 9, customerName: "Hồ Khánh Vy", priority: "HIGH", status: "IN_PROGRESS", assignedTo: "Support Agent 1", createdAt: "2026-09-09T14:00:00" },
    { id: 110, subject: "Hướng dẫn nhập dữ liệu", description: "Cần hướng dẫn import danh sách khách hàng từ CSV.", customerId: 10, customerName: "Ngô Quang Huy", priority: "MEDIUM", status: "CLOSED", assignedTo: "Trúc", createdAt: "2026-09-08T09:35:00", updatedAt: "2026-09-09T11:00:00" },
    { id: 111, subject: "Lỗi hiển thị trên mobile", description: "Bảng khách hàng bị tràn trên màn hình nhỏ.", customerId: 11, customerName: "Dương Mai Chi", priority: "URGENT", status: "OPEN", assignedTo: "Hải Anh", createdAt: "2026-09-07T17:10:00" },
    { id: 112, subject: "Đổi người phụ trách", description: "Đã chuyển owner của nhóm Lead theo yêu cầu.", customerId: 12, customerName: "Mai Gia Hân", priority: "LOW", status: "RESOLVED", assignedTo: "Support Agent 1", createdAt: "2026-09-06T12:30:00", updatedAt: "2026-09-07T08:00:00" },
    { id: 113, subject: "Không nhận được thông báo", description: "Thông báo hoạt động mới không xuất hiện.", customerId: 1, customerName: "Nguyễn Minh Anh", priority: "MEDIUM", status: "IN_PROGRESS", assignedTo: "Trúc", createdAt: "2026-09-05T10:20:00" },
    { id: 114, subject: "Yêu cầu xóa dữ liệu test", description: "Đã xóa các bản ghi thử nghiệm khỏi tài khoản.", customerId: 2, customerName: "Trần Quốc Bảo", priority: "LOW", status: "CLOSED", assignedTo: "Hải Anh", createdAt: "2026-09-04T15:50:00", updatedAt: "2026-09-05T09:10:00" },
    { id: 115, subject: "Lỗi tính tổng pipeline", description: "Weighted value hiển thị không đúng sau khi đổi stage.", customerId: 3, customerName: "Lê Thu Hà", priority: "URGENT", status: "RESOLVED", assignedTo: "Support Agent 1", createdAt: "2026-09-03T11:15:00", updatedAt: "2026-09-04T14:00:00" },
    { id: 116, subject: "Đóng workspace cũ", description: "Hoàn tất yêu cầu đóng workspace không còn sử dụng.", customerId: 4, customerName: "Phạm Hoàng Nam", priority: "HIGH", status: "CLOSED", assignedTo: "Trúc", createdAt: "2026-09-02T08:45:00", updatedAt: "2026-09-03T10:00:00" },
];

function wait() { return new Promise<void>((resolve) => window.setTimeout(resolve, MOCK_DELAY_MS)); }
function readTickets(): Ticket[] {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
        try { const tickets = JSON.parse(stored) as Ticket[]; if (Array.isArray(tickets)) return tickets; }
        catch { /* Khôi phục seed data bên dưới. */ }
    }
    const tickets = mockTickets.map((ticket) => ({ ...ticket }));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tickets));
    return tickets;
}
function writeTickets(tickets: Ticket[]) { localStorage.setItem(STORAGE_KEY, JSON.stringify(tickets)); }

export const ticketMockApi = {
    getTickets: async (page = 0, size = 10, search = "", status: TicketStatus | "" = "", priority: TicketPriority | "" = "") => {
        await wait();
        const keyword = search.trim().toLocaleLowerCase("vi");
        const filtered = readTickets()
            .filter((ticket) => !status || ticket.status === status)
            .filter((ticket) => !priority || ticket.priority === priority)
            .filter((ticket) => !keyword || [ticket.subject, ticket.customerName, ticket.assignedTo].filter(Boolean).some((value) => value!.toLocaleLowerCase("vi").includes(keyword)))
            .sort((first, second) => new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime());
        const safePage = Math.max(0, page);
        const safeSize = Math.max(1, size);
        const totalElements = filtered.length;
        return { content: filtered.slice(safePage * safeSize, (safePage + 1) * safeSize).map((ticket) => ({ ...ticket })), page: safePage, size: safeSize, totalElements, totalPages: totalElements === 0 ? 0 : Math.ceil(totalElements / safeSize) };
    },
    getTicketById: async (id: number) => { await wait(); const ticket = readTickets().find((item) => item.id === id); if (!ticket) throw new Error("Không tìm thấy Ticket."); return { ...ticket }; },
    getTicketsByCustomerId: async (customerId: number) => { await wait(); return readTickets().filter((ticket) => ticket.customerId === customerId).map((ticket) => ({ ...ticket })); },
    createTicket: async (data: TicketPayload, customerName: string) => { await wait(); const tickets = readTickets(); const now = new Date().toISOString(); const ticket: Ticket = { ...data, customerName, id: tickets.reduce((largest, item) => Math.max(largest, item.id), 100) + 1, createdAt: now, updatedAt: now }; writeTickets([...tickets, ticket]); return { ...ticket }; },
    updateTicket: async (id: number, data: TicketPayload, customerName: string) => { await wait(); const tickets = readTickets(); const index = tickets.findIndex((item) => item.id === id); if (index === -1) throw new Error("Không tìm thấy Ticket."); const updated: Ticket = { ...tickets[index], ...data, id, customerName, updatedAt: new Date().toISOString() }; tickets[index] = updated; writeTickets(tickets); return { ...updated }; },
    deleteTicket: async (id: number) => { await wait(); const tickets = readTickets(); if (!tickets.some((item) => item.id === id)) throw new Error("Không tìm thấy Ticket."); writeTickets(tickets.filter((item) => item.id !== id)); },
    updateTicketStatus: async (id: number, status: TicketStatus) => { await wait(); const tickets = readTickets(); const index = tickets.findIndex((item) => item.id === id); if (index === -1) throw new Error("Không tìm thấy Ticket."); tickets[index] = { ...tickets[index], status, updatedAt: new Date().toISOString() }; writeTickets(tickets); return { ...tickets[index] }; },
    assignTicket: async (id: number, assignedTo: string) => { await wait(); const tickets = readTickets(); const index = tickets.findIndex((item) => item.id === id); if (index === -1) throw new Error("Không tìm thấy Ticket."); tickets[index] = { ...tickets[index], assignedTo, updatedAt: new Date().toISOString() }; writeTickets(tickets); return { ...tickets[index] }; },
};
