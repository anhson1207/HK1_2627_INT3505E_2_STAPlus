import { Alert, CircularProgress } from "@mui/material";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import ConfirmDialog from "../../components/common/ConfirmDialog";
import LeadDetail from "../../components/leads/LeadDetail";
import { getErrorMessage, leadService } from "../../services/leadService";
import type { Lead } from "../../types/lead";

export default function LeadDetailPage() {
    const navigate = useNavigate();
    const { id } = useParams();
    const leadId = Number(id);
    const [lead, setLead] = useState<Lead | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        let active = true;
        const loadLead = async () => {
            if (!Number.isInteger(leadId) || leadId <= 0) {
                setError("Mã Lead không hợp lệ.");
                setLoading(false);
                return;
            }
            try {
                const data = await leadService.getLeadById(leadId);
                if (active) setLead(data);
            } catch (loadError) {
                if (active) setError(getErrorMessage(loadError));
            } finally {
                if (active) setLoading(false);
            }
        };
        void loadLead();
        return () => { active = false; };
    }, [leadId]);

    const handleDelete = async () => {
        setDeleting(true);
        try {
            await leadService.deleteLead(leadId);
            navigate("/leads", { replace: true });
        } catch (deleteError) {
            setError(getErrorMessage(deleteError));
            setConfirmDelete(false);
        } finally {
            setDeleting(false);
        }
    };

    if (loading) return <div className="flex min-h-72 items-center justify-center"><CircularProgress /></div>;

    if (error || !lead) {
        return (
            <Alert severity="error" action={<button type="button" className="font-medium" onClick={() => navigate("/leads")}>Về danh sách</button>}>
                {error || "Không tìm thấy Lead."}
            </Alert>
        );
    }

    return (
        <div className="max-w-5xl">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                <button type="button" onClick={() => navigate("/leads")} className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800">
                    <ArrowLeft size={17} /> Quay lại danh sách
                </button>
                <div className="flex gap-2">
                    <button type="button" onClick={() => navigate(`/leads/${leadId}/edit`)} className="flex items-center gap-2 rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                        <Pencil size={16} /> Chỉnh sửa
                    </button>
                    <button type="button" onClick={() => setConfirmDelete(true)} className="flex items-center gap-2 rounded-md border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50">
                        <Trash2 size={16} /> Xóa
                    </button>
                </div>
            </div>

            <LeadDetail lead={lead} />
            <ConfirmDialog
                open={confirmDelete}
                title="Xóa Lead?"
                description={`Lead “${lead.firstName} ${lead.lastName}” sẽ bị xóa vĩnh viễn. Bạn có chắc chắn?`}
                loading={deleting}
                onClose={() => setConfirmDelete(false)}
                onConfirm={handleDelete}
            />
        </div>
    );
}
