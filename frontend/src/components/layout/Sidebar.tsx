import {
    BarChart3,
    BriefcaseBusiness,
    CircleHelp,
    LayoutDashboard,
    PanelLeftClose,
    PanelLeftOpen,
    Settings,
    TicketCheck,
    UserRound,
    Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { NavLink } from "react-router-dom";

import { useAuthStore } from "../../stores/authStore";
import type { UserRole } from "../../types/auth";

interface SidebarProps {
    collapsed: boolean;
    onToggle: () => void;
    onNavigate?: () => void;
    mobile?: boolean;
}

interface NavigationItem {
    label: string;
    icon: LucideIcon;
    path: string;
    roles: readonly UserRole[];
}

interface NavigationGroup {
    label: string;
    items: NavigationItem[];
}

const ALL_ROLES: readonly UserRole[] = ["ADMIN", "SALES", "SUPPORT"];

const navigationGroups: NavigationGroup[] = [
    {
        label: "Tổng quan",
        items: [
            { label: "Trang chủ", icon: LayoutDashboard, path: "/dashboard", roles: ALL_ROLES },
        ],
    },
    {
        label: "Kinh doanh",
        items: [
            { label: "Lead", icon: UserRound, path: "/leads", roles: ["ADMIN", "SALES"] },
            { label: "Khách hàng", icon: Users, path: "/customers", roles: ALL_ROLES },
            { label: "Cơ hội", icon: BriefcaseBusiness, path: "/deals", roles: ["ADMIN", "SALES"] },
        ],
    },
    {
        label: "Vận hành",
        items: [
            { label: "Hỗ trợ", icon: TicketCheck, path: "/support", roles: ["ADMIN", "SUPPORT"] },
            { label: "Phân tích", icon: BarChart3, path: "/analytics", roles: ["ADMIN", "SALES"] },
        ],
    },
];

const settingsNavigation: NavigationItem = {
    label: "Cài đặt",
    icon: Settings,
    path: "/settings",
    roles: ["ADMIN"],
};

export default function Sidebar({ collapsed, onToggle, onNavigate, mobile = false }: SidebarProps) {
    const role = useAuthStore((state) => state.user?.role);
    const visibleGroups = navigationGroups
        .map((group) => ({
            ...group,
            items: group.items.filter((item) => Boolean(role && item.roles?.includes(role))),
        }))
        .filter((group) => group.items.length > 0);

    return (
        <aside className={`crm-sidebar ${collapsed ? "is-collapsed" : ""} ${mobile ? "is-open" : ""}`} aria-label="Điều hướng chính">
            <div className="crm-sidebar__brand">
                <span className="crm-sidebar__brand-mark" aria-hidden="true"><LayoutDashboard size={18} /></span>
                {!collapsed && <span>CRM</span>}
            </div>
            <nav className="crm-sidebar__navigation crm-scrollbar">
                {visibleGroups.map((group) => (
                    <div key={group.label} className="crm-sidebar__section">
                        {!collapsed && <p className="crm-sidebar__label">{group.label}</p>}
                        <div className="crm-nav">
                            {group.items.map((item) => {
                                const Icon = item.icon;
                                return (
                                    <NavLink key={item.path} to={item.path} onClick={onNavigate}
                                        title={collapsed ? item.label : undefined} aria-label={collapsed ? item.label : undefined}
                                        className={({ isActive }) => `crm-nav-item ${isActive ? "is-active" : ""}`}>
                                        <Icon size={18} className="crm-nav-item__icon" />
                                        {!collapsed && <span>{item.label}</span>}
                                    </NavLink>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </nav>
            <div className="crm-sidebar__footer crm-nav">
                {role && settingsNavigation.roles.includes(role) && (
                    <NavLink to={settingsNavigation.path} onClick={onNavigate}
                        title={collapsed ? settingsNavigation.label : undefined} aria-label={collapsed ? settingsNavigation.label : undefined}
                        className={({ isActive }) => `crm-nav-item ${isActive ? "is-active" : ""}`}>
                        <Settings size={18} className="crm-nav-item__icon" />
                        {!collapsed && <span>{settingsNavigation.label}</span>}
                    </NavLink>
                )}
                <button type="button" title="Trợ giúp" aria-label="Trợ giúp" className="crm-nav-item">
                    <CircleHelp size={18} className="crm-nav-item__icon" />
                    {!collapsed && <span>Trợ giúp</span>}
                </button>
                <button type="button" onClick={onToggle} className="crm-nav-item"
                    aria-label={mobile ? "Đóng thanh bên" : collapsed ? "Mở rộng thanh bên" : "Thu gọn thanh bên"}>
                    {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
                    {!collapsed && <span>{mobile ? "Đóng thanh bên" : "Thu gọn thanh bên"}</span>}
                </button>
            </div>
        </aside>
    );
}
