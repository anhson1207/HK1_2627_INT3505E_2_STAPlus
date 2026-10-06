import { Alert, CircularProgress, Snackbar } from "@mui/material";
import { AlertTriangle, CheckCircle2, CircleDot, LoaderCircle, Plus, RefreshCw, Search, TicketIcon } from "lucide-react";
import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import TicketPriorityBadge from "../../components/tickets/TicketPriorityBadge";
import TicketStatusBadge from "../../components/tickets/TicketStatusBadge";
import { getTicketErrorMessage, ticketService, type TicketListResponse } from "../../services/ticketService";
import type { Ticket, TicketPriority, TicketStatus } from "../../types/ticket";
import { TICKET_PRIORITY_OPTIONS, TICKET_STATUS_OPTIONS } from "../../utils/ticketOptions";

const EMPTY_RESULT: TicketListResponse = { content: [], page: 0, size: 10, totalElements: 0, totalPages: 0 };
const dateFormatter = new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });

export default function TicketListPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const routeMessage = typeof location.state === "object" && location.state && "message" in location.state && typeof location.state.message === "string" ? location.state.message : "";
    const [message, setMessage] = useState(routeMessage);
    const [result, setResult] = useState(EMPTY_RESULT);
    const [allTickets, setAllTickets] = useState<Ticket[]>([]);
    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [search, setSearch] = useState("");
    const deferredSearch = useDeferredValue(search);
    const [status, setStatus] = useState<TicketStatus | "">("");
    const [priority, setPriority] = useState<TicketPriority | "">("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [refreshKey, setRefreshKey] = useState(0);

    useEffect(() => {
        let active = true;
        const loadTickets = async () => {
            setLoading(true); setError("");
            try {
                const [pageData, summaryData] = await Promise.all([
                    ticketService.getTickets(page, pageSize, deferredSearch, status, priority),
                    ticketService.getTickets(0, 1000),
                ]);
                if (active) { setResult(pageData); setAllTickets(summaryData.content); }
            } catch (loadError) { if (active) setError(getTicketErrorMessage(loadError)); }
            finally { if (active) setLoading(false); }
        };
        void loadTickets();
        return () => { active = false; };
    }, [deferredSearch, page, pageSize, priority, refreshKey, status]);

    const pageNumbers = useMemo(() => { const start = Math.max(0, Math.min(page - 2, result.totalPages - 5)); return Array.from({ length: Math.min(5, result.totalPages) }, (_, index) => start + index); }, [page, result.totalPages]);
    const summaries = [
        { label: "Open Tickets", value: allTickets.filter((ticket) => ticket.status === "OPEN").length, icon: CircleDot, color: "bg-(--crm-info-soft) text-(--crm-primary)" },
        { label: "In Progress", value: allTickets.filter((ticket) => ticket.status === "IN_PROGRESS").length, icon: LoaderCircle, color: "bg-(--crm-surface-selected) text-(--crm-purple)" },
        { label: "Resolved", value: allTickets.filter((ticket) => ticket.status === "RESOLVED").length, icon: CheckCircle2, color: "bg-(--crm-success-soft) text-(--crm-green-dark)" },
        { label: "Urgent", value: allTickets.filter((ticket) => ticket.priority === "URGENT").length, icon: AlertTriangle, color: "bg-(--crm-danger-soft) text-(--crm-danger)" },
    ];
    const from = result.totalElements === 0 ? 0 : page * pageSize + 1;
    const to = Math.min((page + 1) * pageSize, result.totalElements);

    return (
        <div>
            <div className="crm-page-header"><div><h1 className="crm-page-title">Tickets</h1><p className="crm-page-description">Quản lý yêu cầu hỗ trợ khách hàng</p></div><button type="button" onClick={() => navigate("/tickets/new")} className="crm-btn crm-btn--primary"><Plus size={16} /> Tạo Ticket</button></div>
            <div className="crm-kpi-grid mb-5">{summaries.map(({ label, value, icon: Icon, color }) => <div key={label} className="crm-kpi"><div className="flex items-start justify-between"><div><p className="crm-kpi__label">{label}</p><p className="crm-kpi__value">{value}</p></div><div className={`crm-kpi__icon ${color}`}><Icon size={19} /></div></div></div>)}</div>
            <div className="crm-board">
                <div className="crm-toolbar crm-toolbar--board"><label className="crm-search"><Search size={16} className="mr-2 text-(--crm-text-muted)" /><input type="search" value={search} onChange={(event) => { setSearch(event.target.value); setPage(0); }} placeholder="Tìm tiêu đề, khách hàng, agent..." className="w-full text-sm outline-none" /></label><select value={status} onChange={(event) => { setStatus(event.target.value as TicketStatus | ""); setPage(0); }} className="crm-filter-chip"><option value="">Tất cả trạng thái</option>{TICKET_STATUS_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select><select value={priority} onChange={(event) => { setPriority(event.target.value as TicketPriority | ""); setPage(0); }} className="crm-filter-chip"><option value="">Tất cả ưu tiên</option>{TICKET_PRIORITY_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select><button type="button" onClick={() => setRefreshKey((value) => value + 1)} className="crm-icon-btn ml-auto"><RefreshCw size={16} className={loading ? "animate-spin" : ""} /></button></div>
                {error ? <div className="p-5"><Alert severity="error">{error}</Alert></div> : loading ? <div className="flex min-h-72 items-center justify-center"><CircularProgress /></div> : result.content.length === 0 ? <div className="flex min-h-72 flex-col items-center justify-center text-center"><div className="mb-3 rounded-full bg-(--crm-surface-hover) p-4 text-(--crm-text-muted)"><TicketIcon size={28} /></div><p className="font-medium text-(--crm-text)">Không tìm thấy Ticket</p><p className="crm-page-description">Thử thay đổi từ khóa hoặc bộ lọc.</p></div> : <div className="crm-table-wrap"><table className="crm-table"><thead><tr className="border-b border-(--crm-border) bg-(--crm-surface-subtle)">{["ID", "Tiêu đề", "Khách hàng", "Ưu tiên", "Trạng thái", "Phân công", "Ngày tạo"].map((label) => <th key={label} className="px-4 py-3 text-left text-xs font-medium text-(--crm-text-secondary)">{label}</th>)}</tr></thead><tbody>{result.content.map((ticket) => <tr key={ticket.id} className="border-b border-(--crm-border-subtle) last:border-0 hover:bg-(--crm-surface-subtle)"><td className="px-4 py-4 text-sm font-medium text-(--crm-text-secondary)">#{ticket.id}</td><td className="px-4 py-4"><button type="button" onClick={() => navigate(`/tickets/${ticket.id}`)} className="text-sm font-medium text-(--crm-primary) hover:underline">{ticket.subject}</button></td><td className="px-4 py-4"><button type="button" onClick={() => navigate(`/customers/${ticket.customerId}`)} className="text-sm text-(--crm-text) hover:text-(--crm-primary) hover:underline">{ticket.customerName}</button></td><td className="px-4 py-4"><TicketPriorityBadge priority={ticket.priority} /></td><td className="px-4 py-4"><TicketStatusBadge status={ticket.status} /></td><td className="px-4 py-4 text-sm text-(--crm-text-secondary)">{ticket.assignedTo || "—"}</td><td className="px-4 py-4 text-sm text-(--crm-text-secondary)">{dateFormatter.format(new Date(ticket.createdAt))}</td></tr>)}</tbody></table></div>}
                {!error && !loading && <div className="crm-pagination"><div className="flex items-center gap-3 text-xs text-(--crm-text-secondary)"><span>Hiển thị {from}–{to} trong {result.totalElements} Ticket</span><select value={pageSize} onChange={(event) => { setPageSize(Number(event.target.value)); setPage(0); }} className="rounded border border-(--crm-border) px-2 py-1">{[10, 20, 50].map((size) => <option key={size} value={size}>{size}/trang</option>)}</select></div><div className="flex gap-1"><button type="button" disabled={page === 0} onClick={() => setPage((value) => value - 1)} className="rounded border border-(--crm-border) px-3 py-1.5 text-xs disabled:text-(--crm-text-disabled)">Trước</button>{pageNumbers.map((number) => <button type="button" key={number} onClick={() => setPage(number)} className={`rounded px-3 py-1.5 text-xs ${number === page ? "bg-(--crm-primary) text-(--crm-on-primary)" : "border border-(--crm-border)"}`}>{number + 1}</button>)}<button type="button" disabled={page + 1 >= result.totalPages} onClick={() => setPage((value) => value + 1)} className="rounded border border-(--crm-border) px-3 py-1.5 text-xs disabled:text-(--crm-text-disabled)">Sau</button></div></div>}
            </div>
            <Snackbar open={Boolean(message)} autoHideDuration={3000} onClose={() => setMessage("")} message={message} />
        </div>
    );
}
