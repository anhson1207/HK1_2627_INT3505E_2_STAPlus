import type { TicketStatus } from "../../types/ticket";
import { getTicketStatusLabel } from "../../utils/ticketOptions";

const statusClasses: Record<TicketStatus, string> = {
    OPEN: "crm-status--open",
    IN_PROGRESS: "crm-status--progress",
    RESOLVED: "crm-status--resolved",
    CLOSED: "crm-status--closed",
};

export default function TicketStatusBadge({ status }: { status: TicketStatus }) {
    return <span className={`crm-status ${statusClasses[status]}`}>{getTicketStatusLabel(status)}</span>;
}
