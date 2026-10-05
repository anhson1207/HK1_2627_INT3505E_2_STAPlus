import { mockUsers } from "../mocks/users";
import type { User } from "../types/auth";
import type { CRMUser, CRMUserPayload, UserRole } from "../types/user";

const STORAGE_KEY = "crm-soa.users";
const wait = () => new Promise<void>((resolve) => window.setTimeout(resolve, 300));

function read(): CRMUser[] {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
            const parsed: unknown = JSON.parse(raw);
            if (Array.isArray(parsed)) return parsed as CRMUser[];
        }
    } catch { /* Restore mock users. */ }
    const seed = mockUsers.map((item) => ({ ...item }));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
    return seed;
}
function write(items: CRMUser[]) { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); }
function ensureUniqueEmail(items: CRMUser[], email: string, excludeId?: number) {
    if (items.some((item) => item.id !== excludeId && item.email.toLocaleLowerCase() === email.trim().toLocaleLowerCase())) throw new Error("Email đã được sử dụng.");
}

export const userService = {
    ensureCurrentUser: async (authUser: User): Promise<CRMUser> => {
        await wait();
        const items = read();
        const existing = items.find((item) => item.id === authUser.id);
        if (existing) return { ...existing };
        const item: CRMUser = { id: authUser.id, fullName: authUser.fullName, email: authUser.email, role: authUser.role, status: "ACTIVE", createdAt: new Date().toISOString() };
        write([...items, item]);
        return { ...item };
    },
    getUsers: async (): Promise<CRMUser[]> => { await wait(); return read().map((item) => ({ ...item })); },
    getUserById: async (id: number): Promise<CRMUser> => {
        await wait();
        const item = read().find((candidate) => candidate.id === id);
        if (!item) throw new Error("Không tìm thấy người dùng.");
        return { ...item };
    },
    createUser: async (data: CRMUserPayload): Promise<CRMUser> => {
        await wait();
        const items = read(); ensureUniqueEmail(items, data.email);
        const item: CRMUser = { ...data, fullName: data.fullName.trim(), email: data.email.trim().toLocaleLowerCase(), id: items.reduce((max, candidate) => Math.max(max, candidate.id), 0) + 1, createdAt: new Date().toISOString() };
        write([...items, item]); return { ...item };
    },
    updateUser: async (id: number, data: CRMUserPayload): Promise<CRMUser> => {
        await wait();
        const items = read(); const index = items.findIndex((candidate) => candidate.id === id);
        if (index < 0) throw new Error("Không tìm thấy người dùng.");
        ensureUniqueEmail(items, data.email, id);
        const item: CRMUser = { ...items[index], ...data, fullName: data.fullName.trim(), email: data.email.trim().toLocaleLowerCase(), id };
        items[index] = item; write(items); return { ...item };
    },
    deactivateUser: async (id: number): Promise<CRMUser> => {
        await wait(); const items = read(); const index = items.findIndex((item) => item.id === id);
        if (index < 0) throw new Error("Không tìm thấy người dùng.");
        items[index] = { ...items[index], status: "INACTIVE" }; write(items); return { ...items[index] };
    },
    activateUser: async (id: number): Promise<CRMUser> => {
        await wait(); const items = read(); const index = items.findIndex((item) => item.id === id);
        if (index < 0) throw new Error("Không tìm thấy người dùng.");
        items[index] = { ...items[index], status: "ACTIVE" }; write(items); return { ...items[index] };
    },
    updateUserRole: async (id: number, role: UserRole): Promise<CRMUser> => {
        await wait(); const items = read(); const index = items.findIndex((item) => item.id === id);
        if (index < 0) throw new Error("Không tìm thấy người dùng.");
        items[index] = { ...items[index], role }; write(items); return { ...items[index] };
    },
};
