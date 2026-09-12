import { Bell, CalendarDays, ChevronDown, CircleHelp, Plus, Search } from "lucide-react";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";

interface HeaderProps {
    sidebarCollapsed: boolean;
}

function getPageName(pathname: string) {
    if (pathname === "/dashboard") return "Tổng quan";
    if (pathname === "/leads/new") return "Lead / Thêm mới";
    if (/^\/leads\/\d+\/edit$/.test(pathname)) return "Lead / Chỉnh sửa";
    if (/^\/leads\/\d+$/.test(pathname)) return "Lead / Chi tiết";
    if (pathname.startsWith("/leads")) return "Lead";
    if (pathname.startsWith("/customers")) return "Khách hàng";
    if (pathname.startsWith("/deals")) return "Cơ hội";
    if (pathname.startsWith("/tickets")) return "Hỗ trợ";
    if (pathname.startsWith("/analytics")) return "Phân tích";
    if (pathname.startsWith("/settings")) return "Cài đặt";
    return "Nova CRM";
}

export default function Header({ sidebarCollapsed }: HeaderProps) {
    const navigate = useNavigate();
    const location = useLocation();
    const searchRef = useRef<HTMLInputElement>(null);
    const [search, setSearch] = useState("");

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
        navigate(keyword ? `/leads?search=${encodeURIComponent(keyword)}` : "/leads");
    };

    return (
        <header
            className={`fixed right-0 top-0 z-20 h-[72px] border-b border-slate-200/80 bg-white/95 shadow-[0_3px_18px_rgba(15,23,42,0.025)] backdrop-blur transition-[left] duration-300 ${sidebarCollapsed ? "left-[80px]" : "left-[248px]"}`}
        >
            <div className="flex h-full items-center gap-5 px-6">
                <div className="hidden min-w-[130px] xl:block">
                    <p className="text-[11px] font-medium text-slate-400">Không gian làm việc</p>
                    <p className="mt-0.5 truncate text-sm font-semibold text-slate-800">{getPageName(location.pathname)}</p>
                </div>

                <form onSubmit={handleSearch} className="mx-auto flex h-10 w-full max-w-[520px] items-center rounded-xl border border-slate-200 bg-slate-50/80 px-3 transition focus-within:border-blue-300 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-50">
                    <Search size={17} className="mr-2.5 shrink-0 text-slate-400" />
                    <input
                        ref={searchRef}
                        type="search"
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Tìm Lead theo tên, email, số điện thoại..."
                        className="min-w-0 flex-1 bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
                    />
                </form>

                <div className="flex shrink-0 items-center gap-1.5">
                    <button
                        type="button"
                        onClick={() => navigate("/leads/new")}
                        className="mr-2 flex h-9 items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-3.5 text-xs font-semibold text-white shadow-sm shadow-blue-200 transition hover:-translate-y-0.5 hover:shadow-md hover:shadow-blue-200"
                    >
                        <Plus size={16} />
                        <span className="hidden 2xl:inline">Tạo Lead</span>
                    </button>
                    <button type="button" title="Lịch" aria-label="Lịch" className="hidden h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition hover:bg-blue-50 hover:text-blue-600 lg:flex">
                        <CalendarDays size={18} />
                    </button>
                    <button type="button" title="Trợ giúp" aria-label="Trợ giúp" className="hidden h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition hover:bg-blue-50 hover:text-blue-600 lg:flex">
                        <CircleHelp size={18} />
                    </button>
                    <button type="button" title="Thông báo" aria-label="Thông báo" className="relative flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition hover:bg-blue-50 hover:text-blue-600">
                        <Bell size={18} />
                        <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-rose-500 ring-2 ring-white" />
                    </button>

                    <div className="ml-2 flex items-center gap-2.5 border-l border-slate-200 pl-3">
                        <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 text-sm font-bold text-white shadow-sm shadow-indigo-200">
                            S
                            <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-400" />
                        </div>
                        <div className="hidden leading-tight 2xl:block">
                            <p className="whitespace-nowrap text-xs font-semibold text-slate-800">Nguyễn Anh Sơn</p>
                            <p className="mt-0.5 text-[10px] text-slate-400">Quản trị viên</p>
                        </div>
                        <ChevronDown size={14} className="hidden text-slate-400 2xl:block" />
                    </div>
                </div>
            </div>
        </header>
    );
}
