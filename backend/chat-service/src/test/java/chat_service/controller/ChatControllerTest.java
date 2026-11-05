package chat_service.controller;

import chat_service.client.AuthServiceClient;
import chat_service.dto.ChatUserResponse;
import chat_service.dto.request.DirectConversationRequest;
import chat_service.dto.request.MarkReadRequest;
import chat_service.dto.request.SendMessageRequest;
import chat_service.security.ChatPrincipal;
import chat_service.security.JwtService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.WebApplicationContext;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.hamcrest.Matchers.*;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@Transactional
class ChatControllerTest {

    @Autowired
    private WebApplicationContext webApplicationContext;

    @Autowired
    private JwtService jwtService;

    @MockitoBean
    private AuthServiceClient authServiceClient;

    private final ObjectMapper objectMapper = new ObjectMapper();

    private MockMvc mockMvc;
    private ChatPrincipal salesUser;
    private ChatPrincipal supportUser;
    private String salesToken;
    private String supportToken;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.webAppContextSetup(webApplicationContext)
                .apply(springSecurity())
                .build();

        long ts = System.currentTimeMillis();

        salesUser = ChatPrincipal.builder()
                .userId(1000L + (ts % 1000))
                .username("sales_rep_" + ts)
                .email("sales_" + ts + "@crm.local")
                .role("SALES")
                .build();

        supportUser = ChatPrincipal.builder()
                .userId(2000L + (ts % 1000))
                .username("support_agent_" + ts)
                .email("support_" + ts + "@crm.local")
                .role("SUPPORT")
                .build();

        salesToken = "Bearer " + jwtService.generateAccessToken(salesUser);
        supportToken = "Bearer " + jwtService.generateAccessToken(supportUser);

        ChatUserResponse supportUserRes = ChatUserResponse.builder()
                .id(supportUser.getUserId())
                .username(supportUser.getUsername())
                .email(supportUser.getEmail())
                .role("SUPPORT")
                .status("ACTIVE")
                .build();

        ChatUserResponse salesUserRes = ChatUserResponse.builder()
                .id(salesUser.getUserId())
                .username(salesUser.getUsername())
                .email(salesUser.getEmail())
                .role("SALES")
                .status("ACTIVE")
                .build();

        Mockito.when(authServiceClient.getColleagues(Mockito.anyString()))
                .thenReturn(List.of(supportUserRes));

        Mockito.when(authServiceClient.getUserById(supportUser.getUserId()))
                .thenReturn(Optional.of(supportUserRes));

        Mockito.when(authServiceClient.getUserById(salesUser.getUserId()))
                .thenReturn(Optional.of(salesUserRes));
    }

    @Test
    @DisplayName("API: GET /api/v1/chat/users - Nhân viên tìm kiếm đồng nghiệp")
    void testSearchColleaguesEndpoint() throws Exception {
        mockMvc.perform(get("/api/v1/chat/users")
                        .header("Authorization", salesToken)
                        .param("search", "support_agent"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", isA(List.class)))
                .andExpect(jsonPath("$[?(@.id == " + supportUser.getUserId() + ")].username").value(supportUser.getUsername()));
    }

    @Test
    @DisplayName("API: POST /api/v1/chat/conversations/direct - Tạo hội thoại 1-1")
    void testCreateDirectConversationEndpoint() throws Exception {
        DirectConversationRequest req = new DirectConversationRequest(supportUser.getUserId());

        mockMvc.perform(post("/api/v1/chat/conversations/direct")
                        .header("Authorization", salesToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").isNumber())
                .andExpect(jsonPath("$.type").value("DIRECT"))
                .andExpect(jsonPath("$.otherParticipant.id").value(supportUser.getUserId()));
    }

    @Test
    @DisplayName("API: POST & GET messages - Gửi tin nhắn và lấy lịch sử tin nhắn")
    void testSendAndGetMessagesEndpoint() throws Exception {
        DirectConversationRequest directReq = new DirectConversationRequest(supportUser.getUserId());
        String convJson = mockMvc.perform(post("/api/v1/chat/conversations/direct")
                        .header("Authorization", salesToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(directReq)))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();

        Long convId = objectMapper.readTree(convJson).get("id").asLong();

        SendMessageRequest sendReq = SendMessageRequest.builder()
                .content("Chào bạn Support!")
                .clientMessageId(UUID.randomUUID().toString())
                .build();

        String msgJson = mockMvc.perform(post("/api/v1/chat/conversations/{id}/messages", convId)
                        .header("Authorization", salesToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(sendReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").isNumber())
                .andExpect(jsonPath("$.content").value("Chào bạn Support!"))
                .andReturn().getResponse().getContentAsString();

        Long msgId = objectMapper.readTree(msgJson).get("id").asLong();

        mockMvc.perform(get("/api/v1/chat/conversations/{id}/messages", convId)
                        .header("Authorization", supportToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items", hasSize(1)))
                .andExpect(jsonPath("$.items[0].content").value("Chào bạn Support!"))
                .andExpect(jsonPath("$.items[0].isMine").value(false));

        MarkReadRequest readReq = new MarkReadRequest(msgId);
        mockMvc.perform(post("/api/v1/chat/conversations/{id}/read", convId)
                        .header("Authorization", supportToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(readReq)))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/v1/chat/unread-summary")
                        .header("Authorization", supportToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalUnreadCount").value(0));
    }

    @Test
    @DisplayName("API: 401 Unauthorized khi truy cập mà không có token")
    void testUnauthorizedWhenNoToken() throws Exception {
        mockMvc.perform(get("/api/v1/chat/conversations"))
                .andExpect(status().isUnauthorized());
    }
}

