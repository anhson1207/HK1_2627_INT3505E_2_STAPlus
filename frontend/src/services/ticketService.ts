import { isAxiosError } from "axios";
import api from "./api";
import { customerService } from "./customerService";
import type {
    Ticket,
    TicketPayload,
    TicketPriority,
    TicketStatus,
} from "../types/ticket";

export interface TicketListResponse {
    content: Ticket[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
}

// Backend data models
export interface BackendTicket {
    id: number;
    subject: string;
    description: string;
    priority: TicketPriority;
    status: TicketStatus;
    salesId?: number | null;
    customerId?: number | null;
    supportId?: number | null;
    assignedTo?: string | null;
    createdAt: string;
    updatedAt?: string | null;
    slaDeadline?: string | null;
    sla_deadline?: string | null;
    slaBreached?: boolean;
}

export interface BackendTicketPayload {
    subject: string;
    description: string;
    priority: TicketPriority;
    status: TicketStatus;
    customerId: number;
    salesId: number;
    supportId?: number | null;
    assignedTo?: string;
}

export interface BackendTicketListResponse {
    content: BackendTicket[];
    number: number;
    size: number;
    totalElements: number;
    totalPages: number;
}

// Cache customer names to avoid redundant fetches
const customerNameCache = new Map<number, string>();
const getTicketsUrl = (path = "") =>
    `${(api.defaults.baseURL || "http://localhost:8080").replace(/\/api\/v1\/?$/, "")}/tickets${path}`;


async function ensureCustomerNamesLoaded(salesIds: number[]) {
    const missing = salesIds.filter((id) => id > 0 && !customerNameCache.has(id));
    if (missing.length === 0) return;

    try {
        const response = await customerService.getCustomers(0, 100);
        response.content.forEach((customer) => {
            customerNameCache.set(customer.id, customer.name);
        });
    } catch {
        // Fallback: names will default to `Khách hàng #${salesId}`
    }
}

// Backend -> Frontend mapper
// Maps customerId / salesId (Backend) -> customerId (Frontend)
// Maps slaDeadline (Backend) -> slaDeadline (Frontend)
export function mapTicketFromApi(data: BackendTicket, customerName?: string): Ticket {
    const resolvedCustomerId =
        data.customerId && data.customerId > 0 ? data.customerId : (data.salesId ?? 0);
    const name =
        customerName ||
        (resolvedCustomerId
            ? customerNameCache.get(resolvedCustomerId) || `Khách hàng #${resolvedCustomerId}`
            : "");
    const deadline = data.slaDeadline ?? data.sla_deadline ?? null;

    return {
        id: data.id,
        subject: data.subject ?? "",
        description: data.description ?? "",
        customerId: resolvedCustomerId,
        customerName: name,
        priority: data.priority,
        status: data.status,
        assignedTo:
            data.assignedTo?.trim() ||
            (data.supportId ? `Support #${data.supportId}` : undefined),
        slaDeadline: deadline,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt ?? undefined,
    };
}

// Frontend -> Backend mapper
export function mapTicketToApi(data: TicketPayload): BackendTicketPayload {
    const parsedSupportId =
        data.assignedTo && !Number.isNaN(Number(data.assignedTo.replace(/\D/g, "")))
            ? Number(data.assignedTo.replace(/\D/g, ""))
            : undefined;

    return {
        subject: data.subject,
        description: data.description,
        priority: data.priority,
        status: data.status,
        customerId: data.customerId,
        salesId: data.customerId,
        supportId: parsedSupportId && parsedSupportId > 0 ? parsedSupportId : undefined,
        assignedTo: data.assignedTo?.trim() || undefined,
    };
}

export function getTicketErrorMessage(error: unknown) {
    if (isAxiosError<{ message?: string; error?: string }>(error)) {
        const msg = error.response?.data?.message || error.response?.data?.error;
        if (msg) return msg;
    }
    return error instanceof Error ? error.message : "Đã xảy ra lỗi. Vui lòng thử lại.";
}

export const ticketService = {
    // GET /tickets
    getTickets: async (
        page = 0,
        size = 10,
        search = "",
        status: TicketStatus | "" = "",
        priority: TicketPriority | "" = "",
    ): Promise<TicketListResponse> => {
        const response = await api.get<BackendTicketListResponse>(getTicketsUrl(), {
            params: {
                pgNum: page,
                pgSize: size,
                status: status || undefined,
                priority: priority || undefined,
                order: "desc",
                sortedBy: "createdAt",
            },
        });

        const backendList = response.data.content || [];
        const customerIds = backendList
            .map((ticket) =>
                ticket.customerId && ticket.customerId > 0 ? ticket.customerId : ticket.salesId,
            )
            .filter((id): id is number => Boolean(id));
        await ensureCustomerNamesLoaded(customerIds);

        let content = backendList.map((ticket) => mapTicketFromApi(ticket));

        if (search.trim()) {
            const query = search.trim().toLowerCase();
            content = content.filter(
                (ticket) =>
                    ticket.subject.toLowerCase().includes(query) ||
                    ticket.customerName.toLowerCase().includes(query) ||
                    (ticket.assignedTo && ticket.assignedTo.toLowerCase().includes(query)) ||
                    String(ticket.id).includes(query),
            );
        }

        return {
            content,
            page: response.data.number ?? page,
            size: response.data.size ?? size,
            totalElements: response.data.totalElements ?? content.length,
            totalPages: response.data.totalPages ?? (content.length > 0 ? 1 : 0),
        };
    },

    // GET /tickets/{id}
    getTicketById: async (id: number): Promise<Ticket> => {
        const response = await api.get<BackendTicket>(getTicketsUrl(`/${id}`));
        const data = response.data;
        const resolvedCustomerId =
            data.customerId && data.customerId > 0 ? data.customerId : data.salesId;

        if (resolvedCustomerId && !customerNameCache.has(resolvedCustomerId)) {
            try {
                const customer = await customerService.getCustomerById(resolvedCustomerId);
                if (customer?.name) customerNameCache.set(resolvedCustomerId, customer.name);
            } catch {
                // ignore
            }
        }

        return mapTicketFromApi(data);
    },

    // GET /tickets/customer/{customerId}
    getTicketsByCustomerId: async (customerId: number): Promise<Ticket[]> => {
        const response = await api.get<BackendTicket[]>(getTicketsUrl(`/customer/${customerId}`));
        const list = Array.isArray(response.data) ? response.data : [];
        if (customerId > 0 && !customerNameCache.has(customerId)) {
            try {
                const customer = await customerService.getCustomerById(customerId);
                if (customer?.name) customerNameCache.set(customerId, customer.name);
            } catch {
                // ignore
            }
        }
        return list.map((ticket) => mapTicketFromApi(ticket));
    },

    // POST /tickets
    createTicket: async (data: TicketPayload): Promise<Ticket> => {
        const payload = mapTicketToApi(data);
        const response = await api.post<BackendTicket>(getTicketsUrl(), payload);

        if (data.customerId && !customerNameCache.has(data.customerId)) {
            try {
                const customer = await customerService.getCustomerById(data.customerId);
                if (customer?.name) customerNameCache.set(data.customerId, customer.name);
            } catch {
                // ignore
            }
        }

        return mapTicketFromApi(response.data);
    },

    // PUT /tickets/{id}
    updateTicket: async (id: number, data: TicketPayload): Promise<Ticket> => {
        const payload = mapTicketToApi(data);
        const response = await api.put<BackendTicket>(getTicketsUrl(`/${id}`), payload);
        return mapTicketFromApi(response.data);
    },

    // DELETE /tickets/{id}
    deleteTicket: async (id: number): Promise<void> => {
        await api.delete(getTicketsUrl(`/${id}`));
    },

    // PATCH /tickets/{id}/status
    updateTicketStatus: async (id: number, status: TicketStatus): Promise<Ticket> => {
        const response = await api.patch<BackendTicket>(getTicketsUrl(`/${id}/status`), { status });
        return mapTicketFromApi(response.data);
    },

    // PATCH /tickets/{id}/assign
    assignTicket: async (id: number, assignedTo: string): Promise<Ticket> => {
        const trimmed = assignedTo.trim();
        const numeric = Number(trimmed.replace(/\D/g, ""));
        const supportId = numeric > 0 ? numeric : 1;
        const response = await api.patch<BackendTicket>(getTicketsUrl(`/${id}/assign`), {
            supportId,
            assignedTo: trimmed,
        });
        return mapTicketFromApi(response.data);
    },
};
