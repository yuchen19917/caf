import { loadAttachment } from '../lib/attachmentFile';
import { PreviewDrawer } from './PreviewDrawer';
import { RecordList } from './RecordList';
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import { AlertTriangle, CheckCircle2, XCircle, Eye, UserCheck, FileText, Download, ImageIcon, X } from 'lucide-react';
import { cn } from '../lib/utils';
import type { CustomerApplicationForm } from '../types';
import { useApplications } from '../context/ApplicationContext';
import { fileStorage, type UploadedFile } from '../lib/fileStorage';

function translateCafStatus(status: string, t: TFunction) {
  switch (status) {
    case 'Pending':
      return t('audit_portal.status_pending');
    case 'Rejected':
      return t('audit_portal.status_rejected');
    case 'Approved':
      return t('audit_portal.status_approved');
    case 'Correction':
      return t('audit_portal.status_correction');
    case 'Archived':
      return t('audit_portal.status_archived');
    default:
      return status;
  }
}

function translateServiceType(serviceType: string, t: TFunction) {
  if (serviceType === 'Prepaid') return t('audit_portal.service_prepaid');
  if (serviceType === 'Postpaid') return t('audit_portal.service_postpaid');
  if (serviceType === 'Data Only') return t('audit_portal.service_data_only');
  return serviceType;
}

function customerTypeLabel(ct: string, t: TFunction) {
  if (ct === 'Individual') return t('templates_page.customer_type_individual');
  if (ct === 'Corporate') return t('templates_page.customer_type_corporate');
  return ct;
}

