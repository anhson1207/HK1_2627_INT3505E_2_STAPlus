package chat_service.service;

import chat_service.client.AuthServiceClient;
import chat_service.entity.ChatConversation;
import chat_service.entity.ChatMessage;
import chat_service.entity.ChatParticipant;
import chat_service.entity.enums.ConversationType;
import chat_service.entity.enums.ParticipantRole;
import chat_service.entity.enums.ParticipantStatus;
import chat_service.repository.ChatConversationRepository;
import chat_service.repository.ChatMessageRepository;
import chat_service.repository.ChatParticipantRepository;
import chat_service.security.ChatPrincipal;
import chat_service.security.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.WebApplicationContext;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

import static org.hamcrest.Matchers.*;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@Transactional
class ChatAttachmentSecurityTest {

    @Autowired
    private WebApplicationContext webApplicationContext;

    @Autowired
    private ChatConversationRepository conversationRepository;

    @Autowired
    private ChatParticipantRepository participantRepository;

    @Autowired
    private ChatMessageRepository messageRepository;

    @Autowired
    private ChatAttachmentService attachmentService;

    @Autowired
    private JwtService jwtService;

    @MockitoBean
    private AuthServiceClient authServiceClient;

    private MockMvc mockMvc;
    private ChatPrincipal memberA;
    private ChatPrincipal memberB;
    private ChatPrincipal nonMemberUser;
    private ChatPrincipal lateJoinerUser;
    private String tokenA;
    private String tokenB;
    private String tokenNonMember;
    private String tokenLateJoiner;
    private ChatConversation conversation;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.webAppContextSetup(webApplicationContext)
                .apply(springSecurity())
                .build();

        when(authServiceClient.getUserById(anyLong())).thenAnswer(invocation -> {
            Long id = invocation.getArgument(0);
            return Optional.of(chat_service.dto.ChatUserResponse.builder()
                    .id(id)
                    .username("user_" + id)
                    .email("user_" + id + "@crm.local")
                    .role("SALES")
                    .status("ACTIVE")
                    .build());
        });

        long ts = System.currentTimeMillis();

        memberA = ChatPrincipal.builder()
                .userId(3001L + (ts % 1000))
                .username("sec_user_a_" + ts)
                .email("sec_a_" + ts + "@crm.local")
                .role("SALES")
                .build();

        memberB = ChatPrincipal.builder()
                .userId(4001L + (ts % 1000))
                .username("sec_user_b_" + ts)
                .email("sec_b_" + ts + "@crm.local")
                .role("SUPPORT")
                .build();

        nonMemberUser = ChatPrincipal.builder()
                .userId(5001L + (ts % 1000))
                .username("sec_outsider_" + ts)
                .email("sec_outsider_" + ts + "@crm.local")
                .role("SALES")
                .build();

        lateJoinerUser = ChatPrincipal.builder()
                .userId(6001L + (ts % 1000))
                .username("sec_late_" + ts)
                .email("sec_late_" + ts + "@crm.local")
                .role("SUPPORT")
                .build();

        tokenA = jwtService.generateAccessToken(memberA);
        tokenB = jwtService.generateAccessToken(memberB);
        tokenNonMember = jwtService.generateAccessToken(nonMemberUser);
        tokenLateJoiner = jwtService.generateAccessToken(lateJoinerUser);

        conversation = conversationRepository.save(ChatConversation.builder()
                .type(ConversationType.DIRECT)
                .creatorId(memberA.getUserId())
                .directKey(memberA.getUserId() + "_" + memberB.getUserId())
                .lastMessageAt(LocalDateTime.now())
                .build());

        participantRepository.save(ChatParticipant.builder()
                .conversation(conversation)
                .userId(memberA.getUserId())
                .username(memberA.getUsername())
                .email(memberA.getEmail())
                .role(ParticipantRole.MEMBER)
                .status(ParticipantStatus.ACTIVE)
                .visibleFromMessageId(0L)
                .build());

