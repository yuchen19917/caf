import type { CAFTemplate } from '../types';
import seedFile from '../../data/template_data.json';
import postpaidTemplate from '../../data/individual_postpaid_template.json';
import postpaidAgreement from '../../data/individual_postpaid_agreement.json';
import { buildPccareCafTermsHtml } from './pccareCafBlueprint';
import { templateApi } from './api';

const STORAGE_KEY = 'caf_templates_store_v4';
const PREVIOUS_STORAGE_KEY = 'caf_templates_store_v3';
const LEGACY_STORAGE_KEY = 'caf_templates_store_v2';

/** Stored in JSON for the full-page CAF row; expanded at load time with bundled logo URL. */
export const PCCARE_TERMS_SENTINEL = '__BUILD_PCCARE_CAF__';

const logoUrl = new URL('../assets/logo.svg', import.meta.url).href;

type SeedFileShape = { templates: CAFTemplate[] };

export function hydrateTerms(t: CAFTemplate): CAFTemplate {
  const updateBrand = (value: string) => value.replace(/\bATOMA\b/g, 'AsiaInfo');
  const legacyGenerated = t.fields?.length === 2 && t.fields[0]?.id === 'f1' && t.fields[1]?.id === 'f2';
  return {
    ...t,
    version: t.version || '1.0',
    lifecycle: t.lifecycle || (t.isActive ? 'active' : 'draft'),
    fields: legacyGenerated ? [
      { ...t.fields[0], id: 'fullName' },
      { ...t.fields[1], id: 'idNumber' },
    ] : t.fields,
    name: updateBrand(t.name),
    description: updateBrand(t.description ?? ''),
    termsAndConditions: t.termsAndConditions === PCCARE_TERMS_SENTINEL
      ? buildPccareCafTermsHtml(logoUrl)
      : t.termsAndConditions && updateBrand(t.termsAndConditions),
  };
}

export async function syncTemplates(): Promise<CAFTemplate[]> {
  const local = loadTemplates();
  const remote = (await templateApi.getAll()).templates.map(hydrateTerms);
  const remoteIds = new Set(remote.map(template => template.id));
  const seedIds = new Set(getSeedTemplates().map(template => template.id));
  const missingCustom = local.filter(template => !remoteIds.has(template.id) && !seedIds.has(template.id));
  const created = await Promise.all(missingCustom.map(template => templateApi.create(template)));
  const bundled = getSeedTemplates().filter(template => !remoteIds.has(template.id));
  const merged = [...created.map(hydrateTerms), ...remote, ...bundled];
  saveTemplates(merged);
  return merged;
}

/** Normalized seed from `data/template_data.json` (full-page CAF blueprint expanded). */
export function getSeedTemplates(): CAFTemplate[] {
  const { templates } = seedFile as SeedFileShape;
  return [...(Array.isArray(templates) ? templates : []), postpaidTemplate as CAFTemplate, postpaidAgreement as CAFTemplate].map(hydrateTerms);
}

export function loadTemplates(): CAFTemplate[] {
  if (typeof window === 'undefined') return getSeedTemplates();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const previous = raw ? null : localStorage.getItem(PREVIOUS_STORAGE_KEY);
    const saved = raw ?? previous ?? localStorage.getItem(LEGACY_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved) as CAFTemplate[];
      if (Array.isArray(parsed)) {
        const templates = parsed.map(hydrateTerms);
        if (!raw) {
          if (!previous && !templates.some(template => template.id === postpaidTemplate.id)) {
            templates.push(postpaidTemplate as CAFTemplate);
          }
          if (!templates.some(template => template.id === postpaidAgreement.id)) {
            templates.push(postpaidAgreement as CAFTemplate);
          }
          saveTemplates(templates);
        }
        return templates;
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
