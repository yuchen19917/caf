import React, { useMemo, useState } from 'react';
import { 
  Folder, 
  File, 
  Search, 
  MoreVertical, 
  Grid, 
  List,
  Upload,
  ShieldCheck,
  MoreHorizontal,
  FileText,
  Image,
  FileSignature,
  MapPin,
  FileCheck,
  CreditCard,
  Building2,
  Download,
  Eye,
  Trash2,
  Filter,
  Calendar,
  User,
  X,
  CheckCircle2,
  AlertCircle,
  Clock,
  FolderOpen,
  Plus
} from 'lucide-react';
import { cn, formatRelativeTime } from '../lib/utils';
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
type FileType = 'image' | 'pdf' | 'doc' | 'excel';

interface DocumentFile {
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

export default function DocumentLibrary({ user }: { user: any }) {
  const { t } = useTranslation();
  const { getFilteredCAFs, archiveEntries } = useApplications();
  const [view, setView] = useState<'grid' | 'list'>('list');
  const [selectedCategory, setSelectedCategory] = useState<DocumentCategory | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<DocumentStatus | 'all'>('all');
  const [viewingDocument, setViewingDocument] = useState<DocumentFile | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  // Get filtered CAFs based on user role
  const cafs = useMemo(() => {
    if (!user) return [];
    return getFilteredCAFs(user);
  }, [getFilteredCAFs, user]);

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
          let fileType: FileType = 'pdf';
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
            name: doc.name,
            category,
            type: fileType,
            size: '1.2 MB', // 默认大小，实际应该从文件获取
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
      uploadDate: '2024-05-06T10:30:00Z',
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
      name: 'Business_License_AfghanTech.pdf',
      category: 'business_license',
      type: 'pdf',
      size: '1.8 MB',
      uploadDate: '2024-05-06T09:15:00Z',
      uploadedBy: 'Agent Smith',
      status: 'pending',
      cafId: 'CAF-2024-002',
      customerName: 'Afghan Tech Solutions Ltd',
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
      uploadDate: '2024-05-05T16:45:00Z',
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
      uploadDate: '2024-05-05T14:20:00Z',
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
      uploadDate: '2024-05-04T11:00:00Z',
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
      uploadDate: '2024-05-04T09:30:00Z',
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
      uploadDate: '2024-05-03T15:10:00Z',
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
      uploadDate: '2024-05-03T10:00:00Z',
      uploadedBy: 'Agent Jones',
      status: 'archived',
      cafId: 'CAF-2024-008',
      customerName: 'Afghan Tech Solutions Ltd',
      customerType: 'Corporate',
      businessType: 'Enterprise Broadband',
      serviceType: 'Fiber 100M',
      tags: ['服务合同', '2024年度'],
    },
  ];

  // 过滤文档
  const filteredDocuments = useMemo(() => {
    // 使用实际文档，如果为空则使用模拟数据
    const docsToFilter = documents.length > 0 ? documents : mockDocuments;
    
    return docsToFilter.filter(doc => {
      const matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory;
      const matchesStatus = selectedStatus === 'all' || doc.status === selectedStatus;
      const matchesSearch = searchTerm === '' || 
        doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.cafId?.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesCategory && matchesStatus && matchesSearch;
    });
  }, [documents, mockDocuments, selectedCategory, selectedStatus, searchTerm]);

  // 统计数据
  const stats = useMemo(() => {
    const docsToCount = documents.length > 0 ? documents : mockDocuments;
    return {
      total: docsToCount.length,
      verified: docsToCount.filter(d => d.status === 'verified').length,
      pending: docsToCount.filter(d => d.status === 'pending').length,
      rejected: docsToCount.filter(d => d.status === 'rejected').length,
    };
  }, [documents, mockDocuments]);

  const getCategoryIcon = (category: DocumentCategory) => {
    const cat = documentCategories.find(c => c.id === category);
    return cat?.icon || File;
  };

  const getCategoryName = (category: DocumentCategory) => {
    const cat = documentCategories.find(c => c.id === category);
    return cat?.name || '其他';
  };

  const getCategoryColor = (category: DocumentCategory) => {
    const cat = documentCategories.find(c => c.id === category);
    return cat?.color || 'slate';
  };

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

  const getFileIcon = (type: FileType) => {
    switch (type) {
      case 'image': return Image;
      case 'pdf': return FileText;
      default: return File;
    }
  };

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

      {/* Stats Overview - Continued in next part */}

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: t('document_library.total_documents'), value: stats.total, icon: FolderOpen, color: 'text-indigo-600', bg: 'bg-indigo-50', status: 'all' as const },
          { label: t('document_library.verified_docs'), value: stats.verified, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50', status: 'verified' as const },
          { label: t('document_library.pending_docs'), value: stats.pending, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50', status: 'pending' as const },
          { label: t('document_library.rejected_docs'), value: stats.rejected, icon: AlertCircle, color: 'text-rose-600', bg: 'bg-rose-50', status: 'rejected' as const },
        ].map((stat, i) => (
          <button
            key={i}
            onClick={() => setSelectedStatus(stat.status)}
            className={cn(
              "p-6 bg-white border-2 rounded-2xl shadow-sm transition-all text-left hover:shadow-lg active:scale-95",
              selectedStatus === stat.status ? "border-indigo-600 ring-4 ring-indigo-500/10" : "border-slate-200 hover:border-slate-300"
            )}
          >
            <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center mb-4', stat.bg)}>
              <stat.icon size={20} className={stat.color} />
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
            <p className="text-2xl font-bold text-slate-800 mt-1">{stat.value}</p>
          </button>
        ))}
      </div>

      {/* Document Categories */}
      <section className="space-y-6">
        <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">{t('document_library.document_categories')}</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          <button
            onClick={() => setSelectedCategory('all')}
            className={cn(
              "p-4 bg-white border-2 rounded-xl transition-all text-center",
              selectedCategory === 'all' 
                ? "border-indigo-600 shadow-lg shadow-indigo-900/10" 
                : "border-slate-200 hover:border-slate-300"
            )}
          >
            <div className={cn(
              "w-10 h-10 rounded-lg flex items-center justify-center mx-auto mb-2",
              selectedCategory === 'all' ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-400"
            )}>
              <Folder size={18} />
            </div>
            <p className="text-[10px] font-bold text-slate-800">{t('document_library.all_categories')}</p>
            <p className="text-xs font-bold text-slate-400 mt-1">{mockDocuments.length}</p>
          </button>
          {documentCategories.map((category) => {
            const Icon = category.icon;
            const isSelected = selectedCategory === category.id;
            return (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={cn(
                  "p-4 bg-white border-2 rounded-xl transition-all text-center",
                  isSelected 
                    ? "border-indigo-600 shadow-lg shadow-indigo-900/10" 
                    : "border-slate-200 hover:border-slate-300"
                )}
              >
                <div className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center mx-auto mb-2",
                  isSelected 
                    ? "bg-indigo-600 text-white" 
                    : "bg-indigo-50 text-indigo-600"
                )}>
                  <Icon size={18} />
                </div>
                <p className="text-[10px] font-bold text-slate-800 truncate">{category.name}</p>
                <p className="text-xs font-bold text-slate-400 mt-1">{category.count}</p>
              </button>
            );
          })}
        </div>
      </section>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder={t('document_library.search_documents')}
            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-3">
          <select 
            className="px-4 py-3 bg-white border border-slate-200 rounded-xl text-xs font-bold uppercase tracking-widest text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as DocumentStatus | 'all')}
          >
            <option value="all">{t('document_library.status_all')}</option>
            <option value="verified">{t('document_library.status_verified')}</option>
            <option value="pending">{t('document_library.status_pending')}</option>
            <option value="rejected">{t('document_library.status_rejected')}</option>
            <option value="archived">{t('document_library.status_archived')}</option>
          </select>
          <div className="flex items-center bg-slate-100 rounded-xl p-1">
            <button 
              onClick={() => setView('grid')}
              className={cn("p-2 rounded-lg transition-all", view === 'grid' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500")}
              title={t('document_library.grid_view')}
            >
              <Grid size={16} />
            </button>
            <button 
              onClick={() => setView('list')}
              className={cn("p-2 rounded-lg transition-all", view === 'list' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500")}
              title={t('document_library.list_view')}
            >
              <List size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Documents Display */}
      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm flex-1">
        {view === 'list' ? (
          <div className="divide-y divide-slate-100">
            {filteredDocuments.map((doc) => {
              const Icon = getFileIcon(doc.type);
              const CategoryIcon = getCategoryIcon(doc.category);
              return (
                <div key={doc.id} className="px-8 py-5 hover:bg-slate-50 transition-colors group">
                  <div className="flex items-start gap-4">
                    {/* File Icon */}
                    <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100 group-hover:bg-white group-hover:border-indigo-100 transition-all shrink-0">
                      <Icon size={20} className="text-indigo-600/50" />
                    </div>

                    {/* Main Content */}
                    <div className="flex-1 min-w-0">
                      {/* File Name Row */}
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="text-sm font-bold text-slate-800 truncate">{doc.name}</h4>
                        {doc.status === 'verified' && (
                          <ShieldCheck size={14} className="text-emerald-500 shrink-0" />
                        )}
                        <span className={cn("text-[9px] font-bold uppercase px-2 py-0.5 rounded shrink-0", getStatusColor(doc.status))}>
                          {getStatusText(doc.status)}
                        </span>
                      </div>

                      {/* Document Info Grid */}
                      <div className="grid grid-cols-4 gap-4 mb-2">
                        <div className="flex items-center gap-2">
                          <CategoryIcon size={14} className="text-indigo-600 shrink-0" />
                          <div className="min-w-0">
                            <p className="text-[9px] font-bold text-slate-400 uppercase">{t('document_library.document_category')}</p>
                            <p className="text-xs font-bold text-slate-700 truncate">{getCategoryName(doc.category)}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <User size={14} className="text-indigo-600 shrink-0" />
                          <div className="min-w-0">
                            <p className="text-[9px] font-bold text-slate-400 uppercase">{t('document_library.customer_info')}</p>
                            <p className="text-xs font-bold text-slate-700 truncate">{doc.customerName}</p>
                            <p className="text-[9px] text-slate-400 font-medium">
                              {doc.customerType === 'Individual' ? t('document_library.individual') : t('document_library.corporate')}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <FileText size={14} className="text-indigo-600 shrink-0" />
                          <div className="min-w-0">
                            <p className="text-[9px] font-bold text-slate-400 uppercase">{t('document_library.business_type')}</p>
                            <p className="text-xs font-bold text-slate-700 truncate">{doc.businessType}</p>
                            <p className="text-[9px] text-slate-400 font-medium truncate">{doc.serviceType}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Calendar size={14} className="text-indigo-600 shrink-0" />
                          <div className="min-w-0">
                            <p className="text-[9px] font-bold text-slate-400 uppercase">{t('document_library.caf_number')}</p>
                            <p className="text-xs font-bold text-slate-700">{doc.cafId}</p>
                            <p className="text-[9px] text-slate-400 font-medium">
                              {new Date(doc.uploadDate).toLocaleDateString('zh-CN')}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Meta Info */}
                      <div className="flex items-center gap-3 text-[10px] text-slate-400 font-medium">
                        <span>{doc.size}</span>
                        <span className="w-1 h-1 rounded-full bg-slate-300" />
                        <span>{t('document_library.uploaded_by')}: {doc.uploadedBy}</span>
                        {doc.tags && doc.tags.length > 0 && (
                          <>
                            <span className="w-1 h-1 rounded-full bg-slate-300" />
                            <div className="flex items-center gap-1">
                              {doc.tags.slice(0, 2).map((tag, i) => (
                                <span key={i} className="px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded text-[9px] font-bold">
                                  {tag}
                                </span>
                              ))}
                              {doc.tags.length > 2 && (
                                <span className="text-slate-400">+{doc.tags.length - 2}</span>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      <button 
                        onClick={() => setViewingDocument(doc)}
                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all" 
                        title={t('document_library.view_details')}
                      >
                        <Eye size={16} />
                      </button>
                      <button className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all" title={t('document_library.download')}>
                        <Download size={16} />
                      </button>
                      <button className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all" title={t('document_library.delete')}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-6">
            {filteredDocuments.map((doc) => {
              const Icon = getFileIcon(doc.type);
              return (
                <div key={doc.id} className="group bg-white border-2 border-slate-200 rounded-2xl p-4 hover:border-indigo-600 hover:shadow-xl hover:shadow-indigo-900/5 transition-all cursor-pointer">
                  <div className="aspect-square bg-slate-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-indigo-50 transition-all">
                    <Icon size={48} className="text-slate-300 group-hover:text-indigo-600 transition-all" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-800 truncate mb-2">{doc.name}</h4>
                  <div className="flex items-center justify-between">
                    <span className={cn("text-[9px] font-bold uppercase px-2 py-0.5 rounded", getStatusColor(doc.status))}>
                      {getStatusText(doc.status)}
                    </span>
                    <button 
                      onClick={() => setViewingDocument(doc)}
                      className="p-1.5 text-slate-400 hover:text-indigo-600 transition-all"
                    >
                      <Eye size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        
        {filteredDocuments.length === 0 && (
          <div className="py-20 text-center">
            <FolderOpen size={48} className="text-slate-300 mx-auto mb-4" />
            <p className="text-sm font-bold text-slate-400">{t('document_library.no_documents')}</p>
            <p className="text-xs text-slate-400 mt-1">{t('document_library.adjust_filters')}</p>
          </div>
        )}

        <div className="px-8 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            {t('document_library.showing_documents', { count: filteredDocuments.length })}
          </p>
          <button className="text-[10px] font-bold text-indigo-600 hover:text-indigo-700 uppercase tracking-widest">
            {t('document_library.export_list')}
          </button>
        </div>
      </div>

      {/* View Document Modal */}
      {viewingDocument && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] shadow-2xl overflow-hidden flex flex-col"
          >
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

            <div className="flex-1 overflow-y-auto p-8 space-y-6">
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
            </div>

            <div className="px-8 py-6 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3 shrink-0">
              <button 
                onClick={() => setViewingDocument(null)}
                className="px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold uppercase tracking-widest text-slate-600 hover:bg-slate-50 transition-all"
              >
                {t('document_library.close')}
              </button>
              <button className="px-5 py-2.5 bg-emerald-600 rounded-xl text-xs font-bold uppercase tracking-widest text-white hover:bg-emerald-700 transition-all">
                <Download size={14} className="inline mr-2" />
                {t('document_library.download_document')}
              </button>
            </div>
          </motion.div>
        </div>
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
