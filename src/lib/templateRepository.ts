import type { CAFTemplate } from '../types';
import seedFile from '../../data/template_data.json';
import { buildPccareCafTermsHtml } from './pccareCafBlueprint';

const STORAGE_KEY = 'caf_templates_store_v2';

/** Stored in JSON for PC CARE row; expanded at load time with bundled logo URL. */
export const PCCARE_TERMS_SENTINEL = '__BUILD_PCCARE_CAF__';

const logoUrl = new URL('../assets/logo.svg', import.meta.url).href;

type SeedFileShape = { templates: CAFTemplate[] };

function hydrateTerms(t: CAFTemplate): CAFTemplate {
  if (t.termsAndConditions === PCCARE_TERMS_SENTINEL) {
    return {
      ...t,
      termsAndConditions: buildPccareCafTermsHtml(logoUrl),
    };
  }
  return t;
}

/** Normalized seed from `data/template_data.json` (PC CARE blueprint expanded). */
export function getSeedTemplates(): CAFTemplate[] {
  const { templates } = seedFile as SeedFileShape;
  if (!Array.isArray(templates)) return [];
  return templates.map(hydrateTerms);
}

export function loadTemplates(): CAFTemplate[] {
  if (typeof window === 'undefined') return getSeedTemplates();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as CAFTemplate[];
      if (Array.isArray(parsed)) {
        return parsed.map(hydrateTerms);
      }
    }
  } catch {
    /* ignore corrupt storage */
  }
  const seed = getSeedTemplates();
  saveTemplates(seed);
  return seed;
}

export function saveTemplates(templates: CAFTemplate[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
  } catch {
    /* quota / private mode */
  }
}

/** Replace persisted list with seed file contents (e.g. dev reset). */
export function resetTemplatesToSeed(): CAFTemplate[] {
  const seed = getSeedTemplates();
  saveTemplates(seed);
  return seed;
}
