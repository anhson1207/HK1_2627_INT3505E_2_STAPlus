import React from "react";
import { X, Mail, Shield, Circle, User } from "lucide-react";
import { ChatAvatar } from "./ChatAvatar";
import type { ChatParticipant } from "../../types/chat";

interface DirectInfoDrawerProps {
    open: boolean;
    onClose: () => void;
    participant?: ChatParticipant;
    isOnline?: boolean;
}

export const DirectInfoDrawer: React.FC<DirectInfoDrawerProps> = ({
    open,
    onClose,
    participant,
    isOnline = false,
}) => {
    if (!open || !participant) return null;

    return (
        <aside className="w-80 border-l border-(--crm-border) bg-white h-full flex flex-col shadow-lg z-30 select-none animate-in slide-in-from-right duration-200">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-(--crm-border-subtle)">
                <h3 className="text-sm font-semibold text-(--crm-heading)">Thông tin đồng nghiệp</h3>
                <button
                    type="button"
                    onClick={onClose}
                    className="p-1 rounded-lg text-(--crm-text-muted) hover:bg-(--crm-surface-hover) hover:text-(--crm-text)"
                >
                    <X size={18} />
                </button>
            </div>

            {/* Profile Overview */}
            <div className="p-6 flex flex-col items-center text-center border-b border-(--crm-border-subtle) bg-(--crm-surface-subtle)/50">
                <ChatAvatar
                    name={participant.username}
                    isOnline={isOnline}
                    size="xl"
                    className="mb-3 ring-4 ring-white shadow-sm"
                />
                <h4 className="text-base font-bold text-(--crm-heading)">{participant.username}</h4>
                <div className="flex items-center gap-1.5 mt-1 text-xs">
                    <Circle
                        size={8}
                        className={isOnline ? "fill-emerald-500 text-emerald-500" : "fill-slate-300 text-slate-300"}
                    />
                    <span className={isOnline ? "text-emerald-600 font-medium" : "text-(--crm-text-muted)"}>
                        {isOnline ? "Đang trực tuyến" : "Ngoại tuyến"}
                    </span>
                </div>
            </div>

            {/* Details */}
            <div className="p-5 space-y-4 flex-1 overflow-y-auto">
                <div className="space-y-1">
                    <span className="text-[11px] font-semibold text-(--crm-text-muted) uppercase tracking-wider">
                        Tài khoản
                    </span>
                    <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-(--crm-surface-subtle) border border-(--crm-border-subtle)">
                        <User size={16} className="text-(--crm-text-secondary)" />
                        <span className="text-sm font-medium text-(--crm-heading)">{participant.username}</span>
                    </div>
                </div>

                <div className="space-y-1">
                    <span className="text-[11px] font-semibold text-(--crm-text-muted) uppercase tracking-wider">
                        Email liên hệ
                    </span>
                    <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-(--crm-surface-subtle) border border-(--crm-border-subtle)">
                        <Mail size={16} className="text-(--crm-text-secondary)" />
                        <span className="text-sm font-medium text-(--crm-heading) truncate">
                            {participant.email || "Chưa cập nhật"}
                        </span>
                    </div>
                </div>

                <div className="space-y-1">
                    <span className="text-[11px] font-semibold text-(--crm-text-muted) uppercase tracking-wider">
                        Vai trò CRM
                    </span>
                    <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-(--crm-surface-subtle) border border-(--crm-border-subtle)">
                        <Shield size={16} className="text-(--crm-primary)" />
                        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-(--crm-info-soft) text-(--crm-primary)">
                            {participant.role || "Nhân viên"}
                        </span>
                    </div>
                </div>
            </div>
        </aside>
    );
};

