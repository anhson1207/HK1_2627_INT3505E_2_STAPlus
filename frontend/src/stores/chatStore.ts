import { create } from "zustand";
import { chatService } from "../services/chatService";
import { notificationService } from "../services/notificationService";
import { playChatChime } from "../utils/chatUtils";
import { parseJwt } from "../utils/jwt";
import { useAuthStore } from "./authStore";
import type {
    ChatConversation,
    ChatEventEnvelope,
    ChatGroupUpdatedPayload,
    ChatMemberJoinedPayload,
    ChatMemberLeftPayload,
    ChatMemberRoleUpdatedPayload,
    ChatMessage,
    ChatReadReceiptPayload,
    ChatUnreadUpdatePayload,
    ChatUserPresencePayload,
    MessageType,
    UnreadSummary,
} from "../types/chat";

export interface ActiveChatToast {
    id: number;
    title: string;
    message: string;
    conversationId: number;
}

interface ChatState {
    conversations: ChatConversation[];
    activeConversationId: number | null;
    messagesByConversation: Record<number, ChatMessage[]>;
    cursorByConversation: Record<number, { nextCursor: number | null; hasMore: boolean }>;
    loadingConversations: boolean;
    loadingMessages: boolean;
    loadingMoreMessages: boolean;
    unreadSummary: UnreadSummary;
    onlineUserIds: Set<number>;
    drafts: Record<number, string>;
    tabFilter: "ALL" | "DIRECT" | "GROUP";
    searchQuery: string;
    drawerOpen: boolean;
    activeToast: ActiveChatToast | null;
    socketConnected: boolean;
    socketReconnecting: boolean;
    manualReconnect: () => void;

    // Actions
    setActiveConversationId: (id: number | null) => void;
    setTabFilter: (tab: "ALL" | "DIRECT" | "GROUP") => void;
    setSearchQuery: (q: string) => void;
    setDrawerOpen: (open: boolean) => void;
    setDraft: (conversationId: number, content: string) => void;
    clearDraft: (conversationId: number) => void;
    dismissToast: () => void;

    fetchConversations: () => Promise<void>;
    fetchMessages: (conversationId: number) => Promise<void>;
    loadMoreMessages: (conversationId: number) => Promise<void>;
    sendMessage: (
        conversationId: number,
        content: string,
        attachment?: { url: string; name: string; size: number; type: MessageType }
    ) => Promise<void>;
    markAsRead: (conversationId: number, messageId?: number) => Promise<void>;
    handleRealtimeEvent: (event: ChatEventEnvelope) => void;
    reset: () => void;
}

const initialSummary: UnreadSummary = {
    totalUnreadCount: 0,
    conversationUnreadMap: {},
};

let chatSyncChannel: BroadcastChannel | null = null;
if (typeof window !== "undefined" && "BroadcastChannel" in window) {
    try {
        chatSyncChannel = new BroadcastChannel("crm_chat_sync");
        chatSyncChannel.onmessage = (ev) => {
            if (ev.data?.type === "MARK_READ") {
                const conversationId = Number(ev.data.conversationId);
                useChatStore.setState((state) => {
                    const currentConvUnread = state.conversations.find((c) => c.id === conversationId)?.unreadCount || 0;
                    const newTotal = Math.max(0, state.unreadSummary.totalUnreadCount - currentConvUnread);
                    return {
                        conversations: state.conversations.map((c) =>
                            c.id === conversationId ? { ...c, unreadCount: 0 } : c
                        ),
                        unreadSummary: {
                            ...state.unreadSummary,
                            totalUnreadCount: newTotal,
                            conversationUnreadMap: {
                                ...state.unreadSummary.conversationUnreadMap,
                                [conversationId.toString()]: 0,
                            },
                        },
                    };
                });
            }
        };
    } catch (e) {
        console.warn("[chatStore] BroadcastChannel error:", e);
    }
}

