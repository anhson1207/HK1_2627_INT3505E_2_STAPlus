package auth_service.chat.repository;

import auth_service.chat.entity.ChatMessage;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {

    Optional<ChatMessage> findByConversationIdAndClientMessageId(Long conversationId, String clientMessageId);

    @Query("SELECT m FROM ChatMessage m " +
           "LEFT JOIN FETCH m.sender s " +
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
           "LEFT JOIN FETCH m.sender s " +
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
}
