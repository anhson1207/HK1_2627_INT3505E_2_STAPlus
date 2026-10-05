import type { UserRole } from "../types/auth";

export const routePermissions: Record<string, UserRole[]> = {
    "/dashboard": ["admin", "sales", "support"],
    "/leads": ["admin", "sales"],
    "/customers": ["admin", "sales", "support"],
    "/sales": ["admin", "sales"],
    "/support": ["admin", "support"],
    "/analytics": ["admin"],
    "/settings": ["admin"],
    "/profile": ["admin", "sales", "support"],
};