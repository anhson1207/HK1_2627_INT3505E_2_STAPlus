import { Button } from "@mui/material";
import { Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";

import AdminDashboard from "../../components/dashboard/AdminDashboard";
import SalesDashboard from "../../components/dashboard/SalesDashboard";
import SupportDashboard from "../../components/dashboard/SupportDashboard";
import { useAuthStore } from "../../stores/authStore";

export default function DashboardPage() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const role = user?.role;
  const logout = useAuthStore((state) => state.logout);

  if (role === "UNASSIGNED") {
    return (
      <div className="mx-auto my-12 max-w-xl rounded-xl border border-(--crm-border) bg-white dark:bg-(--crm-surface) p-8 text-center shadow-xs">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-950/40 text-amber-600">
          <Clock size={32} />
        </div>
        <h2 className="mb-2 text-xl font-bold text-gray-800 dark:text-gray-100">Tài khoản đang chờ phân quyền</h2>
        <p className="mb-4 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
          Tài khoản <strong>{user?.username}</strong> đã được ghi nhận trong hệ thống nhưng đang ở trạng thái <strong>Chờ duyệt (PENDING)</strong> và chưa được cấp quyền (<strong>Chưa phân quyền - UNASSIGNED</strong>).
        </p>
        <div className="mb-6 rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/20 p-4 text-left text-xs text-amber-900 dark:text-amber-200">
          <p className="mb-1 font-semibold">👑 Quy trình duyệt tài khoản của Admin:</p>
          <ol className="list-decimal space-y-1 pl-4">
            <li>Đăng nhập bằng tài khoản <strong>Admin</strong>.</li>
            <li>Vào mục <strong>Cài đặt ➔ Quản lý người dùng</strong> (<code>/settings/users</code>).</li>
            <li>Tìm tài khoản <strong>{user?.username}</strong> và bấm nút <strong>Duyệt tài khoản / Sửa</strong> để chọn vai trò (<strong>Sales</strong> hoặc <strong>Support</strong>) và kích hoạt hoạt động.</li>
          </ol>
        </div>
        <div className="flex justify-center gap-3">
          <Button variant="outlined" color="inherit" onClick={() => logout()}>
            Đăng xuất
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              logout();
              navigate("/login");
            }}
          >
            Đăng nhập tài khoản khác
          </Button>
        </div>
      </div>
    );
  }

  // 1. Role SALES: Dedicated workspace focused on assigned leads, customers, deals, and reminders
  if (role === "SALES") {
    return <SalesDashboard user={user} />;
  }

  // 2. Role SUPPORT: Dedicated workspace focused on tickets, SLA deadlines, customer support, and CSAT
  if (role === "SUPPORT") {
    return <SupportDashboard user={user} />;
  }

  // 3. Role ADMIN / MANAGER: Executive company-wide analytics dashboard
  return <AdminDashboard user={user} />;
}
