import { useCallback, useEffect, useRef, useState } from 'react';
import { loadTemplates, saveTemplates, syncTemplates } from '../lib/templateRepository';
import { templateApi } from '../lib/api';
import type { CAFTemplate } from '../types';

export function useTemplates() {
  const [templates, setTemplatesState] = useState<CAFTemplate[]>(() => loadTemplates());
  const current = useRef(templates);
  useEffect(() => {
    let active = true;
    syncTemplates().then(rows => { if (active) { current.current = rows; setTemplatesState(rows); } })
      .catch(error => console.error('[CAF] Failed to sync templates:', error));
    return () => { active = false; };
  }, []);

  const setTemplates = useCallback(
    (next: CAFTemplate[] | ((prev: CAFTemplate[]) => CAFTemplate[])) => {
      const prev = current.current;
      const resolved = typeof next === 'function' ? (next as (p: CAFTemplate[]) => CAFTemplate[])(prev) : next;
      current.current = resolved;
      saveTemplates(resolved);
      setTemplatesState(resolved);
      const previous = new Map(prev.map(row => [row.id, row]));
      const following = new Set(resolved.map(row => row.id));
      for (const row of resolved) {
        if (!previous.has(row.id)) void templateApi.create(row).catch(console.error);
        else if (JSON.stringify(previous.get(row.id)) !== JSON.stringify(row)) void templateApi.update(row.id, row).catch(console.error);
      }
      for (const row of prev) if (!following.has(row.id)) void templateApi.remove(row.id).catch(console.error);
    },
    []
  );

  return { templates, setTemplates };
}
