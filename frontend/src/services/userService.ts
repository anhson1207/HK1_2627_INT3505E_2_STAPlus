import api from "./api";
import { mockUsers } from "../mocks/users";
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
    role: "ADMIN" | "SALES" | "SUPPORT" | string;
    status: "ACTIVE" | "DISABLED" | string;
}

export interface UpdateRolePayload {
    role: "ADMIN" | "SALES" | "SUPPORT" | string;
}

export interface UpdateStatusPayload {
    status: "ACTIVE" | "DISABLED";
}

const STORAGE_KEY = "crm-soa.users";
const AUTH_USERS_STORAGE_KEY = "crm-soa.mock-auth-users";

const wait = (ms = 100) =>
    new Promise<void>((resolve) => window.setTimeout(resolve, ms));

function read(): CRMUser[] {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);

        if (raw) {
            const parsed: unknown = JSON.parse(raw);
            if (Array.isArray(parsed)) {
                return parsed.filter((item) => item && isUserRole(item.role)) as CRMUser[];
            }
        }
    } catch {
        // Restore mock users.
    }

    const seed = mockUsers.map((item) => ({ ...item }));
    write(seed);
    return seed;
}

function write(items: CRMUser[]) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

function readAuthUsers(): Array<Record<string, unknown>> {
    try {
        const raw = localStorage.getItem(AUTH_USERS_STORAGE_KEY);

        if (!raw) return [];

        const parsed: unknown = JSON.parse(raw);

        if (Array.isArray(parsed)) {
            return parsed as Array<Record<string, unknown>>;
        }
    } catch {
        // Ignore invalid mock auth data.
    }

    return [];
}

function writeAuthUsers(users: Array<Record<string, unknown>>) {
    localStorage.setItem(AUTH_USERS_STORAGE_KEY, JSON.stringify(users));
}

function syncAuthUser(user: CRMUser) {
    const authUsers = readAuthUsers();
    const userEmail = typeof user.email === "string" ? user.email.trim().toLowerCase() : "";
    const index = authUsers.findIndex((item) => {
        const itemEmail = typeof item.email === "string" ? item.email.trim().toLowerCase() : "";
        return (Boolean(item.id && user.id && item.id === user.id)) || (Boolean(userEmail && itemEmail === userEmail));
    });

    if (index === -1) return;

    authUsers[index] = {
        ...authUsers[index],
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        status: user.status,
    };

    writeAuthUsers(authUsers);
}

function syncRegisteredUsers(): CRMUser[] {
    const managementUsers = read();
    const authUsers = readAuthUsers();
    const result = [...managementUsers];
    let changed = false;

    for (const authUser of authUsers) {
        const rawEmail = typeof authUser.email === "string" ? authUser.email : "";
        const email = rawEmail.trim().toLocaleLowerCase();
        if (!email) continue;

        const displayName = typeof authUser.fullName === "string" && authUser.fullName.trim()
            ? authUser.fullName.trim()
            : typeof authUser.username === "string" && authUser.username.trim()
                ? authUser.username.trim()
                : email;

        const existingIndex = result.findIndex(
            (item) => item.email && item.email.trim().toLocaleLowerCase() === email
        );

        if (existingIndex !== -1) {
            continue;
        }

        const role: UserRole =
            authUser.role === "ADMIN" ||
            authUser.role === "SALES" ||
            authUser.role === "SUPPORT" ||
            authUser.role === "UNASSIGNED"
                ? authUser.role
                : "UNASSIGNED";

        const status: CRMUser["status"] =
            authUser.status === "ACTIVE" ||
            authUser.status === "INACTIVE" ||
            authUser.status === "PENDING"
                ? authUser.status
                : "PENDING";

        // Đưa tài khoản mới đăng ký lên đầu danh sách để Admin thấy ngay lập tức
        result.unshift({
            id: typeof authUser.id === "number" ? authUser.id : Date.now(),
            fullName: displayName,
            email,
            role,
            status,
            createdAt:
                typeof authUser.createdAt === "string"
                    ? authUser.createdAt
                    : new Date().toISOString(),
        });

        changed = true;
    }

    if (changed) {
        write(result);
    }

    return result;
}

function ensureUniqueEmail(
    items: CRMUser[],
    email: string,
    excludeId?: number
) {
    if (
        items.some(
            (item) =>
                item.id !== excludeId &&
                item.email.toLocaleLowerCase() ===
                    email.trim().toLocaleLowerCase()
        )
    ) {
        throw new Error("Email đã được sử dụng.");
    }
}

