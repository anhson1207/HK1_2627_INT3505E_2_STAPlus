import type { ChatConversation, ChatMessage, ChatParticipant } from "../types/chat";

const AVATAR_COLORS = [
    "bg-teal-600 text-white",
    "bg-indigo-600 text-white",
    "bg-blue-600 text-white",
    "bg-emerald-600 text-white",
    "bg-purple-600 text-white",
    "bg-amber-600 text-white",
    "bg-rose-600 text-white",
    "bg-cyan-600 text-white",
];

export function getAvatarColor(name: string): string {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % AVATAR_COLORS.length;
    return AVATAR_COLORS[index];
}

export function getInitials(name?: string | null): string {
    if (!name || !name.trim()) return "?";
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) {
        return parts[0].substring(0, 2).toUpperCase();
    }
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function formatMessageTime(isoString: string): string {
    try {
        const d = new Date(isoString);
        return d.toLocaleTimeString("vi-VN", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
        });
    } catch {
        return "";
    }
}

export function formatConversationTime(isoString?: string | null): string {
    if (!isoString) return "";
    try {
        const d = new Date(isoString);
        const now = new Date();

        const isToday =
            d.getDate() === now.getDate() &&
            d.getMonth() === now.getMonth() &&
            d.getFullYear() === now.getFullYear();

        if (isToday) {
            return d.toLocaleTimeString("vi-VN", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
            });
        }

        const yesterday = new Date(now);
        yesterday.setDate(now.getDate() - 1);
        const isYesterday =
            d.getDate() === yesterday.getDate() &&
            d.getMonth() === yesterday.getMonth() &&
            d.getFullYear() === yesterday.getFullYear();

        if (isYesterday) {
            return "Hôm qua";
        }

        return d.toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
        });
    } catch {
        return "";
    }
}

export function formatDateDivider(isoString: string): string {
    try {
        const d = new Date(isoString);
        const now = new Date();

        const isToday =
            d.getDate() === now.getDate() &&
            d.getMonth() === now.getMonth() &&
            d.getFullYear() === now.getFullYear();

        if (isToday) return "Hôm nay";

        const yesterday = new Date(now);
        yesterday.setDate(now.getDate() - 1);
        const isYesterday =
            d.getDate() === yesterday.getDate() &&
            d.getMonth() === yesterday.getMonth() &&
            d.getFullYear() === yesterday.getFullYear();

        if (isYesterday) return "Hôm qua";

        return d.toLocaleDateString("vi-VN", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: d.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
        });
    } catch {
        return isoString;
    }
}

export function getOtherParticipant(
    conversation: ChatConversation,
    currentUserId?: number
): ChatParticipant | undefined {
    return conversation.participants.find((p) => p.userId !== currentUserId);
}

export function getConversationDisplayName(
    conversation: ChatConversation,
    currentUserId?: number
): string {
    if (conversation.type === "GROUP") {
        return conversation.name || "Nhóm chưa đặt tên";
    }
    const other = getOtherParticipant(conversation, currentUserId);
    return other?.username || "Đồng nghiệp";
}

export function formatLastMessagePreview(conversation: ChatConversation): string {
    const isGroup = conversation.type === "GROUP";
    const lastMsg = conversation.lastMessage;
    if (lastMsg) {
        if (lastMsg.type === "SYSTEM") {
            return lastMsg.content || "";
        }
        const trimmed = lastMsg.content?.trim() || "";
        const body = trimmed
            ? trimmed
            : lastMsg.type === "IMAGE"
                ? "[Hình ảnh]"
                : lastMsg.type === "VIDEO"
                    ? "[Video]"
                    : lastMsg.type === "FILE"
                        ? `[Tệp] ${lastMsg.attachmentName || "Tệp đính kèm"}`
                        : "";
        if (!body) return "Chưa có tin nhắn";
        const senderPrefix = lastMsg.isMine
            ? "Bạn: "
            : isGroup && lastMsg.senderUsername
                ? `${lastMsg.senderUsername}: `
                : "";
        return `${senderPrefix}${body}`;
    }

    const fallback = conversation.lastMessagePreview?.trim();
    if (fallback) {
        const senderPrefix =
            isGroup && conversation.lastMessageSenderName
                ? `${conversation.lastMessageSenderName}: `
                : "";
        return `${senderPrefix}${fallback}`;
    }
    return "Chưa có tin nhắn";
}

