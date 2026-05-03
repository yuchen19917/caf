import React from 'react';
import { 
  LayoutDashboard, 
  FileText, 
  FolderOpen, 
  ShieldCheck, 
  Settings, 
  Menu, 
  X,
  Smartphone,
  LogOut,
  PlusCircle,
  Layers
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { useTranslation } from 'react-i18next';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onLogout: () => void;
}

export default function Sidebar({ activeTab, setActiveTab, isOpen, setIsOpen, onLogout }: SidebarProps) {
  const { t } = useTranslation();
  const menuItems = [
    { id: 'dashboard', label: t('common.dashboard'), icon: LayoutDashboard },
    { id: 'applications', label: t('common.applications'), icon: FileText },
    { id: 'documents', label: t('common.documents'), icon: FolderOpen },
    { id: 'templates', label: t('common.templates'), icon: Layers },
    { id: 'audit', label: t('common.audit'), icon: ShieldCheck },
  ];

  return (
    <>
      {/* Mobile Toggle */}
      <button 
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-slate-900 text-white rounded-md"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-40 w-60 bg-white text-slate-600 transition-transform duration-300 ease-in-out lg:translate-x-0 border-r border-slate-200",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-8 flex items-center space-x-3">
            <div className="relative w-8 h-8 flex items-center justify-center">
              <div className="absolute inset-0 bg-blue-700 rotate-45 rounded-sm shadow-md shadow-blue-500/20 translate-x-[-2px] translate-y-[2px]" />
              <div className="absolute inset-0 bg-cyan-500 rotate-45 rounded-sm opacity-80 translate-x-[2px] translate-y-[-2px]" />
            </div>
            <div>
              <h1 className="text-slate-800 font-black tracking-tighter text-xl leading-tight italic">ATOMA</h1>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-6 space-y-4 overflow-y-auto">
            <div>
              <h3 className="px-3 mb-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Management</h3>
              <ul className="space-y-1.5">
                {menuItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      if (window.innerWidth < 1024) setIsOpen(false);
                    }}
                    className={cn(
                      "w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-all group",
                      activeTab === item.id 
                        ? "bg-indigo-50 text-indigo-700" 
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    )}
                  >
                    <item.icon size={16} className={cn(
                      "transition-colors",
                      activeTab === item.id ? "text-indigo-600" : "text-slate-400 group-hover:text-slate-500"
                    )} />
                    <span>{item.label}</span>
                  </button>
                ))}
              </ul>
            </div>

            <div className="pt-4">
              <h3 className="px-3 mb-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Action Center</h3>
              <button 
                onClick={() => setActiveTab('new-caf')}
                className={cn(
                  "w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-all",
                  activeTab === 'new-caf' ? "bg-indigo-50 text-indigo-700" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                <PlusCircle size={16} className={activeTab === 'new-caf' ? "text-indigo-600" : "text-slate-400"} />
                <span>{t('common.new_caf')}</span>
              </button>
            </div>
          </nav>

          {/* Daily Quota Card */}
          <div className="p-6 mt-auto">
            <div className="p-4 bg-slate-900 rounded-xl text-white shadow-xl shadow-slate-900/10 mb-6">
              <div className="flex justify-between items-center mb-3">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Daily Quota</p>
                <span className="text-[10px] py-0.5 px-1.5 bg-indigo-500/20 text-indigo-400 rounded-md font-bold">84%</span>
              </div>
              <div className="flex justify-between items-baseline mb-2">
                <span className="text-xl font-bold">420</span>
                <span className="text-[10px] text-slate-400 font-medium">/ 500 CAF</span>
              </div>
              <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: "84%" }}
                  className="bg-indigo-500 h-full"
                />
              </div>
            </div>

            <button 
              onClick={onLogout}
              className="w-full flex items-center justify-center space-x-3 px-3 py-3 rounded-xl text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all border border-transparent hover:border-rose-100"
            >
              <LogOut size={16} />
              <span>{t('common.logout')}</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
