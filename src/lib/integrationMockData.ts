export type IntegrationStatus = 'online' | 'degraded' | 'offline';
export type EventSeverity = 'success' | 'warning' | 'error' | 'info';

export interface IntegrationSystem {
  id: string;
  name: string;
  shortName: string;
  description: string;
  category: 'crm' | 'billing' | 'provisioning' | 'numbering' | 'regulatory' | 'identity';
  status: IntegrationStatus;
  lastSync: string;
  pendingJobs: number;
  successRate: number; // percentage
  apiEndpoint: string;
  version: string;
  vendor: string;
}

export interface IntegrationEvent {
  id: string;
  systemId: string;
  cafId?: string;
  customerName?: string;
  timestamp: string;
  severity: EventSeverity;
  message: string;
  details?: string;
  transactionId?: string;
}

export interface IntegrationMetric {
  label: string;
  value: string | number;
  unit?: string;
  trend?: 'up' | 'down' | 'flat';
}

export const INTEGRATION_SYSTEMS: IntegrationSystem[] = [
  {
    id: 'crm',
    name: 'ATOMA CRM Core',
    shortName: 'CRM',
    description: 'Customer relationship management — master customer profile, subscription lifecycle, account hierarchy',
    category: 'crm',
    status: 'online',
    lastSync: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
    pendingJobs: 2,
    successRate: 99.2,
    apiEndpoint: 'https://crm-api.atoma.af/v3',
    version: 'v3.4.1',
    vendor: 'ATOMA Internal',
  },
  {
    id: 'billing',
    name: 'BSS Billing Engine',
    shortName: 'BSS',
    description: 'Business support system — tariff configuration, invoice generation, payment reconciliation, credit control',
    category: 'billing',
    status: 'online',
    lastSync: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
    pendingJobs: 5,
    successRate: 98.7,
    apiEndpoint: 'https://bss.atoma.af/api/v2',
    version: 'v2.9.0',
    vendor: 'Amdocs',
  },
  {
    id: 'provisioning',
    name: 'Network Provisioning',
    shortName: 'NP',
    description: 'OSS layer — SIM card activation, FTTX port provisioning, radio resource allocation, service QoS configuration',
    category: 'provisioning',
    status: 'online',
    lastSync: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    pendingJobs: 3,
    successRate: 97.4,
    apiEndpoint: 'https://oss.atoma.af/nms/v1',
    version: 'v1.12.3',
    vendor: 'Huawei OSS',
  },
  {
    id: 'numbering',
    name: 'Number Management (NMS)',
    shortName: 'NMS',
    description: 'MSISDN pool management, number portability, short-code allocation, DID range inventory',
    category: 'numbering',
    status: 'online',
    lastSync: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    pendingJobs: 0,
    successRate: 99.9,
    apiEndpoint: 'https://nms.atoma.af/api',
    version: 'v4.1.0',
    vendor: 'ATOMA Internal',
  },
  {
    id: 'ntra',
    name: 'NTRA Regulatory Portal',
    shortName: 'NTRA',
    description: 'Afghanistan Telecom Regulatory Authority — SIM registration compliance, KYC submission, regulatory reporting',
    category: 'regulatory',
    status: 'degraded',
    lastSync: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    pendingJobs: 14,
    successRate: 89.1,
    apiEndpoint: 'https://portal.ntra.gov.af/api/v1',
    version: 'v1.3.0',
    vendor: 'NTRA Afghanistan',
  },
  {
    id: 'kyc',
    name: 'eKYC / Tazkira Verify',
    shortName: 'KYC',
    description: 'National ID (Tazkira) biometric verification, face-match, anti-money laundering (AML) watchlist check',
    category: 'identity',
    status: 'online',
    lastSync: new Date(Date.now() - 1 * 60 * 1000).toISOString(),
    pendingJobs: 1,
    successRate: 99.5,
    apiEndpoint: 'https://kyc.e-tazkira.gov.af/verify/v2',
    version: 'v2.0.4',
    vendor: 'NID Authority of Afghanistan',
  },
];

