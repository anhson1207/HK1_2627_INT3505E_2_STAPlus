import { Outlet } from "react-router-dom";
import { useState } from "react";

import Sidebar from "../components/layout/Sidebar";
import Header from "../components/layout/Header";

export default function MainLayout() {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    return (
        <div className="min-h-screen bg-[#F7F9FC]">
            <Sidebar
                collapsed={sidebarCollapsed}
                onToggle={() => setSidebarCollapsed((value) => !value)}
            />

            <Header sidebarCollapsed={sidebarCollapsed} />

            <main className={`pt-[72px] transition-[margin] duration-300 ${sidebarCollapsed ? "ml-[80px]" : "ml-[248px]"}`}>
                <div className="p-7">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
