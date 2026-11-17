const pptxgen = require('pptxgenjs');

const pres = new pptxgen();
pres.layout = 'LAYOUT_WIDE';
pres.title = 'Digital Archiving Solution - Demo';
pres.company = 'AsiaInfo';

const NAVY = '14213D';
const TEAL = '0F9D8A';
const AMBER = 'D9951A';
const RED = 'B94A32';
const GREEN = '2E7D52';
const INK = '1F2937';
const MUTED = '5B6472';
const LIGHT = 'F1F5F9';
const LINE = 'CBD5E1';
const WHITE = 'FFFFFF';
const FONT = 'Calibri';

const STATUS_COLOR = { Implemented: GREEN, Partial: AMBER, Roadmap: RED };

const MATRIX = [
  ['Scanning and upload of KYC documents', '6, 9', 'Partial', 'PDF, JPG, PNG up to 10 MB with preview and download; scanner and mobile capture not built'],
  ['Documents linked to MSISDN', '6', 'Partial', 'Customer and contact number recorded; MSISDN-keyed archive not built'],
  ['Metadata forms with validation', '10', 'Partial', 'Configurable CAF templates; field-level rules (regex, length, default) to be added'],
  ['Watermarking (configurable)', '6, 14', 'Roadmap', 'Not started'],
  ['Search by MSISDN, ICCID, ID#, KYC code', '6', 'Partial', 'Search by document name, customer name and CAF ID; other identifiers to be added'],
  ['User access management (RBAC)', '6, 14', 'Implemented', 'Admin, Agent and Auditor roles; menus filtered by permission'],
  ['Data isolation between users', '14', 'Implemented', 'Agents see only the CAFs they created; Admin and Auditor see all'],
  ['Audit trail', '6, 9', 'Implemented', 'Audit portal records review and approval events'],
  ['Version history of archived documents', '6, 12', 'Partial', 'Versioning exists for CAF templates; document versioning to be added'],
  ['Maker and checker', '6', 'Partial', 'Agent submits; Auditor approves, rejects or requests correction'],
  ['OCR with confidence score and review', '6, 9', 'Roadmap', 'Not started (OCR service shown only as a status tile)'],
  ['AI image quality and document classification', '9, 11', 'Roadmap', 'Not started'],
  ['Malware scan before storage', '9', 'Roadmap', 'Not started'],
  ['View, print and email export', '6', 'Partial', 'View and download in place; print and email to be added'],
  ['Edit: rotate, crop, brightness, resize', '12', 'Roadmap', 'Not started'],
  ['OTP login, lockout, password expiry, session timeout', '14', 'Roadmap', 'Not started; password login only in the prototype'],
  ['Encryption at rest and in transit', '14', 'Roadmap', 'Not started; prototype stores data in the browser'],
  ['Retention policies and lifecycle states', '18', 'Partial', 'Document status (verified, expired); retention rules to be added'],
  ['Integration with registration platforms', '6, 15', 'Partial', 'Integration hub with connection tests (prototype data); live interfaces to be built'],
  ['Retry queues and duplicate prevention', '15', 'Roadmap', 'Not started'],
  ['Migration of existing documents', '17', 'Roadmap', 'Not started'],
  ['Backup and DR (RPO 15 min, RTO 4 h)', '16', 'Roadmap', 'Not started'],
  ['Scale to millions of documents, geo-redundancy', '6, 8', 'Roadmap', 'Not started; production architecture to be designed in HLD/LLD'],
];

const COUNTS = { Implemented: 0, Partial: 0, Roadmap: 0 };
MATRIX.forEach(r => { COUNTS[r[2]] += 1; });

function header(s, title, kicker) {
  s.background = { color: WHITE };
  s.addText(title, { x: 0.6, y: 0.4, w: 12.1, h: 0.75, fontFace: FONT, fontSize: 36, bold: true, color: NAVY, margin: 0, isTextBox: true });
  if (kicker) {
    s.addText(kicker, { x: 0.6, y: 1.15, w: 12.1, h: 0.45, fontFace: FONT, fontSize: 16, color: MUTED, margin: 0, isTextBox: true });
  }
}

