import React, { useState } from "react";
import {
    Search,
    UserPlus,
    Users,
    MessageSquare,
    WifiOff,
    RefreshCw,
    X,
} from "lucide-react";
import { useChatStore } from "../../stores/chatStore";
import { useAuthStore } from "../../stores/authStore";
import { parseJwt } from "../../utils/jwt";
import {
    formatConversationTime,
    getConversationDisplayName,
    getOtherParticipant,
} from "../../utils/chatUtils";
import { ChatAvatar } from "./ChatAvatar";
import { DirectChatModal } from "./DirectChatModal";
import { CreateGroupModal } from "./CreateGroupModal";

interface ConversationListProps {
    socketConnected: boolean;
    socketReconnecting: boolean;
    onManualReconnect: () => void;
}

export const ConversationList: React.FC<ConversationListProps> = ({
    socketConnected,
    socketReconnecting,
    onManualReconnect,
}) => {
    const [openDirectModal, setOpenDirectModal] = useState(false);
    const [openGroupModal, setOpenGroupModal] = useState(false);

    const token = useAuthStore((state) => state.token);
    const currentUserId = parseJwt(token)?.userId;

    const conversations = useChatStore((state) => state.conversations);
    const activeConversationId = useChatStore((state) => state.activeConversationId);
    const setActiveConversationId = useChatStore((state) => state.setActiveConversationId);
    const loadingConversations = useChatStore((state) => state.loadingConversations);
    const tabFilter = useChatStore((state) => state.tabFilter);
    const setTabFilter = useChatStore((state) => state.setTabFilter);
    const searchQuery = useChatStore((state) => state.searchQuery);
    const setSearchQuery = useChatStore((state) => state.setSearchQuery);
    const onlineUserIds = useChatStore((state) => state.onlineUserIds);

    // Filter conversations
    const filteredConversations = conversations.filter((conv) => {
        // 1. Tab filter
        if (tabFilter === "DIRECT" && conv.type !== "DIRECT") return false;
        if (tabFilter === "GROUP" && conv.type !== "GROUP") return false;

        // 2. Search query filter
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase().trim();
            const name = getConversationDisplayName(conv, currentUserId).toLowerCase();
            const lastMsg = conv.lastMessage?.content?.toLowerCase() || "";
            return name.includes(q) || lastMsg.includes(q);
        }

        return true;
    });

    // Counts for tabs
    const directCount = conversations.filter((c) => c.type === "DIRECT").length;
    const groupCount = conversations.filter((c) => c.type === "GROUP").length;

    return (
        <aside className="w-full md:w-80 lg:w-96 flex flex-col h-full bg-white border-r border-(--crm-border) select-none shrink-0">
            {/* Header: Title & New Chat actions */}
            <div className="p-4 border-b border-(--crm-border-subtle)">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <h2 className="text-lg font-bold text-(--crm-heading) tracking-tight">Trò chuyện</h2>
                        {!socketConnected && (
                            <span
                                className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full ${
                                    socketReconnecting
                                        ? "bg-amber-100 text-amber-800"
                                        : "bg-rose-100 text-rose-800"
                                }`}
                                title="Trạng thái kết nối máy chủ"
                            >
                                <WifiOff size={11} />
                                {socketReconnecting ? "Đang kết nối lại..." : "Mất kết nối"}
                                {!socketReconnecting && (
                                    <button
                                        type="button"
                                        onClick={onManualReconnect}
                                        className="hover:underline ml-0.5"
                                    >
                                        <RefreshCw size={10} />
                                    </button>
                                )}
                            </span>
                        )}
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-1.5">
                        <button
                            type="button"
                            onClick={() => setOpenDirectModal(true)}
                            className="p-2 rounded-lg text-(--crm-text-secondary) hover:text-(--crm-primary) hover:bg-(--crm-surface-hover) transition-colors"
                            title="Chat 1-1 mới"
                        >
                            <UserPlus size={18} />
                        </button>
                        <button
                            type="button"
                            onClick={() => setOpenGroupModal(true)}
                            className="p-2 rounded-lg text-(--crm-text-secondary) hover:text-(--crm-primary) hover:bg-(--crm-surface-hover) transition-colors"
                            title="Tạo nhóm mới"
                        >
                            <Users size={18} />
                        </button>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="relative">
                    <Search
                        size={15}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-(--crm-text-muted)"
                    />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Tìm hội thoại, tin nhắn..."
                        className="w-full pl-9 pr-8 py-1.5 text-xs rounded-xl border border-(--crm-border) bg-(--crm-surface-subtle) text-(--crm-heading) placeholder:text-(--crm-text-muted) focus:bg-white focus:border-(--crm-primary) focus:outline-none transition-all"
                    />
                    {searchQuery && (
                        <button
                            type="button"
                            onClick={() => setSearchQuery("")}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-(--crm-text-muted) hover:text-(--crm-text)"
                        >
                            <X size={14} />
                        </button>
                    )}
                </div>

                {/* Filter Tabs */}
                <div className="flex items-center gap-1 mt-3 bg-(--crm-surface-subtle) p-1 rounded-xl">
                    <button
                        type="button"
                        onClick={() => setTabFilter("ALL")}
                        className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all text-center ${
                            tabFilter === "ALL"
                                ? "bg-white text-(--crm-primary) shadow-2xs"
                                : "text-(--crm-text-secondary) hover:text-(--crm-text)"
                        }`}
                    >
                        Tất cả ({conversations.length})
                    </button>
                    <button
                        type="button"
                        onClick={() => setTabFilter("DIRECT")}
                        className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all text-center ${
                            tabFilter === "DIRECT"
                                ? "bg-white text-(--crm-primary) shadow-2xs"
                                : "text-(--crm-text-secondary) hover:text-(--crm-text)"
                        }`}
                    >
                        Cá nhân ({directCount})
                    </button>
                    <button
                        type="button"
                        onClick={() => setTabFilter("GROUP")}
                        className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all text-center ${
                            tabFilter === "GROUP"
                                ? "bg-white text-(--crm-primary) shadow-2xs"
                                : "text-(--crm-text-secondary) hover:text-(--crm-text)"
                        }`}
                    >
                        Nhóm ({groupCount})
                    </button>
                </div>
            </div>

            {/* Conversation List */}
            <div className="flex-1 overflow-y-auto divide-y divide-(--crm-border-subtle)/40 crm-scrollbar">
                {loadingConversations ? (
                    <div className="p-4 space-y-3">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="flex items-center gap-3 animate-pulse">
                                <div className="w-10 h-10 rounded-full bg-slate-200" />
                                <div className="flex-1 space-y-2">
                                    <div className="h-3 bg-slate-200 rounded w-3/5" />
                                    <div className="h-2.5 bg-slate-100 rounded w-4/5" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : filteredConversations.length === 0 ? (
                    <div className="p-8 text-center text-(--crm-text-muted) flex flex-col items-center justify-center h-full">
                        <div className="w-12 h-12 rounded-2xl bg-(--crm-surface-hover) flex items-center justify-center text-(--crm-text-muted) mb-3">
                            <MessageSquare size={24} />
                        </div>
                        <p className="text-sm font-semibold text-(--crm-heading)">
                            {searchQuery ? "Không tìm thấy kết quả" : "Chưa có hội thoại nào"}
                        </p>
                        <p className="text-xs text-(--crm-text-secondary) mt-1 max-w-56">
                            {searchQuery
                                ? "Thử tìm kiếm với từ khóa khác"
                                : "Bắt đầu cuộc trò chuyện với đồng nghiệp hoặc tạo nhóm làm việc ngay"}
                        </p>
                        {!searchQuery && (
                            <div className="flex gap-2 mt-4">
                                <button
                                    type="button"
                                    onClick={() => setOpenDirectModal(true)}
                                    className="px-3 py-1.5 text-xs font-semibold text-white bg-(--crm-primary) rounded-lg shadow-2xs hover:bg-(--crm-primary-hover)"
                                >
                                    Chat 1-1
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setOpenGroupModal(true)}
                                    className="px-3 py-1.5 text-xs font-semibold text-(--crm-text) bg-(--crm-surface-hover) border border-(--crm-border) rounded-lg hover:bg-slate-200"
                                >
                                    Tạo nhóm
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    filteredConversations.map((conv) => {
                        const isSelected = activeConversationId === conv.id;
                        const isGroup = conv.type === "GROUP";
                        const otherParticipant = !isGroup
                            ? getOtherParticipant(conv, currentUserId)
                            : undefined;
                        const isOnline = otherParticipant
                            ? onlineUserIds.has(otherParticipant.userId)
                            : false;
                        const displayName = getConversationDisplayName(conv, currentUserId);
                        const timeStr = formatConversationTime(conv.lastMessageAt || conv.updatedAt);

                        const lastMsg = conv.lastMessage;
                        let previewText = "Chưa có tin nhắn";
                        if (lastMsg) {
                            if (lastMsg.type === "SYSTEM") {
                                previewText = lastMsg.content;
                            } else {
                                const senderPrefix = lastMsg.isMine
                                    ? "Bạn: "
                                    : isGroup
                                    ? `${lastMsg.senderUsername}: `
                                    : "";
                                previewText = `${senderPrefix}${lastMsg.content}`;
                            }
                        }

                        return (
                            <div
                                key={conv.id}
                                onClick={() => setActiveConversationId(conv.id)}
                                className={`crm-conversation-item flex items-center gap-3 p-3.5 cursor-pointer transition-all border-l-3 ${
                                    isSelected
                                        ? "bg-(--crm-info-soft)/60 border-(--crm-primary)"
                                        : "border-transparent hover:bg-(--crm-surface-hover)"
                                }`}
                            >
                                <ChatAvatar
                                    name={displayName}
                                    avatarUrl={conv.avatarUrl}
                                    isGroup={isGroup}
                                    isOnline={isOnline}
                                    size="md"
                                />

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-1">
                                        <p
                                            className={`text-sm truncate font-medium ${
                                                conv.unreadCount > 0
                                                    ? "font-bold text-(--crm-heading)"
                                                    : "text-(--crm-heading)"
                                            }`}
                                        >
                                            {displayName}
                                        </p>
                                        <span className="text-[10px] text-(--crm-text-muted) shrink-0 ml-2">
                                            {timeStr}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between gap-2">
                                        <p
                                            className={`text-xs truncate ${
                                                conv.unreadCount > 0
                                                    ? "font-semibold text-(--crm-text)"
                                                    : "text-(--crm-text-muted)"
                                            }`}
                                        >
                                            {previewText}
                                        </p>

                                        {conv.unreadCount > 0 && (
                                            <span className="shrink-0 px-1.5 py-0.5 rounded-full bg-(--crm-primary) text-white text-[10px] font-bold leading-none shadow-2xs">
                                                {conv.unreadCount > 99 ? "99+" : conv.unreadCount}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Modals */}
            <DirectChatModal open={openDirectModal} onClose={() => setOpenDirectModal(false)} />
            <CreateGroupModal open={openGroupModal} onClose={() => setOpenGroupModal(false)} />
        </aside>
    );
};
