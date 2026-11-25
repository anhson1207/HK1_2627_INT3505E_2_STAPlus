import PageHeader from "../common/PageHeader";
import { Alert, Button, Skeleton } from "@mui/material";
import { BadgeDollarSign, BriefcaseBusiness, TicketCheck, Trophy, UserRoundSearch, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import AnalyticsFilter from "../analytics/AnalyticsFilter";
import KpiCard from "./KpiCard";
import LeadSourceChart from "./LeadSourceChart";
import PipelineChart from "./PipelineChart";
import RecentActivities from "./RecentActivities";
import RevenueChart from "./RevenueChart";
import SalesPerformance from "./SalesPerformance";
import TicketOverview from "./TicketOverview";
import TopCustomers from "./TopCustomers";
import { analyticsService, getAnalyticsErrorMessage } from "../../services/analyticsService";
import type { AuthUser } from "../../types/auth";
import type {
  AnalyticsRange,
  DashboardStats,
  DealStageStat,
  LeadSourceStat,
  MonthlyRevenue,
  RecentActivity,
  SalesPerformanceStat,
  TicketOverviewData,
  TopCustomer,
} from "../../types/analytics";
import { formatVND } from "../../utils/currency";

interface AdminDashboardProps {
  user: AuthUser | null;
}

const EMPTY_STATS: DashboardStats = { totalLeads: 0, totalCustomers: 0, totalDeals: 0, totalRevenue: 0, openTickets: 0, wonDeals: 0 };
const EMPTY_TICKETS: TicketOverviewData = { statuses: [], urgentCount: 0 };

export default function AdminDashboard({ user: _user }: AdminDashboardProps) {
  const navigate = useNavigate();
  const [range, setRange] = useState<AnalyticsRange>("30d");
  const [stats, setStats] = useState(EMPTY_STATS);
  const [revenue, setRevenue] = useState<MonthlyRevenue[]>([]);
  const [leadSources, setLeadSources] = useState<LeadSourceStat[]>([]);
  const [pipeline, setPipeline] = useState<DealStageStat[]>([]);
  const [tickets, setTickets] = useState(EMPTY_TICKETS);
  const [topCustomers, setTopCustomers] = useState<TopCustomer[]>([]);
  const [activities, setActivities] = useState<RecentActivity[]>([]);
  const [performance, setPerformance] = useState<SalesPerformanceStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let active = true;
    const loadDashboard = async () => {
      setLoading(true);
      setError("");
      try {
        const [statsData, revenueData, sourceData, pipelineData, ticketData, customersData, activityData, performanceData] = await Promise.all([
          analyticsService.getDashboardStats(range),
          analyticsService.getRevenueByMonth(range),
          analyticsService.getLeadSourceStats(),
          analyticsService.getDealStageStats(range),
          analyticsService.getTicketStatusStats(),
          analyticsService.getTopCustomers(range),
          analyticsService.getRecentActivities(range),
          analyticsService.getSalesPerformance(range),
        ]);
        if (!active) return;
        setStats(statsData);
        setRevenue(revenueData);
        setLeadSources(sourceData);
        setPipeline(pipelineData);
        setTickets(ticketData);
        setTopCustomers(customersData);
        setActivities(activityData);
        setPerformance(performanceData);
      } catch (loadError) {
        if (active) setError(getAnalyticsErrorMessage(loadError));
      } finally {
        if (active) setLoading(false);
      }
    };
    void loadDashboard();
    return () => { active = false; };
  }, [range, refreshKey]);

  return (
    <div className="crm-dashboard">
      <PageHeader
        title="Tổng quan Doanh nghiệp"
        description="Báo cáo phân tích hiệu suất và số liệu kinh doanh toàn hệ thống"
        actions={<AnalyticsFilter value={range} onChange={setRange} />}
      />

      {error && (
        <Alert severity="error" action={<Button color="inherit" size="small" onClick={() => setRefreshKey((value) => value + 1)}>Thử lại</Button>}>
          {error}
        </Alert>
      )}

      {loading ? (
        <DashboardSkeleton />
      ) : (
        <>
          <div className="crm-kpi-grid">
            <KpiCard title="Tổng Lead" value={stats.totalLeads} icon={UserRoundSearch} trend={stats.leadsTrend ?? undefined} tone="teal" />
            <KpiCard title="Khách hàng" value={stats.totalCustomers} icon={Users} trend={stats.customersTrend ?? undefined} tone="blue" />
            <KpiCard title="Tổng Deal" value={stats.totalDeals} icon={BriefcaseBusiness} trend={stats.dealsTrend ?? undefined} tone="purple" />
            <KpiCard title="Doanh thu" value={formatVND(stats.totalRevenue)} icon={BadgeDollarSign} trend={stats.revenueTrend ?? undefined} tone="green" />
            <KpiCard title="Ticket đang mở" value={stats.openTickets} icon={TicketCheck} tone="rose" />
            <KpiCard title="Deal thắng" value={stats.wonDeals} icon={Trophy} trend={stats.wonDealsTrend ?? undefined} tone="amber" />
          </div>

          <div className="crm-widget-grid">
            <RevenueChart data={revenue} />
            <PipelineChart data={pipeline} />
            <LeadSourceChart data={leadSources} />
            <TicketOverview data={tickets} />
            <TopCustomers data={topCustomers} onCustomerClick={(id) => navigate(`/customers/${id}`)} />
            <RecentActivities data={activities} />
            <SalesPerformance data={performance} />
          </div>
        </>
      )}
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="crm-stack">
      <div className="crm-kpi-grid">
        {Array.from({ length: 6 }, (_, index) => (
          <Skeleton key={index} variant="rounded" height={132} />
        ))}
      </div>
      <div className="crm-widget-grid">
        {Array.from({ length: 4 }, (_, index) => (
          <Skeleton key={index} className="crm-widget--half" variant="rounded" height={340} />
        ))}
      </div>
    </div>
  );
}
