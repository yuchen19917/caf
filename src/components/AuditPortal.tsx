import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import {
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Eye,
  UserCheck,
  History,
  FileText,
  Database,
  Archive,
  RefreshCcw,
  Server,
  X,
  Download,
  Image as ImageIcon,
} from 'lucide-react';
import { cn } from '../lib/utils';
import type { CustomerApplicationForm } from '../types';
import { useApplications } from '../context/ApplicationContext';
import { fileStorage, type UploadedFile } from '../lib/fileStorage';
import { motion } from 'motion/react';

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

function queueMetaLine(caf: CustomerApplicationForm, t: TFunction) {
  return `${customerTypeLabel(caf.customerType, t)} · ${translateServiceType(caf.serviceType, t)}`;
}

export default function AuditPortal() {
  const { t } = useTranslation();
  const { cafs, approveAndArchive } = useApplications();
  const queue = useMemo(
    () => cafs.filter((c) => c.status === 'Pending' || c.status === 'Rejected'),
    [cafs]
  );
  const [selectedAudit, setSelectedAudit] = useState<CustomerApplicationForm | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStep, setSyncStep] = useState(0);
  const [isArchived, setIsArchived] = useState(false);
  /** Snapshot of the CAF just approved (queue selection moves on before this screen dismisses). */
  const [archivedCaf, setArchivedCaf] = useState<CustomerApplicationForm | null>(null);
  const [previewFile, setPreviewFile] = useState<UploadedFile | null>(null);
  const [loadingFileId, setLoadingFileId] = useState<string | null>(null);
  const [documentFiles, setDocumentFiles] = useState<Map<string, UploadedFile>>(new Map());

  useEffect(() => {
    if (queue.length === 0) {
      setSelectedAudit(null);
      return;
    }
    setSelectedAudit((cur) => {
      if (cur && queue.some((c) => c.id === cur.id)) return cur;
      return queue[0];
    });
  }, [queue]);

  // Load files for selected audit
  useEffect(() => {
    if (!selectedAudit) {
      setDocumentFiles(new Map());
      return;
    }

    const loadFiles = async () => {
      const filesMap = new Map<string, UploadedFile>();
      
      for (const doc of selectedAudit.documents) {
        if (doc.fileId) {
          try {
            const file = await fileStorage.getFile(doc.fileId);
            if (file) {
              filesMap.set(doc.id, file);
            }
          } catch (error) {
            console.error(`Error loading file ${doc.fileId}:`, error);
          }
        }
      }
      
      setDocumentFiles(filesMap);
    };

    loadFiles();
  }, [selectedAudit]);

  const handleApprove = () => {
    if (!selectedAudit) return;
    const targetId = selectedAudit.id;
    const snapshot = selectedAudit;
    setIsSyncing(true);
    setSyncStep(1);

    setTimeout(() => setSyncStep(2), 1500);
    setTimeout(() => setSyncStep(3), 3000);
    setTimeout(() => {
      setIsSyncing(false);
      approveAndArchive(targetId);
      setArchivedCaf(snapshot);
      setIsArchived(true);
    }, 5000);
  };

  const getSyncTask = () => {
    switch (syncStep) {
      case 1:
        return t('audit_portal.sync_step_1');
      case 2:
        return t('audit_portal.sync_step_2');
      case 3:
        return t('audit_portal.sync_step_3');
      default:
        return '';
    }
  };

  const handlePreviewFile = async (fileId: string) => {
    setLoadingFileId(fileId);
    try {
      const file = await fileStorage.getFile(fileId);
      if (file) {
        setPreviewFile(file);
      } else {
        alert('File not found in storage');
      }
    } catch (error) {
      console.error('Error loading file:', error);
      alert('Failed to load file');
    } finally {
      setLoadingFileId(null);
    }
  };

  if (isSyncing) {
    return (
      <div className="max-w-4xl mx-auto h-full flex items-center justify-center">
        <div className="bg-white p-12 rounded-[3rem] border border-slate-200 shadow-2xl w-full max-w-xl text-center space-y-10 animate-in zoom-in-95 duration-500">
          <div className="relative w-32 h-32 mx-auto">
            <div className="absolute inset-0 border-8 border-slate-100 rounded-full"></div>
            <div className="absolute inset-0 border-8 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center text-indigo-600">
              <RefreshCcw size={48} className="animate-pulse" />
            </div>
            <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-2 rounded-xl shadow-lg animate-bounce">
              <Database size={20} />
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-2xl font-bold text-slate-800 tracking-tight italic">{t('audit_portal.sync_title')}</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">{getSyncTask()}</p>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className={cn(
                  'h-1.5 rounded-full transition-all duration-700',
                  syncStep >= i ? 'bg-indigo-600' : 'bg-slate-100'
                )}
              />
            ))}
          </div>

          <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 text-left">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">
              {t('audit_portal.transmission_log')}
            </h4>
            <div className="space-y-2 font-mono text-[9px] text-slate-500">
              <p className="flex justify-between gap-2">
                <span>{t('audit_portal.log_system')}</span>{' '}
                <span className="text-emerald-600 shrink-0">{t('audit_portal.log_identity_verified')}</span>
              </p>
              <p className="flex justify-between gap-2">
                <span>{t('audit_portal.log_crm')}</span>{' '}
                {syncStep >= 2 ? (
                  <span className="text-emerald-600 shrink-0">{t('audit_portal.log_uuid_linked')}</span>
                ) : (
                  <span className="animate-pulse shrink-0">{t('audit_portal.log_awaiting_payload')}</span>
                )}
              </p>
              <p className="flex justify-between gap-2">
                <span>{t('audit_portal.log_bss')}</span>{' '}
                {syncStep >= 3 ? (
                  <span className="text-emerald-600 shrink-0">{t('audit_portal.log_tariff_configured')}</span>
                ) : (
                  <span className="animate-pulse shrink-0">{t('audit_portal.log_waiting_crm')}</span>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isArchived) {
    return (
      <div className="max-w-4xl mx-auto h-full flex items-center justify-center">
        <div className="bg-white p-12 rounded-[3rem] border border-slate-200 shadow-2xl w-full max-w-xl text-center space-y-8 animate-in fade-in duration-700">
          <div className="w-24 h-24 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto shadow-sm border border-emerald-100 rotate-6">
            <Archive size={48} />
          </div>
          <div className="space-y-2">
            <h3 className="text-3xl font-bold text-slate-800">{t('audit_portal.archived_title')}</h3>
            <p className="text-slate-500 font-medium">{t('audit_portal.archived_subtitle')}</p>
          </div>

          <div className="p-8 bg-slate-950 rounded-3xl text-left border border-white/10 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Server size={64} className="text-white" />
            </div>
            <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest mb-6">
              {t('audit_portal.activation_result')}
            </p>
            <div className="space-y-4">
              <div className="flex justify-between text-white gap-4">
                <span className="text-[10px] font-bold uppercase opacity-50 shrink-0">{t('audit_portal.account_id')}</span>
                <span className="text-xs font-mono text-right break-all">
                  {archivedCaf ? `BSS-${archivedCaf.id.replace(/-/g, '')}` : '—'}
                </span>
              </div>
              <div className="flex justify-between text-white gap-4">
                <span className="text-[10px] font-bold uppercase opacity-50 shrink-0">{t('audit_portal.activation_status')}</span>
                <span className="text-xs font-bold text-emerald-400">{t('audit_portal.activation_success')}</span>
              </div>
              <div className="flex justify-between text-white border-t border-white/10 pt-4">
                <p className="text-[9px] opacity-70 italic leading-relaxed">{t('audit_portal.activation_detail')}</p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setIsArchived(false);
              setSyncStep(0);
              setArchivedCaf(null);
            }}
            className="w-full py-4 bg-indigo-600 text-white text-xs font-bold uppercase tracking-widest rounded-2xl hover:bg-indigo-700 shadow-lg shadow-indigo-900/10 transition-all active:scale-95"
          >
            {t('audit_portal.review_next')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-10 h-full">
      <div className="xl:col-span-1 space-y-8 flex flex-col">
        <div>
          <h2 className="text-3xl font-bold text-slate-800 tracking-tight">{t('audit_portal.queue_title')}</h2>
          <p className="text-slate-500 text-sm mt-1 font-medium">{t('audit_portal.queue_subtitle')}</p>
        </div>

        <div className="space-y-4 flex-1 overflow-y-auto">
          {queue.length === 0 && (
            <p className="text-sm text-slate-400 font-medium px-1">{t('audit_portal.queue_empty')}</p>
          )}
          {queue.map((caf) => (
            <button
              key={caf.id}
              type="button"
              onClick={() => setSelectedAudit(caf)}
              className={cn(
                'w-full text-left p-6 rounded-2xl border-2 transition-all duration-300',
                selectedAudit?.id === caf.id
                  ? 'border-indigo-600 bg-indigo-50/30 shadow-xl shadow-indigo-900/5 ring-4 ring-indigo-500/5'
                  : 'border-slate-100 bg-white hover:border-slate-200'
              )}
            >
              <div className="flex justify-between items-center mb-4 gap-2">
                <span className="text-[9px] font-bold uppercase bg-slate-800 text-white px-2 py-0.5 rounded tracking-widest font-mono shrink-0">
                  {caf.id}
                </span>
                <span
                  className={cn(
                    'text-[9px] font-bold uppercase tracking-wider shrink-0',
                    caf.status === 'Pending' ? 'text-amber-600' : 'text-rose-600'
                  )}
                >
                  {translateCafStatus(caf.status, t)}
                </span>
              </div>
              <h4
                className={cn(
                  'font-bold text-sm transition-colors',
                  selectedAudit?.id === caf.id ? 'text-indigo-900' : 'text-slate-800'
                )}
              >
                {caf.fullName}
              </h4>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mt-1">
                {queueMetaLine(caf, t)}
              </p>
            </button>
          ))}
        </div>
      </div>

      <div className="xl:col-span-2 space-y-8">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/40 overflow-hidden flex flex-col h-full">
          <div className="px-8 py-6 bg-slate-900 text-white flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-6 min-w-0">
              <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-950/20 shrink-0">
                <ShieldCheck size={24} />
              </div>
              <div className="min-w-0">
                <h3 className="text-xl font-bold tracking-tight">{t('audit_portal.inspector_title')}</h3>
                <p className="text-[10px] text-indigo-300 uppercase font-bold tracking-widest mt-0.5">
                  {t('audit_portal.inspector_mode')}
                </p>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-3 px-3 py-1.5 bg-white/10 rounded-xl shrink-0">
              <span className="text-[10px] font-bold text-indigo-200 uppercase tracking-widest whitespace-nowrap">
                {t('audit_portal.audit_score')}
              </span>
              <span className="text-sm font-bold">98.2%</span>
            </div>
          </div>

          <div className="p-8 lg:p-12 space-y-12">
            {!selectedAudit ? (
              <div className="flex items-center justify-center min-h-[280px] text-slate-400 text-sm font-medium text-center px-6">
                {t('audit_portal.inspector_empty')}
              </div>
            ) : (
              <>
            <section className="space-y-6">
              <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <UserCheck size={14} className="text-indigo-600 shrink-0" /> {t('audit_portal.section_identity')}
              </h4>
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
                      {t('audit_portal.biometric_verification')}
                    </p>
                    <p className="text-base font-bold text-indigo-900">{t('audit_portal.biometric_authenticated')}</p>
                  </div>
                  <CheckCircle2
                    size={48}
                    className="absolute -bottom-2 -right-2 text-indigo-200/30 group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
              </div>
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
                      onClick={() => file && handlePreviewFile(file.id)}
                      disabled={!file || loadingFileId === file?.id}
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
                          {loadingFileId === file?.id ? (
                            <div className="w-8 h-8 border-3 border-white border-t-transparent rounded-full animate-spin" />
                          ) : file ? (
                            <div className="flex flex-col items-center gap-2">
                              <Eye size={24} className="text-white drop-shadow-lg" />
                              <span className="text-[9px] font-bold text-white uppercase tracking-wider">
                                {t('audit_portal.click_to_preview')}
                              </span>
                            </div>
                          ) : (
                            <span className="text-[9px] font-bold text-white uppercase tracking-wider">
                              {t('audit_portal.no_file')}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* File Info Bar */}
                      <div className="absolute inset-x-0 bottom-0 bg-white/95 translate-y-full group-hover:translate-y-0 transition-transform p-3 border-t border-slate-200 backdrop-blur-sm z-10">
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

            <div className="pt-10 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <button
                type="button"
                onClick={handleApprove}
                className="flex items-center justify-center gap-3 py-4 bg-indigo-600 text-white text-xs font-bold uppercase tracking-widest rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-900/10 active:scale-95"
              >
                <CheckCircle2 size={16} className="shrink-0" /> {t('audit_portal.approve')}
              </button>
              <button
                type="button"
                className="flex items-center justify-center gap-3 py-4 bg-white border border-amber-200 text-amber-600 text-xs font-bold uppercase tracking-widest rounded-2xl hover:bg-amber-50 transition-all active:scale-95"
              >
                <AlertTriangle size={16} className="shrink-0" /> {t('audit_portal.correct')}
              </button>
              <button
                type="button"
                className="flex items-center justify-center gap-3 py-4 bg-white border border-rose-200 text-rose-600 text-xs font-bold uppercase tracking-widest rounded-2xl hover:bg-rose-50 transition-all active:scale-95"
              >
                <XCircle size={16} className="shrink-0" /> {t('audit_portal.reject')}
              </button>
              <button
                type="button"
                className="flex items-center justify-center gap-3 py-4 bg-slate-50 border border-slate-200 text-slate-500 text-xs font-bold uppercase tracking-widest rounded-2xl hover:bg-slate-100 transition-all active:scale-95"
              >
                <History size={16} className="shrink-0" /> {t('audit_portal.history')}
              </button>
            </div>

            <p className="text-center text-[9px] text-slate-400 font-bold uppercase tracking-widest leading-loose">
              {t('audit_portal.security_notice_line1')} <br />
              {t('audit_portal.security_notice_line2', { license: 'AF-KBL-001A' })}
            </p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* File Preview Modal */}
      {previewFile && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-200">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden"
          >
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
              {previewFile.type.startsWith('image/') ? (
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
          </motion.div>
        </div>
      )}
    </div>
  );
}
