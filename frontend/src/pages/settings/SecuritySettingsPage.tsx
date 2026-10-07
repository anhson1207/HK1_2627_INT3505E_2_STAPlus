import { Alert, Button, Snackbar, TextField } from "@mui/material";
import { Laptop, LockKeyhole, LogOut } from "lucide-react";
import { useState } from "react";

export default function SecuritySettingsPage() {
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const changePassword = () => {
        if (!currentPassword || newPassword.length < 6 || newPassword !== confirmPassword) { setError("Nhập mật khẩu hiện tại, mật khẩu mới ít nhất 6 ký tự và xác nhận trùng khớp."); return; }
        setCurrentPassword(""); setNewPassword(""); setConfirmPassword(""); setError("");
        setMessage("Đã ghi nhận yêu cầu đổi mật khẩu (mock, chưa thay đổi mật khẩu đăng nhập)");
    };
    return <div className="space-y-5"><div className="crm-card crm-card__body"><div className="mb-5 flex items-center gap-2"><LockKeyhole size={20} className="text-(--crm-primary)" /><h2 className="text-lg font-semibold text-(--crm-heading)">Đổi mật khẩu</h2></div><Alert severity="info" className="mb-5">Bản demo frontend: thao tác này chưa thay đổi mật khẩu đăng nhập.</Alert><div className="crm-form-grid"><TextField type="password" label="Mật khẩu hiện tại" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} fullWidth /><div className="hidden md:block" /><TextField type="password" label="Mật khẩu mới" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} fullWidth /><TextField type="password" label="Xác nhận mật khẩu mới" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} fullWidth /></div>{error && <p className="mt-3 text-sm text-(--crm-danger)">{error}</p>}<div className="mt-5 flex justify-end"><Button variant="contained" onClick={changePassword}>Đổi mật khẩu</Button></div></div>
        <div className="crm-card crm-card__body"><div className="mb-5 flex items-center gap-2"><Laptop size={20} className="text-(--crm-primary)" /><h2 className="text-lg font-semibold text-(--crm-heading)">Phiên đăng nhập</h2></div><div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-(--crm-border-subtle) bg-(--crm-surface-subtle) p-4"><div><p className="text-sm font-medium text-(--crm-heading)">Trình duyệt hiện tại</p><p className="mt-1 text-xs text-(--crm-text-secondary)">Phiên đang hoạt động · dữ liệu minh họa</p></div><span className="rounded-full bg-(--crm-success-soft) px-2.5 py-1 text-xs font-medium text-(--crm-green-dark)">Đang hoạt động</span></div><div className="mt-5 flex flex-wrap items-center justify-between gap-3"><p className="text-xs text-(--crm-text-secondary)">Không có kết nối phiên thực tế khi chưa có backend.</p><Button variant="outlined" color="error" startIcon={<LogOut size={16} />} onClick={() => setMessage("Đã ghi nhận yêu cầu đăng xuất các phiên khác (mock)")}>Đăng xuất tất cả phiên</Button></div></div>
        <Snackbar open={Boolean(message)} autoHideDuration={4000} onClose={() => setMessage("")} message={message} />
    </div>;
}
