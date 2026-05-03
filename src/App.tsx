import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import CAFList from './components/CAFList';
import CAFForm from './components/CAFForm';
import DocumentLibrary from './components/DocumentLibrary';
import AuditPortal from './components/AuditPortal';
import { TemplateManagement } from './components/TemplateManagement';
import { Login } from './components/Login';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, Search, Globe, ChevronDown, Languages } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function App() {
  const { t, i18n } = useTranslation();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [correctionData, setCorrectionData] = useState<any>(null);
  const [user, setUser] = useState<any>(null);

  const toggleLanguage = () => {
    const nextLang = i18n.language === 'en' ? 'zh' : 'en';
    i18n.changeLanguage(nextLang);
  };

  const handleCorrect = (caf: any) => {
    setCorrectionData(caf);
    setActiveTab('new-caf');
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
      case 'applications': return <CAFList onCorrect={handleCorrect} onNewEntry={navigateToNewCAF} />;
      case 'new-caf': return <CAFForm initialData={correctionData} />;
      case 'documents': return <DocumentLibrary />;
      case 'templates': return <TemplateManagement />;
      case 'audit': return <AuditPortal />;
      default: return <Dashboard />;
    }
  };

  const getPageTitle = () => {
    switch (activeTab) {
      case 'dashboard': return t('common.dashboard');
      case 'applications': return t('common.applications');
      case 'new-caf': return t('common.new_caf');
      case 'documents': return t('common.documents');
      case 'templates': return t('common.templates');
      case 'audit': return t('common.audit');
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
                  placeholder="Search CAF # or CID..." 
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
                       <p className="text-xs font-bold text-slate-900 leading-none">{user.name}</p>
                       <p className="text-[10px] font-medium text-slate-400 mt-1 uppercase tracking-tighter">{user.role}</p>
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
           <p className="text-xs font-medium">© 2024 ATOMA Telecom. Regulatory CAF System.</p>
           <div className="flex items-center gap-6 text-[10px] font-bold uppercase tracking-widest">
              <a href="#" className="hover:text-indigo-600 transition-colors">Compliance</a>
              <a href="#" className="hover:text-indigo-600 transition-colors">Legal Info</a>
              <a href="#" className="hover:text-indigo-600 transition-colors">Security</a>
           </div>
        </footer>
      </main>
    </div>
  );
}

