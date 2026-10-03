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

interface SettingsState {
    general: GeneralSettings;
    notifications: NotificationPreferences;
    saveGeneral: (value: GeneralSettings) => void;
    saveNotifications: (value: NotificationPreferences) => void;
}

export const useSettingsStore = create<SettingsState>()(persist((set) => ({
    general: { crmName: "SOA CRM", companyName: "SOA Company", currency: "VND", timezone: "Asia/Ho_Chi_Minh", language: "vi", dateFormat: "dd/MM/yyyy" },
    notifications: { followUp: true, deal: true, ticket: true, system: true, email: false, reminderBefore: "30m" },
    saveGeneral: (general) => set({ general }),
    saveNotifications: (notifications) => set({ notifications }),
}), { name: "crm-soa.settings.v1", partialize: ({ general, notifications }) => ({ general, notifications }) }));
