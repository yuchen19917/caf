import { RecordList } from './RecordList';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Globe } from 'lucide-react';
import { cn } from '../lib/utils';
import type { GlobalRule, GlobalRuleCategory, GlobalRuleEnforcement } from '../types';
import { GLOBAL_RULES } from '../lib/globalRulesData';

const GLOBAL_RULE_CATEGORY_ORDER: GlobalRuleCategory[] = [
  'business_compliance',
  'data_integrity',
  'kyc_security',
  'audit_lifecycle',
];

function enforcementClass(e: GlobalRuleEnforcement) {
  return e === 'blocking'
    ? 'bg-rose-50 text-rose-700 border-rose-200'
    : e === 'warning'
      ? 'bg-amber-50 text-amber-800 border-amber-200'
      : 'bg-slate-100 text-slate-600 border-slate-200';
}

type GlobalRulesPageProps = {
  onBack: () => void;
};

export function GlobalRulesPage({ onBack }: GlobalRulesPageProps) {
  const { t, i18n } = useTranslation();

  const sortedGlobalRules = useMemo(() => {
    const order = new Map(GLOBAL_RULE_CATEGORY_ORDER.map((c, i) => [c, i]));
    return [...GLOBAL_RULES].sort((a, b) => {
      const da = order.get(a.category) ?? 99;
      const db = order.get(b.category) ?? 99;
      if (da !== db) return da - db;
      return a.id.localeCompare(b.id);
    });
  }, []);

  return (
    <div className="space-y-8 pb-12 h-full flex flex-col">
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-2 self-start text-[11px] font-bold uppercase tracking-widest text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-4 py-2.5 rounded-xl transition-colors"
      >
        <ArrowLeft size={16} />
        {t('common.back_to_templates')}
      </button>

      <section className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden flex-1">
        <div className="px-6 py-5 md:px-8 md:py-6 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-start gap-4">
            <div className="w-11 h-11 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
              <Globe size={22} className="text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800">{t('templates_page.global_rules_section_title')}</h3>
              <p className="text-sm text-slate-500 mt-1 font-medium leading-relaxed max-w-3xl">
                {t('templates_page.global_rules_section_subtitle')}
              </p>
            </div>
          </div>
        </div>
      </section>
      <RecordList<GlobalRule> rows={sortedGlobalRules}
        columns={[t('templates_page.table_code'), t('templates_page.table_name'), t('record_list.category'),
          t('record_list.enforcement'), t('templates_page.field_description'), t('templates_page.rule_technical_ref'),
          t('record_list.version'), t('record_list.modified'), t('templates_page.table_status')]}
        search={rule => [rule.id, rule.name, rule.summary, rule.technicalRef]}
        filters={[
          { label: t('record_list.category'), value: rule => rule.category, display: value => t('templates_page.global_rule_cat_' + value) },
          { label: t('record_list.enforcement'), value: rule => rule.enforcement, display: value => t('templates_page.enforcement_' + value) },
        ]}
        renderRow={rule => (
          <tr key={rule.id} className="hover:bg-slate-50">
            <td>{rule.id}</td><td className="font-semibold">{rule.name}</td>
            <td>{t('templates_page.global_rule_cat_' + rule.category)}</td>
            <td><span className={cn('rounded border px-2 py-0.5 text-xs', enforcementClass(rule.enforcement))}>
              {t('templates_page.enforcement_' + rule.enforcement)}
            </span></td>
            <td><span className="block max-w-xs truncate" title={rule.summary}>{rule.summary}</span></td>
            <td>{rule.technicalRef || '—'}</td>
            <td>{rule.version}</td>
            <td>{new Date(rule.lastModified).toLocaleDateString(i18n.language)}</td>
            <td>{t(rule.isActive ? 'templates_page.status_active' : 'templates_page.status_draft')}</td>
          </tr>
        )}
      />
    </div>
  );
}
