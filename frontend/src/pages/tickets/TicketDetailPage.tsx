import { Alert, CircularProgress, MenuItem, Snackbar, TextField } from "@mui/material";
import { ArrowLeft, CalendarDays, FileText, Pencil, Trash2, UserRound, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import ConfirmDialog from "../../components/common/ConfirmDialog";
import TicketPriorityBadge from "../../components/tickets/TicketPriorityBadge";
import TicketStatusBadge from "../../components/tickets/TicketStatusBadge";
import { getTicketErrorMessage, ticketService } from "../../services/ticketService";
import type { Ticket, TicketStatus } from "../../types/ticket";
import { SUPPORT_AGENT_OPTIONS, TICKET_STATUS_OPTIONS } from "../../utils/ticketOptions";

const dateTimeFormatter = new Intl.DateTimeFormat("vi-VN", { dateStyle: "long", timeStyle: "short" });

export default function TicketDetailPage() {
    const navigate = useNavigate();
    const { id } = useParams();
    const ticketId = Number(id);
    const [ticket, setTicket] = useState<Ticket | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [updating, setUpdating] = useState<"status" | "assign" | null>(null);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        let active = true;
        const loadTicket = async () => {
            if (!Number.isInteger(ticketId) || ticketId <= 0) { setError("Mã Ticket không hợp lệ."); setLoading(false); return; }
            try { const data = await ticketService.getTicketById(ticketId); if (active) setTicket(data); }
            catch (loadError) { if (active) setError(getTicketErrorMessage(loadError)); }
            finally { if (active) setLoading(false); }
        };
        void loadTicket();
        return () => { active = false; };
    }, [ticketId]);

    const handleStatusChange = async (status: TicketStatus) => {
        setUpdating("status"); setError("");
        try { const updated = await ticketService.updateTicketStatus(ticketId, status); setTicket(updated); setMessage("Cập nhật trạng thái thành công"); }
        catch (updateError) { setError(getTicketErrorMessage(updateError)); }
        finally { setUpdating(null); }
    };

    const handleAssign = async (assignedTo: string) => {
        setUpdating("assign"); setError("");
        try { const updated = await ticketService.assignTicket(ticketId, assignedTo); setTicket(updated); setMessage("Phân công Ticket thành công"); }
        catch (assignError) { setError(getTicketErrorMessage(assignError)); }
        finally { setUpdating(null); }
    };

    const handleDelete = async () => {
        setDeleting(true);
        try { await ticketService.deleteTicket(ticketId); navigate("/tickets", { replace: true, state: { message: "Đã xóa Ticket" } }); }
        catch (deleteError) { setError(getTicketErrorMessage(deleteError)); setConfirmDelete(false); }
        finally { setDeleting(false); }
    };

    if (loading) return <div className="flex min-h-72 items-center justify-center"><CircularProgress /></div>;
    if (!ticket) return <Alert severity="error" action={<button type="button" className="font-medium" onClick={() => navigate("/tickets")}>Về danh sách</button>}>{error || "Không tìm thấy Ticket."}</Alert>;

    return (
        <div className="max-w-5xl">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-4"><button type="button" onClick={() => navigate("/tickets")} className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800"><ArrowLeft size={17} /> Quay lại</button><div className="flex gap-2"><button type="button" onClick={() => navigate(`/tickets/${ticketId}/edit`)} className="flex items-center gap-2 rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"><Pencil size={16} /> Chỉnh sửa</button><button type="button" onClick={() => setConfirmDelete(true)} className="flex items-center gap-2 rounded-md border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"><Trash2 size={16} /> Xóa</button></div></div>
            {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}
            <section className="mb-5 rounded-lg border border-slate-200 bg-white p-6"><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-sm font-medium text-slate-500">Ticket #{ticket.id}</p><h1 className="mt-1 text-2xl font-semibold text-slate-900">{ticket.subject}</h1></div><div className="flex gap-2"><TicketPriorityBadge priority={ticket.priority} /><TicketStatusBadge status={ticket.status} /></div></div></section>
            <section className="mb-5 rounded-lg border border-slate-200 bg-white p-5"><h2 className="font-semibold text-slate-900">Thao tác nhanh</h2><div className="mt-4 grid grid-cols-1 gap-4 border-t border-slate-100 pt-4 md:grid-cols-2"><TextField select label="Đổi trạng thái" value={ticket.status} disabled={updating !== null} onChange={(event) => void handleStatusChange(event.target.value as TicketStatus)} helperText={updating === "status" ? "Đang cập nhật..." : "Chọn trạng thái mới"}>{TICKET_STATUS_OPTIONS.map((option) => <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>)}</TextField><TextField select label="Phân công" value={ticket.assignedTo ?? ""} disabled={updating !== null} onChange={(event) => void handleAssign(event.target.value)} helperText={updating === "assign" ? "Đang phân công..." : "Chọn nhân viên hỗ trợ"}><MenuItem value="">Chưa phân công</MenuItem>{SUPPORT_AGENT_OPTIONS.map((agent) => <MenuItem key={agent} value={agent}>{agent}</MenuItem>)}</TextField></div></section>
            <section className="overflow-hidden rounded-lg border border-slate-200 bg-white"><div className="border-b border-slate-200 px-5 py-4"><h2 className="font-semibold text-slate-900">Thông tin Ticket</h2></div><div className="grid grid-cols-1 gap-px bg-slate-200 md:grid-cols-2"><div className="flex gap-3 bg-white p-5"><Users size={18} className="text-slate-400" /><div><p className="text-xs text-slate-500">Khách hàng</p><button type="button" onClick={() => navigate(`/customers/${ticket.customerId}`)} className="mt-1 text-sm font-medium text-blue-600 hover:underline">{ticket.customerName}</button></div></div><div className="flex gap-3 bg-white p-5"><UserRound size={18} className="text-slate-400" /><div><p className="text-xs text-slate-500">Phân công cho</p><p className="mt-1 text-sm font-medium text-slate-800">{ticket.assignedTo || "—"}</p></div></div><div className="flex gap-3 bg-white p-5"><CalendarDays size={18} className="text-slate-400" /><div><p className="text-xs text-slate-500">Ngày tạo</p><p className="mt-1 text-sm font-medium text-slate-800">{dateTimeFormatter.format(new Date(ticket.createdAt))}</p></div></div><div className="flex gap-3 bg-white p-5"><CalendarDays size={18} className="text-slate-400" /><div><p className="text-xs text-slate-500">Cập nhật lần cuối</p><p className="mt-1 text-sm font-medium text-slate-800">{ticket.updatedAt ? dateTimeFormatter.format(new Date(ticket.updatedAt)) : "—"}</p></div></div><div className="bg-white p-5 md:col-span-2"><div className="flex gap-3"><FileText size={18} className="text-slate-400" /><div><p className="text-xs text-slate-500">Mô tả</p><p className="mt-1 whitespace-pre-wrap text-sm text-slate-800">{ticket.description}</p></div></div></div></div></section>
            <ConfirmDialog open={confirmDelete} title="Xóa Ticket?" description={`Ticket #${ticket.id} sẽ bị xóa vĩnh viễn. Bạn có chắc chắn?`} loading={deleting} onClose={() => setConfirmDelete(false)} onConfirm={handleDelete} />
            <Snackbar open={Boolean(message)} autoHideDuration={3000} onClose={() => setMessage("")} message={message} />
        </div>
    );
}
