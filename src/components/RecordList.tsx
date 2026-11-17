import { useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

export interface RecordFilter<T> {
  label: string;
  value: (row: T) => string;
  mode?: 'text' | 'select';
  display?: (value: string) => string;
}

export function RecordList<T>({ rows, columns, search, filters = [], renderRow }: {
  rows: readonly T[];
  columns: string[];
  search?: (row: T) => readonly (string | number | null | undefined)[];
  filters?: RecordFilter<T>[];
  renderRow: (row: T) => ReactNode;
}) {
  const { t } = useTranslation();
  const [keyword, setKeyword] = useState('');
  const [selected, setSelected] = useState<Record<number, string>>({});
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);
  const query = keyword.trim().toLowerCase();
  const filtered = rows.filter(row =>
    (!query || search?.(row).some(value => String(value ?? '').toLowerCase().includes(query))) &&
    filters.every((filter, index) => {
      const selectedValue = filter.mode === 'text' ? selected[index]?.trim() : selected[index];
      if (!selectedValue) return true;
      const value = filter.value(row);
      return filter.mode === 'text'
        ? value.toLowerCase().includes(selectedValue.toLowerCase())
        : value === selectedValue;
    })
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / size));
  const current = Math.min(page, totalPages);
  const offset = (current - 1) * size;
  const control = 'mt-1 block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100';
  const button = 'rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-50';

  return (
    <div className="min-w-0 space-y-4">
      <section aria-label={t('templates_page.filters_label')} className="flex flex-wrap items-end gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        {search && <label className="min-w-48 flex-[2] text-xs font-semibold text-slate-600">
          {t('templates_page.filter_keyword')}
          <input type="search" className={control} value={keyword}
            onChange={event => { setKeyword(event.target.value); setPage(1); }} />
        </label>}
        {filters.map(({ label, value, display, mode }, index) => (
          <label key={label} className="min-w-32 flex-1 text-xs font-semibold text-slate-600">
            {label}
            {mode === 'text' ? <input type="search" className={control} value={selected[index] ?? ''}
              onChange={event => { setSelected(previous => ({ ...previous, [index]: event.target.value })); setPage(1); }} />
              : <select className={control} value={selected[index] ?? ''}
              onChange={event => { setSelected(previous => ({ ...previous, [index]: event.target.value })); setPage(1); }}>
              <option value="">{t('templates_page.filter_all')}</option>
              {[...new Set(rows.map(value))].filter(Boolean).sort().map(option => (
                <option key={option} value={option}>{display?.(option) ?? option}</option>
              ))}
            </select>}
          </label>
        ))}
        <button type="button" className={button}
          onClick={() => { setKeyword(''); setSelected({}); setPage(1); }}>
          {t('templates_page.filter_reset')}
        </button>
      </section>
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="record-list-table w-full border-collapse whitespace-nowrap text-start text-sm">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>{columns.map((column, index) => <th key={index} scope="col">{column}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length ? filtered.slice(offset, offset + size).map(renderRow) : (
                <tr><td colSpan={columns.length} className="text-center text-slate-500">{t('templates_page.filter_empty')}</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
          <span aria-live="polite">{t('record_list.range', {
            start: filtered.length ? offset + 1 : 0, end: Math.min(offset + size, filtered.length), count: filtered.length,
          })}</span>
          <nav aria-label={t('record_list.pagination')} className="flex flex-wrap items-center gap-2">
            <label className="flex items-center gap-2">{t('templates_page.page_size')}
              <select className={button} value={size} onChange={event => { setSize(Number(event.target.value)); setPage(1); }}>
                {[5, 10, 20, 50].map(value => <option key={value} value={value}>{value}</option>)}
              </select>
            </label>
            <button type="button" className={button} disabled={current === 1} onClick={() => setPage(current - 1)}>{t('templates_page.previous_page')}</button>
            <span aria-current="page">{current} / {totalPages}</span>
            <button type="button" className={button} disabled={current === totalPages} onClick={() => setPage(current + 1)}>{t('templates_page.next_page')}</button>
          </nav>
        </div>
      </div>
    </div>
  );
}
