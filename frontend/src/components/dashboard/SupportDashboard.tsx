import { Alert, CircularProgress } from "@mui/material";
import {
    AlertTriangle,
    ChevronRight,
    Clock,
    HeartHandshake,
    MessageSquare,
    Plus,
    Search,
    TicketCheck,
    Trophy,
    Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import KpiCard from "./KpiCard";
import TicketPriorityBadge from "../tickets/TicketPriorityBadge";
import TicketStatusBadge from "../tickets/TicketStatusBadge";
import { ticketService } from "../../services/ticketService";
import type { AuthUser } from "../../types/auth";
import type { Ticket } from "../../types/ticket";

interface SupportDashboardProps {
    user: AuthUser | null;
}

export default function SupportDashboard({ user }: SupportDashboardProps) {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [allTickets, setAllTickets] = useState<Ticket[]>([]);
    const [openTickets, setOpenTickets] = useState<Ticket[]>([]);
    const [urgentTickets, setUrgentTickets] = useState<Ticket[]>([]);
    const [resolvedTickets, setResolvedTickets] = useState<Ticket[]>([]);
    const [supportedCustomerCount, setSupportedCustomerCount] = useState(0);
    const [csatScore, setCsatScore] = useState("5.0");

    useEffect(() => {
        let active = true;

        const loadSupportData = async () => {
            setLoading(true);
            setError("");
            try {
                const response = await ticketService.getTickets(0, 100);
                if (!active) return;

                const tickets = response.content || [];
                setAllTickets(tickets);

                const open = tickets.filter(
                    (t) => t.status === "OPEN" || t.status === "IN_PROGRESS",
                );
                setOpenTickets(open);

                const urgent = open.filter(
                    (t) => t.priority === "HIGH" || t.priority === "URGENT",
                );
                setUrgentTickets(urgent);

                const resolved = tickets.filter(
                    (t) => t.status === "RESOLVED" || t.status === "CLOSED",
                );
                setResolvedTickets(resolved);

                // Count unique supported customers
                const uniqueCustomerIds = new Set(
                    tickets.map((t) => t.customerId).filter((id): id is number => Boolean(id && id > 0)),
                );
                setSupportedCustomerCount(uniqueCustomerIds.size);

                // Calculate average CSAT from localStorage
                let csatSum = 0;
                let csatCount = 0;
                for (let i = 0; i < localStorage.length; i++) {
                    const key = localStorage.key(i);
                    if (key?.startsWith("crm-soa.ticket-csat.")) {
                        const val = Number(localStorage.getItem(key));
                        if (val > 0) {
                            csatSum += val;
                            csatCount += 1;
                        }
                    }
                }
                if (csatCount > 0) {
                    setCsatScore((csatSum / csatCount).toFixed(1));
                } else {
                    setCsatScore("5.0");
                }
            } catch (err) {
                if (active) {
                    setError(err instanceof Error ? err.message : "Không thể tải dữ liệu hỗ trợ.");
                }
            } finally {
                if (active) setLoading(false);
            }
        };

        void loadSupportData();

        return () => {
            active = false;
        };
    }, []);

    const displayName = user?.fullName || user?.email || "Nhân viên CSKH";

    return (
        <div className="crm-stack">
            {/* Header */}
            <div className="crm-card crm-card__body border-(--crm-border) bg-linear-to-r from-emerald-50/70 via-teal-50/30 to-transparent dark:from-emerald-950/20 dark:via-teal-950/10">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="inline-block rounded-md bg-emerald-600 px-2 py-0.5 text-xs font-bold text-white uppercase tracking-wider">
                                Bàn làm việc Hỗ trợ CSKH
                            </span>
                            <span className="text-xs text-(--crm-text-secondary)">Quản lý yêu cầu & chất lượng dịch vụ</span>
                        </div>
                        <h1 className="mt-1 text-2xl font-bold tracking-tight text-(--crm-heading)">
                            Chào mừng, {displayName}!
                        </h1>
                        <p className="mt-1 text-sm text-(--crm-text-secondary)">
                            Theo dõi danh sách Ticket hỗ trợ khách hàng, tiến độ cam kết SLA và đánh giá dịch vụ.
                        </p>
                    </div>

                    {/* Quick action buttons */}
                    <div className="flex flex-wrap items-center gap-2">
                        <button
                            type="button"
                            onClick={() => navigate("/tickets/new")}
                            className="crm-btn crm-btn--primary"
                        >
                            <Plus size={16} /> Tạo Ticket hỗ trợ
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate("/customers")}
                            className="crm-btn crm-btn--secondary"
                        >
                            <Search size={16} /> Tra cứu Khách hàng
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate("/chat")}
                            className="crm-btn crm-btn--secondary"
                        >
                            <MessageSquare size={16} /> Trò chuyện phối hợp
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
                            title="Ticket cần xử lý"
                            value={openTickets.length}
                            icon={TicketCheck}
                            tone="rose"
                            trend="Đang mở & xử lý"
                        />
                        <KpiCard
                            title="Ticket khẩn cấp (SLA)"
                            value={urgentTickets.length}
                            icon={AlertTriangle}
                            tone="amber"
                            trend="Ưu tiên xử lý"
                        />
                        <KpiCard
                            title="Khách hàng được hỗ trợ"
                            value={supportedCustomerCount}
                            icon={Users}
                            tone="blue"
                            trend="Tổng khách hàng"
                        />
                        <KpiCard
                            title="Ticket đã giải quyết"
                            value={resolvedTickets.length}
                            icon={Trophy}
                            tone="green"
                            trend="Hoàn thành"
                        />
                        <KpiCard
                            title="Điểm hài lòng CSAT"
                            value={`${csatScore} / 5 ⭐`}
                            icon={HeartHandshake}
                            tone="teal"
                            trend="Đánh giá dịch vụ"
                        />
                    </div>

                    {/* Main Content Widgets Grid */}
                    <div className="crm-widget-grid">
                        {/* 1. Open Ticket Queue */}
                        <section className="crm-widget crm-widget--wide crm-card__body">
                            <div className="crm-widget__header">
                                <div>
                                    <h2 className="text-base font-semibold text-(--crm-heading)">
                                        Hàng đợi Ticket cần xử lý ngay
                                    </h2>
                                    <p className="text-xs text-(--crm-text-secondary)">
                                        Các yêu cầu hỗ trợ khách hàng đang mở và cần tiếp nhận
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => navigate("/tickets")}
                                    className="text-xs font-medium text-(--crm-primary) hover:underline"
                                >
                                    Xem tất cả ({allTickets.length}) →
                                </button>
                            </div>

                            {openTickets.length === 0 ? (
                                <div className="py-10 text-center text-sm text-(--crm-text-secondary)">
                                    🎉 Tuyệt vời! Hiện không có ticket nào tồn đọng cần xử lý.
                                </div>
                            ) : (
                                <div className="divide-y divide-(--crm-border-subtle)">
                                    {openTickets.map((ticket) => (
                                        <div
                                            key={ticket.id}
                                            onClick={() => navigate(`/tickets/${ticket.id}`)}
                                            className="group flex cursor-pointer items-center justify-between py-3.5 px-3 rounded-md hover:bg-(--crm-surface-hover) transition"
                                        >
                                            <div className="min-w-0 flex-1">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <span className="font-mono text-xs font-bold text-(--crm-text-secondary)">
                                                        #{ticket.id}
                                                    </span>
                                                    <p className="truncate text-sm font-semibold text-(--crm-heading) group-hover:text-(--crm-primary)">
                                                        {ticket.subject}
                                                    </p>
                                                    <TicketPriorityBadge priority={ticket.priority} />
                                                    <TicketStatusBadge status={ticket.status} />
                                                </div>
                                                <div className="mt-1 flex items-center gap-4 text-xs text-(--crm-text-secondary)">
                                                    <span>
                                                        Khách hàng:{" "}
                                                        <strong className="text-(--crm-text)">
                                                            {ticket.customerName || `Khách hàng #${ticket.customerId}`}
                                                        </strong>
                                                    </span>
                                                    {ticket.assignedTo && (
                                                        <span>Phụ trách: {ticket.assignedTo}</span>
                                                    )}
                                                    {ticket.slaDeadline && (
                                                        <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                                                            <Clock size={12} /> Hạn SLA:{" "}
                                                            {new Date(ticket.slaDeadline).toLocaleTimeString("vi-VN", {
                                                                hour: "2-digit",
                                                                minute: "2-digit",
                                                                day: "2-digit",
                                                                month: "2-digit",
                                                            })}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2 shrink-0">
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        navigate(`/tickets/${ticket.id}`);
                                                    }}
                                                    className="crm-btn crm-btn--secondary text-xs"
                                                >
                                                    Xử lý ngay →
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>

                        {/* 2. SLA Watchlist & Urgent Tickets */}
                        <section className="crm-widget crm-widget--half crm-card__body">
                            <div className="crm-widget__header">
                                <div>
                                    <h2 className="text-base font-semibold text-(--crm-heading)">
                                        Theo dõi cam kết SLA & Khẩn cấp
                                    </h2>
                                    <p className="text-xs text-(--crm-text-secondary)">
                                        Các yêu cầu có độ ưu tiên cao cần chú ý
                                    </p>
                                </div>
                                <AlertTriangle size={18} className="text-amber-500" />
                            </div>

                            {urgentTickets.length === 0 ? (
                                <div className="py-8 text-center text-sm text-(--crm-text-secondary)">
                                    Không có Ticket khẩn cấp nào ở thời điểm hiện tại.
                                </div>
                            ) : (
                                <div className="divide-y divide-(--crm-border-subtle)">
                                    {urgentTickets.map((t) => (
                                        <div
                                            key={t.id}
                                            onClick={() => navigate(`/tickets/${t.id}`)}
                                            className="flex cursor-pointer items-center justify-between py-2.5 px-2 rounded-md hover:bg-amber-50/50 dark:hover:bg-amber-950/20"
                                        >
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-sm font-semibold text-(--crm-heading)">
                                                    #{t.id} - {t.subject}
                                                </p>
                                                <p className="text-xs text-amber-700 dark:text-amber-400">
                                                    Khách hàng: {t.customerName || `#${t.customerId}`}
                                                </p>
                                            </div>
                                            <TicketPriorityBadge priority={t.priority} />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>

                        {/* 3. Recently Resolved Tickets */}
                        <section className="crm-widget crm-widget--half crm-card__body">
                            <div className="crm-widget__header">
                                <div>
                                    <h2 className="text-base font-semibold text-(--crm-heading)">
                                        Ticket vừa giải quyết thành công
                                    </h2>
                                    <p className="text-xs text-(--crm-text-secondary)">
                                        Các sự vụ đã được hoàn thành gần đây
                                    </p>
                                </div>
                                <Trophy size={18} className="text-emerald-500" />
                            </div>

                            {resolvedTickets.length === 0 ? (
                                <div className="py-8 text-center text-sm text-(--crm-text-secondary)">
                                    Chưa có ticket nào được đánh dấu hoàn thành.
                                </div>
                            ) : (
                                <div className="divide-y divide-(--crm-border-subtle)">
                                    {resolvedTickets.slice(0, 5).map((t) => (
                                        <div
                                            key={t.id}
                                            onClick={() => navigate(`/tickets/${t.id}`)}
                                            className="flex cursor-pointer items-center justify-between py-2.5 px-2 rounded-md hover:bg-(--crm-surface-hover)"
                                        >
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-sm font-medium text-(--crm-heading)">
                                                    #{t.id} - {t.subject}
                                                </p>
                                                <p className="text-xs text-(--crm-text-secondary)">
                                                    Khách hàng: {t.customerName || `#${t.customerId}`}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <TicketStatusBadge status={t.status} />
                                                <ChevronRight size={14} className="text-(--crm-text-muted)" />
                                            </div>
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
