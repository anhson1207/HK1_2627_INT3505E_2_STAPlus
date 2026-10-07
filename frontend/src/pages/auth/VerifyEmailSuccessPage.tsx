import { Button } from "@mui/material";
import { BadgeCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";

import AuthPageShell from "../../components/auth/AuthPageShell";

export default function VerifyEmailSuccessPage() {
    const navigate = useNavigate();
    return (
        <AuthPageShell title="Xác nhận email thành công" description="Tài khoản của bạn đã được kích hoạt.">
            <div className="text-center">
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-(--crm-success-soft) text-(--crm-green-dark)"><BadgeCheck size={32} /></div>
                <Button variant="contained" size="large" fullWidth onClick={() => navigate("/login", { replace: true, state: { message: "Email đã được xác nhận. Bạn có thể đăng nhập." } })}>Đăng nhập</Button>
            </div>
        </AuthPageShell>
    );
}
