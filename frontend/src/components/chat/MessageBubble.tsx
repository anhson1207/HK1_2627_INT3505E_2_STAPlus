import React, { useState, useEffect } from "react";
import {
    Check,
    CheckCheck,
    Clock,
    AlertCircle,
    RefreshCw,
    Info,
    FileText,
    Download,
    Users,
} from "lucide-react";
import type { ChatMessage, ChatParticipant } from "../../types/chat";
import {
    formatFileSize,
    formatMessageTime,
    getAvatarColor,
    getFileIconType,
    getInitials,
} from "../../utils/chatUtils";
import { chatService } from "../../services/chatService";

interface MessageBubbleProps {
    message: ChatMessage;
    isGroup?: boolean;
    showAvatar?: boolean;
    isRead?: boolean;
    readers?: ChatParticipant[];
    onRetry?: (message: ChatMessage) => void;
    onPreviewImage?: (url: string, name: string) => void;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
    message,
    isGroup = false,
    showAvatar = true,
    isRead = false,
    readers = [],
    onRetry,
    onPreviewImage,
}) => {
    const [showReadersPopover, setShowReadersPopover] = useState(false);
    const [imageBlobUrl, setImageBlobUrl] = useState<string | null>(null);
    const [imageLoading, setImageLoading] = useState(false);
    const [imageError, setImageError] = useState(false);
    const [downloading, setDownloading] = useState(false);

    const isMine = message.isMine;
    const timeFormatted = formatMessageTime(message.createdAt);
    const isImage = message.type === "IMAGE" || (message.attachmentUrl && getFileIconType(message.attachmentName) === "image");
    const isFile = message.type === "FILE" || (message.attachmentUrl && !isImage);
    const iconType = getFileIconType(message.attachmentName);

    useEffect(() => {
        let active = true;
        let createdUrl: string | null = null;

        if (isImage && message.attachmentUrl) {
            setImageLoading(true);
            setImageError(false);
            chatService
                .getAttachmentBlobUrl(message.attachmentUrl)
                .then((blobUrl) => {
                    if (active) {
                        createdUrl = blobUrl;
                        setImageBlobUrl(blobUrl);
                    } else {
                        URL.revokeObjectURL(blobUrl);
                    }
                })
                .catch(() => {
                    if (active) setImageError(true);
                })
                .finally(() => {
                    if (active) setImageLoading(false);
                });
        }

        return () => {
            active = false;
            if (createdUrl) {
                URL.revokeObjectURL(createdUrl);
            }
        };
    }, [isImage, message.attachmentUrl]);

    const handleDownload = async () => {
        if (!message.attachmentUrl || downloading) return;
        setDownloading(true);
        try {
            await chatService.downloadAttachment(message.attachmentUrl, message.attachmentName || "download");
        } catch (err) {
            console.error("Failed to download attachment:", err);
        } finally {
            setDownloading(false);
        }
    };

    // 1. SYSTEM MESSAGE: Hiển thị thanh thông báo hệ thống căn giữa
    if (message.type === "SYSTEM") {
        return (
            <div className="flex justify-center my-2.5 px-4 select-none">
                <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-(--crm-surface-hover) border border-(--crm-border-subtle) text-xs text-(--crm-text-secondary) font-medium shadow-2xs">
                    <Info size={13} className="text-(--crm-primary) shrink-0" />
                    <span>{message.content}</span>
                    <span className="text-[10px] text-(--crm-text-muted) ml-1">
                        {formatMessageTime(message.createdAt)}
                    </span>
                </div>
            </div>
        );
    }

    return (
        <div
            className={`group flex items-end gap-2 my-1 px-4 ${
                isMine ? "justify-end" : "justify-start"
            }`}
        >
            {/* Avatar người gửi trong chat nhóm (bên trái) */}
            {!isMine && isGroup && (
                <div className="w-7 h-7 shrink-0 mb-1">
                    {showAvatar ? (
                        <div
                            className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold shadow-2xs ${getAvatarColor(
                                message.senderUsername
                            )}`}
                            title={message.senderUsername}
                        >
                            {getInitials(message.senderUsername)}
                        </div>
                    ) : (
                        <div className="w-7" />
                    )}
                </div>
            )}

            <div className={`flex flex-col max-w-[85%] sm:max-w-[70%] ${isMine ? "items-end" : "items-start"}`}>
                {/* Tên người gửi trong chat nhóm */}
                {!isMine && isGroup && showAvatar && (
                    <span className="text-[11px] font-semibold text-(--crm-text-secondary) mb-1 ml-1">
                        {message.senderUsername}
                    </span>
                )}

                {/* Bong bóng tin nhắn */}
                <div
                    className={`relative text-sm leading-relaxed break-words whitespace-pre-wrap transition-shadow duration-150 ${
                        isImage && !message.content
                            ? "p-1 rounded-2xl overflow-hidden border border-(--crm-border-subtle) bg-white shadow-2xs"
                            : isMine
                            ? "px-4 py-2.5 bg-(--crm-primary) text-white rounded-2xl rounded-br-xs shadow-xs"
                            : "px-4 py-2.5 bg-white text-(--crm-heading) border border-(--crm-border-subtle) rounded-2xl rounded-bl-xs shadow-2xs"
                    }`}
                >
                    {/* Hiển thị Hình ảnh */}
                    {isImage && (
                        <div className="mb-1.5 overflow-hidden rounded-xl">
                            {imageLoading && (
                                <div className="w-56 h-40 bg-(--crm-surface-subtle) animate-pulse rounded-xl flex items-center justify-center text-xs text-(--crm-text-muted)">
                                    Đang tải ảnh...
                                </div>
                            )}
                            {imageError && (
                                <div className="w-56 h-28 bg-rose-50 border border-rose-200 rounded-xl flex items-center justify-center text-xs text-rose-500">
                                    Không thể tải ảnh
                                </div>
                            )}
                            {imageBlobUrl && (
                                <img
                                    src={imageBlobUrl}
                                    alt={message.attachmentName || "Hình ảnh"}
                                    className="max-h-72 w-auto max-w-full min-w-20 min-h-20 bg-slate-100 rounded-xl object-cover cursor-pointer hover:opacity-95 transition-opacity"
                                    onClick={() => onPreviewImage?.(imageBlobUrl, message.attachmentName || "Hình ảnh")}
                                />
                            )}
                        </div>
                    )}

                    {/* Hiển thị Tệp tài liệu (PDF, Word, Excel, TXT...) */}
                    {isFile && message.attachmentUrl && (
                        <div
                            className={`flex items-center gap-3 p-2.5 mb-1.5 rounded-xl border transition-all ${
                                isMine
                                    ? "bg-white/10 border-white/20 text-white"
                                    : "bg-(--crm-surface-subtle) border-(--crm-border) text-(--crm-heading)"
                            }`}
                        >
                            <div
                                className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                                    iconType === "pdf"
                                        ? "bg-rose-500/10 text-rose-500"
                                        : iconType === "excel"
                                        ? "bg-emerald-500/10 text-emerald-600"
                                        : iconType === "word"
                                        ? "bg-blue-500/10 text-blue-600"
                                        : "bg-(--crm-info-soft) text-(--crm-primary)"
                                }`}
                            >
                                <FileText size={22} />
                            </div>

                            <div className="flex-1 min-w-0 pr-2">
                                <p className="text-xs font-semibold truncate" title={message.attachmentName || ""}>
                                    {message.attachmentName || "Tài liệu đính kèm"}
                                </p>
                                <p
                                    className={`text-[11px] ${
                                        isMine ? "text-white/80" : "text-(--crm-text-muted)"
                                    }`}
                                >
                                    {formatFileSize(message.attachmentSize)}
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={handleDownload}
                                disabled={downloading}
                                className={`p-2 rounded-lg transition-colors shrink-0 cursor-pointer disabled:opacity-50 ${
                                    isMine
                                        ? "hover:bg-white/20 text-white"
                                        : "hover:bg-(--crm-surface-hover) text-(--crm-primary)"
                                }`}
                                title="Tải xuống tệp tin"
                                aria-label={`Tải xuống ${message.attachmentName || "tệp tin"}`}
                            >
                                {downloading ? <Clock size={18} className="animate-spin" /> : <Download size={18} />}
                            </button>
                        </div>
                    )}

                    {/* Nội dung tin nhắn văn bản */}
                    {message.content && message.content !== message.attachmentName && (
                        <p className="m-0 select-text leading-relaxed">{message.content}</p>
                    )}

                    {/* Metadata: Giờ gửi & Trạng thái đã gửi / đã xem */}
                    <div
                        className={`flex items-center justify-end gap-1.5 mt-1 text-[10px] select-none ${
                            isMine ? "text-white/85" : "text-(--crm-text-muted)"
                        }`}
                    >
                        <span>{timeFormatted}</span>

                        {isMine && (
                            <span className="inline-flex items-center ml-0.5 relative">
                                {message.status === "sending" && (
                                    <span title="Đang gửi...">
                                        <Clock size={11} className="animate-spin text-white/70" />
                                    </span>
                                )}
                                {message.status === "error" && (
                                    <span
                                        onClick={() => onRetry?.(message)}
                                        className="cursor-pointer text-rose-300 hover:text-white flex items-center gap-0.5"
                                        title={message.error || "Gửi lỗi, nhấn để thử lại"}
                                    >
                                        <AlertCircle size={11} />
                                        <RefreshCw size={10} />
                                    </span>
                                )}
                                {message.status !== "sending" && message.status !== "error" && (
                                    <>
                                        {/* Trạng thái trong Chat nhóm */}
                                        {isGroup ? (
                                            readers.length > 0 ? (
                                                <button
                                                    type="button"
                                                    onClick={() => setShowReadersPopover(!showReadersPopover)}
                                                    className="inline-flex items-center gap-0.5 font-bold hover:underline cursor-pointer"
                                                    title={`Đã có ${readers.length} người xem. Nhấn để xem chi tiết.`}
                                                >
                                                    <CheckCheck size={13} className="text-emerald-300" />
                                                    <span>{readers.length}</span>
                                                </button>
                                            ) : (
                                                <span title="Đã gửi tới nhóm">
                                                    <Check size={12} className="text-white/80" />
                                                </span>
                                            )
                                        ) : (
                                            /* Trạng thái trong Chat 1-1 */
                                            isRead ? (
                                                <span title="Đã xem">
                                                    <CheckCheck size={13} className="text-emerald-300" />
                                                </span>
                                            ) : (
                                                <span title="Đã gửi">
                                                    <Check size={12} className="text-white/80" />
                                                </span>
                                            )
                                        )}
                                    </>
                                )}

                                {/* Popover danh sách người đã đọc trong Group Chat */}
                                {showReadersPopover && readers.length > 0 && (
                                    <div
                                        className="absolute right-0 bottom-full mb-2 w-48 p-2 rounded-xl bg-white border border-(--crm-border) shadow-xl z-30 text-left select-none animate-in fade-in zoom-in-95 duration-150"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-(--crm-border)">
                                            <span className="text-[11px] font-semibold text-(--crm-heading) flex items-center gap-1">
                                                <Users size={12} className="text-(--crm-primary)" />
                                                Đã đọc ({readers.length})
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => setShowReadersPopover(false)}
                                                className="text-[10px] text-(--crm-text-muted) hover:text-(--crm-danger)"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                        <div className="max-h-36 overflow-y-auto space-y-1">
                                            {readers.map((r) => (
                                                <div
                                                    key={r.userId}
                                                    className="flex items-center justify-between text-[11px] text-(--crm-text)"
                                                >
                                                    <span className="truncate max-w-[100px] font-medium">
                                                        {r.username}
                                                    </span>
                                                    <span className="text-[10px] text-(--crm-text-muted)">
                                                        {r.lastReadAt ? formatMessageTime(r.lastReadAt) : ""}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
