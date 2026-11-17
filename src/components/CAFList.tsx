import { RecordList } from './RecordList';
import React from 'react';
import {
  Download,
  Eye,
  UserPlus
} from 'lucide-react';
import { cn, wasSubmittedToday } from '../lib/utils';
import type { ApplicationShortcut } from './Dashboard';
import { useApplications } from '../context/ApplicationContext';
import type { CAFStatus, CustomerApplicationForm } from '../types';
import { useTranslation } from 'react-i18next';

interface CAFListProps {
  onCorrect?: (caf: any) => void;
  onNewEntry?: () => void;
  onView?: (caf: any) => void;
  shortcut?: ApplicationShortcut;
  onClearShortcut?: () => void;
  user: any;
}

export default function CAFList({ onCorrect, onNewEntry, onView, user, shortcut, onClearShortcut }: CAFListProps) {
  const { getFilteredCAFs } = useApplications();
  const { t } = useTranslation();
  const cafs = getFilteredCAFs(user).filter(caf => {
    if (shortcut === 'today') return wasSubmittedToday(caf);
    if (shortcut === 'Correction') {
      return caf.status === 'Correction' && (caf.createdBy === user.id || caf.createdByUsername === user.username);
    }
    return !shortcut || caf.status === shortcut;
  });

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
          <h2 className="text-3xl font-bold text-slate-800 tracking-tight">{t('caf_list.title')}</h2>
          <p className="text-slate-500 text-sm mt-1 font-medium">{t('caf_list.subtitle')}</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest text-slate-600 hover:bg-slate-50 shadow-sm transition-all active:scale-95">
            <Download size={14} /> {t('caf_list.export_xls')}
          </button>
          <button
            onClick={onNewEntry}
            className="flex items-center gap-2 bg-indigo-600 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest text-white hover:bg-indigo-700 shadow-lg shadow-indigo-900/10 transition-all active:scale-95"
          >
            <UserPlus size={14} /> {t('caf_list.new_entry')}
          </button>
        </div>
      </div>

      {shortcut && (
        <div className="flex items-center gap-3 text-sm">
          <span className="rounded-lg bg-indigo-50 px-3 py-1.5 font-medium text-indigo-700">
            {t(shortcut === 'today' ? 'dashboard.today_submitted' : 'caf_list.status_' + shortcut.toLowerCase())}
          </span>
          <button type="button" className="text-slate-600 underline" onClick={onClearShortcut}>{t('templates_page.filter_reset')}</button>
        </div>
      )}
      <RecordList<CustomerApplicationForm> rows={cafs}
        columns={[t('caf_list.col_customer'), t('document_library.caf_number'), t('caf_list.col_type'), t('caf_list.col_plan'),
          t('record_list.service'), t('caf_list.col_submitted'), t('caf_list.col_status'), t('templates_page.table_actions')]}
        search={caf => [caf.fullName, caf.id, caf.planName, caf.serviceType, caf.contactNumber]}
        filters={[
          { label: t('templates_page.filter_customer'), value: caf => caf.customerType },
          { label: t('caf_list.col_status'), value: caf => caf.status },
        ]}
        renderRow={caf => (
                <tr key={caf.id} className="hover:bg-indigo-50/20 transition-colors group cursor-pointer">
                  <td className="font-semibold text-slate-800">{caf.fullName}</td>
                  <td className="text-xs text-slate-600">{caf.id}</td>
                  <td className="px-6 py-5">
                    <span className={cn(
                      "text-[9px] font-extrabold uppercase px-2 py-0.5 rounded tracking-widest ring-1 ring-inset",
                      caf.customerType === 'Corporate' ? 'bg-indigo-50 text-indigo-700 ring-indigo-200' : 'bg-slate-50 text-slate-600 ring-slate-200'
                    )}>
                      {caf.customerType}
                    </span>
                  </td>
                  <td className="px-6 py-5">
                    {caf.planName}
                  </td>
                  <td className="text-xs text-slate-600">{caf.serviceType}</td>
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
                           title={t('caf_list.correct_submission')}
                         >
                           <UserPlus size={18} />
                         </button>
                       )}
                       <button
                         onClick={(e) => { e.stopPropagation(); onView?.(caf); }}
                         className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                         title={t('caf_list.view_detail')}
                       >
                         <Eye size={18} />
                       </button>
                    </div>
                  </td>
                </tr>
        )}
      />
    </div>
  );
}
