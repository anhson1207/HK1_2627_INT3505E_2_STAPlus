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
      description={message}
    >
      <div className="mx-auto w-full max-w-md text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-(--crm-surface-hover) text-(--crm-primary)">
          <MailCheck size={34} />
        </div>

        {email && (
          <p className="mb-6 break-all font-medium text-(--crm-heading)">
            {email}
          </p>
        )}

        <button
          type="button"
          onClick={handleOpenEmail}
          className="crm-btn crm-btn--primary mb-3 w-full justify-center"
        >
          Mở hộp thư
          <ExternalLink size={16} />
        </button>

        <button
          type="button"
          onClick={handleResendEmail}
          className="crm-btn crm-btn--secondary mb-4 w-full justify-center"
        >
          <RefreshCw size={16} />
          Gửi lại email xác minh
        </button>

        <button
          type="button"
          onClick={handleBackToLogin}
          className="mx-auto flex items-center justify-center gap-2 text-sm text-(--crm-text-secondary) transition hover:text-(--crm-primary)"
        >
          <ArrowLeft size={16} />
          Quay lại đăng nhập
        </button>
      </div>
    </AuthPageShell>
  );
}