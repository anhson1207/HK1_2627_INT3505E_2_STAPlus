package chat_service.controller;

import chat_service.dto.*;
import chat_service.dto.request.*;
import chat_service.security.ChatPrincipal;
import chat_service.service.ChatAttachmentService;
import chat_service.service.ChatService;
import chat_service.ws.dto.WsTicketResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/v1/chat")
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;
    private final ChatAttachmentService attachmentService;

    private ChatPrincipal requireUser(ChatPrincipal currentUser) {
        if (currentUser == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Yêu cầu đăng nhập để truy cập tài nguyên này.");
        }
        return currentUser;
    }

    /**
     * Tìm kiếm danh sách nhân viên nội bộ (ACTIVE) để bắt đầu cuộc trò chuyện
     */
    @GetMapping("/users")
    public ResponseEntity<List<ChatUserResponse>> searchUsers(
            @AuthenticationPrincipal ChatPrincipal currentUser,
            @RequestParam(value = "search", required = false) String search
    ) {
        ChatPrincipal user = requireUser(currentUser);
        return ResponseEntity.ok(chatService.searchColleagues(user, search));
    }

    /**
     * Bắt đầu hoặc lấy lại cuộc trò chuyện 1-1 sẵn có
     */
    @PostMapping("/conversations/direct")
    public ResponseEntity<ChatConversationResponse> getOrCreateDirectConversation(
            @AuthenticationPrincipal ChatPrincipal currentUser,
            @Valid @RequestBody DirectConversationRequest request
    ) {
        ChatPrincipal user = requireUser(currentUser);
        ChatConversationResponse response = chatService.getOrCreateDirectConversation(user, request.getRecipientUserId());
        return ResponseEntity.status(HttpStatus.OK).body(response);
    }

    /**
     * Tạo nhóm chat mới
     */
    @PostMapping("/conversations/group")
    public ResponseEntity<ChatConversationResponse> createGroup(
            @AuthenticationPrincipal ChatPrincipal currentUser,
            @Valid @RequestBody CreateGroupRequest request
    ) {
        ChatPrincipal user = requireUser(currentUser);
        ChatConversationResponse response = chatService.createGroup(user, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Cập nhật thông tin nhóm (Tên nhóm, ảnh đại diện)
     */
    @PatchMapping("/conversations/{id}/info")
    public ResponseEntity<ChatConversationResponse> updateGroupInfo(
            @AuthenticationPrincipal ChatPrincipal currentUser,
            @PathVariable("id") Long conversationId,
            @Valid @RequestBody UpdateGroupInfoRequest request
    ) {
        ChatPrincipal user = requireUser(currentUser);
        return ResponseEntity.ok(chatService.updateGroupInfo(user, conversationId, request));
    }

    /**
     * Thêm thành viên vào nhóm chat
     */
    @PostMapping("/conversations/{id}/members")
    public ResponseEntity<ChatConversationResponse> addGroupMembers(
            @AuthenticationPrincipal ChatPrincipal currentUser,
            @PathVariable("id") Long conversationId,
            @Valid @RequestBody AddGroupMembersRequest request
    ) {
        ChatPrincipal user = requireUser(currentUser);
        return ResponseEntity.ok(chatService.addGroupMembers(user, conversationId, request));
    }

    /**
     * Xóa thành viên khỏi nhóm chat
     */
    @DeleteMapping("/conversations/{id}/members/{userId}")
    public ResponseEntity<Void> removeGroupMember(
            @AuthenticationPrincipal ChatPrincipal currentUser,
            @PathVariable("id") Long conversationId,
            @PathVariable("userId") Long targetUserId
    ) {
        ChatPrincipal user = requireUser(currentUser);
        chatService.removeGroupMember(user, conversationId, targetUserId);
        return ResponseEntity.noContent().build();
    }

    /**
     * Phân quyền vai trò thành viên (ADMIN, MEMBER)
     */
    @PatchMapping("/conversations/{id}/members/{userId}/role")
    public ResponseEntity<ChatParticipantResponse> updateMemberRole(
            @AuthenticationPrincipal ChatPrincipal currentUser,
            @PathVariable("id") Long conversationId,
            @PathVariable("userId") Long targetUserId,
            @Valid @RequestBody UpdateMemberRoleRequest request
    ) {
        ChatPrincipal user = requireUser(currentUser);
        return ResponseEntity.ok(chatService.updateMemberRole(user, conversationId, targetUserId, request));
    }

    /**
     * Chuyển quyền Trưởng nhóm (OWNER) cho thành viên khác
     */
    @PostMapping("/conversations/{id}/transfer-owner")
    public ResponseEntity<ChatConversationResponse> transferOwnership(
            @AuthenticationPrincipal ChatPrincipal currentUser,
            @PathVariable("id") Long conversationId,
            @Valid @RequestBody TransferOwnerRequest request
    ) {
        ChatPrincipal user = requireUser(currentUser);
        return ResponseEntity.ok(chatService.transferOwnership(user, conversationId, request));
    }

    /**
     * Rời nhóm chat
     */
    @PostMapping("/conversations/{id}/leave")
    public ResponseEntity<Void> leaveGroup(
            @AuthenticationPrincipal ChatPrincipal currentUser,
            @PathVariable("id") Long conversationId
    ) {
        ChatPrincipal user = requireUser(currentUser);
        chatService.leaveGroup(user, conversationId);
        return ResponseEntity.noContent().build();
    }

    /**
     * Lấy danh sách hội thoại của người dùng hiện tại
     */
    @GetMapping("/conversations")
    public ResponseEntity<List<ChatConversationResponse>> getUserConversations(
            @AuthenticationPrincipal ChatPrincipal currentUser
    ) {
        ChatPrincipal user = requireUser(currentUser);
        return ResponseEntity.ok(chatService.getUserConversations(user));
    }

    /**
     * Lấy chi tiết thông tin cuộc trò chuyện
     */
    @GetMapping("/conversations/{id}")
    public ResponseEntity<ChatConversationResponse> getConversationDetail(
            @AuthenticationPrincipal ChatPrincipal currentUser,
            @PathVariable("id") Long conversationId
    ) {
        ChatPrincipal user = requireUser(currentUser);
        return ResponseEntity.ok(chatService.getConversationDetail(user, conversationId));
    }

    /**
     * Lấy lịch sử tin nhắn của cuộc trò chuyện (Cursor Pagination)
     */
    @GetMapping("/conversations/{id}/messages")
    public ResponseEntity<CursorPageResponse<ChatMessageResponse>> getMessageHistory(
            @AuthenticationPrincipal ChatPrincipal currentUser,
            @PathVariable("id") Long conversationId,
            @RequestParam(value = "beforeId", required = false) Long beforeId,
            @RequestParam(value = "limit", defaultValue = "20") int limit
    ) {
        ChatPrincipal user = requireUser(currentUser);
        return ResponseEntity.ok(chatService.getMessageHistory(user, conversationId, beforeId, limit));
    }

    /**
     * Tìm kiếm nội dung tin nhắn trong cuộc trò chuyện
     */
    @GetMapping("/conversations/{id}/messages/search")
    public ResponseEntity<CursorPageResponse<ChatMessageResponse>> searchMessages(
            @AuthenticationPrincipal ChatPrincipal currentUser,
            @PathVariable("id") Long conversationId,
            @RequestParam("q") String query,
            @RequestParam(value = "limit", defaultValue = "20") int limit
    ) {
        ChatPrincipal user = requireUser(currentUser);
        return ResponseEntity.ok(chatService.searchMessages(user, conversationId, query, limit));
    }

    /**
     * Gửi tin nhắn mới trong cuộc trò chuyện (Hỗ trợ idempotency bằng clientMessageId)
     */
    @PostMapping("/conversations/{id}/messages")
    public ResponseEntity<ChatMessageResponse> sendMessage(
            @AuthenticationPrincipal ChatPrincipal currentUser,
            @PathVariable("id") Long conversationId,
            @Valid @RequestBody SendMessageRequest request
    ) {
        ChatPrincipal user = requireUser(currentUser);
        ChatMessageResponse response = chatService.sendMessage(user, conversationId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Đánh dấu đã đọc tới tin nhắn cụ thể
     */
    @PostMapping("/conversations/{id}/read")
    public ResponseEntity<Void> markAsRead(
            @AuthenticationPrincipal ChatPrincipal currentUser,
            @PathVariable("id") Long conversationId,
            @Valid @RequestBody MarkReadRequest request
    ) {
        ChatPrincipal user = requireUser(currentUser);
        chatService.markAsRead(user, conversationId, request.getMessageId());
        return ResponseEntity.noContent().build();
    }

    /**
     * Thống kê tổng số tin nhắn chưa đọc của người dùng
     */
    @GetMapping("/unread-summary")
    public ResponseEntity<UnreadSummaryResponse> getUnreadSummary(
            @AuthenticationPrincipal ChatPrincipal currentUser
    ) {
        ChatPrincipal user = requireUser(currentUser);
        return ResponseEntity.ok(chatService.getUnreadSummary(user));
    }

    /**
     * Tạo Single-Use WebSocket Ticket để xác thực kết nối WebSocket STOMP
     */
    @PostMapping("/ws-ticket")
    public ResponseEntity<WsTicketResponse> createWsTicket(
            @AuthenticationPrincipal ChatPrincipal currentUser
    ) {
        ChatPrincipal user = requireUser(currentUser);
        return ResponseEntity.ok(chatService.createWsTicket(user));
    }

    /**
     * Tải lên hình ảnh hoặc tài liệu đính kèm cho cuộc trò chuyện (tối đa 10MB)
     */
    @PostMapping(value = "/conversations/{conversationId}/files", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ChatAttachmentResponse> uploadFile(
            @PathVariable Long conversationId,
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal ChatPrincipal currentUser
    ) {
        ChatPrincipal user = requireUser(currentUser);
        ChatAttachmentResponse response = attachmentService.uploadAttachment(conversationId, file, user);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Tải về hoặc xem trực tiếp tệp đính kèm (có xác thực quyền thành viên hội thoại)
     */
    @GetMapping("/files/{attachmentId}")
    public ResponseEntity<Resource> downloadFile(
            @PathVariable Long attachmentId,
            @AuthenticationPrincipal ChatPrincipal currentUser
    ) {
        ChatPrincipal user = requireUser(currentUser);
        var attachment = attachmentService.getAttachment(attachmentId, user);
        Resource resource = attachmentService.loadAttachmentResource(attachmentId, user);

        String dispositionType = attachment.getContentType().startsWith("image/") ? "inline" : "attachment";

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(attachment.getContentType()))
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        dispositionType + "; filename=\"" + attachment.getOriginalFilename().replace("\"", "\\\"") + "\"")
                .header("X-Content-Type-Options", "nosniff")
                .body(resource);
    }
}

