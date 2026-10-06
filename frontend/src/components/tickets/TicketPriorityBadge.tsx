import type { TicketPriority } from "../../types/ticket";
import { getTicketPriorityLabel } from "../../utils/ticketOptions";

const priorityClasses: Record<TicketPriority, string> = {
    LOW: "crm-status--inactive",
    MEDIUM: "crm-status--contacted",
    HIGH: "crm-status--proposal",
    URGENT: "crm-status--urgent",
};

export default function TicketPriorityBadge({ priority }: { priority: TicketPriority }) {
    return <span className={`crm-status ${priorityClasses[priority]}`}>{getTicketPriorityLabel(priority)}</span>;
}
