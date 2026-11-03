import { Alert, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Switch } from "@mui/material";
import { Check, CheckCircle2, RotateCw, Scale, SlidersHorizontal, Sparkles, X, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { leadService, SALES_REPRESENTATIVES } from "../../services/leadService";
import type { AssignmentRule, AssignmentStrategy } from "../../types/lead";

interface LeadAssignmentModalProps {
    open: boolean;
    onClose: () => void;
    onSuccess: (message: string) => void;
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
        { id: 2, name: "Trần Minh", email: "sales@crm.com", role: "Sales Rep" },
        { id: 4, name: "Phạm Bảo Trúc", email: "truc@crm.com", role: "Senior Sales" },
        { id: 5, name: "Đỗ Hải Anh", email: "haianh@crm.com", role: "Sales Rep" },
        { id: 1, name: "Nguyễn Anh Sơn", email: "son@crm.com", role: "Sales Manager / Admin" },
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
                setError("Cần chọn ít nhất 1 nhân viên Sales để nhận lead.");
                return;
            }
            setSelectedSalesIds(selectedSalesIds.filter((item) => item !== id));
        } else {
            setSelectedSalesIds([...selectedSalesIds, id]);
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
            onSuccess("Đã lưu cấu hình phân bổ Lead tự động!");
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
            onSuccess(`Đã phân bổ tự động thành công ${res.assignedCount} Lead cho ${selectedSalesIds.length} nhân viên Sales!`);
            onClose();
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Phân bổ tự động thất bại");
        } finally {
            setAssigning(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle className="flex items-center justify-between border-b border-(--crm-border) px-6 py-4">
                <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-(--crm-info-soft) text-(--crm-primary)">
                        <SlidersHorizontal size={20} />
                    </div>
                    <div>
                        <h2 className="text-base font-semibold text-(--crm-heading)">Phân bổ Lead tự động</h2>
                        <p className="text-xs text-(--crm-text-secondary)">Thiết lập quy tắc gán Lead cho Sales theo Round-Robin hoặc Cân bằng tải</p>
                    </div>
                </div>
                <button
                    type="button"
                    onClick={onClose}
                    className="rounded-lg p-1 text-(--crm-text-muted) hover:bg-(--crm-surface-hover) hover:text-(--crm-text)"
                    aria-label="Đóng"
                >
                    <X size={18} />
                </button>
            </DialogTitle>

            <DialogContent className="space-y-5 px-6 py-5">
                {error && <Alert severity="error">{error}</Alert>}

                {loading ? (
                    <div className="flex min-h-60 items-center justify-center">
                        <CircularProgress size={30} />
                    </div>
                ) : (
                    <>
                        {/* Status Switch */}
                        <div className="flex items-center justify-between rounded-xl border border-(--crm-border) bg-white p-4 shadow-2xs">
                            <div className="space-y-0.5">
                                <div className="flex items-center gap-2">
                                    <Sparkles size={16} className="text-(--crm-primary)" />
                                    <span className="text-sm font-semibold text-(--crm-heading)">Tự động phân bổ Lead mới</span>
                                </div>
                                <p className="text-xs text-(--crm-text-secondary)">
                                    Khi bật, mọi Lead thu thập từ Form Website, Facebook, Zalo, Google Ads hoặc Import sẽ được tự động gán ngay cho nhân viên.
                                </p>
                            </div>
                            <Switch checked={enabled} onChange={(e) => setEnabled(e.target.checked)} color="primary" />
                        </div>

                        {/* Strategy Selection */}
                        <div className="space-y-2">
                            <label className="text-xs font-semibold uppercase tracking-wider text-(--crm-text-secondary)">
                                Thuật toán phân bổ
                            </label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={() => setStrategy("ROUND_ROBIN")}
                                    className={`flex flex-col text-left p-4 rounded-xl border transition ${strategy === "ROUND_ROBIN" ? "border-(--crm-primary) bg-sky-50/50 dark:bg-sky-950/20 shadow-xs" : "border-(--crm-border) bg-white hover:bg-(--crm-surface-hover)"}`}
                                >
                                    <div className="flex items-center justify-between mb-1">
                                        <div className="flex items-center gap-2">
                                            <RotateCw size={16} className="text-(--crm-primary)" />
                                            <span className="text-sm font-semibold text-(--crm-heading)">Xoay vòng đều (Round-Robin)</span>
                                        </div>
                                        {strategy === "ROUND_ROBIN" && <CheckCircle2 size={16} className="text-(--crm-primary)" />}
                                    </div>
                                    <p className="text-xs text-(--crm-text-secondary)">
                                        Lần lượt gán đều theo vòng quay cho từng nhân viên sales trong nhóm (A → B → C → A). Đảm bảo công bằng số lượng lead.
                                    </p>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setStrategy("LOAD_BALANCED")}
                                    className={`flex flex-col text-left p-4 rounded-xl border transition ${strategy === "LOAD_BALANCED" ? "border-(--crm-primary) bg-sky-50/50 dark:bg-sky-950/20 shadow-xs" : "border-(--crm-border) bg-white hover:bg-(--crm-surface-hover)"}`}
                                >
                                    <div className="flex items-center justify-between mb-1">
                                        <div className="flex items-center gap-2">
                                            <Scale size={16} className="text-purple-600" />
                                            <span className="text-sm font-semibold text-(--crm-heading)">Cân bằng tải công việc (Workload)</span>
                                        </div>
                                        {strategy === "LOAD_BALANCED" && <CheckCircle2 size={16} className="text-(--crm-primary)" />}
                                    </div>
                                    <p className="text-xs text-(--crm-text-secondary)">
                                        Ưu tiên gán cho nhân viên Sales đang có ít lead chưa hoàn thành nhất. Tối ưu thời gian phản hồi khách hàng.
                                    </p>
                                </button>
                            </div>
                        </div>

                        {/* Sales Representatives List */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <label className="text-xs font-semibold uppercase tracking-wider text-(--crm-text-secondary)">
                                    Nhân viên Sales nhận Lead ({selectedSalesIds.length}/{availableSales.length})
                                </label>
                                <span className="text-xs text-(--crm-text-muted)">Bỏ chọn để tạm ngừng nhận lead khi nhân viên bận</span>
                            </div>

                            <div className="divide-y divide-(--crm-border-subtle) rounded-xl border border-(--crm-border) bg-white overflow-hidden">
                                {availableSales.map((sales) => {
                                    const isSelected = selectedSalesIds.includes(sales.id);
                                    const meta = SALES_REPRESENTATIVES[sales.id];
                                    return (
                                        <div
                                            key={sales.id}
                                            onClick={() => handleToggleSales(sales.id)}
                                            className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-(--crm-surface-hover) transition"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold ${meta?.avatarColor || "bg-slate-100 text-slate-700"}`}>
                                                    {sales.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-(--crm-heading)">{sales.name}</p>
                                                    <p className="text-xs text-(--crm-text-secondary)">{sales.email} · {sales.role}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${isSelected ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                                                    {isSelected ? "Đang nhận lead" : "Tạm dừng"}
                                                </span>
                                                <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    onChange={() => {}}
                                                    className="h-4 w-4 rounded border-gray-300 text-(--crm-primary) focus:ring-(--crm-primary)"
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Batch Auto-Assign Action */}
                        <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-4 dark:border-amber-900 dark:bg-amber-950/20">
                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <div>
                                    <div className="flex items-center gap-1.5 font-semibold text-amber-900 dark:text-amber-300 text-sm">
                                        <Zap size={16} />
                                        <span>Phân bổ các Lead đang chờ phụ trách</span>
                                    </div>
                                    <p className="mt-1 text-xs text-amber-800 dark:text-amber-400">
                                        {unassignedCount > 0
                                            ? `Hiện tại có ${unassignedCount} Lead đang ở trạng thái 'Chưa phân công'. Bạn có thể chia đều ngay cho nhóm Sales.`
                                            : "Tất cả các Lead hiện tại đều đã được phân công người phụ trách."}
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    disabled={assigning || unassignedCount === 0}
                                    onClick={() => void handleAutoAssignNow()}
                                    className="inline-flex items-center gap-1.5 rounded-lg bg-amber-600 px-4 py-2 text-xs font-semibold text-white hover:bg-amber-700 disabled:opacity-50 shadow-xs"
                                >
                                    {assigning ? <CircularProgress size={14} color="inherit" /> : <Zap size={14} />}
                                    <span>{assigning ? "Đang phân bổ..." : `⚡ Phân bổ ngay ${unassignedCount} Lead`}</span>
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </DialogContent>

            <DialogActions className="border-t border-(--crm-border) px-6 py-3">
                <button
                    type="button"
                    onClick={onClose}
                    disabled={saving || assigning}
                    className="rounded-lg border border-(--crm-border) px-4 py-2 text-xs font-semibold text-(--crm-text) hover:bg-(--crm-surface-hover) disabled:opacity-50"
                >
                    Đóng
                </button>
                <button
                    type="button"
                    onClick={() => void handleSaveRules()}
                    disabled={saving || assigning || loading}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-(--crm-primary) px-4 py-2 text-xs font-semibold text-white hover:opacity-90 disabled:opacity-50 shadow-xs"
                >
                    {saving ? <CircularProgress size={14} color="inherit" /> : <Check size={14} />}
                    <span>{saving ? "Đang lưu..." : "Lưu cấu hình phân bổ"}</span>
                </button>
            </DialogActions>
        </Dialog>
    );
}
