import {
    MockAuthError,
    mockForgotPassword,
    mockGetCurrentUser,
    mockLogin,
    mockLoginWithGoogle,
    mockLogout,
    mockRefreshAccessToken,
    mockRegister,
    mockResendVerification,
    mockResetPassword,
    mockVerifyEmail,
    type MockAuthErrorCode,
} from "../mocks/auth";
import type { LoginRequest, RegisterRequest } from "../types/auth";

export class AuthServiceError extends Error {
    code: MockAuthErrorCode;

    constructor(code: MockAuthErrorCode, message: string) {
        super(message);
        this.name = "AuthServiceError";
        this.code = code;
    }
}

async function execute<T>(operation: () => Promise<T>): Promise<T> {
    try {
        return await operation();
    } catch (error) {
        if (error instanceof MockAuthError) throw new AuthServiceError(error.code, error.message);
        throw error;
    }
}

// UI và store chỉ phụ thuộc facade này. Khi backend sẵn sàng, thay các operation mock
// bằng POST /auth/* và GET /auth/me mà không cần sửa các page.
export const authService = {
    register: (data: RegisterRequest) => execute(() => mockRegister(data)),
    login: (data: LoginRequest) => execute(() => mockLogin(data)),
    loginWithGoogle: () => execute(mockLoginWithGoogle),
    verifyEmail: (email: string) => execute(() => mockVerifyEmail(email)),
    resendVerification: (email: string) => execute(() => mockResendVerification(email)),
    forgotPassword: (email: string) => execute(() => mockForgotPassword(email)),
    resetPassword: (token: string, newPassword: string) => execute(() => mockResetPassword(token, newPassword)),
    refreshToken: (refreshToken: string) => execute(() => mockRefreshAccessToken(refreshToken)),
    getCurrentUser: () => execute(mockGetCurrentUser),
    logout: () => execute(mockLogout),
};
