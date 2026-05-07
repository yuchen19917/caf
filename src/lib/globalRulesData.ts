import type { GlobalRule } from '../types';
import raw from '../../data/global_rules.json';

type FileShape = { rules: GlobalRule[] };

export const GLOBAL_RULES: GlobalRule[] = (raw as FileShape).rules ?? [];

export function getActiveGlobalRules(): GlobalRule[] {
  return GLOBAL_RULES.filter((r) => r.isActive);
}
