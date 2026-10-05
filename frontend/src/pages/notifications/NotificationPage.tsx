import { Alert, Button, CircularProgress, Snackbar } from "@mui/material";
import { CheckCheck, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { NOTIFICATIONS_CHANGED_EVENT, notificationService } from "../../services/notificationService";
import type { Notification, NotificationType } from "../../types/notification";
import { formatNotificationTime, notificationIcons } from "../../utils/notificationOptions";

type Filter = "ALL" | "UNREAD" | NotificationType;
const filters: Array<{ value: Filter; label: string }> = [
    { value: "ALL", label: "Tất cả" }, { value: "UNREAD", label: "Chưa đọc" },
    { value: "FOLLOW_UP", label: "Follow-up" }, { value: "DEAL", label: "Deal" },
    { value: "TICKET", label: "Ticket" }, { value: "SYSTEM", label: "System" },
];

export default function NotificationPage() {
    const navigate = useNavigate();
    const [items, setItems] = useState<Notification[]>([]);
    const [filter, setFilter] = useState<Filter>("ALL");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    const load = useCallback(async () => {
        try { setItems(await notificationService.getNotifications()); setError(""); }
        catch (loadError) { setError(loadError instanceof Error ? loadError.message : "Không thể tải thông báo."); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => {
        const timer = window.setTimeout(() => void load(), 0);
        window.addEventListener(NOTIFICATIONS_CHANGED_EVENT, load);
        return () => { window.clearTimeout(timer); window.removeEventListener(NOTIFICATIONS_CHANGED_EVENT, load); };
    }, [load]);

    const runAction = async (action: () => Promise<void>, success: string) => {
        try { await action(); setMessage(success); }
        catch (actionError) { setError(actionError instanceof Error ? actionError.message : "Thao tác thất bại."); }
    };

    const visible = items.filter((item) => filter === "ALL" || (filter === "UNREAD" ? !item.read : item.type === filter));

    return (
        <div className="max-w-5xl">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3"><div><h1 className="text-[22px] font-semibold text-slate-900">Thông báo</h1><p className="mt-1 text-sm text-slate-500">Theo dõi các cập nhật và nhắc việc quan trọng</p></div><Button variant="outlined" startIcon={<CheckCheck size={17} />} onClick={() => void runAction(() => notificationService.markAllAsRead(), "Đã đánh dấu tất cả là đã đọc")}>Đánh dấu tất cả đã đọc</Button></div>
            <div className="mb-4 flex gap-2 overflow-x-auto pb-1">{filters.map((option) => <button type="button" key={option.value} onClick={() => setFilter(option.value)} className={`shrink-0 rounded-lg px-3 py-2 text-xs font-medium ${filter === option.value ? "bg-blue-600 text-white" : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"}`}>{option.label}</button>)}</div>
            {error && <Alert severity="error" className="mb-4" action={<Button color="inherit" size="small" onClick={() => void load()}>Thử lại</Button>}>{error}</Alert>}
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                {loading ? <div className="flex min-h-64 items-center justify-center"><CircularProgress /></div> : visible.length === 0 ? <div className="flex min-h-64 items-center justify-center text-sm text-slate-500">Chưa có thông báo trong mục này.</div> : visible.map((item) => {
                    const Icon = notificationIcons[item.type];
                    return <div key={item.id} className={`flex items-start gap-3 border-b border-slate-100 px-5 py-4 last:border-b-0 ${item.read ? "" : "bg-blue-50/60"}`}>
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600"><Icon size={18} /></span>
                        <button type="button" onClick={() => void runAction(async () => { if (!item.read) await notificationService.markAsRead(item.id); if (item.targetUrl) navigate(item.targetUrl); }, "Đã đánh dấu đã đọc")} className="min-w-0 flex-1 text-left"><span className="flex items-center gap-2 text-sm font-semibold text-slate-800">{item.title}{!item.read && <span className="h-2 w-2 rounded-full bg-blue-600" />}</span><span className="mt-1 block text-sm text-slate-600">{item.message}</span><span className="mt-1 block text-xs text-slate-400">{formatNotificationTime(item.createdAt)}</span></button>
                        <div className="flex shrink-0 gap-1">{!item.read && <button type="button" title="Đánh dấu đã đọc" aria-label={`Đánh dấu ${item.title} đã đọc`} onClick={() => void runAction(() => notificationService.markAsRead(item.id), "Đã đánh dấu đã đọc")} className="rounded-lg p-2 text-slate-400 hover:bg-white hover:text-blue-600"><CheckCheck size={17} /></button>}<button type="button" title="Xóa" aria-label={`Xóa ${item.title}`} onClick={() => void runAction(() => notificationService.deleteNotification(item.id), "Đã xóa thông báo")} className="rounded-lg p-2 text-slate-400 hover:bg-white hover:text-red-600"><Trash2 size={17} /></button></div>
                    </div>;
                })}
            </div>
            <Snackbar open={Boolean(message)} autoHideDuration={3000} onClose={() => setMessage("")} message={message} />
        </div>
    );
}
