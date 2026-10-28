package auth_service.service.impl;

import auth_service.service.EmailService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String from;

    @Value("${app.reset-password-url}")
    private String resetPasswordUrl;

    @Override
    public void sendPasswordResetEmail(String to, String resetToken) {
        String resetLink = resetPasswordUrl + "?token=" + resetToken;

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(from);
        message.setTo(to);
        message.setSubject("CRM - Reset your password");
        message.setText(
                "We received a request to reset your CRM password.\n\n"
                        + "Reset your password using this link:\n"
                        + resetLink
                        + "\n\nThis link expires in 15 minutes."
        );

        mailSender.send(message);

    }
}