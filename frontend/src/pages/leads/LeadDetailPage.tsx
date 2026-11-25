import { Alert, CircularProgress, Snackbar } from "@mui/material";
import { ArrowLeft, CheckCircle2, Clock, Mail, Pencil, PhoneCall, Trash2, UserCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import ConfirmDialog from "../../components/common/ConfirmDialog";
import ConvertLeadModal from "../../components/leads/ConvertLeadModal";
import LeadDetail from "../../components/leads/LeadDetail";
import { getErrorMessage, leadService } from "../../services/leadService";
import { reminderService } from "../../services/reminderService";
import type { Lead } from "../../types/lead";
import type { FollowUpReminder } from "../../types/reminder";

export default function LeadDetailPage() {
    const navigate = useNavigate();
    const { id } = useParams();
    const leadId = Number(id);
    const [lead, setLead] = useState<Lead | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [convertOpen, setConvertOpen] = useState(false);
    const [toastMessage, setToastMessage] = useState("");
    const [reminders, setReminders] = useState<FollowUpReminder[]>([]);

    useEffect(() => {
        let active = true;
        const loadLead = async () => {
            if (!Number.isInteger(leadId) || leadId <= 0) {
                setError("Mã Lead không hợp lệ.");
                setLoading(false);
                return;
            }
            try {
                const [data, leadReminders] = await Promise.all([
                    leadService.getLeadById(leadId),
                    reminderService.getReminders("LEAD", leadId).catch(() => []),
                ]);
                if (active) {
                    setLead(data);
                    setReminders(leadReminders);
                }
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
            <div className="crm-page-header">
                <button type="button" onClick={() => navigate("/leads")} className="flex items-center gap-2 text-sm text-(--crm-text-secondary) hover:text-(--crm-heading)">
                    <ArrowLeft size={17} /> Quay lại danh sách
                </button>
                <div className="flex flex-wrap items-center gap-2">
                    {lead.phone && (
                        <a
                            href={`tel:${lead.phone}`}
                            className="crm-btn crm-btn--secondary"
                            title="Gọi điện tư vấn"
                        >
                            <PhoneCall size={16} /> Gọi điện
                        </a>
                    )}
                    {lead.email && (
                        <a
                            href={`mailto:${lead.email}`}
                            className="crm-btn crm-btn--secondary"
                            title="Gửi email cho Lead"
                        >
                            <Mail size={16} /> Gửi email
                        </a>
                    )}
                    <button
                        type="button"
                        onClick={() => navigate(`/reminders/new?entityType=LEAD&entityId=${leadId}`)}
                        className="crm-btn crm-btn--secondary"
                    >
                        <Clock size={16} /> Đặt nhắc việc
                    </button>
                    {lead.status !== "CONVERTED" ? (
                        <button
                            type="button"
                            onClick={() => setConvertOpen(true)}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-[#007f9b] px-3.5 py-2 text-xs font-bold text-white hover:bg-[#006980] transition shadow-xs cursor-pointer"
                        >
                            <UserCheck size={16} /> Chuyển đổi thành Khách hàng
                        </button>
                    ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300">
                            <CheckCircle2 size={15} /> Đã chuyển đổi thành Khách hàng
                        </span>
                    )}
                    <button type="button" onClick={() => navigate(`/leads/${leadId}/edit`)} className="crm-btn crm-btn--secondary">
                        <Pencil size={16} /> Chỉnh sửa
                    </button>
                    <button type="button" onClick={() => setConfirmDelete(true)} className="crm-btn crm-btn--secondary crm-danger-action">
                        <Trash2 size={16} /> Xóa
                    </button>
                </div>
            </div>

            <LeadDetail lead={lead} />

            <div className="mt-5 crm-card crm-card__body">
                <div className="flex items-center justify-between pb-3 border-b border-(--crm-border-subtle)">
                    <div className="flex items-center gap-2">
                        <Clock size={18} className="text-(--crm-primary)" />
                        <h3 className="font-semibold text-(--crm-heading)">Lịch nhắc hẹn chăm sóc ({reminders.length})</h3>
                    </div>
                    <button
                        type="button"
                        onClick={() => navigate(`/reminders/new?entityType=LEAD&entityId=${leadId}`)}
                        className="text-xs font-semibold text-(--crm-primary) hover:underline"
                    >
                        + Đặt lịch mới
                    </button>
                </div>
                {reminders.length === 0 ? (
                    <p className="py-4 text-center text-sm text-(--crm-text-secondary)">Chưa có lịch nhắc hẹn nào cho Lead này.</p>
                ) : (
                    <div className="mt-3 divide-y divide-(--crm-border-subtle)">
                        {reminders.map((r) => (
                            <div key={r.id} className="flex items-center justify-between py-2 text-sm">
                                <div>
                                    <p className="font-medium text-(--crm-heading)">{r.title}</p>
                                    <p className="text-xs text-(--crm-text-secondary)">Hạn: {new Date(r.dueAt).toLocaleString("vi-VN")}</p>
                                </div>
                                <span className={`crm-status ${r.status === "COMPLETED" ? "crm-status--won" : "crm-status--contacted"}`}>
                                    {r.status === "COMPLETED" ? "Đã xong" : "Sắp tới"}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <ConfirmDialog
                open={confirmDelete}
                title="Xóa Lead?"
                description={`Lead “${lead.firstName} ${lead.lastName}” sẽ bị xóa vĩnh viễn. Bạn có chắc chắn?`}
                loading={deleting}
                onClose={() => setConfirmDelete(false)}
                onConfirm={handleDelete}
            />

            <ConvertLeadModal
                open={convertOpen}
                lead={lead}
                onClose={() => setConvertOpen(false)}
                onSuccess={(result) => {
                    setLead((prev) => (prev ? { ...prev, status: "CONVERTED" } : null));
                    setToastMessage(result.message);
                }}
            />

            <Snackbar
                open={Boolean(toastMessage)}
                autoHideDuration={4000}
                onClose={() => setToastMessage("")}
                message={toastMessage}
            />
        </div>
    );
}
