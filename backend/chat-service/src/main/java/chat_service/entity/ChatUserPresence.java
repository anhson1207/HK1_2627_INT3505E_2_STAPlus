package chat_service.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "chat_user_presence")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatUserPresence {

    @Id
    @Column(name = "user_id")
    private Long userId;

    @Column(name = "last_seen_at")
    private LocalDateTime lastSeenAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
