import { useEffect, useMemo } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";

import { useAuthStore } from "../stores/authStore";
import { useThemeStore, applyThemeToDOM } from "../stores/themeStore";
import { getAppTheme } from "../theme";

export default function PublicOnlyRoute() {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const user = useAuthStore((state) => state.user);
    const savedMode = useThemeStore((state) => state.mode);
    const lightTheme = useMemo(() => getAppTheme("light"), []);

    useEffect(() => {
        // Luôn áp dụng chế độ sáng (Light Mode) cho trang đăng nhập, đăng ký và các trang auth
        applyThemeToDOM("light");

        return () => {
            // Khôi phục lại theme của người dùng khi chuyển sang các trang CRM nội bộ
            applyThemeToDOM(savedMode);
        };
    }, [savedMode]);

    if (isAuthenticated) {
        if (user?.status === "PENDING") {
            return <Navigate to="/pending-approval" replace />;
        }
        return <Navigate to="/dashboard" replace />;
    }

    return (
        <ThemeProvider theme={lightTheme}>
            <Outlet />
        </ThemeProvider>
    );
}
