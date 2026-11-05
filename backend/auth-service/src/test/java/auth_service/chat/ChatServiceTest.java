package auth_service.chat;

import auth_service.chat.dto.ChatConversationResponse;
import auth_service.chat.dto.ChatMessageResponse;
import auth_service.chat.dto.ChatUserResponse;
import auth_service.chat.dto.CursorPageResponse;
import auth_service.chat.dto.UnreadSummaryResponse;
import auth_service.chat.dto.request.SendMessageRequest;
import auth_service.chat.entity.enums.ConversationType;
import auth_service.chat.service.ChatService;
import auth_service.entity.Role;
import auth_service.entity.User;
import auth_service.entity.UserStatus;
import auth_service.exception.ForbiddenException;
import auth_service.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
class ChatServiceTest {

    @Autowired
    private ChatService chatService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private User userA;
    private User userB;
    private User userC;

    @BeforeEach
    void setUp() {
        String ts = String.valueOf(System.currentTimeMillis());

        userA = userRepository.save(User.builder()
                .username("chat_user_a_" + ts)
                .email("chata_" + ts + "@crm.local")
                .password(passwordEncoder.encode("Password@123"))
                .role(Role.SALES)
                .status(UserStatus.ACTIVE)
                .createdAt(LocalDateTime.now())
                .build());

        userB = userRepository.save(User.builder()
                .username("chat_user_b_" + ts)
                .email("chatb_" + ts + "@crm.local")
                .password(passwordEncoder.encode("Password@123"))
                .role(Role.SUPPORT)
                .status(UserStatus.ACTIVE)
                .createdAt(LocalDateTime.now())
                .build());

        userC = userRepository.save(User.builder()
                .username("chat_user_c_" + ts)
                .email("chatc_" + ts + "@crm.local")
                .password(passwordEncoder.encode("Password@123"))
                .role(Role.ADMIN)
                .status(UserStatus.ACTIVE)
                .createdAt(LocalDateTime.now())
                .build());
    }

    @Test
    @DisplayName("Tạo hoặc lấy cuộc trò chuyện 1-1: Phải idempotent và không tạo trùng")
    void testGetOrCreateDirectConversation_Idempotent() {
        // User A tạo cuộc trò chuyện với User B
        ChatConversationResponse conv1 = chatService.getOrCreateDirectConversation(userA, userB.getId());
        assertNotNull(conv1);
        assertNotNull(conv1.getId());
        assertEquals(ConversationType.DIRECT, conv1.getType());

        long min = Math.min(userA.getId(), userB.getId());
        long max = Math.max(userA.getId(), userB.getId());
        assertEquals(min + "_" + max, conv1.getDirectKey());

        // Gọi lại lần 2 từ User A -> Phải trả về đúng conversationId cũ
        ChatConversationResponse conv2 = chatService.getOrCreateDirectConversation(userA, userB.getId());
        assertEquals(conv1.getId(), conv2.getId());

        // Gọi lại từ phía đối phương (User B tạo với User A) -> Cũng phải trả về đúng ID cũ
        ChatConversationResponse conv3 = chatService.getOrCreateDirectConversation(userB, userA.getId());
        assertEquals(conv1.getId(), conv3.getId());
    }

    @Test
    @DisplayName("Gửi tin nhắn có idempotency bằng clientMessageId")
    void testSendMessage_And_Idempotency() {
        ChatConversationResponse conv = chatService.getOrCreateDirectConversation(userA, userB.getId());
        String clientMsgId = UUID.randomUUID().toString();

        SendMessageRequest req = SendMessageRequest.builder()
                .content("Xin chào bạn B!")
                .clientMessageId(clientMsgId)
                .build();

        // Lần gửi 1
        ChatMessageResponse msg1 = chatService.sendMessage(userA, conv.getId(), req);
        assertNotNull(msg1);
        assertNotNull(msg1.getId());
        assertEquals("Xin chào bạn B!", msg1.getContent());
        assertEquals(userA.getId(), msg1.getSenderId());
        assertTrue(msg1.getIsMine());

        // Lần gửi 2 (giả lập mạng retry với cùng clientMessageId)
        ChatMessageResponse msg2 = chatService.sendMessage(userA, conv.getId(), req);
        assertEquals(msg1.getId(), msg2.getId(), "Cùng clientMessageId phải trả về tin nhắn hiện có, không được tạo mới");

        // Lấy lịch sử phải chỉ có đúng 1 tin nhắn duy nhất
        CursorPageResponse<ChatMessageResponse> history = chatService.getMessageHistory(userA, conv.getId(), null, 10);
        assertEquals(1, history.getItems().size());
    }

