
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

    @Override
    public void sendPasswordResetEmail(
            String to,
            String token
    ) {

        SimpleMailMessage message = new SimpleMailMessage();

        message.setFrom(from);
        message.setTo(to);
        message.setSubject("CRM - Password Reset OTP");

        message.setText(
                "We received a request to reset your CRM password.\n\n"
                        + "Your verification code is: " + token
                        + "\n\nThis code expires in 15 minutes."
                        + "\nDo not share this code with anyone."
                        + "\n\nIf you did not request this, ignore this email."
        );

        mailSender.send(message);
    }
}
