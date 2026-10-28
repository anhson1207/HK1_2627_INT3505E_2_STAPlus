import {
    Alert,
    Button,
    CircularProgress,
    Chip,
} from "@mui/material";
import {
    ArrowLeft,
    CalendarDays,
    Check,
    FileText,
    Pencil,
    Send,
    Trash2,
    UserRound,
    Users,
    X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import ConfirmDialog from "../../components/common/ConfirmDialog";
import DealStageBadge from "../../components/deals/DealStageBadge";
import { useAuthStore } from "../../stores/authStore";
import {
    dealService,
    getDealErrorMessage,
} from "../../services/dealService";
import type { Deal } from "../../types/deal";
import { formatVND } from "../../utils/currency";

const dateFormatter = new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "long",
});

const dateTimeFormatter = new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "long",
    timeStyle: "short",
});

const approvalLabels: Record<string, string> = {
    NOT_REQUIRED: "Không cần phê duyệt",
    PENDING: "Chờ phê duyệt",
    APPROVED: "Đã phê duyệt",
    REJECTED: "Bị từ chối",
};

const approvalColors: Record<
    string,
    "default" | "warning" | "success" | "error"
> = {
    NOT_REQUIRED: "default",
    PENDING: "warning",
    APPROVED: "success",
    REJECTED: "error",
};

