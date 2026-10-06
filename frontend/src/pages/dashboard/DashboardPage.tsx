import PageHeader from "../../components/common/PageHeader";
import { Alert, Button, Skeleton } from "@mui/material";
import { BadgeDollarSign, BriefcaseBusiness, TicketCheck, Trophy, UserRoundSearch, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import AnalyticsFilter from "../../components/analytics/AnalyticsFilter";
import KpiCard from "../../components/dashboard/KpiCard";
import LeadSourceChart from "../../components/dashboard/LeadSourceChart";
import PipelineChart from "../../components/dashboard/PipelineChart";
import RecentActivities from "../../components/dashboard/RecentActivities";
import RevenueChart from "../../components/dashboard/RevenueChart";
import SalesPerformance from "../../components/dashboard/SalesPerformance";
import TicketOverview from "../../components/dashboard/TicketOverview";
import TopCustomers from "../../components/dashboard/TopCustomers";
import { analyticsService, getAnalyticsErrorMessage } from "../../services/analyticsService";
import { useAuthStore } from "../../stores/authStore";
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

const EMPTY_STATS: DashboardStats = { totalLeads: 0, totalCustomers: 0, totalDeals: 0, totalRevenue: 0, openTickets: 0, wonDeals: 0 };
const EMPTY_TICKETS: TicketOverviewData = { statuses: [], urgentCount: 0 };

export default function DashboardPage() {
  const navigate = useNavigate();
  const role = useAuthStore((state) => state.user?.role);
  const canViewSales = role !== "SUPPORT";
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
        setStats(statsData); setRevenue(revenueData); setLeadSources(sourceData); setPipeline(pipelineData);
        setTickets(ticketData); setTopCustomers(customersData); setActivities(activityData); setPerformance(performanceData);
      } catch (loadError) {
        if (active) setError(getAnalyticsErrorMessage(loadError));
      } finally {
        if (active) setLoading(false);
      }
    };
    void loadDashboard();
    return () => { active = false; };
  }, [range, refreshKey]);

  const supportActivities = activities.filter((activity) => activity.type === "CUSTOMER" || activity.type === "TICKET");

  return (
    <div className={`crm-dashboard ${canViewSales ? "" : "crm-dashboard--support"}`}>
      <PageHeader title="Dashboard" description="Tổng quan hoạt động CRM" actions={<AnalyticsFilter value={range} onChange={setRange} />} />

      {error && <Alert severity="error" action={<Button color="inherit" size="small" onClick={() => setRefreshKey((value) => value + 1)}>Thử lại</Button>}>{error}</Alert>}

      {loading ? (
        <DashboardSkeleton />
      ) : (
        <>
          <div className={`crm-kpi-grid ${canViewSales ? "" : "crm-kpi-grid--compact"}`}>
            {canViewSales && <KpiCard title="Tổng Lead" value={stats.totalLeads} icon={UserRoundSearch} trend="+12%" tone="teal" />}
            <KpiCard title="Khách hàng" value={stats.totalCustomers} icon={Users} trend="+8%" tone="blue" />
            {canViewSales && <KpiCard title="Tổng Deal" value={stats.totalDeals} icon={BriefcaseBusiness} trend="+5%" tone="purple" />}
            {canViewSales && <KpiCard title="Doanh thu" value={formatVND(stats.totalRevenue)} icon={BadgeDollarSign} trend="+18%" tone="green" />}
            <KpiCard title="Ticket đang mở" value={stats.openTickets} icon={TicketCheck} tone="rose" />
            {canViewSales && <KpiCard title="Deal thắng" value={stats.wonDeals} icon={Trophy} trend="+10%" tone="amber" />}
          </div>

          <div className="crm-widget-grid">
            {canViewSales && <RevenueChart data={revenue} />}
            {canViewSales && <PipelineChart data={pipeline} />}
            {canViewSales && <LeadSourceChart data={leadSources} />}
            <TicketOverview data={tickets} />
            {canViewSales && <TopCustomers data={topCustomers} onCustomerClick={(id) => navigate(`/customers/${id}`)} />}
            <RecentActivities data={canViewSales ? activities : supportActivities} />
            {canViewSales && <SalesPerformance data={performance} />}
          </div>
        </>
      )}
    </div>
  );
}

function DashboardSkeleton() {
  return <div className="crm-stack"><div className="crm-kpi-grid">{Array.from({ length: 6 }, (_, index) => <Skeleton key={index} variant="rounded" height={132} />)}</div><div className="crm-widget-grid">{Array.from({ length: 4 }, (_, index) => <Skeleton key={index} className="crm-widget--half" variant="rounded" height={340} />)}</div></div>;
}
