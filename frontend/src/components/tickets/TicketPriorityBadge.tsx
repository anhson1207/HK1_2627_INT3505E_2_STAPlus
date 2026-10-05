import type { TicketPriority } from "../../types/ticket";
import { getTicketPriorityLabel } from "../../utils/ticketOptions";

const priorityClasses: Record<TicketPriority, string> = {
    LOW: "border-slate-200 bg-slate-50 text-slate-600",
    MEDIUM: "border-amber-200 bg-amber-50 text-amber-700",
    HIGH: "border-orange-200 bg-orange-50 text-orange-700",
    URGENT: "border-red-300 bg-red-600 font-semibold text-white shadow-sm shadow-red-200",
};

export default function TicketPriorityBadge({ priority }: { priority: TicketPriority }) {
    return <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${priorityClasses[priority]}`}>{getTicketPriorityLabel(priority)}</span>;
}
