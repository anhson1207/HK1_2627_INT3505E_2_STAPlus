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

export function formatFileSize(bytes?: number | null): string {
    if (!bytes || bytes <= 0) return "0 B";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function getFileIconType(filename?: string | null): "image" | "pdf" | "word" | "excel" | "file" {
    if (!filename) return "file";
    const ext = filename.split(".").pop()?.toLowerCase() || "";
    if (["jpg", "jpeg", "png", "webp", "gif"].includes(ext)) return "image";
    if (["pdf"].includes(ext)) return "pdf";
    if (["doc", "docx"].includes(ext)) return "word";
    if (["xls", "xlsx", "csv"].includes(ext)) return "excel";
    return "file";
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