function numberBadge(s, n, x, y, color) {
  s.addShape(pres.shapes.OVAL, { x, y, w: 0.5, h: 0.5, fill: { color }, line: { color } });
  s.addText(String(n), { x, y, w: 0.5, h: 0.5, align: 'center', valign: 'middle', fontFace: FONT, fontSize: 16, bold: true, color: WHITE, margin: 0, isTextBox: true });
}

function bullets(items, size) {
  return items.map((t, i) => ({
    text: t,
    options: { bullet: true, breakLine: i < items.length - 1, fontSize: size || 16, color: INK, paraSpaceAfter: 8 },
  }));
}

function statCard(s, x, y, w, h, big, label) {
  s.addShape(pres.shapes.RECTANGLE, { x, y, w, h, fill: { color: LIGHT }, line: { color: LIGHT } });
  s.addText(big, { x: x + 0.3, y: y + 0.25, w: w - 0.6, h: 0.9, fontFace: FONT, fontSize: 40, bold: true, color: TEAL, margin: 0, isTextBox: true });
  s.addText(label, { x: x + 0.3, y: y + 1.15, w: w - 0.6, h: h - 1.3, fontFace: FONT, fontSize: 14, color: INK, margin: 0, valign: 'top', isTextBox: true });
}

// 1. Title
{
  const s = pres.addSlide();
  s.background = { color: NAVY };
  s.addText('Digital Archiving Solution', { x: 0.8, y: 2.2, w: 11.7, h: 1.1, fontFace: FONT, fontSize: 44, bold: true, color: WHITE, margin: 0, isTextBox: true });
  s.addText('Demonstration and capability overview', { x: 0.8, y: 3.3, w: 11.7, h: 0.6, fontFace: FONT, fontSize: 24, color: 'CADCFC', margin: 0, isTextBox: true });
  s.addText('Response to RFP AF/CR/RFP26005/2026  |  AsiaInfo', { x: 0.8, y: 4.4, w: 11.7, h: 0.4, fontFace: FONT, fontSize: 16, color: 'CADCFC', margin: 0, isTextBox: true });
}

// 2. Requirement understanding
{
  const s = pres.addSlide();
  header(s, 'What the archive must achieve', 'Four objectives from the RFP, with KYC documents as the core scope');
  const items = [
    ['Digitize and index', 'Scan, index and archive physical KYC and supporting documents, linked to customer identifiers.'],
    ['Central repository', 'One secure, centralized store for registration records, integrated with the SIM registration platform.'],
    ['Secure retrieval', 'Authorized users search and retrieve records quickly across the full retention period.'],
    ['Integrity and audit', 'Protected originals, full audit trail and controlled changes with version history.'],
  ];
  items.forEach((it, i) => {
    const x = 0.6 + i * 3.08;
    s.addShape(pres.shapes.RECTANGLE, { x, y: 2.0, w: 2.87, h: 4.4, fill: { color: LIGHT }, line: { color: LIGHT } });
    numberBadge(s, i + 1, x + 0.3, 2.35, TEAL);
    s.addText(it[0], { x: x + 0.3, y: 3.1, w: 2.3, h: 0.9, fontFace: FONT, fontSize: 20, bold: true, color: NAVY, margin: 0, valign: 'top', isTextBox: true });
    s.addText(it[1], { x: x + 0.3, y: 4.0, w: 2.3, h: 2.2, fontFace: FONT, fontSize: 14, color: INK, margin: 0, valign: 'top', isTextBox: true });
  });
}

