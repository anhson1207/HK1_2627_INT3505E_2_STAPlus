import type { UserRole } from "./auth";

export type ConversationType = "DIRECT" | "GROUP";
export type ParticipantRole = "OWNER" | "ADMIN" | "MEMBER";
export type ParticipantStatus = "ACTIVE" | "LEFT" | "REMOVED";
export type MessageType = "TEXT" | "IMAGE" | "FILE" | "SYSTEM";

export interface ChatUser {
    id: number;
    username: string;
    email: string;
    role: UserRole;
    status: string;
}

export interface ChatParticipant {
    id: number;
    userId: number;
    username: string;
    email: string;
    role: ParticipantRole;
    status: ParticipantStatus;
    lastReadMessageId: number | null;
    lastReadAt: string | null;
    visibleFromMessageId?: number | null;
    joinedAt: string;
}

export interface ChatAttachmentResponse {
    id: number;
    conversationId: number;
    uploaderId: number;
    originalFilename: string;
    contentType: string;
    fileSize: number;
    fileUrl: string;
    messageType: MessageType;
    createdAt: string;
}

export interface ChatMessage {
    id: number;
    conversationId: number;
    senderId: number | null;
    senderUsername: string;
    type: MessageType;
    content: string;
    attachmentUrl: string | null;
    attachmentName: string | null;
    attachmentSize: number | null;
    clientMessageId: string;
    createdAt: string;
    isMine: boolean;
    // Client-side transient status
    status?: "sending" | "sent" | "error";
    error?: string;
}

export interface ChatConversation {
    id: number;
    type: ConversationType;
    name: string | null;
    avatarUrl: string | null;
    creatorId: number | null;
    lastMessageId: number | null;
    lastMessageAt: string | null;
    unreadCount: number;
    participants: ChatParticipant[];
    lastMessage: ChatMessage | null;
    myRole: ParticipantRole | null;
    createdAt: string;
    updatedAt: string;
}

export interface CursorPage<T> {
    items: T[];
    nextCursor: number | null;
    hasMore: boolean;
}

export interface UnreadSummary {
    totalUnreadCount: number;
    conversationUnreadMap: Record<string, number>;
}

export interface WsTicketResponse {
    ticket: string;
    expiresInSeconds: number;
}

// STOMP Events Payloads
export interface ChatEventEnvelope<T = unknown> {
    event: string;
    conversationId: number | null;
    timestamp: string;
    data: T;
}

export interface ChatReadReceiptPayload {
    conversationId: number;
    userId: number;
    username: string;
    lastReadMessageId: number;
    readAt: string;
}

export interface ChatUnreadUpdatePayload {
    conversationId: number;
    unreadCount: number;
    totalUnreadCount: number;
}

export interface ChatMemberJoinedPayload {
    conversationId: number;
    memberIds: number[];
    memberUsernames: string[];
    inviterUsername: string;
}

export interface ChatMemberLeftPayload {
    conversationId: number;
    userId: number;
    username: string;
    reason: "LEFT" | "REMOVED";
    operatorUsername: string;
}

export interface ChatGroupUpdatedPayload {
    conversationId: number;
    name: string;
    avatarUrl: string | null;
    operatorUsername: string;
}

export interface ChatMemberRoleUpdatedPayload {
    conversationId: number;
    userId: number;
    oldRole: ParticipantRole;
    newRole: ParticipantRole;
    operatorUsername: string;
}

export interface ChatUserPresencePayload {
    userId: number;
    username: string;
    status: "ONLINE" | "OFFLINE";
    timestamp: string;
}

