import { Alert, Button, CircularProgress, Snackbar } from "@mui/material";
import { ExternalLink, MailCheck } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";

import AuthPageShell from "../../components/auth/AuthPageShell";
import { authService } from "../../services/authService";

interface VerificationLocationState {
    email?: string;
    message?: string;
}

export default function VerifyEmailPendingPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const state = location.state as VerificationLocationState | null;
    const email = state?.email ?? "";
    const [loadingAction, setLoadingAction] = useState<"verify" | "resend" | null>(null);
    const [error, setError] = useState("");
    const [message, setMessage] = useState(state?.message ?? "");

    const handleResend = async () => {
        if (!email) return;
        setLoadingAction("resend");
        setError("");
        try {
            await authService.resendVerification(email);
            setMessage("Đã gửi lại email xác nhận");
        } catch (resendError) {
            setError(resendError instanceof Error ? resendError.message : "Không thể gửi lại email");
        } finally {
            setLoadingAction(null);
        }
    };

    const handleVerify = async () => {
        if (!email) return;
        setLoadingAction("verify");
        setError("");
        try {
            await authService.verifyEmail(email);
            navigate("/verify-email-success", { replace: true });
        } catch (verifyError) {
            setError(verifyError instanceof Error ? verifyError.message : "Không thể xác nhận email");
        } finally {
            setLoadingAction(null);
        }
    };

    return (
        <AuthPageShell title="Kiểm tra email của bạn" description="Chúng tôi đã gửi email xác nhận tới:">
            <div className="text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-blue-600"><MailCheck size={26} /></div>
                {email ? <p className="font-semibold text-slate-800">{email}</p> : <Alert severity="warning">Không tìm thấy email đăng ký. Vui lòng đăng ký lại.</Alert>}
                {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}

                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                    <Button variant="outlined" onClick={() => window.open("https://mail.google.com", "_blank", "noopener,noreferrer")} startIcon={<ExternalLink size={17} />}>Mở email</Button>
                    <Button variant="outlined" disabled={!email || loadingAction !== null} onClick={() => void handleResend()} startIcon={loadingAction === "resend" ? <CircularProgress size={16} /> : undefined}>
                        {loadingAction === "resend" ? "Đang gửi..." : "Gửi lại email"}
                    </Button>
                </div>

                <div className="mt-6 rounded-lg border border-dashed border-amber-300 bg-amber-50 p-4">
                    <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-amber-700">Dev mode</p>
                    <Button variant="contained" disabled={!email || loadingAction !== null} onClick={() => void handleVerify()} startIcon={loadingAction === "verify" ? <CircularProgress size={16} color="inherit" /> : undefined}>
                        {loadingAction === "verify" ? "Đang xác nhận..." : "Xác nhận email ngay"}
                    </Button>
                </div>
                <p className="mt-5 text-sm text-slate-500"><Link to="/login" className="font-medium text-blue-600 hover:underline">Quay lại đăng nhập</Link></p>
            </div>
            <Snackbar open={Boolean(message)} autoHideDuration={3000} onClose={() => setMessage("")} message={message} />
        </AuthPageShell>
    );
}
