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

const ANALYTICS_DELAY_MS = 250;
const rangeMonths: Record<AnalyticsRange, number> = { "7d": 1, "30d": 2, "3m": 3, "6m": 6, "1y": 12 };
const monthlyRevenue: MonthlyRevenue[] = [
    { month: "T10/25", revenue: 95_000_000 }, { month: "T11/25", revenue: 120_000_000 },
    { month: "T12/25", revenue: 165_000_000 }, { month: "T1", revenue: 120_000_000 },
    { month: "T2", revenue: 150_000_000 }, { month: "T3", revenue: 138_000_000 },
    { month: "T4", revenue: 190_000_000 }, { month: "T5", revenue: 210_000_000 },
    { month: "T6", revenue: 205_000_000 }, { month: "T7", revenue: 245_000_000 },
    { month: "T8", revenue: 270_000_000 }, { month: "T9", revenue: 335_000_000 },
];
const customerGrowth: CustomerGrowthStat[] = [
    { month: "T10/25", customers: 18 }, { month: "T11/25", customers: 22 }, { month: "T12/25", customers: 27 },
    { month: "T1", customers: 31 }, { month: "T2", customers: 35 }, { month: "T3", customers: 42 },
    { month: "T4", customers: 49 }, { month: "T5", customers: 56 }, { month: "T6", customers: 63 },
    { month: "T7", customers: 72 }, { month: "T8", customers: 84 }, { month: "T9", customers: 96 },
];

function wait() { return new Promise<void>((resolve) => window.setTimeout(resolve, ANALYTICS_DELAY_MS)); }
function sliceForRange<T>(items: T[], range: AnalyticsRange) { return items.slice(-rangeMonths[range]); }
function filterDealsByRange(deals: Deal[], range: AnalyticsRange) {
    const days: Record<AnalyticsRange, number> = { "7d": 7, "30d": 30, "3m": 90, "6m": 180, "1y": 365 };
    const cutoff = new Date(); cutoff.setDate(cutoff.getDate() - days[range]);
    return deals.filter((deal) => new Date(deal.createdAt) >= cutoff);
}

