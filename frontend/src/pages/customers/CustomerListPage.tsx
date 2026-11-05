import PageHeader from "../../components/common/PageHeader";
import { Alert, CircularProgress } from "@mui/material";
import { Plus, RefreshCw, Search } from "lucide-react";
import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import CustomerTable from "../../components/customers/CustomerTable";
import { customerService, getCustomerErrorMessage, type CustomerListResponse } from "../../services/customerService";
import type { CustomerStatus } from "../../types/customer";
import { CUSTOMER_STATUS_OPTIONS } from "../../utils/constants";

const EMPTY_RESULT: CustomerListResponse = {
    content: [],
    page: 0,
    size: 10,
    totalElements: 0,
    totalPages: 0,
};

export default function CustomerListPage() {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const [result, setResult] = useState<CustomerListResponse>(EMPTY_RESULT);
    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const search = searchParams.get("search") ?? "";
    const deferredSearch = useDeferredValue(search);
    const [status, setStatus] = useState<CustomerStatus | "">("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [refreshKey, setRefreshKey] = useState(0);

    useEffect(() => {
        let active = true;

        const loadCustomers = async () => {
            setLoading(true);
            setError("");
            try {
                const data = await customerService.getCustomers(page, pageSize, deferredSearch, status || undefined);
                if (active) setResult(data);
            } catch (loadError) {
                if (active) setError(getCustomerErrorMessage(loadError));
            } finally {
                if (active) setLoading(false);
            }
        };

        void loadCustomers();
        return () => { active = false; };
    }, [deferredSearch, page, pageSize, refreshKey, status]);

    const pageNumbers = useMemo(() => {
        if (result.totalPages <= 1) return result.totalPages === 1 ? [0] : [];
        const start = Math.max(0, Math.min(page - 2, result.totalPages - 5));
        return Array.from({ length: Math.min(5, result.totalPages) }, (_, index) => start + index);
    }, [page, result.totalPages]);

    const from = result.totalElements === 0 ? 0 : page * pageSize + 1;
    const to = Math.min((page + 1) * pageSize, result.totalElements);

    return (
        <div>
            <PageHeader title="Khách hàng" description="Quản lý danh sách khách hàng" actions={<button type="button" onClick={() => navigate("/customers/new")} className="crm-btn crm-btn--primary">
                    <Plus size={16} /> Thêm khách hàng
                </button>} />

            <div className="crm-board">
                <div className="crm-toolbar crm-toolbar--board">
                    <label className="crm-search">
                        <Search size={16} className="mr-2 shrink-0 text-(--crm-text-muted)" />
                        <input
                            type="search"
                            value={search}
                            onChange={(event) => {
                                const nextParams = new URLSearchParams(searchParams);
                                if (event.target.value) nextParams.set("search", event.target.value);
                                else nextParams.delete("search");
                                setSearchParams(nextParams, { replace: true });
                                setPage(0);
                            }}
                            placeholder="Tìm theo tên, email, SĐT, công ty..."
                            className="w-full text-sm outline-none placeholder:text-(--crm-text-muted)"
                        />
                    </label>

                    <select
                        aria-label="Lọc theo trạng thái"
                        value={status}
                        onChange={(event) => {
                            setStatus(event.target.value as CustomerStatus | "");
                            setPage(0);
                        }}
                        className="crm-filter-chip"
                    >
                        <option value="">Tất cả trạng thái</option>
                        {CUSTOMER_STATUS_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                    </select>

                    <button
                        type="button"
                        aria-label="Tải lại danh sách"
                        onClick={() => setRefreshKey((value) => value + 1)}
                        className="crm-icon-btn ml-auto"
                    >
                        <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
                    </button>
                </div>

                {error ? (
                    <div className="p-5">
                        <Alert severity="error" action={<button type="button" className="font-medium" onClick={() => setRefreshKey((value) => value + 1)}>Thử lại</button>}>{error}</Alert>
                    </div>
                ) : loading ? (
                    <div className="flex min-h-72 items-center justify-center"><CircularProgress size={32} /></div>
                ) : (
                    <CustomerTable customers={result.content} onView={(customer) => navigate(`/customers/${customer.id}`)} />
                )}

                {!error && !loading && (
                    <div className="crm-pagination">
                        <div className="flex items-center gap-3 text-xs text-(--crm-text-secondary)">
                            <span>Hiển thị {from}–{to} trong tổng số {result.totalElements} khách hàng</span>
                            <select aria-label="Số khách hàng mỗi trang" value={pageSize} onChange={(event) => { setPageSize(Number(event.target.value)); setPage(0); }} className="rounded border border-(--crm-border) px-2 py-1 outline-none">
                                {[10, 20, 50].map((size) => <option key={size} value={size}>{size}/trang</option>)}
                            </select>
                        </div>
                        <div className="flex items-center gap-1">
                            <button type="button" disabled={page === 0} onClick={() => setPage((value) => value - 1)} className="rounded border border-(--crm-border) px-3 py-1.5 text-xs text-(--crm-text-secondary) disabled:cursor-not-allowed disabled:text-(--crm-text-disabled)">Trước</button>
                            {pageNumbers.map((pageNumber) => (
                                <button type="button" key={pageNumber} onClick={() => setPage(pageNumber)} className={`rounded px-3 py-1.5 text-xs ${pageNumber === page ? "bg-(--crm-primary) text-(--crm-on-primary)" : "border border-(--crm-border) text-(--crm-text-secondary)"}`}>{pageNumber + 1}</button>
                            ))}
                            <button type="button" disabled={page + 1 >= result.totalPages} onClick={() => setPage((value) => value + 1)} className="rounded border border-(--crm-border) px-3 py-1.5 text-xs text-(--crm-text-secondary) disabled:cursor-not-allowed disabled:text-(--crm-text-disabled)">Sau</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
