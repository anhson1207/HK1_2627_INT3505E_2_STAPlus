import React, { useState, useEffect } from "react";
import {
    X,
    UserPlus,
    LogOut,
    Crown,
    ShieldCheck,
    MoreVertical,
    UserMinus,
    Check,
    Pencil,
    Loader2,
    Search,
} from "lucide-react";
import { chatService } from "../../services/chatService";
import { useChatStore } from "../../stores/chatStore";
import { ChatAvatar } from "./ChatAvatar";
import type { ChatConversation, ChatUser } from "../../types/chat";

interface GroupInfoDrawerProps {
    open: boolean;
    onClose: () => void;
    conversation: ChatConversation;
    currentUserId?: number;
}

export const GroupInfoDrawer: React.FC<GroupInfoDrawerProps> = ({
    open,
    onClose,
    conversation,
    currentUserId,
}) => {
    const [isEditingName, setIsEditingName] = useState(false);
    const [groupName, setGroupName] = useState(conversation.name || "");
    const [isSavingName, setIsSavingName] = useState(false);

    // Modal state: Thêm thành viên
    const [showAddMemberModal, setShowAddMemberModal] = useState(false);
    const [candidateUsers, setCandidateUsers] = useState<ChatUser[]>([]);
    const [candidateSearch, setCandidateSearch] = useState("");
    const [selectedUserIds, setSelectedUserIds] = useState<Set<number>>(new Set());
    const [loadingCandidates, setLoadingCandidates] = useState(false);
    const [isAdding, setIsAdding] = useState(false);

    // Dropdown menu state
    const [activeMenuUserId, setActiveMenuUserId] = useState<number | null>(null);
    const [busyUserId, setBusyUserId] = useState<number | null>(null);

    // Custom Confirmation Dialog State
    const [confirmDialog, setConfirmDialog] = useState<{
        title: string;
        message: string;
        confirmText: string;
        isDanger?: boolean;
        isAlertOnly?: boolean;
        onConfirm: () => Promise<void>;
    } | null>(null);
    const [isConfirming, setIsConfirming] = useState(false);

    const onlineUserIds = useChatStore((state) => state.onlineUserIds);
    const fetchConversations = useChatStore((state) => state.fetchConversations);
    const setActiveConversationId = useChatStore((state) => state.setActiveConversationId);

    useEffect(() => {
        if (open) {
            fetchConversations();
        }
    }, [open, fetchConversations]);

    useEffect(() => {
        if (!open) return;
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                if (confirmDialog) {
                    setConfirmDialog(null);
                } else if (showAddMemberModal) {
                    setShowAddMemberModal(false);
                } else {
                    onClose();
                }
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [open, confirmDialog, showAddMemberModal, onClose]);

    if (!open) return null;

    // Xác định vai trò của người gọi
    const myMembership = conversation.participants.find((p) => p.userId === currentUserId);
    const isOwner = myMembership?.role === "OWNER";
    const isAdmin = myMembership?.role === "ADMIN";
    const canManage = isOwner || isAdmin;

    // Đổi tên nhóm
    const handleSaveName = async () => {
        const trimmed = groupName.trim();
        if (!trimmed || trimmed === conversation.name) {
            setIsEditingName(false);
            return;
        }

        setIsSavingName(true);
        try {
            await chatService.updateGroup(conversation.id, { name: trimmed });
            setIsEditingName(false);
            await fetchConversations();
        } catch (err) {
            console.error("Failed to update group name:", err);
        } finally {
            setIsSavingName(false);
        }
    };

    // Mở modal thêm thành viên
    const handleOpenAddMembers = async () => {
        setShowAddMemberModal(true);
        setLoadingCandidates(true);
        setSelectedUserIds(new Set());
        setCandidateSearch("");
        try {
            const allUsers = await chatService.searchUsers();
            const currentParticipantIds = new Set(
                conversation.participants
                    .filter((p) => p.status === "ACTIVE")
                    .map((p) => p.userId)
            );
            const candidates = allUsers.filter((u) => !currentParticipantIds.has(u.id));
            setCandidateUsers(candidates);
        } catch (err) {
            console.error("Failed to load candidate members:", err);
        } finally {
            setLoadingCandidates(false);
        }
    };

    const handleConfirmAddMembers = async () => {
        if (selectedUserIds.size === 0) return;
        setIsAdding(true);
        try {
            await chatService.addGroupMembers(conversation.id, Array.from(selectedUserIds));
            setShowAddMemberModal(false);
            await fetchConversations();
        } catch (err) {
            console.error("Failed to add group members:", err);
        } finally {
            setIsAdding(false);
        }
    };

    // Bổ nhiệm / Thu hồi quyền ADMIN
    const handleToggleRole = async (targetUserId: number, currentRole: string) => {
        const newRole = currentRole === "ADMIN" ? "MEMBER" : "ADMIN";
        setActiveMenuUserId(null);
        setBusyUserId(targetUserId);
        try {
            await chatService.updateMemberRole(conversation.id, targetUserId, newRole);
            await fetchConversations();
        } catch (err) {
            console.error("Failed to update role:", err);
        } finally {
            setBusyUserId(null);
        }
    };

    // Chuyển quyền OWNER
    const handleTransferOwner = (targetUserId: number, targetUsername: string) => {
        setActiveMenuUserId(null);
        setConfirmDialog({
            title: "Chuyển quyền Trưởng nhóm",
            message: `Bạn có chắc chắn muốn chuyển quyền Trưởng nhóm cho "${targetUsername}"? Sau khi chuyển giao, bạn sẽ trở thành Quản trị viên (ADMIN) của nhóm.`,
            confirmText: "Xác nhận chuyển giao",
            isDanger: false,
            onConfirm: async () => {
                setBusyUserId(targetUserId);
                try {
                    await chatService.transferOwner(conversation.id, targetUserId);
                    await fetchConversations();
                } catch (err) {
                    console.error("Failed to transfer owner:", err);
                } finally {
                    setBusyUserId(null);
                }
            },
        });
    };

    // Xóa thành viên
    const handleRemoveMember = (targetUserId: number, targetUsername: string) => {
        setActiveMenuUserId(null);
        setConfirmDialog({
            title: "Xóa thành viên khỏi nhóm",
            message: `Bạn có chắc chắn muốn xóa "${targetUsername}" khỏi nhóm này? Người này sẽ không còn quyền nhận hoặc gửi tin nhắn mới trong nhóm.`,
            confirmText: "Xóa khỏi nhóm",
            isDanger: true,
            onConfirm: async () => {
                setBusyUserId(targetUserId);
                try {
                    await chatService.removeGroupMember(conversation.id, targetUserId);
                    await fetchConversations();
                } catch (err) {
                    console.error("Failed to remove member:", err);
                } finally {
                    setBusyUserId(null);
                }
            },
        });
    };

    // Rời nhóm
    const handleLeaveGroup = () => {
        if (isOwner) {
            setConfirmDialog({
                title: "Không thể rời nhóm",
                message: "Bạn đang là Trưởng nhóm (OWNER). Vui lòng chuyển quyền Trưởng nhóm cho một thành viên khác trước khi rời khỏi nhóm.",
                confirmText: "Đã hiểu",
                isAlertOnly: true,
                onConfirm: async () => {},
            });
            return;
        }

        setConfirmDialog({
            title: "Rời khỏi nhóm trò chuyện",
            message: `Bạn có chắc chắn muốn rời khỏi nhóm "${conversation.name || "này"}"? Bạn sẽ không nhận được tin nhắn mới từ nhóm trừ khi được thêm lại.`,
            confirmText: "Rời nhóm",
            isDanger: true,
            onConfirm: async () => {
                try {
                    await chatService.leaveGroup(conversation.id);
                    setActiveConversationId(null);
                    onClose();
                    await fetchConversations();
                } catch (err) {
                    console.error("Failed to leave group:", err);
                }
            },
        });
    };

    const activeParticipants = conversation.participants.filter((p) => p.status === "ACTIVE");

    return (
        <aside className="w-80 lg:w-88 border-l border-(--crm-border) bg-white h-full flex flex-col shadow-lg z-30 select-none animate-in slide-in-from-right duration-200">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-(--crm-border-subtle)">
                <h3 className="text-sm font-semibold text-(--crm-heading)">Thông tin nhóm</h3>
                <button
                    type="button"
                    onClick={onClose}
                    className="p-1 rounded-lg text-(--crm-text-muted) hover:bg-(--crm-surface-hover) hover:text-(--crm-text)"
                >
                    <X size={18} />
                </button>
            </div>

            {/* Group Overview */}
            <div className="p-5 flex flex-col items-center text-center border-b border-(--crm-border-subtle) bg-(--crm-surface-subtle)/50">
                <ChatAvatar
                    name={conversation.name}
                    avatarUrl={conversation.avatarUrl}
                    isGroup={true}
                    size="xl"
                    className="mb-3 ring-4 ring-white shadow-sm"
                />

                {isEditingName ? (
                    <div className="flex items-center gap-1.5 w-full mt-1">
                        <input
                            type="text"
                            value={groupName}
                            onChange={(e) => setGroupName(e.target.value)}
                            className="flex-1 px-2.5 py-1 text-sm rounded-lg border border-(--crm-primary) focus:outline-none"
                            autoFocus
                        />
                        <button
                            type="button"
                            onClick={handleSaveName}
                            disabled={isSavingName}
                            className="p-1.5 rounded-lg bg-(--crm-primary) text-white"
                        >
                            <Check size={14} />
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setGroupName(conversation.name || "");
                                setIsEditingName(false);
                            }}
                            className="p-1.5 rounded-lg bg-slate-200 text-slate-700"
                        >
                            <X size={14} />
                        </button>
                    </div>
                ) : (
                    <div className="flex items-center justify-center gap-1.5">
                        <h4 className="text-base font-bold text-(--crm-heading) truncate max-w-56">
                            {conversation.name || "Nhóm chưa đặt tên"}
                        </h4>
                        {canManage && (
                            <button
                                type="button"
                                onClick={() => setIsEditingName(true)}
                                className="p-1 rounded-md text-(--crm-text-muted) hover:text-(--crm-primary)"
                                title="Đổi tên nhóm"
                            >
                                <Pencil size={13} />
                            </button>
                        )}
                    </div>
                )}

                <p className="text-xs text-(--crm-text-secondary) mt-1">
                    {activeParticipants.length} thành viên tham gia
                </p>
            </div>

            {/* Member Management Section */}
            <div className="p-4 flex items-center justify-between border-b border-(--crm-border-subtle)">
                <span className="text-xs font-bold text-(--crm-heading) uppercase tracking-wider">
                    Thành viên ({activeParticipants.length})
                </span>
                {canManage && (
                    <button
                        type="button"
                        aria-label="Thêm thành viên"
                        title="Thêm thành viên"
                        onClick={handleOpenAddMembers}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-(--crm-primary) hover:underline cursor-pointer"
                    >
                        <UserPlus size={14} />
                        <span>Thêm</span>
                    </button>
                )}
            </div>

            {/* Members List */}
            <div className="flex-1 overflow-y-auto p-2 divide-y divide-(--crm-border-subtle)/40 crm-scrollbar">
                {activeParticipants.map((p) => {
                    const isCurrentUser = p.userId === currentUserId;
                    const isOnline = onlineUserIds.has(p.userId);
                    const isMenuOpen = activeMenuUserId === p.userId;
                    const isBusy = busyUserId === p.userId;

                    return (
                        <div
                            key={p.id}
                            className="relative flex items-center justify-between p-2.5 rounded-xl hover:bg-(--crm-surface-hover) transition-colors"
                        >
                            <div className="flex items-center gap-2.5 min-w-0">
                                <ChatAvatar
                                    name={p.username}
                                    isOnline={isOnline}
                                    size="sm"
                                />
                                <div className="min-w-0">
                                    <div className="flex items-center gap-1.5">
                                        <p className="text-xs font-semibold text-(--crm-heading) truncate">
                                            {p.username}
                                            {isCurrentUser && " (Tôi)"}
                                        </p>
                                    </div>
                                    <p className="text-[10px] text-(--crm-text-muted) truncate">{p.email}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0 pl-2">
                                {/* Role Badge */}
                                {p.role === "OWNER" && (
                                    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                                        <Crown size={10} /> Trưởng nhóm
                                    </span>
                                )}
                                {p.role === "ADMIN" && (
                                    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-(--crm-info-soft) text-(--crm-primary) border border-(--crm-primary)/20">
                                        <ShieldCheck size={10} /> Phó nhóm (ADMIN)
                                    </span>
                                )}
                                {p.role === "MEMBER" && (
                                    <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600">
                                        Thành viên
                                    </span>
                                )}

                                {/* Context Menu Button (nếu có quyền quản lý người này) */}
                                {!isCurrentUser && canManage && (
                                    <div className="relative">
                                        <button
                                            type="button"
                                            aria-label="Tùy chọn thành viên"
                                            title="Tùy chọn thành viên"
                                            onClick={() =>
                                                setActiveMenuUserId(isMenuOpen ? null : p.userId)
                                            }
                                            disabled={isBusy}
                                            className="p-1 rounded-md text-(--crm-text-muted) hover:text-(--crm-text) hover:bg-slate-200 cursor-pointer"
                                        >
                                            {isBusy ? (
                                                <Loader2 size={13} className="animate-spin" />
                                            ) : (
                                                <MoreVertical size={13} />
                                            )}
                                        </button>

                                        {/* Dropdown Menu */}
                                        {isMenuOpen && (
                                            <div className="absolute right-0 top-full mt-1 w-48 rounded-xl bg-white border border-(--crm-border) shadow-lg p-1.5 z-40 text-xs select-none animate-in fade-in duration-100">
                                                {/* OWNER Actions */}
                                                {isOwner && (
                                                    <>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleToggleRole(p.userId, p.role)}
                                                            className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-(--crm-surface-hover) text-(--crm-text) cursor-pointer"
                                                        >
                                                            {p.role === "ADMIN"
                                                                ? "Hạ cấp xuống Thành viên"
                                                                : "Bổ nhiệm Phó nhóm"}
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                handleTransferOwner(p.userId, p.username)
                                                            }
                                                            className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-(--crm-surface-hover) text-amber-700 font-medium cursor-pointer"
                                                        >
                                                            Chuyển Trưởng nhóm (OWNER)
                                                        </button>
                                                    </>
                                                )}

                                                {/* Kick Member Action (OWNER kick all, ADMIN kick MEMBER) */}
                                                {(isOwner || (isAdmin && p.role === "MEMBER")) && (
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleRemoveMember(p.userId, p.username)
                                                        }
                                                        className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-rose-50 text-rose-600 font-medium flex items-center gap-1.5"
                                                    >
                                                        <UserMinus size={13} />
                                                        <span>Xóa khỏi nhóm</span>
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Footer: Rời nhóm */}
            <div className="p-4 border-t border-(--crm-border-subtle) bg-(--crm-surface-subtle)/50">
                <button
                    type="button"
                    onClick={handleLeaveGroup}
                    className="w-full py-2 px-3 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                    <LogOut size={14} />
                    <span>Rời khỏi nhóm</span>
                </button>
            </div>

            {/* Modal: Thêm thành viên vào nhóm */}
            {showAddMemberModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
                    <div className="w-full max-w-sm rounded-2xl bg-white shadow-xl border border-(--crm-border) overflow-hidden flex flex-col max-h-[80vh]">
                        <div className="flex items-center justify-between px-4 py-3 border-b border-(--crm-border-subtle)">
                            <h4 className="text-sm font-semibold text-(--crm-heading)">
                                Thêm thành viên vào nhóm
                            </h4>
                            <button
                                type="button"
                                onClick={() => setShowAddMemberModal(false)}
                                className="p-1 rounded-lg text-(--crm-text-muted) hover:bg-(--crm-surface-hover)"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        {/* Search candidate bar */}
                        <div className="px-4 py-2 border-b border-(--crm-border-subtle) bg-(--crm-surface-subtle)">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-(--crm-text-muted)" size={14} />
                                <input
                                    type="text"
                                    value={candidateSearch}
                                    onChange={(e) => setCandidateSearch(e.target.value)}
                                    placeholder="Tìm theo tên hoặc email đồng nghiệp..."
                                    className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-(--crm-border) bg-white text-(--crm-heading) placeholder:text-(--crm-text-muted) focus:border-(--crm-primary) focus:outline-none"
                                />
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-2 space-y-1 crm-scrollbar">
                            {loadingCandidates ? (
                                <div className="p-6 text-center text-(--crm-text-muted)">
                                    <Loader2 size={18} className="animate-spin mx-auto text-(--crm-primary)" />
                                    <span className="text-xs mt-1 block">Đang tải danh sách...</span>
                                </div>
                            ) : candidateUsers.filter(u =>
                                u.username.toLowerCase().includes(candidateSearch.toLowerCase()) ||
                                u.email.toLowerCase().includes(candidateSearch.toLowerCase())
                            ).length === 0 ? (
                                <p className="text-center text-xs text-(--crm-text-muted) py-6">
                                    Không tìm thấy đồng nghiệp phù hợp
                                </p>
                            ) : (
                                candidateUsers
                                    .filter(u =>
                                        u.username.toLowerCase().includes(candidateSearch.toLowerCase()) ||
                                        u.email.toLowerCase().includes(candidateSearch.toLowerCase())
                                    )
                                    .map((u) => {
                                        const isSelected = selectedUserIds.has(u.id);
                                        return (
                                            <div
                                                key={u.id}
                                                onClick={() => {
                                                    setSelectedUserIds((prev) => {
                                                        const next = new Set(prev);
                                                        if (next.has(u.id)) next.delete(u.id);
                                                        else next.add(u.id);
                                                        return next;
                                                    });
                                                }}
                                                className={`flex items-center justify-between p-2 rounded-xl cursor-pointer ${
                                                    isSelected ? "bg-(--crm-info-soft)" : "hover:bg-(--crm-surface-hover)"
                                                }`}
                                            >
                                                <div className="flex items-center gap-2 min-w-0">
                                                    <ChatAvatar name={u.username} size="sm" />
                                                    <div className="min-w-0">
                                                        <p className="text-xs font-semibold text-(--crm-heading) truncate">
                                                            {u.username}
                                                        </p>
                                                        <p className="text-[10px] text-(--crm-text-muted) truncate">
                                                            {u.role}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div
                                                    className={`w-4 h-4 rounded border flex items-center justify-center ${
                                                        isSelected
                                                            ? "bg-(--crm-primary) border-(--crm-primary) text-white"
                                                            : "border-slate-300 bg-white"
                                                    }`}
                                                >
                                                    {isSelected && <Check size={11} strokeWidth={3} />}
                                                </div>
                                            </div>
                                        );
                                    })
                            )}
                        </div>

                        <div className="flex items-center justify-end gap-2 px-4 py-3 border-t border-(--crm-border-subtle) bg-(--crm-surface-subtle)">
                            <button
                                type="button"
                                onClick={() => setShowAddMemberModal(false)}
                                className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-(--crm-border) bg-white text-(--crm-text) cursor-pointer"
                            >
                                Hủy
                            </button>
                            <button
                                type="button"
                                onClick={handleConfirmAddMembers}
                                disabled={selectedUserIds.size === 0 || isAdding}
                                aria-label={`Thêm vào nhóm (${selectedUserIds.size})`}
                                className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-(--crm-primary) text-white disabled:opacity-50 flex items-center gap-1 cursor-pointer"
                            >
                                {isAdding && <Loader2 size={13} className="animate-spin" />}
                                Thêm vào nhóm ({selectedUserIds.size})
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Custom CRM Confirmation Modal */}
            {confirmDialog && (
                <div
                    className="fixed inset-0 z-50 bg-black/50 backdrop-blur-2xs flex items-center justify-center p-4 animate-in fade-in duration-150"
                    onClick={() => !isConfirming && setConfirmDialog(null)}
                >
                    <div
                        className="bg-white rounded-2xl border border-(--crm-border) shadow-2xl max-w-sm w-full p-5 space-y-4 animate-in zoom-in-95 duration-150"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-start justify-between">
                            <h4 className="text-base font-bold text-(--crm-heading)">
                                {confirmDialog.title}
                            </h4>
                            {!isConfirming && (
                                <button
                                    type="button"
                                    onClick={() => setConfirmDialog(null)}
                                    className="p-1 rounded-lg text-(--crm-text-muted) hover:bg-(--crm-surface-hover)"
                                >
                                    <X size={16} />
                                </button>
                            )}
                        </div>

                        <p className="text-sm text-(--crm-text-secondary) leading-relaxed">
                            {confirmDialog.message}
                        </p>

                        <div className="flex items-center justify-end gap-2 pt-2 border-t border-(--crm-border-subtle)">
                            {!confirmDialog.isAlertOnly && (
                                <button
                                    type="button"
                                    disabled={isConfirming}
                                    onClick={() => setConfirmDialog(null)}
                                    className="px-3.5 py-1.5 text-xs font-semibold rounded-xl border border-(--crm-border) bg-white text-(--crm-text) hover:bg-(--crm-surface-hover) cursor-pointer disabled:opacity-50"
                                >
                                    Hủy bỏ
                                </button>
                            )}
                            <button
                                type="button"
                                disabled={isConfirming}
                                onClick={async () => {
                                    setIsConfirming(true);
                                    try {
                                        await confirmDialog.onConfirm();
                                        setConfirmDialog(null);
                                    } finally {
                                        setIsConfirming(false);
                                    }
                                }}
                                className={`px-4 py-1.5 text-xs font-semibold rounded-xl text-white flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50 ${
                                    confirmDialog.isDanger
                                        ? "bg-(--crm-danger) hover:opacity-90"
                                        : "bg-(--crm-primary) hover:bg-(--crm-primary-hover)"
                                }`}
                            >
                                {isConfirming && <Loader2 size={13} className="animate-spin" />}
                                <span>{confirmDialog.confirmText}</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </aside>
    );
};
