import { useEffect, useState, type FormEvent } from 'react';
import { cafApi, prepaidTemplateApi } from '../lib/api';
import type { User } from '../lib/auth';
import type { UploadedFile } from '../lib/fileStorage';
import type { CustomerApplicationForm, PrepaidTemplate } from '../types';
import { useApplications } from '../context/ApplicationContext';
import { DocumentUploader } from './DocumentUploader';

export function PrepaidCAFForm({ initialData, user, onBack }: {
  initialData?: CustomerApplicationForm;
  user: User;
  onBack: () => void;
}) {
  const { refresh } = useApplications();
  const [template, setTemplate] = useState<PrepaidTemplate | undefined>(initialData?.templateSnapshot);
  const [values, setValues] = useState({
    fullName: initialData?.fullName ?? '',
    idType: initialData?.idType ?? '',
    idNumber: initialData?.idNumber ?? '',
    contactNumber: initialData?.contactNumber ?? '',
  });
  const [uploads, setUploads] = useState<Record<string, UploadedFile>>({});
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [savedId, setSavedId] = useState('');

  useEffect(() => {
    if (initialData?.templateSnapshot) return;
    const controller = new AbortController();
    prepaidTemplateApi.get(controller.signal).then(setTemplate).catch(error => {
      if (!controller.signal.aborted) setError(error.message);
    });
    return () => controller.abort();
  }, [initialData]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!template || saving || savedId) return;
    setError('');
    const documents = template.documents.flatMap(requirement => {
      const file = uploads[requirement.code];
      if (file) return [{
        id: file.id, fileId: file.id, name: file.name, type: requirement.label,
        uploadDate: file.uploadDate, status: 'Unverified' as const, requirementCode: requirement.code,
      }];
      const existing = initialData?.documents.find(doc => doc.requirementCode === requirement.code);
      return existing ? [existing] : [];
    });
    const missing = template.documents.find(doc => doc.required && !documents.some(file => file.requirementCode === doc.code));
    if (missing) {
      setError(`Upload ${missing.label}.`);
      return;
    }
    if (initialData?.correction && !uploads[initialData.correction.requirementCode]) {
      setError('Replace the attachment requested by the reviewer.');
      return;
    }
    setSaving(true);
    try {
      const data = { ...values, documents, status: 'Pending' as const };
      const saved = initialData
        ? await cafApi.update(initialData.id, data)
        : await cafApi.create({
          ...data, templateVersionId: template.id, address: '—',
          createdBy: user.id, createdByUsername: user.username,
        });
      setSavedId(saved.id);
      await refresh();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unable to submit the application.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="mx-auto max-w-4xl space-y-5 rounded-3xl border bg-white p-8">
      <button type="button" className="text-sm font-semibold text-indigo-700" onClick={onBack}>Back to applications</button>
      <h2 className="text-2xl font-bold">{initialData ? `Correct ${initialData.id}` : 'New prepaid SIM registration'}</h2>
      {error && <p className="text-sm text-rose-700" role="alert">{error}</p>}
      {savedId ? <p role="status">Application {savedId} submitted for review.</p> : template && (
        <form onSubmit={submit}>
          <fieldset disabled={saving} className="space-y-5">
            <p className="text-sm text-slate-600">{template.name} · Version {template.version}</p>
            {initialData?.correction && (
              <p className="rounded bg-amber-50 p-3 text-sm text-amber-900">
                Replace {template.documents.find(doc => doc.code === initialData.correction?.requirementCode)?.label}. {initialData.correction.reason}
              </p>
            )}
            <div className="grid gap-4 sm:grid-cols-2">
              {template.fields.map(field => (
                <label key={field.key} className="text-sm font-semibold">
                  {field.label}{field.required && ' *'}
                  <input className="mt-1 block w-full rounded-lg border p-2 font-normal"
                    value={values[field.key]} type={field.key === 'contactNumber' ? 'tel' : 'text'}
                    required={field.required} maxLength={field.maxLength}
                    onChange={event => setValues(previous => ({ ...previous, [field.key]: event.target.value }))} />
                </label>
              ))}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {template.documents.map(doc => {
                const existing = initialData?.documents.find(file => file.requirementCode === doc.code);
                return (
                  <div key={doc.code}>
                    {existing && !uploads[doc.code] && (
                      <p className="mb-2 text-sm text-slate-600">On file: {existing.name}. Upload a file to replace it.</p>
                    )}
                    <DocumentUploader documentName={`${doc.label}${doc.required ? ' *' : ''}`} category={doc.code}
                      uploadedFile={uploads[doc.code]}
                      onUpload={file => setUploads(previous => ({ ...previous, [doc.code]: file }))}
                      onRemove={() => setUploads(previous => {
                        const next = { ...previous };
                        delete next[doc.code];
                        return next;
                      })} />
                  </div>
                );
              })}
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" required /> I confirm that I checked the applicant’s identity and supporting documents.
            </label>
            <button type="submit" className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white">
              {saving ? 'Submitting…' : 'Submit for review'}
            </button>
          </fieldset>
        </form>
      )}
    </section>
  );
}
