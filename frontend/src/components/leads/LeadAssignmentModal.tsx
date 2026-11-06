import { Alert, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import { Check, CheckCircle2, SlidersHorizontal, Sparkles, Users, X, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { leadService } from "../../services/leadService";
import type { AssignmentRule, AssignmentStrategy } from "../../types/lead";

interface LeadAssignmentModalProps {
    open: boolean;
    onClose: () => void;
    onSuccess: (message: string) => void;
}

// Custom lightweight iOS/Tailwind toggle switch for instant, crisp response
function ToggleSwitch({
    checked,
    onChange,
    disabled = false,
}: {
    checked: boolean;
    onChange: (checked: boolean) => void;
    disabled?: boolean;
}) {
    return (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            disabled={disabled}
            onClick={(e) => {
                e.stopPropagation();
                onChange(!checked);
            }}
            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 focus:outline-none disabled:opacity-50 ${
                checked ? "bg-blue-600" : "bg-slate-200"
            }`}
        >
            <span
                className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-xs transition duration-200 ${
                    checked ? "translate-x-4.5" : "translate-x-1"
                }`}
            />
        </button>
    );
}

export default function LeadAssignmentModal({ open, onClose, onSuccess }: LeadAssignmentModalProps) {
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [assigning, setAssigning] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [enabled, setEnabled] = useState(true);
    const [strategy, setStrategy] = useState<AssignmentStrategy>("ROUND_ROBIN");
    const [selectedSalesIds, setSelectedSalesIds] = useState<number[]>([2, 4, 5]);
    const [unassignedCount, setUnassignedCount] = useState<number>(0);

    const availableSales = [
        { id: 2, name: "Trần Minh", email: "sales@crm.com", role: "Sales Rep", avatarBg: "bg-emerald-100 text-emerald-700" },
        { id: 4, name: "Phạm Bảo Trúc", email: "truc@crm.com", role: "Senior Sales", avatarBg: "bg-purple-100 text-purple-700" },
        { id: 5, name: "Đỗ Hải Anh", email: "haianh@crm.com", role: "Sales Rep", avatarBg: "bg-sky-100 text-sky-700" },
        { id: 1, name: "Nguyễn Anh Sơn", email: "son@crm.com", role: "Sales Manager / Admin", avatarBg: "bg-amber-100 text-amber-700" },
    ];

    useEffect(() => {
        if (!open) return;
        let active = true;
        const loadRules = async () => {
            setLoading(true);
            setError(null);
            try {
                const rules = await leadService.getAssignmentRules();
                if (active) {
                    setEnabled(rules.enabled);
                    setStrategy(rules.strategy);
                    setSelectedSalesIds(rules.activeSalesIds && rules.activeSalesIds.length > 0 ? rules.activeSalesIds : [2, 4, 5]);
                    setUnassignedCount(rules.unassignedCount);
                }
            } catch (err: unknown) {
                if (active) setError(err instanceof Error ? err.message : "Lỗi khi tải cấu hình");
            } finally {
                if (active) setLoading(false);
            }
        };
        void loadRules();
        return () => { active = false; };
    }, [open]);

    const handleToggleSales = (id: number) => {
        if (selectedSalesIds.includes(id)) {
            if (selectedSalesIds.length === 1) {
                setError("Cần giữ ít nhất 1 nhân viên để nhận khách.");
                return;
            }
            setSelectedSalesIds(selectedSalesIds.filter((item) => item !== id));
        } else {
            setSelectedSalesIds([...selectedSalesIds, id]);
        }
    };

    const handleSelectAllToggle = () => {
        if (selectedSalesIds.length === availableSales.length) {
            setSelectedSalesIds([availableSales[0].id]);
        } else {
            setSelectedSalesIds(availableSales.map((s) => s.id));
        }
    };

    const handleSaveRules = async () => {
        setSaving(true);
        setError(null);
        try {
            const rules: AssignmentRule = {
                enabled,
                strategy,
                activeSalesIds: selectedSalesIds,
                unassignedCount,
            };
            await leadService.updateAssignmentRules(rules);
            onSuccess("Đã lưu thiết lập phân bổ khách tự động!");
            onClose();
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Lưu cấu hình thất bại");
        } finally {
            setSaving(false);
        }
    };

    const handleAutoAssignNow = async () => {
        setAssigning(true);
        setError(null);
        try {
            const res = await leadService.autoAssignPendingLeads();
            onSuccess(`Đã chia xong ${res.assignedCount} khách cho ${selectedSalesIds.length} nhân viên!`);
            onClose();
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Phân bổ thất bại");
        } finally {
            setAssigning(false);
        }
    };

    const allSelected = selectedSalesIds.length === availableSales.length;

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
            slotProps={{
                paper: {
                    sx: {
                        borderRadius: "20px",
                        overflow: "hidden",
                        border: "1px solid #e2e8f0",
                        boxShadow: "0 20px 25px -5px rgba(0,0,0,0.08), 0 8px 10px -6px rgba(0,0,0,0.04)",
                    },
                },
            }}
        >
            {/* Modal Header */}
            <DialogTitle className="flex items-center justify-between border-b border-slate-100 bg-white px-6 py-4">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 shadow-2xs">
                        <SlidersHorizontal size={19} />
                    </div>
                    <div>
                        <h2 className="text-base font-bold text-slate-900">Phân bổ khách hàng tự động</h2>
                        <p className="text-xs text-slate-500">Tự động gán khách mới cho đội ngũ Sales</p>
                    </div>
                </div>
                <button
                    type="button"
                    onClick={onClose}
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
                    aria-label="Đóng"
                >
                    <X size={18} />
                </button>
            </DialogTitle>

            {/* Modal Body */}
            <DialogContent className="space-y-4 px-6 py-5 bg-slate-50/60">
                {error && (
                    <Alert severity="error" onClose={() => setError(null)} className="rounded-xl">
                        {error}
                    </Alert>
                )}

                {loading ? (
                    <div className="flex min-h-60 items-center justify-center">
                        <CircularProgress size={28} />
                    </div>
                ) : (
                    <>
                        {/* 1. Main Feature Toggle */}
                        <div
                            onClick={() => setEnabled(!enabled)}
                            className="flex items-center justify-between rounded-2xl border border-slate-200/90 bg-white p-4 shadow-2xs cursor-pointer hover:border-slate-300 transition"
                        >
                            <div className="flex items-center gap-3 pr-2">
                                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition ${
                                    enabled ? "bg-blue-500 text-white shadow-2xs" : "bg-slate-100 text-slate-400"
                                }`}>
                                    <Sparkles size={17} />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-semibold text-slate-900">Tự động chia khách mới</span>
                                        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                                            enabled
                                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                                : "bg-slate-100 text-slate-500 border border-slate-200"
                                        }`}>
                                            <span className={`h-1.5 w-1.5 rounded-full ${enabled ? "bg-emerald-500" : "bg-slate-400"}`} />
                                            {enabled ? "Đang bật" : "Tạm dừng"}
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-500 mt-0.5">
                                        Tự động gán ngay khi có khách mới vào hệ thống
                                    </p>
                                </div>
                            </div>
                            <ToggleSwitch checked={enabled} onChange={setEnabled} />
                        </div>

                        {/* 2. Distribution Rule Cards (Super concise, clean, high UX) */}
                        <div className="space-y-2">
                            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                Hình thức chia
                            </label>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {/* Option A: Round Robin */}
                                <div
                                    role="button"
                                    tabIndex={0}
                                    onClick={() => setStrategy("ROUND_ROBIN")}
                                    onKeyDown={(e) => e.key === "Enter" && setStrategy("ROUND_ROBIN")}
                                    className={`relative flex flex-col justify-between rounded-2xl p-3.5 border cursor-pointer transition select-none ${
                                        strategy === "ROUND_ROBIN"
                                            ? "border-blue-600 bg-white ring-2 ring-blue-500/20 shadow-sm"
                                            : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/80"
                                    }`}
                                >
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <div className={`flex h-8 w-8 items-center justify-center rounded-xl transition ${
                                                strategy === "ROUND_ROBIN" ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-500"
                                            }`}>
                                                <Users size={16} />
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                                                    Chia đều
                                                </span>
                                                <div className={`h-4 w-4 rounded-full border flex items-center justify-center ${
                                                    strategy === "ROUND_ROBIN" ? "border-blue-600 bg-blue-600" : "border-slate-300"
                                                }`}>
                                                    {strategy === "ROUND_ROBIN" && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                                                </div>
                                            </div>
                                        </div>
                                        <h3 className="text-sm font-bold text-slate-800">Chia đều xoay vòng</h3>
                                        <p className="text-xs text-slate-500 mt-0.5">
                                            Chia lần lượt theo vòng cho từng nhân viên.
                                        </p>
                                    </div>
                                </div>

                                {/* Option B: Workload Balanced */}
                                <div
                                    role="button"
                                    tabIndex={0}
                                    onClick={() => setStrategy("LOAD_BALANCED")}
                                    onKeyDown={(e) => e.key === "Enter" && setStrategy("LOAD_BALANCED")}
                                    className={`relative flex flex-col justify-between rounded-2xl p-3.5 border cursor-pointer transition select-none ${
                                        strategy === "LOAD_BALANCED"
                                            ? "border-purple-600 bg-white ring-2 ring-purple-500/20 shadow-sm"
                                            : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/80"
                                    }`}
                                >
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <div className={`flex h-8 w-8 items-center justify-center rounded-xl transition ${
                                                strategy === "LOAD_BALANCED" ? "bg-purple-600 text-white" : "bg-slate-100 text-slate-500"
                                            }`}>
                                                <Zap size={16} />
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                                                    Ưu tiên rảnh
                                                </span>
                                                <div className={`h-4 w-4 rounded-full border flex items-center justify-center ${
                                                    strategy === "LOAD_BALANCED" ? "border-purple-600 bg-purple-600" : "border-slate-300"
                                                }`}>
                                                    {strategy === "LOAD_BALANCED" && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                                                </div>
                                            </div>
                                        </div>
                                        <h3 className="text-sm font-bold text-slate-800">Ưu tiên người đang rảnh</h3>
                                        <p className="text-xs text-slate-500 mt-0.5">
                                            Giao cho nhân viên đang có ít khách nhất.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 3. Sales Team Selection */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                                    Nhân viên nhận khách ({selectedSalesIds.length}/{availableSales.length})
                                </label>
                                <button
                                    type="button"
                                    onClick={handleSelectAllToggle}
                                    className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition"
                                >
                                    {allSelected ? "Bỏ chọn bớt" : "Chọn tất cả"}
                                </button>
                            </div>

                            <div className="divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white shadow-2xs overflow-hidden">
                                {availableSales.map((sales) => {
                                    const isSelected = selectedSalesIds.includes(sales.id);
                                    return (
                                        <div
                                            key={sales.id}
                                            onClick={() => handleToggleSales(sales.id)}
                                            className="flex items-center justify-between px-4 py-2.5 cursor-pointer hover:bg-slate-50/80 transition select-none"
                                        >
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${sales.avatarBg}`}>
                                                    {sales.name.charAt(0)}
                                                </div>
                                                <div className="truncate">
                                                    <p className="text-sm font-semibold text-slate-800 leading-tight truncate">{sales.name}</p>
                                                    <p className="text-[11px] text-slate-400 truncate">{sales.role}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3 shrink-0">
                                                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold transition ${
                                                    isSelected
                                                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                                        : "bg-slate-100 text-slate-400 border border-slate-200"
                                                }`}>
                                                    {isSelected ? "Nhận khách" : "Tạm nghỉ"}
                                                </span>
                                                <ToggleSwitch
                                                    checked={isSelected}
                                                    onChange={() => handleToggleSales(sales.id)}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* 4. Pending Unassigned Leads */}
                        {unassignedCount > 0 ? (
                            <div className="flex items-center justify-between gap-3 rounded-2xl border border-blue-200 bg-blue-50/80 p-3.5 shadow-2xs">
                                <div className="flex items-center gap-2.5">
                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-xs">
                                        <Zap size={16} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-blue-950">
                                            {unassignedCount} khách đang chờ phân công
                                        </p>
                                        <p className="text-[11px] text-blue-700">
                                            Chia ngay cho các nhân viên đang bật ở trên
                                        </p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    disabled={assigning}
                                    onClick={() => void handleAutoAssignNow()}
                                    className="shrink-0 inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-blue-700 active:scale-98 transition shadow-xs disabled:opacity-50"
                                >
                                    {assigning ? <CircularProgress size={13} color="inherit" /> : <Zap size={13} />}
                                    <span>{assigning ? "Đang chia..." : `Chia ngay`}</span>
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-2.5 shadow-2xs">
                                <div className="flex items-center gap-2 text-slate-600">
                                    <CheckCircle2 size={16} className="text-emerald-500" />
                                    <span className="text-xs font-medium text-slate-700">Đã gán hết người phụ trách</span>
                                </div>
                                <span className="text-[11px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                                    0 khách chờ
                                </span>
                            </div>
                        )}
                    </>
                )}
            </DialogContent>

            {/* Modal Footer */}
            <DialogActions className="border-t border-slate-100 bg-white px-6 py-3.5 flex justify-end gap-2.5">
                <button
                    type="button"
                    onClick={onClose}
                    disabled={saving || assigning}
                    className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition disabled:opacity-50"
                >
                    Đóng
                </button>
                <button
                    type="button"
                    onClick={() => void handleSaveRules()}
                    disabled={saving || assigning || loading}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 active:scale-98 transition shadow-xs disabled:opacity-50"
                >
                    {saving ? <CircularProgress size={13} color="inherit" /> : <Check size={14} />}
                    <span>{saving ? "Đang lưu..." : "Lưu thiết lập"}</span>
                </button>
            </DialogActions>
        </Dialog>
    );
}