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
import { hasPermission, type User } from '../lib/auth';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onLogout: () => void;
  user: User | null;
}

export default function Sidebar({ activeTab, setActiveTab, isOpen, setIsOpen, onLogout, user }: SidebarProps) {
  const { t } = useTranslation();
  const isTemplatesActive = activeTab === 'templates' || activeTab === 'global-rules';
  
  const menuItems = [
    { 
      id: 'dashboard', 
      label: t('common.dashboard'), 
      icon: LayoutDashboard,
      permission: 'viewDashboard' as const
    },
    { 
      id: 'applications', 
      label: t('common.applications'), 
      icon: FileText,
      permission: 'viewCAF' as const
    },
    { 
      id: 'documents', 
      label: t('common.documents'), 
      icon: FolderOpen,
      permission: 'viewDocuments' as const
    },
    { 
      id: 'templates', 
      label: t('common.templates'), 
      icon: Layers,
      permission: 'viewTemplates' as const
    },
    { 
      id: 'audit', 
      label: t('common.audit'), 
      icon: ShieldCheck,
      permission: 'viewAuditQueue' as const
    },
  ];

  // Filter menu items based on user permissions
  const visibleMenuItems = menuItems.filter(item => hasPermission(user, item.permission));

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
          <div className="p-8 flex items-center justify-center">
            <img 
              src="/logo.svg" 
              alt="ATOMA Logo" 
              className="h-12 w-auto"
            />
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-6 space-y-4 overflow-y-auto">
            <div>
              <h3 className="px-3 mb-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Management</h3>
              <ul className="space-y-1.5">
                {visibleMenuItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      if (window.innerWidth < 1024) setIsOpen(false);
                    }}
                    className={cn(
                      "w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-all group",
                      (item.id === 'templates' ? isTemplatesActive : activeTab === item.id)
                        ? "bg-indigo-50 text-indigo-700"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    )}
                  >
                    <item.icon size={16} className={cn(
                      "transition-colors shrink-0",
                      (item.id === 'templates' ? isTemplatesActive : activeTab === item.id) ? "text-indigo-600" : "text-slate-400 group-hover:text-slate-500"
                    )} />
                    <span className="whitespace-nowrap">{item.label}</span>
                  </button>
                ))}
              </ul>
            </div>

            <div className="pt-4">
              <h3 className="px-3 mb-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Action Center</h3>
              {hasPermission(user, 'createCAF') && (
                <button 
                  onClick={() => setActiveTab('new-caf')}
                  className={cn(
                    "w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-all",
                    activeTab === 'new-caf' ? "bg-indigo-50 text-indigo-700" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  )}
                >
                  <PlusCircle size={16} className={cn(
                    "shrink-0",
                    activeTab === 'new-caf' ? "text-indigo-600" : "text-slate-400"
                  )} />
                  <span className="whitespace-nowrap">{t('common.new_caf')}</span>
                </button>
              )}
            </div>

            {hasPermission(user, 'manageUsers') && (
              <div className="pt-4">
                <h3 className="px-3 mb-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('common.system')}</h3>
                <button 
                  onClick={() => {
                    setActiveTab('system-management');
                    if (window.innerWidth < 1024) setIsOpen(false);
                  }}
                  className={cn(
                    "w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-all group",
                    activeTab === 'system-management' ? "bg-indigo-50 text-indigo-700" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  )}
                >
                  <Settings size={16} className={cn(
                    "transition-colors shrink-0",
                    activeTab === 'system-management' ? "text-indigo-600" : "text-slate-400 group-hover:text-slate-500"
                  )} />
                  <span className="whitespace-nowrap">{t('common.system_management')}</span>
                </button>
              </div>
            )}
          </nav>

          {/* Logout Button */}
          <div className="p-6 border-t border-slate-200">
            <button
              onClick={onLogout}
              className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium text-rose-600 hover:bg-rose-50 transition-all group"
            >
              <LogOut size={16} className="text-rose-500 group-hover:text-rose-600 transition-colors shrink-0" />
              <span className="whitespace-nowrap">{t('common.logout')}</span>
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
