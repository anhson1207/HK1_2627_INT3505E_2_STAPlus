import { Alert, CircularProgress } from "@mui/material";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import TicketForm from "../../components/tickets/TicketForm";
import { getTicketErrorMessage, ticketService } from "../../services/ticketService";
import type { Ticket } from "../../types/ticket";
import type { TicketFormData } from "../../utils/ticketSchema";

export default function TicketEditPage() {
    const navigate = useNavigate();
    const { id } = useParams();
    const ticketId = Number(id);
    const [ticket, setTicket] = useState<Ticket | null>(null);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState("");
    const [submitError, setSubmitError] = useState("");

    useEffect(() => {
        let active = true;
        const loadTicket = async () => {
            if (!Number.isInteger(ticketId) || ticketId <= 0) { setLoadError("Mã Ticket không hợp lệ."); setLoading(false); return; }
            try { const data = await ticketService.getTicketById(ticketId); if (active) setTicket(data); }
            catch (error) { if (active) setLoadError(getTicketErrorMessage(error)); }
            finally { if (active) setLoading(false); }
        };
        void loadTicket();
        return () => { active = false; };
    }, [ticketId]);

    const handleSubmit = async (data: TicketFormData) => {
        setSubmitError("");
        try { await ticketService.updateTicket(ticketId, data); navigate(`/tickets/${ticketId}`, { replace: true }); }
        catch (error) { setSubmitError(getTicketErrorMessage(error)); }
    };

    if (loading) return <div className="flex min-h-72 items-center justify-center"><CircularProgress /></div>;
    if (loadError || !ticket) return <Alert severity="error" action={<button type="button" className="font-medium" onClick={() => navigate("/tickets")}>Về danh sách</button>}>{loadError || "Không tìm thấy Ticket."}</Alert>;
    return <div className="max-w-5xl"><div className="mb-6"><h1 className="text-2xl font-semibold text-slate-900">Chỉnh sửa Ticket #{ticket.id}</h1><p className="mt-1 text-sm text-slate-500">Cập nhật yêu cầu “{ticket.subject}”</p></div><div className="rounded-lg border border-slate-200 bg-white p-6"><TicketForm initialData={ticket} onSubmit={handleSubmit} onCancel={() => navigate(`/tickets/${ticketId}`)} submitLabel="Lưu thay đổi" serverError={submitError} /></div></div>;
}
