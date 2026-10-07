import { useState } from "react";
import { useNavigate } from "react-router-dom";

import TicketForm from "../../components/tickets/TicketForm";
import { getTicketErrorMessage, ticketService } from "../../services/ticketService";
import type { TicketFormData } from "../../utils/ticketSchema";

export default function TicketCreatePage() {
    const navigate = useNavigate();
    const [error, setError] = useState("");
    const handleSubmit = async (data: TicketFormData) => {
        setError("");
        try { await ticketService.createTicket(data); navigate("/tickets", { replace: true, state: { message: "Tạo Ticket thành công" } }); }
        catch (submitError) { setError(getTicketErrorMessage(submitError)); }
    };
    return <div className="max-w-5xl"><div className="mb-6"><h1 className="crm-page-title">Tạo Ticket</h1><p className="crm-page-description">Ghi nhận yêu cầu hỗ trợ khách hàng</p></div><div className="crm-card crm-card__body"><TicketForm onSubmit={handleSubmit} onCancel={() => navigate("/tickets")} submitLabel="Tạo Ticket" serverError={error} /></div></div>;
}
