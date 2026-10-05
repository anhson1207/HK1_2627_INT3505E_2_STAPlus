export type TicketStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
export type TicketPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

export interface Ticket {
    id: number;
    subject: string;
    description: string;
    customerId: number;
    customerName: string;
    priority: TicketPriority;
    status: TicketStatus;
    assignedTo?: string;
    createdAt: string;
    updatedAt?: string;
}

export type TicketPayload = Omit<Ticket, "id" | "customerName" | "createdAt" | "updatedAt">;
