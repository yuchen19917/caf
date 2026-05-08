import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer } from 'http';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '..', 'data');
const PORT = 4000;

const app = express();
app.use(express.json({ limit: '50mb' }));

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
  await fs.writeFile(path.join(DATA_DIR, file), JSON.stringify(data, null, 2), 'utf8');
}

// Seed cafs.json from mockData if missing
async function ensureCafs() {
  const existing = await readJson('cafs.json');
  if (existing) return existing;
  const seed = {
    cafs: [
      { id:'CAF-2026-001',customerType:'Individual',fullName:'Ahmad Karimi',idNumber:'T-20481922',idType:'Tazkira',address:'Karte 3, District 6, Kabul, Afghanistan',contactNumber:'+93 70 456 7890',email:'ahmad.karimi@gmail.com',serviceType:'Prepaid',planName:'ATOMA Elite 50GB',status:'Approved',submissionDate:'2026-04-10T08:30:00Z',createdBy:'USR-AGENT-001',createdByUsername:'agent',documents:[{id:'D001-1',name:'Tazkira Front',type:'ID Card',uploadDate:'2026-04-10',status:'Verified'},{id:'D001-2',name:'Customer Photo',type:'Photo',uploadDate:'2026-04-10',status:'Verified'},{id:'D001-3',name:'SIM Application Form',type:'SIM Form',uploadDate:'2026-04-10',status:'Verified'}]},
      { id:'CAF-2026-002',customerType:'Corporate',fullName:'Afghan Tech Solutions Ltd',idNumber:'C-998877',idType:'Business License',address:'Shahr-e-Naw Industrial Zone, Kabul, Afghanistan',contactNumber:'+93 20 888 9999',email:'ops@afghantechsolutions.af',serviceType:'Postpaid',planName:'ATOMA Enterprise Unlimited',status:'Approved',submissionDate:'2026-04-12T09:15:00Z',createdBy:'USR-AGENT-001',createdByUsername:'agent',documents:[{id:'D002-1',name:'Business License',type:'Corporate Doc',uploadDate:'2026-04-12',status:'Verified'},{id:'D002-2',name:'Authorized Signatory POA',type:'Legal',uploadDate:'2026-04-12',status:'Verified'},{id:'D002-3',name:'Company Tax Certificate',type:'Tax Doc',uploadDate:'2026-04-12',status:'Verified'}],corporateDetails:{companyRegNo:'L-55442',taxId:'TIN-44556677',authorizedSignatory:'Ahmad Wali',technicalContact:'Khalid Jamil',staticIpRequired:true}},
      { id:'CAF-2026-003',customerType:'Individual',fullName:'Fahima Noori',idNumber:'P-77881234',idType:'Passport',address:'Wazir Akbar Khan, Kabul, Afghanistan',contactNumber:'+93 79 322 8811',email:'fahima.noori@hotmail.com',serviceType:'Postpaid',planName:'ATOMA Business Pro',status:'Approved',submissionDate:'2026-04-15T11:00:00Z',createdBy:'USR-AGENT-001',createdByUsername:'agent',documents:[{id:'D003-1',name:'Passport Copy',type:'ID Card',uploadDate:'2026-04-15',status:'Verified'},{id:'D003-2',name:'Customer Photo',type:'Photo',uploadDate:'2026-04-15',status:'Verified'},{id:'D003-3',name:'Address Proof',type:'Address Proof',uploadDate:'2026-04-15',status:'Verified'}]},
      { id:'CAF-2026-004',customerType:'Corporate',fullName:'Herat Cement Company',idNumber:'C-771234',idType:'Business License',address:'Herat Industrial Park, Phase 2, Herat, Afghanistan',contactNumber:'+93 40 555 6666',email:'admin@heratcement.af',serviceType:'Data Only',planName:'ATOMA DIA-ILL 100Mbps',status:'Approved',submissionDate:'2026-04-18T07:45:00Z',createdBy:'USR-AGENT-001',createdByUsername:'agent',documents:[{id:'D004-1',name:'Business Registration',type:'Corporate Doc',uploadDate:'2026-04-18',status:'Verified'},{id:'D004-2',name:'Site Survey Report',type:'Technical Doc',uploadDate:'2026-04-18',status:'Verified'},{id:'D004-3',name:'Signatory ID',type:'ID Card',uploadDate:'2026-04-18',status:'Verified'}],corporateDetails:{companyRegNo:'HRT-2018-0443',taxId:'TIN-77123400',authorizedSignatory:'Eng. Mirwais Sediqi',technicalContact:'IT Manager - Rahmat Ghafari',staticIpRequired:true}},
      { id:'CAF-2026-005',customerType:'Individual',fullName:'Najiba Ahmadzai',idNumber:'T-55667788',idType:'Tazkira',address:'Karte 4, District 7, Kabul, Afghanistan',contactNumber:'+93 78 112 5544',serviceType:'Prepaid',planName:'ATOMA Starter 10GB',status:'Approved',submissionDate:'2026-04-20T13:30:00Z',createdBy:'USR-AGENT-001',createdByUsername:'agent',documents:[{id:'D005-1',name:'Tazkira Front',type:'ID Card',uploadDate:'2026-04-20',status:'Verified'},{id:'D005-2',name:'Photo',type:'Photo',uploadDate:'2026-04-20',status:'Verified'}]},
      { id:'CAF-2026-006',customerType:'Corporate',fullName:'Global Logistics Group (Mazar)',idNumber:'C-112233',idType:'Business License',address:'Airport Road, Mazar-i-Sharif, Balkh, Afghanistan',contactNumber:'+93 50 444 3333',email:'logistics@glg-mazar.af',serviceType:'Postpaid',planName:'ATOMA Enterprise Unlimited',status:'Archived',submissionDate:'2026-03-05T09:00:00Z',createdBy:'USR-AGENT-001',createdByUsername:'agent',documents:[{id:'D006-1',name:'Business License',type:'Corporate Doc',uploadDate:'2026-03-05',status:'Verified'},{id:'D006-2',name:'Tax Certificate',type:'Tax Doc',uploadDate:'2026-03-05',status:'Verified'}],corporateDetails:{companyRegNo:'MZR-2015-0089',taxId:'TIN-11223344',authorizedSignatory:'Omar Barakzai',technicalContact:'Shafi Nuristani',staticIpRequired:false}},
      { id:'CAF-2026-007',customerType:'Individual',fullName:'Abdul Rahman Wali',idNumber:'T-88776655',idType:'Tazkira',address:'Share Naw, Kandahar City, Kandahar, Afghanistan',contactNumber:'+93 74 111 2222',serviceType:'Prepaid',planName:'ATOMA Elite 50GB',status:'Pending',submissionDate:'2026-05-01T10:00:00Z',createdBy:'USR-AGENT-001',createdByUsername:'agent',documents:[{id:'D007-1',name:'Tazkira Front',type:'ID Card',uploadDate:'2026-05-01',status:'Unverified'},{id:'D007-2',name:'Customer Photo',type:'Photo',uploadDate:'2026-05-01',status:'Unverified'}]},
      { id:'CAF-2026-008',customerType:'Corporate',fullName:'Mazar Trading Group',idNumber:'C-334455',idType:'Business License',address:'Balkh Street, Mazar-i-Sharif, Afghanistan',contactNumber:'+93 50 777 8888',email:'ceo@mazartrading.af',serviceType:'Data Only',planName:'ATOMA Fixed Wi-Fi Business',status:'Pending',submissionDate:'2026-05-02T14:20:00Z',createdBy:'USR-AGENT-001',createdByUsername:'agent',documents:[{id:'D008-1',name:'Business Registration',type:'Corporate Doc',uploadDate:'2026-05-02',status:'Unverified'},{id:'D008-2',name:'Authorized Signatory Tazkira',type:'ID Card',uploadDate:'2026-05-02',status:'Unverified'}],corporateDetails:{companyRegNo:'MZR-2019-0321',taxId:'TIN-33445566',authorizedSignatory:'Habibullah Turabi',technicalContact:'Wakil Muhammadi',staticIpRequired:false}},
      { id:'CAF-2026-009',customerType:'Individual',fullName:'Safia Rahimi',idNumber:'T-44332211',idType:'Tazkira',address:'Karte Char, District 8, Kabul, Afghanistan',contactNumber:'+93 70 987 6543',email:'safia.rahimi@yahoo.com',serviceType:'Postpaid',planName:'ATOMA Business Pro',status:'Pending',submissionDate:'2026-05-03T09:45:00Z',createdBy:'USR-AGENT-001',createdByUsername:'agent',documents:[{id:'D009-1',name:'Tazkira Copy',type:'ID Card',uploadDate:'2026-05-03',status:'Unverified'},{id:'D009-2',name:'Photo',type:'Photo',uploadDate:'2026-05-03',status:'Unverified'},{id:'D009-3',name:'Address Proof',type:'Address Proof',uploadDate:'2026-05-03',status:'Unverified'}]},
      { id:'CAF-2026-010',customerType:'Corporate',fullName:'Jalalabad Pharma Distributors',idNumber:'C-556677',idType:'Business License',address:'Ghazi Abad Road, Jalalabad, Nangarhar, Afghanistan',contactNumber:'+93 93 111 9999',email:'info@jlbpharma.af',serviceType:'Postpaid',planName:'ATOMA Enterprise Unlimited',status:'Pending',submissionDate:'2026-05-04T11:30:00Z',createdBy:'USR-AGENT-001',createdByUsername:'agent',documents:[{id:'D010-1',name:'Business License',type:'Corporate Doc',uploadDate:'2026-05-04',status:'Unverified'},{id:'D010-2',name:'Signatory POA',type:'Legal',uploadDate:'2026-05-04',status:'Unverified'}],corporateDetails:{companyRegNo:'NNG-2020-0156',taxId:'TIN-55667788',authorizedSignatory:'Dr. Sayed Ishaq',technicalContact:'Eng. Bismillah Kargar',staticIpRequired:true}},
      { id:'CAF-2026-011',customerType:'Individual',fullName:'Zahra Hussaini',idNumber:'P-55667788',idType:'Passport',address:'Macroyan Block 3, Kabul, Afghanistan',contactNumber:'+93 78 555 1122',serviceType:'Data Only',planName:'ATOMA FiberOne Home 30Mbps',status:'Correction',submissionDate:'2026-04-28T14:20:00Z',createdBy:'USR-AGENT-001',createdByUsername:'agent',documents:[{id:'D011-1',name:'Passport Copy',type:'ID Card',uploadDate:'2026-04-28',status:'Rejected'}]},
      { id:'CAF-2026-012',customerType:'Individual',fullName:'Samiullah Khan',idNumber:'T-11223344',idType:'Tazkira',address:'Aino Mina Township, Kandahar City, Afghanistan',contactNumber:'+93 74 333 5566',serviceType:'Prepaid',planName:'ATOMA Starter 10GB',status:'Correction',submissionDate:'2026-04-30T10:00:00Z',createdBy:'USR-AGENT-001',createdByUsername:'agent',documents:[{id:'D012-1',name:'Tazkira Front',type:'ID Card',uploadDate:'2026-04-30',status:'Rejected'}]},
      { id:'CAF-2026-013',customerType:'Individual',fullName:'Mohammad Daoud Safi',idNumber:'T-99887766',idType:'Tazkira',address:'Kunduz City Centre, Kunduz, Afghanistan',contactNumber:'+93 76 222 3344',serviceType:'Prepaid',planName:'ATOMA Starter 10GB',status:'Rejected',submissionDate:'2026-04-25T16:00:00Z',createdBy:'USR-AGENT-001',createdByUsername:'agent',documents:[{id:'D013-1',name:'Tazkira Copy',type:'ID Card',uploadDate:'2026-04-25',status:'Rejected'}]},
      { id:'CAF-2026-014',customerType:'Corporate',fullName:'Bamyan Tourism Agency',idNumber:'C-889900',idType:'Business License',address:'Band-e-Amir Road, Bamyan, Afghanistan',contactNumber:'+93 45 100 2200',email:'tours@bamyantourism.af',serviceType:'Data Only',planName:'ATOMA Fixed Wi-Fi Business',status:'Rejected',submissionDate:'2026-04-22T10:00:00Z',createdBy:'USR-AGENT-001',createdByUsername:'agent',documents:[{id:'D014-1',name:'Business License',type:'Corporate Doc',uploadDate:'2026-04-22',status:'Rejected'},{id:'D014-2',name:'Tax Certificate — Expired',type:'Tax Doc',uploadDate:'2026-04-22',status:'Rejected'}],corporateDetails:{companyRegNo:'BMY-2022-0011',taxId:'TIN-88990011',authorizedSignatory:'Hussain Ali Hazara',technicalContact:'N/A',staticIpRequired:false}},
      { id:'CAF-2026-015',customerType:'Individual',fullName:'Wakila Siddiqui',idNumber:'T-66778899',idType:'Tazkira',address:'Qala-e-Fatullah, Kabul, Afghanistan',contactNumber:'+93 70 888 1234',serviceType:'Postpaid',planName:'ATOMA Business Pro',status:'Draft',submissionDate:'2026-05-06T17:00:00Z',createdBy:'USR-AGENT-001',createdByUsername:'agent',documents:[]},
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

app.post('/api/cafs', async (req, res) => {
  try {
    const store = await ensureCafs();
    const year = new Date().getFullYear();
    const seq = String(store.nextSeq || 16).padStart(3, '0');
    const caf = { ...req.body, id: `CAF-${year}-${seq}` };
    store.cafs.unshift(caf);
    store.nextSeq = (store.nextSeq || 16) + 1;
    await writeJson('cafs.json', store);
    res.status(201).json(caf);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.put('/api/cafs/:id', async (req, res) => {
  try {
    const store = await ensureCafs();
    const idx = store.cafs.findIndex(c => c.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Not found' });
    store.cafs[idx] = { ...store.cafs[idx], ...req.body };
    await writeJson('cafs.json', store);
    res.json(store.cafs[idx]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.delete('/api/cafs/:id', async (req, res) => {
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
});

app.post('/api/cafs/:id/archive', async (req, res) => {
  try {
    const store = await ensureCafs();
    const idx = store.cafs.findIndex(c => c.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Not found' });
    store.cafs[idx].status = 'Archived';
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
});

// ── Template Routes ────────────────────────────────────────────────────────────
app.get('/api/templates', async (req, res) => {
  try {
    const data = await readJson('template_data.json');
    res.json({ templates: data?.templates || [] });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/templates', async (req, res) => {
  try {
    const data = await readJson('template_data.json') || { templates: [] };
    const tpl = { ...req.body, lastModified: new Date().toISOString() };
    data.templates.unshift(tpl);
    await writeJson('template_data.json', data);
    res.status(201).json(tpl);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.put('/api/templates/:id', async (req, res) => {
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
});

app.delete('/api/templates/:id', async (req, res) => {
  try {
    const data = await readJson('template_data.json') || { templates: [] };
    data.templates = data.templates.filter(t => t.id !== req.params.id);
    await writeJson('template_data.json', data);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── Integration Connectivity Routes ───────────────────────────────────────────
async function ensureConnectivity() {
  const existing = await readJson('connectivity.json');
  if (existing) return existing;
  const seed = {
    systems: [
      { systemId:'crm', protocol:'REST', authMethod:'oauth2', endpoint:'https://crm-api.atoma.af/v3', timeout:30, retryCount:3, sslEnabled:true, clientId:'atoma-caf-app', clientSecret:'••••••••', tokenUrl:'https://auth.atoma.af/oauth2/token', scope:'crm.read crm.write', lastTested:'2026-05-07T06:00:00Z', testStatus:'passed' },
      { systemId:'billing', protocol:'REST', authMethod:'api_key', endpoint:'https://bss.atoma.af/api/v2', timeout:45, retryCount:3, sslEnabled:true, apiKey:'••••••••••••••••', apiKeyHeader:'X-BSS-API-Key', lastTested:'2026-05-07T06:00:00Z', testStatus:'passed' },
      { systemId:'provisioning', protocol:'REST', authMethod:'mtls', endpoint:'https://oss.atoma.af/nms/v1', timeout:60, retryCount:5, sslEnabled:true, clientCert:'atoma-caf-client.crt', caCert:'huawei-oss-ca.crt', lastTested:'2026-05-07T06:01:00Z', testStatus:'passed' },
      { systemId:'numbering', protocol:'REST', authMethod:'basic', endpoint:'https://nms.atoma.af/api', timeout:15, retryCount:2, sslEnabled:true, basicUser:'caf_service', basicPassword:'••••••••', lastTested:'2026-05-07T05:30:00Z', testStatus:'passed' },
      { systemId:'ntra', protocol:'SOAP', authMethod:'basic', endpoint:'https://portal.ntra.gov.af/api/v1/ws', timeout:120, retryCount:2, sslEnabled:true, basicUser:'ATOMA_OPERATOR', basicPassword:'••••••••', wsdlUrl:'https://portal.ntra.gov.af/wsdl/sim-reg.wsdl', soapAction:'SubmitSIMRegistration', lastTested:'2026-05-07T04:45:00Z', testStatus:'failed', testError:'Connection timeout after 120s — NTRA portal degraded' },
      { systemId:'kyc', protocol:'REST', authMethod:'api_key', endpoint:'https://kyc.e-tazkira.gov.af/verify/v2', timeout:30, retryCount:3, sslEnabled:true, apiKey:'••••••••••••••••', apiKeyHeader:'Authorization', lastTested:'2026-05-07T06:02:00Z', testStatus:'passed' },
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
  console.log(`[ATOMA API] Server running on http://localhost:${PORT}`);
});
