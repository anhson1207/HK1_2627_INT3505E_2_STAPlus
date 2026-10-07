import { mockNotifications } from "../mocks/notifications";
import type { Notification } from "../types/notification";

const STORAGE_KEY = "crm-soa.notifications";
export const NOTIFICATIONS_CHANGED_EVENT = "crm-soa:notifications-changed";
const wait = () => new Promise<void>((resolve) => window.setTimeout(resolve, 250));

function read(): Notification[] {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
            const parsed: unknown = JSON.parse(raw);
            if (Array.isArray(parsed)) return parsed as Notification[];
        }
    } catch { /* Restore seed notifications. */ }
    const seeded = mockNotifications.map((item) => ({ ...item }));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
    return seeded;
}

function write(items: Notification[]) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    window.dispatchEvent(new Event(NOTIFICATIONS_CHANGED_EVENT));
}

export const notificationService = {
    getNotifications: async (): Promise<Notification[]> => {
        await wait();
        return read().sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt)).map((item) => ({ ...item }));
    },
    getUnreadCount: async (): Promise<number> => {
        await wait();
        return read().filter((item) => !item.read).length;
    },
    markAsRead: async (id: number): Promise<void> => {
        await wait();
        const items = read();
        const item = items.find((candidate) => candidate.id === id);
        if (!item) throw new Error("Không tìm thấy thông báo.");
        if (!item.read) write(items.map((candidate) => candidate.id === id ? { ...candidate, read: true } : candidate));
    },
    markAllAsRead: async (): Promise<void> => {
        await wait();
        const items = read();
        if (items.some((item) => !item.read)) write(items.map((item) => ({ ...item, read: true })));
    },
    deleteNotification: async (id: number): Promise<void> => {
        await wait();
        const items = read();
        if (!items.some((item) => item.id === id)) throw new Error("Không tìm thấy thông báo.");
        write(items.filter((item) => item.id !== id));
    },
};
