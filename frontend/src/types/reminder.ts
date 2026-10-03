export type ReminderStatus = "PENDING" | "COMPLETED" | "OVERDUE";
export type ReminderEntityType = "LEAD" | "CUSTOMER" | "DEAL";

export interface FollowUpReminder {
    id: number;
    title: string;
    description?: string;
    dueAt: string;
    status: ReminderStatus;
    entityType: ReminderEntityType;
    entityId: number;
    entityName: string;
    ownerName?: string;
    createdAt: string;
}

export type ReminderPayload = Pick<FollowUpReminder, "title" | "description" | "dueAt" | "entityType" | "entityId" | "ownerName">;
