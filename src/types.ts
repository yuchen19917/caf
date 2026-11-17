export type CAFStatus = 'Pending' | 'Approved' | 'Rejected' | 'Draft' | 'Correction' | 'Archived';
export type CustomerType = 'Individual' | 'Corporate';
export type ServiceType = 'Prepaid' | 'Postpaid' | 'Data Only';

export type TemplateLifecycle = 'draft' | 'active' | 'deprecated' | 'archived';

export interface TemplateVersionEntry {
  version: string;
  modifiedAt: string;
  modifiedBy: string;
  notes: string;
  lifecycle: TemplateLifecycle;
}

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
  /** Semantic version string, e.g. "1.0", "2.1" */
  version: string;
  /** Lifecycle state controlling availability */
  lifecycle: TemplateLifecycle;
  /** Audit trail of version changes */
  versionHistory?: TemplateVersionEntry[];
  termsAndConditions?: string;
  /** Rich-text terms are a complete printable CAF page (preview skips default chrome). */
  isFullPageTerms?: boolean;
}

export interface Document {
  requirementCode?: string;
  id: string;
  type: string;
  name: string;
  uploadDate: string;
  status: 'Verified' | 'Unverified' | 'Rejected';
  url?: string;
  fileId?: string; // Reference to IndexedDB file
}

export interface PrepaidTemplate {
  id: string;
  version: number;
  name: string;
  fields: { key: 'fullName' | 'idType' | 'idNumber' | 'contactNumber'; label: string; required: boolean; maxLength: number }[];
  documents: { code: string; label: string; required: boolean }[];
}

export interface CustomerApplicationForm {
  blueprintSnapshot?: CAFTemplate;
  templateValues?: Record<string, string>;
  history?: {
    id: string;
    action: 'submitted' | 'resubmitted' | 'status_changed';
    at: string;
    status: CAFStatus;
    files?: string[];
    reason?: string;
  }[];
  templateVersionId?: string;
  templateSnapshot?: PrepaidTemplate;
  correction?: { requirementCode: string; reason: string };
  id: string;
  customerType: CustomerType;
  fullName: string;
  idNumber: string;
  idType: string;
  address: string;
  billingAddress?: string;
  contactNumber: string;
  email?: string;
  serviceType: ServiceType;
  planName: string;
  status: CAFStatus;
  submissionDate: string;
  documents: Document[];
  createdBy?: string; // User ID of the creator
  createdByUsername?: string; // Username of the creator
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

export type GlobalRuleCategory =
  | 'business_compliance'
  | 'data_integrity'
  | 'kyc_security'
  | 'audit_lifecycle';

export type GlobalRuleEnforcement = 'blocking' | 'warning' | 'informational';

/** Cross-template compliance / validation rules (mock registry). */
export interface GlobalRule {
  id: string;
  category: GlobalRuleCategory;
  name: string;
  summary: string;
  enforcement: GlobalRuleEnforcement;
  /** Optional technical hint (regex pattern id, API name, retention years, etc.) */
  technicalRef?: string;
  version: string;
  lastModified: string;
  isActive: boolean;
}
