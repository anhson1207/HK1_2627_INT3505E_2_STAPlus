import { Alert, CircularProgress } from "@mui/material";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import LeadForm from "../../components/leads/LeadForm";
import { getErrorMessage, leadService } from "../../services/leadService";
import type { Lead } from "../../types/lead";
import type { LeadFormData } from "../../utils/leadSchema";

export default function LeadEditPage() {
    const navigate = useNavigate();
    const { id } = useParams();
    const leadId = Number(id);
    const [lead, setLead] = useState<Lead | null>(null);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState("");
    const [submitError, setSubmitError] = useState("");

    useEffect(() => {
        let active = true;
        const loadLead = async () => {
            if (!Number.isInteger(leadId) || leadId <= 0) {
                setLoadError("Mã Lead không hợp lệ.");
                setLoading(false);
                return;
            }
            try {
                const data = await leadService.getLeadById(leadId);
                if (active) setLead(data);
            } catch (error) {
                if (active) setLoadError(getErrorMessage(error));
            } finally {
                if (active) setLoading(false);
            }
        };
        void loadLead();
        return () => { active = false; };
    }, [leadId]);

    const handleSubmit = async (data: LeadFormData) => {
        setSubmitError("");
        try {
            await leadService.updateLead(leadId, data);
            navigate(`/leads/${leadId}`, { replace: true });
        } catch (error) {
            setSubmitError(getErrorMessage(error));
        }
    };

    if (loading) return <div className="flex min-h-72 items-center justify-center"><CircularProgress /></div>;

    if (loadError || !lead) {
        return (
            <Alert severity="error" action={<button type="button" className="font-medium" onClick={() => navigate("/leads")}>Về danh sách</button>}>
                {loadError || "Không tìm thấy Lead."}
            </Alert>
        );
    }

    return (
        <div className="max-w-5xl">
            <div className="mb-6">
                <h1 className="text-2xl font-semibold text-slate-900">Chỉnh sửa Lead</h1>
                <p className="mt-1 text-sm text-slate-500">Cập nhật thông tin của {lead.firstName} {lead.lastName}</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-6">
                <LeadForm
                    initialData={lead}
                    onSubmit={handleSubmit}
                    onCancel={() => navigate(`/leads/${leadId}`)}
                    submitLabel="Lưu thay đổi"
                    serverError={submitError}
                />
            </div>
        </div>
    );
}
