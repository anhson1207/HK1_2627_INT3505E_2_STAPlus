import PageHeader from "../../components/common/PageHeader";
import { Alert, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Snackbar } from "@mui/material";
import { CalendarClock, Check, Clock3, ExternalLink, Pencil, Plus, Trash2, TriangleAlert } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import ReminderStatusBadge from "../../components/reminders/ReminderStatusBadge";
import { getReminderEntityUrl, reminderService } from "../../services/reminderService";
import type { FollowUpReminder } from "../../types/reminder";

type Filter = "ALL" | "TODAY" | "PENDING" | "OVERDUE" | "COMPLETED";
const dateFormat = new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });

function isToday(value: string): boolean {
    const date = new Date(value);
    const today = new Date();
    return date.getFullYear() === today.getFullYear() && date.getMonth() === today.getMonth() && date.getDate() === today.getDate();
}

export default function ReminderListPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const routeMessage = typeof location.state === "object" && location.state && "message" in location.state && typeof location.state.message === "string" ? location.state.message : "";
    const [items, setItems] = useState<FollowUpReminder[]>([]);
    const [loading, setLoading] = useState(true);
    const [busyId, setBusyId] = useState<number | null>(null);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [filter, setFilter] = useState<Filter>("ALL");
    const [error, setError] = useState("");
    const [message, setMessage] = useState(routeMessage);

    const load = useCallback(async () => {
        try { setItems(await reminderService.getReminders()); setError(""); }
        catch (loadError) { setError(loadError instanceof Error ? loadError.message : "Không thể tải nhắc việc."); }
        finally { setLoading(false); }
    }, []);
    useEffect(() => { const timer = window.setTimeout(() => void load(), 0); return () => window.clearTimeout(timer); }, [load]);

    const complete = async (id: number) => {
        setBusyId(id);
        const previous = items;
        setItems((current) => current.map((item) => item.id === id ? { ...item, status: "COMPLETED" } : item));
        try {
            const updated = await reminderService.completeReminder(id);
            setItems((current) => current.map((item) => item.id === id ? updated : item));
            setMessage("Đã hoàn thành nhắc việc");
        } catch (actionError) { setItems(previous); setError(actionError instanceof Error ? actionError.message : "Không thể hoàn thành nhắc việc."); }
        finally { setBusyId(null); }
    };
    const remove = async () => {
        if (deleteId === null) return;
        setBusyId(deleteId);
        try {
            await reminderService.deleteReminder(deleteId);
            setItems((current) => current.filter((item) => item.id !== deleteId));
            setMessage("Đã xóa nhắc việc");
            setDeleteId(null);
        } catch (actionError) { setError(actionError instanceof Error ? actionError.message : "Không thể xóa nhắc việc."); }
        finally { setBusyId(null); }
    };

    const counts = {
        TODAY: items.filter((item) => item.status !== "COMPLETED" && isToday(item.dueAt)).length,
        PENDING: items.filter((item) => item.status === "PENDING").length,
        OVERDUE: items.filter((item) => item.status === "OVERDUE").length,
        COMPLETED: items.filter((item) => item.status === "COMPLETED").length,
    };
    const cards = [
        { key: "TODAY" as const, label: "Hôm nay", icon: CalendarClock, color: "bg-(--crm-info-soft) text-(--crm-primary)" },
        { key: "PENDING" as const, label: "Sắp tới", icon: Clock3, color: "bg-(--crm-info-soft) text-(--crm-primary)" },
        { key: "OVERDUE" as const, label: "Quá hạn", icon: TriangleAlert, color: "bg-(--crm-danger-soft) text-(--crm-danger)" },
        { key: "COMPLETED" as const, label: "Đã hoàn thành", icon: Check, color: "bg-(--crm-success-soft) text-(--crm-green-dark)" },
    ];
    const visible = items.filter((item) => filter === "ALL" || (filter === "TODAY" ? item.status !== "COMPLETED" && isToday(item.dueAt) : item.status === filter));

    return <div>
        <PageHeader title="Follow-up Reminders" description="Quản lý lịch chăm sóc khách hàng" actions={<Button variant="contained" startIcon={<Plus size={17} />} onClick={() => navigate("/reminders/new")}>Tạo nhắc việc</Button>} />
        <div className="crm-kpi-grid mb-5">{cards.map(({ key, label, icon: Icon, color }) => <button type="button" key={key} onClick={() => setFilter(key)} className={`crm-kpi text-left ${filter === key ? "border-(--crm-primary-soft) ring-2 ring-(--crm-primary-soft)" : "border-(--crm-border)"}`}><div className="flex items-start justify-between"><div><p className="crm-kpi__label">{label}</p><p className="crm-kpi__value">{counts[key]}</p></div><span className={`crm-kpi__icon ${color}`}><Icon size={19} /></span></div></button>)}</div>
        {error && <Alert severity="error" className="mb-4" action={<Button color="inherit" size="small" onClick={() => void load()}>Thử lại</Button>}>{error}</Alert>}
        <div className="crm-board">
            <div className="flex items-center gap-2 border-b border-(--crm-border) px-5 py-4"><h2 className="mr-auto text-sm font-semibold text-(--crm-heading)">Danh sách nhắc việc</h2><select aria-label="Lọc nhắc việc" value={filter} onChange={(event) => setFilter(event.target.value as Filter)} className="rounded-lg border border-(--crm-border) px-3 py-2 text-xs text-(--crm-text-secondary)"><option value="ALL">Tất cả</option><option value="TODAY">Hôm nay</option><option value="PENDING">Sắp tới</option><option value="OVERDUE">Quá hạn</option><option value="COMPLETED">Đã hoàn thành</option></select></div>
            {loading ? <div className="flex min-h-64 items-center justify-center"><CircularProgress /></div> : visible.length === 0 ? <div className="flex min-h-64 flex-col items-center justify-center text-(--crm-text-muted)"><CalendarClock size={32} /><p className="mt-3 text-sm">Chưa có nhắc việc trong mục này.</p></div> : <div className="crm-table-wrap"><table className="crm-table"><thead><tr className="border-b border-(--crm-border) bg-(--crm-surface-subtle) text-left text-xs text-(--crm-text-secondary)"><th className="px-5 py-3">Tiêu đề</th><th className="px-4 py-3">Liên quan</th><th className="px-4 py-3">Đến hạn</th><th className="px-4 py-3">Trạng thái</th><th className="px-4 py-3">Phụ trách</th><th className="px-4 py-3">Thao tác</th></tr></thead><tbody>{visible.map((item) => <tr key={item.id} className={`border-b border-(--crm-border-subtle) last:border-b-0 ${item.status === "OVERDUE" ? "is-overdue" : "hover:bg-(--crm-surface-subtle)"}`}><td className="px-5 py-4"><span className="text-sm font-medium text-(--crm-heading)">{item.title}</span>{item.description && <p className="mt-1 max-w-56 truncate text-xs text-(--crm-text-secondary)">{item.description}</p>}</td><td className="px-4 py-4"><button type="button" onClick={() => navigate(getReminderEntityUrl(item.entityType, item.entityId))} className="inline-flex items-center gap-1 text-sm text-(--crm-primary) hover:underline">{item.entityName}<ExternalLink size={13} /></button><p className="mt-1 text-[11px] text-(--crm-text-muted)">{item.entityType}</p></td><td className={`px-4 py-4 text-xs ${item.status === "OVERDUE" ? "font-semibold text-(--crm-danger)" : "text-(--crm-text-secondary)"}`}>{dateFormat.format(new Date(item.dueAt))}</td><td className="px-4 py-4"><ReminderStatusBadge status={item.status} /></td><td className="px-4 py-4 text-sm text-(--crm-text-secondary)">{item.ownerName || "—"}</td><td className="px-4 py-4"><div className="flex gap-1">{item.status !== "COMPLETED" && <button type="button" title="Hoàn thành" aria-label={`Hoàn thành ${item.title}`} disabled={busyId === item.id} onClick={() => void complete(item.id)} className="rounded-lg p-2 text-(--crm-green-dark) hover:bg-(--crm-success-soft) disabled:opacity-50"><Check size={17} /></button>}<button type="button" title="Chỉnh sửa" aria-label={`Chỉnh sửa ${item.title}`} onClick={() => navigate(`/reminders/${item.id}/edit`)} className="rounded-lg p-2 text-(--crm-primary) hover:bg-(--crm-info-soft)"><Pencil size={17} /></button><button type="button" title="Xóa" aria-label={`Xóa ${item.title}`} onClick={() => setDeleteId(item.id)} className="rounded-lg p-2 text-(--crm-danger) hover:bg-(--crm-danger-soft)"><Trash2 size={17} /></button></div></td></tr>)}</tbody></table></div>}
        </div>
        <Dialog open={deleteId !== null} onClose={() => setDeleteId(null)}><DialogTitle>Xóa nhắc việc?</DialogTitle><DialogContent><DialogContentText>Nhắc việc sẽ bị xóa khỏi danh sách. Bạn có chắc muốn tiếp tục?</DialogContentText></DialogContent><DialogActions><Button onClick={() => setDeleteId(null)}>Hủy</Button><Button color="error" onClick={() => void remove()} disabled={busyId !== null}>Xóa</Button></DialogActions></Dialog>
        <Snackbar open={Boolean(message)} autoHideDuration={3000} onClose={() => setMessage("")} message={message} />
    </div>;
}
