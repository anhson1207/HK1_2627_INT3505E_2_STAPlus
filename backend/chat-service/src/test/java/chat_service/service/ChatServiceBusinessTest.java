package chat_service.service;

import chat_service.client.AuthServiceClient;
import chat_service.dto.*;
import chat_service.dto.request.*;
import chat_service.entity.enums.ConversationType;
import chat_service.entity.enums.ParticipantRole;
import chat_service.exception.ForbiddenException;
import chat_service.security.ChatPrincipal;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.when;

@SpringBootTest
@Transactional
class ChatServiceBusinessTest {

    @Autowired
    private ChatService chatService;

    @MockitoBean
    private AuthServiceClient authServiceClient;

    private ChatPrincipal userA;
    private ChatPrincipal userB;
    private ChatPrincipal userC;

    @BeforeEach
    void setUp() {
        long ts = System.currentTimeMillis();

        userA = ChatPrincipal.builder()
                .userId(ts + 100)
                .username("business_user_a")
                .email("usera_" + ts + "@crm.local")
                .role("SALES")
                .build();

        userB = ChatPrincipal.builder()
                .userId(ts + 200)
                .username("business_user_b")
                .email("userb_" + ts + "@crm.local")
                .role("SUPPORT")
                .build();

        userC = ChatPrincipal.builder()
                .userId(ts + 300)
                .username("business_user_c")
                .email("userc_" + ts + "@crm.local")
                .role("ADMIN")
                .build();

        when(authServiceClient.getUserById(anyLong())).thenAnswer(invocation -> {
            Long id = invocation.getArgument(0);
            return Optional.of(ChatUserResponse.builder()
                    .id(id)
                    .username("user_" + id)
                    .email("user_" + id + "@crm.local")
                    .role("SALES")
                    .status("ACTIVE")
                    .build());
        });
    }

    @Test
    @DisplayName("Nghiệp vụ 1-1: Idempotency khi tạo cuộc trò chuyện 1-1 từ hai chiều")
    void testDirectConversation_Idempotency() {
        ChatConversationResponse c1 = chatService.getOrCreateDirectConversation(userA, userB.getUserId());
        assertNotNull(c1);
        assertEquals(ConversationType.DIRECT, c1.getType());

        // Gọi lại từ A
        ChatConversationResponse c2 = chatService.getOrCreateDirectConversation(userA, userB.getUserId());
        assertEquals(c1.getId(), c2.getId());

        // Gọi ngược lại từ B
        ChatConversationResponse c3 = chatService.getOrCreateDirectConversation(userB, userA.getUserId());
        assertEquals(c1.getId(), c3.getId());
    }

    @Test
    @DisplayName("Nghiệp vụ Tin nhắn: Idempotency với clientMessageId không tạo tin nhắn trùng")
    void testSendMessage_Idempotency() {
        ChatConversationResponse conv = chatService.getOrCreateDirectConversation(userA, userB.getUserId());
        String clientMsgId = "msg-uuid-" + UUID.randomUUID();

        SendMessageRequest req = SendMessageRequest.builder()
                .content("Chào bạn B, kiểm thử idempotency!")
                .clientMessageId(clientMsgId)
                .build();

        ChatMessageResponse m1 = chatService.sendMessage(userA, conv.getId(), req);
        assertNotNull(m1);
        assertEquals("Chào bạn B, kiểm thử idempotency!", m1.getContent());

        // Gửi lại cùng clientMessageId (mô phỏng retry)
        ChatMessageResponse m2 = chatService.sendMessage(userA, conv.getId(), req);
        assertEquals(m1.getId(), m2.getId(), "Cùng clientMessageId phải trả về đúng tin nhắn cũ");

        CursorPageResponse<ChatMessageResponse> history = chatService.getMessageHistory(userA, conv.getId(), null, 10);
        assertEquals(1, history.getItems().size());
    }

    @Test
    @DisplayName("Nghiệp vụ Phân trang: Phân trang Cursor bằng beforeId và hasMore")
    void testMessageCursorPagination() {
        ChatConversationResponse conv = chatService.getOrCreateDirectConversation(userA, userB.getUserId());

        for (int i = 1; i <= 5; i++) {
            chatService.sendMessage(userA, conv.getId(), SendMessageRequest.builder()
                    .content("Nội dung tin nhắn " + i)
                    .clientMessageId("client-cursor-" + i + "-" + UUID.randomUUID())
                    .build());
        }

        // Lấy 2 tin nhắn mới nhất
        CursorPageResponse<ChatMessageResponse> page1 = chatService.getMessageHistory(userA, conv.getId(), null, 2);
        assertEquals(2, page1.getItems().size());
        assertTrue(page1.isHasMore());
        assertEquals("Nội dung tin nhắn 5", page1.getItems().get(0).getContent());
        assertEquals("Nội dung tin nhắn 4", page1.getItems().get(1).getContent());

        // Lấy tiếp 2 tin nhắn bằng nextCursor
        CursorPageResponse<ChatMessageResponse> page2 = chatService.getMessageHistory(userA, conv.getId(), page1.getNextCursor(), 2);
        assertEquals(2, page2.getItems().size());
        assertTrue(page2.isHasMore());
        assertEquals("Nội dung tin nhắn 3", page2.getItems().get(0).getContent());
        assertEquals("Nội dung tin nhắn 2", page2.getItems().get(1).getContent());
    }

