import { systemPages, type SystemPage } from '../lib/systemPages';
import { RecordList } from './RecordList';
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Users, Shield, Key, Plus, Edit2, Trash2, X, Save,
  AlertCircle, CheckCircle, GitBranch, AlertTriangle, Bell, Mail,
  Smartphone, Clock, ArrowRight, RefreshCw, Info, Settings,
  Database, Server, HardDrive, Cpu, MemoryStick, Wifi, Activity,
  Code2, WifiOff, Zap, Package,
  TrendingUp, TrendingDown, Circle, BarChart2, ChevronRight,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useTranslation } from 'react-i18next';
import {
  PREDEFINED_USERS, ROLE_PERMISSIONS, getRoleDisplayName, getRoleColor,
  type User, type UserRole, type Permission,
} from '../lib/auth';

// ── Navigation Types ──────────────────────────────────────────────────────────
type BusinessPage = 'approval' | 'error-codes' | 'notifications';
type AccessPage = 'users' | 'roles' | 'permissions';
type InfraPage = 'storage' | 'services' | 'resources';

// ── Infrastructure Types ──────────────────────────────────────────────────────
type HealthStatus = 'online' | 'degraded' | 'offline';

type StorageNode = {
  id: string; name: string; type: 'SQL' | 'NoSQL' | 'Object' | 'Cache';
  engine: string; status: HealthStatus; uptime: number;
  metrics: { label: string; value: string | number; unit?: string; warn?: boolean }[];
  storage: { used: number; total: number; unit: string };
};

type ApiService = {
  id: string; name: string; description: string; status: HealthStatus;
  responseMs: number; reqPerMin: number; uptime: number; errorRate: number;
};

type ResourceMetric = { label: string; value: number; max: number; unit: string; icon: React.ElementType };

// ── Approval Types ────────────────────────────────────────────────────────────
type ApprovalStage = {
  id: string; name: string; role: UserRole; slaHours: number;
  required: boolean; autoEscalate: boolean;
};
type ApprovalRule = {
  id: string; name: string; condition: string;
  action: 'auto_approve' | 'skip_stage' | 'escalate'; enabled: boolean;
};

// ── Error Code Types ──────────────────────────────────────────────────────────
type ErrSeverity = 'Critical' | 'Warning' | 'Info';
type ErrCategory = 'Validation' | 'Document' | 'Network' | 'System' | 'Integration' | 'Authentication';
type ErrorCode = {
  id: string; code: string; category: ErrCategory; message: string;
  detail: string; severity: ErrSeverity; retryable: boolean; active: boolean;
};

// ── Notification Types ────────────────────────────────────────────────────────
type NotifChannel = { email: boolean; sms: boolean; inApp: boolean };
type RecipientGroup = 'admin' | 'auditor' | 'agent' | 'customer';
type NotifEvent = {
  id: string; event: string; description: string; icon: React.ElementType;
  channels: NotifChannel; recipients: RecipientGroup[]; enabled: boolean;
};

// ── Seed Data ─────────────────────────────────────────────────────────────────
const SEED_STAGES: ApprovalStage[] = [
  { id: 'S1', name: 'Agent Submission',      role: 'agent',   slaHours: 24, required: true,  autoEscalate: true  },
  { id: 'S2', name: 'Auditor Verification',  role: 'auditor', slaHours: 48, required: true,  autoEscalate: true  },
  { id: 'S3', name: 'Admin Final Approval',  role: 'admin',   slaHours: 24, required: false, autoEscalate: false },
];
const SEED_RULES: ApprovalRule[] = [
  { id: 'R1', name: 'Pre-approved Customers', condition: 'Risk score ≥ 90 AND service = Prepaid',                 action: 'auto_approve', enabled: true  },
  { id: 'R2', name: 'Skip Final for Low-Risk', condition: 'Risk score ≥ 80 AND plan value < AFN 5,000/mo',       action: 'skip_stage',   enabled: false },
  { id: 'R3', name: 'Escalate High-Value Corporate', condition: 'Type = Corporate AND plan > AFN 50,000/mo',     action: 'escalate',     enabled: true  },
];
const SEED_ERRORS: ErrorCode[] = [
  { id:'EC1',  code:'ERR-1001', category:'Validation',     message:'Required field missing',       detail:'One or more mandatory CAF fields were not filled.',           severity:'Warning',  retryable:true,  active:true  },
  { id:'EC2',  code:'ERR-1002', category:'Validation',     message:'Invalid ID number format',     detail:'Tazkira or passport number does not match expected format.',   severity:'Warning',  retryable:true,  active:true  },
  { id:'EC3',  code:'ERR-2001', category:'Document',       message:'Document verification failed', detail:'Uploaded document could not be verified against NTRA registry.',severity:'Critical', retryable:false, active:true  },
  { id:'EC4',  code:'ERR-2002', category:'Document',       message:'Document expired',             detail:'The provided identity document has passed its expiry date.',   severity:'Warning',  retryable:true,  active:true  },
  { id:'EC5',  code:'ERR-2003', category:'Document',       message:'Unsupported file type',        detail:'Uploaded file must be PDF, JPG, or PNG.',                     severity:'Info',     retryable:true,  active:true  },
  { id:'EC6',  code:'ERR-3001', category:'Network',        message:'CRM connection timeout',       detail:'Unable to reach CRM system within 30 seconds.',               severity:'Critical', retryable:true,  active:true  },
  { id:'EC7',  code:'ERR-3002', category:'Network',        message:'BSS sync failure',             detail:'Billing system did not acknowledge provisioning signal.',      severity:'Critical', retryable:true,  active:true  },
  { id:'EC8',  code:'ERR-4001', category:'System',         message:'Database write error',         detail:'Failed to persist CAF record to primary store.',              severity:'Critical', retryable:false, active:true  },
  { id:'EC9',  code:'ERR-5001', category:'Integration',    message:'eKYC service unavailable',     detail:'Tazkira verification service is not responding.',              severity:'Warning',  retryable:true,  active:false },
  { id:'EC10', code:'ERR-6001', category:'Authentication', message:'Session expired',              detail:'User session token has expired. Re-authentication required.',  severity:'Info',     retryable:true,  active:true  },
];
const SEED_NOTIF_EVENTS: NotifEvent[] = [
  { id:'NE1', event:'CAF Submitted',       description:'New CAF submitted for review',                      icon:CheckCircle,   channels:{email:true,  sms:false, inApp:true},  recipients:['auditor','admin'],            enabled:true  },
  { id:'NE2', event:'CAF Approved',        description:'CAF fully approved and provisioned',                icon:CheckCircle,   channels:{email:true,  sms:true,  inApp:true},  recipients:['agent','customer','admin'],   enabled:true  },
  { id:'NE3', event:'CAF Rejected',        description:'CAF rejected at any stage',                         icon:X,             channels:{email:true,  sms:true,  inApp:true},  recipients:['agent','admin'],              enabled:true  },
  { id:'NE4', event:'Correction Requested',description:'CAF returned to agent for correction',              icon:AlertTriangle, channels:{email:true,  sms:false, inApp:true},  recipients:['agent'],                      enabled:true  },
  { id:'NE5', event:'SLA Breach',          description:'CAF exceeded its stage SLA time limit',             icon:Clock,         channels:{email:true,  sms:true,  inApp:true},  recipients:['auditor','admin'],            enabled:true  },
  { id:'NE6', event:'Document Expired',    description:'Attached identity document has expired',            icon:AlertCircle,   channels:{email:true,  sms:false, inApp:true},  recipients:['agent','customer'],           enabled:false },
  { id:'NE7', event:'Integration Failure', description:'CRM, BSS, or provisioning sync failed',             icon:Zap,           channels:{email:true,  sms:true,  inApp:true},  recipients:['admin'],                      enabled:true  },
  { id:'NE8', event:'Daily Digest',        description:'Daily summary of CAF activity',                     icon:Mail,          channels:{email:true,  sms:false, inApp:false}, recipients:['admin','auditor'],            enabled:true  },
];