    @Test
    @DisplayName("Phân trang tin nhắn theo Cursor (beforeId)")
    void testMessageCursorPagination() {
        ChatConversationResponse conv = chatService.getOrCreateDirectConversation(userA, userB.getId());

        for (int i = 1; i <= 5; i++) {
            chatService.sendMessage(userA, conv.getId(), SendMessageRequest.builder()
                    .content("Tin nhắn số " + i)
                    .clientMessageId("client-msg-" + i + "-" + UUID.randomUUID())
                    .build());
        }

        // Trang đầu: lấy 2 tin nhắn mới nhất
        CursorPageResponse<ChatMessageResponse> page1 = chatService.getMessageHistory(userA, conv.getId(), null, 2);
        assertEquals(2, page1.getItems().size());
        assertTrue(page1.isHasMore());
        assertNotNull(page1.getNextCursor());
        assertEquals("Tin nhắn số 5", page1.getItems().get(0).getContent());
        assertEquals("Tin nhắn số 4", page1.getItems().get(1).getContent());

        // Trang tiếp theo: dùng beforeId từ nextCursor
        CursorPageResponse<ChatMessageResponse> page2 = chatService.getMessageHistory(userA, conv.getId(), page1.getNextCursor(), 2);
        assertEquals(2, page2.getItems().size());
        assertEquals("Tin nhắn số 3", page2.getItems().get(0).getContent());
        assertEquals("Tin nhắn số 2", page2.getItems().get(1).getContent());
    }

    @Test
    @DisplayName("Đánh dấu đã đọc và thống kê số tin chưa đọc (Unread Summary)")
    void testMarkAsRead_And_UnreadSummary() {
        ChatConversationResponse conv = chatService.getOrCreateDirectConversation(userA, userB.getId());

        // A gửi 2 tin nhắn cho B
        ChatMessageResponse m1 = chatService.sendMessage(userA, conv.getId(), SendMessageRequest.builder()
                .content("Tin 1")
                .clientMessageId(UUID.randomUUID().toString())
                .build());

        ChatMessageResponse m2 = chatService.sendMessage(userA, conv.getId(), SendMessageRequest.builder()
                .content("Tin 2")
                .clientMessageId(UUID.randomUUID().toString())
                .build());

        // Đối với B: Chưa đọc tin nào -> unread count phải là 2
        UnreadSummaryResponse summaryB1 = chatService.getUnreadSummary(userB);
        assertEquals(2, summaryB1.getTotalUnreadCount());
        assertEquals(2L, summaryB1.getConversationUnreadMap().get(conv.getId()));

        // Đối với A (người gửi): unread count phải là 0 vì người gửi tự động đã đọc tin của mình
        UnreadSummaryResponse summaryA = chatService.getUnreadSummary(userA);
        assertEquals(0, summaryA.getTotalUnreadCount());

        // B đánh dấu đã đọc tới tin 2
        chatService.markAsRead(userB, conv.getId(), m2.getId());

        // Kiểm tra lại: B đã đọc hết -> unread count phải về 0
        UnreadSummaryResponse summaryB2 = chatService.getUnreadSummary(userB);
        assertEquals(0, summaryB2.getTotalUnreadCount());
    }

    @Test
    @DisplayName("Bảo mật: Người không thuộc hội thoại (User C) bị chặn đọc hoặc gửi tin nhắn")
    void testForbiddenAccess_WhenNonParticipant() {
        ChatConversationResponse conv = chatService.getOrCreateDirectConversation(userA, userB.getId());

        // User C cố tình đọc tin nhắn của phòng chat giữa A và B -> Bị ném lỗi 403 Forbidden
        assertThrows(ForbiddenException.class, () -> {
            chatService.getMessageHistory(userC, conv.getId(), null, 20);
        });

        // User C cố tình gửi tin nhắn vào phòng chat của A và B -> Bị ném lỗi 403 Forbidden
        assertThrows(ForbiddenException.class, () -> {
            chatService.sendMessage(userC, conv.getId(), SendMessageRequest.builder()
                    .content("Tin nhắn đột nhập")
                    .clientMessageId(UUID.randomUUID().toString())
                    .build());
        });
    }

    @Test
    @DisplayName("Tìm kiếm nhân viên đồng nghiệp nội bộ (ACTIVE)")
    void testSearchColleagues() {
        List<ChatUserResponse> colleagues = chatService.searchColleagues(userA, "chat_user_b");
        assertFalse(colleagues.isEmpty());
        assertTrue(colleagues.stream().anyMatch(c -> c.getUsername().equals(userB.getUsername())));
        // Không chứa chính userA
        assertFalse(colleagues.stream().anyMatch(c -> c.getId().equals(userA.getId())));
    }
}
