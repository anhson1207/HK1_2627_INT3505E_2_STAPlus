import { Navigate, Outlet } from "react-router-dom";

import { useAuthStore } from "../stores/authStore";

export default function PublicOnlyRoute() {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    // Keep the form mounted during submission so inline errors remain visible.
    return isAuthenticated ? <Navigate to="/dashboard" replace /> : <Outlet />;
}