const SEED_STORAGE: StorageNode[] = [
  {
    id:'db-sql', name:'Primary Database', type:'SQL', engine:'PostgreSQL 15.2', status:'online', uptime:99.97,
    storage:{ used:2.3, total:50, unit:'GB' },
    metrics:[
      { label:'Active connections', value:12, unit:'/100' },
      { label:'Queries/sec',        value:24 },
      { label:'Avg query time',     value:'8 ms' },
      { label:'Transactions/sec',   value:18 },
      { label:'Cache hit ratio',    value:'98.4%' },
      { label:'Replication lag',    value:'0 ms' },
    ],
  },
  {
    id:'db-nosql', name:'Document Store', type:'NoSQL', engine:'MongoDB 7.0', status:'online', uptime:99.91,
    storage:{ used:8.1, total:100, unit:'GB' },
    metrics:[
      { label:'Collections',  value:8 },
      { label:'Documents',    value:'47,832' },
      { label:'Read ops/sec', value:142 },
      { label:'Write ops/sec',value:18 },
      { label:'Index size',   value:'1.2 GB' },
      { label:'Shard count',  value:1 },
    ],
  },
  {
    id:'db-files', name:'File Storage', type:'Object', engine:'MinIO (S3-compatible)', status:'online', uptime:99.85,
    storage:{ used:45.2, total:500, unit:'GB' },
    metrics:[
      { label:'Total objects',  value:'12,441' },
      { label:'Buckets',        value:4 },
      { label:'Daily uploads',  value:'~38 files' },
      { label:'Bandwidth/day',  value:'1.2 GB' },
      { label:'Deleted (30d)',  value:'218 files' },
      { label:'Largest bucket', value:'caf-documents' },
    ],
  },
  {
    id:'db-cache', name:'Session Cache', type:'Cache', engine:'Redis 7.2', status:'online', uptime:99.99,
    storage:{ used:124, total:512, unit:'MB' },
    metrics:[
      { label:'Active keys',   value:'2,341' },
      { label:'Hit rate',      value:'94.2%' },
      { label:'Connections',   value:8 },
      { label:'Evictions',     value:0 },
      { label:'Cmd/sec',       value:312 },
      { label:'Persistence',   value:'AOF + RDB' },
    ],
  },
];

const SEED_SERVICES: ApiService[] = [
  { id:'svc-caf',    name:'CAF Application Service',    description:'Core CAF CRUD, workflow orchestration',     status:'online',   responseMs:98,   reqPerMin:234, uptime:99.8,  errorRate:0.02 },
  { id:'svc-auth',   name:'Authentication Service',     description:'Login, session tokens, RBAC enforcement',    status:'online',   responseMs:12,   reqPerMin:45,  uptime:100.0, errorRate:0.00 },
  { id:'svc-doc',    name:'Document Processing',        description:'OCR, file validation, format conversion',    status:'degraded', responseMs:2341, reqPerMin:12,  uptime:98.2,  errorRate:4.30 },
  { id:'svc-notif',  name:'Notification Dispatcher',   description:'Email, SMS, in-app delivery queue',          status:'online',   responseMs:45,   reqPerMin:18,  uptime:99.5,  errorRate:0.10 },
  { id:'svc-ntra',   name:'NTRA Regulatory API',        description:'License verification, regulatory reporting',  status:'online',   responseMs:312,  reqPerMin:8,   uptime:97.8,  errorRate:1.20 },
  { id:'svc-ekyc',   name:'eKYC / Tazkira Verify',     description:'National ID biometric verification',          status:'offline',  responseMs:0,    reqPerMin:0,   uptime:89.1,  errorRate:100.0 },
];

// ── Helper Components ─────────────────────────────────────────────────────────
function Toggle({ enabled, onChange }: { enabled: boolean; onChange: () => void }) {
  return (
    <button type="button" onClick={onChange}
      className={cn('relative inline-flex h-5 w-9 items-center rounded-full transition-colors', enabled ? 'bg-indigo-600' : 'bg-slate-200')}>
      <span className={cn('inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform', enabled ? 'translate-x-[18px]' : 'translate-x-[3px]')} />
    </button>
  );
}

function StatusDot({ status, size = 'sm' }: { status: HealthStatus; size?: 'sm' | 'md' }) {
  const s = size === 'sm' ? 'w-2 h-2' : 'w-3 h-3';
  return (
    <span className={cn('inline-block rounded-full', s,
      status === 'online' ? 'bg-emerald-500' : status === 'degraded' ? 'bg-amber-500' : 'bg-rose-500'
    )} />
  );
}

function StatusBadge({ status }: { status: HealthStatus }) {
  return (
    <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider',
      status === 'online' ? 'bg-emerald-100 text-emerald-700' : status === 'degraded' ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'
    )}>
      <StatusDot status={status} />
      {status}
    </span>
  );
}

function StorageBar({ used, total }: { used: number; total: number }) {
  const pct = Math.min((used / total) * 100, 100);
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-[10px] text-slate-500">
        <span>{used} / {total}</span>
        <span className={cn('font-bold', pct > 80 ? 'text-rose-600' : pct > 60 ? 'text-amber-600' : 'text-emerald-600')}>{pct.toFixed(0)}%</span>
      </div>
      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div className={cn('h-full rounded-full transition-all', pct > 80 ? 'bg-rose-500' : pct > 60 ? 'bg-amber-500' : 'bg-emerald-500')} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function ResourceBar({ value, max, warn = 70, danger = 85 }: { value: number; max: number; warn?: number; danger?: number }) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className={cn('h-full rounded-full', pct >= danger ? 'bg-rose-500' : pct >= warn ? 'bg-amber-500' : 'bg-indigo-500')}
      />
    </div>
  );
}

const TYPE_BADGE: Record<StorageNode['type'], string> = {
  SQL:    'bg-indigo-100 text-indigo-700',
  NoSQL:  'bg-purple-100 text-purple-700',
  Object: 'bg-teal-100 text-teal-700',
  Cache:  'bg-orange-100 text-orange-700',
};
const SEV_STYLE: Record<ErrSeverity, string> = {
  Critical: 'bg-rose-100 text-rose-700',
  Warning:  'bg-amber-100 text-amber-700',
  Info:     'bg-sky-100 text-sky-700',
};
const CAT_STYLE: Record<ErrCategory, string> = {
  Validation:     'bg-purple-100 text-purple-700',
  Document:       'bg-indigo-100 text-indigo-700',
  Network:        'bg-orange-100 text-orange-700',
  System:         'bg-red-100 text-red-700',
  Integration:    'bg-teal-100 text-teal-700',
  Authentication: 'bg-slate-100 text-slate-700',
};
const RCPT_STYLE: Record<RecipientGroup, string> = {
  admin:    'bg-rose-100 text-rose-700',
  auditor:  'bg-emerald-100 text-emerald-700',
  agent:    'bg-indigo-100 text-indigo-700',
  customer: 'bg-amber-100 text-amber-700',
};

