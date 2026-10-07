import PageHeader from "../../components/common/PageHeader";
import { Alert, Button, Skeleton } from "@mui/material";
import { useEffect, useState } from "react";

import AnalyticsFilter from "../../components/analytics/AnalyticsFilter";
import ConversionFunnel from "../../components/analytics/ConversionFunnel";
import CustomerGrowthChart from "../../components/analytics/CustomerGrowthChart";
import LeadSourceChart from "../../components/dashboard/LeadSourceChart";
import PipelineChart from "../../components/dashboard/PipelineChart";
import RevenueChart from "../../components/dashboard/RevenueChart";
import SalesPerformance from "../../components/dashboard/SalesPerformance";
import TicketOverview from "../../components/dashboard/TicketOverview";
import { analyticsService, getAnalyticsErrorMessage } from "../../services/analyticsService";
import { useAuthStore } from "../../stores/authStore";
import type { AnalyticsRange, ConversionFunnelItem, CustomerGrowthStat, DealStageStat, LeadSourceStat, MonthlyRevenue, SalesPerformanceStat, TicketOverviewData } from "../../types/analytics";

const EMPTY_TICKETS: TicketOverviewData = { statuses: [], urgentCount: 0 };

export default function AnalyticsPage() {
  const role = useAuthStore((state) => state.user?.role);
  const [range, setRange] = useState<AnalyticsRange>("6m");
  const [revenue, setRevenue] = useState<MonthlyRevenue[]>([]);
  const [leadSources, setLeadSources] = useState<LeadSourceStat[]>([]);
  const [pipeline, setPipeline] = useState<DealStageStat[]>([]);
  const [tickets, setTickets] = useState(EMPTY_TICKETS);
  const [performance, setPerformance] = useState<SalesPerformanceStat[]>([]);
  const [growth, setGrowth] = useState<CustomerGrowthStat[]>([]);
  const [funnel, setFunnel] = useState<ConversionFunnelItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let active = true;
    const loadAnalytics = async () => {
      setLoading(true); setError("");
      try {
        const [revenueData, sourceData, pipelineData, ticketData, performanceData, growthData, funnelData] = await Promise.all([
          analyticsService.getRevenueByMonth(range), analyticsService.getLeadSourceStats(), analyticsService.getDealStageStats(range),
          analyticsService.getTicketStatusStats(), analyticsService.getSalesPerformance(range), analyticsService.getCustomerGrowth(range), analyticsService.getConversionFunnel(),
        ]);
        if (!active) return;
        setRevenue(revenueData); setLeadSources(sourceData); setPipeline(pipelineData); setTickets(ticketData);
        setPerformance(performanceData); setGrowth(growthData); setFunnel(funnelData);
      } catch (loadError) {
        if (active) setError(getAnalyticsErrorMessage(loadError));
      } finally {
        if (active) setLoading(false);
      }
    };
    void loadAnalytics();
    return () => { active = false; };
  }, [range, refreshKey]);

  return (
    <div className="crm-dashboard">
      <PageHeader title="Analytics" description="Phân tích chi tiết hiệu suất CRM" actions={<AnalyticsFilter value={range} onChange={setRange} />} />
      {error && <Alert severity="error" action={<Button color="inherit" size="small" onClick={() => setRefreshKey((value) => value + 1)}>Thử lại</Button>}>{error}</Alert>}
      {loading ? (
        <div className="crm-widget-grid">{Array.from({ length: 6 }, (_, index) => <Skeleton key={index} className="crm-widget--half" variant="rounded" height={340} />)}</div>
      ) : (
        <div className="crm-widget-grid">
          <RevenueChart data={revenue} />
          <PipelineChart data={pipeline} />
          <LeadSourceChart data={leadSources} />
          {role === "ADMIN" && <TicketOverview data={tickets} />}
          <CustomerGrowthChart data={growth} />
          <ConversionFunnel data={funnel} />
          <SalesPerformance data={performance} />
        </div>
      )}
    </div>
  );
}
