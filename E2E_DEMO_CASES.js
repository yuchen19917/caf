/**
 * CAF System — 10 E2E Demo Test Cases
 * Run with: node E2E_DEMO_CASES.js
 * Requires the server running on http://localhost:4000
 */

const BASE = 'http://localhost:4000/api';

// ── Helpers ────────────────────────────────────────────────────────────────────
async function api(method, path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(`${method} ${path} → HTTP ${res.status}: ${err.error || JSON.stringify(err)}`);
  }
  return res.json();
}

const get  = (path)        => api('GET', path);
const post = (path, body)  => api('POST', path, body);
const put  = (path, body)  => api('PUT', path, body);
const del  = (path)        => api('DELETE', path);

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (!condition) throw new Error(`Assertion failed: ${message}`);
}

async function runCase(id, name, fn) {
  process.stdout.write(`  [${id}] ${name} ... `);
  try {
    await fn();
    console.log('✓ PASS');
    passed++;
  } catch (e) {
    console.log(`✗ FAIL\n       ${e.message}`);
    failed++;
  }
}

// ── TC-001: Individual Customer Full Lifecycle ─────────────────────────────────
async function tc001() {
  // Create a new individual CAF
  const created = await post('/cafs', {
    customerType: 'Individual',
    fullName: 'Demo User TC001',
    idNumber: 'T-TC001-TEST',
    idType: 'Tazkira',
    address: 'Test Street 1, Kabul',
    contactNumber: '+93 70 000 0001',
    email: 'tc001@demo.af',
    serviceType: 'Prepaid',
    planName: 'AsiaInfo Starter 10GB',
    status: 'Pending',
    submissionDate: new Date().toISOString(),
    documents: [{ id: 'D-TC001-1', name: 'Tazkira Front', type: 'ID Card', uploadDate: new Date().toISOString().slice(0,10), status: 'Unverified' }],
    createdBy: 'USR-AGENT-001',
    createdByUsername: 'agent',
  });
  assert(created.id, 'Created CAF must have an id');
  assert(created.status === 'Pending', 'Newly created CAF must be Pending');
  assert(created.fullName === 'Demo User TC001', 'fullName must be persisted');

  // Verify it appears in GET /cafs
  const { cafs } = await get('/cafs');
  const found = cafs.find(c => c.id === created.id);
  assert(found, 'Created CAF must appear in GET /cafs');

  // Approve and archive
  const { caf: archived, entry } = await post(`/cafs/${created.id}/archive`);
  assert(archived.status === 'Archived', 'CAF status must become Archived after archive');
  assert(entry.cafId === created.id, 'Archive entry must reference original CAF id');
  assert(entry.type === 'pdf', 'Archive entry type must be pdf');

  // Verify archived state persisted
  const { cafs: cafs2, archiveEntries } = await get('/cafs');
  const archivedCaf = cafs2.find(c => c.id === created.id);
  assert(archivedCaf?.status === 'Archived', 'Archived status must persist in storage');
  const archEntry = archiveEntries.find(e => e.cafId === created.id);
  assert(archEntry, 'Archive entry must persist in storage');

  // Cleanup
  await del(`/cafs/${created.id}`);
}

// ── TC-002: Corporate Customer with All Fields ─────────────────────────────────
async function tc002() {
  const created = await post('/cafs', {
    customerType: 'Corporate',
    fullName: 'Demo Corp TC002 Ltd',
    idNumber: 'C-TC002-TEST',
    idType: 'Business License',
    address: 'Industrial Zone, Kabul',
    contactNumber: '+93 20 000 0002',
    email: 'ops@tc002.af',
    serviceType: 'Postpaid',
    planName: 'AsiaInfo Enterprise Unlimited',
    status: 'Pending',
    submissionDate: new Date().toISOString(),
    documents: [
      { id: 'D-TC002-1', name: 'Business License', type: 'Corporate Doc', uploadDate: new Date().toISOString().slice(0,10), status: 'Unverified' },
      { id: 'D-TC002-2', name: 'Tax Certificate', type: 'Tax Doc', uploadDate: new Date().toISOString().slice(0,10), status: 'Unverified' },
    ],
    createdBy: 'USR-AGENT-001',
    createdByUsername: 'agent',
    corporateDetails: {
      companyRegNo: 'KBL-TC002-0001',
      taxId: 'TIN-TC002-0002',
      authorizedSignatory: 'Ahmad Demo',
      technicalContact: 'Tech Demo',
      staticIpRequired: true,
    },
  });

  assert(created.customerType === 'Corporate', 'customerType must be Corporate');
  assert(created.corporateDetails?.companyRegNo === 'KBL-TC002-0001', 'corporateDetails.companyRegNo must be stored');
  assert(created.corporateDetails?.staticIpRequired === true, 'staticIpRequired must be stored');
  assert(created.documents.length === 2, 'All 2 documents must be stored');

  // Verify persistence
  const { cafs } = await get('/cafs');
  const found = cafs.find(c => c.id === created.id);
  assert(found?.corporateDetails?.taxId === 'TIN-TC002-0002', 'Corporate taxId must persist');

  // Cleanup
  await del(`/cafs/${created.id}`);
}

