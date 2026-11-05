# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Người dùng trọng tâm (Primary):** Đội ngũ Kinh doanh bao gồm Nhân viên kinh doanh (Sales Reps) và Trưởng nhóm kinh doanh (Sales Managers) tại các doanh nghiệp B2B. Tình huống công việc: tiếp nhận khách hàng tiềm năng mới mỗi ngày, liên hệ, đánh giá phân loại, theo dõi phễu bán hàng, chuyển đổi lead thành khách hàng chính thức và chốt deal.
- **Người dùng phụ trợ (Secondary):** 
  - Nhân viên Hỗ trợ (Support Agents): Tiếp nhận và xử lý các ticket, khiếu nại, yêu cầu hỗ trợ sau bán hàng.
  - Quản trị viên (Admins) & Cấp quản lý: Quản lý người dùng, phân quyền vai trò (RBAC), theo dõi tổng quan KPI và sức khỏe kinh doanh.

## Product Purpose

Cung cấp nền tảng CRM B2B tinh gọn, tốc độ cao và đáng tin cậy. Sản phẩm loại bỏ sự cồng kềnh, phức tạp của các bộ phần mềm CRM truyền thống, chuẩn hóa toàn bộ vòng đời kinh doanh từ lúc phát sinh Lead -> Chuyển đổi thành Khách hàng -> Quản lý Deal thành công, giúp đội ngũ kinh doanh tiết kiệm thời gian và tập trung tối đa vào mục tiêu doanh số.

## Positioning

CRM B2B tinh gọn, thao tác trực quan nhanh chóng dành cho doanh nghiệp trong nước. Khác biệt với các hệ thống đồ sộ nhiều tầng nấc, sản phẩm tập trung vào luồng tác nghiệp thực chiến: xem nhanh, tìm kiếm tức thì với phím tắt, cập nhật trạng thái tức thời chỉ với một cú nhấp chuột, vận hành bền bỉ trên kiến trúc Service-Oriented Architecture (SOA / Microservices) độc lập và mở rộng cao.

## Operating Context

- **Môi trường sử dụng:** Máy tính để bàn và Laptop tại văn phòng (Desktop Web), chạy trên các trình duyệt hiện đại (Chrome, Edge, Safari, Firefox).
- **Quy trình thường nhật:** Được mở liên tục trong toàn bộ ca làm việc. Người dùng thường xuyên chuyển đổi giữa danh sách Lead, chi tiết Khách hàng, đường ống Deal và danh mục Hỗ trợ.
- **Tương tác cốt lõi:** Chuột và bàn phím. Hỗ trợ tìm kiếm nhanh toàn hệ thống qua phím tắt (`Cmd + K` / `Ctrl + K`), cuộn và quét dữ liệu trên bảng biểu bảng lớn với độ phản hồi tức thì.

## Capabilities and Constraints

- **Chức năng đã xác nhận:**
  - Xác thực người dùng, bảo mật JWT, xác minh email, khôi phục mật khẩu.
  - Phân quyền theo vai trò (RBAC): `ADMIN`, `SALES`, `SUPPORT`, `MANAGER`, `UNASSIGNED`.
  - Quản lý Lead: Thêm mới, chỉnh sửa, phân loại nguồn/trạng thái, phân công nhân sự phụ trách.
  - Quản lý Khách hàng (Customers): Danh bạ doanh nghiệp, người liên hệ, liên kết giao dịch và hồ sơ chi tiết.
  - Quản lý Cơ hội bán hàng (Deals) & Hỗ trợ kỹ thuật (Tickets).
  - Bảng điều khiển phân tích số liệu (Dashboard & KPI Analytics) cập nhật theo thời gian thực.
- **Ràng buộc kỹ thuật:**
  - Frontend: React 19, TypeScript, Vite, Tailwind CSS v4, Material UI (MUI).
  - Backend: Kiến trúc Microservices (Spring Boot 3, Java 21, Spring Cloud Gateway tại Port 8080, cơ sở dữ liệu PostgreSQL cho từng service).
  - Ngôn ngữ giao diện: Tiếng Việt chuẩn mực cho môi trường doanh nghiệp.

## Brand Commitments

- **Tên thương hiệu sản phẩm:** Duy nhất là **"CRM"** (ràng buộc bền vững; không sử dụng tiền tố hoặc tên gọi tạm thời như "Nova CRM" hay các biến thể khác).
- **Định hướng phong cách:** Modern Minimalist, Premium SaaS, Clean Enterprise UI (tương đồng với Attio, Linear, Stripe). Tuyệt đối tránh phong cách template AI đại trà (gradient xanh tím rực rỡ, card nhiều màu, tương phản sidebar gắt gao).

## Evidence on Hand

- Mã nguồn hoàn chỉnh và các microservices đang hoạt động tại cổng API Gateway `8080`.
- Bộ dữ liệu mẫu thực tế và tài khoản thử nghiệm phục vụ kiểm thử: `admin@crm.local`, `sales`, `support`.
- Bộ kiểm thử tự động tích hợp E2E: `frontend/tests/fe1_integration.spec.ts` kiểm thử toàn bộ chu trình CRUD thực trên backend.
- Ảnh chụp màn hình chuẩn hoá giao diện: `theme_dashboard.png`, `theme_leads.png`, `theme_customers.png`.

## Product Principles

1. **Thao tác trực diện, giảm thiểu số bước:** Mọi thao tác cập nhật trạng thái, tìm kiếm, gán quyền của Sales Rep phải thực hiện được ngay trên danh sách hoặc trong 1 bước duy nhất.
2. **Ưu tiên sự minh bạch của dữ liệu (Data-First Clarity):** Bảng dữ liệu và thông số là trung tâm. Sử dụng đường viền siêu mỏng (hairline), khoảng cách thoáng đãng và phân cấp chữ chuẩn mực thay vì các khối màu đặc gây nhiễu mắt.
3. **Độ tin cậy & Nhất quán doanh nghiệp:** Mọi dịch vụ thành phần (Leads, Customers, Deals, Tickets) đều tuân theo cùng một hệ thống Design Tokens thống nhất và cơ chế phân quyền an toàn.
4. **Phù hợp văn hóa kinh doanh B2B Việt Nam:** Sử dụng thuật ngữ chuyên môn rõ ràng, tôn trọng chuẩn mực giao tiếp trong doanh nghiệp.

