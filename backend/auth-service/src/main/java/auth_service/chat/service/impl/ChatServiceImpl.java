package auth_service.chat.service.impl;

import auth_service.chat.dto.*;
import auth_service.chat.dto.request.SendMessageRequest;
import auth_service.chat.entity.ChatConversation;
import auth_service.chat.entity.ChatMessage;
import auth_service.chat.entity.ChatParticipant;
import auth_service.chat.entity.enums.ConversationType;
import auth_service.chat.entity.enums.MessageType;
import auth_service.chat.entity.enums.ParticipantRole;
import auth_service.chat.entity.enums.ParticipantStatus;
import auth_service.chat.repository.ChatConversationRepository;
import auth_service.chat.repository.ChatMessageRepository;
import auth_service.chat.repository.ChatParticipantRepository;
import auth_service.chat.service.ChatService;
import auth_service.entity.User;
import auth_service.entity.UserStatus;
import auth_service.exception.ForbiddenException;
import auth_service.exception.UserNotFoundException;
import auth_service.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ChatServiceImpl implements ChatService {

    private final ChatConversationRepository conversationRepository;
    private final ChatParticipantRepository participantRepository;
    private final ChatMessageRepository messageRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public List<ChatUserResponse> searchColleagues(User currentUser, String search) {
        String query = (search != null) ? search.trim() : "";
        List<User> activeUsers = userRepository.searchColleagues(UserStatus.ACTIVE, query);

        return activeUsers.stream()
                .filter(u -> !u.getId().equals(currentUser.getId()))
                .map(this::mapToChatUserResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public ChatConversationResponse getOrCreateDirectConversation(User currentUser, Long recipientUserId) {
        if (recipientUserId == null) {
            throw new IllegalArgumentException("recipientUserId không được để trống");
        }
        if (recipientUserId.equals(currentUser.getId())) {
            throw new IllegalArgumentException("Không thể tạo cuộc trò chuyện với chính mình");
        }

        User recipient = userRepository.findById(recipientUserId)
                .orElseThrow(() -> new UserNotFoundException("Không tìm thấy người dùng ID: " + recipientUserId));

        if (recipient.getStatus() != UserStatus.ACTIVE) {
            throw new IllegalArgumentException("Người dùng này hiện không hoạt động");
        }

        long minId = Math.min(currentUser.getId(), recipientUserId);
        long maxId = Math.max(currentUser.getId(), recipientUserId);
        String directKey = minId + "_" + maxId;

        Optional<ChatConversation> existingOpt = conversationRepository.findByDirectKey(directKey);
        if (existingOpt.isPresent()) {
            return mapToConversationResponse(existingOpt.get(), currentUser.getId());
        }

        try {
            ChatConversation conversation = ChatConversation.builder()
                    .type(ConversationType.DIRECT)
                    .directKey(directKey)
                    .creator(currentUser)
                    .lastMessageAt(LocalDateTime.now())
                    .build();

            ChatParticipant pCurrent = ChatParticipant.builder()
                    .conversation(conversation)
                    .user(currentUser)
                    .role(ParticipantRole.MEMBER)
                    .status(ParticipantStatus.ACTIVE)
                    .build();

            ChatParticipant pRecipient = ChatParticipant.builder()
                    .conversation(conversation)
                    .user(recipient)
                    .role(ParticipantRole.MEMBER)
                    .status(ParticipantStatus.ACTIVE)
                    .build();

            conversation.getParticipants().add(pCurrent);
            conversation.getParticipants().add(pRecipient);

            ChatConversation saved = conversationRepository.save(conversation);
            return mapToConversationResponse(saved, currentUser.getId());

        } catch (DataIntegrityViolationException ex) {
            // Trường hợp có request đồng thời từ phía đối phương
            log.info("Concurrent direct conversation creation detected for key: {}", directKey);
            ChatConversation existing = conversationRepository.findByDirectKey(directKey)
                    .orElseThrow(() -> new IllegalStateException("Không tìm thấy hội thoại sau xung đột tạo đồng thời"));
            return mapToConversationResponse(existing, currentUser.getId());
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<ChatConversationResponse> getUserConversations(User currentUser) {
        List<ChatConversation> list = conversationRepository.findConversationsForUser(currentUser.getId());

        return list.stream()
                .map(conv -> mapToConversationResponse(conv, currentUser.getId()))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public ChatConversationResponse getConversationDetail(User currentUser, Long conversationId) {
        ChatParticipant participant = findActiveParticipantOrThrow(conversationId, currentUser.getId());
        return mapToConversationResponse(participant.getConversation(), currentUser.getId());
    }

    @Override
    @Transactional(readOnly = true)
    public CursorPageResponse<ChatMessageResponse> getMessageHistory(
            User currentUser, Long conversationId, Long beforeId, int limit
    ) {
        ChatParticipant participant = findActiveParticipantOrThrow(conversationId, currentUser.getId());
        int pageSize = Math.min(Math.max(limit, 1), 50);

        Long visibleFromId = (participant.getVisibleFromMessageId() != null)
                ? participant.getVisibleFromMessageId() : 0L;

        List<ChatMessage> messages = messageRepository.findMessagesWithCursor(
                conversationId, beforeId, visibleFromId, PageRequest.of(0, pageSize + 1)
        );

        boolean hasMore = messages.size() > pageSize;
        List<ChatMessage> contentList = hasMore ? messages.subList(0, pageSize) : messages;

        Long nextCursor = hasMore ? contentList.get(contentList.size() - 1).getId() : null;

        List<ChatMessageResponse> dtoList = contentList.stream()
                .map(m -> mapToMessageResponse(m, currentUser.getId()))
                .collect(Collectors.toList());

        return CursorPageResponse.<ChatMessageResponse>builder()
                .items(dtoList)
                .nextCursor(nextCursor)
                .hasMore(hasMore)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public CursorPageResponse<ChatMessageResponse> searchMessages(
            User currentUser, Long conversationId, String query, int limit
    ) {
        ChatParticipant participant = findActiveParticipantOrThrow(conversationId, currentUser.getId());
        int pageSize = Math.min(Math.max(limit, 1), 50);

        Long visibleFromId = (participant.getVisibleFromMessageId() != null)
                ? participant.getVisibleFromMessageId() : 0L;

        String safeQuery = (query != null) ? query.trim() : "";
        List<ChatMessage> messages = messageRepository.searchMessages(
                conversationId, visibleFromId, safeQuery, PageRequest.of(0, pageSize)
        );

        List<ChatMessageResponse> dtoList = messages.stream()
                .map(m -> mapToMessageResponse(m, currentUser.getId()))
                .collect(Collectors.toList());

        return CursorPageResponse.<ChatMessageResponse>builder()
                .items(dtoList)
                .nextCursor(null)
                .hasMore(false)
                .build();
    }

    @Override
    @Transactional
    public ChatMessageResponse sendMessage(User currentUser, Long conversationId, SendMessageRequest request) {
        ChatParticipant participant = findActiveParticipantOrThrow(conversationId, currentUser.getId());
        ChatConversation conversation = participant.getConversation();

        // 1. Kiểm tra Idempotency chống gửi trùng lặp
        Optional<ChatMessage> existing = messageRepository.findByConversationIdAndClientMessageId(
                conversationId, request.getClientMessageId()
        );
        if (existing.isPresent()) {
            log.info("Duplicate message send ignored for clientMessageId: {}", request.getClientMessageId());
            return mapToMessageResponse(existing.get(), currentUser.getId());
        }

        MessageType msgType = (request.getType() != null) ? request.getType() : MessageType.TEXT;

        ChatMessage message = ChatMessage.builder()
                .conversation(conversation)
                .sender(currentUser)
                .senderName(currentUser.getUsername())
                .type(msgType)
                .content(request.getContent().trim())
                .attachmentUrl(request.getAttachmentUrl())
                .attachmentName(request.getAttachmentName())
                .attachmentSize(request.getAttachmentSize())
                .clientMessageId(request.getClientMessageId())
                .build();

        ChatMessage saved;
        try {
            saved = messageRepository.save(message);
        } catch (DataIntegrityViolationException ex) {
            log.warn("Concurrent duplicate clientMessageId detected: {}", request.getClientMessageId());
            ChatMessage duplicate = messageRepository.findByConversationIdAndClientMessageId(
                    conversationId, request.getClientMessageId()
            ).orElseThrow(() -> ex);
            return mapToMessageResponse(duplicate, currentUser.getId());
        }

        // 2. Cập nhật lastMessage trên hội thoại
        conversation.setLastMessageId(saved.getId());
        conversation.setLastMessageAt(saved.getCreatedAt());
        conversationRepository.save(conversation);

        // 3. Tự động đánh dấu đã đọc cho chính người gửi
        participant.setLastReadMessageId(saved.getId());
        participant.setLastReadAt(saved.getCreatedAt());
        participantRepository.save(participant);

        return mapToMessageResponse(saved, currentUser.getId());
    }

    @Override
    @Transactional
    public void markAsRead(User currentUser, Long conversationId, Long messageId) {
        if (messageId == null) return;
        ChatParticipant participant = findActiveParticipantOrThrow(conversationId, currentUser.getId());

        Long currentReadId = (participant.getLastReadMessageId() != null)
                ? participant.getLastReadMessageId() : 0L;

        if (messageId > currentReadId) {
            participant.setLastReadMessageId(messageId);
            participant.setLastReadAt(LocalDateTime.now());
            participantRepository.save(participant);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public UnreadSummaryResponse getUnreadSummary(User currentUser) {
        List<ChatParticipant> memberships = participantRepository.findActiveMembershipsByUserId(currentUser.getId());

        long totalUnread = 0;
        Map<Long, Long> unreadMap = new HashMap<>();

        for (ChatParticipant cp : memberships) {
            Long lastRead = (cp.getLastReadMessageId() != null) ? cp.getLastReadMessageId() : 0L;
            long count = participantRepository.countUnreadMessages(
                    cp.getConversation().getId(), lastRead, currentUser.getId()
            );
            if (count > 0) {
                unreadMap.put(cp.getConversation().getId(), count);
                totalUnread += count;
            }
        }

        return UnreadSummaryResponse.builder()
                .totalUnreadCount(totalUnread)
                .conversationUnreadMap(unreadMap)
                .build();
    }

    // ====================================================================
    // HELPER & MAPPING METHODS
    // ====================================================================

    private ChatParticipant findActiveParticipantOrThrow(Long conversationId, Long userId) {
        ChatParticipant p = participantRepository.findByConversationIdAndUserId(conversationId, userId)
                .orElseThrow(() -> new ForbiddenException("Bạn không phải là thành viên của cuộc trò chuyện này"));

        if (p.getStatus() != ParticipantStatus.ACTIVE) {
            throw new ForbiddenException("Bạn đã rời hoặc không còn quyền truy cập cuộc trò chuyện này");
        }
        return p;
    }

    private ChatUserResponse mapToChatUserResponse(User user) {
        if (user == null) return null;
        return ChatUserResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .role(user.getRole())
                .status(user.getStatus())
                .build();
    }

    private ChatParticipantResponse mapToParticipantResponse(ChatParticipant p) {
        User u = p.getUser();
        return ChatParticipantResponse.builder()
                .id(p.getId())
                .userId(u != null ? u.getId() : null)
                .username(u != null ? u.getUsername() : "Tài khoản đã xóa")
                .email(u != null ? u.getEmail() : null)
                .role(p.getRole())
                .status(p.getStatus())
                .lastReadMessageId(p.getLastReadMessageId())
                .lastReadAt(p.getLastReadAt())
                .joinedAt(p.getJoinedAt())
                .build();
    }

    private ChatMessageResponse mapToMessageResponse(ChatMessage m, Long currentUserId) {
        Long senderId = (m.getSender() != null) ? m.getSender().getId() : null;
        String senderName = (m.getSender() != null) ? m.getSender().getUsername() : m.getSenderName();

        return ChatMessageResponse.builder()
                .id(m.getId())
                .conversationId(m.getConversation().getId())
                .senderId(senderId)
                .senderUsername(senderName)
                .type(m.getType())
                .content(m.getContent())
                .attachmentUrl(m.getAttachmentUrl())
                .attachmentName(m.getAttachmentName())
                .attachmentSize(m.getAttachmentSize())
                .clientMessageId(m.getClientMessageId())
                .createdAt(m.getCreatedAt())
                .isMine(senderId != null && senderId.equals(currentUserId))
                .build();
    }

    private ChatConversationResponse mapToConversationResponse(ChatConversation conv, Long currentUserId) {
        List<ChatParticipantResponse> participants = (conv.getParticipants() != null)
                ? conv.getParticipants().stream().map(this::mapToParticipantResponse).collect(Collectors.toList())
                : Collections.emptyList();

        ChatUserResponse otherUser = null;
        if (conv.getType() == ConversationType.DIRECT && conv.getParticipants() != null) {
            otherUser = conv.getParticipants().stream()
                    .filter(p -> p.getUser() != null && !p.getUser().getId().equals(currentUserId))
                    .map(p -> mapToChatUserResponse(p.getUser()))
                    .findFirst()
                    .orElse(null);
        }

        long unreadCount = 0;
        if (conv.getParticipants() != null) {
            ChatParticipant myParticipant = conv.getParticipants().stream()
                    .filter(p -> p.getUser() != null && p.getUser().getId().equals(currentUserId))
                    .findFirst()
                    .orElse(null);

            if (myParticipant != null) {
                Long lastRead = (myParticipant.getLastReadMessageId() != null)
                        ? myParticipant.getLastReadMessageId() : 0L;
                unreadCount = participantRepository.countUnreadMessages(conv.getId(), lastRead, currentUserId);
            }
        }

        String displayName = conv.getName();
        if (conv.getType() == ConversationType.DIRECT && otherUser != null) {
            displayName = otherUser.getUsername();
        }

        String lastMsgPreview = null;
        String lastMsgSender = null;
        if (conv.getLastMessageId() != null) {
            Optional<ChatMessage> lastMsgOpt = messageRepository.findById(conv.getLastMessageId());
            if (lastMsgOpt.isPresent()) {
                ChatMessage lastMsg = lastMsgOpt.get();
                lastMsgPreview = lastMsg.getContent();
                lastMsgSender = (lastMsg.getSender() != null)
                        ? lastMsg.getSender().getUsername() : lastMsg.getSenderName();
            }
        }

        return ChatConversationResponse.builder()
                .id(conv.getId())
                .type(conv.getType())
                .directKey(conv.getDirectKey())
                .name(displayName)
                .avatarUrl(conv.getAvatarUrl())
                .creatorId(conv.getCreator() != null ? conv.getCreator().getId() : null)
                .lastMessageId(conv.getLastMessageId())
                .lastMessagePreview(lastMsgPreview)
                .lastMessageAt(conv.getLastMessageAt())
                .lastMessageSenderName(lastMsgSender)
                .unreadCount(unreadCount)
                .participants(participants)
                .otherParticipant(otherUser)
                .createdAt(conv.getCreatedAt())
                .updatedAt(conv.getUpdatedAt())
                .build();
    }
}
