/** PC CARE full-page CAF HTML (logo URL injected at runtime). */

function cafGridRow(label: string, boxCount: number, opts?: { labelWidth?: string; rowspan?: number }): string {
  const lw = opts?.labelWidth ?? '24%';
  const rs = opts?.rowspan ? ` rowspan="${opts.rowspan}"` : '';
  const cells = Array.from(
    { length: boxCount },
    () => '<td style="border:1px solid #111;width:7px;height:11px;padding:0;"></td>'
  ).join('');
  return `<table role="presentation" style="width:100%;border-collapse:collapse;border:1px solid #000;margin:0 0 -1px 0;"><tr><td${rs} style="width:${lw};border:1px solid #000;padding:3px 5px;font-size:6.5px;font-weight:700;vertical-align:middle;background:#fff;">${label}</td><td style="border:1px solid #000;padding:0;vertical-align:middle;"><table role="presentation" style="border-collapse:collapse;"><tr>${cells}</tr></table></td></tr></table>`;
}

function cafAddressTwoLines(label: string, boxPerLine: number): string {
  const row = (n: number) =>
    `<tr>${Array.from({ length: n }, () => '<td style="border:1px solid #111;width:7px;height:11px;padding:0;"></td>').join('')}</tr>`;
  return `<table role="presentation" style="width:100%;border-collapse:collapse;border:1px solid #000;margin:0 0 -1px 0;"><tr><td rowspan="2" style="width:24%;border:1px solid #000;padding:3px 5px;font-size:6.5px;font-weight:700;vertical-align:middle;background:#fff;">${label}</td><td style="border:1px solid #000;padding:0;"><table role="presentation" style="border-collapse:collapse;width:100%;">${row(
    boxPerLine
  )}</table></td></tr><tr><td style="border:1px solid #000;padding:0;"><table role="presentation" style="border-collapse:collapse;width:100%;">${row(
    boxPerLine
  )}</table></td></tr></table>`;
}

function cafSectionTitle(text: string): string {
  return `<div style="background:#e5e7eb;border:1px solid #000;padding:4px 6px;font-size:7px;font-weight:800;margin:8px 0 0 0;letter-spacing:0.02em;">${text}</div>`;
}

function cafBlueSectionTitle(text: string): string {
  return `<div style="background:#1229B3;color:#fff;border:1px solid #000;padding:4px 6px;font-size:7px;font-weight:800;margin:8px 0 0 0;">${text}</div>`;
}

function cafBlackChoiceCell(text: string): string {
  return `<td style="background:#000;color:#fff;border:1px solid #000;padding:5px 8px;font-size:6.5px;font-weight:700;text-align:center;white-space:nowrap;">${text}</td>`;
}

