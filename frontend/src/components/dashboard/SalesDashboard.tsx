import { Alert, CircularProgress } from "@mui/material";
import {
    BadgeDollarSign,
    BriefcaseBusiness,
    CalendarClock,
    ChevronRight,
    Mail,
    MessageSquare,
    Phone,
    Plus,
    UserRoundSearch,
    Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import KpiCard from "./KpiCard";
import UpcomingReminders from "./UpcomingReminders";
import DealStageBadge from "../deals/DealStageBadge";
import StatusChip from "../common/StatusChip";
import { customerService } from "../../services/customerService";
import { dealService } from "../../services/dealService";
import { leadService } from "../../services/leadService";
import { reminderService } from "../../services/reminderService";
import type { AuthUser } from "../../types/auth";
import type { Customer } from "../../types/customer";
import type { Deal } from "../../types/deal";
import type { Lead } from "../../types/lead";
import { formatVND } from "../../utils/currency";

interface SalesDashboardProps {
    user: AuthUser | null;
}

export default function SalesDashboard({ user }: SalesDashboardProps) {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [totalCustomers, setTotalCustomers] = useState(0);
    const [recentCustomers, setRecentCustomers] = useState<Customer[]>([]);

    const [totalLeads, setTotalLeads] = useState(0);
    const [activeLeads, setActiveLeads] = useState<Lead[]>([]);

    const [totalDeals, setTotalDeals] = useState(0);
    const [wonRevenue, setWonRevenue] = useState(0);
    const [activeDeals, setActiveDeals] = useState<Deal[]>([]);

    const [pendingRemindersCount, setPendingRemindersCount] = useState(0);

    useEffect(() => {
        let isMounted = true;

        const loadSalesData = async () => {
            setLoading(true);
            setError("");
            try {
                const [customersRes, leadsRes, dealsRes, remindersRes] = await Promise.all([
                    customerService.getCustomers(0, 10, undefined, undefined, user?.id),
                    leadService.getLeads({ size: 10, assignedUserId: user?.id }),
                    dealService.getDeals(0, 50),
                    reminderService.getUpcomingReminders(),
                ]);

                if (!isMounted) return;

                // Customers
                setTotalCustomers(customersRes.totalElements);
                setRecentCustomers(customersRes.content.slice(0, 5));

                // Leads
                setTotalLeads(leadsRes.totalElements);
                setActiveLeads(leadsRes.content.slice(0, 5));

                // Deals
                const deals = dealsRes.content || [];
                setTotalDeals(dealsRes.totalElements || deals.length);
                const won = deals.filter((d) => d.stage === "WON");
                const sumWon = won.reduce((sum, d) => sum + (d.value || 0), 0);
                setWonRevenue(sumWon);
                const activeDealsList = deals.filter((d) => d.stage !== "WON" && d.stage !== "LOST");
                setActiveDeals(activeDealsList.slice(0, 5));

                // Reminders
                setPendingRemindersCount(remindersRes.length);
            } catch (err) {
                if (isMounted) {
                    setError(err instanceof Error ? err.message : "Không thể tải dữ liệu bàn làm việc.");
                }
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        void loadSalesData();

        return () => {
            isMounted = false;
        };
    }, [user?.id]);

    const displayName = user?.fullName || user?.email || "Nhân viên Kinh doanh";

    return (
        <div className="crm-stack">
            {/* Header */}
            <div className="crm-card crm-card__body border-(--crm-border) bg-linear-to-r from-blue-50/70 via-indigo-50/30 to-transparent dark:from-blue-950/20 dark:via-indigo-950/10">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="inline-block rounded-md bg-blue-600 px-2 py-0.5 text-xs font-bold text-white uppercase tracking-wider">
                                Bàn làm việc Sales
                            </span>
                            <span className="text-xs text-(--crm-text-secondary)">Dữ liệu cá nhân phụ trách</span>
                        </div>
                        <h1 className="mt-1 text-2xl font-bold tracking-tight text-(--crm-heading)">
                            Chào mừng, {displayName}!
                        </h1>
                        <p className="mt-1 text-sm text-(--crm-text-secondary)">
                            Theo dõi khách hàng đang phụ trách, cơ hội bán hàng và lịch hẹn chăm sóc cần xử lý.
                        </p>
                    </div>

                    {/* Quick action buttons */}
                    <div className="flex flex-wrap items-center gap-2">
                        <button
                            type="button"
                            onClick={() => navigate("/leads/new")}
                            className="crm-btn crm-btn--primary"
                        >
                            <Plus size={16} /> Thêm Lead mới
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate("/deals/new")}
                            className="crm-btn crm-btn--secondary"
                        >
                            <Plus size={16} /> Tạo Deal mới
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate("/reminders/new")}
                            className="crm-btn crm-btn--secondary"
                        >
                            <CalendarClock size={16} /> Đặt nhắc việc
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate("/chat")}
                            className="crm-btn crm-btn--secondary"
                        >
                            <MessageSquare size={16} /> Trò chuyện
                        </button>
                    </div>
                </div>
            </div>

            {error && <Alert severity="error">{error}</Alert>}

            {/* KPI Cards */}
            {loading ? (
                <div className="flex min-h-36 items-center justify-center">
                    <CircularProgress size={32} />
                </div>
            ) : (
                <>
                    <div className="crm-kpi-grid">
                        <KpiCard
                            title="Khách hàng phụ trách"
                            value={totalCustomers}
                            icon={Users}
                            tone="blue"
                            trend="Khách hàng của bạn"
                        />
                        <KpiCard
                            title="Lead đang chăm sóc"
                            value={totalLeads}
                            icon={UserRoundSearch}
                            tone="teal"
                            trend="Được phân công"
                        />
                        <KpiCard
                            title="Deal đang theo đuổi"
                            value={activeDeals.length > 0 ? activeDeals.length : totalDeals}
                            icon={BriefcaseBusiness}
                            tone="purple"
                            trend="Cơ hội cá nhân"
                        />
                        <KpiCard
                            title="Doanh số chốt thành công"
                            value={formatVND(wonRevenue)}
                            icon={BadgeDollarSign}
                            tone="green"
                            trend="Deal đã Won"
                        />
                        <KpiCard
                            title="Lịch nhắc hẹn hôm nay"
                            value={pendingRemindersCount}
                            icon={CalendarClock}
                            tone="amber"
                            trend="Công việc cần làm"
                        />
                    </div>

                    {/* Main Content Widgets Grid */}
                    <div className="crm-widget-grid">
                        {/* 1. Active Deals */}
                        <section className="crm-widget crm-widget--half crm-card__body">
                            <div className="crm-widget__header">
                                <div>
                                    <h2 className="text-base font-semibold text-(--crm-heading)">
                                        Cơ hội kinh doanh đang theo đuổi
                                    </h2>
                                    <p className="text-xs text-(--crm-text-secondary)">
                                        Các Deal của bạn đang trong quy trình đàm phán
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => navigate("/deals")}
                                    className="text-xs font-medium text-(--crm-primary) hover:underline"
                                >
                                    Xem tất cả ({totalDeals}) →
                                </button>
                            </div>

                            {activeDeals.length === 0 ? (
                                <div className="py-10 text-center text-sm text-(--crm-text-secondary)">
                                    Chưa có Deal nào đang đàm phán.{" "}
                                    <button
                                        type="button"
                                        onClick={() => navigate("/deals/new")}
                                        className="font-medium text-(--crm-primary) hover:underline"
                                    >
                                        + Tạo Deal ngay
                                    </button>
                                </div>
                            ) : (
                                <div className="divide-y divide-(--crm-border-subtle)">
                                    {activeDeals.map((deal) => (
                                        <div
                                            key={deal.id}
                                            onClick={() => navigate(`/deals/${deal.id}`)}
                                            className="group flex cursor-pointer items-center justify-between py-3 hover:bg-(--crm-surface-hover) transition rounded-md px-2"
                                        >
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center gap-2">
                                                    <p className="truncate text-sm font-semibold text-(--crm-heading) group-hover:text-(--crm-primary)">
                                                        {deal.name}
                                                    </p>
                                                    <DealStageBadge stage={deal.stage} />
                                                </div>
                                                <p className="mt-0.5 text-xs text-(--crm-text-secondary)">
                                                    {deal.customerName || `Khách hàng #${deal.customerId}`} · Giá trị:{" "}
                                                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                                                        {formatVND(deal.value)}
                                                    </span>
                                                </p>
                                            </div>
                                            <ChevronRight size={16} className="text-(--crm-text-muted) group-hover:text-(--crm-primary)" />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>

                        {/* 2. Upcoming Reminders */}
                        <UpcomingReminders />

                        {/* 3. Assigned Leads needing contact */}
                        <section className="crm-widget crm-widget--half crm-card__body">
                            <div className="crm-widget__header">
                                <div>
                                    <h2 className="text-base font-semibold text-(--crm-heading)">
                                        Lead cần liên hệ & nuôi dưỡng
                                    </h2>
                                    <p className="text-xs text-(--crm-text-secondary)">
                                        Khách hàng tiềm năng được giao cho bạn
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => navigate("/leads")}
                                    className="text-xs font-medium text-(--crm-primary) hover:underline"
                                >
                                    Xem tất cả ({totalLeads}) →
                                </button>
                            </div>

                            {activeLeads.length === 0 ? (
                                <div className="py-10 text-center text-sm text-(--crm-text-secondary)">
                                    Chưa có Lead nào được phân công.
                                </div>
                            ) : (
                                <div className="divide-y divide-(--crm-border-subtle)">
                                    {activeLeads.map((lead) => (
                                        <div
                                            key={lead.id}
                                            className="flex items-center justify-between py-3 px-2 rounded-md hover:bg-(--crm-surface-hover) transition"
                                        >
                                            <div
                                                className="min-w-0 flex-1 cursor-pointer"
                                                onClick={() => navigate(`/leads/${lead.id}`)}
                                            >
                                                <div className="flex items-center gap-2">
                                                    <p className="text-sm font-semibold text-(--crm-heading) hover:text-(--crm-primary)">
                                                        {lead.firstName} {lead.lastName}
                                                    </p>
                                                    <StatusChip status={lead.status} />
                                                </div>
                                                <p className="mt-0.5 text-xs text-(--crm-text-secondary)">
                                                    {lead.company || "Cá nhân"} · {lead.phone || lead.email || "Chưa có liên hệ"}
                                                </p>
                                            </div>

                                            <div className="flex items-center gap-1.5 shrink-0">
                                                {lead.phone && (
                                                    <a
                                                        href={`tel:${lead.phone}`}
                                                        title="Gọi điện"
                                                        className="flex h-7 w-7 items-center justify-center rounded-md border border-(--crm-border) text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                                                    >
                                                        <Phone size={13} />
                                                    </a>
                                                )}
                                                {lead.email && (
                                                    <a
                                                        href={`mailto:${lead.email}`}
                                                        title="Gửi email"
                                                        className="flex h-7 w-7 items-center justify-center rounded-md border border-(--crm-border) text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30"
                                                    >
                                                        <Mail size={13} />
                                                    </a>
                                                )}
                                                <button
                                                    type="button"
                                                    onClick={() => navigate(`/leads/${lead.id}`)}
                                                    className="flex h-7 w-7 items-center justify-center rounded-md border border-(--crm-border) text-(--crm-text-secondary) hover:text-(--crm-primary)"
                                                >
                                                    <ChevronRight size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>

                        {/* 4. My Assigned Customers */}
                        <section className="crm-widget crm-widget--half crm-card__body">
                            <div className="crm-widget__header">
                                <div>
                                    <h2 className="text-base font-semibold text-(--crm-heading)">
                                        Khách hàng bạn phụ trách
                                    </h2>
                                    <p className="text-xs text-(--crm-text-secondary)">
                                        Danh sách khách hàng chính thức được gán cho tài khoản của bạn
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => navigate("/customers")}
                                    className="text-xs font-medium text-(--crm-primary) hover:underline"
                                >
                                    Xem tất cả ({totalCustomers}) →
                                </button>
                            </div>

                            {recentCustomers.length === 0 ? (
                                <div className="py-10 text-center text-sm text-(--crm-text-secondary)">
                                    Chưa có khách hàng nào được gán cho bạn.
                                </div>
                            ) : (
                                <div className="divide-y divide-(--crm-border-subtle)">
                                    {recentCustomers.map((cust) => (
                                        <div
                                            key={cust.id}
                                            onClick={() => navigate(`/customers/${cust.id}`)}
                                            className="group flex cursor-pointer items-center justify-between py-3 px-2 rounded-md hover:bg-(--crm-surface-hover) transition"
                                        >
                                            <div className="min-w-0 flex-1">
                                                <p className="text-sm font-semibold text-(--crm-heading) group-hover:text-(--crm-primary)">
                                                    {cust.name}
                                                </p>
                                                <p className="mt-0.5 text-xs text-(--crm-text-secondary)">
                                                    {cust.company || "Cá nhân"} · {cust.phone || cust.email || "Không có liên hệ"}
                                                </p>
                                            </div>
                                            <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                                                Hồ sơ 360° →
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>
                    </div>
                </>
            )}
        </div>
    );
}
