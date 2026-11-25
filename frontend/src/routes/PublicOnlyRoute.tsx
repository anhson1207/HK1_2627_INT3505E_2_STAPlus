import { Navigate, Outlet } from "react-router-dom";

import { useAuthStore } from "../stores/authStore";

export default function PublicOnlyRoute() {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const user = useAuthStore((state) => state.user);

    if (isAuthenticated) {
        if (user?.status === "PENDING") {
            return <Navigate to="/pending-approval" replace />;
        }
        return <Navigate to="/dashboard" replace />;
    }

    return <Outlet />;
}