export function formatLastSeenStatus(
    isOnline: boolean,
    lastSeenIso?: string | null,
    nowMs: number = Date.now()
): { label: string; isOnline: boolean } {
    if (isOnline) {
        return { label: "Đang hoạt động", isOnline: true };
    }
    if (!lastSeenIso) {
        return { label: "Ngoại tuyến", isOnline: false };
    }
    const ts = new Date(lastSeenIso).getTime();
    if (Number.isNaN(ts)) {
        return { label: "Ngoại tuyến", isOnline: false };
    }
    const diffSeconds = Math.max(0, Math.floor((nowMs - ts) / 1000));
    if (diffSeconds < 60) {
        return { label: "Hoạt động vừa xong", isOnline: false };
    }
    const diffMinutes = Math.floor(diffSeconds / 60);
    if (diffMinutes < 60) {
        return { label: `Hoạt động ${diffMinutes} phút trước`, isOnline: false };
    }
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) {
        return { label: `Hoạt động ${diffHours} giờ trước`, isOnline: false };
    }
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays <= 7) {
        return { label: `Hoạt động ${diffDays} ngày trước`, isOnline: false };
    }
    return { label: "Ngoại tuyến", isOnline: false };
}

export function notifyChatOfflineWithToken(token?: string | null) {
    if (!token || token.startsWith("demo-")) return;
    const base =
        import.meta.env.VITE_CHAT_API_BASE_URL ??
        (import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api/v1");
    const url = `${base.replace(/\/$/, "")}/chat/presence/offline`;
    try {
        void fetch(url, {
            method: "POST",
            keepalive: true,
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }).catch(() => {});
    } catch {
        // Ignore network errors on logout
    }
}

export function formatFileSize(bytes?: number | null): string {
    if (!bytes || bytes <= 0) return "0 B";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function getFileIconType(filename?: string | null): "image" | "video" | "pdf" | "word" | "excel" | "file" {
    if (!filename) return "file";
    const ext = filename.split(".").pop()?.toLowerCase() || "";
    if (["jpg", "jpeg", "png", "webp", "gif"].includes(ext)) return "image";
    if (["mp4", "webm", "mov"].includes(ext)) return "video";
    if (["pdf"].includes(ext)) return "pdf";
    if (["doc", "docx"].includes(ext)) return "word";
    if (["xls", "xlsx", "csv"].includes(ext)) return "excel";
    return "file";
}

export interface MessageTextSegment {
    type: "text" | "link";
    value: string;
    href?: string;
}

const URL_SEGMENT_REGEX = /(https?:\/\/[^\s<>"']+|www\.[^\s<>"']+)/gi;

export function splitMessageTextWithLinks(text: string): MessageTextSegment[] {
    if (!text) return [];
    const segments: MessageTextSegment[] = [];
    let lastIndex = 0;

    for (const match of text.matchAll(URL_SEGMENT_REGEX)) {
        const raw = match[0];
        const idx = match.index ?? 0;
        if (idx > lastIndex) {
            segments.push({ type: "text", value: text.slice(lastIndex, idx) });
        }

        const cleaned = raw.replace(/[.,;:!?)]+$/, "");
        const trailing = raw.slice(cleaned.length);

        if (cleaned) {
            const href = /^www\./i.test(cleaned) ? `https://${cleaned}` : cleaned;
            segments.push({ type: "link", value: cleaned, href });
        }
        if (trailing) {
            segments.push({ type: "text", value: trailing });
        }
        lastIndex = idx + raw.length;
    }

    if (lastIndex < text.length) {
        segments.push({ type: "text", value: text.slice(lastIndex) });
    }
    return segments;
}

export function getMessageReaders(
    message: ChatMessage,
    participants: ChatParticipant[]
): ChatParticipant[] {
    if (!message.id || message.id <= 0) return [];
    return participants.filter((p) => {
        if (p.userId === message.senderId) return false;
        if (p.lastReadMessageId == null || p.lastReadMessageId < message.id) return false;
        if (p.visibleFromMessageId != null && p.visibleFromMessageId > message.id) return false;
        return true;
    });
}

let audioCtx: AudioContext | null = null;
export function playChatChime() {
    try {
        const AudioContextClass =
            window.AudioContext ||
            (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (!AudioContextClass) return;
        if (!audioCtx) audioCtx = new AudioContextClass();
        if (audioCtx.state === "suspended") {
            void audioCtx.resume();
        }
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = "sine";
        const now = audioCtx.currentTime;
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.exponentialRampToValueAtTime(1174, now + 0.08);
        gain.gain.setValueAtTime(0.04, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.08);
    } catch {
        // audio playback blocked or not supported
    }
}

