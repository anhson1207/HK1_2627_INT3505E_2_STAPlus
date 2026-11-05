package chat_service.repository;

import chat_service.entity.ChatConversation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ChatConversationRepository extends JpaRepository<ChatConversation, Long> {

    Optional<ChatConversation> findByDirectKey(String directKey);

    @Query("SELECT DISTINCT c FROM ChatConversation c " +
           "JOIN FETCH c.participants p " +
           "WHERE c.id IN (" +
           "    SELECT cp.conversation.id FROM ChatParticipant cp " +
           "    WHERE cp.userId = :userId AND cp.status = chat_service.entity.enums.ParticipantStatus.ACTIVE" +
           ") " +
           "ORDER BY c.lastMessageAt DESC NULLS LAST, c.createdAt DESC")
    List<ChatConversation> findConversationsForUser(@Param("userId") Long userId);
}

