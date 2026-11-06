
package auth_service.service.impl;

import auth_service.service.EmailService;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:}")
    private String from;

    @Override
    public void sendPasswordResetEmail(
            String to,
            String token
    ) {
        if (from == null || from.trim().isEmpty()) {
            log.info("[OTP RESET] Chưa cấu hình SMTP (MAIL_USERNAME trống). Mã OTP đặt lại mật khẩu của {}: [{}]", to, token);
            return;
        }

        String plainText =
                "Xin chào,\n\n"
                        + "Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản CRM của bạn.\n\n"
                        + "Mã xác nhận (OTP) của bạn là: " + token + "\n\n"
                        + "Mã này gồm 6 chữ số và có hiệu lực trong vòng 15 phút.\n"
                        + "Vì lý do bảo mật, vui lòng không chia sẻ mã này cho bất kỳ ai.\n\n"
                        + "Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email này.\n\n"
                        + "Trân trọng,\n"
                        + "Đội ngũ phát triển CRM";

        String htmlContent =
                "<!DOCTYPE html>"
                        + "<html lang=\"vi\">"
                        + "<head>"
                        + "<meta charset=\"UTF-8\">"
                        + "<meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">"
                        + "</head>"
                        + "<body style=\"margin:0;padding:0;background-color:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#334155;\">"
                        + "<table role=\"presentation\" width=\"100%\" cellspacing=\"0\" cellpadding=\"0\" style=\"background-color:#f8fafc;padding:36px 16px;\">"
                        + "<tr><td align=\"center\">"
                        + "<table role=\"presentation\" width=\"100%\" style=\"max-width:480px;background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.06);border:1px solid #e2e8f0;\" cellspacing=\"0\" cellpadding=\"0\">"
                        + "<tr><td style=\"background-color:#2563eb;padding:22px 32px;text-align:center;\">"
                        + "<h1 style=\"margin:0;color:#ffffff;font-size:20px;font-weight:700;letter-spacing:1px;\">CRM SYSTEM</h1>"
                        + "</td></tr>"
                        + "<tr><td style=\"padding:28px 32px;\">"
                        + "<h2 style=\"margin:0 0 16px 0;color:#0f172a;font-size:17px;font-weight:600;\">Đặt lại mật khẩu tài khoản</h2>"
                        + "<p style=\"margin:0 0 12px 0;font-size:14px;line-height:22px;color:#475569;\">Xin chào,</p>"
                        + "<p style=\"margin:0 0 20px 0;font-size:14px;line-height:22px;color:#475569;\">"
                        + "Chúng tôi đã nhận được yêu cầu đặt lại mật khẩu cho tài khoản CRM của bạn. Vui lòng nhập mã OTP dưới đây để hoàn tất:"
                        + "</p>"
                        + "<div style=\"background-color:#f1f5f9;border:1px solid #cbd5e1;border-radius:10px;padding:20px;text-align:center;margin:0 0 20px 0;\">"
                        + "<span style=\"display:block;font-size:12px;color:#64748b;font-weight:600;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;\">MÃ XÁC NHẬN (OTP)</span>"
                        + "<span style=\"display:inline-block;font-family:'Courier New',Courier,monospace;font-size:32px;font-weight:700;letter-spacing:8px;color:#2563eb;\">" + token + "</span>"
                        + "<span style=\"display:block;font-size:12px;color:#94a3b8;margin-top:8px;\">Hiệu lực trong 15 phút</span>"
                        + "</div>"
                        + "<p style=\"margin:0 0 12px 0;font-size:13px;line-height:20px;color:#64748b;\">"
                        + "• Tuyệt đối không chia sẻ mã này cho bất kỳ ai khác.<br>"
                        + "• Nếu bạn không yêu cầu đặt lại mật khẩu, xin hãy bỏ qua email này."
                        + "</p>"
                        + "</td></tr>"
                        + "<tr><td style=\"background-color:#f8fafc;padding:16px 32px;text-align:center;border-top:1px solid #f1f5f9;\">"
                        + "<p style=\"margin:0;font-size:12px;color:#94a3b8;\">Trân trọng,<br><strong style=\"color:#64748b;\">Đội ngũ phát triển CRM</strong></p>"
                        + "</td></tr>"
                        + "</table>"
                        + "</td></tr>"
                        + "</table>"
                        + "</body>"
                        + "</html>";

        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");

            helper.setFrom(from.trim());
            helper.setTo(to);
            helper.setSubject("CRM - Mã OTP đặt lại mật khẩu của bạn");
            helper.setText(plainText, htmlContent);

            mailSender.send(mimeMessage);
            log.info("Đã gửi email OTP đặt lại mật khẩu thành công tới {}", to);
        } catch (Exception e) {
            log.warn("Không thể gửi email OTP qua SMTP ({}). Mã OTP dự phòng của {}: [{}]", e.getMessage(), to, token);
        }
    }
}
