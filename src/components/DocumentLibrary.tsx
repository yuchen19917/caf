import { getSeedAttachment } from '../lib/attachmentFile';
import { PreviewDrawer } from './PreviewDrawer';
import { RecordList } from './RecordList';
import React, { useEffect, useMemo, useState } from 'react';
import { fileStorage, type UploadedFile } from '../lib/fileStorage';
import type { CustomerApplicationForm } from '../types';
import { Upload, FileText, Image, FileSignature, MapPin, FileCheck, CreditCard, Building2, Download, Eye, User, X } from 'lucide-react';
import { cn } from '../lib/utils';
import { useTranslation } from 'react-i18next';
import { useApplications } from '../context/ApplicationContext';
import { motion, AnimatePresence } from 'motion/react';

type DocumentCategory = 
  | 'id_document'      // 证件
  | 'photo'            // 照片
  | 'signature'        // 签名
  | 'address_proof'    // 地址证明
  | 'authorization'    // 授权书
  | 'contract'         // 合同
  | 'business_license' // 企业证明
  | 'payment_proof'    // 支付凭证
  | 'other';           // 其他

type DocumentStatus = 'verified' | 'pending' | 'rejected' | 'archived';
type FileType = 'image' | 'pdf' | 'doc' | 'excel' | 'html';

interface DocumentFile {
  fileId?: string;
  id: string;
  name: string;
  category: DocumentCategory;
  type: FileType;
  size: string;
  uploadDate: string;
  uploadedBy: string;
  status: DocumentStatus;
  cafId?: string;
  customerName?: string;
  customerType?: 'Individual' | 'Corporate';
  businessType?: string;
  serviceType?: string;
  tags?: string[];
  notes?: string;
}

const samplePreviews: Record<string, { documentName: string; fields: [string, string][]; portrait?: boolean }> = {
  'D001-1': {
    documentName: 'Identity document',
    fields: [],
  },
  'D001-2': {
    documentName: 'Applicant photo',
    fields: [['Capture source', 'Retail counter']],
    portrait: true,
  },
};

const sampleHistory: NonNullable<CustomerApplicationForm['history']> = [
  { id: 'demo-submit', action: 'submitted', at: '2026-10-10T08:30:00Z', status: 'Pending', files: ['Tazkira Front', 'Customer Photo', 'SIM Application Form'] },
  { id: 'demo-return', action: 'status_changed', at: '2026-10-10T08:45:00Z', status: 'Correction' },
  { id: 'demo-resubmit', action: 'resubmitted', at: '2026-10-10T09:05:00Z', status: 'Pending', files: ['Tazkira Front (clear copy)'] },
  { id: 'demo-approve', action: 'status_changed', at: '2026-10-10T09:20:00Z', status: 'Approved' },
];

