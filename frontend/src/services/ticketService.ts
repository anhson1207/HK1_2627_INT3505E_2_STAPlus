import api from "./api";
import { customerService } from "./customerService";
import { ticketMockApi } from "../mocks/tickets";
import type { Ticket, TicketPayload, TicketPriority, TicketStatus } from "../types/ticket";

const useTicketMockApi = import.meta.env.VITE_USE_TICKET_MOCK_API !== "false";

export interface TicketListResponse {
    content: Ticket[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
}

export function getTicketErrorMessage(error: unknown) {
    return error instanceof Error ? error.message : "Đã xảy ra lỗi. Vui lòng thử lại.";
}

export const ticketService = {
    getTickets: async (page = 0, size = 10, search = "", status: TicketStatus | "" = "", priority: TicketPriority | "" = ""): Promise<TicketListResponse> => {
        if (useTicketMockApi) return ticketMockApi.getTickets(page, size, search, status, priority);
        const response = await api.get<TicketListResponse>("/tickets", { params: { page, size, search, status, priority } });
        return response.data;
    },
    getTicketById: async (id: number): Promise<Ticket> => {
        if (useTicketMockApi) return ticketMockApi.getTicketById(id);
        const response = await api.get<Ticket>(`/tickets/${id}`);
        return response.data;
    },
    getTicketsByCustomerId: async (customerId: number): Promise<Ticket[]> => {
        if (useTicketMockApi) return ticketMockApi.getTicketsByCustomerId(customerId);
        const response = await api.get<Ticket[]>(`/tickets/customer/${customerId}`);
        return response.data;
    },
    createTicket: async (data: TicketPayload): Promise<Ticket> => {
        if (useTicketMockApi) { const customer = await customerService.getCustomerById(data.customerId); return ticketMockApi.createTicket(data, customer.name); }
        const response = await api.post<Ticket>("/tickets", data); return response.data;
    },
    updateTicket: async (id: number, data: TicketPayload): Promise<Ticket> => {
        if (useTicketMockApi) { const customer = await customerService.getCustomerById(data.customerId); return ticketMockApi.updateTicket(id, data, customer.name); }
        const response = await api.put<Ticket>(`/tickets/${id}`, data); return response.data;
    },
    deleteTicket: async (id: number): Promise<void> => {
        if (useTicketMockApi) return ticketMockApi.deleteTicket(id);
        await api.delete(`/tickets/${id}`);
    },
    updateTicketStatus: async (id: number, status: TicketStatus): Promise<Ticket> => {
        if (useTicketMockApi) return ticketMockApi.updateTicketStatus(id, status);
        const response = await api.patch<Ticket>(`/tickets/${id}/status`, { status }); return response.data;
    },
    assignTicket: async (id: number, assignedTo: string): Promise<Ticket> => {
        if (useTicketMockApi) return ticketMockApi.assignTicket(id, assignedTo);
        const response = await api.patch<Ticket>(`/tickets/${id}/assign`, { assignedTo }); return response.data;
    },
};
