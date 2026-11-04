package auth_service.chat;

import auth_service.chat.dto.request.DirectConversationRequest;
import auth_service.chat.dto.request.MarkReadRequest;
import auth_service.chat.dto.request.SendMessageRequest;
import auth_service.entity.Role;
import auth_service.entity.User;
import auth_service.entity.UserStatus;
import auth_service.jwt.JwtService;
import auth_service.repository.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.WebApplicationContext;

import java.time.LocalDateTime;
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
    private UserRepository userRepository;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private final ObjectMapper objectMapper = new ObjectMapper();

    private MockMvc mockMvc;
    private User salesUser;
    private User supportUser;
    private String salesToken;
    private String supportToken;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.webAppContextSetup(webApplicationContext)
                .apply(springSecurity())
                .build();

        String ts = String.valueOf(System.currentTimeMillis());

        salesUser = userRepository.save(User.builder()
                .username("sales_rep_" + ts)
                .email("sales_" + ts + "@crm.local")
                .password(passwordEncoder.encode("Sales@123"))
                .role(Role.SALES)
                .status(UserStatus.ACTIVE)
                .createdAt(LocalDateTime.now())
                .build());

        supportUser = userRepository.save(User.builder()
                .username("support_agent_" + ts)
                .email("support_" + ts + "@crm.local")
                .password(passwordEncoder.encode("Support@123"))
                .role(Role.SUPPORT)
                .status(UserStatus.ACTIVE)
                .createdAt(LocalDateTime.now())
                .build());

        salesToken = "Bearer " + jwtService.generateAccessToken(salesUser);
        supportToken = "Bearer " + jwtService.generateAccessToken(supportUser);
    }

    @Test
    @DisplayName("API: GET /api/v1/chat/users - Nhân viên tìm kiếm đồng nghiệp")
    void testSearchColleaguesEndpoint() throws Exception {
        mockMvc.perform(get("/api/v1/chat/users")
                        .header("Authorization", salesToken)
                        .param("search", "support_agent"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", isA(java.util.List.class)))
                .andExpect(jsonPath("$[?(@.id == " + supportUser.getId() + ")].username").value(supportUser.getUsername()));
    }

    @Test
    @DisplayName("API: POST /api/v1/chat/conversations/direct - Tạo hội thoại 1-1")
    void testCreateDirectConversationEndpoint() throws Exception {
        DirectConversationRequest req = new DirectConversationRequest(supportUser.getId());

        mockMvc.perform(post("/api/v1/chat/conversations/direct")
                        .header("Authorization", salesToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").isNumber())
                .andExpect(jsonPath("$.type").value("DIRECT"))
                .andExpect(jsonPath("$.otherParticipant.id").value(supportUser.getId()));
    }

    @Test
    @DisplayName("API: POST & GET messages - Gửi tin nhắn và lấy lịch sử tin nhắn")
    void testSendAndGetMessagesEndpoint() throws Exception {
        // 1. Tạo hội thoại
        DirectConversationRequest directReq = new DirectConversationRequest(supportUser.getId());
        String convJson = mockMvc.perform(post("/api/v1/chat/conversations/direct")
                        .header("Authorization", salesToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(directReq)))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();

        Long convId = objectMapper.readTree(convJson).get("id").asLong();

        // 2. Gửi tin nhắn
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

        // 3. Lấy lịch sử tin nhắn từ phía support
        mockMvc.perform(get("/api/v1/chat/conversations/{id}/messages", convId)
                        .header("Authorization", supportToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items", hasSize(1)))
                .andExpect(jsonPath("$.items[0].content").value("Chào bạn Support!"))
                .andExpect(jsonPath("$.items[0].isMine").value(false));

        // 4. Đánh dấu đã đọc
        MarkReadRequest readReq = new MarkReadRequest(msgId);
        mockMvc.perform(post("/api/v1/chat/conversations/{id}/read", convId)
                        .header("Authorization", supportToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(readReq)))
                .andExpect(status().isNoContent());

        // 5. Kiểm tra unread summary của support -> phải là 0
        mockMvc.perform(get("/api/v1/chat/unread-summary")
                        .header("Authorization", supportToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalUnreadCount").value(0));
    }

    @Test
    @DisplayName("API: 403 Forbidden khi truy cập mà không có token")
    void testUnauthorizedWhenNoToken() throws Exception {
        mockMvc.perform(get("/api/v1/chat/conversations"))
                .andExpect(status().isForbidden());
    }
}
