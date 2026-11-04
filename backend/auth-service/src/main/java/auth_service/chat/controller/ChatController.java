package auth_service.chat.controller;

import auth_service.chat.dto.*;
import auth_service.chat.dto.request.DirectConversationRequest;
import auth_service.chat.dto.request.MarkReadRequest;
import auth_service.chat.dto.request.SendMessageRequest;
import auth_service.chat.service.ChatService;
import auth_service.entity.User;
import auth_service.exception.ForbiddenException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/chat")
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;

    private User requireUser(User currentUser) {
        if (currentUser == null) {
            throw new ForbiddenException("Phiên đăng nhập không hợp lệ hoặc đã hết hạn");
        }
        return currentUser;
    }

    /**
     * Tìm kiếm danh sách nhân viên nội bộ (ACTIVE) để bắt đầu cuộc trò chuyện
     */
    @GetMapping("/users")
    public ResponseEntity<List<ChatUserResponse>> searchUsers(
            @AuthenticationPrincipal User currentUser,
            @RequestParam(value = "search", required = false) String search
    ) {
        User user = requireUser(currentUser);
        return ResponseEntity.ok(chatService.searchColleagues(user, search));
    }

    /**
     * Bắt đầu hoặc lấy lại cuộc trò chuyện 1-1 sẵn có
     */
    @PostMapping("/conversations/direct")
    public ResponseEntity<ChatConversationResponse> getOrCreateDirectConversation(
            @AuthenticationPrincipal User currentUser,
            @Valid @RequestBody DirectConversationRequest request
    ) {
        User user = requireUser(currentUser);
        ChatConversationResponse response = chatService.getOrCreateDirectConversation(user, request.getRecipientUserId());
        return ResponseEntity.status(HttpStatus.OK).body(response);
    }

    /**
     * Lấy danh sách hội thoại của người dùng hiện tại
     */
    @GetMapping("/conversations")
    public ResponseEntity<List<ChatConversationResponse>> getUserConversations(
            @AuthenticationPrincipal User currentUser
    ) {
        User user = requireUser(currentUser);
        return ResponseEntity.ok(chatService.getUserConversations(user));
    }

    /**
     * Lấy chi tiết thông tin cuộc trò chuyện
     */
    @GetMapping("/conversations/{id}")
    public ResponseEntity<ChatConversationResponse> getConversationDetail(
            @AuthenticationPrincipal User currentUser,
            @PathVariable("id") Long conversationId
    ) {
        User user = requireUser(currentUser);
        return ResponseEntity.ok(chatService.getConversationDetail(user, conversationId));
    }

    /**
     * Lấy lịch sử tin nhắn của cuộc trò chuyện (Cursor Pagination)
     */
    @GetMapping("/conversations/{id}/messages")
    public ResponseEntity<CursorPageResponse<ChatMessageResponse>> getMessageHistory(
            @AuthenticationPrincipal User currentUser,
            @PathVariable("id") Long conversationId,
            @RequestParam(value = "beforeId", required = false) Long beforeId,
            @RequestParam(value = "limit", defaultValue = "20") int limit
    ) {
        User user = requireUser(currentUser);
        return ResponseEntity.ok(chatService.getMessageHistory(user, conversationId, beforeId, limit));
    }

    /**
     * Tìm kiếm nội dung tin nhắn trong cuộc trò chuyện
     */
    @GetMapping("/conversations/{id}/messages/search")
    public ResponseEntity<CursorPageResponse<ChatMessageResponse>> searchMessages(
            @AuthenticationPrincipal User currentUser,
            @PathVariable("id") Long conversationId,
            @RequestParam("q") String query,
            @RequestParam(value = "limit", defaultValue = "20") int limit
    ) {
        User user = requireUser(currentUser);
        return ResponseEntity.ok(chatService.searchMessages(user, conversationId, query, limit));
    }

    /**
     * Gửi tin nhắn mới trong cuộc trò chuyện (Hỗ trợ idempotency bằng clientMessageId)
     */
    @PostMapping("/conversations/{id}/messages")
    public ResponseEntity<ChatMessageResponse> sendMessage(
            @AuthenticationPrincipal User currentUser,
            @PathVariable("id") Long conversationId,
            @Valid @RequestBody SendMessageRequest request
    ) {
        User user = requireUser(currentUser);
        ChatMessageResponse response = chatService.sendMessage(user, conversationId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Đánh dấu đã đọc tới tin nhắn cụ thể
     */
    @PostMapping("/conversations/{id}/read")
    public ResponseEntity<Void> markAsRead(
            @AuthenticationPrincipal User currentUser,
            @PathVariable("id") Long conversationId,
            @Valid @RequestBody MarkReadRequest request
    ) {
        User user = requireUser(currentUser);
        chatService.markAsRead(user, conversationId, request.getMessageId());
        return ResponseEntity.noContent().build();
    }

    /**
     * Thống kê tổng số tin nhắn chưa đọc của người dùng
     */
    @GetMapping("/unread-summary")
    public ResponseEntity<UnreadSummaryResponse> getUnreadSummary(
            @AuthenticationPrincipal User currentUser
    ) {
        User user = requireUser(currentUser);
        return ResponseEntity.ok(chatService.getUnreadSummary(user));
    }
}
