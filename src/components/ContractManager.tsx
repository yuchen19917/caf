import React, { useState, useMemo } from 'react';
import {
  Briefcase, CheckCircle2, AlertTriangle, XCircle, Clock,
  ChevronRight, Download, Search, X, Calendar, Building2,
  Handshake, FileText
} from 'lucide-react';
import { cn } from '../lib/utils';

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
    value: 2_400_000, currency: 'USD', signed: '2024-01-01', expiry: '2026-12-31',
    status: 'active', autoRenew: true, owner: 'Eng. Ahmad Rahimi',
    keyTerms: ['24/7 NOC support', 'Spare parts within 4 hrs Kabul / 24 hrs regions', 'Software upgrade entitlement'],
    penaltyClause: '2% monthly credit for SLA breach above 4-hour MTTR threshold',
  },
  {
    id: 'CTR-002', title: 'Ericsson 5G RAN Deployment & O&M',
    counterparty: 'Ericsson AB', type: 'O&M',
    value: 1_800_000, currency: 'USD', signed: '2025-02-15', expiry: '2028-02-14',
    status: 'active', autoRenew: false, owner: 'Eng. Ahmad Rahimi',
    keyTerms: ['5G NR rollout 12 sites Kabul', 'Monthly performance review', '99.5% uptime SLA'],
    penaltyClause: '1.5% service credit per SLA breach incident',
  },
  {
    id: 'CTR-003', title: 'Huawei Core Network Managed Services',
    counterparty: 'Huawei Technologies Co., Ltd.', type: 'Vendor SLA',
    value: 3_100_000, currency: 'USD', signed: '2022-07-01', expiry: '2026-06-30',
    status: 'expiring', autoRenew: true, owner: 'Eng. Sayed Ghulam',
    keyTerms: ['EPC/IMS core support', '4-hour hardware replacement SLA', 'Security patch management'],
    penaltyClause: '3% penalty for P1 outages exceeding 2 hours',
  },
  {
    id: 'CTR-004', title: 'Afghan Wireless Communication Company Interconnect',
    counterparty: 'AWCC (Afghan Wireless)', type: 'Interconnect',
    value: null, currency: 'USD', signed: '2021-03-01', expiry: '2026-02-28',
    status: 'expired', autoRenew: false, owner: 'Bahar Noori (Regulatory)',
    keyTerms: ['Mobile termination rates per ATRA determination', 'CLI-based routing', 'Dispute resolution via ATRA'],
    penaltyClause: undefined,
  },
  {
    id: 'CTR-005', title: 'Roshan Telecom Bilateral Interconnect Agreement',
    counterparty: 'Telecom Development Company Afghanistan (Roshan)', type: 'Interconnect',
    value: null, currency: 'USD', signed: '2023-06-15', expiry: '2028-06-14',
    status: 'active', autoRenew: true, owner: 'Bahar Noori (Regulatory)',
    keyTerms: ['On-net/off-net MTR per ATRA', 'International transit traffic', 'Emergency interop protocol'],
    penaltyClause: undefined,
  },
  {
    id: 'CTR-006', title: 'MTN Afghanistan Roaming Agreement',
    counterparty: 'MTN Afghanistan', type: 'Interconnect',
    value: null, currency: 'USD', signed: '2024-01-10', expiry: '2027-01-09',
    status: 'active', autoRenew: false, owner: 'Bahar Noori (Regulatory)',
    keyTerms: ['Inbound/outbound roaming', 'TAP3 billing exchange', 'Fraud management clause'],
    penaltyClause: undefined,
  },
  {
    id: 'CTR-007', title: 'Kabul Head Office Building Lease',
    counterparty: 'Karimi Properties LLC', type: 'Lease',
    value: 180_000, currency: 'USD', signed: '2022-04-01', expiry: '2027-03-31',
    status: 'active', autoRenew: true, owner: 'HR & Admin Dept',
    keyTerms: ['Annual CPI rent escalation 5%', 'Exclusive fiber conduit rights', 'Sub-let restriction'],
    penaltyClause: undefined,
  },
  {
    id: 'CTR-008', title: 'Kandahar Regional Office Lease',
    counterparty: 'Barakzai Commercial Properties', type: 'Lease',
    value: 48_000, currency: 'USD', signed: '2021-10-01', expiry: '2026-09-30',
    status: 'active', autoRenew: false, owner: 'HR & Admin Dept',
    keyTerms: ['Annual renewal option', 'Landlord maintenance obligations', 'Generator fuel cost split'],
    penaltyClause: undefined,
  },
  {
    id: 'CTR-009', title: 'Herat City Tower Site Lease',
    counterparty: 'Herat Municipality', type: 'Lease',
    value: 24_000, currency: 'USD', signed: '2020-09-20', expiry: '2030-09-19',
    status: 'active', autoRenew: true, owner: 'Network Infrastructure',
    keyTerms: ['10-year term with 5-year extension option', 'Tower access 24/7', 'Municipal permit conditions'],
    penaltyClause: undefined,
  },
  {
    id: 'CTR-010', title: 'Kabul Airport RoW Agreement',
    counterparty: 'Kabul Airport Authority (ACAA)', type: 'RoW',
    value: 15_000, currency: 'USD', signed: '2024-02-14', expiry: '2026-06-15',
    status: 'expiring', autoRenew: false, owner: 'Network Infrastructure',
    keyTerms: ['3.2 km aerial cable corridor', 'Annual inspection compliance', 'Aviation height restrictions'],
    penaltyClause: 'Permit revocation with 30-day cure period for non-compliance',
  },
  {
    id: 'CTR-011', title: 'ZTE Equipment Supply & Support NDA',
    counterparty: 'ZTE Corporation', type: 'NDA',
    value: null, currency: 'USD', signed: '2025-05-01', expiry: '2028-04-30',
    status: 'active', autoRenew: false, owner: 'Legal Department',
    keyTerms: ['Technical roadmap confidentiality', 'Joint bid restrictions', '2-year post-term obligation'],
    penaltyClause: undefined,
  },
  {
    id: 'CTR-012', title: 'Wazir Akbar Khan Rooftop Site Lease',
    counterparty: 'Hamid Sultani (Private)', type: 'Lease',
    value: 12_000, currency: 'USD', signed: '2021-06-10', expiry: '2026-06-09',
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

const CONTRACT_TYPES: ContractType[] = ['Vendor SLA', 'Interconnect', 'Lease', 'RoW', 'NDA', 'O&M'];

// ── Main Component ────────────────────────────────────────────────────────────

export function ContractManager() {
  const [typeFilter, setTypeFilter] = useState<'All' | ContractType>('All');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Contract | null>(null);

  const filtered = useMemo(() => CONTRACTS.filter(c => {
    if (typeFilter !== 'All' && c.type !== typeFilter) return false;
    if (search && !`${c.title} ${c.counterparty} ${c.id}`.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }), [typeFilter, search]);

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
      {/* Header */}
      <div className="flex items-center justify-between pb-1">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Contract Manager</h2>
          <p className="text-sm text-gray-500 mt-0.5">ATOMA Afghanistan · Vendor, Interconnect & Lease Agreement Tracker</p>
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

      {/* Filter + Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        {/* Filter bar */}
        <div className="flex flex-wrap items-center gap-3 px-4 py-3 border-b border-gray-100 bg-gray-50">
          <div className="relative flex-1 min-w-[180px]">
            <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search contract title or counterparty..."
              className="w-full pl-7 pr-3 py-1.5 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-400"
            />
          </div>
          <div className="flex gap-1 flex-wrap">
            {(['All', ...CONTRACT_TYPES] as const).map(t => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={cn(
                  'px-2.5 py-1 text-[11px] font-medium rounded transition-colors',
                  typeFilter === t ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                )}
              >
                {t}
              </button>
            ))}
          </div>
          <span className="text-xs text-gray-400 ml-auto shrink-0">{filtered.length} contracts</span>
        </div>

        {/* Expiry timeline strip */}
        <div className="px-4 py-3 border-b border-gray-100 bg-amber-50/50">
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

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                {['ID', 'Contract Title', 'Counterparty', 'Type', 'Value', 'Expiry', 'Auto-Renew', 'Status', ''].map(h => (
                  <th key={h} className="text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wide px-4 py-2.5">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(c => {
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
                      {c.status !== 'expired' && (
                        <p className="text-[10px] text-gray-400">{daysUntil(c.expiry)}d left</p>
                      )}
                    </td>
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
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Contract Detail Drawer */}
      {selected && <ContractDetailDrawer contract={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}

// ── Contract Detail Drawer ────────────────────────────────────────────────────

function ContractDetailDrawer({ contract: c, onClose }: { contract: Contract; onClose: () => void }) {
  const sc = STATUS_CONFIG[c.status];
  const tc = TYPE_CONFIG[c.type];
  const StatusIcon = sc.Icon;
  const days = daysUntil(c.expiry);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/30" onClick={onClose}>
      <div className="h-full w-full max-w-md bg-white shadow-xl flex flex-col" onClick={e => e.stopPropagation()}>
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
      </div>
    </div>
  );
}
