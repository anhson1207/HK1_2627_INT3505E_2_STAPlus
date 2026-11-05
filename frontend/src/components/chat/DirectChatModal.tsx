import React, { useState, useEffect, useRef } from "react";
import { Search, X, UserPlus, Loader2 } from "lucide-react";
import { chatService } from "../../services/chatService";
import { useChatStore } from "../../stores/chatStore";
import { ChatAvatar } from "./ChatAvatar";
import type { ChatUser } from "../../types/chat";

interface DirectChatModalProps {
    open: boolean;
    onClose: () => void;
}

export const DirectChatModal: React.FC<DirectChatModalProps> = ({ open, onClose }) => {
    const [search, setSearch] = useState("");
    const [users, setUsers] = useState<ChatUser[]>([]);
    const [loading, setLoading] = useState(false);
    const [submittingId, setSubmittingId] = useState<number | null>(null);

    const onlineUserIds = useChatStore((state) => state.onlineUserIds);
    const setActiveConversationId = useChatStore((state) => state.setActiveConversationId);
    const fetchConversations = useChatStore((state) => state.fetchConversations);

    const onCloseRef = useRef(onClose);
    onCloseRef.current = onClose;

    useEffect(() => {
        if (!open) {
            setSearch("");
            setUsers([]);
            return;
        }

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") onCloseRef.current();
        };
        window.addEventListener("keydown", handleKeyDown);

        let isCancelled = false;
        setLoading(true);

        const timer = setTimeout(async () => {
            try {
                const list = await chatService.searchUsers(search);
                if (!isCancelled) {
                    setUsers(list);
                }
            } catch (err) {
                console.error("Failed to search users:", err);
            } finally {
                if (!isCancelled) setLoading(false);
            }
        }, 150);

        return () => {
            isCancelled = true;
            clearTimeout(timer);
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [open, search]);

    if (!open) return null;

    const handleSelectUser = async (user: ChatUser) => {
        setSubmittingId(user.id);
        try {
            const conv = await chatService.getOrCreateDirect(user.id);
            await fetchConversations();
            setActiveConversationId(conv.id);
            onClose();
        } catch (err) {
            console.error("Failed to start direct conversation:", err);
        } finally {
            setSubmittingId(null);
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150"
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            <div className="w-full max-w-md rounded-2xl bg-white shadow-xl border border-(--crm-border) overflow-hidden flex flex-col max-h-[85vh]">
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-(--crm-border-subtle)">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-(--crm-info-soft) text-(--crm-primary) flex items-center justify-center">
                            <UserPlus size={18} />
                        </div>
                        <h3 className="text-base font-semibold text-(--crm-heading)">Bắt đầu cuộc trò chuyện</h3>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        title="Đóng"
                        aria-label="Đóng"
                        className="p-1.5 rounded-lg text-(--crm-text-muted) hover:bg-(--crm-surface-hover) hover:text-(--crm-text) transition-colors cursor-pointer"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Search Box */}
                <div className="p-4 border-b border-(--crm-border-subtle) bg-(--crm-surface-subtle)">
                    <div className="relative">
                        <Search
                            size={16}
                            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-(--crm-text-muted)"
                        />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Tìm kiếm đồng nghiệp theo tên hoặc email..."
                            autoFocus
                            className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-(--crm-border) bg-white text-(--crm-heading) placeholder:text-(--crm-text-muted) focus:border-(--crm-primary) focus:ring-2 focus:ring-(--crm-primary)/20 focus:outline-none transition-all"
                        />
                    </div>
                </div>

                {/* Users List */}
                <div className="flex-1 overflow-y-auto p-2 divide-y divide-(--crm-border-subtle)/50 crm-scrollbar">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-10 text-(--crm-text-muted)">
                            <Loader2 size={24} className="animate-spin text-(--crm-primary)" />
                            <span className="text-xs mt-2">Đang tìm đồng nghiệp...</span>
                        </div>
                    ) : users.length === 0 ? (
                        <div className="text-center py-10 px-4 text-(--crm-text-muted)">
                            <p className="text-sm font-medium">Không tìm thấy nhân viên phù hợp</p>
                            <p className="text-xs mt-1">Hãy thử tìm theo tên tài khoản hoặc email khác</p>
                        </div>
                    ) : (
                        users.map((u) => {
                            const isOnline = onlineUserIds.has(u.id);
                            const isPending = submittingId === u.id;

                            return (
                                <button
                                    key={u.id}
                                    type="button"
                                    onClick={() => handleSelectUser(u)}
                                    disabled={submittingId !== null}
                                    className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-(--crm-surface-hover) transition-colors text-left group cursor-pointer disabled:opacity-60"
                                >
                                    <div className="flex items-center gap-3 min-w-0">
                                        <ChatAvatar
                                            name={u.username}
                                            isOnline={isOnline}
                                            size="md"
                                        />
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2">
                                                <p className="text-sm font-semibold text-(--crm-heading) truncate">
                                                    {u.username}
                                                </p>
                                                <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-(--crm-surface-hover) text-(--crm-text-secondary) border border-(--crm-border-subtle)">
                                                    {u.role}
                                                </span>
                                            </div>
                                            <p className="text-xs text-(--crm-text-muted) truncate">{u.email}</p>
                                        </div>
                                    </div>

                                    <div className="shrink-0 text-xs font-medium text-(--crm-primary) group-hover:underline pl-2">
                                        {isPending ? (
                                            <Loader2 size={16} className="animate-spin" />
                                        ) : (
                                            "Nhắn tin"
                                        )}
                                    </div>
                                </button>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
};

