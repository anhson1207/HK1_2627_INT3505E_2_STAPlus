import type { ReminderStatus } from "../../types/reminder";

const statusMeta: Record<ReminderStatus, { label: string; style: string }> = {
    PENDING: { label: "Sắp tới", style: "crm-status--new" },
    OVERDUE: { label: "Quá hạn", style: "crm-status--urgent" },
    COMPLETED: { label: "Đã hoàn thành", style: "crm-status--completed" },
};

export default function ReminderStatusBadge({ status }: { status: ReminderStatus }) {
    const meta = statusMeta[status];
    return <span className={`crm-status ${meta.style}`}>{meta.label}</span>;
}
