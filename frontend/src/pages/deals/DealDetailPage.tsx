import { Alert, CircularProgress } from "@mui/material";
import { ArrowLeft, CalendarDays, FileText, Pencil, Trash2, UserRound, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import ConfirmDialog from "../../components/common/ConfirmDialog";
import DealStageBadge from "../../components/deals/DealStageBadge";
import { dealService, getDealErrorMessage } from "../../services/dealService";
import type { Deal } from "../../types/deal";
import { formatVND } from "../../utils/currency";

const dateFormatter = new Intl.DateTimeFormat("vi-VN", { dateStyle: "long" });
const dateTimeFormatter = new Intl.DateTimeFormat("vi-VN", { dateStyle: "long", timeStyle: "short" });

export default function DealDetailPage() {
    const navigate = useNavigate();
    const { id } = useParams();
    const dealId = Number(id);
    const [deal, setDeal] = useState<Deal | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        let active = true;
        const loadDeal = async () => {
            if (!Number.isInteger(dealId) || dealId <= 0) { setError("Mã Deal không hợp lệ."); setLoading(false); return; }
            try { const data = await dealService.getDealById(dealId); if (active) setDeal(data); }
            catch (loadError) { if (active) setError(getDealErrorMessage(loadError)); }
            finally { if (active) setLoading(false); }
        };
        void loadDeal();
        return () => { active = false; };
    }, [dealId]);

    const handleDelete = async () => {
        setDeleting(true);
        try { await dealService.deleteDeal(dealId); navigate("/deals", { replace: true }); }
        catch (deleteError) { setError(getDealErrorMessage(deleteError)); setConfirmDelete(false); }
        finally { setDeleting(false); }
    };

    if (loading) return <div className="flex min-h-72 items-center justify-center"><CircularProgress /></div>;
    if (error || !deal) return <Alert severity="error" action={<button type="button" className="font-medium" onClick={() => navigate("/deals")}>Về danh sách</button>}>{error || "Không tìm thấy Deal."}</Alert>;

    const weightedValue = deal.value * deal.probability / 100;
    const details = [
        { label: "Khách hàng", value: deal.customerName, icon: Users, action: () => navigate(`/customers/${deal.customerId}`) },
        { label: "Ngày dự kiến đóng", value: dateFormatter.format(new Date(`${deal.expectedCloseDate}T00:00:00`)), icon: CalendarDays },
        { label: "Người phụ trách", value: deal.ownerName || "—", icon: UserRound },
        { label: "Ngày tạo", value: dateTimeFormatter.format(new Date(deal.createdAt)), icon: CalendarDays },
    ];

    return (
        <div className="max-w-5xl">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-4"><button type="button" onClick={() => navigate("/deals")} className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800"><ArrowLeft size={17} /> Quay lại</button><div className="flex gap-2"><button type="button" onClick={() => navigate(`/deals/${dealId}/edit`)} className="flex items-center gap-2 rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"><Pencil size={16} /> Chỉnh sửa</button><button type="button" onClick={() => setConfirmDelete(true)} className="flex items-center gap-2 rounded-md border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"><Trash2 size={16} /> Xóa</button></div></div>
            <section className="mb-5 rounded-lg border border-slate-200 bg-white p-6"><div className="flex flex-wrap items-start justify-between gap-4"><div><h1 className="text-2xl font-semibold text-slate-900">{deal.name}</h1><p className="mt-1 text-sm text-slate-500">Deal ID: #{deal.id}</p></div><DealStageBadge stage={deal.stage} /></div></section>
            <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-3"><div className="rounded-lg border border-slate-200 bg-white p-5"><p className="text-xs text-slate-500">Giá trị Deal</p><p className="mt-2 text-xl font-semibold text-slate-900">{formatVND(deal.value)}</p></div><div className="rounded-lg border border-slate-200 bg-white p-5"><p className="text-xs text-slate-500">Xác suất</p><p className="mt-2 text-xl font-semibold text-slate-900">{deal.probability}%</p></div><div className="rounded-lg border border-slate-200 bg-white p-5"><p className="text-xs text-slate-500">Giá trị có trọng số</p><p className="mt-2 text-xl font-semibold text-blue-700">{formatVND(weightedValue)}</p></div></div>
            <section className="overflow-hidden rounded-lg border border-slate-200 bg-white"><div className="border-b border-slate-200 px-5 py-4"><h2 className="font-semibold text-slate-900">Thông tin Deal</h2></div><div className="grid grid-cols-1 gap-px bg-slate-200 md:grid-cols-2">{details.map(({ label, value, icon: Icon, action }) => <div key={label} className="flex gap-3 bg-white p-5"><Icon size={18} className="mt-0.5 text-slate-400" /><div><p className="text-xs text-slate-500">{label}</p>{action ? <button type="button" onClick={action} className="mt-1 text-sm font-medium text-blue-600 hover:underline">{value}</button> : <p className="mt-1 text-sm font-medium text-slate-800">{value}</p>}</div></div>)}<div className="bg-white p-5 md:col-span-2"><div className="flex gap-3"><FileText size={18} className="text-slate-400" /><div><p className="text-xs text-slate-500">Mô tả</p><p className="mt-1 whitespace-pre-wrap text-sm text-slate-800">{deal.description || "—"}</p></div></div></div></div></section>
            <ConfirmDialog open={confirmDelete} title="Xóa Deal?" description={`Deal “${deal.name}” sẽ bị xóa vĩnh viễn. Bạn có chắc chắn?`} loading={deleting} onClose={() => setConfirmDelete(false)} onConfirm={handleDelete} />
        </div>
    );
}
