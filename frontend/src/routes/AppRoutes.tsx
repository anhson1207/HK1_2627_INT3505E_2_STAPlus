import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import MainLayout from "../layouts/MainLayout";
import LeadListPage from "../pages/leads/LeadListPage";
import LeadCreatePage from "../pages/leads/LeadCreatePage";
import LeadDetailPage from "../pages/leads/LeadDetailPage";
import LeadEditPage from "../pages/leads/LeadEditPage";

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
