
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
        message.setSubject("CRM - Mã OTP đặt lại mật khẩu của bạn");

        message.setText(
                "Xin chào,\n\n"
                        + "Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản CRM của bạn.\n\n"
                        + "========================================\n"
                        + "👉 MÃ XÁC NHẬN (OTP) CỦA BẠN LÀ:  " + token + "\n"
                        + "========================================\n\n"
                        + "Mã OTP này gồm 6 chữ số và có hiệu lực trong vòng 15 phút.\n"
                        + "Vui lòng nhập mã này trên trang web và không chia sẻ cho bất kỳ ai.\n\n"
                        + "Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email này.\n\n"
                        + "Trân trọng,\n"
                        + "Đội ngũ phát triển CRM"
        );

        mailSender.send(message);
    }
}
