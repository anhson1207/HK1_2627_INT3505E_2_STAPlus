import type { TicketPriority, TicketStatus } from "../types/ticket";

const SLA_HOURS: Record<TicketPriority, number> = {
    URGENT: 4,
    HIGH: 8,
    MEDIUM: 24,
    LOW: 48,
};

export type SlaState = "ON_TRACK" | "AT_RISK" | "OVERDUE" | "COMPLETED";

export function getTicketSla(
    createdAt: string,
    priority: TicketPriority,
    status: TicketStatus,
    now = Date.now(),
) {
    const createdTime = new Date(createdAt).getTime();

    if (Number.isNaN(createdTime)) {
        return {
            state: "ON_TRACK" as SlaState,
            deadline: null,
            remainingMs: null,
            label: "Không xác định",
        };
    }

    const deadline = createdTime + SLA_HOURS[priority] * 60 * 60 * 1000;
    const remainingMs = deadline - now;

    if (status === "RESOLVED" || status === "CLOSED") {
        return {
            state: "COMPLETED" as SlaState,
            deadline,
            remainingMs,
            label: "Đã hoàn thành",
        };
    }

    if (remainingMs <= 0) {
        return {
            state: "OVERDUE" as SlaState,
            deadline,
            remainingMs,
            label: "Quá hạn",
        };
    }

    if (remainingMs <= 60 * 60 * 1000) {
        return {
            state: "AT_RISK" as SlaState,
            deadline,
            remainingMs,
            label: "Sắp đến hạn",
        };
    }

    const hours = Math.floor(remainingMs / (60 * 60 * 1000));
    const minutes = Math.floor((remainingMs % (60 * 60 * 1000)) / (60 * 1000));

    return {
        state: "ON_TRACK" as SlaState,
        deadline,
        remainingMs,
        label: `Còn ${hours} giờ ${minutes} phút`,
    };
}