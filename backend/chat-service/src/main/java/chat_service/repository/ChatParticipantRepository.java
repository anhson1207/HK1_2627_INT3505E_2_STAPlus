package chat_service.repository;

import chat_service.entity.ChatParticipant;
import chat_service.entity.enums.ParticipantRole;
import chat_service.entity.enums.ParticipantStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ChatParticipantRepository extends JpaRepository<ChatParticipant, Long> {

    Optional<ChatParticipant> findByConversationIdAndUserId(Long conversationId, Long userId);

    List<ChatParticipant> findByConversationIdAndStatus(Long conversationId, ParticipantStatus status);

    List<ChatParticipant> findByConversationId(Long conversationId);

    @Query("SELECT COUNT(m) FROM ChatMessage m " +
           "WHERE m.conversation.id = :conversationId " +
           "AND m.id > :lastReadMessageId " +
           "AND m.id >= :visibleFromId " +
           "AND (m.senderId IS NULL OR m.senderId <> :userId)")
    long countUnreadMessages(
            @Param("conversationId") Long conversationId,
            @Param("lastReadMessageId") Long lastReadMessageId,
            @Param("visibleFromId") Long visibleFromId,
            @Param("userId") Long userId
    );

    Optional<ChatParticipant> findByConversationIdAndRoleAndStatus(
            Long conversationId,
            ParticipantRole role,
            ParticipantStatus status
    );

    @Query("SELECT cp FROM ChatParticipant cp " +
           "JOIN FETCH cp.conversation c " +
           "WHERE cp.userId = :userId AND cp.status = chat_service.entity.enums.ParticipantStatus.ACTIVE")
    List<ChatParticipant> findActiveMembershipsByUserId(@Param("userId") Long userId);

    @org.springframework.data.jpa.repository.Modifying
    @Query("UPDATE ChatParticipant cp SET cp.username = :username, cp.email = :email WHERE cp.userId = :userId")
    int updateSnapshotByUserId(
            @Param("userId") Long userId,
            @Param("username") String username,
            @Param("email") String email
    );
}

