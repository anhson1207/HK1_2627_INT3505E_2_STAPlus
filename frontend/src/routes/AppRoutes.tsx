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
import RegisterPage from "../pages/auth/RegisterPage";
import VerifyEmailPendingPage from "../pages/auth/VerifyEmailPendingPage";
import VerifyEmailSuccessPage from "../pages/auth/VerifyEmailSuccessPage";
import ForgotPasswordPage from "../pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "../pages/auth/ResetPasswordPage";
import ProtectedRoute from "./ProtectedRoute";
import PublicOnlyRoute from "./PublicOnlyRoute";
import RoleGuard from "../components/auth/RoleGuard";
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

export default function AppRoutes() {
    return (
        <BrowserRouter>
            <Routes>
                <Route element={<PublicOnlyRoute />}>
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                </Route>
                <Route path="/verify-email-pending" element={<VerifyEmailPendingPage />} />
                <Route path="/verify-email-success" element={<VerifyEmailSuccessPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/reset-password" element={<ResetPasswordPage />} />

                <Route element={<ProtectedRoute />}>
                    <Route element={<MainLayout />}>
                        <Route path="/dashboard" element={<DashboardPage />} />

                        <Route path="/leads" element={<LeadListPage />} />
                        <Route path="/leads/new" element={<LeadCreatePage />} />
                        <Route path="/leads/:id" element={<LeadDetailPage />} />
                        <Route path="/leads/:id/edit" element={<LeadEditPage />} />

                        <Route path="/customers" element={<CustomerListPage />} />
                        <Route path="/customers/new" element={<CustomerCreatePage />} />
                        <Route path="/customers/:id" element={<CustomerDetailPage />} />
                        <Route path="/customers/:id/edit" element={<CustomerEditPage />} />

                        <Route element={<RoleGuard allowedRoles={["ADMIN", "SALES"]} fallback={<Navigate to="/dashboard" replace />}><Outlet /></RoleGuard>}>
                            <Route path="/analytics" element={<AnalyticsPage />} />
                            <Route path="/deals" element={<DealListPage />} />
                            <Route path="/deals/new" element={<DealCreatePage />} />
                            <Route path="/deals/kanban" element={<DealKanbanPage />} />
                            <Route path="/deals/:id" element={<DealDetailPage />} />
                            <Route path="/deals/:id/edit" element={<DealEditPage />} />
                        </Route>

                        <Route element={<RoleGuard allowedRoles={["ADMIN", "SUPPORT"]} fallback={<Navigate to="/dashboard" replace />}><Outlet /></RoleGuard>}>
                            <Route path="/tickets" element={<TicketListPage />} />
                            <Route path="/tickets/new" element={<TicketCreatePage />} />
                            <Route path="/tickets/:id" element={<TicketDetailPage />} />
                            <Route path="/tickets/:id/edit" element={<TicketEditPage />} />
                        </Route>
                    </Route>
                </Route>

                <Route
                    path="*"
                    element={<Navigate to="/dashboard" replace />}
                />
            </Routes>
        </BrowserRouter>
    );
}