// ── Main Component ────────────────────────────────────────────────────────────
export function SystemManagement({ category, onNavigate }: {
  category: SystemPage;
  onNavigate: (page: SystemPage) => void;
}) {
  const { t } = useTranslation();
  const { i18n } = useTranslation();

  // Navigation
  const [bizPage, setBizPage]       = useState<BusinessPage>('approval');
  const [accessPage, setAccessPage] = useState<AccessPage>('users');
  const [infraPage, setInfraPage]   = useState<InfraPage>('storage');

  // Users state
  const [users, setUsers]             = useState<User[]>(PREDEFINED_USERS);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Approval state
  const [stages, setStages] = useState<ApprovalStage[]>(SEED_STAGES);
  const [rules, setRules]   = useState<ApprovalRule[]>(SEED_RULES);
  const [editingStage, setEditingStage] = useState<ApprovalStage | null>(null);
  const [reqReason, setReqReason]       = useState(true);
  const [allowResubmit, setAllowResubmit] = useState(true);
  const [twoLevelCorp, setTwoLevelCorp] = useState(true);
  const [lockOnReview, setLockOnReview] = useState(false);

  // Error codes state
  const [errorCodes, setErrorCodes]           = useState<ErrorCode[]>(SEED_ERRORS);
  const [editingError, setEditingError]       = useState<ErrorCode | null>(null);

  // Notifications state
  const [notifEvents, setNotifEvents] = useState<NotifEvent[]>(SEED_NOTIF_EVENTS);
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [smsEnabled, setSmsEnabled]     = useState(true);
  const [senderEmail, setSenderEmail]   = useState('noreply@asiainfo.com');
  const [smsGateway, setSmsGateway]     = useState('ASIAINFO-SMSGW-01');
  const [dailyDigest, setDailyDigest]   = useState(true);
  const [digestTime, setDigestTime]     = useState('08:00');

  // Infrastructure state — "live" simulation
  const [storage, setStorage]   = useState<StorageNode[]>(SEED_STORAGE);
  const [services, setServices] = useState<ApiService[]>(SEED_SERVICES);
  const [resources, setResources] = useState({
    cpu:    { value: 64,   max: 100, unit: '%',   icon: Cpu },
    memory: { value: 14.2, max: 24.4, unit: 'GB', icon: MemoryStick },
    disk:   { value: 52.6, max: 200, unit: 'GB',  icon: HardDrive },
    netTx:  { value: 1.2,  max: 10,  unit: 'MB/s',icon: Wifi },
    netRx:  { value: 0.8,  max: 10,  unit: 'MB/s',icon: Wifi },
  });
  const [lastRefreshed, setLastRefreshed] = useState(new Date());

  const jitter = (v: number, d: number) => Math.max(0, +(v + (Math.random() - 0.5) * d).toFixed(1));

  const refresh = useCallback(() => {
    setResources((r) => ({
      cpu:    { ...r.cpu,    value: jitter(r.cpu.value,    8) },
      memory: { ...r.memory, value: jitter(r.memory.value, 0.4) },
      disk:   { ...r.disk,   value: r.disk.value },
      netTx:  { ...r.netTx,  value: jitter(r.netTx.value,  0.3) },
      netRx:  { ...r.netRx,  value: jitter(r.netRx.value,  0.2) },
    }));
    setServices((prev) => prev.map((s) =>
      s.status === 'offline' ? s : { ...s, responseMs: Math.max(1, Math.round(jitter(s.responseMs, s.responseMs * 0.1))), reqPerMin: Math.max(0, Math.round(jitter(s.reqPerMin, 5))) }
    ));
    setLastRefreshed(new Date());
  }, []);

  useEffect(() => {
    const t = setInterval(refresh, 6000);
    return () => clearInterval(t);
  }, [refresh]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">{t('common.' + systemPages[category])}</h1>

      <AnimatePresence mode="wait">
        {category === 'overview' && (
          <motion.div key="overview" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-6">

            {/* Health summary row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Databases',     count: storage.length,                    ok: storage.filter(s => s.status==='online').length,   icon: Database, color: 'indigo'  },
                { label: 'API Services',  count: services.length,                   ok: services.filter(s => s.status==='online').length,   icon: Server,   color: 'teal'    },
                { label: 'Active Users',  count: users.length,                      ok: users.filter(u => u.isActive).length,               icon: Users,    color: 'violet'  },
                { label: 'Error Codes',   count: errorCodes.filter(e=>e.active).length, ok: errorCodes.filter(e=>e.active && e.severity!=='Critical').length, icon: Code2, color: 'amber' },
              ].map(({ label, count, ok, icon: Icon, color }) => (
                <div key={label} className="bg-white rounded-xl border border-slate-200 p-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className={cn('w-9 h-9 rounded-xl flex items-center justify-center',
                      color==='indigo'?'bg-indigo-100 text-indigo-600':color==='teal'?'bg-teal-100 text-teal-600':color==='violet'?'bg-violet-100 text-violet-600':'bg-amber-100 text-amber-600')}>
                      <Icon size={18} />
                    </span>
                    <span className="text-2xl font-bold text-slate-800">{ok}<span className="text-sm font-normal text-slate-400">/{count}</span></span>
                  </div>
                  <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">{label}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">{ok === count ? 'All healthy' : `${count - ok} need attention`}</p>
                </div>
              ))}
            </div>

            {/* Storage health */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2"><Database size={15} className="text-indigo-600" /> Data Storage Health</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                {storage.map((s) => (
                  <div key={s.id} className="p-4 rounded-xl border border-slate-100 bg-slate-50/50">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="text-xs font-bold text-slate-800">{s.name}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{s.engine}</p>
                      </div>
                      <StatusDot status={s.status} size="md" />
                    </div>
                    <span className={cn('text-[9px] font-bold uppercase px-1.5 py-0.5 rounded tracking-wider', TYPE_BADGE[s.type])}>{s.type}</span>
                    <div className="mt-3">
                      <p className="text-[10px] text-slate-500 mb-1">Storage ({s.storage.unit})</p>
                      <StorageBar used={s.storage.used} total={s.storage.total} />
                    </div>
                    <div className="mt-2 flex justify-between text-[10px]">
                      <span className="text-slate-500">Uptime</span>
                      <span className="font-bold text-emerald-600">{s.uptime}%</span>
                    </div>
                    <button type="button" onClick={() => { setInfraPage('storage'); onNavigate('infrastructure'); }}
                      className="mt-3 w-full text-[10px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center justify-center gap-1 transition-colors">
                      View details <ChevronRight size={10} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Services health */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2"><Server size={15} className="text-teal-600" /> API Services Health</h3>
                <button type="button" onClick={refresh} className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700 transition-colors">
                  <RefreshCw size={12} /> Refresh
                </button>
              </div>
              <div className="space-y-2">
                {services.map((svc) => (
                  <div key={svc.id} className="flex items-center gap-4 px-4 py-3 rounded-xl bg-slate-50 border border-slate-100">
                    <StatusDot status={svc.status} size="md" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-800">{svc.name}</p>
                      <p className="text-[10px] text-slate-400">{svc.description}</p>
                    </div>
                    <div className="hidden md:flex items-center gap-6 text-xs text-slate-500">
                      <span className={cn('font-bold', svc.responseMs > 1000 ? 'text-rose-600' : svc.responseMs > 500 ? 'text-amber-600' : 'text-slate-700')}>
                        {svc.status === 'offline' ? '—' : `${svc.responseMs}ms`}
                      </span>
                      <span>{svc.status === 'offline' ? '—' : `${svc.reqPerMin} req/min`}</span>
                      <span className="font-bold text-emerald-600">{svc.uptime}%</span>
                    </div>
                    <StatusBadge status={svc.status} />
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-slate-400 mt-3 text-right">Auto-refreshed every 6 s · Last: {lastRefreshed.toLocaleTimeString()}</p>
            </div>

            {/* Recent alerts */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2"><Bell size={15} className="text-amber-500" /> Recent System Alerts</h3>
              <div className="space-y-2">
                {[
                  { time:'09:14', msg:'eKYC service is unreachable — requests failing since 08:52', level:'offline' as HealthStatus },
                  { time:'08:52', msg:'Document Processing degraded — avg response 2.3 s (threshold: 1 s)', level:'degraded' as HealthStatus },
                  { time:'07:30', msg:'SLA breach: CAF-2026-010 exceeded 48 h in Auditor stage', level:'degraded' as HealthStatus },
                  { time:'06:00', msg:'Daily digest delivered — 4 pending CAFs, 2 approved, 1 rejected', level:'online' as HealthStatus },
                  { time:'05:45', msg:'Redis memory at 24% (124 MB / 512 MB) — nominal', level:'online' as HealthStatus },
                ].map((a, i) => (
                  <div key={i} className="flex items-start gap-3 px-3 py-2.5 rounded-lg border border-slate-100">
                    <StatusDot status={a.level} size="md" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-slate-700">{a.msg}</p>
                    </div>
                    <span className="text-[10px] text-slate-400 shrink-0 font-mono">{a.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* ── BUSINESS CONFIG ─────────────────────────────────────────────── */}
        {category === 'business' && (
          <motion.div key="business" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-4">
            {/* Sub-tabs */}
            <div className="flex gap-1 border-b border-slate-200">
              {([
                { id:'approval'    as BusinessPage, label:'Approval Process', icon: GitBranch },
                { id:'error-codes' as BusinessPage, label:'Error Codes',      icon: Code2 },
                { id:'notifications' as BusinessPage, label:'Notifications',  icon: Bell },
              ]).map((t) => (
                <button key={t.id} type="button" onClick={() => setBizPage(t.id)}
                  className={cn('flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all',
                    bizPage === t.id ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                  )}>
                  <t.icon size={14} /> {t.label}
                </button>
              ))}
            </div>

            {/* Approval Process */}
            {bizPage === 'approval' && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl border border-slate-200 p-6">
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <h3 className="text-sm font-bold text-slate-800">Approval Pipeline</h3>
                      <p className="text-xs text-slate-500 mt-0.5">Sequential stages — optional stages may be skipped by rules below</p>
                    </div>
                    <button type="button" className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-medium hover:bg-indigo-700 transition-all">
                      <Plus size={13} /> Add Stage
                    </button>
                  </div>
                  <div className="flex flex-col lg:flex-row items-stretch gap-3">
                    {stages.map((stage, idx) => (
                      <React.Fragment key={stage.id}>
                        <div className={cn('flex-1 rounded-xl border-2 p-5 relative group transition-all',
                          stage.required ? 'border-indigo-200 bg-indigo-50/30' : 'border-dashed border-slate-200 bg-white')}>
                          {!stage.required && (
                            <span className="absolute top-3 right-3 text-[9px] font-bold uppercase bg-slate-200 text-slate-500 px-2 py-0.5 rounded tracking-wider">Optional</span>
                          )}
                          <div className="flex items-center gap-2 mb-3">
                            <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0">{idx + 1}</span>
                            <p className="text-sm font-bold text-slate-800">{stage.name}</p>
                          </div>
                          <div className="space-y-2 text-xs">
                            <div className="flex justify-between"><span className="text-slate-500">Assigned to</span><span className={cn('px-2 py-0.5 rounded font-bold uppercase text-[10px]', getRoleColor(stage.role))}>{getRoleDisplayName(stage.role)}</span></div>
                            <div className="flex justify-between"><span className="text-slate-500">SLA</span><span className={cn('font-bold', stage.slaHours<=24?'text-emerald-600':stage.slaHours<=48?'text-amber-600':'text-rose-600')}>{stage.slaHours}h</span></div>
                            <div className="flex justify-between items-center"><span className="text-slate-500">Auto-escalate</span>
                              <Toggle enabled={stage.autoEscalate} onChange={() => setStages((p) => p.map((s) => s.id===stage.id ? {...s,autoEscalate:!s.autoEscalate} : s))} />
                            </div>
                          </div>
                          <button type="button" onClick={() => setEditingStage(stage)}
                            className="mt-4 w-full py-1.5 text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-white border border-indigo-200 rounded-lg hover:bg-indigo-50 transition-all opacity-0 group-hover:opacity-100">
                            Configure
                          </button>
                        </div>
                        {idx < stages.length - 1 && <div className="hidden lg:flex items-center text-slate-300"><ArrowRight size={18} /></div>}
                      </React.Fragment>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 p-6">
                  <div className="flex items-center justify-between mb-5">
                    <div><h3 className="text-sm font-bold text-slate-800">Approval Rules</h3><p className="text-xs text-slate-500 mt-0.5">Evaluated before each stage in order</p></div>
                    <button type="button" className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-medium hover:bg-indigo-700 transition-all"><Plus size={13} /> Add Rule</button>
                  </div>
                  <div className="space-y-3">
                    {rules.map((rule, idx) => (
                      <div key={rule.id} className={cn('flex items-start gap-4 p-4 rounded-xl border transition-all', rule.enabled ? 'border-indigo-100 bg-indigo-50/20' : 'border-slate-100 bg-slate-50 opacity-50')}>
                        <span className="w-5 h-5 rounded bg-slate-200 text-slate-600 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">{idx+1}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <p className="text-sm font-bold text-slate-800">{rule.name}</p>
                            <span className={cn('text-[9px] font-bold uppercase px-2 py-0.5 rounded tracking-wider',
                              rule.action==='auto_approve'?'bg-emerald-100 text-emerald-700':rule.action==='skip_stage'?'bg-sky-100 text-sky-700':'bg-amber-100 text-amber-700')}>
                              {rule.action==='auto_approve'?'Auto-approve':rule.action==='skip_stage'?'Skip stage':'Escalate'}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 font-mono bg-slate-100 px-2 py-1 rounded inline-block">IF {rule.condition}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Toggle enabled={rule.enabled} onChange={() => setRules((p) => p.map((r) => r.id===rule.id ? {...r,enabled:!r.enabled} : r))} />
                          <button type="button" className="p-1 text-slate-400 hover:text-indigo-600 transition-colors"><Edit2 size={13} /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 p-6">
                  <h3 className="text-sm font-bold text-slate-800 mb-4">Global Approval Settings</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[
                      { label:'Require rejection reason', sub:'Auditors must enter a reason when rejecting', val:reqReason, set:setReqReason },
                      { label:'Allow resubmission after rejection', sub:'Agents may resubmit (max 3 attempts)', val:allowResubmit, set:setAllowResubmit },
                      { label:'Two-level approval for Corporate', sub:'Corporate CAFs require Auditor + Admin', val:twoLevelCorp, set:setTwoLevelCorp },
                      { label:'Lock CAF during review', sub:'Prevent agents from editing while under audit', val:lockOnReview, set:setLockOnReview },
                    ].map(({ label, sub, val, set }) => (
                      <div key={label} className="flex items-start gap-3 p-4 rounded-xl border border-slate-100 bg-slate-50/50">
                        <div className="flex-1"><p className="text-sm font-semibold text-slate-800">{label}</p><p className="text-xs text-slate-500 mt-0.5">{sub}</p></div>
                        <Toggle enabled={val} onChange={() => set(!val)} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Error Codes */}
            {bizPage === 'error-codes' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {(['Critical','Warning','Info'] as ErrSeverity[]).map((sev) => {
                    const cnt = errorCodes.filter((ec) => ec.severity===sev && ec.active).length;
                    return (
                      <div key={sev} className={cn('p-4 rounded-xl border', sev==='Critical'?'border-rose-200 bg-rose-50':sev==='Warning'?'border-amber-200 bg-amber-50':'border-sky-200 bg-sky-50')}>
                        <p className={cn('text-2xl font-bold', sev==='Critical'?'text-rose-700':sev==='Warning'?'text-amber-700':'text-sky-700')}>{cnt}</p>
                        <p className={cn('text-xs font-bold uppercase tracking-wider mt-0.5', sev==='Critical'?'text-rose-600':sev==='Warning'?'text-amber-600':'text-sky-600')}>{sev}</p>
                      </div>
                    );
                  })}
                  <div className="p-4 rounded-xl border border-slate-200 bg-white">
                    <p className="text-2xl font-bold text-slate-700">{errorCodes.filter((ec)=>!ec.active).length}</p>
                    <p className="text-xs font-bold uppercase tracking-wider mt-0.5 text-slate-500">Disabled</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                  <button type="button" onClick={() => setEditingError({id:`EC${Date.now()}`,code:'',category:'Validation',message:'',detail:'',severity:'Warning',retryable:true,active:true})}
                    className="ml-auto flex items-center gap-1.5 px-3 py-2 bg-indigo-600 text-white rounded-lg text-xs font-medium hover:bg-indigo-700 transition-all"><Plus size={13}/> Add Code</button>
                </div>
                <RecordList<ErrorCode> rows={errorCodes} columns={['Code','Category','Message','Details','Severity','Retry','Active','Actions']}
                  search={ec => [ec.code, ec.message, ec.detail]}
                  filters={[{ label: 'Category', value: ec => ec.category }, { label: 'Severity', value: ec => ec.severity }]}
                  renderRow={ec => (
                    <tr key={ec.id} className={cn('hover:bg-slate-50 transition-colors', !ec.active && 'opacity-50')}>
                          <td className="px-5 py-3"><span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">{ec.code}</span></td>
                          <td className="px-5 py-3"><span className={cn('text-[10px] font-bold uppercase px-2 py-0.5 rounded tracking-wider', CAT_STYLE[ec.category])}>{ec.category}</span></td>
                          <td className="px-5 py-3"><p className="text-xs font-medium text-slate-800">{ec.message}</p></td><td><span className="block max-w-xs truncate text-xs text-slate-500" title={ec.detail}>{ec.detail}</span></td>
                          <td className="px-5 py-3"><span className={cn('text-[10px] font-bold uppercase px-2 py-0.5 rounded tracking-wider', SEV_STYLE[ec.severity])}>{ec.severity}</span></td>
                          <td className="px-5 py-3 text-center">{ec.retryable?<RefreshCw size={13} className="inline text-emerald-600"/>:<X size={13} className="inline text-slate-300"/>}</td>
                          <td className="px-5 py-3 text-center"><Toggle enabled={ec.active} onChange={() => setErrorCodes((p)=>p.map((e)=>e.id===ec.id?{...e,active:!e.active}:e))} /></td>
                          <td className="px-5 py-3 text-center"><button type="button" onClick={()=>setEditingError(ec)} className="p-1 text-slate-400 hover:text-indigo-600 transition-colors"><Edit2 size={13}/></button></td>
                        </tr>
                  )}
                />
              </div>
            )}

            {/* Notifications */}
            {bizPage === 'notifications' && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl border border-slate-200 p-6">
                  <h3 className="text-sm font-bold text-slate-800 mb-1">Channel Configuration</h3>
                  <p className="text-xs text-slate-500 mb-5">Global on/off per delivery channel. Disabling a channel suppresses it for all events.</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className={cn('p-5 rounded-xl border-2 transition-all', emailEnabled ? 'border-indigo-200 bg-indigo-50/30' : 'border-slate-200 bg-slate-50')}>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', emailEnabled?'bg-indigo-600 text-white':'bg-slate-200 text-slate-500')}><Mail size={15}/></div>
                          <p className="text-sm font-bold text-slate-800">Email</p>
                        </div>
                        <Toggle enabled={emailEnabled} onChange={()=>setEmailEnabled(!emailEnabled)} />
                      </div>
                      <label className="block text-xs text-slate-500 mb-1">Sender address</label>
                      <input type="text" value={senderEmail} onChange={(e)=>setSenderEmail(e.target.value)}
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-400"/>
                    </div>
                    <div className={cn('p-5 rounded-xl border-2 transition-all', smsEnabled?'border-emerald-200 bg-emerald-50/30':'border-slate-200 bg-slate-50')}>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', smsEnabled?'bg-emerald-600 text-white':'bg-slate-200 text-slate-500')}><Smartphone size={15}/></div>
                          <p className="text-sm font-bold text-slate-800">SMS</p>
                        </div>
                        <Toggle enabled={smsEnabled} onChange={()=>setSmsEnabled(!smsEnabled)} />
                      </div>
                      <label className="block text-xs text-slate-500 mb-1">Gateway ID</label>
                      <input type="text" value={smsGateway} onChange={(e)=>setSmsGateway(e.target.value)}
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-400"/>
                    </div>
                    <div className="p-5 rounded-xl border-2 border-amber-200 bg-amber-50/30">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center"><Bell size={15}/></div>
                          <p className="text-sm font-bold text-slate-800">In-App</p>
                        </div>
                        <Toggle enabled={true} onChange={()=>{}} />
                      </div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-slate-500">Daily digest</span>
                        <Toggle enabled={dailyDigest} onChange={()=>setDailyDigest(!dailyDigest)} />
                      </div>
                      {dailyDigest && <>
                        <label className="block text-xs text-slate-500 mb-1">Digest time</label>
                        <input type="time" value={digestTime} onChange={(e)=>setDigestTime(e.target.value)}
                          className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-400"/>
                      </>}
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-6">
                  <h3 className="text-sm font-bold text-slate-800 mb-1">Event Notification Rules</h3>
                  <p className="text-xs text-slate-500 mb-5">Configure channels and recipients per event type.</p>
                  <div className="space-y-3">
                    {notifEvents.map((ne) => {
                      const Icon = ne.icon;
                      return (
                        <div key={ne.id} className={cn('rounded-xl border p-4 transition-all', ne.enabled?'border-slate-200 bg-white':'border-slate-100 bg-slate-50 opacity-60')}>
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center shrink-0 mt-0.5"><Icon size={15}/></div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-4 mb-1.5">
                                <p className="text-sm font-bold text-slate-800">{ne.event}</p>
                                <Toggle enabled={ne.enabled} onChange={() => setNotifEvents((p)=>p.map((e)=>e.id===ne.id?{...e,enabled:!e.enabled}:e))} />
                              </div>
                              <p className="text-xs text-slate-500 mb-3">{ne.description}</p>
                              <div className="flex flex-wrap gap-6">
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Channels</span>
                                  {([['email','Email',Mail,'indigo'],['sms','SMS',Smartphone,'emerald'],['inApp','In-App',Bell,'amber']] as [keyof NotifChannel,string,React.ElementType,string][]).map(([ch,label,Ic,color])=>(
                                    <button key={ch} type="button" onClick={()=>setNotifEvents((p)=>p.map((e)=>e.id===ne.id?{...e,channels:{...e.channels,[ch]:!e.channels[ch]}}:e))}
                                      className={cn('flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border transition-all',
                                        ne.channels[ch]?`bg-${color}-100 border-${color}-200 text-${color}-700`:'bg-slate-100 border-slate-200 text-slate-400')}>
                                      <Ic size={9}/>{label}
                                    </button>
                                  ))}
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Recipients</span>
                                  {(['admin','auditor','agent','customer'] as RecipientGroup[]).map((r)=>(
                                    <button key={r} type="button"
                                      onClick={()=>setNotifEvents((p)=>p.map((e)=>{if(e.id!==ne.id)return e;const has=e.recipients.includes(r);return{...e,recipients:has?e.recipients.filter((x)=>x!==r):[...e.recipients,r]};}))}
                                      className={cn('px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border transition-all',
                                        ne.recipients.includes(r)?cn(RCPT_STYLE[r],'border-transparent'):'bg-slate-100 border-slate-200 text-slate-400')}>
                                      {r}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* ── ACCESS CONTROL ───────────────────────────────────────────────── */}
        {category === 'access' && (
          <motion.div key="access" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-4">
            <div className="flex gap-1 border-b border-slate-200">
              {([{id:'users' as AccessPage,label:'User Management',icon:Users},{id:'roles' as AccessPage,label:'Role Management',icon:Shield},{id:'permissions' as AccessPage,label:'Permission Matrix',icon:Key}]).map((t)=>(
                <button key={t.id} type="button" onClick={()=>setAccessPage(t.id)}
                  className={cn('flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all',
                    accessPage===t.id?'border-indigo-600 text-indigo-600':'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300')}>
                  <t.icon size={14}/>{t.label}
                </button>
              ))}
            </div>

            {accessPage === 'users' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-4">
                  <button type="button" onClick={()=>{setEditingUser({id:`USR-${Date.now()}`,username:'',password:'',role:'agent',fullName:'',email:'',department:'',permissions:ROLE_PERMISSIONS.agent,createdAt:new Date().toISOString(),isActive:true});setIsAddingUser(true);}}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-all">
                    <Plus size={14}/> Add User
                  </button>
                </div>
                <RecordList<User> rows={users} columns={['Name','Email','Username','Role','Department','Status','Actions']}
                  search={user => [user.fullName, user.email, user.username, user.department]}
                  filters={[{ label: 'Role', value: user => user.role, display: value => getRoleDisplayName(value as UserRole) }, { label: 'Status', value: user => user.isActive ? 'Active' : 'Inactive' }]}
                  renderRow={user => (
                    <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4"><p className="text-sm font-semibold text-slate-800">{user.fullName}</p></td><td>{user.email}</td><td>{user.username}</td>
                          <td className="px-6 py-4"><span className={cn('inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold uppercase',getRoleColor(user.role))}>{getRoleDisplayName(user.role)}</span></td>
                          <td className="px-6 py-4 text-sm text-slate-600">{user.department||'—'}</td>
                          <td className="px-6 py-4">{user.isActive?(<span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-100 text-emerald-700"><CheckCircle size={11}/>Active</span>):(<span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 text-slate-500">Inactive</span>)}</td>
                          <td className="px-6 py-4 text-right"><div className="flex items-center justify-end gap-2">
                            <button type="button" onClick={()=>{setEditingUser(user);setIsAddingUser(false);}} className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"><Edit2 size={14}/></button>
                            <button type="button" onClick={()=>setDeleteConfirm(user.id)} className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-all"><Trash2 size={14}/></button>
                          </div></td>
                        </tr>
                  )}
                />
              </div>
            )}

            {accessPage === 'roles' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {Object.entries(ROLE_PERMISSIONS).map(([role,permissions])=>(
                  <div key={role} className="bg-white rounded-xl border border-slate-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <span className={cn('inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-bold uppercase',getRoleColor(role as UserRole))}>{getRoleDisplayName(role as UserRole)}</span>
                      <Shield size={17} className="text-slate-400"/>
                    </div>
                    <p className="text-xs text-slate-500 mb-4">{role==='admin'?'Full system access and configuration':role==='agent'?'Create and manage CAF submissions':'Review and approve CAF applications'}</p>
                    <div className="space-y-1.5">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Permissions</p>
                      {Object.entries(permissions).map(([key,val])=>(
                        <div key={key} className="flex items-center justify-between text-xs">
                          <span className="text-slate-600">{key}</span>
                          {val?<CheckCircle size={13} className="text-emerald-600"/>:<X size={13} className="text-slate-300"/>}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {accessPage === 'permissions' && (
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <div className="flex items-center gap-3 p-4 bg-indigo-50 border border-indigo-100 rounded-lg mb-6">
                  <Info size={17} className="text-indigo-600 shrink-0"/>
                  <p className="text-sm text-indigo-700">Permission matrix across all roles. Changes take effect on next login.</p>
                </div>
                <RecordList rows={Object.keys(ROLE_PERMISSIONS.admin)}
                  columns={['Permission', 'Admin', 'Agent', 'Auditor']}
                  search={permission => [permission]}
                  renderRow={perm => (
                        <tr key={perm} className="hover:bg-slate-50">
                          <td className="px-4 py-3 text-sm text-slate-700 font-medium">{perm}</td>
                          {(['admin','agent','auditor'] as UserRole[]).map((r)=>(
                            <td key={r} className="px-4 py-3 text-center">
                              {ROLE_PERMISSIONS[r][perm as keyof Permission]?<CheckCircle size={14} className="inline text-emerald-600"/>:<X size={14} className="inline text-slate-300"/>}
                            </td>
                          ))}
                        </tr>
                      )}
                />
              </div>
            )}
          </motion.div>
        )}

        {/* ── INFRASTRUCTURE ───────────────────────────────────────────────── */}
        {category === 'infrastructure' && (
          <motion.div key="infrastructure" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex gap-1 border-b border-slate-200">
                {([{id:'storage' as InfraPage,label:'Data Storage',icon:Database},{id:'services' as InfraPage,label:'API Services',icon:Server},{id:'resources' as InfraPage,label:'System Resources',icon:Cpu}]).map((t)=>(
                  <button key={t.id} type="button" onClick={()=>setInfraPage(t.id)}
                    className={cn('flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all',
                      infraPage===t.id?'border-indigo-600 text-indigo-600':'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300')}>
                    <t.icon size={14}/>{t.label}
                  </button>
                ))}
              </div>
              <button type="button" onClick={refresh} className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700 transition-colors mb-1">
                <RefreshCw size={12}/> Refresh · {lastRefreshed.toLocaleTimeString()}
              </button>
            </div>

            {/* Storage nodes */}
            {infraPage === 'storage' && (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                {storage.map((s)=>(
                  <div key={s.id} className="bg-white rounded-xl border border-slate-200 p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={cn('text-[10px] font-bold uppercase px-2 py-0.5 rounded tracking-wider', TYPE_BADGE[s.type])}>{s.type}</span>
                          <StatusBadge status={s.status} />
                        </div>
                        <h3 className="text-base font-bold text-slate-800">{s.name}</h3>
                        <p className="text-xs text-slate-500 mt-0.5">{s.engine}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-slate-500">Uptime (30d)</p>
                        <p className={cn('text-lg font-bold', s.uptime>=99.9?'text-emerald-600':s.uptime>=99?'text-amber-600':'text-rose-600')}>{s.uptime}%</p>
                      </div>
                    </div>

                    <div className="mb-4">
                      <div className="flex items-center justify-between text-xs text-slate-600 mb-1.5">
                        <span className="font-semibold">Storage Usage ({s.storage.unit})</span>
                        <span>{s.storage.used} / {s.storage.total} {s.storage.unit}</span>
                      </div>
                      <StorageBar used={s.storage.used} total={s.storage.total} />
                    </div>

                    <div className="grid grid-cols-2 gap-x-6 gap-y-2 pt-3 border-t border-slate-100">
                      {s.metrics.map((m)=>(
                        <div key={m.label} className="flex items-center justify-between text-xs">
                          <span className="text-slate-500">{m.label}</span>
                          <span className={cn('font-bold text-slate-800', m.warn && 'text-amber-600')}>{m.value}{m.unit||''}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* API Services */}
            {infraPage === 'services' && (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { label:'Online',   count:services.filter(s=>s.status==='online').length,   color:'bg-emerald-100 text-emerald-700' },
                    { label:'Degraded', count:services.filter(s=>s.status==='degraded').length, color:'bg-amber-100 text-amber-700' },
                    { label:'Offline',  count:services.filter(s=>s.status==='offline').length,  color:'bg-rose-100 text-rose-700' },
                  ].map(({ label, count, color })=>(
                    <div key={label} className={cn('p-4 rounded-xl border-2', count>0&&label!=='Online'?'border-current':'border-slate-200 bg-white')}>
                      <p className={cn('text-2xl font-bold', color.split(' ')[1])}>{count}</p>
                      <p className={cn('text-xs font-bold uppercase tracking-wider mt-0.5', color.split(' ')[1])}>{label}</p>
                    </div>
                  ))}
                </div>

                <div className="space-y-3">
                  {services.map((svc)=>(
                    <div key={svc.id} className={cn('bg-white rounded-xl border p-5 transition-all',
                      svc.status==='offline'?'border-rose-200 bg-rose-50/30':svc.status==='degraded'?'border-amber-200 bg-amber-50/20':'border-slate-200')}>
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div className="flex items-center gap-3">
                          <StatusDot status={svc.status} size="md"/>
                          <div>
                            <p className="text-sm font-bold text-slate-800">{svc.name}</p>
                            <p className="text-xs text-slate-500">{svc.description}</p>
                          </div>
                        </div>
                        <StatusBadge status={svc.status}/>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-3 border-t border-slate-100">
                        {[
                          { label:'Avg Response', value: svc.status==='offline'?'—':`${svc.responseMs} ms`, warn:svc.responseMs>500&&svc.status!=='offline' },
                          { label:'Requests/min',  value: svc.status==='offline'?'—':`${svc.reqPerMin}`,    warn:false },
                          { label:'Uptime (7d)',   value:`${svc.uptime}%`,                                   warn:svc.uptime<99 },
                          { label:'Error rate',   value: svc.status==='offline'?'—':`${svc.errorRate}%`,    warn:svc.errorRate>1 },
                        ].map(({ label, value, warn })=>(
                          <div key={label}>
                            <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-0.5">{label}</p>
                            <p className={cn('text-sm font-bold', warn?svc.status==='offline'?'text-rose-600':'text-amber-600':'text-slate-800')}>{value}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* System Resources */}
            {infraPage === 'resources' && (
              <div className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* CPU */}
                  <div className="bg-white rounded-xl border border-slate-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center"><Cpu size={16}/></div>
                        <div><p className="text-sm font-bold text-slate-800">CPU</p><p className="text-[10px] text-slate-500">Intel Xeon 4-core · 3.2 GHz</p></div>
                      </div>
                      <span className={cn('text-2xl font-bold', resources.cpu.value>=85?'text-rose-600':resources.cpu.value>=70?'text-amber-600':'text-indigo-600')}>{resources.cpu.value.toFixed(0)}%</span>
                    </div>
                    <ResourceBar value={resources.cpu.value} max={resources.cpu.max}/>
                    <div className="grid grid-cols-3 gap-3 mt-4">
                      {[['User','52%'],['System','12%'],['I/O Wait','0%']].map(([l,v])=>(
                        <div key={l} className="text-center p-2 bg-slate-50 rounded-lg"><p className="text-[10px] text-slate-500">{l}</p><p className="text-xs font-bold text-slate-700">{v}</p></div>
                      ))}
                    </div>
                  </div>

                  {/* Memory */}
                  <div className="bg-white rounded-xl border border-slate-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-violet-100 text-violet-600 flex items-center justify-center"><MemoryStick size={16}/></div>
                        <div><p className="text-sm font-bold text-slate-800">Memory</p><p className="text-[10px] text-slate-500">DDR4 ECC · 24.4 GB total</p></div>
                      </div>
                      <span className="text-2xl font-bold text-slate-800">{resources.memory.value.toFixed(1)} <span className="text-sm font-normal text-slate-400">GB</span></span>
                    </div>
                    <ResourceBar value={resources.memory.value} max={resources.memory.max}/>
                    <div className="grid grid-cols-3 gap-3 mt-4">
                      {[['Used',`${resources.memory.value.toFixed(1)} GB`],['Cached','3.8 GB'],['Free',`${(resources.memory.max-resources.memory.value).toFixed(1)} GB`]].map(([l,v])=>(
                        <div key={l} className="text-center p-2 bg-slate-50 rounded-lg"><p className="text-[10px] text-slate-500">{l}</p><p className="text-xs font-bold text-slate-700">{v}</p></div>
                      ))}
                    </div>
                  </div>

                  {/* Disk */}
                  <div className="bg-white rounded-xl border border-slate-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-600 flex items-center justify-center"><HardDrive size={16}/></div>
                        <div><p className="text-sm font-bold text-slate-800">Disk</p><p className="text-[10px] text-slate-500">NVMe SSD RAID-1 · 200 GB</p></div>
                      </div>
                      <span className="text-2xl font-bold text-slate-800">{resources.disk.value.toFixed(0)} <span className="text-sm font-normal text-slate-400">GB</span></span>
                    </div>
                    <ResourceBar value={resources.disk.value} max={resources.disk.max} warn={60} danger={80}/>
                    <div className="grid grid-cols-3 gap-3 mt-4">
                      {[['Used',`${resources.disk.value.toFixed(0)} GB`],['Read','12 MB/s'],['Write','8 MB/s']].map(([l,v])=>(
                        <div key={l} className="text-center p-2 bg-slate-50 rounded-lg"><p className="text-[10px] text-slate-500">{l}</p><p className="text-xs font-bold text-slate-700">{v}</p></div>
                      ))}
                    </div>
                  </div>

                  {/* Network */}
                  <div className="bg-white rounded-xl border border-slate-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center"><Wifi size={16}/></div>
                        <div><p className="text-sm font-bold text-slate-800">Network</p><p className="text-[10px] text-slate-500">1 Gbps uplink · dual NIC</p></div>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-slate-500">Tx / Rx</p>
                        <p className="text-sm font-bold text-slate-800">{resources.netTx.value.toFixed(1)} / {resources.netRx.value.toFixed(1)} <span className="text-xs font-normal text-slate-400">MB/s</span></p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-xs text-slate-500 mb-1"><span>Transmit (Tx)</span><span className="font-bold text-slate-700">{resources.netTx.value.toFixed(1)} MB/s</span></div>
                        <ResourceBar value={resources.netTx.value} max={resources.netTx.max} warn={50} danger={80}/>
                      </div>
                      <div>
                        <div className="flex justify-between text-xs text-slate-500 mb-1"><span>Receive (Rx)</span><span className="font-bold text-slate-700">{resources.netRx.value.toFixed(1)} MB/s</span></div>
                        <ResourceBar value={resources.netRx.value} max={resources.netRx.max} warn={50} danger={80}/>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3 mt-4">
                      {[['Connections','42'],['Dropped pkts','0'],['Latency','4 ms']].map(([l,v])=>(
                        <div key={l} className="text-center p-2 bg-slate-50 rounded-lg"><p className="text-[10px] text-slate-500">{l}</p><p className="text-xs font-bold text-slate-700">{v}</p></div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Process table */}
                <div className="bg-white rounded-xl border border-slate-200 p-6">
                  <h3 className="text-sm font-bold text-slate-800 mb-4">Active Server Processes</h3>
                  <RecordList rows={[
                        ['node server/index.mjs',   '4000', '1.2%',  '68 MB',  '3d 14h'],
                        ['postgres (main)',           '5432', '3.4%',  '182 MB', '7d 02h'],
                        ['mongod',                    '27017','2.1%',  '312 MB', '7d 02h'],
                        ['minio',                    '9000', '0.8%',  '88 MB',  '7d 02h'],
                        ['redis-server',              '6379', '0.2%',  '128 MB', '7d 02h'],
                        ['nginx',                    '80',   '0.1%',  '12 MB',  '7d 02h'],
                      ]}
                    columns={['Process', 'PID', 'CPU', 'Memory', 'Uptime']}
                    search={row => row}
                    renderRow={([name, pid, cpu, mem, up]) => (
                        <tr key={pid} className="hover:bg-slate-50">
                          <td className="py-2 font-mono text-slate-700">{name}</td>
                          <td className="py-2 text-right text-slate-500 font-mono">{pid}</td>
                          <td className="py-2 text-right font-bold text-slate-700">{cpu}</td>
                          <td className="py-2 text-right text-slate-600">{mem}</td>
                          <td className="py-2 text-right text-emerald-600 font-medium">{up}</td>
                        </tr>
                    )}
                  />
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── MODALS ───────────────────────────────────────────────────────── */}

      {/* Edit/Add User */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <motion.div initial={{ opacity:0, scale:0.95 }} animate={{ opacity:1, scale:1 }} className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-800">{isAddingUser?'Add New User':'Edit User'}</h3>
              <button type="button" onClick={()=>{setEditingUser(null);setIsAddingUser(false);}} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg transition-all"><X size={17}/></button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {[{label:'Username',key:'username',type:'text'},{label:'Password',key:'password',type:'password'}].map(({label,key,type})=>(
                  <div key={key}>
                    <label className="block text-xs font-bold text-slate-600 mb-2">{label}</label>
                    <input type={type} value={(editingUser as any)[key]} onChange={(e)=>setEditingUser({...editingUser,[key]:e.target.value})}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"/>
                  </div>
                ))}
              </div>
              {[{label:'Full Name',key:'fullName',type:'text'},{label:'Email',key:'email',type:'email'},{label:'Department',key:'department',type:'text'}].map(({label,key,type})=>(
                <div key={key}>
                  <label className="block text-xs font-bold text-slate-600 mb-2">{label}</label>
                  <input type={type} value={(editingUser as any)[key]||''} onChange={(e)=>setEditingUser({...editingUser,[key]:e.target.value})}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"/>
                </div>
              ))}
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-2">Role</label>
                <div className="grid grid-cols-3 gap-3">
                  {(['admin','agent','auditor'] as UserRole[]).map((role)=>(
                    <button key={role} type="button" onClick={()=>setEditingUser({...editingUser,role,permissions:ROLE_PERMISSIONS[role]})}
                      className={cn('px-4 py-3 rounded-lg text-sm font-bold uppercase transition-all border-2',editingUser.role===role?'border-indigo-600 bg-indigo-50 text-indigo-700':'border-slate-200 bg-white text-slate-600 hover:border-slate-300')}>
                      {getRoleDisplayName(role)}
                    </button>
                  ))}
                </div>
              </div>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={editingUser.isActive} onChange={(e)=>setEditingUser({...editingUser,isActive:e.target.checked})} className="w-4 h-4 text-indigo-600 border-slate-300 rounded"/>
                <span className="text-sm font-medium text-slate-700">Active User</span>
              </label>
            </div>
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3">
              <button type="button" onClick={()=>{setEditingUser(null);setIsAddingUser(false);}} className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-all">Cancel</button>
              <button type="button" onClick={()=>{if(!editingUser)return;if(isAddingUser){setUsers([...users,editingUser]);}else{setUsers(users.map((u)=>u.id===editingUser.id?editingUser:u));}setEditingUser(null);setIsAddingUser(false);}}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-all"><Save size={14}/>Save</button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <motion.div initial={{ opacity:0, scale:0.95 }} animate={{ opacity:1, scale:1 }} className="bg-white rounded-2xl w-full max-w-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center"><AlertCircle size={22} className="text-rose-600"/></div>
              <div><h3 className="text-lg font-bold text-slate-800">Delete User</h3><p className="text-sm text-slate-500">This action cannot be undone</p></div>
            </div>
            <p className="text-sm text-slate-600 mb-6">Are you sure you want to delete this user? All associated data will be permanently removed.</p>
            <div className="flex items-center justify-end gap-3">
              <button type="button" onClick={()=>setDeleteConfirm(null)} className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-all">Cancel</button>
              <button type="button" onClick={()=>{setUsers(users.filter((u)=>u.id!==deleteConfirm));setDeleteConfirm(null);}} className="px-4 py-2 bg-rose-600 text-white rounded-lg text-sm font-medium hover:bg-rose-700 transition-all">Delete</button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Edit error code */}
      {editingError && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <motion.div initial={{ opacity:0, scale:0.95 }} animate={{ opacity:1, scale:1 }} className="bg-white rounded-2xl w-full max-w-lg overflow-hidden flex flex-col">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-800">{errorCodes.some(ec=>ec.id===editingError.id)?'Edit Error Code':'New Error Code'}</h3>
              <button type="button" onClick={()=>setEditingError(null)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg"><X size={17}/></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-xs font-bold text-slate-600 mb-2">Error Code</label>
                  <input type="text" value={editingError.code} onChange={(e)=>setEditingError({...editingError,code:e.target.value})} placeholder="ERR-XXXX"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"/></div>
                <div><label className="block text-xs font-bold text-slate-600 mb-2">Category</label>
                  <select value={editingError.category} onChange={(e)=>setEditingError({...editingError,category:e.target.value as ErrCategory})}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                    {(['Validation','Document','Network','System','Integration','Authentication'] as ErrCategory[]).map((c)=><option key={c} value={c}>{c}</option>)}
                  </select></div>
              </div>
              <div><label className="block text-xs font-bold text-slate-600 mb-2">Message</label>
                <input type="text" value={editingError.message} onChange={(e)=>setEditingError({...editingError,message:e.target.value})}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"/></div>
              <div><label className="block text-xs font-bold text-slate-600 mb-2">Detail</label>
                <textarea value={editingError.detail} onChange={(e)=>setEditingError({...editingError,detail:e.target.value})} rows={2}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"/></div>
              <div className="grid grid-cols-3 gap-4">
                <div><label className="block text-xs font-bold text-slate-600 mb-2">Severity</label>
                  <select value={editingError.severity} onChange={(e)=>setEditingError({...editingError,severity:e.target.value as ErrSeverity})}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                    {(['Critical','Warning','Info'] as ErrSeverity[]).map((s)=><option key={s} value={s}>{s}</option>)}
                  </select></div>
                <div className="flex items-end pb-2"><label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={editingError.retryable} onChange={(e)=>setEditingError({...editingError,retryable:e.target.checked})} className="w-4 h-4 text-indigo-600 border-slate-300 rounded"/>
                  <span className="text-sm font-medium text-slate-700">Retryable</span></label></div>
                <div className="flex items-end pb-2"><label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={editingError.active} onChange={(e)=>setEditingError({...editingError,active:e.target.checked})} className="w-4 h-4 text-indigo-600 border-slate-300 rounded"/>
                  <span className="text-sm font-medium text-slate-700">Active</span></label></div>
              </div>
            </div>
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-3">
              <button type="button" onClick={()=>setEditingError(null)} className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50">Cancel</button>
              <button type="button" onClick={()=>{const exists=errorCodes.some(ec=>ec.id===editingError.id);if(exists){setErrorCodes(p=>p.map(ec=>ec.id===editingError.id?editingError:ec));}else{setErrorCodes(p=>[editingError,...p]);}setEditingError(null);}}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700"><Save size={14}/>Save</button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Configure stage */}
      {editingStage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <motion.div initial={{ opacity:0, scale:0.95 }} animate={{ opacity:1, scale:1 }} className="bg-white rounded-2xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-800">Configure Stage</h3>
              <button type="button" onClick={()=>setEditingStage(null)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg"><X size={17}/></button>
            </div>
            <div className="p-6 space-y-4">
              <div><label className="block text-xs font-bold text-slate-600 mb-2">Stage Name</label>
                <input type="text" value={editingStage.name} onChange={(e)=>setEditingStage({...editingStage,name:e.target.value})}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"/></div>
              <div><label className="block text-xs font-bold text-slate-600 mb-2">Assigned Role</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['admin','agent','auditor'] as UserRole[]).map((role)=>(
                    <button key={role} type="button" onClick={()=>setEditingStage({...editingStage,role})}
                      className={cn('py-2 rounded-lg text-xs font-bold uppercase transition-all border-2',editingStage.role===role?'border-indigo-600 bg-indigo-50 text-indigo-700':'border-slate-200 bg-white text-slate-600')}>
                      {getRoleDisplayName(role)}
                    </button>
                  ))}
                </div>
              </div>
              <div><label className="block text-xs font-bold text-slate-600 mb-2">SLA (hours)</label>
                <input type="number" min={1} max={240} value={editingStage.slaHours} onChange={(e)=>setEditingStage({...editingStage,slaHours:Number(e.target.value)})}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"/></div>
              {[
                {label:'Required stage',key:'required' as const,sub:'Cannot be skipped by rules'},
                {label:'Auto-escalate on SLA breach',key:'autoEscalate' as const,sub:'Notify escalation role when SLA exceeded'},
              ].map(({label,key,sub})=>(
                <div key={key} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div><p className="text-sm font-medium text-slate-700">{label}</p><p className="text-xs text-slate-500">{sub}</p></div>
                  <Toggle enabled={editingStage[key]} onChange={()=>setEditingStage({...editingStage,[key]:!editingStage[key]})}/>
                </div>
              ))}
            </div>
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-3">
              <button type="button" onClick={()=>setEditingStage(null)} className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50">Cancel</button>
              <button type="button" onClick={()=>{setStages(p=>p.map(s=>s.id===editingStage.id?editingStage:s));setEditingStage(null);}}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700"><Save size={14}/>Save</button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
