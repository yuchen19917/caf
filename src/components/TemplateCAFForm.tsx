import { useMemo, useState, type FormEvent } from 'react';
import type { CAFTemplate, CustomerApplicationForm, Document, ServiceType } from '../types';
import type { User } from '../lib/auth';
import { useApplications } from '../context/ApplicationContext';
import { DocumentUploader } from './DocumentUploader';
import type { UploadedFile } from '../lib/fileStorage';
import { renderBlueprint } from '../lib/blueprintPreview';

const baseFields = [
  { id: 'fullName', label: 'Full name', type: 'text', required: true },
  { id: 'idType', label: 'Identity document type', type: 'select', required: true, options: ['National ID', 'Tazkira', 'Passport'] },
  { id: 'idNumber', label: 'Identity document number', type: 'text', required: true },
  { id: 'contactNumber', label: 'Contact number', type: 'text', required: true },
  { id: 'address', label: 'Address', type: 'textarea', required: true },
] as const;

function serviceFor(template: CAFTemplate): ServiceType {
  const text = `${template.name} ${template.product}`.toLowerCase();
  return text.includes('postpaid') || text.includes('post pay') ? 'Postpaid'
    : text.includes('prepaid') ? 'Prepaid' : 'Data Only';
}

export function TemplateCAFForm({ template, initialData, user, onBack }: {
  template: CAFTemplate;
  initialData?: CustomerApplicationForm | null;
  user: User;
  onBack: () => void;
}) {
  const { submitTemplateApplication } = useApplications();
  const [values, setValues] = useState<Record<string, string>>(() => ({
    idType: 'National ID',
    ...(initialData?.templateValues ?? {}),
    ...(initialData ? {
      fullName: initialData.fullName, idType: initialData.idType, idNumber: initialData.idNumber,
      contactNumber: initialData.contactNumber, address: initialData.address,
    } : {}),
  }));
  const [files, setFiles] = useState<Record<string, UploadedFile>>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState<CustomerApplicationForm | null>(null);
  const fields = useMemo(() => {
    const configured = template.fields ?? [];
    return [...baseFields.map(field => configured.find(item => item.id === field.id) ?? field),
      ...configured.filter(field => !baseFields.some(base => base.id === field.id))];
  }, [template]);
  const preview = useMemo(() => renderBlueprint(template, values, 'A4 · Portrait', true), [template, values]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (busy) return;
    if (!files.identity && !initialData?.documents.some(doc => doc.requirementCode === 'identity' && doc.fileId)) {
      setError('Upload the identity document before submitting the application.');
      return;
    }
    setError('');
    setBusy(true);
    try {
      const day = new Date().toISOString().slice(0, 10);
      const existingFiles = initialData?.documents.filter(doc => doc.fileId) ?? [];
      const uploaded: Document[] = (Object.entries(files) as [string, UploadedFile][]).map(([category, file]) => ({
        id: file.id, requirementCode: category, name: file.name, type: category,
        uploadDate: day, status: 'Unverified', fileId: file.id,
      }));
      const documents: Document[] = [
        ...existingFiles.filter(doc => !uploaded.some(replacement => replacement.requirementCode === doc.requirementCode)),
        ...uploaded,
        { id: initialData?.documents.find(doc => doc.requirementCode === 'application-form')?.id ?? `FORM-${Date.now()}`,
          requirementCode: 'application-form', name: template.name, type: 'Application form',
          uploadDate: day, status: 'Unverified' },
      ];
      const result = await submitTemplateApplication({
        blueprintSnapshot: template,
        templateValues: values,
        customerType: template.customerType,
        fullName: values.fullName.trim(), idType: values.idType, idNumber: values.idNumber.trim(),
        contactNumber: values.contactNumber.trim(), address: values.address.trim(), email: values.email?.trim(),
        billingAddress: values.billingAddress?.trim(),
        serviceType: serviceFor(template), planName: values.planName?.trim() || template.product,
        createdBy: initialData?.createdBy ?? user.id,
        createdByUsername: initialData?.createdByUsername ?? user.username,
        documents,
      }, initialData?.id);
      setSaved(result);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to submit the application.');
    } finally {
      setBusy(false);
    }
  }

  if (saved) return <div className="mx-auto max-w-2xl rounded-2xl border border-emerald-200 bg-white p-8">
    <h2 className="text-xl font-semibold text-emerald-800">Application submitted</h2>
    <p className="mt-2 text-slate-700">{saved.id} · {saved.fullName} · Pending review</p>
    <button type="button" className="mt-6 rounded-lg bg-indigo-600 px-4 py-2 text-white" onClick={onBack}>View applications</button>
  </div>;

  return <form onSubmit={submit} className="mx-auto max-w-6xl space-y-5 pb-12">
    <div className="flex items-center justify-between gap-4">
      <div><h2 className="text-2xl font-semibold">{initialData ? 'Correct application' : 'New application'}</h2>
        <p className="text-sm text-slate-500">{template.name} · v{template.version}</p></div>
      <button type="button" onClick={onBack} className="rounded-lg border px-4 py-2 text-sm">Back to applications</button>
    </div>
    {error && <p role="alert" className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}
    <section className="rounded-2xl border bg-white p-5">
      <h3 className="mb-4 font-semibold">Applicant and service details</h3>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {fields.map(field => <label key={field.id} className="block text-sm font-medium text-slate-700">
          {field.label}{field.required && <span className="text-rose-600"> *</span>}
          {field.type === 'select' ? <select value={values[field.id] ?? ''} required={field.required}
            onChange={event => setValues(previous => ({ ...previous, [field.id]: event.target.value }))}
            className="mt-1 block w-full rounded-lg border border-slate-300 p-2.5">
            <option value="">Select</option>{(field.options ?? []).map(option => <option key={option}>{option}</option>)}
          </select> : field.type === 'textarea' ? <textarea value={values[field.id] ?? ''} required={field.required} rows={2}
            onChange={event => setValues(previous => ({ ...previous, [field.id]: event.target.value }))}
            className="mt-1 block w-full rounded-lg border border-slate-300 p-2.5" />
            : <input type={field.type === 'number' || field.type === 'date' ? field.type : 'text'}
              value={values[field.id] ?? ''} required={field.required}
              onChange={event => setValues(previous => ({ ...previous, [field.id]: event.target.value }))}
              className="mt-1 block w-full rounded-lg border border-slate-300 p-2.5" />}
        </label>)}
      </div>
    </section>
    <section className="rounded-2xl border bg-white p-5">
      <h3 className="mb-4 font-semibold">Required identity document</h3>
      <div className="grid gap-4 sm:grid-cols-2">
        <DocumentUploader documentName={template.customerType === 'Corporate' ? 'Business registration document' : 'Identity document'}
          category="identity" uploadedFile={files.identity} onUpload={file => setFiles(previous => ({ ...previous, identity: file }))}
          onRemove={() => setFiles(previous => { const next = { ...previous }; delete next.identity; return next; })} />
      </div>
      <p className="mt-3 text-xs text-slate-500">The completed application form is generated from the selected template.</p>
    </section>
    <section className="rounded-2xl border bg-slate-100 p-5">
      <h3 className="mb-4 font-semibold">Application form preview</h3>
      <div className="max-h-[600px] overflow-auto"><div dangerouslySetInnerHTML={{ __html: preview }} /></div>
    </section>
    <button type="submit" disabled={busy} className="rounded-lg bg-indigo-600 px-6 py-3 font-semibold text-white disabled:opacity-50">
      {busy ? 'Submitting…' : initialData ? 'Resubmit for review' : 'Submit for review'}
    </button>
  </form>;
}
