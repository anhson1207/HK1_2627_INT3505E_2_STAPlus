export type AuditAction =
    | "CREATE"
    | "UPDATE"
    | "DELETE"
    | "ASSIGN"
    | "LOGIN"
    | "LOGOUT"
    | "IMPORT"
    | "EXPORT"
    | "STATUS_CHANGE"
    | "ROLE_CHANGE"
    | string;

export type AuditModule =
    | "LEAD"
    | "CUSTOMER"
    | "DEAL"
    | "USER"
    | "AUTH"
    | "SYSTEM"
    | string;

export interface AuditLog {
    id: number;
    timestamp: string;
    userId?: number | null;
    userEmail?: string | null;
    userName?: string | null;
    userRole?: string | null;
    action: AuditAction;
    module: AuditModule;
    entityType?: string | null;
    entityId?: string | null;
    description: string;
    ipAddress?: string | null;
    status: "SUCCESS" | "FAILED" | "WARNING" | string;
    details?: string | null;
}

export interface AuditLogStats {
    totalLogs: number;
    todayLogs: number;
    successCount: number;
    failedCount: number;
    actionCounts: Record<string, number>;
    moduleCounts: Record<string, number>;
}

export interface AuditLogQuery {
    page?: number;
    size?: number;
    module?: string;
    action?: string;
    status?: string;
    q?: string;
    startDate?: string;
    endDate?: string;
    direction?: "asc" | "desc";
}

export interface AuditLogPageResponse {
    content: AuditLog[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
    first: boolean;
    last: boolean;
}

