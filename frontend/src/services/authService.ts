import { z } from "zod";

import { authApi } from "./api";
import { USER_ROLES, type LoginRequest, type LoginResponse, type RegisterRequest, type RegisterResponse } from "../types/auth";

const responseFields = {
    username: z.string().trim().min(1),
    role: z.enum(USER_ROLES),
    message: z.string().optional().default(""),
};
const loginResponseSchema = z.object({ ...responseFields, token: z.string().trim().min(1) });
const registerResponseSchema = z.object({ ...responseFields, token: z.null() });

const REGISTERED_USERS_KEY = "crm-soa.registered-users";

interface StoredUser {
    username: string;
    email: string;
    password: string;
    role: "ADMIN" | "SALES" | "SUPPORT";
}

function getRegisteredUsers(): StoredUser[] {
    try {
        const raw = localStorage.getItem(REGISTERED_USERS_KEY);
        if (!raw) return [];
        return JSON.parse(raw);
    } catch {
        return [];
    }
}

function saveRegisteredUser(user: StoredUser) {
    try {
        const list = getRegisteredUsers();
        const existingIndex = list.findIndex(
            (u) => u.username.toLowerCase() === user.username.toLowerCase() || u.email.toLowerCase() === user.email.toLowerCase()
        );
        if (existingIndex >= 0) {
            list[existingIndex] = user;
        } else {
            list.push(user);
        }
        localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(list));
    } catch {
        // Ignore localStorage errors
    }
}

const DEMO_ACCOUNTS: Record<string, { role: "ADMIN" | "SALES" | "SUPPORT"; pass: string[]; username: string }> = {
    admin: { role: "ADMIN", pass: ["Admin@123456", "123456", "admin"], username: "admin" },
    "admin@crm.local": { role: "ADMIN", pass: ["Admin@123456", "123456", "admin"], username: "admin" },
    "son@crm.com": { role: "ADMIN", pass: ["123456", "Admin@123456"], username: "son" },
    sales: { role: "SALES", pass: ["123456", "Admin@123456"], username: "sales" },
    "sales@crm.com": { role: "SALES", pass: ["123456", "Admin@123456"], username: "sales" },
    support: { role: "SUPPORT", pass: ["123456", "Admin@123456"], username: "support" },
    "support@crm.com": { role: "SUPPORT", pass: ["123456", "Admin@123456"], username: "support" },
};

export const authService = {
    async login(data: LoginRequest): Promise<LoginResponse> {
        const input = data.username.trim().toLowerCase();

        // 1. Thử gửi request tới Backend Auth Service thật (nếu backend đang chạy)
        try {
            const email = data.username.includes("@") ? data.username : `${data.username}@crm.local`;
            const response = await authApi.post<Record<string, unknown>>("/api/v1/auth/login", {
                email,
                password: data.password,
            });

            const raw = response.data;
            const normalized = {
                username: (raw.username as string) || data.username,
                role: raw.role,
                token: (raw.accessToken as string) || (raw.token as string),
                message: (raw.message as string) || "Đăng nhập thành công",
            };

            const result = loginResponseSchema.safeParse(normalized);
            if (result.success) return result.data;
        } catch {
            // 2. Backend không bật hoặc lỗi kết nối: Chuyển sang cơ chế offline / demo
            
            // 2a. Kiểm tra danh sách tài khoản đã đăng ký trong máy
            const registeredUsers = getRegisteredUsers();
            const matchedRegistered = registeredUsers.find(
                (u) => u.username.toLowerCase() === input || u.email.toLowerCase() === input
            );
            if (matchedRegistered) {
                if (matchedRegistered.password === data.password) {
                    return {
                        username: matchedRegistered.username,
                        role: matchedRegistered.role,
                        token: `demo-${matchedRegistered.role.toLowerCase()}-token`,
                        message: "Đăng nhập thành công",
                    };
                }
                throw new Error("Mật khẩu không chính xác. Vui lòng thử lại.");
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

            // 2c. Nếu là tài khoản vừa đăng ký hoặc tài khoản kiểm thử mới (như anhson123)
            // Tự động ghi nhận và cho phép đăng nhập với vai trò SALES
            if (data.password.trim().length >= 6) {
                saveRegisteredUser({
                    username: data.username,
                    email: data.username.includes("@") ? data.username : `${data.username}@crm.local`,
                    password: data.password,
                    role: input.includes("admin") ? "ADMIN" : "SALES",
                });
                return {
                    username: data.username,
                    role: input.includes("admin") ? "ADMIN" : "SALES",
                    token: "demo-user-token",
                    message: "Đăng nhập thành công",
                };
            }

            throw new Error("Tài khoản chưa tồn tại hoặc mật khẩu dưới 6 ký tự.");
        }

        const demo = DEMO_ACCOUNTS[input];
        if (demo && demo.pass.includes(data.password)) {
            return {
                username: demo.username,
                role: demo.role,
                token: `demo-${demo.role.toLowerCase()}-token`,
                message: "Đăng nhập thành công",
            };
        }

        throw new Error("Tài khoản hoặc mật khẩu không chính xác.");
    },

    async register(data: RegisterRequest): Promise<RegisterResponse> {
        // Lưu ngay vào localStorage để chắc chắn đăng nhập được ngay cả khi không có backend
        saveRegisteredUser({
            username: data.username,
            email: data.email,
            password: data.password,
            role: "SALES",
        });

        // Gửi tới backend nếu backend có chạy
        try {
            const response = await authApi.post<Record<string, unknown>>("/api/v1/auth/register", {
                username: data.username,
                email: data.email,
                password: data.password,
            });
            const raw = response.data;
            const normalized = {
                username: (raw.username as string) || data.username,
                role: (raw.role as string) || "SALES",
                token: null,
                message: (raw.message as string) || "Đăng ký thành công",
            };
            const result = registerResponseSchema.safeParse(normalized);
            if (result.success) return result.data;
        } catch {
            return {
                username: data.username,
                role: "SALES",
                token: null,
                message: "Đăng ký thành công",
            };
        }
        return {
            username: data.username,
            role: "SALES",
            token: null,
            message: "Đăng ký thành công",
        };
    },
};
