import React, { useState } from 'react';
import {
  ShieldAlert, Radio, FileCheck, MapPin, Clock,
  CheckCircle2, XCircle, AlertTriangle, Download,
  Calendar, ChevronRight, RefreshCw
} from 'lucide-react';
import { cn } from '../lib/utils';

// ── Mock data ────────────────────────────────────────────────────────────────

const SPECTRUM_LICENSES = [
  { id: 'SL-900', band: '900 MHz', tech: 'GSM / 2G', bw: '2×10 MHz', licenseNo: 'ATRA/SL/900/2022/001', issued: '2022-01-15', expiry: '2027-01-14', status: 'active', region: 'National' },
  { id: 'SL-1800', band: '1800 MHz', tech: 'GSM / LTE', bw: '2×15 MHz', licenseNo: 'ATRA/SL/1800/2022/002', issued: '2022-01-15', expiry: '2027-01-14', status: 'active', region: 'National' },
  { id: 'SL-2100', band: '2100 MHz', tech: 'WCDMA / 3G', bw: '2×20 MHz', licenseNo: 'ATRA/SL/2100/2023/003', issued: '2023-06-01', expiry: '2026-05-31', status: 'expiring', region: 'National' },
  { id: 'SL-3500', band: '3500 MHz', tech: '5G NR (Trial)', bw: '100 MHz', licenseNo: 'ATRA/SL/3500/2025/004', issued: '2025-03-01', expiry: '2026-02-28', status: 'expired', region: 'Kabul, Herat' },
  { id: 'SL-450', band: '450 MHz', tech: 'Fixed Wireless', bw: '2×5 MHz', licenseNo: 'ATRA/SL/450/2021/005', issued: '2021-09-01', expiry: '2026-08-31', status: 'active', region: 'Rural Zones' },
];

const ATRA_FILINGS = [
  { id: 'AF-001', type: 'Quarterly Spectrum Usage Report', period: 'Q1 2026', due: '2026-04-30', submitted: '2026-04-22', status: 'submitted', ref: 'ATRA/QSR/Q1/2026/ATM' },
  { id: 'AF-002', type: 'Annual EMF Compliance Report', period: 'FY 2025', due: '2026-03-31', submitted: '2026-03-28', status: 'submitted', ref: 'ATRA/EMF/2025/ATM' },
  { id: 'AF-003', type: 'Subscriber Data Report (Biannual)', period: 'H1 2026', due: '2026-07-31', submitted: null, status: 'pending', ref: null },
  { id: 'AF-004', type: 'QoS Performance Benchmarking', period: 'Q2 2026', due: '2026-07-15', submitted: null, status: 'pending', ref: null },
  { id: 'AF-005', type: 'Network Rollout Progress Report', period: 'H1 2026', due: '2026-06-30', submitted: null, status: 'due_soon', ref: null },
  { id: 'AF-006', type: 'Spectrum License Renewal Application', period: '2100 MHz Band', due: '2026-02-28', submitted: null, status: 'overdue', ref: null },
  { id: 'AF-007', type: 'Interconnection Agreement Filing', period: 'Q2 2026', due: '2026-08-01', submitted: null, status: 'pending', ref: null },
  { id: 'AF-008', type: 'Universal Service Fund Contribution Report', period: 'FY 2025', due: '2026-03-31', submitted: '2026-03-29', status: 'submitted', ref: 'ATRA/USF/2025/ATM' },
];

const ROW_PERMITS = [
  { id: 'ROW-KBL-001', province: 'Kabul', authority: 'Kabul City Municipality', permitNo: 'KBL/ROW/2023/047', type: 'Underground OFC', km: 42.5, issued: '2023-05-10', expiry: '2028-05-09', status: 'active' },
  { id: 'ROW-KBL-002', province: 'Kabul', authority: 'Kabul Airport Authority', permitNo: 'KBL-AA/ROW/2024/011', type: 'Aerial Cable', km: 3.2, issued: '2024-02-14', expiry: '2026-06-15', status: 'expiring' },
  { id: 'ROW-KDR-001', province: 'Kandahar', authority: 'Kandahar City Council', permitNo: 'KDR/ROW/2022/033', type: 'Underground OFC', km: 28.0, issued: '2022-11-01', expiry: '2025-10-31', status: 'expired' },
  { id: 'ROW-HRT-001', province: 'Herat', authority: 'Herat Municipality', permitNo: 'HRT/ROW/2024/019', type: 'Underground OFC', km: 35.8, issued: '2024-06-20', expiry: '2029-06-19', status: 'active' },
  { id: 'ROW-MZR-001', province: 'Mazar-i-Sharif', authority: 'Balkh Province Authority', permitNo: 'MZR/ROW/2023/025', type: 'Microwave Corridor', km: 120.0, issued: '2023-09-15', expiry: '2026-09-14', status: 'active' },
  { id: 'ROW-JLB-001', province: 'Jalalabad', authority: 'Nangarhar Province DPW', permitNo: 'JLB/ROW/2024/007', type: 'Underground OFC', km: 18.5, issued: '2024-01-08', expiry: '2027-01-07', status: 'active' },
  { id: 'ROW-KND-001', province: 'Kunduz', authority: 'Kunduz Municipality', permitNo: 'KND/ROW/2025/003', type: 'Underground OFC', km: 12.0, issued: '2025-04-01', expiry: '2030-03-31', status: 'active' },
];

