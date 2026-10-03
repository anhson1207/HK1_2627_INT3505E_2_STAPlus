import { CalendarClock, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { REMINDERS_CHANGED_EVENT, reminderService } from "../../services/reminderService";
import type { FollowUpReminder, ReminderEntityType } from "../../types/reminder";
import ReminderStatusBadge from "./ReminderStatusBadge";

interface FollowUpSectionProps {
    entityType: ReminderEntityType;
    entityId: number;
}

const dateFormat = new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });

export default function FollowUpSection({ entityType, entityId }: FollowUpSectionProps) {
    const navigate = useNavigate();
    const [reminder, setReminder] = useState<FollowUpReminder | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let active = true;
        const load = async () => {
            try {
                const items = await reminderService.getReminders();
                if (active) {
                    const related = items.filter((item) => item.entityType === entityType && item.entityId === entityId);
                    setReminder(related.find((item) => item.status !== "COMPLETED") ?? related.at(-1) ?? null);
                }
            } catch { if (active) setReminder(null); }
            finally { if (active) setLoading(false); }
        };
        void load();
        window.addEventListener(REMINDERS_CHANGED_EVENT, load);
        return () => { active = false; window.removeEventListener(REMINDERS_CHANGED_EVENT, load); };
    }, [entityType, entityId]);

    const createUrl = `/reminders/new?entityType=${entityType}&entityId=${entityId}`;

    return <section className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="flex flex-wrap items-center justify-between gap-3"><div className="flex items-center gap-2"><CalendarClock size={19} className="text-blue-600" /><h2 className="text-base font-semibold text-slate-900">Follow-up</h2></div><button type="button" onClick={() => navigate(createUrl)} className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-100"><Plus size={15} /> Tạo follow-up</button></div>
        {loading ? <p className="mt-4 text-sm text-slate-400">Đang tải...</p> : reminder ? <button type="button" onClick={() => navigate(`/reminders/${reminder.id}/edit`)} className="mt-4 flex w-full flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-100 bg-slate-50 p-3 text-left hover:border-blue-200"><span><span className="block text-sm font-medium text-slate-800">{reminder.title}</span><span className="mt-1 block text-xs text-slate-500">Đến hạn {dateFormat.format(new Date(reminder.dueAt))}</span></span><ReminderStatusBadge status={reminder.status} /></button> : <p className="mt-4 text-sm text-slate-500">Chưa có lịch follow-up cho mục này.</p>}
    </section>;
}
