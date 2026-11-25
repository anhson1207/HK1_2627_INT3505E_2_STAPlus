import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface GeneralSettings {
    crmName: string;
    companyName: string;
    currency: "VND" | "USD";
    timezone: string;
    language: "vi" | "en";
    dateFormat: "dd/MM/yyyy" | "MM/dd/yyyy" | "yyyy-MM-dd";
}

export interface NotificationPreferences {
    followUp: boolean;
    deal: boolean;
    ticket: boolean;
    system: boolean;
    email: boolean;
    reminderBefore: "15m" | "30m" | "1h" | "1d";
}

export interface ChatNotificationPreferences {
    chatToast: boolean;
    chatSound: boolean;
    chatBrowser: boolean;
    chatGroupEvents: boolean;
}

interface SettingsState {
    general: GeneralSettings;
    notifications: NotificationPreferences;
    chatNotifications: ChatNotificationPreferences;
    sidebarCollapsed: boolean;
    saveGeneral: (value: GeneralSettings) => void;
    saveNotifications: (value: NotificationPreferences) => void;
    saveChatNotifications: (value: ChatNotificationPreferences) => void;
    setSidebarCollapsed: (collapsed: boolean) => void;
}

export const useSettingsStore = create<SettingsState>()(
    persist(
        (set) => ({
            general: {
                crmName: "STAplus crm",
                companyName: "STAplus",
                currency: "VND",
                timezone: "Asia/Ho_Chi_Minh",
                language: "vi",
                dateFormat: "dd/MM/yyyy",
            },
            notifications: {
                followUp: true,
                deal: true,
                ticket: true,
                system: true,
                email: false,
                reminderBefore: "30m",
            },
            chatNotifications: {
                chatToast: true,
                chatSound: true,
                chatBrowser: false,
                chatGroupEvents: true,
            },
            sidebarCollapsed: false,
            saveGeneral: (general) => set({ general }),
            saveNotifications: (notifications) => set({ notifications }),
            saveChatNotifications: (chatNotifications) => set({ chatNotifications }),
            setSidebarCollapsed: (sidebarCollapsed) => set({ sidebarCollapsed }),
        }),
        {
            name: "crm-soa.settings.v1",
            partialize: ({
                general,
                notifications,
                chatNotifications,
                sidebarCollapsed,
            }) => ({
                general,
                notifications,
                chatNotifications,
                sidebarCollapsed,
            }),
        }
    )
);
