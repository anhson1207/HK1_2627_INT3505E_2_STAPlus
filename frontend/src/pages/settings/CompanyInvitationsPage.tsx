import { useState, useEffect } from "react";
import {
    Ticket,
    Plus,
    Copy,
    Check,
    Ban,
    AlertCircle,
    Share2,
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
import { invitationService } from "../../services/invitationService";
import type { CompanyInvitation, CompanyInvitationRequest } from "../../types/auth";

export default function CompanyInvitationsPage() {
    const [loading, setLoading] = useState(true);
    const [invitations, setInvitations] = useState<CompanyInvitation[]>([]);
    const [error, setError] = useState<string | null>(null);

    // Modal state
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [createForm, setCreateForm] = useState<CompanyInvitationRequest>({
        expiresInDays: 30,
        maxUses: undefined,
        notes: "",
    });

    // Copied feedback
    const [copiedCode, setCopiedCode] = useState<string | null>(null);

    // Revoke state
    const [revokingId, setRevokingId] = useState<number | null>(null);

    const loadData = async () => {
        setLoading(true);
        setError(null);
        try {
            const list = await invitationService.listInvitations();
            setInvitations(list);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Không thể tải danh sách mã mời.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void loadData();
    }, []);

    const handleCreate = async () => {
        setIsCreating(true);
        try {
            await invitationService.createInvitation(createForm);
            setIsCreateOpen(false);
            setCreateForm({ expiresInDays: 30, maxUses: undefined, notes: "" });
            await loadData();
        } catch (err: unknown) {
            alert(err instanceof Error ? err.message : "Tạo mã mời thất bại.");
        } finally {
            setIsCreating(false);
        }
    };

    const handleRevoke = async (id: number) => {
        if (!window.confirm("Bạn có chắc chắn muốn thu hồi mã mời này? Nhân viên sẽ không thể dùng mã này để tham gia nữa.")) {
            return;
        }

        setRevokingId(id);
        try {
            await invitationService.revokeInvitation(id);
            await loadData();
        } catch (err: unknown) {
            alert(err instanceof Error ? err.message : "Thu hồi mã thất bại.");
        } finally {
            setRevokingId(null);
        }
    };

    const copyToClipboard = (text: string, code: string) => {
        navigator.clipboard.writeText(text);
        setCopiedCode(code);
        setTimeout(() => setCopiedCode(null), 2500);
    };

    const activeCount = invitations.filter((i) => i.usable).length;
    const totalUses = invitations.reduce((acc, curr) => acc + (curr.useCount || 0), 0);

    return (
        <div className="space-y-6">
            {/* Top Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="rounded-2xl border border-(--crm-border) bg-(--crm-surface) p-4 shadow-xs">
                    <p className="text-xs text-(--crm-text-secondary)">Mã mời đang hiệu lực</p>
                    <p className="mt-1 text-2xl font-bold text-teal-600">{activeCount}</p>
                    <p className="mt-0.5 text-[11px] text-(--crm-text-secondary)">Sẵn sàng cho nhân viên mới</p>
                </div>
                <div className="rounded-2xl border border-(--crm-border) bg-(--crm-surface) p-4 shadow-xs">
                    <p className="text-xs text-(--crm-text-secondary)">Lượt nhân viên đã đăng ký</p>
                    <p className="mt-1 text-2xl font-bold text-sky-600">{totalUses}</p>
                    <p className="mt-0.5 text-[11px] text-(--crm-text-secondary)">Qua các link & mã mời</p>
                </div>
                <div className="rounded-2xl border border-(--crm-border) bg-(--crm-surface) p-4 shadow-xs">
                    <p className="text-xs text-(--crm-text-secondary)">Tổng số mã đã tạo</p>
                    <p className="mt-1 text-2xl font-bold text-(--crm-heading)">{invitations.length}</p>
                    <p className="mt-0.5 text-[11px] text-(--crm-text-secondary)">Bao gồm đã thu hồi / hết hạn</p>
                </div>
            </div>

            {/* Header with Action */}
            <div className="rounded-2xl border border-(--crm-border) bg-(--crm-surface) p-5 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h2 className="text-base font-bold text-(--crm-heading)">
                        Mã mời tham gia Doanh nghiệp
                    </h2>
                    <p className="mt-0.5 text-xs text-(--crm-text-secondary)">
                        Tạo và chia sẻ link đăng ký để nhân viên (Sales, Support) tham gia không gian làm việc này.
                    </p>
                </div>
                <Button
                    variant="contained"
                    size="medium"
                    onClick={() => setIsCreateOpen(true)}
                    startIcon={<Plus size={16} />}
                >
                    Tạo mã mời mới
                </Button>
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
                        <p className="mt-3 text-xs text-(--crm-text-secondary)">Đang tải danh sách mã mời...</p>
                    </div>
                ) : invitations.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                        <Ticket size={40} className="text-(--crm-text-secondary) opacity-40 mb-3" />
                        <h4 className="text-sm font-semibold text-(--crm-heading)">Chưa có mã mời nào</h4>
                        <p className="mt-1 text-xs text-(--crm-text-secondary) max-w-sm">
                            Bấm nút "Tạo mã mời mới" phía trên để tạo link mời nhân viên đầu tiên tham gia công ty.
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="border-b border-(--crm-border) bg-(--crm-surface-subtle) font-semibold text-(--crm-text-secondary)">
                                <tr>
                                    <th className="py-3.5 px-4">Mã mời</th>
                                    <th className="py-3.5 px-4">Trạng thái</th>
                                    <th className="py-3.5 px-4">Đã dùng / Giới hạn</th>
                                    <th className="py-3.5 px-4">Hạn sử dụng</th>
                                    <th className="py-3.5 px-4">Người tạo & Ghi chú</th>
                                    <th className="py-3.5 px-4 text-right">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-(--crm-border)">
                                {invitations.map((item) => {
                                    const joinLink = `${window.location.origin}/join?code=${item.code}`;
                                    const isUsable = item.usable;

                                    return (
                                        <tr key={item.id} className="hover:bg-(--crm-surface-subtle)/50 transition-colors">
                                            <td className="py-3 px-4">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-mono font-bold text-sm text-(--crm-primary)">
                                                        {item.code}
                                                    </span>
                                                    <button
                                                        type="button"
                                                        onClick={() => copyToClipboard(item.code, item.code)}
                                                        title="Sao chép mã"
                                                        className="text-(--crm-text-secondary) hover:text-(--crm-text) p-1 rounded-md"
                                                    >
                                                        {copiedCode === item.code ? (
                                                            <Check size={14} className="text-emerald-500" />
                                                        ) : (
                                                            <Copy size={14} />
                                                        )}
                                                    </button>
                                                </div>
                                            </td>

                                            <td className="py-3 px-4">
                                                {item.status === "REVOKED" ? (
                                                    <span className="inline-flex items-center rounded-md bg-rose-500/10 px-2 py-0.5 text-[11px] font-semibold text-rose-700 dark:text-rose-400 border border-rose-500/20">
                                                        Đã thu hồi
                                                    </span>
                                                ) : !isUsable ? (
                                                    <span className="inline-flex items-center rounded-md bg-slate-500/10 px-2 py-0.5 text-[11px] font-semibold text-slate-600 dark:text-slate-400 border border-slate-500/20">
                                                        Hết hạn
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center rounded-md bg-emerald-500/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                                                        Đang hoạt động
                                                    </span>
                                                )}
                                            </td>

                                            <td className="py-3 px-4">
                                                <span className="font-semibold text-(--crm-text)">
                                                    {item.useCount}
                                                </span>
                                                <span className="text-(--crm-text-secondary)">
                                                    {item.maxUses ? ` / ${item.maxUses} lượt` : " (Không giới hạn)"}
                                                </span>
                                            </td>

                                            <td className="py-3 px-4 text-(--crm-text-secondary)">
                                                {item.expiresAt ? (
                                                    <span>{new Date(item.expiresAt).toLocaleDateString("vi-VN")}</span>
                                                ) : (
                                                    <span className="text-emerald-600 font-medium">Vô thời hạn</span>
                                                )}
                                            </td>

                                            <td className="py-3 px-4">
                                                <p className="font-medium text-(--crm-text)">
                                                    {item.createdByName || "Quản trị viên"}
                                                </p>
                                                {item.notes && (
                                                    <p className="text-[11px] text-(--crm-text-secondary) truncate max-w-xs">
                                                        {item.notes}
                                                    </p>
                                                )}
                                            </td>

                                            <td className="py-3 px-4 text-right">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    <Button
                                                        size="small"
                                                        variant="outlined"
                                                        disabled={!isUsable}
                                                        onClick={() => copyToClipboard(joinLink, `link-${item.id}`)}
                                                        startIcon={copiedCode === `link-${item.id}` ? <Check size={14} className="text-emerald-500" /> : <Share2 size={14} />}
                                                        sx={{ fontSize: "11px", py: 0.5, px: 1.5 }}
                                                    >
                                                        {copiedCode === `link-${item.id}` ? "Đã chép link!" : "Sao chép link"}
                                                    </Button>

                                                    {isUsable && (
                                                        <Button
                                                            size="small"
                                                            variant="text"
                                                            color="error"
                                                            disabled={revokingId === item.id}
                                                            onClick={() => void handleRevoke(item.id)}
                                                            startIcon={revokingId === item.id ? <CircularProgress size={12} color="inherit" /> : <Ban size={14} />}
                                                            sx={{ fontSize: "11px", py: 0.5, px: 1 }}
                                                        >
                                                            Thu hồi
                                                        </Button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* CREATE INVITATION DIALOG */}
            <Dialog
                open={isCreateOpen}
                onClose={() => !isCreating && setIsCreateOpen(false)}
                maxWidth="xs"
                fullWidth
            >
                <DialogTitle sx={{ fontWeight: "bold", fontSize: "1rem" }}>
                    Tạo mã mời nhân viên mới
                </DialogTitle>
                <DialogContent dividers sx={{ display: "flex", flexDirection: "column", gap: 2.5, pt: 2 }}>
                    <TextField
                        select
                        label="Thời hạn hiệu lực"
                        size="small"
                        fullWidth
                        value={createForm.expiresInDays ?? 0}
                        onChange={(e) => {
                            const val = Number(e.target.value);
                            setCreateForm((prev) => ({
                                ...prev,
                                expiresInDays: val > 0 ? val : undefined,
                            }));
                        }}
                    >
                        <MenuItem value={7}>7 ngày</MenuItem>
                        <MenuItem value={30}>30 ngày (Khuyến nghị)</MenuItem>
                        <MenuItem value={90}>90 ngày</MenuItem>
                        <MenuItem value={0}>Không bao giờ hết hạn</MenuItem>
                    </TextField>

                    <TextField
                        label="Giới hạn lượt đăng ký"
                        size="small"
                        type="number"
                        placeholder="Để trống = Không giới hạn"
                        fullWidth
                        value={createForm.maxUses ?? ""}
                        onChange={(e) => {
                            const val = e.target.value ? parseInt(e.target.value, 10) : undefined;
                            setCreateForm((prev) => ({ ...prev, maxUses: val && val > 0 ? val : undefined }));
                        }}
                        helperText="Số lượng nhân viên tối đa có thể đăng ký bằng mã này"
                    />

                    <TextField
                        label="Ghi chú / Mục đích sử dụng"
                        size="small"
                        placeholder="Ví dụ: Đợt tuyển dụng Sales Q4/2026"
                        fullWidth
                        multiline
                        rows={2}
                        value={createForm.notes ?? ""}
                        onChange={(e) => setCreateForm((prev) => ({ ...prev, notes: e.target.value }))}
                    />
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button
                        onClick={() => setIsCreateOpen(false)}
                        disabled={isCreating}
                        color="inherit"
                    >
                        Hủy
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleCreate}
                        disabled={isCreating}
                        startIcon={isCreating ? <CircularProgress size={16} color="inherit" /> : <Plus size={16} />}
                    >
                        {isCreating ? "Đang tạo..." : "Tạo mã mời"}
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}
