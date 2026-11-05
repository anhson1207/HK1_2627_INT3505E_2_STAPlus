package chat_service.service.impl;

import chat_service.dto.ChatAttachmentResponse;
import chat_service.entity.ChatAttachment;
import chat_service.entity.ChatConversation;
import chat_service.entity.ChatMessage;
import chat_service.entity.ChatParticipant;
import chat_service.entity.enums.MessageType;
import chat_service.entity.enums.ParticipantStatus;
import chat_service.repository.ChatAttachmentRepository;
import chat_service.repository.ChatConversationRepository;
import chat_service.repository.ChatMessageRepository;
import chat_service.repository.ChatParticipantRepository;
import chat_service.security.ChatPrincipal;
import chat_service.service.ChatAttachmentService;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.io.InputStream;
import java.net.MalformedURLException;
import java.nio.file.*;
import java.util.*;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;

@Service
@RequiredArgsConstructor
@Slf4j
public class ChatAttachmentServiceImpl implements ChatAttachmentService {

    private final ChatAttachmentRepository attachmentRepository;
    private final ChatConversationRepository conversationRepository;
    private final ChatParticipantRepository participantRepository;
    private final ChatMessageRepository messageRepository;

    @Value("${app.chat.upload-dir:uploads/chat}")
    private String uploadDirProperty;

    private Path uploadPath;

    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
    private static final int MAX_ZIP_ENTRIES = 500;
    private static final long MAX_ZIP_UNCOMPRESSED_BYTES = 50 * 1024 * 1024; // 50 MB
    private static final double MAX_ZIP_COMPRESSION_RATIO = 10.0;

    private static final Set<String> ALLOWED_IMAGE_EXTS = Set.of("jpg", "jpeg", "png", "webp");
    private static final Set<String> ALLOWED_DOC_EXTS = Set.of("pdf", "docx", "xlsx", "txt");

