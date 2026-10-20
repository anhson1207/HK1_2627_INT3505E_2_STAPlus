import { Alert } from "@mui/material";
import { useAuthStore } from "../../stores/authStore";

export default function ProfilePage() {
    const user = useAuthStore((state) => state.user);
    if (!user) return <Alert severity="warning">Vui lòng đăng nhập.</Alert>;
    // AuthResponse has no user ID/email; never match a real account to mock CRM users.
    return <section className="crm-card crm-card__body">
        <h2 className="text-lg font-semibold text-(--crm-heading)">Tài khoản</h2>
        <dl className="mt-5 grid gap-5 sm:grid-cols-2">
            <div><dt className="text-sm text-(--crm-text-secondary)">Tên đăng nhập</dt><dd>{user.username}</dd></div>
            <div><dt className="text-sm text-(--crm-text-secondary)">Vai trò</dt><dd>{user.role}</dd></div>
        </dl>
    </section>;
}