const EMF_CERTS = [
  { id: 'EMF-KBL-01', siteId: 'ATM-KBL-001', site: 'Kabul Central Tower', province: 'Kabul', certNo: 'ATRA/EMF/KBL/2025/001', issued: '2025-01-10', expiry: '2026-01-09', status: 'expired', eirp: 43.2 },
  { id: 'EMF-KBL-02', siteId: 'ATM-KBL-002', site: 'Wazir Akbar Khan BTS', province: 'Kabul', certNo: 'ATRA/EMF/KBL/2025/002', issued: '2025-03-01', expiry: '2026-02-28', status: 'expired', eirp: 41.8 },
  { id: 'EMF-KBL-03', siteId: 'ATM-KBL-003', site: 'Karte Char Node', province: 'Kabul', certNo: 'ATRA/EMF/KBL/2026/003', issued: '2026-01-15', expiry: '2027-01-14', status: 'active', eirp: 40.5 },
  { id: 'EMF-KDR-01', siteId: 'ATM-KDR-001', site: 'Kandahar Main Tower', province: 'Kandahar', certNo: 'ATRA/EMF/KDR/2025/004', issued: '2025-08-20', expiry: '2026-08-19', status: 'active', eirp: 44.1 },
  { id: 'EMF-HRT-01', siteId: 'ATM-HRT-001', site: 'Herat City BTS', province: 'Herat', certNo: 'ATRA/EMF/HRT/2026/005', issued: '2026-02-01', expiry: '2027-01-31', status: 'active', eirp: 42.3 },
  { id: 'EMF-MZR-01', siteId: 'ATM-MZR-001', site: 'Mazar-i-Sharif Central', province: 'Mazar-i-Sharif', certNo: 'ATRA/EMF/MZR/2025/006', issued: '2025-11-01', expiry: '2026-05-25', status: 'expiring', eirp: 43.8 },
  { id: 'EMF-JLB-01', siteId: 'ATM-JLB-001', site: 'Jalalabad City Tower', province: 'Jalalabad', certNo: 'ATRA/EMF/JLB/2026/007', issued: '2026-03-10', expiry: '2027-03-09', status: 'active', eirp: 42.0 },
  { id: 'EMF-KND-01', siteId: 'ATM-KND-001', site: 'Kunduz North BTS', province: 'Kunduz', certNo: 'ATRA/EMF/KND/2026/008', issued: '2026-02-20', expiry: '2027-02-19', status: 'active', eirp: 41.5 },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function daysUntil(dateStr: string): number {
  return Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86400000);
}

function fmtDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function ExpiryBadge({ status, expiry }: { status: string; expiry: string }) {
  const days = daysUntil(expiry);
  if (status === 'expired') return (
    <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-red-50 text-red-700 border border-red-200">
      <XCircle size={10} /> Expired
    </span>
  );
  if (status === 'expiring' || days <= 90) return (
    <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
      <AlertTriangle size={10} /> Expiring {days}d
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-green-50 text-green-700 border border-green-200">
      <CheckCircle2 size={10} /> Active
    </span>
  );
}

