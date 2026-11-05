import React, { useEffect } from "react";
import { MessageSquare, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useChatStore } from "../../stores/chatStore";

export const ChatToastNotification: React.FC = () => {
    const navigate = useNavigate();
    const activeToast = useChatStore((state) => state.activeToast);
    const dismissToast = useChatStore((state) => state.dismissToast);
    const setActiveConversationId = useChatStore((state) => state.setActiveConversationId);

    useEffect(() => {
        if (!activeToast) return;
        const timer = setTimeout(() => {
            dismissToast();
        }, 5000);
        return () => clearTimeout(timer);
    }, [activeToast, dismissToast]);

    if (!activeToast) return null;

    const handleClick = () => {
        setActiveConversationId(activeToast.conversationId);
        dismissToast();
        navigate("/chat");
    };

    return (
        <div className="fixed bottom-5 right-5 z-50 max-w-sm w-full animate-in slide-in-from-bottom-5 fade-in duration-300">
            <div
                onClick={handleClick}
                className="bg-white rounded-2xl border border-(--crm-border) shadow-xl p-3.5 flex items-start gap-3 cursor-pointer hover:shadow-2xl transition-all group"
            >
                <div className="w-10 h-10 rounded-xl bg-(--crm-info-soft) text-(--crm-primary) flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <MessageSquare size={20} />
                </div>

                <div className="flex-1 min-w-0 pr-1">
                    <p className="text-xs font-bold text-(--crm-heading) truncate">
                        {activeToast.title}
                    </p>
                    <p className="text-xs text-(--crm-text-secondary) truncate mt-0.5 leading-relaxed">
                        {activeToast.message}
                    </p>
                    <span className="text-[10px] font-medium text-(--crm-primary) mt-1 inline-block">
                        Nhấn để mở trò chuyện →
                    </span>
                </div>

                <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        dismissToast();
                    }}
                    className="p-1 rounded-lg text-(--crm-text-muted) hover:text-(--crm-text) hover:bg-(--crm-surface-hover) transition-colors"
                    title="Đóng"
                >
                    <X size={15} />
                </button>
            </div>
        </div>
    );
};

