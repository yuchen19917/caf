import { PreviewDrawer } from './PreviewDrawer';
import { RecordList } from './RecordList';
import React, { useState, useMemo } from 'react';
import {
  MapPin, Building2, CheckCircle2, Clock, AlertTriangle,
  X, FileText, ChevronRight, Search, Filter
} from 'lucide-react';
import { cn } from '../lib/utils';

// ── Types & Mock Data ─────────────────────────────────────────────────────────

type LifecycleStage = 'Acquisition' | 'Construction' | 'Commissioning' | 'Operations' | 'Decommissioning';
type TowerType = 'GBT' | 'Rooftop' | 'Monopole' | 'Lattice' | 'COW';

interface SiteDoc {
  name: string;
  type: string;
  status: 'Present' | 'Missing' | 'Pending';
}

interface Site {
  id: string;
  name: string;
  province: string;
  city: string;
  towerType: TowerType;
  lifecycle: LifecycleStage;
  lat: string;
  lng: string;
  height: number;
  activatedDate: string | null;
  leasedFrom: string;
  leaseExpiry: string;
  docs: SiteDoc[];
  notes?: string;
}

const SITES: Site[] = [
  {
    id: 'ATM-KBL-001', name: 'Kabul Central Tower', province: 'Kabul', city: 'Kabul City', towerType: 'GBT', lifecycle: 'Operations',
    lat: '34.5260', lng: '69.1761', height: 45, activatedDate: '2020-09-15', leasedFrom: 'Ministry of Communications', leaseExpiry: '2030-09-14',
    docs: [
      { name: 'Site Lease Deed', type: 'Legal', status: 'Present' },
      { name: 'Municipal NOC', type: 'Regulatory', status: 'Present' },
      { name: 'Acceptance Test Report', type: 'Technical', status: 'Present' },
      { name: 'DG Service Record (2026)', type: 'Maintenance', status: 'Pending' },
      { name: 'EMF Certificate', type: 'Regulatory', status: 'Missing' },
      { name: 'Tower Inspection Certificate', type: 'Safety', status: 'Present' },
    ],
  },
  {
    id: 'ATM-KBL-002', name: 'Wazir Akbar Khan BTS', province: 'Kabul', city: 'Kabul City', towerType: 'Rooftop', lifecycle: 'Operations',
    lat: '34.5280', lng: '69.1950', height: 18, activatedDate: '2021-12-10', leasedFrom: 'Private Owner (Hamid Sultani)', leaseExpiry: '2026-12-09',
    docs: [
      { name: 'Site Lease Deed', type: 'Legal', status: 'Present' },
      { name: 'Building Owner Consent', type: 'Legal', status: 'Present' },
      { name: 'Municipal NOC', type: 'Regulatory', status: 'Missing' },
      { name: 'Acceptance Test Report', type: 'Technical', status: 'Present' },
      { name: 'EMF Certificate', type: 'Regulatory', status: 'Missing' },
    ],
    notes: 'Lease expiry December 2026 — renewal negotiation in progress.',
  },
  {
    id: 'ATM-KBL-003', name: 'Karte Char Node', province: 'Kabul', city: 'Kabul City', towerType: 'Monopole', lifecycle: 'Operations',
    lat: '34.5120', lng: '69.1614', height: 36, activatedDate: '2022-07-20', leasedFrom: 'Kabul Municipality', leaseExpiry: '2032-07-19',
    docs: [
      { name: 'Site Lease Deed', type: 'Legal', status: 'Present' },
      { name: 'Municipal NOC', type: 'Regulatory', status: 'Present' },
      { name: 'Acceptance Test Report', type: 'Technical', status: 'Present' },
      { name: 'EMF Certificate', type: 'Regulatory', status: 'Present' },
      { name: 'DG Service Record (2026)', type: 'Maintenance', status: 'Present' },
      { name: 'Tower Inspection Certificate', type: 'Safety', status: 'Present' },
    ],
  },
  {
    id: 'ATM-KBL-004', name: 'Pul-e-Charkhi Micro', province: 'Kabul', city: 'Pul-e-Charkhi', towerType: 'COW', lifecycle: 'Construction',
    lat: '34.5088', lng: '69.2831', height: 30, activatedDate: null, leasedFrom: 'Private Owner', leaseExpiry: '2035-07-01',
    docs: [
      { name: 'Site Lease Deed', type: 'Legal', status: 'Present' },
      { name: 'Municipal NOC', type: 'Regulatory', status: 'Pending' },
      { name: 'Acceptance Test Report', type: 'Technical', status: 'Missing' },
      { name: 'EMF Certificate', type: 'Regulatory', status: 'Missing' },
    ],
    notes: 'Civil works 70% complete. NOC application submitted to municipality.',
  },
  {
    id: 'ATM-KDR-001', name: 'Kandahar Main Tower', province: 'Kandahar', city: 'Kandahar City', towerType: 'GBT', lifecycle: 'Operations',
    lat: '31.6130', lng: '65.7100', height: 52, activatedDate: '2020-05-01', leasedFrom: 'Kandahar Province DPW', leaseExpiry: '2030-04-30',
    docs: [
      { name: 'Site Lease Deed', type: 'Legal', status: 'Present' },
      { name: 'Municipal NOC', type: 'Regulatory', status: 'Present' },
      { name: 'Acceptance Test Report', type: 'Technical', status: 'Present' },
      { name: 'EMF Certificate', type: 'Regulatory', status: 'Present' },
      { name: 'DG Service Record (2026)', type: 'Maintenance', status: 'Present' },
    ],
  },
  {
    id: 'ATM-KDR-002', name: 'Kandahar Airport BTS', province: 'Kandahar', city: 'Kandahar City', towerType: 'Lattice', lifecycle: 'Operations',
    lat: '31.5060', lng: '65.8479', height: 60, activatedDate: '2021-01-15', leasedFrom: 'DMS Civil Aviation Authority', leaseExpiry: '2028-01-14',
    docs: [
      { name: 'Site Lease Deed', type: 'Legal', status: 'Present' },
      { name: 'ACAA Permit', type: 'Regulatory', status: 'Present' },
      { name: 'Acceptance Test Report', type: 'Technical', status: 'Present' },
      { name: 'EMF Certificate', type: 'Regulatory', status: 'Present' },
      { name: 'DG Service Record (2026)', type: 'Maintenance', status: 'Pending' },
      { name: 'Height Clearance Certificate', type: 'Safety', status: 'Present' },
    ],
  },
  {
    id: 'ATM-HRT-001', name: 'Herat City BTS', province: 'Herat', city: 'Herat City', towerType: 'GBT', lifecycle: 'Operations',
    lat: '34.3520', lng: '62.2042', height: 48, activatedDate: '2021-03-20', leasedFrom: 'Herat Municipality', leaseExpiry: '2031-03-19',
    docs: [
      { name: 'Site Lease Deed', type: 'Legal', status: 'Present' },
      { name: 'Municipal NOC', type: 'Regulatory', status: 'Present' },
      { name: 'Acceptance Test Report', type: 'Technical', status: 'Present' },
      { name: 'EMF Certificate', type: 'Regulatory', status: 'Present' },
      { name: 'DG Service Record (2026)', type: 'Maintenance', status: 'Present' },
    ],
  },
  {
    id: 'ATM-HRT-002', name: 'Herat University Area', province: 'Herat', city: 'Herat City', towerType: 'Rooftop', lifecycle: 'Commissioning',
    lat: '34.3780', lng: '62.1890', height: 20, activatedDate: null, leasedFrom: 'Herat University', leaseExpiry: '2033-07-01',
    docs: [
      { name: 'Site Lease Deed', type: 'Legal', status: 'Present' },
      { name: 'University MOU', type: 'Legal', status: 'Present' },
      { name: 'Acceptance Test Report', type: 'Technical', status: 'Pending' },
      { name: 'EMF Certificate', type: 'Regulatory', status: 'Pending' },
    ],
    notes: 'Equipment installation complete. Awaiting ATRA site inspection for commissioning.',
  },
  {
    id: 'ATM-MZR-001', name: 'Mazar-i-Sharif Central', province: 'Mazar-i-Sharif', city: 'Mazar-i-Sharif', towerType: 'GBT', lifecycle: 'Operations',
    lat: '36.7090', lng: '67.1100', height: 45, activatedDate: '2021-10-01', leasedFrom: 'Balkh Province Authority', leaseExpiry: '2031-09-30',
    docs: [
      { name: 'Site Lease Deed', type: 'Legal', status: 'Present' },
      { name: 'Municipal NOC', type: 'Regulatory', status: 'Present' },
      { name: 'Acceptance Test Report', type: 'Technical', status: 'Present' },
      { name: 'EMF Certificate', type: 'Regulatory', status: 'Present' },
      { name: 'DG Service Record (2026)', type: 'Maintenance', status: 'Present' },
    ],
  },
  {
    id: 'ATM-JLB-001', name: 'Jalalabad City Tower', province: 'Jalalabad', city: 'Jalalabad', towerType: 'Monopole', lifecycle: 'Operations',
    lat: '34.4415', lng: '70.4380', height: 40, activatedDate: '2022-03-15', leasedFrom: 'Nangarhar Municipality', leaseExpiry: '2032-03-14',
    docs: [
      { name: 'Site Lease Deed', type: 'Legal', status: 'Present' },
      { name: 'Municipal NOC', type: 'Regulatory', status: 'Present' },
      { name: 'Acceptance Test Report', type: 'Technical', status: 'Present' },
      { name: 'EMF Certificate', type: 'Regulatory', status: 'Present' },
      { name: 'DG Service Record (2026)', type: 'Maintenance', status: 'Pending' },
    ],
  },
  {
    id: 'ATM-KND-001', name: 'Kunduz North BTS', province: 'Kunduz', city: 'Kunduz City', towerType: 'GBT', lifecycle: 'Operations',
    lat: '36.7290', lng: '68.8720', height: 42, activatedDate: '2022-11-01', leasedFrom: 'Kunduz Municipality', leaseExpiry: '2032-10-30',
    docs: [
      { name: 'Site Lease Deed', type: 'Legal', status: 'Present' },
      { name: 'Municipal NOC', type: 'Regulatory', status: 'Present' },
      { name: 'Acceptance Test Report', type: 'Technical', status: 'Present' },
      { name: 'EMF Certificate', type: 'Regulatory', status: 'Present' },
      { name: 'DG Service Record (2026)', type: 'Maintenance', status: 'Present' },
    ],
  },
  {
    id: 'ATM-BMY-001', name: 'Bamyan Town Relay', province: 'Bamyan', city: 'Bamyan', towerType: 'Lattice', lifecycle: 'Acquisition',
    lat: '34.8210', lng: '67.8230', height: 55, activatedDate: null, leasedFrom: 'TBD — Site survey ongoing', leaseExpiry: '2036-07-01',
    docs: [
      { name: 'Site Survey Report', type: 'Technical', status: 'Pending' },
      { name: 'Site Lease Deed', type: 'Legal', status: 'Missing' },
      { name: 'Municipal NOC', type: 'Regulatory', status: 'Missing' },
    ],
    notes: 'Feasibility study completed Q3 2026. Lease negotiation with landowner starting Q4 2026.',
  },
];

