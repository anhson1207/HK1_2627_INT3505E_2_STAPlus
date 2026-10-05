import { Alert, Button, CircularProgress } from "@mui/material";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import ReminderForm from "../../components/reminders/ReminderForm";
import { reminderService } from "../../services/reminderService";
import type { FollowUpReminder } from "../../types/reminder";
import type { ReminderFormData } from "../../utils/reminderSchema";

function toLocalInputParts(value: string) {
    const date = new Date(value);
    const pad = (number: number) => String(number).padStart(2, "0");
    return { dueDate: `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`, dueTime: `${pad(date.getHours())}:${pad(date.getMinutes())}` };
}

export default function ReminderEditPage() {
    const navigate = useNavigate();
    const { id } = useParams();
    const reminderId = Number(id);
    const [reminder, setReminder] = useState<FollowUpReminder | null>(null);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState("");
    const [submitError, setSubmitError] = useState("");

    useEffect(() => {
        let active = true;
        const load = async () => {
            if (!Number.isInteger(reminderId) || reminderId <= 0) { setLoadError("Mã nhắc việc không hợp lệ."); setLoading(false); return; }
            try { const data = await reminderService.getReminderById(reminderId); if (active) setReminder(data); }
            catch (error) { if (active) setLoadError(error instanceof Error ? error.message : "Không thể tải nhắc việc."); }
            finally { if (active) setLoading(false); }
        };
        void load();
        return () => { active = false; };
    }, [reminderId]);

    const submit = async (data: ReminderFormData) => {
        setSubmitError("");
        try {
            await reminderService.updateReminder(reminderId, { title: data.title, description: data.description, dueAt: new Date(`${data.dueDate}T${data.dueTime}:00`).toISOString(), entityType: data.entityType, entityId: data.entityId, ownerName: data.ownerName });
            navigate("/reminders", { replace: true, state: { message: "Đã cập nhật nhắc việc" } });
        } catch (error) { setSubmitError(error instanceof Error ? error.message : "Không thể cập nhật nhắc việc."); }
    };

    if (loading) return <div className="flex min-h-64 items-center justify-center"><CircularProgress /></div>;
    if (loadError || !reminder) return <Alert severity="error" action={<Button color="inherit" onClick={() => navigate("/reminders")}>Về danh sách</Button>}>{loadError || "Không tìm thấy nhắc việc."}</Alert>;
    return <div className="max-w-4xl"><div className="mb-6"><h1 className="text-[22px] font-semibold text-slate-900">Chỉnh sửa nhắc việc</h1><p className="mt-1 text-sm text-slate-500">{reminder.title}</p></div><div className="rounded-xl border border-slate-200 bg-white p-6"><ReminderForm initialData={{ ...reminder, ...toLocalInputParts(reminder.dueAt) }} onSubmit={submit} onCancel={() => navigate("/reminders")} submitLabel="Lưu thay đổi" serverError={submitError} /></div></div>;
}
