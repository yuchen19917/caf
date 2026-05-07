import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { MOCK_CAFS } from '../mockData';
import type { CustomerApplicationForm } from '../types';
import { buildCafFromForm, mergeCafCorrection, type CAFFormShape } from '../lib/cafFromForm';
import type { User } from '../lib/auth';

const STORAGE_KEY = 'caf-app-registry-v1';

export type ArchivedLibraryFile = {
  id: string;
  name: string;
  size: string;
  archivedAt: string;
  type: 'pdf' | 'image';
  status: 'verified' | 'pending' | 'approved' | 'rejected';
  cafId: string;
};

type PersistedState = {
  cafs: CustomerApplicationForm[];
  archiveEntries: ArchivedLibraryFile[];
};

function loadPersisted(): PersistedState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { cafs: MOCK_CAFS, archiveEntries: [] };
    const parsed = JSON.parse(raw) as Partial<PersistedState>;
    return {
      cafs: Array.isArray(parsed.cafs) && parsed.cafs.length > 0 ? parsed.cafs : MOCK_CAFS,
      archiveEntries: Array.isArray(parsed.archiveEntries) ? parsed.archiveEntries : [],
    };
  } catch {
    return { cafs: MOCK_CAFS, archiveEntries: [] };
  }
}

type ApplicationContextValue = {
  cafs: CustomerApplicationForm[];
  archiveEntries: ArchivedLibraryFile[];
  addApplicationFromForm: (form: CAFFormShape, user: User) => CustomerApplicationForm;
  resubmitCorrection: (cafId: string, form: CAFFormShape, user: User) => CustomerApplicationForm;
  approveAndArchive: (cafId: string) => void;
  getFilteredCAFs: (user: User | null) => CustomerApplicationForm[];
};

const ApplicationContext = createContext<ApplicationContextValue | null>(null);

export function ApplicationProvider({ children }: { children: React.ReactNode }) {
  const [{ cafs, archiveEntries }, setState] = useState<PersistedState>(loadPersisted);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ cafs, archiveEntries }));
  }, [cafs, archiveEntries]);

  const addApplicationFromForm = useCallback((form: CAFFormShape, user: User): CustomerApplicationForm => {
    let created!: CustomerApplicationForm;
    setState((s) => {
      created = buildCafFromForm(form, s.cafs);
      // Add creator information
      created = {
        ...created,
        createdBy: user.id,
        createdByUsername: user.username,
      };
      return { ...s, cafs: [created, ...s.cafs] };
    });
    return created;
  }, []);

  const resubmitCorrection = useCallback((cafId: string, form: CAFFormShape, user: User): CustomerApplicationForm => {
    let result!: CustomerApplicationForm;
    setState((s) => {
      const prev = s.cafs.find((c) => c.id === cafId);
      if (!prev) {
        result = buildCafFromForm(form, s.cafs);
        result = {
          ...result,
          createdBy: user.id,
          createdByUsername: user.username,
        };
        return { ...s, cafs: [result, ...s.cafs] };
      }
      result = mergeCafCorrection(prev, form);
      return { ...s, cafs: s.cafs.map((c) => (c.id === cafId ? result : c)) };
    });
    return result;
  }, []);

  const approveAndArchive = useCallback((cafId: string) => {
    const archivedAt = new Date().toISOString();
    const bundleName = `${cafId}-approved-archive.pdf`;
    const sizeKb = Math.round(650 + Math.random() * 350);
    const entry: ArchivedLibraryFile = {
      id: `arc-${cafId}-${Date.now()}`,
      name: bundleName,
      size: `${sizeKb} KB`,
      archivedAt,
      type: 'pdf',
      status: 'approved',
      cafId,
    };

    setState((s) => ({
      cafs: s.cafs.map((c) => (c.id === cafId ? { ...c, status: 'Archived' as const } : c)),
      archiveEntries: [entry, ...s.archiveEntries],
    }));
  }, []);

  // Filter CAFs based on user role
  const getFilteredCAFs = useCallback((user: User | null): CustomerApplicationForm[] => {
    // If no user, return empty array
    if (!user) {
      return [];
    }
    
    // Admin and Auditor can see all CAFs
    if (user.role === 'admin' || user.role === 'auditor') {
      return cafs;
    }
    
    // Agent can only see their own CAFs
    if (user.role === 'agent') {
      return cafs.filter(caf => caf.createdBy === user.id || caf.createdByUsername === user.username);
    }
    
    return cafs;
  }, [cafs]);

  const value = useMemo(
    () => ({ cafs, archiveEntries, addApplicationFromForm, resubmitCorrection, approveAndArchive, getFilteredCAFs }),
    [cafs, archiveEntries, addApplicationFromForm, resubmitCorrection, approveAndArchive, getFilteredCAFs]
  );

  return <ApplicationContext.Provider value={value}>{children}</ApplicationContext.Provider>;
}

export function useApplications() {
  const ctx = useContext(ApplicationContext);
  if (!ctx) throw new Error('useApplications must be used within ApplicationProvider');
  return ctx;
}
