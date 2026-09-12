import { Chip } from "@mui/material";

interface StatusChipProps {
    status: string;
}

const statusConfig: Record<
    string,
    {
        label: string;
        color: "default" | "primary" | "success" | "warning" | "error";
    }
> = {
    NEW: {
        label: "Mới",
        color: "primary",
    },
    CONTACTED: {
        label: "Đã liên hệ",
        color: "warning",
    },
    QUALIFIED: {
        label: "Đủ điều kiện",
        color: "success",
    },
    CONVERTED: {
        label: "Đã chuyển đổi",
        color: "success",
    },
    LOST: {
        label: "Thất bại",
        color: "error",
    },
};

export default function StatusChip({ status }: StatusChipProps) {
    const config = statusConfig[status] ?? {
        label: status,
        color: "default" as const,
    };

    return (
        <Chip
            label={config.label}
            color={config.color}
            size="small"
            variant="outlined"
        />
    );
}
