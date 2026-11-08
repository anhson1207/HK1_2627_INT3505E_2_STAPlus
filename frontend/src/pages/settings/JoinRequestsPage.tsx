import { useState, useEffect } from "react";
import {
    UserCheck,
    Check,
    X,
    Clock,
    AlertCircle,
    Search,
} from "lucide-react";
import {
    Button,
    CircularProgress,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    MenuItem,
} from "@mui/material";
import { joinRequestService } from "../../services/joinRequestService";
import type {
    JoinRequest,
    JoinRequestStatus,
    ApproveJoinRequestData,
    RejectJoinRequestData,
} from "../../types/auth";

export default function JoinRequestsPage() {
    const [loading, setLoading] = useState(true);
    const [requests, setRequests] = useState<JoinRequest[]>([]);
    const [selectedStatus, setSelectedStatus] = useState<JoinRequestStatus | "ALL">("PENDING");
    const [searchQuery, setSearchQuery] = useState("");
    const [error, setError] = useState<string | null>(null);

    // Approve Dialog State
    const [approveModalItem, setApproveModalItem] = useState<JoinRequest | null>(null);
    const [isApproving, setIsApproving] = useState(false);
    const [approveForm, setApproveForm] = useState<ApproveJoinRequestData>({
        role: "SALES",
        department: "Kinh doanh",
    });

    // Reject Dialog State
    const [rejectModalItem, setRejectModalItem] = useState<JoinRequest | null>(null);
    const [isRejecting, setIsRejecting] = useState(false);
    const [rejectForm, setRejectForm] = useState<RejectJoinRequestData>({
        reason: "",
    });

    const loadData = async () => {
        setLoading(true);
        setError(null);
        try {
            const list = await joinRequestService.listJoinRequests(
                selectedStatus === "ALL" ? undefined : selectedStatus
            );
            setRequests(list);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Không thể tải danh sách yêu cầu.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void loadData();
    }, [selectedStatus]);

    const handleConfirmApprove = async () => {
        if (!approveModalItem) return;
        setIsApproving(true);
        try {
            await joinRequestService.approveJoinRequest(approveModalItem.id, approveForm);
            setApproveModalItem(null);
            await loadData();
        } catch (err: unknown) {
            alert(err instanceof Error ? err.message : "Phê duyệt thất bại.");
        } finally {
            setIsApproving(false);
        }
    };

    const handleConfirmReject = async () => {
        if (!rejectModalItem) return;
        if (!rejectForm.reason.trim()) {
            alert("Vui lòng nhập lý do từ chối.");
            return;
        }
        setIsRejecting(true);
        try {
            await joinRequestService.rejectJoinRequest(rejectModalItem.id, rejectForm);
            setRejectModalItem(null);
            setRejectForm({ reason: "" });
            await loadData();
        } catch (err: unknown) {
            alert(err instanceof Error ? err.message : "Từ chối thất bại.");
        } finally {
            setIsRejecting(false);
        }
    };

    const filtered = requests.filter((r) => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
            r.userName.toLowerCase().includes(q) ||
            r.userEmail.toLowerCase().includes(q) ||
            (r.invitationCode && r.invitationCode.toLowerCase().includes(q))
        );
    });

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="rounded-2xl border border-(--crm-border) bg-(--crm-surface) p-5 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h2 className="text-base font-bold text-(--crm-heading)">
                        Phê duyệt Yêu cầu tham gia Doanh nghiệp
                    </h2>
                    <p className="mt-0.5 text-xs text-(--crm-text-secondary)">
                        Xem xét nhân viên đăng ký qua mã mời và chỉ định vai trò (Kinh doanh / Chăm sóc khách hàng).
                    </p>
                </div>
            </div>

            {/* Filter Tabs & Search */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="inline-flex rounded-xl bg-(--crm-surface-subtle) p-1 border border-(--crm-border)">
                    {(
                        [
                            { key: "PENDING", label: "Chờ phê duyệt" },
                            { key: "ALL", label: "Tất cả" },
                            { key: "APPROVED", label: "Đã duyệt" },
                            { key: "REJECTED", label: "Đã từ chối" },
                        ] as const
                    ).map((tab) => (
                        <button
                            key={tab.key}
                            type="button"
                            onClick={() => setSelectedStatus(tab.key)}
                            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                                selectedStatus === tab.key
                                    ? "bg-(--crm-surface) text-(--crm-heading) shadow-xs"
                                    : "text-(--crm-text-secondary) hover:text-(--crm-text)"
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div className="w-full sm:w-64">
                    <TextField
                        size="small"
                        fullWidth
                        placeholder="Tìm tên, email, mã mời..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        slotProps={{
                            input: {
                                startAdornment: <Search size={16} className="text-(--crm-text-secondary) mr-2" />,
                            },
                        }}
                    />
                </div>
            </div>

            {error && (
                <div className="flex items-center gap-2 rounded-xl bg-rose-500/10 border border-rose-500/20 p-3 text-xs text-rose-700 dark:text-rose-400">
                    <AlertCircle size={16} />
                    <span>{error}</span>
                </div>
            )}

            {/* Table */}
            <div className="overflow-hidden rounded-2xl border border-(--crm-border) bg-(--crm-surface) shadow-xs">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-12">
                        <CircularProgress size={32} />
                        <p className="mt-3 text-xs text-(--crm-text-secondary)">Đang tải danh sách yêu cầu...</p>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                        <UserCheck size={40} className="text-(--crm-text-secondary) opacity-40 mb-3" />
                        <h4 className="text-sm font-semibold text-(--crm-heading)">Không có yêu cầu nào</h4>
                        <p className="mt-1 text-xs text-(--crm-text-secondary) max-w-sm">
                            {selectedStatus === "PENDING"
                                ? "Hiện tại không có nhân viên nào đang đợi phê duyệt."
                                : "Không tìm thấy yêu cầu phù hợp với bộ lọc."}
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="border-b border-(--crm-border) bg-(--crm-surface-subtle) font-semibold text-(--crm-text-secondary)">
                                <tr>
                                    <th className="py-3.5 px-4">Nhân viên ứng tuyển</th>
                                    <th className="py-3.5 px-4">Mã mời sử dụng</th>
                                    <th className="py-3.5 px-4">Thời gian gửi</th>
                                    <th className="py-3.5 px-4">Trạng thái</th>
                                    <th className="py-3.5 px-4">Chi tiết duyệt</th>
                                    <th className="py-3.5 px-4 text-right">Hành động</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-(--crm-border)">
                                {filtered.map((item) => (
                                    <tr key={item.id} className="hover:bg-(--crm-surface-subtle)/50 transition-colors">
                                        <td className="py-3 px-4">
                                            <p className="font-semibold text-sm text-(--crm-heading)">
                                                {item.userName}
                                            </p>
                                            <p className="font-mono text-[11px] text-(--crm-text-secondary)">
                                                {item.userEmail}
                                            </p>
                                        </td>

                                        <td className="py-3 px-4">
                                            <span className="font-mono font-medium text-xs text-(--crm-primary) bg-(--crm-primary)/10 px-2 py-0.5 rounded-md">
                                                {item.invitationCode || "Mặc định"}
                                            </span>
                                        </td>

                                        <td className="py-3 px-4 text-(--crm-text-secondary)">
                                            {item.requestedAt ? new Date(item.requestedAt).toLocaleString("vi-VN") : "—"}
                                        </td>

                                        <td className="py-3 px-4">
                                            {item.status === "PENDING" && (
                                                <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/10 px-2 py-0.5 text-[11px] font-semibold text-amber-700 dark:text-amber-400 border border-amber-500/20">
                                                    <Clock size={12} />
                                                    Chờ duyệt
                                                </span>
                                            )}
                                            {item.status === "APPROVED" && (
                                                <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                                                    <Check size={12} />
                                                    Đã duyệt
                                                </span>
                                            )}
                                            {item.status === "REJECTED" && (
                                                <span className="inline-flex items-center gap-1 rounded-md bg-rose-500/10 px-2 py-0.5 text-[11px] font-semibold text-rose-700 dark:text-rose-400 border border-rose-500/20">
                                                    <X size={12} />
                                                    Đã từ chối
                                                </span>
                                            )}
                                        </td>

                                        <td className="py-3 px-4">
                                            {item.status === "APPROVED" && (
                                                <div className="space-y-0.5">
                                                    <p className="font-semibold text-emerald-700 dark:text-emerald-400">
                                                        Vai trò: {item.assignedRole === "SALES" ? "Kinh doanh (SALES)" : item.assignedRole === "SUPPORT" ? "Hỗ trợ (SUPPORT)" : item.assignedRole}
                                                    </p>
                                                    <p className="text-[11px] text-(--crm-text-secondary)">
                                                        Bởi: {item.reviewerName || "Admin"}
                                                    </p>
                                                </div>
                                            )}
                                            {item.status === "REJECTED" && (
                                                <div className="space-y-0.5">
                                                    <p className="text-rose-700 dark:text-rose-400 text-xs truncate max-w-xs" title={item.rejectionReason || ""}>
                                                        Lý do: {item.rejectionReason || "Không đạt yêu cầu"}
                                                    </p>
                                                    <p className="text-[11px] text-(--crm-text-secondary)">
                                                        Bởi: {item.reviewerName || "Admin"}
                                                    </p>
                                                </div>
                                            )}
                                            {item.status === "PENDING" && (
                                                <span className="text-(--crm-text-secondary) italic">Chưa xem xét</span>
                                            )}
                                        </td>

                                        <td className="py-3 px-4 text-right">
                                            {item.status === "PENDING" ? (
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button
                                                        size="small"
                                                        variant="contained"
                                                        color="primary"
                                                        onClick={() => {
                                                            setApproveModalItem(item);
                                                            setApproveForm({ role: "SALES", department: "Kinh doanh" });
                                                        }}
                                                        startIcon={<Check size={14} />}
                                                        sx={{ fontSize: "11px", py: 0.5, px: 1.5 }}
                                                    >
                                                        Phê duyệt
                                                    </Button>
                                                    <Button
                                                        size="small"
                                                        variant="outlined"
                                                        color="error"
                                                        onClick={() => {
                                                            setRejectModalItem(item);
                                                            setRejectForm({ reason: "" });
                                                        }}
                                                        startIcon={<X size={14} />}
                                                        sx={{ fontSize: "11px", py: 0.5, px: 1.5 }}
                                                    >
                                                        Từ chối
                                                    </Button>
                                                </div>
                                            ) : (
                                                <span className="text-(--crm-text-secondary) text-[11px]">Đã xử lý</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* APPROVE DIALOG */}
            <Dialog
                open={Boolean(approveModalItem)}
                onClose={() => !isApproving && setApproveModalItem(null)}
                maxWidth="xs"
                fullWidth
            >
                <DialogTitle sx={{ fontWeight: "bold", fontSize: "1rem" }}>
                    Phê duyệt nhân viên vào hệ thống
                </DialogTitle>
                <DialogContent dividers sx={{ display: "flex", flexDirection: "column", gap: 2.5, pt: 2 }}>
                    <div className="rounded-xl bg-slate-50 p-3 text-xs text-slate-700 space-y-1 border border-slate-200">
                        <p><strong>Ứng viên:</strong> {approveModalItem?.userName}</p>
                        <p><strong>Email:</strong> {approveModalItem?.userEmail}</p>
                    </div>

                    <TextField
                        select
                        label="Phân vai trò tài khoản *"
                        size="small"
                        fullWidth
                        value={approveForm.role}
                        onChange={(e) => {
                            const val = e.target.value as "SALES" | "SUPPORT";
                            setApproveForm((prev) => ({
                                ...prev,
                                role: val,
                                department: val === "SALES" ? "Kinh doanh" : "Chăm sóc khách hàng",
                            }));
                        }}
                    >
                        <MenuItem value="SALES">Nhân viên Kinh doanh (SALES)</MenuItem>
                        <MenuItem value="SUPPORT">Nhân viên Hỗ trợ khách hàng (SUPPORT)</MenuItem>
                    </TextField>

                    <TextField
                        label="Phòng ban / Đơn vị phụ trách"
                        size="small"
                        fullWidth
                        value={approveForm.department ?? ""}
                        onChange={(e) => setApproveForm((prev) => ({ ...prev, department: e.target.value }))}
                        placeholder="Ví dụ: Phòng Kinh doanh 1"
                    />
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setApproveModalItem(null)} disabled={isApproving} color="inherit">
                        Hủy
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleConfirmApprove}
                        disabled={isApproving}
                        startIcon={isApproving ? <CircularProgress size={16} color="inherit" /> : <Check size={16} />}
                    >
                        {isApproving ? "Đang phê duyệt..." : "Xác nhận duyệt"}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* REJECT DIALOG */}
            <Dialog
                open={Boolean(rejectModalItem)}
                onClose={() => !isRejecting && setRejectModalItem(null)}
                maxWidth="xs"
                fullWidth
            >
                <DialogTitle sx={{ fontWeight: "bold", fontSize: "1rem", color: "var(--crm-danger, #e11d48)" }}>
                    Từ chối yêu cầu tham gia
                </DialogTitle>
                <DialogContent dividers sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 2 }}>
                    <p className="text-xs text-(--crm-text-secondary)">
                        Tài khoản của <strong>{rejectModalItem?.userName}</strong> ({rejectModalItem?.userEmail}) sẽ bị đánh dấu là ĐÃ TỪ CHỐI và không thể truy cập vào hệ thống CRM.
                    </p>

                    <TextField
                        label="Lý do từ chối *"
                        size="small"
                        fullWidth
                        multiline
                        rows={3}
                        value={rejectForm.reason}
                        onChange={(e) => setRejectForm({ reason: e.target.value })}
                        placeholder="Nhập lý do cụ thể (vd: Không thuộc danh sách nhân sự chính thức, mã mời không hợp lệ...)"
                    />
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setRejectModalItem(null)} disabled={isRejecting} color="inherit">
                        Hủy
                    </Button>
                    <Button
                        variant="contained"
                        color="error"
                        onClick={handleConfirmReject}
                        disabled={isRejecting || !rejectForm.reason.trim()}
                        startIcon={isRejecting ? <CircularProgress size={16} color="inherit" /> : <X size={16} />}
                    >
                        {isRejecting ? "Đang xử lý..." : "Xác nhận từ chối"}
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}
