import { Alert, Button, CircularProgress, Snackbar } from "@mui/material";
import { Pencil, UserRound } from "lucide-react";
import { useEffect, useState } from "react";

import ProfileForm from "../../components/settings/ProfileForm";
import { userService } from "../../services/userService";
import { useAuthStore } from "../../stores/authStore";
import type { CRMUser } from "../../types/user";
import type { ProfileFormData } from "../../utils/settingsSchema";

export default function ProfilePage() {
    const authUser = useAuthStore((state) => state.user);
    const setAuthUser = useAuthStore((state) => state.setUser);
    const [profile, setProfile] = useState<CRMUser | null>(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    useEffect(() => {
        let active = true;
        const load = async () => {
            if (!authUser) { if (active) setLoading(false); return; }
            try { const data = await userService.ensureCurrentUser(authUser); if (active) setProfile(data); }
            catch (loadError) { if (active) setError(loadError instanceof Error ? loadError.message : "Không thể tải hồ sơ."); }
            finally { if (active) setLoading(false); }
        };
        void load();
        return () => { active = false; };
    }, [authUser]);

    const save = async (data: ProfileFormData) => {
        if (!profile || !authUser) return;
        setError("");
        try {
            const updated = await userService.updateUser(profile.id, { ...profile, ...data, role: profile.role, status: profile.status });
            setProfile(updated);
            setAuthUser({ ...authUser, fullName: updated.fullName });
            setEditing(false); setMessage("Cập nhật hồ sơ thành công");
        } catch (saveError) { setError(saveError instanceof Error ? saveError.message : "Không thể cập nhật hồ sơ."); }
    };

    if (loading) return <div className="flex min-h-64 items-center justify-center"><CircularProgress /></div>;
    if (!profile) return <Alert severity="error">{error || "Không tìm thấy hồ sơ."}</Alert>;
    return <div className="crm-card crm-card__body">
        <div className="mb-6 flex flex-wrap items-start justify-between gap-3"><div><h2 className="text-lg font-semibold text-(--crm-heading)">Hồ sơ của tôi</h2><p className="crm-page-description">Thông tin cá nhân và vai trò trong CRM</p></div>{!editing && <Button variant="outlined" startIcon={<Pencil size={16} />} onClick={() => setEditing(true)}>Chỉnh sửa hồ sơ</Button>}</div>
        <div className="mb-6 flex items-center gap-4"><div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-(--crm-primary) text-xl font-bold text-(--crm-on-primary)">{profile.avatar ? <img src={profile.avatar} alt="Avatar" className="h-full w-full object-cover" /> : profile.fullName.charAt(0).toUpperCase() || <UserRound size={25} />}</div><div><p className="text-base font-semibold text-(--crm-heading)">{profile.fullName}</p><p className="crm-page-description">{profile.email}</p></div></div>
        {editing ? <ProfileForm initialData={{ fullName: profile.fullName, email: profile.email, phone: profile.phone ?? "", department: profile.department ?? "", avatar: profile.avatar ?? "" }} onSubmit={save} onCancel={() => { setEditing(false); setError(""); }} error={error} /> : <dl className="grid grid-cols-1 gap-x-8 gap-y-5 border-t border-(--crm-border-subtle) pt-5 sm:grid-cols-2">{[["Họ tên", profile.fullName], ["Email", profile.email], ["Số điện thoại", profile.phone || "—"], ["Phòng ban", profile.department || "—"], ["Vai trò", profile.role]].map(([label, value]) => <div key={label}><dt className="text-xs text-(--crm-text-secondary)">{label}</dt><dd className="mt-1 text-sm font-medium text-(--crm-heading)">{value}</dd></div>)}</dl>}
        <Snackbar open={Boolean(message)} autoHideDuration={3000} onClose={() => setMessage("")} message={message} />
    </div>;
}
