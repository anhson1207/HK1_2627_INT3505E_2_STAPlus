import {
    Activity,
    Check,
    Clock,
    Copy,
    Globe,
    Shield,
    Terminal,
    User,
    X,
} from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@mui/material";
import { useState } from "react";
import type { AuditLog } from "../../types/auditLog";

interface AuditLogDetailModalProps {
    log: AuditLog | null;
    open: boolean;
    onClose: () => void;
}

function formatDate(isoString?: string) {
    if (!isoString) return "—";
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return isoString;
    return new Intl.DateTimeFormat("vi-VN", {
        dateStyle: "medium",
        timeStyle: "medium",
    }).format(date);
}

export default function AuditLogDetailModal({ log, open, onClose }: AuditLogDetailModalProps) {
    const [copied, setCopied] = useState(false);

    if (!log) return null;

    let formattedDetails = "";
    if (log.details) {
        try {
            const parsed = JSON.parse(log.details);
            formattedDetails = JSON.stringify(parsed, null, 2);
        } catch {
            formattedDetails = log.details;
        }
    }

    const handleCopyDetails = async () => {
        if (!formattedDetails) return;
        try {
            await navigator.clipboard.writeText(formattedDetails);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error("Failed to copy details:", err);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle className="flex items-center justify-between border-b border-(--crm-border) px-6 py-4">
                <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-(--crm-info-soft) text-(--crm-primary)">
                        <Activity size={20} />
                    </div>
                    <div>
                        <h2 className="text-base font-semibold text-(--crm-heading)">
                            Chi tiết nhật ký hoạt động #{log.id}
                        </h2>
                        <p className="text-xs text-(--crm-text-secondary)">
                            Truy vết hành vi người dùng và dữ liệu hệ thống
                        </p>
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
                {/* Status banner */}
                <div
                    className={`flex items-center justify-between rounded-xl border p-4 ${
                        log.status === "SUCCESS"
                            ? "border-emerald-200 bg-emerald-50/60 dark:border-emerald-900/40 dark:bg-emerald-950/20"
                            : "border-red-200 bg-red-50/60 dark:border-red-900/40 dark:bg-red-950/20"
                    }`}
                >
                    <div className="flex items-center gap-2.5">
                        <span
                            className={`flex h-3 w-3 rounded-full ${
                                log.status === "SUCCESS" ? "bg-emerald-500 ring-4 ring-emerald-100" : "bg-red-500 ring-4 ring-red-100"
                            }`}
                        />
                        <div>
                            <p
                                className={`text-sm font-semibold ${
                                    log.status === "SUCCESS" ? "text-emerald-900 dark:text-emerald-300" : "text-red-900 dark:text-red-300"
                                }`}
                            >
                                Trạng thái: {log.status === "SUCCESS" ? "Thành công (SUCCESS)" : "Thất bại (FAILED)"}
                            </p>
                            <p className="text-xs text-(--crm-text-secondary)">{log.description}</p>
                        </div>
                    </div>
                    <span className="rounded-lg bg-white/80 px-2.5 py-1 text-xs font-semibold uppercase tracking-wider text-(--crm-text) shadow-2xs">
                        {log.action}
                    </span>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-start gap-3 rounded-xl border border-(--crm-border) bg-white p-3.5">
                        <User size={18} className="mt-0.5 text-(--crm-primary) shrink-0" />
                        <div className="min-w-0">
                            <p className="text-xs text-(--crm-text-muted)">Người thực hiện</p>
                            <p className="font-semibold text-sm text-(--crm-heading) truncate">
                                {log.userName || "Hệ thống"}
                            </p>
                            <p className="text-xs text-(--crm-text-secondary) truncate">
                                {log.userEmail || "system@internal"}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3 rounded-xl border border-(--crm-border) bg-white p-3.5">
                        <Shield size={18} className="mt-0.5 text-indigo-600 shrink-0" />
                        <div>
                            <p className="text-xs text-(--crm-text-muted)">Vai trò & Phân hệ</p>
                            <div className="flex items-center gap-2 mt-0.5">
                                <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
                                    {log.userRole || "SYSTEM"}
                                </span>
                                <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                                    Module: {log.module}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-start gap-3 rounded-xl border border-(--crm-border) bg-white p-3.5">
                        <Clock size={18} className="mt-0.5 text-amber-600 shrink-0" />
                        <div>
                            <p className="text-xs text-(--crm-text-muted)">Thời gian ghi nhận</p>
                            <p className="font-medium text-sm text-(--crm-heading)">
                                {formatDate(log.timestamp)}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3 rounded-xl border border-(--crm-border) bg-white p-3.5">
                        <Globe size={18} className="mt-0.5 text-cyan-600 shrink-0" />
                        <div>
                            <p className="text-xs text-(--crm-text-muted)">Địa chỉ IP & Đối tượng tác động</p>
                            <p className="font-medium text-sm text-(--crm-heading)">
                                IP: {log.ipAddress || "127.0.0.1"}
                            </p>
                            {log.entityType && (
                                <p className="text-xs text-(--crm-text-secondary)">
                                    {log.entityType} {log.entityId ? `#${log.entityId}` : ""}
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Raw Details / Payload */}
                {formattedDetails && (
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-(--crm-text-secondary)">
                                <Terminal size={14} />
                                <span>Chi tiết thay đổi & Thông số kỹ thuật (Payload)</span>
                            </div>
                            <button
                                type="button"
                                onClick={() => void handleCopyDetails()}
                                className="inline-flex items-center gap-1 text-xs text-(--crm-primary) hover:underline"
                            >
                                {copied ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                                <span>{copied ? "Đã sao chép" : "Sao chép JSON"}</span>
                            </button>
                        </div>
                        <pre className="max-h-56 overflow-auto rounded-xl border border-(--crm-border) bg-slate-900 p-4 text-xs font-mono text-emerald-400">
                            <code>{formattedDetails}</code>
                        </pre>
                    </div>
                )}
            </DialogContent>

            <div className="flex justify-end border-t border-(--crm-border) px-6 py-3">
                <button
                    type="button"
                    onClick={onClose}
                    className="rounded-lg bg-(--crm-surface-hover) px-4 py-2 text-xs font-semibold text-(--crm-text) hover:bg-slate-200"
                >
                    Đóng
                </button>
            </div>
        </Dialog>
    );
}
