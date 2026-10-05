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
    <div className="analytics-page">
      <div className="analytics-page__header">
        <div><h1>Dashboard</h1><p>Tổng quan hoạt động CRM</p></div>
        <AnalyticsFilter value={range} onChange={setRange} />
      </div>

      {error && <Alert severity="error" action={<Button color="inherit" size="small" onClick={() => setRefreshKey((value) => value + 1)}>Thử lại</Button>}>{error}</Alert>}

      {loading ? (
        <DashboardSkeleton />
      ) : (
        <>
          <div className={`kpi-grid ${canViewSales ? "" : "kpi-grid--compact"}`}>
            {canViewSales && <KpiCard title="Tổng Lead" value={stats.totalLeads} icon={UserRoundSearch} trend="+12%" colorClassName="bg-blue-50 text-blue-600" />}
            <KpiCard title="Khách hàng" value={stats.totalCustomers} icon={Users} trend="+8%" colorClassName="bg-cyan-50 text-cyan-600" />
            {canViewSales && <KpiCard title="Tổng Deal" value={stats.totalDeals} icon={BriefcaseBusiness} trend="+5%" colorClassName="bg-violet-50 text-violet-600" />}
            {canViewSales && <KpiCard title="Doanh thu" value={formatVND(stats.totalRevenue)} icon={BadgeDollarSign} trend="+18%" colorClassName="bg-emerald-50 text-emerald-600" />}
            <KpiCard title="Ticket đang mở" value={stats.openTickets} icon={TicketCheck} colorClassName="bg-orange-50 text-orange-600" />
            {canViewSales && <KpiCard title="Deal thắng" value={stats.wonDeals} icon={Trophy} trend="+10%" colorClassName="bg-amber-50 text-amber-600" />}
          </div>

          <div className="analytics-grid">
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
  return <div className="dashboard-skeleton"><div className="kpi-grid">{Array.from({ length: 6 }, (_, index) => <Skeleton key={index} variant="rounded" height={132} />)}</div><div className="analytics-grid">{Array.from({ length: 4 }, (_, index) => <Skeleton key={index} variant="rounded" height={340} />)}</div></div>;
}
