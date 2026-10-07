import api, { ApiError, hasConfiguredApi } from "./api";
import { mockLeads } from "../data/mockLeads";
import type { Lead, LeadPayload, LeadQuery } from "../types/lead";

export interface LeadListResponse {
    content: Lead[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
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

export function getErrorMessage(error: unknown): string {
    if (error instanceof ApiError || error instanceof Error) return error.message;
    return "Đã xảy ra lỗi. Vui lòng thử lại.";
}

export const leadService = {
    getLeads: async (query: LeadQuery = {}): Promise<LeadListResponse> => {
        if (!hasConfiguredApi) return getLocalLeads(query);

        const response = await api.get<LeadListResponse>("/leads", {
            params: {
                page: query.page,
                size: query.size,
                search: query.search,
                status: query.status,
                source: query.source,
            },
        });
        return response.data;
    },

    getLeadById: async (id: number): Promise<Lead> => {
        if (!hasConfiguredApi) {
            const lead = readLocalLeads().find((item) => item.id === id);
            if (!lead) throw new ApiError("Không tìm thấy Lead.", 404);
            return { ...lead };
        }

        const response = await api.get<Lead>(`/leads/${id}`);
        return response.data;
    },

    createLead: async (data: LeadPayload): Promise<Lead> => {
        if (!hasConfiguredApi) {
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

        const response = await api.post<Lead>("/leads", data);
        return response.data;
    },

    updateLead: async (id: number, data: LeadPayload): Promise<Lead> => {
        if (!hasConfiguredApi) {
            const leads = readLocalLeads();
            const index = leads.findIndex((item) => item.id === id);
            if (index === -1) throw new ApiError("Không tìm thấy Lead.", 404);
            const updated: Lead = { ...leads[index], ...data, id, updatedAt: new Date().toISOString() };
            leads[index] = updated;
            writeLocalLeads(leads);
            return { ...updated };
        }

        const response = await api.put<Lead>(`/leads/${id}`, data);
        return response.data;
    },

    deleteLead: async (id: number): Promise<void> => {
        if (!hasConfiguredApi) {
            const leads = readLocalLeads();
            if (!leads.some((item) => item.id === id)) throw new ApiError("Không tìm thấy Lead.", 404);
            writeLocalLeads(leads.filter((item) => item.id !== id));
            return;
        }

        await api.delete(`/leads/${id}`);
    },
};
