import api from "./api";
import { mockReminders } from "../mocks/reminders";
import { customerService } from "./customerService";
import { dealService } from "./dealService";
import { leadService } from "./leadService";
import type { FollowUpReminder, ReminderEntityType, ReminderPayload } from "../types/reminder";

const STORAGE_KEY = "crm-soa.reminders";
export const REMINDERS_CHANGED_EVENT = "crm-soa:reminders-changed";

interface BackendFollowUpResponse {
    id: number;
    title: string;
    message?: string;
    targetUrl?: string;
    type?: string;
    createdAt?: string;
}

function read(): FollowUpReminder[] {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
            const parsed: unknown = JSON.parse(raw);
            if (Array.isArray(parsed)) return parsed as FollowUpReminder[];
        }
    } catch {
        /* Restore seed reminders. */
    }
    const seeded = mockReminders.map((item) => ({ ...item }));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
    return seeded;
}

function write(items: FollowUpReminder[]) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    if (typeof window !== "undefined") {
        window.dispatchEvent(new Event(REMINDERS_CHANGED_EVENT));
    }
}

export function getEffectiveReminderStatus(reminder: FollowUpReminder): FollowUpReminder["status"] {
    return reminder.status === "COMPLETED"
        ? "COMPLETED"
        : Date.parse(reminder.dueAt) < Date.now()
          ? "OVERDUE"
          : "PENDING";
}

function withEffectiveStatus(item: FollowUpReminder): FollowUpReminder {
    return { ...item, status: getEffectiveReminderStatus(item) };
}

export function getReminderEntityUrl(type: ReminderEntityType, id: number): string {
    const segment = type === "LEAD" ? "leads" : type === "CUSTOMER" ? "customers" : "deals";
    return `/${segment}/${id}`;
}

async function getEntityName(type: ReminderEntityType, id: number): Promise<string> {
    try {
        if (type === "LEAD") {
            const lead = await leadService.getLeadById(id);
            return `${lead.firstName} ${lead.lastName}`.trim();
        }
        if (type === "CUSTOMER") {
            const customer = await customerService.getCustomerById(id);
            return customer.name;
        }
        const deal = await dealService.getDealById(id);
        return deal.name;
    } catch {
        return `${type} #${id}`;
    }
}

export const reminderService = {
    // GET reminders (with sync from backend /notifications if available)
    getReminders: async (): Promise<FollowUpReminder[]> => {
        try {
            const response = await api.get<Array<{
                id: number;
                title: string;
                message?: string;
                targetUrl?: string;
                type?: string;
                createdAt?: string;
                read?: boolean;
                isRead?: boolean;
            }>>("/notifications");

            if (Array.isArray(response.data)) {
                const followUps = response.data.filter((n) => n.type === "FOLLOW_UP");
                const currentItems = read();
                let hasNew = false;

                followUps.forEach((n) => {
                    if (!currentItems.some((item) => item.id === n.id)) {
                        const parts = (n.targetUrl || "").split("/").filter(Boolean);
                        const entityType: ReminderEntityType =
                            parts[0] === "leads" ? "LEAD" : parts[0] === "deals" ? "DEAL" : "CUSTOMER";
                        const entityId = Number(parts[1]) || 1;

                        currentItems.push({
                            id: n.id,
                            title: n.title,
                            description: n.message,
                            dueAt: n.createdAt || new Date().toISOString(),
                            status: (n.read ?? n.isRead) ? "COMPLETED" : "PENDING",
                            entityType,
                            entityId,
                            entityName: n.title,
                            createdAt: n.createdAt || new Date().toISOString(),
                        });
                        hasNew = true;
                    }
                });

                if (hasNew) {
                    write(currentItems);
                }
            }
        } catch (error) {
            console.warn("Backend GET /notifications sync unavailable, using local cache:", error);
        }

        return read()
            .map(withEffectiveStatus)
            .sort((a, b) => Date.parse(a.dueAt) - Date.parse(b.dueAt));
    },

    getUpcomingReminders: async (): Promise<FollowUpReminder[]> => {
        const items = await reminderService.getReminders();
        return items.filter((item) => item.status === "PENDING");
    },

    getOverdueReminders: async (): Promise<FollowUpReminder[]> => {
        const items = await reminderService.getReminders();
        return items.filter((item) => item.status === "OVERDUE");
    },

    getReminderById: async (id: number): Promise<FollowUpReminder> => {
        const item = read().find((candidate) => candidate.id === id);
        if (!item) throw new Error("Không tìm thấy nhắc việc.");
        return withEffectiveStatus(item);
    },

    // POST /api/v1/notifications/follow-up to persist to backend database
    createReminder: async (data: ReminderPayload): Promise<FollowUpReminder> => {
        const entityName = await getEntityName(data.entityType, data.entityId);
        const targetUrl = getReminderEntityUrl(data.entityType, data.entityId);

        const followUpPayload = {
            title: data.title.trim(),
            message: data.description?.trim() || `Lịch hẹn/nhắc việc cho ${entityName} (Hạn: ${data.dueAt})`,
            targetUrl,
            dueAt: data.dueAt,
            entityType: data.entityType,
            entityId: String(data.entityId),
            entityName,
            ownerName: data.ownerName?.trim(),
        };

        let backendId: number | undefined;

        try {
            const response = await api.post<BackendFollowUpResponse>(
                "/notifications/follow-up",
                followUpPayload,
            );
            if (response.data && typeof response.data.id === "number") {
                backendId = response.data.id;
            }
        } catch (error) {
            console.warn("Backend POST /api/v1/notifications/follow-up unavailable, saving locally:", error);
        }

        const items = read();
        const nextId = backendId ?? (items.reduce((max, candidate) => Math.max(max, candidate.id), 0) + 1);

        const item: FollowUpReminder = {
            ...data,
            id: nextId,
            title: data.title.trim(),
            description: data.description?.trim(),
            ownerName: data.ownerName?.trim(),
            entityName,
            status: "PENDING",
            createdAt: new Date().toISOString(),
        };

        write([...items, item]);
        return withEffectiveStatus(item);
    },

    updateReminder: async (id: number, data: ReminderPayload): Promise<FollowUpReminder> => {
        const entityName = await getEntityName(data.entityType, data.entityId);
        const items = read();
        const index = items.findIndex((candidate) => candidate.id === id);
        if (index < 0) throw new Error("Không tìm thấy nhắc việc.");

        const item: FollowUpReminder = {
            ...items[index],
            ...data,
            title: data.title.trim(),
            description: data.description?.trim(),
            ownerName: data.ownerName?.trim(),
            entityName,
        };

        items[index] = item;
        write(items);
        return withEffectiveStatus(item);
    },

    deleteReminder: async (id: number): Promise<void> => {
        try {
            await api.delete(`/notifications/${id}`);
        } catch {
            // ignore if endpoint not present
        }

        const items = read();
        if (!items.some((candidate) => candidate.id === id)) {
            throw new Error("Không tìm thấy nhắc việc.");
        }
        write(items.filter((candidate) => candidate.id !== id));
    },

    completeReminder: async (id: number): Promise<FollowUpReminder> => {
        try {
            await api.patch(`/notifications/${id}/read`);
        } catch {
            // ignore if endpoint not present
        }

        const items = read();
        const index = items.findIndex((candidate) => candidate.id === id);
        if (index < 0) throw new Error("Không tìm thấy nhắc việc.");

        items[index] = { ...items[index], status: "COMPLETED" };
        write(items);
        return withEffectiveStatus(items[index]);
    },
};
