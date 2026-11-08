import React from "react";
import ReactDOM from "react-dom/client";

import App from "./App";
import "./index.css";
import "./styles/monday-inspired-crm.css";

// MUI menus and dialogs render into body, outside the React root.
document.body.classList.add("crm-theme");

ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);
