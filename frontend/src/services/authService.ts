import { z } from "zod";

import { authApi, ApiError } from "./api";
import {
    USER_ROLES,
    type ForgotPasswordRequest,
    type ForgotPasswordResponse,
    type LoginRequest,
    type LoginResponse,
    type RegisterRequest,
    type RegisterResponse,
    type ResetPasswordRequest,
    type ResetPasswordResponse,
    type UserRole,
    type UserStatus,
    type UserProfileResponse,
    type UpdateProfileRequest,
    type ChangePasswordData,
    type UserPreferencesData,
    type EmployeeRegisterData,
} from "../types/auth";

const responseFields = {
    username: z.string().trim().min(1),
    role: z.enum(USER_ROLES),
    message: z.string().optional().default(""),
};
const registerResponseSchema = z.object({ ...responseFields, token: z.null() });

const AUTH_USERS_STORAGE_KEY = "crm-soa.mock-auth-users";
const CRM_USERS_STORAGE_KEY = "crm-soa.users";

interface StoredAuthUser {
    id: number;
    username: string;
    fullName: string;
    email: string;
    password?: string;
    role: UserRole;
    status: UserStatus;
    createdAt: string;
}

function getStoredAuthUsers(): StoredAuthUser[] {
    try {
        const raw = localStorage.getItem(AUTH_USERS_STORAGE_KEY);
        if (!raw) return [];
        return JSON.parse(raw);
    } catch {
        return [];
    }
}

function saveStoredAuthUser(user: StoredAuthUser) {
    try {
        const list = getStoredAuthUsers();
        const userUsername = user.username ? user.username.trim().toLowerCase() : "";
        const userEmail = user.email ? user.email.trim().toLowerCase() : "";

        const index = list.findIndex((u) => {
            const uUsername = typeof u.username === "string" ? u.username.trim().toLowerCase() : "";
            const uEmail = typeof u.email === "string" ? u.email.trim().toLowerCase() : "";
            const uFullName = typeof u.fullName === "string" ? u.fullName.trim().toLowerCase() : "";

            return (
                (userUsername && (uUsername === userUsername || uFullName === userUsername)) ||
                (userEmail && uEmail === userEmail) ||
                (Boolean(u.id && user.id && u.id === user.id))
            );
        });

        if (index >= 0) {
            list[index] = { ...list[index], ...user };
        } else {
            list.push(user);
        }
        localStorage.setItem(AUTH_USERS_STORAGE_KEY, JSON.stringify(list));
    } catch {
        // Ignore localStorage error
    }
}

function saveToCrmUsers(user: { id: number; fullName: string; email: string; role: UserRole; status: UserStatus; createdAt: string; department?: string }) {
    try {
        const raw = localStorage.getItem(CRM_USERS_STORAGE_KEY);
        let list: Array<Record<string, unknown>> = [];
        if (raw) {
            try {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed)) list = parsed;
            } catch {
                // Ignore
            }
        }
        const emailLower = user.email.trim().toLowerCase();
        const index = list.findIndex(
            (u) => (typeof u.email === "string" && u.email.trim().toLowerCase() === emailLower) || u.id === user.id
        );
        if (index >= 0) {
            list[index] = { ...list[index], ...user };
        } else {
            list.unshift(user);
        }
        localStorage.setItem(CRM_USERS_STORAGE_KEY, JSON.stringify(list));
    } catch {
        // Ignore
    }
}

