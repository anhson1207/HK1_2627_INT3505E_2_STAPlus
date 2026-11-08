import { BrowserRouter, Navigate, Outlet, Route, Routes } from "react-router-dom";

import MainLayout from "../layouts/MainLayout";
import LeadListPage from "../pages/leads/LeadListPage";
import LeadCreatePage from "../pages/leads/LeadCreatePage";
import LeadDetailPage from "../pages/leads/LeadDetailPage";
import LeadEditPage from "../pages/leads/LeadEditPage";
import CustomerListPage from "../pages/customers/CustomerListPage";
import CustomerCreatePage from "../pages/customers/CustomerCreatePage";
import CustomerDetailPage from "../pages/customers/CustomerDetailPage";
import CustomerEditPage from "../pages/customers/CustomerEditPage";
import LoginPage from "../pages/auth/LoginPage";
import RegisterChoicePage from "../pages/auth/RegisterChoicePage";
import ProtectedRoute from "./ProtectedRoute";
import PublicOnlyRoute from "./PublicOnlyRoute";
import RoleGuard from "../components/auth/RoleGuard";
import { rolesWithPermission } from "../config/rolePermissions";
import DealListPage from "../pages/deals/DealListPage";
import DealCreatePage from "../pages/deals/DealCreatePage";
import DealDetailPage from "../pages/deals/DealDetailPage";
import DealEditPage from "../pages/deals/DealEditPage";
import DealKanbanPage from "../pages/deals/DealKanbanPage";
import TicketListPage from "../pages/tickets/TicketListPage";
import TicketCreatePage from "../pages/tickets/TicketCreatePage";
import TicketDetailPage from "../pages/tickets/TicketDetailPage";
import TicketEditPage from "../pages/tickets/TicketEditPage";
import DashboardPage from "../pages/dashboard/DashboardPage";
import AnalyticsPage from "../pages/analytics/AnalyticsPage";
import SupportDashboardPage from "../pages/support/SupportDashboardPage";
import UserManagementPage from "../pages/settings/UserManagementPage";
import AuditLogPage from "../pages/settings/AuditLogPage";
import ForgotPasswordPage from "../pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "../pages/auth/ResetPasswordPage";
import VerifyEmailPendingPage from '../pages/auth/VerifyEmailPendingPage';
import VerifyEmailSuccessPage from '../pages/auth/VerifyEmailSuccessPage';
import ProfilePage from "../pages/settings/ProfilePage";
import SettingsPage from "../pages/settings/SettingsPage";
import SecuritySettingsPage from "../pages/settings/SecuritySettingsPage";
import NotificationSettingsPage from "../pages/settings/NotificationSettingsPage";
import AppearanceSettingsPage from "../pages/settings/AppearanceSettingsPage";
import GeneralSettingsPage from "../pages/settings/GeneralSettingsPage";
import ChatPage from "../pages/chat/ChatPage";
import NotificationPage from "../pages/notifications/NotificationPage";
import CompanySetupPage from "../pages/auth/CompanySetupPage";
import EmployeeJoinPage from "../pages/auth/EmployeeJoinPage";
import PendingApprovalPage from "../pages/auth/PendingApprovalPage";
import WelcomePage from "../pages/auth/WelcomePage";
import CompanySettingsPage from "../pages/settings/CompanySettingsPage";
import CompanyInvitationsPage from "../pages/settings/CompanyInvitationsPage";
import JoinRequestsPage from "../pages/settings/JoinRequestsPage";

