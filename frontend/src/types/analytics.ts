export type AnalyticsRange = "7d" | "30d" | "3m" | "6m" | "1y";

export interface DashboardStats {
    totalLeads: number;
    totalCustomers: number;
    totalDeals: number;
    totalRevenue: number;
    openTickets: number;
    wonDeals: number;
}

export interface MonthlyRevenue { month: string; revenue: number; }
export interface LeadSourceStat { source: string; count: number; }
export interface DealStageStat { stage: string; count: number; value: number; }
export interface TicketStatusStat { status: string; count: number; }
export interface TicketOverviewData { statuses: TicketStatusStat[]; urgentCount: number; }

export interface TopCustomer {
    customerId: number;
    customerName: string;
    deals: number;
    wonValue: number;
    ownerName: string;
}

export interface RecentActivity {
    id: number;
    type: "LEAD" | "CUSTOMER" | "DEAL" | "TICKET";
    description: string;
    timeAgo: string;
}

export interface SalesPerformanceStat {
    owner: string;
    deals: number;
    wonDeals: number;
    revenue: number;
    conversionRate: number;
}

export interface CustomerGrowthStat { month: string; customers: number; }
export interface ConversionFunnelItem { label: string; value: number; conversionRate: number; }
