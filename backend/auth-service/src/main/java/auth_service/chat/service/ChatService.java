package auth_service.chat.service;

import auth_service.chat.dto.*;
import auth_service.chat.dto.request.SendMessageRequest;
import auth_service.entity.User;

import java.util.List;

public interface ChatService {

    List<ChatUserResponse> searchColleagues(User currentUser, String search);

    ChatConversationResponse getOrCreateDirectConversation(User currentUser, Long recipientUserId);

    List<ChatConversationResponse> getUserConversations(User currentUser);

    ChatConversationResponse getConversationDetail(User currentUser, Long conversationId);

    CursorPageResponse<ChatMessageResponse> getMessageHistory(User currentUser, Long conversationId, Long beforeId, int limit);

    CursorPageResponse<ChatMessageResponse> searchMessages(User currentUser, Long conversationId, String query, int limit);

    ChatMessageResponse sendMessage(User currentUser, Long conversationId, SendMessageRequest request);

    void markAsRead(User currentUser, Long conversationId, Long messageId);

    UnreadSummaryResponse getUnreadSummary(User currentUser);
}
