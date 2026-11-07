import api from "./api";
import { mockNotifications } from "../mocks/notifications";
import type { Notification, NotificationType } from "../types/notification";

export const NOTIFICATIONS_CHANGED_EVENT = "crm-soa:notifications-changed";

export interface BackendNotification {
    id: number;
    userId?: number;
    type: NotificationType;
    title: string;
    message: string;
    targetUrl?: string | null;
    isRead?: boolean;
    read?: boolean;
    createdAt: string;
}

export function mapNotificationFromApi(data: BackendNotification): Notification {
    return {
        id: data.id,
        type: data.type,
        title: data.title,
        message: data.message,
        targetUrl: data.targetUrl ?? undefined,
        read: Boolean(data.read ?? data.isRead),
        createdAt: data.createdAt,
    };
}

// In-memory cache & fallback store for smooth offline operation
let localCache: Notification[] = [];
let cacheLoaded = false;

function notifyChange() {
    if (typeof window !== "undefined") {
        window.dispatchEvent(new Event(NOTIFICATIONS_CHANGED_EVENT));
    }
}

export const notificationService = {
    // GET /api/v1/notifications
    getNotifications: async (): Promise<Notification[]> => {
        try {
            const response = await api.get<BackendNotification[]>("/notifications");
            if (Array.isArray(response.data)) {
                const mapped = response.data.map(mapNotificationFromApi);
                localCache = mapped;
                cacheLoaded = true;
                return mapped.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
            }
        } catch (error) {
            console.warn("Backend GET /api/v1/notifications unavailable, falling back:", error);
        }

        if (!cacheLoaded) {
            localCache = mockNotifications.map((item) => ({ ...item }));
            cacheLoaded = true;
        }
        return [...localCache].sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
    },

    // GET /api/v1/notifications/unread-count
    getUnreadCount: async (): Promise<number> => {
        try {
            const response = await api.get<number | { count: number }>("/notifications/unread-count");
            if (typeof response.data === "number") {
                return response.data;
            }
            if (response.data && typeof (response.data as { count: number }).count === "number") {
                return (response.data as { count: number }).count;
            }
        } catch (error) {
            console.warn("Backend GET /api/v1/notifications/unread-count unavailable, falling back:", error);
        }

        if (!cacheLoaded) {
            localCache = mockNotifications.map((item) => ({ ...item }));
            cacheLoaded = true;
        }
        return localCache.filter((item) => !item.read).length;
    },

    // PATCH /api/v1/notifications/{id}/read
    markAsRead: async (id: number): Promise<void> => {
        try {
            await api.patch(`/notifications/${id}/read`);
        } catch (error) {
            console.warn(`Backend PATCH /api/v1/notifications/${id}/read unavailable, falling back:`, error);
        }

        // Always update local cache & notify subscribers
        localCache = localCache.map((candidate) =>
            candidate.id === id ? { ...candidate, read: true } : candidate,
        );
        notifyChange();
    },

    // PATCH /api/v1/notifications/read-all
    markAllAsRead: async (): Promise<void> => {
        try {
            await api.patch("/notifications/read-all");
        } catch (error) {
            console.warn("Backend PATCH /api/v1/notifications/read-all unavailable, falling back:", error);
        }

        // Always update local cache & notify subscribers
        localCache = localCache.map((item) => ({ ...item, read: true }));
        notifyChange();
    },

    // DELETE /api/v1/notifications/{id} (or local fallback)
    deleteNotification: async (id: number): Promise<void> => {
        try {
            await api.delete(`/notifications/${id}`);
        } catch {
            // notification-service doesn't implement delete, remove locally
        }
        localCache = localCache.filter((candidate) => candidate.id !== id);
        notifyChange();
    },

    // Local / Chat store notifications
    addNotification: (item: Omit<Notification, "id" | "createdAt" | "read">): Notification => {
        const newItem: Notification = {
            id: Date.now(),
            ...item,
            read: false,
            createdAt: new Date().toISOString(),
        };
        localCache = [newItem, ...localCache];
        notifyChange();
        return newItem;
    },
};
