import axios from "axios";
import { useAuthStore } from "../stores/authStore";
import { ApiError } from "./api";
import type {
    ChatAttachmentResponse,
    ChatConversation,
    ChatMessage,
    ChatParticipant,
    ChatUser,
    CursorPage,
    MessageType,
    UnreadSummary,
    WsTicketResponse,
} from "../types/chat";

export interface SendMessagePayload {
    content: string;
    clientMessageId: string;
    type?: MessageType;
    attachmentUrl?: string;
    attachmentName?: string;
    attachmentSize?: number;
}

export interface CreateGroupPayload {
    name: string;
    avatarUrl?: string;
    memberIds: number[];
}

export interface UpdateGroupPayload {
    name: string;
    avatarUrl?: string;
}

const chatApi = axios.create({
    baseURL:
        import.meta.env.VITE_CHAT_API_BASE_URL ??
        (import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api/v1"),
    timeout: 10000,
});

chatApi.interceptors.request.use((config) => {
    const token = useAuthStore.getState().token;
    if (token) {
        config.headers.set("Authorization", `Bearer ${token}`);
    }
    return config;
});

chatApi.interceptors.response.use(
    (response) => response,
    (error: unknown) => {
        if (!axios.isAxiosError(error)) return Promise.reject(error);
        const status = error.response?.status ?? 0;
        const body: unknown = error.response?.data;
        const serverMessage =
            typeof body === "object" && body !== null && "message" in body
                ? (body as { message?: string }).message
                : null;
        const message =
            serverMessage ??
            (status === 0
                ? "Không kết nối được server. Kiểm tra kết nối, địa chỉ Auth Service và cấu hình CORS."
                : `Yêu cầu thất bại (${status}).`);
        return Promise.reject(new ApiError(message, status));
    }
);

export const chatService = {
    /**
     * Tìm kiếm nhân viên nội bộ để bắt đầu trò chuyện
     */
    async searchUsers(search?: string): Promise<ChatUser[]> {
        const response = await chatApi.get<ChatUser[]>("/chat/users", {
            params: search?.trim() ? { search: search.trim() } : undefined,
        });
        return response.data;
    },

    /**
     * Lấy danh sách hội thoại của người dùng hiện tại
     */
    async getConversations(): Promise<ChatConversation[]> {
        const response = await chatApi.get<ChatConversation[]>("/chat/conversations");
        return response.data;
    },

    /**
     * Lấy chi tiết một hội thoại
     */
    async getConversationDetail(conversationId: number): Promise<ChatConversation> {
        const response = await chatApi.get<ChatConversation>(`/chat/conversations/${conversationId}`);
        return response.data;
    },

    /**
     * Tạo hoặc lấy lại hội thoại 1-1 với một đồng nghiệp
     */
    async getOrCreateDirect(recipientUserId: number): Promise<ChatConversation> {
        const response = await chatApi.post<ChatConversation>("/chat/conversations/direct", {
            recipientUserId,
        });
        return response.data;
    },

    /**
     * Tạo nhóm chat mới
     */
    async createGroup(data: CreateGroupPayload): Promise<ChatConversation> {
        const response = await chatApi.post<ChatConversation>("/chat/conversations/group", data);
        return response.data;
    },

    /**
     * Cập nhật thông tin nhóm (Tên, avatar)
     */
    async updateGroup(conversationId: number, data: UpdateGroupPayload): Promise<ChatConversation> {
        const response = await chatApi.patch<ChatConversation>(`/chat/conversations/${conversationId}/info`, data);
        return response.data;
    },

    /**
     * Thêm thành viên vào nhóm chat
     */
    async addGroupMembers(conversationId: number, memberIds: number[]): Promise<ChatConversation> {
        const response = await chatApi.post<ChatConversation>(`/chat/conversations/${conversationId}/members`, {
            userIds: memberIds,
        });
        return response.data;
    },

    /**
     * Xóa thành viên khỏi nhóm chat
     */
    async removeGroupMember(conversationId: number, targetUserId: number): Promise<void> {
        await chatApi.delete(`/chat/conversations/${conversationId}/members/${targetUserId}`);
    },

    /**
     * Cập nhật vai trò thành viên trong nhóm (ADMIN / MEMBER)
     */
    async updateMemberRole(
        conversationId: number,
        targetUserId: number,
        role: "ADMIN" | "MEMBER"
    ): Promise<ChatParticipant> {
        const response = await chatApi.patch<ChatParticipant>(
            `/chat/conversations/${conversationId}/members/${targetUserId}/role`,
            { role }
        );
        return response.data;
    },

    /**
     * Chuyển quyền OWNER cho thành viên khác
     */
    async transferOwner(conversationId: number, newOwnerUserId: number): Promise<ChatConversation> {
        const response = await chatApi.post<ChatConversation>(
            `/chat/conversations/${conversationId}/transfer-owner`,
            { newOwnerUserId }
        );
        return response.data;
    },

    /**
     * Rời khỏi nhóm chat
     */
    async leaveGroup(conversationId: number): Promise<void> {
        await chatApi.post(`/chat/conversations/${conversationId}/leave`);
    },

    /**
     * Lấy lịch sử tin nhắn với cursor pagination (trước beforeId, hoặc mới nhất nếu beforeId null)
     */
    async getMessageHistory(
        conversationId: number,
        beforeId?: number,
        limit = 30
    ): Promise<CursorPage<ChatMessage>> {
        const response = await chatApi.get<CursorPage<ChatMessage>>(
            `/chat/conversations/${conversationId}/messages`,
            {
                params: {
                    beforeId: beforeId ?? undefined,
                    limit,
                },
            }
        );
        return response.data;
    },

    /**
     * Tìm kiếm tin nhắn trong hội thoại
     */
    async searchMessages(
        conversationId: number,
        query: string,
        limit = 30
    ): Promise<CursorPage<ChatMessage>> {
        const response = await chatApi.get<CursorPage<ChatMessage>>(
            `/chat/conversations/${conversationId}/messages/search`,
            {
                params: {
                    query,
                    limit,
                },
            }
        );
        return response.data;
    },

    /**
     * Gửi tin nhắn mới vào cuộc trò chuyện
     */
    async sendMessage(
        conversationId: number,
        data: SendMessagePayload
    ): Promise<ChatMessage> {
        const response = await chatApi.post<ChatMessage>(
            `/chat/conversations/${conversationId}/messages`,
            data
        );
        return response.data;
    },

    /**
     * Đánh dấu đã đọc tin nhắn
     */
    async markAsRead(conversationId: number, messageId: number): Promise<void> {
        await chatApi.post(`/chat/conversations/${conversationId}/read`, {
            messageId,
        });
    },

    /**
     * Lấy tổng quan số tin chưa đọc
     */
    async getUnreadSummary(): Promise<UnreadSummary> {
        const response = await chatApi.get<UnreadSummary>("/chat/unread-summary");
        return response.data;
    },

    /**
     * Lấy Single-Use WebSocket Ticket để bắt tay WebSocket
     */
    async getWsTicket(): Promise<WsTicketResponse> {
        const response = await chatApi.post<WsTicketResponse>("/chat/ws-ticket");
        return response.data;
    },

    /**
     * Tải lên tệp đính kèm (hình ảnh hoặc tài liệu, tối đa 10MB)
     */
    async uploadFile(
        conversationId: number,
        file: File,
        onProgress?: (percent: number) => void
    ): Promise<ChatAttachmentResponse> {
        const formData = new FormData();
        formData.append("file", file);

        const response = await chatApi.post<ChatAttachmentResponse>(
            `/chat/conversations/${conversationId}/files`,
            formData,
            {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
                onUploadProgress: (progressEvent) => {
                    if (onProgress && progressEvent.total) {
                        const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                        onProgress(percent);
                    }
                },
            }
        );
        return response.data;
    },

    /**
     * Tải tệp tin về dưới dạng Blob URL tạm thời (dùng xác thực Authorization header, không lộ token trên URL)
     */
    async getAttachmentBlobUrl(fileUrl: string): Promise<string> {
        const cleanPath = fileUrl.startsWith("/api/v1") ? fileUrl.slice(7) : fileUrl;
        const response = await chatApi.get(cleanPath, { responseType: "blob" });
        return URL.createObjectURL(response.data);
    },

    /**
     * Tải tệp tin về máy người dùng an toàn bằng Blob (kèm Authorization header)
     */
    async downloadAttachment(fileUrl: string, filename: string): Promise<void> {
        const cleanPath = fileUrl.startsWith("/api/v1") ? fileUrl.slice(7) : fileUrl;
        const response = await chatApi.get(cleanPath, { responseType: "blob" });
        const blobUrl = URL.createObjectURL(response.data);
        const a = document.createElement("a");
        a.href = blobUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
    },

    /**
     * @deprecated Sử dụng downloadAttachment hoặc getAttachmentBlobUrl để bảo mật token.
     */
    getFileDownloadUrl(fileUrl: string): string {
        const base =
            import.meta.env.VITE_CHAT_API_BASE_URL ??
            (import.meta.env.VITE_API_BASE_URL ? import.meta.env.VITE_API_BASE_URL.replace(/\/api\/v1$/, "") : "http://localhost:8080");
        const cleanPath = fileUrl.startsWith("/") ? fileUrl : `/${fileUrl}`;
        return `${base}${cleanPath}`;
    },
};