// ── TC-003: Reject Pending CAF ─────────────────────────────────────────────────
async function tc003() {
  const created = await post('/cafs', {
    customerType: 'Individual',
    fullName: 'Demo Reject TC003',
    idNumber: 'T-TC003-TEST',
    idType: 'Tazkira',
    address: 'Test Street 3, Kabul',
    contactNumber: '+93 70 000 0003',
    serviceType: 'Prepaid',
    planName: 'AsiaInfo Starter 10GB',
    status: 'Pending',
    submissionDate: new Date().toISOString(),
    documents: [{ id: 'D-TC003-1', name: 'Tazkira', type: 'ID Card', uploadDate: new Date().toISOString().slice(0,10), status: 'Unverified' }],
    createdBy: 'USR-AGENT-001',
    createdByUsername: 'agent',
  });

  // Reject the CAF
  const rejected = await put(`/cafs/${created.id}`, { status: 'Rejected' });
  assert(rejected.status === 'Rejected', 'CAF status must become Rejected');
  assert(rejected.id === created.id, 'Rejected CAF must preserve id');
  assert(rejected.fullName === 'Demo Reject TC003', 'Rejected CAF must preserve fullName');

  // Verify persisted
  const { cafs } = await get('/cafs');
  const found = cafs.find(c => c.id === created.id);
  assert(found?.status === 'Rejected', 'Rejected status must persist in storage');

  // Verify stats reflect rejection
  const stats = await get('/stats');
  assert(typeof stats.rejected === 'number', 'Stats must have a rejected count');

  // Cleanup
  await del(`/cafs/${created.id}`);
}

// ── TC-004: Correction Workflow — Agent Resubmits ──────────────────────────────
async function tc004() {
  const created = await post('/cafs', {
    customerType: 'Individual',
    fullName: 'Demo Correction TC004',
    idNumber: 'T-TC004-ORIG',
    idType: 'Tazkira',
    address: 'Original Street, Kabul',
    contactNumber: '+93 70 000 0004',
    serviceType: 'Prepaid',
    planName: 'AsiaInfo Starter 10GB',
    status: 'Pending',
    submissionDate: new Date().toISOString(),
    documents: [],
    createdBy: 'USR-AGENT-001',
    createdByUsername: 'agent',
  });

  // Auditor requests correction
  const corrected = await put(`/cafs/${created.id}`, { status: 'Correction' });
  assert(corrected.status === 'Correction', 'CAF status must become Correction');

  // Agent resubmits with updated address and new document
  const resubmitted = await put(`/cafs/${created.id}`, {
    ...corrected,
    address: 'Updated Street, Kabul',
    status: 'Pending',
    submissionDate: new Date().toISOString(),
    documents: [{ id: 'D-TC004-r1', name: 'Tazkira (resubmit)', type: 'ID Card', uploadDate: new Date().toISOString().slice(0,10), status: 'Unverified' }],
  });
  assert(resubmitted.status === 'Pending', 'Resubmitted CAF must return to Pending');
  assert(resubmitted.address === 'Updated Street, Kabul', 'Updated address must persist');
  assert(resubmitted.documents.length === 1, 'New document must be present');
  assert(resubmitted.id === created.id, 'CAF id must not change on resubmit');

  // Verify correction → pending → not in correction state
  const { cafs } = await get('/cafs');
  const found = cafs.find(c => c.id === created.id);
  assert(found?.status === 'Pending', 'Resubmitted status must persist as Pending');

  // Cleanup
  await del(`/cafs/${created.id}`);
}

