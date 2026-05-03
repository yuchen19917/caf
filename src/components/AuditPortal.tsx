import React, { useState } from 'react';
import { 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Eye, 
  UserCheck,
  History,
  Info,
  FileText,
  Database,
  Archive,
  RefreshCcw,
  CheckCircle,
  Server
} from 'lucide-react';
import { MOCK_CAFS } from '../mockData';
import { cn } from '../lib/utils';

export default function AuditPortal() {
  const [selectedAudit, setSelectedAudit] = useState(MOCK_CAFS[1]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStep, setSyncStep] = useState(0);
  const [isArchived, setIsArchived] = useState(false);

  const handleApprove = () => {
    setIsSyncing(true);
    setSyncStep(1);
    
    // Simulate CRM Integration
    setTimeout(() => setSyncStep(2), 1500);
    // Simulate Billing System (BSS) Sync
    setTimeout(() => setSyncStep(3), 3000);
    // Simulate Final Archival & Back-filling result
    setTimeout(() => {
      setIsSyncing(false);
      setIsArchived(true);
      // In a real app we'd update the status in the central state here
    }, 5000);
  };

  const getSyncTask = () => {
    switch(syncStep) {
      case 1: return "Connecting to Master CRM Core...";
      case 2: return "Provisioning BSS Billing Account...";
      case 3: return "Executing Resource Activation...";
      default: return "";
    }
  };

  if (isSyncing) {
    return (
      <div className="max-w-4xl mx-auto h-full flex items-center justify-center">
        <div className="bg-white p-12 rounded-[3rem] border border-slate-200 shadow-2xl w-full max-w-xl text-center space-y-10 animate-in zoom-in-95 duration-500">
          <div className="relative w-32 h-32 mx-auto">
            <div className="absolute inset-0 border-8 border-slate-100 rounded-full"></div>
            <div className="absolute inset-0 border-8 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center text-indigo-600">
              <RefreshCcw size={48} className="animate-pulse" />
            </div>
            <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-2 rounded-xl shadow-lg animate-bounce">
              <Database size={20} />
            </div>
          </div>
          
          <div className="space-y-3">
            <h3 className="text-2xl font-bold text-slate-800 tracking-tight italic">Orchestrating Integration</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">{getSyncTask()}</p>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {[1, 2, 3].map(i => (
              <div key={i} className={cn(
                "h-1.5 rounded-full transition-all duration-700",
                syncStep >= i ? "bg-indigo-600" : "bg-slate-100"
              )} />
            ))}
          </div>

          <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 text-left">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Transmission Log</h4>
            <div className="space-y-2 font-mono text-[9px] text-slate-500">
              <p className="flex justify-between"><span>[System]</span> <span className="text-emerald-600">Identity Verified</span></p>
              <p className="flex justify-between"><span>[CRM]</span> {syncStep >= 2 ? <span className="text-emerald-600">Customer UUID Linked</span> : <span className="animate-pulse">Awaiting Payload...</span>}</p>
              <p className="flex justify-between"><span>[BSS]</span> {syncStep >= 3 ? <span className="text-emerald-600">Tariff Configured</span> : <span className="animate-pulse">Waiting for CRM...</span>}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isArchived) {
    return (
      <div className="max-w-4xl mx-auto h-full flex items-center justify-center">
        <div className="bg-white p-12 rounded-[3rem] border border-slate-200 shadow-2xl w-full max-w-xl text-center space-y-8 animate-in fade-in duration-700">
          <div className="w-24 h-24 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto shadow-sm border border-emerald-100 rotate-6">
            <Archive size={48} />
          </div>
          <div className="space-y-2">
            <h3 className="text-3xl font-bold text-slate-800">Mission Accomplished</h3>
            <p className="text-slate-500 font-medium">Application Processed & Deep-Archived</p>
          </div>
          
          <div className="p-8 bg-slate-950 rounded-3xl text-left border border-white/10 relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-10">
               <Server size={64} className="text-white" />
             </div>
             <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest mb-6">Activation Result (BSS Back-fill)</p>
             <div className="space-y-4">
                <div className="flex justify-between text-white">
                  <span className="text-[10px] font-bold uppercase opacity-50">Account ID</span>
                  <span className="text-xs font-mono">BSS-CORP-992817</span>
                </div>
                <div className="flex justify-between text-white">
                  <span className="text-[10px] font-bold uppercase opacity-50">Activation Status</span>
                  <span className="text-xs font-bold text-emerald-400">SUCCESS</span>
                </div>
                <div className="flex justify-between text-white border-t border-white/10 pt-4">
                   <p className="text-[9px] opacity-70 italic">Resource activated across 5G Core and Enterprise Billing Node 04.</p>
                </div>
             </div>
          </div>

          <button 
            onClick={() => { setIsArchived(false); setSyncStep(0); }}
            className="w-full py-4 bg-indigo-600 text-white text-xs font-bold uppercase tracking-widest rounded-2xl hover:bg-indigo-700 shadow-lg shadow-indigo-900/10 transition-all active:scale-95"
          >
            Review Next in Queue
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-10 h-full">
      {/* List Area */}
      <div className="xl:col-span-1 space-y-8 flex flex-col">
        <div>
          <h2 className="text-3xl font-bold text-slate-800 tracking-tight">Audit Queue</h2>
          <p className="text-slate-500 text-sm mt-1 font-medium">Verify corporate credentials and biometrics</p>
        </div>

        <div className="space-y-4 flex-1 overflow-y-auto">
          {MOCK_CAFS.filter(c => c.status === 'Pending' || c.status === 'Rejected').map((caf) => (
            <button 
              key={caf.id}
              onClick={() => setSelectedAudit(caf)}
              className={cn(
                "w-full text-left p-6 rounded-2xl border-2 transition-all duration-300",
                selectedAudit.id === caf.id 
                  ? "border-indigo-600 bg-indigo-50/30 shadow-xl shadow-indigo-900/5 ring-4 ring-indigo-500/5" 
                  : "border-slate-100 bg-white hover:border-slate-200"
              )}
            >
              <div className="flex justify-between items-center mb-4">
                <span className="text-[9px] font-bold uppercase bg-slate-800 text-white px-2 py-0.5 rounded tracking-widest font-mono">
                  {caf.id}
                </span>
                <span className={cn(
                  "text-[9px] font-bold uppercase tracking-wider",
                  caf.status === 'Pending' ? "text-amber-600" : "text-rose-600"
                )}>{caf.status}</span>
              </div>
              <h4 className={cn(
                "font-bold text-sm transition-colors",
                selectedAudit.id === caf.id ? "text-indigo-900" : "text-slate-800"
              )}>{caf.fullName}</h4>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mt-1">{caf.customerType} • {caf.serviceType}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Review Area */}
      <div className="xl:col-span-2 space-y-8">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/40 overflow-hidden flex flex-col h-full">
          {/* Audit Header */}
          <div className="px-8 py-6 bg-slate-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-950/20">
                <ShieldCheck size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold tracking-tight">Active Inspector</h3>
                <p className="text-[10px] text-indigo-300 uppercase font-bold tracking-widest mt-0.5">Integrity Verification Mode</p>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-3 px-3 py-1.5 bg-white/10 rounded-xl">
              <span className="text-[10px] font-bold text-indigo-200 uppercase tracking-widest">Audit Score</span>
              <span className="text-sm font-bold">98.2%</span>
            </div>
          </div>

          <div className="p-8 lg:p-12 space-y-12">
            {/* Identity Cross-check */}
            <section className="space-y-6">
              <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <UserCheck size={14} className="text-indigo-600" /> Identity Cross-reference
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Registry Name</p>
                    <p className="text-base font-bold text-slate-900 uppercase">{selectedAudit.fullName}</p>
                 </div>
                 <div className="p-5 bg-indigo-50 rounded-2xl border border-indigo-200 relative overflow-hidden group">
                    <div className="relative z-10">
                      <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest mb-2">Biometric Verification</p>
                      <p className="text-base font-bold text-indigo-900 uppercase">Authenticated - Live Match</p>
                    </div>
                    <CheckCircle2 size={48} className="absolute -bottom-2 -right-2 text-indigo-200/30 group-hover:scale-110 transition-transform duration-500" />
                 </div>
              </div>
            </section>

            {/* Document Evidence */}
            <section className="space-y-6">
               <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Eye size={14} className="text-indigo-600" /> Evidence Inspector
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                {selectedAudit.documents.map((doc, idx) => (
                  <div key={doc.id} className="group relative aspect-[4/3] bg-slate-100 rounded-2xl overflow-hidden border border-slate-200 cursor-zoom-in group active:scale-95 transition-all">
                    {/* Skeleton Overlay */}
                    <div className="absolute inset-x-0 bottom-0 bg-white/90 translate-y-full group-hover:translate-y-0 transition-transform p-3 border-t border-slate-100 backdrop-blur-sm z-10">
                       <p className="text-[9px] font-bold text-slate-900 uppercase truncate">{doc.name}</p>
                    </div>
                    
                    <div className="absolute inset-0 flex items-center justify-center">
                       <FileText size={32} className="text-slate-300 group-hover:text-indigo-600/30 transition-colors" />
                    </div>

                    <div className="absolute top-3 right-3 z-20">
                       <div className={cn(
                          "w-2 h-2 rounded-full",
                          doc.status === 'Verified' ? 'bg-emerald-500' : 
                          doc.status === 'Rejected' ? 'bg-rose-500' : 'bg-amber-500'
                       )} />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Action Bar */}
            <div className="pt-10 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <button 
                onClick={handleApprove}
                className="flex items-center justify-center gap-3 py-4 bg-indigo-600 text-white text-xs font-bold uppercase tracking-widest rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-900/10 active:scale-95"
              >
                <CheckCircle2 size={16} /> Approve
              </button>
              <button className="flex items-center justify-center gap-3 py-4 bg-white border border-amber-200 text-amber-600 text-xs font-bold uppercase tracking-widest rounded-2xl hover:bg-amber-50 transition-all active:scale-95">
                <AlertTriangle size={16} /> Correct
              </button>
              <button className="flex items-center justify-center gap-3 py-4 bg-white border border-rose-200 text-rose-600 text-xs font-bold uppercase tracking-widest rounded-2xl hover:bg-rose-50 transition-all active:scale-95">
                <XCircle size={16} /> Reject
              </button>
              <button className="flex items-center justify-center gap-3 py-4 bg-slate-50 border border-slate-200 text-slate-500 text-xs font-bold uppercase tracking-widest rounded-2xl hover:bg-slate-100 transition-all active:scale-95">
                <History size={16} /> History
              </button>
            </div>
            
            <p className="text-center text-[9px] text-slate-400 font-bold uppercase tracking-widest leading-loose">
              Security Notice: Final approval requires mandatory central database synchronization. <br />
              All actions are recorded under Regional License <span className="text-slate-600">AF-KBL-001A</span>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
