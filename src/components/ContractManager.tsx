import { PreviewDrawer } from './PreviewDrawer';
import { RecordList } from './RecordList';
import React, { useState, useMemo } from 'react';
import {
  Briefcase, CheckCircle2, AlertTriangle, XCircle, Clock,
  ChevronRight, Download, Search, X, Calendar, Building2,
  Handshake, FileText
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useTemplates } from '../hooks/useTemplates';
import { getTemplatePreviewValues, renderBlueprint } from '../lib/blueprintPreview';
import type { CAFTemplate } from '../types';
import '../blueprintPaper.css';
import 'react-quill-new/dist/quill.snow.css';

// ── Types & Mock Data ─────────────────────────────────────────────────────────

type ContractType = 'Vendor SLA' | 'Interconnect' | 'Lease' | 'RoW' | 'NDA' | 'O&M';
type ContractStatus = 'active' | 'expiring' | 'expired' | 'pending';

interface Contract {
  id: string;
  title: string;
  counterparty: string;
  type: ContractType;
  value: number | null;
  currency: string;
  signed: string;
  expiry: string;
  status: ContractStatus;
  autoRenew: boolean;
  owner: string;
  keyTerms: string[];
  penaltyClause?: string;
}

const CONTRACTS: Contract[] = [
  {
    id: 'CTR-001', title: 'Nokia Network Equipment Support Agreement',
    counterparty: 'Nokia Solutions and Networks OY', type: 'Vendor SLA',
    value: 2_400_000, currency: 'USD', signed: '2024-07-01', expiry: '2027-06-30',
    status: 'active', autoRenew: true, owner: 'Eng. Ahmad Rahimi',
    keyTerms: ['24/7 NOC support', 'Spare parts within 4 hrs Kabul / 24 hrs regions', 'Software upgrade entitlement'],
    penaltyClause: '2% monthly credit for SLA breach above 4-hour MTTR threshold',
  },
  {
    id: 'CTR-002', title: 'Ericsson 5G RAN Deployment & O&M',
    counterparty: 'Ericsson AB', type: 'O&M',
    value: 1_800_000, currency: 'USD', signed: '2025-08-15', expiry: '2028-08-14',
    status: 'active', autoRenew: false, owner: 'Eng. Ahmad Rahimi',
    keyTerms: ['5G NR rollout 12 sites Kabul', 'Monthly performance review', '99.5% uptime SLA'],
    penaltyClause: '1.5% service credit per SLA breach incident',
  },
  {
    id: 'CTR-003', title: 'Huawei Core Network Managed Services',
    counterparty: 'Huawei Technologies Co., Ltd.', type: 'Vendor SLA',
    value: 3_100_000, currency: 'USD', signed: '2023-01-01', expiry: '2026-12-30',
    status: 'expiring', autoRenew: true, owner: 'Eng. Sayed Ghulam',
    keyTerms: ['EPC/IMS core support', '4-hour hardware replacement SLA', 'Security patch management'],
    penaltyClause: '3% penalty for P1 outages exceeding 2 hours',
  },
  {
    id: 'CTR-004', title: 'AsiaInfo Wireless Communication Company Interconnect',
    counterparty: 'AWCC (AsiaInfo Wireless)', type: 'Interconnect',
    value: null, currency: 'USD', signed: '2021-09-01', expiry: '2026-08-28',
    status: 'expired', autoRenew: false, owner: 'Bahar Noori (Regulatory)',
    keyTerms: ['Mobile termination rates per ATRA determination', 'CLI-based routing', 'Dispute resolution via ATRA'],
    penaltyClause: undefined,
  },
  {
    id: 'CTR-005', title: 'Roshan Telecom Bilateral Interconnect Agreement',
    counterparty: 'Telecom Development Company DMS (Roshan)', type: 'Interconnect',
    value: null, currency: 'USD', signed: '2023-12-15', expiry: '2028-12-14',
    status: 'active', autoRenew: true, owner: 'Bahar Noori (Regulatory)',
    keyTerms: ['On-net/off-net MTR per ATRA', 'International transit traffic', 'Emergency interop protocol'],
    penaltyClause: undefined,
  },
  {
    id: 'CTR-006', title: 'MTN DMS Roaming Agreement',
    counterparty: 'MTN DMS', type: 'Interconnect',
    value: null, currency: 'USD', signed: '2024-07-10', expiry: '2027-07-09',
    status: 'active', autoRenew: false, owner: 'Bahar Noori (Regulatory)',
    keyTerms: ['Inbound/outbound roaming', 'TAP3 billing exchange', 'Fraud management clause'],
    penaltyClause: undefined,
  },
  {
    id: 'CTR-007', title: 'Kabul Head Office Building Lease',
    counterparty: 'Karimi Properties LLC', type: 'Lease',
    value: 180_000, currency: 'USD', signed: '2022-10-01', expiry: '2027-09-30',
    status: 'active', autoRenew: true, owner: 'HR & Admin Dept',
    keyTerms: ['Annual CPI rent escalation 5%', 'Exclusive fiber conduit rights', 'Sub-let restriction'],
    penaltyClause: undefined,
  },
  {
    id: 'CTR-008', title: 'Kandahar Regional Office Lease',
    counterparty: 'Barakzai Commercial Properties', type: 'Lease',
    value: 48_000, currency: 'USD', signed: '2022-04-01', expiry: '2027-03-30',
    status: 'active', autoRenew: false, owner: 'HR & Admin Dept',
    keyTerms: ['Annual renewal option', 'Landlord maintenance obligations', 'Generator fuel cost split'],
    penaltyClause: undefined,
  },
  {
    id: 'CTR-009', title: 'Herat City Tower Site Lease',
    counterparty: 'Herat Municipality', type: 'Lease',
    value: 24_000, currency: 'USD', signed: '2021-03-20', expiry: '2031-03-19',
    status: 'active', autoRenew: true, owner: 'Network Infrastructure',
    keyTerms: ['10-year term with 5-year extension option', 'Tower access 24/7', 'Municipal permit conditions'],
    penaltyClause: undefined,
  },
  {
    id: 'CTR-010', title: 'Kabul Airport RoW Agreement',
    counterparty: 'Kabul Airport Authority (ACAA)', type: 'RoW',
    value: 15_000, currency: 'USD', signed: '2024-08-14', expiry: '2026-12-15',
    status: 'expiring', autoRenew: false, owner: 'Network Infrastructure',
    keyTerms: ['3.2 km aerial cable corridor', 'Annual inspection compliance', 'Aviation height restrictions'],
    penaltyClause: 'Permit revocation with 30-day cure period for non-compliance',
  },
  {
    id: 'CTR-011', title: 'ZTE Equipment Supply & Support NDA',
    counterparty: 'ZTE Corporation', type: 'NDA',
    value: null, currency: 'USD', signed: '2025-11-01', expiry: '2028-10-30',
    status: 'active', autoRenew: false, owner: 'Legal Department',
    keyTerms: ['Technical roadmap confidentiality', 'Joint bid restrictions', '2-year post-term obligation'],
    penaltyClause: undefined,
  },
  {
    id: 'CTR-012', title: 'Wazir Akbar Khan Rooftop Site Lease',
    counterparty: 'Hamid Sultani (Private)', type: 'Lease',
    value: 12_000, currency: 'USD', signed: '2021-12-10', expiry: '2026-12-09',
    status: 'expiring', autoRenew: false, owner: 'Network Infrastructure',
    keyTerms: ['Rooftop BTS access', 'Power supply at owner cost', 'No structural modifications'],
    penaltyClause: undefined,
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function fmtValue(v: number | null, currency: string) {
  if (v === null) return '—';
  return `${currency} ${v.toLocaleString()}`;
}

function daysUntil(d: string) {
  return Math.ceil((new Date(d).getTime() - Date.now()) / 86400000);
}

const STATUS_CONFIG: Record<ContractStatus, { label: string; cls: string; Icon: React.ElementType }> = {
  active:   { label: 'Active',    cls: 'bg-green-50 text-green-700 border-green-200',  Icon: CheckCircle2 },
  expiring: { label: 'Expiring',  cls: 'bg-amber-50 text-amber-700 border-amber-200',  Icon: Clock },
  expired:  { label: 'Expired',   cls: 'bg-red-50 text-red-700 border-red-200',        Icon: XCircle },
  pending:  { label: 'Pending',   cls: 'bg-gray-50 text-gray-600 border-gray-200',     Icon: Clock },
};

const TYPE_CONFIG: Record<ContractType, { color: string; short: string }> = {
  'Vendor SLA':   { color: 'text-violet-700 bg-violet-50', short: 'SLA' },
  'Interconnect': { color: 'text-sky-700 bg-sky-50',       short: 'ICT' },
  'Lease':        { color: 'text-teal-700 bg-teal-50',     short: 'LSE' },
  'RoW':          { color: 'text-orange-700 bg-orange-50', short: 'ROW' },
  'NDA':          { color: 'text-gray-600 bg-gray-100',    short: 'NDA' },
  'O&M':          { color: 'text-indigo-700 bg-indigo-50', short: 'O&M' },
};


// ── Main Component ────────────────────────────────────────────────────────────

export function ContractManager() {
  const [selected, setSelected] = useState<Contract | null>(null);
  const [section, setSection] = useState<'contracts' | 'templates'>('templates');

  const stats = useMemo(() => {
    const totalValue = CONTRACTS.filter(c => c.value !== null).reduce((s, c) => s + (c.value ?? 0), 0);
    return {
      total: CONTRACTS.length,
      active: CONTRACTS.filter(c => c.status === 'active').length,
      expiring: CONTRACTS.filter(c => c.status === 'expiring').length,
      expired: CONTRACTS.filter(c => c.status === 'expired').length,
      totalValue,
    };
  }, []);

  return (
    <div className="space-y-5">
      <div className="flex gap-2 border-b border-slate-200 pb-3">
        <button type="button" onClick={() => setSection('templates')} className={cn('rounded-lg px-4 py-2 text-sm font-semibold', section === 'templates' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100')}>Contract templates</button>
        <button type="button" onClick={() => setSection('contracts')} className={cn('rounded-lg px-4 py-2 text-sm font-semibold', section === 'contracts' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100')}>Contract register</button>
      </div>
      {section === 'templates' ? <ContractTemplateLibrary /> : <>
      {/* Header */}
      <div className="flex items-center justify-between pb-1">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Contract Manager</h2>
          <p className="text-sm text-gray-500 mt-0.5">AsiaInfo DMS · Vendor, Interconnect & Lease Agreement Tracker</p>
        </div>
        <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors">
          <Download size={11} /> Export Contracts
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Total Contracts', value: stats.total,    color: 'border-l-blue-500',  icon: <Briefcase size={15} className="text-blue-400" /> },
          { label: 'Active',          value: stats.active,   color: 'border-l-green-500', icon: <CheckCircle2 size={15} className="text-green-500" /> },
          { label: 'Expiring ≤90d',   value: stats.expiring, color: 'border-l-amber-400', icon: <AlertTriangle size={15} className="text-amber-500" /> },
          { label: 'Expired',         value: stats.expired,  color: 'border-l-red-400',   icon: <XCircle size={15} className="text-red-400" /> },
        ].map(({ label, value, color, icon }) => (
          <div key={label} className={cn('bg-white border border-gray-200 border-l-4 rounded-lg p-4', color)}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-gray-500">{label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-0.5">{value}</p>
              </div>
              {icon}
            </div>
          </div>
        ))}
      </div>

        {/* Expiry timeline strip */}
        <div className="rounded-2xl border border-amber-100 bg-amber-50/50 px-4 py-3">
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-2">Expiry Timeline — Next 12 Months</p>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {CONTRACTS
              .filter(c => { const d = daysUntil(c.expiry); return d >= 0 && d <= 365; })
              .sort((a, b) => new Date(a.expiry).getTime() - new Date(b.expiry).getTime())
              .map(c => {
                const days = daysUntil(c.expiry);
                const urgency = days <= 30 ? 'bg-red-100 border-red-300 text-red-700' : days <= 90 ? 'bg-amber-100 border-amber-300 text-amber-700' : 'bg-gray-100 border-gray-200 text-gray-600';
                return (
                  <button
                    key={c.id}
                    onClick={() => setSelected(c)}
                    className={cn('shrink-0 px-2.5 py-1.5 rounded border text-left transition-colors hover:opacity-80', urgency)}
                  >
                    <p className="text-[10px] font-bold">{c.id}</p>
                    <p className="text-[10px] whitespace-nowrap">{fmtDate(c.expiry)}</p>
                    <p className="text-[9px] mt-0.5">{days}d remaining</p>
                  </button>
                );
              })}
          </div>
        </div>

      <RecordList rows={CONTRACTS}
        columns={['ID', 'Contract Title', 'Counterparty', 'Type', 'Value', 'Expiry', 'Days remaining', 'Auto-Renew', 'Status', '']}
        search={c => [c.id, c.title, c.counterparty]}
        filters={[{ label: 'Type', value: c => c.type }, { label: 'Status', value: c => c.status, display: value => STATUS_CONFIG[value]?.label ?? value }]}
        renderRow={c => {
                const sc = STATUS_CONFIG[c.status];
                const tc = TYPE_CONFIG[c.type];
                const StatusIcon = sc.Icon;
                return (
                  <tr key={c.id} className="hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => setSelected(c)}>
                    <td className="px-4 py-2.5 text-xs font-mono text-gray-500">{c.id}</td>
                    <td className="px-4 py-2.5 max-w-[200px]">
                      <p className="text-sm font-medium text-gray-800 truncate" title={c.title}>{c.title}</p>
                    </td>
                    <td className="px-4 py-2.5 max-w-[160px]">
                      <div className="flex items-center gap-1.5">
                        <Building2 size={11} className="text-gray-400 shrink-0" />
                        <span className="text-xs text-gray-600 truncate" title={c.counterparty}>{c.counterparty}</span>
                      </div>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className={cn('text-[10px] font-bold uppercase px-1.5 py-0.5 rounded', tc.color)}>{tc.short}</span>
                    </td>
                    <td className="px-4 py-2.5 text-xs text-gray-600 whitespace-nowrap">{fmtValue(c.value, c.currency)}</td>
                    <td className="px-4 py-2.5">
                      <p className={cn('text-xs font-medium', c.status === 'expired' ? 'text-red-600' : c.status === 'expiring' ? 'text-amber-600' : 'text-gray-700')}>
                        {fmtDate(c.expiry)}
                      </p>
                    </td>
                    <td>{c.status === 'expired' ? '—' : daysUntil(c.expiry)}</td>
                    <td className="px-4 py-2.5">
                      <span className={cn('text-[10px] font-medium', c.autoRenew ? 'text-green-600' : 'text-gray-400')}>
                        {c.autoRenew ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className={cn('inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2 py-0.5 rounded border', sc.cls)}>
                        <StatusIcon size={9} /> {sc.label}
                      </span>
                    </td>
                    <td className="px-4 py-2.5">
                      <ChevronRight size={14} className="text-gray-300" />
                    </td>
                  </tr>
                );
              }}
      />

      {/* Contract Detail Drawer */}
      {selected && <ContractDetailDrawer contract={selected} onClose={() => setSelected(null)} />}
      </>}
    </div>
  );
}

function ContractTemplateLibrary() {
  const { templates } = useTemplates();
  const [category, setCategory] = useState('All templates');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [preview, setPreview] = useState<CAFTemplate | null>(null);
  const categories = ['All templates', 'Subscriber agreements', 'Corporate agreements', 'Other agreements'];
  const agreements = templates.filter(template => /agreement|contract|协议|合同/i.test(`${template.name} ${template.description}`));
  const visible = agreements.filter(template => {
    const matchesCategory = category === 'All templates' || (category === 'Subscriber agreements' && template.customerType === 'Individual') || (category === 'Corporate agreements' && template.customerType === 'Corporate') || (category === 'Other agreements' && !['Individual', 'Corporate'].includes(template.customerType));
    return matchesCategory && `${template.name} ${template.id} ${template.product}`.toLowerCase().includes(query.toLowerCase());
  });
  const pageSize = 8;
  const pageCount = Math.max(1, Math.ceil(visible.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  return <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:flex lg:min-h-[650px]">
    <aside className="border-b border-slate-200 bg-slate-50/70 p-4 lg:w-64 lg:shrink-0 lg:border-b-0 lg:border-r">
      <h2 className="mb-4 px-2 text-xs font-bold uppercase tracking-wider text-slate-500">Template directory</h2>
      <nav aria-label="Contract template categories" className="grid grid-cols-2 gap-1 lg:grid-cols-1">
        {categories.map(item => <button key={item} type="button" onClick={() => { setCategory(item); setPage(1); }} className={cn('flex items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm', category === item ? 'bg-indigo-50 font-semibold text-indigo-700 ring-1 ring-indigo-200' : 'text-slate-600 hover:bg-white')}>
          <span>{item}</span><span className="text-xs text-slate-400">{item === 'All templates' ? agreements.length : agreements.filter(template => item === 'Subscriber agreements' ? template.customerType === 'Individual' : item === 'Corporate agreements' ? template.customerType === 'Corporate' : !['Individual', 'Corporate'].includes(template.customerType)).length}</span>
        </button>)}
      </nav>
    </aside>
    <div className="min-w-0 flex-1 p-5 lg:p-7">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div><h2 className="text-xl font-bold text-slate-900">{category}</h2><p className="mt-1 text-sm text-slate-500">Select a template to preview the complete agreement.</p></div>
        <label className="relative block w-full sm:w-72"><Search size={17} className="pointer-events-none absolute left-3 top-3 text-slate-400" /><input aria-label="Search contract templates" value={query} onChange={event => { setQuery(event.target.value); setPage(1); }} placeholder="Search templates" className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm outline-none focus:border-indigo-400" /></label>
      </div>
      {visible.length ? <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
        {visible.slice((currentPage - 1) * pageSize, currentPage * pageSize).map(template => <button key={template.id} type="button" onClick={() => setPreview(template)} className="group min-w-0 text-left">
          <div className="flex aspect-[.74] flex-col overflow-hidden rounded-xl border border-slate-200 bg-slate-100 p-3 transition-colors group-hover:border-indigo-400 group-hover:shadow-md">
            <div className="flex h-full flex-col rounded-sm bg-white p-4 shadow-sm"><div className="mb-3 h-1 w-10 rounded-full bg-indigo-500" /><p className="line-clamp-2 text-[11px] font-bold leading-snug text-slate-800">{template.name}</p><div className="mt-3 space-y-1.5">{Array.from({ length: 6 }, (_, index) => <div key={index} className={cn('h-1 rounded bg-slate-100', index % 3 === 0 ? 'w-2/3' : index % 3 === 1 ? 'w-full' : 'w-5/6')} />)}</div><div className="mt-auto border-t border-slate-100 pt-2 text-[9px] text-slate-400">{template.id}</div></div>
          </div><p className="mt-2 truncate text-sm font-semibold text-slate-700" title={template.name}>{template.name}</p><p className="mt-0.5 text-xs text-slate-400">{template.customerType} · v{template.version || '1.0'}</p>
        </button>)}
      </div> : <div className="rounded-xl border border-dashed border-slate-200 py-16 text-center text-sm text-slate-500">No contract templates found.</div>}
      <div className="mt-8 flex items-center justify-between border-t border-slate-100 pt-4 text-sm text-slate-500"><span>{visible.length} templates</span><div className="flex items-center gap-3"><button type="button" disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)} className="rounded-lg border border-slate-200 px-3 py-1.5 disabled:opacity-40">Previous</button><span>{currentPage} / {pageCount}</span><button type="button" disabled={currentPage === pageCount} onClick={() => setPage(currentPage + 1)} className="rounded-lg border border-slate-200 px-3 py-1.5 disabled:opacity-40">Next</button></div></div>
    </div>
    {preview && <PreviewDrawer label={preview.name} onClose={() => setPreview(null)}><div className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4"><div><h3 className="font-semibold text-slate-900">{preview.name}</h3><p className="text-xs text-slate-500">{preview.id} · v{preview.version || '1.0'}</p></div><button type="button" aria-label="Close preview" onClick={() => setPreview(null)} className="rounded-lg p-2 hover:bg-slate-100"><X size={20} /></button></div><div className="overflow-auto bg-slate-100 p-4" dangerouslySetInnerHTML={{ __html: renderBlueprint(preview, getTemplatePreviewValues(preview), 'A4 · Portrait') }} /></PreviewDrawer>}
  </div>;
}

// ── Contract Detail Drawer ────────────────────────────────────────────────────

function ContractDetailDrawer({ contract: c, onClose }: { contract: Contract; onClose: () => void }) {
  const sc = STATUS_CONFIG[c.status];
  const tc = TYPE_CONFIG[c.type];
  const StatusIcon = sc.Icon;
  const days = daysUntil(c.expiry);

  return (
    <PreviewDrawer label={c.title} onClose={onClose}>
        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between shrink-0">
          <div>
            <span className={cn('text-[9px] font-bold uppercase px-1.5 py-0.5 rounded mr-2', tc.color)}>{c.type}</span>
            <span className="text-xs font-mono text-gray-400">{c.id}</span>
            <h3 className="text-sm font-bold text-gray-800 mt-1 pr-4 leading-snug">{c.title}</h3>
          </div>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded transition-colors shrink-0">
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Status banner */}
          <div className={cn('p-3 rounded-lg border flex items-center gap-3', sc.cls)}>
            <StatusIcon size={16} />
            <div>
              <p className="text-xs font-bold">{sc.label}</p>
              <p className="text-[11px] mt-0.5">
                {c.status === 'expired' ? `Expired ${fmtDate(c.expiry)}` :
                 c.status === 'expiring' ? `Expires in ${days} days — ${fmtDate(c.expiry)}` :
                 `Expires ${fmtDate(c.expiry)} (${days} days)`}
              </p>
            </div>
          </div>

          {/* Details grid */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Counterparty', value: c.counterparty },
              { label: 'Contract Value', value: fmtValue(c.value, c.currency) },
              { label: 'Signed Date', value: fmtDate(c.signed) },
              { label: 'Expiry Date', value: fmtDate(c.expiry) },
              { label: 'Auto-Renew', value: c.autoRenew ? 'Yes' : 'No' },
              { label: 'Contract Owner', value: c.owner },
            ].map(({ label, value }) => (
              <div key={label} className="space-y-0.5">
                <p className="text-[10px] font-bold text-gray-400 uppercase">{label}</p>
                <p className="text-xs font-medium text-gray-800">{value}</p>
              </div>
            ))}
          </div>

          {/* Key Terms */}
          <div>
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-2.5">Key Terms</p>
            <ul className="space-y-1.5">
              {c.keyTerms.map((term, idx) => (
                <li key={idx} className="flex items-start gap-2 text-xs text-gray-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0" />
                  {term}
                </li>
              ))}
            </ul>
          </div>

          {/* Penalty clause */}
          {c.penaltyClause && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-[10px] font-bold text-red-600 uppercase mb-1">Penalty Clause</p>
              <p className="text-xs text-red-800">{c.penaltyClause}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-gray-100 bg-gray-50 flex items-center justify-between shrink-0">
          <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-blue-600 border border-blue-200 rounded hover:bg-blue-50 transition-colors">
            <Download size={11} /> Download PDF
          </button>
          <button onClick={onClose} className="px-3 py-1.5 text-xs border border-gray-200 rounded text-gray-600 hover:bg-gray-100 transition-colors">Close</button>
        </div>
    </PreviewDrawer>
  );
}
