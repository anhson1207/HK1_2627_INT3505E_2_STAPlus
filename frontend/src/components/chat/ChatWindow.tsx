import React, { useState, useRef, useEffect, useLayoutEffect, useCallback } from "react";
import {
    ArrowLeft,
    Search,
    Info,
    PanelRight,
    Users,
    MessageSquare,
    UserPlus,
    ChevronDown,
    Loader2,
    X,
    Sparkles,
    Download,
} from "lucide-react";
import { useChatStore } from "../../stores/chatStore";
import { useAuthStore } from "../../stores/authStore";
import { parseJwt } from "../../utils/jwt";
import {
    formatDateDivider,
    getConversationDisplayName,
    getMessageReaders,
    getOtherParticipant,
} from "../../utils/chatUtils";
import { ChatAvatar } from "./ChatAvatar";
import { MessageBubble } from "./MessageBubble";
import { MessageComposer } from "./MessageComposer";
import { chatService } from "../../services/chatService";
import type { ChatMessage } from "../../types/chat";

interface ChatWindowProps {
    onBack?: () => void;
    onOpenDirectModal?: () => void;
    onOpenGroupModal?: () => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
    onBack,
    onOpenDirectModal,
    onOpenGroupModal,
}) => {
    const token = useAuthStore((state) => state.token);
    const currentUserId = parseJwt(token)?.userId;

    const conversations = useChatStore((state) => state.conversations);
    const activeConversationId = useChatStore((state) => state.activeConversationId);
    const messagesByConversation = useChatStore((state) => state.messagesByConversation);
    const cursorByConversation = useChatStore((state) => state.cursorByConversation);
    const loadingMessages = useChatStore((state) => state.loadingMessages);
    const loadingMoreMessages = useChatStore((state) => state.loadingMoreMessages);
    const loadMoreMessages = useChatStore((state) => state.loadMoreMessages);
    const sendMessage = useChatStore((state) => state.sendMessage);
    const drafts = useChatStore((state) => state.drafts);
    const setDraft = useChatStore((state) => state.setDraft);
    const drawerOpen = useChatStore((state) => state.drawerOpen);
    const setDrawerOpen = useChatStore((state) => state.setDrawerOpen);
    const onlineUserIds = useChatStore((state) => state.onlineUserIds);

    // Active conversation object
    const activeConversation = conversations.find((c) => c.id === activeConversationId);
    const messages = (activeConversationId ? messagesByConversation[activeConversationId] : null) || [];
    const cursorInfo = activeConversationId ? cursorByConversation[activeConversationId] : undefined;

    // In-chat search state
    const [showSearch, setShowSearch] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<ChatMessage[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    // Lightbox image preview state
    const [previewImage, setPreviewImage] = useState<{ url: string; name: string } | null>(null);

    // Scroll state management
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [showScrollBottom, setShowScrollBottom] = useState(false);
    const [hasNewMessageWhileScrolledUp, setHasNewMessageWhileScrolledUp] = useState(false);
    const prevScrollHeightRef = useRef<number>(0);
    const prevScrollTopRef = useRef<number>(0);
    const isPrependingRef = useRef<boolean>(false);
    const lastMessageCountRef = useRef<number>(0);

    // Scroll to bottom helper
    const scrollToBottom = useCallback((smooth = true) => {
        const container = scrollContainerRef.current;
        if (!container) return;
        container.scrollTo({
            top: container.scrollHeight,
            behavior: smooth ? "smooth" : "auto",
        });
        setShowScrollBottom(false);
        setHasNewMessageWhileScrolledUp(false);
    }, []);

    // 1. Initial conversation switch: scroll to bottom immediately
    useEffect(() => {
        if (!activeConversationId) return;
        setShowSearch(false);
        setSearchQuery("");
        setSearchResults([]);
        lastMessageCountRef.current = 0;
        isPrependingRef.current = false;

        // Cho browser paint tin nhắn rồi scroll
        const timer = setTimeout(() => {
            scrollToBottom(false);
        }, 60);
        return () => clearTimeout(timer);
    }, [activeConversationId, scrollToBottom]);

    // 2. Preserve scroll position when older messages are prepended
    useLayoutEffect(() => {
        const container = scrollContainerRef.current;
        if (!container) return;

        if (isPrependingRef.current) {
            const addedHeight = container.scrollHeight - prevScrollHeightRef.current;
            container.scrollTop = prevScrollTopRef.current + addedHeight;
            isPrependingRef.current = false;
        } else if (messages.length > lastMessageCountRef.current) {
            // New messages arrived at the end
            const distanceFromBottom =
                container.scrollHeight - container.scrollTop - container.clientHeight;
            const isNearBottom = distanceFromBottom < 160;

            if (isNearBottom || lastMessageCountRef.current === 0) {
                scrollToBottom(true);
            } else {
                setHasNewMessageWhileScrolledUp(true);
            }
        }
        lastMessageCountRef.current = messages.length;
    }, [messages, scrollToBottom]);

    // 3. Scroll handler for infinite scroll & floating button
    const handleScroll = () => {
        const container = scrollContainerRef.current;
        if (!container) return;

        const { scrollTop, scrollHeight, clientHeight } = container;
        const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
        setShowScrollBottom(distanceFromBottom > 200);

        if (distanceFromBottom <= 100) {
            setHasNewMessageWhileScrolledUp(false);
        }

        // Trigger upward infinite load when scrolled near top
        if (scrollTop < 70 && cursorInfo?.hasMore && !loadingMoreMessages && activeConversationId) {
            isPrependingRef.current = true;
            prevScrollHeightRef.current = scrollHeight;
            prevScrollTopRef.current = scrollTop;
            loadMoreMessages(activeConversationId);
        }
    };

    // 4. Handle in-chat message search
    const handleSearchSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        const trimmed = searchQuery.trim();
        if (!trimmed || !activeConversationId) return;

        setIsSearching(true);
        try {
            const res = await chatService.searchMessages(activeConversationId, trimmed, 50);
            setSearchResults(res.items);
        } catch {
            setSearchResults([]);
        } finally {
            setIsSearching(false);
        }
    };

    // Jump to searched message
    const handleJumpToMessage = (messageId: number) => {
        const elem = document.getElementById(`msg-${messageId}`);
        if (elem) {
            elem.scrollIntoView({ behavior: "smooth", block: "center" });
            elem.classList.add("ring-2", "ring-(--crm-primary)", "rounded-xl");
            setTimeout(() => {
                elem.classList.remove("ring-2", "ring-(--crm-primary)", "rounded-xl");
            }, 2000);
        }
    };

    // Retry sending message
    const handleRetry = async (msg: ChatMessage) => {
        if (!activeConversationId) return;
        await sendMessage(activeConversationId, msg.content);
    };

    // Close preview lightbox with Escape key
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape" && previewImage) {
                setPreviewImage(null);
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [previewImage]);

    // 5. Empty State: Chưa chọn cuộc trò chuyện
    if (!activeConversation) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center h-full p-8 bg-(--crm-surface-subtle)/40 text-center select-none">
                <div className="w-20 h-20 rounded-3xl bg-(--crm-surface) border border-(--crm-border) shadow-sm flex items-center justify-center text-(--crm-primary) mb-6 transition-transform hover:scale-105 duration-300">
                    <MessageSquare size={38} className="stroke-[1.75]" />
                </div>
                <h3 className="text-xl font-bold text-(--crm-heading) mb-2">
                    Chào mừng đến với Trò chuyện nội bộ
                </h3>
                <p className="text-sm text-(--crm-text-secondary) max-w-md mb-8 leading-relaxed">
                    Kết nối và trao đổi nhanh chóng với các thành viên trong đội ngũ CRM STAPlus qua tin nhắn trực tiếp 1–1 hoặc các nhóm thảo luận công việc.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3">
                    <button
                        type="button"
                        onClick={onOpenDirectModal}
                        className="btn-primary inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl shadow-xs cursor-pointer hover:shadow-md transition-all"
                    >
                        <UserPlus size={16} />
                        <span>Nhắn tin đồng nghiệp</span>
                    </button>
                    <button
                        type="button"
                        onClick={onOpenGroupModal}
                        className="btn-secondary inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl border border-(--crm-border) bg-white text-(--crm-heading) hover:bg-(--crm-surface-hover) cursor-pointer transition-all"
                    >
                        <Users size={16} className="text-(--crm-text-secondary)" />
                        <span>Tạo nhóm mới</span>
                    </button>
                </div>
            </div>
        );
    }

    const isGroup = activeConversation.type === "GROUP";
    const displayName = getConversationDisplayName(activeConversation, currentUserId);
    const otherParticipant = !isGroup ? getOtherParticipant(activeConversation, currentUserId) : undefined;
    const isDirectOnline = otherParticipant ? onlineUserIds.has(otherParticipant.userId) : false;

    // Count online participants in group
    const groupOnlineCount = isGroup
        ? activeConversation.participants.filter((p) => onlineUserIds.has(p.userId)).length
        : 0;

    return (
        <div className="flex-1 flex flex-col h-full bg-white relative overflow-hidden">
            {/* Header */}
            <header className="h-16 px-4 sm:px-6 border-b border-(--crm-border-subtle) flex items-center justify-between shrink-0 bg-white/95 backdrop-blur-xs z-10 shadow-2xs">
                <div className="flex items-center gap-3 min-w-0">
                    {/* Back Button on Mobile */}
                    {onBack && (
                        <button
                            type="button"
                            onClick={onBack}
                            className="md:hidden p-1.5 -ml-1 text-(--crm-text-secondary) hover:text-(--crm-heading) hover:bg-(--crm-surface-hover) rounded-lg transition-colors cursor-pointer"
                            title="Quay lại danh sách"
                        >
                            <ArrowLeft size={18} />
                        </button>
                    )}

                    {/* Avatar */}
                    <div
                        className="cursor-pointer"
                        onClick={() => setDrawerOpen(!drawerOpen)}
                        title="Xem thông tin chi tiết"
                    >
                        <ChatAvatar
                            name={displayName}
                            avatarUrl={activeConversation.avatarUrl}
                            isGroup={isGroup}
                            isOnline={!isGroup ? isDirectOnline : false}
                            size="md"
                        />
                    </div>

                    {/* Title & Presence */}
                    <div
                        className="min-w-0 cursor-pointer select-none"
                        onClick={() => setDrawerOpen(!drawerOpen)}
                    >
                        <h2 className="text-base font-bold text-(--crm-heading) truncate flex items-center gap-2">
                            <span>{displayName}</span>
                            {isGroup && (
                                <span className="text-[11px] font-normal px-2 py-0.5 rounded-full bg-(--crm-surface-hover) text-(--crm-text-secondary) border border-(--crm-border-subtle)">
                                    Nhóm
                                </span>
                            )}
                        </h2>
                        <p className="text-xs text-(--crm-text-muted) truncate flex items-center gap-1.5">
                            {isGroup ? (
                                <>
                                    <span>{activeConversation.participants.length} thành viên</span>
                                    {groupOnlineCount > 0 && (
                                        <>
                                            <span>•</span>
                                            <span className="text-emerald-600 font-medium">
                                                {groupOnlineCount} trực tuyến
                                            </span>
                                        </>
                                    )}
                                </>
                            ) : isDirectOnline ? (
                                <span className="text-emerald-600 font-medium">Đang trực tuyến</span>
                            ) : (
                                <span>Ngoại tuyến</span>
                            )}
                        </p>
                    </div>
                </div>

                {/* Header Actions */}
                <div className="flex items-center gap-1">
                    <button
                        type="button"
                        onClick={() => setShowSearch(!showSearch)}
                        className={`p-2 rounded-lg transition-colors cursor-pointer ${
                            showSearch
                                ? "bg-(--crm-primary)/10 text-(--crm-primary)"
                                : "text-(--crm-text-secondary) hover:text-(--crm-heading) hover:bg-(--crm-surface-hover)"
                        }`}
                        title="Tìm kiếm tin nhắn"
                    >
                        <Search size={18} />
                    </button>
                    <button
                        type="button"
                        onClick={() => setDrawerOpen(!drawerOpen)}
                        className={`p-2 rounded-lg transition-colors cursor-pointer ${
                            drawerOpen
                                ? "bg-(--crm-primary)/10 text-(--crm-primary)"
                                : "text-(--crm-text-secondary) hover:text-(--crm-heading) hover:bg-(--crm-surface-hover)"
                        }`}
                        title="Xem thông tin cuộc trò chuyện"
                    >
                        {isGroup ? <Info size={18} /> : <PanelRight size={18} />}
                    </button>
                </div>
            </header>

            {/* In-Chat Search Bar (collapsible) */}
            {showSearch && (
                <div className="px-4 py-2.5 bg-(--crm-surface-subtle) border-b border-(--crm-border-subtle) flex flex-col gap-2 animate-in slide-in-from-top-2 duration-150 z-10">
                    <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
                        <div className="relative flex-1">
                            <Search
                                size={15}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-(--crm-text-muted)"
                            />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Tìm kiếm nội dung tin nhắn trong cuộc trò chuyện này..."
                                className="w-full pl-9 pr-8 py-1.5 text-xs bg-white border border-(--crm-border) rounded-lg focus:outline-none focus:border-(--crm-primary) focus:ring-1 focus:ring-(--crm-primary)"
                                autoFocus
                            />
                            {searchQuery && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSearchQuery("");
                                        setSearchResults([]);
                                    }}
                                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-(--crm-text-muted) hover:text-(--crm-text)"
                                >
                                    <X size={13} />
                                </button>
                            )}
                        </div>
                        <button
                            type="submit"
                            disabled={isSearching || !searchQuery.trim()}
                            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-(--crm-primary) text-white disabled:opacity-50 cursor-pointer"
                        >
                            {isSearching ? <Loader2 size={13} className="animate-spin" /> : "Tìm"}
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setShowSearch(false);
                                setSearchQuery("");
                                setSearchResults([]);
                            }}
                            className="p-1.5 text-(--crm-text-muted) hover:text-(--crm-heading) rounded-lg hover:bg-white"
                        >
                            <X size={16} />
                        </button>
                    </form>

                    {/* Search results summary */}
                    {searchResults.length > 0 && (
                        <div className="max-h-36 overflow-y-auto space-y-1 py-1">
                            <p className="text-[11px] font-semibold text-(--crm-text-secondary)">
                                Tìm thấy {searchResults.length} tin nhắn phù hợp:
                            </p>
                            {searchResults.map((res) => (
                                <div
                                    key={res.id}
                                    onClick={() => handleJumpToMessage(res.id)}
                                    className="p-1.5 rounded-md bg-white border border-(--crm-border-subtle) hover:border-(--crm-primary) cursor-pointer text-xs flex items-center justify-between transition-colors"
                                >
                                    <span className="truncate max-w-[80%] font-medium text-(--crm-heading)">
                                        <span className="text-(--crm-text-muted) mr-1.5">
                                            {res.senderUsername}:
                                        </span>
                                        {res.content}
                                    </span>
                                    <span className="text-[10px] text-(--crm-text-muted) shrink-0">
                                        {formatDateDivider(res.createdAt)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Messages Viewport */}
            <div
                ref={scrollContainerRef}
                onScroll={handleScroll}
                className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-1 bg-gradient-to-b from-(--crm-surface-subtle)/30 to-white"
            >
                {/* Loader khi cuộn lên xem lịch sử cũ */}
                {loadingMoreMessages && (
                    <div className="flex justify-center py-2 select-none">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-(--crm-border) text-xs text-(--crm-text-secondary) shadow-2xs">
                            <Loader2 size={13} className="animate-spin text-(--crm-primary)" />
                            <span>Đang tải thêm tin nhắn cũ...</span>
                        </div>
                    </div>
                )}

                {/* Loader khi mở cuộc trò chuyện lần đầu */}
                {loadingMessages && messages.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-(--crm-text-muted) gap-2 select-none">
                        <Loader2 size={24} className="animate-spin text-(--crm-primary)" />
                        <span className="text-xs">Đang tải lịch sử tin nhắn...</span>
                    </div>
                )}

                {/* Empty conversation */}
                {!loadingMessages && messages.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-center p-6 select-none">
                        <div className="w-12 h-12 rounded-2xl bg-(--crm-primary)/10 text-(--crm-primary) flex items-center justify-center mb-3">
                            <Sparkles size={22} />
                        </div>
                        <h4 className="text-sm font-bold text-(--crm-heading) mb-1">
                            Bắt đầu cuộc trò chuyện
                        </h4>
                        <p className="text-xs text-(--crm-text-muted) max-w-xs">
                            Chưa có tin nhắn nào trong hội thoại này. Hãy gửi lời chào đầu tiên để cùng trao đổi công việc!
                        </p>
                    </div>
                )}

                {/* Render Messages grouped with date dividers */}
                {messages.map((msg, index) => {
                    const prevMsg = index > 0 ? messages[index - 1] : null;
                    const dateCurrent = formatDateDivider(msg.createdAt);
                    const datePrev = prevMsg ? formatDateDivider(prevMsg.createdAt) : null;
                    const showDateDivider = dateCurrent !== datePrev;

                    // Clustered avatar logic: show avatar if different sender or gap > 2 mins
                    let showAvatar = true;
                    if (prevMsg && prevMsg.senderId === msg.senderId && !showDateDivider) {
                        try {
                            const diff = Math.abs(
                                new Date(msg.createdAt).getTime() - new Date(prevMsg.createdAt).getTime()
                            );
                            if (diff < 2 * 60 * 1000) {
                                showAvatar = false;
                            }
                        } catch {
                            // keep default
                        }
                    }

                    // For Direct chat: check if other participant has read this message
                    const isReadByRecipient =
                        !isGroup &&
                        otherParticipant?.lastReadMessageId != null &&
                        msg.id > 0 &&
                        otherParticipant.lastReadMessageId >= msg.id;

                    // For Group chat: get readers who read past this message
                    const readers = isGroup
                        ? getMessageReaders(msg, activeConversation.participants)
                        : [];

                    return (
                        <React.Fragment key={msg.id || msg.clientMessageId || index}>
                            {/* Date Divider */}
                            {showDateDivider && (
                                <div className="flex justify-center my-4 select-none">
                                    <div className="px-3.5 py-1 rounded-full bg-slate-100 text-[11px] font-semibold text-(--crm-text-secondary) border border-slate-200/60 shadow-2xs">
                                        {dateCurrent}
                                    </div>
                                </div>
                            )}

                            {/* Message Bubble Item */}
                            <div id={`msg-${msg.id}`}>
                                <MessageBubble
                                    message={msg}
                                    isGroup={isGroup}
                                    showAvatar={showAvatar}
                                    isRead={isReadByRecipient}
                                    readers={readers}
                                    onRetry={handleRetry}
                                    onPreviewImage={(url, name) => setPreviewImage({ url, name })}
                                />
                            </div>
                        </React.Fragment>
                    );
                })}
            </div>

            {/* Floating Scroll to Bottom Button */}
            {showScrollBottom && (
                <button
                    type="button"
                    onClick={() => scrollToBottom(true)}
                    className="absolute right-6 bottom-20 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white text-(--crm-heading) border border-(--crm-border) shadow-md hover:bg-(--crm-surface-hover) transition-all text-xs font-medium cursor-pointer animate-in fade-in zoom-in duration-150"
                >
                    <ChevronDown size={14} />
                    <span>{hasNewMessageWhileScrolledUp ? "Tin nhắn mới" : "Cuộn xuống"}</span>
                    {hasNewMessageWhileScrolledUp && (
                        <span className="w-2 h-2 rounded-full bg-(--crm-primary) animate-pulse" />
                    )}
                </button>
            )}

            {/* Message Composer Footer */}
            <footer className="shrink-0 bg-white">
                <MessageComposer
                    conversationId={activeConversation.id}
                    initialDraft={drafts[activeConversation.id] || ""}
                    onSendMessage={async (content, attachment) => {
                        await sendMessage(activeConversation.id, content, attachment);
                        scrollToBottom(true);
                    }}
                    onDraftChange={(draft) => setDraft(activeConversation.id, draft)}
                    disabled={false}
                    placeholder={`Nhắn tin cho ${displayName}... (Enter để gửi, Shift + Enter để xuống dòng)`}
                />
            </footer>

            {/* Lightbox Modal Xem Ảnh Toàn Màn Hình */}
            {previewImage && (
                <div
                    className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in duration-200"
                    onClick={() => setPreviewImage(null)}
                >
                    <div
                        className="relative max-w-4xl max-h-[90vh] flex flex-col items-center select-none"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="absolute -top-12 right-0 flex items-center gap-3">
                            <a
                                href={previewImage.url}
                                download={previewImage.name}
                                target="_blank"
                                rel="noreferrer"
                                className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors cursor-pointer"
                                title="Tải ảnh về máy"
                            >
                                <Download size={20} />
                            </a>
                            <button
                                type="button"
                                onClick={() => setPreviewImage(null)}
                                className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors cursor-pointer"
                                title="Đóng (Esc)"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <img
                            src={previewImage.url}
                            alt={previewImage.name}
                            className="max-h-[82vh] max-w-full rounded-lg object-contain shadow-2xl"
                        />
                        <p className="mt-3 text-xs text-white/80 font-medium truncate max-w-md text-center">
                            {previewImage.name}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};
