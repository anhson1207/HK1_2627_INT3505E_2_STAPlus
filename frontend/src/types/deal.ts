export type DealStage = "NEW" | "QUALIFIED" | "PROPOSAL" | "NEGOTIATION" | "WON" | "LOST";
export type DiscountApprovalStatus = "NOT_REQUIRED" | "PENDING" | "APPROVED" | "REJECTED";

export interface Deal {
    id: number;
    name: string;
    customerId: number;
    customerName: string;
    value: number;
    stage: DealStage;
    probability: number;
    expectedCloseDate: string;
    ownerName?: string;
    description?: string;
    createdAt: string;
    discountPercent?: number;
    approvalStatus?: DiscountApprovalStatus;
    discountReason?: string;
    discountApprovedBy?: string;
    discountApprovedAt?: string;
}

export type DealPayload = Omit<Deal, "id" | "customerName" | "createdAt">;
