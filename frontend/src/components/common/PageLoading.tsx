import { CircularProgress } from "@mui/material";

interface PageLoadingProps { label?: string; minHeight?: number }

export default function PageLoading({ label = "Đang tải dữ liệu...", minHeight = 288 }: PageLoadingProps) {
    return <div className="flex flex-col items-center justify-center gap-3 text-(--crm-text-secondary)" style={{ minHeight }} role="status" aria-live="polite"><CircularProgress size={32} /><span className="text-sm">{label}</span></div>;
}
