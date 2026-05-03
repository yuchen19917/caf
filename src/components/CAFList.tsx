import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Download, 
  Eye, 
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  UserPlus
} from 'lucide-react';
import { MOCK_CAFS } from '../mockData';
import { cn } from '../lib/utils';
import { CAFStatus } from '../types';

interface CAFListProps {
  onCorrect?: (caf: any) => void;
  onNewEntry?: () => void;
}

export default function CAFList({ onCorrect, onNewEntry }: CAFListProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const getStatusColor = (status: CAFStatus) => {
    switch (status) {
      case 'Approved': return 'bg-emerald-100 text-emerald-700';
      case 'Pending': return 'bg-amber-100 text-amber-700';
      case 'Rejected': return 'bg-rose-100 text-rose-700';
      case 'Correction': return 'bg-indigo-100 text-indigo-700';
      case 'Archived': return 'bg-slate-100 text-slate-500';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="space-y-8 flex flex-col h-full">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-800 tracking-tight">Customer Registry</h2>
          <p className="text-slate-500 text-sm mt-1 font-medium">Review and process incoming SIM registration requests</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest text-slate-600 hover:bg-slate-50 shadow-sm transition-all active:scale-95">
            <Download size={14} /> Export XLS
          </button>
          <button 
            onClick={onNewEntry}
            className="flex items-center gap-2 bg-indigo-600 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest text-white hover:bg-indigo-700 shadow-lg shadow-indigo-900/10 transition-all active:scale-95"
          >
            <UserPlus size={14} /> New CAF Entry
          </button>
        </div>
      </div>

      {/* Table & Tools */}
      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm flex flex-col overflow-hidden">
        {/* Search Bar Header */}
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row gap-4 bg-slate-50/50">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Filter by name, CAF number or ID..."
              className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-slate-900">
              <Filter size={14} /> Filters
            </button>
            <div className="h-6 w-[1px] bg-slate-200 mx-1" />
            <select className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold uppercase tracking-widest text-slate-500 focus:outline-none">
              <option>Status: All</option>
              <option>Pending</option>
              <option>Approved</option>
              <option>Correction Required</option>
              <option>Archived</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="pl-8 pr-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Customer Profile</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Type</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Plan Details</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Submitted</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Audit Status</th>
                <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right whitespace-nowrap">Inspector</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {MOCK_CAFS.filter(caf => 
                caf.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                caf.id.toLowerCase().includes(searchTerm.toLowerCase())
              ).map((caf) => (
                <tr key={caf.id} className="hover:bg-indigo-50/20 transition-colors group cursor-pointer">
                  <td className="pl-8 pr-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-500 text-[10px] uppercase">
                        {caf.fullName.charAt(0)}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-800">{caf.fullName}</span>
                        <span className="text-[10px] font-bold text-slate-400 font-mono tracking-tighter uppercase">{caf.id}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className={cn(
                      "text-[9px] font-extrabold uppercase px-2 py-0.5 rounded tracking-widest ring-1 ring-inset",
                      caf.customerType === 'Corporate' ? 'bg-indigo-50 text-indigo-700 ring-indigo-200' : 'bg-slate-50 text-slate-600 ring-slate-200'
                    )}>
                      {caf.customerType}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-slate-700">{caf.planName}</span>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">{caf.serviceType}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className="text-xs font-medium text-slate-500 whitespace-nowrap">
                      {new Date(caf.submissionDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    <span className={cn(
                      "text-[10px] font-bold uppercase px-2 py-1 rounded shadow-sm",
                      getStatusColor(caf.status)
                    )}>
                      {caf.status}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex items-center justify-end gap-2">
                       {caf.status === 'Correction' && (
                         <button 
                           onClick={(e) => { e.stopPropagation(); onCorrect?.(caf); }}
                           className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all" 
                           title="Correct Submission"
                         >
                           <UserPlus size={18} />
                         </button>
                       )}
                       {caf.status === 'Approved' && (
                         <button className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all" title="Archive CAF">
                           <Download size={18} />
                         </button>
                       )}
                       <button className="p-2 text-slate-300 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all" title="View Detail">
                         <Eye size={18} />
                       </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Improved Pagination */}
        <div className="px-8 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Showing <span className="text-slate-900">1-3</span> of <span className="text-slate-900">24</span> CAFs
          </p>
          <div className="flex items-center gap-1.5">
            <button className="w-8 h-8 flex items-center justify-center border border-slate-200 rounded-lg text-slate-400 disabled:opacity-30" disabled>
              <ChevronLeft size={16} />
            </button>
            <div className="w-8 h-8 flex items-center justify-center bg-indigo-600 text-white rounded-lg text-[10px] font-bold">1</div>
            <button className="w-8 h-8 flex items-center justify-center border border-slate-200 rounded-lg text-slate-700 hover:bg-white hover:shadow-sm">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
