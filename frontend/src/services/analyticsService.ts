import api from "./api";
import { customerService } from "./customerService";
import { dealService } from "./dealService";
import { leadService } from "./leadService";
import { ticketService } from "./ticketService";
import type {
    AnalyticsRange,
    ConversionFunnelItem,
    CustomerGrowthStat,
    DashboardStats,
    DealStageStat,
    LeadSourceStat,
    MonthlyRevenue,
    RecentActivity,
    SalesPerformanceStat,
    TicketOverviewData,
    TopCustomer,
} from "../types/analytics";
import type { Deal } from "../types/deal";

const ANALYTICS_DELAY_MS = 50;

function wait() { return new Promise<void>((resolve) => window.setTimeout(resolve, ANALYTICS_DELAY_MS)); }
function filterDealsByRange(deals: Deal[], range: AnalyticsRange) {
    const days: Record<AnalyticsRange, number> = { "7d": 7, "30d": 30, "3m": 90, "6m": 180, "1y": 365 };
    const cutoff = new Date(); cutoff.setDate(cutoff.getDate() - days[range]);
    return deals.filter((deal) => new Date(deal.createdAt) >= cutoff);
}

export const analyticsService = {
    getDashboardStats: async (range: AnalyticsRange): Promise<DashboardStats> => {
        try {
            const res = await api.get<DashboardStats>(`/analytics/dashboard-stats?range=${range}`);
            if (res.data) return res.data;
        } catch {
            // fallback to live client-side aggregation across domain services
        }
        const [, leads, customers, deals, tickets] = await Promise.all([
            wait(),
            leadService.getLeads({ page: 0, size: 100 }),
            customerService.getCustomers(0, 100),
            dealService.getDeals(0, 100),
            ticketService.getTickets(0, 100)
        ]);
        const rangedDeals = filterDealsByRange(deals.content, range);
        const wonDeals = rangedDeals.filter((deal) => deal.stage === "WON");
        return {
            totalLeads: leads.totalElements,
            totalCustomers: customers.totalElements,
            totalDeals: rangedDeals.length,
            totalRevenue: wonDeals.reduce((total, deal) => total + deal.value, 0),
            openTickets: tickets.content.filter((ticket) => ticket.status === "OPEN").length,
            wonDeals: wonDeals.length
        };
    },

    getRevenueByMonth: async (range: AnalyticsRange): Promise<MonthlyRevenue[]> => {
        try {
            const res = await api.get<MonthlyRevenue[]>(`/analytics/revenue?range=${range}`);
            if (Array.isArray(res.data)) return res.data;
        } catch {
            // fallback
        }
        const deals = await dealService.getDeals(0, 1000);
        const monthTotals = new Map<string, number>();
        deals.content
            .filter((d) => d.stage === "WON")
            .forEach((d) => {
                const dt = new Date(d.createdAt);
                const label = Number.isNaN(dt.getTime()) ? "Hiện tại" : `T${dt.getMonth() + 1}`;
                monthTotals.set(label, (monthTotals.get(label) ?? 0) + d.value);
            });
        return Array.from(monthTotals, ([month, revenue]) => ({ month, revenue }));
    },

    getLeadSourceStats: async (): Promise<LeadSourceStat[]> => {
        try {
            const res = await api.get<LeadSourceStat[]>("/analytics/lead-sources");
            if (Array.isArray(res.data)) return res.data;
        } catch {
            // fallback
        }
        const [, response] = await Promise.all([wait(), leadService.getLeads({ page: 0, size: 100 })]);
        const counts = new Map<string, number>();
        response.content.forEach((lead) => counts.set(lead.source, (counts.get(lead.source) ?? 0) + 1));
        return Array.from(counts, ([source, count]) => ({ source, count }));
    },

    getDealStageStats: async (range: AnalyticsRange): Promise<DealStageStat[]> => {
        try {
            const res = await api.get<DealStageStat[]>(`/analytics/deal-stages?range=${range}`);
            if (Array.isArray(res.data)) return res.data;
        } catch {
            // fallback
        }
        const [, response] = await Promise.all([wait(), dealService.getDeals(0, 1000)]);
        const stages = ["NEW", "QUALIFIED", "PROPOSAL", "NEGOTIATION", "WON", "LOST"];
        const deals = filterDealsByRange(response.content, range);
        return stages.map((stage) => {
            const items = deals.filter((deal) => deal.stage === stage);
            return { stage, count: items.length, value: items.reduce((total, deal) => total + deal.value, 0) };
        });
    },

    getTicketStatusStats: async (): Promise<TicketOverviewData> => {
        try {
            const res = await api.get<TicketOverviewData>("/analytics/ticket-status");
            if (res.data && Array.isArray(res.data.statuses)) return res.data;
        } catch {
            // fallback
        }
        const [, response] = await Promise.all([wait(), ticketService.getTickets(0, 1000)]);
        const statuses = ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"].map((status) => ({
            status,
            count: response.content.filter((ticket) => ticket.status === status).length
        }));
        return { statuses, urgentCount: response.content.filter((ticket) => ticket.priority === "URGENT").length };
    },

    getTopCustomers: async (range: AnalyticsRange): Promise<TopCustomer[]> => {
        try {
            const res = await api.get<TopCustomer[]>(`/analytics/top-customers?range=${range}`);
            if (Array.isArray(res.data)) return res.data;
        } catch {
            // fallback
        }
        const [, dealResponse, customerResponse] = await Promise.all([wait(), dealService.getDeals(0, 1000), customerService.getCustomers(0, 1000)]);
        const deals = filterDealsByRange(dealResponse.content, range);
        return customerResponse.content.map((customer) => {
            const related = deals.filter((deal) => deal.customerId === customer.id);
            return {
                customerId: customer.id,
                customerName: customer.name,
                deals: related.length,
                wonValue: related.filter((deal) => deal.stage === "WON").reduce((total, deal) => total + deal.value, 0),
                ownerName: customer.ownerName || "—"
            };
        }).filter((item) => item.deals > 0).sort((first, second) => second.wonValue - first.wonValue || second.deals - first.deals).slice(0, 5);
    },

    getRecentActivities: async (range: AnalyticsRange): Promise<RecentActivity[]> => {
        try {
            const res = await api.get<RecentActivity[]>(`/analytics/recent-activities?range=${range}`);
            if (Array.isArray(res.data)) return res.data;
        } catch {
            // fallback
        }
        return [];
    },

    getSalesPerformance: async (range: AnalyticsRange): Promise<SalesPerformanceStat[]> => {
        try {
            const res = await api.get<SalesPerformanceStat[]>(`/analytics/sales-performance?range=${range}`);
            if (Array.isArray(res.data)) return res.data;
        } catch {
            // fallback
        }
        const [, response] = await Promise.all([wait(), dealService.getDeals(0, 1000)]);
        const deals = filterDealsByRange(response.content, range);
        const byOwner = new Map<string, Deal[]>();
        deals.forEach((deal) => {
            const key = deal.ownerName?.trim() || "Chưa phân công";
            byOwner.set(key, [...(byOwner.get(key) ?? []), deal]);
        });
        return Array.from(byOwner, ([owner, owned]) => {
            const won = owned.filter((deal) => deal.stage === "WON");
            return {
                owner,
                deals: owned.length,
                wonDeals: won.length,
                revenue: won.reduce((total, deal) => total + deal.value, 0),
                conversionRate: owned.length === 0 ? 0 : Math.round(won.length / owned.length * 100)
            };
        });
    },

    getCustomerGrowth: async (range: AnalyticsRange): Promise<CustomerGrowthStat[]> => {
        try {
            const res = await api.get<CustomerGrowthStat[]>(`/analytics/customer-growth?range=${range}`);
            if (Array.isArray(res.data)) return res.data;
        } catch {
            // fallback
        }
        const customers = await customerService.getCustomers(0, 1000);
        const byMonth = new Map<string, number>();
        customers.content.forEach((c) => {
            const dt = new Date(c.createdAt);
            const label = Number.isNaN(dt.getTime()) ? "Hiện tại" : `T${dt.getMonth() + 1}`;
            byMonth.set(label, (byMonth.get(label) ?? 0) + 1);
        });
        return Array.from(byMonth, ([month, count]) => ({ month, customers: count }));
    },

    getConversionFunnel: async (): Promise<ConversionFunnelItem[]> => {
        try {
            const res = await api.get<ConversionFunnelItem[]>("/analytics/conversion-funnel");
            if (Array.isArray(res.data)) return res.data;
        } catch {
            // fallback
        }
        const [, leads, customers, deals] = await Promise.all([
            wait(),
            leadService.getLeads({ page: 0, size: 100 }),
            customerService.getCustomers(0, 100),
            dealService.getDeals(0, 100)
        ]);
        const totalLeads = leads.totalElements;
        const qualifiedLeads = leads.content.filter((l) => l.status === "QUALIFIED" || l.status === "CONVERTED").length;
        const totalCustomers = customers.totalElements;
        const totalDeals = deals.totalElements;
        const wonDeals = deals.content.filter((d) => d.stage === "WON").length;
        const values = [totalLeads, qualifiedLeads, totalCustomers, totalDeals, wonDeals];
        return ["Leads", "Qualified Leads", "Customers", "Deals", "Won Deals"].map((label, index) => ({
            label,
            value: values[index],
            conversionRate: index === 0 ? (totalLeads > 0 ? 100 : 0) : values[index - 1] === 0 ? 0 : Math.round((values[index] / values[index - 1]) * 100)
        }));
    },
};

export function getAnalyticsErrorMessage(error: unknown) {
    return error instanceof Error ? error.message : "Không thể tải dữ liệu dashboard";
}
