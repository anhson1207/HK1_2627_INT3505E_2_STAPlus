import { useEffect, useState } from "react";
import { useChatStore } from "../../stores/chatStore";
import { useAuthStore } from "../../stores/authStore";
import { parseJwt } from "../../utils/jwt";
import { getOtherParticipant } from "../../utils/chatUtils";
import { ConversationList } from "../../components/chat/ConversationList";
import { ChatWindow } from "../../components/chat/ChatWindow";
import { DirectInfoDrawer } from "../../components/chat/DirectInfoDrawer";
import { GroupInfoDrawer } from "../../components/chat/GroupInfoDrawer";
import { DirectChatModal } from "../../components/chat/DirectChatModal";
import { CreateGroupModal } from "../../components/chat/CreateGroupModal";

export default function ChatPage() {
    const token = useAuthStore((state) => state.token);
    const currentUserId = parseJwt(token)?.userId;

    const conversations = useChatStore((state) => state.conversations);
    const activeConversationId = useChatStore((state) => state.activeConversationId);
    const setActiveConversationId = useChatStore((state) => state.setActiveConversationId);
    const fetchConversations = useChatStore((state) => state.fetchConversations);
    const drawerOpen = useChatStore((state) => state.drawerOpen);
    const setDrawerOpen = useChatStore((state) => state.setDrawerOpen);
    const onlineUserIds = useChatStore((state) => state.onlineUserIds);

    const isConnected = useChatStore((state) => state.socketConnected);
    const isReconnecting = useChatStore((state) => state.socketReconnecting);
    const reconnect = useChatStore((state) => state.manualReconnect);

    // Modal state for standalone triggers (e.g. from empty state in ChatWindow)
    const [openDirectModal, setOpenDirectModal] = useState(false);
    const [openGroupModal, setOpenGroupModal] = useState(false);

    // 1. Refresh conversations fetch on page load
    useEffect(() => {
        fetchConversations();
    }, [fetchConversations]);

    const activeConversation = conversations.find((c) => c.id === activeConversationId);
    const otherParticipant =
        activeConversation && activeConversation.type === "DIRECT"
            ? getOtherParticipant(activeConversation, currentUserId)
            : undefined;

    return (
        <div className="crm-chat-page h-[calc(100vh-var(--crm-header-height)-48px)] min-h-[540px] flex rounded-2xl border border-(--crm-border) bg-white shadow-xs overflow-hidden relative">
            {/* Left Column: Conversations List */}
            <div
                className={`${
                    activeConversationId ? "hidden md:flex" : "flex w-full"
                } md:w-80 lg:w-96 shrink-0 h-full border-r border-(--crm-border-subtle)`}
            >
                <ConversationList
                    socketConnected={isConnected}
                    socketReconnecting={isReconnecting}
                    onManualReconnect={reconnect}
                />
            </div>

            {/* Center Column: Active Chat Window */}
            <div
                className={`${
                    !activeConversationId ? "hidden md:flex" : "flex"
                } flex-1 h-full min-w-0`}
            >
                <ChatWindow
                    onBack={() => setActiveConversationId(null)}
                    onOpenDirectModal={() => setOpenDirectModal(true)}
                    onOpenGroupModal={() => setOpenGroupModal(true)}
                />
            </div>

            {/* Right Column: Info Drawer (Direct or Group) */}
            {drawerOpen && activeConversation && (
                <>
                    {/* Mobile backdrop for drawer */}
                    <div
                        className="fixed inset-0 bg-slate-900/40 backdrop-blur-2xs z-25 lg:hidden"
                        onClick={() => setDrawerOpen(false)}
                    />

                    {/* Drawer container */}
                    <div className="absolute right-0 top-0 bottom-0 z-30 lg:relative lg:z-auto">
                        {activeConversation.type === "DIRECT" ? (
                            <DirectInfoDrawer
                                open={drawerOpen}
                                onClose={() => setDrawerOpen(false)}
                                participant={otherParticipant}
                                isOnline={otherParticipant ? onlineUserIds.has(otherParticipant.userId) : false}
                            />
                        ) : (
                            <GroupInfoDrawer
                                open={drawerOpen}
                                onClose={() => setDrawerOpen(false)}
                                conversation={activeConversation}
                                currentUserId={currentUserId}
                            />
                        )}
                    </div>
                </>
            )}

            {/* Standalone Modals triggered by ChatWindow empty state */}
            <DirectChatModal open={openDirectModal} onClose={() => setOpenDirectModal(false)} />
            <CreateGroupModal open={openGroupModal} onClose={() => setOpenGroupModal(false)} />
        </div>
    );
}
