import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Globe, Scale, Database, Shield, Archive } from 'lucide-react';
import { cn } from '../lib/utils';
import type { GlobalRuleCategory, GlobalRuleEnforcement } from '../types';
import { GLOBAL_RULES } from '../lib/globalRulesData';

const GLOBAL_RULE_CATEGORY_ORDER: GlobalRuleCategory[] = [
  'business_compliance',
  'data_integrity',
  'kyc_security',
  'audit_lifecycle',
];

function categoryIcon(cat: GlobalRuleCategory) {
  const cls = 'text-slate-500 shrink-0';
  switch (cat) {
    case 'business_compliance':
      return <Scale size={16} className={cls} />;
    case 'data_integrity':
      return <Database size={16} className={cls} />;
    case 'kyc_security':
      return <Shield size={16} className={cls} />;
    default:
      return <Archive size={16} className={cls} />;
  }
}

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
        <div className="p-6 md:p-8">
          <div className="space-y-1">
            {sortedGlobalRules.map((rule, idx) => {
              const showCatHeader =
                idx === 0 || sortedGlobalRules[idx - 1].category !== rule.category;
              const catLabelKey = `templates_page.global_rule_cat_${rule.category}` as const;
              return (
                <React.Fragment key={rule.id}>
                  {showCatHeader && (
                    <div className="flex items-center gap-2 pt-6 first:pt-0 pb-3">
                      {categoryIcon(rule.category)}
                      <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">{t(catLabelKey)}</h4>
                    </div>
                  )}
                  <div
                    className={cn(
                      'rounded-2xl border p-4 md:p-5 flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-3 last:mb-0',
                      rule.isActive
                        ? 'border-slate-200 bg-white hover:bg-slate-50/60'
                        : 'border-slate-100 bg-slate-50 opacity-75'
                    )}
                  >
                    <div className="space-y-2 min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-mono font-bold text-slate-400">{rule.id}</span>
                        <span
                          className={cn(
                            'text-[9px] font-bold uppercase tracking-wide px-2 py-0.5 rounded border',
                            enforcementClass(rule.enforcement)
                          )}
                        >
                          {t(`templates_page.enforcement_${rule.enforcement}`)}
                        </span>
                      </div>
                      <p className="text-sm font-bold text-slate-800">{rule.name}</p>
                      <p className="text-xs text-slate-600 leading-relaxed">{rule.summary}</p>
                      {rule.technicalRef && (
                        <p className="text-[10px] text-slate-500 font-mono pt-1">
                          <span className="font-bold text-slate-400 uppercase mr-2">{t('templates_page.rule_technical_ref')}:</span>
                          {rule.technicalRef}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col items-start lg:items-end gap-1 shrink-0 text-[10px] font-bold text-slate-400 uppercase tracking-wide lg:text-right">
                      <span>{t('templates_page.rule_version_label', { version: rule.version })}</span>
                      <span className="font-normal normal-case text-slate-500">
                        {new Date(rule.lastModified).toLocaleDateString(
                          i18n.language.startsWith('zh') ? 'zh-CN' : 'en-US'
                        )}
                      </span>
                    </div>
                  </div>
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
