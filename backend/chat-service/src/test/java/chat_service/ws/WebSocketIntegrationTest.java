package chat_service.ws;

import chat_service.client.AuthServiceClient;
import chat_service.dto.ChatConversationResponse;
import chat_service.dto.ChatMessageResponse;
import chat_service.dto.ChatUserResponse;
import chat_service.dto.request.CreateGroupRequest;
import chat_service.dto.request.SendMessageRequest;
import chat_service.entity.enums.MessageType;
import chat_service.security.ChatPrincipal;
import chat_service.service.ChatService;
import chat_service.ws.dto.WsTicketResponse;
import chat_service.ws.event.ChatEvent;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.messaging.converter.MappingJackson2MessageConverter;
import org.springframework.messaging.simp.stomp.*;
import org.springframework.web.socket.client.standard.StandardWebSocketClient;
import org.springframework.web.socket.messaging.WebSocketStompClient;

import java.lang.reflect.Type;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.*;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class WebSocketIntegrationTest {

    @LocalServerPort
    private int port;

    @Autowired
    private ChatService chatService;

    @MockitoBean
    private AuthServiceClient authServiceClient;

    private ChatPrincipal userA;
    private ChatPrincipal userB;
    private ChatPrincipal userC;
    private ChatPrincipal outsideUser;

    private WebSocketStompClient stompClient;

    @BeforeEach
    void setUp() {
        stompClient = new WebSocketStompClient(new StandardWebSocketClient());
        ObjectMapper mapper = new ObjectMapper();
        mapper.registerModule(new JavaTimeModule());
        MappingJackson2MessageConverter converter = new MappingJackson2MessageConverter();
        converter.setObjectMapper(mapper);
        stompClient.setMessageConverter(converter);

        long ts = System.currentTimeMillis();

        userA = ChatPrincipal.builder()
                .userId(7001L + (ts % 1000))
                .username("ws_user_a_" + ts)
                .email("wsa_" + ts + "@crm.local")
                .role("ADMIN")
                .build();

        userB = ChatPrincipal.builder()
                .userId(8001L + (ts % 1000))
                .username("ws_user_b_" + ts)
                .email("wsb_" + ts + "@crm.local")
                .role("SALES")
                .build();

        userC = ChatPrincipal.builder()
                .userId(9001L + (ts % 1000))
                .username("ws_user_c_" + ts)
                .email("wsc_" + ts + "@crm.local")
                .role("SUPPORT")
                .build();

        outsideUser = ChatPrincipal.builder()
                .userId(9501L + (ts % 1000))
                .username("ws_outside_" + ts)
                .email("wsout_" + ts + "@crm.local")
                .role("SALES")
                .build();

        List<ChatUserResponse> mockUsers = List.of(
                toResponse(userA),
                toResponse(userB),
                toResponse(userC),
                toResponse(outsideUser)
        );

        Mockito.when(authServiceClient.getUserById(userA.getUserId())).thenReturn(Optional.of(toResponse(userA)));
        Mockito.when(authServiceClient.getUserById(userB.getUserId())).thenReturn(Optional.of(toResponse(userB)));
        Mockito.when(authServiceClient.getUserById(userC.getUserId())).thenReturn(Optional.of(toResponse(userC)));
        Mockito.when(authServiceClient.getUserById(outsideUser.getUserId())).thenReturn(Optional.of(toResponse(outsideUser)));

        Mockito.when(authServiceClient.getUsersByIds(Mockito.anyList())).thenAnswer(invocation -> {
            List<Long> ids = invocation.getArgument(0);
            return mockUsers.stream().filter(u -> ids.contains(u.getId())).toList();
        });
    }

    private ChatUserResponse toResponse(ChatPrincipal p) {
        return ChatUserResponse.builder()
                .id(p.getUserId())
                .username(p.getUsername())
                .email(p.getEmail())
                .role(p.getRole())
                .status("ACTIVE")
                .build();
    }

    @AfterEach
    void tearDown() {
        if (stompClient != null) {
            stompClient.stop();
        }
    }

    private StompSession connectWithTicket(String ticket) throws Exception {
        String url = "ws://localhost:" + port + "/ws/chat?ticket=" + ticket;
        return stompClient.connectAsync(url, new StompSessionHandlerAdapter() {
            @Override
            public void handleException(StompSession session, StompCommand command, StompHeaders headers, byte[] payload, Throwable exception) {
                System.err.println("STOMP CLIENT EXCEPTION: " + exception.getMessage());
            }

            @Override
            public void handleTransportError(StompSession session, Throwable exception) {
                System.err.println("STOMP TRANSPORT ERROR: " + exception.getMessage());
            }
        }).get(5, TimeUnit.SECONDS);
    }

    private StompFrameHandler createHandler(BlockingQueue<ChatEvent<?>> queue) {
        return new StompFrameHandler() {
            @Override
            public Type getPayloadType(StompHeaders headers) {
                return ChatEvent.class;
            }

            @Override
            public void handleFrame(StompHeaders headers, Object payload) {
                queue.offer((ChatEvent<?>) payload);
            }
        };
    }

    private ChatEvent<?> pollEvent(BlockingQueue<ChatEvent<?>> queue, String eventName) throws InterruptedException {
        long deadline = System.currentTimeMillis() + 5000;
        while (System.currentTimeMillis() < deadline) {
            ChatEvent<?> ev = queue.poll(1, TimeUnit.SECONDS);
            if (ev != null && eventName.equals(ev.getEvent())) {
                return ev;
            }
        }
        return null;
    }

    @Test
    @DisplayName("WebSocket Handshake: Kết nối thành công bằng Single-Use Ticket hợp lệ")
    void testConnect_SuccessWithValidTicket() throws Exception {
        WsTicketResponse ticketRes = chatService.createWsTicket(userA);
        assertNotNull(ticketRes.getTicket());

        StompSession session = connectWithTicket(ticketRes.getTicket());
        assertNotNull(session);
        assertTrue(session.isConnected());

        session.disconnect();
    }

    @Test
    @DisplayName("WebSocket Handshake: Từ chối ticket đã dùng hoặc không hợp lệ")
    void testConnect_ReusedTicket_Rejected() throws Exception {
        WsTicketResponse ticketRes = chatService.createWsTicket(userA);

        StompSession session1 = connectWithTicket(ticketRes.getTicket());
        assertTrue(session1.isConnected());
        session1.disconnect();

        assertThrows(Exception.class, () -> connectWithTicket(ticketRes.getTicket()));
        assertThrows(Exception.class, () -> connectWithTicket("fake_invalid_ticket"));
    }

    @Test
    @DisplayName("Real-time 1-1 Chat: User A gửi tin nhắn qua REST API -> User B nhận tin qua WebSocket")
    void testRealTime_DirectChat() throws Exception {
        ChatConversationResponse conv = chatService.getOrCreateDirectConversation(userA, userB.getUserId());

        WsTicketResponse ticketB = chatService.createWsTicket(userB);
        StompSession sessionB = connectWithTicket(ticketB.getTicket());

        BlockingQueue<ChatEvent<?>> receivedEventsB = new LinkedBlockingQueue<>();
        sessionB.subscribe("/user/queue/events", createHandler(receivedEventsB));

        Thread.sleep(300);

        String msgContent = "Xin chào B, đây là tin nhắn real-time!";
        SendMessageRequest sendReq = SendMessageRequest.builder()
                .content(msgContent)
                .clientMessageId(UUID.randomUUID().toString())
                .type(MessageType.TEXT)
                .build();

        chatService.sendMessage(userA, conv.getId(), sendReq);

        ChatEvent<?> targetEvent = pollEvent(receivedEventsB, "chat:message:new");

        assertNotNull(targetEvent, "User B phải nhận được sự kiện chat:message:new qua WebSocket");
        assertEquals(conv.getId(), targetEvent.getConversationId());

        sessionB.disconnect();
    }

    @Test
    @DisplayName("Real-time Group Chat: Thành viên trong nhóm nhận tin nhắn, người ngoài nhóm KHÔNG nhận được")
    void testRealTime_GroupChat_Isolation() throws Exception {
        ChatConversationResponse group = chatService.createGroup(userA, CreateGroupRequest.builder()
                .name("Nhóm Test Real-time")
                .memberIds(List.of(userB.getUserId(), userC.getUserId()))
                .build());

        StompSession sessionB = connectWithTicket(chatService.createWsTicket(userB).getTicket());
        StompSession sessionOut = connectWithTicket(chatService.createWsTicket(outsideUser).getTicket());

        BlockingQueue<ChatEvent<?>> queueB = new LinkedBlockingQueue<>();
        BlockingQueue<ChatEvent<?>> queueOut = new LinkedBlockingQueue<>();

        sessionB.subscribe("/user/queue/events", createHandler(queueB));
        sessionOut.subscribe("/user/queue/events", createHandler(queueOut));

        Thread.sleep(300);

        chatService.sendMessage(userA, group.getId(), SendMessageRequest.builder()
                .content("Tin nhắn nhóm cho các thành viên")
                .clientMessageId(UUID.randomUUID().toString())
                .type(MessageType.TEXT)
                .build());

        ChatEvent<?> eventB = pollEvent(queueB, "chat:message:new");
        assertNotNull(eventB, "userB phải nhận được sự kiện chat:message:new");

        ChatEvent<?> eventOut = queueOut.poll(1, TimeUnit.SECONDS);
        assertNull(eventOut, "Người ngoài nhóm không được phép nhận tin nhắn của nhóm");

        sessionB.disconnect();
        sessionOut.disconnect();
    }
}

