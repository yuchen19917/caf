import React from 'react';
import { motion } from 'motion/react';
import { 
  Users, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  ArrowUpRight, 
  FileSearch,
  ScanFace
} from 'lucide-react';
import { MOCK_STATS } from '../mockData';
import { useTranslation } from 'react-i18next';

export default function Dashboard() {
  const { t } = useTranslation();
  const cards = [
    { label: t('dashboard.pending'), value: MOCK_STATS.totalPending, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-100' },
    { label: t('dashboard.active'), value: MOCK_STATS.totalApproved, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-100' },
    { label: 'Rejected Entries', value: MOCK_STATS.totalRejected, icon: AlertCircle, color: 'text-rose-600', bg: 'bg-rose-100' },
    { label: 'Total Documents', value: MOCK_STATS.totalDocs, icon: FileSearch, color: 'text-indigo-600', bg: 'bg-indigo-100' },
  ];

  return (
    <div className="space-y-10">
      {/* Welcome Header */}
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-slate-800 tracking-tight">Regional Dashboard</h2>
          <p className="text-slate-500 text-sm mt-1 font-medium">Review and process incoming SIM registration requests</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-lg">
           <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
           <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Real-time Feed</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, index) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all group"
          >
            <div className="flex items-start justify-between">
              <div className={cn("p-2 rounded-lg", card.bg)}>
                <card.icon size={20} className={card.color} />
              </div>
              <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2.5 py-1 rounded-full">+4.2%</span>
            </div>
            <div className="mt-4">
              <h3 className="text-3xl font-extrabold text-slate-900 tracking-tighter">{card.value.toLocaleString()}</h3>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1.5">{card.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <ScanFace size={16} className="text-indigo-600" />
              Latest Submissions
            </h3>
            <button className="text-[11px] font-bold text-indigo-600 hover:text-indigo-700 transition-colors uppercase tracking-widest">
              View Register
            </button>
          </div>
          
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            {[
              { name: 'Abdul Samad', type: 'Individual / SIM Registration', time: '2 mins ago', status: 'Pending Review', statusBg: 'bg-amber-100 text-amber-700' },
              { name: 'Kite Services Corp', type: 'Corporate / Bulk SIM', time: '15 mins ago', status: 'Audit Ready', statusBg: 'bg-indigo-100 text-indigo-700' },
              { name: 'Mariam Noori', type: 'Individual / Ownership Transfer', time: '1 hour ago', status: 'In Process', statusBg: 'bg-slate-100 text-slate-600' },
            ].map((item, i) => (
              <div key={i} className="px-6 py-4 hover:bg-slate-50 transition-colors flex items-center justify-between border-b last:border-0 border-slate-100">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-500 text-xs shadow-inner">
                    {item.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">{item.name}</h4>
                    <p className="text-xs text-slate-400 font-medium">{item.type} • {item.time}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={cn(
                    "text-[10px] font-bold uppercase px-2 py-1 rounded tracking-wide",
                    item.statusBg
                  )}>
                    {item.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Audit Queue Card */}
        <div className="space-y-6">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Compliance Audit</h3>
          <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm relative overflow-hidden group">
            <div className="relative z-10">
              <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mb-6 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                <ScanFace size={24} />
              </div>
              <h4 className="text-xl font-bold text-slate-900 mb-2 tracking-tight">Biometric Audit</h4>
              <p className="text-sm text-slate-500 leading-relaxed mb-8">
                12 High-priority cases pending signature verification and biometric match.
              </p>
              <button className="w-full bg-indigo-600 text-white text-sm font-bold py-3.5 rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-900/10">
                Begin Verification
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
