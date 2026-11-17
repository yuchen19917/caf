import type { CustomerApplicationForm, CAFTemplate, PrepaidTemplate } from '../types';
import type { ArchivedLibraryFile } from '../context/ApplicationContext';

export const prepaidTemplateApi = {
  get: (signal?: AbortSignal) => request<PrepaidTemplate>('/prepaid-template', { signal }),
  publish: (draft: PrepaidTemplate) =>
    request<PrepaidTemplate>('/prepaid-template', { method: 'PUT', body: JSON.stringify(draft) }),
};

const BASE = '/api';

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${url}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

// ── CAFs ───────────────────────────────────────────────────────────────────────
export const cafApi = {
  getAll: () => request<{ cafs: CustomerApplicationForm[]; archiveEntries: any[] }>('/cafs'),
  create: (data: Partial<CustomerApplicationForm>) =>
    request<CustomerApplicationForm>('/cafs', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Partial<CustomerApplicationForm>) =>
    request<CustomerApplicationForm>(`/cafs/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  archive: (id: string) =>
    request<{ caf: CustomerApplicationForm; entry: ArchivedLibraryFile | null }>(`/cafs/${id}/archive`, { method: 'POST' }),
  approve: (id: string) => request<CustomerApplicationForm>(`/cafs/${id}/approve`, { method: 'POST' }),
  remove: (id: string) =>
    request<{ ok: boolean }>(`/cafs/${id}`, { method: 'DELETE' }),
};

// ── Templates ─────────────────────────────────────────────────────────────────
export const templateApi = {
  getAll: () => request<{ templates: CAFTemplate[] }>('/templates'),
  create: (data: Partial<CAFTemplate>) =>
    request<CAFTemplate>('/templates', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Partial<CAFTemplate>) =>
    request<CAFTemplate>(`/templates/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  remove: (id: string) =>
    request<{ ok: boolean }>(`/templates/${id}`, { method: 'DELETE' }),
};

// ── Connectivity ──────────────────────────────────────────────────────────────
export interface ConnectivityConfig {
  systemId: string;
  protocol: 'REST' | 'SOAP' | 'SFTP' | 'JDBC' | 'AMQP' | 'SMTP';
  authMethod: 'api_key' | 'oauth2' | 'basic' | 'mtls' | 'none';
  endpoint: string;
  timeout: number;
  retryCount: number;
  sslEnabled: boolean;
  // auth fields (shown masked)
  apiKey?: string;
  apiKeyHeader?: string;
  basicUser?: string;
  basicPassword?: string;
  clientId?: string;
  clientSecret?: string;
  tokenUrl?: string;
  scope?: string;
  clientCert?: string;
  caCert?: string;
  // SOAP specific
  wsdlUrl?: string;
  soapAction?: string;
  // test result
  lastTested?: string;
  testStatus?: 'passed' | 'failed' | 'unknown';
  testError?: string;
}

export const connectivityApi = {
  getAll: () => request<{ systems: ConnectivityConfig[] }>('/connectivity'),
  update: (systemId: string, data: Partial<ConnectivityConfig>) =>
    request<ConnectivityConfig>(`/connectivity/${systemId}`, { method: 'PUT', body: JSON.stringify(data) }),
  test: (systemId: string) =>
    request<{ status: string; testedAt: string; latencyMs: number | null; error: string | null }>(
      `/connectivity/${systemId}/test`,
      { method: 'POST' }
    ),
};

// ── Stats ─────────────────────────────────────────────────────────────────────
export const statsApi = {
  get: () => request<Record<string, number>>('/stats'),
};
