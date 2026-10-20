
import { mockUsers } from "../mocks/users";
import { isUserRole, type User } from "../types/auth";
import type {
    CRMUser,
    CRMUserPayload,
    UserRole,
} from "../types/user";

const STORAGE_KEY = "crm-soa.users";
const AUTH_USERS_STORAGE_KEY = "crm-soa.mock-auth-users";

const wait = () =>
    new Promise<void>((resolve) => window.setTimeout(resolve, 300));

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


// function syncRegisteredUsers(): CRMUser[] {
//     const managementUsers = read();
//     const authUsers = readAuthUsers();
//     const result = [...managementUsers];
//     let changed = false;

//     for (const authUser of authUsers) {
//         if (typeof authUser.id !== "number") continue;
//         if (typeof authUser.email !== "string") continue;
//         if (typeof authUser.fullName !== "string") continue;

//         const email = authUser.email.trim().toLocaleLowerCase();
//         const existingIndex = result.findIndex(
//             (item) => item.id === authUser.id || item.email.toLocaleLowerCase() === email
//         );

//         if (existingIndex !== -1) {
//             continue;
//         }

//         const role =
//             authUser.role === "ADMIN" ||
//             authUser.role === "SALES" ||
//             authUser.role === "SUPPORT" ||
//             authUser.role === "UNASSIGNED"
//                 ? authUser.role
//                 : "UNASSIGNED";

//         const status =
//             authUser.status === "ACTIVE" ||
//             authUser.status === "INACTIVE" ||
//             authUser.status === "PENDING"
//                 ? authUser.status
//                 : "PENDING";

//         result.push({
//             id: authUser.id,
//             fullName: authUser.fullName,
//             email,
//             role,
//             status,
//             createdAt: new Date().toISOString(),
//         });

//         changed = true;
//     }

//     if (changed) {
//         write(result);
//     }

//     return result;
// }

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

export const userService = {
    ensureCurrentUser: async (authUser: User): Promise<CRMUser> => {
        await wait();

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

    getUsers: async (): Promise<CRMUser[]> => {
        await wait();
        return syncRegisteredUsers().map((item) => ({ ...item }));
    },
    getUserById: async (id: number): Promise<CRMUser> => {
        await wait();

        const item = syncRegisteredUsers().find(
            (candidate) => candidate.id === id
        );

        if (!item) throw new Error("Không tìm thấy người dùng.");

        return { ...item };
    },

    createUser: async (data: CRMUserPayload): Promise<CRMUser> => {
        await wait();

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

    updateUser: async (
        id: number,
        data: CRMUserPayload
    ): Promise<CRMUser> => {
        await wait();

        const items = syncRegisteredUsers();
        const index = items.findIndex((candidate) => candidate.id === id);

        if (index < 0) throw new Error("Không tìm thấy người dùng.");

        ensureUniqueEmail(items, data.email, id);

        if (data.role === "UNASSIGNED" && data.status === "ACTIVE") {
            throw new Error("Không thể kích hoạt tài khoản chưa được phân vai trò.");
        }

        const item: CRMUser = {
            ...items[index],
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

    deactivateUser: async (id: number): Promise<CRMUser> => {
        await wait();

        const items = syncRegisteredUsers();
        const index = items.findIndex((item) => item.id === id);

        if (index < 0) throw new Error("Không tìm thấy người dùng.");

        items[index] = {
            ...items[index],
            status: "INACTIVE",
        };

        write(items);
        syncAuthUser(items[index]);

        return { ...items[index] };
    },

    activateUser: async (id: number): Promise<CRMUser> => {
        await wait();

        const items = syncRegisteredUsers();
        const index = items.findIndex((item) => item.id === id);

        if (index < 0) throw new Error("Không tìm thấy người dùng.");

        if (items[index].role === "UNASSIGNED") {
            throw new Error("Vui lòng phân công SALES hoặc SUPPORT trước khi kích hoạt.");
        }

        items[index] = {
            ...items[index],
            status: "ACTIVE",
        };

        write(items);
        syncAuthUser(items[index]);

        return { ...items[index] };
    },

    updateUserRole: async (
        id: number,
        role: UserRole
    ): Promise<CRMUser> => {
        await wait();

        if (role === "UNASSIGNED") {
            throw new Error("Hãy chọn SALES hoặc SUPPORT để phân công vai trò.");
        }

        const items = syncRegisteredUsers();
        const index = items.findIndex((item) => item.id === id);

        if (index < 0) throw new Error("Không tìm thấy người dùng.");

        items[index] = {
            ...items[index],
            role,
        };

        write(items);
        syncAuthUser(items[index]);

        return { ...items[index] };
    },
};
