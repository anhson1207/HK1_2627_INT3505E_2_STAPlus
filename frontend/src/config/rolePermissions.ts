import type { UserRole } from "../types/user";
import { USER_ROLES } from "../types/auth";

export type CRMResource = "dashboard" | "leads" | "customers" | "deals" | "tickets" | "analytics" | "chat" | "settings" | "profile" | "notifications" | "security" | "appearance" | "users" | "roles" | "general" | "reminders" | "audit-logs";

export const rolePermissions: Record<UserRole, readonly CRMResource[]> = {
    ADMIN: ["dashboard", "leads", "customers", "deals", "tickets", "analytics", "chat", "settings", "profile", "notifications", "security", "appearance", "users", "roles", "general", "reminders", "audit-logs"],
    SALES: ["dashboard", "leads", "customers", "deals", "analytics", "chat", "settings", "profile", "notifications", "security", "appearance", "reminders"],
    SUPPORT: ["dashboard", "customers", "tickets", "chat", "settings", "profile", "notifications", "security", "appearance"],
    MANAGER: ["dashboard", "leads", "customers", "deals", "tickets", "analytics", "chat", "settings", "profile", "notifications", "security", "appearance", "reminders"],
    UNASSIGNED: ["profile", "security", "appearance"],
};

export function canAccess(role: UserRole | undefined, resource: CRMResource): boolean {
    return Boolean(role && rolePermissions[role]?.includes(resource));
}

export function rolesWithPermission(resource: CRMResource): UserRole[] {
    return USER_ROLES.filter((role) => rolePermissions[role].includes(resource));
}

export const permissionRows: ReadonlyArray<{ resource: CRMResource; label: string }> = [
    { resource: "dashboard", label: "Dashboard" }, { resource: "leads", label: "Leads" },
    { resource: "customers", label: "Customers" }, { resource: "deals", label: "Deals" },
    { resource: "tickets", label: "Tickets" }, { resource: "analytics", label: "Analytics" },
    { resource: "reminders", label: "Reminders" }, { resource: "chat", label: "Trò chuyện nội bộ (Internal Chat)" }, { resource: "settings", label: "Settings (quản trị)" },
    { resource: "profile", label: "My Profile" }, { resource: "notifications", label: "Notification Preferences" },
    { resource: "security", label: "Security" }, { resource: "audit-logs", label: "Nhật ký hoạt động (Audit Log)" },
];
