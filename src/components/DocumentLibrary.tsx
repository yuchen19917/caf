import React, { useState } from 'react';
import { 
  Folder, 
  File, 
  Search, 
  MoreVertical, 
  Grid, 
  List,
  Upload,
  Calendar,
  ShieldCheck,
  Building,
  User,
  MoreHorizontal,
  FileText
} from 'lucide-react';
import { cn } from '../lib/utils';

export default function DocumentLibrary() {
  const [view, setView] = useState<'grid' | 'list'>('grid');

  const folders = [
    { name: 'Kabul North Registry', files: 124, type: 'Region' },
    { name: 'Corporate Vault', files: 89, type: 'Category' },
    { name: 'Audit Backlog', files: 45, type: 'Status' },
    { name: 'SIM Processing', files: 312, type: 'Workload' },
  ];

  const recentFiles = [
    { name: 'TAZ-Farooq-01.jpg', size: '1.2 MB', date: '12 mins ago', type: 'Image', status: 'Verified' },
    { name: 'LIC-AfghanTech.pdf', size: '3.4 MB', date: '2 hours ago', type: 'PDF', status: 'Pending' },
    { name: 'CAF-2024-001.pdf', size: '0.8 MB', date: '1 day ago', type: 'PDF', status: 'Approved' },
    { name: 'PHOTO-Zahra.png', size: '2.1 MB', date: '3 days ago', type: 'Image', status: 'Rejected' },
  ];

  return (
    <div className="space-y-10 pb-12 overflow-hidden flex flex-col h-full">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-800 tracking-tight">Document Vault</h2>
          <p className="text-slate-500 text-sm mt-1 font-medium">Unified repository for CAF evidence and regulatory documents</p>
        </div>
        <button className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-900/10">
          <Upload size={14} /> Bulk Registry Import
        </button>
      </div>

      {/* Global Search */}
      <div className="relative">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input 
          type="text" 
          placeholder="Search by filename, customer CID, or regulatory tag..."
          className="w-full pl-14 pr-6 py-4 bg-white border border-slate-200 rounded-3xl text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all shadow-sm font-medium"
        />
      </div>

      {/* Directories */}
      <section className="space-y-6">
        <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Regional Collections</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {folders.map((folder) => (
            <div key={folder.name} className="group p-6 bg-white border border-slate-200 rounded-2xl hover:border-indigo-600 hover:shadow-xl hover:shadow-indigo-900/5 transition-all cursor-pointer">
              <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                  <Folder size={20} />
                </div>
                <button className="text-slate-300 hover:text-slate-600 transition-colors">
                  <MoreHorizontal size={18} />
                </button>
              </div>
              <h4 className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">{folder.name}</h4>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase">{folder.files} Files</span>
                <span className="w-1 h-1 rounded-full bg-slate-300" />
                <span className="text-[10px] font-bold text-indigo-500 uppercase">{folder.type}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Recent Files Table */}
      <section className="space-y-6">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Recent Evidence Filings</h3>
          <div className="flex items-center bg-slate-100 rounded-xl p-1">
            <button 
              onClick={() => setView('grid')}
              className={cn("p-1.5 rounded-lg transition-all", view === 'grid' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500")}
            >
              <Grid size={14} />
            </button>
            <button 
              onClick={() => setView('list')}
              className={cn("p-1.5 rounded-lg transition-all", view === 'list' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500")}
            >
              <List size={14} />
            </button>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
          <div className="divide-y divide-slate-100">
            {recentFiles.map((file) => (
              <div key={file.name} className="px-8 py-5 flex items-center justify-between hover:bg-slate-50 transition-colors group">
                <div className="flex items-center space-x-6">
                  <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100 group-hover:bg-white group-hover:border-indigo-100 transition-all">
                    {file.type === 'PDF' ? <FileText size={20} className="text-indigo-600/50" /> : <File size={20} />}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                      {file.name}
                      {file.status === 'Verified' && <ShieldCheck size={14} className="text-emerald-500" />}
                    </h4>
                    <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">{file.type} • {file.size} • Uploaded {file.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className={cn(
                    "text-[9px] font-extrabold uppercase px-2 py-1 rounded tracking-widest",
                    file.status === 'Verified' ? "bg-emerald-50 text-emerald-700" :
                    file.status === 'Rejected' ? "bg-rose-50 text-rose-700" : "bg-amber-50 text-amber-700"
                  )}>
                    {file.status}
                  </span>
                  <button className="p-2 text-slate-300 hover:text-slate-900 transition-colors">
                    <MoreVertical size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="p-4 bg-slate-50/50 text-center border-t border-slate-100">
            <button className="text-[10px] font-bold text-indigo-600 hover:text-indigo-700 uppercase tracking-widest">Open Archive Explorer</button>
          </div>
        </div>
      </section>
    </div>
  );
}
