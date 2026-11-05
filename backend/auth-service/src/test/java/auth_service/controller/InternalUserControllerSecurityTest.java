package auth_service.controller;

import auth_service.entity.Role;
import auth_service.entity.User;
import auth_service.entity.UserStatus;
import auth_service.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.WebApplicationContext;

import java.time.LocalDateTime;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@Transactional
class InternalUserControllerSecurityTest {

    @Autowired
    private WebApplicationContext webApplicationContext;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Value("${app.internal-key}")
    private String internalKey;

    private MockMvc mockMvc;
    private User activeUser;
    private User disabledUser;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.webAppContextSetup(webApplicationContext).build();

        String ts = String.valueOf(System.currentTimeMillis());

        activeUser = userRepository.save(User.builder()
                .username("active_internal_" + ts)
                .email("active_" + ts + "@crm.local")
                .password(passwordEncoder.encode("Password@123"))
                .role(Role.SALES)
                .status(UserStatus.ACTIVE)
                .createdAt(LocalDateTime.now())
                .build());

        disabledUser = userRepository.save(User.builder()
                .username("disabled_internal_" + ts)
                .email("disabled_" + ts + "@crm.local")
                .password(passwordEncoder.encode("Password@123"))
                .role(Role.SUPPORT)
                .status(UserStatus.DISABLED)
                .createdAt(LocalDateTime.now())
                .build());
    }

    @Test
    @DisplayName("Internal API: Chặn request khi thiếu X-Internal-Key (403 Forbidden)")
    void testMissingInternalKey_ReturnsForbidden() throws Exception {
        mockMvc.perform(get("/api/v1/internal/users/colleagues"))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Internal API: Chặn request khi sai X-Internal-Key (403 Forbidden)")
    void testWrongInternalKey_ReturnsForbidden() throws Exception {
        mockMvc.perform(get("/api/v1/internal/users/colleagues")
                        .header("X-Internal-Key", "invalid-secret-key-1234"))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Internal API: Chấp thuận request với X-Internal-Key hợp lệ (200 OK)")
    void testValidInternalKey_ReturnsColleagues() throws Exception {
        mockMvc.perform(get("/api/v1/internal/users/colleagues")
                        .header("X-Internal-Key", internalKey)
                        .with(request -> {
                            request.setRemoteAddr("127.0.0.1");
                            return request;
                        }))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", isA(java.util.List.class)))
                .andExpect(jsonPath("$[?(@.id == " + activeUser.getId() + ")].username").value(activeUser.getUsername()))
                // Tài khoản DISABLED không bao giờ được trả về trong danh sách đồng nghiệp
                .andExpect(jsonPath("$[?(@.id == " + disabledUser.getId() + ")]").doesNotExist());
    }

    @Test
    @DisplayName("Internal API: Lấy thông tin user theo ID chính xác")
    void testGetUserById_Success() throws Exception {
        mockMvc.perform(get("/api/v1/internal/users/{id}", activeUser.getId())
                        .header("X-Internal-Key", internalKey)
                        .with(request -> {
                            request.setRemoteAddr("127.0.0.1");
                            return request;
                        }))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(activeUser.getId()))
                .andExpect(jsonPath("$.status").value("ACTIVE"));
    }
}

