import React from "react";
import ReactDOM from "react-dom/client";
import { ThemeProvider } from "@mui/material/styles";
import { CssBaseline } from "@mui/material";

import App from "./App";
import { theme } from "./theme";
import "./index.css";
import "./styles/monday-inspired-crm.css";

// MUI menus and dialogs render into body, outside the React root.
document.body.classList.add("crm-theme");

ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <App />
        </ThemeProvider>
    </React.StrictMode>
);
