import { CircularProgress } from "@mui/material";
import { useEffect, useRef } from "react";
import { Navigate, Outlet } from "react-router-dom";

import { useAuthStore } from "../stores/authStore";

export default function PublicOnlyRoute() {
    const restoredRef = useRef(false);
    const { isAuthenticated, isLoading, restoreSession } = useAuthStore();

    useEffect(() => {
        if (restoredRef.current) return;
        restoredRef.current = true;
        void restoreSession();
    }, [restoreSession]);

    if (isLoading) {
        return <div className="fixed inset-0 flex items-center justify-center bg-[#F7F9FC]"><CircularProgress size={34} /></div>;
    }

    return isAuthenticated ? <Navigate to="/dashboard" replace /> : <Outlet />;
}
