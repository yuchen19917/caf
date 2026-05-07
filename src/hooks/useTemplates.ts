import { useCallback, useState } from 'react';
import { loadTemplates, saveTemplates } from '../lib/templateRepository';
import type { CAFTemplate } from '../types';

export function useTemplates() {
  const [templates, setTemplatesState] = useState<CAFTemplate[]>(() => loadTemplates());

  const setTemplates = useCallback(
    (next: CAFTemplate[] | ((prev: CAFTemplate[]) => CAFTemplate[])) => {
      setTemplatesState((prev) => {
        const resolved = typeof next === 'function' ? (next as (p: CAFTemplate[]) => CAFTemplate[])(prev) : next;
        saveTemplates(resolved);
        return resolved;
      });
    },
    []
  );

  return { templates, setTemplates };
}
