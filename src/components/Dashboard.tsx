import React, { useMemo } from 'react';
import { FileText, Clock, CheckCircle2, XCircle, Archive, User, Building2 } from 'lucide-react';
import { useApplications } from '../context/ApplicationContext';
import { cn } from '../lib/utils';
import { useTranslation } from 'react-i18next';

const STATUS_STYLES: Record<string, { dot: string; badge: string; label: string }> = {
  Pending:    { dot: 'bg-amber-400',  badge: 'bg-amber-50 text-amber-700 border-amber-200',  label: 'Pending'    },
  Approved:   { dot: 'bg-green-500',  badge: 'bg-green-50 text-green-700 border-green-200',  label: 'Approved'   },
  Rejected:   { dot: 'bg-red-500',    badge: 'bg-red-50 text-red-700 border-red-200',        label: 'Rejected'   },
  Correction: { dot: 'bg-blue-500',   badge: 'bg-blue-50 text-blue-700 border-blue-200',     label: 'Correction' },
  Archived:   { dot: 'bg-gray-400',   badge: 'bg-gray-50 text-gray-600 border-gray-200',     label: 'Archived'   },
  Draft:      { dot: 'bg-slate-300',  badge: 'bg-slate-50 text-slate-500 border-slate-200',  label: 'Draft'      },
};

