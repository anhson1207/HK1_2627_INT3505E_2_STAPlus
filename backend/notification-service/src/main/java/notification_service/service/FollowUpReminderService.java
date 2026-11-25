package notification_service.service;

import notification_service.dto.request.FollowUpReminderRequest;
import notification_service.model.FollowUpReminder;
import notification_service.repo.FollowUpReminderRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class FollowUpReminderService {

    private final FollowUpReminderRepository reminderRepository;
    private final NotificationService notificationService;

    public FollowUpReminderService(FollowUpReminderRepository reminderRepository,
                                   NotificationService notificationService) {
        this.reminderRepository = reminderRepository;
        this.notificationService = notificationService;
    }

    public List<FollowUpReminder> getAllReminders() {
        return reminderRepository.findAllByOrderByDueAtAsc();
    }

    public List<FollowUpReminder> getRemindersByUser(Long userId) {
        return reminderRepository.findByUserIdOrderByDueAtAsc(userId);
    }

    public List<FollowUpReminder> getRemindersByEntity(String entityType, Long entityId) {
        return reminderRepository.findByEntityTypeAndEntityIdOrderByDueAtAsc(
                entityType != null ? entityType.toUpperCase() : "CUSTOMER",
                entityId
        );
    }

    public FollowUpReminder getReminderById(Long id) {
        return reminderRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Reminder not found"));
    }

    public FollowUpReminder createReminder(Long userId, FollowUpReminderRequest request) {
        if (request.getTitle() == null || request.getTitle().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Tiêu đề nhắc việc không được để trống");
        }

        FollowUpReminder reminder = new FollowUpReminder();
        reminder.setUserId(userId != null ? userId : 1L);
        reminder.setTitle(request.getTitle().trim());
        reminder.setDescription(request.getDescription() != null ? request.getDescription().trim() : null);
        reminder.setDueAt(request.getDueAt() != null && !request.getDueAt().isBlank()
                ? request.getDueAt().trim()
                : LocalDateTime.now().plusDays(1).toString());
        String entityType = request.getEntityType() != null && !request.getEntityType().isBlank()
                ? request.getEntityType().trim().toUpperCase()
                : "CUSTOMER";
        reminder.setEntityType(entityType);
        Long entityId = request.getEntityId() != null ? request.getEntityId() : 1L;
        reminder.setEntityId(entityId);
        reminder.setEntityName(request.getEntityName() != null && !request.getEntityName().isBlank()
                ? request.getEntityName().trim()
                : (entityType + " #" + entityId));
        reminder.setOwnerName(request.getOwnerName() != null ? request.getOwnerName().trim() : null);
        reminder.setStatus("PENDING");

        FollowUpReminder saved = reminderRepository.save(reminder);

        String segment = switch (entityType) {
            case "LEAD" -> "leads";
            case "DEAL" -> "deals";
            default -> "customers";
        };
        notificationService.createFollowUpNotification(
                saved.getUserId(),
                saved.getTitle(),
                "Nhắc việc cho " + saved.getEntityName() + (saved.getDescription() != null ? " — " + saved.getDescription() : ""),
                "/" + segment + "/" + saved.getEntityId()
        );

        return saved;
    }

    public FollowUpReminder updateReminder(Long id, FollowUpReminderRequest request) {
        FollowUpReminder reminder = getReminderById(id);

        if (request.getTitle() != null && !request.getTitle().isBlank()) {
            reminder.setTitle(request.getTitle().trim());
        }
        if (request.getDescription() != null) {
            reminder.setDescription(request.getDescription().trim());
        }
        if (request.getDueAt() != null && !request.getDueAt().isBlank()) {
            reminder.setDueAt(request.getDueAt().trim());
        }
        if (request.getEntityType() != null && !request.getEntityType().isBlank()) {
            reminder.setEntityType(request.getEntityType().trim().toUpperCase());
        }
        if (request.getEntityId() != null) {
            reminder.setEntityId(request.getEntityId());
        }
        if (request.getEntityName() != null && !request.getEntityName().isBlank()) {
            reminder.setEntityName(request.getEntityName().trim());
        }
        if (request.getOwnerName() != null) {
            reminder.setOwnerName(request.getOwnerName().trim());
        }
        if (request.getStatus() != null && !request.getStatus().isBlank()) {
            reminder.setStatus(request.getStatus().trim().toUpperCase());
        }

        return reminderRepository.save(reminder);
    }

    public FollowUpReminder completeReminder(Long id) {
        FollowUpReminder reminder = getReminderById(id);
        reminder.setStatus("COMPLETED");
        return reminderRepository.save(reminder);
    }

    public void deleteReminder(Long id) {
        FollowUpReminder reminder = getReminderById(id);
        reminderRepository.delete(reminder);
    }
}
