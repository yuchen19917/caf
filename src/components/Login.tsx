import React, { useState, useEffect } from 'react';
import { 
  Lock, 
  User, 
  Shield,
  Globe,
  AlertCircle,
} from 'lucide-react';
import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { authenticateUser, getRoleDisplayName, getRoleColor } from '../lib/auth';

interface LoginProps {
  onLogin: (user: any) => void;
}

export function Login({ onLogin }: LoginProps) {
  const { t, i18n } = useTranslation();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [captcha, setCaptcha] = useState('');
  const [captchaCode, setCaptchaCode] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Generate random captcha
  const generateCaptcha = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 4; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaCode(code);
    // Auto-fill captcha for convenience
    setCaptcha(code);
  };

  useEffect(() => {
    generateCaptcha();
  }, []);

  const toggleLanguage = () => {
    const nextLang = i18n.language === 'en' ? 'zh' : 'en';
    i18n.changeLanguage(nextLang);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    // Validate captcha
    if (captcha.toUpperCase() !== captchaCode) {
      setError(i18n.language === 'en' ? 'Invalid captcha code' : '验证码错误');
      generateCaptcha();
      return;
    }
    
    setIsAuthenticating(true);
    
    // Simulate authentication delay
    setTimeout(() => {
      const user = authenticateUser(username, password);
      
      if (user) {
        setIsAuthenticating(false);
        onLogin(user);
      } else {
        setIsAuthenticating(false);
        setError(i18n.language === 'en' ? 'Invalid username or password' : '用户名或密码错误');
        generateCaptcha();
      }
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-6 font-sans">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Logo Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center mb-3">
             <img 
               src="/logo.svg" 
               alt="ATOMA Logo" 
               className="h-20 w-auto"
             />
          </div>
          <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">CAF Management System</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8 border border-slate-200">
          {/* Loading Overlay */}
          {isAuthenticating && (
            <div className="absolute inset-0 bg-white/90 backdrop-blur-sm z-50 flex flex-col items-center justify-center space-y-3 rounded-2xl">
               <div className="relative w-12 h-12">
                  <div className="absolute inset-0 border-4 border-indigo-100 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
               </div>
               <p className="text-xs font-semibold text-indigo-600">
                 {i18n.language === 'en' ? 'Authenticating...' : '正在验证...'}
               </p>
            </div>
          )}

          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold text-slate-800">{t('login.title')}</h2>
              <button 
                type="button"
                onClick={toggleLanguage}
                className="px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-[10px] font-semibold text-slate-600 hover:bg-slate-100 transition-all flex items-center gap-1.5"
              >
                <Globe size={12} />
                {i18n.language === 'en' ? 'EN' : '中文'}
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-2"
              >
                <AlertCircle size={16} className="text-rose-600 shrink-0" />
                <p className="text-xs text-rose-700 font-medium">{error}</p>
              </motion.div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              {/* Username */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-600">
                  {i18n.language === 'en' ? 'Username' : '用户名'}
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    required
                    type="text" 
                    placeholder={i18n.language === 'en' ? 'Enter username' : '请输入用户名'}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-600">
                  {i18n.language === 'en' ? 'Password' : '密码'}
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    required
                    type="password" 
                    placeholder={i18n.language === 'en' ? 'Enter password' : '请输入密码'}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              {/* Captcha */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-600">
                  {i18n.language === 'en' ? 'Captcha' : '验证码'}
                </label>
                <div className="flex gap-3">
                  <div className="relative flex-1">
                    <Shield className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      required
                      type="text" 
                      placeholder={i18n.language === 'en' ? 'Enter captcha' : '请输入验证码'}
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                      value={captcha}
                      onChange={(e) => setCaptcha(e.target.value)}
                      maxLength={4}
                    />
                  </div>
                  <div 
                    className="w-28 h-[46px] bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg flex items-center justify-center cursor-pointer select-none hover:from-indigo-600 hover:to-indigo-700 transition-all active:scale-95"
                    onClick={generateCaptcha}
                    title={i18n.language === 'en' ? 'Click to refresh' : '点击刷新'}
                  >
                    <span className="text-white font-bold text-xl tracking-widest" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.2)' }}>
                      {captchaCode}
                    </span>
                  </div>
                </div>
              </div>

              <button 
                type="submit"
                className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-all shadow-md hover:shadow-lg active:scale-[0.98] mt-6"
              >
                {t('login.authorize')}
              </button>
            </form>
          </div>
        </div>

        <p className="text-center text-xs text-slate-400 mt-6">
          © 2026 ATOMA Telecom. All rights reserved.
        </p>
      </motion.div>
    </div>
  );
}
