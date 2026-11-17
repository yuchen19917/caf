import { getSeedAttachment, loadAttachment } from './lib/attachmentFile';
import type { CustomerApplicationForm, Document } from './types';
import { systemPages, type SystemPage } from './lib/systemPages';
import { PreviewDrawer } from './components/PreviewDrawer';
import React, { lazy, Suspense, useState } from 'react';
import { ApplicationProvider } from './context/ApplicationContext';
import Sidebar from './components/Sidebar';
import { Login } from './components/Login';
import { Bell, Languages, ChevronDown, X, Eye, Download } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from './lib/utils';
import { fileStorage, type UploadedFile } from './lib/fileStorage';
import { getRoleDisplayName, getRoleColor, hasPermission, type User as AuthUser } from './lib/auth';

const Dashboard = lazy(() => import('./components/Dashboard'));
const CAFList = lazy(() => import('./components/CAFList'));
const CAFForm = lazy(() => import('./components/CAFForm'));
const DocumentLibrary = lazy(() => import('./components/DocumentLibrary'));
const AuditPortal = lazy(() => import('./components/AuditPortal'));
const TemplateManagement = lazy(() => import('./components/TemplateManagement').then(module => ({ default: module.TemplateManagement })));
const GlobalRulesPage = lazy(() => import('./components/GlobalRulesPage').then(module => ({ default: module.GlobalRulesPage })));
const SystemManagement = lazy(() => import('./components/SystemManagement').then(module => ({ default: module.SystemManagement })));
const IntegrationHub = lazy(() => import('./components/IntegrationHub').then(module => ({ default: module.IntegrationHub })));
const ComplianceRegistry = lazy(() => import('./components/ComplianceRegistry').then(module => ({ default: module.ComplianceRegistry })));
const SiteRegistry = lazy(() => import('./components/SiteRegistry').then(module => ({ default: module.SiteRegistry })));
const ContractManager = lazy(() => import('./components/ContractManager').then(module => ({ default: module.ContractManager })));

class PageLoadBoundary extends React.Component<{ children?: React.ReactNode; key?: string }, { failed: boolean }> {
  declare readonly props: { children?: React.ReactNode };
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <div role="alert" className="rounded-xl border border-slate-200 bg-white p-5">
        <p>Unable to load this page.</p>
        <button type="button" className="mt-3 text-indigo-700 underline" onClick={() => window.location.reload()}>Reload CAF</button>
      </div>
    );
  }
}

export default function App() {
  return (
    <ApplicationProvider>
      <AppShell />
    </ApplicationProvider>
  );
}

