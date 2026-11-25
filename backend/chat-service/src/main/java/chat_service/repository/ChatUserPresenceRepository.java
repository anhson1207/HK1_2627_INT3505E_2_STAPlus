package chat_service.repository;

import chat_service.entity.ChatUserPresence;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ChatUserPresenceRepository extends JpaRepository<ChatUserPresence, Long> {
}
