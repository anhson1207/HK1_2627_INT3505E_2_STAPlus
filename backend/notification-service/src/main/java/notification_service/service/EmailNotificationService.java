package notification_service.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class EmailNotificationService {
    private static final Logger log = LoggerFactory.getLogger(EmailNotificationService.class);

    public boolean sendEmail(String toEmail, String subject, String body) {
        log.info("[EMAIL DISPATCHED] To: {} | Subject: {} | Body: {}", toEmail, subject, body);
        return true;
    }
}
