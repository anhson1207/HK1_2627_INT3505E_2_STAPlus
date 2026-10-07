import api from "./api";
import { customerService } from "./customerService";
import { dealMockApi } from "../mocks/deals";
import type { Deal, DealPayload, DealStage } from "../types/deal";

const useDealMockApi = import.meta.env.VITE_USE_DEAL_MOCK_API !== "false";

export interface DealListResponse {
    content: Deal[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
}

export function getDealErrorMessage(error: unknown) {
    return error instanceof Error ? error.message : "Đã xảy ra lỗi. Vui lòng thử lại.";
}

export const dealService = {
    getDeals: async (page = 0, size = 10, search = "", stage: DealStage | "" = ""): Promise<DealListResponse> => {
        if (useDealMockApi) return dealMockApi.getDeals(page, size, search, stage);
        const response = await api.get<DealListResponse>("/deals", { params: { page, size, search, stage } });
        return response.data;
    },
    getDealById: async (id: number): Promise<Deal> => {
        if (useDealMockApi) return dealMockApi.getDealById(id);
        const response = await api.get<Deal>(`/deals/${id}`);
        return response.data;
    },
    createDeal: async (data: DealPayload): Promise<Deal> => {
        if (useDealMockApi) {
            const customer = await customerService.getCustomerById(data.customerId);
            return dealMockApi.createDeal(data, customer.name);
        }
        const response = await api.post<Deal>("/deals", data);
        return response.data;
    },
    updateDeal: async (id: number, data: DealPayload): Promise<Deal> => {
        if (useDealMockApi) {
            const customer = await customerService.getCustomerById(data.customerId);
            return dealMockApi.updateDeal(id, data, customer.name);
        }
        const response = await api.put<Deal>(`/deals/${id}`, data);
        return response.data;
    },
    deleteDeal: async (id: number): Promise<void> => {
        if (useDealMockApi) return dealMockApi.deleteDeal(id);
        await api.delete(`/deals/${id}`);
    },
    updateDealStage: async (id: number, stage: DealStage): Promise<Deal> => {
        if (useDealMockApi) return dealMockApi.updateDealStage(id, stage);
        const response = await api.patch<Deal>(`/deals/${id}/stage`, { stage });
        return response.data;
    },
};
