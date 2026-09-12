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
import { NavLink } from "react-router-dom";

interface SidebarProps {
    collapsed: boolean;
    onToggle: () => void;
}

const navigationGroups = [
    {
        label: "Tổng quan",
        items: [
            { label: "Trang chủ", icon: LayoutDashboard, path: "/dashboard" },
        ],
    },
    {
        label: "Kinh doanh",
        items: [
            { label: "Lead", icon: UserRound, path: "/leads" },
            { label: "Khách hàng", icon: Users, path: "/customers" },
            { label: "Cơ hội", icon: BriefcaseBusiness, path: "/deals" },
        ],
    },
    {
        label: "Vận hành",
        items: [
            { label: "Hỗ trợ", icon: TicketCheck, path: "/tickets" },
            { label: "Phân tích", icon: BarChart3, path: "/analytics" },
        ],
    },
];

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
    return (
        <aside
            className={`fixed inset-y-0 left-0 z-30 flex flex-col border-r border-slate-200/80 bg-white text-slate-700 shadow-[4px_0_24px_rgba(15,23,42,0.025)] transition-[width] duration-300 ${collapsed ? "w-[80px]" : "w-[248px]"}`}
        >
            <div className={`flex h-[72px] shrink-0 items-center border-b border-slate-100 ${collapsed ? "justify-center px-3" : "px-5"}`}>
                <div className="grid h-9 w-9 shrink-0 grid-cols-2 gap-0.5 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 p-2 shadow-sm shadow-blue-200">
                    <span className="rounded-sm bg-white" />
                    <span className="rounded-sm bg-cyan-200" />
                    <span className="rounded-sm bg-violet-200" />
                    <span className="rounded-sm bg-white" />
                </div>
                {!collapsed && (
                    <div className="ml-3 min-w-0">
                        <p className="truncate text-[16px] font-bold tracking-tight text-slate-900">CRM</p>
                    </div>
                )}
            </div>

            <nav className="flex-1 overflow-y-auto px-3 pb-3 pt-5">
                {navigationGroups.map((group) => (
                    <div key={group.label} className="mb-4">
                        {!collapsed && (
                            <p className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                                {group.label}
                            </p>
                        )}
                        <div className="space-y-1">
                            {group.items.map((item) => {
                                const Icon = item.icon;
                                return (
                                    <NavLink
                                        key={item.path}
                                        to={item.path}
                                        title={collapsed ? item.label : undefined}
                                        className={({ isActive }) => [
                                            "group relative flex h-10 items-center rounded-xl text-[13px] font-medium transition-all duration-200",
                                            collapsed ? "justify-center px-2" : "gap-3 px-3",
                                            isActive
                                                ? "bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 shadow-[inset_0_0_0_1px_rgba(59,130,246,0.08)]"
                                                : "text-slate-500 hover:bg-slate-50 hover:text-slate-900",
                                        ].join(" ")}
                                    >
                                        {({ isActive }) => (
                                            <>
                                                {isActive && !collapsed && <span className="absolute left-0 h-5 w-[3px] rounded-r-full bg-blue-500" />}
                                                <Icon size={18} strokeWidth={isActive ? 2.2 : 1.8} className={isActive ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600"} />
                                                {!collapsed && <span>{item.label}</span>}
                                                {isActive && collapsed && <span className="absolute left-0 h-5 w-[3px] rounded-r-full bg-blue-500" />}
                                            </>
                                        )}
                                    </NavLink>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </nav>

            <div className="border-t border-slate-100 p-3">
                <NavLink
                    to="/settings"
                    title={collapsed ? "Cài đặt" : undefined}
                    className={({ isActive }) => `mb-1 flex h-10 items-center rounded-xl text-[13px] font-medium transition ${collapsed ? "justify-center" : "gap-3 px-3"} ${isActive ? "bg-blue-50 text-blue-700" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"}`}
                >
                    <Settings size={18} className="text-slate-400" />
                    {!collapsed && <span>Cài đặt</span>}
                </NavLink>
                <button
                    type="button"
                    title={collapsed ? "Trợ giúp" : undefined}
                    className={`mb-2 flex h-10 w-full items-center rounded-xl text-[13px] font-medium text-slate-500 transition hover:bg-slate-50 hover:text-slate-900 ${collapsed ? "justify-center" : "gap-3 px-3"}`}
                >
                    <CircleHelp size={18} className="text-slate-400" />
                    {!collapsed && <span>Trợ giúp</span>}
                </button>
                <button
                    type="button"
                    onClick={onToggle}
                    className={`flex h-9 w-full items-center rounded-lg text-xs font-medium text-slate-400 transition hover:bg-slate-50 hover:text-slate-700 ${collapsed ? "justify-center" : "gap-3 px-3"}`}
                    aria-label={collapsed ? "Mở rộng thanh bên" : "Thu gọn thanh bên"}
                >
                    {collapsed ? <PanelLeftOpen size={17} /> : <PanelLeftClose size={17} />}
                    {!collapsed && <span>Thu gọn thanh bên</span>}
                </button>
            </div>
        </aside>
    );
}
