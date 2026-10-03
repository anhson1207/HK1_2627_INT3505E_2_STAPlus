import { CalendarClock, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { REMINDERS_CHANGED_EVENT, reminderService } from "../../services/reminderService";
import type { FollowUpReminder } from "../../types/reminder";

const dateFormat = new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });

export default function UpcomingReminders() {
    const navigate = useNavigate();
    const [items, setItems] = useState<FollowUpReminder[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let active = true;
        const load = async () => {
            try { const data = await reminderService.getUpcomingReminders(); if (active) { setItems(data.slice(0, 5)); setError(""); } }
            catch (loadError) { if (active) setError(loadError instanceof Error ? loadError.message : "Không thể tải nhắc việc."); }
            finally { if (active) setLoading(false); }
        };
        void load();
        window.addEventListener(REMINDERS_CHANGED_EVENT, load);
        return () => { active = false; window.removeEventListener(REMINDERS_CHANGED_EVENT, load); };
    }, []);

    return <section className="dashboard-card"><div className="dashboard-card__header"><div><p className="dashboard-card__eyebrow">Follow-up</p><h2>Nhắc việc sắp tới</h2></div><CalendarClock size={20} aria-hidden="true" /></div>{loading ? <p className="py-12 text-center text-sm text-slate-500">Đang tải...</p> : error ? <p className="py-8 text-center text-sm text-red-600">{error}</p> : items.length === 0 ? <p className="py-12 text-center text-sm text-slate-500">Chưa có nhắc việc sắp tới.</p> : <div className="divide-y divide-slate-100">{items.map((item) => <button type="button" key={item.id} onClick={() => navigate(`/reminders/${item.id}/edit`)} className="flex w-full items-center gap-3 py-3 text-left hover:text-blue-600"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600"><CalendarClock size={16} /></span><span className="min-w-0 flex-1"><span className="block truncate text-sm font-medium text-slate-800">{item.title}</span><span className="mt-0.5 block text-xs text-slate-500">{item.entityName} · {dateFormat.format(new Date(item.dueAt))}</span></span><ChevronRight size={15} /></button>)}</div>}<button type="button" onClick={() => navigate("/reminders")} className="mt-3 text-xs font-semibold text-blue-600 hover:underline">Xem tất cả →</button></section>;
}
