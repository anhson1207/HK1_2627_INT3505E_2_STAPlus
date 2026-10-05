import type { ReminderStatus } from "../../types/reminder";

const statusMeta: Record<ReminderStatus, { label: string; style: string }> = {
    PENDING: { label: "Sắp tới", style: "bg-blue-50 text-blue-700 ring-blue-200" },
    OVERDUE: { label: "Quá hạn", style: "bg-red-50 text-red-700 ring-red-200" },
    COMPLETED: { label: "Đã hoàn thành", style: "bg-emerald-50 text-emerald-700 ring-emerald-200" },
};

export default function ReminderStatusBadge({ status }: { status: ReminderStatus }) {
    const meta = statusMeta[status];
    return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${meta.style}`}>{meta.label}</span>;
}
