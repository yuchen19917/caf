import type { CustomerApplicationForm, Document } from '../types';
import { fileStorage, type UploadedFile } from './fileStorage';
import { renderApplicationForm } from './blueprintPreview';
import { getSeedTemplates, loadTemplates } from './templateRepository';

const identityImage = new URL('../assets/kyc-demo-reference.jpg', import.meta.url).href;
const escapeXml = (value: string) => value.replace(/[&<>]/g, char =>
  char === '&' ? '&amp;' : char === '<' ? '&lt;' : '&gt;');

export function getSeedAttachment(caf: CustomerApplicationForm, doc: Document): UploadedFile | undefined {
  if (doc.fileId) return;
  const base = { id: doc.id, cafId: caf.id, category: doc.type, uploadDate: doc.uploadDate };
  if (caf.id === 'CAF-2026-026' && doc.id === 'D001-1') {
    return { ...base, name: 'National ID Card.jpg', data: identityImage, type: 'image/jpeg', size: 0 };
  }
  if (caf.blueprintSnapshot && doc.requirementCode === 'application-form' && typeof document !== 'undefined') {
    const html = renderApplicationForm(caf.blueprintSnapshot, caf);
    return { ...base, name: `${caf.blueprintSnapshot.name}.html`, type: 'text/html',
      data: `data:text/html;charset=utf-8,${encodeURIComponent(html)}`, size: new TextEncoder().encode(html).length };
  }
  const workbenchSeed = /^CAF-2026-0(?:3[7-9]|4[0-4])$/.test(caf.id);
  if ((workbenchSeed && doc.id === `${caf.id}-DOC-2`) || (caf.id === 'CAF-2026-026' && doc.id === 'D001-3')) {
    const templateId = caf.serviceType === 'Postpaid' ? 'TPL-IND-POST-001' : 'TPL-IND-PRE-001';
    const template = loadTemplates().find(tpl => tpl.id === templateId) ?? getSeedTemplates().find(tpl => tpl.id === templateId);
    if (!template || typeof document === 'undefined') return;
    const html = renderApplicationForm(template, caf);
    return { ...base, name: `${doc.name}.html`, type: 'text/html', data: `data:text/html;charset=utf-8,${encodeURIComponent(html)}`, size: new TextEncoder().encode(html).length };
  }
  if (!workbenchSeed || doc.id !== `${caf.id}-DOC-1`) return;

  const rows = [['Full name', caf.fullName], ['Document type', caf.idType], ['Document number', caf.idNumber], ['Address', caf.address]];
  const height = 140 + rows.length * 64;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="820" height="${height}" viewBox="0 0 820 ${height}" font-family="sans-serif">
  <rect width="820" height="${height}" fill="#fff"/>
  <rect width="820" height="108" fill="#14243b"/>
  <text x="36" y="37" font-size="17" fill="#b7c9df">AsiaInfo · Customer registration</text>
  <text x="36" y="78" font-size="30" font-weight="bold" fill="#fff">Identity record</text>
  ${rows.map(([label, value], index) => {
    const y = 130 + index * 64;
    return `<rect x="36" y="${y}" width="748" height="55" rx="5" fill="#f0f4fa"/>
      <text x="52" y="${y + 34}" font-size="17" fill="#465a73">${label}</text>
      <text x="285" y="${y + 34}" font-size="21" fill="#14243b">${escapeXml(value ?? '')}</text>`;
  }).join('')}
  </svg>`;
  return { ...base, name: `${doc.name}.svg`, type: 'image/svg+xml', data: `data:image/svg+xml,${encodeURIComponent(svg)}`, size: new TextEncoder().encode(svg).length };
}

export function loadAttachment(caf: CustomerApplicationForm, doc: Document) {
  return doc.fileId ? fileStorage.getFile(doc.fileId) : Promise.resolve(getSeedAttachment(caf, doc));
}
