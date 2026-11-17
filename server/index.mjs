import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { initialTemplate, publishTemplate, validatePrepaid } from './prepaid-template.mjs';
import { randomUUID } from 'node:crypto';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '..', 'data');
const UPLOAD_DIR = path.join(DATA_DIR, 'uploads');
const PORT = 4000;

const app = express();
app.use(express.json({ limit: '50mb' }));

// Uploaded evidence must be available to reviewers on other devices and accounts.
app.post('/api/files', async (req, res) => {
  try {
    const { name, type, size, data, category } = req.body ?? {};
    if (typeof name !== 'string' || !name.trim() || name.length > 255 ||
        !['image/jpeg', 'image/png', 'application/pdf'].includes(type) ||
        !Number.isInteger(size) || size < 1 || size > 10 * 1024 * 1024 ||
        typeof data !== 'string' || !data.startsWith(`data:${type};base64,`)) {
      return res.status(400).json({ error: 'Invalid attachment.' });
    }
    const bytes = Buffer.from(data.slice(data.indexOf(',') + 1), 'base64');
    if (bytes.length !== size) return res.status(400).json({ error: 'Attachment size does not match.' });
    const id = `FILE-${randomUUID()}`;
    const file = { id, name: name.trim(), type, size, data, category: String(category ?? ''), uploadDate: new Date().toISOString() };
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
    await writeJson(path.join('uploads', `${id}.json`), file);
    res.status(201).json(file);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/files/:id', async (req, res) => {
  if (!/^FILE-[a-f0-9-]{36}$/i.test(req.params.id)) return res.status(400).json({ error: 'Invalid file ID.' });
  const file = await readJson(path.join('uploads', `${req.params.id}.json`));
  if (!file) return res.status(404).json({ error: 'File not found.' });
  res.json(file);
});

app.delete('/api/files/:id', async (req, res) => {
  if (!/^FILE-[a-f0-9-]{36}$/i.test(req.params.id)) return res.status(400).json({ error: 'Invalid file ID.' });
  const store = await readJson('cafs.json');
  if (store?.cafs?.some(caf => caf.documents?.some(doc => doc.fileId === req.params.id))) {
    return res.status(409).json({ error: 'The attachment is used by an application.' });
  }
  await fs.rm(path.join(UPLOAD_DIR, `${req.params.id}.json`), { force: true });
  res.json({ ok: true });
});

let pendingWrite = Promise.resolve();
const serializeWrite = handler => (req, res, next) => {
  const result = pendingWrite.then(() => handler(req, res));
  pendingWrite = result.catch(() => {});
  result.catch(next);
};

// ── Helpers ────────────────────────────────────────────────────────────────────
async function readJson(file) {
  try {
    const raw = await fs.readFile(path.join(DATA_DIR, file), 'utf8');
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

async function writeJson(file, data) {
  const target = path.join(DATA_DIR, file);
  const temporary = `${target}.${randomUUID()}.tmp`;
  try {
    await fs.writeFile(temporary, JSON.stringify(data, null, 2), 'utf8');
    await fs.rename(temporary, target);
  } catch (error) {
    await fs.rm(temporary, { force: true }).catch(() => {});
    throw error;
  }
}

async function getPrepaidTemplate() {
  try {
    return JSON.parse(await fs.readFile(path.join(DATA_DIR, 'prepaid_template.json'), 'utf8'));
  } catch (error) {
    if (error.code === 'ENOENT') return initialTemplate;
    throw error;
  }
}

app.get('/api/prepaid-template', async (_req, res, next) => {
  try {
    res.json(await getPrepaidTemplate());
  } catch (error) {
    next(error);
  }
});

app.put('/api/prepaid-template', serializeWrite(async (req, res) => {
  const current = await getPrepaidTemplate();
  let template;
  try {
    template = publishTemplate(current, req.body ?? {});
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
  await writeJson('prepaid_template.json', template);
  res.json(template);
}));

// Seed cafs.json from mockData if missing
async function ensureCafs() {
  const existing = await readJson('cafs.json');
  if (existing) return existing;
  const seed = {
    cafs: [
      { id:'CAF-2026-001',customerType:'Individual',fullName:'Ahmad Karimi',idNumber:'T-20481922',idType:'Tazkira',address:'Karte 3, District 6, Kabul, DMS',contactNumber:'+93 70 456 7890',email:'ahmad.karimi@gmail.com',serviceType:'Prepaid',planName:'AsiaInfo Elite 50GB',status:'Approved',submissionDate:'2026-10-10T08:30:00Z',createdBy:'USR-AGENT-001',createdByUsername:'agent',documents:[{id:'D001-1',name:'Tazkira Front',type:'ID Card',uploadDate:'2026-10-10',status:'Verified'},{id:'D001-2',name:'Customer Photo',type:'Photo',uploadDate:'2026-10-10',status:'Verified'},{id:'D001-3',name:'SIM Application Form',type:'SIM Form',uploadDate:'2026-10-10',status:'Verified'}]},
      { id:'CAF-2026-002',customerType:'Corporate',fullName:'AsiaInfo Tech Solutions Ltd',idNumber:'C-998877',idType:'Business License',address:'Shahr-e-Naw Industrial Zone, Kabul, DMS',contactNumber:'+93 20 888 9999',email:'ops@asiainfotechsolutions.com',serviceType:'Postpaid',planName:'AsiaInfo Enterprise Unlimited',status:'Approved',submissionDate:'2026-10-12T09:15:00Z',createdBy:'USR-AGENT-001',createdByUsername:'agent',documents:[{id:'D002-1',name:'Business License',type:'Corporate Doc',uploadDate:'2026-10-12',status:'Verified'},{id:'D002-2',name:'Authorized Signatory POA',type:'Legal',uploadDate:'2026-10-12',status:'Verified'},{id:'D002-3',name:'Company Tax Certificate',type:'Tax Doc',uploadDate:'2026-10-12',status:'Verified'}],corporateDetails:{companyRegNo:'L-55442',taxId:'TIN-44556677',authorizedSignatory:'Ahmad Wali',technicalContact:'Khalid Jamil',staticIpRequired:true}},
      { id:'CAF-2026-003',customerType:'Individual',fullName:'Fahima Noori',idNumber:'P-77881234',idType:'Passport',address:'Wazir Akbar Khan, Kabul, DMS',contactNumber:'+93 79 322 8811',email:'fahima.noori@hotmail.com',serviceType:'Postpaid',planName:'AsiaInfo Business Pro',status:'Approved',submissionDate:'2026-10-15T11:00:00Z',createdBy:'USR-AGENT-001',createdByUsername:'agent',documents:[{id:'D003-1',name:'Passport Copy',type:'ID Card',uploadDate:'2026-10-15',status:'Verified'},{id:'D003-2',name:'Customer Photo',type:'Photo',uploadDate:'2026-10-15',status:'Verified'},{id:'D003-3',name:'Address Proof',type:'Address Proof',uploadDate:'2026-10-15',status:'Verified'}]},
      { id:'CAF-2026-004',customerType:'Corporate',fullName:'Herat Cement Company',idNumber:'C-771234',idType:'Business License',address:'Herat Industrial Park, Phase 2, Herat, DMS',contactNumber:'+93 40 555 6666',email:'admin@heratcement.af',serviceType:'Data Only',planName:'AsiaInfo DIA-ILL 100Mbps',status:'Approved',submissionDate:'2026-10-18T07:45:00Z',createdBy:'USR-AGENT-001',createdByUsername:'agent',documents:[{id:'D004-1',name:'Business Registration',type:'Corporate Doc',uploadDate:'2026-10-18',status:'Verified'},{id:'D004-2',name:'Site Survey Report',type:'Technical Doc',uploadDate:'2026-10-18',status:'Verified'},{id:'D004-3',name:'Signatory ID',type:'ID Card',uploadDate:'2026-10-18',status:'Verified'}],corporateDetails:{companyRegNo:'HRT-2018-0443',taxId:'TIN-77123400',authorizedSignatory:'Eng. Mirwais Sediqi',technicalContact:'IT Manager - Rahmat Ghafari',staticIpRequired:true}},
      { id:'CAF-2026-005',customerType:'Individual',fullName:'Najiba Ahmadzai',idNumber:'T-55667788',idType:'Tazkira',address:'Karte 4, District 7, Kabul, DMS',contactNumber:'+93 78 112 5544',serviceType:'Prepaid',planName:'AsiaInfo Starter 10GB',status:'Approved',submissionDate:'2026-10-20T13:30:00Z',createdBy:'USR-AGENT-001',createdByUsername:'agent',documents:[{id:'D005-1',name:'Tazkira Front',type:'ID Card',uploadDate:'2026-10-20',status:'Verified'},{id:'D005-2',name:'Photo',type:'Photo',uploadDate:'2026-10-20',status:'Verified'}]},
      { id:'CAF-2026-006',customerType:'Corporate',fullName:'Global Logistics Group (Mazar)',idNumber:'C-112233',idType:'Business License',address:'Airport Road, Mazar-i-Sharif, Balkh, DMS',contactNumber:'+93 50 444 3333',email:'logistics@glg-mazar.af',serviceType:'Postpaid',planName:'AsiaInfo Enterprise Unlimited',status:'Archived',submissionDate:'2026-09-15T09:00:00Z',createdBy:'USR-AGENT-001',createdByUsername:'agent',documents:[{id:'D006-1',name:'Business License',type:'Corporate Doc',uploadDate:'2026-09-15',status:'Verified'},{id:'D006-2',name:'Tax Certificate',type:'Tax Doc',uploadDate:'2026-09-15',status:'Verified'}],corporateDetails:{companyRegNo:'MZR-2015-0089',taxId:'TIN-11223344',authorizedSignatory:'Omar Barakzai',technicalContact:'Shafi Nuristani',staticIpRequired:false}},
      { id:'CAF-2026-007',customerType:'Individual',fullName:'Abdul Rahman Wali',idNumber:'T-88776655',idType:'Tazkira',address:'Share Naw, Kandahar City, Kandahar, DMS',contactNumber:'+93 74 111 2222',serviceType:'Prepaid',planName:'AsiaInfo Elite 50GB',status:'Pending',submissionDate:'2026-11-01T10:00:00Z',createdBy:'USR-AGENT-001',createdByUsername:'agent',documents:[{id:'D007-1',name:'Tazkira Front',type:'ID Card',uploadDate:'2026-11-01',status:'Unverified'},{id:'D007-2',name:'Customer Photo',type:'Photo',uploadDate:'2026-11-01',status:'Unverified'}]},
      { id:'CAF-2026-008',customerType:'Corporate',fullName:'Mazar Trading Group',idNumber:'C-334455',idType:'Business License',address:'Balkh Street, Mazar-i-Sharif, DMS',contactNumber:'+93 50 777 8888',email:'ceo@mazartrading.af',serviceType:'Data Only',planName:'AsiaInfo Fixed Wi-Fi Business',status:'Pending',submissionDate:'2026-11-02T14:20:00Z',createdBy:'USR-AGENT-001',createdByUsername:'agent',documents:[{id:'D008-1',name:'Business Registration',type:'Corporate Doc',uploadDate:'2026-11-02',status:'Unverified'},{id:'D008-2',name:'Authorized Signatory Tazkira',type:'ID Card',uploadDate:'2026-11-02',status:'Unverified'}],corporateDetails:{companyRegNo:'MZR-2019-0321',taxId:'TIN-33445566',authorizedSignatory:'Habibullah Turabi',technicalContact:'Wakil Muhammadi',staticIpRequired:false}},
      { id:'CAF-2026-009',customerType:'Individual',fullName:'Safia Rahimi',idNumber:'T-44332211',idType:'Tazkira',address:'Karte Char, District 8, Kabul, DMS',contactNumber:'+93 70 987 6543',email:'safia.rahimi@yahoo.com',serviceType:'Postpaid',planName:'AsiaInfo Business Pro',status:'Pending',submissionDate:'2026-11-03T09:45:00Z',createdBy:'USR-AGENT-001',createdByUsername:'agent',documents:[{id:'D009-1',name:'Tazkira Copy',type:'ID Card',uploadDate:'2026-11-03',status:'Unverified'},{id:'D009-2',name:'Photo',type:'Photo',uploadDate:'2026-11-03',status:'Unverified'},{id:'D009-3',name:'Address Proof',type:'Address Proof',uploadDate:'2026-11-03',status:'Unverified'}]},
      { id:'CAF-2026-010',customerType:'Corporate',fullName:'Jalalabad Pharma Distributors',idNumber:'C-556677',idType:'Business License',address:'Ghazi Abad Road, Jalalabad, Nangarhar, DMS',contactNumber:'+93 93 111 9999',email:'info@jlbpharma.af',serviceType:'Postpaid',planName:'AsiaInfo Enterprise Unlimited',status:'Pending',submissionDate:'2026-11-04T11:30:00Z',createdBy:'USR-AGENT-001',createdByUsername:'agent',documents:[{id:'D010-1',name:'Business License',type:'Corporate Doc',uploadDate:'2026-11-04',status:'Unverified'},{id:'D010-2',name:'Signatory POA',type:'Legal',uploadDate:'2026-11-04',status:'Unverified'}],corporateDetails:{companyRegNo:'NNG-2020-0156',taxId:'TIN-55667788',authorizedSignatory:'Dr. Sayed Ishaq',technicalContact:'Eng. Bismillah Kargar',staticIpRequired:true}},
      { id:'CAF-2026-011',customerType:'Individual',fullName:'Zahra Hussaini',idNumber:'P-55667788',idType:'Passport',address:'Macroyan Block 3, Kabul, DMS',contactNumber:'+93 78 555 1122',serviceType:'Data Only',planName:'AsiaInfo FiberOne Home 30Mbps',status:'Correction',submissionDate:'2026-10-28T14:20:00Z',createdBy:'USR-AGENT-001',createdByUsername:'agent',documents:[{id:'D011-1',name:'Passport Copy',type:'ID Card',uploadDate:'2026-10-28',status:'Rejected'}]},
      { id:'CAF-2026-012',customerType:'Individual',fullName:'Samiullah Khan',idNumber:'T-11223344',idType:'Tazkira',address:'Aino Mina Township, Kandahar City, DMS',contactNumber:'+93 74 333 5566',serviceType:'Prepaid',planName:'AsiaInfo Starter 10GB',status:'Correction',submissionDate:'2026-10-30T10:00:00Z',createdBy:'USR-AGENT-001',createdByUsername:'agent',documents:[{id:'D012-1',name:'Tazkira Front',type:'ID Card',uploadDate:'2026-10-30',status:'Rejected'}]},
      { id:'CAF-2026-013',customerType:'Individual',fullName:'Mohammad Daoud Safi',idNumber:'T-99887766',idType:'Tazkira',address:'Kunduz City Centre, Kunduz, DMS',contactNumber:'+93 76 222 3344',serviceType:'Prepaid',planName:'AsiaInfo Starter 10GB',status:'Rejected',submissionDate:'2026-10-25T16:00:00Z',createdBy:'USR-AGENT-001',createdByUsername:'agent',documents:[{id:'D013-1',name:'Tazkira Copy',type:'ID Card',uploadDate:'2026-10-25',status:'Rejected'}]},
      { id:'CAF-2026-014',customerType:'Corporate',fullName:'Bamyan Tourism Agency',idNumber:'C-889900',idType:'Business License',address:'Band-e-Amir Road, Bamyan, DMS',contactNumber:'+93 45 100 2200',email:'tours@bamyantourism.af',serviceType:'Data Only',planName:'AsiaInfo Fixed Wi-Fi Business',status:'Rejected',submissionDate:'2026-10-22T10:00:00Z',createdBy:'USR-AGENT-001',createdByUsername:'agent',documents:[{id:'D014-1',name:'Business License',type:'Corporate Doc',uploadDate:'2026-10-22',status:'Rejected'},{id:'D014-2',name:'Tax Certificate — Expired',type:'Tax Doc',uploadDate:'2026-10-22',status:'Rejected'}],corporateDetails:{companyRegNo:'BMY-2022-0011',taxId:'TIN-88990011',authorizedSignatory:'Hussain Ali Hazara',technicalContact:'N/A',staticIpRequired:false}},
      { id:'CAF-2026-015',customerType:'Individual',fullName:'Wakila Siddiqui',idNumber:'T-66778899',idType:'Tazkira',address:'Qala-e-Fatullah, Kabul, DMS',contactNumber:'+93 70 888 1234',serviceType:'Postpaid',planName:'AsiaInfo Business Pro',status:'Draft',submissionDate:'2026-11-06T17:00:00Z',createdBy:'USR-AGENT-001',createdByUsername:'agent',documents:[]},
    ],
    archiveEntries: [],
    nextSeq: 16,
  };
  await writeJson('cafs.json', seed);
  return seed;
}

// ── CAF Routes ─────────────────────────────────────────────────────────────────
app.get('/api/cafs', async (req, res) => {
  try {
    const store = await ensureCafs();
    res.json({ cafs: store.cafs, archiveEntries: store.archiveEntries });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

function appendHistory(caf, action, details = {}) {
  caf.history = [...(caf.history ?? []), { id: randomUUID(), action, at: new Date().toISOString(), ...details }];
}

async function validateBlueprintApplication(caf) {
  if (!caf.blueprintSnapshot) return null;
  if (!caf.blueprintSnapshot.id || !caf.blueprintSnapshot.isActive ||
      !caf.fullName?.trim() || !caf.idNumber?.trim() || !caf.contactNumber?.trim() || !caf.address?.trim()) {
    return 'Complete the required template fields before submission.';
  }
  const evidence = caf.documents?.find(doc => doc.requirementCode === 'identity' && doc.fileId);
  if (!evidence) return 'Upload the identity document before submission.';
  if (!/^FILE-[a-f0-9-]{36}$/i.test(evidence.fileId)) return 'Invalid identity document reference.';
  if (!await readJson(path.join('uploads', `${evidence.fileId}.json`))) {
    return 'Identity document was not found in storage.';
  }
  return null;
}

app.post('/api/cafs', serializeWrite(async (req, res) => {
  try {
    const store = await ensureCafs();
    const year = new Date().getFullYear();
    const seq = String(store.nextSeq || 16).padStart(3, '0');
    const { templateVersionId, templateSnapshot: _snapshot, history: _history, ...body } = req.body;
    let caf = { ...body, id: `CAF-${year}-${seq}` };
    if (templateVersionId !== undefined) {
      const template = await getPrepaidTemplate();
      if (template.id !== templateVersionId) {
        return res.status(409).json({ error: 'A newer template was published. Reopen the form to use it.' });
      }
      try {
        caf = {
          ...caf, ...validatePrepaid(template, body), templateVersionId, templateSnapshot: template,
          customerType: 'Individual', serviceType: 'Prepaid', status: 'Pending',
          planName: 'Prepaid SIM', submissionDate: new Date().toISOString(),
        };
      } catch (error) {
        return res.status(400).json({ error: error.message });
      }
    }
    const blueprintError = await validateBlueprintApplication(caf);
    if (blueprintError) return res.status(400).json({ error: blueprintError });
    appendHistory(caf, 'submitted', { status: caf.status, files: Array.isArray(caf.documents) ? caf.documents.map(doc => doc?.name).filter(Boolean) : [] });
    store.cafs.unshift(caf);
    store.nextSeq = (store.nextSeq || 16) + 1;
    await writeJson('cafs.json', store);
    res.status(201).json(caf);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}));

app.put('/api/cafs/:id', serializeWrite(async (req, res) => {
  try {
    const store = await ensureCafs();
    const idx = store.cafs.findIndex(c => c.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Not found' });
    const existing = store.cafs[idx];
    const { templateVersionId: _version, templateSnapshot: _snapshot, blueprintSnapshot: _blueprint, history: _history, ...updates } = req.body;
    if (existing.templateSnapshot) {
      if (existing.status === 'Correction' && updates.status === 'Pending') {
        try {
          const validated = validatePrepaid(existing.templateSnapshot, updates);
          const documents = validated.documents.map(doc =>
            existing.documents.find(old => old.requirementCode === doc.requirementCode && old.fileId === doc.fileId) ?? doc);
          if (existing.correction && !documents.some(doc =>
            doc.requirementCode === existing.correction.requirementCode &&
            doc.fileId !== existing.documents.find(old => old.requirementCode === doc.requirementCode)?.fileId)) {
            return res.status(400).json({ error: 'Replace the attachment requested by the reviewer.' });
          }
          const { correction: _correction, ...application } = existing;
          store.cafs[idx] = { ...application, ...validated, documents, status: 'Pending', submissionDate: new Date().toISOString() };
        } catch (error) {
          return res.status(400).json({ error: error.message });
        }
      } else if (existing.status === 'Pending' && ['Correction', 'Rejected'].includes(updates.status)) {
        if (updates.status === 'Correction') {
          const { requirementCode, reason } = updates.correction ?? {};
          if (!existing.documents.some(doc => doc.requirementCode === requirementCode) ||
              typeof reason !== 'string' || !reason.trim() || reason.length > 500) {
            return res.status(400).json({ error: 'Select an attachment and enter a correction reason (up to 500 characters).' });
          }
          store.cafs[idx] = { ...existing, status: 'Correction', correction: { requirementCode, reason: reason.trim() } };
        } else {
          store.cafs[idx] = { ...existing, status: 'Rejected' };
        }
      } else {
        return res.status(409).json({ error: 'Invalid status change for this application.' });
      }
    } else {
      if (existing.blueprintSnapshot && existing.status === 'Correction' && updates.status === 'Pending') {
        const blueprintError = await validateBlueprintApplication({ ...existing, ...updates });
        if (blueprintError) return res.status(400).json({ error: blueprintError });
      }
      if (existing.blueprintSnapshot && updates.status === 'Pending' && existing.status !== 'Correction') {
        return res.status(409).json({ error: 'Only returned applications can be resubmitted.' });
      }
      store.cafs[idx] = { ...existing, ...updates };
    }
    const updated = store.cafs[idx];
    if (existing.status !== updated.status) {
      const resubmitted = existing.status === 'Correction' && updated.status === 'Pending';
      appendHistory(updated, resubmitted ? 'resubmitted' : 'status_changed', {
        status: updated.status,
        ...(updated.status === 'Correction' && updated.correction ? { reason: updated.correction.reason } : {}),
        ...(resubmitted && Array.isArray(updated.documents) ? {
          files: updated.documents.filter(doc => doc?.name && !(Array.isArray(existing.documents) && existing.documents.some(old =>
            old && (doc.fileId ? old.fileId === doc.fileId : old.id === doc.id)))).map(doc => doc.name),
        } : {}),
      });
    }
    await writeJson('cafs.json', store);
    res.json(updated);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}));

app.delete('/api/cafs/:id', serializeWrite(async (req, res) => {
  try {
    const store = await ensureCafs();
    const idx = store.cafs.findIndex(c => c.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Not found' });
    store.cafs.splice(idx, 1);
    await writeJson('cafs.json', store);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}));

app.post('/api/cafs/:id/approve', serializeWrite(async (req, res) => {
  try {
    const store = await ensureCafs();
    const caf = store.cafs.find(item => item.id === req.params.id);
    if (!caf) return res.status(404).json({ error: 'Not found' });
    if (caf.status !== 'Pending') return res.status(409).json({ error: 'Only pending applications can be approved.' });
    if (caf.blueprintSnapshot) {
      const error = await validateBlueprintApplication(caf);
      if (error) return res.status(400).json({ error });
    }
    caf.status = 'Approved';
    appendHistory(caf, 'status_changed', { status: 'Approved' });
    await writeJson('cafs.json', store);
    res.json(caf);
  } catch (error) { res.status(500).json({ error: error.message }); }
}));

app.post('/api/cafs/:id/archive', serializeWrite(async (req, res) => {
  try {
    const store = await ensureCafs();
    const idx = store.cafs.findIndex(c => c.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Not found' });
    if (store.cafs[idx].status !== 'Approved') return res.status(409).json({ error: 'Only approved applications can be archived.' });
    if (store.cafs[idx].blueprintSnapshot) {
      const blueprintError = await validateBlueprintApplication(store.cafs[idx]);
      if (blueprintError) return res.status(400).json({ error: blueprintError });
    }
    if (store.cafs[idx].status !== 'Archived') {
      store.cafs[idx].status = 'Archived';
      if (store.cafs[idx].blueprintSnapshot) {
        store.cafs[idx].documents = store.cafs[idx].documents.map(doc => ({ ...doc, status: 'Verified' }));
      }
      appendHistory(store.cafs[idx], 'status_changed', { status: 'Archived' });
    }
    if (store.cafs[idx].templateSnapshot) {
      await writeJson('cafs.json', store);
      return res.json({ caf: store.cafs[idx], entry: null });
    }
    const cafId = req.params.id;
    const sizeKb = Math.round(650 + Math.random() * 350);
    const entry = {
      id: `arc-${cafId}-${Date.now()}`,
      name: `${cafId}-approved-archive.pdf`,
      size: `${sizeKb} KB`,
      archivedAt: new Date().toISOString(),
      type: 'pdf',
      status: 'approved',
      cafId,
    };
    store.archiveEntries = [entry, ...(store.archiveEntries || [])];
    await writeJson('cafs.json', store);
    res.json({ caf: store.cafs[idx], entry });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}));

// ── Template Routes ────────────────────────────────────────────────────────────
app.get('/api/templates', async (req, res) => {
  try {
    const data = await readJson('template_data.json');
    res.json({ templates: data?.templates || [] });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/templates', serializeWrite(async (req, res) => {
  try {
    const data = await readJson('template_data.json') || { templates: [] };
    const tpl = { ...req.body, lastModified: new Date().toISOString() };
    if (!tpl.id) return res.status(400).json({ error: 'Template ID is required.' });
    const existing = data.templates.findIndex(row => row.id === tpl.id);
    if (existing >= 0) data.templates[existing] = tpl;
    else data.templates.unshift(tpl);
    await writeJson('template_data.json', data);
    res.status(201).json(tpl);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}));

app.put('/api/templates/:id', serializeWrite(async (req, res) => {
  try {
    const data = await readJson('template_data.json') || { templates: [] };
    const idx = data.templates.findIndex(t => t.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Not found' });
    data.templates[idx] = { ...data.templates[idx], ...req.body, lastModified: new Date().toISOString() };
    await writeJson('template_data.json', data);
    res.json(data.templates[idx]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}));

app.delete('/api/templates/:id', serializeWrite(async (req, res) => {
  try {
    const data = await readJson('template_data.json') || { templates: [] };
    data.templates = data.templates.filter(t => t.id !== req.params.id);
    await writeJson('template_data.json', data);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}));

// ── Integration Connectivity Routes ───────────────────────────────────────────
async function ensureConnectivity() {
  const existing = await readJson('connectivity.json');
  if (existing) return existing;
  const seed = {
    systems: [
      { systemId:'crm', protocol:'REST', authMethod:'oauth2', endpoint:'https://crm-api.asiainfo.com/v3', timeout:30, retryCount:3, sslEnabled:true, clientId:'asiainfo-caf-app', clientSecret:'••••••••', tokenUrl:'https://auth.asiainfo.com/oauth2/token', scope:'crm.read crm.write', lastTested:'2026-11-07T06:00:00Z', testStatus:'passed' },
      { systemId:'billing', protocol:'REST', authMethod:'api_key', endpoint:'https://bss.asiainfo.com/api/v2', timeout:45, retryCount:3, sslEnabled:true, apiKey:'••••••••••••••••', apiKeyHeader:'X-BSS-API-Key', lastTested:'2026-11-07T06:00:00Z', testStatus:'passed' },
      { systemId:'provisioning', protocol:'REST', authMethod:'mtls', endpoint:'https://oss.asiainfo.com/nms/v1', timeout:60, retryCount:5, sslEnabled:true, clientCert:'asiainfo-caf-client.crt', caCert:'huawei-oss-ca.crt', lastTested:'2026-11-07T06:01:00Z', testStatus:'passed' },
      { systemId:'numbering', protocol:'REST', authMethod:'basic', endpoint:'https://nms.asiainfo.com/api', timeout:15, retryCount:2, sslEnabled:true, basicUser:'caf_service', basicPassword:'••••••••', lastTested:'2026-11-07T05:30:00Z', testStatus:'passed' },
      { systemId:'ntra', protocol:'SOAP', authMethod:'basic', endpoint:'https://portal.ntra.gov.af/api/v1/ws', timeout:120, retryCount:2, sslEnabled:true, basicUser:'ASIAINFO_OPERATOR', basicPassword:'••••••••', wsdlUrl:'https://portal.ntra.gov.af/wsdl/sim-reg.wsdl', soapAction:'SubmitSIMRegistration', lastTested:'2026-11-07T04:45:00Z', testStatus:'failed', testError:'Connection timeout after 120s — NTRA portal degraded' },
      { systemId:'kyc', protocol:'REST', authMethod:'api_key', endpoint:'https://kyc.e-tazkira.gov.af/verify/v2', timeout:30, retryCount:3, sslEnabled:true, apiKey:'••••••••••••••••', apiKeyHeader:'Authorization', lastTested:'2026-11-07T06:02:00Z', testStatus:'passed' },
    ]
  };
  await writeJson('connectivity.json', seed);
  return seed;
}

app.get('/api/connectivity', async (req, res) => {
  try {
    const data = await ensureConnectivity();
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.put('/api/connectivity/:systemId', async (req, res) => {
  try {
    const data = await ensureConnectivity();
    const idx = data.systems.findIndex(s => s.systemId === req.params.systemId);
    if (idx === -1) {
      data.systems.push({ systemId: req.params.systemId, ...req.body });
    } else {
      data.systems[idx] = { ...data.systems[idx], ...req.body };
    }
    await writeJson('connectivity.json', data);
    res.json(data.systems.find(s => s.systemId === req.params.systemId));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/connectivity/:systemId/test', async (req, res) => {
  // Simulate connection test (mock)
  await new Promise(r => setTimeout(r, 1200));
  const data = await ensureConnectivity();
  const idx = data.systems.findIndex(s => s.systemId === req.params.systemId);
  const passed = req.params.systemId !== 'ntra'; // NTRA stays degraded for demo
  const result = {
    status: passed ? 'passed' : 'failed',
    testedAt: new Date().toISOString(),
    latencyMs: passed ? Math.round(80 + Math.random() * 200) : null,
    error: passed ? null : 'Connection timeout after 120s — NTRA portal degraded',
  };
  if (idx !== -1) {
    data.systems[idx].lastTested = result.testedAt;
    data.systems[idx].testStatus = result.status;
    if (result.error) data.systems[idx].testError = result.error;
    else delete data.systems[idx].testError;
    await writeJson('connectivity.json', data);
  }
  res.json(result);
});

// ── Stats ──────────────────────────────────────────────────────────────────────
app.get('/api/stats', async (req, res) => {
  try {
    const store = await ensureCafs();
    const cafs = store.cafs || [];
    res.json({
      total: cafs.length,
      pending: cafs.filter(c => c.status === 'Pending').length,
      approved: cafs.filter(c => c.status === 'Approved').length,
      rejected: cafs.filter(c => c.status === 'Rejected').length,
      correction: cafs.filter(c => c.status === 'Correction').length,
      archived: cafs.filter(c => c.status === 'Archived').length,
      individual: cafs.filter(c => c.customerType === 'Individual').length,
      corporate: cafs.filter(c => c.customerType === 'Corporate').length,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.listen(PORT, () => {
  console.log(`[AsiaInfo API] Server running on http://localhost:${PORT}`);
});