    @PostConstruct
    public void init() {
        this.uploadPath = Paths.get(uploadDirProperty).toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.uploadPath);
            log.info("Chat attachments storage initialized at: {}", this.uploadPath);
        } catch (IOException e) {
            log.error("Could not create upload directory: {}", this.uploadPath, e);
            throw new RuntimeException("Could not initialize chat upload storage", e);
        }
    }

    @Override
    @Transactional
    public ChatAttachmentResponse uploadAttachment(Long conversationId, MultipartFile file, ChatPrincipal currentUser) {
        if (currentUser == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Người dùng chưa xác thực.");
        }

        ChatConversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy cuộc trò chuyện."));

        Optional<ChatParticipant> participantOpt = participantRepository
                .findByConversationIdAndUserId(conversationId, currentUser.getUserId());
        if (participantOpt.isEmpty() || participantOpt.get().getStatus() != ParticipantStatus.ACTIVE) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Bạn không phải thành viên của cuộc trò chuyện này.");
        }

        if (file == null || file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "File không được để trống.");
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Dung lượng file vượt quá giới hạn 10MB.");
        }

        String originalFilename = StringUtils.cleanPath(
                file.getOriginalFilename() != null ? file.getOriginalFilename() : "file"
        );

        String extension = getExtension(originalFilename).toLowerCase(Locale.ROOT);
        boolean isImage = ALLOWED_IMAGE_EXTS.contains(extension);
        boolean isDoc = ALLOWED_DOC_EXTS.contains(extension);

        if (!isImage && !isDoc) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Định dạng tệp không được hỗ trợ. Chỉ hỗ trợ ảnh (jpg, png, webp) và tài liệu (pdf, docx, xlsx, txt).");
        }

        validateFileContent(file, extension);

        String determinedContentType = determineContentType(extension, file.getContentType());
        String storageFilename = UUID.randomUUID() + "_" + System.currentTimeMillis() + "." + extension;
        Path targetLocation = this.uploadPath.resolve(storageFilename).normalize();

        try {
            if (!targetLocation.startsWith(this.uploadPath)) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Đường dẫn lưu trữ file không hợp lệ.");
            }
            try (InputStream is = file.getInputStream()) {
                Files.copy(is, targetLocation, StandardCopyOption.REPLACE_EXISTING);
            }
        } catch (IOException ex) {
            log.error("Failed to store file {}", storageFilename, ex);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Không thể lưu trữ tệp đính kèm.");
        }

        ChatAttachment attachment;
        try {
            attachment = ChatAttachment.builder()
                    .conversation(conversation)
                    .uploaderId(currentUser.getUserId())
                    .originalFilename(originalFilename)
                    .storageFilename(storageFilename)
                    .contentType(determinedContentType)
                    .fileSize(file.getSize())
                    .build();

            attachment = attachmentRepository.save(attachment);
        } catch (Exception ex) {
            try {
                Files.deleteIfExists(targetLocation);
            } catch (IOException ignored) {}
            throw ex;
        }

        MessageType messageType = isImage ? MessageType.IMAGE : MessageType.FILE;
        String downloadUrl = "/api/v1/chat/files/" + attachment.getId();

        return ChatAttachmentResponse.builder()
                .id(attachment.getId())
                .conversationId(conversation.getId())
                .uploaderId(currentUser.getUserId())
                .originalFilename(attachment.getOriginalFilename())
                .contentType(attachment.getContentType())
                .fileSize(attachment.getFileSize())
                .fileUrl(downloadUrl)
                .messageType(messageType)
                .createdAt(attachment.getCreatedAt())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public Resource loadAttachmentResource(Long attachmentId, ChatPrincipal currentUser) {
        ChatAttachment attachment = getAttachment(attachmentId, currentUser);
        try {
            Path filePath = this.uploadPath.resolve(attachment.getStorageFilename()).normalize();
            if (!filePath.startsWith(this.uploadPath)) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Đường dẫn file không hợp lệ.");
            }
            Resource resource = new UrlResource(filePath.toUri());
            if (resource.exists() && resource.isReadable()) {
                return resource;
            } else {
                log.warn("Attachment file not found on disk: {}", filePath);
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Tệp đính kèm không tồn tại trên hệ thống lưu trữ.");
            }
        } catch (MalformedURLException ex) {
            log.error("File URL error for attachment {}", attachmentId, ex);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Lỗi đọc tệp đính kèm.");
        }
    }

    @Override
    @Transactional(readOnly = true)
    public ChatAttachment getAttachment(Long attachmentId, ChatPrincipal currentUser) {
        if (currentUser == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Người dùng chưa xác thực.");
        }

        ChatAttachment attachment = attachmentRepository.findById(attachmentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy tệp đính kèm."));

        Long convId = attachment.getConversation().getId();
        Optional<ChatParticipant> participantOpt = participantRepository
                .findByConversationIdAndUserId(convId, currentUser.getUserId());
        if (participantOpt.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Bạn không có quyền truy cập tệp đính kèm này.");
        }

        ChatParticipant participant = participantOpt.get();
        Long visibleFrom = participant.getVisibleFromMessageId() != null ? participant.getVisibleFromMessageId() : 0L;
        if (visibleFrom > 0) {
            List<ChatMessage> linkedMessages = messageRepository.findByAttachmentId(attachmentId);
            if (!linkedMessages.isEmpty()) {
                boolean hasVisibleMessage = linkedMessages.stream().anyMatch(m -> m.getId() >= visibleFrom);
                if (!hasVisibleMessage) {
                    throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Bạn không có quyền truy cập tệp đính kèm trong tin nhắn trước khi tham gia.");
                }
            }
        }

        return attachment;
    }

    private String getExtension(String filename) {
        if (filename == null) return "";
        int lastDotIndex = filename.lastIndexOf('.');
        if (lastDotIndex > 0 && lastDotIndex < filename.length() - 1) {
            return filename.substring(lastDotIndex + 1);
        }
        return "";
    }

    private void validateFileContent(MultipartFile file, String extension) {
        byte[] header = new byte[32];
        int bytesRead;
        try (InputStream is = file.getInputStream()) {
            bytesRead = is.read(header);
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Không thể đọc nội dung file để kiểm tra bảo mật.");
        }

        if (bytesRead < 4) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "File quá nhỏ hoặc không hợp lệ.");
        }

        switch (extension) {
            case "png":
                if (header[0] != (byte) 0x89 || header[1] != (byte) 0x50 || header[2] != (byte) 0x4E || header[3] != (byte) 0x47) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Nội dung file không phải định dạng PNG hợp lệ.");
                }
                break;
            case "jpg":
            case "jpeg":
                if (header[0] != (byte) 0xFF || header[1] != (byte) 0xD8 || header[2] != (byte) 0xFF) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Nội dung file không phải định dạng JPEG hợp lệ.");
                }
                break;
            case "webp":
                if (header[0] != 'R' || header[1] != 'I' || header[2] != 'F' || header[3] != 'F') {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Nội dung file không phải định dạng WEBP hợp lệ.");
                }
                break;
            case "pdf":
                if (header[0] != '%' || header[1] != 'P' || header[2] != 'D' || header[3] != 'F') {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Nội dung file không phải định dạng PDF hợp lệ.");
                }
                break;
            case "docx":
            case "xlsx":
                if (header[0] != 0x50 || header[1] != 0x4B || (header[2] != 0x03 && header[2] != 0x05 && header[2] != 0x07)) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Nội dung file không đúng định dạng Office OpenXML (" + extension + ").");
                }
                validateOfficeOpenXml(file, extension);
                break;
            case "txt":
                for (int i = 0; i < bytesRead; i++) {
                    if (header[i] == 0) {
                        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "File TXT chứa ký tự binary không hợp lệ.");
                    }
                }
                break;
        }
    }

    private void validateOfficeOpenXml(MultipartFile file, String extension) {
        boolean hasContentTypes = false;
        boolean hasStructureDir = false;
        String requiredDir = "docx".equalsIgnoreCase(extension) ? "word/" : "xl/";

        int entriesCount = 0;
        long totalUncompressedBytes = 0;
        long archiveSize = file.getSize();

        try (ZipInputStream zis = new ZipInputStream(file.getInputStream())) {
            ZipEntry entry;
            byte[] buffer = new byte[8192];
            while ((entry = zis.getNextEntry()) != null) {
                entriesCount++;
                if (entriesCount > MAX_ZIP_ENTRIES) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                            "Tệp Office OpenXML chứa quá nhiều tệp con (vượt quá " + MAX_ZIP_ENTRIES + " entries, nghi ngờ ZIP bomb).");
                }

                String entryName = entry.getName();
                if (entryName.contains("..") || entryName.startsWith("/") || entryName.startsWith("\\")) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                            "Tệp Office OpenXML chứa đường dẫn không an toàn bên trong archive.");
                }

                if ("[Content_Types].xml".equalsIgnoreCase(entryName)) {
                    hasContentTypes = true;
                }
                if (entryName.toLowerCase(Locale.ROOT).startsWith(requiredDir)) {
                    hasStructureDir = true;
                }

                int bytesRead;
                while ((bytesRead = zis.read(buffer)) != -1) {
                    totalUncompressedBytes += bytesRead;
                    if (totalUncompressedBytes > MAX_ZIP_UNCOMPRESSED_BYTES) {
                        throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                                "Dung lượng giải nén tệp vượt quá giới hạn an toàn 50MB (nghi ngờ ZIP bomb).");
                    }
                }

                if (archiveSize > 0 && totalUncompressedBytes > 1_000_000) {
                    double ratio = (double) totalUncompressedBytes / archiveSize;
                    if (ratio > MAX_ZIP_COMPRESSION_RATIO) {
                        throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                                "Tỷ lệ nén tệp vượt quá mức cho phép (tỷ lệ nén " + Math.round(ratio) + ":1, nghi ngờ ZIP bomb).");
                    }
                }

                zis.closeEntry();
            }
        } catch (ResponseStatusException rse) {
            throw rse;
        } catch (Exception ex) {
            log.warn("Failed to inspect Office OpenXML ZIP archive ({}): {}", extension, ex.getMessage());
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Nội dung file không đúng cấu trúc tài liệu Office OpenXML hợp lệ (" + extension + ").");
        }

        if (!hasContentTypes || !hasStructureDir) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Nội dung file không đúng định dạng Office OpenXML (" + extension.toUpperCase(Locale.ROOT)
                            + "). Tài liệu bắt buộc phải chứa '[Content_Types].xml' và thư mục '" + requiredDir + "'.");
        }
    }

    private String determineContentType(String extension, String fallbackContentType) {
        return switch (extension) {
            case "png" -> "image/png";
            case "jpg", "jpeg" -> "image/jpeg";
            case "webp" -> "image/webp";
            case "pdf" -> "application/pdf";
            case "docx" -> "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
            case "xlsx" -> "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
            case "txt" -> "text/plain;charset=UTF-8";
            default -> (fallbackContentType != null) ? fallbackContentType : "application/octet-stream";
        };
    }
}

