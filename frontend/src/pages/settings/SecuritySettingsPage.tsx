import { Button } from "@mui/material";
import { LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { useAuthStore } from "../../stores/authStore";

export default function SecuritySettingsPage() {
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();
    return <section className="crm-card crm-card__body">
        <h2 className="text-lg font-semibold text-(--crm-heading)">Phiên đăng nhập hiện tại</h2>
        <p className="crm-page-description">{user?.username}</p>
        <p className="my-5 text-sm text-(--crm-text-secondary)">Đăng xuất chỉ xóa phiên trên trình duyệt này.</p>
        <Button variant="outlined" color="error" startIcon={<LogOut size={16} />} onClick={() => {
            logout();
            navigate("/login", { replace: true });
        }}>Đăng xuất</Button>
    </section>;
}
