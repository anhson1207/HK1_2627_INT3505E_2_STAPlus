import PageHeader from "../../components/common/PageHeader";
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
            <PageHeader
                title="Thông tin cá nhân"
                description="Quản lý thông tin hồ sơ và tài khoản của bạn."
            />

            <section className="crm-card crm-card__body">
                <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center">
                    <div className="flex h-18 w-18 shrink-0 items-center justify-center rounded-full bg-(--crm-indigo) text-2xl font-bold text-white shadow-sm">
                        {avatarLabel}
                    </div>

                    <div className="min-w-0">
                        <h2 className="text-xl font-semibold text-(--crm-heading)">
                            {displayName}
                        </h2>

                        <p className="mt-1 text-sm text-(--crm-text-secondary)">
                            Tên đăng nhập
                        </p>

                        <div className="mt-3 inline-flex items-center gap-1.5">
                            <span className="crm-pill">
                                <UserRound size={14} />
                                {roleLabel}
                            </span>
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