const LIFECYCLE_STAGES: LifecycleStage[] = ['Acquisition', 'Construction', 'Commissioning', 'Operations', 'Decommissioning'];

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtDate(d: string | null) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

const LIFECYCLE_CONFIG: Record<LifecycleStage, { color: string; dot: string; step: number }> = {
  Acquisition:      { color: 'text-violet-700 bg-violet-50 border-violet-200', dot: 'bg-violet-400', step: 1 },
  Construction:     { color: 'text-amber-700 bg-amber-50 border-amber-200',    dot: 'bg-amber-400',  step: 2 },
  Commissioning:    { color: 'text-sky-700 bg-sky-50 border-sky-200',          dot: 'bg-sky-400',    step: 3 },
  Operations:       { color: 'text-green-700 bg-green-50 border-green-200',    dot: 'bg-green-500',  step: 4 },
  Decommissioning:  { color: 'text-red-700 bg-red-50 border-red-200',          dot: 'bg-red-400',    step: 5 },
};

const TOWER_TYPE_LABEL: Record<TowerType, string> = {
  GBT: 'Ground-Based Tower', Rooftop: 'Rooftop BTS', Monopole: 'Monopole', Lattice: 'Lattice Tower', COW: 'Cell on Wheels',
};

const DOC_STATUS_STYLE: Record<string, string> = {
  Present: 'text-green-700 bg-green-50',
  Pending: 'text-amber-700 bg-amber-50',
  Missing: 'text-red-700 bg-red-50',
};

