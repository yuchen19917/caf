import type { CAFTemplate, CustomerApplicationForm } from '../types';
import logoSvg from '../assets/logo.svg?raw';
import paperStyles from '../blueprintPaper.css?raw';
import quillStyles from 'react-quill-new/dist/quill.snow.css?raw';

type Values = Record<string, string | undefined>;
const logo = `data:image/svg+xml,${encodeURIComponent(logoSvg)}`;
const escapeHtml = (value: string) => value.replace(/[&<>"']/g, char =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]!);

export function getTemplatePreviewValues(tpl: CAFTemplate): Values {
  const postpaid = tpl.id === 'TPL-IND-POST-001' || tpl.id === 'TPL-IND-POST-AGR-001';
  return {
    fullName: 'M. OMAR KHAN', idNumber: 'AZ-10029388', idType: 'National ID',
    contactNumber: '+93 78 000 1111', address: 'Kabul, District 4, House 22',
    submissionDate: 'May 05, 2024', email: 'subscriber@example.com',
    billingAddress: 'Same as residential / PO Box 100',
    planName: postpaid ? 'Postpaid Standard 20 GB' : 'Elite Plus 50GB',
    serviceType: postpaid ? 'Postpaid' : 'Prepaid Mobile Data',
    serviceDelivery: 'Physical SIM · Standard delivery', activationFee: 'USD 2.00',
    monthlyFee: postpaid ? 'AFN 500' : 'USD 15.00 / 30 days',
    billingCycle: postpaid ? 'Monthly' : 'Monthly (auto-renew)',
  };
}

export function renderBlueprint(tpl: CAFTemplate, values: Values, paperLabel: string, filled = false): string {
  const postpaid = tpl.id === 'TPL-IND-POST-001' || tpl.id === 'TPL-IND-POST-AGR-001';
  const source = document.createElement('template');
  source.innerHTML = tpl.termsAndConditions || '';
  const pages = [document.createElement('template')];
  for (const node of Array.from(source.content.childNodes)) {
    if (node instanceof HTMLElement && node.tagName === 'P' && node.textContent?.trim() === '{{pageBreak}}') {
      pages.push(document.createElement('template'));
    } else {
      pages[pages.length - 1].content.append(node);
    }
  }

  return `<div class="caf-paper-stack">${pages.map((page, index) => {
    const walker = document.createTreeWalker(page.content, NodeFilter.SHOW_TEXT);
    const textNodes: Node[] = [];
    for (let node = walker.nextNode(); node; node = walker.nextNode()) textNodes.push(node);
    for (const node of textNodes) {
      if (node.parentElement?.closest('script, style, textarea, title')) continue;
      const text = node.textContent ?? '';
      const fragment = document.createDocumentFragment();
      let end = 0;
      for (const match of text.matchAll(/\{\{\s*([\w]+)\s*\}\}/g)) {
        const value = Object.prototype.hasOwnProperty.call(values, match[1]) ? values[match[1]] : undefined;
        fragment.append(text.slice(end, match.index));
        const span = document.createElement('span');
        if (!filled && value != null) span.className = 'caf-bound-sample';
        span.textContent = value || (filled ? '—' : match[0]);
        fragment.append(span);
        end = match.index + match[0].length;
      }
      if (end) {
        fragment.append(text.slice(end));
        node.parentNode?.replaceChild(fragment, node);
      }
    }
    const header = postpaid ? `<header class="caf-paper-brand"><img src="${logo}" alt="AsiaInfo"><span>${escapeHtml(tpl.id)} · v${escapeHtml(tpl.version || '1.0')}</span></header>` : '';
    const classes = `caf-paper-body prose-blueprint ql-editor blueprint-reader${postpaid ? ' caf-postpaid-paper' : ''}${tpl.isFullPageTerms ? ' caf-full-page-terms' : ''}`;
    return `<article class="caf-a4-paper">${header}<div class="${classes}">${page.innerHTML}</div><footer class="caf-paper-footer"><span>${escapeHtml(paperLabel)}</span><span>${index + 1} / ${pages.length}</span></footer></article>`;
  }).join('')}</div>`;
}

export function renderApplicationForm(tpl: CAFTemplate, caf: CustomerApplicationForm): string {
  const submission = new Date(caf.submissionDate);
  const documentBody = renderBlueprint(tpl, {
    ...caf.templateValues,
    fullName: caf.fullName, idType: caf.idType, idNumber: caf.idNumber,
    address: caf.address, contactNumber: caf.contactNumber, email: caf.email,
    billingAddress: caf.billingAddress, planName: caf.planName, serviceType: caf.serviceType,
    submissionDate: Number.isFinite(submission.getTime())
      ? new Intl.DateTimeFormat('en', { dateStyle: 'medium' }).format(submission)
      : undefined,
    cafId: caf.id,
  }, 'A4 · Portrait', true);
  return `<!doctype html><html lang="en"><head><meta charset="utf-8">
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; img-src data: https: http:; base-uri 'none'; form-action 'none'">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(tpl.name)}</title><style>
  *,*::before,*::after{box-sizing:border-box} h1,h2,h3,p,ul,ol{margin:0} img{max-width:100%}
  body{margin:0;padding:16px;color:#0f172a;background:#f1f5f9;font-family:system-ui,sans-serif}
  ${quillStyles}
  ${paperStyles}
  @page{size:A4;margin:0} @media print{body{padding:0;background:white}.caf-paper-stack{display:block}.caf-a4-paper{box-shadow:none;break-after:page}.caf-a4-paper:last-child{break-after:auto}}
  </style></head><body>${documentBody}</body></html>`;
}