export default function DealDetailPage() {
    const navigate = useNavigate();
    const { id } = useParams();

    const dealId = Number(id);
    const user = useAuthStore((state) => state.user);

    const [deal, setDeal] = useState<Deal | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [actionLoading, setActionLoading] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        let active = true;

        const loadDeal = async () => {
            if (!Number.isInteger(dealId) || dealId <= 0) {
                setError("Mã Deal không hợp lệ.");
                setLoading(false);
                return;
            }

            try {
                const data = await dealService.getDealById(dealId);

                if (active) {
                    setDeal(data);
                    setError("");
                }
            } catch (loadError) {
                if (active) {
                    setError(getDealErrorMessage(loadError));
                }
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        };

        void loadDeal();

        return () => {
            active = false;
        };
    }, [dealId]);

    const handleRequestApproval = async () => {
        setError("");
        setActionLoading(true);

        try {
            const updated = await dealService.requestDiscountApproval(dealId);
            setDeal(updated);
        } catch (actionError) {
            setError(getDealErrorMessage(actionError));
        } finally {
            setActionLoading(false);
        }
    };

    const handleApprove = async () => {
        setError("");
        setActionLoading(true);

        try {
            const updated = await dealService.approveDiscount(dealId);
            setDeal(updated);
        } catch (actionError) {
            setError(getDealErrorMessage(actionError));
        } finally {
            setActionLoading(false);
        }
    };

    const handleReject = async () => {
        const reason = window.prompt("Nhập lý do từ chối giảm giá:");

        if (reason === null) {
            return;
        }

        if (!reason.trim()) {
            setError("Vui lòng nhập lý do từ chối.");
            return;
        }

        setError("");
        setActionLoading(true);

        try {
            const updated = await dealService.rejectDiscount(
                dealId,
                reason,
            );

            setDeal(updated);
        } catch (actionError) {
            setError(getDealErrorMessage(actionError));
        } finally {
            setActionLoading(false);
        }
    };

    const handleDelete = async () => {
        setDeleting(true);

        try {
            await dealService.deleteDeal(dealId);
            navigate("/deals", { replace: true });
        } catch (deleteError) {
            setError(getDealErrorMessage(deleteError));
            setConfirmDelete(false);
        } finally {
            setDeleting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-72 items-center justify-center">
                <CircularProgress />
            </div>
        );
    }

    if (error && !deal) {
        return (
            <Alert
                severity="error"
                action={
                    <button
                        type="button"
                        className="font-medium"
                        onClick={() => navigate("/deals")}
                    >
                        Về danh sách
                    </button>
                }
            >
                {error}
            </Alert>
        );
    }

    if (!deal) {
        return (
            <Alert severity="error">
                Không tìm thấy Deal.
            </Alert>
        );
    }

    const weightedValue = deal.value * deal.probability / 100;
    const discountPercent = deal.discountPercent ?? 0;
    const discountedValue = deal.value * (1 - discountPercent / 100);
    const approvalStatus = deal.approvalStatus ?? "NOT_REQUIRED";

    const isSales = user?.role === "SALES";
    const isApprover =
        user?.role === "ADMIN" || user?.role === "MANAGER";

    const canRequestApproval =
        (isSales || user?.role === "ADMIN") &&
        discountPercent > 0 &&
        approvalStatus !== "PENDING" &&
        approvalStatus !== "APPROVED";

    const canReview =
        isApprover && approvalStatus === "PENDING";

    const details = [
        {
            label: "Khách hàng",
            value: deal.customerName,
            icon: Users,
            action: () => navigate(`/customers/${deal.customerId}`),
        },
        {
            label: "Ngày dự kiến đóng",
            value: dateFormatter.format(
                new Date(`${deal.expectedCloseDate}T00:00:00`),
            ),
            icon: CalendarDays,
        },
        {
            label: "Người phụ trách",
            value: deal.ownerName || "—",
            icon: UserRound,
        },
        {
            label: "Ngày tạo",
            value: dateTimeFormatter.format(new Date(deal.createdAt)),
            icon: CalendarDays,
        },
    ];

    return (
        <div className="max-w-5xl">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
                <button
                    type="button"
                    onClick={() => navigate("/deals")}
                    className="flex items-center gap-2 text-sm text-(--crm-text-secondary) hover:text-(--crm-heading)"
                >
                    <ArrowLeft size={17} />
                    Quay lại
                </button>

                <div className="flex flex-wrap gap-2">
                    <button
                        type="button"
                        onClick={() => navigate(`/deals/${dealId}/edit`)}
                        className="crm-btn crm-btn--secondary"
                    >
                        <Pencil size={16} />
                        Chỉnh sửa
                    </button>

                    <button
                        type="button"
                        onClick={() => setConfirmDelete(true)}
                        className="crm-btn crm-btn--secondary crm-danger-action"
                    >
                        <Trash2 size={16} />
                        Xóa
                    </button>
                </div>
            </div>

            {error && (
                <Alert
                    severity="error"
                    onClose={() => setError("")}
                    className="mb-4"
                >
                    {error}
                </Alert>
            )}

            <section className="mb-5 crm-card crm-card__body">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <h1 className="crm-page-title">{deal.name}</h1>
                        <p className="crm-page-description">
                            Deal ID: #{deal.id}
                        </p>
                    </div>

                    <DealStageBadge stage={deal.stage} />
                </div>
            </section>

            <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="crm-card crm-card__body">
                    <p className="crm-property__label">Giá trị Deal</p>
                    <p className="mt-2 text-xl font-semibold text-(--crm-heading)">
                        {formatVND(deal.value)}
                    </p>
                </div>

                <div className="crm-card crm-card__body">
                    <p className="crm-property__label">Xác suất</p>
                    <p className="mt-2 text-xl font-semibold text-(--crm-heading)">
                        {deal.probability}%
                    </p>
                </div>

                <div className="crm-card crm-card__body">
                    <p className="crm-property__label">
                        Giá trị có trọng số
                    </p>
                    <p className="mt-2 text-xl font-semibold text-(--crm-primary)">
                        {formatVND(weightedValue)}
                    </p>
                </div>
            </div>

            <section className="mb-5 crm-detail-card">
                <div className="crm-detail-card__header">
                    <h2 className="font-semibold text-(--crm-heading)">
                        Phê duyệt giảm giá
                    </h2>
                </div>

                <div className="crm-detail-card__body space-y-4">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                            <p className="crm-property__label">
                                Mức giảm giá
                            </p>
                            <p className="crm-property__value mt-1">
                                {discountPercent}%
                            </p>
                        </div>

                        <div>
                            <p className="crm-property__label">
                                Giá trị sau giảm
                            </p>
                            <p className="crm-property__value mt-1">
                                {formatVND(discountedValue)}
                            </p>
                        </div>

                        <div>
                            <p className="crm-property__label">
                                Trạng thái phê duyệt
                            </p>
                            <div className="mt-2">
                                <Chip
                                    size="small"
                                    label={approvalLabels[approvalStatus] ?? approvalStatus}
                                    color={approvalColors[approvalStatus] ?? "default"}
                                />
                            </div>
                        </div>

                        <div>
                            <p className="crm-property__label">
                                Người phê duyệt
                            </p>
                            <p className="crm-property__value mt-1">
                                {deal.discountApprovedBy || "—"}
                            </p>
                        </div>

                        {deal.discountApprovedAt && (
                            <div>
                                <p className="crm-property__label">
                                    Thời điểm xử lý
                                </p>
                                <p className="crm-property__value mt-1">
                                    {dateTimeFormatter.format(
                                        new Date(deal.discountApprovedAt),
                                    )}
                                </p>
                            </div>
                        )}

                        {deal.discountReason && (
                            <div>
                                <p className="crm-property__label">
                                    Lý do giảm giá / từ chối
                                </p>
                                <p className="crm-property__value mt-1">
                                    {deal.discountReason}
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {canRequestApproval && (
                            <Button
                                variant="contained"
                                startIcon={<Send size={16} />}
                                disabled={actionLoading}
                                onClick={() => void handleRequestApproval()}
                            >
                                {actionLoading
                                    ? "Đang xử lý..."
                                    : "Gửi yêu cầu phê duyệt"}
                            </Button>
                        )}

                        {canReview && (
                            <>
                                <Button
                                    variant="contained"
                                    color="success"
                                    startIcon={<Check size={16} />}
                                    disabled={actionLoading}
                                    onClick={() => void handleApprove()}
                                >
                                    Phê duyệt
                                </Button>

                                <Button
                                    variant="outlined"
                                    color="error"
                                    startIcon={<X size={16} />}
                                    disabled={actionLoading}
                                    onClick={() => void handleReject()}
                                >
                                    Từ chối
                                </Button>
                            </>
                        )}

                        {actionLoading && <CircularProgress size={24} />}
                    </div>
                </div>
            </section>

            <section className="crm-detail-card">
                <div className="crm-detail-card__header">
                    <h2 className="font-semibold text-(--crm-heading)">
                        Thông tin Deal
                    </h2>
                </div>

                <div className="crm-property-grid crm-detail-card__body">
                    {details.map(({ label, value, icon: Icon, action }) => (
                        <div key={label} className="flex min-w-0 gap-3">
                            <Icon
                                size={18}
                                className="mt-0.5 text-(--crm-text-muted)"
                            />

                            <div>
                                <p className="crm-property__label">
                                    {label}
                                </p>

                                {action ? (
                                    <button
                                        type="button"
                                        onClick={action}
                                        className="mt-1 text-sm font-medium text-(--crm-primary) hover:underline"
                                    >
                                        {value}
                                    </button>
                                ) : (
                                    <p className="crm-property__value">
                                        {value}
                                    </p>
                                )}
                            </div>
                        </div>
                    ))}

                    <div className="crm-field--full">
                        <div className="flex gap-3">
                            <FileText
                                size={18}
                                className="text-(--crm-text-muted)"
                            />

                            <div>
                                <p className="crm-property__label">
                                    Mô tả
                                </p>
                                <p className="mt-1 whitespace-pre-wrap text-sm text-(--crm-heading)">
                                    {deal.description || "—"}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <ConfirmDialog
                open={confirmDelete}
                title="Xóa Deal?"
                description={`Deal “${deal.name}” sẽ bị xóa vĩnh viễn. Bạn có chắc chắn?`}
                loading={deleting}
                onClose={() => setConfirmDelete(false)}
                onConfirm={() => void handleDelete()}
            />
        </div>
    );
}