import api, { ApiError, hasConfiguredApi } from "./api";
import { mockLeads } from "../data/mockLeads";
import type { AssignmentRule, AutoAssignResult, Lead, LeadPayload, LeadQuery, LeadSource, LeadStatus } from "../types/lead";

export const SALES_REPRESENTATIVES: Record<number, { name: string; email: string; avatarColor: string }> = {
    1: { name: "Nguyễn Anh Sơn", email: "son@crm.com", avatarColor: "bg-blue-100 text-blue-700" },
    2: { name: "Trần Minh", email: "sales@crm.com", avatarColor: "bg-emerald-100 text-emerald-700" },
    4: { name: "Phạm Bảo Trúc", email: "truc@crm.com", avatarColor: "bg-purple-100 text-purple-700" },
    5: { name: "Đỗ Hải Anh", email: "haianh@crm.com", avatarColor: "bg-cyan-100 text-cyan-700" },
    7: { name: "Bùi Hoàng Nam", email: "nam@crm.com", avatarColor: "bg-amber-100 text-amber-700" },
    9: { name: "Ngô Quốc Huy", email: "huy@crm.com", avatarColor: "bg-indigo-100 text-indigo-700" },
};

export function getSalesOwnerName(userId?: number | null): string | undefined {
    if (!userId) return undefined;
    return SALES_REPRESENTATIVES[userId]?.name || `Sales #${userId}`;
}

const useLeadMockApi = import.meta.env.VITE_USE_LEAD_MOCK_API !== "false";

export interface LeadListResponse {
    content: Lead[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
}

interface BackendLead {
    id: number;
    fullName: string;
    email?: string | null;
    phone?: string | null;
    company?: string | null;
    source?: string | null;
    status: LeadStatus;
    notes?: string | null;
    assignedUserId?: number | null;
    createdAt: string;
    updatedAt?: string | null;
}

interface BackendPageResponse<T> {
    content: T[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    first: boolean;
    last: boolean;
}

const STORAGE_KEY = "crm-soa.leads";

function cloneSeedData(): Lead[] {
    return mockLeads.map((lead) => ({ ...lead }));
}

function readLocalLeads(): Lead[] {
    const value = localStorage.getItem(STORAGE_KEY);
    if (!value) {
        const seeds = cloneSeedData();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(seeds));
        return seeds;
    }

    try {
        const leads = JSON.parse(value) as Lead[];
        return Array.isArray(leads) ? leads : cloneSeedData();
    } catch {
        const seeds = cloneSeedData();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(seeds));
        return seeds;
    }
}

function writeLocalLeads(leads: Lead[]) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(leads));
}

function getLocalLeads(query: LeadQuery): LeadListResponse {
    const page = Math.max(0, query.page ?? 0);
    const size = Math.max(1, query.size ?? 10);
    const keyword = query.search?.trim().toLocaleLowerCase("vi") ?? "";

    const filtered = readLocalLeads()
        .filter((lead) => !query.status || lead.status === query.status)
        .filter((lead) => !query.source || lead.source === query.source)
        .filter((lead) => {
            if (!keyword) return true;
            return [lead.firstName, lead.lastName, lead.email, lead.phone, lead.company, lead.ownerName]
                .filter(Boolean)
                .some((value) => value!.toLocaleLowerCase("vi").includes(keyword));
        })
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const totalElements = filtered.length;
    const totalPages = totalElements === 0 ? 0 : Math.ceil(totalElements / size);
    const start = page * size;

    return {
        content: filtered.slice(start, start + size),
        page,
        size,
        totalElements,
        totalPages,
    };
}

function splitFullName(fullName: string): { firstName: string; lastName: string } {
    const trimmed = (fullName || "").trim();
    if (!trimmed) return { firstName: "", lastName: "" };
    const parts = trimmed.split(/\s+/);
    if (parts.length === 1) return { firstName: parts[0], lastName: "" };
    return {
        firstName: parts[0],
        lastName: parts.slice(1).join(" "),
    };
}

function combineFullName(firstName?: string, lastName?: string): string {
    return [firstName?.trim(), lastName?.trim()].filter(Boolean).join(" ") || "Chưa đặt tên";
}

function mapFrontendSourceToBackend(source?: LeadSource | ""): string | undefined {
    if (!source) return undefined;
    return source;
}

function mapBackendSourceToFrontend(source?: string | null): LeadSource {
    if (!source) return "OTHER";
    switch (source.toUpperCase()) {
        case "WEBSITE":
            return "WEBSITE";
        case "FACEBOOK":
            return "FACEBOOK";
        case "ZALO":
            return "ZALO";
        case "GOOGLE_ADS":
            return "GOOGLE_ADS";
        case "PHONE":
            return "PHONE";
        case "REFERRAL":
            return "REFERRAL";
        case "EVENT":
            return "EVENT";
        case "SOCIAL_MEDIA":
            return "FACEBOOK";
        default:
            return "OTHER";
    }
}

