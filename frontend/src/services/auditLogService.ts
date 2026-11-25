import api, { ApiError } from "./api";
import type { AuditLogPageResponse, AuditLogQuery, AuditLogStats } from "../types/auditLog";

export const auditLogService = {
    getLogs: async (query: AuditLogQuery = {}): Promise<AuditLogPageResponse> => {
        try {
            const response = await api.get<AuditLogPageResponse>("/audit-logs", {
                params: {
                    page: query.page ?? 0,
                    size: query.size ?? 15,
                    module: query.module || undefined,
                    action: query.action || undefined,
                    status: query.status || undefined,
                    q: query.q?.trim() || undefined,
                    startDate: query.startDate || undefined,
                    endDate: query.endDate || undefined,
                    direction: query.direction || "desc",
                },
            });
            return response.data;
        } catch (error) {
            if (error instanceof ApiError) throw error;
            throw new ApiError("Không thể tải nhật ký hoạt động từ máy chủ.", 500);
        }
    },

    getStats: async (): Promise<AuditLogStats> => {
        try {
            const response = await api.get<AuditLogStats>("/audit-logs/stats");
            return response.data;
        } catch (error) {
            if (error instanceof ApiError) throw error;
            throw new ApiError("Không thể tải thống kê nhật ký hoạt động.", 500);
        }
    },

    exportCsv: async (query: AuditLogQuery = {}): Promise<void> => {
        try {
            const response = await api.get("/audit-logs/export", {
                params: {
                    module: query.module || undefined,
                    action: query.action || undefined,
                    status: query.status || undefined,
                    q: query.q?.trim() || undefined,
                    startDate: query.startDate || undefined,
                    endDate: query.endDate || undefined,
                },
                responseType: "blob",
            });

            const blob = new Blob([response.data], { type: "text/csv;charset=utf-8;" });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", `audit_logs_${new Date().toISOString().slice(0, 10)}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Failed to export audit logs:", error);
            throw new ApiError("Không thể xuất file CSV. Vui lòng thử lại sau.", 500);
        }
    },
};

