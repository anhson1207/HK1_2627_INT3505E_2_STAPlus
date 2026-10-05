import { Navigate, useLocation } from "react-router-dom";

import { useAuthStore } from "../stores/authStore";
import { routePermissions } from "../config/routePermissions";
import { hasRole } from "../utils/permissions";

interface ProtectedRouteProps {
    children: React.ReactNode;
}

export default function ProtectedRoute({
    children,
}: ProtectedRouteProps) {
    const user = useAuthStore((state) => state.user);
    const location = useLocation();

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // const allowedRoles = routePermissions[location.pathname];

    // if (!allowedRoles) {
    //     return <>{children}</>;
    // }
    const matchedRoute = Object.keys(routePermissions).find(
        (route) =>
            location.pathname === route ||
            location.pathname.startsWith(`${route}/`)
    );

    const allowedRoles = matchedRoute
        ? routePermissions[matchedRoute]
        : undefined;

    if (!allowedRoles) {
        return <>{children}</>;
    }

    if (!hasRole(user, allowedRoles)) {
        return <Navigate to="/dashboard" replace />;
    }

    return <>{children}</>;
}