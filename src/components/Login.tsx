import React, { useState, useEffect } from 'react';
import { Lock, User, Shield, Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { authenticateUser } from '../lib/auth';

function generateCaptcha() {
  return Math.random().toString(36).substring(2, 7).toUpperCase();
}

interface LoginProps {
  onLogin: (user: any) => void;
}

export function Login({ onLogin }: LoginProps) {
  const { t, i18n } = useTranslation();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [captchaCode, setCaptchaCode] = useState('');
  const [captchaInput, setCaptchaInput] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const code = generateCaptcha();
    setCaptchaCode(code);
    setCaptchaInput(code); // pre-filled for demo convenience
  }, []);

  const refreshCaptcha = () => {
    const code = generateCaptcha();
    setCaptchaCode(code);
    setCaptchaInput('');
  };

  const toggleLanguage = () => {
    const langs = ['en', 'dar', 'zh'];
    const idx = langs.indexOf(i18n.language);
    const nextLang = langs[(idx + 1) % langs.length];
    i18n.changeLanguage(nextLang);
    document.documentElement.dir = nextLang === 'dar' ? 'rtl' : 'ltr';
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username || !password) {
      setError(t('login.error_empty'));
      return;
    }
    if (captchaInput.toUpperCase() !== captchaCode.toUpperCase()) {
      setError(t('login.error_captcha'));
      refreshCaptcha();
      return;
    }

    setLoading(true);
    await new Promise(r => setTimeout(r, 900));
    const user = authenticateUser(username, password);
    setLoading(false);

    if (user) {
      onLogin(user);
    } else {
      setError(t('login.error_invalid'));
      refreshCaptcha();
    }
  };

  const langLabel = i18n.language === 'en' ? 'EN' : i18n.language === 'dar' ? 'دری' : 'ZH';

  return (
    <div className="min-h-screen flex">
      {/* Left branding panel */}
      <div className="hidden lg:flex lg:w-5/12 bg-slate-900 flex-col justify-between p-10">
        <div>
          <img src="/logo.svg" alt="ATOMA" className="h-24 w-auto mb-10 opacity-90" />
          <h1 className="text-3xl font-bold text-white leading-tight">
            ATOMA Afghanistan
          </h1>
          <p className="text-slate-400 text-sm mt-2 leading-relaxed">
            Customer Application Form Management System
          </p>
          <div className="mt-10 space-y-3">
            {[
              'NTRA-compliant SIM & service registration',
              'Multi-role workflow: Agent → Auditor → Admin',
              'Real-time CRM, BSS & provisioning integration',
            ].map(item => (
              <div key={item} className="flex items-start gap-3">
                <span className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-1.5 flex-shrink-0" />
                <p className="text-slate-300 text-sm">{item}</p>
              </div>
            ))}
          </div>
        </div>
        <p className="text-slate-600 text-xs">
          © 2026 ATOMA Telecom · Regulatory Grade System · v3.0
        </p>
      </div>

      {/* Right login panel */}
      <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 px-6">
        {/* Mobile logo */}
        <div className="lg:hidden mb-8 text-center">
          <img src="/logo.svg" alt="ATOMA" className="h-18 w-auto mx-auto mb-2" />
          <p className="text-sm font-semibold text-gray-700">ATOMA CAF System</p>
        </div>

        <div className="w-full max-w-sm">
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-base font-semibold text-gray-900">{t('login.sign_in_heading')}</h2>
                <p className="text-xs text-gray-500 mt-0.5">{t('login.credentials_subtitle')}</p>
              </div>
              <Shield size={18} className="text-blue-600 opacity-60" />
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              {/* Username */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">{t('login.username')}</label>
                <div className="relative">
                  <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    placeholder={t('login.username_placeholder')}
                    className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white"
                    autoComplete="username"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">{t('login.password')}</label>
                <div className="relative">
                  <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white"
                    autoComplete="current-password"
                  />
                </div>
              </div>

              {/* Captcha */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">{t('login.security_code')}</label>
                <div className="flex gap-2">
                  <div className="flex-1 bg-gray-100 border border-gray-300 rounded-md px-3 py-2 flex items-center justify-center">
                    <span className="font-mono font-bold text-gray-700 tracking-widest text-sm select-none">{captchaCode}</span>
                  </div>
                  <button
                    type="button"
                    onClick={refreshCaptcha}
                    className="px-3 py-2 border border-gray-300 rounded-md text-xs text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    {t('login.refresh')}
                  </button>
                </div>
                <input
                  type="text"
                  value={captchaInput}
                  onChange={e => setCaptchaInput(e.target.value)}
                  placeholder={t('login.captcha_placeholder')}
                  className="w-full mt-2 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* Error */}
              {error && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">{error}</p>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-medium rounded-md transition-colors"
              >
                {loading ? t('login.signing_in') : t('login.sign_in_btn')}
              </button>
            </form>
          </div>

          {/* Demo credentials */}
          <div className="mt-4 bg-white border border-gray-200 rounded-lg p-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">{t('login.demo_credentials')}</p>
            <div className="space-y-1 text-xs text-gray-600 font-mono">
              <p>admin / admin123 <span className="text-gray-400 font-sans">(Administrator)</span></p>
              <p>agent / agent123 <span className="text-gray-400 font-sans">(Agent)</span></p>
              <p>auditor / auditor123 <span className="text-gray-400 font-sans">(Auditor)</span></p>
            </div>
          </div>

          {/* Language toggle */}
          <div className="mt-3 flex justify-center">
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors"
            >
              <Globe size={12} />
              {langLabel} — {t('common.language')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
