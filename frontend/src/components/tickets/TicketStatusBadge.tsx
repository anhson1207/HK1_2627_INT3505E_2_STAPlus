import type { TicketStatus } from "../../types/ticket";
import { getTicketStatusLabel } from "../../utils/ticketOptions";

const statusClasses: Record<TicketStatus, string> = {
    OPEN: "border-blue-200 bg-blue-50 text-blue-700",
    IN_PROGRESS: "border-violet-200 bg-violet-50 text-violet-700",
    RESOLVED: "border-emerald-200 bg-emerald-50 text-emerald-700",
    CLOSED: "border-slate-200 bg-slate-100 text-slate-600",
};

export default function TicketStatusBadge({ status }: { status: TicketStatus }) {
    return <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${statusClasses[status]}`}>{getTicketStatusLabel(status)}</span>;
}
