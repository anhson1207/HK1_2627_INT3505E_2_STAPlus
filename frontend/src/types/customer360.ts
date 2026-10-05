export type CustomerDealStage =
    | "NEW"
    | "QUALIFIED"
    | "PROPOSAL"
    | "NEGOTIATION"
    | "WON"
    | "LOST";

export interface CustomerDeal {
    id: number;
    customerId: number;
    name: string;
    value: number;
    stage: CustomerDealStage;
    expectedCloseDate: string;
}

export type ActivityType = "CALL" | "EMAIL" | "MEETING" | "NOTE";

export interface CustomerActivity {
    id: number;
    customerId: number;
    type: ActivityType;
    title: string;
    description: string;
    createdAt: string;
}

export type CustomerTicketPriority = "LOW" | "MEDIUM" | "HIGH";
export type CustomerTicketStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";

export interface CustomerTicket {
    id: number;
    customerId: number;
    subject: string;
    priority: CustomerTicketPriority;
    status: CustomerTicketStatus;
    createdAt: string;
}
