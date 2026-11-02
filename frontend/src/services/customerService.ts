import api from "./api";
import { customerMockApi } from "../mocks/customerMockApi";
import type { Customer, CustomerPayload, CustomerStatus } from "../types/customer";

const useCustomerMockApi = import.meta.env.VITE_USE_CUSTOMER_MOCK_API !== "false";

export interface CustomerListResponse {
    content: Customer[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
}

interface BackendCustomer {
    id: number;
    fullName: string;
    email?: string | null;
    phone?: string | null;
    company?: string | null;
    status: CustomerStatus;
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

function mapBackendCustomerToFrontend(item: BackendCustomer): Customer {
    return {
        id: item.id,
        name: item.fullName,
        email: item.email || "",
        phone: item.phone || "",
        company: item.company || "",
        address: item.notes || undefined,
        status: item.status,
        ownerName: item.assignedUserId ? `User #${item.assignedUserId}` : undefined,
        createdAt: item.createdAt,
    };
}

function mapFrontendCustomerToBackend(data: CustomerPayload) {
    return {
        fullName: data.name.trim(),
        email: data.email?.trim() || null,
        phone: data.phone?.trim() || null,
        company: data.company?.trim() || null,
        status: data.status,
        notes: data.address?.trim() || null,
        assignedUserId: null,
    };
}

export function getCustomerErrorMessage(error: unknown): string {
    return error instanceof Error ? error.message : "Đã xảy ra lỗi. Vui lòng thử lại.";
}

export const customerService = {
    getCustomers: async (page = 0, size = 10, search?: string, status?: CustomerStatus): Promise<CustomerListResponse> => {
        if (useCustomerMockApi) return customerMockApi.getCustomers(page, size, search, status);

        try {
            const safePage = Math.max(0, page);
            const safeSize = Math.min(Math.max(1, size), 100);
            const response = await api.get<BackendPageResponse<BackendCustomer>>("/customers", {
                params: {
                    page: safePage,
                    size: safeSize,
                    q: search?.trim() || undefined,
                    status: status || undefined,
                },
            });
            return {
                content: response.data.content.map(mapBackendCustomerToFrontend),
                page: response.data.page,
                size: response.data.size,
                totalElements: response.data.totalElements,
                totalPages: response.data.totalPages,
            };
        } catch (error) {
            console.warn("Failed to fetch customers from API, falling back to mock:", error);
            return customerMockApi.getCustomers(page, size, search, status);
        }
    },

    getCustomerById: async (id: number): Promise<Customer> => {
        if (useCustomerMockApi) return customerMockApi.getCustomerById(id);

        try {
            const response = await api.get<BackendCustomer>(`/customers/${id}`);
            return mapBackendCustomerToFrontend(response.data);
        } catch (error) {
            console.warn(`Failed to fetch customer ${id} from API, falling back to mock:`, error);
            return customerMockApi.getCustomerById(id);
        }
    },

    createCustomer: async (data: CustomerPayload): Promise<Customer> => {
        if (useCustomerMockApi) return customerMockApi.createCustomer(data);

        const response = await api.post<BackendCustomer>("/customers", mapFrontendCustomerToBackend(data));
        return mapBackendCustomerToFrontend(response.data);
    },

    updateCustomer: async (id: number, data: CustomerPayload): Promise<Customer> => {
        if (useCustomerMockApi) return customerMockApi.updateCustomer(id, data);

        const response = await api.put<BackendCustomer>(`/customers/${id}`, mapFrontendCustomerToBackend(data));
        return mapBackendCustomerToFrontend(response.data);
    },

    deleteCustomer: async (id: number): Promise<void> => {
        if (useCustomerMockApi) return customerMockApi.deleteCustomer(id);

        await api.delete(`/customers/${id}`);
    },
};
