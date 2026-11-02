import type { UserRole } from "../types/auth";

// export const routePermissions: Record<string, UserRole[]> = {
//     "/dashboard": ["admin", "sales", "support"],
//     "/leads": ["admin", "sales"],
//     "/customers": ["admin", "sales", "support"],
//     "/sales": ["admin", "sales"],
//     "/support": ["admin", "support"],
//     "/analytics": ["admin"],
//     "/settings": ["admin"],
//     "/profile": ["admin", "sales", "support"],
// };
export const routePermissions: Record<string, UserRole[]> = {
    "/dashboard": ["ADMIN", "SALES", "SUPPORT"],

    "/leads": ["ADMIN", "SALES"],

    "/customers": ["ADMIN", "SALES", "SUPPORT"],

    "/sales": ["ADMIN", "SALES"],

    "/support": ["ADMIN", "SUPPORT"],

    "/analytics": ["ADMIN"],

    "/settings": ["ADMIN"],

    "/profile": ["ADMIN", "SALES", "SUPPORT"],
};