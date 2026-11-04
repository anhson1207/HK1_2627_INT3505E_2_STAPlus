package auth_service.chat.repository;

import auth_service.chat.entity.ChatParticipant;
import auth_service.chat.entity.enums.ParticipantStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ChatParticipantRepository extends JpaRepository<ChatParticipant, Long> {

    Optional<ChatParticipant> findByConversationIdAndUserId(Long conversationId, Long userId);

    List<ChatParticipant> findByConversationIdAndStatus(Long conversationId, ParticipantStatus status);

    List<ChatParticipant> findByConversationId(Long conversationId);

    @Query("SELECT COUNT(m) FROM ChatMessage m " +
           "WHERE m.conversation.id = :conversationId " +
           "AND m.id > :lastReadMessageId " +
           "AND (m.sender IS NULL OR m.sender.id <> :userId)")
    long countUnreadMessages(
            @Param("conversationId") Long conversationId,
            @Param("lastReadMessageId") Long lastReadMessageId,
            @Param("userId") Long userId
    );

    @Query("SELECT cp FROM ChatParticipant cp " +
           "JOIN FETCH cp.conversation c " +
           "WHERE cp.user.id = :userId AND cp.status = 'ACTIVE'")
    List<ChatParticipant> findActiveMembershipsByUserId(@Param("userId") Long userId);
}
