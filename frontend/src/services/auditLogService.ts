import api, { ApiError } from "./api";
import type { AuditLog, AuditLogPageResponse, AuditLogQuery, AuditLogStats } from "../types/auditLog";

const MOCK_AUDIT_LOGS: AuditLog[] = [
    {
        id: 1,
        timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        userId: 1,
        userEmail: "admin@crm.local",
        userName: "Quản trị viên",
        userRole: "ADMIN",
        action: "ASSIGN",
        module: "LEAD",
        entityType: "Lead",
        entityId: "26-LEADS",
        description: "Phân bổ tự động 26 Lead cho 3 nhân viên Sales theo thuật toán Round-Robin",
        ipAddress: "127.0.0.1",
        status: "SUCCESS",
        details: '{"strategy": "ROUND_ROBIN", "assignedCount": 26, "sales": ["Trần Minh", "Phạm Bảo Trúc", "Đỗ Hải Anh"]}',
    },
    {
        id: 2,
        timestamp: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
        userId: 1,
        userEmail: "admin@crm.local",
        userName: "Quản trị viên",
        userRole: "ADMIN",
        action: "CREATE",
        module: "LEAD",
        entityType: "Lead",
        entityId: "42",
        description: "Thu thập Lead tự động qua Webhook từ Form Website: Auto Assign Test 3",
        ipAddress: "118.69.182.44",
        status: "SUCCESS",
        details: '{"channel": "WEBSITE", "email": "auto_assign3@staplus.vn", "phone": "0981122336"}',
    },
    {
        id: 3,
        timestamp: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
        userId: 1,
        userEmail: "admin@crm.local",
        userName: "Quản trị viên",
        userRole: "ADMIN",
        action: "ROLE_CHANGE",
        module: "USER",
        entityType: "User",
        entityId: "5",
        description: "Cập nhật vai trò người dùng 'Đỗ Hải Anh' (haianh@crm.com) thành SALES",
        ipAddress: "127.0.0.1",
        status: "SUCCESS",
        details: '{"oldRole": "UNASSIGNED", "newRole": "SALES", "department": "Kinh doanh"}',
    },
    {
        id: 4,
        timestamp: new Date(Date.now() - 65 * 60 * 1000).toISOString(),
        userId: 1,
        userEmail: "admin@crm.local",
        userName: "Quản trị viên",
        userRole: "ADMIN",
        action: "LOGIN",
        module: "AUTH",
        entityType: "User",
        entityId: "1",
        description: "Đăng nhập hệ thống thành công với quyền Quản trị viên",
        ipAddress: "127.0.0.1",
        status: "SUCCESS",
        details: '{"method": "PASSWORD", "userAgent": "Chrome / macOS"}',
    },
    {
        id: 5,
        timestamp: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
        userId: 2,
        userEmail: "sales@crm.com",
        userName: "Trần Minh",
        userRole: "SALES",
        action: "CREATE",
        module: "CUSTOMER",
        entityType: "Customer",
        entityId: "18",
        description: "Tạo mới hồ sơ khách hàng doanh nghiệp: Công ty Cổ phần Công nghệ STAPlus",
        ipAddress: "14.161.22.105",
        status: "SUCCESS",
        details: '{"company": "STAPlus", "contactPerson": "Trần Minh Hoàng", "taxCode": "0109988776"}',
    },
    {
        id: 6,
        timestamp: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
        userId: 1,
        userEmail: "admin@crm.local",
        userName: "Quản trị viên",
        userRole: "ADMIN",
        action: "IMPORT",
        module: "LEAD",
        entityType: "LeadBatch",
        entityId: "BATCH-01",
        description: "Import thành công 15 khách hàng tiềm năng từ file danh sách khách hàng hội thảo.csv",
        ipAddress: "127.0.0.1",
        status: "SUCCESS",
        details: '{"source": "EVENT", "fileName": "hoi-thao-crm.csv", "totalRows": 15}',
    },
    {
        id: 7,
        timestamp: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
        userId: 4,
        userEmail: "truc@crm.com",
        userName: "Phạm Bảo Trúc",
        userRole: "SALES",
        action: "UPDATE",
        module: "DEAL",
        entityType: "Deal",
        entityId: "104",
        description: "Chuyển giai đoạn cơ hội 'Gói CRM Enterprise 50 Users' sang Đàm phán (Negotiation)",
        ipAddress: "171.244.11.89",
        status: "SUCCESS",
        details: '{"oldStage": "PROPOSAL", "newStage": "NEGOTIATION", "value": 150000000}',
    },
    {
        id: 8,
        timestamp: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
        userId: null,
        userEmail: "unknown@attacker.com",
        userName: "Khách vãng lai",
        userRole: "GUEST",
        action: "LOGIN",
        module: "AUTH",
        entityType: "User",
        entityId: null,
        description: "Đăng nhập thất bại: Tài khoản không tồn tại hoặc sai mật khẩu",
        ipAddress: "45.133.1.20",
        status: "FAILED",
        details: '{"reason": "Bad credentials", "targetEmail": "unknown@attacker.com"}',
    },
];

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
            console.warn("Failed to fetch audit logs from backend API, using local fallback:", error);
            const page = query.page ?? 0;
            const size = query.size ?? 15;
            let list = [...MOCK_AUDIT_LOGS];

            if (query.module && query.module !== "ALL") {
                list = list.filter((item) => item.module.toUpperCase() === query.module?.toUpperCase());
            }
            if (query.action && query.action !== "ALL") {
                list = list.filter((item) => item.action.toUpperCase() === query.action?.toUpperCase());
            }
            if (query.status && query.status !== "ALL") {
                list = list.filter((item) => item.status.toUpperCase() === query.status?.toUpperCase());
            }
            if (query.q) {
                const keyword = query.q.toLowerCase();
                list = list.filter(
                    (item) =>
                        item.description.toLowerCase().includes(keyword) ||
                        item.userEmail?.toLowerCase().includes(keyword) ||
                        item.userName?.toLowerCase().includes(keyword) ||
                        item.entityId?.toLowerCase().includes(keyword)
                );
            }

            const totalElements = list.length;
            const totalPages = Math.ceil(totalElements / size);
            const content = list.slice(page * size, (page + 1) * size);

            return {
                content,
                totalElements,
                totalPages,
                size,
                number: page,
                first: page === 0,
                last: page >= totalPages - 1,
            };
        }
    },

    getStats: async (): Promise<AuditLogStats> => {
        try {
            const response = await api.get<AuditLogStats>("/audit-logs/stats");
            return response.data;
        } catch (error) {
            console.warn("Failed to fetch audit stats from backend API, using local fallback:", error);
            const total = MOCK_AUDIT_LOGS.length;
            const success = MOCK_AUDIT_LOGS.filter((item) => item.status === "SUCCESS").length;
            const failed = total - success;
            const actionCounts: Record<string, number> = {};
            const moduleCounts: Record<string, number> = {};

            MOCK_AUDIT_LOGS.forEach((item) => {
                actionCounts[item.action] = (actionCounts[item.action] || 0) + 1;
                moduleCounts[item.module] = (moduleCounts[item.module] || 0) + 1;
            });

            return {
                totalLogs: total,
                todayLogs: total,
                successCount: success,
                failedCount: failed,
                actionCounts,
                moduleCounts,
            };
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