// 3. Solution overview
{
  const s = pres.addSlide();
  header(s, 'Solution overview', 'Three layers: capture, control, and archive and access');
  const layers = [
    ['Capture', ['Configurable CAF templates', 'Upload PDF, JPG and PNG', 'Agent workflow with drafts and corrections']],
    ['Control', ['Role-based access (Admin, Agent, Auditor)', 'Audit portal: approve, reject or request correction', 'Agents see only their own applications']],
    ['Archive and access', ['Document library with filters', 'Search by name, customer and CAF ID', 'Preview and download']],
  ];
  layers.forEach((l, i) => {
    const x = 0.6 + i * 4.2;
    s.addShape(pres.shapes.RECTANGLE, { x, y: 2.0, w: 3.7, h: 3.2, fill: { color: LIGHT }, line: { color: LIGHT } });
    s.addText(l[0], { x: x + 0.3, y: 2.25, w: 3.1, h: 0.5, fontFace: FONT, fontSize: 20, bold: true, color: NAVY, margin: 0, isTextBox: true });
    s.addText(bullets(l[1], 16), { x: x + 0.3, y: 2.9, w: 3.2, h: 2.2, fontFace: FONT, valign: 'top', margin: 0, isTextBox: true });
    if (i < 2) {
      s.addShape(pres.shapes.RIGHT_ARROW, { x: x + 3.8, y: 3.4, w: 0.3, h: 0.4, fill: { color: TEAL }, line: { color: TEAL } });
    }
  });
  s.addShape(pres.shapes.RECTANGLE, { x: 0.6, y: 5.5, w: 12.1, h: 1.1, fill: { color: WHITE }, line: { color: LINE, width: 1 } });
  s.addText([
    { text: 'Integration: ', options: { bold: true, color: NAVY } },
    { text: 'the RFP requires documents to arrive from registration systems on activation, re-registration, SIM swap and SIM recycling. The prototype shows the integration hub with connection tests; live interfaces are on the roadmap.', options: { color: INK } },
  ], { x: 0.9, y: 5.65, w: 11.5, h: 0.8, fontFace: FONT, fontSize: 14, margin: 0, valign: 'middle', isTextBox: true });
}

// 4. Demo scenario
{
  const s = pres.addSlide();
  header(s, 'Live demo: one registration, end to end', 'Five steps that follow a KYC record from capture to audit');
  const steps = [
    ['Agent creates a CAF', 'Select a template and enter customer details'],
    ['Agent uploads KYC documents', 'Attach PDF, JPG or PNG files up to 10 MB'],
    ['Auditor requests a correction', 'Preview the files in the audit portal and return the CAF for correction'],
    ['Auditor approves', 'Approve and archive the corrected application'],
    ['Admin checks integrations', 'Review system status and run a connection test'],
  ];
  steps.forEach((st, i) => {
    const x = 0.6 + i * 2.46;
    s.addShape(pres.shapes.RECTANGLE, { x, y: 2.1, w: 2.25, h: 3.9, fill: { color: LIGHT }, line: { color: LIGHT } });
    numberBadge(s, i + 1, x + 0.25, 2.4, TEAL);
    s.addText(st[0], { x: x + 0.25, y: 3.15, w: 1.85, h: 1.0, fontFace: FONT, fontSize: 17, bold: true, color: NAVY, margin: 0, valign: 'top', isTextBox: true });
    s.addText(st[1], { x: x + 0.25, y: 4.25, w: 1.85, h: 1.6, fontFace: FONT, fontSize: 14, color: INK, margin: 0, valign: 'top', isTextBox: true });
  });
}

// 5. Demo: capture
{
  const s = pres.addSlide();
  header(s, 'Capture: templates, forms and uploads', 'Agents create applications from versioned templates and attach KYC files');
  s.addText(bullets([
    'Templates are versioned and selected at onboarding',
    'Customer details entered in a structured form',
    'Documents uploaded as PDF, JPG or PNG',
    'Each file limited to 10 MB; PDF and image files can be previewed',
    'Field-level validation rules (regex, length, default value) are on the roadmap',
  ], 18), { x: 0.6, y: 2.0, w: 7.2, h: 4.5, fontFace: FONT, valign: 'top', margin: 0, isTextBox: true });
  statCard(s, 8.5, 2.0, 2.0, 2.3, '3', 'upload formats');
  statCard(s, 10.7, 2.0, 2.0, 2.3, '10 MB', 'maximum per file');
  statCard(s, 8.5, 4.6, 4.2, 2.0, '2026.2', 'template version shown when a template is matched during onboarding');
}