export const analyticsService = {
    getDashboardStats: async (range: AnalyticsRange): Promise<DashboardStats> => {
        const [, leads, customers, deals, tickets] = await Promise.all([wait(), leadService.getLeads({ page: 0, size: 1000 }), customerService.getCustomers(0, 1000), dealService.getDeals(0, 1000), ticketService.getTickets(0, 1000)]);
        const rangedDeals = filterDealsByRange(deals.content, range);
        const wonDeals = rangedDeals.filter((deal) => deal.stage === "WON");
        return { totalLeads: leads.totalElements, totalCustomers: customers.totalElements, totalDeals: rangedDeals.length, totalRevenue: wonDeals.reduce((total, deal) => total + deal.value, 0), openTickets: tickets.content.filter((ticket) => ticket.status === "OPEN").length, wonDeals: wonDeals.length };
    },
    getRevenueByMonth: async (range: AnalyticsRange): Promise<MonthlyRevenue[]> => { await wait(); return sliceForRange(monthlyRevenue, range); },
    getLeadSourceStats: async (): Promise<LeadSourceStat[]> => {
        const [, response] = await Promise.all([wait(), leadService.getLeads({ page: 0, size: 1000 })]);
        const counts = new Map<string, number>(); response.content.forEach((lead) => counts.set(lead.source, (counts.get(lead.source) ?? 0) + 1));
        return Array.from(counts, ([source, count]) => ({ source, count }));
    },
    getDealStageStats: async (range: AnalyticsRange): Promise<DealStageStat[]> => {
        const [, response] = await Promise.all([wait(), dealService.getDeals(0, 1000)]);
        const stages = ["NEW", "QUALIFIED", "PROPOSAL", "NEGOTIATION", "WON", "LOST"];
        const deals = filterDealsByRange(response.content, range);
        return stages.map((stage) => { const items = deals.filter((deal) => deal.stage === stage); return { stage, count: items.length, value: items.reduce((total, deal) => total + deal.value, 0) }; });
    },
    getTicketStatusStats: async (): Promise<TicketOverviewData> => {
        const [, response] = await Promise.all([wait(), ticketService.getTickets(0, 1000)]);
        const statuses = ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"].map((status) => ({ status, count: response.content.filter((ticket) => ticket.status === status).length }));
        return { statuses, urgentCount: response.content.filter((ticket) => ticket.priority === "URGENT").length };
    },
    getTopCustomers: async (range: AnalyticsRange): Promise<TopCustomer[]> => {
        const [, dealResponse, customerResponse] = await Promise.all([wait(), dealService.getDeals(0, 1000), customerService.getCustomers(0, 1000)]);
        const deals = filterDealsByRange(dealResponse.content, range);
        return customerResponse.content.map((customer) => { const related = deals.filter((deal) => deal.customerId === customer.id); return { customerId: customer.id, customerName: customer.name, deals: related.length, wonValue: related.filter((deal) => deal.stage === "WON").reduce((total, deal) => total + deal.value, 0), ownerName: customer.ownerName || "—" }; }).filter((item) => item.deals > 0).sort((first, second) => second.wonValue - first.wonValue || second.deals - first.deals).slice(0, 5);
    },
    getRecentActivities: async (range: AnalyticsRange): Promise<RecentActivity[]> => {
        await wait();
        const activities: RecentActivity[] = [
            { id: 1, type: "DEAL", description: "Deal “CRM Implementation” chuyển sang WON", timeAgo: "5 phút trước" },
            { id: 2, type: "TICKET", description: "Ticket #101 được giải quyết", timeAgo: "20 phút trước" },
            { id: 3, type: "CUSTOMER", description: "Khách hàng Nguyễn Minh Anh được cập nhật", timeAgo: "1 giờ trước" },
            { id: 4, type: "LEAD", description: "Lead mới được tạo từ Website", timeAgo: "2 giờ trước" },
            { id: 5, type: "DEAL", description: "Deal Website Upgrade chuyển sang Proposal", timeAgo: "1 ngày trước" },
        ];
        return range === "7d" ? activities.slice(0, 4) : activities;
    },
    getSalesPerformance: async (range: AnalyticsRange): Promise<SalesPerformanceStat[]> => {
        const [, response] = await Promise.all([wait(), dealService.getDeals(0, 1000)]);
        const deals = filterDealsByRange(response.content, range);
        return [{ sourceName: "Sơn", displayName: "Sơn" }, { sourceName: "Trúc", displayName: "Trúc" }, { sourceName: "Hải", displayName: "Hải Anh" }].map(({ sourceName, displayName }) => { const owned = deals.filter((deal) => deal.ownerName === sourceName); const won = owned.filter((deal) => deal.stage === "WON"); return { owner: displayName, deals: owned.length, wonDeals: won.length, revenue: won.reduce((total, deal) => total + deal.value, 0), conversionRate: owned.length === 0 ? 0 : Math.round(won.length / owned.length * 100) }; });
    },
    getCustomerGrowth: async (range: AnalyticsRange): Promise<CustomerGrowthStat[]> => { await wait(); return sliceForRange(customerGrowth, range); },
    getConversionFunnel: async (): Promise<ConversionFunnelItem[]> => {
        const [, leads, customers, deals] = await Promise.all([wait(), leadService.getLeads({ page: 0, size: 1000 }), customerService.getCustomers(0, 1000), dealService.getDeals(0, 1000)]);
        const wonDeals = deals.content.filter((deal) => deal.stage === "WON").length;
        const leadCount = Math.max(leads.totalElements, customers.totalElements + 18, 30);
        const qualifiedCount = Math.min(leadCount, Math.max(leads.content.filter((lead) => lead.status === "QUALIFIED" || lead.status === "CONVERTED").length, customers.totalElements + 8));
        const customerCount = Math.min(qualifiedCount, customers.totalElements);
        const dealCount = Math.min(customerCount, deals.totalElements);
        const values = [leadCount, qualifiedCount, customerCount, dealCount, Math.min(dealCount, wonDeals)];
        return ["Leads", "Qualified Leads", "Customers", "Deals", "Won Deals"].map((label, index) => ({ label, value: values[index], conversionRate: index === 0 || values[index - 1] === 0 ? 100 : Math.round(values[index] / values[index - 1] * 100) }));
    },
};

export function getAnalyticsErrorMessage(error: unknown) { return error instanceof Error ? error.message : "Không thể tải dữ liệu dashboard"; }
