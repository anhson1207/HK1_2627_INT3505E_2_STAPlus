package auth_service.chat.repository;

import auth_service.chat.entity.ChatConversation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ChatConversationRepository extends JpaRepository<ChatConversation, Long> {

    Optional<ChatConversation> findByDirectKey(String directKey);

    @Query("SELECT DISTINCT c FROM ChatConversation c " +
           "JOIN FETCH c.participants p " +
           "JOIN FETCH p.user u " +
           "WHERE c.id IN (" +
           "    SELECT cp.conversation.id FROM ChatParticipant cp " +
           "    WHERE cp.user.id = :userId AND cp.status = 'ACTIVE'" +
           ") " +
           "ORDER BY c.lastMessageAt DESC NULLS LAST, c.createdAt DESC")
    List<ChatConversation> findConversationsForUser(@Param("userId") Long userId);
}
