import { useNavigate } from "react-router-dom";
import { useState } from "react";

import LeadForm from "../../components/leads/LeadForm";

import { getErrorMessage, leadService } from "../../services/leadService";

import type { LeadFormData } from "../../utils/leadSchema";

export default function LeadCreatePage() {
    const navigate = useNavigate();
    const [error, setError] = useState("");

    const handleSubmit = async (data: LeadFormData) => {
        setError("");
        try {
            const lead = await leadService.createLead(data);
            navigate(`/leads/${lead.id}`, { replace: true });
        } catch (submitError) {
            setError(getErrorMessage(submitError));
        }
    };

    return (
        <div className="max-w-5xl">
            <div className="mb-6">
                <h1 className="text-2xl font-semibold text-slate-900">
                    Thêm Lead
                </h1>

                <p className="mt-1 text-sm text-slate-500">
                    Tạo khách hàng tiềm năng mới
                </p>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-6">
                <LeadForm
                    onSubmit={handleSubmit}
                    onCancel={() => navigate("/leads")}
                    submitLabel="Tạo Lead"
                    serverError={error}
                />
            </div>
        </div>
    );
}
