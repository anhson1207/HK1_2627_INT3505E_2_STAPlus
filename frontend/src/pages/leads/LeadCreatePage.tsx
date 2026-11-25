import { useNavigate } from "react-router-dom";
import { useState } from "react";

import LeadForm from "../../components/leads/LeadForm";

import { getErrorMessage, leadService } from "../../services/leadService";

import type { LeadFormData } from "../../utils/leadSchema";
import { useAuthStore } from "../../stores/authStore";

export default function LeadCreatePage() {
    const navigate = useNavigate();
    const [error, setError] = useState("");
    const user = useAuthStore((state) => state.user);
    const isSales = user?.role === "SALES";

    const handleSubmit = async (data: LeadFormData) => {
        setError("");
        try {
            const payload = {
                ...data,
                ...(isSales && user ? { ownerId: user.id, ownerName: user.fullName || `Sales #${user.id}` } : {}),
            };
            const lead = await leadService.createLead(payload);
            navigate(`/leads/${lead.id}`, { replace: true });
        } catch (submitError) {
            setError(getErrorMessage(submitError));
        }
    };

    return (
        <div className="max-w-5xl">
            <div className="mb-6">
                <h1 className="crm-page-title">
                    Thêm Lead
                </h1>

                <p className="crm-page-description">
                    Tạo khách hàng tiềm năng mới
                </p>
            </div>

            <div className="crm-card crm-card__body">
                <LeadForm
                    onSubmit={handleSubmit}
                    onCancel={() => navigate("/leads")}
                    initialData={isSales && user ? { ownerName: user.fullName || `Sales #${user.id}` } : undefined}
                    submitLabel="Tạo Lead"
                    serverError={error}
                />
            </div>
        </div>
    );
}
