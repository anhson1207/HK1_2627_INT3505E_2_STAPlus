import { BadgeCheck, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { NOTIFICATIONS_CHANGED_EVENT, notificationService } from "../../services/notificationService";
import type { Notification } from "../../types/notification";
import { formatNotificationTime, notificationIcons } from "../../utils/notificationOptions";

interface NotificationDropdownProps {
    open: boolean;
    onClose: () => void;
}

export default function NotificationDropdown({ open, onClose }: NotificationDropdownProps) {
    const navigate = useNavigate();
    const [items, setItems] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!open) return;
        let active = true;
        const load = async () => {
            try {
                const data = await notificationService.getNotifications();
                if (active) { setItems(data.slice(0, 5)); setError(""); }
            } catch (loadError) {
                if (active) setError(loadError instanceof Error ? loadError.message : "Không thể tải thông báo.");
            } finally {
                if (active) setLoading(false);
            }
        };
        void load();
        window.addEventListener(NOTIFICATIONS_CHANGED_EVENT, load);
        return () => { active = false; window.removeEventListener(NOTIFICATIONS_CHANGED_EVENT, load); };
    }, [open]);

    if (!open) return null;

    const openNotification = async (item: Notification) => {
        try {
            if (!item.read) await notificationService.markAsRead(item.id);
            onClose();
            if (item.targetUrl) navigate(item.targetUrl);
        } catch (actionError) {
            setError(actionError instanceof Error ? actionError.message : "Không thể cập nhật thông báo.");
        }
    };

    const markAll = async () => {
        try { await notificationService.markAllAsRead(); }
        catch (actionError) { setError(actionError instanceof Error ? actionError.message : "Không thể cập nhật thông báo."); }
    };

    return (
        <div className="absolute right-0 top-11 z-50 w-[min(400px,calc(100vw-24px))] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl" role="dialog" aria-label="Thông báo">
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                <div><h2 className="text-sm font-semibold text-slate-900">Thông báo</h2><p className="mt-0.5 text-xs text-slate-500">Cập nhật mới nhất của bạn</p></div>
                <button type="button" aria-label="Đóng thông báo" onClick={onClose} className="rounded-md p-1 text-slate-400 hover:bg-slate-100"><X size={18} /></button>
            </div>
            {error && <p className="px-4 py-2 text-xs text-red-600">{error}</p>}
            {loading ? <p className="px-4 py-8 text-center text-sm text-slate-500">Đang tải...</p> : items.length === 0 ? <p className="px-4 py-10 text-center text-sm text-slate-500">Chưa có thông báo.</p> : (
                <div className="max-h-[380px] overflow-y-auto">
                    {items.map((item) => {
                        const Icon = notificationIcons[item.type];
                        return <button key={item.id} type="button" onClick={() => void openNotification(item)} className={`flex w-full gap-3 border-b border-slate-100 px-4 py-3 text-left last:border-b-0 hover:bg-slate-50 ${item.read ? "" : "bg-blue-50/60"}`}>
                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600"><Icon size={16} /></span>
                            <span className="min-w-0 flex-1"><span className="flex items-center gap-2 text-xs font-semibold text-slate-800">{item.title}{!item.read && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-blue-600" />}</span><span className="mt-1 block line-clamp-2 text-xs text-slate-600">{item.message}</span><span className="mt-1 block text-[11px] text-slate-400">{formatNotificationTime(item.createdAt)}</span></span>
                        </button>;
                    })}
                </div>
            )}
            <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3 text-xs font-medium">
                <button type="button" onClick={() => void markAll()} className="flex items-center gap-1.5 text-slate-500 hover:text-blue-600"><BadgeCheck size={15} /> Đánh dấu tất cả đã đọc</button>
                <button type="button" onClick={() => { onClose(); navigate("/notifications"); }} className="text-blue-600 hover:underline">Xem tất cả</button>
            </div>
        </div>
    );
}
