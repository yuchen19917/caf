import { useState, type ReactNode } from 'react';
import { ArrowRight, Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useApplications } from '../context/ApplicationContext';
import { hasPermission, type User } from '../lib/auth';
import { cn, wasSubmittedToday } from '../lib/utils';
import type { CAFStatus, CustomerApplicationForm } from '../types';

export type ApplicationShortcut = 'today' | 'Archived' | 'Correction';
type Task = 'Pending' | 'Correction';

function WorkTable({ columns, children, empty }: { columns: string[]; children: ReactNode; empty?: string }) {
  return (
    <div className="overflow-x-auto">
      <table className="record-list-table w-full border-collapse whitespace-nowrap text-start text-sm">
        <thead className="border-y border-slate-200 bg-slate-50">
          <tr>{columns.map(column => <th key={column} scope="col">{column}</th>)}</tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {empty ? <tr><td colSpan={columns.length} className="text-center text-slate-500">{empty}</td></tr> : children}
        </tbody>
      </table>
    </div>
  );
}

export default function Dashboard({ user, onNew, onView, onCorrect, onReview, onApplications }: {
  user: User;
  onNew: () => void;
  onView: (caf: CustomerApplicationForm) => void;
  onCorrect: (caf: CustomerApplicationForm) => void;
  onReview: (id?: string) => void;
  onApplications: (filter?: ApplicationShortcut) => void;
}) {
  const { t, i18n } = useTranslation();
  const { getFilteredCAFs, loading } = useApplications();
  const canReview = hasPermission(user, 'viewAuditQueue');
  const canCreate = hasPermission(user, 'createCAF');
  const [task, setTask] = useState<Task>(canReview ? 'Pending' : 'Correction');
  const cafs = getFilteredCAFs(user);
  const pending = cafs.filter(caf => caf.status === 'Pending');
  const corrections = cafs.filter(caf => caf.status === 'Correction' &&
    (caf.createdBy === user.id || caf.createdByUsername === user.username));
  const sorted = [...cafs].sort((a, b) => Date.parse(b.submissionDate) - Date.parse(a.submissionDate));
  const recent = sorted.slice(0, 5);
  const tasks = (task === 'Pending' ? pending : corrections).slice()
    .sort((a, b) => Date.parse(a.history?.at(-1)?.at ?? a.submissionDate) - Date.parse(b.history?.at(-1)?.at ?? b.submissionDate))
    .slice(0, 5);
  const action = 'inline-flex items-center gap-1 text-sm font-semibold text-indigo-700 hover:underline';
  const status = (value: CAFStatus) => t('caf_list.status_' + value.toLowerCase(), { defaultValue: value });
  const metrics = [
    { label: status('Pending'), count: pending.length, click: canReview ? () => setTask('Pending') : undefined },
    { label: status('Correction'), count: corrections.length, click: canCreate ? () => setTask('Correction') : undefined },
    { label: t('dashboard.today_submitted'), count: cafs.filter(wasSubmittedToday).length, click: () => onApplications('today') },
    { label: status('Archived'), count: cafs.filter(caf => caf.status === 'Archived').length, click: () => onApplications('Archived') },
  ];
  const commonColumns = [t('document_library.caf_number'), t('caf_list.col_customer'), t('record_list.service')];
  const actionColumn = t('templates_page.table_actions');

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{t('dashboard.workbench')}</h1>
          <p className="mt-1 text-sm text-slate-500">{t('dashboard.workbench_description')}</p>
        </div>
        {canCreate && <button type="button" onClick={onNew}
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700">
          <Plus size={16} /> {t('common.new_caf')}
        </button>}
      </header>

      <dl className="grid grid-cols-2 divide-x divide-slate-200 rounded-xl border border-slate-200 bg-white sm:grid-cols-4">
        {metrics.map(metric => (
          <div key={metric.label} className="px-4 py-3">
            <dt className="text-sm text-slate-600">{metric.label}</dt>
            <dd className="mt-1 text-2xl font-semibold tabular-nums text-slate-900">
              {metric.click ? <button type="button" onClick={metric.click} aria-label={metric.label}
                className="rounded hover:text-indigo-700">{loading ? '—' : metric.count}</button> : loading ? '—' : metric.count}
            </dd>
          </div>
        ))}
      </dl>

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <header className="flex flex-wrap items-center justify-between gap-3 px-4 py-4">
          <h2 className="font-semibold text-slate-900">{t('dashboard.my_tasks')}</h2>
          {(canReview || canCreate) && <button type="button" className={action}
            onClick={() => task === 'Pending' ? onReview() : onApplications('Correction')}>
            {t('dashboard.all_tasks')} <ArrowRight size={15} />
          </button>}
        </header>
        <div className="flex gap-2 px-4 pb-3">
          {([['Pending', pending.length, canReview], ['Correction', corrections.length, canCreate]] as const)
            .filter(([, , allowed]) => allowed)
            .map(([value, count]) => (
              <button key={value} type="button" aria-pressed={task === value} onClick={() => setTask(value)}
                className={cn('rounded-lg px-3 py-1.5 text-sm font-medium', task === value ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50')}>
                {status(value)} · {count}
              </button>
            ))}
        </div>
        <WorkTable columns={[...commonColumns, t('dashboard.waiting'), actionColumn]}
          empty={loading ? t('dashboard.workbench_loading') : tasks.length ? undefined : t('dashboard.no_tasks')}>
          {tasks.map(caf => {
            const since = caf.history?.at(-1)?.at ?? caf.submissionDate;
            const minutes = Math.max(0, Math.floor((Date.now() - Date.parse(since)) / 60000));
            const [unit, count] = minutes >= 1440 ? ['day', Math.floor(minutes / 1440)] :
              minutes >= 60 ? ['hour', Math.floor(minutes / 60)] : ['minute', minutes];
            return (
              <tr key={caf.id}>
                <td>{caf.id}</td><td className="font-medium">{caf.fullName}</td><td>{caf.serviceType}</td>
                <td>{Number.isFinite(count) ? new Intl.NumberFormat(i18n.language, { style: 'unit', unit }).format(count) : '—'}</td>
                <td><button type="button" className={action} onClick={() => task === 'Pending' ? onReview(caf.id) : onCorrect(caf)}>
                  {t(task === 'Pending' ? 'dashboard.review_task' : 'caf_list.correct_submission')} <ArrowRight size={15} />
                </button></td>
              </tr>
            );
          })}
        </WorkTable>
      </section>

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <header className="flex flex-wrap items-center justify-between gap-3 px-4 py-4">
          <h2 className="font-semibold text-slate-900">{t('dashboard.recent_applications')}</h2>
          <button type="button" className={action} onClick={() => onApplications()}>
            {t('dashboard.all_applications')} <ArrowRight size={15} />
          </button>
        </header>
        <WorkTable columns={[...commonColumns, t('caf_list.col_submitted'), t('caf_list.col_status'), actionColumn]}
          empty={loading ? t('dashboard.workbench_loading') : recent.length ? undefined : t('dashboard.no_apps_found')}>
          {recent.map(caf => (
            <tr key={caf.id}>
              <td>{caf.id}</td><td className="font-medium">{caf.fullName}</td><td>{caf.serviceType}</td>
              <td>{new Date(caf.submissionDate).toLocaleString(i18n.language, { dateStyle: 'medium', timeStyle: 'short' })}</td>
              <td><span className={cn('rounded px-2 py-1 text-xs font-semibold', caf.status === 'Correction' ? 'bg-amber-50 text-amber-800' :
                caf.status === 'Archived' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-700')}>{status(caf.status)}</span></td>
              <td><button type="button" className={action} onClick={() => onView(caf)}>{t('caf_list.view_detail')}</button></td>
            </tr>
          ))}
        </WorkTable>
      </section>
    </div>
  );
}
