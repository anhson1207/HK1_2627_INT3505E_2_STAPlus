import type {
    ForgotPasswordResponse,
    LoginRequest,
    LoginResponse,
    RefreshTokenResponse,
    RegisterRequest,
    User,
} from "../types/auth";

const USERS_STORAGE_KEY = "crm-soa.mock-auth-users";
const CURRENT_USER_ID_KEY = "crm-soa.mock-auth-current-user-id";
const RESET_EMAIL_KEY = "crm-soa.mock-auth-reset-email";
const MOCK_PASSWORD = "123456";
const MOCK_ACCESS_TOKEN = "mock-access-token";
const MOCK_REFRESH_TOKEN = "mock-refresh-token";
const MOCK_RESET_TOKEN = "mock-reset-token";
const MOCK_DELAY_MS = 500;

interface MockUserRecord extends User {
    password: string;
}

export type MockAuthErrorCode =
    | "DUPLICATE_EMAIL"
    | "INVALID_CREDENTIALS"
    | "EMAIL_NOT_VERIFIED"
    | "USER_NOT_FOUND"
    | "INVALID_TOKEN";

export class MockAuthError extends Error {
    code: MockAuthErrorCode;

    constructor(code: MockAuthErrorCode, message: string) {
        super(message);
        this.name = "MockAuthError";
        this.code = code;
    }
}

const seedUsers: MockUserRecord[] = [
    { id: 1, fullName: "Nguyễn Anh Sơn", email: "son@crm.com", password: MOCK_PASSWORD, role: "ADMIN", provider: "LOCAL", emailVerified: true },
    { id: 2, fullName: "Trần Minh Sales", email: "sales@crm.com", password: MOCK_PASSWORD, role: "SALES", provider: "LOCAL", emailVerified: true },
    { id: 3, fullName: "Lê Thu Support", email: "support@crm.com", password: MOCK_PASSWORD, role: "SUPPORT", provider: "LOCAL", emailVerified: true },
];

const googleUser: MockUserRecord = {
    id: 99,
    fullName: "Nguyễn Anh Sơn",
    email: "son@gmail.com",
    password: "",
    role: "SALES",
    provider: "GOOGLE",
    emailVerified: true,
};

function wait() {
    return new Promise<void>((resolve) => window.setTimeout(resolve, MOCK_DELAY_MS));
}

function toUser(record: MockUserRecord): User {
    return {
        id: record.id,
        fullName: record.fullName,
        email: record.email,
        role: record.role,
        provider: record.provider,
        emailVerified: record.emailVerified,
    };
}

function readUsers(): MockUserRecord[] {
    const storedUsers = localStorage.getItem(USERS_STORAGE_KEY);
    if (storedUsers) {
        try {
            const users = JSON.parse(storedUsers) as MockUserRecord[];
            if (Array.isArray(users)) return users;
        } catch {
            // Khôi phục seed data nếu dữ liệu development bị hỏng.
        }
    }

    const users = seedUsers.map((user) => ({ ...user }));
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    return users;
}

function writeUsers(users: MockUserRecord[]) {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
}

function createLoginResponse(user: MockUserRecord): LoginResponse {
    localStorage.setItem(CURRENT_USER_ID_KEY, String(user.id));
    return {
        accessToken: MOCK_ACCESS_TOKEN,
        refreshToken: MOCK_REFRESH_TOKEN,
        user: toUser(user),
    };
}

export async function mockRegister(data: RegisterRequest): Promise<User> {
    await wait();
    const users = readUsers();
    const normalizedEmail = data.email.trim().toLocaleLowerCase();
    if (users.some((user) => user.email.toLocaleLowerCase() === normalizedEmail)) {
        throw new MockAuthError("DUPLICATE_EMAIL", "Email đã được sử dụng");
    }

    const user: MockUserRecord = {
        id: users.reduce((largestId, item) => Math.max(largestId, item.id), 0) + 1,
        fullName: data.fullName.trim(),
        email: normalizedEmail,
        password: data.password,
        role: "SALES",
        provider: "LOCAL",
        emailVerified: false,
    };
    writeUsers([...users, user]);
    return toUser(user);
}

