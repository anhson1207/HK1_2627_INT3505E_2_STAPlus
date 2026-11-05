package auth_service.chat.entity;

import auth_service.chat.entity.enums.ParticipantRole;
import auth_service.chat.entity.enums.ParticipantStatus;
import auth_service.entity.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "chat_participants", uniqueConstraints = {
        @UniqueConstraint(name = "uk_chat_participant", columnNames = {"conversation_id", "user_id"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatParticipant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "conversation_id", nullable = false)
    private ChatConversation conversation;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private ParticipantRole role = ParticipantRole.MEMBER;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private ParticipantStatus status = ParticipantStatus.ACTIVE;

    @Column(name = "last_read_message_id")
    @Builder.Default
    private Long lastReadMessageId = 0L;

    @Column(name = "last_read_at")
    private LocalDateTime lastReadAt;

    @Column(name = "visible_from_message_id")
    @Builder.Default
    private Long visibleFromMessageId = 0L;

    @CreationTimestamp
    @Column(name = "joined_at", nullable = false, updatable = false)
    private LocalDateTime joinedAt;

    @Column(name = "left_at")
    private LocalDateTime leftAt;
}
