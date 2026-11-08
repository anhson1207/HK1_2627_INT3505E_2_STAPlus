import api from "./api";
import type {
    ApproveJoinRequestData,
    JoinRequest,
    JoinRequestStatus,
    JoinStatusResponse,
    RejectJoinRequestData,
} from "../types/auth";

export const joinRequestService = {
    /**
     * Check current user's join status (accessible to PENDING and ACTIVE users).
     */
    async getMyJoinStatus(): Promise<JoinStatusResponse> {
        const res = await api.get<JoinStatusResponse>("/me/join-status");
        return res.data;
    },

    /**
     * List all join requests (ADMIN only).
     */
    async listJoinRequests(status?: JoinRequestStatus): Promise<JoinRequest[]> {
        const res = await api.get<JoinRequest[]>("/admin/join-requests", {
            params: status ? { status } : undefined,
        });
        return res.data;
    },

    /**
     * Get specific join request details (ADMIN only).
     */
    async getJoinRequest(id: number): Promise<JoinRequest> {
        const res = await api.get<JoinRequest>(`/admin/join-requests/${id}`);
        return res.data;
    },

    /**
     * Approve a join request with assigned role (ADMIN only).
     */
    async approveJoinRequest(id: number, data: ApproveJoinRequestData): Promise<JoinRequest> {
        const res = await api.post<JoinRequest>(`/admin/join-requests/${id}/approve`, data);
        return res.data;
    },

    /**
     * Reject a join request with reason (ADMIN only).
     */
    async rejectJoinRequest(id: number, data: RejectJoinRequestData): Promise<JoinRequest> {
        const res = await api.post<JoinRequest>(`/admin/join-requests/${id}/reject`, data);
        return res.data;
    },
};
