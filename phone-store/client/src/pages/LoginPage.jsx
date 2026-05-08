import { useState } from 'react';
import { useNavigate, Navigate, Link, useLocation } from 'react-router-dom';
import { login, register, verifyOTP, resendOTP } from '../api/auth';
import { useAuth } from '../context/AuthContext';
import { Phone } from 'lucide-react';

// 3 màn hình: 'login' | 'register' | 'otp'
export default function LoginPage() {
  const [screen, setScreen] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [otpCode, setOtpCode] = useState('');
  const [pendingEmail, setPendingEmail] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);

  const { user, loginUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from || '/';

  // Đã đăng nhập → về trang chủ
  if (user) return <Navigate to={redirectTo} replace />;

  const set = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    setError('');
  };

  // ── ĐĂNG NHẬP ────────────────────────────────────────────────────────────────
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { data } = await login({ email: form.email, password: form.password });
      // data.data = { user, accessToken, refreshToken }
      const { user, accessToken, refreshToken } = data.data;
      loginUser({ ...user, accessToken, refreshToken });
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Email hoặc mật khẩu không đúng');
    } finally {
      setLoading(false);
    }
  };

  // ── ĐĂNG KÝ ──────────────────────────────────────────────────────────────────
  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await register(form);
      setPendingEmail(form.email);
      setScreen('otp');
      setInfo(`Mã OTP đã được gửi tới ${form.email}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Đăng ký thất bại');
    } finally {
      setLoading(false);
    }
  };

  // ── XÁC THỰC OTP ─────────────────────────────────────────────────────────────
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (otpCode.length !== 6) { setError('OTP phải đúng 6 số'); return; }
    setLoading(true);
    setError('');
    try {
      const { data } = await verifyOTP({ email: pendingEmail, code: otpCode, type: 'verify_email' });
      const { user, accessToken, refreshToken } = data.data;
      loginUser({ ...user, accessToken, refreshToken });
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'OTP không hợp lệ');
    } finally {
      setLoading(false);
    }
  };

  // ── GỬI LẠI OTP ──────────────────────────────────────────────────────────────
  const handleResend = async () => {
    setLoading(true);
    setError('');
    try {
      await resendOTP({ email: pendingEmail, type: 'verify_email' });
      setInfo('Đã gửi lại OTP mới');
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể gửi lại OTP');
    } finally {
      setLoading(false);
    }
  };

  // ── RENDER ────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-red-600 font-bold text-2xl">
            <Phone size={28} /> PhoneStore
          </Link>
          <h2 className="text-xl font-semibold text-gray-800 mt-4">
            {screen === 'login'    && 'Đăng nhập tài khoản'}
            {screen === 'register' && 'Tạo tài khoản mới'}
            {screen === 'otp'      && 'Xác thực email'}
          </h2>
          {screen === 'otp' && (
            <p className="text-sm text-gray-500 mt-1">
              Nhập mã 6 số được gửi tới <span className="font-medium text-gray-700">{pendingEmail}</span>
            </p>
          )}
        </div>

        <div className="card p-8">
          {/* Thông báo lỗi / info */}
          {error && <p className="text-red-500 text-sm bg-red-50 p-3 rounded-lg mb-4">{error}</p>}
          {info  && <p className="text-green-600 text-sm bg-green-50 p-3 rounded-lg mb-4">{info}</p>}

          {/* ── Form Đăng nhập ── */}
          {screen === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <input type="email" placeholder="Email" required value={form.email} onChange={set('email')}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-red-400" />
              <input type="password" placeholder="Mật khẩu" required value={form.password} onChange={set('password')}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-red-400" />
              <button type="submit" disabled={loading}
                className="w-full btn-primary py-2.5 font-semibold rounded-lg disabled:opacity-60">
                {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
              </button>
            </form>
          )}

          {/* ── Form Đăng ký ── */}
          {screen === 'register' && (
            <form onSubmit={handleRegister} className="space-y-4">
              <input type="text" placeholder="Họ và tên" required value={form.name} onChange={set('name')}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-red-400" />
              <input type="email" placeholder="Email" required value={form.email} onChange={set('email')}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-red-400" />
              <input type="password" placeholder="Mật khẩu (tối thiểu 6 ký tự)" required value={form.password} onChange={set('password')}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-red-400" />
              <button type="submit" disabled={loading}
                className="w-full btn-primary py-2.5 font-semibold rounded-lg disabled:opacity-60">
                {loading ? 'Đang đăng ký...' : 'Đăng ký'}
              </button>
            </form>
          )}

          {/* ── Form OTP ── */}
          {screen === 'otp' && (
            <form onSubmit={handleVerifyOTP} className="space-y-4">
              <input
                type="text" inputMode="numeric" maxLength={6} placeholder="Nhập mã 6 số"
                value={otpCode} onChange={(e) => { setOtpCode(e.target.value.replace(/\D/g, '')); setError(''); }}
                className="w-full border border-gray-200 rounded-lg px-4 py-3 text-center text-2xl font-bold tracking-[0.5em] focus:outline-none focus:border-red-400"
              />
              <button type="submit" disabled={loading || otpCode.length !== 6}
                className="w-full btn-primary py-2.5 font-semibold rounded-lg disabled:opacity-60">
                {loading ? 'Đang xác thực...' : 'Xác thực'}
              </button>
              <div className="text-center">
                <button type="button" onClick={handleResend} disabled={loading}
                  className="text-sm text-red-600 hover:underline disabled:opacity-50">
                  Gửi lại mã OTP
                </button>
              </div>
            </form>
          )}

          {/* ── Link chuyển màn ── */}
          {screen !== 'otp' && (
            <p className="text-center text-sm text-gray-500 mt-5">
              {screen === 'login' ? 'Chưa có tài khoản?' : 'Đã có tài khoản?'}{' '}
              <button
                onClick={() => { setScreen(screen === 'login' ? 'register' : 'login'); setError(''); setInfo(''); }}
                className="text-red-600 font-medium hover:underline">
                {screen === 'login' ? 'Đăng ký ngay' : 'Đăng nhập'}
              </button>
            </p>
          )}

          {/* Tài khoản test */}
          {screen === 'login' && (
            <div className="mt-5 border-t pt-4">
              <p className="text-xs text-gray-400 text-center mb-2">Tài khoản test</p>
              <div className="grid grid-cols-2 gap-2">
                {[{ email: 'user@test.com', label: 'User test' }, { email: 'admin@test.com', label: 'Admin test' }].map((a) => (
                  <button key={a.email} type="button"
                    onClick={() => { setForm({ ...form, email: a.email, password: '123456' }); setError(''); }}
                    className="text-xs border border-dashed border-gray-300 rounded-lg px-3 py-2 text-gray-500 hover:border-red-400 hover:text-red-600 transition-colors">
                    {a.label}<br />{a.email}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
