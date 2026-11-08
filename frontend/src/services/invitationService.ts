import api, { authApi } from "./api";
import type {
    CompanyInvitation,
    CompanyInvitationRequest,
    ValidateInvitationResponse,
} from "../types/auth";

export const invitationService = {
    /**
     * Validate an invitation code before registration (public endpoint).
     */
    async validateInvitation(code: string): Promise<ValidateInvitationResponse> {
        const res = await authApi.get<ValidateInvitationResponse>("/api/v1/invitations/validate", {
            params: { code },
        });
        return res.data;
    },

    /**
     * List all company invitations (ADMIN only).
     */
    async listInvitations(): Promise<CompanyInvitation[]> {
        const res = await api.get<CompanyInvitation[]>("/admin/invitations");
        return res.data;
    },

    /**
     * Create a new company invitation code (ADMIN only).
     */
    async createInvitation(data: CompanyInvitationRequest): Promise<CompanyInvitation> {
        const res = await api.post<CompanyInvitation>("/admin/invitations", data);
        return res.data;
    },

    /**
     * Revoke an active invitation (ADMIN only).
     */
    async revokeInvitation(id: number): Promise<CompanyInvitation> {
        const res = await api.post<CompanyInvitation>(`/admin/invitations/${id}/revoke`);
        return res.data;
    },
};
