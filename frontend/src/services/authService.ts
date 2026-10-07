import { z } from "zod";

import { authApi } from "./api";
import { USER_ROLES, type LoginRequest, type LoginResponse, type RegisterRequest, type RegisterResponse } from "../types/auth";

const responseFields = {
    username: z.string().trim().min(1),
    role: z.enum(USER_ROLES),
    message: z.string(),
};
const loginResponseSchema = z.object({ ...responseFields, token: z.string().trim().min(1) });
const registerResponseSchema = z.object({ ...responseFields, token: z.null() });

export const authService = {
    async login(data: LoginRequest): Promise<LoginResponse> {
        // Requested username contract; backend 9956ef1 still needs to replace email login.
        const response = await authApi.post<unknown>("/api/auth/login", {
            username: data.username,
            password: data.password,
        });
        const result = loginResponseSchema.safeParse(response.data);
        if (!result.success) throw new Error("Phản hồi đăng nhập không hợp lệ: thiếu token, username hoặc role không được hỗ trợ.");
        return result.data;
    },
    async register(data: RegisterRequest): Promise<RegisterResponse> {
        const response = await authApi.post<unknown>("/api/auth/register", {
            username: data.username,
            email: data.email,
            password: data.password,
        });
        const result = registerResponseSchema.safeParse(response.data);
        if (!result.success) throw new Error("Phản hồi đăng ký không khớp AuthResponse của backend.");
        return result.data;
    },
};
