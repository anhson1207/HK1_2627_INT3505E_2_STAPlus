import api from "./api";
import { customerMockApi } from "../mocks/customerMockApi";
import type { Customer, CustomerPayload } from "../types/customer";

const useCustomerMockApi = import.meta.env.VITE_USE_CUSTOMER_MOCK_API !== "false";

export interface CustomerListResponse {
    content: Customer[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
}

export function getCustomerErrorMessage(error: unknown): string {
    return error instanceof Error ? error.message : "Đã xảy ra lỗi. Vui lòng thử lại.";
}

export const customerService = {
    getCustomers: async (page = 0, size = 10): Promise<CustomerListResponse> => {
        if (useCustomerMockApi) return customerMockApi.getCustomers(page, size);

        const response = await api.get<CustomerListResponse>("/customers", {
            params: { page, size },
        });
        return response.data;
    },

    getCustomerById: async (id: number): Promise<Customer> => {
        if (useCustomerMockApi) return customerMockApi.getCustomerById(id);

        const response = await api.get<Customer>(`/customers/${id}`);
        return response.data;
    },

    createCustomer: async (data: CustomerPayload): Promise<Customer> => {
        if (useCustomerMockApi) return customerMockApi.createCustomer(data);

        const response = await api.post<Customer>("/customers", data);
        return response.data;
    },

    updateCustomer: async (id: number, data: CustomerPayload): Promise<Customer> => {
        if (useCustomerMockApi) return customerMockApi.updateCustomer(id, data);

        const response = await api.put<Customer>(`/customers/${id}`, data);
        return response.data;
    },

    deleteCustomer: async (id: number): Promise<void> => {
        if (useCustomerMockApi) return customerMockApi.deleteCustomer(id);

        await api.delete(`/customers/${id}`);
    },
};
