
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
    },
    {
      label: "Đang xử lý",
      value: inProgressCount,
      description: "Đang được giải quyết",
      icon: Clock3,
    },
    {
      label: "Đã giải quyết",
      value: resolvedCount,
      description: "Yêu cầu hoàn tất",
      icon: CheckCircle2,
    },
    {
      label: "Khẩn cấp",
      value: urgentCount,
      description: "Cần ưu tiên xử lý",
      icon: AlertTriangle,
    },
    {
      label: "SLA quá hạn",
      value: overdueCount,
      description: "Ticket đã vượt thời hạn",
      icon: AlertTriangle,
    },
    {
      label: "SLA sắp đến hạn",
      value: atRiskCount,
      description: "Còn tối đa một giờ",
      icon: Clock3,
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
            className="crm-button crm-button--secondary"
            onClick={() => navigate("/tickets")}
          >
            <List size={18} />
            Danh sách Ticket
          </button>

          <button
            type="button"
            className="crm-button crm-button--primary"
            onClick={() => navigate("/tickets/new")}
          >
            <Plus size={18} />
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
            <div
              key={item.label}
              className="crm-card crm-card__body"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm text-gray-500">
                    {item.label}
                  </p>

                  <p className="mt-2 text-3xl font-semibold">
                    {loading ? "—" : item.value}
                  </p>

                  <p className="mt-2 text-sm text-gray-500">
                    {item.description}
                  </p>
                </div>

                <div className="rounded-lg bg-gray-100 p-3">
                  <Icon size={22} />
                </div>
              </div>
            </div>
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
            <div className="rounded-lg bg-gray-100 p-3">
              <TicketIcon size={24} />
            </div>

            <div className="flex-1">
              <h2 className="text-lg font-semibold">
                Quản lý Ticket
              </h2>

              <p className="mt-2 text-sm text-gray-500">
                Xem danh sách, tìm kiếm, lọc trạng thái và theo dõi
                các yêu cầu hỗ trợ của khách hàng.
              </p>

              <button
                type="button"
                className="mt-5 inline-flex items-center gap-2 font-medium"
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
            <div className="rounded-lg bg-gray-100 p-3">
              <Plus size={24} />
            </div>

            <div className="flex-1">
              <h2 className="text-lg font-semibold">
                Tiếp nhận yêu cầu
              </h2>

              <p className="mt-2 text-sm text-gray-500">
                Tạo Ticket mới để ghi nhận vấn đề và bắt đầu quy
                trình hỗ trợ khách hàng.
              </p>

              <button
                type="button"
                className="mt-5 inline-flex items-center gap-2 font-medium"
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
            <h2 className="text-lg font-semibold">
              Theo dõi công việc
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Truy cập nhanh để kiểm tra và xử lý các Ticket.
            </p>
          </div>

          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm"
            onClick={() => window.location.reload()}
          >
            <RefreshCw size={16} />
            Làm mới
          </button>
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-lg border px-4 py-3"
            onClick={() => navigate("/tickets")}
          >
            <List size={18} />
            Danh sách tất cả Ticket
          </button>

          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-lg border px-4 py-3"
            onClick={() => navigate("/tickets")}
          >
            <Clock3 size={18} />
            Kiểm tra Ticket đang xử lý
          </button>
        </div>
      </div>
    </div>
  );
}
console.log("supportpagedashboard")