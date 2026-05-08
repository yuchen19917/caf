import React, { useState, useEffect } from 'react';
import {
  Activity, CheckCircle2, AlertTriangle, XCircle, RefreshCw,
  Clock, Zap, Database, Shield, Radio, Phone, FileCheck,
  ChevronRight, TrendingUp, TrendingDown, Minus,
  Server, Edit2, Save, X, TestTube, Wifi, Lock
} from 'lucide-react';
import { cn } from '../lib/utils';
import {
  INTEGRATION_SYSTEMS, INTEGRATION_EVENTS, SYSTEM_METRICS,
  getEventsForSystem,
  type IntegrationSystem, type IntegrationEvent, type IntegrationStatus
} from '../lib/integrationMockData';
import { connectivityApi, type ConnectivityConfig } from '../lib/api';

function timeAgo(iso: string): string {
  const diff = Math.round((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.round(diff / 60)}m ago`;
  return `${Math.round(diff / 3600)}h ago`;
}

// ── Status config ─────────────────────────────────────────────────────────────
const STATUS_DOT: Record<IntegrationStatus, string> = {
  online:   'bg-green-500',
  degraded: 'bg-amber-400',
  offline:  'bg-red-500',
};
const STATUS_BADGE: Record<IntegrationStatus, string> = {
  online:   'text-green-700 bg-green-50 border-green-200',
  degraded: 'text-amber-700 bg-amber-50 border-amber-200',
  offline:  'text-red-700 bg-red-50 border-red-200',
};
const SEVERITY_DOT: Record<string, string> = {
  success: 'bg-green-500', warning: 'bg-amber-400', error: 'bg-red-500', info: 'bg-gray-300',
};
const SEVERITY_TEXT: Record<string, string> = {
  success: 'text-green-700', warning: 'text-amber-700', error: 'text-red-600', info: 'text-gray-500',
};
const CAT_ICON: Record<string, React.ElementType> = {
  crm: Database, billing: Zap, provisioning: Radio, numbering: Phone, regulatory: Shield, identity: FileCheck,
};
const CAT_COLOR: Record<string, string> = {
  crm: 'text-indigo-600 bg-indigo-50', billing: 'text-violet-600 bg-violet-50',
  provisioning: 'text-sky-600 bg-sky-50', numbering: 'text-teal-600 bg-teal-50',
  regulatory: 'text-amber-700 bg-amber-50', identity: 'text-emerald-600 bg-emerald-50',
};

const PROTOCOLS = ['REST', 'SOAP', 'SFTP', 'JDBC', 'AMQP', 'SMTP'] as const;
const AUTH_METHODS = ['api_key', 'oauth2', 'basic', 'mtls', 'none'] as const;

// ── Sub-components ────────────────────────────────────────────────────────────
function SystemRow({ system, isSelected, onClick }: { system: IntegrationSystem; isSelected: boolean; onClick: () => void }) {
  const Icon = CAT_ICON[system.category] || Server;
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full text-left px-3 py-2.5 border-b border-gray-100 flex items-center gap-3 hover:bg-gray-50 transition-colors',
        isSelected && 'bg-blue-50 border-l-2 border-l-blue-500'
      )}
    >
      <span className={cn('w-7 h-7 rounded flex items-center justify-center flex-shrink-0', CAT_COLOR[system.category])}>
        <Icon size={13} />
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-800">{system.shortName}</p>
        <p className="text-xs text-gray-400 truncate">{system.name}</p>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        {system.pendingJobs > 0 && (
          <span className="text-[10px] font-medium text-amber-600 bg-amber-50 border border-amber-200 rounded px-1">{system.pendingJobs}</span>
        )}
        <span className={cn('w-2 h-2 rounded-full', STATUS_DOT[system.status])} />
      </div>
    </button>
  );
}

function EventRow({ event }: { event: IntegrationEvent }) {
  return (
    <div className="flex gap-3 py-2.5 border-b border-gray-50 last:border-0">
      <span className={cn('w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0', SEVERITY_DOT[event.severity])} />
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className="text-xs text-gray-800">{event.message}</p>
          <span className="text-[10px] text-gray-400 whitespace-nowrap">{timeAgo(event.timestamp)}</span>
        </div>
        {event.cafId && (
          <p className="text-[10px] text-blue-600 mt-0.5">{event.cafId}{event.customerName && ` · ${event.customerName}`}</p>
        )}
        {event.details && <p className="text-[10px] text-gray-400 font-mono mt-0.5 leading-relaxed">{event.details}</p>}
      </div>
    </div>
  );
}

// ── Connectivity Editor ───────────────────────────────────────────────────────
function ConnectivityPanel({ systemId }: { systemId: string }) {
  const [config, setConfig] = useState<ConnectivityConfig | null>(null);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<Partial<ConnectivityConfig>>({});
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ status: string; latencyMs: number | null; error: string | null } | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    connectivityApi.getAll().then(data => {
      const sys = data.systems.find(s => s.systemId === systemId);
      if (sys) setConfig(sys);
    });
    setTestResult(null);
    setEditing(false);
  }, [systemId]);

  const startEdit = () => {
    setDraft({ ...config });
    setEditing(true);
  };

  const cancelEdit = () => {
    setDraft({});
    setEditing(false);
  };

  const save = async () => {
    setSaving(true);
    try {
      const updated = await connectivityApi.update(systemId, draft);
      setConfig(updated);
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  const runTest = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const result = await connectivityApi.test(systemId);
      setTestResult(result);
      setConfig(prev => prev ? { ...prev, lastTested: result.testedAt, testStatus: result.status as any } : prev);
    } finally {
      setTesting(false);
    }
  };

  const field = (key: keyof ConnectivityConfig) => editing
    ? <input
        value={String(draft[key] ?? '')}
        onChange={e => setDraft(d => ({ ...d, [key]: e.target.value }))}
        className="w-full text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:border-blue-500"
      />
    : <span className="text-xs text-gray-800 font-mono">{String(config?.[key] ?? '—')}</span>;

  const numField = (key: keyof ConnectivityConfig, label: string) => editing
    ? <input
        type="number"
        value={String(draft[key] ?? '')}
        onChange={e => setDraft(d => ({ ...d, [key]: Number(e.target.value) }))}
        className="w-full text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:border-blue-500"
      />
    : <span className="text-xs text-gray-800">{String(config?.[key] ?? '—')}</span>;

  if (!config) return <div className="p-6 text-xs text-gray-400 text-center">Loading connectivity config…</div>;

  const testStatusColor = config.testStatus === 'passed' ? 'text-green-600' : config.testStatus === 'failed' ? 'text-red-600' : 'text-gray-400';

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Connectivity Configuration</p>
        <div className="flex gap-2">
          <button
            onClick={runTest}
            disabled={testing}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-gray-300 rounded hover:bg-gray-50 text-gray-600 disabled:opacity-50 transition-colors"
          >
            <TestTube size={12} className={testing ? 'animate-pulse' : ''} />
            {testing ? 'Testing…' : 'Test Connection'}
          </button>
          {editing ? (
            <>
              <button onClick={cancelEdit} className="px-3 py-1.5 text-xs border border-gray-300 rounded hover:bg-gray-50 text-gray-600 transition-colors">
                <X size={12} />
              </button>
              <button onClick={save} disabled={saving} className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 transition-colors">
                <Save size={12} />
                {saving ? 'Saving…' : 'Save'}
              </button>
            </>
          ) : (
            <button onClick={startEdit} className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-gray-300 rounded hover:bg-gray-50 text-gray-600 transition-colors">
              <Edit2 size={12} /> Edit
            </button>
          )}
        </div>
      </div>

      {/* Test result banner */}
      {testResult && (
        <div className={cn('flex items-center gap-3 p-3 rounded border text-xs', testResult.status === 'passed' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700')}>
          {testResult.status === 'passed' ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
          <span className="font-medium">{testResult.status === 'passed' ? 'Connection test passed' : 'Connection test failed'}</span>
          {testResult.latencyMs && <span className="text-gray-500">· {testResult.latencyMs}ms</span>}
          {testResult.error && <span>· {testResult.error}</span>}
        </div>
      )}

      {/* Config grid */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <tbody className="divide-y divide-gray-50">
            <tr className="bg-gray-50">
              <td colSpan={2} className="px-4 py-2 text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Transport</td>
            </tr>
            <tr>
              <td className="px-4 py-2.5 text-xs text-gray-500 w-40">Protocol</td>
              <td className="px-4 py-2.5">
                {editing
                  ? <select value={String(draft.protocol ?? '')} onChange={e => setDraft(d => ({ ...d, protocol: e.target.value as any }))} className="text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:border-blue-500">
                      {PROTOCOLS.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  : <span className="text-xs font-mono text-gray-800 bg-gray-100 px-1.5 py-0.5 rounded">{config.protocol}</span>
                }
              </td>
            </tr>
            <tr>
              <td className="px-4 py-2.5 text-xs text-gray-500">Endpoint</td>
              <td className="px-4 py-2.5">{field('endpoint')}</td>
            </tr>
            <tr>
              <td className="px-4 py-2.5 text-xs text-gray-500">SSL / TLS</td>
              <td className="px-4 py-2.5">
                {editing
                  ? <input type="checkbox" checked={!!draft.sslEnabled} onChange={e => setDraft(d => ({ ...d, sslEnabled: e.target.checked }))} />
                  : <span className={cn('text-xs font-medium', config.sslEnabled ? 'text-green-600' : 'text-gray-400')}>{config.sslEnabled ? 'Enabled' : 'Disabled'}</span>
                }
              </td>
            </tr>
            <tr>
              <td className="px-4 py-2.5 text-xs text-gray-500">Timeout (s)</td>
              <td className="px-4 py-2.5">{numField('timeout', 'Timeout')}</td>
            </tr>
            <tr>
              <td className="px-4 py-2.5 text-xs text-gray-500">Retry Count</td>
              <td className="px-4 py-2.5">{numField('retryCount', 'Retry')}</td>
            </tr>

            <tr className="bg-gray-50">
              <td colSpan={2} className="px-4 py-2 text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Authentication</td>
            </tr>
            <tr>
              <td className="px-4 py-2.5 text-xs text-gray-500">Method</td>
              <td className="px-4 py-2.5">
                {editing
                  ? <select value={String(draft.authMethod ?? '')} onChange={e => setDraft(d => ({ ...d, authMethod: e.target.value as any }))} className="text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:border-blue-500">
                      {AUTH_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  : <span className="text-xs font-mono text-gray-800 bg-gray-100 px-1.5 py-0.5 rounded">{config.authMethod}</span>
                }
              </td>
            </tr>
            {/* API Key auth */}
            {(config.authMethod === 'api_key' || draft.authMethod === 'api_key') && (<>
              <tr><td className="px-4 py-2.5 text-xs text-gray-500">API Key Header</td><td className="px-4 py-2.5">{field('apiKeyHeader')}</td></tr>
              <tr><td className="px-4 py-2.5 text-xs text-gray-500">API Key</td><td className="px-4 py-2.5"><span className="text-xs font-mono text-gray-400">••••••••••••••••</span></td></tr>
            </>)}
            {/* Basic auth */}
            {(config.authMethod === 'basic' || draft.authMethod === 'basic') && (<>
              <tr><td className="px-4 py-2.5 text-xs text-gray-500">Username</td><td className="px-4 py-2.5">{field('basicUser')}</td></tr>
              <tr><td className="px-4 py-2.5 text-xs text-gray-500">Password</td><td className="px-4 py-2.5"><span className="text-xs font-mono text-gray-400">••••••••</span></td></tr>
            </>)}
            {/* OAuth2 */}
            {(config.authMethod === 'oauth2' || draft.authMethod === 'oauth2') && (<>
              <tr><td className="px-4 py-2.5 text-xs text-gray-500">Client ID</td><td className="px-4 py-2.5">{field('clientId')}</td></tr>
              <tr><td className="px-4 py-2.5 text-xs text-gray-500">Token URL</td><td className="px-4 py-2.5">{field('tokenUrl')}</td></tr>
              <tr><td className="px-4 py-2.5 text-xs text-gray-500">Scope</td><td className="px-4 py-2.5">{field('scope')}</td></tr>
            </>)}
            {/* mTLS */}
            {(config.authMethod === 'mtls' || draft.authMethod === 'mtls') && (<>
              <tr><td className="px-4 py-2.5 text-xs text-gray-500">Client Cert</td><td className="px-4 py-2.5">{field('clientCert')}</td></tr>
              <tr><td className="px-4 py-2.5 text-xs text-gray-500">CA Cert</td><td className="px-4 py-2.5">{field('caCert')}</td></tr>
            </>)}
            {/* SOAP */}
            {config.protocol === 'SOAP' && (<>
              <tr className="bg-gray-50"><td colSpan={2} className="px-4 py-2 text-[10px] font-semibold text-gray-400 uppercase tracking-wide">SOAP</td></tr>
              <tr><td className="px-4 py-2.5 text-xs text-gray-500">WSDL URL</td><td className="px-4 py-2.5">{field('wsdlUrl')}</td></tr>
              <tr><td className="px-4 py-2.5 text-xs text-gray-500">SOAP Action</td><td className="px-4 py-2.5">{field('soapAction')}</td></tr>
            </>)}

            <tr className="bg-gray-50">
              <td colSpan={2} className="px-4 py-2 text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Health</td>
            </tr>
            <tr>
              <td className="px-4 py-2.5 text-xs text-gray-500">Last Tested</td>
              <td className="px-4 py-2.5 text-xs text-gray-700">{config.lastTested ? timeAgo(config.lastTested) : '—'}</td>
            </tr>
            <tr>
              <td className="px-4 py-2.5 text-xs text-gray-500">Test Status</td>
              <td className="px-4 py-2.5">
                <span className={cn('text-xs font-medium capitalize', testStatusColor)}>{config.testStatus || 'unknown'}</span>
                {config.testStatus === 'failed' && config.testError && (
                  <p className="text-[10px] text-red-500 mt-0.5">{config.testError}</p>
                )}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────
export function IntegrationHub() {
  const [selectedSystemId, setSelectedSystemId] = useState('crm');
  const [tab, setTab] = useState<'status' | 'connectivity'>('status');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [severityFilter, setSeverityFilter] = useState<string>('all');

  const selectedSystem = INTEGRATION_SYSTEMS.find(s => s.id === selectedSystemId)!;
  const systemEvents = getEventsForSystem(selectedSystemId);
  const metrics = SYSTEM_METRICS[selectedSystemId] || [];
  const Icon = CAT_ICON[selectedSystem.category] || Server;

  const filteredEvents = severityFilter === 'all'
    ? systemEvents
    : systemEvents.filter(e => e.severity === severityFilter);

  const onlineCount  = INTEGRATION_SYSTEMS.filter(s => s.status === 'online').length;
  const degradedCount = INTEGRATION_SYSTEMS.filter(s => s.status === 'degraded').length;
  const totalPending  = INTEGRATION_SYSTEMS.reduce((sum, s) => sum + s.pendingJobs, 0);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1200);
  };

  const recentEvents = [...INTEGRATION_EVENTS]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 6);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Integration Hub</h2>
          <p className="text-sm text-gray-500 mt-0.5">Back-office system connectivity and transaction monitoring</p>
        </div>
        <button onClick={handleRefresh} className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-gray-300 rounded hover:bg-gray-50 text-gray-600 transition-colors">
          <RefreshCw size={12} className={isRefreshing ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Online Systems',  value: onlineCount,                          color: 'border-l-green-500'  },
          { label: 'Degraded',        value: degradedCount,                        color: 'border-l-amber-400'  },
          { label: 'Offline',         value: INTEGRATION_SYSTEMS.filter(s => s.status === 'offline').length, color: 'border-l-red-400' },
          { label: 'Pending Jobs',    value: totalPending,                         color: 'border-l-blue-500'   },
        ].map(({ label, value, color }) => (
          <div key={label} className={cn('bg-white border border-gray-200 border-l-4 rounded-lg p-4', color)}>
            <p className="text-xs text-gray-500">{label}</p>
            <p className="text-2xl font-bold text-gray-900 mt-0.5">{value}</p>
          </div>
        ))}
      </div>

      {/* Live event stream */}
      <div className="bg-slate-900 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <Activity size={13} className="text-green-400" />
          <p className="text-xs font-semibold text-slate-300 uppercase tracking-wide">Live Event Stream</p>
          <span className="ml-auto flex items-center gap-1.5 text-[10px] text-green-400 font-medium">
            <span className="w-1.5 h-1.5 bg-green-400 rounded-full" />LIVE
          </span>
        </div>
        <div className="space-y-1.5">
          {recentEvents.map(event => {
            const sys = INTEGRATION_SYSTEMS.find(s => s.id === event.systemId);
            return (
              <div key={event.id} className="flex items-start gap-3 text-xs">
                <span className="text-slate-500 font-mono whitespace-nowrap w-12 flex-shrink-0">{timeAgo(event.timestamp)}</span>
                <span className="text-slate-400 font-mono w-10 flex-shrink-0">[{sys?.shortName || event.systemId.toUpperCase()}]</span>
                <span className={cn('flex-1 truncate', SEVERITY_TEXT[event.severity])}>{event.message}</span>
                {event.cafId && <span className="text-blue-400 font-mono whitespace-nowrap">{event.cafId}</span>}
              </div>
            );
          })}
        </div>
      </div>

      {/* Main panel */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* System list */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="px-3 py-2.5 border-b border-gray-100 bg-gray-50">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Connected Systems ({INTEGRATION_SYSTEMS.length})</p>
          </div>
          {INTEGRATION_SYSTEMS.map(sys => (
            <React.Fragment key={sys.id}>
              <SystemRow
                system={sys}
                isSelected={selectedSystemId === sys.id}
                onClick={() => setSelectedSystemId(sys.id)}
              />
            </React.Fragment>
          ))}
        </div>

        {/* Detail panel */}
        <div className="lg:col-span-3 space-y-4">
          {/* System header */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <span className={cn('w-9 h-9 rounded flex items-center justify-center flex-shrink-0', CAT_COLOR[selectedSystem.category])}>
                  <Icon size={16} />
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-gray-900">{selectedSystem.name}</h3>
                    <span className={cn('text-[10px] font-medium px-1.5 py-0.5 rounded border', STATUS_BADGE[selectedSystem.status])}>
                      {selectedSystem.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">{selectedSystem.description}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                    <span>{selectedSystem.vendor} · {selectedSystem.version}</span>
                    <span>Last sync: {timeAgo(selectedSystem.lastSync)}</span>
                    <span>Success rate: <span className={cn('font-medium', selectedSystem.successRate >= 98 ? 'text-green-600' : selectedSystem.successRate >= 90 ? 'text-amber-600' : 'text-red-600')}>{selectedSystem.successRate}%</span></span>
                  </div>
                </div>
              </div>
              {/* Sub-tabs */}
              <div className="flex border border-gray-200 rounded overflow-hidden flex-shrink-0">
                <button
                  onClick={() => setTab('status')}
                  className={cn('px-3 py-1.5 text-xs font-medium transition-colors', tab === 'status' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-50')}
                >
                  Status
                </button>
                <button
                  onClick={() => setTab('connectivity')}
                  className={cn('px-3 py-1.5 text-xs font-medium border-l border-gray-200 transition-colors', tab === 'connectivity' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-50')}
                >
                  Connectivity
                </button>
              </div>
            </div>
          </div>

          {tab === 'status' ? (
            <>
              {/* Metrics */}
              <div className="grid grid-cols-3 gap-3">
                {metrics.map(m => (
                  <React.Fragment key={m.label}>
                    <div className="bg-white border border-gray-200 rounded-lg p-3">
                      <p className="text-xs text-gray-500">{m.label}</p>
                      <div className="flex items-baseline gap-1 mt-0.5">
                        <span className="text-lg font-bold text-gray-900">{m.value}</span>
                        {m.unit && <span className="text-xs text-gray-400">{m.unit}</span>}
                        {m.trend === 'up' && <TrendingUp size={12} className="text-green-500" />}
                        {m.trend === 'down' && <TrendingDown size={12} className="text-red-500" />}
                        {m.trend === 'flat' && <Minus size={12} className="text-gray-300" />}
                      </div>
                    </div>
                  </React.Fragment>
                ))}
              </div>

              {/* Event log */}
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="px-4 py-2.5 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Event Log</p>
                  <div className="flex gap-1">
                    {(['all', 'success', 'warning', 'error', 'info'] as const).map(f => (
                      <button
                        key={f}
                        onClick={() => setSeverityFilter(f)}
                        className={cn('px-2 py-0.5 rounded text-[10px] font-medium transition-colors', severityFilter === f ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100')}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="p-3 divide-y divide-gray-50">
                  {filteredEvents.length === 0
                    ? <p className="text-xs text-gray-400 text-center py-6">No events for this filter</p>
                    : filteredEvents.map(event => (
                        <React.Fragment key={event.id}><EventRow event={event} /></React.Fragment>
                      ))
                  }
                </div>
              </div>
            </>
          ) : (
            <ConnectivityPanel systemId={selectedSystemId} />
          )}
        </div>
      </div>
    </div>
  );
}