// 6. Demo: review
{
  const s = pres.addSlide();
  header(s, 'Review: maker and checker decisions', 'Auditors act on each submission, and every decision is recorded');
  const outcomes = [
    ['Approve', 'Approve and archive the application', GREEN],
    ['Reject', 'Application status set to Rejected', RED],
    ['Request correction', 'Returned to the agent with status Correction', AMBER],
  ];
  outcomes.forEach((o, i) => {
    const y = 2.0 + i * 1.5;
    s.addShape(pres.shapes.RECTANGLE, { x: 0.6, y, w: 7.0, h: 1.25, fill: { color: LIGHT }, line: { color: LIGHT } });
    s.addShape(pres.shapes.RECTANGLE, { x: 0.6, y, w: 0.12, h: 1.25, fill: { color: o[2] }, line: { color: o[2] } });
    s.addText(o[0], { x: 0.95, y: y + 0.2, w: 6.4, h: 0.45, fontFace: FONT, fontSize: 20, bold: true, color: NAVY, margin: 0, isTextBox: true });
    s.addText(o[1], { x: 0.95, y: y + 0.65, w: 6.4, h: 0.45, fontFace: FONT, fontSize: 14, color: INK, margin: 0, isTextBox: true });
  });
  statCard(s, 8.4, 2.0, 4.3, 2.3, '6', 'CAF statuses: Draft, Pending, Correction, Approved, Rejected, Archived');
  s.addText('Reviewed files can be previewed in the audit portal before a decision.', { x: 8.4, y: 4.7, w: 4.3, h: 0.8, fontFace: FONT, fontSize: 16, color: INK, margin: 0, valign: 'top', isTextBox: true });
}

// 7. Demo: search and retrieval
{
  const s = pres.addSlide();
  header(s, 'Search and retrieval', 'Authorized users find and view documents from the document library');
  s.addText(bullets([
    'Search by document name, customer name or CAF ID',
    'Filter by category and status',
    'Switch between list and grid views',
    'Preview PDF and image files, then download',
    'Identifier search (MSISDN, ICCID, ID#, KYC code) is on the roadmap',
  ], 18), { x: 0.6, y: 2.0, w: 7.2, h: 4.5, fontFace: FONT, valign: 'top', margin: 0, isTextBox: true });
  statCard(s, 8.5, 2.0, 4.2, 2.3, '4', 'document statuses: Verified, Unverified, Rejected, Expired');
  statCard(s, 8.5, 4.6, 4.2, 2.0, '8', 'document categories, including identity, financial and service agreements');
}

// 8. Demo: access and audit
{
  const s = pres.addSlide();
  header(s, 'Access control and audit', 'Roles limit what each user sees and do; the audit trail records what they did');
  const roles = [
    ['Agent', 'Creates and manages own CAFs only'],
    ['Auditor', 'Reviews all CAFs, approves, rejects or requests correction'],
    ['Admin', 'Full access to all modules'],
  ];
  roles.forEach((r, i) => {
    const y = 2.0 + i * 1.35;
    numberBadge(s, i + 1, 0.6, y + 0.15, TEAL);
    s.addText(r[0], { x: 1.35, y, w: 5.2, h: 0.45, fontFace: FONT, fontSize: 20, bold: true, color: NAVY, margin: 0, isTextBox: true });
    s.addText(r[1], { x: 1.35, y: y + 0.45, w: 5.4, h: 0.6, fontFace: FONT, fontSize: 16, color: INK, margin: 0, valign: 'top', isTextBox: true });
  });
  s.addShape(pres.shapes.RECTANGLE, { x: 7.2, y: 2.0, w: 5.5, h: 4.1, fill: { color: LIGHT }, line: { color: LIGHT } });
  s.addText('Not yet in the prototype', { x: 7.5, y: 2.25, w: 4.9, h: 0.5, fontFace: FONT, fontSize: 18, bold: true, color: NAVY, margin: 0, isTextBox: true });
  s.addText(bullets([
    'OTP login tied to MSISDN',
    'Account lockout after failed logins',
    'Password expiry and session timeout',
    'Watermarking for non-approved access',
  ], 16), { x: 7.5, y: 2.9, w: 4.9, h: 3.0, fontFace: FONT, valign: 'top', margin: 0, isTextBox: true });
}

