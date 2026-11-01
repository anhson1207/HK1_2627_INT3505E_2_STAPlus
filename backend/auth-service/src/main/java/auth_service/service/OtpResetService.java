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
    public boolean resetPassword(ResetPasswordRequest r) {

        User u = users.findByEmailForUpdate(r.getEmail())
                .orElse(null);

        if (u == null) {
            return false;
        }

        List<PasswordResetToken> tokens =
                resetTokens.findByUserIdOrderByIdDesc(u.getId());

        if (tokens.isEmpty()) {
            return false;
        }

        PasswordResetToken t = tokens.get(0);

        if (t.isUsed()
                || !t.getExpiresAt().isAfter(LocalDateTime.now())
                || t.getAttemptCount() >= MAX_OTP_ATTEMPTS) {
            return false;
        }

        if (!encoder.matches(r.getToken(), t.getToken())) {

            int attempts = t.getAttemptCount() + 1;
            t.setAttemptCount(attempts);

            if (attempts >= MAX_OTP_ATTEMPTS) {
                t.setUsed(true);
            }

            resetTokens.save(t);

            // Return normally so transaction can commit
            return false;
        }

        // Valid OTP: change password
        u.setPassword(encoder.encode(r.getNewPassword()));
        users.save(u);

        // Prevent OTP reuse
        t.setUsed(true);
        resetTokens.save(t);

        // Revoke previous refresh tokens
        refreshTokens.revokeAllByUserId(u.getId());

        return true;
    }
}