function ago(minutes: number) {
  return new Date(Date.now() - minutes * 60 * 1000).toISOString();
}

export const INTEGRATION_EVENTS: IntegrationEvent[] = [
  // CRM events
  {
    id: 'ev-001',
    systemId: 'crm',
    cafId: 'CAF-2026-012',
    customerName: 'Ahmad Karimi',
    timestamp: ago(1),
    severity: 'success',
    message: 'Customer profile created successfully',
    details: 'UUID: CRM-AF-7821934 | Segment: Retail Prepaid | Region: Kabul',
    transactionId: 'TXN-CRM-20260507-7821',
  },
  {
    id: 'ev-002',
    systemId: 'crm',
    cafId: 'CAF-2026-011',
    customerName: 'Fahima Noori',
    timestamp: ago(3),
    severity: 'success',
    message: 'Corporate account linked to parent group',
    details: 'Parent: ROSHAN GROUP | Accounts: 3 sub-accounts mapped',
    transactionId: 'TXN-CRM-20260507-7820',
  },
  {
    id: 'ev-003',
    systemId: 'crm',
    cafId: 'CAF-2026-009',
    customerName: 'Abdul Rahman Wali',
    timestamp: ago(12),
    severity: 'warning',
    message: 'Duplicate customer profile detected — manual review required',
    details: 'Existing profile CRM-AF-6641022 shares same Tazkira number',
    transactionId: 'TXN-CRM-20260507-7819',
  },
  {
    id: 'ev-004',
    systemId: 'crm',
    timestamp: ago(25),
    severity: 'info',
    message: 'Bulk sync: 47 records updated from CAF registry',
    details: 'Status updates propagated for Approved/Archived CAFs',
  },
  // BSS Billing events
  {
    id: 'ev-005',
    systemId: 'billing',
    cafId: 'CAF-2026-012',
    customerName: 'Ahmad Karimi',
    timestamp: ago(1),
    severity: 'success',
    message: 'Billing account provisioned — Prepaid 50GB Elite plan activated',
    details: 'Plan: ATM-PRE-50GB | Cycle: Monthly | Balance: AFN 200 credit',
    transactionId: 'TXN-BSS-20260507-4421',
  },
  {
    id: 'ev-006',
    systemId: 'billing',
    cafId: 'CAF-2026-007',
    customerName: 'Herat Cement Co.',
    timestamp: ago(6),
    severity: 'success',
    message: 'Enterprise postpaid contract activated — DIA-ILL 100Mbps',
    details: 'MRC: USD 1,200 | Contract: 24 months | Static IPs: 5 allocated',
    transactionId: 'TXN-BSS-20260507-4420',
  },
  {
    id: 'ev-007',
    systemId: 'billing',
    timestamp: ago(18),
    severity: 'warning',
    message: 'Invoice generation delayed — ERP sync timeout',
    details: 'Retrying in 15 min | Affected accounts: 3',
  },
  {
    id: 'ev-008',
    systemId: 'billing',
    cafId: 'CAF-2026-005',
    customerName: 'Safia Rahimi',
    timestamp: ago(35),
    severity: 'error',
    message: 'Payment method validation failed — card declined',
    details: 'Postpaid security deposit AFN 500 rejected | Manual collection required',
    transactionId: 'TXN-BSS-20260507-4419',
  },
  // Provisioning events
  {
    id: 'ev-009',
    systemId: 'provisioning',
    cafId: 'CAF-2026-012',
    customerName: 'Ahmad Karimi',
    timestamp: ago(1),
    severity: 'success',
    message: 'SIM card activated on 4G/LTE network — IMSI linked',
    details: 'MSISDN: +93 70 456 7890 | IMSI: 412200987654321 | BTS: Kabul-Karte3-04',
    transactionId: 'TXN-NP-20260507-9901',
  },
  {
    id: 'ev-010',
    systemId: 'provisioning',
    cafId: 'CAF-2026-007',
    customerName: 'Herat Cement Co.',
    timestamp: ago(6),
    severity: 'success',
    message: 'FTTX fiber port provisioned — ONT online',
    details: 'OLT: Herat-Ind-OLT02 | Port: 0/4/7 | Speed: 100/100 Mbps | ONT: Huawei EG8145V5',
    transactionId: 'TXN-NP-20260507-9900',
  },
  {
    id: 'ev-011',
    systemId: 'provisioning',
    cafId: 'CAF-2026-010',
    customerName: 'Mazar Trading Group',
    timestamp: ago(22),
    severity: 'warning',
    message: 'Fixed Wi-Fi CPE dispatch pending — warehouse stock low',
    details: 'Device model: Huawei B618 | Expected dispatch: 2 business days',
  },
  {
    id: 'ev-012',
    systemId: 'provisioning',
    timestamp: ago(48),
    severity: 'info',
    message: 'Network maintenance: Kandahar cluster rebooted',
    details: '14 active sessions re-authenticated | No service impact reported',
  },
  // Number Management events
  {
    id: 'ev-013',
    systemId: 'numbering',
    cafId: 'CAF-2026-012',
    customerName: 'Ahmad Karimi',
    timestamp: ago(1),
    severity: 'success',
    message: 'MSISDN +93 70 456 7890 allocated from Kabul pool',
    details: 'Pool: ATM-KBL-070 | Range: 456-7000 to 456-7999 | Remaining: 847',
    transactionId: 'TXN-NMS-20260507-2201',
  },
  {
    id: 'ev-014',
    systemId: 'numbering',
    timestamp: ago(90),
    severity: 'info',
    message: 'Number range audit completed — Herat 079 pool',
    details: 'Total: 10,000 | Allocated: 7,241 | Available: 2,759 | Reserved: 312',
  },
  // NTRA Regulatory events
  {
    id: 'ev-015',
    systemId: 'ntra',
    cafId: 'CAF-2026-012',
    customerName: 'Ahmad Karimi',
    timestamp: ago(4),
    severity: 'warning',
    message: 'NTRA KYC submission queued — portal response slow',
    details: 'Queue position: 14 | Estimated processing: 30–45 min | Ref: NTRA-2026-18874',
  },
  {
    id: 'ev-016',
    systemId: 'ntra',
    cafId: 'CAF-2026-011',
    customerName: 'Fahima Noori',
    timestamp: ago(20),
    severity: 'success',
    message: 'SIM registration confirmed by NTRA — compliant',
    details: 'NTRA Ref: NTRA-2026-18860 | Tazkira NID verified | Blacklist: Clear',
    transactionId: 'NTRA-2026-18860',
  },
  {
    id: 'ev-017',
    systemId: 'ntra',
    timestamp: ago(45),
    severity: 'error',
    message: 'Regulatory batch report rejected — missing provincial codes',
    details: 'Report ID: NTRA-RPT-2026-Q2-07 | Fix required: province_code field',
  },
  {
    id: 'ev-018',
    systemId: 'ntra',
    timestamp: ago(60),
    severity: 'info',
    message: 'Monthly SIM registration summary submitted to NTRA',
    details: 'Period: April 2026 | New registrations: 1,247 | Deactivations: 89',
  },
  // KYC events
  {
    id: 'ev-019',
    systemId: 'kyc',
    cafId: 'CAF-2026-012',
    customerName: 'Ahmad Karimi',
    timestamp: ago(2),
    severity: 'success',
    message: 'Tazkira biometric verification passed — face match 97.3%',
    details: 'NID: T-20481922 | AML check: Clear | PEP check: Clear | Score: 97.3%',
    transactionId: 'KYC-20260507-5521',
  },
  {
    id: 'ev-020',
    systemId: 'kyc',
    cafId: 'CAF-2026-009',
    customerName: 'Abdul Rahman Wali',
    timestamp: ago(14),
    severity: 'warning',
    message: 'Face match score below threshold — manual review triggered',
    details: 'Score: 71.2% (threshold: 85%) | Document quality: Poor lighting | Manual: Required',
    transactionId: 'KYC-20260507-5519',
  },
  {
    id: 'ev-021',
    systemId: 'kyc',
    cafId: 'CAF-2026-006',
    customerName: 'Najiba Ahmadzai',
    timestamp: ago(30),
    severity: 'success',
    message: 'AML/CFT watchlist check completed — no match found',
    details: 'UN Sanctions: Clear | Interpol: Clear | Local watchlist: Clear',
    transactionId: 'KYC-20260507-5515',
  },
];

