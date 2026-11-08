import {
    Activity,
    CheckCircle2,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    Clock,
    Eye,
    FileSpreadsheet,
    Layers,
    RefreshCw,
    Search,
} from "lucide-react";
import { Alert, CircularProgress } from "@mui/material";
import { useEffect, useState } from "react";
import AuditLogDetailModal from "../../components/settings/AuditLogDetailModal";
import { auditLogService } from "../../services/auditLogService";
import type { AuditAction, AuditLog, AuditLogStats } from "../../types/auditLog";

const MODULE_OPTIONS: Array<{ label: string; value: string }> = [
    { label: "Tất cả phân hệ", value: "ALL" },
    { label: "Lead (Tiềm năng)", value: "LEAD" },
    { label: "Khách hàng (Customer)", value: "CUSTOMER" },
    { label: "Cơ hội (Deal)", value: "DEAL" },
    { label: "Người dùng (User)", value: "USER" },
    { label: "Xác thực & Bảo mật (Auth)", value: "AUTH" },
    { label: "Hệ thống (System)", value: "SYSTEM" },
];

const ACTION_OPTIONS: Array<{ label: string; value: string }> = [
    { label: "Tất cả thao tác", value: "ALL" },
    { label: "Thêm mới (CREATE)", value: "CREATE" },
    { label: "Chỉnh sửa (UPDATE)", value: "UPDATE" },
    { label: "Xóa dữ liệu (DELETE)", value: "DELETE" },
    { label: "Phân bổ (ASSIGN)", value: "ASSIGN" },
    { label: "Đăng nhập (LOGIN)", value: "LOGIN" },
    { label: "Đổi vai trò (ROLE_CHANGE)", value: "ROLE_CHANGE" },
    { label: "Đổi trạng thái (STATUS_CHANGE)", value: "STATUS_CHANGE" },
    { label: "Import dữ liệu (IMPORT)", value: "IMPORT" },
];

function getActionBadge(action: AuditAction) {
    switch (action.toUpperCase()) {
        case "CREATE":
            return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
        case "UPDATE":
            return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20";
        case "DELETE":
            return "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20";
        case "ASSIGN":
            return "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20";
        case "LOGIN":
            return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
        case "ROLE_CHANGE":
        case "STATUS_CHANGE":
            return "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20";
        case "IMPORT":
            return "bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20";
        default:
            return "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20";
    }
}

function getActionLabel(action: AuditAction) {
    switch (action.toUpperCase()) {
        case "CREATE":
            return "Thêm mới";
        case "UPDATE":
            return "Chỉnh sửa";
        case "DELETE":
            return "Xóa";
        case "ASSIGN":
            return "Phân bổ";
        case "LOGIN":
            return "Đăng nhập";
        case "ROLE_CHANGE":
            return "Đổi vai trò";
        case "STATUS_CHANGE":
            return "Đổi trạng thái";
        case "IMPORT":
            return "Import";
        default:
            return action;
    }
}

function formatTimestamp(isoString?: string) {
    if (!isoString) return "—";
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return isoString;
    return new Intl.DateTimeFormat("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
    }).format(date);
}

