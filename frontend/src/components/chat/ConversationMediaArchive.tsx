import React, { useEffect, useMemo, useState } from "react";
import {
    ChevronDown,
    Download,
    ExternalLink,
    FileText,
    Film,
    Image as ImageIcon,
    Link2,
    Loader2,
    Play,
} from "lucide-react";

import { chatService } from "../../services/chatService";
import { useChatStore } from "../../stores/chatStore";
import type { ChatConversationArchive, ChatMessage } from "../../types/chat";
import {
    formatFileSize,
    formatMessageTime,
    getFileIconType,
} from "../../utils/chatUtils";

type ArchiveTab = "media" | "files" | "links";

interface ConversationMediaArchiveProps {
    conversationId: number;
}

function formatArchiveDate(iso: string): string {
    try {
        const d = new Date(iso);
        const day = d.toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
        });
        return `${formatMessageTime(iso)} · ${day}`;
    } catch {
        return "";
    }
}

interface MediaThumbnailTileProps {
    item: ChatMessage;
    onOpen: (item: ChatMessage, blobUrl?: string) => void;
}

const MediaThumbnailTile: React.FC<MediaThumbnailTileProps> = ({ item, onOpen }) => {
    const [blobUrl, setBlobUrl] = useState<string | null>(null);
    const [failed, setFailed] = useState(false);

    const iconType = getFileIconType(item.attachmentName);
    const isVideo = item.type === "VIDEO" || iconType === "video";

    useEffect(() => {
        if (!item.attachmentUrl) return;
        let active = true;
        let created: string | null = null;

        chatService
            .getAttachmentBlobUrl(item.attachmentUrl)
            .then((url) => {
                if (active) {
                    created = url;
                    setBlobUrl(url);
                } else {
                    URL.revokeObjectURL(url);
                }
            })
            .catch(() => {
                if (active) setFailed(true);
            });

        return () => {
            active = false;
            if (created) URL.revokeObjectURL(created);
        };
    }, [item.attachmentUrl]);

    return (
        <button
            type="button"
            onClick={() => onOpen(item, blobUrl || undefined)}
            title={item.attachmentName || (isVideo ? "Video" : "Hình ảnh")}
            className="group relative aspect-square w-full overflow-hidden rounded-lg border border-(--crm-border-subtle) bg-(--crm-surface-subtle) focus:outline-none focus:ring-2 focus:ring-(--crm-primary)/40 cursor-pointer"
        >
            {failed ? (
                <div className="flex h-full w-full items-center justify-center text-(--crm-text-muted)">
                    {isVideo ? <Film size={18} /> : <ImageIcon size={18} />}
                </div>
            ) : !blobUrl ? (
                <div className="h-full w-full animate-pulse bg-(--crm-surface-hover)" />
            ) : isVideo ? (
                <>
                    <video
                        src={blobUrl}
                        muted
                        playsInline
                        preload="metadata"
                        className="h-full w-full object-cover"
                    />
                    <span className="absolute inset-0 flex items-center justify-center bg-slate-900/35 transition-colors group-hover:bg-slate-900/50">
                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-slate-900 shadow-sm">
                            <Play size={13} className="ml-0.5 fill-current" />
                        </span>
                    </span>
                </>
            ) : (
                <img
                    src={blobUrl}
                    alt={item.attachmentName || "Hình ảnh"}
                    className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
                />
            )}
        </button>
    );
};