    @Test
    @DisplayName("Nghiệp vụ Đã đọc: Đánh dấu đã đọc và thống kê Unread Summary chính xác")
    void testMarkAsRead_And_UnreadSummary() {
        ChatConversationResponse conv = chatService.getOrCreateDirectConversation(userA, userB.getUserId());

        chatService.sendMessage(userA, conv.getId(), SendMessageRequest.builder()
                .content("Tin 1 cho B")
                .clientMessageId(UUID.randomUUID().toString())
                .build());

        ChatMessageResponse m2 = chatService.sendMessage(userA, conv.getId(), SendMessageRequest.builder()
                .content("Tin 2 cho B")
                .clientMessageId(UUID.randomUUID().toString())
                .build());

        // B chưa đọc -> unread = 2
        UnreadSummaryResponse summaryB1 = chatService.getUnreadSummary(userB);
        assertEquals(2, summaryB1.getTotalUnreadCount());

        // A là người gửi -> unread = 0
        UnreadSummaryResponse summaryA = chatService.getUnreadSummary(userA);
        assertEquals(0, summaryA.getTotalUnreadCount());

        // B đọc đến m2
        chatService.markAsRead(userB, conv.getId(), m2.getId());

        // B kiểm tra lại -> unread = 0
        UnreadSummaryResponse summaryB2 = chatService.getUnreadSummary(userB);
        assertEquals(0, summaryB2.getTotalUnreadCount());
    }

    @Test
    @DisplayName("Nghiệp vụ Group Chat: Phân quyền OWNER, ADMIN, MEMBER")
    void testGroupChat_RolePermissions() {
        // A tạo nhóm gồm A và B
        CreateGroupRequest createReq = CreateGroupRequest.builder()
                .name("Nhóm Dự án Chiến lược")
                .memberIds(List.of(userB.getUserId()))
                .build();

        ChatConversationResponse group = chatService.createGroup(userA, createReq);
        assertNotNull(group);
        assertEquals(ConversationType.GROUP, group.getType());
        assertEquals("Nhóm Dự án Chiến lược", group.getName());

        // Thêm C vào nhóm
        chatService.addGroupMembers(userA, group.getId(), new AddGroupMembersRequest(List.of(userC.getUserId())));

        // Thăng cấp B lên ADMIN
        chatService.updateMemberRole(userA, group.getId(), userB.getUserId(), new UpdateMemberRoleRequest(ParticipantRole.ADMIN));

        // Chuyển quyền OWNER cho B
        chatService.transferOwnership(userA, group.getId(), new TransferOwnerRequest(userB.getUserId()));

        // Sau khi chuyển, A không còn là OWNER, nếu A cố chuyển lại lần nữa sẽ bị 403
        assertThrows(ForbiddenException.class, () -> {
            chatService.transferOwnership(userA, group.getId(), new TransferOwnerRequest(userC.getUserId()));
        });
    }

    @Test
    @DisplayName("Nghiệp vụ Lịch sử: Thành viên mới chỉ xem tin nhắn từ visibleFromMessageId")
    void testVisibleFromMessageId_Isolation() {
        CreateGroupRequest createReq = CreateGroupRequest.builder()
                .name("Nhóm Test Lịch sử")
                .memberIds(List.of(userB.getUserId()))
                .build();
        ChatConversationResponse group = chatService.createGroup(userA, createReq);

        // A gửi 2 tin nhắn trước khi C vào nhóm
        chatService.sendMessage(userA, group.getId(), SendMessageRequest.builder()
                .content("Tin nhắn bí mật số 1 trước khi C tham gia")
                .clientMessageId(UUID.randomUUID().toString())
                .build());

        ChatMessageResponse m2 = chatService.sendMessage(userA, group.getId(), SendMessageRequest.builder()
                .content("Tin nhắn bí mật số 2 trước khi C tham gia")
                .clientMessageId(UUID.randomUUID().toString())
                .build());

        // Bây giờ mới thêm C vào nhóm
        chatService.addGroupMembers(userA, group.getId(), new AddGroupMembersRequest(List.of(userC.getUserId())));

        // A gửi tiếp 1 tin nhắn sau khi C đã vào nhóm
        ChatMessageResponse m3 = chatService.sendMessage(userA, group.getId(), SendMessageRequest.builder()
                .content("Chào mừng C đã gia nhập nhóm!")
                .clientMessageId(UUID.randomUUID().toString())
                .build());

        // C lấy lịch sử tin nhắn: Phải KHÔNG THẤY tin nhắn 1 và 2 trước khi C vào nhóm
        CursorPageResponse<ChatMessageResponse> historyC = chatService.getMessageHistory(userC, group.getId(), null, 20);
        assertTrue(historyC.getItems().stream().anyMatch(m -> m.getContent().equals("Chào mừng C đã gia nhập nhóm!")));
        assertFalse(historyC.getItems().stream().anyMatch(m -> m.getContent().contains("Tin nhắn bí mật")));
    }

    @Test
    @DisplayName("Bảo mật: Người ngoài nhóm bị chặn đọc và gửi tin nhắn (403 Forbidden)")
    void testNonParticipant_Forbidden() {
        ChatConversationResponse conv = chatService.getOrCreateDirectConversation(userA, userB.getUserId());

        assertThrows(ForbiddenException.class, () -> {
            chatService.getMessageHistory(userC, conv.getId(), null, 10);
        });

        assertThrows(ForbiddenException.class, () -> {
            chatService.sendMessage(userC, conv.getId(), SendMessageRequest.builder()
                    .content("Tin nhắn đột nhập bất hợp pháp")
                    .clientMessageId(UUID.randomUUID().toString())
                    .build());
        });
    }
}
