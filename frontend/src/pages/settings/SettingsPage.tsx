import { BellRing, Building2, LockKeyhole, ShieldCheck, UserRound, Users } from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";

import { canAccess, type CRMResource } from "../../config/rolePermissions";
import { useAuthStore } from "../../stores/authStore";

const sections: Array<{ label: string; path: string; resource: CRMResource; icon: typeof UserRound }> = [
    { label: "Hồ sơ", path: "/settings/profile", resource: "profile", icon: UserRound },
    { label: "Người dùng", path: "/settings/users", resource: "users", icon: Users },
    { label: "Vai trò & quyền", path: "/settings/roles", resource: "roles", icon: ShieldCheck },
    { label: "Cài đặt chung", path: "/settings/general", resource: "general", icon: Building2 },
    { label: "Thông báo", path: "/settings/notifications", resource: "notifications", icon: BellRing },
    { label: "Bảo mật", path: "/settings/security", resource: "security", icon: LockKeyhole },
];

export default function SettingsPage() {
    const role = useAuthStore((state) => state.user?.role);
    return <div><div className="mb-6"><h1 className="text-[22px] font-semibold text-slate-900">Settings</h1><p className="mt-1 text-sm text-slate-500">Quản lý tài khoản và cấu hình CRM</p></div><div className="grid grid-cols-1 gap-5 lg:grid-cols-[220px_minmax(0,1fr)]">
        <nav aria-label="Các mục cài đặt" className="flex gap-1 overflow-x-auto rounded-xl border border-slate-200 bg-white p-2 lg:flex-col lg:overflow-visible">{sections.filter((item) => canAccess(role, item.resource)).map(({ label, path, icon: Icon }) => <NavLink key={path} to={path} className={({ isActive }) => `flex shrink-0 items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition ${isActive ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-50"}`}><Icon size={17} />{label}</NavLink>)}</nav>
        <div className="min-w-0"><Outlet /></div>
    </div></div>;
}