function FilingStatusBadge({ status }: { status: string }) {
  const MAP: Record<string, { label: string; cls: string }> = {
    submitted:  { label: 'Submitted',  cls: 'bg-green-50 text-green-700 border-green-200' },
    pending:    { label: 'Pending',    cls: 'bg-gray-50 text-gray-600 border-gray-200' },
    due_soon:   { label: 'Due Soon',   cls: 'bg-amber-50 text-amber-700 border-amber-200' },
    overdue:    { label: 'Overdue',    cls: 'bg-red-50 text-red-700 border-red-200' },
  };
  const s = MAP[status] || MAP.pending;
  return <span className={cn('text-[10px] font-bold uppercase px-2 py-0.5 rounded border', s.cls)}>{s.label}</span>;
}

// ── Tabs ──────────────────────────────────────────────────────────────────────

const TABS = [
  { id: 'overview',  label: 'Overview' },
  { id: 'spectrum',  label: 'Spectrum Licenses' },
  { id: 'filings',   label: 'ATRA Filings' },
  { id: 'row',       label: 'RoW Permits' },
  { id: 'emf',       label: 'EMF Certificates' },
];

// ── Main Component ────────────────────────────────────────────────────────────

export function ComplianceRegistry() {
  const [activeTab, setActiveTab] = useState('overview');

  const allDocs = [
    ...SPECTRUM_LICENSES.map(l => ({ status: l.status, expiry: l.expiry })),
    ...ROW_PERMITS.map(p => ({ status: p.status, expiry: p.expiry })),
    ...EMF_CERTS.map(c => ({ status: c.status, expiry: c.expiry })),
  ];
  const overdue = ATRA_FILINGS.filter(f => f.status === 'overdue').length + allDocs.filter(d => d.status === 'expired').length;
  const expiring = allDocs.filter(d => d.status === 'expiring').length + ATRA_FILINGS.filter(f => f.status === 'due_soon').length;
  const compliant = allDocs.filter(d => d.status === 'active').length + ATRA_FILINGS.filter(f => f.status === 'submitted').length;
  const total = allDocs.length + ATRA_FILINGS.length;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between pb-1">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Compliance Registry</h2>
          <p className="text-sm text-gray-500 mt-0.5">ATOMA Afghanistan · ATRA Regulatory & License Compliance</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-600 border border-gray-200 rounded hover:bg-gray-50 transition-colors">
            <RefreshCw size={11} /> Sync ATRA Portal
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors">
            <Download size={11} /> Export Report
          </button>
        </div>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Total Tracked', value: total, Icon: ShieldAlert, accent: 'border-l-blue-500', color: 'text-blue-500' },
          { label: 'Compliant / Active', value: compliant, Icon: CheckCircle2, accent: 'border-l-green-500', color: 'text-green-500' },
          { label: 'Expiring (≤90 days)', value: expiring, Icon: Clock, accent: 'border-l-amber-400', color: 'text-amber-500' },
          { label: 'Expired / Overdue', value: overdue, Icon: XCircle, accent: 'border-l-red-500', color: 'text-red-500' },
        ].map(({ label, value, Icon, accent, color }) => (
          <div key={label} className={cn('bg-white border border-gray-200 border-l-4 rounded-lg p-4', accent)}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-gray-500">{label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-0.5">{value}</p>
              </div>
              <Icon size={15} className={color} />
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="flex border-b border-gray-200 overflow-x-auto">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'px-4 py-2.5 text-xs font-medium whitespace-nowrap transition-colors',
                activeTab === tab.id
                  ? 'text-blue-700 border-b-2 border-blue-600 bg-blue-50/50'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-5">
          {activeTab === 'overview' && <OverviewTab />}
          {activeTab === 'spectrum' && <SpectrumTab />}
          {activeTab === 'filings' && <FilingsTab />}
          {activeTab === 'row' && <RowTab />}
          {activeTab === 'emf' && <EmfTab />}
        </div>
      </div>
    </div>
  );
}

// ── Overview Tab ──────────────────────────────────────────────────────────────

