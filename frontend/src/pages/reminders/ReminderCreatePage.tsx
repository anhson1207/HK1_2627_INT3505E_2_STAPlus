import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import ReminderForm from "../../components/reminders/ReminderForm";
import { reminderService } from "../../services/reminderService";
import type { ReminderEntityType } from "../../types/reminder";
import type { ReminderFormData } from "../../utils/reminderSchema";

export default function ReminderCreatePage() {
    const navigate = useNavigate();
    const [params] = useSearchParams();
    const [error, setError] = useState("");
    const queryType = params.get("entityType");
    const entityType: ReminderEntityType = queryType === "CUSTOMER" || queryType === "DEAL" ? queryType : "LEAD";
    const queryId = Number(params.get("entityId"));
    const entityId = Number.isInteger(queryId) && queryId > 0 ? queryId : 0;
    const submit = async (data: ReminderFormData) => {
        setError("");
        try {
            await reminderService.createReminder({ title: data.title, description: data.description, dueAt: new Date(`${data.dueDate}T${data.dueTime}:00`).toISOString(), entityType: data.entityType, entityId: data.entityId, ownerName: data.ownerName });
            navigate("/reminders", { replace: true, state: { message: "Đã tạo nhắc việc" } });
        } catch (submitError) { setError(submitError instanceof Error ? submitError.message : "Không thể tạo nhắc việc."); }
    };
    return <div className="max-w-4xl"><div className="mb-6"><h1 className="crm-page-title">Tạo nhắc việc</h1><p className="crm-page-description">Lên lịch follow-up cho Lead, khách hàng hoặc Deal</p></div><div className="crm-card crm-card__body"><ReminderForm initialData={{ entityType, entityId }} onSubmit={submit} onCancel={() => navigate("/reminders")} submitLabel="Tạo nhắc việc" serverError={error} /></div></div>;
}