export async function mockLogin(data: LoginRequest): Promise<LoginResponse> {
    await wait();
    const normalizedEmail = data.email.trim().toLocaleLowerCase();
    const user = readUsers().find((candidate) => candidate.email.toLocaleLowerCase() === normalizedEmail);
    if (!user || user.password !== data.password || user.provider !== "LOCAL") {
        throw new MockAuthError("INVALID_CREDENTIALS", "Email hoặc mật khẩu không đúng");
    }
    if (!user.emailVerified) {
        throw new MockAuthError("EMAIL_NOT_VERIFIED", "Tài khoản chưa được xác nhận email.");
    }
    return createLoginResponse(user);
}

export async function mockLoginWithGoogle(): Promise<LoginResponse> {
    await wait();
    const users = readUsers();
    const existingUser = users.find((user) => user.email === googleUser.email);
    if (!existingUser) writeUsers([...users, googleUser]);
    return createLoginResponse(existingUser ?? googleUser);
}

export async function mockVerifyEmail(email: string): Promise<User> {
    await wait();
    const users = readUsers();
    const userIndex = users.findIndex((user) => user.email.toLocaleLowerCase() === email.trim().toLocaleLowerCase());
    if (userIndex === -1) throw new MockAuthError("USER_NOT_FOUND", "Không tìm thấy tài khoản");
    users[userIndex] = { ...users[userIndex], emailVerified: true };
    writeUsers(users);
    return toUser(users[userIndex]);
}

export async function mockResendVerification(email: string): Promise<void> {
    await wait();
    const user = readUsers().find((candidate) => candidate.email.toLocaleLowerCase() === email.trim().toLocaleLowerCase());
    if (!user) throw new MockAuthError("USER_NOT_FOUND", "Không tìm thấy tài khoản");
}

export async function mockForgotPassword(email: string): Promise<ForgotPasswordResponse> {
    await wait();
    const normalizedEmail = email.trim().toLocaleLowerCase();
    const user = readUsers().find((candidate) => candidate.email.toLocaleLowerCase() === normalizedEmail && candidate.provider === "LOCAL");
    if (!user) throw new MockAuthError("USER_NOT_FOUND", "Không tìm thấy tài khoản sử dụng email này");
    localStorage.setItem(RESET_EMAIL_KEY, normalizedEmail);
    return { resetToken: MOCK_RESET_TOKEN };
}

export async function mockResetPassword(token: string, newPassword: string): Promise<void> {
    await wait();
    const resetEmail = localStorage.getItem(RESET_EMAIL_KEY);
    if (token !== MOCK_RESET_TOKEN || !resetEmail) {
        throw new MockAuthError("INVALID_TOKEN", "Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn");
    }
    const users = readUsers();
    const userIndex = users.findIndex((user) => user.email === resetEmail && user.provider === "LOCAL");
    if (userIndex === -1) throw new MockAuthError("USER_NOT_FOUND", "Không tìm thấy tài khoản");
    users[userIndex] = { ...users[userIndex], password: newPassword };
    writeUsers(users);
    localStorage.removeItem(RESET_EMAIL_KEY);
}

export async function mockRefreshAccessToken(refreshToken: string): Promise<RefreshTokenResponse> {
    await wait();
    if (refreshToken !== MOCK_REFRESH_TOKEN) throw new MockAuthError("INVALID_TOKEN", "Phiên đăng nhập đã hết hạn");
    return { accessToken: `${MOCK_ACCESS_TOKEN}-${Date.now()}` };
}

export async function mockGetCurrentUser(): Promise<User> {
    await wait();
    const currentUserId = Number(localStorage.getItem(CURRENT_USER_ID_KEY));
    const user = readUsers().find((candidate) => candidate.id === currentUserId);
    if (!user) throw new MockAuthError("USER_NOT_FOUND", "Không tìm thấy phiên người dùng");
    return toUser(user);
}

export async function mockLogout(): Promise<void> {
    await wait();
    localStorage.removeItem(CURRENT_USER_ID_KEY);
}
