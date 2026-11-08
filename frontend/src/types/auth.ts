export const USER_ROLES = ["ADMIN", "SALES", "SUPPORT", "MANAGER", "UNASSIGNED"] as const;
export type UserRole = typeof USER_ROLES[number];
export type AuthProvider = "LOCAL" | "GOOGLE";
export type UserStatus = "PENDING" | "ACTIVE" | "DISABLED" | "REJECTED" | "INACTIVE";

export interface User {
    id: number;
    fullName: string;
    email: string;
    role: UserRole;
    status?: UserStatus;
    provider?: AuthProvider;
    emailVerified?: boolean;
    isOwner?: boolean;
    companyName?: string;
}

export interface AuthUser {
    id?: number;
    username: string;
    fullName?: string;
    email?: string;
    phone?: string;
    department?: string;
    avatarUrl?: string;
    role: UserRole;
    status?: UserStatus;
    provider?: AuthProvider;
    emailVerified?: boolean;
    isOwner?: boolean;
    companyName?: string;
}

export interface LoginRequest {
    username: string;
    password: string;
}

export interface RegisterRequest {
    username: string;
    email: string;
    password: string;
}

export interface LoginResponse extends AuthUser {
    token: string;
    message: string;
    userId?: number;
}

// AuthServiceImpl.register returns AuthResponse without assigning a token.
export interface RegisterResponse extends AuthUser {
    token: null;
    message: string;
}

export interface ForgotPasswordRequest {
    email: string;
}

export interface ForgotPasswordResponse {
    message: string;
    resetToken?: string;
}

export interface ResetPasswordRequest {
    email: string;
    token: string;
    newPassword: string;
}

export interface ResetPasswordResponse {
    message: string;
}

export interface UserProfileResponse {
    id: number;
    username: string;
    email: string;
    role: UserRole;
    status: UserStatus;
    fullName?: string | null;
    phone?: string | null;
    department?: string | null;
    avatarUrl?: string | null;
    createdAt?: string;
    isOwner?: boolean;
}

export interface UpdateProfileRequest {
    fullName: string;
    phone?: string;
    department?: string;
    avatarUrl?: string;
}

export interface ChangePasswordData {
    currentPassword: string;
    newPassword: string;
}

export interface UserPreferencesData {
    id?: number;
    userId?: number;
    chatToast?: boolean;
    chatSound?: boolean;
    chatBrowser?: boolean;
    chatGroupEvents?: boolean;
    notifyLeadAssigned?: boolean;
    notifyDealStage?: boolean;
    notifyTicket?: boolean;
    notifySystem?: boolean;
    reminderBefore?: string;
    themeMode?: string;
    tableDensity?: string;
    sidebarCollapsed?: boolean;
    dateFormat?: string;
    updatedAt?: string;
}

export interface Organization {
    id: number;
    name: string;
    industry?: string | null;
    companySize?: string | null;
    logoUrl?: string | null;
    phone?: string | null;
    email?: string | null;
    website?: string | null;
    address?: string | null;
    timezone?: string | null;
    ownerUserId: number;
    ownerName?: string | null;
    ownerEmail?: string | null;
    setupCompleted: boolean;
    createdAt?: string;
    updatedAt?: string | null;
}

export interface SetupStatus {
    setupCompleted: boolean;
    hasOrganization: boolean;
    organizationName?: string | null;
    organizationLogo?: string | null;
    ownerName?: string | null;
    allowPublicSetup: boolean;
    userCount: number;
}

export interface InitializeSetupData {
    companyName: string;
    industry?: string;
    companySize?: string;
    phone?: string;
    email?: string;
    website?: string;
    address?: string;
    timezone?: string;
    adminFullName: string;
    adminEmail: string;
    adminPassword: string;
    adminConfirmPassword?: string;
    bootstrapToken?: string;
}

export interface UpdateOrganizationData {
    name: string;
    industry?: string;
    companySize?: string;
    logoUrl?: string;
    phone?: string;
    email?: string;
    website?: string;
    address?: string;
    timezone?: string;
}

export type InvitationStatus = 'ACTIVE' | 'REVOKED' | 'EXPIRED';

export interface CompanyInvitation {
    id: number;
    code: string;
    status: InvitationStatus;
    expiresAt?: string | null;
    maxUses?: number | null;
    useCount: number;
    createdBy: number;
    createdByName?: string | null;
    createdAt: string;
    revokedAt?: string | null;
    notes?: string | null;
    usable: boolean;
}

export interface CompanyInvitationRequest {
    expiresInDays?: number;
    maxUses?: number;
    notes?: string;
}

export interface ValidateInvitationResponse {
    valid: boolean;
    message: string;
    companyName?: string | null;
    companyLogo?: string | null;
    industry?: string | null;
    code?: string | null;
}

export interface EmployeeRegisterData {
    fullName: string;
    email: string;
    password: string;
    confirmPassword?: string;
    invitationCode: string;
}

export type JoinRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface JoinRequest {
    id: number;
    userId: number;
    userName: string;
    userEmail: string;
    invitationId?: number | null;
    invitationCode?: string | null;
    status: JoinRequestStatus;
    requestedAt: string;
    reviewedBy?: number | null;
    reviewerName?: string | null;
    reviewedAt?: string | null;
    assignedRole?: UserRole | null;
    rejectionReason?: string | null;
    notes?: string | null;
}

export interface ApproveJoinRequestData {
    role: 'SALES' | 'SUPPORT';
    department?: string;
}

export interface RejectJoinRequestData {
    reason: string;
}

export interface JoinStatusResponse {
    status: JoinRequestStatus;
    userStatus: UserStatus;
    assignedRole?: UserRole | null;
    companyName?: string | null;
    companyLogo?: string | null;
    requestedAt?: string | null;
    reviewedAt?: string | null;
    rejectionReason?: string | null;
    message: string;
}

export function isUserRole(value: unknown): value is UserRole {
    return USER_ROLES.some((role) => role === value);
}