function mapBackendLeadToFrontend(item: BackendLead): Lead {
    const { firstName, lastName } = splitFullName(item.fullName);
    return {
        id: item.id,
        firstName,
        lastName,
        email: item.email || "",
        phone: item.phone || "",
        company: item.company || undefined,
        source: mapBackendSourceToFrontend(item.source),
        status: item.status,
        ownerId: item.assignedUserId || undefined,
        ownerName: getSalesOwnerName(item.assignedUserId),
        createdAt: item.createdAt,
        updatedAt: item.updatedAt || undefined,
    };
}

function mapFrontendPayloadToBackend(data: LeadPayload) {
    let assignedUserId = data.ownerId || null;
    if (!assignedUserId && data.ownerName) {
        const found = Object.entries(SALES_REPRESENTATIVES).find(
            ([_, s]) => s.name.toLowerCase() === data.ownerName?.trim().toLowerCase()
        );
        if (found) assignedUserId = Number(found[0]);
    }
    return {
        fullName: combineFullName(data.firstName, data.lastName),
        email: data.email?.trim() || null,
        phone: data.phone?.trim() || null,
        company: data.company?.trim() || null,
        source: mapFrontendSourceToBackend(data.source) ?? "OTHER",
        status: data.status,
        notes: null,
        assignedUserId,
    };
}

export function getErrorMessage(error: unknown): string {
    if (error instanceof ApiError || error instanceof Error) return error.message;
    return "Đã xảy ra lỗi. Vui lòng thử lại.";
}

