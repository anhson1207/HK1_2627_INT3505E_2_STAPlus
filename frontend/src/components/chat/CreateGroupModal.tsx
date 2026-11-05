import React, { useState, useEffect, useRef } from "react";
import { Users, X, Search, Check, Loader2 } from "lucide-react";
import { chatService } from "../../services/chatService";
import { useChatStore } from "../../stores/chatStore";
import { ChatAvatar } from "./ChatAvatar";
import type { ChatUser } from "../../types/chat";

interface CreateGroupModalProps {
    open: boolean;
    onClose: () => void;
}

export const CreateGroupModal: React.FC<CreateGroupModalProps> = ({ open, onClose }) => {
    const [name, setName] = useState("");
    const [search, setSearch] = useState("");
    const [users, setUsers] = useState<ChatUser[]>([]);
    const [selectedUserIds, setSelectedUserIds] = useState<Set<number>>(new Set());
    const [loading, setLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const setActiveConversationId = useChatStore((state) => state.setActiveConversationId);
    const fetchConversations = useChatStore((state) => state.fetchConversations);
    const onlineUserIds = useChatStore((state) => state.onlineUserIds);

    const onCloseRef = useRef(onClose);
    onCloseRef.current = onClose;

    useEffect(() => {
        if (!open) {
            setName("");
            setSearch("");
            setSelectedUserIds(new Set());
            setError(null);
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
                console.error("Failed to fetch users:", err);
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

    const toggleUser = (userId: number) => {
        setSelectedUserIds((prev) => {
            const next = new Set(prev);
            if (next.has(userId)) next.delete(userId);
            else next.add(userId);
            return next;
        });
    };

    const handleCreateGroup = async (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = name.trim();
        if (!trimmed) {
            setError("Vui lòng nhập tên nhóm chat");
            return;
        }
        if (selectedUserIds.size === 0) {
            setError("Vui lòng chọn ít nhất 1 thành viên vào nhóm");
            return;
        }

        setError(null);
        setIsSubmitting(true);
        try {
            const group = await chatService.createGroup({
                name: trimmed,
                memberIds: Array.from(selectedUserIds),
            });
            await fetchConversations();
            setActiveConversationId(group.id);
            onClose();
        } catch (err) {
            console.error("Failed to create group:", err);
            setError(err instanceof Error ? err.message : "Tạo nhóm thất bại, vui lòng thử lại.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const selectedUsers = users.filter((u) => selectedUserIds.has(u.id));

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150"
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl border border-(--crm-border) overflow-hidden flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-(--crm-border-subtle)">
                    <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-(--crm-info-soft) text-(--crm-primary) flex items-center justify-center">
                            <Users size={20} />
                        </div>
                        <div>
                            <h3 className="text-base font-semibold text-(--crm-heading)">Tạo nhóm trò chuyện mới</h3>
                            <p className="text-xs text-(--crm-text-secondary)">
                                Trò chuyện cộng tác và trao đổi công việc theo nhóm
                            </p>
                        </div>
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

                <form onSubmit={handleCreateGroup} className="flex-1 flex flex-col overflow-hidden">
                    <div className="p-5 space-y-4 border-b border-(--crm-border-subtle)">
                        {error && (
                            <div className="p-3 rounded-xl bg-(--crm-danger-soft) border border-(--crm-danger)/30 text-xs text-(--crm-danger) font-medium">
                                {error}
                            </div>
                        )}

                        {/* Tên nhóm */}
                        <div>
                            <label htmlFor="group-name-input" className="block text-xs font-semibold text-(--crm-heading) mb-1.5">
                                Tên nhóm chat <span className="text-(--crm-danger)">*</span>
                            </label>
                            <input
                                id="group-name-input"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Ví dụ: Team Kinh Doanh Miền Nam, Dự án Alpha..."
                                autoFocus
                                required
                                className="w-full px-3.5 py-2 text-sm rounded-xl border border-(--crm-border) bg-white text-(--crm-heading) placeholder:text-(--crm-text-muted) focus:border-(--crm-primary) focus:ring-2 focus:ring-(--crm-primary)/20 focus:outline-none transition-all"
                            />
                        </div>

                        {/* Selected Members Chips */}
                        {selectedUsers.length > 0 && (
                            <div>
                                <label className="block text-xs font-semibold text-(--crm-text-secondary) mb-1.5">
                                    Thành viên đã chọn ({selectedUsers.length})
                                </label>
                                <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto crm-scrollbar p-1">
                                    {selectedUsers.map((u) => (
                                        <span
                                            key={u.id}
                                            className="inline-flex items-center gap-1.5 pl-2 pr-1.5 py-0.5 rounded-full bg-(--crm-info-soft) text-(--crm-primary) text-xs font-medium border border-(--crm-primary)/20"
                                        >
                                            <span className="truncate max-w-28">{u.username}</span>
                                            <button
                                                type="button"
                                                onClick={() => toggleUser(u.id)}
                                                className="hover:bg-(--crm-primary)/20 rounded-full p-0.5"
                                            >
                                                <X size={12} />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Tìm kiếm thành viên */}
                        <div>
                            <label className="block text-xs font-semibold text-(--crm-heading) mb-1.5">
                                Chọn thành viên ({selectedUserIds.size} đã chọn)
                            </label>
                            <div className="relative">
                                <Search
                                    size={15}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-(--crm-text-muted)"
                                />
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Tìm theo tên hoặc email đồng nghiệp..."
                                    className="w-full pl-9 pr-4 py-1.5 text-xs rounded-lg border border-(--crm-border) bg-(--crm-surface-subtle) text-(--crm-heading) placeholder:text-(--crm-text-muted) focus:bg-white focus:border-(--crm-primary) focus:outline-none transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Member checklist */}
                    <div className="flex-1 overflow-y-auto p-3 space-y-1 crm-scrollbar min-h-48 max-h-60">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-8 text-(--crm-text-muted)">
                                <Loader2 size={20} className="animate-spin text-(--crm-primary)" />
                                <span className="text-xs mt-1.5">Đang tải danh sách nhân viên...</span>
                            </div>
                        ) : users.length === 0 ? (
                            <p className="text-center text-xs text-(--crm-text-muted) py-8">
                                Không tìm thấy nhân viên nào phù hợp
                            </p>
                        ) : (
                            users.map((u) => {
                                const isSelected = selectedUserIds.has(u.id);
                                const isOnline = onlineUserIds.has(u.id);

                                return (
                                    <div
                                        key={u.id}
                                        onClick={() => toggleUser(u.id)}
                                        className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-colors ${
                                            isSelected
                                                ? "bg-(--crm-info-soft)/60 border border-(--crm-primary)/30"
                                                : "hover:bg-(--crm-surface-hover) border border-transparent"
                                        }`}
                                    >
                                        <div className="flex items-center gap-2.5 min-w-0">
                                            <ChatAvatar
                                                name={u.username}
                                                isOnline={isOnline}
                                                size="sm"
                                            />
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-1.5">
                                                    <p className="text-xs font-semibold text-(--crm-heading) truncate">
                                                        {u.username}
                                                    </p>
                                                    <span className="text-[10px] px-1 py-0.2 rounded bg-slate-100 text-slate-600">
                                                        {u.role}
                                                    </span>
                                                </div>
                                                <p className="text-[11px] text-(--crm-text-muted) truncate">{u.email}</p>
                                            </div>
                                        </div>

                                        <div
                                            className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all ${
                                                isSelected
                                                    ? "bg-(--crm-primary) border-(--crm-primary) text-white"
                                                    : "border-(--crm-border) bg-white text-transparent"
                                            }`}
                                        >
                                            <Check size={13} strokeWidth={3} />
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {/* Footer Actions */}
                    <div className="flex items-center justify-end gap-2.5 px-6 py-4 border-t border-(--crm-border-subtle) bg-(--crm-surface-subtle)">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-xs font-semibold text-(--crm-text) bg-white border border-(--crm-border) rounded-xl hover:bg-(--crm-surface-hover) transition-colors"
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting || !name.trim() || selectedUserIds.size === 0}
                            className="px-5 py-2 text-xs font-semibold text-white bg-(--crm-primary) hover:bg-(--crm-primary-hover) rounded-xl shadow-xs disabled:opacity-50 flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                            {isSubmitting && <Loader2 size={14} className="animate-spin" />}
                            Tạo nhóm ({selectedUserIds.size} người)
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

