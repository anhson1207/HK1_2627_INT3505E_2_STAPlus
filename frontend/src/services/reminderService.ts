import { mockReminders } from "../mocks/reminders";
import { customerService } from "./customerService";
import { dealService } from "./dealService";
import { leadService } from "./leadService";
import type { FollowUpReminder, ReminderEntityType, ReminderPayload } from "../types/reminder";

const STORAGE_KEY = "crm-soa.reminders";
export const REMINDERS_CHANGED_EVENT = "crm-soa:reminders-changed";
const wait = () => new Promise<void>((resolve) => window.setTimeout(resolve, 300));

function read(): FollowUpReminder[] {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
            const parsed: unknown = JSON.parse(raw);
            if (Array.isArray(parsed)) return parsed as FollowUpReminder[];
        }
    } catch { /* Restore seed reminders. */ }
    const seeded = mockReminders.map((item) => ({ ...item }));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
    return seeded;
}

function write(items: FollowUpReminder[]) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    window.dispatchEvent(new Event(REMINDERS_CHANGED_EVENT));
}

export function getEffectiveReminderStatus(reminder: FollowUpReminder): FollowUpReminder["status"] {
    return reminder.status === "COMPLETED" ? "COMPLETED" : Date.parse(reminder.dueAt) < Date.now() ? "OVERDUE" : "PENDING";
}

function withEffectiveStatus(item: FollowUpReminder): FollowUpReminder {
    return { ...item, status: getEffectiveReminderStatus(item) };
}

export function getReminderEntityUrl(type: ReminderEntityType, id: number): string {
    const segment = type === "LEAD" ? "leads" : type === "CUSTOMER" ? "customers" : "deals";
    return `/${segment}/${id}`;
}

async function getEntityName(type: ReminderEntityType, id: number): Promise<string> {
    if (type === "LEAD") {
        const lead = await leadService.getLeadById(id);
        return `${lead.firstName} ${lead.lastName}`.trim();
    }
    if (type === "CUSTOMER") return (await customerService.getCustomerById(id)).name;
    return (await dealService.getDealById(id)).name;
}

export const reminderService = {
    getReminders: async (): Promise<FollowUpReminder[]> => {
        await wait();
        return read().map(withEffectiveStatus).sort((a, b) => Date.parse(a.dueAt) - Date.parse(b.dueAt));
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
        await wait();
        const item = read().find((candidate) => candidate.id === id);
        if (!item) throw new Error("Không tìm thấy nhắc việc.");
        return withEffectiveStatus(item);
    },
    createReminder: async (data: ReminderPayload): Promise<FollowUpReminder> => {
        await wait();
        const entityName = await getEntityName(data.entityType, data.entityId);
        const items = read();
        const item: FollowUpReminder = { ...data, title: data.title.trim(), description: data.description?.trim(), ownerName: data.ownerName?.trim(), entityName, id: items.reduce((max, candidate) => Math.max(max, candidate.id), 0) + 1, status: "PENDING", createdAt: new Date().toISOString() };
        write([...items, item]);
        return withEffectiveStatus(item);
    },
    updateReminder: async (id: number, data: ReminderPayload): Promise<FollowUpReminder> => {
        await wait();
        const entityName = await getEntityName(data.entityType, data.entityId);
        const items = read();
        const index = items.findIndex((candidate) => candidate.id === id);
        if (index < 0) throw new Error("Không tìm thấy nhắc việc.");
        const item: FollowUpReminder = { ...items[index], ...data, title: data.title.trim(), description: data.description?.trim(), ownerName: data.ownerName?.trim(), entityName };
        items[index] = item;
        write(items);
        return withEffectiveStatus(item);
    },
    deleteReminder: async (id: number): Promise<void> => {
        await wait();
        const items = read();
        if (!items.some((candidate) => candidate.id === id)) throw new Error("Không tìm thấy nhắc việc.");
        write(items.filter((candidate) => candidate.id !== id));
    },
    completeReminder: async (id: number): Promise<FollowUpReminder> => {
        await wait();
        const items = read();
        const index = items.findIndex((candidate) => candidate.id === id);
        if (index < 0) throw new Error("Không tìm thấy nhắc việc.");
        items[index] = { ...items[index], status: "COMPLETED" };
        write(items);
        return withEffectiveStatus(items[index]);
    },
};