// ── Main Component ────────────────────────────────────────────────────────────

export function SiteRegistry() {
  const [selectedSite, setSelectedSite] = useState<Site | null>(null);

  const stats = useMemo(() => ({
    total: SITES.length,
    ops: SITES.filter(s => s.lifecycle === 'Operations').length,
    construction: SITES.filter(s => ['Acquisition', 'Construction', 'Commissioning'].includes(s.lifecycle)).length,
    docGaps: SITES.reduce((n, s) => n + s.docs.filter(d => d.status !== 'Present').length, 0),
  }), []);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between pb-1">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Site Registry</h2>
          <p className="text-sm text-gray-500 mt-0.5">AsiaInfo DMS · Tower & BTS Document Repository</p>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Total Sites', value: stats.total,        color: 'border-l-blue-500',  icon: <Building2 size={15} className="text-blue-400" /> },
          { label: 'Operational',  value: stats.ops,          color: 'border-l-green-500', icon: <CheckCircle2 size={15} className="text-green-500" /> },
          { label: 'Under Build',  value: stats.construction, color: 'border-l-amber-400', icon: <Clock size={15} className="text-amber-500" /> },
          { label: 'Doc Gaps',     value: stats.docGaps,      color: 'border-l-red-400',   icon: <AlertTriangle size={15} className="text-red-400" /> },
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

      <RecordList rows={SITES}
        columns={['Site ID', 'Name', 'Province', 'Type', 'Lifecycle', 'Activated', 'Lease Expiry', 'Docs', '']}
        search={site => [site.id, site.name, site.city]}
        filters={[{ label: 'Province', value: site => site.province }, { label: 'Lifecycle', value: site => site.lifecycle }]}
        renderRow={site => {
                const lc = LIFECYCLE_CONFIG[site.lifecycle];
                const missing = site.docs.filter(d => d.status !== 'Present').length;
                return (
                  <tr key={site.id} className="hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => setSelectedSite(site)}>
                    <td className="px-4 py-2.5 text-xs font-mono text-gray-500">{site.id}</td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        <MapPin size={12} className="text-gray-400 shrink-0" />
                        <span className="text-sm font-medium text-gray-800">{site.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-xs text-gray-600">{site.province}</td>
                    <td className="px-4 py-2.5 text-xs text-gray-500">{site.towerType}</td>
                    <td className="px-4 py-2.5">
                      <span className={cn('text-[10px] font-bold uppercase px-2 py-0.5 rounded border', lc.color)}>
                        {site.lifecycle}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-xs text-gray-500">{fmtDate(site.activatedDate)}</td>
                    <td className="px-4 py-2.5 text-xs text-gray-600">{fmtDate(site.leaseExpiry)}</td>
                    <td className="px-4 py-2.5">
                      <span className={cn('text-xs font-medium', missing > 0 ? 'text-red-600' : 'text-green-600')}>
                        {site.docs.length - missing}/{site.docs.length}
                      </span>
                    </td>
                    <td className="px-4 py-2.5">
                      <ChevronRight size={14} className="text-gray-300" />
                    </td>
                  </tr>
                );
              }}
      />

      {/* Site Detail Panel */}
      {selectedSite && <SiteDetailPanel site={selectedSite} onClose={() => setSelectedSite(null)} />}
    </div>
  );
}