function AppShell() {
  const { t, i18n } = useTranslation();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [applicationShortcut, setApplicationShortcut] = useState<ApplicationShortcut>();
  const [reviewId, setReviewId] = useState<string>();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [correctionData, setCorrectionData] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [viewingCAF, setViewingCAF] = useState<CustomerApplicationForm | null>(null);
  const [previewFile, setPreviewFile] = useState<UploadedFile | null>(null);
  const [loadingFileId, setLoadingFileId] = useState<string | null>(null);

  const toggleLanguage = () => {
    const langs = ['en', 'dar', 'zh'];
    const idx = langs.indexOf(i18n.language);
    const nextLang = langs[(idx + 1) % langs.length];
    i18n.changeLanguage(nextLang);
    // RTL support for Dari
    document.documentElement.dir = nextLang === 'dar' ? 'rtl' : 'ltr';
  };

  const handleCorrect = (caf: any) => {
    setCorrectionData(caf);
    setActiveTab('new-caf');
  };

  const handleViewCAF = (caf: CustomerApplicationForm) => {
    setViewingCAF(caf);
  };

  const handlePreviewFile = async (caf: CustomerApplicationForm, doc: Document) => {
    setLoadingFileId(doc.id);
    try {
      const file = await loadAttachment(caf, doc);
      if (file) {
        setPreviewFile(file);
      } else {
        alert('File not found in storage');
      }
    } catch (error) {
      console.error('Error loading file:', error);
      alert('Failed to load file');
    } finally {
      setLoadingFileId(null);
    }
  };

  const handleDownloadFile = async (caf: CustomerApplicationForm, doc: Document) => {
    setLoadingFileId(doc.id);
    try {
      const file = await loadAttachment(caf, doc);
      if (file) {
        fileStorage.downloadFile(file);
      } else {
        alert('File not found in storage');
      }
    } catch (error) {
      console.error('Error downloading file:', error);
      alert('Failed to download file');
    } finally {
      setLoadingFileId(null);
    }
  };

  const navigateToNewCAF = () => {
    setCorrectionData(null);
    setActiveTab('new-caf');
  };

  if (!user) {
    return <Login onLogin={setUser} />;
  }

  const systemPage = (Object.keys(systemPages) as SystemPage[]).find(page => systemPages[page] === activeTab);
  const workbench = () => <Dashboard user={user} onNew={navigateToNewCAF} onView={handleViewCAF}
    onCorrect={handleCorrect}
    onReview={id => { setReviewId(id); setActiveTab('audit'); }}
    onApplications={filter => { setApplicationShortcut(filter); setActiveTab('applications'); }} />;
  const renderContent = () => {
    if (systemPage && hasPermission(user, 'manageUsers')) {
      return <SystemManagement category={systemPage} onNavigate={page => setActiveTab(systemPages[page])} />;
    }
    switch (activeTab) {
      case 'dashboard': return workbench();
      case 'applications': return <CAFList onCorrect={handleCorrect} onNewEntry={navigateToNewCAF} onView={handleViewCAF} user={user}
        shortcut={applicationShortcut} onClearShortcut={() => setApplicationShortcut(undefined)} />;
      case 'new-caf': return (
        <CAFForm
          initialData={correctionData}
          onGoToApplications={() => changeTab('applications')}
          user={user}
        />
      );
      case 'documents': return <DocumentLibrary user={user} />;
      case 'templates': return (
        <TemplateManagement canPublishPrepaid={hasPermission(user, 'editTemplates')} onOpenGlobalRules={() => setActiveTab('global-rules')} />
      );
      case 'global-rules': return (
        <GlobalRulesPage onBack={() => setActiveTab('templates')} />
      );
      case 'audit': return <AuditPortal initialReviewId={reviewId} />;
      case 'integrations': return <IntegrationHub />;
      case 'compliance': return <ComplianceRegistry />;
      case 'site-registry': return <SiteRegistry />;
      case 'contracts': return <ContractManager />;
      default: return workbench();
    }
  };

  const getPageTitle = () => {
    if (systemPage) return t('common.' + systemPages[systemPage]);
    switch (activeTab) {
      case 'dashboard': return t('common.dashboard');
      case 'applications': return t('common.applications');
      case 'new-caf': return t('common.new_caf');
      case 'documents': return t('common.documents');
      case 'templates': return t('common.templates');
      case 'global-rules': return t('common.global_rules');
      case 'audit': return t('common.audit');
      case 'integrations': return t('common.integrations');
      case 'compliance': return t('common.compliance');
      case 'site-registry': return t('common.site_registry');
      case 'contracts': return t('common.contracts');
      default: return t('common.dashboard');
    }
  };

  const changeTab = (tab: string) => {
    setApplicationShortcut(undefined);
    setReviewId(undefined);
    if (tab !== 'new-caf') {
      setCorrectionData(null);
    }
    setActiveTab(tab);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex font-sans antialiased text-gray-900">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={changeTab}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        onLogout={() => setUser(null)}
        user={user}
      />

      <main className="min-w-0 flex-1 lg:ml-56 flex flex-col min-h-screen">
        {/* Top Header */}
        <header className="h-12 bg-white border-b border-gray-200 sticky top-0 z-30 flex items-center justify-between px-4 lg:px-6 flex-shrink-0">
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden p-1 text-gray-500 hover:text-gray-700"
              onClick={() => setIsSidebarOpen(true)}
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M2 4h14M2 9h14M2 14h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
            </button>
            <span className="text-sm font-medium text-gray-700">{getPageTitle()}</span>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={toggleLanguage} className="flex items-center gap-1.5 px-2 py-1 text-xs text-gray-500 hover:text-gray-700 border border-gray-200 rounded hover:bg-gray-50 transition-colors">
              <Languages size={12} />
              {i18n.language === 'en' ? 'EN' : i18n.language === 'dar' ? 'دری' : 'ZH'}
            </button>
            <div className="h-4 w-px bg-gray-200" />
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-white text-[10px] font-bold">
                {(user.fullName || user.username || 'U')[0].toUpperCase()}
              </div>
              <div className="hidden lg:block">
                <p className="text-xs font-medium text-gray-800 leading-none">{user.fullName || user.username}</p>
                <p className="text-[10px] text-gray-400 mt-0.5 capitalize">{user.role}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 p-5 lg:p-7">
          <div className="max-w-7xl mx-auto">
            <PageLoadBoundary key={systemPage ? 'system' : activeTab}>
              <Suspense fallback={<p className="py-6 text-sm text-slate-600" role="status">Loading…</p>}>
                {renderContent()}
              </Suspense>
            </PageLoadBoundary>
          </div>
        </div>

        {/* Footer */}
        <footer className="px-6 py-3 border-t border-gray-200 flex items-center justify-between text-xs text-gray-400 bg-white">
          <p>© 2026 AsiaInfo Telecom · Regulatory CAF System v3.0</p>
          <div className="flex items-center gap-4">
            <a href="#" className="hover:text-gray-600 transition-colors">{t('app_shell.footer_compliance')}</a>
            <a href="#" className="hover:text-gray-600 transition-colors">{t('app_shell.footer_legal')}</a>
            <a href="#" className="hover:text-gray-600 transition-colors">{t('app_shell.footer_security')}</a>
          </div>
        </footer>
      </main>

      {/* View CAF Modal */}
      {viewingCAF && (
        <PreviewDrawer label={t('app_shell.caf_details')} onClose={() => setViewingCAF(null)}>
            {/* Modal Header */}
            <div className="px-8 py-6 bg-slate-50 border-b border-slate-200 flex items-center justify-between shrink-0">
              <div>
                <h3 className="text-xl font-bold text-slate-800">{t('app_shell.caf_details')}</h3>
                <p className="text-xs text-slate-500 mt-1 font-medium">{t('app_shell.application_id')}: {viewingCAF.id}</p>
              </div>
              <button 
                onClick={() => setViewingCAF(null)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full transition-all"
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-8 space-y-6">
              {/* Customer Information */}
              <div>
                <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">{t('app_shell.customer_info')}</h4>
                {viewingCAF.templateSnapshot && (
                  <p className="mb-4 text-sm text-slate-600">
                    {viewingCAF.templateSnapshot.name} · Version {viewingCAF.templateSnapshot.version}
                  </p>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-400 uppercase">{t('app_shell.full_name')}</p>
                    <p className="text-sm font-semibold text-slate-800">{viewingCAF.fullName}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-400 uppercase">{t('app_shell.customer_type')}</p>
                    <p className="text-sm font-semibold text-slate-800">{viewingCAF.customerType}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-400 uppercase">{t('app_shell.id_type')}</p>
                    <p className="text-sm font-semibold text-slate-800">{viewingCAF.idType}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-400 uppercase">{t('app_shell.id_number')}</p>
                    <p className="text-sm font-semibold text-slate-800">{viewingCAF.idNumber}</p>
                  </div>
                  <div className="space-y-1 col-span-2">
                    <p className="text-xs font-bold text-slate-400 uppercase">{t('app_shell.address')}</p>
                    <p className="text-sm font-semibold text-slate-800">{viewingCAF.address}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-400 uppercase">{t('app_shell.contact_number')}</p>
                    <p className="text-sm font-semibold text-slate-800">{viewingCAF.contactNumber}</p>
                  </div>
                  {viewingCAF.email && (
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-slate-400 uppercase">{t('app_shell.email')}</p>
                      <p className="text-sm font-semibold text-slate-800">{viewingCAF.email}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Service Information */}
              <div className="pt-6 border-t border-slate-200">
                <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">{t('app_shell.service_info')}</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-400 uppercase">{t('app_shell.service_type')}</p>
                    <p className="text-sm font-semibold text-slate-800">{viewingCAF.serviceType}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-400 uppercase">{t('app_shell.plan_name')}</p>
                    <p className="text-sm font-semibold text-slate-800">{viewingCAF.planName}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-400 uppercase">{t('app_shell.status')}</p>
                    <span className={cn(
                      "text-xs font-bold uppercase px-2 py-1 rounded inline-block",
                      viewingCAF.status === 'Approved' ? 'bg-emerald-100 text-emerald-700' :
                      viewingCAF.status === 'Pending' ? 'bg-amber-100 text-amber-700' :
                      viewingCAF.status === 'Rejected' ? 'bg-rose-100 text-rose-700' :
                      viewingCAF.status === 'Correction' ? 'bg-indigo-100 text-indigo-700' :
                      'bg-slate-100 text-slate-700'
                    )}>
                      {viewingCAF.status}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-400 uppercase">{t('app_shell.submission_date')}</p>
                    <p className="text-sm font-semibold text-slate-800">
                      {new Date(viewingCAF.submissionDate).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Corporate Details (if applicable) */}
              {viewingCAF.corporateDetails && (
                <div className="pt-6 border-t border-slate-200">
                  <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">{t('app_shell.corporate_details')}</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-slate-400 uppercase">{t('app_shell.company_reg')}</p>
                      <p className="text-sm font-semibold text-slate-800">{viewingCAF.corporateDetails.companyRegNo}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-slate-400 uppercase">{t('app_shell.tax_id')}</p>
                      <p className="text-sm font-semibold text-slate-800">{viewingCAF.corporateDetails.taxId}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-slate-400 uppercase">{t('app_shell.auth_signatory')}</p>
                      <p className="text-sm font-semibold text-slate-800">{viewingCAF.corporateDetails.authorizedSignatory}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-slate-400 uppercase">{t('app_shell.tech_contact')}</p>
                      <p className="text-sm font-semibold text-slate-800">{viewingCAF.corporateDetails.technicalContact}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-slate-400 uppercase">{t('app_shell.static_ip')}</p>
                      <p className="text-sm font-semibold text-slate-800">
                        {viewingCAF.corporateDetails.staticIpRequired ? t('app_shell.yes') : t('app_shell.no')}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Documents */}
              {viewingCAF.documents && viewingCAF.documents.length > 0 && (
                <div className="pt-6 border-t border-slate-200">
                  <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">{t('app_shell.documents_section')} ({viewingCAF.documents.length})</h4>
                  <div className="space-y-2">
                    {viewingCAF.documents.map(doc => (
                      <div key={doc.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-all group">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center shrink-0">
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M9 1H3C2.44772 1 2 1.44772 2 2V14C2 14.5523 2.44772 15 3 15H13C13.5523 15 14 14.5523 14 14V6L9 1Z" stroke="#4F46E5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M9 1V6H14" stroke="#4F46E5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-slate-800 truncate">{doc.name}</p>
                            <p className="text-[10px] text-slate-400 font-medium">{doc.type}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={cn(
                            "text-[9px] font-bold uppercase px-2 py-0.5 rounded",
                            doc.status === 'Verified' ? 'bg-emerald-100 text-emerald-700' :
                            doc.status === 'Unverified' ? 'bg-amber-100 text-amber-700' :
                            'bg-rose-100 text-rose-700'
                          )}>
                            {doc.status}
                          </span>
                          {(doc.fileId || getSeedAttachment(viewingCAF, doc)) && (
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handlePreviewFile(viewingCAF, doc)}
                                disabled={loadingFileId === doc.id}
                                className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all disabled:opacity-50"
                                title={t('audit_portal.click_to_preview')}
                                aria-label={t('audit_portal.click_to_preview') + ' · ' + doc.name}
                              >
                                {loadingFileId === doc.id ? (
                                  <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                                ) : (
                                  <Eye size={16} />
                                )}
                              </button>
                              <button
                                onClick={() => handleDownloadFile(viewingCAF, doc)}
                                disabled={loadingFileId === doc.id}
                                className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all disabled:opacity-50"
                                title={t('app_shell.download_file')}
                              >
                                <Download size={16} />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-end gap-2 shrink-0">
              <button
                onClick={() => setViewingCAF(null)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-600 hover:bg-gray-100 transition-colors"
              >
                {t('app_shell.close')}
              </button>
              {viewingCAF.status === 'Pending' && (
                <button
                  onClick={() => { setViewingCAF(null); setActiveTab('audit'); }}
                  className="px-4 py-2 bg-blue-600 rounded-md text-sm text-white hover:bg-blue-700 transition-colors"
                >
                  {t('app_shell.go_to_audit')}
                </button>
              )}
            </div>
        </PreviewDrawer>
      )}

      {/* File Preview Modal */}
      {previewFile && (
        <PreviewDrawer label={previewFile.name} onClose={() => setPreviewFile(null)} width="max-w-5xl">
            {/* Preview Header */}
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                  {previewFile.type.startsWith('image/') ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="3" y="3" width="18" height="18" rx="2" stroke="#4F46E5" strokeWidth="2"/>
                      <circle cx="8.5" cy="8.5" r="1.5" fill="#4F46E5"/>
                      <path d="M21 15L16 10L5 21" stroke="#4F46E5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="#4F46E5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M14 2V8H20" stroke="#4F46E5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800">{previewFile.name}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {[previewFile.type, previewFile.size ? fileStorage.getFileSize(previewFile.size) : null, new Date(previewFile.uploadDate).toLocaleDateString()].filter(Boolean).join(' · ')}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => fileStorage.downloadFile(previewFile)}
                  className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                  title="Download"
                >
                  <Download size={18} />
                </button>
                <button 
                  onClick={() => setPreviewFile(null)}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg transition-all"
                  title="Close"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Preview Content */}
            <div className="flex-1 overflow-auto bg-slate-100 p-6">
              {previewFile.type === 'text/html' ? (
                <iframe src={previewFile.data} sandbox="" title={previewFile.name} className="h-full min-h-[600px] w-full rounded-lg border border-slate-200" />
              ) : previewFile.type.startsWith('image/') ? (
                <div className="flex items-center justify-center min-h-full">
                  <img 
                    src={previewFile.data} 
                    alt={previewFile.name}
                    className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
                  />
                </div>
              ) : previewFile.type === 'application/pdf' ? (
                <div className="w-full h-full min-h-[600px] bg-white rounded-lg shadow-lg overflow-hidden">
                  <iframe
                    src={previewFile.data}
                    className="w-full h-full min-h-[600px]"
                    title={previewFile.name}
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
                  <div className="w-20 h-20 bg-slate-200 rounded-2xl flex items-center justify-center mb-4">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M14 2V8H20" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <h4 className="text-lg font-bold text-slate-700 mb-2">{t('app_shell.preview_unavailable')}</h4>
                  <p className="text-sm text-slate-500 mb-6">
                    {t('app_shell.preview_desc')}
                  </p>
                  <button
                    onClick={() => fileStorage.downloadFile(previewFile)}
                    className="px-6 py-3 bg-indigo-600 text-white text-sm font-bold uppercase tracking-widest rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-900/10 flex items-center gap-2"
                  >
                    <Download size={16} />
                    {t('app_shell.download_file')}
                  </button>
                </div>
              )}
            </div>

            {/* Preview Footer */}
            <div className="px-5 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between shrink-0">
              <p className="text-xs text-gray-500">
                {t('app_shell.category')}: {previewFile.category || 'Uncategorized'}
                {previewFile.cafId && <> · CAF: {previewFile.cafId}</>}
              </p>
              <button
                onClick={() => setPreviewFile(null)}
                className="px-4 py-1.5 border border-gray-300 rounded-md text-xs text-gray-600 hover:bg-gray-100 transition-colors"
              >
                {t('app_shell.close')}
              </button>
            </div>
        </PreviewDrawer>
      )}
    </div>
  );
}


import type { ApplicationShortcut } from './components/Dashboard';