export default function Dashboard({ user }: { user: any }) {
  const { getFilteredCAFs, loading } = useApplications();
  const { t } = useTranslation();

  const cafs = useMemo(() => (user ? getFilteredCAFs(user) : []), [getFilteredCAFs, user]);

  const stats = useMemo(() => ({
    total:      cafs.length,
    pending:    cafs.filter(c => c.status === 'Pending').length,
    approved:   cafs.filter(c => c.status === 'Approved').length,
    rejected:   cafs.filter(c => c.status === 'Rejected').length,
    correction: cafs.filter(c => c.status === 'Correction').length,
    archived:   cafs.filter(c => c.status === 'Archived').length,
    individual: cafs.filter(c => c.customerType === 'Individual').length,
    corporate:  cafs.filter(c => c.customerType === 'Corporate').length,
  }), [cafs]);

  const recentCAFs = useMemo(() =>
    [...cafs]
      .sort((a, b) => new Date(b.submissionDate).getTime() - new Date(a.submissionDate).getTime())
      .slice(0, 8),
    [cafs]
  );

  const distribution = useMemo(() => {
    const total = stats.total || 1;
    return [
      { labelKey: 'dashboard.status_pending',    value: stats.pending,    pct: stats.pending / total * 100,    bar: 'bg-amber-400' },
      { labelKey: 'dashboard.status_approved',   value: stats.approved,   pct: stats.approved / total * 100,   bar: 'bg-green-500' },
      { labelKey: 'dashboard.status_archived',   value: stats.archived,   pct: stats.archived / total * 100,   bar: 'bg-gray-300'  },
      { labelKey: 'dashboard.status_correction', value: stats.correction, pct: stats.correction / total * 100, bar: 'bg-blue-400'  },
      { labelKey: 'dashboard.status_rejected',   value: stats.rejected,   pct: stats.rejected / total * 100,   bar: 'bg-red-400'   },
    ];
  }, [stats]);

  if (loading) return <div className="flex items-center justify-center h-48 text-sm text-gray-500">Loading…</div>;

  if (cafs.length === 0 && user?.role === 'agent') {
    return (
      <div className="border border-dashed border-gray-300 rounded-lg p-12 text-center">
        <FileText size={32} className="mx-auto text-gray-300 mb-3" />
        <p className="text-sm font-medium text-gray-600">{t('dashboard.no_cafs')}</p>
        <p className="text-xs text-gray-400 mt-1">{t('dashboard.first_caf_hint')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between pb-1">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">{t('dashboard.ops_title')}</h2>
          <p className="text-sm text-gray-500 mt-0.5">{t('dashboard.ops_subtitle')}</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500 bg-white border border-gray-200 rounded px-2.5 py-1.5">
          <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
          {t('dashboard.all_systems_ok')}
        </div>
      </div>

      {/* Primary KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { labelKey: 'dashboard.total_applications', value: stats.total,    Icon: FileText,     accent: 'border-l-blue-500'  },
          { labelKey: 'dashboard.pending_review',     value: stats.pending,  Icon: Clock,        accent: 'border-l-amber-400' },
          { labelKey: 'dashboard.approved',           value: stats.approved, Icon: CheckCircle2, accent: 'border-l-green-500' },
          { labelKey: 'dashboard.rejected',           value: stats.rejected, Icon: XCircle,      accent: 'border-l-red-400'   },
        ].map(({ labelKey, value, Icon, accent }) => (
          <div key={labelKey} className={cn('bg-white border border-gray-200 border-l-4 rounded-lg p-4', accent)}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-gray-500">{t(labelKey)}</p>
                <p className="text-2xl font-bold text-gray-900 mt-0.5">{value}</p>
              </div>
              <Icon size={15} className="text-gray-300 mt-0.5" />
            </div>
          </div>
        ))}
      </div>

      {/* Secondary KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { labelKey: 'dashboard.correction_needed',  value: stats.correction, Icon: Clock,     color: 'text-blue-500'   },
          { labelKey: 'dashboard.archived',           value: stats.archived,   Icon: Archive,   color: 'text-gray-400'   },
          { labelKey: 'dashboard.individual_customers', value: stats.individual, Icon: User,    color: 'text-indigo-500' },
          { labelKey: 'dashboard.corporate_accounts', value: stats.corporate,  Icon: Building2, color: 'text-violet-500' },
        ].map(({ labelKey, value, Icon, color }) => (
          <div key={labelKey} className="bg-white border border-gray-200 rounded-lg p-3 flex items-center gap-3">
            <Icon size={15} className={color} />
            <div>
              <p className="text-xs text-gray-500">{t(labelKey)}</p>
              <p className="text-lg font-semibold text-gray-900">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom panels */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Distribution */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="px-4 py-2.5 border-b border-gray-100 bg-gray-50">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{t('dashboard.status_distribution')}</p>
          </div>
          <div className="p-4 space-y-3">
            {distribution.map(row => (
              <div key={row.labelKey}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-600">{t(row.labelKey)}</span>
                  <span className="text-xs font-medium text-gray-800">
                    {row.value} <span className="text-gray-400 font-normal text-[11px]">({row.pct.toFixed(0)}%)</span>
                  </span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className={cn('h-full rounded-full', row.bar)} style={{ width: `${row.pct}%` }} />
                </div>
              </div>
            ))}
            <div className="pt-2 border-t border-gray-100 flex justify-between text-xs text-gray-500">
              <span>{t('dashboard.total_records')}</span>
              <span className="font-semibold text-gray-700">{stats.total}</span>
            </div>
          </div>
        </div>

        {/* Recent applications */}
        <div className="lg:col-span-3 bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="px-4 py-2.5 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{t('dashboard.recent_applications')}</p>
            <span className="text-xs text-gray-400">{t('dashboard.entries_count', { count: recentCAFs.length })}</span>
          </div>
          {recentCAFs.length === 0 ? (
            <div className="p-8 text-center text-xs text-gray-400">{t('dashboard.no_apps_found')}</div>
          ) : (
            <table className="w-full text-sm">
              <tbody className="divide-y divide-gray-50">
                {recentCAFs.map(caf => {
                  const s = STATUS_STYLES[caf.status] || STATUS_STYLES.Draft;
                  return (
                    <tr key={caf.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-2.5 w-4">
                        <span className={cn('w-2 h-2 rounded-full block', s.dot)} />
                      </td>
                      <td className="py-2.5 pr-3">
                        <p className="text-sm font-medium text-gray-800 truncate max-w-[160px]">{caf.fullName}</p>
                        <p className="text-xs text-gray-400">{caf.id}</p>
                      </td>
                      <td className="py-2.5 pr-3 hidden md:table-cell">
                        <p className="text-xs text-gray-600">{caf.serviceType}</p>
                        <p className="text-xs text-gray-400">{caf.customerType}</p>
                      </td>
                      <td className="py-2.5 pr-4 text-right">
                        <span className={cn('text-[11px] font-medium px-1.5 py-0.5 rounded border', s.badge)}>{s.label}</span>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {new Date(caf.submissionDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                        </p>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
