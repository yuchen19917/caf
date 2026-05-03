export type CAFStatus = 'Pending' | 'Approved' | 'Rejected' | 'Draft' | 'Correction' | 'Archived';
export type CustomerType = 'Individual' | 'Corporate';
export type ServiceType = 'Prepaid' | 'Postpaid' | 'Data Only';

export interface CAFTemplate {
  id: string;
  name: string;
  description: string;
  customerType: CustomerType;
  businessType: string;
  channel: 'Direct' | 'Agent' | 'Online';
  product: string;
  fields: {
    id: string;
    label: string;
    type: 'text' | 'number' | 'date' | 'select' | 'textarea' | 'checkbox';
    required: boolean;
    options?: string[];
  }[];
  lastModified: string;
  isActive: boolean;
  termsAndConditions?: string;
}

export interface Document {
  id: string;
  type: string;
  name: string;
  uploadDate: string;
  status: 'Verified' | 'Unverified' | 'Rejected';
  url?: string;
}

export interface CustomerApplicationForm {
  id: string;
  customerType: CustomerType;
  fullName: string;
  idNumber: string;
  idType: string;
  address: string;
  contactNumber: string;
  email?: string;
  serviceType: ServiceType;
  planName: string;
  status: CAFStatus;
  submissionDate: string;
  documents: Document[];
  corporateDetails?: {
    companyRegNo: string;
    taxId: string;
    authorizedSignatory: string;
    technicalContact: string;
    staticIpRequired: boolean;
  };
}

export interface Stats {
  totalPending: number;
  totalApproved: number;
  totalRejected: number;
  totalDocs: number;
}
