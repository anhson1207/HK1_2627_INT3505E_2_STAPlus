import api, { authApi } from "./api";
import type {
    InitializeSetupData,
    Organization,
    SetupStatus,
    UpdateOrganizationData,
} from "../types/auth";

export const organizationService = {
    /**
     * Get system setup status (public endpoint).
     */
    async getSetupStatus(): Promise<SetupStatus> {
        try {
            const res = await authApi.get<SetupStatus>("/api/v1/setup/status");
            return res.data;
        } catch {
            return {
                setupCompleted: true,
                hasOrganization: true,
                organizationName: "STAPlus CRM",
                allowPublicSetup: false,
                userCount: 1,
            };
        }
    },

    /**
     * Initialize first-time company bootstrap (public / one-time only).
     */
    async initializeSetup(data: InitializeSetupData): Promise<Organization> {
        const payload = {
            companyName: data.companyName,
            industry: data.industry,
            companySize: data.companySize,
            phone: data.phone,
            companyEmail: data.email,
            website: data.website,
            address: data.address,
            timezone: data.timezone,
            fullName: data.adminFullName,
            email: data.adminEmail,
            password: data.adminPassword,
            confirmPassword: data.adminConfirmPassword,
            bootstrapToken: data.bootstrapToken,
        };
        const res = await authApi.post<Organization>("/api/v1/setup/initialize", payload);
        return res.data;
    },

    /**
     * Get active organization information.
     */
    async getOrganization(): Promise<Organization> {
        const res = await api.get<Organization>("/organization");
        return res.data;
    },

    /**
     * Update organization profile (OWNER only).
     */
    async updateOrganization(data: UpdateOrganizationData): Promise<Organization> {
        const res = await api.put<Organization>("/organization", data);
        return res.data;
    },
};
