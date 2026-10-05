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
        { label: "Open Tickets", value: allTickets.filter((ticket) => ticket.status === "OPEN").length, icon: CircleDot, color: "bg-blue-50 text-blue-600" },
        { label: "In Progress", value: allTickets.filter((ticket) => ticket.status === "IN_PROGRESS").length, icon: LoaderCircle, color: "bg-violet-50 text-violet-600" },
        { label: "Resolved", value: allTickets.filter((ticket) => ticket.status === "RESOLVED").length, icon: CheckCircle2, color: "bg-emerald-50 text-emerald-600" },
        { label: "Urgent", value: allTickets.filter((ticket) => ticket.priority === "URGENT").length, icon: AlertTriangle, color: "bg-red-50 text-red-600" },
    ];
    const from = result.totalElements === 0 ? 0 : page * pageSize + 1;
    const to = Math.min((page + 1) * pageSize, result.totalElements);

    return (
        <div>
            <div className="mb-6 flex flex-wrap items-start justify-between gap-4"><div><h1 className="text-[22px] font-semibold text-slate-900">Tickets</h1><p className="mt-1 text-sm text-slate-500">Quản lý yêu cầu hỗ trợ khách hàng</p></div><button type="button" onClick={() => navigate("/tickets/new")} className="flex items-center gap-2 rounded-md bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600"><Plus size={16} /> Tạo Ticket</button></div>
            <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">{summaries.map(({ label, value, icon: Icon, color }) => <div key={label} className="rounded-lg border border-slate-200 bg-white p-4"><div className="flex items-start justify-between"><div><p className="text-xs text-slate-500">{label}</p><p className="mt-2 text-xl font-semibold text-slate-900">{value}</p></div><div className={`rounded-lg p-2.5 ${color}`}><Icon size={19} /></div></div></div>)}</div>
            <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
                <div className="flex flex-wrap items-center gap-3 border-b border-slate-200 px-5 py-4"><label className="flex h-9 min-w-64 flex-1 items-center rounded-md border border-slate-200 px-3 lg:max-w-[360px]"><Search size={16} className="mr-2 text-slate-400" /><input type="search" value={search} onChange={(event) => { setSearch(event.target.value); setPage(0); }} placeholder="Tìm tiêu đề, khách hàng, agent..." className="w-full text-sm outline-none" /></label><select value={status} onChange={(event) => { setStatus(event.target.value as TicketStatus | ""); setPage(0); }} className="h-9 rounded-md border border-slate-200 px-3 text-sm text-slate-600"><option value="">Tất cả trạng thái</option>{TICKET_STATUS_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select><select value={priority} onChange={(event) => { setPriority(event.target.value as TicketPriority | ""); setPage(0); }} className="h-9 rounded-md border border-slate-200 px-3 text-sm text-slate-600"><option value="">Tất cả ưu tiên</option>{TICKET_PRIORITY_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select><button type="button" onClick={() => setRefreshKey((value) => value + 1)} className="ml-auto rounded-md border border-slate-200 p-2 text-slate-500"><RefreshCw size={16} className={loading ? "animate-spin" : ""} /></button></div>
                {error ? <div className="p-5"><Alert severity="error">{error}</Alert></div> : loading ? <div className="flex min-h-72 items-center justify-center"><CircularProgress /></div> : result.content.length === 0 ? <div className="flex min-h-72 flex-col items-center justify-center text-center"><div className="mb-3 rounded-full bg-slate-100 p-4 text-slate-400"><TicketIcon size={28} /></div><p className="font-medium text-slate-700">Không tìm thấy Ticket</p><p className="mt-1 text-sm text-slate-500">Thử thay đổi từ khóa hoặc bộ lọc.</p></div> : <div className="overflow-x-auto"><table className="w-full min-w-[1050px] border-collapse"><thead><tr className="border-b border-slate-200 bg-slate-50">{["ID", "Tiêu đề", "Khách hàng", "Ưu tiên", "Trạng thái", "Phân công", "Ngày tạo"].map((label) => <th key={label} className="px-4 py-3 text-left text-xs font-medium text-slate-500">{label}</th>)}</tr></thead><tbody>{result.content.map((ticket) => <tr key={ticket.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50"><td className="px-4 py-4 text-sm font-medium text-slate-500">#{ticket.id}</td><td className="px-4 py-4"><button type="button" onClick={() => navigate(`/tickets/${ticket.id}`)} className="text-sm font-medium text-blue-600 hover:underline">{ticket.subject}</button></td><td className="px-4 py-4"><button type="button" onClick={() => navigate(`/customers/${ticket.customerId}`)} className="text-sm text-slate-700 hover:text-blue-600 hover:underline">{ticket.customerName}</button></td><td className="px-4 py-4"><TicketPriorityBadge priority={ticket.priority} /></td><td className="px-4 py-4"><TicketStatusBadge status={ticket.status} /></td><td className="px-4 py-4 text-sm text-slate-600">{ticket.assignedTo || "—"}</td><td className="px-4 py-4 text-sm text-slate-600">{dateFormatter.format(new Date(ticket.createdAt))}</td></tr>)}</tbody></table></div>}
                {!error && !loading && <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 px-5 py-3"><div className="flex items-center gap-3 text-xs text-slate-500"><span>Hiển thị {from}–{to} trong {result.totalElements} Ticket</span><select value={pageSize} onChange={(event) => { setPageSize(Number(event.target.value)); setPage(0); }} className="rounded border border-slate-200 px-2 py-1">{[10, 20, 50].map((size) => <option key={size} value={size}>{size}/trang</option>)}</select></div><div className="flex gap-1"><button type="button" disabled={page === 0} onClick={() => setPage((value) => value - 1)} className="rounded border border-slate-200 px-3 py-1.5 text-xs disabled:text-slate-300">Trước</button>{pageNumbers.map((number) => <button type="button" key={number} onClick={() => setPage(number)} className={`rounded px-3 py-1.5 text-xs ${number === page ? "bg-blue-500 text-white" : "border border-slate-200"}`}>{number + 1}</button>)}<button type="button" disabled={page + 1 >= result.totalPages} onClick={() => setPage((value) => value + 1)} className="rounded border border-slate-200 px-3 py-1.5 text-xs disabled:text-slate-300">Sau</button></div></div>}
            </div>
            <Snackbar open={Boolean(message)} autoHideDuration={3000} onClose={() => setMessage("")} message={message} />
        </div>
    );
}
