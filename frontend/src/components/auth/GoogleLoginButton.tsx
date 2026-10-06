import { Alert, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Snackbar } from "@mui/material";
import { Mail } from "lucide-react";
import { useState } from "react";

interface GoogleLoginButtonProps {
    onLogin: () => Promise<void>;
    onSuccess: () => void;
}

export default function GoogleLoginButton({ onLogin, onSuccess }: GoogleLoginButtonProps) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    const handleSelectAccount = async () => {
        setLoading(true);
        setError("");
        try {
            await onLogin();
            setOpen(false);
            setSuccess(true);
            window.setTimeout(onSuccess, 650);
        } catch (loginError) {
            setError(loginError instanceof Error ? loginError.message : "Không thể đăng nhập với Google");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Button variant="outlined" fullWidth size="large" onClick={() => setOpen(true)} startIcon={<Mail size={18} />}>
                Tiếp tục với Google
            </Button>
            <Dialog open={open} onClose={loading ? undefined : () => setOpen(false)} maxWidth="xs" fullWidth>
                <DialogTitle>Chọn tài khoản Google</DialogTitle>
                <DialogContent>
                    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                    <button type="button" disabled={loading} onClick={() => void handleSelectAccount()} className="flex w-full items-center gap-3 rounded-lg border border-(--crm-border) p-4 text-left transition hover:bg-(--crm-surface-subtle) disabled:opacity-60">
                        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-(--crm-info-soft) font-semibold text-(--crm-primary)">S</span>
                        <span><span className="block text-sm font-semibold text-(--crm-heading)">Nguyễn Anh Sơn</span><span className="block text-xs text-(--crm-text-secondary)">son@gmail.com</span></span>
                        {loading && <CircularProgress size={18} className="ml-auto" />}
                    </button>
                </DialogContent>
                <DialogActions><Button onClick={() => setOpen(false)} disabled={loading} color="inherit">Hủy</Button></DialogActions>
            </Dialog>
            <Snackbar open={success} message="Đăng nhập Google thành công" />
        </>
    );
}
