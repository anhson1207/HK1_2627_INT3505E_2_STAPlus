import api from "./api";
import { customerService } from "./customerService";
import { dealMockApi } from "../mocks/deals";
import { useAuthStore } from "../stores/authStore";
import type {
    Deal,
    DealPayload,
    DealStage,
    DiscountApprovalStatus,
} from "../types/deal";

export interface PipelineStageSummary {
    stage: DealStage | string;
    count: number;
    totalValue: number;
}

export interface DealForecastResponse {
    totalPipelineValue: number;
    weightedForecastValue: number;
    totalDeals: number;
    stages: PipelineStageSummary[];
}

export interface DealListResponse {
    content: Deal[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
}

// Backend data structure
export interface BackendDeal {
    id: number;
    salesId?: number | null;
    dealName?: string | null;
    name?: string | null;
    owner?: string | null;
    ownerName?: string | null;
    amount?: number | null;
    value?: number | null;
    stage: DealStage;
    probability?: number | null;
    expectedClosingDate?: string | null;
    expectedCloseDate?: string | null;
    description?: string | null;
    createdAt: string;
    updatedAt?: string | null;
    discountPercent?: number | null;
    approvalStatus?: DiscountApprovalStatus | null;
    discountReason?: string | null;
    discountApprovedBy?: string | null;
    discountApprovedAt?: string | null;
}

export interface BackendDealPayload {
    dealName: string;
    owner: string;
    amount: number;
    stage: DealStage;
    salesId?: number;
    expectedClosingDate?: string;
    description?: string;
    probability?: number;
}

export interface BackendDealListResponse {
    content: BackendDeal[];
    number: number;
    size: number;
    totalElements: number;
    totalPages: number;
}

// Cache for customer names
const customerNameCache = new Map<number, string>();
const getDealsUrl = (path = "") =>
    `${(api.defaults.baseURL || "http://localhost:8080").replace(/\/api\/v1\/?$/, "")}/deals${path}`;


async function ensureCustomerNamesLoaded(customerIds: number[]) {
    const missing = customerIds.filter((id) => id > 0 && !customerNameCache.has(id));
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

// Backend -> Frontend
// Map: amount (Backend) -> value (Frontend)
// Map: expectedClosingDate (Backend) -> expectedCloseDate (Frontend)
// Map: salesId (Backend) -> customerId (Frontend)
export function mapDealFromApi(data: BackendDeal, customerName = ""): Deal {
    const rawAmount = data.amount ?? data.value ?? 0;
    const rawExpectedCloseDate = data.expectedClosingDate ?? data.expectedCloseDate ?? "";
    const rawName = data.dealName ?? data.name ?? "";
    const rawOwner = data.owner ?? data.ownerName ?? "";
    const customerId = data.salesId ?? 0;
    const cName =
        customerName ||
        (customerId ? customerNameCache.get(customerId) || `Khách hàng #${customerId}` : "");

    return {
        id: data.id,
        name: rawName,
        customerId,
        customerName: cName,
        value: typeof rawAmount === "number" ? rawAmount : Number(rawAmount) || 0,
        stage: data.stage,
        probability:
            data.probability ??
            (data.stage === "WON" ? 100 : data.stage === "LOST" ? 0 : 50),
        expectedCloseDate: rawExpectedCloseDate
            ? String(rawExpectedCloseDate).split("T")[0]
            : "",
        ownerName: rawOwner,
        description: data.description ?? undefined,
        createdAt: data.createdAt,
        discountPercent: data.discountPercent ?? 0,
        approvalStatus: data.approvalStatus ?? "NOT_REQUIRED",
        discountReason: data.discountReason ?? "",
        discountApprovedBy: data.discountApprovedBy ?? undefined,
        discountApprovedAt: data.discountApprovedAt ?? undefined,
    };
}

// Frontend -> Backend
// Map: value (Frontend) -> amount (Backend)
// Map: expectedCloseDate (Frontend) -> expectedClosingDate (Backend)
// Map: customerId (Frontend) -> salesId (Backend)
export function mapDealToApi(data: DealPayload): BackendDealPayload {
    return {
        dealName: data.name,
        owner: data.ownerName ?? "",
        amount: data.value,
        stage: data.stage,
        salesId: data.customerId,
        expectedClosingDate: data.expectedCloseDate || undefined,
        description: data.description,
        probability: data.probability,
    };
}

export function getDealErrorMessage(error: unknown) {
    return error instanceof Error
        ? error.message
        : "Đã xảy ra lỗi. Vui lòng thử lại.";
}

function getCurrentUser() {
    const user = useAuthStore.getState().user;

    if (!user) {
        throw new Error("Vui lòng đăng nhập để thực hiện thao tác.");
    }

    return user;
}

function requireSales() {
    const user = getCurrentUser();

    if (user.role !== "SALES" && user.role !== "ADMIN") {
        throw new Error("Bạn không có quyền gửi yêu cầu giảm giá.");
    }

    return user;
}

function requireApprover() {
    const user = getCurrentUser();

    if (user.role !== "ADMIN" && user.role !== "MANAGER") {
        throw new Error("Chỉ ADMIN hoặc MANAGER mới được duyệt giảm giá.");
    }

    return user;
}

export const dealService = {
    // GET /deals
    getDeals: async (
        page = 0,
        size = 10,
        search = "",
        stage: DealStage | "" = "",
    ): Promise<DealListResponse> => {
        try {
            const response = await api.get<BackendDealListResponse>(getDealsUrl(), {
                params: {
                    pgNum: page,
                    pgSize: size,
                    stage: stage || undefined,
                    order: "desc",
                    sortedBy: "createdAt",
                },
            });

            const backendList = response.data.content || [];
            const customerIds = backendList
                .map((d) => d.salesId)
                .filter((id): id is number => Boolean(id));
            await ensureCustomerNamesLoaded(customerIds);

            let content = backendList.map((d) => mapDealFromApi(d));

            if (search.trim()) {
                const query = search.trim().toLowerCase();
                content = content.filter(
                    (deal) =>
                        deal.name.toLowerCase().includes(query) ||
                        deal.customerName.toLowerCase().includes(query) ||
                        (deal.ownerName && deal.ownerName.toLowerCase().includes(query)) ||
                        String(deal.id).includes(query),
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
            console.warn("Backend GET /deals unavailable, falling back:", error);
            return dealMockApi.getDeals(page, size, search, stage);
        }
    },

    // GET /deals/{id}
    getDealById: async (id: number): Promise<Deal> => {
        try {
            const response = await api.get<BackendDeal>(getDealsUrl(`/${id}`));
            const data = response.data;
            if (data.salesId && !customerNameCache.has(data.salesId)) {
                try {
                    const customer = await customerService.getCustomerById(data.salesId);
                    if (customer?.name) customerNameCache.set(data.salesId, customer.name);
                } catch {
                    // ignore
                }
            }
            return mapDealFromApi(data);
        } catch (error) {
            console.warn(`Backend GET /deals/${id} unavailable, falling back:`, error);
            return dealMockApi.getDealById(id);
        }
    },

    // POST /deals
    createDeal: async (data: DealPayload): Promise<Deal> => {
        try {
            const payload = mapDealToApi(data);
            const response = await api.post<BackendDeal>(getDealsUrl(), payload);
            if (data.customerId && !customerNameCache.has(data.customerId)) {
                try {
                    const customer = await customerService.getCustomerById(data.customerId);
                    if (customer?.name) customerNameCache.set(data.customerId, customer.name);
                } catch {
                    // ignore
                }
            }
            return mapDealFromApi(response.data);
        } catch (error) {
            console.warn("Backend POST /deals unavailable, falling back:", error);
            const customer = await customerService.getCustomerById(data.customerId);
            return dealMockApi.createDeal(data, customer.name);
        }
    },

    // PUT /deals/{id}
    updateDeal: async (id: number, data: DealPayload): Promise<Deal> => {
        try {
            const payload = mapDealToApi(data);
            const response = await api.put<BackendDeal>(getDealsUrl(`/${id}`), payload);
            return mapDealFromApi(response.data);
        } catch (error) {
            console.warn(`Backend PUT /deals/${id} unavailable, falling back:`, error);
            const customer = await customerService.getCustomerById(data.customerId);
            return dealMockApi.updateDeal(id, data, customer.name);
        }
    },

    // DELETE /deals/{id}
    deleteDeal: async (id: number): Promise<void> => {
        try {
            await api.delete(getDealsUrl(`/${id}`));
        } catch (error) {
            console.warn(`Backend DELETE /deals/${id} unavailable, falling back:`, error);
            await dealMockApi.deleteDeal(id);
        }
    },

    // PATCH /deals/{id}
    updateDealStage: async (id: number, stage: DealStage): Promise<Deal> => {
        try {
            const response = await api.patch<BackendDeal>(getDealsUrl(`/${id}`), { stage });
            return mapDealFromApi(response.data);
        } catch (error) {
            console.warn(`Backend PATCH /deals/${id} unavailable, falling back:`, error);
            return dealMockApi.updateDealStage(id, stage);
        }
    },

    // GET /deals/pipeline/summary
    getPipelineSummary: async (): Promise<PipelineStageSummary[]> => {
        try {
            const response = await api.get<PipelineStageSummary[]>(getDealsUrl("/pipeline/summary"));
            if (Array.isArray(response.data)) {
                return response.data;
            }
        } catch (error) {
            console.warn("Backend /deals/pipeline/summary unavailable, computing fallback:", error);
        }

        // Fallback computation
        try {
            const allDeals = await dealService.getDeals(0, 1000);
            const stages: DealStage[] = ["NEW", "QUALIFIED", "PROPOSAL", "NEGOTIATION", "WON", "LOST"];
            return stages.map((st) => {
                const matching = allDeals.content.filter((d) => d.stage === st);
                return {
                    stage: st,
                    count: matching.length,
                    totalValue: matching.reduce((sum, d) => sum + (d.value || 0), 0),
                };
            });
        } catch {
            return [];
        }
    },

    // GET /deals/forecast
    getForecast: async (): Promise<DealForecastResponse> => {
        try {
            const response = await api.get<DealForecastResponse>(getDealsUrl("/forecast"));
            if (response.data && typeof response.data.totalPipelineValue === "number") {
                return response.data;
            }
        } catch (error) {
            console.warn("Backend /deals/forecast unavailable, computing fallback:", error);
        }

        // Fallback computation
        try {
            const summary = await dealService.getPipelineSummary();
            const STAGE_WEIGHTS: Record<string, number> = {
                NEW: 0.1,
                QUALIFIED: 0.3,
                PROPOSAL: 0.5,
                NEGOTIATION: 0.75,
                WON: 1.0,
                LOST: 0.0,
            };

            const totalDeals = summary.reduce((acc, s) => acc + s.count, 0);
            const totalPipelineValue = summary.reduce((acc, s) => acc + s.totalValue, 0);
            const weightedForecastValue = summary.reduce(
                (acc, s) => acc + s.totalValue * (STAGE_WEIGHTS[s.stage] ?? 0.2),
                0,
            );

            return {
                totalPipelineValue,
                weightedForecastValue,
                totalDeals,
                stages: summary,
            };
        } catch {
            return {
                totalPipelineValue: 0,
                weightedForecastValue: 0,
                totalDeals: 0,
                stages: [],
            };
        }
    },

    // Request discount approval
    requestDiscountApproval: async (id: number): Promise<Deal> => {
        requireSales();

        try {
            const response = await api.post<BackendDeal>(getDealsUrl(`/${id}/discount-approval`));
            return mapDealFromApi(response.data);
        } catch {
            return dealMockApi.requestDiscountApproval(id);
        }
    },

    // Approve discount
    approveDiscount: async (id: number): Promise<Deal> => {
        requireApprover();

        try {
            const response = await api.patch<BackendDeal>(getDealsUrl(`/${id}/discount-approval`), {
                status: "APPROVED",
            });
            return mapDealFromApi(response.data);
        } catch {
            return dealMockApi.approveDiscount(id, getCurrentUser().username);
        }
    },

    // Reject discount
    rejectDiscount: async (id: number, reason: string): Promise<Deal> => {
        requireApprover();

        if (!reason.trim()) {
            throw new Error("Vui lòng nhập lý do từ chối.");
        }

        try {
            const response = await api.patch<BackendDeal>(getDealsUrl(`/${id}/discount-approval`), {
                status: "REJECTED",
                reason: reason.trim(),
            });
            return mapDealFromApi(response.data);
        } catch {
            return dealMockApi.rejectDiscount(id, getCurrentUser().username, reason.trim());
        }
    },
};
