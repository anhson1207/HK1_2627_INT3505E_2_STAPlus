import { z } from "zod";

import { authApi } from "./api";
import { USER_ROLES, type LoginRequest, type LoginResponse, type RegisterRequest, type RegisterResponse, type UserRole, type UserStatus } from "../types/auth";

const responseFields = {
    username: z.string().trim().min(1),
    role: z.enum(USER_ROLES),
    message: z.string().optional().default(""),
};
const loginResponseSchema = z.object({ ...responseFields, token: z.string().trim().min(1) });
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
        // Tài khoản mới đăng ký LUÔN là UNASSIGNED và PENDING để Admin duyệt và phân quyền
        saveStoredAuthUser({
            id: Date.now(),
            username: data.username,
            fullName: data.username,
            email: data.email,
            password: data.password,
            role: "UNASSIGNED",
            status: "PENDING",
            createdAt: new Date().toISOString(),
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
                role: (raw.role as UserRole) || "UNASSIGNED",
                token: null,
                message: (raw.message as string) || "Đăng ký thành công",
            };
            const result = registerResponseSchema.safeParse(normalized);
            if (result.success) return result.data;
        } catch {
            return {
                username: data.username,
                role: "UNASSIGNED",
                token: null,
                message: "Đăng ký thành công (Chờ Admin phân quyền)",
            };
        }
        return {
            username: data.username,
            role: "UNASSIGNED",
            token: null,
            message: "Đăng ký thành công (Chờ Admin phân quyền)",
        };
    },
};
