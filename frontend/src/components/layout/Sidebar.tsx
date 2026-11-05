import {
    BarChart3,
    BriefcaseBusiness,
    LayoutDashboard,
    MessageSquare,
    PanelLeftClose,
    PanelLeftOpen,
    Settings,
    TicketCheck,
    UserRound,
    Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Link, NavLink, useLocation } from "react-router-dom";

import { useAuthStore } from "../../stores/authStore";
import { useChatStore } from "../../stores/chatStore";
import { rolesWithPermission } from "../../config/rolePermissions";
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

const navigationGroups: NavigationGroup[] = [
    {
        label: "Tổng quan",
        items: [
            { label: "Trang chủ", icon: LayoutDashboard, path: "/dashboard", roles: rolesWithPermission("dashboard") },
            { label: "Trò chuyện", icon: MessageSquare, path: "/chat", roles: rolesWithPermission("chat") },
        ],
    },
    {
        label: "Kinh doanh",
        items: [
            { label: "Lead", icon: UserRound, path: "/leads", roles: rolesWithPermission("leads") },
            { label: "Khách hàng", icon: Users, path: "/customers", roles: rolesWithPermission("customers") },
            { label: "Cơ hội", icon: BriefcaseBusiness, path: "/deals", roles: rolesWithPermission("deals") },
        ],
    },
    {
        label: "Vận hành",
        items: [
            { label: "Hỗ trợ", icon: TicketCheck, path: "/support", roles: rolesWithPermission("tickets") },
            { label: "Phân tích", icon: BarChart3, path: "/analytics", roles: rolesWithPermission("analytics") },
        ],
    },
];

const settingsNavigation: NavigationItem = {
    label: "Cài đặt & Phân quyền",
    icon: Settings,
    path: "/settings/users",
    roles: ["ADMIN"],
};

export default function Sidebar({ collapsed, onToggle, onNavigate, mobile = false }: SidebarProps) {
    const location = useLocation();
    const role = useAuthStore((state) => state.user?.role);
    const totalUnreadCount = useChatStore((state) => state.unreadSummary.totalUnreadCount);
    const visibleGroups = navigationGroups
        .map((group) => ({
            ...group,
            items: group.items.filter((item) => Boolean(role && item.roles?.includes(role))),
        }))
        .filter((group) => group.items.length > 0);

    const isItemActive = (path: string, isActive: boolean) => {
        if (isActive) return true;
        if (path === "/chat" && location.pathname.startsWith("/chat")) return true;
        if (path === "/support" && location.pathname.startsWith("/tickets")) return true;
        if (path === "/deals" && location.pathname.startsWith("/deals")) return true;
        if (path === "/leads" && location.pathname.startsWith("/leads")) return true;
        if (path === "/customers" && location.pathname.startsWith("/customers")) return true;
        if (path === "/settings/users" && location.pathname.startsWith("/settings")) return true;
        return false;
    };

    const isHome = location.pathname === "/dashboard" || location.pathname === "/" || location.pathname === "/dashboard/";

    const handleHomeClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
        onNavigate?.();
        if (isHome) {
            e.preventDefault();
            window.location.reload();
        }
    };

    const handleNavItemClick = (path: string) => (e: React.MouseEvent<HTMLAnchorElement>) => {
        onNavigate?.();
        if ((path === "/dashboard" || path === "/") && isHome) {
            e.preventDefault();
            window.location.reload();
        }
    };

    return (
        <aside className={`crm-sidebar ${collapsed ? "is-collapsed" : ""} ${mobile ? "is-open" : ""}`} aria-label="Điều hướng chính">
            <Link
                to="/dashboard"
                onClick={handleHomeClick}
                className="crm-sidebar__brand"
                title="Quay về trang chủ"
                aria-label="CRM - Quay về trang chủ"
            >
                <div className="crm-sidebar__brand-mark-wrap">
                    <span className="crm-sidebar__brand-mark" aria-hidden="true"><LayoutDashboard size={18} /></span>
                </div>
                <span className="crm-sidebar__brand-text">CRM</span>
            </Link>
            <nav className="crm-sidebar__navigation crm-scrollbar">
                {visibleGroups.map((group) => (
                    <div key={group.label} className="crm-sidebar__section">
                        <p className="crm-sidebar__label">{group.label}</p>
                        <div className="crm-nav">
                            {group.items.map((item) => {
                                const Icon = item.icon;
                                return (
                                    <NavLink key={item.path} to={item.path} onClick={handleNavItemClick(item.path)}
                                        title={item.label} aria-label={item.label}
                                        className={({ isActive }) => `crm-nav-item ${isItemActive(item.path, isActive) ? "is-active" : ""}`}>
                                        <span className="crm-nav-item__icon-wrap relative">
                                            <Icon size={18} className="crm-nav-item__icon" />
                                            {item.path === "/chat" && totalUnreadCount > 0 && collapsed && (
                                                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-(--crm-primary) ring-2 ring-slate-900" />
                                            )}
                                        </span>
                                        <span className="crm-nav-item__label flex items-center justify-between flex-1 pr-3">
                                            <span>{item.label}</span>
                                            {item.path === "/chat" && totalUnreadCount > 0 && (
                                                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-(--crm-primary) text-white leading-none shadow-2xs">
                                                    {totalUnreadCount > 99 ? "99+" : totalUnreadCount}
                                                </span>
                                            )}
                                        </span>
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
                        title={settingsNavigation.label} aria-label={settingsNavigation.label}
                        className={({ isActive }) => `crm-nav-item ${isItemActive(settingsNavigation.path, isActive) ? "is-active" : ""}`}>
                        <span className="crm-nav-item__icon-wrap">
                            <Settings size={18} className="crm-nav-item__icon" />
                        </span>
                        <span className="crm-nav-item__label">{settingsNavigation.label}</span>
                    </NavLink>
                )}
                <button type="button" onClick={onToggle} className="crm-nav-item crm-sidebar__toggle-btn"
                    title={mobile ? "Đóng thanh bên" : collapsed ? "Mở rộng thanh bên" : "Thu gọn thanh bên"}
                    aria-label={mobile ? "Đóng thanh bên" : collapsed ? "Mở rộng thanh bên" : "Thu gọn thanh bên"}>
                    <span className="crm-nav-item__icon-wrap">
                        {collapsed ? <PanelLeftOpen size={18} className="crm-nav-item__icon" /> : <PanelLeftClose size={18} className="crm-nav-item__icon" />}
                    </span>
                    <span className="crm-nav-item__label">{mobile ? "Đóng thanh bên" : "Thu gọn thanh bên"}</span>
                </button>
            </div>
        </aside>
    );
}
