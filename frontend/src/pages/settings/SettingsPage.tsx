import {
    Activity,
    BellRing,
    Building2,
    Palette,
    ShieldCheck,
    Ticket,
    UserCheck,
    UserRound,
    Users,
} from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";

import { useAuthStore } from "../../stores/authStore";
import type { UserRole } from "../../types/auth";

interface SettingItem {
    label: string;
    description: string;
    path: string;
    icon: typeof UserRound;
    adminOnly?: boolean;
}

const personalSettings: SettingItem[] = [
    {
        label: "Hồ sơ cá nhân",
        description: "Thông tin cá nhân, phòng ban & liên hệ",
        path: "/settings/profile",
        icon: UserRound,
    },
    {
        label: "Bảo mật tài khoản",
        description: "Đổi mật khẩu & quản lý phiên làm việc",
        path: "/settings/security",
        icon: ShieldCheck,
    },
    {
        label: "Thông báo",
        description: "Tùy chỉnh thông báo Chat & CRM",
        path: "/settings/notifications",
        icon: BellRing,
    },
    {
        label: "Giao diện & Trải nghiệm",
        description: "Chế độ Sáng/Tối, mật độ bảng, định dạng",
        path: "/settings/appearance",
        icon: Palette,
    },
];

const adminSettings: SettingItem[] = [
    {
        label: "Hồ sơ Doanh nghiệp",
        description: "Thông tin định danh, trụ sở & múi giờ",
        path: "/settings/company",
        icon: Building2,
        adminOnly: true,
    },
    {
        label: "Mã mời nhân viên",
        description: "Quản lý mã & link mời tham gia công ty",
        path: "/settings/invitations",
        icon: Ticket,
        adminOnly: true,
    },
    {
        label: "Duyệt yêu cầu tham gia",
        description: "Phê duyệt nhân sự & phân quyền",
        path: "/settings/join-requests",
        icon: UserCheck,
        adminOnly: true,
    },
    {
        label: "Quản lý người dùng",
        description: "Danh sách nhân viên & phân quyền",
        path: "/settings/users",
        icon: Users,
        adminOnly: true,
    },
    {
        label: "Nhật ký hoạt động",
        description: "Lịch sử thao tác (Audit Log) hệ thống",
        path: "/settings/audit-logs",
        icon: Activity,
        adminOnly: true,
    },
    {
        label: "Cấu hình hệ thống",
        description: "Tùy chọn hiển thị & thiết lập CRM chung",
        path: "/settings/general",
        icon: ShieldCheck,
        adminOnly: true,
    },
];

const roleLabels: Record<UserRole, string> = {
    ADMIN: "Quản trị viên (Admin)",
    SALES: "Nhân viên kinh doanh (Sales)",
    SUPPORT: "Nhân viên hỗ trợ (Support)",
    MANAGER: "Quản lý (Manager)",
    UNASSIGNED: "Chưa phân quyền",
};

export default function SettingsPage() {
    const user = useAuthStore((state) => state.user);
    const isAdmin = user?.role === "ADMIN";

    const displayName = user?.fullName?.trim() || user?.username || "Người dùng";
    const avatarLetter = displayName.charAt(0).toLocaleUpperCase("vi");

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-(--crm-heading)">
                        Cài đặt & Phân quyền
                    </h1>
                    <p className="mt-1 text-sm text-(--crm-text-secondary)">
                        Quản lý thông tin tài khoản cá nhân, tùy chỉnh thông báo và cấu hình hệ thống STAPlus CRM.
                    </p>
                </div>
            </div>

            {/* Layout: Sidebar Sub-nav + Content */}
            <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[290px_minmax(0,1fr)]">
                {/* Secondary navigation sidebar */}
                <aside className="space-y-5 rounded-2xl border border-(--crm-border) bg-(--crm-surface) p-4 shadow-xs">
                    {/* User summary card */}
                    <div className="flex items-center gap-3 rounded-xl bg-(--crm-surface-subtle) p-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-indigo-500 to-purple-600 font-bold text-white shadow-xs">
                            {avatarLetter}
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-(--crm-heading)">
                                {displayName}
                            </p>
                            <p className="truncate text-xs text-(--crm-text-secondary)">
                                {user?.email || user?.username}
                            </p>
                            <span className="mt-1 inline-flex items-center rounded-md bg-(--crm-primary)/10 px-1.5 py-0.5 text-[10px] font-semibold text-(--crm-primary)">
                                {user?.role ? roleLabels[user.role] : "Người dùng"}
                            </span>
                        </div>
                    </div>

                    {/* Group A: Cài đặt cá nhân */}
                    <div className="space-y-1">
                        <div className="px-3 py-1.5">
                            <p className="text-[11px] font-bold uppercase tracking-wider text-(--crm-text-muted)">
                                Cài đặt cá nhân
                            </p>
                        </div>
                        <nav className="space-y-1" aria-label="Cài đặt cá nhân">
                            {personalSettings.map((item) => {
                                const Icon = item.icon;
                                return (
                                    <NavLink
                                        key={item.path}
                                        to={item.path}
                                        className={({ isActive }) =>
                                            `group flex items-start gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${
                                                isActive
                                                    ? "bg-(--crm-primary)/12 font-semibold text-(--crm-primary) shadow-2xs"
                                                    : "text-(--crm-text-secondary) hover:bg-(--crm-surface-hover) hover:text-(--crm-heading)"
                                            }`
                                        }
                                    >
                                        <Icon
                                            size={18}
                                            className="mt-0.5 shrink-0 transition-transform group-hover:scale-105"
                                        />
                                        <div className="min-w-0 flex-1">
                                            <p className="leading-snug">{item.label}</p>
                                            <p className="truncate text-xs text-(--crm-text-muted) opacity-90">
                                                {item.description}
                                            </p>
                                        </div>
                                    </NavLink>
                                );
                            })}
                        </nav>
                    </div>

                    {/* Group B: Quản trị hệ thống (ADMIN Only) */}
                    {isAdmin && (
                        <div className="space-y-1 border-t border-(--crm-border-subtle) pt-4">
                            <div className="flex items-center justify-between px-3 py-1.5">
                                <p className="text-[11px] font-bold uppercase tracking-wider text-(--crm-text-muted)">
                                    Quản trị hệ thống
                                </p>
                                <span className="rounded bg-amber-500/15 px-1.5 py-0.2 text-[9px] font-semibold text-amber-500">
                                    ADMIN
                                </span>
                            </div>
                            <nav className="space-y-1" aria-label="Quản trị hệ thống">
                                {adminSettings.map((item) => {
                                    const Icon = item.icon;
                                    return (
                                        <NavLink
                                            key={item.path}
                                            to={item.path}
                                            className={({ isActive }) =>
                                                `group flex items-start gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${
                                                    isActive
                                                        ? "bg-(--crm-primary)/12 font-semibold text-(--crm-primary) shadow-2xs"
                                                        : "text-(--crm-text-secondary) hover:bg-(--crm-surface-hover) hover:text-(--crm-heading)"
                                                }`
                                            }
                                        >
                                            <Icon
                                                size={18}
                                                className="mt-0.5 shrink-0 transition-transform group-hover:scale-105"
                                            />
                                            <div className="min-w-0 flex-1">
                                                <p className="leading-snug">{item.label}</p>
                                                <p className="truncate text-xs text-(--crm-text-muted) opacity-90">
                                                    {item.description}
                                                </p>
                                            </div>
                                        </NavLink>
                                    );
                                })}
                            </nav>
                        </div>
                    )}
                </aside>

                {/* Sub-page Outlet */}
                <main className="min-w-0">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
