import { ListItemIcon, Menu, MenuItem } from "@mui/material";
import { Bell, CalendarDays, ChevronDown, CircleHelp, LogOut, Menu as MenuIcon, Search, UserRound } from "lucide-react";
import { useEffect, useRef, useState, type FormEvent, type MouseEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import RoleGuard from "../auth/RoleGuard";
import { rolesWithPermission } from "../../config/rolePermissions";
import { useAuthStore } from "../../stores/authStore";
import type { UserRole } from "../../types/auth";
import NotificationDropdown from "../notifications/NotificationDropdown";
import { NOTIFICATIONS_CHANGED_EVENT, notificationService } from "../../services/notificationService";

interface HeaderProps {
    onOpenSidebar: () => void;
    mobileOpen: boolean;
}

function getPageName(pathname: string) {
    if (pathname === "/dashboard") return "Tổng quan";

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
    const [search, setSearch] = useState("");
    const [userMenuAnchor, setUserMenuAnchor] = useState<HTMLElement | null>(null);
    const { user, logout } = useAuthStore();
    const [notificationOpen, setNotificationOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        let active = true;
        const loadUnreadCount = async () => {
            try {
                const count = await notificationService.getUnreadCount();
                if (active) setUnreadCount(count);
            } catch {
                // ignore
            }
        };
        void loadUnreadCount();
        window.addEventListener(NOTIFICATIONS_CHANGED_EVENT, loadUnreadCount);
        return () => {
            active = false;
            window.removeEventListener(NOTIFICATIONS_CHANGED_EVENT, loadUnreadCount);
        };
    }, []);

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
                    <button type="button" title="Lịch" aria-label="Lịch" className="crm-icon-btn crm-header__optional">
                        <CalendarDays size={18} />
                    </button>
                    <button type="button" title="Trợ giúp" aria-label="Trợ giúp" className="crm-icon-btn crm-header__optional">
                        <CircleHelp size={18} />
                    </button>
                    <div className="relative">
                        <button
                            type="button"
                            data-notification-trigger
                            title="Thông báo"
                            aria-label="Thông báo"
                            aria-expanded={notificationOpen}
                            onClick={() => setNotificationOpen((prev) => !prev)}
                            className="crm-icon-btn relative"
                        >
                            <Bell size={18} />
                            {unreadCount > 0 && (
                                <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-(--crm-danger) px-1 text-[10px] font-bold text-white shadow-sm ring-2 ring-(--crm-surface)">
                                    {unreadCount > 99 ? "99+" : unreadCount}
                                </span>
                            )}
                        </button>
                        <NotificationDropdown
                            open={notificationOpen}
                            onClose={() => setNotificationOpen(false)}
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


                {/* <MenuItem
                    onClick={() => {
                        setUserMenuAnchor(null);
                        navigate("/profile");
                    }}
                >
                    <ListItemIcon>
                        <UserRound size={17} />
                    </ListItemIcon>
                    Thông tin cá nhân
                </MenuItem> */}


                <MenuItem onClick={() => void handleLogout()}>
                    <ListItemIcon><LogOut size={17} /></ListItemIcon>
                    Đăng xuất
                </MenuItem>
            </Menu>
        </header>
    );
}
