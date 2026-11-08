import { useMemo } from "react";
import { ThemeProvider } from "@mui/material/styles";
import { CssBaseline } from "@mui/material";

import AppRoutes from "./routes/AppRoutes";
import { getAppTheme } from "./theme";
import { useThemeStore } from "./stores/themeStore";

export default function App() {
    const mode = useThemeStore((state) => state.mode);
    const muiTheme = useMemo(() => getAppTheme(mode), [mode]);

    return (
        <ThemeProvider theme={muiTheme}>
            <CssBaseline />
            <div className="crm-theme">
                <AppRoutes />
            </div>
        </ThemeProvider>
    );
}
