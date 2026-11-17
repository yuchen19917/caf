import { randomUUID } from 'node:crypto';

export const initialTemplate = {
  id: 'atoma-prepaid-v1',
  version: 1,
  name: 'AsiaInfo Individual Prepaid SIM Registration',
  fields: [
    { key: 'fullName', label: 'Full name', required: true, maxLength: 120 },
    { key: 'idType', label: 'ID type', required: true, maxLength: 40 },
    { key: 'idNumber', label: 'ID number', required: true, maxLength: 60 },
    { key: 'contactNumber', label: 'Contact number', required: true, maxLength: 30 },
  ],
  documents: [
    { code: 'identity', label: 'Identity document', required: true },
    { code: 'registration', label: 'Signed SIM Registration Form', required: true },
  ],
};

export function publishTemplate(current, draft) {
  if (current.id !== draft.id) throw new Error('A newer template was published. Reload before editing.');
  if (typeof draft.name !== 'string' || !draft.name.trim()) throw new Error('Template name is required.');
  if (!Array.isArray(draft.fields) || !Array.isArray(draft.documents)) throw new Error('Invalid template configuration.');
  const fields = initialTemplate.fields.map(({ key }) => {
    const field = draft.fields.find(item => item?.key === key);
    if (!field?.label?.trim() || typeof field.required !== 'boolean' ||
        !Number.isInteger(field.maxLength) || field.maxLength < 1 || field.maxLength > 250) {
      throw new Error(`Invalid configuration for ${key}.`);
    }
    return { key, label: field.label.trim(), required: field.required, maxLength: field.maxLength };
  });
  const codes = new Set();
  const documents = draft.documents.map(item => {
    if (typeof item?.code !== 'string' || !/^[a-z][a-z0-9_-]{0,49}$/.test(item.code) ||
        codes.has(item.code) || typeof item.label !== 'string' || !item.label.trim() ||
        typeof item.required !== 'boolean') {
      throw new Error('Each document needs a unique code, a label and a required setting.');
    }
    codes.add(item.code);
    return { code: item.code, label: item.label.trim(), required: item.required };
  });
  return { id: randomUUID(), version: current.version + 1, name: draft.name.trim(), fields, documents };
}

export function validatePrepaid(template, input) {
  const values = {};
  for (const field of template.fields) {
    const value = input[field.key];
    values[field.key] = typeof value === 'string' ? value.trim() : '';
    if (field.required && !values[field.key]) throw new Error(`${field.label} is required.`);
    if (values[field.key].length > field.maxLength) throw new Error(`${field.label} exceeds ${field.maxLength} characters.`);
  }
  const submitted = input.documents;
  if (!Array.isArray(submitted)) throw new Error('Invalid document list.');
  const documents = [];
  for (const requirement of template.documents) {
    const file = submitted.find(doc => doc?.requirementCode === requirement.code);
    if (!file) {
      if (requirement.required) throw new Error(`Upload ${requirement.label}.`);
      continue;
    }
    if (typeof file.fileId !== 'string' || !file.fileId.trim() || typeof file.name !== 'string' || !file.name.trim()) {
      throw new Error(`Invalid upload for ${requirement.label}.`);
    }
    documents.push({
      id: randomUUID(),
      fileId: file.fileId,
      name: file.name,
      type: requirement.label,
      requirementCode: requirement.code,
      status: 'Unverified',
      uploadDate: new Date().toISOString().slice(0, 10),
    });
  }
  return { ...values, documents };
}
