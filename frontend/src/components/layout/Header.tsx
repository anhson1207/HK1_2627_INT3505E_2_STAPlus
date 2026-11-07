import { ListItemIcon, Menu, MenuItem } from "@mui/material";
import { Bell, ChevronDown, LogOut, Menu as MenuIcon, Moon, Search, Sun, UserRound } from "lucide-react";
import { useEffect, useRef, useState, type FormEvent, type MouseEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import RoleGuard from "../auth/RoleGuard";
import NotificationDropdown from "../notifications/NotificationDropdown";
import { rolesWithPermission } from "../../config/rolePermissions";
import { NOTIFICATIONS_CHANGED_EVENT, notificationService } from "../../services/notificationService";
import { useAuthStore } from "../../stores/authStore";
import { useThemeStore } from "../../stores/themeStore";
import type { UserRole } from "../../types/auth";

interface HeaderProps {
    onOpenSidebar: () => void;
    mobileOpen: boolean;
}

function getPageName(pathname: string) {
    if (pathname === "/dashboard") return "Tổng quan";
    if (pathname.startsWith("/notifications")) return "Thông báo";

    // Lead Routes
    if (pathname === "/leads/new") return "Lead / Thêm mới";
    if (/^\/leads\/\d+\/edit$/.test(pathname)) return "Lead / Chỉnh sửa";
    if (/^\/leads\/\d+$/.test(pathname)) return "Lead / Chi tiết";
    if (pathname.startsWith("/leads")) return "Lead";

    // Customer Routes
    if (pathname === "/customers/new") return "Khách hàng / Thêm mới";
    if (/^\/customers\/\d+\/edit$/.test(pathname)) return "Khách hàng / Chỉnh sửa";
    if (/^\/customers\/\d+$/.test(pathname)) return "Khách hàng / Chi tiết";
    if (pathname.startsWith("/customers")) return "Khách hàng";

    // Deal Routes
    if (pathname === "/deals/new") return "Cơ hội / Thêm mới";
    if (pathname === "/deals/kanban") return "Cơ hội / Kanban";
    if (/^\/deals\/\d+\/edit$/.test(pathname)) return "Cơ hội / Chỉnh sửa";
    if (/^\/deals\/\d+$/.test(pathname)) return "Cơ hội / Chi tiết";
    if (pathname.startsWith("/deals")) return "Cơ hội";

    // Ticket & Support Routes
    if (pathname === "/tickets/new") return "Ticket / Tạo mới";
    if (/^\/tickets\/[^/]+\/edit$/.test(pathname)) return "Ticket / Chỉnh sửa";
    if (/^\/tickets\/[^/]+$/.test(pathname)) return "Ticket / Chi tiết";
    if (pathname.startsWith("/tickets")) return "Ticket";
    if (pathname.startsWith("/support")) return "Hỗ trợ";

    if (pathname.startsWith("/analytics")) return "Phân tích";
    if (pathname === "/settings/users") return "Cài đặt / Người dùng";
    if (pathname.startsWith("/settings")) return "Cài đặt";
    if (pathname === "/profile") return "Hồ sơ cá nhân";
    return "CRM";
}

export default function Header({ onOpenSidebar, mobileOpen }: HeaderProps) {
    const navigate = useNavigate();
    const location = useLocation();
    const searchRef = useRef<HTMLInputElement>(null);
    const notifRef = useRef<HTMLDivElement>(null);
    const [search, setSearch] = useState("");
    const [userMenuAnchor, setUserMenuAnchor] = useState<HTMLElement | null>(null);
    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const { user, logout } = useAuthStore();
    const { mode, toggleTheme } = useThemeStore();
    const isDark = mode === "dark";

    useEffect(() => {
        let active = true;
        const updateUnread = async () => {
            try {
                const count = await notificationService.getUnreadCount();
                if (active) setUnreadCount(count);
            } catch {
                // Ignore count errors
            }
        };
        void updateUnread();
        window.addEventListener(NOTIFICATIONS_CHANGED_EVENT, updateUnread);
        return () => {
            active = false;
            window.removeEventListener(NOTIFICATIONS_CHANGED_EVENT, updateUnread);
        };
    }, []);

    useEffect(() => {
        if (!notificationsOpen) return;
        const handleClickOutside = (event: globalThis.MouseEvent) => {
            if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
                setNotificationsOpen(false);
            }
        };
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") setNotificationsOpen(false);
        };
        document.addEventListener("mousedown", handleClickOutside);
        document.addEventListener("keydown", handleKeyDown);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [notificationsOpen]);

    const roleLabels: Record<UserRole, string> = {
        ADMIN: "Quản trị viên",
        SALES: "Nhân viên kinh doanh",
        SUPPORT: "Nhân viên hỗ trợ",
        MANAGER: "Quản lý",
        UNASSIGNED: "Chưa phân quyền",
    };
    const avatarLabel = user?.username.charAt(0).toLocaleUpperCase("vi") ?? "U";

    const isSupportPage = location.pathname.startsWith("/support");
    const isCustomerPage = location.pathname.startsWith("/customers");

    useEffect(() => {
        const handleShortcut = (event: KeyboardEvent) => {
            if ((event.metaKey || event.ctrlKey) && event.key.toLocaleLowerCase() === "k") {
                event.preventDefault();
                searchRef.current?.focus();
            }
        };
        document.addEventListener("keydown", handleShortcut);
        return () => document.removeEventListener("keydown", handleShortcut);
    }, []);

    const handleSearch = (event: FormEvent) => {
        event.preventDefault();
        const keyword = search.trim();
        if (isCustomerPage) {
            navigate(keyword ? `/customers?search=${encodeURIComponent(keyword)}` : "/customers");
        } else if (isSupportPage) {
            navigate(keyword ? `/support?search=${encodeURIComponent(keyword)}` : "/support");
        } else {
            navigate(keyword ? `/leads?search=${encodeURIComponent(keyword)}` : "/leads");
        }
    };

    const handleOpenUserMenu = (event: MouseEvent<HTMLElement>) => {
        setUserMenuAnchor(event.currentTarget);
    };

    const handleLogout = () => {
        setUserMenuAnchor(null);
        logout();
        navigate("/login", { replace: true, state: { message: "Đăng xuất thành công" } });
    };

    return (
        <header
            className="crm-header"
        >
            <div className="crm-header__inner">
                <button type="button" className="crm-icon-btn crm-mobile-menu" onClick={onOpenSidebar} aria-label="Mở thanh điều hướng" aria-expanded={mobileOpen}><MenuIcon size={20} /></button>
                <div className="crm-header__workspace">
                    <p className="crm-caption">Không gian làm việc</p>
                    <p className="crm-header__title">{getPageName(location.pathname)}</p>
                </div>

                <RoleGuard allowedRoles={rolesWithPermission("leads")} fallback={<div className="mx-auto flex-1" />}>
                    <form onSubmit={handleSearch} className="crm-search crm-header__search">
                        <Search size={17} className="crm-search__icon" />
                        <input
                            ref={searchRef}
                            type="search"
                            aria-label={isCustomerPage ? "Tìm khách hàng" : isSupportPage ? "Tìm Ticket" : "Tìm Lead"}
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder={isCustomerPage ? "Tìm khách hàng theo tên, email, SĐT..." : isSupportPage ? "Tìm Ticket theo tiêu đề, mã..." : "Tìm Lead theo tên, email, số điện thoại..."}
                        />
                        <kbd className="crm-search__kbd" title="Nhấn ⌘K hoặc Ctrl+K để tìm kiếm">⌘K</kbd>
                    </form>
                </RoleGuard>

                <div className="crm-header__right">
                    <button
                        type="button"
                        onClick={toggleTheme}
                        title={isDark ? "Chuyển sang giao diện Sáng" : "Chuyển sang giao diện Tối"}
                        aria-label={isDark ? "Chuyển sang giao diện Sáng" : "Chuyển sang giao diện Tối"}
                        className="crm-icon-btn text-(--crm-text-secondary) hover:text-(--crm-heading) transition-colors"
                    >
                        {isDark ? (
                            <Sun size={18} className="text-amber-400" />
                        ) : (
                            <Moon size={18} className="text-slate-600" />
                        )}
                    </button>

                    <div ref={notifRef} className="relative">
                        <button
                            type="button"
                            title="Thông báo"
                            aria-label={unreadCount > 0 ? `Thông báo (${unreadCount} chưa đọc)` : "Thông báo"}
                            aria-expanded={notificationsOpen}
                            onClick={() => setNotificationsOpen((prev) => !prev)}
                            className={`crm-icon-btn relative transition-colors ${notificationsOpen ? "bg-(--crm-surface-hover) text-(--crm-primary)" : ""}`}
                        >
                            <Bell size={18} />
                            {unreadCount > 0 && (
                                <span className="crm-unread-dot" />
                            )}
                        </button>

                        <NotificationDropdown
                            open={notificationsOpen}
                            onClose={() => setNotificationsOpen(false)}
                        />
                    </div>

                    <button type="button" onClick={handleOpenUserMenu} aria-label="Mở menu người dùng" className="crm-header__user">
                        <div className="crm-avatar">
                            {avatarLabel}
                            <span className="crm-online-dot" />
                        </div>
                        <div className="crm-header__user-info">
                            <p className="crm-header__user-name">{user?.username ?? "Người dùng"}</p>
                            <p className="crm-caption">{user ? roleLabels[user.role] : ""}</p>
                        </div>
                        <ChevronDown size={14} className="crm-header__user-chevron" />
                    </button>
                </div>
            </div>

            <Menu anchorEl={userMenuAnchor} open={Boolean(userMenuAnchor)} onClose={() => setUserMenuAnchor(null)} anchorOrigin={{ vertical: "bottom", horizontal: "right" }} transformOrigin={{ vertical: "top", horizontal: "right" }}>
                <MenuItem 
                onClick={() => {
                        setUserMenuAnchor(null);
                        navigate("/profile");
                    }}
                >
                    <ListItemIcon><UserRound size={17} /></ListItemIcon>
                    {user?.username}
                </MenuItem>

                <MenuItem
                    onClick={() => {
                        toggleTheme();
                    }}
                >
                    <ListItemIcon>
                        {isDark ? <Sun size={17} className="text-amber-400" /> : <Moon size={17} className="text-slate-600" />}
                    </ListItemIcon>
                    Giao diện: {isDark ? "Tối (Dark)" : "Sáng (Light)"}
                </MenuItem>

                <MenuItem onClick={() => void handleLogout()}>
                    <ListItemIcon><LogOut size={17} /></ListItemIcon>
                    Đăng xuất
                </MenuItem>
            </Menu>
        </header>
    );
}