export const leadService = {
    getLeads: async (query: LeadQuery = {}): Promise<LeadListResponse> => {
        if (useLeadMockApi || !hasConfiguredApi) return getLocalLeads(query);

        try {
            const page = Math.max(0, query.page ?? 0);
            const size = Math.min(Math.max(1, query.size ?? 10), 100);
            const response = await api.get<BackendPageResponse<BackendLead>>("/leads", {
                params: {
                    page,
                    size,
                    q: query.search?.trim() || undefined,
                    status: query.status || undefined,
                    source: mapFrontendSourceToBackend(query.source),
                },
            });
            return {
                content: response.data.content.map(mapBackendLeadToFrontend),
                page: response.data.page,
                size: response.data.size,
                totalElements: response.data.totalElements,
                totalPages: response.data.totalPages,
            };
        } catch (error) {
            console.warn("Failed to fetch leads from API, falling back to local storage:", error);
            return getLocalLeads(query);
        }
    },

    getLeadById: async (id: number): Promise<Lead> => {
        if (useLeadMockApi || !hasConfiguredApi) {
            const lead = readLocalLeads().find((item) => item.id === id);
            if (!lead) throw new ApiError("Không tìm thấy Lead.", 404);
            return { ...lead };
        }

        try {
            const response = await api.get<BackendLead>(`/leads/${id}`);
            return mapBackendLeadToFrontend(response.data);
        } catch (error) {
            console.warn(`Failed to fetch lead ${id} from API, falling back to local storage:`, error);
            const localLead = readLocalLeads().find((item) => item.id === id);
            if (localLead) return { ...localLead };
            throw error;
        }
    },

    createLead: async (data: LeadPayload): Promise<Lead> => {
        if (useLeadMockApi || !hasConfiguredApi) {
            const leads = readLocalLeads();
            const now = new Date().toISOString();
            const lead: Lead = {
                ...data,
                id: leads.reduce((maxId, item) => Math.max(maxId, item.id), 0) + 1,
                createdAt: now,
                updatedAt: now,
            };
            writeLocalLeads([...leads, lead]);
            return { ...lead };
        }

        const response = await api.post<BackendLead>("/leads", mapFrontendPayloadToBackend(data));
        return mapBackendLeadToFrontend(response.data);
    },

    updateLead: async (id: number, data: LeadPayload): Promise<Lead> => {
        if (useLeadMockApi || !hasConfiguredApi) {
            const leads = readLocalLeads();
            const index = leads.findIndex((item) => item.id === id);
            if (index === -1) throw new ApiError("Không tìm thấy Lead.", 404);
            const updated: Lead = { ...leads[index], ...data, id, updatedAt: new Date().toISOString() };
            leads[index] = updated;
            writeLocalLeads(leads);
            return { ...updated };
        }

        const response = await api.put<BackendLead>(`/leads/${id}`, mapFrontendPayloadToBackend(data));
        return mapBackendLeadToFrontend(response.data);
    },

    deleteLead: async (id: number): Promise<void> => {
        if (useLeadMockApi || !hasConfiguredApi) {
            const leads = readLocalLeads();
            if (!leads.some((item) => item.id === id)) throw new ApiError("Không tìm thấy Lead.", 404);
            writeLocalLeads(leads.filter((item) => item.id !== id));
            return;
        }

        await api.delete(`/leads/${id}`);
    },

    importLeads: async (items: LeadPayload[]): Promise<{ imported: number; total: number; errors?: string[] }> => {
        if (!items || items.length === 0) return { imported: 0, total: 0 };

        if (useLeadMockApi || !hasConfiguredApi) {
            const leads = readLocalLeads();
            let currentMaxId = leads.reduce((maxId, item) => Math.max(maxId, item.id), 0);
            const now = new Date().toISOString();
            const newLeads: Lead[] = items.map((item) => {
                currentMaxId += 1;
                return {
                    ...item,
                    id: currentMaxId,
                    createdAt: now,
                    updatedAt: now,
                };
            });
            writeLocalLeads([...leads, ...newLeads]);
            return { imported: newLeads.length, total: items.length };
        }

        try {
            const payload = items.map(mapFrontendPayloadToBackend);
            const response = await api.post<{ total: number; successCount: number; failureCount: number; errors: string[] }>(
                "/leads/import",
                payload
            );
            return {
                imported: response.data.successCount,
                total: response.data.total,
                errors: response.data.errors,
            };
        } catch {
            // Fallback to sequential create if import batch fails
            let imported = 0;
            for (const item of items) {
                try {
                    await api.post<BackendLead>("/leads", mapFrontendPayloadToBackend(item));
                    imported++;
                } catch {
                    // skip failed item
                }
            }
            return { imported, total: items.length };
        }
    },

    captureWebhookLead: async (
        channel: string,
        payload: { fullName: string; email?: string; phone?: string; company?: string; notes?: string; source?: LeadSource }
    ): Promise<Lead> => {
        if (useLeadMockApi || !hasConfiguredApi) {
            const { firstName, lastName } = splitFullName(payload.fullName);
            const channelSource = payload.source || (
                channel.toLowerCase().includes("facebook") ? "FACEBOOK" :
                channel.toLowerCase().includes("zalo") ? "ZALO" :
                channel.toLowerCase().includes("google") ? "GOOGLE_ADS" :
                channel.toLowerCase().includes("phone") ? "PHONE" : "WEBSITE"
            );
            return leadService.createLead({
                firstName,
                lastName,
                email: payload.email || "",
                phone: payload.phone || "",
                company: payload.company,
                source: channelSource,
                status: "NEW",
                ownerName: undefined,
            });
        }

        const response = await api.post<BackendLead>(`/leads/webhook/${channel}`, payload);
        return mapBackendLeadToFrontend(response.data);
    },

    getAssignmentRules: async (): Promise<AssignmentRule> => {
        if (useLeadMockApi || !hasConfiguredApi) {
            const raw = localStorage.getItem("crm-soa.assignment-rules");
            if (raw) {
                try { return JSON.parse(raw) as AssignmentRule; } catch { /* ignore */ }
            }
            const leads = readLocalLeads();
            const unassigned = leads.filter((l) => !l.ownerName).length;
            return {
                enabled: true,
                strategy: "ROUND_ROBIN",
                activeSalesIds: [2, 4, 5],
                unassignedCount: unassigned,
            };
        }

        const response = await api.get<AssignmentRule>("/leads/assignment-rules");
        return response.data;
    },

    updateAssignmentRules: async (rules: AssignmentRule): Promise<AssignmentRule> => {
        if (useLeadMockApi || !hasConfiguredApi) {
            localStorage.setItem("crm-soa.assignment-rules", JSON.stringify(rules));
            return rules;
        }

        const response = await api.put<AssignmentRule>("/leads/assignment-rules", rules);
        return response.data;
    },

    autoAssignPendingLeads: async (): Promise<AutoAssignResult> => {
        if (useLeadMockApi || !hasConfiguredApi) {
            const leads = readLocalLeads();
            const activeSalesIds = [2, 4, 5];
            let assignedCount = 0;
            const summary: Record<number, number> = {};
            let counter = 0;

            const updated = leads.map((lead) => {
                if (!lead.ownerName) {
                    const salesId = activeSalesIds[counter % activeSalesIds.length];
                    counter++;
                    assignedCount++;
                    summary[salesId] = (summary[salesId] || 0) + 1;
                    return {
                        ...lead,
                        ownerId: salesId,
                        ownerName: getSalesOwnerName(salesId),
                    };
                }
                return lead;
            });

            writeLocalLeads(updated);
            return {
                assignedCount,
                totalUnassignedBefore: assignedCount,
                strategyUsed: "ROUND_ROBIN",
                assignmentSummary: summary,
            };
        }

        const response = await api.post<AutoAssignResult>("/leads/auto-assign");
        return response.data;
    },
};
