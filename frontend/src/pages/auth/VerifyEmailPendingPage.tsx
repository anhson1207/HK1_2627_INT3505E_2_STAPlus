import { useLocation, useNavigate } from 'react-router-dom';
import { MailCheck, ArrowLeft, RefreshCw, ExternalLink } from 'lucide-react';
import AuthPageShell from '../../components/auth/AuthPageShell';

interface VerifyEmailPendingState {
  email?: string;
  message?: string;
}

export default function VerifyEmailPendingPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const state = (location.state ?? {}) as VerifyEmailPendingState;
  const email = state.email ?? '';
  const message =
    state.message ??
    'Vui lòng kiểm tra hộp thư để xác minh địa chỉ email của bạn.';

  const handleBackToLogin = () => {
    navigate('/login');
  };

  const handleResendEmail = () => {
    // TODO: Connect to the resend verification email API.
  };

  const handleOpenEmail = () => {
    window.open('https://mail.google.com/', '_blank', 'noopener,noreferrer');
  };

  return (
    <AuthPageShell
  title="Kiểm tra email của bạn"
  description="Vui lòng kiểm tra hộp thư để xác minh địa chỉ email của bạn."
>
      <div className="mx-auto w-full max-w-md px-4 py-8 text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-cyan-50 text-[#007f9b]">
          <MailCheck size={34} />
        </div>

        <h1 className="mb-3 text-2xl font-bold text-gray-900">
          Kiểm tra email của bạn
        </h1>

        <p className="mb-4 text-sm leading-6 text-gray-600">
          {message}
        </p>

        {email && (
          <p className="mb-6 break-all font-medium text-gray-900">
            {email}
          </p>
        )}

        <button
          type="button"
          onClick={handleOpenEmail}
          className="mb-3 flex w-full items-center justify-center gap-2 rounded-lg bg-[#007f9b] px-4 py-3 font-medium text-white transition hover:bg-[#00677e]"
        >
          Mở hộp thư
          <ExternalLink size={18} />
        </button>

        <button
          type="button"
          onClick={handleResendEmail}
          className="mb-4 flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 py-3 font-medium text-gray-700 transition hover:bg-gray-50"
        >
          <RefreshCw size={18} />
          Gửi lại email xác minh
        </button>

        <button
          type="button"
          onClick={handleBackToLogin}
          className="mx-auto flex items-center justify-center gap-2 text-sm text-gray-600 transition hover:text-[#007f9b]"
        >
          <ArrowLeft size={16} />
          Quay lại đăng nhập
        </button>
      </div>
    </AuthPageShell>
  );
}