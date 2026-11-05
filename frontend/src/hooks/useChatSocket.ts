import { useEffect, useRef, useState, useCallback } from "react";
import { Client } from "@stomp/stompjs";
import { chatService } from "../services/chatService";
import { useAuthStore } from "../stores/authStore";
import type { ChatEventEnvelope } from "../types/chat";

export type SocketStatus = "connecting" | "connected" | "disconnected" | "reconnecting";

interface UseChatSocketOptions {
    onEvent?: (event: ChatEventEnvelope) => void;
    enabled?: boolean;
}

export function useChatSocket({ onEvent, enabled = true }: UseChatSocketOptions = {}) {
    const token = useAuthStore((state) => state.token);
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

    const [status, setStatus] = useState<SocketStatus>("disconnected");
    const clientRef = useRef<Client | null>(null);
    const onEventRef = useRef(onEvent);
    onEventRef.current = onEvent;

    const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const reconnectAttemptsRef = useRef(0);
    const isConnectingRef = useRef(false);
    const isDestroyedRef = useRef(false);

    // Resolve base WebSocket URL
    const getWsBaseUrl = useCallback(() => {
        if (import.meta.env.VITE_WS_URL) {
            return import.meta.env.VITE_WS_URL;
        }
        const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
        const host = window.location.hostname || "localhost";
        return `${protocol}//${host}:8086/ws/chat`;
    }, []);

    const connect = useCallback(async () => {
        if (!enabled || !isAuthenticated || !token || isDestroyedRef.current) {
            return;
        }

        if (isConnectingRef.current || (clientRef.current && clientRef.current.connected)) {
            return;
        }

        isConnectingRef.current = true;
        setStatus(reconnectAttemptsRef.current > 0 ? "reconnecting" : "connecting");

        try {
            // 1. Luôn xin vé Single-Use Ticket MỚI mỗi lần kết nối
            const { ticket } = await chatService.getWsTicket();
            if (isDestroyedRef.current) return;

            const wsUrl = `${getWsBaseUrl()}?ticket=${encodeURIComponent(ticket)}`;

            // 2. Tạo STOMP client
            const client = new Client({
                brokerURL: wsUrl,
                reconnectDelay: 0, // Tự quản lý reconnect để đảm bảo xin ticket mới
                heartbeatIncoming: 10000,
                heartbeatOutgoing: 10000,
                debug: () => {
                    // Tắt log thô trong production
                },
                onConnect: () => {
                    if (isDestroyedRef.current) {
                        client.deactivate();
                        return;
                    }
                    isConnectingRef.current = false;
                    reconnectAttemptsRef.current = 0;
                    setStatus("connected");

                    // 3. Subscribe hàng đợi cá nhân
                    client.subscribe("/user/queue/events", (message) => {
                        try {
                            const parsed: ChatEventEnvelope = JSON.parse(message.body);
                            onEventRef.current?.(parsed);
                        } catch (err) {
                            console.error("[useChatSocket] Failed to parse event payload:", err);
                        }
                    });
                },
                onStompError: (frame) => {
                    console.warn("[useChatSocket] STOMP error:", frame.headers["message"]);
                    handleDisconnect();
                },
                onWebSocketClose: () => {
                    handleDisconnect();
                },
            });

            clientRef.current = client;
            client.activate();
        } catch (error) {
            console.warn("[useChatSocket] Failed to initiate connection:", error);
            handleDisconnect();
        } finally {
            isConnectingRef.current = false;
        }
    }, [enabled, isAuthenticated, token, getWsBaseUrl]);

    const handleDisconnect = useCallback(() => {
        if (isDestroyedRef.current) return;

        if (clientRef.current) {
            try {
                clientRef.current.deactivate();
            } catch {
                // ignore
            }
            clientRef.current = null;
        }

        setStatus("disconnected");

        // Exponential backoff reconnect: 2s, 4s, 8s, tối đa 30s
        if (isAuthenticated && enabled) {
            const attempt = reconnectAttemptsRef.current;
            const delay = Math.min(2000 * Math.pow(1.5, attempt), 30000);
            reconnectAttemptsRef.current += 1;

            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
            }
            reconnectTimeoutRef.current = setTimeout(() => {
                connect();
            }, delay);
        }
    }, [isAuthenticated, enabled, connect]);

    const manualReconnect = useCallback(() => {
        reconnectAttemptsRef.current = 0;
        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
        }
        if (clientRef.current) {
            try {
                clientRef.current.deactivate();
            } catch {
                // ignore
            }
            clientRef.current = null;
        }
        connect();
    }, [connect]);

    useEffect(() => {
        isDestroyedRef.current = false;
        if (enabled && isAuthenticated) {
            connect();
        } else {
            if (clientRef.current) {
                clientRef.current.deactivate();
                clientRef.current = null;
            }
            setStatus("disconnected");
        }

        return () => {
            isDestroyedRef.current = true;
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
            }
            if (clientRef.current) {
                clientRef.current.deactivate();
                clientRef.current = null;
            }
            setStatus("disconnected");
        };
    }, [enabled, isAuthenticated, connect]);

    return {
        status,
        isConnected: status === "connected",
        isReconnecting: status === "reconnecting",
        reconnect: manualReconnect,
    };
}
