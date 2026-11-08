import { Outlet } from "react-router-dom";
import { useState, useEffect } from "react";
import { Drawer, useMediaQuery } from "@mui/material";

import Sidebar from "../components/layout/Sidebar";
import Header from "../components/layout/Header";
import { useChatSocket } from "../hooks/useChatSocket";
import { useChatStore } from "../stores/chatStore";
import { useAuthStore } from "../stores/authStore";
import { useThemeStore, applyThemeToDOM } from "../stores/themeStore";
import { ChatToastNotification } from "../components/chat/ChatToastNotification";

export default function MainLayout() {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const isMobile = useMediaQuery("(max-width:900px)");

    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const themeMode = useThemeStore((state) => state.mode);
    const handleRealtimeEvent = useChatStore((state) => state.handleRealtimeEvent);
    const fetchConversations = useChatStore((state) => state.fetchConversations);

    useEffect(() => {
        applyThemeToDOM(themeMode);
    }, [themeMode]);

    // Kết nối WebSocket STOMP toàn cục khi người dùng đã đăng nhập vào hệ thống CRM
    const { isConnected, isReconnecting, reconnect } = useChatSocket({
        enabled: isAuthenticated,
        onEvent: (event) => {
            handleRealtimeEvent(event);
        },
    });

    useEffect(() => {
        if (isAuthenticated) {
            fetchConversations();
        }
    }, [isAuthenticated, fetchConversations]);

    useEffect(() => {
        useChatStore.setState({
            socketConnected: isConnected,
            socketReconnecting: isReconnecting,
            manualReconnect: reconnect,
        });
    }, [isConnected, isReconnecting, reconnect]);

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

            {/* Thông báo tin nhắn Chat nổi góc màn hình */}
            <ChatToastNotification />
        </div>
    );
}
