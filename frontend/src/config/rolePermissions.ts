import type { UserRole } from "../types/user";
import { USER_ROLES } from "../types/auth";

export type CRMResource = "dashboard" | "leads" | "customers" | "deals" | "tickets" | "analytics" | "settings" | "profile" | "notifications" | "security" | "users" | "roles" | "general" | "reminders";

export const rolePermissions: Record<UserRole, readonly CRMResource[]> = {
    ADMIN: ["dashboard", "leads", "customers", "deals", "tickets", "analytics", "settings", "profile", "notifications", "security", "users", "roles", "general", "reminders"],
    SALES: ["dashboard", "leads", "customers", "deals", "analytics", "profile", "notifications", "security", "reminders"],
    // UI policy: managers access business modules, not administrative settings.
    // Backend authorization must enforce its own permissions.
    MANAGER: ["dashboard", "leads", "customers", "deals", "tickets", "analytics", "profile", "notifications", "security", "reminders"],
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
    { resource: "reminders", label: "Reminders" }, { resource: "settings", label: "Settings (quản trị)" },
    { resource: "profile", label: "My Profile" }, { resource: "notifications", label: "Notification Preferences" },
    { resource: "security", label: "Security" },
];
