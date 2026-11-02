package auth_service.service;

import auth_service.dto.request.ResetPasswordRequest;
import auth_service.entity.PasswordResetToken;
import auth_service.entity.User;
import auth_service.repository.PasswordResetTokenRepository;
import auth_service.repository.RefreshTokenRepository;
import auth_service.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OtpResetService {

    private static final int MAX_OTP_ATTEMPTS = 5;

    private final UserRepository users;
    private final PasswordResetTokenRepository resetTokens;
    private final RefreshTokenRepository refreshTokens;
    private final PasswordEncoder encoder;

    @Transactional
    public String validateAndReset(ResetPasswordRequest r) {

        User u = users.findByEmailForUpdate(r.getEmail())
                .orElse(null);

        if (u == null) {
            return "Địa chỉ email không tồn tại trên hệ thống.";
        }

        List<PasswordResetToken> tokens =
                resetTokens.findByUserIdOrderByIdDesc(u.getId());

        if (tokens.isEmpty()) {
            return "Không tìm thấy yêu cầu đặt lại mật khẩu cho tài khoản này.";
        }

        PasswordResetToken t = tokens.get(0);

        if (t.isUsed()) {
            return "Mã OTP này đã được sử dụng. Vui lòng gửi yêu cầu để nhận mã mới.";
        }

        if (!t.getExpiresAt().isAfter(LocalDateTime.now())) {
            return "Mã OTP đã hết hiệu lực (quá 15 phút). Vui lòng yêu cầu mã mới.";
        }

        if (t.getAttemptCount() >= MAX_OTP_ATTEMPTS) {
            return "Mã OTP đã bị khóa do nhập sai quá 5 lần. Vui lòng yêu cầu mã mới.";
        }

        if (!encoder.matches(r.getToken(), t.getToken())) {

            int attempts = t.getAttemptCount() + 1;
            t.setAttemptCount(attempts);

            if (attempts >= MAX_OTP_ATTEMPTS) {
                t.setUsed(true);
            }

            resetTokens.save(t);

            if (attempts >= MAX_OTP_ATTEMPTS) {
                return "Mã OTP không chính xác. Bạn đã nhập sai quá 5 lần, mã OTP đã bị vô hiệu hóa.";
            }

            int remaining = MAX_OTP_ATTEMPTS - attempts;
            return "Mã OTP không chính xác. Bạn còn " + remaining + " lần thử.";
        }

        // Valid OTP: change password
        u.setPassword(encoder.encode(r.getNewPassword()));
        users.save(u);

        // Prevent OTP reuse
        t.setUsed(true);
        resetTokens.save(t);

        // Revoke previous refresh tokens
        refreshTokens.revokeAllByUserId(u.getId());

        return null;
    }

    @Transactional
    public boolean resetPassword(ResetPasswordRequest r) {
        return validateAndReset(r) == null;
    }
}