        participantRepository.save(ChatParticipant.builder()
                .conversation(conversation)
                .userId(memberB.getUserId())
                .username(memberB.getUsername())
                .email(memberB.getEmail())
                .role(ParticipantRole.MEMBER)
                .status(ParticipantStatus.ACTIVE)
                .visibleFromMessageId(0L)
                .build());
    }

    private byte[] createPngBytes() {
        return new byte[]{(byte) 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D,
                'I', 'H', 'D', 'R', 0, 0, 0, 1, 0, 0, 0, 1, 8, 6, 0, 0, 0, 0x1F, 0x15, (byte) 0xC4, (byte) 0x89};
    }

    private byte[] createFakeDocxBytes() {
        return "Not an Office OpenXML zip file".getBytes(StandardCharsets.UTF_8);
    }

    private byte[] createValidDocxBytes() throws IOException {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        try (ZipOutputStream zos = new ZipOutputStream(baos)) {
            ZipEntry ctEntry = new ZipEntry("[Content_Types].xml");
            zos.putNextEntry(ctEntry);
            zos.write("<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?><Types></Types>".getBytes(StandardCharsets.UTF_8));
            zos.closeEntry();

            ZipEntry wordEntry = new ZipEntry("word/document.xml");
            zos.putNextEntry(wordEntry);
            zos.write("<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?><document></document>".getBytes(StandardCharsets.UTF_8));
            zos.closeEntry();
        }
        return baos.toByteArray();
    }

    private byte[] createZipBombBytes(int entryCount) throws IOException {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        try (ZipOutputStream zos = new ZipOutputStream(baos)) {
            ZipEntry ctEntry = new ZipEntry("[Content_Types].xml");
            zos.putNextEntry(ctEntry);
            zos.write("<Types></Types>".getBytes(StandardCharsets.UTF_8));
            zos.closeEntry();

            ZipEntry wordEntry = new ZipEntry("word/document.xml");
            zos.putNextEntry(wordEntry);
            zos.write("<document></document>".getBytes(StandardCharsets.UTF_8));
            zos.closeEntry();

            for (int i = 0; i < entryCount; i++) {
                ZipEntry e = new ZipEntry("word/part_" + i + ".xml");
                zos.putNextEntry(e);
                zos.write("data".getBytes(StandardCharsets.UTF_8));
                zos.closeEntry();
            }
        }
        return baos.toByteArray();
    }

    @Test
    @DisplayName("Bảo mật 1: Tải lên hình ảnh PNG hợp lệ thành công")
    void testDirectChatAttachmentUpload_Success() throws Exception {
        byte[] pngBytes = createPngBytes();
        MockMultipartFile file = new MockMultipartFile("file", "test.png", "image/png", pngBytes);

        mockMvc.perform(multipart("/api/v1/chat/conversations/" + conversation.getId() + "/files")
                        .file(file)
                        .header("Authorization", "Bearer " + tokenA))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").isNumber())
                .andExpect(jsonPath("$.originalFilename").value("test.png"))
                .andExpect(jsonPath("$.contentType").value("image/png"))
                .andExpect(jsonPath("$.fileUrl", startsWith("/api/v1/chat/files/")));
    }

    @Test
    @DisplayName("Bảo mật 2: Người ngoài không phải thành viên bị từ chối upload tệp (HTTP 403)")
    void testNonMemberCannotUploadAttachment_Returns403() throws Exception {
        byte[] pngBytes = createPngBytes();
        MockMultipartFile file = new MockMultipartFile("file", "test.png", "image/png", pngBytes);

        mockMvc.perform(multipart("/api/v1/chat/conversations/" + conversation.getId() + "/files")
                        .file(file)
                        .header("Authorization", "Bearer " + tokenNonMember))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.message", containsString("không phải thành viên")));
    }

    @Test
    @DisplayName("Bảo mật 3: Người ngoài không phải thành viên bị từ chối download tệp (HTTP 403)")
    void testNonMemberCannotDownloadAttachment_Returns403() throws Exception {
        byte[] pngBytes = createPngBytes();
        MockMultipartFile file = new MockMultipartFile("file", "secret.png", "image/png", pngBytes);

        var uploadRes = attachmentService.uploadAttachment(conversation.getId(), file, memberA);

        mockMvc.perform(get("/api/v1/chat/files/" + uploadRes.getId())
                        .header("Authorization", "Bearer " + tokenNonMember))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Bảo mật 4: Từ chối tệp tin giả mạo đuôi .docx nhưng thiếu cấu trúc Office OpenXML (HTTP 400)")
    void testUploadFakeDocx_Returns400() throws Exception {
        byte[] fakeBytes = createFakeDocxBytes();
        MockMultipartFile fakeFile = new MockMultipartFile("file", "fake.docx",
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document", fakeBytes);

        mockMvc.perform(multipart("/api/v1/chat/conversations/" + conversation.getId() + "/files")
                        .file(fakeFile)
                        .header("Authorization", "Bearer " + tokenA))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", containsString("Office OpenXML")));
    }

    @Test
    @DisplayName("Bảo mật 5: Phòng chống ZIP bomb khi số lượng entries vượt ngưỡng 500 (HTTP 400)")
    void testUploadZipBombDocx_Returns400() throws Exception {
        byte[] bombBytes = createZipBombBytes(505);
        MockMultipartFile bombFile = new MockMultipartFile("file", "bomb.docx",
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document", bombBytes);

        mockMvc.perform(multipart("/api/v1/chat/conversations/" + conversation.getId() + "/files")
                        .file(bombFile)
                        .header("Authorization", "Bearer " + tokenA))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", containsString("ZIP bomb")));
    }

    @Test
    @DisplayName("Bảo mật 6: Tải lên và tải về thành công với DOCX chuẩn, kiểm tra header nosniff")
    void testValidDocxUploadAndDownload_SuccessWithNoSniff() throws Exception {
        byte[] docxBytes = createValidDocxBytes();
        MockMultipartFile validFile = new MockMultipartFile("file", "report.docx",
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document", docxBytes);

        var uploadRes = attachmentService.uploadAttachment(conversation.getId(), validFile, memberA);

        mockMvc.perform(get("/api/v1/chat/files/" + uploadRes.getId())
                        .header("Authorization", "Bearer " + tokenB))
                .andExpect(status().isOk())
                .andExpect(header().string("X-Content-Type-Options", "nosniff"))
                .andExpect(header().string("Content-Disposition", containsString("attachment; filename=\"report.docx\"")));
    }

    @Test
    @DisplayName("Bảo mật 7: Phạm vi lịch sử xem được (visibleFromMessageId) chặn thành viên mới xem file cũ (HTTP 403)")
    void testVisibleFromMessageIdScopeEnforcement_Returns403() throws Exception {
        byte[] docxBytes = createValidDocxBytes();
        MockMultipartFile file = new MockMultipartFile("file", "confidential.docx",
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document", docxBytes);

        var uploadRes = attachmentService.uploadAttachment(conversation.getId(), file, memberA);

        ChatMessage message = messageRepository.save(ChatMessage.builder()
                .conversation(conversation)
                .senderId(memberA.getUserId())
                .senderName(memberA.getUsername())
                .content("confidential.docx")
                .attachmentUrl("/api/v1/chat/files/" + uploadRes.getId())
                .attachmentName("confidential.docx")
                .attachmentSize((long) docxBytes.length)
                .clientMessageId("client-sec-" + UUID.randomUUID())
                .build());

        participantRepository.save(ChatParticipant.builder()
                .conversation(conversation)
                .userId(lateJoinerUser.getUserId())
                .username(lateJoinerUser.getUsername())
                .email(lateJoinerUser.getEmail())
                .role(ParticipantRole.MEMBER)
                .status(ParticipantStatus.ACTIVE)
                .visibleFromMessageId(message.getId() + 1L)
                .build());

        mockMvc.perform(get("/api/v1/chat/files/" + uploadRes.getId())
                        .header("Authorization", "Bearer " + tokenLateJoiner))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.message", containsString("trước khi tham gia")));
    }
}

