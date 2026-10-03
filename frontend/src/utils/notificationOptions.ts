import { Bell, BriefcaseBusiness, Clock3, Settings2, Ticket } from "lucide-react";
import type { NotificationType } from "../types/notification";

export const notificationIcons: Record<NotificationType, typeof Bell> = {
    FOLLOW_UP: Clock3, DEAL: BriefcaseBusiness, TICKET: Ticket, SYSTEM: Settings2,
};

export function formatNotificationTime(value: string): string {
    const minutes = Math.max(0, Math.floor((Date.now() - Date.parse(value)) / 60_000));
    if (minutes < 1) return "Vừa xong";
    if (minutes < 60) return `${minutes} phút trước`;
    if (minutes < 1440) return `${Math.floor(minutes / 60)} giờ trước`;
    return new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(value));
}
