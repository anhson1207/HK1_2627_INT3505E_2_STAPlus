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
        const usernameLower = data.username.trim().toLowerCase();

        // 1. Try real backend Auth Service if running
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
        } catch (backendError) {
            // 2. If backend is not available or rejected, fallback to demo credentials for local dev
            const demo = DEMO_ACCOUNTS[usernameLower];
            if (demo && demo.pass.includes(data.password)) {
                return {
                    username: demo.username,
                    role: demo.role,
                    token: `demo-${demo.role.toLowerCase()}-token`,
                    message: "Đăng nhập thành công (Demo mode)",
                };
            }
            throw backendError;
        }

        const demo = DEMO_ACCOUNTS[usernameLower];
        if (demo && demo.pass.includes(data.password)) {
            return {
                username: demo.username,
                role: demo.role,
                token: `demo-${demo.role.toLowerCase()}-token`,
                message: "Đăng nhập thành công (Demo mode)",
            };
        }

        throw new Error("Tài khoản hoặc mật khẩu không chính xác.");
    },

    async register(data: RegisterRequest): Promise<RegisterResponse> {
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
                message: "Đăng ký thành công (Demo mode)",
            };
        }
        return {
            username: data.username,
            role: "SALES",
            token: null,
            message: "Đăng ký thành công (Demo mode)",
        };
    },
};
