import PageHeader from "../../components/common/PageHeader";
import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { Alert, CircularProgress, Snackbar } from "@mui/material";
import { Plus, RefreshCw, Search } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";

import ConfirmDialog from "../../components/common/ConfirmDialog";
import LeadTable from "../../components/leads/LeadTable";
import { getErrorMessage, leadService, type LeadListResponse } from "../../services/leadService";
import type { Lead, LeadSource, LeadStatus } from "../../types/lead";
import { LEAD_SOURCE_OPTIONS, LEAD_STATUS_OPTIONS } from "../../utils/constants";

const EMPTY_RESULT: LeadListResponse = {
    content: [],
    page: 0,
    size: 10,
    totalElements: 0,
    totalPages: 0,
};

export default function LeadListPage() {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const [result, setResult] = useState(EMPTY_RESULT);
    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const search = searchParams.get("search") ?? "";
    const deferredSearch = useDeferredValue(search);
    const [status, setStatus] = useState<LeadStatus | "">("");
    const [source, setSource] = useState<LeadSource | "">("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [refreshKey, setRefreshKey] = useState(0);
    const [leadToDelete, setLeadToDelete] = useState<Lead | null>(null);
    const [deleting, setDeleting] = useState(false);
    const [message, setMessage] = useState("");

    useEffect(() => {
        let active = true;

        const loadLeads = async () => {
            setLoading(true);
            setError("");
            try {
                const data = await leadService.getLeads({
                    page,
                    size: pageSize,
                    search: deferredSearch,
                    status,
                    source,
                });
                if (active) setResult(data);
            } catch (loadError) {
                if (active) setError(getErrorMessage(loadError));
            } finally {
                if (active) setLoading(false);
            }
        };

        void loadLeads();
        return () => { active = false; };
    }, [deferredSearch, page, pageSize, refreshKey, source, status]);

    const pageNumbers = useMemo(() => {
        if (result.totalPages <= 1) return result.totalPages === 1 ? [0] : [];
        const start = Math.max(0, Math.min(page - 2, result.totalPages - 5));
        return Array.from({ length: Math.min(5, result.totalPages) }, (_, index) => start + index);
    }, [page, result.totalPages]);

    const handleDelete = async () => {
        if (!leadToDelete) return;
        setDeleting(true);
        try {
            await leadService.deleteLead(leadToDelete.id);
            setLeadToDelete(null);
            setMessage("Đã xóa Lead thành công.");
            if (result.content.length === 1 && page > 0) setPage((value) => value - 1);
            else setRefreshKey((value) => value + 1);
        } catch (deleteError) {
            setError(getErrorMessage(deleteError));
        } finally {
            setDeleting(false);
        }
    };

    const from = result.totalElements === 0 ? 0 : page * pageSize + 1;
    const to = Math.min((page + 1) * pageSize, result.totalElements);

    return (
        <div>
            <PageHeader title="Lead" description="Quản lý khách hàng tiềm năng" actions={<button
                    type="button"
                    onClick={() => navigate("/leads/new")}
                    className="crm-btn crm-btn--primary"
                >
                    <Plus size={16} /> Thêm Lead
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
                            placeholder="Tìm theo tên, email, SĐT..."
                            className="w-full text-sm outline-none placeholder:text-(--crm-text-muted)"
                        />
                    </label>

                    <select
                        aria-label="Lọc theo trạng thái"
                        value={status}
                        onChange={(event) => { setStatus(event.target.value as LeadStatus | ""); setPage(0); }}
                        className="crm-filter-chip"
                    >
                        <option value="">Tất cả trạng thái</option>
                        {LEAD_STATUS_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                    </select>

                    <select
                        aria-label="Lọc theo nguồn"
                        value={source}
                        onChange={(event) => { setSource(event.target.value as LeadSource | ""); setPage(0); }}
                        className="crm-filter-chip"
                    >
                        <option value="">Tất cả nguồn</option>
                        {LEAD_SOURCE_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
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
                        <Alert
                            severity="error"
                            action={<button type="button" className="font-medium" onClick={() => setRefreshKey((value) => value + 1)}>Thử lại</button>}
                        >
                            {error}
                        </Alert>
                    </div>
                ) : loading ? (
                    <div className="flex min-h-72 items-center justify-center"><CircularProgress size={32} /></div>
                ) : (
                    <LeadTable
                        leads={result.content}
                        onView={(lead) => navigate(`/leads/${lead.id}`)}
                        onEdit={(lead) => navigate(`/leads/${lead.id}/edit`)}
                        onDelete={setLeadToDelete}
                    />
                )}

                {!error && !loading && (
                    <div className="crm-pagination">
                        <div className="flex items-center gap-3 text-xs text-(--crm-text-secondary)">
                            <span>Hiển thị {from}–{to} trong tổng số {result.totalElements} Lead</span>
                            <select
                                aria-label="Số Lead mỗi trang"
                                value={pageSize}
                                onChange={(event) => { setPageSize(Number(event.target.value)); setPage(0); }}
                                className="rounded border border-(--crm-border) px-2 py-1 outline-none"
                            >
                                {[10, 20, 50].map((size) => <option key={size} value={size}>{size}/trang</option>)}
                            </select>
                        </div>
                        <div className="flex items-center gap-1">
                            <button type="button" disabled={page === 0} onClick={() => setPage((value) => value - 1)} className="rounded border border-(--crm-border) px-3 py-1.5 text-xs text-(--crm-text-secondary) disabled:cursor-not-allowed disabled:text-(--crm-text-disabled)">Trước</button>
                            {pageNumbers.map((pageNumber) => (
                                <button
                                    type="button"
                                    key={pageNumber}
                                    onClick={() => setPage(pageNumber)}
                                    className={`rounded px-3 py-1.5 text-xs ${pageNumber === page ? "bg-(--crm-primary) text-(--crm-on-primary)" : "border border-(--crm-border) text-(--crm-text-secondary)"}`}
                                >
                                    {pageNumber + 1}
                                </button>
                            ))}
                            <button type="button" disabled={page + 1 >= result.totalPages} onClick={() => setPage((value) => value + 1)} className="rounded border border-(--crm-border) px-3 py-1.5 text-xs text-(--crm-text-secondary) disabled:cursor-not-allowed disabled:text-(--crm-text-disabled)">Sau</button>
                        </div>
                    </div>
                )}
            </div>

            <ConfirmDialog
                open={Boolean(leadToDelete)}
                title="Xóa Lead?"
                description={leadToDelete ? `Lead “${leadToDelete.firstName} ${leadToDelete.lastName}” sẽ bị xóa vĩnh viễn. Bạn có chắc chắn?` : ""}
                loading={deleting}
                onClose={() => setLeadToDelete(null)}
                onConfirm={handleDelete}
            />
            <Snackbar open={Boolean(message)} autoHideDuration={3000} onClose={() => setMessage("")} message={message} />
        </div>
    );
}
