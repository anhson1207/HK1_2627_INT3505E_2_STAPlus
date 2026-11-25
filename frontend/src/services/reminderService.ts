import api from "./api";
import { customerService } from "./customerService";
import { dealService } from "./dealService";
import { leadService } from "./leadService";
import type { FollowUpReminder, ReminderEntityType, ReminderPayload } from "../types/reminder";

export const REMINDERS_CHANGED_EVENT = "crm-soa:reminders-changed";

interface BackendReminderResponse {
    id: number;
    userId?: number | null;
    title: string;
    description?: string | null;
    dueAt: string;
    status: string;
    entityType: ReminderEntityType | string;
    entityId: number;
    entityName: string;
    ownerName?: string | null;
    createdAt: string;
}

function notifyChange() {
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

function normalizeEntityType(value: string): ReminderEntityType {
    const upper = value?.toUpperCase();
    if (upper === "LEAD" || upper === "CUSTOMER" || upper === "DEAL") {
        return upper;
    }
    return "CUSTOMER";
}

function mapReminderFromApi(item: BackendReminderResponse): FollowUpReminder {
    const mapped: FollowUpReminder = {
        id: item.id,
        userId: item.userId ?? undefined,
        title: item.title,
        description: item.description ?? undefined,
        dueAt: item.dueAt,
        status: item.status === "COMPLETED" ? "COMPLETED" : "PENDING",
        entityType: normalizeEntityType(item.entityType),
        entityId: item.entityId,
        entityName: item.entityName,
        ownerName: item.ownerName ?? undefined,
        createdAt: item.createdAt,
    };
    return { ...mapped, status: getEffectiveReminderStatus(mapped) };
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
    getReminders: async (entityType?: ReminderEntityType, entityId?: number): Promise<FollowUpReminder[]> => {
        const response = await api.get<BackendReminderResponse[]>("/reminders", {
            params:
                entityType && entityId
                    ? { entityType, entityId }
                    : undefined,
        });
        const list = Array.isArray(response.data) ? response.data : [];
        return list
            .map(mapReminderFromApi)
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
        const response = await api.get<BackendReminderResponse>(`/reminders/${id}`);
        return mapReminderFromApi(response.data);
    },

    createReminder: async (data: ReminderPayload): Promise<FollowUpReminder> => {
        const entityName = await getEntityName(data.entityType, data.entityId);
        const response = await api.post<BackendReminderResponse>("/reminders", {
            title: data.title.trim(),
            description: data.description?.trim() || "",
            dueAt: data.dueAt,
            entityType: data.entityType,
            entityId: data.entityId,
            entityName,
            ownerName: data.ownerName?.trim() || undefined,
        });
        notifyChange();
        return mapReminderFromApi(response.data);
    },

    updateReminder: async (id: number, data: ReminderPayload): Promise<FollowUpReminder> => {
        const entityName = await getEntityName(data.entityType, data.entityId);
        const response = await api.put<BackendReminderResponse>(`/reminders/${id}`, {
            title: data.title.trim(),
            description: data.description?.trim() || "",
            dueAt: data.dueAt,
            entityType: data.entityType,
            entityId: data.entityId,
            entityName,
            ownerName: data.ownerName?.trim() || undefined,
        });
        notifyChange();
        return mapReminderFromApi(response.data);
    },

    deleteReminder: async (id: number): Promise<void> => {
        await api.delete(`/reminders/${id}`);
        notifyChange();
    },

    completeReminder: async (id: number): Promise<FollowUpReminder> => {
        const response = await api.patch<BackendReminderResponse>(`/reminders/${id}/complete`);
        notifyChange();
        return mapReminderFromApi(response.data);
    },
};