// 9. Demo: integration status
{
  const s = pres.addSlide();
  header(s, 'Integration monitoring', 'The hub shows the status of each connected system and its last connection test');
  s.addText(bullets([
    'Each system shows protocol, endpoint, last test time and status',
    'Connection test can be run from the hub; failed tests show the error message',
    'Systems: CRM, billing, provisioning, numbering, NTRA and KYC',
    'Prototype uses sample data; live feeds, retry queues and manual reprocessing are on the roadmap',
  ], 18), { x: 0.6, y: 2.0, w: 7.2, h: 4.5, fontFace: FONT, valign: 'top', margin: 0, isTextBox: true });
  statCard(s, 8.5, 2.0, 4.2, 2.3, '6', 'systems in the integration hub');
  statCard(s, 8.5, 4.6, 4.2, 2.0, 'Pass / fail', 'result of the last connection test for each system');
}

// 10. Coverage summary
{
  const s = pres.addSlide();
  header(s, 'Requirement coverage', `${MATRIX.length} requirement areas from the RFP, assessed against the current prototype`);
  s.addChart(pres.charts.DOUGHNUT, [{
    name: 'Coverage',
    labels: ['Implemented', 'Partial', 'Roadmap'],
    values: [COUNTS.Implemented, COUNTS.Partial, COUNTS.Roadmap],
  }], {
    x: 0.6, y: 1.9, w: 5.2, h: 5.0,
    holeSize: 58,
    chartColors: [GREEN, AMBER, RED],
    showLegend: true, legendPos: 'b', legendFontFace: FONT, legendFontSize: 14, legendColor: INK,
    showValue: true, showPercent: false, dataLabelColor: WHITE, dataLabelFontSize: 14, dataLabelFontFace: FONT, dataLabelFontBold: true,
  });
  const rowsSummary = [
    ['Implemented', COUNTS.Implemented, GREEN, 'Working in the prototype today'],
    ['Partial', COUNTS.Partial, AMBER, 'Core flow exists; scope to complete is defined'],
    ['Roadmap', COUNTS.Roadmap, RED, 'Planned for the build phase'],
  ];
  rowsSummary.forEach((r, i) => {
    const y = 2.2 + i * 1.5;
    s.addShape(pres.shapes.RECTANGLE, { x: 6.4, y, w: 6.3, h: 1.2, fill: { color: LIGHT }, line: { color: LIGHT } });
    s.addText(`${r[1]}  ${r[0]}`, { x: 6.7, y: y + 0.15, w: 5.8, h: 0.5, fontFace: FONT, fontSize: 22, bold: true, color: r[2], margin: 0, isTextBox: true });
    s.addText(r[3], { x: 6.7, y: y + 0.65, w: 5.8, h: 0.4, fontFace: FONT, fontSize: 14, color: INK, margin: 0, isTextBox: true });
  });
}

// 11-13. Coverage matrix
const PAGE_SIZE = 8;
for (let p = 0; p * PAGE_SIZE < MATRIX.length; p++) {
  const s = pres.addSlide();
  const pages = Math.ceil(MATRIX.length / PAGE_SIZE);
  header(s, 'Requirement coverage detail', `Part ${p + 1} of ${pages}`);
  const header_row = ['Requirement', 'RFP section', 'Status', 'Current position'].map(t => ({
    text: t, options: { bold: true, color: WHITE, fill: { color: NAVY }, fontFace: FONT, fontSize: 14 },
  }));
  const body = MATRIX.slice(p * PAGE_SIZE, (p + 1) * PAGE_SIZE).map(r => [
    { text: r[0], options: { color: INK, fontFace: FONT, fontSize: 14 } },
    { text: r[1], options: { color: INK, fontFace: FONT, fontSize: 14, align: 'center' } },
    { text: r[2], options: { color: STATUS_COLOR[r[2]], bold: true, fontFace: FONT, fontSize: 14 } },
    { text: r[3], options: { color: INK, fontFace: FONT, fontSize: 14 } },
  ]);
  s.addTable([header_row, ...body], {
    x: 0.6, y: 1.85, w: 12.1,
    colW: [4.0, 1.3, 1.5, 5.3],
    rowH: 0.52,
    valign: 'middle',
    border: { type: 'solid', pt: 0.5, color: LINE },
    margin: 0.06,
  });
}

