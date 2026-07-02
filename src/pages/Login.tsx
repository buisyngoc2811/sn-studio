import React, { useState } from 'react';
import { ShimmerButton } from '../components/ShimmerButton';
import { supabase } from '../lib/supabase';

interface LoginProps {
  onLoginSuccess: (username: string) => void;
  setRoute: (route: string) => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess, setRoute }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showToast, setShowToast] = useState(false);

  const strength = password.length === 0 ? 0 : password.length < 6 ? 1 : password.length < 10 && !/[A-Z]/.test(password) ? 2 : 3;
  const strengthColors = ['bg-zinc-800', 'bg-red-500', 'bg-amber-500', 'bg-emerald-500'];
  const strengthText = ['', 'Yếu', 'Trung bình', 'Mạnh'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!username.trim() || !password.trim()) {
      if (isRegister) alert('Vui lòng điền đầy đủ tài khoản và mật khẩu!');
      else setErrorMsg('Vui lòng điền Email/Tài khoản và mật khẩu!');
      return;
    }
    if (isRegister && !agreeTerms) {
      alert('Bạn phải đồng ý với Điều khoản và Chính sách bảo mật!');
      return;
    }
    if (isRegister && password !== confirmPassword) {
      alert('Mật khẩu xác nhận không khớp!');
      return;
    }
    
    setIsLoading(true);

    if (isRegister) {
      const { data, error } = await supabase.auth.signUp({
        email: username,
        password: password,
      });

      setIsLoading(false);

      if (error) {
        alert(`Đăng ký thất bại: ${error.message}`);
        return;
      }
      
      alert(`Đăng ký thành công! Vui lòng kiểm tra email để xác nhận (nếu có yêu cầu).`);
      setIsRegister(false);
      
    } else {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: username,
        password: password,
      });
      
      setIsLoading(false);

      if (error) {
        setErrorMsg('Tài khoản hoặc mật khẩu không chính xác!');
      } else if (data.session) {
        onLoginSuccess(data.session.user?.email || 'User');
        setRoute('dashboard');
      }
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:py-24">
      {/* Success Toast */}
      <div className={`fixed top-4 right-4 z-[100] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${showToast ? 'translate-y-0 opacity-100 scale-100' : '-translate-y-4 opacity-0 scale-95 pointer-events-none'}`}>
        <div className="flex items-center gap-3 rounded-2xl border border-brand-accent/30 bg-[#0a0a0e]/95 p-4 shadow-[0_8px_30px_rgba(255,34,68,0.15)] backdrop-blur-xl relative overflow-hidden">
          <div className="absolute inset-0 bg-brand-accent/5 pointer-events-none" />
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-accent/20 text-brand-accent relative z-10">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
          </div>
          <div className="relative z-10 pr-2">
            <h4 className="text-sm font-semibold text-white tracking-wide">Đăng nhập thành công</h4>
            <p className="text-[11px] text-zinc-400 mt-0.5">Đang chuyển hướng đến bảng điều khiển...</p>
          </div>
        </div>
      </div>

      {/* Glow orb */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 h-[300px] w-[300px] bg-brand-600/15 blur-[100px] rounded-full -z-10 animate-pulse pointer-events-none" />

      {/* Main Card */}
      <div className="relative rounded-2xl border border-white/[0.08] bg-[#0a0a0e]/60 p-8 shadow-[0_8px_32px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.05)] backdrop-blur-2xl transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_16px_48px_rgba(255,34,68,0.15),inset_0_1px_0_rgba(255,255,255,0.08)] group overflow-hidden">
        
        {/* Animated Border */}
        <div className="absolute inset-[-50%] bg-[conic-gradient(from_0deg_at_50%_50%,transparent_0%,rgba(255,34,68,0.4)_50%,transparent_100%)] animate-[spin_4s_linear_infinite] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none -z-20" />
        {/* Inner glass mask to hide the center of the conic gradient, leaving only the border */}
        <div className="absolute inset-[1px] rounded-2xl bg-[#0a0a0e]/90 backdrop-blur-3xl pointer-events-none -z-10" />

        {/* Logo and Header */}
        <div className="relative z-10 flex flex-col items-center text-center space-y-3 mb-8">
          <svg className="h-10 w-10 text-brand-accent drop-shadow-[0_0_12px_rgba(255,34,68,0.6)] group-hover:scale-105 transition-transform duration-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polygon points="12 2 2 7 12 12 22 7 12 2" />
            <polyline points="2 17 12 22 22 17" />
            <polyline points="2 12 12 17 22 12" />
          </svg>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">
              {isRegister ? 'Tạo tài khoản SN Studio' : 'Chào mừng đến với SN Studio'}
            </h1>
            <p className="text-xs text-zinc-400 mt-1.5">
              {isRegister ? 'Đăng ký để tải ứng dụng và tham gia cộng đồng.' : 'Đăng nhập tài khoản để quản lý ứng dụng và tham gia cộng đồng.'}
            </p>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="relative z-10 space-y-5">
          
          {!isRegister && errorMsg && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3.5 flex items-start gap-2.5 shadow-[inset_0_0_20px_rgba(239,68,68,0.05)]">
              <svg className="w-4 h-4 text-red-400 mt-0.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
              <p className="text-xs text-red-200 font-medium leading-relaxed">{errorMsg}</p>
            </div>
          )}

          <div className="float-label">
            <input
              type="text"
              placeholder=" "
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="premium-input w-full rounded-xl bg-white/[0.03] border border-white/[0.08] px-4 py-3.5 text-sm text-white focus:outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent focus:shadow-[0_0_15px_rgba(255,34,68,0.2)] transition-all duration-300"
            />
            <label>{isRegister ? 'Tài khoản' : 'Email hoặc Tài khoản'}</label>
          </div>

          <div>
            <div className="float-label relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder=" "
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="premium-input w-full rounded-xl bg-white/[0.03] border border-white/[0.08] px-4 py-3.5 pr-10 text-sm text-white focus:outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent focus:shadow-[0_0_15px_rgba(255,34,68,0.2)] transition-all duration-300"
              />
              <label>Mật khẩu</label>
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-[14px] text-zinc-500 hover:text-zinc-300 transition-colors"
                title={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
              >
                <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  {showPassword ? (
                     <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24M1 1l22 22" />
                  ) : (
                     <>
                       <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                       <circle cx="12" cy="12" r="3" />
                     </>
                  )}
                </svg>
              </button>
            </div>

            {isRegister && password.length > 0 && (
              <div className="mt-2.5 flex items-center gap-2 px-1">
                <div className="flex flex-1 gap-1 h-1">
                  <div className={`flex-1 rounded-full transition-colors duration-300 ${strength >= 1 ? strengthColors[strength] : 'bg-white/[0.08]'}`} />
                  <div className={`flex-1 rounded-full transition-colors duration-300 ${strength >= 2 ? strengthColors[strength] : 'bg-white/[0.08]'}`} />
                  <div className={`flex-1 rounded-full transition-colors duration-300 ${strength >= 3 ? strengthColors[strength] : 'bg-white/[0.08]'}`} />
                </div>
                <span className={`text-[10px] font-medium w-16 text-right transition-colors duration-300 ${strength === 3 ? 'text-emerald-400' : strength === 2 ? 'text-amber-400' : 'text-red-400'}`}>
                  {strengthText[strength]}
                </span>
              </div>
            )}

            {!isRegister && (
              <div className="text-right mt-2">
                <a 
                  href="#" 
                  onClick={(e) => { e.preventDefault(); alert("Chức năng khôi phục mật khẩu đang được kích hoạt qua hệ thống SMS/Email tự động."); }} 
                  className="text-[11px] text-zinc-500 hover:text-brand-400 transition-colors font-medium"
                >
                  Quên mật khẩu?
                </a>
              </div>
            )}
          </div>

          {isRegister && (
            <div>
              <div className="float-label mt-4">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder=" "
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`premium-input w-full rounded-xl bg-white/[0.03] px-4 py-3.5 pr-10 text-sm text-white focus:outline-none transition-all duration-300 ${
                    confirmPassword.length > 0 && confirmPassword !== password 
                      ? 'border-red-500/50 focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:shadow-[0_0_15px_rgba(239,68,68,0.2)]'
                      : 'border-white/[0.08] focus:border-brand-accent focus:ring-1 focus:ring-brand-accent focus:shadow-[0_0_15px_rgba(255,34,68,0.2)]'
                  }`}
                />
                <label>Xác nhận mật khẩu</label>
              </div>
              {confirmPassword.length > 0 && confirmPassword !== password && (
                <p className="text-[10px] text-red-400 font-medium mt-1.5 px-1 tracking-wide">
                  Mật khẩu xác nhận không khớp!
                </p>
              )}
            </div>
          )}

          {/* Agreement or Remember me check */}
          <div className="flex items-center gap-2 py-1">
            <input
              type="checkbox"
              id="remember_agree"
              checked={isRegister ? agreeTerms : true}
              onChange={(e) => isRegister && setAgreeTerms(e.target.checked)}
              readOnly={!isRegister}
              className="h-3.5 w-3.5 rounded bg-zinc-900 border-zinc-700 accent-brand-accent cursor-pointer focus:ring-brand-accent/50"
            />
            <label htmlFor="remember_agree" className="text-[11px] text-zinc-400 cursor-pointer select-none hover:text-zinc-300 transition-colors">
              {isRegister ? (
                <>Tôi đồng ý với <a href="#" className="text-brand-400 hover:underline">Điều khoản</a> và <a href="#" className="text-brand-400 hover:underline">Chính sách bảo mật</a>.</>
              ) : (
                'Duy trì đăng nhập trên thiết bị này'
              )}
            </label>
          </div>

          {/* Submit Button */}
          <ShimmerButton disabled={isLoading} type="submit" className={`w-full py-3.5 font-semibold text-sm mt-3 animate-pulse-subtle hover:animate-none ${isLoading ? 'opacity-80 cursor-not-allowed' : ''}`}>
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="h-4 w-4 animate-spin text-white" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                Đang kết nối...
              </span>
            ) : (
              isRegister ? 'Đăng ký ngay' : 'Đăng nhập ngay'
            )}
          </ShimmerButton>
        </form>

        {/* Register Footer Link */}
        <div className="relative z-10 mt-8 text-center text-[11px] text-zinc-500 pt-6 border-t border-white/[0.06]">
          {isRegister ? 'Đã có tài khoản SN Studio? ' : 'Chưa có tài khoản SN Studio? '}
          <a 
            href="#" 
            onClick={(e) => { e.preventDefault(); setIsRegister(!isRegister); }} 
            className="text-brand-400 hover:text-brand-300 font-semibold transition-colors"
          >
            {isRegister ? 'Đăng nhập ngay' : 'Đăng ký tài khoản mới'}
          </a>
        </div>
      </div>
    </div>
  );
};