// ── TC-005: Template CRUD ──────────────────────────────────────────────────────
async function tc005() {
  const { templates: before } = await get('/templates');
  const beforeCount = before.length;

  // Create template
  const tpl = await post('/templates', {
    id: `TPL-TC005-${Date.now()}`,
    name: 'TC005 Demo Template',
    description: 'E2E test template',
    customerType: 'Individual',
    businessType: 'Consumer',
    channel: 'Direct',
    product: 'Prepaid SIM',
    fields: [
      { id: 'f1', label: 'Full Name', type: 'text', required: true },
      { id: 'f2', label: 'ID Number', type: 'text', required: true },
    ],
    version: '1.0',
    lifecycle: 'draft',
    isActive: false,
  });
  assert(tpl.name === 'TC005 Demo Template', 'Template must be created with correct name');
  assert(tpl.lastModified, 'Server must set lastModified');

  // Verify count increased
  const { templates: after } = await get('/templates');
  assert(after.length === beforeCount + 1, 'Templates count must increase by 1');

  // Edit template
  const updated = await put(`/templates/${tpl.id}`, { ...tpl, lifecycle: 'active', isActive: true });
  assert(updated.lifecycle === 'active', 'Lifecycle must update to active');
  assert(updated.isActive === true, 'isActive must update to true');

  // Verify edit persisted
  const { templates: after2 } = await get('/templates');
  const found = after2.find(t => t.id === tpl.id);
  assert(found?.lifecycle === 'active', 'Lifecycle must persist as active');

  // Delete template
  await del(`/templates/${tpl.id}`);

  // Verify deletion
  const { templates: after3 } = await get('/templates');
  assert(after3.length === beforeCount, 'Templates count must return to original after delete');
  assert(!after3.find(t => t.id === tpl.id), 'Deleted template must not appear in list');
}

// ── TC-006: Stats Consistency ──────────────────────────────────────────────────
async function tc006() {
  const [{ cafs }, stats] = await Promise.all([get('/cafs'), get('/stats')]);

  const expectedPending  = cafs.filter(c => c.status === 'Pending').length;
  const expectedApproved = cafs.filter(c => c.status === 'Approved').length;
  const expectedRejected = cafs.filter(c => c.status === 'Rejected').length;
  const expectedArchived = cafs.filter(c => c.status === 'Archived').length;
  const expectedTotal    = cafs.length;

  assert(stats.total    === expectedTotal,    `stats.total ${stats.total} must equal CAF count ${expectedTotal}`);
  assert(stats.pending  === expectedPending,  `stats.pending ${stats.pending} must equal filtered count ${expectedPending}`);
  assert(stats.approved === expectedApproved, `stats.approved ${stats.approved} must equal filtered count ${expectedApproved}`);
  assert(stats.rejected === expectedRejected, `stats.rejected ${stats.rejected} must equal filtered count ${expectedRejected}`);
  assert(stats.archived === expectedArchived, `stats.archived ${stats.archived} must equal filtered count ${expectedArchived}`);

  // Verify individual/corporate breakdown
  const expectedIndividual = cafs.filter(c => c.customerType === 'Individual').length;
  const expectedCorporate  = cafs.filter(c => c.customerType === 'Corporate').length;
  assert(stats.individual === expectedIndividual, `stats.individual ${stats.individual} must equal ${expectedIndividual}`);
  assert(stats.corporate  === expectedCorporate,  `stats.corporate ${stats.corporate} must equal ${expectedCorporate}`);
}

