package auth_service.service;

public interface EmailService {
    void sendPasswordResetEmail(String to, String resetToken);
}