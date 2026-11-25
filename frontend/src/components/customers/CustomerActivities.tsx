import { Alert, Button, MenuItem, TextField } from "@mui/material";
import { CalendarClock, Mail, MessageSquareText, Phone, Plus, StickyNote, Trash2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useState, type FormEvent } from "react";

import type { ActivityType, CustomerActivity } from "../../types/customer360";

interface CustomerActivitiesProps {
    activities: readonly CustomerActivity[];
    onCreate?: (payload: { type: ActivityType; title: string; description?: string }) => Promise<void>;
    onDelete?: (activityId: number) => Promise<void>;
}

const activityConfig: Record<ActivityType, { label: string; icon: LucideIcon; className: string }> = {
    CALL: { label: "Cuộc gọi", icon: Phone, className: "bg-(--crm-info-soft) text-(--crm-primary)" },
    EMAIL: { label: "Email", icon: Mail, className: "bg-(--crm-surface-selected) text-(--crm-purple)" },
    MEETING: { label: "Cuộc họp", icon: MessageSquareText, className: "bg-(--crm-success-soft) text-(--crm-green-dark)" },
    NOTE: { label: "Ghi chú", icon: StickyNote, className: "bg-(--crm-warning-soft) text-(--crm-warning)" },
};

const dateTimeFormatter = new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
});

export default function CustomerActivities({ activities, onCreate, onDelete }: CustomerActivitiesProps) {
    const [showForm, setShowForm] = useState(false);
    const [type, setType] = useState<ActivityType>("CALL");
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [formError, setFormError] = useState("");
    const [deletingId, setDeletingId] = useState<number | null>(null);

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();
        if (!onCreate) return;
        if (!title.trim()) {
            setFormError("Vui lòng nhập tiêu đề hoạt động.");
            return;
        }
        setSubmitting(true);
        setFormError("");
        try {
            await onCreate({ type, title: title.trim(), description: description.trim() });
            setTitle("");
            setDescription("");
            setShowForm(false);
        } catch (err) {
            setFormError(err instanceof Error ? err.message : "Không thể lưu hoạt động.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (activityId: number) => {
        if (!onDelete) return;
        setDeletingId(activityId);
        try {
            await onDelete(activityId);
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div className="space-y-4">
            {onCreate && (
                <div className="flex items-center justify-between">
                    <p className="text-sm text-(--crm-text-secondary)">
                        Nhật ký tương tác với khách hàng ({activities.length})
                    </p>
                    <Button
                        size="small"
                        variant={showForm ? "outlined" : "contained"}
                        startIcon={<Plus size={15} />}
                        onClick={() => {
                            setShowForm((prev) => !prev);
                            setFormError("");
                        }}
                        sx={{ textTransform: "none", fontWeight: 600 }}
                    >
                        {showForm ? "Đóng biểu mẫu" : "Thêm hoạt động"}
                    </Button>
                </div>
            )}

            {showForm && onCreate && (
                <form onSubmit={handleSubmit} className="crm-card crm-card__body space-y-3">
                    {formError && <Alert severity="error">{formError}</Alert>}
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                        <TextField
                            select
                            size="small"
                            label="Loại hoạt động"
                            value={type}
                            onChange={(e) => setType(e.target.value as ActivityType)}
                            disabled={submitting}
                        >
                            <MenuItem value="CALL">Cuộc gọi</MenuItem>
                            <MenuItem value="EMAIL">Email</MenuItem>
                            <MenuItem value="MEETING">Cuộc họp</MenuItem>
                            <MenuItem value="NOTE">Ghi chú</MenuItem>
                        </TextField>
                        <TextField
                            size="small"
                            label="Tiêu đề hoạt động"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                            disabled={submitting}
                            className="sm:col-span-2"
                        />
                    </div>
                    <TextField
                        size="small"
                        label="Chi tiết / Nội dung trao đổi"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        multiline
                        minRows={2}
                        fullWidth
                        disabled={submitting}
                    />
                    <div className="flex justify-end gap-2">
                        <Button size="small" onClick={() => setShowForm(false)} disabled={submitting} sx={{ textTransform: "none" }}>
                            Hủy
                        </Button>
                        <Button type="submit" size="small" variant="contained" disabled={submitting} sx={{ textTransform: "none", fontWeight: 600 }}>
                            {submitting ? "Đang lưu..." : "Lưu hoạt động"}
                        </Button>
                    </div>
                </form>
            )}

            {activities.length === 0 ? (
                <div className="flex min-h-64 flex-col items-center justify-center rounded-lg border border-(--crm-border) bg-(--crm-surface) px-6 text-center">
                    <div className="mb-3 rounded-full bg-(--crm-surface-hover) p-4 text-(--crm-text-muted)"><CalendarClock size={26} /></div>
                    <p className="font-medium text-(--crm-text)">Chưa có hoạt động nào</p>
                </div>
            ) : (
                <div className="crm-card crm-card__body">
                    <div className="crm-timeline">
                        {activities.map((activity) => {
                            const config = activityConfig[activity.type] ?? activityConfig.NOTE;
                            const Icon = config.icon;
                            const parsedDate = Date.parse(activity.createdAt);

                            return (
                                <div key={activity.id} className="crm-timeline-item">
                                    <div className={`crm-timeline-item__icon ${config.className}`}>
                                        <Icon size={18} />
                                    </div>
                                    <div className="min-w-0 flex-1 pt-0.5">
                                        <div className="flex flex-wrap items-center justify-between gap-2">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span className="text-xs font-semibold uppercase tracking-wide text-(--crm-text-secondary)">{config.label}</span>
                                                <span className="text-xs text-(--crm-text-muted)">
                                                    {Number.isNaN(parsedDate) ? "—" : dateTimeFormatter.format(new Date(parsedDate))}
                                                </span>
                                            </div>
                                            {onDelete && (
                                                <button
                                                    type="button"
                                                    onClick={() => void handleDelete(activity.id)}
                                                    disabled={deletingId === activity.id}
                                                    className="rounded p-1 text-(--crm-text-muted) hover:bg-(--crm-danger-soft) hover:text-(--crm-danger) disabled:opacity-50"
                                                    aria-label="Xóa hoạt động"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            )}
                                        </div>
                                        <h3 className="mt-1 text-sm font-semibold text-(--crm-heading)">{activity.title}</h3>
                                        {activity.description && (
                                            <p className="mt-1 text-sm text-(--crm-text-secondary)">{activity.description}</p>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
