import { useEffect, useState } from 'react';
import { prepaidTemplateApi } from '../lib/api';
import type { PrepaidTemplate } from '../types';

export function PrepaidTemplateEditor({ canPublish }: { canPublish: boolean }) {
  const [draft, setDraft] = useState<PrepaidTemplate>();
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    prepaidTemplateApi.get(controller.signal).then(setDraft).catch(error => {
      if (!controller.signal.aborted) setMessage(error.message);
    });
    return () => controller.abort();
  }, []);

  async function publish() {
    if (!draft) return;
    setSaving(true);
    setMessage('');
    try {
      const published = await prepaidTemplateApi.publish(draft);
      setDraft(published);
      setMessage(`Version ${published.version} published.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to publish the template.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      {message && <p className="mt-3 text-sm" role="status">{message}</p>}
      {draft && (
        <fieldset disabled={saving || !canPublish} className="mt-4 space-y-4 text-sm">
          <label className="block">
            Template name
            <input className="mt-1 block w-full rounded border p-2" value={draft.name}
              onChange={event => setDraft({ ...draft, name: event.target.value })} />
          </label>
          <p className="font-semibold">Published version {draft.version}</p>
          {draft.fields.map((field, index) => (
            <div key={field.key} className="flex flex-wrap items-end gap-4">
              <label>{field.key}
                <input className="block rounded border p-2" value={field.label}
                  onChange={event => setDraft({ ...draft, fields: draft.fields.map((item, i) => i === index ? { ...item, label: event.target.value } : item) })} />
              </label>
              <label>Maximum length
                <input className="block w-24 rounded border p-2" type="number" min="1" max="250" value={field.maxLength}
                  onChange={event => setDraft({ ...draft, fields: draft.fields.map((item, i) => i === index ? { ...item, maxLength: Number(event.target.value) } : item) })} />
              </label>
              <label><input type="checkbox" checked={field.required}
                onChange={event => setDraft({ ...draft, fields: draft.fields.map((item, i) => i === index ? { ...item, required: event.target.checked } : item) })} /> Required</label>
            </div>
          ))}
          <p className="font-semibold">KYC attachments</p>
          {draft.documents.map((doc, index) => (
            <div key={index} className="flex flex-wrap items-end gap-4">
              <label>Code
                <input className="block rounded border p-2" value={doc.code}
                  onChange={event => setDraft({ ...draft, documents: draft.documents.map((item, i) => i === index ? { ...item, code: event.target.value } : item) })} />
              </label>
              <label>Label
                <input className="block rounded border p-2" value={doc.label}
                  onChange={event => setDraft({ ...draft, documents: draft.documents.map((item, i) => i === index ? { ...item, label: event.target.value } : item) })} />
              </label>
              <label><input type="checkbox" checked={doc.required}
                onChange={event => setDraft({ ...draft, documents: draft.documents.map((item, i) => i === index ? { ...item, required: event.target.checked } : item) })} /> Required</label>
              <button type="button" className="text-rose-700"
                onClick={() => setDraft({ ...draft, documents: draft.documents.filter((_, i) => i !== index) })}>Remove</button>
            </div>
          ))}
          {canPublish && <div className="flex gap-4">
            <button type="button" className="rounded border px-3 py-2"
              onClick={() => setDraft({ ...draft, documents: [...draft.documents, { code: '', label: '', required: true }] })}>Add attachment</button>
            <button type="button" className="rounded bg-indigo-600 px-3 py-2 text-white" onClick={publish}>Publish new version</button>
          </div>}
        </fieldset>
      )}
    </div>
  );
}