function findUserInStorage(identifier: string): StoredAuthUser | null {
    const idLower = identifier.trim().toLowerCase();
    
    // 1. Kiểm tra trong danh sách người dùng CRM (nơi Admin chỉnh sửa phân quyền)
    try {
        const rawCrm = localStorage.getItem(CRM_USERS_STORAGE_KEY);
        if (rawCrm) {
            const crmUsers: Array<Record<string, unknown>> = JSON.parse(rawCrm);
            const inCrm = crmUsers.find((u) => {
                const uEmail = typeof u.email === "string" ? u.email.trim().toLowerCase() : "";
                const uFullName = typeof u.fullName === "string" ? u.fullName.trim().toLowerCase() : "";
                return uEmail === idLower || uFullName === idLower;
            });

            if (inCrm) {
                const authUsers = getStoredAuthUsers();
                const inAuth = authUsers.find((u) => {
                    const uUsername = typeof u.username === "string" ? u.username.trim().toLowerCase() : "";
                    const uEmail = typeof u.email === "string" ? u.email.trim().toLowerCase() : "";
                    const uFullName = typeof u.fullName === "string" ? u.fullName.trim().toLowerCase() : "";
                    return uUsername === idLower || uEmail === idLower || uFullName === idLower || u.id === inCrm.id;
                });

                return {
                    id: (inCrm.id as number) || (inAuth?.id as number) || Date.now(),
                    username: (inAuth?.username as string) || (inCrm.fullName as string) || identifier,
                    fullName: (inCrm.fullName as string) || (inAuth?.fullName as string) || identifier,
                    email: (inCrm.email as string) || (inAuth?.email as string) || identifier,
                    password: inAuth?.password || "",
                    role: (inCrm.role as UserRole) || (inAuth?.role as UserRole) || "UNASSIGNED",
                    status: (inCrm.status as UserStatus) || (inAuth?.status as UserStatus) || "PENDING",
                    createdAt: (inCrm.createdAt as string) || (inAuth?.createdAt as string) || new Date().toISOString(),
                };
            }
        }
    } catch {
        // Ignore
    }

    // 2. Kiểm tra trong danh sách auth mock users
    const authUsers = getStoredAuthUsers();
    const inAuth = authUsers.find((u) => {
        const uUsername = typeof u.username === "string" ? u.username.trim().toLowerCase() : "";
        const uEmail = typeof u.email === "string" ? u.email.trim().toLowerCase() : "";
        const uFullName = typeof u.fullName === "string" ? u.fullName.trim().toLowerCase() : "";
        return uUsername === idLower || uEmail === idLower || uFullName === idLower;
    });

    return inAuth || null;
}

const DEMO_ACCOUNTS: Record<string, { role: "ADMIN" | "SALES" | "SUPPORT"; pass: string[]; username: string }> = {
    admin: { role: "ADMIN", pass: ["Admin@123456", "123456", "admin"], username: "admin" },
    "admin@crm.local": { role: "ADMIN", pass: ["Admin@123456", "123456", "admin"], username: "admin" },
    "son@crm.com": { role: "ADMIN", pass: ["123456", "Admin@123456"], username: "son" },
    sales: { role: "SALES", pass: ["Sales@123456", "123456", "Admin@123456"], username: "sales" },
    "sales@crm.local": { role: "SALES", pass: ["Sales@123456", "123456", "Admin@123456"], username: "sales" },
    "sales@crm.com": { role: "SALES", pass: ["Sales@123456", "123456", "Admin@123456"], username: "sales" },
    support: { role: "SUPPORT", pass: ["Support@123456", "123456", "Admin@123456"], username: "support" },
    "support@crm.local": { role: "SUPPORT", pass: ["Support@123456", "123456", "Admin@123456"], username: "support" },
    "support@crm.com": { role: "SUPPORT", pass: ["Support@123456", "123456", "Admin@123456"], username: "support" },
};