export const ConversationMediaArchive: React.FC<ConversationMediaArchiveProps> = ({
    conversationId,
}) => {
    const [expanded, setExpanded] = useState(true);
    const [activeTab, setActiveTab] = useState<ArchiveTab>("media");
    const [archive, setArchive] = useState<ChatConversationArchive>({
        media: [],
        files: [],
        links: [],
    });
    const [loading, setLoading] = useState(false);
    const [downloadingId, setDownloadingId] = useState<number | null>(null);

    // Sync archive only after persisted DB messages settle (avoids racing ahead of POST /messages while optimistic temp messages are in flight)
    const archiveSyncKey = useChatStore((state) => {
        const msgs = state.messagesByConversation[conversationId];
        if (!msgs || msgs.length === 0) return "empty";
        let confirmedCount = 0;
        let maxConfirmedId = 0;
        for (const m of msgs) {
            if (m.id > 0 && m.status !== "sending" && m.status !== "error") {
                confirmedCount += 1;
                if (m.id > maxConfirmedId) maxConfirmedId = m.id;
            }
        }
        return `${confirmedCount}:${maxConfirmedId}`;
    });
    const setPreviewMedia = useChatStore((state) => state.setPreviewMedia);

    useEffect(() => {
        let active = true;
        setLoading(true);
        chatService
            .getConversationArchive(conversationId)
            .then((data) => {
                if (active) {
                    setArchive({
                        media: data.media || [],
                        files: data.files || [],
                        links: data.links || [],
                    });
                }
            })
            .catch(() => {
                if (active) {
                    setArchive({ media: [], files: [], links: [] });
                }
            })
            .finally(() => {
                if (active) setLoading(false);
            });

        return () => {
            active = false;
        };
    }, [conversationId, archiveSyncKey]);

    const totalItems = useMemo(
        () => archive.media.length + archive.files.length + archive.links.length,
        [archive]
    );

    const handleOpenMedia = (item: ChatMessage, blobUrl?: string) => {
        const isVideo = item.type === "VIDEO" || getFileIconType(item.attachmentName) === "video";
        setPreviewMedia({
            url: blobUrl,
            attachmentUrl: item.attachmentUrl,
            name: item.attachmentName || (isVideo ? "Video" : "Hình ảnh"),
            kind: isVideo ? "video" : "image",
        });
    };

    const handleDownloadFile = async (item: ChatMessage) => {
        if (!item.attachmentUrl || downloadingId === item.id) return;
        setDownloadingId(item.id);
        try {
            await chatService.downloadAttachment(
                item.attachmentUrl,
                item.attachmentName || "tai-lieu"
            );
        } finally {
            setDownloadingId(null);
        }
    };

    const tabs: Array<{
        id: ArchiveTab;
        label: string;
        count: number;
        icon: React.ComponentType<{ size?: number }>;
    }> = [
        { id: "media", label: "Ảnh/Video", count: archive.media.length, icon: ImageIcon },
        { id: "files", label: "Tệp", count: archive.files.length, icon: FileText },
        { id: "links", label: "Liên kết", count: archive.links.length, icon: Link2 },
    ];

    return (
        <div className="border-t border-(--crm-border-subtle)">
            <button
                type="button"
                onClick={() => setExpanded((prev) => !prev)}
                className="flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-(--crm-surface-hover) cursor-pointer"
                aria-expanded={expanded}
            >
                <div className="flex items-center gap-2 min-w-0">
                    <span className="text-xs font-bold uppercase tracking-wider text-(--crm-heading) truncate">
                        File phương tiện, tệp & link
                    </span>
                    {totalItems > 0 && (
                        <span className="shrink-0 rounded-full bg-(--crm-surface-hover) px-1.5 py-0.5 text-[10px] font-semibold text-(--crm-text-secondary)">
                            {totalItems}
                        </span>
                    )}
                </div>
                <ChevronDown
                    size={16}
                    className={`shrink-0 text-(--crm-text-muted) transition-transform duration-150 ${
                        expanded ? "rotate-180" : ""
                    }`}
                />
            </button>

            {expanded && (
                <div className="px-4 pb-4 space-y-3">
                    {/* Segmented 3-Tab Switcher like Messenger */}
                    <div
                        role="tablist"
                        aria-label="Danh mục lưu trữ cuộc trò chuyện"
                        className="flex items-center gap-1 rounded-xl bg-(--crm-surface-subtle) p-1 border border-(--crm-border-subtle)"
                    >
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            const active = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    type="button"
                                    role="tab"
                                    aria-selected={active}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex flex-auto items-center justify-center gap-1 whitespace-nowrap rounded-lg px-2 py-1.5 text-[11px] font-semibold transition-all cursor-pointer ${
                                        active
                                            ? "bg-(--crm-surface) text-(--crm-primary) shadow-2xs"
                                            : "text-(--crm-text-secondary) hover:text-(--crm-heading)"
                                    }`}
                                >
                                    <Icon size={11} />
                                    <span>{tab.label}</span>
                                    <span className="text-[10px] opacity-75">({tab.count})</span>
                                </button>
                            );
                        })}
                    </div>

                    {loading && totalItems === 0 ? (
                        <div className="flex flex-col items-center justify-center py-6 text-(--crm-text-muted)">
                            <Loader2 size={18} className="animate-spin text-(--crm-primary)" />
                            <span className="mt-1.5 text-[11px]">Đang tải kho lưu trữ...</span>
                        </div>
                    ) : activeTab === "media" ? (
                        archive.media.length === 0 ? (
                            <div className="rounded-xl border border-dashed border-(--crm-border) bg-(--crm-surface-subtle)/50 py-6 px-3 text-center">
                                <ImageIcon size={20} className="mx-auto text-(--crm-text-muted) opacity-70" />
                                <p className="mt-1.5 text-xs text-(--crm-text-muted)">
                                    Chưa có ảnh hoặc video nào được gửi
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-3 gap-1.5">
                                {archive.media.map((item) => (
                                    <MediaThumbnailTile
                                        key={item.id}
                                        item={item}
                                        onOpen={handleOpenMedia}
                                    />
                                ))}
                            </div>
                        )
                    ) : activeTab === "files" ? (
                        archive.files.length === 0 ? (
                            <div className="rounded-xl border border-dashed border-(--crm-border) bg-(--crm-surface-subtle)/50 py-6 px-3 text-center">
                                <FileText size={20} className="mx-auto text-(--crm-text-muted) opacity-70" />
                                <p className="mt-1.5 text-xs text-(--crm-text-muted)">
                                    Chưa có tệp tài liệu nào được gửi
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-1.5">
                                {archive.files.map((item) => {
                                    const iconType = getFileIconType(item.attachmentName);
                                    const isDownloading = downloadingId === item.id;
                                    return (
                                        <div
                                            key={item.id}
                                            className="flex items-center gap-2.5 rounded-xl border border-(--crm-border-subtle) bg-(--crm-surface-subtle)/70 p-2 hover:border-(--crm-border) transition-colors"
                                        >
                                            <div
                                                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                                                    iconType === "pdf"
                                                        ? "bg-rose-500/12 text-rose-500"
                                                        : iconType === "excel"
                                                            ? "bg-emerald-500/12 text-emerald-600"
                                                            : iconType === "word"
                                                                ? "bg-blue-500/12 text-blue-600"
                                                                : "bg-(--crm-info-soft) text-(--crm-primary)"
                                                }`}
                                            >
                                                <FileText size={17} />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p
                                                    className="truncate text-xs font-semibold text-(--crm-heading)"
                                                    title={item.attachmentName || "Tài liệu"}
                                                >
                                                    {item.attachmentName || "Tài liệu đính kèm"}
                                                </p>
                                                <p className="text-[10px] text-(--crm-text-muted) truncate">
                                                    {formatFileSize(item.attachmentSize)} · {formatArchiveDate(item.createdAt)}
                                                </p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => void handleDownloadFile(item)}
                                                disabled={isDownloading}
                                                className="shrink-0 rounded-lg p-1.5 text-(--crm-primary) hover:bg-(--crm-surface-hover) disabled:opacity-50 cursor-pointer"
                                                title="Tải xuống"
                                                aria-label={`Tải xuống ${item.attachmentName || "tệp"}`}
                                            >
                                                {isDownloading ? (
                                                    <Loader2 size={15} className="animate-spin" />
                                                ) : (
                                                    <Download size={15} />
                                                )}
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        )
                    ) : archive.links.length === 0 ? (
                        <div className="rounded-xl border border-dashed border-(--crm-border) bg-(--crm-surface-subtle)/50 py-6 px-3 text-center">
                            <Link2 size={20} className="mx-auto text-(--crm-text-muted) opacity-70" />
                            <p className="mt-1.5 text-xs text-(--crm-text-muted)">
                                Chưa có liên kết nào được chia sẻ
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-1.5">
                            {archive.links.map((link, idx) => (
                                <a
                                    key={`${link.messageId}-${idx}`}
                                    href={link.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="group flex items-start gap-2.5 rounded-xl border border-(--crm-border-subtle) bg-(--crm-surface-subtle)/70 p-2.5 hover:border-(--crm-primary)/40 hover:bg-(--crm-surface-hover) transition-colors"
                                >
                                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-(--crm-info-soft) text-(--crm-primary)">
                                        <Link2 size={15} />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center justify-between gap-1">
                                            <p className="truncate text-xs font-semibold text-(--crm-heading) group-hover:text-(--crm-primary)">
                                                {link.domain}
                                            </p>
                                            <ExternalLink
                                                size={12}
                                                className="shrink-0 text-(--crm-text-muted) group-hover:text-(--crm-primary)"
                                            />
                                        </div>
                                        <p className="truncate text-[11px] text-(--crm-primary)" title={link.url}>
                                            {link.url}
                                        </p>
                                        <p className="mt-0.5 text-[10px] text-(--crm-text-muted) truncate">
                                            {link.senderUsername} · {formatArchiveDate(link.createdAt)}
                                        </p>
                                    </div>
                                </a>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
