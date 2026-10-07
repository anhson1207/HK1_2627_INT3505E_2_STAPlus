import { Outlet } from "react-router-dom";
import { useState } from "react";
import { Drawer, useMediaQuery } from "@mui/material";

import Sidebar from "../components/layout/Sidebar";
import Header from "../components/layout/Header";

export default function MainLayout() {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const isMobile = useMediaQuery("(max-width:900px)");

    return (
        <div className={`crm-app ${sidebarCollapsed && !isMobile ? "is-sidebar-collapsed" : ""}`}>
            {isMobile ? (
                <Drawer open={mobileOpen} onClose={() => setMobileOpen(false)} slotProps={{ paper: { className: "crm-sidebar-drawer" } }}>
                    <Sidebar collapsed={false} onToggle={() => setMobileOpen(false)} onNavigate={() => setMobileOpen(false)} mobile />
                </Drawer>
            ) : <Sidebar
                collapsed={sidebarCollapsed}
                onToggle={() => setSidebarCollapsed((value) => !value)}
            />}

            <Header onOpenSidebar={() => setMobileOpen(true)} mobileOpen={mobileOpen} />

            <main id="main-content" className="crm-main">
                <div className="crm-page">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