export const authService = {
    async login(data: LoginRequest): Promise<LoginResponse> {
        const input = data.username.trim().toLowerCase();

        // 1. Thử gửi request tới Backend Auth Service thật (nếu backend đang chạy)
        try {
            const identifier = data.username.trim();
            const response = await authApi.post<Record<string, unknown>>("/api/v1/auth/login", {
                email: identifier,
                password: data.password,
            });

            const raw = response.data;
            const role = (raw.role as UserRole) || "UNASSIGNED";
            const token = (raw.accessToken as string) || (raw.token as string);

            return {
                userId: typeof raw.userId === "number" ? raw.userId : undefined,
                username: (raw.username as string) || identifier,
                fullName: (raw.fullName as string) || undefined,
                email: (raw.email as string) || identifier,
                role,
                status: (raw.status as UserStatus) || "ACTIVE",
                isOwner: Boolean(raw.isOwner),
                companyName: (raw.companyName as string) || "STAPlus CRM",
                token,
                message: (raw.message as string) || "Đăng nhập thành công",
            };
        } catch (apiErr: unknown) {
            // Nếu backend đang chạy và trả về lỗi thật (400, 401, 403, 404, 500)
            if (apiErr instanceof ApiError && apiErr.status > 0) {
                const lower = apiErr.message.toLowerCase();
                if (apiErr.status === 401 && lower.includes("invalid credentials")) {
                    throw new Error("Tài khoản hoặc mật khẩu không chính xác. Vui lòng kiểm tra lại.");
                }
                if (apiErr.status === 404 && lower.includes("user not found")) {
                    throw new Error("Tài khoản không tồn tại trong hệ thống.");
                }
                throw new Error(apiErr.message);
            }

            // 2. Backend offline: Xác thực với tài khoản nội bộ
            // 2a. Kiểm tra tài khoản đã đăng ký (hoặc đã lưu)
            const localUser = findUserInStorage(data.username);
            if (localUser) {
                if (localUser.password && localUser.password !== data.password) {
                    throw new Error("Mật khẩu không chính xác. Vui lòng thử lại.");
                }

                if (localUser.status === "INACTIVE") {
                    throw new Error("Tài khoản đã bị vô hiệu hóa. Vui lòng liên hệ ADMIN.");
                }

                if (localUser.status !== "ACTIVE" || localUser.role === "UNASSIGNED") {
                    throw new Error("Tài khoản đang chờ ADMIN duyệt và kích hoạt.");
                }

                const role: UserRole = localUser.role;
                return {
                    username: localUser.username,
                    role,
                    token: `demo-${role.toLowerCase()}-token`,
                    message: "Đăng nhập thành công",
                };
            }

            // 2b. Kiểm tra danh sách tài khoản mẫu (Admin, Sales, Support)
            const demo = DEMO_ACCOUNTS[input];
            if (demo) {
                if (demo.pass.includes(data.password)) {
                    return {
                        username: demo.username,
                        role: demo.role,
                        token: `demo-${demo.role.toLowerCase()}-token`,
                        message: "Đăng nhập thành công",
                    };
                }
                throw new Error("Mật khẩu tài khoản mẫu không chính xác.");
            }

            // 2c. Nếu tài khoản chưa có trong hệ thống và mật khẩu >= 6:
            // Tự động tạo với vai trò UNASSIGNED và trạng thái PENDING để Admin phê duyệt
            if (data.password.trim().length >= 6) {
                const newUser: StoredAuthUser = {
                    id: Date.now(),
                    username: data.username,
                    fullName: data.username,
                    email: data.username.includes("@") ? data.username : `${data.username}@crm.local`,
                    password: data.password,
                    role: input === "admin" ? "ADMIN" : "UNASSIGNED",
                    status: input === "admin" ? "ACTIVE" : "PENDING",
                    createdAt: new Date().toISOString(),
                };
                saveStoredAuthUser(newUser);
                saveToCrmUsers({
                    id: newUser.id,
                    fullName: newUser.fullName,
                    email: newUser.email,
                    role: newUser.role,
                    status: newUser.status,
                    createdAt: newUser.createdAt,
                    department: "Chưa phân bổ",
                });

                if (newUser.role === "UNASSIGNED" || newUser.status !== "ACTIVE") {
                    throw new Error("Tài khoản đang chờ ADMIN duyệt và kích hoạt.");
                }

                return {
                    username: newUser.username,
                    role: newUser.role,
                    token: `demo-${newUser.role.toLowerCase()}-token`,
                    message: "Đăng nhập thành công",
                };
            }

            throw new Error("Tài khoản chưa tồn tại hoặc mật khẩu dưới 6 ký tự.");
        }

        throw new Error("Tài khoản hoặc mật khẩu không chính xác.");
    },

    async register(data: RegisterRequest): Promise<RegisterResponse> {
        const normalizedEmail = data.email.trim().toLowerCase();
        const trimmedUsername = data.username.trim();
        // Gửi tới backend nếu backend có chạy
        try {
            const response = await authApi.post<Record<string, unknown>>("/api/v1/auth/register", {
                username: trimmedUsername,
                email: normalizedEmail,
                password: data.password,
            });
            const raw = response.data;
            const normalized = {
                username: (raw.username as string) || trimmedUsername,
                role: (raw.role as UserRole) || "UNASSIGNED",
                token: null,
                message: (raw.message as string) || "Đăng ký thành công",
            };
            const result = registerResponseSchema.safeParse(normalized);
            if (result.success) {
                return result.data;
            }
        } catch (apiError: unknown) {
            // Nếu Backend trả về lỗi (409, 422, 400, 500...) -> ném lỗi thật ra UI
            if (apiError instanceof ApiError && apiError.status > 0) {
                const msg = apiError.message.toLowerCase();
                if (msg.includes("email already exists") || (msg.includes("email") && msg.includes("exists"))) {
                    throw new Error("Email này đã được sử dụng. Vui lòng đăng nhập hoặc dùng email khác.", { cause: apiError });
                }
                if (msg.includes("username already exists") || (msg.includes("username") && msg.includes("exists"))) {
                    throw new Error("Tên đăng nhập này đã tồn tại. Vui lòng chọn tên đăng nhập khác.", { cause: apiError });
                }
                throw apiError;
            }
            if (import.meta.env.VITE_AUTH_API_BASE_URL) {
                throw apiError instanceof Error
                    ? apiError
                    : new Error("Không thể kết nối đến Auth Service để đăng ký.");
            }
        }

        // Chế độ Offline/Demo: Kiểm tra trùng lặp email và username trong hệ thống
        const existingEmail = findUserInStorage(data.email);
        if (existingEmail) {
            throw new Error("Email này đã được sử dụng. Vui lòng đăng nhập hoặc dùng email khác.");
        }
        const existingUsername = findUserInStorage(data.username);
        if (existingUsername) {
            throw new Error("Tên đăng nhập này đã tồn tại. Vui lòng chọn tên đăng nhập khác.");
        }

        // Tài khoản mới đăng ký LUÔN là UNASSIGNED và PENDING để Admin duyệt và phân quyền
        const newUser: StoredAuthUser = {
            id: Date.now(),
            username: data.username,
            fullName: data.username,
            email: data.email,
            password: data.password,
            role: "UNASSIGNED",
            status: "PENDING",
            createdAt: new Date().toISOString(),
        };

        saveStoredAuthUser(newUser);
        saveToCrmUsers({
            id: newUser.id,
            fullName: newUser.fullName,
            email: newUser.email,
            role: newUser.role,
            status: newUser.status,
            createdAt: newUser.createdAt,
            department: "Chưa phân bổ",
        });

        return {
            username: data.username,
            role: "UNASSIGNED",
            token: null,
            message: "Đăng ký thành công (Chờ Admin phân quyền)",
        };
    },

    async registerEmployee(data: EmployeeRegisterData): Promise<RegisterResponse> {
        const normalizedEmail = data.email.trim().toLowerCase();
        try {
            const response = await authApi.post<Record<string, unknown>>("/api/v1/auth/register/employee", {
                fullName: data.fullName.trim(),
                email: normalizedEmail,
                password: data.password,
                confirmPassword: data.confirmPassword || data.password,
                invitationCode: data.invitationCode.trim().toUpperCase(),
            });
            const raw = response.data;
            return {
                username: (raw.username as string) || normalizedEmail.split("@")[0],
                role: "UNASSIGNED",
                status: "PENDING",
                token: null,
                message: (raw.message as string) || "Đăng ký tham gia thành công, đang chờ Quản trị viên duyệt",
            };
        } catch (apiErr: unknown) {
            if (apiErr instanceof ApiError && apiErr.status > 0) {
                throw new Error(apiErr.message);
            }
            if (apiErr instanceof Error) {
                throw apiErr;
            }
            throw new Error("Không thể kết nối đến máy chủ để gửi yêu cầu đăng ký.");
        }
    },

    async forgotPassword(data: ForgotPasswordRequest): Promise<ForgotPasswordResponse> {
        const trimmedEmail = data.email.trim().toLowerCase();

        // 1. Gọi backend Auth Service thật
        try {
            await authApi.post<{ message?: string }>("/api/v1/auth/forgot-password", {
                email: trimmedEmail,
            });

            return {
                message: "Mã OTP đã được gửi về email của bạn.",
            };
        } catch (apiError) {
            if (apiError instanceof ApiError && apiError.status > 0) {
                throw apiError;
            }
            if (import.meta.env.VITE_AUTH_API_BASE_URL) {
                throw apiError instanceof Error
                    ? apiError
                    : new Error("Không thể kết nối đến Auth Service để gửi OTP.");
            }

            // 2. Chế độ Offline khi chưa cấu hình VITE_AUTH_API_BASE_URL
            const registeredEmails = [
                "admin@crm.local",
                "son@crm.com",
                "sales@crm.com",
                "support@crm.com",
                "tranminh@crm.local",
            ];
            const storedUsers = getStoredAuthUsers();
            const exists =
                registeredEmails.includes(trimmedEmail) ||
                storedUsers.some((u) => u.email && u.email.toLowerCase() === trimmedEmail);

            if (!exists) {
                throw new Error("Email này chưa được đăng ký trong hệ thống.");
            }

            const mockToken = `demo-token-${Date.now().toString(36)}`;
            localStorage.setItem(`crm-soa.reset-token.${mockToken}`, trimmedEmail);

            return {
                message: "Mã OTP đã được gửi về email của bạn.",
                resetToken: mockToken,
            };
        }
    },

    async resetPassword(data: ResetPasswordRequest): Promise<ResetPasswordResponse> {
        const trimmedEmail = data.email.trim().toLowerCase();
        const trimmedToken = data.token.trim();
        const newPassword = data.newPassword;

        if (trimmedToken.startsWith("demo-token-") && !import.meta.env.VITE_AUTH_API_BASE_URL) {
            const associatedEmail = localStorage.getItem(`crm-soa.reset-token.${trimmedToken}`);
            if (!associatedEmail) {
                throw new Error("Mã xác thực token không hợp lệ hoặc đã hết hạn.");
            }
            const list = getStoredAuthUsers();
            const index = list.findIndex((u) => (u.email || "").toLowerCase() === associatedEmail.toLowerCase());
            if (index >= 0) {
                list[index].password = newPassword;
                localStorage.setItem(AUTH_USERS_STORAGE_KEY, JSON.stringify(list));
            }
            localStorage.removeItem(`crm-soa.reset-token.${trimmedToken}`);
            return { message: "Đặt lại mật khẩu thành công (Chế độ Demo)." };
        }

        // Gọi backend Auth Service thật — tuyệt đối không nuốt lỗi để báo thành công giả
        try {
            const response = await authApi.post<{ message?: string }>("/api/v1/auth/reset-password", {
                email: trimmedEmail,
                token: trimmedToken,
                newPassword,
            });

            // Xóa cache mock password cũ nếu tồn tại trong localStorage
            const list = getStoredAuthUsers();
            const filtered = list.filter((u) => (u.email || "").toLowerCase() !== trimmedEmail);
            if (filtered.length !== list.length) {
                localStorage.setItem(AUTH_USERS_STORAGE_KEY, JSON.stringify(filtered));
            }

            return {
                message: response.data?.message || "Đặt lại mật khẩu thành công.",
            };
        } catch (apiError) {
            if (apiError instanceof Error) {
                const rawMsg = apiError.message;
                if (rawMsg.toLowerCase().includes("invalid or expired otp")) {
                    throw new Error("Mã OTP không chính xác hoặc đã hết hạn. Vui lòng kiểm tra lại.", { cause: apiError });
                }
                throw apiError;
            }
            throw new Error("Không thể đặt lại mật khẩu. Vui lòng thử lại.");
        }
    },

    async getMe(): Promise<UserProfileResponse> {
        try {
            const { data } = await authApi.get<UserProfileResponse>("/api/v1/auth/me");
            return data;
        } catch (error) {
            if (error instanceof ApiError) throw error;
            throw new Error("Không thể tải thông tin tài khoản.");
        }
    },

    async updateProfile(payload: UpdateProfileRequest): Promise<UserProfileResponse> {
        try {
            const { data } = await authApi.put<UserProfileResponse>("/api/v1/auth/profile", payload);
            return data;
        } catch (error) {
            if (error instanceof ApiError) throw error;
            throw new Error("Không thể cập nhật hồ sơ cá nhân.");
        }
    },

    async changePassword(payload: ChangePasswordData): Promise<void> {
        try {
            await authApi.patch("/api/v1/auth/password", payload);
        } catch (error) {
            if (error instanceof ApiError) throw error;
            throw new Error("Không thể đổi mật khẩu.");
        }
    },

    async getPreferences(): Promise<UserPreferencesData> {
        try {
            const { data } = await authApi.get<UserPreferencesData>("/api/v1/auth/preferences");
            return data;
        } catch (error) {
            if (error instanceof ApiError) throw error;
            return {
                chatToast: true,
                chatSound: true,
                chatBrowser: false,
                chatGroupEvents: true,
                notifyLeadAssigned: true,
                notifyDealStage: true,
                notifyTicket: true,
                notifySystem: true,
                reminderBefore: "15m",
                themeMode: "light",
                tableDensity: "comfortable",
                sidebarCollapsed: false,
                dateFormat: "dd/MM/yyyy",
            };
        }
    },

    async updatePreferences(payload: Partial<UserPreferencesData>): Promise<UserPreferencesData> {
        try {
            const { data } = await authApi.put<UserPreferencesData>("/api/v1/auth/preferences", payload);
            return data;
        } catch (error) {
            if (error instanceof ApiError) throw error;
            throw new Error("Không thể lưu cấu hình.");
        }
    },
};