export default function AuditLogPage() {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [stats, setStats] = useState<AuditLogStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [exporting, setExporting] = useState(false);

    // Filters
    const [search, setSearch] = useState("");
    const [moduleFilter, setModuleFilter] = useState("ALL");
    const [actionFilter, setActionFilter] = useState("ALL");
    const [statusFilter, setStatusFilter] = useState("ALL");

    // Pagination
    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(15);
    const [totalElements, setTotalElements] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    // Modal
    const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

    const loadData = async () => {
        setLoading(true);
        setError(null);
        try {
            const [pageData, statsData] = await Promise.all([
                auditLogService.getLogs({
                    page,
                    size: pageSize,
                    module: moduleFilter !== "ALL" ? moduleFilter : undefined,
                    action: actionFilter !== "ALL" ? actionFilter : undefined,
                    status: statusFilter !== "ALL" ? statusFilter : undefined,
                    q: search.trim() || undefined,
                }),
                auditLogService.getStats(),
            ]);

            setLogs(pageData.content);
            setTotalElements(pageData.totalElements);
            setTotalPages(pageData.totalPages);
            setStats(statsData);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Không thể tải nhật ký hoạt động");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void loadData();
    }, [page, pageSize, moduleFilter, actionFilter, statusFilter]);

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(0);
        void loadData();
    };

    const handleExport = async () => {
        setExporting(true);
        try {
            await auditLogService.exportCsv({
                module: moduleFilter !== "ALL" ? moduleFilter : undefined,
                action: actionFilter !== "ALL" ? actionFilter : undefined,
                status: statusFilter !== "ALL" ? statusFilter : undefined,
                q: search.trim() || undefined,
            });
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Xuất file thất bại");
        } finally {
            setExporting(false);
        }
    };

    const from = totalElements === 0 ? 0 : page * pageSize + 1;
    const to = Math.min((page + 1) * pageSize, totalElements);

    const topModule = stats?.moduleCounts
        ? Object.entries(stats.moduleCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "LEAD"
        : "LEAD";

    const successRate = stats && stats.totalLogs > 0
        ? Math.round((stats.successCount / stats.totalLogs) * 100)
        : 100;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-xl font-bold tracking-tight text-(--crm-heading)">
                        Nhật ký hoạt động (Audit Log)
                    </h2>
                    <p className="mt-1 text-sm text-(--crm-text-secondary)">
                        Ghi lại toàn bộ thao tác thêm, sửa, xóa, đổi mật khẩu và phân quyền để phục vụ truy vết an toàn hệ thống.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={handleExport}
                        disabled={exporting || loading}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-(--crm-border) bg-(--crm-surface) px-3.5 py-2 text-xs font-semibold text-(--crm-heading) shadow-2xs hover:bg-(--crm-surface-hover) disabled:cursor-not-allowed disabled:opacity-50 transition-all"
                    >
                        {exporting ? (
                            <CircularProgress size={14} color="inherit" />
                        ) : (
                            <FileSpreadsheet size={15} className="text-emerald-600 dark:text-emerald-400" />
                        )}
                        <span>Xuất CSV (Excel)</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => void loadData()}
                        disabled={loading}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-(--crm-border) bg-(--crm-surface) px-3.5 py-2 text-xs font-semibold text-(--crm-heading) shadow-2xs hover:bg-(--crm-surface-hover) transition-all"
                    >
                        <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
                        <span>Tải lại</span>
                    </button>
                </div>
            </div>

            {/* Stat Cards Grid */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {/* Total Logs */}
                <div className="rounded-2xl border border-(--crm-border) bg-(--crm-surface) p-5 shadow-xs">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-(--crm-text-secondary)">Tổng số nhật ký</span>
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                            <Activity size={18} />
                        </div>
                    </div>
                    <div className="mt-3 flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-(--crm-heading)">
                            {stats?.totalLogs ?? totalElements}
                        </span>
                        <span className="text-xs text-(--crm-text-muted)">thao tác đã lưu</span>
                    </div>
                </div>

                {/* Today Logs */}
                <div className="rounded-2xl border border-(--crm-border) bg-(--crm-surface) p-5 shadow-xs">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-(--crm-text-secondary)">Hoạt động hôm nay</span>
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                            <Clock size={18} />
                        </div>
                    </div>
                    <div className="mt-3 flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                            {stats?.todayLogs ?? 0}
                        </span>
                        <span className="text-xs text-(--crm-text-muted)">trong 24 giờ qua</span>
                    </div>
                </div>

                {/* Success Rate */}
                <div className="rounded-2xl border border-(--crm-border) bg-(--crm-surface) p-5 shadow-xs">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-(--crm-text-secondary)">Tỷ lệ thành công</span>
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
                            <CheckCircle2 size={18} />
                        </div>
                    </div>
                    <div className="mt-3 flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-(--crm-heading)">{successRate}%</span>
                        <span className="text-xs text-(--crm-text-muted)">
                            ({stats?.failedCount ?? 0} thất bại)
                        </span>
                    </div>
                </div>

                {/* Top Module */}
                <div className="rounded-2xl border border-(--crm-border) bg-(--crm-surface) p-5 shadow-xs">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-(--crm-text-secondary)">Phân hệ sôi động nhất</span>
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                            <Layers size={18} />
                        </div>
                    </div>
                    <div className="mt-3 flex items-baseline gap-2">
                        <span className="text-xl font-bold uppercase text-(--crm-heading)">
                            {topModule}
                        </span>
                        <span className="text-xs text-(--crm-text-muted)">chiếm đa số</span>
                    </div>
                </div>
            </div>

            {/* Error Banner */}
            {error && (
                <div>
                    <Alert severity="error" onClose={() => setError(null)}>
                        {error}
                    </Alert>
                </div>
            )}

            {/* Main Unified Table Card */}
            <div className="overflow-hidden rounded-2xl border border-(--crm-border) bg-(--crm-surface) shadow-xs">
                {/* Integrated Filters Toolbar */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-(--crm-border) bg-(--crm-surface) p-4 sm:px-6">
                    <form onSubmit={handleSearchSubmit} className="relative flex-1 min-w-[200px] max-w-sm">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-(--crm-text-muted)">
                            <Search size={16} />
                        </div>
                        <input
                            type="search"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Tìm kiếm nhật ký..."
                            className="w-full rounded-xl border border-(--crm-border) bg-(--crm-surface-subtle) py-2 pl-9 pr-3 text-xs text-(--crm-heading) outline-none transition-all placeholder:text-(--crm-text-muted) focus:border-(--crm-primary) focus:bg-(--crm-surface) focus:ring-2 focus:ring-(--crm-primary)/15"
                        />
                    </form>

                    <div className="flex flex-wrap items-center gap-3">
                        {/* Module Filter */}
                        <div className="relative">
                            <select
                                aria-label="Lọc theo phân hệ"
                                value={moduleFilter}
                                onChange={(e) => {
                                    setModuleFilter(e.target.value);
                                    setPage(0);
                                }}
                                className="appearance-none rounded-xl border border-(--crm-border) bg-(--crm-surface-subtle) py-2 pl-3.5 pr-8 text-xs font-medium text-(--crm-heading) outline-none cursor-pointer transition-all hover:bg-(--crm-surface-hover) focus:border-(--crm-primary) focus:ring-2 focus:ring-(--crm-primary)/15"
                            >
                                {MODULE_OPTIONS.map((opt) => (
                                    <option key={opt.value} value={opt.value} className="bg-(--crm-surface) text-(--crm-heading)">
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                            <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-(--crm-text-muted)">
                                <ChevronDown size={14} />
                            </div>
                        </div>

                        {/* Action Filter */}
                        <div className="relative">
                            <select
                                aria-label="Lọc theo thao tác"
                                value={actionFilter}
                                onChange={(e) => {
                                    setActionFilter(e.target.value);
                                    setPage(0);
                                }}
                                className="appearance-none rounded-xl border border-(--crm-border) bg-(--crm-surface-subtle) py-2 pl-3.5 pr-8 text-xs font-medium text-(--crm-heading) outline-none cursor-pointer transition-all hover:bg-(--crm-surface-hover) focus:border-(--crm-primary) focus:ring-2 focus:ring-(--crm-primary)/15"
                            >
                                {ACTION_OPTIONS.map((opt) => (
                                    <option key={opt.value} value={opt.value} className="bg-(--crm-surface) text-(--crm-heading)">
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                            <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-(--crm-text-muted)">
                                <ChevronDown size={14} />
                            </div>
                        </div>

                        {/* Status Filter */}
                        <div className="relative">
                            <select
                                aria-label="Lọc theo trạng thái"
                                value={statusFilter}
                                onChange={(e) => {
                                    setStatusFilter(e.target.value);
                                    setPage(0);
                                }}
                                className="appearance-none rounded-xl border border-(--crm-border) bg-(--crm-surface-subtle) py-2 pl-3.5 pr-8 text-xs font-medium text-(--crm-heading) outline-none cursor-pointer transition-all hover:bg-(--crm-surface-hover) focus:border-(--crm-primary) focus:ring-2 focus:ring-(--crm-primary)/15"
                            >
                                <option value="ALL" className="bg-(--crm-surface) text-(--crm-heading)">Tất cả trạng thái</option>
                                <option value="SUCCESS" className="bg-(--crm-surface) text-(--crm-heading)">Thành công</option>
                                <option value="FAILED" className="bg-(--crm-surface) text-(--crm-heading)">Thất bại</option>
                            </select>
                            <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-(--crm-text-muted)">
                                <ChevronDown size={14} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Table Data */}
                {loading && logs.length === 0 ? (
                    <div className="flex min-h-64 items-center justify-center p-12">
                        <CircularProgress size={32} />
                    </div>
                ) : logs.length === 0 ? (
                    <div className="flex min-h-64 flex-col items-center justify-center p-8 text-center text-(--crm-text-muted)">
                        <div className="mb-3 rounded-full bg-(--crm-surface-subtle) p-3 text-(--crm-text-muted)">
                            <Activity size={24} />
                        </div>
                        <p className="text-sm font-semibold text-(--crm-heading)">Không tìm thấy bản ghi nhật ký nào</p>
                        <p className="mt-1 text-xs text-(--crm-text-secondary)">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-(--crm-border) bg-(--crm-surface-subtle)/50 text-[11px] font-bold uppercase tracking-wider text-(--crm-text-secondary)">
                                    <th className="px-5 py-3.5">Thời gian</th>
                                    <th className="px-5 py-3.5">Người thực hiện</th>
                                    <th className="px-5 py-3.5 text-center">Thao tác</th>
                                    <th className="px-5 py-3.5 text-center">Phân hệ</th>
                                    <th className="px-5 py-3.5">Mô tả hoạt động</th>
                                    <th className="px-5 py-3.5 text-center">Trạng thái</th>
                                    <th className="px-4 py-3.5 text-right">Xem</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-(--crm-border-subtle)">
                                {logs.map((logItem) => {
                                    const actorInitial = (logItem.userName || "H").charAt(0).toUpperCase();

                                    return (
                                        <tr
                                            key={logItem.id}
                                            onClick={() => setSelectedLog(logItem)}
                                            className="cursor-pointer transition-colors hover:bg-(--crm-surface-subtle)/40"
                                        >
                                            {/* Timestamp */}
                                            <td className="whitespace-nowrap px-5 py-3.5 text-xs font-medium text-(--crm-heading)">
                                                {formatTimestamp(logItem.timestamp)}
                                            </td>

                                            {/* Actor */}
                                            <td className="px-5 py-3.5">
                                                <div className="flex items-center gap-2.5">
                                                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-[11px] font-bold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                                                        {actorInitial}
                                                    </div>
                                                    <div className="min-w-0 max-w-44 truncate">
                                                        <p className="truncate text-xs font-semibold text-(--crm-heading)" title={logItem.userName || "Hệ thống"}>
                                                            {logItem.userName || "Hệ thống"}
                                                        </p>
                                                        <p className="truncate text-[11px] text-(--crm-text-muted)" title={logItem.userEmail || ""}>
                                                            {logItem.userEmail || "system"}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Action Badge */}
                                            <td className="whitespace-nowrap px-5 py-3.5 text-center">
                                                <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${getActionBadge(logItem.action)}`}>
                                                    {getActionLabel(logItem.action)}
                                                </span>
                                            </td>

                                            {/* Module */}
                                            <td className="whitespace-nowrap px-5 py-3.5 text-center">
                                                <span className="rounded-md border border-(--crm-border-subtle) bg-(--crm-surface-subtle) px-2 py-0.5 text-[11px] font-mono font-medium text-(--crm-text-secondary)">
                                                    {logItem.module}
                                                </span>
                                            </td>

                                            {/* Description */}
                                            <td className="px-5 py-3.5">
                                                <p className="text-xs text-(--crm-heading) line-clamp-1 max-w-md" title={logItem.description}>
                                                    {logItem.description}
                                                </p>
                                            </td>

                                            {/* Status */}
                                            <td className="whitespace-nowrap px-5 py-3.5 text-center">
                                                {logItem.status === "SUCCESS" ? (
                                                    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                                                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                                        Thành công
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-500/20 bg-rose-500/10 px-2.5 py-0.5 text-xs font-semibold text-rose-600 dark:text-rose-400">
                                                        <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                                                        Thất bại
                                                    </span>
                                                )}
                                            </td>

                                            {/* Action Icon */}
                                            <td className="whitespace-nowrap px-4 py-3.5 text-right">
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setSelectedLog(logItem);
                                                    }}
                                                    className="rounded-lg p-1.5 text-(--crm-text-secondary) hover:bg-(--crm-surface-hover) hover:text-(--crm-heading) transition-colors"
                                                    aria-label="Xem chi tiết"
                                                >
                                                    <Eye size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination Footer */}
                {totalElements > 0 && (
                    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-(--crm-border) bg-(--crm-surface-subtle)/30 px-5 py-3 text-xs text-(--crm-text-secondary)">
                        <div className="flex items-center gap-3">
                            <span>
                                Hiển thị <strong>{from}–{to}</strong> trong tổng số <strong>{totalElements}</strong> hoạt động
                            </span>
                            <div className="relative">
                                <select
                                    aria-label="Số bản ghi mỗi trang"
                                    value={pageSize}
                                    onChange={(e) => {
                                        setPageSize(Number(e.target.value));
                                        setPage(0);
                                    }}
                                    className="appearance-none rounded-lg border border-(--crm-border) bg-(--crm-surface) py-1 pl-2.5 pr-6 text-xs font-medium text-(--crm-heading) outline-none cursor-pointer hover:bg-(--crm-surface-hover)"
                                >
                                    {[10, 15, 25, 50].map((size) => (
                                        <option key={size} value={size} className="bg-(--crm-surface) text-(--crm-heading)">
                                            {size} / trang
                                        </option>
                                    ))}
                                </select>
                                <div className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 text-(--crm-text-muted)">
                                    <ChevronDown size={12} />
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                disabled={page === 0}
                                onClick={() => setPage((p) => p - 1)}
                                className="inline-flex items-center gap-1 rounded-lg border border-(--crm-border) bg-(--crm-surface) px-2.5 py-1 text-xs font-semibold text-(--crm-heading) shadow-2xs hover:bg-(--crm-surface-hover) disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                <ChevronLeft size={14} />
                                <span>Trước</span>
                            </button>

                            <span className="px-2 text-xs font-medium text-(--crm-heading)">
                                Trang {page + 1} / {Math.max(1, totalPages)}
                            </span>

                            <button
                                type="button"
                                disabled={page + 1 >= totalPages}
                                onClick={() => setPage((p) => p + 1)}
                                className="inline-flex items-center gap-1 rounded-lg border border-(--crm-border) bg-(--crm-surface) px-2.5 py-1 text-xs font-semibold text-(--crm-heading) shadow-2xs hover:bg-(--crm-surface-hover) disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                <span>Sau</span>
                                <ChevronRight size={14} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Detail Modal */}
            <AuditLogDetailModal
                log={selectedLog}
                open={Boolean(selectedLog)}
                onClose={() => setSelectedLog(null)}
            />
        </div>
    );
}
