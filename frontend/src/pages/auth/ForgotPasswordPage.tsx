import { Button, TextField } from "@mui/material";
import { ArrowLeft, MailCheck } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

import AuthPageShell from "../../components/auth/AuthPageShell";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setMessage("");
        setError("");

        const trimmedEmail = email.trim();

        if (!trimmedEmail) {
            setError("Vui lòng nhập email.");
            return;
        }

        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailPattern.test(trimmedEmail)) {
            setError("Vui lòng nhập địa chỉ email hợp lệ.");
            return;
        }

        setMessage(
            "Yêu cầu đã được kiểm tra ở giao diện. Chức năng gửi email đặt lại mật khẩu chưa được kết nối."
        );
    };

    return (
        <AuthPageShell
            title="Quên mật khẩu"
            description="Nhập email của bạn để yêu cầu đặt lại mật khẩu."
        >
            <form onSubmit={handleSubmit} className="crm-form" noValidate>
                <TextField
                    label="Địa chỉ email"
                    type="email"
                    fullWidth
                    autoComplete="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    error={!!error}
                    helperText={error || "Nhập email đã đăng ký tài khoản CRM."}
                />

                {message && (
                    <div
                        role="status"
                        className="rounded-lg border border-sky-200 bg-sky-50 p-3 text-sm leading-relaxed text-sky-800"
                    >
                        <div className="mb-1 flex items-center gap-2 font-semibold">
                            <MailCheck size={18} />
                            Thông báo
                        </div>
                        {message}
                    </div>
                )}

                <Button type="submit" variant="contained" fullWidth size="large">
                    Gửi yêu cầu
                </Button>
            </form>

            <p className="mt-5 text-center text-sm text-(--crm-text-secondary)">
                <Link
                    to="/login"
                    className="inline-flex items-center gap-2 font-medium text-(--crm-primary) hover:underline"
                >
                    <ArrowLeft size={16} />
                    Quay lại đăng nhập
                </Link>
            </p>
        </AuthPageShell>
    );
}