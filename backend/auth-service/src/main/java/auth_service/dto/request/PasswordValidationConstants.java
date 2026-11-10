package auth_service.dto.request;

public final class PasswordValidationConstants {
    private PasswordValidationConstants() {
    }

    public static final String PASSWORD_PATTERN = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^A-Za-z0-9\\s])\\S{8,100}$";
    public static final String PASSWORD_MESSAGE = "Mật khẩu phải có ít nhất 8 ký tự, gồm chữ hoa, chữ thường, số và 1 ký tự đặc biệt";
}
