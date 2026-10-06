import PageHeader from "../../components/common/PageHeader";
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
            <PageHeader title="Thông báo" description="Theo dõi các cập nhật và nhắc việc quan trọng" actions={<Button variant="outlined" startIcon={<CheckCheck size={17} />} onClick={() => void runAction(() => notificationService.markAllAsRead(), "Đã đánh dấu tất cả là đã đọc")}>Đánh dấu tất cả đã đọc</Button>} />
            <div className="mb-4 flex gap-2 overflow-x-auto pb-1">{filters.map((option) => <button type="button" key={option.value} onClick={() => setFilter(option.value)} className={`shrink-0 rounded-lg px-3 py-2 text-xs font-medium ${filter === option.value ? "bg-(--crm-primary) text-(--crm-on-primary)" : "border border-(--crm-border) bg-(--crm-surface) text-(--crm-text-secondary) hover:bg-(--crm-surface-subtle)"}`}>{option.label}</button>)}</div>
            {error && <Alert severity="error" className="mb-4" action={<Button color="inherit" size="small" onClick={() => void load()}>Thử lại</Button>}>{error}</Alert>}
            <div className="crm-board">
                {loading ? <div className="flex min-h-64 items-center justify-center"><CircularProgress /></div> : visible.length === 0 ? <div className="flex min-h-64 items-center justify-center text-sm text-(--crm-text-secondary)">Chưa có thông báo trong mục này.</div> : visible.map((item) => {
                    const Icon = notificationIcons[item.type];
                    return <div key={item.id} className={`crm-notification crm-notification--with-actions ${item.read ? "" : "is-unread"}`}>
                        <span className="crm-notification__icon"><Icon size={18} /></span>
                        <button type="button" onClick={() => void runAction(async () => { if (!item.read) await notificationService.markAsRead(item.id); if (item.targetUrl) navigate(item.targetUrl); }, "Đã đánh dấu đã đọc")} className="min-w-0 flex-1 text-left"><span className="flex items-center gap-2 text-sm font-semibold text-(--crm-heading)">{item.title}{!item.read && <span className="h-2 w-2 rounded-full bg-(--crm-primary)" />}</span><span className="mt-1 block text-sm text-(--crm-text-secondary)">{item.message}</span><span className="mt-1 block text-xs text-(--crm-text-muted)">{formatNotificationTime(item.createdAt)}</span></button>
                        <div className="flex shrink-0 gap-1">{!item.read && <button type="button" title="Đánh dấu đã đọc" aria-label={`Đánh dấu ${item.title} đã đọc`} onClick={() => void runAction(() => notificationService.markAsRead(item.id), "Đã đánh dấu đã đọc")} className="rounded-lg p-2 text-(--crm-text-muted) hover:bg-(--crm-surface) hover:text-(--crm-primary)"><CheckCheck size={17} /></button>}<button type="button" title="Xóa" aria-label={`Xóa ${item.title}`} onClick={() => void runAction(() => notificationService.deleteNotification(item.id), "Đã xóa thông báo")} className="rounded-lg p-2 text-(--crm-text-muted) hover:bg-(--crm-surface) hover:text-(--crm-danger)"><Trash2 size={17} /></button></div>
                    </div>;
                })}
            </div>
            <Snackbar open={Boolean(message)} autoHideDuration={3000} onClose={() => setMessage("")} message={message} />
        </div>
    );
}