export default function DocumentLibrary({ user }: { user: any }) {
  const { t } = useTranslation();
  const { getFilteredCAFs } = useApplications();
  const [viewingDocument, setViewingDocument] = useState<DocumentFile | null>(null);
  const [detailTab, setDetailTab] = useState<'details' | 'history' | 'file'>('details');
  const [original, setOriginal] = useState<UploadedFile | null | undefined>();
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  // Get filtered CAFs based on user role
  const cafs = useMemo(() => {
    if (!user) return [];
    return getFilteredCAFs(user);
  }, [getFilteredCAFs, user]);

  const application = cafs.find(caf => caf.id === viewingDocument?.cafId);
  const fileId = viewingDocument?.fileId;
  const samplePreview = viewingDocument && !fileId && application?.documents.some(doc => doc.id === viewingDocument.id)
    ? samplePreviews[viewingDocument.id]
    : undefined;
  const showSampleHistory = Boolean((samplePreview || (application?.id === 'CAF-2026-026' && viewingDocument?.id === 'D001-3')) && !application?.history?.length);
  const history = showSampleHistory ? sampleHistory : application?.history;
  const sourceDocument = application?.documents.find(doc => doc.id === viewingDocument?.id);
  const seedFile = application && sourceDocument ? getSeedAttachment(application, sourceDocument) : undefined;
  const activeOriginal = original?.id === fileId ? original : undefined;
  const previewFile = seedFile ?? activeOriginal;
  const previewImage = previewFile?.type.startsWith('image/') ? previewFile.data : undefined;
  useEffect(() => {
    if (detailTab !== 'file' || !fileId) return;
    let active = true;
    setOriginal(undefined);
    fileStorage.getFile(fileId).then(file => {
      if (active) setOriginal(file ?? null);
    }).catch(() => {
      if (active) setOriginal(null);
    });
    return () => { active = false; };
  }, [detailTab, fileId]);

  // 从实际 CAF 数据生成文档列表
  const documents: DocumentFile[] = useMemo(() => {
    const docs: DocumentFile[] = [];
    
    cafs.forEach(caf => {
      if (caf.documents && caf.documents.length > 0) {
        caf.documents.forEach(doc => {
          // 根据文档类型映射到分类
          let category: DocumentCategory = 'other';
          const docTypeLower = doc.type.toLowerCase();
          
          if (docTypeLower.includes('id') || docTypeLower.includes('passport') || docTypeLower.includes('aadhar') || docTypeLower.includes('pan')) {
            category = 'id_document';
          } else if (docTypeLower.includes('photo') || docTypeLower.includes('applicant')) {
            category = 'photo';
          } else if (docTypeLower.includes('signature') || docTypeLower.includes('biometric')) {
            category = 'signature';
          } else if (docTypeLower.includes('address') || docTypeLower.includes('utility')) {
            category = 'address_proof';
          } else if (docTypeLower.includes('authorization') || docTypeLower.includes('letter')) {
            category = 'authorization';
          } else if (docTypeLower.includes('contract') || docTypeLower.includes('agreement')) {
            category = 'contract';
          } else if (docTypeLower.includes('business') || docTypeLower.includes('license') || docTypeLower.includes('registration') || docTypeLower.includes('gst')) {
            category = 'business_license';
          } else if (docTypeLower.includes('payment') || docTypeLower.includes('receipt')) {
            category = 'payment_proof';
          }
          
          // 确定文件类型
          const seed = getSeedAttachment(caf, doc);
          let fileType: FileType = seed?.type === 'text/html' ? 'html' : seed ? 'image' : 'pdf';
          if (doc.name.match(/\.(jpg|jpeg|png|gif)$/i)) {
            fileType = 'image';
          } else if (doc.name.match(/\.(doc|docx)$/i)) {
            fileType = 'doc';
          } else if (doc.name.match(/\.(xls|xlsx)$/i)) {
            fileType = 'excel';
          }
          
          // 映射状态
          let status: DocumentStatus = 'pending';
          if (doc.status === 'Verified') status = 'verified';
          else if (doc.status === 'Rejected') status = 'rejected';
          else if (caf.status === 'Archived') status = 'archived';
          
          docs.push({
            id: doc.id,
            fileId: doc.fileId,
            name: doc.name,
            category,
            type: fileType,
            size: seed?.size ? fileStorage.getFileSize(seed.size) : seed ? '—' : '1.2 MB',
            uploadDate: doc.uploadDate,
            uploadedBy: caf.createdByUsername || 'Unknown',
            status,
            cafId: caf.id,
            customerName: caf.fullName,
            customerType: caf.customerType,
            businessType: caf.customerType,
            serviceType: caf.serviceType,
            tags: [doc.type],
          });
        });
      }
    });
    
    return docs;
  }, [cafs]);

  // 文档分类配置
  const documentCategories = [
    { id: 'id_document' as DocumentCategory, name: t('document_library.category_id_document'), icon: FileText, color: 'indigo', count: 156 },
    { id: 'photo' as DocumentCategory, name: t('document_library.category_photo'), icon: Image, color: 'pink', count: 203 },
    { id: 'signature' as DocumentCategory, name: t('document_library.category_signature'), icon: FileSignature, color: 'purple', count: 189 },
    { id: 'address_proof' as DocumentCategory, name: t('document_library.category_address_proof'), icon: MapPin, color: 'blue', count: 142 },
    { id: 'authorization' as DocumentCategory, name: t('document_library.category_authorization'), icon: FileCheck, color: 'green', count: 98 },
    { id: 'contract' as DocumentCategory, name: t('document_library.category_contract'), icon: FileText, color: 'orange', count: 76 },
    { id: 'business_license' as DocumentCategory, name: t('document_library.category_business_license'), icon: Building2, color: 'amber', count: 54 },
    { id: 'payment_proof' as DocumentCategory, name: t('document_library.category_payment_proof'), icon: CreditCard, color: 'emerald', count: 112 },
  ];

  // 模拟文档数据（保留作为后备）
  const mockDocuments: DocumentFile[] = [
    {
      id: 'DOC-001',
      name: 'ID_Card_Front_YangHao.jpg',
      category: 'id_document',
      type: 'image',
      size: '2.4 MB',
      uploadDate: '2026-11-10T10:30:00Z',
      uploadedBy: 'Admin User',
      status: 'verified',
      cafId: 'CAF-2024-001',
      customerName: 'Yang Hao',
      customerType: 'Individual',
      businessType: 'SIM Registration',
      serviceType: 'Prepaid Mobile',
      tags: ['身份证', '正面'],
    },
    {
      id: 'DOC-002',
      name: 'Business_License_AsiaInfoTech.pdf',
      category: 'business_license',
      type: 'pdf',
      size: '1.8 MB',
      uploadDate: '2026-11-10T09:15:00Z',
      uploadedBy: 'Agent Smith',
      status: 'pending',
      cafId: 'CAF-2024-002',
      customerName: 'AsiaInfo Tech Solutions Ltd',
      customerType: 'Corporate',
      businessType: 'Enterprise Broadband',
      serviceType: 'Fiber 100M',
      tags: ['营业执照', '企业'],
    },
    {
      id: 'DOC-003',
      name: 'Customer_Photo_Farooq.png',
      category: 'photo',
      type: 'image',
      size: '3.2 MB',
      uploadDate: '2026-11-09T16:45:00Z',
      uploadedBy: 'Admin User',
      status: 'verified',
      cafId: 'CAF-2024-003',
      customerName: 'Mohammad Farooq',
      customerType: 'Individual',
      businessType: 'SIM Registration',
      serviceType: 'Postpaid Voice+Data',
      tags: ['客户照片', '个人'],
    },
    {
      id: 'DOC-004',
      name: 'Address_Proof_Utility_Bill.pdf',
      category: 'address_proof',
      type: 'pdf',
      size: '0.9 MB',
      uploadDate: '2026-11-09T14:20:00Z',
      uploadedBy: 'Agent Jones',
      status: 'rejected',
      cafId: 'CAF-2024-004',
      customerName: 'Zahra Hussaini',
      customerType: 'Individual',
      businessType: 'SIM Registration',
      serviceType: 'Prepaid Data',
      tags: ['水电费账单', '地址证明'],
      notes: '文件不清晰，需要重新上传',
    },
    {
      id: 'DOC-005',
      name: 'Authorization_Letter_Signed.pdf',
      category: 'authorization',
      type: 'pdf',
      size: '0.5 MB',
      uploadDate: '2026-11-08T11:00:00Z',
      uploadedBy: 'Admin User',
      status: 'verified',
      cafId: 'CAF-2024-005',
      customerName: 'Samiullah Khan',
      customerType: 'Individual',
      businessType: 'Number Portability',
      serviceType: 'Prepaid Mobile',
      tags: ['授权书', '已签名'],
    },
    {
      id: 'DOC-006',
      name: 'Payment_Receipt_001.jpg',
      category: 'payment_proof',
      type: 'image',
      size: '1.2 MB',
      uploadDate: '2026-11-08T09:30:00Z',
      uploadedBy: 'Agent Smith',
      status: 'verified',
      cafId: 'CAF-2024-006',
      customerName: 'Global Logistics Group',
      customerType: 'Corporate',
      businessType: 'Enterprise Solution',
      serviceType: 'Dedicated Line 1G',
      tags: ['支付凭证', '银行转账'],
    },
    {
      id: 'DOC-007',
      name: 'Signature_Sample_Digital.png',
      category: 'signature',
      type: 'image',
      size: '0.3 MB',
      uploadDate: '2026-11-07T15:10:00Z',
      uploadedBy: 'Admin User',
      status: 'pending',
      cafId: 'CAF-2024-007',
      customerName: 'Yang Hao',
      customerType: 'Individual',
      businessType: 'SIM Registration',
      serviceType: 'Prepaid Mobile',
      tags: ['数字签名', '样本'],
    },
    {
      id: 'DOC-008',
      name: 'Service_Contract_2024.pdf',
      category: 'contract',
      type: 'pdf',
      size: '2.1 MB',
      uploadDate: '2026-11-07T10:00:00Z',
      uploadedBy: 'Agent Jones',
      status: 'archived',
      cafId: 'CAF-2024-008',
      customerName: 'AsiaInfo Tech Solutions Ltd',
      customerType: 'Corporate',
      businessType: 'Enterprise Broadband',
      serviceType: 'Fiber 100M',
      tags: ['服务合同', '2024年度'],
    },
  ];

  // 过滤文档
  const getStatusColor = (status: DocumentStatus) => {
    switch (status) {
      case 'verified': return 'bg-emerald-100 text-emerald-700';
      case 'pending': return 'bg-amber-100 text-amber-700';
      case 'rejected': return 'bg-rose-100 text-rose-700';
      case 'archived': return 'bg-slate-100 text-slate-500';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const getStatusText = (status: DocumentStatus) => {
    switch (status) {
      case 'verified': return t('document_library.status_verified');
      case 'pending': return t('document_library.status_pending');
      case 'rejected': return t('document_library.status_rejected');
      case 'archived': return t('document_library.status_archived');
      default: return status;
    }
  };

  const getCategoryName = (category: DocumentCategory) =>
    documentCategories.find(item => item.id === category)?.name ?? category;

  return (
    <div className="space-y-8 pb-12 flex flex-col h-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-800 tracking-tight">{t('document_library.management_center')}</h2>
          <p className="text-slate-500 text-sm mt-1 font-medium">
            {t('document_library.management_subtitle')}
          </p>
        </div>
        <button 
          onClick={() => setIsUploadModalOpen(true)}
          className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-900/10 active:scale-95"
        >
          <Upload size={14} /> {t('document_library.upload_document')}
        </button>
      </div>

      <RecordList rows={documents.length ? documents : mockDocuments}
        columns={[t('record_list.file'), t('document_library.document_category'), t('caf_list.col_customer'),
          t('templates_page.filter_customer'), t('document_library.business_type'), t('record_list.service'),
          t('document_library.caf_number'), t('record_list.upload_date'), t('record_list.file_size'),
          t('document_library.uploaded_by'), t('document_library.tags'), t('templates_page.table_status'), t('templates_page.table_actions')]}
        search={doc => [doc.name, doc.customerName, doc.cafId, doc.uploadedBy, ...(doc.tags ?? [])]}
        filters={[
          { label: t('document_library.document_category'), value: doc => doc.category, display: value => getCategoryName(value as DocumentCategory) },
          { label: t('templates_page.filter_customer'), value: doc => doc.customerType ?? '' },
          { label: t('templates_page.table_status'), value: doc => doc.status, display: value => getStatusText(value as DocumentStatus) },
        ]}
        renderRow={doc => (
          <tr key={doc.id} className="hover:bg-slate-50">
            <td className="font-semibold">{doc.name}</td>
            <td>{getCategoryName(doc.category)}</td>
            <td>{doc.customerName || '—'}</td>
            <td>{doc.customerType || '—'}</td>
            <td>{doc.businessType || '—'}</td>
            <td>{doc.serviceType || '—'}</td>
            <td>{doc.cafId || '—'}</td>
            <td>{new Date(doc.uploadDate).toLocaleDateString()}</td>
            <td>{doc.size}</td>
            <td>{doc.uploadedBy}</td>
            <td>{doc.tags?.join(', ') || '—'}</td>
            <td><span className={cn('rounded px-2 py-0.5 text-xs font-semibold', getStatusColor(doc.status))}>{getStatusText(doc.status)}</span></td>
            <td>
              <button type="button" onClick={() => {
                setOriginal(undefined);
                setDetailTab('details');
                setViewingDocument(doc);
              }}
                className="rounded-lg p-2 text-slate-500 hover:bg-indigo-50 hover:text-indigo-600"
                aria-label={t('document_library.view_details')} title={t('document_library.view_details')}>
                <Eye size={16} />
              </button>
            </td>
          </tr>
        )}
      />

      {/* View Document Modal */}
      {viewingDocument && (
        <PreviewDrawer label={viewingDocument.name} onClose={() => setViewingDocument(null)}>
            <div className="px-8 py-6 bg-slate-50 border-b border-slate-200 flex items-center justify-between shrink-0">
              <div>
                <h3 className="text-xl font-bold text-slate-800">{t('document_library.document_details')}</h3>
                <p className="text-xs text-slate-500 mt-1 font-medium">{t('document_library.document_id')}: {viewingDocument.id}</p>
              </div>
              <button 
                onClick={() => setViewingDocument(null)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full transition-all"
              >
                <X size={20} />
              </button>
            </div>

            <nav aria-label={t('document_library.document_details')} className="flex shrink-0 flex-wrap gap-2 border-b px-5 py-3">
              {(['details', 'history', 'file'] as const).map(tab => (
                <button key={tab} type="button" aria-pressed={detailTab === tab}
                  onClick={() => setDetailTab(tab)}
                  className={cn('rounded-lg px-3 py-2 text-sm', detailTab === tab ? 'bg-indigo-50 font-semibold text-indigo-700' : 'text-slate-600 hover:bg-slate-50')}>
                  {t('document_library.drawer_' + tab)}
                </button>
              ))}
            </nav>
            <div className="min-h-0 flex-1 overflow-auto p-5 sm:p-8">
              {detailTab === 'history' && (
                <section className="space-y-3">
                  <h4 className="font-semibold">{t('document_library.application_history')}</h4>
                  {history?.length ? (
                    <ol className="divide-y rounded-xl border border-slate-200">
                      {[...history].reverse().map(event => (
                        <li key={event.id} className="space-y-1 p-4 text-sm">
                          <div className="flex flex-wrap items-baseline justify-between gap-2">
                            <p className="font-semibold">{t('document_library.event_' + event.action)} · {t('caf_list.status_' + event.status?.toLowerCase(), { defaultValue: event.status ?? '—' })}</p>
                            <time dateTime={event.at} className="text-xs text-slate-500">{new Date(event.at).toLocaleString()}</time>
                          </div>
                          {event.files?.length > 0 && <p className="break-words text-slate-600">{event.files.join(', ')}</p>}
                          {event.reason && <p className="break-words text-amber-800">{event.reason}</p>}
                          {showSampleHistory && event.status === 'Correction' && (
                            <p className="text-amber-800">{t('document_library.demo_correction_reason')}</p>
                          )}
                        </li>
                      ))}
                    </ol>
                  ) : <p className="text-sm text-slate-600">{t('document_library.history_empty')}</p>}
                </section>
              )}
              {detailTab === 'file' && (
                previewFile?.type === 'text/html' ? (
                  <iframe src={previewFile.data} sandbox="" title={previewFile.name} className="h-full min-h-[600px] w-full rounded-lg border border-slate-200" />
                ) : previewImage ? (
                  <img src={previewImage} alt={viewingDocument.name} className="mx-auto block h-auto max-w-full rounded-lg" />
                ) : samplePreview ? (
                  <div className="mx-auto max-w-2xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm" dir="ltr">
                    <div className="space-y-6 p-5 sm:p-8">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{viewingDocument.cafId}</p>
                        <h4 className="mt-2 text-2xl font-semibold text-slate-900">{samplePreview.documentName}</h4>
                      </div>
                      <div className="flex flex-wrap gap-6">
                        {samplePreview.portrait && (
                          <div className="flex h-32 w-28 items-center justify-center rounded-xl bg-slate-100 text-slate-400" aria-hidden="true">
                            <User size={48} />
                          </div>
                        )}
                        <dl className="grid min-w-48 flex-1 gap-4 sm:grid-cols-2">
                          {application?.fullName && (
                            <div>
                              <dt className="text-xs text-slate-500">{t('document_library.customer_name')}</dt>
                              <dd className="mt-1 text-sm font-semibold text-slate-800">{application.fullName}</dd>
                            </div>
                          )}
                          {samplePreview.fields.map(([label, value]) => (
                            <div key={label}>
                              <dt className="text-xs text-slate-500">{label}</dt>
                              <dd className="mt-1 text-sm font-semibold text-slate-800">{value}</dd>
                            </div>
                          ))}
                        </dl>
                      </div>
                    </div>
                  </div>
                ) : !fileId || original === null
                  ? <p role="status" className="text-sm text-slate-600">{t('document_library.original_unavailable')}</p>
                  : !activeOriginal
                    ? <p role="status">{t('document_library.original_loading')}</p>
                    : activeOriginal.type === 'application/pdf'
                      ? <iframe src={activeOriginal.data} title={activeOriginal.name} className="h-full min-h-96 w-full rounded-lg border" />
                      : <p className="text-sm text-slate-600">{t('document_library.original_unavailable')}</p>
              )}
              {detailTab === 'details' && <div className="space-y-6">
              <div>
                <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">{t('document_library.basic_info')}</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-400 uppercase">{t('document_library.file_name')}</p>
                    <p className="text-sm font-semibold text-slate-800">{viewingDocument.name}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-400 uppercase">{t('document_library.file_type')}</p>
                    <p className="text-sm font-semibold text-slate-800">{viewingDocument.type.toUpperCase()}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-400 uppercase">{t('document_library.file_size')}</p>
                    <p className="text-sm font-semibold text-slate-800">{viewingDocument.size}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-400 uppercase">{t('document_library.status')}</p>
                    <span className={cn("text-xs font-bold uppercase px-2 py-1 rounded inline-block", getStatusColor(viewingDocument.status))}>
                      {getStatusText(viewingDocument.status)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-200">
                <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">{t('document_library.related_info')}</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-400 uppercase">{t('document_library.customer_name')}</p>
                    <p className="text-sm font-semibold text-slate-800">{viewingDocument.customerName}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-400 uppercase">{t('document_library.caf_number')}</p>
                    <p className="text-sm font-semibold text-slate-800">{viewingDocument.cafId}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-400 uppercase">{t('document_library.upload_date')}</p>
                    <p className="text-sm font-semibold text-slate-800">
                      {new Date(viewingDocument.uploadDate).toLocaleString('zh-CN')}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-400 uppercase">{t('document_library.uploader')}</p>
                    <p className="text-sm font-semibold text-slate-800">{viewingDocument.uploadedBy}</p>
                  </div>
                </div>
              </div>

              {viewingDocument.tags && viewingDocument.tags.length > 0 && (
                <div className="pt-6 border-t border-slate-200">
                  <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">{t('document_library.tags')}</h4>
                  <div className="flex flex-wrap gap-2">
                    {viewingDocument.tags.map((tag, i) => (
                      <span key={i} className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {viewingDocument.notes && (
                <div className="pt-6 border-t border-slate-200">
                  <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">{t('document_library.notes')}</h4>
                  <p className="text-sm text-slate-600 bg-amber-50 border-l-4 border-amber-400 p-4 rounded">
                    {viewingDocument.notes}
                  </p>
                </div>
              )}
              {application && (
                <div className="space-y-2 border-t border-slate-200 pt-4 text-sm">
                  {application.templateSnapshot && <p>{application.templateSnapshot.name} · v{application.templateSnapshot.version}</p>}
                  {application.correction && <p className="text-amber-800">{application.correction.reason}</p>}
                  <p className="text-slate-500">{t('document_library.retention_unconfigured')}</p>
                </div>
              )}
              </div>}
            </div>

            <div className="px-8 py-6 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3 shrink-0">
              <button 
                onClick={() => setViewingDocument(null)}
                className="px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all"
              >
                {t('document_library.close')}
              </button>
              {detailTab === 'file' && previewFile && user?.permissions?.downloadDocuments && <button type="button"
                onClick={() => fileStorage.downloadFile(previewFile)}
                className="px-5 py-2.5 bg-emerald-600 rounded-xl text-xs font-bold uppercase tracking-widest text-white hover:bg-emerald-700 transition-all">
                <Download size={14} className="inline mr-2" />
                {t('document_library.download_document')}
              </button>}
            </div>
        </PreviewDrawer>
      )}

      {/* Upload Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden"
          >
            <div className="px-8 py-6 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-slate-800">{t('document_library.upload_modal_title')}</h3>
                <p className="text-xs text-slate-500 mt-1 font-medium">{t('document_library.upload_modal_subtitle')}</p>
              </div>
              <button 
                onClick={() => setIsUploadModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full transition-all"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-8 space-y-6">
              <div className="border-2 border-dashed border-slate-300 rounded-2xl p-12 text-center hover:border-indigo-600 hover:bg-indigo-50/50 transition-all cursor-pointer">
                <Upload size={48} className="text-slate-300 mx-auto mb-4" />
                <p className="text-sm font-bold text-slate-800 mb-2">{t('document_library.upload_area_text')}</p>
                <p className="text-xs text-slate-400">{t('document_library.upload_batch_text')}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase">{t('document_library.document_category_label')}</label>
                  <select className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20">
                    <option>{t('document_library.select_category')}</option>
                    {documentCategories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase">{t('document_library.related_caf')}</label>
                  <input 
                    type="text" 
                    placeholder={t('document_library.enter_caf_number')}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase">{t('document_library.notes_optional')}</label>
                <textarea 
                  rows={3}
                  placeholder={t('document_library.add_notes')}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 resize-none"
                />
              </div>
            </div>

            <div className="px-8 py-6 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3">
              <button 
                onClick={() => setIsUploadModalOpen(false)}
                className="px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all"
              >
                {t('document_library.cancel')}
              </button>
              <button className="px-5 py-2.5 bg-indigo-600 rounded-xl text-xs font-bold uppercase tracking-widest text-white hover:bg-indigo-700 transition-all">
                <Upload size={14} className="inline mr-2" />
                {t('document_library.start_upload')}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