// 14. Roadmap
{
  const s = pres.addSlide();
  header(s, 'Closing the gaps', 'Roadmap items grouped by delivery workstream');
  const groups = [
    ['Security', ['OTP login tied to MSISDN', 'Lockout, password expiry, session timeout', 'Encryption at rest and in transit', 'Watermarking and malware scan']],
    ['Document intelligence', ['OCR with confidence score and review', 'AI image quality checks', 'Document classification and rejection', 'Rotate, crop and brightness editing']],
    ['Scale and resilience', ['Architecture for millions of documents', 'High availability, no single point of failure', 'Backup, replication and DR (RPO 15 min, RTO 4 h)']],
    ['Integration and migration', ['Secure APIs (mTLS, OAuth 2.0, IP allowlist)', 'Retry queues and duplicate prevention', 'Migration of existing records with reconciliation']],
  ];
  groups.forEach((g, i) => {
    const x = 0.6 + (i % 2) * 6.15;
    const y = 1.9 + Math.floor(i / 2) * 2.6;
    s.addShape(pres.shapes.RECTANGLE, { x, y, w: 5.95, h: 2.4, fill: { color: LIGHT }, line: { color: LIGHT } });
    s.addText(g[0], { x: x + 0.3, y: y + 0.2, w: 5.4, h: 0.45, fontFace: FONT, fontSize: 20, bold: true, color: NAVY, margin: 0, isTextBox: true });
    s.addText(bullets(g[1], 14), { x: x + 0.3, y: y + 0.75, w: 5.4, h: 1.55, fontFace: FONT, valign: 'top', margin: 0, isTextBox: true });
  });
}

// 15. Delivery approach
{
  const s = pres.addSlide();
  header(s, 'Delivery approach', 'Phases follow the implementation requirements in RFP section 20');
  const phases = [
    ['Design', 'HLD and LLD: architecture, database, storage, search, APIs, DR'],
    ['Build and integrate', 'Build roadmap items; connect registration platforms'],
    ['Test', 'System integration test, user acceptance test, security assessment'],
    ['Migrate', 'Load existing records; reconcile and report exceptions'],
    ['Go live', 'Cut-over, training for users and administrators, stabilization'],
  ];
  phases.forEach((p, i) => {
    const x = 0.6 + i * 2.46;
    s.addShape(pres.shapes.RECTANGLE, { x, y: 2.0, w: 2.25, h: 3.6, fill: { color: LIGHT }, line: { color: LIGHT } });
    numberBadge(s, i + 1, x + 0.25, 2.25, NAVY);
    s.addText(p[0], { x: x + 0.25, y: 2.95, w: 1.85, h: 0.6, fontFace: FONT, fontSize: 18, bold: true, color: NAVY, margin: 0, isTextBox: true });
    s.addText(p[1], { x: x + 0.25, y: 3.6, w: 1.85, h: 1.9, fontFace: FONT, fontSize: 14, color: INK, margin: 0, valign: 'top', isTextBox: true });
  });
  s.addText('Support model, service levels and maintenance terms to be detailed in the proposal.', { x: 0.6, y: 6.0, w: 12.1, h: 0.5, fontFace: FONT, fontSize: 14, color: MUTED, margin: 0, isTextBox: true });
}

// 16. Next steps
{
  const s = pres.addSlide();
  header(s, 'Next steps', 'What we need to move from demonstration to design');
  s.addText(bullets([
    'Confirm priority of roadmap items for the first release',
    'Share sample KYC documents to test OCR and image quality rules',
    'Provide interface specifications for the SIM registration platform',
    'Confirm expected document volume and retention periods for sizing',
    'Agree on the design review schedule (HLD and LLD)',
  ], 20), { x: 0.6, y: 2.0, w: 12.1, h: 4.5, fontFace: FONT, valign: 'top', margin: 0, isTextBox: true });
}

pres.writeFile({ fileName: 'C:\\CAF\\demo-deck\\AsiaInfo-Digital-Archiving-Demo.pptx' })
  .then(f => console.log('written', f));
