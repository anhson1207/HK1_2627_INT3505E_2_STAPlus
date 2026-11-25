import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import TicketForm from "../../components/tickets/TicketForm";
import { getTicketErrorMessage, ticketService } from "../../services/ticketService";
import type { TicketFormData } from "../../utils/ticketSchema";

export default function TicketCreatePage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [error, setError] = useState("");

    const customerIdParam = Number(searchParams.get("customerId"));
    const customerId = Number.isInteger(customerIdParam) && customerIdParam > 0 ? customerIdParam : undefined;

    const handleSubmit = async (data: TicketFormData) => {
        setError("");
        try {
            await ticketService.createTicket(data);
            navigate(customerId ? `/customers/${customerId}` : "/tickets", {
                replace: true,
                state: { message: "Tạo Ticket thành công" },
            });
        } catch (submitError) {
            setError(getTicketErrorMessage(submitError));
        }
    };

    return (
        <div className="max-w-5xl">
            <div className="mb-6">
                <h1 className="crm-page-title">Tạo Ticket</h1>
                <p className="crm-page-description">Ghi nhận yêu cầu hỗ trợ khách hàng</p>
            </div>
            <div className="crm-card crm-card__body">
                <TicketForm
                    initialData={customerId ? { customerId } : undefined}
                    onSubmit={handleSubmit}
                    onCancel={() => navigate(customerId ? `/customers/${customerId}` : "/tickets")}
                    submitLabel="Tạo Ticket"
                    serverError={error}
                />
            </div>
        </div>
    );
}

