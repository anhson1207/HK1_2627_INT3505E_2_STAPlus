import { Alert, Button, CircularProgress, Dialog, DialogContent, DialogTitle, Snackbar } from "@mui/material";
import { Pencil, Plus, Search, UserRoundCheck, UserRoundX } from "lucide-react";
import { useDeferredValue, useEffect, useMemo, useState } from "react";

import UserForm from "../../components/settings/UserForm";
import { userService } from "../../services/userService";
import { useAuthStore } from "../../stores/authStore";
import type { CRMUser, UserRole, UserStatus } from "../../types/user";
import type { UserFormData } from "../../utils/settingsSchema";

const pageSize = 8;
const dateFormat = new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });

export default function UserManagementPage() {
    const currentUserId = useAuthStore((state) => state.user?.id);
    const [users, setUsers] = useState<CRMUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const deferredSearch = useDeferredValue(search);
    const [role, setRole] = useState<UserRole | "">("");
    const [status, setStatus] = useState<UserStatus | "">("");
    const [page, setPage] = useState(0);
    const [formOpen, setFormOpen] = useState(false);
    const [editing, setEditing] = useState<CRMUser | null>(null);
    const [busyId, setBusyId] = useState<number | null>(null);
    const [error, setError] = useState("");
    const [formError, setFormError] = useState("");
    const [message, setMessage] = useState("");

    useEffect(() => {
        let active = true;
        const load = async () => {
            try { const data = await userService.getUsers(); if (active) setUsers(data); }
            catch (loadError) { if (active) setError(loadError instanceof Error ? loadError.message : "Không thể tải người dùng."); }
            finally { if (active) setLoading(false); }
        };
        void load();
        return () => { active = false; };
    }, []);

    const filtered = useMemo(() => {
        const keyword = deferredSearch.trim().toLocaleLowerCase("vi");
        return users.filter((user) => (!role || user.role === role) && (!status || user.status === status) && (!keyword || [user.fullName, user.email, user.department].filter(Boolean).some((value) => value!.toLocaleLowerCase("vi").includes(keyword))));
    }, [users, deferredSearch, role, status]);
    const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
    const visible = filtered.slice(page * pageSize, (page + 1) * pageSize);

    const openCreate = () => { setEditing(null); setFormError(""); setFormOpen(true); };
    const openEdit = (user: CRMUser) => { setEditing(user); setFormError(""); setFormOpen(true); };
    const save = async (data: UserFormData) => {
        setFormError("");
        try {
            if (editing) {
                if (editing.id === currentUserId && (data.role !== editing.role || data.status !== "ACTIVE")) throw new Error("Không thể đổi vai trò hoặc ngừng hoạt động tài khoản của chính mình.");
                const updated = await userService.updateUser(editing.id, data);
                setUsers((current) => current.map((item) => item.id === updated.id ? updated : item));
                setMessage("Cập nhật người dùng thành công");
            } else {
                const created = await userService.createUser(data);
                setUsers((current) => [...current, created]);
                setPage(0); setMessage("Tạo người dùng thành công");
            }
            setFormOpen(false);
        } catch (saveError) { setFormError(saveError instanceof Error ? saveError.message : "Không thể lưu người dùng."); }
    };
    const toggleStatus = async (user: CRMUser) => {
        if (user.id === currentUserId) return;
        setBusyId(user.id); setError("");
        try {
            const updated = user.status === "ACTIVE" ? await userService.deactivateUser(user.id) : await userService.activateUser(user.id);
            setUsers((current) => current.map((item) => item.id === updated.id ? updated : item));
            setMessage(updated.status === "ACTIVE" ? "Đã kích hoạt người dùng" : "Đã ngừng hoạt động người dùng");
        } catch (actionError) { setError(actionError instanceof Error ? actionError.message : "Không thể cập nhật trạng thái."); }
        finally { setBusyId(null); }
    };

    return <div><div className="crm-page-header"><div><h2 className="text-lg font-semibold text-(--crm-heading)">Quản lý người dùng</h2><p className="crm-page-description">Danh sách mock; tạo người dùng ở đây chưa cấp tài khoản đăng nhập.</p></div><Button variant="contained" startIcon={<Plus size={17} />} onClick={openCreate}>Thêm người dùng</Button></div>
        {error && <Alert severity="error" className="mb-4">{error}</Alert>}
        <div className="crm-board"><div className="flex flex-wrap gap-3 border-b border-(--crm-border) p-4"><label className="flex min-w-48 flex-1 items-center gap-2 rounded-lg border border-(--crm-border) px-3"><Search size={16} className="text-(--crm-text-muted)" /><input type="search" value={search} onChange={(event) => { setSearch(event.target.value); setPage(0); }} placeholder="Tìm tên, email, phòng ban..." className="h-9 w-full min-w-0 bg-transparent text-xs outline-none" /></label><select aria-label="Lọc vai trò" value={role} onChange={(event) => { setRole(event.target.value as UserRole | ""); setPage(0); }} className="crm-filter-chip"><option value="">Tất cả vai trò</option><option value="ADMIN">Admin</option><option value="SALES">Sales</option><option value="SUPPORT">Support</option></select><select aria-label="Lọc trạng thái" value={status} onChange={(event) => { setStatus(event.target.value as UserStatus | ""); setPage(0); }} className="crm-filter-chip"><option value="">Tất cả trạng thái</option><option value="ACTIVE">Hoạt động</option><option value="INACTIVE">Ngừng hoạt động</option></select></div>
            {loading ? <div className="flex min-h-64 items-center justify-center"><CircularProgress /></div> : visible.length === 0 ? <div className="flex min-h-64 items-center justify-center text-sm text-(--crm-text-secondary)">Không tìm thấy người dùng.</div> : <div className="crm-table-wrap"><table className="crm-table"><thead><tr className="border-b border-(--crm-border) bg-(--crm-surface-subtle) text-left text-xs text-(--crm-text-secondary)"><th className="px-4 py-3">Tên</th><th className="px-4 py-3">Email</th><th className="px-4 py-3">Vai trò</th><th className="px-4 py-3">Phòng ban</th><th className="px-4 py-3">Trạng thái</th><th className="px-4 py-3">Ngày tạo</th><th className="px-4 py-3">Thao tác</th></tr></thead><tbody>{visible.map((user) => <tr key={user.id} className="border-b border-(--crm-border-subtle) last:border-b-0 hover:bg-(--crm-surface-subtle)"><td className="px-4 py-3 text-sm font-medium text-(--crm-heading)">{user.fullName}</td><td className="px-4 py-3 text-xs text-(--crm-text-secondary)">{user.email}</td><td className="px-4 py-3"><span className="rounded-full bg-(--crm-info-soft) px-2.5 py-1 text-xs font-medium text-(--crm-primary)">{user.role}</span></td><td className="px-4 py-3 text-xs text-(--crm-text-secondary)">{user.department || "—"}</td><td className="px-4 py-3"><span className={`rounded-full px-2.5 py-1 text-xs font-medium ${user.status === "ACTIVE" ? "bg-(--crm-success-soft) text-(--crm-green-dark)" : "bg-(--crm-surface-hover) text-(--crm-text-secondary)"}`}>{user.status === "ACTIVE" ? "Hoạt động" : "Ngừng hoạt động"}</span></td><td className="px-4 py-3 text-xs text-(--crm-text-secondary)">{dateFormat.format(new Date(user.createdAt))}</td><td className="px-4 py-3"><div className="flex gap-1"><button type="button" aria-label={`Sửa ${user.fullName}`} title="Sửa" onClick={() => openEdit(user)} className="rounded-lg p-2 text-(--crm-primary) hover:bg-(--crm-info-soft)"><Pencil size={16} /></button><button type="button" aria-label={`${user.status === "ACTIVE" ? "Ngừng hoạt động" : "Kích hoạt"} ${user.fullName}`} title={user.status === "ACTIVE" ? "Ngừng hoạt động" : "Kích hoạt"} disabled={user.id === currentUserId || busyId === user.id} onClick={() => void toggleStatus(user)} className="rounded-lg p-2 text-(--crm-text-secondary) hover:bg-(--crm-surface-hover) disabled:opacity-30">{user.status === "ACTIVE" ? <UserRoundX size={16} /> : <UserRoundCheck size={16} />}</button></div></td></tr>)}</tbody></table></div>}
            {!loading && <div className="flex flex-wrap items-center justify-between gap-2 border-t border-(--crm-border) px-4 py-3 text-xs text-(--crm-text-secondary)"><span>{filtered.length} người dùng</span><div className="flex items-center gap-2"><Button size="small" disabled={page === 0} onClick={() => setPage((value) => value - 1)}>Trước</Button><span>{page + 1}/{totalPages}</span><Button size="small" disabled={page + 1 >= totalPages} onClick={() => setPage((value) => value + 1)}>Sau</Button></div></div>}
        </div>
        <Dialog open={formOpen} onClose={() => setFormOpen(false)} fullWidth maxWidth="md"><DialogTitle>{editing ? "Chỉnh sửa người dùng" : "Thêm người dùng"}</DialogTitle><DialogContent><div className="pt-2"><UserForm key={editing?.id ?? "new"} initialData={editing ?? undefined} onSubmit={save} onCancel={() => setFormOpen(false)} submitLabel={editing ? "Lưu thay đổi" : "Tạo người dùng"} error={formError} /></div></DialogContent></Dialog>
        <Snackbar open={Boolean(message)} autoHideDuration={3000} onClose={() => setMessage("")} message={message} />
    </div>;
}
