import { CustomerApplicationForm, Stats, CAFTemplate } from './types';

export const MOCK_CAFS: CustomerApplicationForm[] = [
  {
    id: 'CAF-2024-001',
    customerType: 'Individual',
    fullName: 'Mohammad Farooq',
    idNumber: 'T-12345678',
    idType: 'Tazkira',
    address: 'Street 4, Shar-e-Naw, Kabul, Afghanistan',
    contactNumber: '+93 70 123 4567',
    serviceType: 'Prepaid',
    planName: 'Elite Plus 50GB',
    status: 'Approved',
    submissionDate: '2024-03-15T10:30:00Z',
    documents: [
      { id: 'D1', name: 'Tazkira Front', type: 'ID Card', uploadDate: '2024-03-15', status: 'Verified' },
      { id: 'D2', name: 'Customer Photo', type: 'Photo', uploadDate: '2024-03-15', status: 'Verified' }
    ]
  },
  {
    id: 'CAF-2024-002',
    customerType: 'Corporate',
    fullName: 'Afghan Tech Solutions Ltd',
    idNumber: 'C-998877',
    idType: 'License',
    address: 'Industrial Area, Kabul',
    contactNumber: '+93 20 888 9999',
    serviceType: 'Postpaid',
    planName: 'Enterprise Unlimited',
    status: 'Pending',
    submissionDate: '2024-03-20T09:15:00Z',
    documents: [
      { id: 'D3', name: 'Business License', type: 'Corporate Doc', uploadDate: '2024-03-20', status: 'Unverified' },
      { id: 'D4', name: 'Authorized Signatory POA', type: 'Legal', uploadDate: '2024-03-20', status: 'Unverified' }
    ],
    corporateDetails: {
      companyRegNo: 'L-55442',
      taxId: 'TIN-44556677',
      authorizedSignatory: 'Ahmad Wali',
      technicalContact: 'Khalid Jamil',
      staticIpRequired: true
    }
  },
  {
    id: 'CAF-2024-003',
    customerType: 'Individual',
    fullName: 'Zahra Hussaini',
    idNumber: 'P-55667788',
    idType: 'Passport',
    address: 'Karte 3, Kabul',
    contactNumber: '+93 78 555 1122',
    serviceType: 'Data Only',
    planName: 'Fiber Air Pro',
    status: 'Rejected',
    submissionDate: '2024-03-18T14:20:00Z',
    documents: [
      { id: 'D5', name: 'Passport Copy', type: 'ID Card', uploadDate: '2024-03-18', status: 'Rejected' }
    ]
  },
  {
    id: 'CAF-2024-004',
    customerType: 'Individual',
    fullName: 'Samiullah Khan',
    idNumber: 'T-88776655',
    idType: 'Tazkira',
    address: 'Kandahar City',
    contactNumber: '+93 74 111 2222',
    serviceType: 'Prepaid',
    planName: 'Elite Plus 50GB',
    status: 'Correction',
    submissionDate: '2024-03-22T11:00:00Z',
    documents: [
      { id: 'D6', name: 'Tazkira Front', type: 'ID Card', uploadDate: '2024-03-22', status: 'Rejected' }
    ]
  },
  {
    id: 'CAF-2024-005',
    customerType: 'Corporate',
    fullName: 'Global Logistics Group',
    idNumber: 'C-112233',
    idType: 'License',
    address: 'Herat Industrial Park',
    contactNumber: '+93 40 555 6666',
    serviceType: 'Postpaid',
    planName: 'Enterprise Unlimited',
    status: 'Archived',
    submissionDate: '2024-01-10T09:00:00Z',
    documents: [
      { id: 'D7', name: 'Business License', type: 'Corporate Doc', uploadDate: '2024-01-10', status: 'Verified' }
    ]
  }
];

export const MOCK_STATS: Stats = {
  totalPending: 45,
  totalApproved: 1240,
  totalRejected: 12,
  totalDocs: 3500
};

export const MOCK_TEMPLATES: CAFTemplate[] = [
  {
    id: 'TPL-IND-PRE-001',
    name: 'Individual Prepaid Basic',
    description: 'Standard template for individual prepaid SIM registration.',
    customerType: 'Individual',
    businessType: 'SIM Registration',
    channel: 'Direct',
    product: 'Prepaid Standard',
    isActive: true,
    lastModified: '2024-04-01T08:00:00Z',
    fields: [
      { id: 'f1', label: 'Full Name', type: 'text', required: true },
      { id: 'f2', label: 'ID Number', type: 'text', required: true },
      { id: 'f3', label: 'Contact Number', type: 'text', required: true },
    ],
    termsAndConditions: `
      <h2>General Information</h2>
      <p>The subscriber agrees to the following terms for the ATOMA Mobile service.</p>
      <ul>
        <li>Subscriber Name must match the provided identity document.</li>
        <li>Service is subject to regulatory verification.</li>
      </ul>
      <h2>Declaration</h2>
      <p>I hereby declare that all information submitted by me is correct, true and valid.</p>
    `
  },
  {
    id: 'TPL-CORP-POST-002',
    name: 'Corporate Postpaid Enterprise',
    description: 'Extended template for corporate enterprise solution accounts.',
    customerType: 'Corporate',
    businessType: 'Business Solution',
    channel: 'Direct',
    product: 'Enterprise Unbound',
    isActive: true,
    lastModified: '2024-04-10T14:30:00Z',
    fields: [
      { id: 'c1', label: 'Company Name', type: 'text', required: true },
      { id: 'c2', label: 'Tax ID (TIN)', type: 'text', required: true },
      { id: 'c3', label: 'Static IP Required', type: 'checkbox', required: false },
    ],
    termsAndConditions: `
      <h2>Corporate Terms</h2>
      <table style="width: 100%; border-collapse: collapse; border: 1px solid black;">
        <tr>
          <th style="border: 1px solid black; padding: 8px;">Registration No</th>
          <td style="border: 1px solid black; padding: 8px;">As per License</td>
        </tr>
        <tr>
          <th style="border: 1px solid black; padding: 8px;">Business Category</th>
          <td style="border: 1px solid black; padding: 8px;">Tier 1 Enterprise</td>
        </tr>
      </table>
      <p>Authorized Signatory must provide POA and valid ID evidence.</p>
    `
  }
];
