interface StatusChipProps { status: string }

const statusConfig: Record<string, { label: string; variant: string }> = {
    NEW: { label: "Mới", variant: "new" },
    CONTACTED: { label: "Đã liên hệ", variant: "contacted" },
    QUALIFIED: { label: "Đủ điều kiện", variant: "qualified" },
    CONVERTED: { label: "Đã chuyển đổi", variant: "won" },
    LOST: { label: "Thất bại", variant: "lost" },
    ACTIVE: { label: "Đang hoạt động", variant: "active" },
    INACTIVE: { label: "Ngừng hoạt động", variant: "inactive" },
};

export default function StatusChip({ status }: StatusChipProps) {
    const config = statusConfig[status] ?? { label: status, variant: "inactive" };
    return <span className={`crm-status crm-status--${config.variant}`}>{config.label}</span>;
}