// ── Site Detail Panel ─────────────────────────────────────────────────────────

function SiteDetailPanel({ site, onClose }: { site: Site; onClose: () => void }) {
  const lc = LIFECYCLE_CONFIG[site.lifecycle];

  return (
    <PreviewDrawer label={site.name} onClose={onClose}>
        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between shrink-0">
          <div>
            <h3 className="text-sm font-bold text-gray-800">{site.name}</h3>
            <p className="text-xs text-gray-400 mt-0.5 font-mono">{site.id}</p>
          </div>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded transition-colors">
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Site Info */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Province', value: site.province },
              { label: 'City', value: site.city },
              { label: 'Tower Type', value: TOWER_TYPE_LABEL[site.towerType] },
              { label: 'Height', value: `${site.height}m` },
              { label: 'Coordinates', value: `${site.lat}°N ${site.lng}°E` },
              { label: 'Activated', value: fmtDate(site.activatedDate) },
              { label: 'Leased From', value: site.leasedFrom },
              { label: 'Lease Expiry', value: fmtDate(site.leaseExpiry) },
            ].map(({ label, value }) => (
              <div key={label} className="space-y-0.5">
                <p className="text-[10px] font-bold text-gray-400 uppercase">{label}</p>
                <p className="text-xs font-medium text-gray-800 truncate" title={value}>{value}</p>
              </div>
            ))}
          </div>

          {/* Lifecycle Stepper */}
          <div>
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-3">Lifecycle Stage</p>
            <div className="flex items-center gap-1">
              {LIFECYCLE_STAGES.map((stage, idx) => {
                const cfg = LIFECYCLE_CONFIG[stage];
                const isCurrent = stage === site.lifecycle;
                const isPast = cfg.step < LIFECYCLE_CONFIG[site.lifecycle].step;
                return (
                  <React.Fragment key={stage}>
                    <div className={cn('flex flex-col items-center flex-1')}>
                      <div className={cn(
                        'w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold mb-1 transition-all',
                        isCurrent ? cn('ring-2 ring-offset-1', cfg.dot, 'text-white ring-current') :
                        isPast ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-400'
                      )}>
                        {isPast ? '✓' : idx + 1}
                      </div>
                      <span className={cn('text-[9px] text-center leading-tight', isCurrent ? 'font-bold text-gray-800' : 'text-gray-400')}>
                        {stage}
                      </span>
                    </div>
                    {idx < LIFECYCLE_STAGES.length - 1 && (
                      <div className={cn('flex-1 h-px mb-4', isPast ? 'bg-green-400' : 'bg-gray-200')} />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          {/* Notes */}
          {site.notes && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
              <span className="font-bold">Note: </span>{site.notes}
            </div>
          )}

          {/* Document Checklist */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Document Checklist</p>
              <span className="text-xs text-gray-400">{site.docs.filter(d => d.status === 'Present').length}/{site.docs.length} present</span>
            </div>
            <div className="space-y-2">
              {site.docs.map((doc, idx) => (
                <div key={idx} className="flex items-center gap-3 p-2.5 bg-gray-50 rounded-lg">
                  <FileText size={13} className={doc.status === 'Present' ? 'text-green-500' : doc.status === 'Pending' ? 'text-amber-500' : 'text-red-400'} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-800 truncate">{doc.name}</p>
                    <p className="text-[10px] text-gray-400">{doc.type}</p>
                  </div>
                  <span className={cn('text-[9px] font-bold uppercase px-1.5 py-0.5 rounded', DOC_STATUS_STYLE[doc.status])}>
                    {doc.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-gray-100 bg-gray-50 flex items-center justify-between shrink-0">
          <span className={cn('text-[10px] font-bold uppercase px-2.5 py-1 rounded border', lc.color)}>{site.lifecycle}</span>
          <button onClick={onClose} className="px-3 py-1.5 text-xs border border-gray-200 rounded text-gray-600 hover:bg-gray-100 transition-colors">Close</button>
        </div>
    </PreviewDrawer>
  );
}
