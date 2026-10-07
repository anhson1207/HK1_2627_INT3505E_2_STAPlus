import { ListItemIcon, Menu, MenuItem } from "@mui/material";
import { Bell, CalendarDays, ChevronDown, CircleHelp, LogOut, Menu as MenuIcon, Plus, Search, UserRound } from "lucide-react";
import { useEffect, useRef, useState, type FormEvent, type MouseEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import RoleGuard from "../auth/RoleGuard";
import { useAuthStore } from "../../stores/authStore";
import type { UserRole } from "../../types/auth";

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

    // Support Routes (/support)
    if (pathname === "/support/new") return "Hỗ trợ / Tạo mới";
    if (/^\/support\/[^/]+\/edit$/.test(pathname)) return "Hỗ trợ / Chỉnh sửa";
    if (/^\/support\/[^/]+$/.test(pathname)) return "Hỗ trợ / Chi tiết";
    if (pathname.startsWith("/support")) return "Hỗ trợ";

    if (pathname.startsWith("/customers")) return "Khách hàng";
    if (pathname.startsWith("/deals")) return "Cơ hội";
    if (pathname.startsWith("/analytics")) return "Phân tích";
    if (pathname.startsWith("/settings")) return "Cài đặt";
    return "Nova CRM";
}

export default function Header({ onOpenSidebar, mobileOpen }: HeaderProps) {
    const navigate = useNavigate();
    const location = useLocation();
    const searchRef = useRef<HTMLInputElement>(null);
    const [search, setSearch] = useState("");
    const [userMenuAnchor, setUserMenuAnchor] = useState<HTMLElement | null>(null);
    const { user, logout } = useAuthStore();

    const roleLabels: Record<UserRole, string> = {
        ADMIN: "Quản trị viên",
        SALES: "Nhân viên kinh doanh",
        SUPPORT: "Nhân viên hỗ trợ",
    };
    const avatarLabel = user?.fullName.trim().split(/\s+/).at(-1)?.charAt(0).toLocaleUpperCase("vi") ?? "U";

    const isSupportPage = location.pathname.startsWith("/support");

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
        if (isSupportPage) {
            navigate(keyword ? `/support?search=${encodeURIComponent(keyword)}` : "/support");
        } else {
            navigate(keyword ? `/leads?search=${encodeURIComponent(keyword)}` : "/leads");
        }
    };

    const handleOpenUserMenu = (event: MouseEvent<HTMLElement>) => {
        setUserMenuAnchor(event.currentTarget);
    };

    const handleLogout = async () => {
        setUserMenuAnchor(null);
        await logout();
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

                <RoleGuard allowedRoles={["ADMIN", "SALES"]} fallback={<div className="mx-auto flex-1" />}>
                    <form onSubmit={handleSearch} className="crm-search crm-header__search">
                        <Search size={17} className="crm-search__icon" />
                        <input
                            ref={searchRef}
                            type="search"
                            aria-label="Tìm Lead"
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="Tìm Lead theo tên, email, số điện thoại..."
                            
                        />
                    </form>
                </RoleGuard>

                <div className="crm-header__right">
                    <RoleGuard allowedRoles={["ADMIN", "SALES"]}>
                        <button
                            type="button"
                            aria-label="Tạo Lead"
                            onClick={() => navigate("/leads/new")}
                            className="crm-btn crm-btn--primary crm-header__create"
                        >
                            <Plus size={16} />
                            <span className="crm-header__create-label">Tạo Lead</span>
                        </button>
                    </RoleGuard>
                    <button type="button" title="Lịch" aria-label="Lịch" className="crm-icon-btn crm-header__optional">
                        <CalendarDays size={18} />
                    </button>
                    <button type="button" title="Trợ giúp" aria-label="Trợ giúp" className="crm-icon-btn crm-header__optional">
                        <CircleHelp size={18} />
                    </button>
                    <button type="button" title="Thông báo" aria-label="Thông báo" className="crm-icon-btn relative">
                        <Bell size={18} />
                        <span className="crm-unread-dot" />
                    </button>

                    <button type="button" onClick={handleOpenUserMenu} aria-label="Mở menu người dùng" className="crm-header__user">
                        <div className="crm-avatar">
                            {avatarLabel}
                            <span className="crm-online-dot" />
                        </div>
                        <div className="crm-header__user-info">
                            <p className="crm-header__user-name">{user?.fullName ?? "Người dùng"}</p>
                            <p className="crm-caption">{user ? roleLabels[user.role] : ""}</p>
                        </div>
                        <ChevronDown size={14} className="crm-header__user-chevron" />
                    </button>
                </div>
            </div>

            <Menu anchorEl={userMenuAnchor} open={Boolean(userMenuAnchor)} onClose={() => setUserMenuAnchor(null)} anchorOrigin={{ vertical: "bottom", horizontal: "right" }} transformOrigin={{ vertical: "top", horizontal: "right" }}>
                <MenuItem disabled>
                    <ListItemIcon><UserRound size={17} /></ListItemIcon>
                    {user?.email}
                </MenuItem>
                <MenuItem onClick={() => void handleLogout()}>
                    <ListItemIcon><LogOut size={17} /></ListItemIcon>
                    Đăng xuất
                </MenuItem>
            </Menu>
        </header>
    );
}
