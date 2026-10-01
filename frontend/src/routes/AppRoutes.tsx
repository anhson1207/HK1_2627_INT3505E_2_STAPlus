import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import MainLayout from "../layouts/MainLayout";
import LeadListPage from "../pages/leads/LeadListPage";
import LeadCreatePage from "../pages/leads/LeadCreatePage";
import LeadDetailPage from "../pages/leads/LeadDetailPage";
import LeadEditPage from "../pages/leads/LeadEditPage";


// Support Pages
import SupportPage from "../pages/support/SupportPage";
import TicketCreatePage from "../pages/support/TicketCreatePage";
import TicketDetailPage from "../pages/support/TicketDetailPage";
import TicketEditPage from "../pages/support/TicketEditPage";





import SalesPage from "../pages/sales/SalesPage";
import DealCreatePage from "../pages/sales/DealCreatePage";
import DealDetailPage from "../pages/sales/DealDetailPage";
import DealEditPage from "../pages/sales/DealEditPage";


function DashboardPage() {
    return <div>Dashboard</div>;
}

function CustomerListPage() {
    return <div>Customer List</div>;
}

function LoginPage() {
    return <div>Login</div>;
}

export default function AppRoutes() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<LoginPage />} />

                <Route element={<MainLayout />}>
                    <Route path="/dashboard" element={<DashboardPage />} />

                    <Route path="/leads" element={<LeadListPage />} />
                    <Route path="/leads/new" element={<LeadCreatePage />} />
                    <Route path="/leads/:id" element={<LeadDetailPage />} />
                    <Route path="/leads/:id/edit" element={<LeadEditPage />} />

                    <Route path="/support" element={<SupportPage />} />

                    <Route path="/support/new" element={<TicketCreatePage />} />
                    <Route path="/support/:id" element={<TicketDetailPage />} />
                    <Route path="/support/:id/edit" element={<TicketEditPage />} />

                    <Route path="/sales" element={<SalesPage />} />
                    <Route path="/sales/new" element={<DealCreatePage />} />
                    <Route path="/sales/:id" element={<DealDetailPage />} />
                    <Route path="/sales/:id/edit" element={<DealEditPage />} />

                    

                    <Route path="/customers" element={<CustomerListPage />} />
                </Route>

                <Route
                    path="*"
                    element={<Navigate to="/dashboard" replace />}
                />
            </Routes>
        </BrowserRouter>
    );
}
