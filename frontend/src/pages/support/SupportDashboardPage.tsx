
import { Alert, CircularProgress } from "@mui/material";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock3,
  Inbox,
  List,
  Plus,
  RefreshCw,
  Ticket as TicketIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getTicketErrorMessage,
  ticketService,
} from "../../services/ticketService";
import type { Ticket } from "../../types/ticket";
import { getTicketSla } from "../../utils/ticketSla";

export default function SupportDashboardPage() {
  const navigate = useNavigate();

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const loadTickets = async () => {
      setLoading(true);
      setError("");

      try {
        const result = await ticketService.getTickets(0, 1000);

        if (active) {
          setTickets(result.content);
        }
      } catch (loadError) {
        if (active) {
          setError(getTicketErrorMessage(loadError));
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void loadTickets();

    return () => {
      active = false;
    };
  }, []);

  const openCount = tickets.filter(
    (ticket) => ticket.status === "OPEN",
  ).length;

  const inProgressCount = tickets.filter(
    (ticket) => ticket.status === "IN_PROGRESS",
  ).length;

  const resolvedCount = tickets.filter(
    (ticket) => ticket.status === "RESOLVED",
  ).length;

  const urgentCount = tickets.filter(
    (ticket) => ticket.priority === "URGENT",
  ).length;
  const overdueCount = tickets.filter((ticket) => {
    const sla = getTicketSla(
      ticket.createdAt,
      ticket.priority,
      ticket.status,
    );

    return sla.state === "OVERDUE";
  }).length;

  const atRiskCount = tickets.filter((ticket) => {
    const sla = getTicketSla(
      ticket.createdAt,
      ticket.priority,
      ticket.status,
    );

    return sla.state === "AT_RISK";
  }).length;
  const summaries = [
    {
      label: "Ticket mới",
      value: openCount,
      description: "Đang chờ xử lý",
      icon: Inbox,
      tone: "blue" as const,
    },
    {
      label: "Đang xử lý",
      value: inProgressCount,
      description: "Đang được giải quyết",
      icon: Clock3,
      tone: "amber" as const,
    },
    {
      label: "Đã giải quyết",
      value: resolvedCount,
      description: "Yêu cầu hoàn tất",
      icon: CheckCircle2,
      tone: "green" as const,
    },
    {
      label: "Khẩn cấp",
      value: urgentCount,
      description: "Cần ưu tiên xử lý",
      icon: AlertTriangle,
      tone: "rose" as const,
    },
    {
      label: "SLA quá hạn",
      value: overdueCount,
      description: "Ticket đã vượt thời hạn",
      icon: AlertTriangle,
      tone: "rose" as const,
    },
    {
      label: "SLA sắp đến hạn",
      value: atRiskCount,
      description: "Còn tối đa một giờ",
      icon: Clock3,
      tone: "teal" as const,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="crm-page-header">
        <div>
          <h1 className="crm-page-title">Support Center</h1>
          <p className="crm-page-description">
            Tổng quan và quản lý các yêu cầu hỗ trợ khách hàng.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="crm-btn crm-btn--secondary"
            onClick={() => navigate("/tickets")}
          >
            <List size={16} />
            Danh sách Ticket
          </button>

          <button
            type="button"
            className="crm-btn crm-btn--primary"
            onClick={() => navigate("/tickets/new")}
          >
            <Plus size={16} />
            Tạo Ticket
          </button>
        </div>
      </div>

      {error && (
        <Alert
          severity="error"
          action={
            <button
              type="button"
              className="font-medium"
              onClick={() => window.location.reload()}
            >
              Thử lại
            </button>
          }
        >
          {error}
        </Alert>
      )}

      <div className="crm-kpi-grid">
        {summaries.map((item) => {
          const Icon = item.icon;

          return (
            <article
              key={item.label}
              className={`crm-kpi crm-kpi--accent crm-tone--${item.tone}`}
            >
              <div className="crm-kpi__top">
                <p className="crm-kpi__label">{item.label}</p>
                <span className="crm-kpi__icon">
                  <Icon size={18} />
                </span>
              </div>
              <p className="crm-kpi__value">{loading ? "—" : item.value}</p>
              <p className="crm-kpi__trend">{item.description}</p>
            </article>
          );
        })}
      </div>

      {loading && (
        <div className="flex justify-center py-8">
          <CircularProgress />
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="crm-card crm-card__body">
          <div className="flex items-start gap-4">
            <div className="rounded-lg bg-(--crm-info-soft) p-3 text-(--crm-primary)">
              <TicketIcon size={24} />
            </div>

            <div className="flex-1">
              <h2 className="text-lg font-semibold text-(--crm-heading)">
                Quản lý Ticket
              </h2>

              <p className="mt-2 text-sm text-(--crm-text-secondary)">
                Xem danh sách, tìm kiếm, lọc trạng thái và theo dõi
                các yêu cầu hỗ trợ của khách hàng.
              </p>

              <button
                type="button"
                className="mt-5 inline-flex items-center gap-2 font-medium text-(--crm-primary) hover:underline"
                onClick={() => navigate("/tickets")}
              >
                Xem danh sách Ticket
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </div>

        <div className="crm-card crm-card__body">
          <div className="flex items-start gap-4">
            <div className="rounded-lg bg-(--crm-info-soft) p-3 text-(--crm-primary)">
              <Plus size={24} />
            </div>

            <div className="flex-1">
              <h2 className="text-lg font-semibold text-(--crm-heading)">
                Tiếp nhận yêu cầu
              </h2>

              <p className="mt-2 text-sm text-(--crm-text-secondary)">
                Tạo Ticket mới để ghi nhận vấn đề và bắt đầu quy
                trình hỗ trợ khách hàng.
              </p>

              <button
                type="button"
                className="mt-5 inline-flex items-center gap-2 font-medium text-(--crm-primary) hover:underline"
                onClick={() => navigate("/tickets/new")}
              >
                Tạo yêu cầu hỗ trợ
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="crm-card crm-card__body">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-(--crm-heading)">
              Theo dõi công việc
            </h2>

            <p className="mt-1 text-sm text-(--crm-text-secondary)">
              Truy cập nhanh để kiểm tra và xử lý các Ticket.
            </p>
          </div>

          <button
            type="button"
            className="crm-btn crm-btn--secondary"
            onClick={() => window.location.reload()}
          >
            <RefreshCw size={15} />
            Làm mới
          </button>
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <button
            type="button"
            className="crm-btn crm-btn--secondary"
            onClick={() => navigate("/tickets")}
          >
            <List size={16} />
            Danh sách tất cả Ticket
          </button>

          <button
            type="button"
            className="crm-btn crm-btn--secondary"
            onClick={() => navigate("/tickets")}
          >
            <Clock3 size={16} />
            Kiểm tra Ticket đang xử lý
          </button>
        </div>
      </div>
    </div>
  );
}