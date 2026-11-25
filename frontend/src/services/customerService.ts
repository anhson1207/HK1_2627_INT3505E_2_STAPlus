import { isAxiosError } from "axios";
import api from "./api";
import { getSalesOwnerName } from "./leadService";
import { customerMockApi } from "../mocks/customerMockApi";
import type { Customer, CustomerPayload, CustomerStatus } from "../types/customer";
import type { ActivityType, CustomerActivity } from "../types/customer360";

const useCustomerMockApi = import.meta.env.VITE_USE_CUSTOMER_MOCK_API === "true";

interface BackendCustomerActivity {
    id: number;
    customerId: number;
    type: ActivityType | string;
    title: string;
    description?: string | null;
    createdBy?: string | null;
    createdAt: string;
}

function normalizeActivityType(value: string): ActivityType {
    const upper = value.toUpperCase();
    if (upper === "CALL" || upper === "EMAIL" || upper === "MEETING" || upper === "NOTE") {
        return upper;
    }
    return "NOTE";
}

function mapActivityFromApi(item: BackendCustomerActivity): CustomerActivity {
    return {
        id: item.id,
        customerId: item.customerId,
        type: normalizeActivityType(item.type),
        title: item.title,
        description: item.description ?? "",
        createdAt: item.createdAt,
    };
}

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
        ownerId: item.assignedUserId || undefined,
        ownerName: item.assignedUserId ? getSalesOwnerName(item.assignedUserId) || `User #${item.assignedUserId}` : undefined,
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
    if (isAxiosError<{ message?: string; error?: string }>(error)) {
        const msg = error.response?.data?.message || error.response?.data?.error;
        if (msg) return msg;
    }
    return error instanceof Error ? error.message : "Đã xảy ra lỗi. Vui lòng thử lại.";
}

export const customerService = {
    getCustomers: async (page = 0, size = 10, search?: string, status?: CustomerStatus, assignedUserId?: number): Promise<CustomerListResponse> => {
        if (useCustomerMockApi) return customerMockApi.getCustomers(page, size, search, status, assignedUserId);

        const safePage = Math.max(0, page);
        const safeSize = Math.min(Math.max(1, size), 100);
        const response = await api.get<BackendPageResponse<BackendCustomer>>("/customers", {
            params: {
                page: safePage,
                size: safeSize,
                q: search?.trim() || undefined,
                status: status || undefined,
                assignedUserId: assignedUserId || undefined,
            },
        });
        return {
            content: response.data.content.map(mapBackendCustomerToFrontend),
            page: response.data.page,
            size: response.data.size,
            totalElements: response.data.totalElements,
            totalPages: response.data.totalPages,
        };
    },

    getCustomerById: async (id: number): Promise<Customer> => {
        if (useCustomerMockApi) return customerMockApi.getCustomerById(id);

        const response = await api.get<BackendCustomer>(`/customers/${id}`);
        return mapBackendCustomerToFrontend(response.data);
    },

    getCustomerActivities: async (customerId: number): Promise<CustomerActivity[]> => {
        const response = await api.get<BackendCustomerActivity[]>(`/customers/${customerId}/activities`);
        return Array.isArray(response.data) ? response.data.map(mapActivityFromApi) : [];
    },

    createCustomerActivity: async (
        customerId: number,
        payload: { type: ActivityType; title: string; description?: string },
    ): Promise<CustomerActivity> => {
        const response = await api.post<BackendCustomerActivity>(`/customers/${customerId}/activities`, {
            type: payload.type,
            title: payload.title.trim(),
            description: payload.description?.trim() || "",
        });
        return mapActivityFromApi(response.data);
    },

    deleteCustomerActivity: async (customerId: number, activityId: number): Promise<void> => {
        await api.delete(`/customers/${customerId}/activities/${activityId}`);
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
