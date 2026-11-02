import { Alert } from "@mui/material";
import { UserRound } from "lucide-react";
import { useAuthStore } from "../../stores/authStore";
import ProfileForm from "../../components/settings/ProfileForm";

const roleLabels: Record<string, string> = {
    ADMIN: "Quản trị viên",
    SALES: "Nhân viên kinh doanh",
    SUPPORT: "Nhân viên hỗ trợ",
    MANAGER: "Quản lý",
    UNASSIGNED: "Chưa phân quyền",
};

export default function ProfilePage() {
    const user = useAuthStore((state) => state.user);

    if (!user) {
        return <Alert severity="warning">Vui lòng đăng nhập.</Alert>;
    }

    const displayName = user.username || "Người dùng";
    const avatarLabel = displayName.charAt(0).toUpperCase();
    const roleLabel = roleLabels[user.role] ?? user.role;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-(--crm-heading)">
                    Thông tin cá nhân
                </h1>
                <p className="mt-1 text-sm text-(--crm-text-secondary)">
                    Quản lý thông tin hồ sơ và tài khoản của bạn.
                </p>
            </div>

            <section className="crm-card crm-card__body">
                <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
                    <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-blue-100 text-3xl font-semibold text-blue-700">
                        {avatarLabel}
                    </div>

                    <div className="min-w-0">
                        <h2 className="text-xl font-semibold text-(--crm-heading)">
                            {displayName}
                        </h2>

                        <p className="mt-1 text-sm text-(--crm-text-secondary)">
                            Tên đăng nhập
                        </p>

                        <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">
                            <UserRound size={15} />
                            {roleLabel}
                        </div>
                    </div>
                </div>
            </section>

            <section className="crm-card crm-card__body">
                <ProfileForm
                    initialValues={{
                        fullName: "",
                        email: "",
                        phone: "",
                        jobTitle: "",
                    }}
                />
            </section>
        </div>
    );
}