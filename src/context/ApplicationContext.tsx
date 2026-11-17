import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { CustomerApplicationForm } from '../types';
import { buildCafFromForm, mergeCafCorrection, type CAFFormShape } from '../lib/cafFromForm';
import type { User } from '../lib/auth';
import { cafApi } from '../lib/api';

export type ArchivedLibraryFile = {
  id: string;
  name: string;
  size: string;
  archivedAt: string;
  type: 'pdf' | 'image';
  status: 'verified' | 'pending' | 'approved' | 'rejected';
  cafId: string;
};

type ApplicationContextValue = {
  cafs: CustomerApplicationForm[];
  archiveEntries: ArchivedLibraryFile[];
  loading: boolean;
  addApplicationFromForm: (form: CAFFormShape, user: User) => Promise<CustomerApplicationForm>;
  submitTemplateApplication: (application: Partial<CustomerApplicationForm>, cafId?: string) => Promise<CustomerApplicationForm>;
  resubmitCorrection: (cafId: string, form: CAFFormShape, user: User) => Promise<CustomerApplicationForm>;
  approveAndArchive: (cafId: string) => Promise<void>;
  approveCAF: (cafId: string) => Promise<void>;
  rejectCAF: (cafId: string) => Promise<void>;
  requestCorrection: (cafId: string, correction?: CustomerApplicationForm['correction']) => Promise<void>;
  deleteCAF: (cafId: string) => Promise<void>;
  getFilteredCAFs: (user: User | null) => CustomerApplicationForm[];
  refresh: () => Promise<void>;
};

const ApplicationContext = createContext<ApplicationContextValue | null>(null);

export function ApplicationProvider({ children }: { children: React.ReactNode }) {
  const [cafs, setCafs] = useState<CustomerApplicationForm[]>([]);
  const [archiveEntries, setArchiveEntries] = useState<ArchivedLibraryFile[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const data = await cafApi.getAll();
      setCafs(data.cafs || []);
      setArchiveEntries(data.archiveEntries || []);
    } catch (e) {
      console.error('[CAF] Failed to load from server:', e);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    refresh().finally(() => setLoading(false));
  }, [refresh]);

  const addApplicationFromForm = useCallback(async (form: CAFFormShape, user: User): Promise<CustomerApplicationForm> => {
    // Build the CAF locally to generate fields, then send to server
    const skeleton = buildCafFromForm(form, cafs);
    const payload: CustomerApplicationForm = {
      ...skeleton,
      createdBy: user.id,
      createdByUsername: user.username,
    };
    // Remove the auto-id; server will assign a real one
    const { id: _id, ...body } = payload;
    const created = await cafApi.create(body);
    setCafs(prev => [created, ...prev]);
    return created;
  }, [cafs]);

  const submitTemplateApplication = useCallback(async (application: Partial<CustomerApplicationForm>, cafId?: string) => {
    const saved = cafId
      ? await cafApi.update(cafId, { ...application, status: 'Pending', submissionDate: new Date().toISOString() })
      : await cafApi.create({ ...application, status: 'Pending', submissionDate: new Date().toISOString() });
    setCafs(previous => cafId
      ? previous.map(item => item.id === cafId ? saved : item)
      : [saved, ...previous]);
    return saved;
  }, []);

  const resubmitCorrection = useCallback(async (cafId: string, form: CAFFormShape, user: User): Promise<CustomerApplicationForm> => {
    const prev = cafs.find(c => c.id === cafId);
    if (!prev) {
      return addApplicationFromForm(form, user);
    }
    const corrected = mergeCafCorrection(prev, form);
    const updated = await cafApi.update(cafId, corrected);
    setCafs(s => s.map(c => c.id === cafId ? updated : c));
    return updated;
  }, [cafs, addApplicationFromForm]);

  const approveAndArchive = useCallback(async (cafId: string): Promise<void> => {
    const result = await cafApi.archive(cafId);
    setCafs(s => s.map(c => c.id === cafId ? result.caf : c));
    if (result.entry) setArchiveEntries(s => [result.entry, ...s]);
  }, []);

  const approveCAF = useCallback(async (cafId: string): Promise<void> => {
    const updated = await cafApi.approve(cafId);
    setCafs(previous => previous.map(caf => caf.id === cafId ? updated : caf));
  }, []);

  const rejectCAF = useCallback(async (cafId: string): Promise<void> => {
    const updated = await cafApi.update(cafId, { status: 'Rejected' });
    setCafs(s => s.map(c => c.id === cafId ? updated : c));
  }, []);

  const requestCorrection = useCallback(async (cafId: string, correction?: CustomerApplicationForm['correction']): Promise<void> => {
    const updated = await cafApi.update(cafId, { status: 'Correction', correction });
    setCafs(s => s.map(c => c.id === cafId ? updated : c));
  }, []);

  const deleteCAF = useCallback(async (cafId: string): Promise<void> => {
    await cafApi.remove(cafId);
    setCafs(s => s.filter(c => c.id !== cafId));
  }, []);

  const getFilteredCAFs = useCallback((user: User | null): CustomerApplicationForm[] => {
    if (!user) return [];
    if (user.role === 'admin' || user.role === 'auditor') return cafs;
    return cafs.filter(c => c.createdBy === user.id || c.createdByUsername === user.username);
  }, [cafs]);

  const value = useMemo(
    () => ({ cafs, archiveEntries, loading, addApplicationFromForm, submitTemplateApplication, resubmitCorrection, approveAndArchive, approveCAF, rejectCAF, requestCorrection, deleteCAF, getFilteredCAFs, refresh }),
    [cafs, archiveEntries, loading, addApplicationFromForm, submitTemplateApplication, resubmitCorrection, approveAndArchive, approveCAF, rejectCAF, requestCorrection, deleteCAF, getFilteredCAFs, refresh]
  );

  return <ApplicationContext.Provider value={value}>{children}</ApplicationContext.Provider>;
}

export function useApplications() {
  const ctx = useContext(ApplicationContext);
  if (!ctx) throw new Error('useApplications must be used within ApplicationProvider');
  return ctx;
}
