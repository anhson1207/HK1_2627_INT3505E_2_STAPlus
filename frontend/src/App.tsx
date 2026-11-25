import { useEffect, useMemo } from "react";
import { BrowserRouter, useLocation } from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import { CssBaseline } from "@mui/material";

import AppRoutes from "./routes/AppRoutes";
import { getAppTheme } from "./theme";
import {
    useThemeStore,
    isAuthPath,
    applyThemeToDOM,
    type ThemeMode,
} from "./stores/themeStore";

function ThemedApp() {
    const location = useLocation();
    const savedMode = useThemeStore((state) => state.mode);
    const isAuth = isAuthPath(location.pathname);
    const effectiveMode: ThemeMode = isAuth ? "light" : savedMode;

    useEffect(() => {
        applyThemeToDOM(effectiveMode);
    }, [effectiveMode]);

    const muiTheme = useMemo(() => getAppTheme(effectiveMode), [effectiveMode]);

    return (
        <ThemeProvider theme={muiTheme}>
            <CssBaseline />
            <div className={`crm-theme ${effectiveMode === "dark" ? "crm-dark" : ""}`}>
                <AppRoutes />
            </div>
        </ThemeProvider>
    );
}

export default function App() {
    return (
        <BrowserRouter>
            <ThemedApp />
        </BrowserRouter>
    );
}
