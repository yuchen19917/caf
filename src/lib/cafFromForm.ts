import type { CustomerApplicationForm, CustomerType, Document, ServiceType } from '../types';
import type { UploadedFile } from './fileStorage';

function mapSubscriberToServiceType(subscriberType: string): ServiceType {
  const s = subscriberType.replace(/\s+/g, '').toLowerCase();
  if (s.includes('post')) return 'Postpaid';
  if (s.includes('prepaid') || s.startsWith('pre')) return 'Prepaid';
  return 'Data Only';
}

/** Mirrors CAFForm internal FormData fields used when building a registry row */
export type CAFFormShape = {
  businessType: string;
  customerType: CustomerType;
  applicantType: string;
  fullName: string;
  contactNumber: string;
  email: string;
  address: string;
  licenceDetails: string;
  signatoryName: string;
  signatoryContact: string;
  signatoryEmail: string;
  serviceType: string;
  serviceDelivery: string;
  planName: string;
  subscriberType: string;
  billingCycle: string;
  staticIpRequired: boolean;
  staticIpCount: string;
  uploadedDocs: UploadedFile[];
};

function nextCafId(cafs: CustomerApplicationForm[]): string {
  const year = new Date().getFullYear();
  let max = 0;
  const re = new RegExp(`^CAF-${year}-(\\d+)$`);
  for (const c of cafs) {
    const m = c.id.match(re);
    if (m) max = Math.max(max, parseInt(m[1], 10));
  }
  return `CAF-${year}-${String(max + 1).padStart(3, '0')}`;
}

export function buildCafFromForm(form: CAFFormShape, cafs: CustomerApplicationForm[]): CustomerApplicationForm {
  const id = nextCafId(cafs);
  const submissionDate = new Date().toISOString();
  const day = submissionDate.slice(0, 10);
  const docs: Document[] =
    form.uploadedDocs.length > 0
      ? form.uploadedDocs.map((file, i) => ({
          id: `DOC-${id}-${i}`,
          name: file.name,
          type: 'Attachment',
          uploadDate: day,
          status: 'Unverified',
          fileId: file.id, // Store reference to IndexedDB file
        }))
      : [
          {
            id: `DOC-${id}-0`,
            name: 'CAF checklist (pending uploads)',
            type: 'Summary',
            uploadDate: day,
            status: 'Unverified',
          },
        ];

  const corporate =
    form.customerType === 'Corporate'
      ? {
          companyRegNo: form.licenceDetails || '—',
          taxId: '—',
          authorizedSignatory: form.signatoryName || '—',
          technicalContact: '—',
          staticIpRequired: form.staticIpRequired,
        }
      : undefined;

  const planLabel = form.planName.trim() || `${form.serviceType}`.trim() || '—';

  return {
    id,
    customerType: form.customerType,
    fullName: form.fullName.trim() || 'Unknown applicant',
    idNumber: form.licenceDetails.trim() || form.contactNumber.trim() || 'Pending',
    idType: form.customerType === 'Corporate' ? form.applicantType : 'National ID',
    address: form.address.trim() || '—',
    contactNumber: form.contactNumber.trim() || '—',
    email: form.email.trim() || undefined,
    serviceType: mapSubscriberToServiceType(form.subscriberType),
    planName: planLabel,
    status: 'Pending',
    submissionDate,
    documents: docs,
    corporateDetails: corporate,
  };
}

/** Re-submit after correction: same CAF id, back to Pending for audit. */
export function mergeCafCorrection(prev: CustomerApplicationForm, form: CAFFormShape): CustomerApplicationForm {
  const submissionDate = new Date().toISOString();
  const day = submissionDate.slice(0, 10);
  const docs: Document[] =
    form.uploadedDocs.length > 0
      ? form.uploadedDocs.map((file, i) => ({
          id: `DOC-${prev.id}-r-${i}`,
          name: file.name,
          type: 'Attachment',
          uploadDate: day,
          status: 'Unverified',
          fileId: file.id, // Store reference to IndexedDB file
        }))
      : prev.documents;

  const corporate =
    form.customerType === 'Corporate'
      ? {
          companyRegNo: form.licenceDetails.trim() || prev.corporateDetails?.companyRegNo || '—',
          taxId: prev.corporateDetails?.taxId || '—',
          authorizedSignatory: form.signatoryName.trim() || prev.corporateDetails?.authorizedSignatory || '—',
          technicalContact: prev.corporateDetails?.technicalContact || '—',
          staticIpRequired: form.staticIpRequired,
        }
      : undefined;

  const planLabel = form.planName.trim() || `${form.serviceType}`.trim() || prev.planName;

  return {
    ...prev,
    customerType: form.customerType,
    fullName: form.fullName.trim() || prev.fullName,
    idNumber: form.licenceDetails.trim() || prev.idNumber,
    idType: form.customerType === 'Corporate' ? form.applicantType : prev.idType,
    address: form.address.trim() || prev.address,
    contactNumber: form.contactNumber.trim() || prev.contactNumber,
    email: form.email.trim() || undefined,
    serviceType: mapSubscriberToServiceType(form.subscriberType),
    planName: planLabel,
    status: 'Pending',
    submissionDate,
    documents: docs,
    corporateDetails: corporate ?? prev.corporateDetails,
  };
}
