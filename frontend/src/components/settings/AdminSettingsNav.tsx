import { Activity, ShieldCheck, Users } from "lucide-react";
import { NavLink } from "react-router-dom";

export default function AdminSettingsNav() {
    const tabs = [
        { label: "Người dùng", path: "/settings/users", icon: Users },
        { label: "Nhật ký hoạt động (Audit Log)", path: "/settings/audit-logs", icon: Activity },
        { label: "Vai trò & Phân quyền (RBAC)", path: "/settings/roles", icon: ShieldCheck },
    ];

    return (
        <div className="mb-6 border-b border-(--crm-border)">
            <nav className="flex space-x-6" aria-label="Tabs quản trị">
                {tabs.map(({ label, path, icon: Icon }) => (
                    <NavLink
                        key={path}
                        to={path}
                        className={({ isActive }) =>
                            `flex items-center gap-2 border-b-2 py-3 px-1 text-sm font-semibold transition ${
                                isActive
                                    ? "border-(--crm-primary) text-(--crm-primary)"
                                    : "border-transparent text-(--crm-text-secondary) hover:border-slate-300 hover:text-(--crm-heading)"
                            }`
                        }
                    >
                        <Icon size={18} />
                        <span>{label}</span>
                    </NavLink>
                ))}
            </nav>
        </div>
    );
}
