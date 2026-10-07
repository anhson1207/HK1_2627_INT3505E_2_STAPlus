import type { TicketPriority, TicketStatus } from "../types/ticket";

export const TICKET_STATUS_OPTIONS: ReadonlyArray<{ value: TicketStatus; label: string }> = [
    { value: "OPEN", label: "Đang mở" },
    { value: "IN_PROGRESS", label: "Đang xử lý" },
    { value: "RESOLVED", label: "Đã giải quyết" },
    { value: "CLOSED", label: "Đã đóng" },
];

export const TICKET_PRIORITY_OPTIONS: ReadonlyArray<{ value: TicketPriority; label: string }> = [
    { value: "LOW", label: "Thấp" },
    { value: "MEDIUM", label: "Trung bình" },
    { value: "HIGH", label: "Cao" },
    { value: "URGENT", label: "Khẩn cấp" },
];

export const SUPPORT_AGENT_OPTIONS = ["Trúc", "Hải Anh", "Support Agent 1"] as const;

export function getTicketStatusLabel(status: TicketStatus) {
    return TICKET_STATUS_OPTIONS.find((option) => option.value === status)?.label ?? status;
}

export function getTicketPriorityLabel(priority: TicketPriority) {
    return TICKET_PRIORITY_OPTIONS.find((option) => option.value === priority)?.label ?? priority;
}
