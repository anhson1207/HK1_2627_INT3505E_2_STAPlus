package chat_service.repository;

import chat_service.entity.ChatMessage;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {

    Optional<ChatMessage> findByConversationIdAndClientMessageId(Long conversationId, String clientMessageId);

    @Query("SELECT m FROM ChatMessage m " +
           "WHERE m.conversation.id = :conversationId " +
           "AND (:beforeId IS NULL OR m.id < :beforeId) " +
           "AND m.id >= :visibleFromId " +
           "ORDER BY m.id DESC")
    List<ChatMessage> findMessagesWithCursor(
            @Param("conversationId") Long conversationId,
            @Param("beforeId") Long beforeId,
            @Param("visibleFromId") Long visibleFromId,
            Pageable pageable
    );

    @Query("SELECT m FROM ChatMessage m " +
           "WHERE m.conversation.id = :conversationId " +
           "AND m.id >= :visibleFromId " +
           "AND LOWER(m.content) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "ORDER BY m.id DESC")
    List<ChatMessage> searchMessages(
            @Param("conversationId") Long conversationId,
            @Param("visibleFromId") Long visibleFromId,
            @Param("query") String query,
            Pageable pageable
    );

    @Query("SELECT m FROM ChatMessage m WHERE m.attachmentUrl LIKE CONCAT('%/files/', :attachmentId)")
    List<ChatMessage> findByAttachmentId(@Param("attachmentId") Long attachmentId);
}

