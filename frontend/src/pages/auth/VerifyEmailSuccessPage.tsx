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
      title="Xác minh email thành công"
      description="Địa chỉ email của bạn đã được xác minh."
    >
      <div className="mx-auto w-full max-w-md px-4 py-8 text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-50 text-green-600">
          <CheckCircle2 size={36} />
        </div>

        <h1 className="mb-3 text-2xl font-bold text-gray-900">
          Email đã được xác minh!
        </h1>

        <p className="mb-8 text-sm leading-6 text-gray-600">
          Cảm ơn bạn đã xác minh email. Bạn có thể quay lại đăng nhập
          để tiếp tục sử dụng STAPlus CRM.
        </p>

        <button
          type="button"
          onClick={handleLogin}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#007f9b] px-4 py-3 font-medium text-white transition hover:bg-[#00677e]"
        >
          <LogIn size={18} />
          Đi đến đăng nhập
        </button>
      </div>
    </AuthPageShell>
  );
}