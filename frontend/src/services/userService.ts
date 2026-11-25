import { isAxiosError } from "axios";
import api from "./api";
import { isUserRole, type User } from "../types/auth";
import type {
    CRMUser,
    CRMUserPayload,
    UserRole,
    UserStatus,
} from "../types/user";

export interface BackendUserResponse {
    id: number;
    username: string;
    email: string;
    role: "ADMIN" | "SALES" | "SUPPORT" | "MANAGER" | string | null;
    status: "ACTIVE" | "DISABLED" | "PENDING" | "REJECTED" | string;
    fullName?: string | null;
    phone?: string | null;
    department?: string | null;
    avatarUrl?: string | null;
    createdAt?: string | null;
    isOwner?: boolean;
}

export interface UpdateRolePayload {
    role: "ADMIN" | "SALES" | "SUPPORT" | "MANAGER" | string;
}

export interface UpdateStatusPayload {
    status: "ACTIVE" | "DISABLED";
}

function toBackendStatus(status: UserStatus): "ACTIVE" | "DISABLED" | "PENDING" | "REJECTED" {
    if (status === "INACTIVE" || status === "DISABLED") return "DISABLED";
    if (status === "PENDING") return "PENDING";
    if (status === "REJECTED") return "REJECTED";
    return "ACTIVE";
}

function extractUserError(error: unknown, fallback: string): Error {
    if (isAxiosError<{ message?: string; error?: string }>(error)) {
        const msg = error.response?.data?.message || error.response?.data?.error;
        if (msg) return new Error(msg);
    }
    return error instanceof Error ? error : new Error(fallback);
}

export function mapBackendUser(data: BackendUserResponse): CRMUser {
    const status: UserStatus =
        data.status === "ACTIVE"
            ? "ACTIVE"
            : data.status === "DISABLED"
              ? "INACTIVE"
              : data.status === "REJECTED"
                ? "REJECTED"
                : "PENDING";

    const role: UserRole = isUserRole(data.role) ? data.role : "UNASSIGNED";

    const defaultDepartment =
        role === "ADMIN"
            ? "Quản trị hệ thống"
            : role === "SALES"
              ? "Kinh doanh"
              : role === "SUPPORT"
                ? "Hỗ trợ kỹ thuật"
                : role === "MANAGER"
                  ? "Quản lý kinh doanh"
                  : "Chưa phân bổ";

    return {
        id: data.id,
        username: data.username,
        fullName: data.fullName?.trim() || data.username || data.email,
        email: data.email,
        phone: data.phone ?? "",
        department: data.department?.trim() || defaultDepartment,
        role,
        status,
        avatar: data.avatarUrl ?? "",
        createdAt: data.createdAt || new Date().toISOString(),
    };
}

export const userService = {
    ensureCurrentUser: async (authUser: User): Promise<CRMUser> => ({
        id: authUser.id,
        fullName: authUser.fullName,
        email: authUser.email,
        role: authUser.role,
        status: authUser.status ?? "ACTIVE",
        createdAt: new Date().toISOString(),
    }),

    // GET /api/v1/users
    getUsers: async (): Promise<CRMUser[]> => {
        try {
            const response = await api.get<BackendUserResponse[]>("/users");
            const list = Array.isArray(response.data) ? response.data : [];
            return list.map(mapBackendUser);
        } catch (error) {
            throw extractUserError(error, "Không thể tải danh sách người dùng.");
        }
    },

    // GET /api/v1/users/{id}
    getUserById: async (id: number): Promise<CRMUser> => {
        try {
            const response = await api.get<BackendUserResponse>(`/users/${id}`);
            return mapBackendUser(response.data);
        } catch (error) {
            throw extractUserError(error, "Không tìm thấy người dùng.");
        }
    },

    // POST /api/v1/users
    createUser: async (data: CRMUserPayload & { password?: string }): Promise<CRMUser> => {
        if (data.role === "UNASSIGNED" && data.status === "ACTIVE") {
            throw new Error("Không thể kích hoạt tài khoản chưa được phân vai trò.");
        }

        try {
            const response = await api.post<BackendUserResponse>("/users", {
                fullName: data.fullName.trim(),
                email: data.email.trim().toLowerCase(),
                phone: data.phone?.trim() || undefined,
                department: data.department?.trim() || undefined,
                avatar: data.avatar?.trim() || undefined,
                role: data.role === "UNASSIGNED" ? null : data.role,
                status: toBackendStatus(data.status),
                password: data.password?.trim() || undefined,
            });
            return mapBackendUser(response.data);
        } catch (error) {
            throw extractUserError(error, "Không thể tạo tài khoản người dùng.");
        }
    },

    // PUT /api/v1/users/{id}
    updateUser: async (id: number, data: CRMUserPayload): Promise<CRMUser> => {
        if (data.role === "UNASSIGNED" && data.status === "ACTIVE") {
            throw new Error("Không thể kích hoạt tài khoản chưa được phân vai trò.");
        }

        try {
            const response = await api.put<BackendUserResponse>(`/users/${id}`, {
                fullName: data.fullName.trim(),
                email: data.email.trim().toLowerCase(),
                phone: data.phone?.trim() || undefined,
                department: data.department?.trim() || undefined,
                avatar: data.avatar?.trim() || undefined,
                role: data.role === "UNASSIGNED" ? null : data.role,
                status: toBackendStatus(data.status),
            });
            return mapBackendUser(response.data);
        } catch (error) {
            throw extractUserError(error, "Không thể cập nhật thông tin người dùng.");
        }
    },

    // PATCH /api/v1/users/{id}/status -> DISABLED
    deactivateUser: async (id: number): Promise<CRMUser> => {
        try {
            const response = await api.patch<BackendUserResponse>(`/users/${id}/status`, {
                status: "DISABLED",
            });
            return mapBackendUser(response.data);
        } catch (error) {
            throw extractUserError(error, "Không thể ngừng hoạt động tài khoản.");
        }
    },

    // PATCH /api/v1/users/{id}/status -> ACTIVE
    activateUser: async (id: number): Promise<CRMUser> => {
        try {
            const response = await api.patch<BackendUserResponse>(`/users/${id}/status`, {
                status: "ACTIVE",
            });
            return mapBackendUser(response.data);
        } catch (error) {
            throw extractUserError(error, "Không thể kích hoạt tài khoản.");
        }
    },

    // PATCH /api/v1/users/{id}/role
    updateUserRole: async (id: number, role: UserRole): Promise<CRMUser> => {
        if (role === "UNASSIGNED") {
            throw new Error("Hãy chọn vai trò hợp lệ trước khi lưu.");
        }

        try {
            const response = await api.patch<BackendUserResponse>(`/users/${id}/role`, { role });
            return mapBackendUser(response.data);
        } catch (error) {
            throw extractUserError(error, "Không thể cập nhật vai trò người dùng.");
        }
    },
};
