import React, { useState } from 'react';
import { 
  Shield, 
  Lock, 
  User, 
  ChevronRight, 
  Globe, 
  Cpu,
  Fingerprint
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { useTranslation } from 'react-i18next';

interface LoginProps {
  onLogin: (user: any) => void;
}

export function Login({ onLogin }: LoginProps) {
  const { t, i18n } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const toggleLanguage = () => {
    const nextLang = i18n.language === 'en' ? 'zh' : 'en';
    i18n.changeLanguage(nextLang);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsAuthenticating(true);
    
    // Simulate secure enterprise authentication
    setTimeout(() => {
      setIsAuthenticating(false);
      onLogin({ 
        id: 'U992', 
        name: 'Administrator', 
        role: 'Super Admin',
        email: email || 'admin@atoma.cloud'
      });
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-600/20 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/20 blur-[120px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo Section */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 mb-4">
             <div className="relative w-12 h-12 flex items-center justify-center">
                <div className="absolute inset-0 bg-blue-700 rotate-45 rounded-md shadow-2xl shadow-blue-500/40 translate-x-[-4px] translate-y-[4px]" />
                <div className="absolute inset-0 bg-cyan-500 rotate-45 rounded-md opacity-80 translate-x-[4px] translate-y-[-4px]" />
             </div>
             <h1 className="text-5xl font-black text-white tracking-tighter italic">ATOMA</h1>
          </div>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-[0.3em] mt-2">CAF Management Gateway</p>
        </div>

        <div className="bg-white rounded-[2.5rem] shadow-2xl p-10 relative overflow-hidden border border-white/10">
          {/* Internal Loading Overlay */}
          {isAuthenticating && (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center space-y-4 animate-in fade-in duration-300">
               <div className="relative w-16 h-16">
                  <div className="absolute inset-0 border-4 border-indigo-100 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
               </div>
               <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest animate-pulse">Establishing Secure Socket...</p>
            </div>
          )}

          <div className="space-y-8">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <h2 className="text-xl font-bold text-slate-800 tracking-tight">{t('login.title')}</h2>
                <p className="text-slate-400 text-xs font-medium max-w-[200px]">{t('login.subtitle')}</p>
              </div>
              <button 
                type="button"
                onClick={toggleLanguage}
                className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-widest hover:bg-slate-100 transition-all flex items-center gap-2"
              >
                <Globe size={12} className="text-indigo-600" />
                {i18n.language === 'en' ? 'English' : '中文'}
              </button>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">{t('login.identifier')}</label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors" size={18} />
                    <input 
                      required
                      type="text" 
                      placeholder="e.g. admin@atoma.cloud"
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all text-slate-700"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between ml-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('login.secret')}</label>
                    <button type="button" className="text-[9px] font-bold text-indigo-600 uppercase tracking-widest hover:underline">{t('login.reset')}</button>
                  </div>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors" size={18} />
                    <input 
                      required
                      type="password" 
                      placeholder="••••••••"
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all text-slate-700"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 py-2">
                <div className="flex items-center justify-center w-8 h-8 bg-emerald-50 rounded-lg text-emerald-600">
                  <Shield size={16} />
                </div>
                <p className="text-[9px] font-bold text-slate-500 uppercase leading-relaxed tracking-wider">
                  Session protected by RSA-4096 <br/> & Multi-Factor Biometric Layer
                </p>
              </div>

              <button 
                type="submit"
                className="w-full group flex items-center justify-between bg-indigo-600 text-white p-2 rounded-2xl hover:bg-slate-900 transition-all shadow-xl shadow-indigo-600/20 active:scale-95"
              >
                <div className="flex items-center justify-center w-12 h-12 bg-white/10 rounded-xl">
                   <Fingerprint size={20} />
                </div>
                <span className="text-xs font-bold uppercase tracking-[0.2em] -ml-4">{t('login.authorize')}</span>
                <div className="flex items-center justify-center w-12 h-12 bg-white/10 rounded-xl group-hover:translate-x-1 transition-transform">
                   <ChevronRight size={18} />
                </div>
              </button>
            </form>
          </div>
        </div>

        <div className="mt-8 flex items-center justify-center gap-6 opacity-40">
           <div className="flex items-center gap-2">
              <Globe size={14} className="text-white" />
              <span className="text-[9px] font-bold text-white uppercase tracking-widest">Global Node V4.2</span>
           </div>
           <div className="w-1 h-1 bg-white rounded-full" />
           <span className="text-[9px] font-bold text-white uppercase tracking-widest">Secure Cloud Ops</span>
        </div>
      </motion.div>
    </div>
  );
}