export const useChatStore = create<ChatState>((set, get) => ({
    conversations: [],
    activeConversationId: null,
    messagesByConversation: {},
    cursorByConversation: {},
    loadingConversations: false,
    loadingMessages: false,
    loadingMoreMessages: false,
    unreadSummary: initialSummary,
    onlineUserIds: new Set<number>(),
    drafts: {},
    tabFilter: "ALL",
    searchQuery: "",
    drawerOpen: false,
    activeToast: null,
    socketConnected: false,
    socketReconnecting: false,
    manualReconnect: () => {},

    setActiveConversationId: (id) => {
        set({ activeConversationId: id });
        if (id !== null) {
            get().fetchMessages(id);
            get().markAsRead(id);
        }
    },

    setTabFilter: (tab) => set({ tabFilter: tab }),
    setSearchQuery: (q) => set({ searchQuery: q }),
    setDrawerOpen: (open) => set({ drawerOpen: open }),

    setDraft: (conversationId, content) => {
        set((state) => ({
            drafts: { ...state.drafts, [conversationId]: content },
        }));
    },

    clearDraft: (conversationId) => {
        set((state) => {
            const next = { ...state.drafts };
            delete next[conversationId];
            return { drafts: next };
        });
    },

    dismissToast: () => set({ activeToast: null }),

    fetchConversations: async () => {
        set({ loadingConversations: true });
        try {
            const [conversations, unread] = await Promise.all([
                chatService.getConversations(),
                chatService.getUnreadSummary(),
            ]);

            // Sắp xếp hội thoại theo tin nhắn mới nhất
            const sorted = [...conversations].sort((a, b) => {
                const timeA = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : new Date(a.updatedAt).getTime();
                const timeB = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : new Date(b.updatedAt).getTime();
                return timeB - timeA;
            });

            set({
                conversations: sorted,
                unreadSummary: unread,
            });
        } catch (error) {
            console.error("[useChatStore] fetchConversations error:", error);
        } finally {
            set({ loadingConversations: false });
        }
    },

    fetchMessages: async (conversationId) => {
        set({ loadingMessages: true });
        try {
            const page = await chatService.getMessageHistory(conversationId, undefined, 35);
            // Tin nhắn trả về theo thứ tự desc -> reverse để hiển thị asc
            const itemsAsc = [...page.items].reverse();

            set((state) => ({
                messagesByConversation: {
                    ...state.messagesByConversation,
                    [conversationId]: itemsAsc,
                },
                cursorByConversation: {
                    ...state.cursorByConversation,
                    [conversationId]: {
                        nextCursor: page.nextCursor,
                        hasMore: page.hasMore,
                    },
                },
            }));
        } catch (error) {
            console.error("[useChatStore] fetchMessages error:", error);
        } finally {
            set({ loadingMessages: false });
        }
    },

    loadMoreMessages: async (conversationId) => {
        const cursorInfo = get().cursorByConversation[conversationId];
        if (!cursorInfo || !cursorInfo.hasMore || cursorInfo.nextCursor === null || get().loadingMoreMessages) {
            return;
        }

        set({ loadingMoreMessages: true });
        try {
            const page = await chatService.getMessageHistory(conversationId, cursorInfo.nextCursor, 30);
            const olderAsc = [...page.items].reverse();

            set((state) => {
                const current = state.messagesByConversation[conversationId] || [];
                // Ghép tin nhắn cũ lên đầu, chống trùng bằng id
                const existingIds = new Set(current.map((m) => m.id));
                const filteredOlder = olderAsc.filter((m) => !existingIds.has(m.id));

                return {
                    messagesByConversation: {
                        ...state.messagesByConversation,
                        [conversationId]: [...filteredOlder, ...current],
                    },
                    cursorByConversation: {
                        ...state.cursorByConversation,
                        [conversationId]: {
                            nextCursor: page.nextCursor,
                            hasMore: page.hasMore,
                        },
                    },
                };
            });
        } catch (error) {
            console.error("[useChatStore] loadMoreMessages error:", error);
        } finally {
            set({ loadingMoreMessages: false });
        }
    },

    sendMessage: async (conversationId, content, attachment) => {
        const token = useAuthStore.getState().token;
        const claims = parseJwt(token);
        const currentUserId = claims?.userId ?? 0;
        const currentUsername = useAuthStore.getState().user?.username || "Tôi";

        const tempClientMessageId = "temp_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7);

        // Optimistic message
        const optimisticMsg: ChatMessage = {
            id: -Date.now(),
            conversationId,
            senderId: currentUserId,
            senderUsername: currentUsername,
            type: attachment ? attachment.type : "TEXT",
            content: content.trim() || (attachment ? attachment.name : ""),
            attachmentUrl: attachment?.url || null,
            attachmentName: attachment?.name || null,
            attachmentSize: attachment?.size || null,
            clientMessageId: tempClientMessageId,
            createdAt: new Date().toISOString(),
            isMine: true,
            status: "sending",
        };

        // Chèn ngay vào state để trải nghiệm mượt mà
        set((state) => {
            const list = state.messagesByConversation[conversationId] || [];
            return {
                messagesByConversation: {
                    ...state.messagesByConversation,
                    [conversationId]: [...list, optimisticMsg],
                },
            };
        });

        get().clearDraft(conversationId);

        try {
            const saved = await chatService.sendMessage(conversationId, {
                content: content.trim() || (attachment ? attachment.name : "Tệp đính kèm"),
                clientMessageId: tempClientMessageId,
                type: attachment ? attachment.type : "TEXT",
                attachmentUrl: attachment?.url,
                attachmentName: attachment?.name,
                attachmentSize: attachment?.size,
            });

            // Thay thế message tạm bằng message thực từ server
            set((state) => {
                const list = state.messagesByConversation[conversationId] || [];
                const updatedList = list.map((m) =>
                    m.clientMessageId === tempClientMessageId ? { ...saved, status: "sent" as const } : m
                );

                // Cập nhật lastMessage của hội thoại
                const convs = state.conversations.map((c) =>
                    c.id === conversationId
                        ? {
                              ...c,
                              lastMessage: saved,
                              lastMessageId: saved.id,
                              lastMessageAt: saved.createdAt,
                          }
                        : c
                );

                // Đưa hội thoại vừa gửi tin lên đầu
                const activeConv = convs.find((c) => c.id === conversationId);
                const restConvs = convs.filter((c) => c.id !== conversationId);
                const reordered = activeConv ? [activeConv, ...restConvs] : convs;

                return {
                    messagesByConversation: {
                        ...state.messagesByConversation,
                        [conversationId]: updatedList,
                    },
                    conversations: reordered,
                };
            });
        } catch (error) {
            console.error("[useChatStore] sendMessage failed:", error);
            // Đánh dấu lỗi trên message
            set((state) => {
                const list = state.messagesByConversation[conversationId] || [];
                const updatedList = list.map((m) =>
                    m.clientMessageId === tempClientMessageId
                        ? { ...m, status: "error" as const, error: "Gửi thất bại. Nhấn để thử lại." }
                        : m
                );
                return {
                    messagesByConversation: {
                        ...state.messagesByConversation,
                        [conversationId]: updatedList,
                    },
                };
            });
        }
    },

    markAsRead: async (conversationId, messageId) => {
        try {
            const messages = get().messagesByConversation[conversationId] || [];
            const targetMessageId = messageId || (messages.length > 0 ? messages[messages.length - 1].id : null);

            if (targetMessageId && targetMessageId > 0) {
                await chatService.markAsRead(conversationId, targetMessageId);
            }

            // Đồng bộ tab khác qua BroadcastChannel
            try {
                chatSyncChannel?.postMessage({ type: "MARK_READ", conversationId });
            } catch {
                /* ignore */
            }

            // Cập nhật số chưa đọc ở local state ngay
            set((state) => {
                const currentConvUnread = state.conversations.find((c) => c.id === conversationId)?.unreadCount || 0;
                const newTotal = Math.max(0, state.unreadSummary.totalUnreadCount - currentConvUnread);

                return {
                    conversations: state.conversations.map((c) =>
                        c.id === conversationId ? { ...c, unreadCount: 0 } : c
                    ),
                    unreadSummary: {
                        ...state.unreadSummary,
                        totalUnreadCount: newTotal,
                        conversationUnreadMap: {
                            ...state.unreadSummary.conversationUnreadMap,
                            [conversationId.toString()]: 0,
                        },
                    },
                };
            });
        } catch (error) {
            console.warn("[useChatStore] markAsRead warning:", error);
        }
    },

    handleRealtimeEvent: (envelope) => {
        const { event, data } = envelope;
        const activeId = get().activeConversationId;
        const token = useAuthStore.getState().token;
        const currentUserId = parseJwt(token)?.userId;

        switch (event) {
            case "chat:message:new": {
                const newMsg = data as ChatMessage;
                const convId = newMsg.conversationId;

                set((state) => {
                    const list = state.messagesByConversation[convId] || [];
                    // Chống trùng lặp theo ID hoặc clientMessageId
                    const existingIdx = list.findIndex(
                        (m) =>
                            (m.id > 0 && m.id === newMsg.id) ||
                            (m.clientMessageId && m.clientMessageId === newMsg.clientMessageId)
                    );

                    let updatedList: ChatMessage[];
                    if (existingIdx !== -1) {
                        updatedList = [...list];
                        updatedList[existingIdx] = { ...newMsg, status: "sent" };
                    } else {
                        updatedList = [...list, { ...newMsg, status: "sent" }];
                    }

                    // Cập nhật conversation list
                    let found = false;
                    const updatedConvs = state.conversations.map((c) => {
                        if (c.id === convId) {
                            found = true;
                            const isCurrentActive = activeId === convId;
                            const newUnread = isCurrentActive ? 0 : c.unreadCount + (newMsg.isMine ? 0 : 1);
                            return {
                                ...c,
                                lastMessage: newMsg,
                                lastMessageId: newMsg.id,
                                lastMessageAt: newMsg.createdAt,
                                unreadCount: newUnread,
                            };
                        }
                        return c;
                    });

                    // Nếu chưa có trong danh sách hội thoại -> lấy thêm từ server
                    if (!found) {
                        chatService.getConversationDetail(convId).then((c) => {
                            set((s) => ({
                                conversations: [c, ...s.conversations.filter((x) => x.id !== convId)],
                            }));
                        });
                    }

                    // Đưa hội thoại vừa có tin nhắn mới lên đầu danh sách
                    const activeConv = updatedConvs.find((c) => c.id === convId);
                    const rest = updatedConvs.filter((c) => c.id !== convId);
                    const reordered = activeConv ? [activeConv, ...rest] : updatedConvs;

                    return {
                        messagesByConversation: {
                            ...state.messagesByConversation,
                            [convId]: updatedList,
                        },
                        conversations: reordered,
                    };
                });

                // Xử lý thông báo và âm thanh nếu là tin nhắn người khác gửi
                if (!newMsg.isMine) {
                    if (activeId === convId) {
                        // Đang mở đúng hội thoại này -> tự động đánh dấu đã đọc
                        get().markAsRead(convId, newMsg.id);
                    } else {
                        // Không mở đúng hội thoại này -> Phát chuông & thông báo
                        playChatChime();

                        const displayTitle = newMsg.senderUsername || "Tin nhắn mới";
                        const displaySnippet =
                            newMsg.type === "IMAGE"
                                ? "[Hình ảnh]"
                                : newMsg.type === "FILE"
                                ? `[Tệp: ${newMsg.attachmentName || "Tài liệu"}]`
                                : newMsg.content;

                        // 1. Thêm vào trung tâm thông báo CRM Header
                        notificationService.addNotification({
                            type: "CHAT",
                            title: displayTitle,
                            message: displaySnippet,
                            targetUrl: "/chat",
                        });

                        // 2. Web Notification API trình duyệt
                        if (
                            typeof window !== "undefined" &&
                            "Notification" in window &&
                            Notification.permission === "granted"
                        ) {
                            try {
                                new Notification(displayTitle, {
                                    body: displaySnippet,
                                    icon: "/crm-icon.png",
                                });
                            } catch {
                                /* ignore browser notification error */
                            }
                        }

                        // 3. Popup Toast thông báo nổi trên góc giao diện
                        set({
                            activeToast: {
                                id: Date.now(),
                                title: displayTitle,
                                message: displaySnippet,
                                conversationId: convId,
                            },
                        });
                    }
                }
                break;
            }

            case "chat:read": {
                const receipt = data as ChatReadReceiptPayload;
                set((state) => ({
                    conversations: state.conversations.map((c) => {
                        if (c.id === receipt.conversationId) {
                            return {
                                ...c,
                                participants: c.participants.map((p) =>
                                    p.userId === receipt.userId
                                        ? {
                                              ...p,
                                              lastReadMessageId: receipt.lastReadMessageId,
                                              lastReadAt: receipt.readAt,
                                          }
                                        : p
                                ),
                            };
                        }
                        return c;
                    }),
                }));
                break;
            }

            case "chat:unread:updated": {
                const unread = data as ChatUnreadUpdatePayload;
                set((state) => ({
                    unreadSummary: {
                        ...state.unreadSummary,
                        totalUnreadCount: unread.totalUnreadCount,
                        conversationUnreadMap: {
                            ...state.unreadSummary.conversationUnreadMap,
                            [unread.conversationId.toString()]: unread.unreadCount,
                        },
                    },
                    conversations: state.conversations.map((c) =>
                        c.id === unread.conversationId ? { ...c, unreadCount: unread.unreadCount } : c
                    ),
                }));
                break;
            }

            case "chat:conversation:updated": {
                const conv = data as ChatConversation;
                set((state) => {
                    const exists = state.conversations.some((c) => c.id === conv.id);
                    if (exists) {
                        return {
                            conversations: state.conversations.map((c) => (c.id === conv.id ? { ...c, ...conv } : c)),
                        };
                    } else {
                        return {
                            conversations: [conv, ...state.conversations],
                        };
                    }
                });
                break;
            }

            case "chat:member:joined": {
                const payload = data as ChatMemberJoinedPayload;
                notificationService.addNotification({
                    type: "CHAT",
                    title: "Nhóm trò chuyện",
                    message: `${payload.inviterUsername} đã thêm ${payload.memberUsernames.join(", ")} vào nhóm.`,
                    targetUrl: "/chat",
                });
                chatService.getConversationDetail(payload.conversationId).then((fresh) => {
                    set((state) => ({
                        conversations: state.conversations.map((c) => (c.id === fresh.id ? fresh : c)),
                    }));
                });
                break;
            }

            case "chat:member:left": {
                const payload = data as ChatMemberLeftPayload;
                if (payload.userId === currentUserId && payload.reason === "REMOVED") {
                    set({ drawerOpen: false });
                    notificationService.addNotification({
                        type: "CHAT",
                        title: "Nhóm trò chuyện",
                        message: `Bạn đã bị ${payload.operatorUsername} xóa khỏi nhóm.`,
                        targetUrl: "/chat",
                    });
                }
                chatService.getConversationDetail(payload.conversationId).then((fresh) => {
                    set((state) => ({
                        conversations: state.conversations.map((c) => (c.id === fresh.id ? fresh : c)),
                    }));
                });
                break;
            }

            case "chat:group:updated": {
                const payload = data as ChatGroupUpdatedPayload;
                set((state) => ({
                    conversations: state.conversations.map((c) =>
                        c.id === payload.conversationId
                            ? { ...c, name: payload.name, avatarUrl: payload.avatarUrl }
                            : c
                    ),
                }));
                break;
            }

            case "chat:member:role_updated": {
                const payload = data as ChatMemberRoleUpdatedPayload;
                if (payload.userId === currentUserId) {
                    notificationService.addNotification({
                        type: "CHAT",
                        title: "Cập nhật quyền hạn",
                        message: `${payload.operatorUsername} đã cập nhật vai trò của bạn thành ${payload.newRole}.`,
                        targetUrl: "/chat",
                    });
                }
                set((state) => ({
                    conversations: state.conversations.map((c) => {
                        if (c.id === payload.conversationId) {
                            return {
                                ...c,
                                participants: c.participants.map((p) =>
                                    p.userId === payload.userId ? { ...p, role: payload.newRole } : p
                                ),
                            };
                        }
                        return c;
                    }),
                }));
                break;
            }

            case "chat:user:presence": {
                const presence = data as ChatUserPresencePayload;
                set((state) => {
                    const next = new Set(state.onlineUserIds);
                    if (presence.status === "ONLINE") {
                        next.add(presence.userId);
                    } else {
                        next.delete(presence.userId);
                    }
                    return { onlineUserIds: next };
                });
                break;
            }

            default:
                break;
        }
    },

    reset: () => {
        set({
            conversations: [],
            activeConversationId: null,
            messagesByConversation: {},
            cursorByConversation: {},
            unreadSummary: initialSummary,
            onlineUserIds: new Set<number>(),
            drafts: {},
            tabFilter: "ALL",
            searchQuery: "",
            drawerOpen: false,
            activeToast: null,
        });
    },
}));

// Tự động dọn dẹp sạch state chat khi người dùng đăng xuất hoặc chuyển đổi tài khoản
useAuthStore.subscribe((state, prev) => {
    if (prev.isAuthenticated && (!state.isAuthenticated || (Boolean(state.user?.username) && Boolean(prev.user?.username) && state.user?.username !== prev.user?.username))) {
        useChatStore.getState().reset();
    }
});

