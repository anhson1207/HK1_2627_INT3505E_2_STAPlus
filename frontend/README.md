# 🖥️ STAPlus CRM - Frontend Application

<p align="center">
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react" alt="React 19" />
  <img src="https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Bundler-Vite-646CFF?style=for-the-badge&logo=vite" alt="Vite" />
  <img src="https://img.shields.io/badge/Styling-Tailwind%20CSS-38B2AC?style=for-the-badge&logo=tailwindcss" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/State-Zustand-443E39?style=for-the-badge" alt="Zustand" />
</p>

Ứng dụng Frontend của **STAPlus CRM** được xây dựng với **React 19**, **TypeScript** và **Vite**, áp dụng hệ thống thiết kế hiện đại lấy cảm hứng từ Monday.com CRM.

Tài liệu kiến trúc toàn diện và hướng dẫn khởi chạy toàn bộ hệ thống microservices vui lòng xem tại: 👉 [Tài liệu Tổng thể Dự án (Master README)](../README.md)

---

## 🌟 Điểm Nhấn Kiến Trúc Frontend

### 1. Phân quyền Giao diện Đa Vai trò (Role-Based Workspaces)
Hệ thống Router (`AppRoutes.tsx`) kết hợp với `RoleGuard` để tự động điều chỉnh toàn bộ trải nghiệm người dùng theo 3 vai trò:
- **Admin / Manager**: Truy cập đầy đủ các phân hệ quản trị, phê duyệt chiết khấu, phân bổ lead và xem báo cáo phân tích toàn diện (`AdminDashboard.tsx`).
- **Sales**: Bàn làm việc kinh doanh cá nhân (`SalesDashboard.tsx`), chỉ quản lý lead/khách hàng được giao, thao tác gọi điện, gửi mail, đặt lịch hẹn và chốt đơn Won. Toàn bộ mục phân tích chiến lược được ẩn khỏi Sidebar.
- **Support**: Bàn làm việc CSKH (`SupportDashboard.tsx`), quản lý hàng đợi ticket, theo dõi hạn chót SLA đếm ngược và thu thập điểm đánh giá CSAT 5 sao.

### 2. Thiết kế Giao diện Monday.com Inspired & Theme Linh hoạt
- Hệ thống CSS biến số chuẩn mực tại `src/styles/monday-inspired-crm.css`.
- Hỗ trợ chuyển đổi mượt mà giữa **Dark Mode** và **Light Mode** thông qua `themeStore`.
- Khu vực xác thực (Đăng nhập / Đăng ký) được cố định giao diện Light Mode thanh lịch, chuyên nghiệp theo tiêu chuẩn Enterprise.

### 3. Giao tiếp Thời gian thực (Real-time Capabilities)
- Tích hợp **WebSocket (STOMP Client)** tại module `src/components/chat/` hỗ trợ nhắn tin trực tiếp (1-1) và nhóm chat nội bộ thời gian thực.
- Trạng thái người dùng Online / Offline (Presence tracking) và thông báo nhắc việc tức thời.

---

## 🚀 Khởi Chạy Frontend Development

```bash
# Cài đặt các dependencies
npm install

# Khởi chạy server phát triển
npm run dev

# Kiểm tra kiểu dữ liệu và đóng gói bản phát hành
npm run build

# Xem trước bản dựng production
npm run preview
```

Server sẽ khởi chạy tại: `http://localhost:5173`

---

## 📁 Cấu Trúc Thư Mục Frontend

```text
src/
├── components/          # Các thành phần giao diện tái sử dụng
│   ├── analytics/       # Biểu đồ và bộ lọc phân tích
│   ├── chat/            # Trò chuyện nội bộ WebSocket (ChatWindow, MediaArchive...)
│   ├── common/          # Component dùng chung (StatusChip, PageHeader, Modal...)
│   ├── customers/       # Quản lý khách hàng 360°, tab Deals và Tickets
│   ├── dashboard/       # 3 Bàn làm việc chuyên biệt (Admin, Sales, Support)
│   ├── deals/           # Pipeline bán hàng, Kanban và duyệt chiết khấu
│   ├── layout/          # Header, Sidebar, AppLayout
│   ├── leads/           # Quản lý Lead, Form thu thập, Phân bổ & Chuyển đổi
│   └── tickets/         # Quản lý sự vụ hỗ trợ, SLA và CSAT
├── pages/               # Các trang màn hình chính của ứng dụng
├── routes/              # AppRoutes & RoleGuard kiểm soát quyền truy cập
├── services/            # Tầng API kết nối Gateway (Axios instances)
├── stores/              # Zustand state (authStore, chatStore, themeStore...)
├── styles/              # Monday-inspired CSS Design System
├── types/               # TypeScript interfaces & types định nghĩa dữ liệu
└── utils/               # Hàm tiện ích (format tiền tệ VND, ngày tháng, options...)
```
