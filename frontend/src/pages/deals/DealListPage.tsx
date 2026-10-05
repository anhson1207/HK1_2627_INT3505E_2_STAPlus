import { Alert, CircularProgress } from "@mui/material";
import { BriefcaseBusiness, Plus, RefreshCw, Search } from "lucide-react";
import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import DealStageBadge from "../../components/deals/DealStageBadge";
import DealViewToggle from "../../components/deals/DealViewToggle";
import { dealService, getDealErrorMessage, type DealListResponse } from "../../services/dealService";
import type { DealStage } from "../../types/deal";
import { formatVND } from "../../utils/currency";
import { DEAL_STAGE_OPTIONS } from "../../utils/dealStage";

const EMPTY_RESULT: DealListResponse = { content: [], page: 0, size: 10, totalElements: 0, totalPages: 0 };
const dateFormatter = new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });

export default function DealListPage() {
    const navigate = useNavigate();
    const [result, setResult] = useState(EMPTY_RESULT);
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
                const data = await dealService.getDeals(page, pageSize, deferredSearch, stage);
                if (active) setResult(data);
            } catch (loadError) {
                if (active) setError(getDealErrorMessage(loadError));
            } finally {
                if (active) setLoading(false);
            }
        };
        void loadDeals();
        return () => { active = false; };
    }, [deferredSearch, page, pageSize, refreshKey, stage]);

    const pageNumbers = useMemo(() => {
        const start = Math.max(0, Math.min(page - 2, result.totalPages - 5));
        return Array.from({ length: Math.min(5, result.totalPages) }, (_, index) => start + index);
    }, [page, result.totalPages]);
    const from = result.totalElements === 0 ? 0 : page * pageSize + 1;
    const to = Math.min((page + 1) * pageSize, result.totalElements);

    return (
        <div>
            <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
                <div><h1 className="text-[22px] font-semibold text-slate-900">Deals</h1><p className="mt-1 text-sm text-slate-500">Quản lý cơ hội bán hàng</p></div>
                <div className="flex items-center gap-3"><DealViewToggle view="list" /><button type="button" onClick={() => navigate("/deals/new")} className="flex items-center gap-2 rounded-md bg-[#3B82F6] px-4 py-2 text-sm font-medium text-white hover:bg-[#2563EB]"><Plus size={16} /> Thêm Deal</button></div>
            </div>
            <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
                <div className="flex flex-wrap items-center gap-3 border-b border-slate-200 px-5 py-4">
                    <label className="flex h-9 min-w-64 flex-1 items-center rounded-md border border-slate-200 px-3 lg:max-w-[360px]"><Search size={16} className="mr-2 text-slate-400" /><input type="search" value={search} onChange={(event) => { setSearch(event.target.value); setPage(0); }} placeholder="Tìm Deal, khách hàng, owner..." className="w-full text-sm outline-none" /></label>
                    <select aria-label="Lọc theo giai đoạn" value={stage} onChange={(event) => { setStage(event.target.value as DealStage | ""); setPage(0); }} className="h-9 rounded-md border border-slate-200 px-3 text-sm text-slate-600 outline-none"><option value="">Tất cả giai đoạn</option>{DEAL_STAGE_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select>
                    <button type="button" aria-label="Tải lại" onClick={() => setRefreshKey((value) => value + 1)} className="ml-auto rounded-md border border-slate-200 p-2 text-slate-500 hover:bg-slate-50"><RefreshCw size={16} className={loading ? "animate-spin" : ""} /></button>
                </div>
                {error ? <div className="p-5"><Alert severity="error" action={<button type="button" className="font-medium" onClick={() => setRefreshKey((value) => value + 1)}>Thử lại</button>}>{error}</Alert></div> : loading ? <div className="flex min-h-72 items-center justify-center"><CircularProgress size={32} /></div> : result.content.length === 0 ? (
                    <div className="flex min-h-72 flex-col items-center justify-center text-center"><div className="mb-3 rounded-full bg-slate-100 p-4 text-slate-400"><BriefcaseBusiness size={28} /></div><p className="font-medium text-slate-700">Không tìm thấy Deal</p><p className="mt-1 text-sm text-slate-500">Thử thay đổi từ khóa hoặc bộ lọc.</p></div>
                ) : (
                    <div className="overflow-x-auto"><table className="w-full min-w-[1000px] border-collapse"><thead><tr className="border-b border-slate-200 bg-slate-50">{["Deal", "Khách hàng", "Giá trị", "Giai đoạn", "Xác suất", "Ngày dự kiến đóng", "Người phụ trách"].map((label) => <th key={label} className="px-4 py-3 text-left text-xs font-medium text-slate-500">{label}</th>)}</tr></thead><tbody>{result.content.map((deal) => <tr key={deal.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50"><td className="px-4 py-4"><button type="button" onClick={() => navigate(`/deals/${deal.id}`)} className="text-sm font-medium text-blue-600 hover:underline">{deal.name}</button></td><td className="px-4 py-4"><button type="button" onClick={() => navigate(`/customers/${deal.customerId}`)} className="text-sm text-slate-700 hover:text-blue-600 hover:underline">{deal.customerName}</button></td><td className="px-4 py-4 text-sm font-medium text-slate-800">{formatVND(deal.value)}</td><td className="px-4 py-4"><DealStageBadge stage={deal.stage} /></td><td className="px-4 py-4 text-sm text-slate-600">{deal.probability}%</td><td className="px-4 py-4 text-sm text-slate-600">{dateFormatter.format(new Date(`${deal.expectedCloseDate}T00:00:00`))}</td><td className="px-4 py-4 text-sm text-slate-600">{deal.ownerName || "—"}</td></tr>)}</tbody></table></div>
                )}
                {!error && !loading && <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 px-5 py-3"><div className="flex items-center gap-3 text-xs text-slate-500"><span>Hiển thị {from}–{to} trong {result.totalElements} Deal</span><select value={pageSize} onChange={(event) => { setPageSize(Number(event.target.value)); setPage(0); }} className="rounded border border-slate-200 px-2 py-1">{[10, 20, 50].map((size) => <option key={size} value={size}>{size}/trang</option>)}</select></div><div className="flex gap-1"><button type="button" disabled={page === 0} onClick={() => setPage((value) => value - 1)} className="rounded border border-slate-200 px-3 py-1.5 text-xs disabled:text-slate-300">Trước</button>{pageNumbers.map((number) => <button type="button" key={number} onClick={() => setPage(number)} className={`rounded px-3 py-1.5 text-xs ${number === page ? "bg-blue-500 text-white" : "border border-slate-200"}`}>{number + 1}</button>)}<button type="button" disabled={page + 1 >= result.totalPages} onClick={() => setPage((value) => value + 1)} className="rounded border border-slate-200 px-3 py-1.5 text-xs disabled:text-slate-300">Sau</button></div></div>}
            </div>
        </div>
    );
}
