import { useNavigate } from 'react-router-dom';
import { CheckCircle2, LogIn } from 'lucide-react';
import AuthPageShell from '../../components/auth/AuthPageShell';

export default function VerifyEmailSuccessPage() {
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate('/login', { replace: true });
  };

  return (
    <AuthPageShell
      title="Xác minh email thành công!"
      description="Cảm ơn bạn đã xác minh email. Bạn có thể quay lại đăng nhập để tiếp tục sử dụng STAPlus CRM."
    >
      <div className="mx-auto w-full max-w-md text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-(--crm-success-light) text-(--crm-success)">
          <CheckCircle2 size={36} />
        </div>

        <button
          type="button"
          onClick={handleLogin}
          className="crm-btn crm-btn--primary w-full justify-center"
        >
          <LogIn size={16} />
          Đi đến đăng nhập
        </button>
      </div>
    </AuthPageShell>
  );
}