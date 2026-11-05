package chat_service.service;

import chat_service.dto.*;
import chat_service.dto.request.*;
import chat_service.security.ChatPrincipal;
import chat_service.ws.dto.WsTicketResponse;

import java.util.List;

public interface ChatService {

    List<ChatUserResponse> searchColleagues(ChatPrincipal currentUser, String search);

    ChatConversationResponse getOrCreateDirectConversation(ChatPrincipal currentUser, Long recipientUserId);

    ChatConversationResponse createGroup(ChatPrincipal currentUser, CreateGroupRequest request);

    ChatConversationResponse updateGroupInfo(ChatPrincipal currentUser, Long conversationId, UpdateGroupInfoRequest request);

    ChatConversationResponse addGroupMembers(ChatPrincipal currentUser, Long conversationId, AddGroupMembersRequest request);

    void removeGroupMember(ChatPrincipal currentUser, Long conversationId, Long targetUserId);

    ChatParticipantResponse updateMemberRole(ChatPrincipal currentUser, Long conversationId, Long targetUserId, UpdateMemberRoleRequest request);

    ChatConversationResponse transferOwnership(ChatPrincipal currentUser, Long conversationId, TransferOwnerRequest request);

    void leaveGroup(ChatPrincipal currentUser, Long conversationId);

    List<ChatConversationResponse> getUserConversations(ChatPrincipal currentUser);

    ChatConversationResponse getConversationDetail(ChatPrincipal currentUser, Long conversationId);

    CursorPageResponse<ChatMessageResponse> getMessageHistory(ChatPrincipal currentUser, Long conversationId, Long beforeId, int limit);

    CursorPageResponse<ChatMessageResponse> searchMessages(ChatPrincipal currentUser, Long conversationId, String query, int limit);

    ChatMessageResponse sendMessage(ChatPrincipal currentUser, Long conversationId, SendMessageRequest request);

    void markAsRead(ChatPrincipal currentUser, Long conversationId, Long messageId);

    UnreadSummaryResponse getUnreadSummary(ChatPrincipal currentUser);

    WsTicketResponse createWsTicket(ChatPrincipal currentUser);
}

