import React, { useState } from 'react';
import { ApplicationProvider } from './context/ApplicationContext';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import CAFList from './components/CAFList';
import CAFForm from './components/CAFForm';
import DocumentLibrary from './components/DocumentLibrary';
import AuditPortal from './components/AuditPortal';
import { TemplateManagement } from './components/TemplateManagement';
import { GlobalRulesPage } from './components/GlobalRulesPage';
import { Login } from './components/Login';
import { SystemManagement } from './components/SystemManagement';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, Search, Globe, ChevronDown, Languages, X, Eye, Download } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from './lib/utils';
import { fileStorage, type UploadedFile } from './lib/fileStorage';
import { getRoleDisplayName, getRoleColor, hasPermission, type User as AuthUser } from './lib/auth';

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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [correctionData, setCorrectionData] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [viewingCAF, setViewingCAF] = useState<any>(null);
  const [previewFile, setPreviewFile] = useState<UploadedFile | null>(null);
  const [loadingFileId, setLoadingFileId] = useState<string | null>(null);

  const toggleLanguage = () => {
    const nextLang = i18n.language === 'en' ? 'zh' : 'en';
    i18n.changeLanguage(nextLang);
  };

  const handleCorrect = (caf: any) => {
    setCorrectionData(caf);
    setActiveTab('new-caf');
  };

  const handleViewCAF = (caf: any) => {
    setViewingCAF(caf);
  };

  const handlePreviewFile = async (fileId: string) => {
    setLoadingFileId(fileId);
    try {
      const file = await fileStorage.getFile(fileId);
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

  const handleDownloadFile = async (fileId: string, fileName: string) => {
    setLoadingFileId(fileId);
    try {
      const file = await fileStorage.getFile(fileId);
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

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard />;
      case 'applications': return <CAFList onCorrect={handleCorrect} onNewEntry={navigateToNewCAF} onView={handleViewCAF} user={user} />;
      case 'new-caf': return (
        <CAFForm
          initialData={correctionData}
          onGoToApplications={() => changeTab('applications')}
          user={user}
        />
      );
      case 'documents': return <DocumentLibrary user={user} />;
      case 'templates': return (
        <TemplateManagement onOpenGlobalRules={() => setActiveTab('global-rules')} />
      );
      case 'global-rules': return (
        <GlobalRulesPage onBack={() => setActiveTab('templates')} />
      );
      case 'audit': return <AuditPortal />;
      case 'system-management': return <SystemManagement />;
      default: return <Dashboard user={user} />;
    }
  };

  const getPageTitle = () => {
    switch (activeTab) {
      case 'dashboard': return t('common.dashboard');
      case 'applications': return t('common.applications');
      case 'new-caf': return t('common.new_caf');
      case 'documents': return t('common.documents');
      case 'templates': return t('common.templates');
      case 'global-rules': return t('common.global_rules');
      case 'audit': return t('common.audit');
      case 'system-management': return t('common.system_management');
      default: return t('common.dashboard');
    }
  };

  const changeTab = (tab: string) => {
    if (tab !== 'new-caf') {
      setCorrectionData(null);
    }
    setActiveTab(tab);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans antialiased text-slate-900 selection:bg-indigo-100 selection:text-indigo-900">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={changeTab} 
        isOpen={isSidebarOpen} 
        setIsOpen={setIsSidebarOpen} 
        onLogout={() => setUser(null)}
        user={user}
      />
      
      <main className="flex-1 lg:ml-60 flex flex-col min-h-screen">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-30 flex items-center justify-between px-4 lg:px-8 flex-shrink-0">
           <div className="flex items-center gap-6">
              <div className="lg:hidden w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center mr-2">
                <div className="w-3 h-3 bg-white rounded-sm rotate-45"></div>
              </div>
              <h1 className="text-sm font-bold text-slate-800 uppercase tracking-widest hidden sm:block">
                {getPageTitle()}
              </h1>
           </div>

           <div className="flex items-center gap-4 md:gap-6">
              <div className="hidden sm:relative md:flex items-center">
                <Search size={16} className="absolute left-3 text-slate-400" />
                <input 
                  type="text" 
                  placeholder={t('common.search_caf_placeholder')} 
                  className="bg-slate-100 border-none rounded-full py-2 pl-10 pr-4 text-xs w-48 lg:w-64 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
                />
              </div>

              <div className="flex items-center gap-3">
                 <div className="relative cursor-pointer p-1 rounded-full hover:bg-slate-100 transition-colors">
                    <Bell size={18} className="text-slate-500" />
                    <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-indigo-600 border-2 border-white rounded-full"></span>
                 </div>
                 <button 
                   onClick={toggleLanguage}
                   className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-slate-100 transition-all text-[10px] font-bold text-slate-600 uppercase tracking-widest border border-slate-100"
                 >
                    <Languages size={14} className="text-indigo-600" />
                    {i18n.language === 'en' ? 'EN' : 'ZH'}
                 </button>
                 <div className="h-6 w-[1px] bg-slate-200" />
                 <div className="flex items-center gap-3 cursor-pointer group">
                    <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 lg:hidden"></div>
                    <div className="text-right hidden lg:block">
                       <p className="text-xs font-bold text-slate-900 leading-none">{user.fullName || user.name}</p>
                       <p className={cn("text-[10px] font-bold mt-1 uppercase tracking-wider px-2 py-0.5 rounded inline-block", getRoleColor(user.role))}>
                         {getRoleDisplayName(user.role)}
                       </p>
                    </div>
                    <ChevronDown size={14} className="text-slate-400 group-hover:text-slate-600 transition-colors" />
                 </div>
              </div>
           </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 p-6 lg:p-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="max-w-7xl mx-auto"
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        <footer className="p-8 border-t border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4 text-slate-400 container mx-auto">
           <p className="text-xs font-medium">© 2026 ATOMA Telecom. Regulatory CAF System.</p>
           <div className="flex items-center gap-6 text-[10px] font-bold uppercase tracking-widest">
              <a href="#" className="hover:text-indigo-600 transition-colors">Compliance</a>
              <a href="#" className="hover:text-indigo-600 transition-colors">Legal Info</a>
              <a href="#" className="hover:text-indigo-600 transition-colors">Security</a>
           </div>
        </footer>
      </main>

      {/* View CAF Modal */}
      {viewingCAF && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl w-full max-w-3xl max-h-[90vh] shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Modal Header */}
            <div className="px-8 py-6 bg-slate-50 border-b border-slate-200 flex items-center justify-between shrink-0">
              <div>
                <h3 className="text-xl font-bold text-slate-800">CAF Details</h3>
                <p className="text-xs text-slate-500 mt-1 font-medium">Application ID: {viewingCAF.id}</p>
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
                <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Customer Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-400 uppercase">Full Name</p>
                    <p className="text-sm font-semibold text-slate-800">{viewingCAF.fullName}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-400 uppercase">Customer Type</p>
                    <p className="text-sm font-semibold text-slate-800">{viewingCAF.customerType}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-400 uppercase">ID Type</p>
                    <p className="text-sm font-semibold text-slate-800">{viewingCAF.idType}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-400 uppercase">ID Number</p>
                    <p className="text-sm font-semibold text-slate-800">{viewingCAF.idNumber}</p>
                  </div>
                  <div className="space-y-1 col-span-2">
                    <p className="text-xs font-bold text-slate-400 uppercase">Address</p>
                    <p className="text-sm font-semibold text-slate-800">{viewingCAF.address}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-400 uppercase">Contact Number</p>
                    <p className="text-sm font-semibold text-slate-800">{viewingCAF.contactNumber}</p>
                  </div>
                  {viewingCAF.email && (
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-slate-400 uppercase">Email</p>
                      <p className="text-sm font-semibold text-slate-800">{viewingCAF.email}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Service Information */}
              <div className="pt-6 border-t border-slate-200">
                <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Service Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-400 uppercase">Service Type</p>
                    <p className="text-sm font-semibold text-slate-800">{viewingCAF.serviceType}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-400 uppercase">Plan Name</p>
                    <p className="text-sm font-semibold text-slate-800">{viewingCAF.planName}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-400 uppercase">Status</p>
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
                    <p className="text-xs font-bold text-slate-400 uppercase">Submission Date</p>
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
                  <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Corporate Details</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-slate-400 uppercase">Company Reg No</p>
                      <p className="text-sm font-semibold text-slate-800">{viewingCAF.corporateDetails.companyRegNo}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-slate-400 uppercase">Tax ID</p>
                      <p className="text-sm font-semibold text-slate-800">{viewingCAF.corporateDetails.taxId}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-slate-400 uppercase">Authorized Signatory</p>
                      <p className="text-sm font-semibold text-slate-800">{viewingCAF.corporateDetails.authorizedSignatory}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-slate-400 uppercase">Technical Contact</p>
                      <p className="text-sm font-semibold text-slate-800">{viewingCAF.corporateDetails.technicalContact}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-slate-400 uppercase">Static IP Required</p>
                      <p className="text-sm font-semibold text-slate-800">
                        {viewingCAF.corporateDetails.staticIpRequired ? 'Yes' : 'No'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Documents */}
              {viewingCAF.documents && viewingCAF.documents.length > 0 && (
                <div className="pt-6 border-t border-slate-200">
                  <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Documents ({viewingCAF.documents.length})</h4>
                  <div className="space-y-2">
                    {viewingCAF.documents.map((doc: any) => (
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
                          {doc.fileId && (
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => handlePreviewFile(doc.fileId)}
                                disabled={loadingFileId === doc.fileId}
                                className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all disabled:opacity-50"
                                title="Preview file"
                              >
                                {loadingFileId === doc.fileId ? (
                                  <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                                ) : (
                                  <Eye size={16} />
                                )}
                              </button>
                              <button
                                onClick={() => handleDownloadFile(doc.fileId, doc.name)}
                                disabled={loadingFileId === doc.fileId}
                                className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all disabled:opacity-50"
                                title="Download file"
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
            <div className="px-8 py-6 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3 shrink-0">
              <button 
                onClick={() => setViewingCAF(null)}
                className="px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all"
              >
                Close
              </button>
              {viewingCAF.status === 'Pending' && (
                <button 
                  onClick={() => {
                    setViewingCAF(null);
                    setActiveTab('audit');
                  }}
                  className="px-5 py-2.5 bg-indigo-600 rounded-xl text-xs font-bold uppercase tracking-widest text-white hover:bg-indigo-700 transition-all"
                >
                  Go to Audit
                </button>
              )}
            </div>
          </motion.div>
        </div>
      )}

      {/* File Preview Modal */}
      {previewFile && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-200">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden"
          >
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
                    {previewFile.type} �?{fileStorage.getFileSize(previewFile.size)} �?{new Date(previewFile.uploadDate).toLocaleDateString()}
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
              {previewFile.type.startsWith('image/') ? (
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
                  <h4 className="text-lg font-bold text-slate-700 mb-2">Preview Not Available</h4>
                  <p className="text-sm text-slate-500 mb-6">
                    This file type cannot be previewed in the browser.
                  </p>
                  <button
                    onClick={() => fileStorage.downloadFile(previewFile)}
                    className="px-6 py-3 bg-indigo-600 text-white text-sm font-bold uppercase tracking-widest rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-900/10 flex items-center gap-2"
                  >
                    <Download size={16} />
                    Download File
                  </button>
                </div>
              )}
            </div>

            {/* Preview Footer */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
              <div className="text-xs text-slate-500">
                <span className="font-bold">Category:</span> {previewFile.category || 'Uncategorized'}
                {previewFile.cafId && (
                  <>
                    <span className="mx-2">•</span>
                    <span className="font-bold">CAF ID:</span> {previewFile.cafId}
                  </>
                )}
              </div>
              <button 
                onClick={() => setPreviewFile(null)}
                className="px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}


