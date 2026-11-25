import React, { useEffect, useState } from "react";
import { Download, Loader2, X } from "lucide-react";

import { chatService } from "../../services/chatService";
import { useChatStore } from "../../stores/chatStore";

export const ChatMediaLightbox: React.FC = () => {
    const previewMedia = useChatStore((state) => state.previewMedia);
    const setPreviewMedia = useChatStore((state) => state.setPreviewMedia);

    const [resolvedUrl, setResolvedUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!previewMedia) {
            setResolvedUrl(null);
            return;
        }
        if (previewMedia.url) {
            setResolvedUrl(previewMedia.url);
            return;
        }
        if (!previewMedia.attachmentUrl) return;

        let active = true;
        let created: string | null = null;
        setLoading(true);

        chatService
            .getAttachmentBlobUrl(previewMedia.attachmentUrl)
            .then((url) => {
                if (active) {
                    created = url;
                    setResolvedUrl(url);
                } else {
                    URL.revokeObjectURL(url);
                }
            })
            .catch(() => {
                if (active) setResolvedUrl(null);
            })
            .finally(() => {
                if (active) setLoading(false);
            });

        return () => {
            active = false;
            if (created) URL.revokeObjectURL(created);
        };
    }, [previewMedia]);

    useEffect(() => {
        if (!previewMedia) return;
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                setPreviewMedia(null);
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [previewMedia, setPreviewMedia]);

    if (!previewMedia) return null;

    const handleDownload = async () => {
        if (previewMedia.attachmentUrl) {
            await chatService.downloadAttachment(previewMedia.attachmentUrl, previewMedia.name);
            return;
        }
        if (resolvedUrl) {
            const a = document.createElement("a");
            a.href = resolvedUrl;
            a.download = previewMedia.name;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        }
    };

    return (
        <div
            role="dialog"
            aria-label={`Xem ${previewMedia.name}`}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-xs animate-in fade-in duration-150"
            onClick={() => setPreviewMedia(null)}
        >
            <div
                className="relative flex max-h-[90vh] max-w-4xl flex-col items-center select-none"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="mb-3 flex w-full items-center justify-between gap-4 text-white">
                    <span className="truncate text-sm font-medium opacity-90">{previewMedia.name}</span>
                    <div className="flex items-center gap-2 shrink-0">
                        <button
                            type="button"
                            onClick={() => void handleDownload()}
                            className="rounded-full bg-white/15 p-2 text-white hover:bg-white/25 transition-colors cursor-pointer"
                            title="Tải về máy"
                            aria-label="Tải về máy"
                        >
                            <Download size={18} />
                        </button>
                        <button
                            type="button"
                            onClick={() => setPreviewMedia(null)}
                            className="rounded-full bg-white/15 p-2 text-white hover:bg-white/25 transition-colors cursor-pointer"
                            title="Đóng (Esc)"
                            aria-label="Đóng xem trước"
                        >
                            <X size={18} />
                        </button>
                    </div>
                </div>

                {loading || !resolvedUrl ? (
                    <div className="flex h-64 w-80 items-center justify-center rounded-xl bg-slate-900/70 text-white">
                        <Loader2 size={24} className="animate-spin" />
                    </div>
                ) : previewMedia.kind === "video" ? (
                    <video
                        src={resolvedUrl}
                        controls
                        autoPlay
                        playsInline
                        className="max-h-[80vh] max-w-full rounded-xl bg-black shadow-2xl"
                    />
                ) : (
                    <img
                        src={resolvedUrl}
                        alt={previewMedia.name}
                        className="max-h-[80vh] max-w-full rounded-xl object-contain shadow-2xl"
                    />
                )}
            </div>
        </div>
    );
};