// ── TC-007: Stats Update After Create/Approve/Reject ─────────────────────────
async function tc007() {
  const statsBefore = await get('/stats');

  // Create 2 new CAFs
  const c1 = await post('/cafs', {
    customerType: 'Individual', fullName: 'TC007 User A', idNumber: 'T-TC007-A',
    idType: 'Tazkira', address: 'Kabul', contactNumber: '+93 70 000 0071',
    serviceType: 'Prepaid', planName: 'AsiaInfo Starter', status: 'Pending',
    submissionDate: new Date().toISOString(), documents: [],
    createdBy: 'USR-AGENT-001', createdByUsername: 'agent',
  });
  const c2 = await post('/cafs', {
    customerType: 'Corporate', fullName: 'TC007 Corp B', idNumber: 'C-TC007-B',
    idType: 'Business License', address: 'Kabul', contactNumber: '+93 20 000 0072',
    serviceType: 'Postpaid', planName: 'AsiaInfo Enterprise', status: 'Pending',
    submissionDate: new Date().toISOString(), documents: [],
    createdBy: 'USR-AGENT-001', createdByUsername: 'agent',
    corporateDetails: { companyRegNo: 'TC007-001', taxId: 'TIN-TC007', authorizedSignatory: 'TC007 Sig', technicalContact: 'TC007 Tech', staticIpRequired: false },
  });

  const statsAfterCreate = await get('/stats');
  assert(statsAfterCreate.total === statsBefore.total + 2, 'Total must increase by 2');
  assert(statsAfterCreate.pending === statsBefore.pending + 2, 'Pending must increase by 2');
  assert(statsAfterCreate.individual === statsBefore.individual + 1, 'Individual must increase by 1');
  assert(statsAfterCreate.corporate === statsBefore.corporate + 1, 'Corporate must increase by 1');

  // Approve c1
  await post(`/cafs/${c1.id}/archive`);
  // Reject c2
  await put(`/cafs/${c2.id}`, { status: 'Rejected' });

  const statsAfterActions = await get('/stats');
  assert(statsAfterActions.archived === statsBefore.archived + 1, 'Archived must increase by 1 after approval');
  assert(statsAfterActions.rejected === statsBefore.rejected + 1, 'Rejected must increase by 1');
  // pending should be back to original (2 created, 2 resolved)
  assert(statsAfterActions.pending === statsBefore.pending, 'Pending must return to original');

  // Cleanup
  await del(`/cafs/${c1.id}`);
  await del(`/cafs/${c2.id}`);
}

// ── TC-008: Search and Filter Consistency ─────────────────────────────────────
async function tc008() {
  // Create 3 CAFs with distinct names and statuses
  const names = ['TC008 Alpha', 'TC008 Beta', 'TC008 Gamma'];
  const statuses = ['Pending', 'Approved', 'Rejected'];
  const ids = [];

  for (let i = 0; i < 3; i++) {
    const c = await post('/cafs', {
      customerType: 'Individual', fullName: names[i], idNumber: `T-TC008-${i}`,
      idType: 'Tazkira', address: 'Kabul', contactNumber: `+93 70 000 008${i}`,
      serviceType: 'Prepaid', planName: 'AsiaInfo Starter', status: statuses[i],
      submissionDate: new Date().toISOString(), documents: [],
      createdBy: 'USR-AGENT-001', createdByUsername: 'agent',
    });
    ids.push(c.id);
  }

  const { cafs } = await get('/cafs');

  // Name search simulation: "TC008"
  const searchMatches = cafs.filter(c => c.fullName.includes('TC008'));
  assert(searchMatches.length === 3, 'Search for "TC008" must return exactly 3 results');

  // Status filter: only Pending TC008s
  const pendingTC008 = cafs.filter(c => c.fullName.includes('TC008') && c.status === 'Pending');
  assert(pendingTC008.length === 1, 'Filter Pending+TC008 must return 1 result');
  assert(pendingTC008[0].fullName === 'TC008 Alpha', 'Pending TC008 must be Alpha');

  // Status filter: Rejected
  const rejectedTC008 = cafs.filter(c => c.fullName.includes('TC008') && c.status === 'Rejected');
  assert(rejectedTC008.length === 1, 'Filter Rejected+TC008 must return 1 result');
  assert(rejectedTC008[0].fullName === 'TC008 Gamma', 'Rejected TC008 must be Gamma');

  // Cleanup
  for (const id of ids) await del(`/cafs/${id}`);
}

