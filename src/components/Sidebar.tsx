import { systemPages } from '../lib/systemPages';
import React from 'react';
import {
  LayoutDashboard, FileText, FolderOpen, ShieldCheck,
  Workflow, Lock, Server, X, LogOut, PlusCircle, Layers, Network,
  ShieldAlert, MapPin, Briefcase
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useTranslation } from 'react-i18next';
import { hasPermission, type User, type Permission } from '../lib/auth';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onLogout: () => void;
  user: User | null;
}

interface NavItem {
  id: string;
  labelKey: string;
  icon: React.ElementType;
  permission: keyof Permission;
}

interface NavGroup {
  sectionKey: string;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    sectionKey: 'sidebar.section_operations',
    items: [
      { id: 'dashboard',    labelKey: 'common.dashboard',    icon: LayoutDashboard, permission: 'viewDashboard' },
      { id: 'applications', labelKey: 'common.applications', icon: FileText,        permission: 'viewCAF'       },
    ],
  },
  {
    sectionKey: 'sidebar.section_documents',
    items: [
      { id: 'documents',  labelKey: 'common.documents',  icon: FolderOpen, permission: 'viewDocuments'  },
      { id: 'templates',  labelKey: 'common.templates',  icon: Layers,     permission: 'viewTemplates'  },
    ],
  },
  {
    sectionKey: 'sidebar.section_regulatory',
    items: [
      { id: 'audit',       labelKey: 'common.audit',       icon: ShieldCheck, permission: 'viewAuditQueue' },
      { id: 'compliance',  labelKey: 'common.compliance',  icon: ShieldAlert, permission: 'viewCompliance' },
    ],
  },
  {
    sectionKey: 'sidebar.section_network',
    items: [
      { id: 'site-registry', labelKey: 'common.site_registry', icon: MapPin,   permission: 'viewSiteRegistry' },
      { id: 'contracts',     labelKey: 'common.contracts',     icon: Briefcase, permission: 'viewContracts'   },
      { id: 'integrations',  labelKey: 'common.integrations',  icon: Network,   permission: 'viewIntegrations' },
    ],
  },
];

export default function Sidebar({ activeTab, setActiveTab, isOpen, setIsOpen, onLogout, user }: SidebarProps) {
  const { t } = useTranslation();
  const isTemplatesActive = activeTab === 'templates' || activeTab === 'global-rules';

  const navTo = (id: string) => {
    setActiveTab(id);
    if (window.innerWidth < 1024) setIsOpen(false);
  };

  const isActive = (id: string) => id === 'templates' ? isTemplatesActive : activeTab === id;

  return (
    <>
      <aside className={cn(
        'fixed inset-y-0 left-0 z-40 w-56 bg-white border-r border-gray-200 flex flex-col transition-transform duration-200 lg:translate-x-0',
        isOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        {/* Logo */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 shrink-0">
          <img src="/logo.svg" alt="AsiaInfo" className="h-7 w-auto" />
          <div>
            <p className="text-xs font-bold text-gray-800 leading-none">AsiaInfo</p>
            <p className="text-[10px] text-gray-400 leading-none mt-0.5">CAF System</p>
          </div>
          <button className="ml-auto lg:hidden p-1 text-gray-400" onClick={() => setIsOpen(false)}>
            <X size={16} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-2 px-2">
          {NAV_GROUPS.map((group, gi) => {
            const visible = group.items.filter(item => hasPermission(user, item.permission));
            if (visible.length === 0) return null;

            return (
              <div key={group.sectionKey} className={cn('mb-1', gi > 0 && 'mt-3')}>
                {/* Section divider + label */}
                {gi > 0 && <div className="h-px bg-gray-100 mb-3 mx-1" />}
                <p className="px-2 pb-1 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                  {t(group.sectionKey)}
                </p>

                <div className="space-y-0.5">
                  {visible.map(item => (
                    <button
                      key={item.id}
                      onClick={() => navTo(item.id)}
                      className={cn(
                        'w-full flex items-center gap-2.5 px-3 py-2 rounded text-sm transition-colors text-left',
                        isActive(item.id)
                          ? 'bg-blue-50 text-blue-700 font-medium'
                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                      )}
                    >
                      <item.icon
                        size={15}
                        className={isActive(item.id) ? 'text-blue-600' : 'text-gray-400'}
                      />
                      {t(item.labelKey)}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}

          {/* New CAF action */}
          {hasPermission(user, 'createCAF') && (
            <div className="mt-3">
              <div className="h-px bg-gray-100 mb-3 mx-1" />
              <p className="px-2 pb-1 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                {t('sidebar.actions_section')}
              </p>
              <button
                onClick={() => navTo('new-caf')}
                className={cn(
                  'w-full flex items-center gap-2.5 px-3 py-2 rounded text-sm transition-colors text-left',
                  activeTab === 'new-caf'
                    ? 'bg-blue-50 text-blue-700 font-medium'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                )}
              >
                <PlusCircle size={15} className={activeTab === 'new-caf' ? 'text-blue-600' : 'text-gray-400'} />
                {t('common.new_caf')}
              </button>
            </div>
          )}

          {/* System Management */}
          {hasPermission(user, 'manageUsers') && (
            <div className="mt-3">
              <div className="h-px bg-gray-100 mb-3 mx-1" />
              <p className="px-2 pb-1 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                {t('sidebar.system_section')}
              </p>
              {([
                [systemPages.overview, LayoutDashboard],
                [systemPages.business, Workflow],
                [systemPages.access, Lock],
                [systemPages.infrastructure, Server],
              ] as const).map(([page, Icon]) => (
                <button key={page} type="button" onClick={() => navTo(page)}
                  aria-current={activeTab === page ? 'page' : undefined}
                  className={cn('w-full flex items-center gap-2.5 px-3 py-2 rounded text-sm transition-colors text-left',
                    activeTab === page ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900')}>
                  <Icon size={15} className={activeTab === page ? 'text-blue-600' : 'text-gray-400'} />
                  {t('common.' + page)}
                </button>
              ))}
            </div>
          )}
        </nav>

        {/* User + Logout */}
        <div className="border-t border-gray-100 p-3 shrink-0">
          {user && (
            <div className="flex items-center gap-2 px-2 py-1.5 mb-1">
              <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
                {(user.fullName || user.username)[0].toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-gray-800 truncate">{user.fullName || user.username}</p>
                <p className="text-[10px] text-gray-400 capitalize">{user.role}</p>
              </div>
            </div>
          )}
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded text-sm text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut size={15} className="text-red-500" />
            {t('common.logout')}
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/30 z-30 lg:hidden" onClick={() => setIsOpen(false)} />
      )}
    </>
  );
}
