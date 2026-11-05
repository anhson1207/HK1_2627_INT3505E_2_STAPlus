package chat_service.security;

import chat_service.client.AuthServiceClient;
import chat_service.dto.ChatUserResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.WebApplicationContext;

import java.util.Optional;

import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@Transactional
class DisabledUserChatSecurityTest {

    @Autowired
    private WebApplicationContext webApplicationContext;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private UserStatusService userStatusService;

    @MockitoBean
    private AuthServiceClient authServiceClient;

    private MockMvc mockMvc;
    private String userToken;
    private Long testUserId;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.webAppContextSetup(webApplicationContext)
                .apply(springSecurity())
                .build();

        userStatusService.clearAll();

        testUserId = 999999L;
        ChatPrincipal principal = ChatPrincipal.builder()
                .userId(testUserId)
                .username("test_disabled_user")
                .email("disabled_user@crm.local")
                .role("SALES")
                .build();

        userToken = "Bearer " + jwtService.generateAccessToken(principal);
    }

    @Test
    @DisplayName("Bảo mật: User ACTIVE có thể gọi Chat REST API bình thường")
    void testActiveUser_CanAccessChat() throws Exception {
        when(authServiceClient.getUserById(testUserId)).thenReturn(Optional.of(
                ChatUserResponse.builder()
                        .id(testUserId)
                        .username("test_disabled_user")
                        .email("disabled_user@crm.local")
                        .role("SALES")
                        .status("ACTIVE")
                        .build()
        ));

        mockMvc.perform(get("/api/v1/chat/conversations")
                        .header("Authorization", userToken))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Bảo mật: User bị DISABLED bị JwtFilter chặn 403 trên toàn bộ REST API")
    void testDisabledUser_BlockedFromChatRestApi() throws Exception {
        // Giả lập tài khoản bị Admin vô hiệu hóa
        when(authServiceClient.getUserById(testUserId)).thenReturn(Optional.of(
                ChatUserResponse.builder()
                        .id(testUserId)
                        .username("test_disabled_user")
                        .email("disabled_user@crm.local")
                        .role("SALES")
                        .status("DISABLED")
                        .build()
        ));

        // Gọi REST API danh sách hội thoại
        mockMvc.perform(get("/api/v1/chat/conversations")
                        .header("Authorization", userToken))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.error").value("Forbidden"))
                .andExpect(jsonPath("$.message").value("Tài khoản đã bị vô hiệu hóa hoặc không tồn tại"));

        // Gọi xin cấp WebSocket Ticket
        mockMvc.perform(post("/api/v1/chat/ws/ticket")
                        .header("Authorization", userToken))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Bảo mật: Khi markDisabled() được gọi, user bị chặn lập tức không cần chờ TTL")
    void testImmediateRevocation_ViaMarkDisabled() throws Exception {
        // Ban đầu đang ACTIVE
        when(authServiceClient.getUserById(testUserId)).thenReturn(Optional.of(
                ChatUserResponse.builder()
                        .id(testUserId)
                        .username("test_disabled_user")
                        .email("disabled_user@crm.local")
                        .role("SALES")
                        .status("ACTIVE")
                        .build()
        ));

        mockMvc.perform(get("/api/v1/chat/conversations")
                        .header("Authorization", userToken))
                .andExpect(status().isOk());

        // Quản trị viên trigger thu hồi ngay lập tức
        userStatusService.markDisabled(testUserId);

        // Request tiếp theo phải bị chặn 403 ngay lập tức
        mockMvc.perform(get("/api/v1/chat/conversations")
                        .header("Authorization", userToken))
                .andExpect(status().isForbidden());
    }
}

