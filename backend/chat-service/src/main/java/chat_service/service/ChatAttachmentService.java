package chat_service.service;

import chat_service.dto.ChatAttachmentResponse;
import chat_service.entity.ChatAttachment;
import chat_service.security.ChatPrincipal;
import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;

public interface ChatAttachmentService {

    ChatAttachmentResponse uploadAttachment(Long conversationId, MultipartFile file, ChatPrincipal currentUser);

    Resource loadAttachmentResource(Long attachmentId, ChatPrincipal currentUser);

    ChatAttachment getAttachment(Long attachmentId, ChatPrincipal currentUser);
}

