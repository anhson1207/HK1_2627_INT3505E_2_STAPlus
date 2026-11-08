import { Navigate, Outlet, useLocation } from "react-router-dom";

import { useAuthStore } from "../stores/authStore";

export default function ProtectedRoute() {
    const location = useLocation();
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const user = useAuthStore((state) => state.user);

    if (!isAuthenticated) {
        return <Navigate to="/login" replace state={{ from: location.pathname + location.search + location.hash }} />;
    }

    if (user?.status === "PENDING" && location.pathname !== "/pending-approval") {
        return <Navigate to="/pending-approval" replace />;
    }

    return <Outlet />;
}
