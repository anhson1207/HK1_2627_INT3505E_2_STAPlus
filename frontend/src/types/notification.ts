export type NotificationType = "FOLLOW_UP" | "DEAL" | "TICKET" | "SYSTEM";

export interface Notification {
    id: number;
    type: NotificationType;
    title: string;
    message: string;
    read: boolean;
    createdAt: string;
    targetUrl?: string;
}