function OverviewTab() {
  const urgent = [
    ...SPECTRUM_LICENSES.filter(l => l.status !== 'active').map(l => ({ label: l.band + ' Spectrum License', ref: l.licenseNo, expiry: l.expiry, status: l.status, cat: 'spectrum' })),
    ...ATRA_FILINGS.filter(f => ['overdue','due_soon'].includes(f.status)).map(f => ({ label: f.type, ref: f.id, expiry: f.due, status: f.status, cat: 'filing' })),
    ...ROW_PERMITS.filter(p => p.status !== 'active').map(p => ({ label: p.province + ' RoW Permit', ref: p.permitNo, expiry: p.expiry, status: p.status, cat: 'row' })),
    ...EMF_CERTS.filter(c => c.status !== 'active').map(c => ({ label: c.site + ' EMF Cert', ref: c.certNo, expiry: c.expiry, status: c.status, cat: 'emf' })),
  ].sort((a, b) => new Date(a.expiry).getTime() - new Date(b.expiry).getTime()).slice(0, 8);

  const CAT_COLOR: Record<string, string> = {
    spectrum: 'text-violet-600 bg-violet-50',
    filing: 'text-amber-700 bg-amber-50',
    row: 'text-sky-600 bg-sky-50',
    emf: 'text-teal-600 bg-teal-50',
  };
  const CAT_LABEL: Record<string, string> = {
    spectrum: 'Spectrum', filing: 'ATRA Filing', row: 'RoW', emf: 'EMF',
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Compliance health */}
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Compliance Health by Category</p>
          {[
            { label: 'Spectrum Licenses', data: SPECTRUM_LICENSES, field: 'status' as const },
            { label: 'ATRA Filings', data: ATRA_FILINGS.map(f => ({ status: f.status === 'submitted' ? 'active' : f.status === 'overdue' ? 'expired' : 'pending' })), field: 'status' as const },
            { label: 'RoW Permits', data: ROW_PERMITS, field: 'status' as const },
            { label: 'EMF Certificates', data: EMF_CERTS, field: 'status' as const },
          ].map(({ label, data }) => {
            const active = data.filter((d: any) => d.status === 'active').length;
            const pct = Math.round(active / data.length * 100);
            return (
              <div key={label} className="mb-2.5">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-600">{label}</span>
                  <span className="font-medium text-gray-800">{active}/{data.length} <span className="text-gray-400">({pct}%)</span></span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className={cn('h-full rounded-full', pct === 100 ? 'bg-green-500' : pct >= 60 ? 'bg-amber-400' : 'bg-red-400')} style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Action required */}
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Action Required</p>
          <div className="space-y-2">
            {urgent.map((item, idx) => (
              <div key={idx} className="flex items-center gap-3 p-2.5 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                <span className={cn('text-[9px] font-bold uppercase px-1.5 py-0.5 rounded shrink-0', CAT_COLOR[item.cat])}>{CAT_LABEL[item.cat]}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-800 truncate">{item.label}</p>
                  <p className="text-[10px] text-gray-400">{item.ref}</p>
                </div>
                <div className="text-right shrink-0">
                  {item.status === 'expired' || item.status === 'overdue'
                    ? <span className="text-[10px] font-bold text-red-600">Overdue</span>
                    : <span className="text-[10px] font-bold text-amber-600">Due {fmtDate(item.expiry)}</span>
                  }
                </div>
                <ChevronRight size={12} className="text-gray-300 shrink-0" />
              </div>
            ))}
            {urgent.length === 0 && (
              <div className="text-center py-6 text-xs text-gray-400">All items compliant</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Spectrum Tab ──────────────────────────────────────────────────────────────

function SpectrumTab() {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Spectrum License Portfolio — ATRA Afghanistan</p>
        <span className="text-xs text-gray-400">{SPECTRUM_LICENSES.length} licenses</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              {['Band', 'Technology', 'Bandwidth', 'License No.', 'Coverage', 'Issued', 'Expiry', 'Status'].map(h => (
                <th key={h} className="text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wide pb-2 pr-4">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {SPECTRUM_LICENSES.map(l => (
              <tr key={l.id} className="hover:bg-gray-50 transition-colors">
                <td className="py-2.5 pr-4">
                  <div className="flex items-center gap-2">
                    <Radio size={13} className="text-violet-500 shrink-0" />
                    <span className="text-sm font-semibold text-gray-800">{l.band}</span>
                  </div>
                </td>
                <td className="py-2.5 pr-4 text-xs text-gray-600">{l.tech}</td>
                <td className="py-2.5 pr-4 text-xs font-mono text-gray-600">{l.bw}</td>
                <td className="py-2.5 pr-4 text-xs font-mono text-gray-500">{l.licenseNo}</td>
                <td className="py-2.5 pr-4 text-xs text-gray-600">{l.region}</td>
                <td className="py-2.5 pr-4 text-xs text-gray-500">{fmtDate(l.issued)}</td>
                <td className="py-2.5 pr-4 text-xs text-gray-800 font-medium">{fmtDate(l.expiry)}</td>
                <td className="py-2.5"><ExpiryBadge status={l.status} expiry={l.expiry} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Filings Tab ───────────────────────────────────────────────────────────────

function FilingsTab() {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Regulatory Submissions — Afghanistan Telecom Regulatory Authority</p>
        <span className="text-xs text-gray-400">{ATRA_FILINGS.length} filings</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              {['Filing Type', 'Period', 'Due Date', 'Submitted', 'Reference', 'Status'].map(h => (
                <th key={h} className="text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wide pb-2 pr-4">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {ATRA_FILINGS.map(f => (
              <tr key={f.id} className="hover:bg-gray-50 transition-colors">
                <td className="py-2.5 pr-4">
                  <div className="flex items-center gap-2">
                    <FileCheck size={13} className="text-amber-600 shrink-0" />
                    <span className="text-sm font-medium text-gray-800">{f.type}</span>
                  </div>
                </td>
                <td className="py-2.5 pr-4 text-xs text-gray-600">{f.period}</td>
                <td className={cn('py-2.5 pr-4 text-xs font-medium', f.status === 'overdue' ? 'text-red-600' : f.status === 'due_soon' ? 'text-amber-600' : 'text-gray-700')}>
                  {fmtDate(f.due)}
                </td>
                <td className="py-2.5 pr-4 text-xs text-gray-500">{f.submitted ? fmtDate(f.submitted) : '—'}</td>
                <td className="py-2.5 pr-4 text-xs font-mono text-gray-400">{f.ref || '—'}</td>
                <td className="py-2.5"><FilingStatusBadge status={f.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── RoW Tab ───────────────────────────────────────────────────────────────────

function RowTab() {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Right of Way Permits — Provincial Authorities</p>
        <span className="text-xs text-gray-400">{ROW_PERMITS.length} permits · {ROW_PERMITS.reduce((s, p) => s + p.km, 0).toFixed(1)} km total</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              {['Province', 'Issuing Authority', 'Permit No.', 'Type', 'Route km', 'Issued', 'Expiry', 'Status'].map(h => (
                <th key={h} className="text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wide pb-2 pr-4">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {ROW_PERMITS.map(p => (
              <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                <td className="py-2.5 pr-4">
                  <div className="flex items-center gap-2">
                    <MapPin size={13} className="text-sky-500 shrink-0" />
                    <span className="text-sm font-medium text-gray-800">{p.province}</span>
                  </div>
                </td>
                <td className="py-2.5 pr-4 text-xs text-gray-600 max-w-[160px] truncate">{p.authority}</td>
                <td className="py-2.5 pr-4 text-xs font-mono text-gray-500">{p.permitNo}</td>
                <td className="py-2.5 pr-4 text-xs text-gray-600">{p.type}</td>
                <td className="py-2.5 pr-4 text-xs font-medium text-gray-700">{p.km.toFixed(1)}</td>
                <td className="py-2.5 pr-4 text-xs text-gray-500">{fmtDate(p.issued)}</td>
                <td className="py-2.5 pr-4 text-xs font-medium text-gray-800">{fmtDate(p.expiry)}</td>
                <td className="py-2.5"><ExpiryBadge status={p.status} expiry={p.expiry} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── EMF Tab ───────────────────────────────────────────────────────────────────

function EmfTab() {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">EMF Compliance Certificates — Tower Sites</p>
        <span className="text-xs text-gray-400">{EMF_CERTS.length} sites certified</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              {['Site ID', 'Site Name', 'Province', 'Cert No.', 'EIRP (dBW)', 'Issued', 'Expiry', 'Status'].map(h => (
                <th key={h} className="text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wide pb-2 pr-4">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {EMF_CERTS.map(c => (
              <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                <td className="py-2.5 pr-4 text-xs font-mono text-gray-500">{c.siteId}</td>
                <td className="py-2.5 pr-4 text-sm font-medium text-gray-800">{c.site}</td>
                <td className="py-2.5 pr-4 text-xs text-gray-600">{c.province}</td>
                <td className="py-2.5 pr-4 text-xs font-mono text-gray-400">{c.certNo}</td>
                <td className="py-2.5 pr-4 text-xs font-mono text-gray-700">{c.eirp.toFixed(1)}</td>
                <td className="py-2.5 pr-4 text-xs text-gray-500">{fmtDate(c.issued)}</td>
                <td className="py-2.5 pr-4 text-xs font-medium text-gray-800">{fmtDate(c.expiry)}</td>
                <td className="py-2.5"><ExpiryBadge status={c.status} expiry={c.expiry} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