// import { z } from "zod";
// import { authApi, ApiError } from "./api";
// import { USER_ROLES, type LoginRequest, type LoginResponse, type RegisterRequest, type RegisterResponse } from "../types/auth";

// const loginResponseSchema = z.object({
//     username: z.string().trim().min(1),
//     role: z.enum(USER_ROLES),
//     token: z.string().trim().min(1),
//     message: z.string().optional().default(""),
// });

// export const authService = {
//     async login(data: LoginRequest): Promise<LoginResponse> {
//         const email = data.username.includes("@") ? data.username : `${data.username}@crm.local`;
//         // Lỗi ApiError (có message từ BE) được ném thẳng ra, không nuốt nữa.
//         const { data: raw } = await authApi.post<Record<string, unknown>>("/api/v1/auth/login", {
//             email,
//             password: data.password,
//         });
//         const parsed = loginResponseSchema.safeParse({
//             username: raw.username ?? data.username,
//             role: raw.role ?? "UNASSIGNED",
//             token: raw.accessToken ?? raw.token,
//             message: "Đăng nhập thành công",
//         });
//         if (!parsed.success) {
//             console.error("Login response không khớp schema:", raw, parsed.error);
//             throw new Error("Phản hồi đăng nhập từ server không hợp lệ.");
//         }
//         return parsed.data;
//     },

//     async register(data: RegisterRequest): Promise<RegisterResponse> {
//         const { data: raw } = await authApi.post<Record<string, unknown>>("/api/v1/auth/register", {
//             username: data.username,
//             email: data.email,
//             password: data.password,
//         });
//         return {
//             username: (raw.username as string) ?? data.username,
//             role: (raw.role as RegisterResponse["role"]) ?? "UNASSIGNED",
//             token: null,
//             message: "Đăng ký thành công",
//         };
//     },
// };  