// ── TC-009: Archive Entry and Document Library Consistency ───────────────────
async function tc009() {
  const { archiveEntries: before } = await get('/cafs');
  const beforeCount = before.length;

  // Create and approve CAF
  const created = await post('/cafs', {
    customerType: 'Individual', fullName: 'TC009 Archive Test', idNumber: 'T-TC009',
    idType: 'Tazkira', address: 'Kabul', contactNumber: '+93 70 000 0009',
    serviceType: 'Prepaid', planName: 'AsiaInfo Elite 50GB', status: 'Pending',
    submissionDate: new Date().toISOString(), documents: [],
    createdBy: 'USR-AGENT-001', createdByUsername: 'agent',
  });
  const { caf, entry } = await post(`/cafs/${created.id}/archive`);

  // Verify archive entry fields
  assert(entry.cafId === created.id, 'entry.cafId must match original CAF id');
  assert(entry.type === 'pdf', 'entry.type must be pdf');
  assert(entry.status === 'approved', 'entry.status must be approved');
  assert(entry.archivedAt, 'entry.archivedAt must be set');
  assert(entry.name.includes(created.id), 'entry.name must reference CAF id');
  assert(typeof entry.size === 'string' && entry.size.includes('KB'), 'entry.size must be in KB');

  // Verify archive count increased
  const { archiveEntries: after } = await get('/cafs');
  assert(after.length === beforeCount + 1, 'Archive entries must increase by 1');

  // Verify CAF status in same response
  const archivedCaf = after.find ? (await get('/cafs')).cafs.find(c => c.id === created.id) : null;
  assert(archivedCaf?.status === 'Archived', 'CAF must show Archived status after archive');

  // Cleanup
  await del(`/cafs/${created.id}`);
}

// ── TC-010: Connectivity Test Result Persistence ──────────────────────────────
async function tc010() {
  const { systems: before } = await get('/connectivity');
  assert(before.length > 0, 'Must have at least one connectivity system');

  // Test CRM system (should pass)
  const crmBefore = before.find(s => s.systemId === 'crm');
  assert(crmBefore, 'CRM system must exist');

  const testResult = await post('/connectivity/crm/test');
  assert(testResult.status === 'passed', 'CRM connectivity test must pass');
  assert(typeof testResult.latencyMs === 'number', 'Latency must be a number');
  assert(testResult.testedAt, 'testedAt must be set');
  assert(testResult.error === null, 'error must be null for passing test');

  // Verify result persisted
  const { systems: after } = await get('/connectivity');
  const crmAfter = after.find(s => s.systemId === 'crm');
  assert(crmAfter?.testStatus === 'passed', 'testStatus must persist as passed');
  assert(crmAfter?.lastTested === testResult.testedAt, 'lastTested must be updated');

  // Test NTRA system (expected to fail)
  const ntraResult = await post('/connectivity/ntra/test');
  assert(ntraResult.status === 'failed', 'NTRA test must return failed status');
  assert(ntraResult.latencyMs === null, 'latencyMs must be null on failure');
  assert(typeof ntraResult.error === 'string', 'error must be a string on failure');

  // Verify NTRA failure persisted
  const { systems: after2 } = await get('/connectivity');
  const ntraAfter = after2.find(s => s.systemId === 'ntra');
  assert(ntraAfter?.testStatus === 'failed', 'NTRA testStatus must persist as failed');
  assert(ntraAfter?.testError, 'NTRA testError must be set');
}

// ── Runner ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log('\n══════════════════════════════════════════════════════');
  console.log('  CAF System — E2E Demo Test Suite (10 Cases)');
  console.log('══════════════════════════════════════════════════════\n');

  // Verify server is reachable
  try {
    await get('/cafs');
  } catch {
    console.error('ERROR: Cannot reach server at http://localhost:4000');
    console.error('Run: npm run server  (or npm run dev) first\n');
    process.exit(1);
  }

  await runCase('TC-001', 'Individual CAF — Full Approval Lifecycle',           tc001);
  await runCase('TC-002', 'Corporate CAF — All Fields Persisted',               tc002);
  await runCase('TC-003', 'Reject Pending CAF — Status + Persistence',         tc003);
  await runCase('TC-004', 'Correction Workflow — Agent Resubmit → Pending',    tc004);
  await runCase('TC-005', 'Template CRUD — Create / Edit / Delete',            tc005);
  await runCase('TC-006', 'Stats Consistency — Counts Match Actual CAFs',      tc006);
  await runCase('TC-007', 'Stats Update — Create / Approve / Reject Cascade',  tc007);
  await runCase('TC-008', 'Search & Filter — Name + Status Filtering',         tc008);
  await runCase('TC-009', 'Archive Entry — Fields + Document Library Count',   tc009);
  await runCase('TC-010', 'Connectivity Test — Result Persisted to Storage',   tc010);

  console.log(`\n══════════════════════════════════════════════════════`);
  console.log(`  Results: ${passed} passed, ${failed} failed`);
  console.log(`══════════════════════════════════════════════════════\n`);

  process.exit(failed > 0 ? 1 : 0);
}

main();
