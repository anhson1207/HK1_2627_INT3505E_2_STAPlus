package chat_service.service.impl;

import chat_service.client.AuthServiceClient;
import chat_service.dto.*;
import chat_service.dto.request.*;
import chat_service.entity.ChatConversation;
import chat_service.entity.ChatMessage;
import chat_service.entity.ChatParticipant;
import chat_service.entity.enums.ConversationType;
import chat_service.entity.enums.MessageType;
import chat_service.entity.enums.ParticipantRole;
import chat_service.entity.enums.ParticipantStatus;
import chat_service.exception.ForbiddenException;
import chat_service.exception.ResourceNotFoundException;
import chat_service.repository.ChatConversationRepository;
import chat_service.repository.ChatMessageRepository;
import chat_service.repository.ChatParticipantRepository;
import chat_service.security.ChatPrincipal;
import chat_service.service.ChatService;
import chat_service.ws.dto.WsTicketResponse;
import chat_service.ws.event.*;
import chat_service.ws.service.WsTicketService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
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
    private final AuthServiceClient authServiceClient;
    private final WsTicketService wsTicketService;
    private final ApplicationEventPublisher eventPublisher;

    @Override
    @Transactional
    public WsTicketResponse createWsTicket(ChatPrincipal currentUser) {
        if (currentUser == null || currentUser.getUserId() == null) {
            throw new IllegalArgumentException("Người dùng chưa xác thực");
        }
        Optional<ChatUserResponse> userOpt = authServiceClient.getUserById(currentUser.getUserId());
        if (userOpt.isEmpty() || !"ACTIVE".equalsIgnoreCase(userOpt.get().getStatus())) {
            throw new ForbiddenException("Tài khoản đã bị vô hiệu hóa hoặc không tồn tại");
        }
        ChatUserResponse freshUser = userOpt.get();
        if (freshUser.getUsername() != null && !freshUser.getUsername().isBlank()) {
            participantRepository.updateSnapshotByUserId(freshUser.getId(), freshUser.getUsername(), freshUser.getEmail());
        }
        return wsTicketService.createTicket(currentUser);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ChatUserResponse> searchColleagues(ChatPrincipal currentUser, String search) {
        String query = (search != null) ? search.trim() : "";
        List<ChatUserResponse> colleagues = authServiceClient.getColleagues(query);

        return colleagues.stream()
                .filter(u -> !u.getId().equals(currentUser.getUserId()))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public ChatConversationResponse getOrCreateDirectConversation(ChatPrincipal currentUser, Long recipientUserId) {
        if (recipientUserId == null) {
            throw new IllegalArgumentException("recipientUserId không được để trống");
        }
        if (recipientUserId.equals(currentUser.getUserId())) {
            throw new IllegalArgumentException("Không thể tạo cuộc trò chuyện với chính mình");
        }

        ChatUserResponse recipient = authServiceClient.getUserById(recipientUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng ID: " + recipientUserId));

        if (!"ACTIVE".equalsIgnoreCase(recipient.getStatus())) {
            throw new IllegalArgumentException("Người dùng này hiện không hoạt động");
        }

        long minId = Math.min(currentUser.getUserId(), recipientUserId);
        long maxId = Math.max(currentUser.getUserId(), recipientUserId);
        String directKey = minId + "_" + maxId;

        Optional<ChatConversation> existingOpt = conversationRepository.findByDirectKey(directKey);
        if (existingOpt.isPresent()) {
            return mapToConversationResponse(existingOpt.get(), currentUser.getUserId());
        }

        try {
            ChatConversation conversation = ChatConversation.builder()
                    .type(ConversationType.DIRECT)
                    .directKey(directKey)
                    .creatorId(currentUser.getUserId())
                    .lastMessageAt(LocalDateTime.now())
                    .participants(new ArrayList<>())
                    .build();

            ChatParticipant pCurrent = ChatParticipant.builder()
                    .conversation(conversation)
                    .userId(currentUser.getUserId())
                    .username(currentUser.getUsername())
                    .email(currentUser.getEmail())
                    .role(ParticipantRole.MEMBER)
                    .status(ParticipantStatus.ACTIVE)
                    .visibleFromMessageId(0L)
                    .joinedAt(LocalDateTime.now())
                    .build();

            ChatParticipant pRecipient = ChatParticipant.builder()
                    .conversation(conversation)
                    .userId(recipient.getId())
                    .username(recipient.getUsername())
                    .email(recipient.getEmail())
                    .role(ParticipantRole.MEMBER)
                    .status(ParticipantStatus.ACTIVE)
                    .visibleFromMessageId(0L)
                    .joinedAt(LocalDateTime.now())
                    .build();

            conversation.getParticipants().add(pCurrent);
            conversation.getParticipants().add(pRecipient);

            ChatConversation saved = conversationRepository.save(conversation);
            return mapToConversationResponse(saved, currentUser.getUserId());

        } catch (DataIntegrityViolationException ex) {
            log.info("Concurrent direct conversation creation detected for key: {}", directKey);
            ChatConversation existing = conversationRepository.findByDirectKey(directKey)
                    .orElseThrow(() -> new IllegalStateException("Không tìm thấy hội thoại sau xung đột tạo đồng thời"));
            return mapToConversationResponse(existing, currentUser.getUserId());
        }
    }

    @Override
    @Transactional
    public ChatConversationResponse createGroup(ChatPrincipal currentUser, CreateGroupRequest request) {
        if (request.getName() == null || request.getName().trim().isEmpty()) {
            throw new IllegalArgumentException("Tên nhóm không được để trống");
        }

        String avatarUrl = (request.getAvatarUrl() != null && !request.getAvatarUrl().trim().isEmpty())
                ? request.getAvatarUrl().trim() : null;

        ChatConversation conversation = ChatConversation.builder()
                .type(ConversationType.GROUP)
                .name(request.getName().trim())
                .avatarUrl(avatarUrl)
                .creatorId(currentUser.getUserId())
                .lastMessageAt(LocalDateTime.now())
                .participants(new ArrayList<>())
                .build();

        // Người tạo nhóm tự động là OWNER
        ChatParticipant ownerParticipant = ChatParticipant.builder()
                .conversation(conversation)
                .userId(currentUser.getUserId())
                .username(currentUser.getUsername())
                .email(currentUser.getEmail())
                .role(ParticipantRole.OWNER)
                .status(ParticipantStatus.ACTIVE)
                .visibleFromMessageId(0L)
                .joinedAt(LocalDateTime.now())
                .build();
        conversation.getParticipants().add(ownerParticipant);

        // Thêm thành viên ban đầu
        if (request.getMemberIds() != null && !request.getMemberIds().isEmpty()) {
            Set<Long> uniqueMemberIds = new LinkedHashSet<>(request.getMemberIds());
            uniqueMemberIds.remove(currentUser.getUserId());

            List<ChatUserResponse> members = authServiceClient.getUsersByIds(new ArrayList<>(uniqueMemberIds));
            Map<Long, ChatUserResponse> memberMap = members.stream()
                    .collect(Collectors.toMap(ChatUserResponse::getId, m -> m));

            for (Long memberId : uniqueMemberIds) {
                ChatUserResponse memberUser = memberMap.get(memberId);
                if (memberUser == null) {
                    memberUser = authServiceClient.getUserById(memberId)
                            .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy thành viên ID: " + memberId));
                }

                if (!"ACTIVE".equalsIgnoreCase(memberUser.getStatus())) {
                    throw new IllegalArgumentException("Thành viên " + memberUser.getUsername() + " hiện không hoạt động");
                }

                ChatParticipant memberParticipant = ChatParticipant.builder()
                        .conversation(conversation)
                        .userId(memberUser.getId())
                        .username(memberUser.getUsername())
                        .email(memberUser.getEmail())
                        .role(ParticipantRole.MEMBER)
                        .status(ParticipantStatus.ACTIVE)
                        .visibleFromMessageId(0L)
                        .joinedAt(LocalDateTime.now())
                        .build();
                conversation.getParticipants().add(memberParticipant);
            }
        }

        ChatConversation savedConversation = conversationRepository.save(conversation);

        // Tạo thông báo SYSTEM khởi tạo nhóm
        ChatMessage systemMsg = createAndSaveSystemMessage(
                savedConversation,
                currentUser.getUsername() + " đã tạo nhóm \"" + savedConversation.getName() + "\""
        );

        savedConversation.setLastMessageId(systemMsg.getId());
        savedConversation.setLastMessageAt(systemMsg.getCreatedAt());
        savedConversation = conversationRepository.save(savedConversation);

        // Đánh dấu đã đọc tin nhắn hệ thống đầu tiên cho OWNER
        ownerParticipant.setLastReadMessageId(systemMsg.getId());
        ownerParticipant.setLastReadAt(systemMsg.getCreatedAt());
        participantRepository.save(ownerParticipant);

        // Phát sự kiện real-time sau commit
        Set<Long> memberIds = getActiveParticipantUserIds(savedConversation.getId());
        ChatMessageResponse sysMsgDto = mapToMessageResponse(systemMsg, null);
        publishEvent(memberIds, "chat:message:new", savedConversation.getId(), sysMsgDto);
        publishEvent(memberIds, "chat:conversation:updated", savedConversation.getId(), mapToConversationResponse(savedConversation, null));

        for (Long mId : memberIds) {
            if (!mId.equals(currentUser.getUserId())) {
                sendUnreadUpdate(savedConversation.getId(), mId);
            }
        }

        return mapToConversationResponse(savedConversation, currentUser.getUserId());
    }

    @Override
    @Transactional
    public ChatConversationResponse updateGroupInfo(ChatPrincipal currentUser, Long conversationId, UpdateGroupInfoRequest request) {
        ChatParticipant caller = findActiveParticipantOrThrow(conversationId, currentUser.getUserId());
        ChatConversation conversation = caller.getConversation();

        if (conversation.getType() != ConversationType.GROUP) {
            throw new IllegalArgumentException("Chỉ có thể cập nhật thông tin cho nhóm chat");
        }

        if (caller.getRole() != ParticipantRole.OWNER && caller.getRole() != ParticipantRole.ADMIN) {
            throw new ForbiddenException("Chỉ Trưởng nhóm hoặc Phó nhóm mới có quyền chỉnh sửa thông tin nhóm");
        }

        boolean updated = false;
        List<String> notices = new ArrayList<>();

        if (request.getName() != null && !request.getName().trim().isEmpty()
                && !request.getName().trim().equals(conversation.getName())) {
            String newName = request.getName().trim();
            notices.add(currentUser.getUsername() + " đã đổi tên nhóm thành \"" + newName + "\"");
            conversation.setName(newName);
            updated = true;
        }

        if (request.getAvatarUrl() != null && !request.getAvatarUrl().trim().isEmpty()
                && !request.getAvatarUrl().trim().equals(conversation.getAvatarUrl())) {
            conversation.setAvatarUrl(request.getAvatarUrl().trim());
            notices.add(currentUser.getUsername() + " đã cập nhật ảnh đại diện nhóm");
            updated = true;
        }

        if (updated) {
            ChatConversation saved = conversationRepository.save(conversation);
            for (String notice : notices) {
                ChatMessage sysMsg = createAndSaveSystemMessage(saved, notice);
                saved.setLastMessageId(sysMsg.getId());
                saved.setLastMessageAt(sysMsg.getCreatedAt());
                publishEvent(getActiveParticipantUserIds(conversationId), "chat:message:new", conversationId, mapToMessageResponse(sysMsg, null));
            }
            conversation = conversationRepository.save(saved);

            ChatGroupUpdatedPayload groupPayload = ChatGroupUpdatedPayload.builder()
                    .conversationId(conversationId)
                    .name(conversation.getName())
                    .avatarUrl(conversation.getAvatarUrl())
                    .operatorUsername(currentUser.getUsername())
                    .build();
            Set<Long> recipients = getActiveParticipantUserIds(conversationId);
            publishEvent(recipients, "chat:group:updated", conversationId, groupPayload);
            publishEvent(recipients, "chat:conversation:updated", conversationId, mapToConversationResponse(conversation, null));
        }

        return mapToConversationResponse(conversation, currentUser.getUserId());
    }

    @Override
    @Transactional
    public ChatConversationResponse addGroupMembers(ChatPrincipal currentUser, Long conversationId, AddGroupMembersRequest request) {
        ChatParticipant caller = findActiveParticipantOrThrow(conversationId, currentUser.getUserId());
        ChatConversation conversation = caller.getConversation();

        if (conversation.getType() != ConversationType.GROUP) {
            throw new IllegalArgumentException("Chỉ có thể thêm thành viên vào nhóm chat");
        }

        if (caller.getRole() != ParticipantRole.OWNER && caller.getRole() != ParticipantRole.ADMIN) {
            throw new ForbiddenException("Chỉ Trưởng nhóm hoặc Phó nhóm mới có quyền thêm thành viên");
        }

        if (request.getUserIds() == null || request.getUserIds().isEmpty()) {
            throw new IllegalArgumentException("Danh sách thành viên cần thêm không được để trống");
        }

        Long currentLastMsgId = (conversation.getLastMessageId() != null) ? conversation.getLastMessageId() : 0L;
        Set<Long> uniqueIds = new LinkedHashSet<>(request.getUserIds());
        List<ChatUserResponse> addedUsers = new ArrayList<>();

        List<ChatUserResponse> userList = authServiceClient.getUsersByIds(new ArrayList<>(uniqueIds));
        Map<Long, ChatUserResponse> userMap = userList.stream().collect(Collectors.toMap(ChatUserResponse::getId, u -> u));

        for (Long userId : uniqueIds) {
            if (userId == null) continue;
            ChatUserResponse targetUser = userMap.get(userId);
            if (targetUser == null) {
                targetUser = authServiceClient.getUserById(userId)
                        .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng ID: " + userId));
            }

            if (!"ACTIVE".equalsIgnoreCase(targetUser.getStatus())) {
                throw new IllegalArgumentException("Người dùng " + targetUser.getUsername() + " hiện không hoạt động");
            }

            Optional<ChatParticipant> existingOpt = participantRepository.findByConversationIdAndUserId(conversationId, userId);
            if (existingOpt.isPresent()) {
                ChatParticipant existing = existingOpt.get();
                if (existing.getStatus() == ParticipantStatus.ACTIVE) {
                    throw new IllegalArgumentException("Thành viên " + targetUser.getUsername() + " đã ở trong nhóm");
                }
                existing.setStatus(ParticipantStatus.ACTIVE);
                existing.setRole(ParticipantRole.MEMBER);
                existing.setUsername(targetUser.getUsername());
                existing.setEmail(targetUser.getEmail());
                existing.setJoinedAt(LocalDateTime.now());
                existing.setLeftAt(null);
                existing.setVisibleFromMessageId(currentLastMsgId + 1L);
                participantRepository.save(existing);
            } else {
                ChatParticipant newParticipant = ChatParticipant.builder()
                        .conversation(conversation)
                        .userId(targetUser.getId())
                        .username(targetUser.getUsername())
                        .email(targetUser.getEmail())
                        .role(ParticipantRole.MEMBER)
                        .status(ParticipantStatus.ACTIVE)
                        .visibleFromMessageId(currentLastMsgId + 1L)
                        .joinedAt(LocalDateTime.now())
                        .build();
                ChatParticipant savedP = participantRepository.save(newParticipant);
                if (conversation.getParticipants() != null) {
                    conversation.getParticipants().add(savedP);
                }
            }
            addedUsers.add(targetUser);
        }

        for (ChatUserResponse addedUser : addedUsers) {
            ChatMessage sysMsg = createAndSaveSystemMessage(
                    conversation,
                    currentUser.getUsername() + " đã thêm " + addedUser.getUsername() + " vào nhóm"
            );
            conversation.setLastMessageId(sysMsg.getId());
            conversation.setLastMessageAt(sysMsg.getCreatedAt());
        }
        conversation = conversationRepository.save(conversation);

        Set<Long> activeRecipients = getActiveParticipantUserIds(conversationId);
        List<ChatParticipantResponse> newMemberDtos = addedUsers.stream()
                .map(u -> participantRepository.findByConversationIdAndUserId(conversationId, u.getId()).orElse(null))
                .filter(Objects::nonNull)
                .map(this::mapToParticipantResponse)
                .collect(Collectors.toList());

        ChatMemberJoinedPayload joinedPayload = ChatMemberJoinedPayload.builder()
                .conversationId(conversationId)
                .operatorUsername(currentUser.getUsername())
                .newMembers(newMemberDtos)
                .build();

        publishEvent(activeRecipients, "chat:member:joined", conversationId, joinedPayload);
        publishEvent(activeRecipients, "chat:conversation:updated", conversationId, mapToConversationResponse(conversation, null));

        return mapToConversationResponse(conversation, currentUser.getUserId());
    }

    @Override
    @Transactional
    public void removeGroupMember(ChatPrincipal currentUser, Long conversationId, Long targetUserId) {
        ChatParticipant caller = findActiveParticipantOrThrow(conversationId, currentUser.getUserId());
        ChatConversation conversation = caller.getConversation();

        if (conversation.getType() != ConversationType.GROUP) {
            throw new IllegalArgumentException("Thao tác này chỉ áp dụng cho nhóm chat");
        }

        if (targetUserId == null || targetUserId.equals(currentUser.getUserId())) {
            throw new IllegalArgumentException("Không thể tự xóa chính mình khỏi nhóm, vui lòng sử dụng chức năng rời nhóm");
        }

        ChatParticipant target = participantRepository.findByConversationIdAndUserId(conversationId, targetUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy thành viên trong nhóm"));

        if (target.getStatus() != ParticipantStatus.ACTIVE) {
            throw new IllegalArgumentException("Thành viên này hiện không còn trong nhóm");
        }

        if (caller.getRole() == ParticipantRole.MEMBER) {
            throw new ForbiddenException("Bạn không có quyền xóa thành viên khỏi nhóm");
        }

        if (caller.getRole() == ParticipantRole.ADMIN) {
            if (target.getRole() == ParticipantRole.OWNER) {
                throw new ForbiddenException("Phó nhóm không thể xóa Trưởng nhóm khỏi nhóm");
            }
            if (target.getRole() == ParticipantRole.ADMIN) {
                throw new ForbiddenException("Phó nhóm không thể xóa Phó nhóm khác khỏi nhóm");
            }
        }

        target.setStatus(ParticipantStatus.REMOVED);
        target.setLeftAt(LocalDateTime.now());
        participantRepository.save(target);

        String targetName = target.getUsername() != null ? target.getUsername() : "Thành viên";
        ChatMessage sysMsg = createAndSaveSystemMessage(
                conversation,
                currentUser.getUsername() + " đã xóa " + targetName + " khỏi nhóm"
        );
        conversation.setLastMessageId(sysMsg.getId());
        conversation.setLastMessageAt(sysMsg.getCreatedAt());
        conversationRepository.save(conversation);

        Set<Long> recipients = getActiveParticipantUserIds(conversationId);
        recipients.add(targetUserId);

        ChatMemberLeftPayload leftPayload = ChatMemberLeftPayload.builder()
                .conversationId(conversationId)
                .userId(targetUserId)
                .username(targetName)
                .reason("REMOVED")
                .operatorUsername(currentUser.getUsername())
                .build();

        publishEvent(recipients, "chat:member:left", conversationId, leftPayload);
        publishEvent(recipients, "chat:message:new", conversationId, mapToMessageResponse(sysMsg, null));
        publishEvent(recipients, "chat:conversation:updated", conversationId, mapToConversationResponse(conversation, null));
    }

    @Override
    @Transactional
    public ChatParticipantResponse updateMemberRole(
            ChatPrincipal currentUser, Long conversationId, Long targetUserId, UpdateMemberRoleRequest request
    ) {
        ChatParticipant caller = findActiveParticipantOrThrow(conversationId, currentUser.getUserId());
        ChatConversation conversation = caller.getConversation();

        if (conversation.getType() != ConversationType.GROUP) {
            throw new IllegalArgumentException("Thao tác này chỉ áp dụng cho nhóm chat");
        }

        if (caller.getRole() != ParticipantRole.OWNER) {
            throw new ForbiddenException("Chỉ Trưởng nhóm mới có quyền bổ nhiệm hoặc thu hồi vai trò");
        }

        if (targetUserId == null || targetUserId.equals(currentUser.getUserId())) {
            throw new IllegalArgumentException("Không thể tự thay đổi vai trò của chính mình. Hãy dùng chức năng chuyển quyền Trưởng nhóm");
        }

        if (request.getRole() == ParticipantRole.OWNER) {
            throw new IllegalArgumentException("Không thể gán trực tiếp quyền Trưởng nhóm. Hãy sử dụng chức năng chuyển quyền Trưởng nhóm");
        }

        ChatParticipant target = participantRepository.findByConversationIdAndUserId(conversationId, targetUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy thành viên trong nhóm"));

        if (target.getStatus() != ParticipantStatus.ACTIVE) {
            throw new IllegalArgumentException("Thành viên này hiện không còn trong nhóm");
        }

        ParticipantRole oldRole = target.getRole();
        if (oldRole == request.getRole()) {
            return mapToParticipantResponse(target);
        }

        target.setRole(request.getRole());
        ChatParticipant savedTarget = participantRepository.save(target);

        String targetName = target.getUsername() != null ? target.getUsername() : "Thành viên";
        String notice = (request.getRole() == ParticipantRole.ADMIN)
                ? currentUser.getUsername() + " đã bổ nhiệm " + targetName + " làm Phó nhóm"
                : currentUser.getUsername() + " đã thu hồi quyền Phó nhóm của " + targetName;

        ChatMessage sysMsg = createAndSaveSystemMessage(conversation, notice);
        conversation.setLastMessageId(sysMsg.getId());
        conversation.setLastMessageAt(sysMsg.getCreatedAt());
        conversationRepository.save(conversation);

        Set<Long> recipients = getActiveParticipantUserIds(conversationId);
        ChatMemberRoleUpdatedPayload rolePayload = ChatMemberRoleUpdatedPayload.builder()
                .conversationId(conversationId)
                .userId(targetUserId)
                .username(targetName)
                .oldRole(oldRole)
                .newRole(request.getRole())
                .operatorUsername(currentUser.getUsername())
                .build();

        publishEvent(recipients, "chat:member:role-updated", conversationId, rolePayload);
        publishEvent(recipients, "chat:message:new", conversationId, mapToMessageResponse(sysMsg, null));
        publishEvent(recipients, "chat:conversation:updated", conversationId, mapToConversationResponse(conversation, null));

        return mapToParticipantResponse(savedTarget);
    }

    @Override
    @Transactional
    public ChatConversationResponse transferOwnership(
            ChatPrincipal currentUser, Long conversationId, TransferOwnerRequest request
    ) {
        ChatParticipant caller = findActiveParticipantOrThrow(conversationId, currentUser.getUserId());
        ChatConversation conversation = caller.getConversation();

        if (conversation.getType() != ConversationType.GROUP) {
            throw new IllegalArgumentException("Thao tác này chỉ áp dụng cho nhóm chat");
        }

        if (caller.getRole() != ParticipantRole.OWNER) {
            throw new ForbiddenException("Chỉ Trưởng nhóm hiện tại mới có quyền chuyển quyền sở hữu");
        }

        if (request.getNewOwnerUserId() == null || request.getNewOwnerUserId().equals(currentUser.getUserId())) {
            throw new IllegalArgumentException("Người nhận chuyển nhượng phải là thành viên khác trong nhóm");
        }

        ChatParticipant newOwner = participantRepository.findByConversationIdAndUserId(conversationId, request.getNewOwnerUserId())
                .orElseThrow(() -> new ResourceNotFoundException("Thành viên nhận chuyển quyền không tồn tại trong nhóm"));

        if (newOwner.getStatus() != ParticipantStatus.ACTIVE) {
            throw new IllegalArgumentException("Thành viên nhận quyền hiện không còn hoạt động trong nhóm");
        }

        caller.setRole(ParticipantRole.ADMIN);
        participantRepository.saveAndFlush(caller);

        newOwner.setRole(ParticipantRole.OWNER);
        participantRepository.saveAndFlush(newOwner);

        String newOwnerName = newOwner.getUsername() != null ? newOwner.getUsername() : "Thành viên";
        ChatMessage sysMsg = createAndSaveSystemMessage(
                conversation,
                currentUser.getUsername() + " đã chuyển quyền Trưởng nhóm cho " + newOwnerName
        );
        conversation.setLastMessageId(sysMsg.getId());
        conversation.setLastMessageAt(sysMsg.getCreatedAt());
        conversation = conversationRepository.save(conversation);

        Set<Long> recipients = getActiveParticipantUserIds(conversationId);
        ChatMemberRoleUpdatedPayload rolePayload = ChatMemberRoleUpdatedPayload.builder()
                .conversationId(conversationId)
                .userId(newOwner.getUserId())
                .username(newOwnerName)
                .oldRole(ParticipantRole.MEMBER)
                .newRole(ParticipantRole.OWNER)
                .operatorUsername(currentUser.getUsername())
                .build();

        publishEvent(recipients, "chat:member:role-updated", conversationId, rolePayload);
        publishEvent(recipients, "chat:message:new", conversationId, mapToMessageResponse(sysMsg, null));
        publishEvent(recipients, "chat:conversation:updated", conversationId, mapToConversationResponse(conversation, null));

        return mapToConversationResponse(conversation, currentUser.getUserId());
    }

    @Override
    @Transactional
    public void leaveGroup(ChatPrincipal currentUser, Long conversationId) {
        ChatParticipant caller = findActiveParticipantOrThrow(conversationId, currentUser.getUserId());
        ChatConversation conversation = caller.getConversation();

        if (conversation.getType() != ConversationType.GROUP) {
            throw new IllegalArgumentException("Thao tác này chỉ áp dụng cho nhóm chat");
        }

        if (caller.getRole() == ParticipantRole.OWNER) {
            List<ChatParticipant> activeParticipants = participantRepository.findByConversationIdAndStatus(
                    conversationId, ParticipantStatus.ACTIVE
            );
            if (activeParticipants.size() > 1) {
                throw new ForbiddenException("Trưởng nhóm phải chuyển quyền Trưởng nhóm cho thành viên khác trước khi rời nhóm");
            }
        }

        caller.setStatus(ParticipantStatus.LEFT);
        caller.setLeftAt(LocalDateTime.now());
        participantRepository.save(caller);

        ChatMessage sysMsg = createAndSaveSystemMessage(
                conversation,
                currentUser.getUsername() + " đã rời khỏi nhóm"
        );
        conversation.setLastMessageId(sysMsg.getId());
        conversation.setLastMessageAt(sysMsg.getCreatedAt());
        conversationRepository.save(conversation);

        Set<Long> recipients = getActiveParticipantUserIds(conversationId);
        recipients.add(currentUser.getUserId());

        ChatMemberLeftPayload leftPayload = ChatMemberLeftPayload.builder()
                .conversationId(conversationId)
                .userId(currentUser.getUserId())
                .username(currentUser.getUsername())
                .reason("LEFT")
                .operatorUsername(currentUser.getUsername())
                .build();

        publishEvent(recipients, "chat:member:left", conversationId, leftPayload);
        publishEvent(recipients, "chat:message:new", conversationId, mapToMessageResponse(sysMsg, null));
        publishEvent(recipients, "chat:conversation:updated", conversationId, mapToConversationResponse(conversation, null));
    }

    @Override
    @Transactional(readOnly = true)
    public List<ChatConversationResponse> getUserConversations(ChatPrincipal currentUser) {
        List<ChatConversation> list = conversationRepository.findConversationsForUser(currentUser.getUserId());

        return list.stream()
                .map(conv -> mapToConversationResponse(conv, currentUser.getUserId()))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public ChatConversationResponse getConversationDetail(ChatPrincipal currentUser, Long conversationId) {
        ChatParticipant participant = findActiveParticipantOrThrow(conversationId, currentUser.getUserId());
        return mapToConversationResponse(participant.getConversation(), currentUser.getUserId());
    }

    @Override
    @Transactional(readOnly = true)
    public CursorPageResponse<ChatMessageResponse> getMessageHistory(
            ChatPrincipal currentUser, Long conversationId, Long beforeId, int limit
    ) {
        ChatParticipant participant = findActiveParticipantOrThrow(conversationId, currentUser.getUserId());
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
                .map(m -> mapToMessageResponse(m, currentUser.getUserId()))
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
            ChatPrincipal currentUser, Long conversationId, String query, int limit
    ) {
        ChatParticipant participant = findActiveParticipantOrThrow(conversationId, currentUser.getUserId());
        int pageSize = Math.min(Math.max(limit, 1), 50);

        Long visibleFromId = (participant.getVisibleFromMessageId() != null)
                ? participant.getVisibleFromMessageId() : 0L;

        String safeQuery = (query != null) ? query.trim() : "";
        List<ChatMessage> messages = messageRepository.searchMessages(
                conversationId, visibleFromId, safeQuery, PageRequest.of(0, pageSize)
        );

        List<ChatMessageResponse> dtoList = messages.stream()
                .map(m -> mapToMessageResponse(m, currentUser.getUserId()))
                .collect(Collectors.toList());

        return CursorPageResponse.<ChatMessageResponse>builder()
                .items(dtoList)
                .nextCursor(null)
                .hasMore(false)
                .build();
    }

    @Override
    @Transactional
    public ChatMessageResponse sendMessage(ChatPrincipal currentUser, Long conversationId, SendMessageRequest request) {
        ChatParticipant participant = findActiveParticipantOrThrow(conversationId, currentUser.getUserId());
        ChatConversation conversation = participant.getConversation();

        Optional<ChatMessage> existing = messageRepository.findByConversationIdAndClientMessageId(
                conversationId, request.getClientMessageId()
        );
        if (existing.isPresent()) {
            log.info("Duplicate message send ignored for clientMessageId: {}", request.getClientMessageId());
            return mapToMessageResponse(existing.get(), currentUser.getUserId());
        }

        MessageType msgType = (request.getType() != null) ? request.getType() : MessageType.TEXT;

        ChatMessage message = ChatMessage.builder()
                .conversation(conversation)
                .senderId(currentUser.getUserId())
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
            return mapToMessageResponse(duplicate, currentUser.getUserId());
        }

        conversation.setLastMessageId(saved.getId());
        conversation.setLastMessageAt(saved.getCreatedAt());
        conversationRepository.save(conversation);

        participant.setLastReadMessageId(saved.getId());
        participant.setLastReadAt(saved.getCreatedAt());
        participantRepository.save(participant);

        publishMessageEvents(conversation, saved, currentUser.getUserId());

        return mapToMessageResponse(saved, currentUser.getUserId());
    }

    @Override
    @Transactional
    public void markAsRead(ChatPrincipal currentUser, Long conversationId, Long messageId) {
        if (messageId == null) return;
        ChatParticipant participant = findActiveParticipantOrThrow(conversationId, currentUser.getUserId());

        Long currentReadId = (participant.getLastReadMessageId() != null)
                ? participant.getLastReadMessageId() : 0L;

        if (messageId > currentReadId) {
            participant.setLastReadMessageId(messageId);
            participant.setLastReadAt(LocalDateTime.now());
            participantRepository.save(participant);

            Set<Long> otherRecipients = getActiveParticipantUserIds(conversationId).stream()
                    .filter(id -> !id.equals(currentUser.getUserId()))
                    .collect(Collectors.toSet());

            ChatReadReceiptPayload readPayload = ChatReadReceiptPayload.builder()
                    .conversationId(conversationId)
                    .userId(currentUser.getUserId())
                    .username(currentUser.getUsername())
                    .lastReadMessageId(messageId)
                    .readAt(participant.getLastReadAt() != null ? participant.getLastReadAt().toString() : LocalDateTime.now().toString())
                    .build();

            publishEvent(otherRecipients, "chat:read", conversationId, readPayload);

            sendUnreadUpdate(conversationId, currentUser.getUserId());
        }
    }

    @Override
    @Transactional(readOnly = true)
    public UnreadSummaryResponse getUnreadSummary(ChatPrincipal currentUser) {
        List<ChatParticipant> memberships = participantRepository.findActiveMembershipsByUserId(currentUser.getUserId());

        long totalUnread = 0;
        Map<Long, Long> unreadMap = new HashMap<>();

        for (ChatParticipant cp : memberships) {
            Long lastRead = (cp.getLastReadMessageId() != null) ? cp.getLastReadMessageId() : 0L;
            Long visibleFrom = (cp.getVisibleFromMessageId() != null) ? cp.getVisibleFromMessageId() : 0L;
            long count = participantRepository.countUnreadMessages(
                    cp.getConversation().getId(), lastRead, visibleFrom, currentUser.getUserId()
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

    // ==========================================
    // HELPER METHODS
    // ==========================================

    private ChatParticipant findActiveParticipantOrThrow(Long conversationId, Long userId) {
        ChatParticipant p = participantRepository.findByConversationIdAndUserId(conversationId, userId)
                .orElseThrow(() -> new ForbiddenException("Bạn không phải thành viên của cuộc trò chuyện này"));

        if (p.getStatus() != ParticipantStatus.ACTIVE) {
            throw new ForbiddenException("Bạn đã rời khỏi hoặc bị xóa khỏi cuộc trò chuyện này");
        }
        return p;
    }

    private ChatMessage createAndSaveSystemMessage(ChatConversation conv, String content) {
        ChatMessage msg = ChatMessage.builder()
                .conversation(conv)
                .senderId(null)
                .senderName("System")
                .type(MessageType.SYSTEM)
                .content(content)
                .clientMessageId("sys_" + UUID.randomUUID())
                .build();
        return messageRepository.save(msg);
    }

    private Set<Long> getActiveParticipantUserIds(Long conversationId) {
        List<ChatParticipant> list = participantRepository.findByConversationIdAndStatus(
                conversationId, ParticipantStatus.ACTIVE
        );
        return list.stream()
                .map(ChatParticipant::getUserId)
                .collect(Collectors.toSet());
    }

    private void publishMessageEvents(ChatConversation conversation, ChatMessage message, Long senderUserId) {
        Set<Long> recipientIds = getActiveParticipantUserIds(conversation.getId());
        ChatMessageResponse msgDto = mapToMessageResponse(message, null);

        publishEvent(recipientIds, "chat:message:new", conversation.getId(), msgDto);
        publishEvent(recipientIds, "chat:conversation:updated", conversation.getId(), mapToConversationResponse(conversation, null));

        for (Long recipientId : recipientIds) {
            if (!recipientId.equals(senderUserId)) {
                sendUnreadUpdate(conversation.getId(), recipientId);
            }
        }
    }

    private void sendUnreadUpdate(Long conversationId, Long targetUserId) {
        try {
            Optional<ChatParticipant> participantOpt = participantRepository
                    .findByConversationIdAndUserId(conversationId, targetUserId);
            if (participantOpt.isEmpty()) return;

            ChatParticipant p = participantOpt.get();
            Long lastRead = (p.getLastReadMessageId() != null) ? p.getLastReadMessageId() : 0L;
            Long visibleFrom = (p.getVisibleFromMessageId() != null) ? p.getVisibleFromMessageId() : 0L;

            long unreadInConv = participantRepository.countUnreadMessages(conversationId, lastRead, visibleFrom, targetUserId);

            List<ChatParticipant> activeConvs = participantRepository.findActiveMembershipsByUserId(targetUserId);
            long totalUnread = 0;
            for (ChatParticipant cp : activeConvs) {
                Long lr = (cp.getLastReadMessageId() != null) ? cp.getLastReadMessageId() : 0L;
                Long vf = (cp.getVisibleFromMessageId() != null) ? cp.getVisibleFromMessageId() : 0L;
                totalUnread += participantRepository.countUnreadMessages(cp.getConversation().getId(), lr, vf, targetUserId);
            }

            ChatUnreadUpdatePayload unreadPayload = ChatUnreadUpdatePayload.builder()
                    .conversationId(conversationId)
                    .unreadCount(unreadInConv)
                    .totalUnreadCount(totalUnread)
                    .build();

            publishEvent(Set.of(targetUserId), "chat:unread:update", conversationId, unreadPayload);
        } catch (Exception ex) {
            log.error("Failed to send unread update for user {}: {}", targetUserId, ex.getMessage());
        }
    }

    private <T> void publishEvent(Set<Long> recipientUserIds, String eventName, Long conversationId, T payload) {
        if (recipientUserIds == null || recipientUserIds.isEmpty()) return;
        ChatEvent<T> event = ChatEvent.of(eventName, conversationId, payload);
        eventPublisher.publishEvent(ChatDomainEvent.builder()
                .recipientUserIds(recipientUserIds)
                .payload(event)
                .build());
    }

    private ChatParticipantResponse mapToParticipantResponse(ChatParticipant p) {
        return ChatParticipantResponse.builder()
                .id(p.getId())
                .userId(p.getUserId())
                .username(p.getUsername())
                .email(p.getEmail())
                .role(p.getRole())
                .status(p.getStatus())
                .lastReadMessageId(p.getLastReadMessageId())
                .lastReadAt(p.getLastReadAt())
                .visibleFromMessageId(p.getVisibleFromMessageId())
                .joinedAt(p.getJoinedAt())
                .build();
    }

    private ChatMessageResponse mapToMessageResponse(ChatMessage m, Long currentUserId) {
        Long senderId = m.getSenderId();
        String senderName = m.getSenderName();

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
        List<ChatParticipant> rawParticipants = participantRepository.findByConversationId(conv.getId());
        if (rawParticipants == null || rawParticipants.isEmpty()) {
            rawParticipants = (conv.getParticipants() != null) ? conv.getParticipants() : Collections.emptyList();
        }

        List<ChatParticipantResponse> participants = rawParticipants.stream()
                .sorted((p1, p2) -> {
                    int r1 = rolePriority(p1.getRole());
                    int r2 = rolePriority(p2.getRole());
                    if (r1 != r2) return Integer.compare(r1, r2);
                    String n1 = p1.getUsername() != null ? p1.getUsername() : "";
                    String n2 = p2.getUsername() != null ? p2.getUsername() : "";
                    return n1.compareToIgnoreCase(n2);
                })
                .map(this::mapToParticipantResponse)
                .collect(Collectors.toList());

        ParticipantRole myRole = null;
        long unreadCount = 0;

        ChatParticipant myParticipant = rawParticipants.stream()
                .filter(p -> p.getUserId() != null && p.getUserId().equals(currentUserId))
                .findFirst()
                .orElse(null);

        if (myParticipant != null) {
            myRole = myParticipant.getRole();
            Long lastRead = (myParticipant.getLastReadMessageId() != null)
                    ? myParticipant.getLastReadMessageId() : 0L;
            Long visibleFrom = (myParticipant.getVisibleFromMessageId() != null)
                    ? myParticipant.getVisibleFromMessageId() : 0L;
            unreadCount = participantRepository.countUnreadMessages(conv.getId(), lastRead, visibleFrom, currentUserId);
        }

        ChatUserResponse otherUser = null;
        if (conv.getType() == ConversationType.DIRECT) {
            otherUser = rawParticipants.stream()
                    .filter(p -> p.getUserId() != null && !p.getUserId().equals(currentUserId))
                    .map(p -> ChatUserResponse.builder()
                            .id(p.getUserId())
                            .username(p.getUsername())
                            .email(p.getEmail())
                            .build())
                    .findFirst()
                    .orElse(null);
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
                lastMsgSender = lastMsg.getSenderName();
            }
        }

        return ChatConversationResponse.builder()
                .id(conv.getId())
                .type(conv.getType())
                .directKey(conv.getDirectKey())
                .name(displayName)
                .avatarUrl(conv.getAvatarUrl())
                .creatorId(conv.getCreatorId())
                .lastMessageId(conv.getLastMessageId())
                .lastMessagePreview(lastMsgPreview)
                .lastMessageAt(conv.getLastMessageAt())
                .lastMessageSenderName(lastMsgSender)
                .unreadCount(unreadCount)
                .myRole(myRole)
                .participants(participants)
                .otherParticipant(otherUser)
                .createdAt(conv.getCreatedAt())
                .updatedAt(conv.getUpdatedAt())
                .build();
    }

    private int rolePriority(ParticipantRole role) {
        if (role == null) return 99;
        return switch (role) {
            case OWNER -> 1;
            case ADMIN -> 2;
            case MEMBER -> 3;
        };
    }
}

