import PageHeader from "../../components/common/PageHeader";
import { Alert, CircularProgress } from "@mui/material";
import {
    BadgeDollarSign,
    BriefcaseBusiness,
    Plus,
    RefreshCw,
    Search,
    TrendingUp,
} from "lucide-react";
import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import DealStageBadge from "../../components/deals/DealStageBadge";
import DealViewToggle from "../../components/deals/DealViewToggle";
import {
    dealService,
    getDealErrorMessage,
    type DealListResponse,
    type DealForecastResponse,
} from "../../services/dealService";
import type { DealStage } from "../../types/deal";
import { formatVND } from "../../utils/currency";
import { DEAL_STAGE_OPTIONS, getDealStageLabel } from "../../utils/dealStage";

const EMPTY_RESULT: DealListResponse = {
    content: [],
    page: 0,
    size: 10,
    totalElements: 0,
    totalPages: 0,
};

const dateFormatter = new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
});

const STAGE_BAR_COLORS: Record<string, string> = {
    NEW: "bg-blue-500",
    QUALIFIED: "bg-amber-500",
    PROPOSAL: "bg-purple-500",
    NEGOTIATION: "bg-indigo-500",
    WON: "bg-emerald-500",
    LOST: "bg-rose-500",
};

export default function DealListPage() {
    const navigate = useNavigate();
    const [result, setResult] = useState(EMPTY_RESULT);
    const [forecast, setForecast] = useState<DealForecastResponse | null>(null);
    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [search, setSearch] = useState("");
    const deferredSearch = useDeferredValue(search);
    const [stage, setStage] = useState<DealStage | "">("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [refreshKey, setRefreshKey] = useState(0);

    useEffect(() => {
        let active = true;

        const loadDeals = async () => {
            setLoading(true);
            setError("");

            try {
                const [data, forecastData] = await Promise.all([
                    dealService.getDeals(page, pageSize, deferredSearch, stage),
                    dealService.getForecast().catch(() => null),
                ]);

                if (active) {
                    setResult(data);
                    if (forecastData) setForecast(forecastData);
                }
            } catch (loadError) {
                if (active) setError(getDealErrorMessage(loadError));
            } finally {
                if (active) setLoading(false);
            }
        };

        void loadDeals();

        return () => {
            active = false;
        };
    }, [deferredSearch, page, pageSize, refreshKey, stage]);

    const pageNumbers = useMemo(() => {
        const start = Math.max(0, Math.min(page - 2, result.totalPages - 5));
        return Array.from(
            { length: Math.min(5, result.totalPages) },
            (_, index) => start + index,
        );
    }, [page, result.totalPages]);

    const from = result.totalElements === 0 ? 0 : page * pageSize + 1;
    const to = Math.min((page + 1) * pageSize, result.totalElements);

    const summaries = [
        {
            label: "Tổng giá trị Pipeline",
            value: formatVND(forecast?.totalPipelineValue ?? 0),
            description: `${forecast?.totalDeals ?? result.totalElements} cơ hội`,
            icon: BriefcaseBusiness,
            color: "bg-(--crm-info-soft) text-(--crm-primary)",
        },
        {
            label: "Dự báo doanh thu (Weighted)",
            value: formatVND(forecast?.weightedForecastValue ?? 0),
            description: "Tính theo trọng số giai đoạn",
            icon: TrendingUp,
            color: "bg-(--crm-surface-selected) text-(--crm-purple)",
        },
        {
            label: "Tổng số Deals",
            value: String(forecast?.totalDeals ?? result.totalElements),
            description: "Cơ hội trong hệ thống",
            icon: BadgeDollarSign,
            color: "bg-(--crm-success-soft) text-(--crm-green-dark)",
        },
    ];

    return (
        <div>
            <PageHeader
                title="Deals"
                description="Quản lý cơ hội bán hàng & dự báo doanh thu"
                actions={
                    <>
                        <DealViewToggle view="list" />
                        <button
                            type="button"
                            onClick={() => navigate("/deals/new")}
                            className="crm-btn crm-btn--primary"
                        >
                            <Plus size={16} /> Thêm Deal
                        </button>
                    </>
                }
            />

            {/* Forecast & Pipeline Summary Cards */}
            <div className="crm-kpi-grid mb-4">
                {summaries.map(({ label, value, description, icon: Icon, color }) => (
                    <div key={label} className="crm-kpi">
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <p className="crm-kpi__label">{label}</p>
                                <p className="crm-kpi__value">{value}</p>
                                <p className="mt-1 text-xs text-(--crm-text-muted)">
                                    {description}
                                </p>
                            </div>
                            <div className={`crm-kpi__icon ${color}`}>
                                <Icon size={19} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Pipeline Stage Distribution Bar */}
            {forecast && forecast.stages && forecast.stages.length > 0 && (
                <div className="crm-card mb-5 p-4">
                    <div className="mb-2.5 flex items-center justify-between">
                        <span className="text-xs font-semibold uppercase tracking-wider text-(--crm-text-secondary)">
                            Phân bổ Pipeline theo giai đoạn
                        </span>
                        <span className="text-xs text-(--crm-text-muted)">
                            Nhấn để lọc theo giai đoạn
                        </span>
                    </div>

                    <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-(--crm-surface-hover)">
                        {forecast.stages.map((st) => {
                            const total = forecast.totalPipelineValue || 1;
                            const percent = Math.max(0, (st.totalValue / total) * 100);
                            if (st.count === 0 && percent === 0) return null;
                            const barColor =
                                STAGE_BAR_COLORS[st.stage] ?? "bg-slate-400";

                            return (
                                <div
                                    key={st.stage}
                                    style={{ width: `${percent}%` }}
                                    className={`${barColor} transition-all duration-300`}
                                    title={`${getDealStageLabel(st.stage as DealStage)}: ${formatVND(st.totalValue)} (${st.count} deal)`}
                                />
                            );
                        })}
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-3">
                        {forecast.stages.map((st) => {
                            const barColor =
                                STAGE_BAR_COLORS[st.stage] ?? "bg-slate-400";
                            const isSelected = stage === st.stage;

                            return (
                                <button
                                    key={st.stage}
                                    type="button"
                                    onClick={() => {
                                        setStage(
                                            stage === st.stage
                                                ? ""
                                                : (st.stage as DealStage),
                                        );
                                        setPage(0);
                                    }}
                                    className={`flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium transition-colors ${
                                        isSelected
                                            ? "bg-(--crm-primary) text-(--crm-on-primary)"
                                            : "hover:bg-(--crm-surface-hover) text-(--crm-text-secondary)"
                                    }`}
                                >
                                    <span
                                        className={`h-2 w-2 rounded-full ${barColor}`}
                                    />
                                    <span>
                                        {getDealStageLabel(st.stage as DealStage)}:
                                    </span>
                                    <span className="font-semibold">
                                        {st.count}
                                    </span>
                                    <span className="text-[11px] opacity-75">
                                        ({formatVND(st.totalValue)})
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            <div className="crm-board">
                <div className="crm-toolbar crm-toolbar--board">
                    <label className="crm-search">
                        <Search
                            size={16}
                            className="mr-2 text-(--crm-text-muted)"
                        />
                        <input
                            type="search"
                            aria-label="Tìm kiếm Deal"
                            value={search}
                            onChange={(event) => {
                                setSearch(event.target.value);
                                setPage(0);
                            }}
                            placeholder="Tìm Deal, khách hàng, owner..."
                            className="w-full text-sm outline-none"
                        />
                    </label>

                    <select
                        aria-label="Lọc theo giai đoạn"
                        value={stage}
                        onChange={(event) => {
                            setStage(event.target.value as DealStage | "");
                            setPage(0);
                        }}
                        className="crm-filter-chip"
                    >
                        <option value="">Tất cả giai đoạn</option>
                        {DEAL_STAGE_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>

                    <button
                        type="button"
                        aria-label="Tải lại"
                        onClick={() => setRefreshKey((value) => value + 1)}
                        className="crm-icon-btn ml-auto"
                        title="Tải lại"
                    >
                        <RefreshCw
                            size={16}
                            className={loading ? "animate-spin" : ""}
                        />
                    </button>
                </div>

                {error ? (
                    <div className="p-5">
                        <Alert
                            severity="error"
                            action={
                                <button
                                    type="button"
                                    className="font-medium"
                                    onClick={() =>
                                        setRefreshKey((value) => value + 1)
                                    }
                                >
                                    Thử lại
                                </button>
                            }
                        >
                            {error}
                        </Alert>
                    </div>
                ) : loading ? (
                    <div className="flex min-h-72 items-center justify-center">
                        <CircularProgress size={32} />
                    </div>
                ) : result.content.length === 0 ? (
                    <div className="flex min-h-72 flex-col items-center justify-center text-center">
                        <div className="mb-3 rounded-full bg-(--crm-surface-hover) p-4 text-(--crm-text-muted)">
                            <BriefcaseBusiness size={28} />
                        </div>
                        <p className="font-medium text-(--crm-text)">
                            Không tìm thấy Deal
                        </p>
                        <p className="crm-page-description">
                            Thử thay đổi từ khóa hoặc bộ lọc.
                        </p>
                    </div>
                ) : (
                    <div className="crm-table-wrap">
                        <table className="crm-table">
                            <thead>
                                <tr className="border-b border-(--crm-border) bg-(--crm-surface-subtle)">
                                    <th
                                        style={{ width: "22%" }}
                                        className="px-5 py-3.5 text-center text-xs font-semibold text-(--crm-text-secondary)"
                                    >
                                        Tên Deal
                                    </th>
                                    <th
                                        style={{ width: "20%" }}
                                        className="px-5 py-3.5 text-center text-xs font-semibold text-(--crm-text-secondary)"
                                    >
                                        Khách hàng
                                    </th>
                                    <th
                                        style={{ width: "14%" }}
                                        className="px-5 py-3.5 text-center text-xs font-semibold text-(--crm-text-secondary)"
                                    >
                                        Giá trị
                                    </th>
                                    <th
                                        style={{ width: "13%" }}
                                        className="px-5 py-3.5 text-center text-xs font-semibold text-(--crm-text-secondary)"
                                    >
                                        Giai đoạn
                                    </th>
                                    <th
                                        style={{ width: "9%" }}
                                        className="px-5 py-3.5 text-center text-xs font-semibold text-(--crm-text-secondary)"
                                    >
                                        Xác suất
                                    </th>
                                    <th
                                        style={{ width: "11%" }}
                                        className="px-5 py-3.5 text-center text-xs font-semibold text-(--crm-text-secondary)"
                                    >
                                        Ngày dự kiến đóng
                                    </th>
                                    <th
                                        style={{ width: "11%" }}
                                        className="px-5 py-3.5 text-center text-xs font-semibold text-(--crm-text-secondary)"
                                    >
                                        Người phụ trách
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {result.content.map((deal) => {
                                    const formattedCloseDate = deal.expectedCloseDate
                                        ? dateFormatter.format(
                                              new Date(
                                                  `${deal.expectedCloseDate.split("T")[0]}T00:00:00`,
                                              ),
                                          )
                                        : "—";

                                    return (
                                        <tr
                                            key={deal.id}
                                            className="border-b border-(--crm-border-subtle) last:border-0 hover:bg-(--crm-surface-subtle)"
                                        >
                                            <td className="px-5 py-4 text-center">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        navigate(
                                                            `/deals/${deal.id}`,
                                                        )
                                                    }
                                                    className="inline-block max-w-full truncate text-center text-sm font-semibold text-(--crm-primary) hover:underline"
                                                    title={deal.name}
                                                >
                                                    {deal.name}
                                                </button>
                                            </td>
                                            <td className="px-5 py-4 text-center">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        navigate(
                                                            `/customers/${deal.customerId}`,
                                                        )
                                                    }
                                                    className="inline-block max-w-full truncate text-center text-sm text-(--crm-text) hover:text-(--crm-primary) hover:underline"
                                                    title={
                                                        deal.customerName ||
                                                        (deal.customerId
                                                            ? `Khách hàng #${deal.customerId}`
                                                            : "—")
                                                    }
                                                >
                                                    {deal.customerName ||
                                                        (deal.customerId
                                                            ? `Khách hàng #${deal.customerId}`
                                                            : "—")}
                                                </button>
                                            </td>
                                            <td className="whitespace-nowrap px-5 py-4 text-center text-sm font-medium text-(--crm-heading)">
                                                {formatVND(deal.value)}
                                            </td>
                                            <td className="whitespace-nowrap px-5 py-4 text-center">
                                                <DealStageBadge
                                                    stage={deal.stage}
                                                />
                                            </td>
                                            <td className="whitespace-nowrap px-5 py-4 text-center text-sm text-(--crm-text-secondary)">
                                                {deal.probability}%
                                            </td>
                                            <td className="whitespace-nowrap px-5 py-4 text-center text-sm text-(--crm-text-secondary)">
                                                {formattedCloseDate}
                                            </td>
                                            <td className="px-5 py-4 text-center text-sm text-(--crm-text-secondary)">
                                                <span
                                                    className="block truncate text-center"
                                                    title={
                                                        deal.ownerName ||
                                                        undefined
                                                    }
                                                >
                                                    {deal.ownerName || "—"}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}

                {!error && !loading && (
                    <div className="crm-pagination">
                        <div className="flex items-center gap-3 text-xs text-(--crm-text-secondary)">
                            <span>
                                Hiển thị {from}–{to} trong{" "}
                                {result.totalElements} Deal
                            </span>
                            <select
                                aria-label="Số Deal mỗi trang"
                                value={pageSize}
                                onChange={(event) => {
                                    setPageSize(Number(event.target.value));
                                    setPage(0);
                                }}
                                className="rounded border border-(--crm-border) px-2 py-1"
                            >
                                {[10, 20, 50].map((size) => (
                                    <option key={size} value={size}>
                                        {size}/trang
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="flex gap-1">
                            <button
                                type="button"
                                disabled={page === 0}
                                onClick={() => setPage((value) => value - 1)}
                                className="rounded border border-(--crm-border) px-3 py-1.5 text-xs disabled:text-(--crm-text-disabled)"
                            >
                                Trước
                            </button>
                            {pageNumbers.map((number) => (
                                <button
                                    type="button"
                                    key={number}
                                    onClick={() => setPage(number)}
                                    className={`rounded px-3 py-1.5 text-xs ${
                                        number === page
                                            ? "bg-(--crm-primary) text-(--crm-on-primary)"
                                            : "border border-(--crm-border)"
                                    }`}
                                >
                                    {number + 1}
                                </button>
                            ))}
                            <button
                                type="button"
                                disabled={page + 1 >= result.totalPages}
                                onClick={() => setPage((value) => value + 1)}
                                className="rounded border border-(--crm-border) px-3 py-1.5 text-xs disabled:text-(--crm-text-disabled)"
                            >
                                Sau
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