export const SYSTEM_METRICS: Record<string, IntegrationMetric[]> = {
  crm: [
    { label: 'Total Customers', value: '48,291', trend: 'up' },
    { label: 'New This Month', value: '1,247', trend: 'up' },
    { label: 'Active Subscriptions', value: '44,812', trend: 'up' },
    { label: 'API Latency (avg)', value: '142', unit: 'ms', trend: 'flat' },
    { label: 'Success Rate', value: '99.2', unit: '%', trend: 'flat' },
    { label: 'Pending Syncs', value: 2, trend: 'flat' },
  ],
  billing: [
    { label: 'Active Accounts', value: '44,812', trend: 'up' },
    { label: 'Revenue MTD', value: 'AFN 12.4M', trend: 'up' },
    { label: 'Pending Invoices', value: 5, trend: 'flat' },
    { label: 'Failed Payments', value: 3, trend: 'down' },
    { label: 'API Latency (avg)', value: '280', unit: 'ms', trend: 'up' },
    { label: 'Reconciliation', value: '98.7', unit: '%', trend: 'flat' },
  ],
  provisioning: [
    { label: 'Active SIMs', value: '38,471', trend: 'up' },
    { label: 'FTTX Ports Active', value: '6,341', trend: 'up' },
    { label: 'Pending Activations', value: 3, trend: 'flat' },
    { label: 'Network Uptime', value: '99.91', unit: '%', trend: 'flat' },
    { label: 'CPE Dispatches', value: '14 today', trend: 'flat' },
    { label: 'Avg. Activation Time', value: '4.2', unit: 'min', trend: 'down' },
  ],
  numbering: [
    { label: 'Total Pool', value: '200,000', trend: 'flat' },
    { label: 'Allocated', value: '148,721', trend: 'up' },
    { label: 'Available', value: '51,279', trend: 'down' },
    { label: 'Reserved', value: '2,100', trend: 'flat' },
    { label: 'Ported In (MTD)', value: '47', trend: 'up' },
    { label: 'Ported Out (MTD)', value: '12', trend: 'flat' },
  ],
  ntra: [
    { label: 'Compliant Registrations', value: '47,044', trend: 'up' },
    { label: 'Pending Submissions', value: 14, trend: 'up' },
    { label: 'Rejected by NTRA', value: 3, trend: 'flat' },
    { label: 'Portal Uptime', value: '89.1', unit: '%', trend: 'down' },
    { label: 'Last Report Submitted', value: 'Apr 2026', trend: 'flat' },
    { label: 'Compliance Rate', value: '97.8', unit: '%', trend: 'flat' },
  ],
  kyc: [
    { label: 'Verifications Today', value: 37, trend: 'up' },
    { label: 'Passed', value: 35, trend: 'up' },
    { label: 'Failed / Review', value: 2, trend: 'flat' },
    { label: 'Avg. Match Score', value: '94.1', unit: '%', trend: 'flat' },
    { label: 'AML Alerts (MTD)', value: 0, trend: 'flat' },
    { label: 'API Response', value: '380', unit: 'ms', trend: 'flat' },
  ],
};

export function getEventsForSystem(systemId: string): IntegrationEvent[] {
  return INTEGRATION_EVENTS.filter(e => e.systemId === systemId);
}

export function getEventsForCAF(cafId: string): IntegrationEvent[] {
  return INTEGRATION_EVENTS.filter(e => e.cafId === cafId);
}