export default function AuditPortal({ initialReviewId }: { initialReviewId?: string }) {
  const { t } = useTranslation();
  const { cafs, approveCAF, approveAndArchive, rejectCAF, requestCorrection } = useApplications();
  const queue = useMemo(
    () => cafs.filter((c) => c.status === 'Pending' || c.status === 'Approved' || c.status === 'Rejected'),
    [cafs]
  );
  const [selectedAudit, setSelectedAudit] = useState<CustomerApplicationForm | null>(() =>
    queue.find(caf => caf.id === initialReviewId) ?? null);
  const [actionFeedback, setActionFeedback] = useState<{ type: 'approved' | 'archived' | 'rejected' | 'correction'; cafId: string } | null>(null);
  const [previewFile, setPreviewFile] = useState<UploadedFile | null>(null);
  const [documentFiles, setDocumentFiles] = useState<Map<string, UploadedFile>>(new Map());
  const [reviewError, setReviewError] = useState('');
  const [reviewing, setReviewing] = useState(false);
  const [correctionCode, setCorrectionCode] = useState('');
  const [correctionReason, setCorrectionReason] = useState('');

  function openReview(caf: CustomerApplicationForm) {
    setActionFeedback(null);
    setDocumentFiles(new Map());
    setReviewError('');
    setCorrectionCode('');
    setCorrectionReason('');
    setSelectedAudit(caf);
  }

  function closeReview() {
    setPreviewFile(null);
    setSelectedAudit(null);
  }

  // Load files for selected audit
  useEffect(() => {
    if (!selectedAudit) {
      setDocumentFiles(new Map());
      return;
    }

    let cancelled = false;
    const loadFiles = async () => {
      const filesMap = new Map<string, UploadedFile>();
      
      for (const doc of selectedAudit.documents) {
        try {
          const file = await loadAttachment(selectedAudit, doc);
          if (file) filesMap.set(doc.id, file);
        } catch (error) {
          console.error(`Error loading attachment ${doc.id}:`, error);
        }
      }
      
      if (!cancelled) setDocumentFiles(filesMap);
    };

    loadFiles();
    return () => { cancelled = true; };
  }, [selectedAudit]);

  async function submitReview(type: 'approved' | 'archived' | 'rejected' | 'correction') {
    if (!selectedAudit || reviewing) return;
    const cafId = selectedAudit.id;
    setReviewError('');
    setReviewing(true);
    try {
      if (type === 'approved') {
        await approveCAF(cafId);
      } else if (type === 'archived') {
        await approveAndArchive(cafId);
      } else if (type === 'rejected') {
        await rejectCAF(cafId);
      } else {
        await requestCorrection(cafId, selectedAudit.templateSnapshot
          ? { requirementCode: correctionCode, reason: correctionReason }
          : undefined);
      }
      closeReview();
      setActionFeedback({ type, cafId });
    } catch (error) {
      setReviewError(error instanceof Error ? error.message : 'Unable to update the application.');
    } finally {
      setReviewing(false);
    }
  }

  return (
    <div className="min-w-0 space-y-5">
      <h2 className="text-3xl font-bold text-slate-800">{t('audit_portal.queue_title')}</h2>
      <RecordList<CustomerApplicationForm> rows={queue}
        columns={[t('document_library.caf_number'), t('caf_list.col_customer'), t('caf_list.col_type'),
          t('record_list.service'), t('caf_list.col_status'), t('templates_page.table_actions')]}
        search={caf => [caf.id, caf.fullName, caf.serviceType]}
        filters={[{ label: t('caf_list.col_status'), value: caf => caf.status, display: value => translateCafStatus(value, t) }]}
        renderRow={caf => (
          <tr key={caf.id} className={selectedAudit?.id === caf.id ? 'bg-indigo-50' : 'hover:bg-slate-50'}>
            <td>{caf.id}</td>
            <td>{caf.fullName}</td>
            <td>{caf.customerType}</td>
            <td>{caf.serviceType}</td>
            <td>{translateCafStatus(caf.status, t)}</td>
            <td><button type="button" onClick={() => openReview(caf)}
              aria-label={t('document_library.view_details') + ' ' + caf.id}
              className="rounded-lg p-2 text-indigo-600 hover:bg-indigo-100"><Eye size={16} /></button></td>
          </tr>
        )}
      />

      {actionFeedback && (
        <p role="status" className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium">
          {actionFeedback.cafId} · {actionFeedback.type === 'archived' ? 'Archived' : t('audit_portal.result_' + actionFeedback.type)}
        </p>
      )}

      {selectedAudit && (
        <PreviewDrawer label={selectedAudit.fullName} onClose={closeReview} busy={reviewing}>
            <header className="flex shrink-0 items-center justify-between gap-4 border-b border-slate-200 px-5 py-4 sm:px-6">
              <div className="min-w-0">
                <h3 id="audit-drawer-title" className="break-words text-lg font-semibold text-slate-900">{selectedAudit.fullName}</h3>
                <p className="mt-1 text-sm text-slate-500">{selectedAudit.id} · {translateCafStatus(selectedAudit.status, t)}</p>
              </div>
              <button type="button" onClick={closeReview} disabled={reviewing}
                aria-label={t('document_library.close')} className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 disabled:opacity-50">
                <X size={20} />
              </button>
            </header>

            <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-5 py-5 sm:px-6">
            <section className="space-y-6">
              <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <UserCheck size={14} className="text-indigo-600 shrink-0" /> {t('audit_portal.section_identity')}
              </h4>
              {selectedAudit.templateSnapshot ? (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <p className="md:col-span-2 text-sm text-slate-600">
                    {selectedAudit.templateSnapshot.name} · Version {selectedAudit.templateSnapshot.version}
                  </p>
                  {selectedAudit.templateSnapshot.fields.map(field => (
                    <div key={field.key} className="rounded-2xl bg-slate-50 p-5">
                      <p className="text-xs font-bold text-slate-500">{field.label}</p>
                      <p className="break-words font-semibold">{selectedAudit[field.key] || '—'}</p>
                    </div>
                  ))}
                </div>
              ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                    {t('audit_portal.registry_name')}
                  </p>
                  <p className="text-base font-bold text-slate-900 uppercase break-words">{selectedAudit.fullName}</p>
                </div>
                <div className="p-5 bg-indigo-50 rounded-2xl border border-indigo-200 relative overflow-hidden group">
                  <div className="relative z-10">
                    <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest mb-2">
                      {selectedAudit.blueprintSnapshot ? 'Identity evidence' : t('audit_portal.biometric_verification')}
                    </p>
                    <p className="text-base font-bold text-indigo-900">{selectedAudit.blueprintSnapshot
                      ? `${selectedAudit.idType || 'ID'} · ${selectedAudit.idNumber || '—'}`
                      : t('audit_portal.biometric_authenticated')}</p>
                  </div>
                  <CheckCircle2
                    size={48}
                    className="absolute -bottom-2 -right-2 text-indigo-200/30 group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
              </div>
              )}
            </section>

            <section className="space-y-6">
              <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Eye size={14} className="text-indigo-600 shrink-0" /> {t('audit_portal.section_evidence')}
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                {selectedAudit.documents.map((doc) => {
                  const file = documentFiles.get(doc.id);
                  const isImage = file?.type.startsWith('image/');
                  const isPDF = file?.type === 'application/pdf';
                  
                  return (
                    <button
                      key={doc.id}
                      type="button"
                      onClick={() => file && setPreviewFile(file)}
                      disabled={!file || reviewing}
                      className="group relative aspect-[4/3] bg-slate-100 rounded-2xl overflow-hidden border border-slate-200 cursor-pointer hover:border-indigo-300 hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
                    >
                      {/* File Preview/Thumbnail */}
                      {isImage && file ? (
                        <img 
                          src={file.data} 
                          alt={doc.name}
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                      ) : isPDF && file ? (
                        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-rose-50 to-orange-50">
                          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M14 2V8H20" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <text x="12" y="16" fontSize="6" fill="#DC2626" textAnchor="middle" fontWeight="bold">PDF</text>
                          </svg>
                        </div>
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <FileText size={32} className="text-slate-300 group-hover:text-indigo-400 transition-colors" />
                        </div>
                      )}

                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-[9px] font-bold text-white uppercase tracking-wider">
                            {t(file ? 'audit_portal.click_to_preview' : 'audit_portal.no_file')}
                          </span>
                        </div>
                      </div>

                      {/* File Info Bar */}
                      <div className="absolute inset-x-0 bottom-0 z-10 border-t border-slate-200 bg-white/95 p-3 text-start">
                        <p className="text-[9px] font-bold text-slate-900 uppercase truncate">{doc.name}</p>
                        {file && (
                          <p className="text-[8px] text-slate-500 mt-0.5">
                            {file.type.split('/')[1].toUpperCase()} • {fileStorage.getFileSize(file.size)}
                          </p>
                        )}
                      </div>

                      {/* Status Indicator */}
                      <div className="absolute top-3 right-3 z-20">
                        <div
                          className={cn(
                            'w-2.5 h-2.5 rounded-full ring-2 ring-white shadow-lg',
                            doc.status === 'Verified'
                              ? 'bg-emerald-500'
                              : doc.status === 'Rejected'
                                ? 'bg-rose-500'
                                : 'bg-amber-500'
                          )}
                        />
                      </div>

                      {/* File Type Badge */}
                      {file && (
                        <div className="absolute top-3 left-3 z-20">
                          <div className="px-2 py-0.5 bg-slate-900/80 backdrop-blur-sm rounded text-[8px] font-bold text-white uppercase tracking-wider">
                            {isImage ? 'IMG' : isPDF ? 'PDF' : 'DOC'}
                          </div>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </section>

            {selectedAudit.templateSnapshot && selectedAudit.status === 'Pending' && (
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="text-sm">Attachment to replace
                  <select className="mt-1 block w-full rounded border p-2" value={correctionCode}
                    onChange={event => setCorrectionCode(event.target.value)}>
                    <option value="">Select an attachment</option>
                    {selectedAudit.documents.map(doc => <option key={doc.id} value={doc.requirementCode}>{doc.type}</option>)}
                  </select>
                </label>
                <label className="text-sm">Correction reason
                  <input className="mt-1 block w-full rounded border p-2" maxLength={500} value={correctionReason}
                    onChange={event => setCorrectionReason(event.target.value)} />
                </label>
              </div>
            )}
            {reviewError && <p role="alert" className="text-sm text-rose-700">{reviewError}</p>}
            </div>
            <footer className="grid shrink-0 grid-cols-1 gap-2 border-t border-slate-200 bg-white px-5 py-4 min-[420px]:grid-cols-3 sm:px-6">
              <button
                type="button"
                onClick={() => submitReview(selectedAudit.status === 'Approved' ? 'archived' : 'approved')}
                disabled={reviewing || !['Pending', 'Approved'].includes(selectedAudit.status)}
                className="flex items-center justify-center gap-3 py-4 bg-indigo-600 text-white text-xs font-bold uppercase tracking-widest rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-900/10 active:scale-95"
              >
                <CheckCircle2 size={16} className="shrink-0" /> {selectedAudit.status === 'Approved' ? 'Archive' : t('audit_portal.approve')}
              </button>
              <button
                type="button"
                onClick={() => submitReview('correction')}
                disabled={reviewing || selectedAudit.status !== 'Pending' || (!!selectedAudit.templateSnapshot && (!correctionCode || !correctionReason.trim()))}
                className="flex items-center justify-center gap-3 py-4 bg-white border border-amber-200 text-amber-600 text-xs font-bold uppercase tracking-widest rounded-2xl hover:bg-amber-50 transition-all active:scale-95"
              >
                <AlertTriangle size={16} className="shrink-0" /> {t('audit_portal.correct')}
              </button>
              <button
                type="button"
                onClick={() => submitReview('rejected')}
                disabled={reviewing || selectedAudit.status !== 'Pending'}
                className="flex items-center justify-center gap-3 py-4 bg-white border border-rose-200 text-rose-600 text-xs font-bold uppercase tracking-widest rounded-2xl hover:bg-rose-50 transition-all active:scale-95"
              >
                <XCircle size={16} className="shrink-0" /> {t('audit_portal.reject')}
              </button>
            </footer>
          {previewFile && (
            <PreviewDrawer label={previewFile.name} onClose={() => setPreviewFile(null)} width="max-w-5xl">
            {/* Preview Header */}
            <div className="px-6 py-4 bg-slate-900 text-white border-b border-slate-700 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                  {previewFile.type.startsWith('image/') ? (
                    <ImageIcon size={20} />
                  ) : (
                    <FileText size={20} />
                  )}
                </div>
                <div>
                  <h3 className="text-sm font-bold">{previewFile.name}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {previewFile.type} • {fileStorage.getFileSize(previewFile.size)} • {new Date(previewFile.uploadDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => fileStorage.downloadFile(previewFile)}
                  className="p-2 text-emerald-400 hover:bg-slate-800 rounded-lg transition-all"
                  title="Download"
                >
                  <Download size={18} />
                </button>
                <button 
                  onClick={() => setPreviewFile(null)}
                  className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all"
                  title="Close"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Preview Content */}
            <div className="flex-1 overflow-auto bg-slate-950 p-6">
              {previewFile.type === 'text/html' ? (
                <iframe src={previewFile.data} sandbox="" title={previewFile.name} className="h-full min-h-[600px] w-full rounded-lg border border-slate-200" />
              ) : previewFile.type.startsWith('image/') ? (
                <div className="flex items-center justify-center min-h-full">
                  <img 
                    src={previewFile.data} 
                    alt={previewFile.name}
                    className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                  />
                </div>
              ) : previewFile.type === 'application/pdf' ? (
                <div className="w-full h-full min-h-[600px] bg-white rounded-lg shadow-2xl overflow-hidden">
                  <iframe
                    src={previewFile.data}
                    className="w-full h-full min-h-[600px]"
                    title={previewFile.name}
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
                  <div className="w-20 h-20 bg-slate-800 rounded-2xl flex items-center justify-center mb-4">
                    <FileText size={40} className="text-slate-600" />
                  </div>
                  <h4 className="text-lg font-bold text-white mb-2">Preview Not Available</h4>
                  <p className="text-sm text-slate-400 mb-6">
                    This file type cannot be previewed in the browser.
                  </p>
                  <button
                    onClick={() => fileStorage.downloadFile(previewFile)}
                    className="px-6 py-3 bg-indigo-600 text-white text-sm font-bold uppercase tracking-widest rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-900/10 flex items-center gap-2"
                  >
                    <Download size={16} />
                    Download File
                  </button>
                </div>
              )}
            </div>

            {/* Preview Footer */}
            <div className="px-6 py-4 bg-slate-900 border-t border-slate-700 flex items-center justify-between shrink-0">
              <div className="text-xs text-slate-400">
                <span className="font-bold text-indigo-400">Category:</span> {previewFile.category || 'Uncategorized'}
                {previewFile.cafId && (
                  <>
                    <span className="mx-2">•</span>
                    <span className="font-bold text-indigo-400">CAF ID:</span> {previewFile.cafId}
                  </>
                )}
              </div>
              <button 
                onClick={() => setPreviewFile(null)}
                className="px-5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold uppercase tracking-widest text-slate-300 hover:bg-slate-700 hover:text-white transition-all"
              >
                Close
              </button>
            </div>
            </PreviewDrawer>
          )}
        </PreviewDrawer>
      )}
    </div>
  );
}
