import api from "./api";
import { customerService } from "./customerService";
import { ticketMockApi } from "../mocks/tickets";
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
    salesId: number;
    supportId?: number | null;
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
    salesId: number;
    supportId?: number | null;
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
// Maps salesId (Backend) -> customerId (Frontend)
// Maps slaDeadline (Backend) -> slaDeadline (Frontend)
export function mapTicketFromApi(data: BackendTicket, customerName?: string): Ticket {
    const name =
        customerName ||
        (data.salesId ? customerNameCache.get(data.salesId) || `Khách hàng #${data.salesId}` : "");
    const deadline = data.slaDeadline ?? data.sla_deadline ?? null;

    return {
        id: data.id,
        subject: data.subject ?? "",
        description: data.description ?? "",
        customerId: data.salesId ?? 0,
        customerName: name,
        priority: data.priority,
        status: data.status,
        assignedTo: data.supportId ? `Support #${data.supportId}` : undefined,
        slaDeadline: deadline,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt ?? undefined,
    };
}

// Frontend -> Backend mapper
// Maps customerId (Frontend) -> salesId (Backend)
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
        salesId: data.customerId,
        supportId: parsedSupportId && parsedSupportId > 0 ? parsedSupportId : undefined,
    };
}

export function getTicketErrorMessage(error: unknown) {
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
        try {
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
            const salesIds = backendList.map((ticket) => ticket.salesId).filter(Boolean);
            await ensureCustomerNamesLoaded(salesIds);

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
        } catch (error) {
            console.warn("Backend API /tickets unavailable, falling back:", error);
            return ticketMockApi.getTickets(page, size, search, status, priority);
        }
    },

    // GET /tickets/{id}
    getTicketById: async (id: number): Promise<Ticket> => {
        try {
            const response = await api.get<BackendTicket>(getTicketsUrl(`/${id}`));
            const data = response.data;

            if (data.salesId && !customerNameCache.has(data.salesId)) {
                try {
                    const customer = await customerService.getCustomerById(data.salesId);
                    if (customer?.name) customerNameCache.set(data.salesId, customer.name);
                } catch {
                    // ignore
                }
            }

            return mapTicketFromApi(data);
        } catch (error) {
            console.warn(`Backend API /tickets/${id} unavailable, falling back:`, error);
            return ticketMockApi.getTicketById(id);
        }
    },

    // GET /tickets/customer/{customerId}
    getTicketsByCustomerId: async (customerId: number): Promise<Ticket[]> => {
        try {
            const response = await api.get<BackendTicket[]>(getTicketsUrl(`/customer/${customerId}`));
            if (Array.isArray(response.data)) {
                return response.data.map((ticket) => mapTicketFromApi(ticket));
            }
        } catch {
            // fallback via query param
        }

        try {
            const response = await api.get<BackendTicketListResponse>(getTicketsUrl(), {
                params: { salesId: customerId, pgSize: 100 },
            });
            const list = response.data.content || [];
            return list.map((ticket) => mapTicketFromApi(ticket));
        } catch {
            return ticketMockApi.getTicketsByCustomerId(customerId);
        }
    },

    // POST /tickets
    createTicket: async (data: TicketPayload): Promise<Ticket> => {
        try {
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
        } catch (error) {
            console.warn("Backend POST /tickets unavailable, falling back:", error);
            const customer = await customerService.getCustomerById(data.customerId);
            return ticketMockApi.createTicket(data, customer.name);
        }
    },

    // PUT /tickets/{id}
    updateTicket: async (id: number, data: TicketPayload): Promise<Ticket> => {
        try {
            const payload = mapTicketToApi(data);
            const response = await api.put<BackendTicket>(getTicketsUrl(`/${id}`), payload);
            return mapTicketFromApi(response.data);
        } catch (error) {
            console.warn(`Backend PUT /tickets/${id} unavailable, falling back:`, error);
            const customer = await customerService.getCustomerById(data.customerId);
            return ticketMockApi.updateTicket(id, data, customer.name);
        }
    },

    // DELETE /tickets/{id}
    deleteTicket: async (id: number): Promise<void> => {
        try {
            await api.delete(getTicketsUrl(`/${id}`));
        } catch (error) {
            console.warn(`Backend DELETE /tickets/${id} unavailable, falling back:`, error);
            await ticketMockApi.deleteTicket(id);
        }
    },

    // PATCH /tickets/{id}/status
    updateTicketStatus: async (id: number, status: TicketStatus): Promise<Ticket> => {
        try {
            const response = await api.patch<BackendTicket>(getTicketsUrl(`/${id}/status`), { status });
            return mapTicketFromApi(response.data);
        } catch {
            try {
                const response = await api.patch<BackendTicket>(`/tickets/${id}`, { status });
                return mapTicketFromApi(response.data);
            } catch {
                return ticketMockApi.updateTicketStatus(id, status);
            }
        }
    },

    // PATCH /tickets/{id}/assign
    assignTicket: async (id: number, assignedTo: string): Promise<Ticket> => {
        const supportId = Number(assignedTo.replace(/\D/g, "")) || 1;
        try {
            const response = await api.patch<BackendTicket>(getTicketsUrl(`/${id}/assign`), {
                supportId,
                assignedTo,
            });
            return mapTicketFromApi(response.data);
        } catch {
            try {
                const response = await api.patch<BackendTicket>(`/tickets/${id}`, {
                    supportId,
                });
                return mapTicketFromApi(response.data);
            } catch {
                return ticketMockApi.assignTicket(id, assignedTo);
            }
        }
    },
};