export default function AppRoutes() {
    return (
        <BrowserRouter>
            <Routes>
                
                <Route element={<PublicOnlyRoute />}>
                    <Route path="/" element={<WelcomePage />} />
                    <Route path="/welcome" element={<Navigate to="/" replace />} />
                    <Route path="/get-started" element={<Navigate to="/" replace />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterChoicePage />} />
                    <Route path="/register/company" element={<CompanySetupPage />} />
                    <Route path="/register/employee" element={<EmployeeJoinPage />} />
                    <Route path="/setup" element={<Navigate to="/register/company" replace />} />
                    <Route path="/join" element={<Navigate to="/register/employee" replace />} />
                    <Route path="/verify-email-pending" element={<VerifyEmailPendingPage />} />
                    <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                    <Route path="/reset-password" element={<ResetPasswordPage />} />
                    <Route path="/verify-email-success" element={<VerifyEmailSuccessPage />} />
                </Route>

                <Route element={<ProtectedRoute />}>
                    <Route path="/pending-approval" element={<PendingApprovalPage />} />

                    <Route element={<MainLayout />}>
                        {/* Settings & RBAC Center */}
                        <Route path="/settings" element={<SettingsPage />}>
                            <Route index element={<Navigate to="/settings/profile" replace />} />
                            <Route path="profile" element={<ProfilePage />} />
                            <Route path="security" element={<SecuritySettingsPage />} />
                            <Route path="notifications" element={<NotificationSettingsPage />} />
                            <Route path="appearance" element={<AppearanceSettingsPage />} />

                            {/* Admin-only Settings */}
                            <Route element={<RoleGuard allowedRoles={["ADMIN"]} fallback={<Navigate to="/settings/profile" replace />}><Outlet /></RoleGuard>}>
                                <Route path="company" element={<CompanySettingsPage />} />
                                <Route path="invitations" element={<CompanyInvitationsPage />} />
                                <Route path="join-requests" element={<JoinRequestsPage />} />
                                <Route path="users" element={<UserManagementPage />} />
                                <Route path="audit-logs" element={<AuditLogPage />} />
                                <Route path="audit" element={<Navigate to="/settings/audit-logs" replace />} />
                                <Route path="general" element={<GeneralSettingsPage />} />
                                <Route path="roles" element={<Navigate to="/settings/users" replace />} />
                            </Route>
                        </Route>
                        <Route path="/profile" element={<Navigate to="/settings/profile" replace />} />
                        <Route path="/notifications" element={<NotificationPage />} />
                        <Route path="/dashboard" element={<DashboardPage />} />

                        <Route element={<RoleGuard allowedRoles={rolesWithPermission("chat")} fallback={<Navigate to="/dashboard" replace />}><Outlet /></RoleGuard>}>
                            <Route path="/chat" element={<ChatPage />} />
                        </Route>

                        <Route path="/leads" element={<LeadListPage />} />
                        <Route path="/leads/new" element={<LeadCreatePage />} />
                        <Route path="/leads/:id" element={<LeadDetailPage />} />
                        <Route path="/leads/:id/edit" element={<LeadEditPage />} />

                        <Route path="/customers" element={<CustomerListPage />} />
                        <Route path="/customers/new" element={<CustomerCreatePage />} />
                        <Route path="/customers/:id" element={<CustomerDetailPage />} />
                        <Route path="/customers/:id/edit" element={<CustomerEditPage />} />

                        <Route element={<RoleGuard allowedRoles={rolesWithPermission("deals")} fallback={<Navigate to="/dashboard" replace />}><Outlet /></RoleGuard>}>
                            <Route path="/sales" element={<Navigate to="/deals" replace />} />
                            <Route path="/analytics" element={<AnalyticsPage />} />
                            <Route path="/deals" element={<DealListPage />} />
                            <Route path="/deals/new" element={<DealCreatePage />} />
                            <Route path="/deals/kanban" element={<DealKanbanPage />} />
                            <Route path="/deals/:id" element={<DealDetailPage />} />
                            <Route path="/deals/:id/edit" element={<DealEditPage />} />
                        </Route>

                        <Route element={<RoleGuard allowedRoles={rolesWithPermission("tickets")} fallback={<Navigate to="/dashboard" replace />}><Outlet /></RoleGuard>}>
                            <Route path="/support" element={<SupportDashboardPage />} />
                            <Route path="/tickets" element={<TicketListPage />} />
                            <Route path="/tickets/new" element={<TicketCreatePage />} />
                            <Route path="/tickets/:id" element={<TicketDetailPage />} />
                            <Route path="/tickets/:id/edit" element={<TicketEditPage />} />
                        </Route>
                    </Route>
                </Route>

                <Route
                    path="*"
                    element={<Navigate to="/" replace />}
                />
            </Routes>
        </BrowserRouter>
    );
}
