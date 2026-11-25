import { Outlet } from "react-router-dom";
import { useState, useEffect } from "react";
import { Drawer, useMediaQuery } from "@mui/material";

import Sidebar from "../components/layout/Sidebar";
import Header from "../components/layout/Header";
import { useChatSocket } from "../hooks/useChatSocket";
import { useChatStore } from "../stores/chatStore";
import { useAuthStore } from "../stores/authStore";
import { useThemeStore, applyThemeToDOM } from "../stores/themeStore";
import { useSettingsStore } from "../stores/settingsStore";
import { authService } from "../services/authService";
import { ChatToastNotification } from "../components/chat/ChatToastNotification";

export default function MainLayout() {
    const [mobileOpen, setMobileOpen] = useState(false);
    const isMobile = useMediaQuery("(max-width:900px)");

    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const themeMode = useThemeStore((state) => state.mode);
    const sidebarCollapsed = useSettingsStore((state) => state.sidebarCollapsed);
    const setSidebarCollapsed = useSettingsStore((state) => state.setSidebarCollapsed);
    const saveChatNotifications = useSettingsStore((state) => state.saveChatNotifications);
    const handleRealtimeEvent = useChatStore((state) => state.handleRealtimeEvent);
    const fetchConversations = useChatStore((state) => state.fetchConversations);

    useEffect(() => {
        applyThemeToDOM(themeMode);
        document.documentElement.classList.remove("crm-compact");
    }, [themeMode]);

    useEffect(() => {
        if (!isAuthenticated) return;
        let active = true;
        void useAuthStore.getState().refreshUser();
        authService.getPreferences()
            .then((prefs) => {
                if (!active) return;
                setSidebarCollapsed(Boolean(prefs.sidebarCollapsed));
                saveChatNotifications({
                    chatToast: prefs.chatToast ?? true,
                    chatSound: prefs.chatSound ?? true,
                    chatBrowser: prefs.chatBrowser ?? false,
                    chatGroupEvents: prefs.chatGroupEvents ?? true,
                });
                try {
                    const savedLocal = localStorage.getItem("crm-theme-mode");
                    if (!savedLocal && (prefs.themeMode === "light" || prefs.themeMode === "dark")) {
                        useThemeStore.getState().setMode(prefs.themeMode);
                    }
                } catch {
                    // ignore storage errors
                }
            })
            .catch(() => {
                // Keep persisted local defaults
            });
        return () => {
            active = false;
        };
    }, [isAuthenticated, saveChatNotifications, setSidebarCollapsed]);

    const handleToggleSidebar = () => {
        const nextCollapsed = !sidebarCollapsed;
        setSidebarCollapsed(nextCollapsed);
        void authService.updatePreferences({ sidebarCollapsed: nextCollapsed }).catch(() => {});
    };

    // Kết nối WebSocket STOMP toàn cục khi người dùng đã đăng nhập vào hệ thống CRM
    const { isConnected, isReconnecting, reconnect } = useChatSocket({
        enabled: isAuthenticated,
        onEvent: (event) => {
            handleRealtimeEvent(event);
        },
        onConnected: () => {
            void useChatStore.getState().fetchPresence();
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
                onToggle={handleToggleSidebar}
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