export function buildPccareCafTermsHtml(logoUrl: string): string {
  const chk = '&#9744;';
  const applicantTypes = [
    ['Proprietorship', 'Pvt. Ltd. Company', 'Ltd. Company', 'Partnership'],
    ['ISP/OSP', 'Institute', 'Govt. Sector', 'Other'],
  ];
  const applicantGrid = applicantTypes
    .map(
      (row) =>
        `<tr>${row
          .map(
            (cell) =>
              `<td style="border:1px solid #000;padding:4px 6px;font-size:6.5px;width:25%;"><span style="font-size:10px;line-height:1;vertical-align:middle;">${chk}</span> ${cell}</td>`
          )
          .join('')}</tr>`
    )
    .join('');
  const mobileBoxes = 12;
  const altBoxes = 14;
  const mobileRow = `<table role="presentation" style="width:100%;border-collapse:collapse;border:1px solid #000;margin:0 0 -1px 0;"><tr><td style="width:24%;border:1px solid #000;padding:3px 5px;font-size:6.5px;font-weight:700;vertical-align:middle;">Mobile No. (Registered)</td><td style="border:1px solid #000;padding:0;vertical-align:middle;"><table role="presentation" style="border-collapse:collapse;"><tr>${Array.from(
    { length: mobileBoxes },
    () => '<td style="border:1px solid #111;width:7px;height:11px;padding:0;"></td>'
  ).join('')}</tr></table></td><td style="width:14%;border:1px solid #000;padding:3px 5px;font-size:6.5px;font-weight:700;white-space:nowrap;vertical-align:middle;">Alternet No</td><td style="border:1px solid #000;padding:0;"><table role="presentation" style="border-collapse:collapse;"><tr>${Array.from(
    { length: altBoxes },
    () => '<td style="border:1px solid #111;width:7px;height:11px;padding:0;"></td>'
  ).join('')}</tr></table></td></tr></table>`;

  const docCompany = [
    'Address of Company',
    'GST Details',
    'Identity Proof',
    'Registration of Company/Firm',
    'PAN/Aadhar',
    'Passport No',
  ];
  const docCompanyRow = `<tr>${docCompany
    .map(
      (x) =>
        `<td style="border:1px solid #000;padding:5px 6px;font-size:6.5px;width:16.66%;"><span style="font-size:10px;">${chk}</span> ${x}</td>`
    )
    .join('')}</tr>`;

  const docSign = ['PAN Card', 'Aadhar Card', 'Passport No', 'Others'];
  const docSignRow = `<tr>${docSign
    .map(
      (x) =>
        `<td style="border:1px solid #000;padding:5px 8px;font-size:6.5px;width:25%;"><span style="font-size:10px;">${chk}</span> ${x}</td>`
    )
    .join('')}</tr>`;

  return `
<div class="pccare-caf-print" style="font-family:system-ui,-apple-system,sans-serif;color:#000;font-size:7px;line-height:1.35;">
  <table role="presentation" style="width:100%;border-collapse:collapse;border:1px solid #000;margin-bottom:6px;">
    <tr>
      <td style="width:34%;vertical-align:top;border-right:1px solid #000;padding:6px;">
        <div style="font-weight:900;font-size:8px;line-height:1.25;margin-bottom:4px;">PC CARE AIRWAY INFRATEL PRIVATE LIMITED</div>
        <div style="font-size:6.5px;margin-bottom:2px;">CIN: U64204MP2017PTC043127</div>
        <div style="font-size:6.5px;margin-bottom:2px;">House No.-23, Viveka Nand Colony, Jiwaji University Road, Gwalior-474011 (M.P.)</div>
        <div style="font-size:6.5px;">E-Mail:- info@pccareonline.in, www.airwaybroadband.com</div>
      </td>
      <td style="width:32%;vertical-align:middle;text-align:center;border-right:1px solid #000;padding:6px;">
        <img src="${logoUrl}" alt="" style="max-height:52px;width:auto;max-width:100%;display:block;margin:0 auto;" />
      </td>
      <td style="width:34%;vertical-align:top;padding:6px;">
        <div style="border:1px solid #000;min-height:96px;display:flex;align-items:center;justify-content:center;text-align:center;font-size:6px;font-weight:700;padding:8px;color:#334155;">
          Paste your photo here and sign across it.
        </div>
      </td>
    </tr>
  </table>

  <table role="presentation" style="width:100%;border-collapse:collapse;border:1px solid #000;margin-bottom:6px;">
    <tr>
      <td style="width:28%;border:1px solid #000;padding:4px 6px;vertical-align:middle;">
        <span style="font-weight:800;font-size:6.5px;">SRE / CAF No</span>
        <span style="display:inline-block;border:1px solid #000;min-width:120px;min-height:18px;vertical-align:middle;margin-left:6px;"></span>
      </td>
      <td style="border:1px solid #000;padding:8px;text-align:center;vertical-align:middle;">
        <div style="font-size:11px;font-weight:900;letter-spacing:0.02em;">Customer Application Form (CAF)</div>
        <div style="font-size:7px;font-weight:700;margin-top:2px;color:#334155;">(SME/ISP/OSP/Corporate/Lease Line)</div>
      </td>
    </tr>
  </table>

  ${cafSectionTitle('General Information')}
  ${cafGridRow('Subscriber Name', 36)}
  ${cafGridRow('Licence Details (For ISP/OSP)', 36)}
  ${cafGridRow('Director/Owner/Manager', 36)}
  <table role="presentation" style="width:100%;border-collapse:collapse;border:1px solid #000;margin:0 0 -1px 0;"><tr><td style="border:1px solid #000;padding:4px 6px;font-size:6.5px;font-weight:700;width:24%;vertical-align:top;">Type of Applicant (tick one):</td><td style="border:1px solid #000;padding:0;"><table role="presentation" style="width:100%;border-collapse:collapse;font-size:6.5px;">${applicantGrid}</table></td></tr></table>
  ${cafAddressTwoLines('Connection Installation Address', 36)}
  ${mobileRow}
  ${cafGridRow('Email id (Registered)', 40)}

  ${cafSectionTitle('Authorised Signatory')}
  ${cafGridRow('Director/Owner/Manager', 36)}
  ${cafAddressTwoLines('Residence Address', 36)}
  <table role="presentation" style="width:100%;border-collapse:collapse;border:1px solid #000;margin:0 0 -1px 0;"><tr>
    <td style="width:12%;border:1px solid #000;padding:3px 5px;font-size:6.5px;font-weight:700;vertical-align:middle;">Email Id</td>
    <td style="border:1px solid #000;padding:0;"><table role="presentation" style="border-collapse:collapse;"><tr>${Array.from({ length: 22 }, () => '<td style="border:1px solid #111;width:7px;height:11px;padding:0;"></td>').join('')}</tr></table></td>
    <td style="width:14%;border:1px solid #000;padding:3px 5px;font-size:6.5px;font-weight:700;white-space:nowrap;vertical-align:middle;">Contact No</td>
    <td style="border:1px solid #000;padding:0;"><table role="presentation" style="border-collapse:collapse;"><tr>${Array.from({ length: 18 }, () => '<td style="border:1px solid #111;width:7px;height:11px;padding:0;"></td>').join('')}</tr></table></td>
  </tr></table>

  ${cafSectionTitle('Customer Co-ordinator Information (Technical)')}
  ${cafGridRow('Name', 32)}
  ${cafGridRow('Designation', 32)}
  <table role="presentation" style="width:100%;border-collapse:collapse;border:1px solid #000;margin:0 0 -1px 0;"><tr>
    <td style="width:18%;border:1px solid #000;padding:3px 5px;font-size:6.5px;font-weight:700;vertical-align:middle;">Mobile No.</td>
    <td style="border:1px solid #000;padding:0;"><table role="presentation" style="border-collapse:collapse;"><tr>${Array.from({ length: 16 }, () => '<td style="border:1px solid #111;width:7px;height:11px;padding:0;"></td>').join('')}</tr></table></td>
    <td style="width:10%;border:1px solid #000;padding:3px 5px;font-size:6.5px;font-weight:700;vertical-align:middle;">e-mail</td>
    <td style="border:1px solid #000;padding:0;"><table role="presentation" style="border-collapse:collapse;"><tr>${Array.from({ length: 28 }, () => '<td style="border:1px solid #111;width:7px;height:11px;padding:0;"></td>').join('')}</tr></table></td>
  </tr></table>

  ${cafSectionTitle('Customer Co-ordinator Information (Payment/Billing)')}
  ${cafGridRow('Name', 32)}
  ${cafGridRow('Designation', 32)}
  <table role="presentation" style="width:100%;border-collapse:collapse;border:1px solid #000;margin:0 0 -1px 0;"><tr>
    <td style="width:18%;border:1px solid #000;padding:3px 5px;font-size:6.5px;font-weight:700;vertical-align:middle;">Mobile No.</td>
    <td style="border:1px solid #000;padding:0;"><table role="presentation" style="border-collapse:collapse;"><tr>${Array.from({ length: 16 }, () => '<td style="border:1px solid #111;width:7px;height:11px;padding:0;"></td>').join('')}</tr></table></td>
    <td style="width:10%;border:1px solid #000;padding:3px 5px;font-size:6.5px;font-weight:700;vertical-align:middle;">e-mail</td>
    <td style="border:1px solid #000;padding:0;"><table role="presentation" style="border-collapse:collapse;"><tr>${Array.from({ length: 28 }, () => '<td style="border:1px solid #111;width:7px;height:11px;padding:0;"></td>').join('')}</tr></table></td>
  </tr></table>

  ${cafSectionTitle('Customer Billing Address (If Different to above)')}
  ${cafAddressTwoLines('Billing address', 36)}

  ${cafSectionTitle('Service Details')}
  <table role="presentation" style="width:100%;border-collapse:collapse;border:1px solid #000;margin:0 0 -1px 0;"><tr><td style="border:1px solid #000;padding:4px 6px;font-size:6.5px;font-weight:800;width:26%;vertical-align:middle;">Required Service (Tick one):</td><td style="border:1px solid #000;padding:0;"><table role="presentation" style="width:100%;border-collapse:collapse;"><tr>${cafBlackChoiceCell('Fixed Wi-Fi Broadband')}${cafBlackChoiceCell('FTTX (FiberOne)')}${cafBlackChoiceCell('Internet Leaseline (DIA-ILL)')}</tr></table></td></tr></table>
  <table role="presentation" style="width:100%;border-collapse:collapse;border:1px solid #000;margin:0 0 -1px 0;"><tr><td style="border:1px solid #000;padding:4px 6px;font-size:6.5px;font-weight:800;width:26%;vertical-align:middle;">Service Delivery (Tick one):</td><td style="border:1px solid #000;padding:0;"><table role="presentation" style="width:100%;border-collapse:collapse;"><tr>${cafBlackChoiceCell('On Fixed Wi-Fi CPE')}${cafBlackChoiceCell('Copper/Ethernet Cable')}${cafBlackChoiceCell('Optical Fiber')}</tr></table></td></tr></table>

  ${cafSectionTitle('Financial Charges Details')}
  <table role="presentation" style="width:100%;border-collapse:collapse;border:1px solid #000;margin:0 0 -1px 0;">
    <tr>
      <td style="border:1px solid #000;padding:4px 6px;font-size:6.5px;font-weight:700;width:25%;vertical-align:middle;">One Time Activation (Non refundable)</td>
      <td style="border:1px solid #000;padding:6px;min-height:22px;width:25%;vertical-align:top;"></td>
      <td style="border:1px solid #000;padding:4px 6px;font-size:6.5px;font-weight:700;width:25%;vertical-align:middle;">Security Deposit (Refundable)</td>
      <td style="border:1px solid #000;padding:6px;min-height:22px;width:25%;"></td>
    </tr>
    <tr>
      <td style="border:1px solid #000;padding:4px 6px;font-size:6.5px;font-weight:700;vertical-align:middle;">CPE Cost (Non refundable)</td>
      <td style="border:1px solid #000;padding:6px;"></td>
      <td style="border:1px solid #000;padding:4px 6px;font-size:6.5px;font-weight:700;vertical-align:middle;">CPE Rental (Non Refundable)</td>
      <td style="border:1px solid #000;padding:6px;"></td>
    </tr>
  </table>
  <table role="presentation" style="width:100%;border-collapse:collapse;border:1px solid #000;margin:0 0 -1px 0;"><tr><td style="border:1px solid #000;padding:4px 6px;font-size:6.5px;font-weight:800;width:22%;vertical-align:middle;">Subscriber Type (tick one):</td><td style="border:1px solid #000;padding:0;"><table role="presentation" style="width:100%;border-collapse:collapse;"><tr>${cafBlackChoiceCell('Prepaid')}${cafBlackChoiceCell('Post Pay')}</tr></table></td></tr></table>
  <table role="presentation" style="width:100%;border-collapse:collapse;border:1px solid #000;margin:0 0 -1px 0;"><tr><td style="border:1px solid #000;padding:4px 6px;font-size:6.5px;font-weight:800;width:22%;vertical-align:middle;">Billing Cycle (tick one):</td><td style="border:1px solid #000;padding:0;"><table role="presentation" style="width:100%;border-collapse:collapse;"><tr>${cafBlackChoiceCell('Monthly')}${cafBlackChoiceCell('Quarterly')}${cafBlackChoiceCell('Half Yearly')}${cafBlackChoiceCell('Yearly')}</tr></table></td></tr></table>
  <table role="presentation" style="width:100%;border-collapse:collapse;border:1px solid #000;margin:0 0 -1px 0;"><tr>
    <td style="border:1px solid #000;padding:4px 6px;font-size:6.5px;font-weight:700;width:18%;vertical-align:middle;">Tariff Plan Name</td>
    <td style="border:1px solid #000;padding:6px;font-size:6.5px;font-weight:700;text-align:center;background:#f8fafc;">As per plan sheet</td>
  </tr></table>
  <table role="presentation" style="width:100%;border-collapse:collapse;border:1px solid #000;margin-bottom:6px;"><tr>
    <td style="border:1px solid #000;padding:4px 6px;font-size:6.5px;font-weight:700;width:30%;vertical-align:middle;">Required Static Public IP</td>
    <td style="border:1px solid #000;padding:4px 8px;font-size:6.5px;width:20%;"><span style="font-size:10px;">${chk}</span> Yes &nbsp; <span style="font-size:10px;">${chk}</span> No</td>
    <td style="border:1px solid #000;padding:4px 6px;font-size:6.5px;font-weight:700;width:15%;">No. of IP</td>
    <td style="border:1px solid #000;padding:6px;border-bottom:1px solid #000;"></td>
  </tr></table>

  ${cafBlueSectionTitle('Document Check List (Attached)')}
  <table role="presentation" style="width:100%;border-collapse:collapse;border:1px solid #000;margin:0 0 -1px 0;">${docCompanyRow}</table>

  ${cafBlueSectionTitle('Document Check List Authorised of Signatory (Attached)')}
  <table role="presentation" style="width:100%;border-collapse:collapse;border:1px solid #000;margin-bottom:6px;">${docSignRow}</table>

  ${cafSectionTitle('Customer Acceptance')}
  <table role="presentation" style="width:100%;border-collapse:collapse;border:1px solid #000;">
    <tr>
      <td style="width:58%;border:1px solid #000;padding:8px;vertical-align:top;font-size:6.5px;line-height:1.45;">
        I declare that all the information submitted by me in this Customer Application Form is true, correct and complete to the best of my knowledge and belief. I understand that services may be provisioned based on this information and that any misrepresentation may result in termination or regulatory action. I agree to abide by the applicable tariff, fair usage, payment and network policies of PC CARE AIRWAY INFRATEL PRIVATE LIMITED / Airway Broadband as amended from time to time.<br/><br/>
        Subscriber / Authorized representative: <strong>{{fullName}}</strong>
      </td>
      <td style="border:1px solid #000;padding:10px;vertical-align:bottom;text-align:center;font-size:6.5px;font-weight:700;min-height:120px;">
        <div style="flex:1;min-height:72px;"></div>
        Signature of the Authorized person with Company Seal
      </td>
    </tr>
    <tr>
      <td colspan="2" style="border:1px solid #000;padding:8px;">
        <table role="presentation" style="width:100%;border-collapse:collapse;"><tr>
          <td style="width:33%;font-size:6.5px;font-weight:700;padding:4px;">Name <span style="display:block;border-bottom:1px solid #000;margin-top:6px;min-height:14px;"></span></td>
          <td style="width:33%;font-size:6.5px;font-weight:700;padding:4px;">Date <span style="display:block;border-bottom:1px solid #000;margin-top:6px;min-height:14px;"></span></td>
          <td style="width:34%;font-size:6.5px;font-weight:700;padding:4px;">Place <span style="display:block;border-bottom:1px solid #000;margin-top:6px;min-height:14px;"></span></td>
        </tr></table>
      </td>
    </tr>
  </table>
</div>
`.trim();
}
