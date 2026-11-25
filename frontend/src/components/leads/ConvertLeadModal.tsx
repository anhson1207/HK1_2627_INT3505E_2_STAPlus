import {
    Alert,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
} from "@mui/material";
import {
    BadgeDollarSign,
    BriefcaseBusiness,
    Building2,
    CheckCircle2,
    Mail,
    Phone,
    UserCheck,
    X,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { leadService } from "../../services/leadService";
import type { ConvertLeadResult, Lead } from "../../types/lead";

interface ConvertLeadModalProps {
    open: boolean;
    lead: Lead | null;
    onClose: () => void;
    onSuccess: (result: ConvertLeadResult) => void;
}

const DEAL_STAGES = [
    { value: "PROSPECT", label: "Tiềm năng (Prospect)" },
    { value: "QUALIFIED", label: "Đủ điều kiện (Qualified)" },
    { value: "PROPOSAL", label: "Đề xuất / Báo giá (Proposal)" },
    { value: "NEGOTIATION", label: "Đàm phán (Negotiation)" },
];

export default function ConvertLeadModal({
    open,
    lead,
    onClose,
    onSuccess,
}: ConvertLeadModalProps) {
    const navigate = useNavigate();
    const [createDeal, setCreateDeal] = useState(true);
    const [dealName, setDealName] = useState("");
    const [dealAmount, setDealAmount] = useState<number | "">(50000000);
    const [dealStage, setDealStage] = useState("QUALIFIED");
    const [customerNotes, setCustomerNotes] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!lead) return null;

    const defaultDealName =
        dealName || `Hợp đồng - ${lead.company || `${lead.firstName} ${lead.lastName}`}`;

    const handleConvert = async () => {
        setLoading(true);
        setError(null);

        try {
            const result = await leadService.convertLead(lead.id, {
                dealName: createDeal ? (dealName.trim() || defaultDealName) : undefined,
                dealAmount: createDeal && typeof dealAmount === "number" ? dealAmount : undefined,
                dealStage: createDeal ? dealStage : undefined,
                customerNotes: customerNotes.trim() || undefined,
            });

            onSuccess(result);
            onClose();

            // Navigate to customer detail
            navigate(`/customers/${result.customerId}`);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Chuyển đổi Lead thất bại. Vui lòng thử lại.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog
            open={open}
            onClose={loading ? undefined : onClose}
            maxWidth="sm"
            fullWidth
            slotProps={{
                paper: {
                    sx: {
                        borderRadius: "20px",
                        overflow: "hidden",
                        backgroundColor: "var(--crm-surface)",
                        border: "1px solid var(--crm-border)",
                        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
                    },
                },
            }}
        >
            {/* Header */}
            <DialogTitle className="flex items-center justify-between border-b border-slate-100 bg-white px-6 py-4.5 dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-600 shadow-2xs dark:bg-teal-950/60 dark:text-teal-400">
                        <UserCheck size={20} />
                    </div>
                    <div>
                        <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                            Chuyển đổi thành Khách hàng
                        </h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            Tạo hồ sơ Khách hàng chính thức và Cơ hội bán hàng từ Lead này
                        </p>
                    </div>
                </div>
                <button
                    type="button"
                    disabled={loading}
                    onClick={onClose}
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition dark:hover:bg-slate-800 dark:hover:text-slate-200"
                    aria-label="Đóng"
                >
                    <X size={18} />
                </button>
            </DialogTitle>

            {/* Content */}
            <DialogContent className="space-y-4 px-6 py-5 bg-slate-50/60 dark:bg-slate-950/40">
                {error && (
                    <Alert severity="error" onClose={() => setError(null)} className="rounded-xl">
                        {error}
                    </Alert>
                )}

                {/* Lead Summary Info Card */}
                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2.5">
                        Thông tin Lead được chuyển đổi
                    </p>
                    <div className="flex items-start gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 font-bold text-base dark:bg-blue-950/60 dark:text-blue-400">
                            {lead.firstName.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                                {lead.firstName} {lead.lastName}
                            </h3>
                            <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600 dark:text-slate-400">
                                {lead.company && (
                                    <span className="flex items-center gap-1 truncate">
                                        <Building2 size={13} className="text-slate-400" />
                                        {lead.company}
                                    </span>
                                )}
                                {lead.phone && (
                                    <span className="flex items-center gap-1">
                                        <Phone size={13} className="text-slate-400" />
                                        {lead.phone}
                                    </span>
                                )}
                                {lead.email && (
                                    <span className="flex items-center gap-1 truncate">
                                        <Mail size={13} className="text-slate-400" />
                                        {lead.email}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Customer Creation Notice */}
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-3.5 text-xs text-emerald-900 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-300">
                    <div className="flex items-center gap-2 font-bold text-emerald-950 dark:text-emerald-200 mb-1">
                        <CheckCircle2 size={16} className="text-emerald-600 dark:text-emerald-400" />
                        <span>Hồ sơ Khách hàng mới sẽ được tạo tự động</span>
                    </div>
                    <p className="text-[11px] leading-relaxed text-emerald-800 dark:text-emerald-400">
                        Thông tin liên hệ và công ty sẽ được chuyển sang danh sách <strong>Khách hàng (Customer 360)</strong> với trạng thái <strong>Hoạt động (ACTIVE)</strong>. Trạng thái Lead sẽ tự động chuyển thành <strong>Đã chuyển đổi (CONVERTED)</strong>.
                    </p>
                </div>

                {/* Customer Notes */}
                <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Ghi chú bổ sung cho Khách hàng (Tùy chọn)
                    </label>
                    <textarea
                        rows={2}
                        value={customerNotes}
                        onChange={(e) => setCustomerNotes(e.target.value)}
                        placeholder="Nhập ghi chú yêu cầu hoặc thỏa thuận ban đầu của khách hàng..."
                        className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#007f9b] focus:ring-2 focus:ring-[#007f9b]/20 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
                    />
                </div>

                {/* Optional Deal Creation Section */}
                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs dark:border-slate-800 dark:bg-slate-900 space-y-3">
                    <label className="flex items-center gap-2.5 cursor-pointer select-none">
                        <input
                            type="checkbox"
                            checked={createDeal}
                            onChange={(e) => setCreateDeal(e.target.checked)}
                            className="h-4 w-4 rounded border-slate-300 text-[#007f9b] focus:ring-[#007f9b]"
                        />
                        <div className="flex items-center gap-1.5">
                            <BriefcaseBusiness size={16} className="text-[#007f9b]" />
                            <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                                Đồng thời tạo Cơ hội bán hàng (Deal) mới
                            </span>
                        </div>
                    </label>

                    {createDeal && (
                        <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                            <div>
                                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
                                    Tên Cơ hội (Deal Name) <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={dealName}
                                    placeholder={defaultDealName}
                                    onChange={(e) => setDealName(e.target.value)}
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-800 outline-none transition focus:border-[#007f9b] focus:bg-white focus:ring-2 focus:ring-[#007f9b]/20 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
                                        Giá trị dự kiến (VNĐ)
                                    </label>
                                    <div className="relative">
                                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                                            <BadgeDollarSign size={14} />
                                        </div>
                                        <input
                                            type="number"
                                            value={dealAmount}
                                            onChange={(e) =>
                                                setDealAmount(
                                                    e.target.value === "" ? "" : Number(e.target.value)
                                                )
                                            }
                                            placeholder="50,000,000"
                                            className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-8 pr-3.5 py-2 text-xs text-slate-800 outline-none transition focus:border-[#007f9b] focus:bg-white focus:ring-2 focus:ring-[#007f9b]/20 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
                                        Giai đoạn bắt đầu
                                    </label>
                                    <select
                                        value={dealStage}
                                        onChange={(e) => setDealStage(e.target.value)}
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-800 outline-none transition focus:border-[#007f9b] focus:bg-white focus:ring-2 focus:ring-[#007f9b]/20 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
                                    >
                                        {DEAL_STAGES.map((s) => (
                                            <option key={s.value} value={s.value}>
                                                {s.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </DialogContent>

            {/* Footer */}
            <DialogActions className="border-t border-slate-100 bg-white px-6 py-3.5 flex justify-end gap-2 dark:border-slate-800 dark:bg-slate-900">
                <button
                    type="button"
                    disabled={loading}
                    onClick={onClose}
                    className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition disabled:opacity-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                    Hủy
                </button>
                <button
                    type="button"
                    disabled={loading}
                    onClick={() => void handleConvert()}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-[#007f9b] px-5 py-2 text-xs font-bold text-white hover:bg-[#006a82] active:scale-98 transition shadow-xs disabled:opacity-50"
                >
                    {loading ? (
                        <CircularProgress size={14} color="inherit" />
                    ) : (
                        <UserCheck size={15} />
                    )}
                    <span>{loading ? "Đang chuyển đổi..." : "Xác nhận chuyển đổi"}</span>
                </button>
            </DialogActions>
        </Dialog>
    );
}
