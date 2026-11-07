import {
    Activity,
    CheckCircle2,
    Clock,
    Eye,
    FileSpreadsheet,
    Layers,
    RefreshCw,
    Search,
    XCircle,
} from "lucide-react";
import { Alert, CircularProgress } from "@mui/material";
import { useEffect, useState } from "react";
import AdminSettingsNav from "../../components/settings/AdminSettingsNav";
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
            return "bg-emerald-50 text-emerald-700 border-emerald-200";
        case "UPDATE":
            return "bg-blue-50 text-blue-700 border-blue-200";
        case "DELETE":
            return "bg-rose-50 text-rose-700 border-rose-200";
        case "ASSIGN":
            return "bg-purple-50 text-purple-700 border-purple-200";
        case "LOGIN":
            return "bg-amber-50 text-amber-700 border-amber-200";
        case "ROLE_CHANGE":
        case "STATUS_CHANGE":
            return "bg-indigo-50 text-indigo-700 border-indigo-200";
        case "IMPORT":
            return "bg-teal-50 text-teal-700 border-teal-200";
        default:
            return "bg-slate-100 text-slate-700 border-slate-200";
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

    // Find top module from stats
    const topModule = stats?.moduleCounts
        ? Object.entries(stats.moduleCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "LEAD"
        : "LEAD";

    const successRate = stats && stats.totalLogs > 0
        ? Math.round((stats.successCount / stats.totalLogs) * 100)
        : 100;

    return (
        <div>
            {/* Header */}
            <div className="crm-page-header">
                <div>
                    <h1 className="text-xl font-bold text-(--crm-heading)">Quản trị hệ thống</h1>
                    <p className="crm-page-description">
                        Nhật ký hoạt động (Audit Log) - Ghi lại mọi thao tác thêm/sửa/xóa dữ liệu quan trọng để truy vết khi cần
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={handleExport}
                        disabled={exporting || loading}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-(--crm-border) bg-(--crm-surface) px-3.5 py-2 text-xs font-semibold text-(--crm-text) hover:bg-(--crm-surface-hover) shadow-xs disabled:opacity-50"
                    >
                        {exporting ? <CircularProgress size={14} color="inherit" /> : <FileSpreadsheet size={15} className="text-emerald-600" />}
                        <span>Xuất CSV (Excel)</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => void loadData()}
                        disabled={loading}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-(--crm-border) bg-(--crm-surface) px-3.5 py-2 text-xs font-semibold text-(--crm-text) hover:bg-(--crm-surface-hover) shadow-xs"
                    >
                        <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
                        <span>Tải lại</span>
                    </button>
                </div>
            </div>

            {/* Admin Tabs */}
            <AdminSettingsNav />

            {/* Stat Cards */}
            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-xl border border-(--crm-border) bg-(--crm-surface) p-4 shadow-2xs">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-(--crm-text-secondary)">Tổng số nhật ký</span>
                        <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
                            <Activity size={18} />
                        </div>
                    </div>
                    <div className="mt-2 flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-(--crm-heading)">
                            {stats?.totalLogs ?? totalElements}
                        </span>
                        <span className="text-xs text-(--crm-text-muted)">thao tác đã lưu</span>
                    </div>
                </div>

                <div className="rounded-xl border border-(--crm-border) bg-(--crm-surface) p-4 shadow-2xs">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-(--crm-text-secondary)">Hoạt động hôm nay</span>
                        <div className="rounded-lg bg-emerald-50 p-2 text-emerald-600">
                            <Clock size={18} />
                        </div>
                    </div>
                    <div className="mt-2 flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-emerald-600">
                            {stats?.todayLogs ?? 0}
                        </span>
                        <span className="text-xs text-(--crm-text-muted)">trong ngày 24h</span>
                    </div>
                </div>

                <div className="rounded-xl border border-(--crm-border) bg-(--crm-surface) p-4 shadow-2xs">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-(--crm-text-secondary)">Tỷ lệ thành công</span>
                        <div className="rounded-lg bg-purple-50 p-2 text-purple-600">
                            <CheckCircle2 size={18} />
                        </div>
                    </div>
                    <div className="mt-2 flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-(--crm-heading)">{successRate}%</span>
                        <span className="text-xs text-(--crm-text-muted)">
                            ({stats?.failedCount ?? 0} thất bại)
                        </span>
                    </div>
                </div>

                <div className="rounded-xl border border-(--crm-border) bg-(--crm-surface) p-4 shadow-2xs">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-(--crm-text-secondary)">Phân hệ sôi động nhất</span>
                        <div className="rounded-lg bg-amber-50 p-2 text-amber-600">
                            <Layers size={18} />
                        </div>
                    </div>
                    <div className="mt-2 flex items-baseline gap-2">
                        <span className="text-xl font-bold text-(--crm-heading) uppercase">
                            {topModule}
                        </span>
                        <span className="text-xs text-(--crm-text-muted)">chiếm đa số</span>
                    </div>
                </div>
            </div>

            {/* Error banner */}
            {error && (
                <Alert severity="error" className="mb-4" onClose={() => setError(null)}>
                    {error}
                </Alert>
            )}

            {/* Table & Toolbar Board */}
            <div className="crm-board">
                {/* Filters Toolbar */}
                <div className="crm-toolbar crm-toolbar--board flex-wrap gap-2.5">
                    <form onSubmit={handleSearchSubmit} className="crm-search flex-1 min-w-[240px]">
                        <Search size={16} className="mr-2 shrink-0 text-(--crm-text-muted)" />
                        <input
                            type="search"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Tìm kiếm theo tên, email, mô tả, ID..."
                            className="w-full text-sm outline-none placeholder:text-(--crm-text-muted)"
                        />
                    </form>

                    <select
                        aria-label="Lọc theo phân hệ"
                        value={moduleFilter}
                        onChange={(e) => {
                            setModuleFilter(e.target.value);
                            setPage(0);
                        }}
                        className="crm-filter-chip"
                    >
                        {MODULE_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </select>

                    <select
                        aria-label="Lọc theo thao tác"
                        value={actionFilter}
                        onChange={(e) => {
                            setActionFilter(e.target.value);
                            setPage(0);
                        }}
                        className="crm-filter-chip"
                    >
                        {ACTION_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </select>

                    <select
                        aria-label="Lọc theo trạng thái"
                        value={statusFilter}
                        onChange={(e) => {
                            setStatusFilter(e.target.value);
                            setPage(0);
                        }}
                        className="crm-filter-chip"
                    >
                        <option value="ALL">Tất cả trạng thái</option>
                        <option value="SUCCESS">Thành công (SUCCESS)</option>
                        <option value="FAILED">Thất bại (FAILED)</option>
                    </select>
                </div>

                {/* Table content */}
                {loading && logs.length === 0 ? (
                    <div className="flex min-h-72 items-center justify-center">
                        <CircularProgress size={32} />
                    </div>
                ) : logs.length === 0 ? (
                    <div className="flex min-h-72 flex-col items-center justify-center p-8 text-center">
                        <div className="rounded-full bg-(--crm-surface-hover) p-4 text-(--crm-text-muted) mb-3">
                            <Activity size={28} />
                        </div>
                        <p className="font-semibold text-(--crm-heading)">Không tìm thấy bản ghi nhật ký nào</p>
                        <p className="crm-page-description">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm.</p>
                    </div>
                ) : (
                    <div className="crm-table-wrap">
                        <table className="crm-table">
                            <thead>
                                <tr className="border-b border-(--crm-border) bg-(--crm-surface-subtle)">
                                    <th style={{ width: "15%" }} className="px-4 py-3.5 text-center text-xs font-semibold text-(--crm-text-secondary)">Thời gian</th>
                                    <th style={{ width: "22%" }} className="px-4 py-3.5 text-center text-xs font-semibold text-(--crm-text-secondary)">Người thực hiện</th>
                                    <th style={{ width: "11%" }} className="px-4 py-3.5 text-center text-xs font-semibold text-(--crm-text-secondary)">Thao tác</th>
                                    <th style={{ width: "10%" }} className="px-4 py-3.5 text-center text-xs font-semibold text-(--crm-text-secondary)">Phân hệ</th>
                                    <th style={{ width: "25%" }} className="px-4 py-3.5 text-center text-xs font-semibold text-(--crm-text-secondary)">Mô tả hoạt động</th>
                                    <th style={{ width: "10%" }} className="px-4 py-3.5 text-center text-xs font-semibold text-(--crm-text-secondary)">Trạng thái</th>
                                    <th style={{ width: "7%" }} className="px-3 py-3.5 text-center text-xs font-semibold text-(--crm-text-secondary)">Xem</th>
                                </tr>
                            </thead>
                            <tbody>
                                {logs.map((logItem) => (
                                    <tr
                                        key={logItem.id}
                                        onClick={() => setSelectedLog(logItem)}
                                        className="cursor-pointer border-b border-(--crm-border-subtle) transition hover:bg-(--crm-surface-subtle) last:border-b-0"
                                    >
                                        {/* Timestamp */}
                                        <td className="whitespace-nowrap px-4 py-3.5 text-center text-xs font-medium text-(--crm-heading)">
                                            {formatTimestamp(logItem.timestamp)}
                                        </td>

                                        {/* Actor */}
                                        <td className="px-4 py-3.5 text-center">
                                            <div className="inline-flex items-center gap-2.5 text-left w-48 max-w-full">
                                                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-700">
                                                    {(logItem.userName || "H").charAt(0).toUpperCase()}
                                                </div>
                                                <div className="min-w-0 flex-1 truncate text-left">
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
                                        <td className="whitespace-nowrap px-4 py-3.5 text-center">
                                            <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold ${getActionBadge(logItem.action)}`}>
                                                {getActionLabel(logItem.action)}
                                            </span>
                                        </td>

                                        {/* Module */}
                                        <td className="whitespace-nowrap px-4 py-3.5 text-center">
                                            <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-mono font-medium text-slate-700">
                                                {logItem.module}
                                            </span>
                                        </td>

                                        {/* Description */}
                                        <td className="px-4 py-3.5 text-center">
                                            <p className="text-xs text-(--crm-text) line-clamp-2 text-center" title={logItem.description}>
                                                {logItem.description}
                                            </p>
                                        </td>

                                        {/* Status */}
                                        <td className="whitespace-nowrap px-4 py-3.5 text-center">
                                            {logItem.status === "SUCCESS" ? (
                                                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                                                    <CheckCircle2 size={12} /> Thành công
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-xs font-medium text-rose-700">
                                                    <XCircle size={12} /> Thất bại
                                                </span>
                                            )}
                                        </td>

                                        {/* Action Icon */}
                                        <td className="px-3 py-3.5 text-center">
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedLog(logItem);
                                                }}
                                                className="rounded p-1 text-(--crm-text-muted) hover:bg-slate-200 hover:text-(--crm-heading)"
                                                aria-label="Xem chi tiết"
                                            >
                                                <Eye size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination */}
                {totalElements > 0 && (
                    <div className="crm-pagination">
                        <div className="flex items-center gap-3 text-xs text-(--crm-text-secondary)">
                            <span>Hiển thị {from}–{to} trong tổng số {totalElements} hoạt động</span>
                            <select
                                aria-label="Số bản ghi mỗi trang"
                                value={pageSize}
                                onChange={(e) => {
                                    setPageSize(Number(e.target.value));
                                    setPage(0);
                                }}
                                className="rounded border border-(--crm-border) px-2 py-1 outline-none"
                            >
                                {[10, 15, 25, 50].map((size) => (
                                    <option key={size} value={size}>
                                        {size}/trang
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="flex items-center gap-1">
                            <button
                                type="button"
                                disabled={page === 0}
                                onClick={() => setPage((p) => p - 1)}
                                className="rounded border border-(--crm-border) px-3 py-1.5 text-xs text-(--crm-text-secondary) disabled:cursor-not-allowed disabled:text-(--crm-text-disabled)"
                            >
                                Trước
                            </button>
                            <span className="px-2 text-xs font-medium text-(--crm-text-secondary)">
                                Trang {page + 1} / {Math.max(1, totalPages)}
                            </span>
                            <button
                                type="button"
                                disabled={page + 1 >= totalPages}
                                onClick={() => setPage((p) => p + 1)}
                                className="rounded border border-(--crm-border) px-3 py-1.5 text-xs text-(--crm-text-secondary) disabled:cursor-not-allowed disabled:text-(--crm-text-disabled)"
                            >
                                Sau
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