export function mapBackendUser(data: BackendUserResponse, cached?: CRMUser): CRMUser {
    const status: UserStatus =
        data.status === "ACTIVE"
            ? "ACTIVE"
            : data.status === "DISABLED"
              ? "INACTIVE"
              : "PENDING";

    const role: UserRole =
        data.role === "ADMIN" || data.role === "SALES" || data.role === "SUPPORT"
            ? data.role
            : "UNASSIGNED";

    return {
        id: data.id,
        fullName: cached?.fullName || data.username || data.email,
        email: data.email,
        phone: cached?.phone || "",
        department:
            cached?.department ||
            (role === "ADMIN"
                ? "Quản trị hệ thống"
                : role === "SALES"
                  ? "Kinh doanh"
                  : role === "SUPPORT"
                    ? "Hỗ trợ kỹ thuật"
                    : "Chưa phân bổ"),
        role,
        status,
        avatar: cached?.avatar || "",
        createdAt: cached?.createdAt || new Date().toISOString(),
    };
}

export const userService = {
    ensureCurrentUser: async (authUser: User): Promise<CRMUser> => {
        const items = syncRegisteredUsers();
        const existing = items.find(
            (item) => item.id === authUser.id || item.email === authUser.email
        );

        if (existing) return { ...existing };

        const item: CRMUser = {
            id: authUser.id,
            fullName: authUser.fullName,
            email: authUser.email,
            role: authUser.role,
            status: authUser.status ?? "ACTIVE",
            createdAt: new Date().toISOString(),
        };

        write([...items, item]);
        return { ...item };
    },

    // GET /api/v1/users (via Gateway /users)
    getUsers: async (): Promise<CRMUser[]> => {
        try {
            const response = await api.get<BackendUserResponse[]>("/users");
            if (Array.isArray(response.data)) {
                const localList = read();
                const localMap = new Map(localList.map((u) => [u.id, u]));
                const mappedUsers = response.data.map((bu) =>
                    mapBackendUser(bu, localMap.get(bu.id))
                );
                write(mappedUsers);
                return mappedUsers;
            }
        } catch (error) {
            console.warn("Backend /users API unavailable or error, falling back to local:", error);
        }

        await wait(150);
        return syncRegisteredUsers().map((item) => ({ ...item }));
    },

    // GET /api/v1/users/{id}
    getUserById: async (id: number): Promise<CRMUser> => {
        try {
            const response = await api.get<BackendUserResponse>(`/users/${id}`);
            if (response.data) {
                const localList = read();
                const cached = localList.find((u) => u.id === id);
                return mapBackendUser(response.data, cached);
            }
        } catch (error) {
            console.warn(`Backend /users/${id} API unavailable, falling back:`, error);
        }

        await wait(150);
        const item = syncRegisteredUsers().find(
            (candidate) => candidate.id === id
        );

        if (!item) throw new Error("Không tìm thấy người dùng.");

        return { ...item };
    },

    createUser: async (data: CRMUserPayload): Promise<CRMUser> => {
        await wait(150);

        const items = syncRegisteredUsers();
        ensureUniqueEmail(items, data.email);

        if (data.role === "UNASSIGNED" && data.status === "ACTIVE") {
            throw new Error("Không thể kích hoạt tài khoản chưa được phân vai trò.");
        }

        const item: CRMUser = {
            ...data,
            fullName: data.fullName.trim(),
            email: data.email.trim().toLocaleLowerCase(),
            id:
                items.reduce(
                    (max, candidate) => Math.max(max, candidate.id),
                    0
                ) + 1,
            createdAt: new Date().toISOString(),
        };

        write([...items, item]);
        syncAuthUser(item);

        return { ...item };
    },

    // PUT / Update User (Role and Status)
    updateUser: async (
        id: number,
        data: CRMUserPayload
    ): Promise<CRMUser> => {
        const items = syncRegisteredUsers();
        const index = items.findIndex((candidate) => candidate.id === id);

        if (index < 0) throw new Error("Không tìm thấy người dùng.");

        ensureUniqueEmail(items, data.email, id);

        if (data.role === "UNASSIGNED" && data.status === "ACTIVE") {
            throw new Error("Không thể kích hoạt tài khoản chưa được phân vai trò.");
        }

        const currentItem = items[index];

        // 1. If role changed, call PATCH /users/{id}/role
        if (
            data.role !== currentItem.role &&
            (data.role === "SALES" || data.role === "SUPPORT" || data.role === "ADMIN")
        ) {
            try {
                await api.patch<BackendUserResponse>(`/users/${id}/role`, {
                    role: data.role,
                });
            } catch (error) {
                console.warn("Backend PATCH /users/{id}/role failed:", error);
            }
        }

        // 2. If status changed, call PATCH /users/{id}/status
        if (data.status !== currentItem.status) {
            try {
                const backendStatus = data.status === "ACTIVE" ? "ACTIVE" : "DISABLED";
                await api.patch<BackendUserResponse>(`/users/${id}/status`, {
                    status: backendStatus,
                });
            } catch (error) {
                console.warn("Backend PATCH /users/{id}/status failed:", error);
            }
        }

        const item: CRMUser = {
            ...currentItem,
            ...data,
            fullName: data.fullName.trim(),
            email: data.email.trim().toLocaleLowerCase(),
            id,
        };

        items[index] = item;
        write(items);
        syncAuthUser(item);

        return { ...item };
    },

    // PATCH /api/v1/users/{id}/status -> DISABLED
    deactivateUser: async (id: number): Promise<CRMUser> => {
        let updated: CRMUser | null = null;
        try {
            const response = await api.patch<BackendUserResponse>(`/users/${id}/status`, {
                status: "DISABLED",
            });
            if (response.data) {
                const localList = read();
                const cached = localList.find((u) => u.id === id);
                updated = mapBackendUser(
                    response.data,
                    cached ? { ...cached, status: "INACTIVE" } : undefined
                );
            }
        } catch (error) {
            console.warn("Backend /users/{id}/status (DISABLED) failed, using local update:", error);
        }

        const items = syncRegisteredUsers();
        const index = items.findIndex((item) => item.id === id);

        if (index < 0) {
            if (updated) return updated;
            throw new Error("Không tìm thấy người dùng.");
        }

        items[index] = {
            ...items[index],
            status: "INACTIVE",
            ...(updated || {}),
        };

        write(items);
        syncAuthUser(items[index]);

        return { ...items[index] };
    },

    // PATCH /api/v1/users/{id}/status -> ACTIVE
    activateUser: async (id: number): Promise<CRMUser> => {
        let updated: CRMUser | null = null;
        try {
            const response = await api.patch<BackendUserResponse>(`/users/${id}/status`, {
                status: "ACTIVE",
            });
            if (response.data) {
                const localList = read();
                const cached = localList.find((u) => u.id === id);
                updated = mapBackendUser(
                    response.data,
                    cached ? { ...cached, status: "ACTIVE" } : undefined
                );
            }
        } catch (error) {
            console.warn("Backend /users/{id}/status (ACTIVE) failed, using local update:", error);
        }

        const items = syncRegisteredUsers();
        const index = items.findIndex((item) => item.id === id);

        if (index < 0) {
            if (updated) return updated;
            throw new Error("Không tìm thấy người dùng.");
        }

        if (items[index].role === "UNASSIGNED") {
            throw new Error("Vui lòng phân công SALES hoặc SUPPORT trước khi kích hoạt.");
        }

        items[index] = {
            ...items[index],
            status: "ACTIVE",
            ...(updated || {}),
        };

        write(items);
        syncAuthUser(items[index]);

        return { ...items[index] };
    },

    // PATCH /api/v1/users/{id}/role
    updateUserRole: async (
        id: number,
        role: UserRole
    ): Promise<CRMUser> => {
        if (role === "UNASSIGNED") {
            throw new Error("Hãy chọn SALES hoặc SUPPORT để phân công vai trò.");
        }

        let updated: CRMUser | null = null;
        try {
            const response = await api.patch<BackendUserResponse>(`/users/${id}/role`, {
                role,
            });
            if (response.data) {
                const localList = read();
                const cached = localList.find((u) => u.id === id);
                updated = mapBackendUser(
                    response.data,
                    cached ? { ...cached, role } : undefined
                );
            }
        } catch (error) {
            console.warn("Backend /users/{id}/role failed, using local update:", error);
        }

        const items = syncRegisteredUsers();
        const index = items.findIndex((item) => item.id === id);

        if (index < 0) {
            if (updated) return updated;
            throw new Error("Không tìm thấy người dùng.");
        }

        items[index] = {
            ...items[index],
            role,
            ...(updated || {}),
        };

        write(items);
        syncAuthUser(items[index]);

        return { ...items[index] };
    },
};
