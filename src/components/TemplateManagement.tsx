import React, { useState, useRef, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Layers, 
  Plus, 
  Edit2, 
  Trash2, 
  Search, 
  Filter,
  MoreVertical,
  Activity,
  Globe,
  Users,
  Building2,
  X,
  Eye,
  Clock,
  FileText,
  Maximize2,
  Minimize2,
  User,
  Hash,
  MapPin,
  Calendar,
  Zap,
  PlusCircle,
  Mail,
  Package,
  CreditCard,
  Download,
} from 'lucide-react';
import { useTemplates } from '../hooks/useTemplates';
import { cn } from '../lib/utils';
import { CAFTemplate, CustomerType } from '../types';
import { getActiveGlobalRules } from '../lib/globalRulesData';
import ReactQuill from 'react-quill-new';
import type { TFunction } from 'i18next';
import 'react-quill-new/dist/quill.snow.css';

const QuillEditor = ReactQuill as any;

function channelLabel(channel: string, t: TFunction): string {
  if (channel === 'Direct') return t('templates_page.channel_direct');
  if (channel === 'Agent') return t('templates_page.channel_agent');
  if (channel === 'Online') return t('templates_page.channel_online');
  return channel;
}

function customerTypeLabel(ct: string, t: TFunction): string {
  if (ct === 'Individual') return t('templates_page.customer_type_individual');
  if (ct === 'Corporate') return t('templates_page.customer_type_corporate');
  return ct;
}

function fieldTypeLabel(type: string, t: TFunction): string {
  return t(`templates_page.field_type_${type}`, { defaultValue: type });
}

export function TemplateManagement({ onOpenGlobalRules }: { onOpenGlobalRules?: () => void } = {}) {
  const { t, i18n } = useTranslation();
  const { templates, setTemplates } = useTemplates();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isViewPreviewMaximized, setIsViewPreviewMaximized] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<CAFTemplate | null>(null);
  const quillRef = useRef<ReactQuill>(null);

  const [newTemplate, setNewTemplate] = useState<Partial<CAFTemplate>>({
    name: '',
    description: '',
    customerType: 'Individual',
    businessType: 'SIM Registration',
    channel: 'Direct',
    product: '',
    isActive: true,
    termsAndConditions: ''
  });

  const availableVariables = useMemo(
    () => [
      { key: 'fullName', label: t('templates_page.var_fullName'), icon: User },
      { key: 'idNumber', label: t('templates_page.var_idNumber'), icon: Hash },
      { key: 'idType', label: t('templates_page.var_idType'), icon: FileText },
      { key: 'contactNumber', label: t('templates_page.var_contactNumber'), icon: Globe },
      { key: 'email', label: t('templates_page.var_email'), icon: Mail },
      { key: 'address', label: t('templates_page.var_address'), icon: MapPin },
      { key: 'billingAddress', label: t('templates_page.var_billingAddress'), icon: Building2 },
      { key: 'planName', label: t('templates_page.var_planName'), icon: Package },
      { key: 'serviceType', label: t('templates_page.var_serviceType'), icon: Layers },
      { key: 'serviceDelivery', label: t('templates_page.var_serviceDelivery'), icon: Globe },
      { key: 'activationFee', label: t('templates_page.var_activationFee'), icon: CreditCard },
      { key: 'monthlyFee', label: t('templates_page.var_monthlyFee'), icon: CreditCard },
      { key: 'billingCycle', label: t('templates_page.var_billingCycle'), icon: Calendar },
      { key: 'submissionDate', label: t('templates_page.var_submissionDate'), icon: Calendar },
    ],
    [t, i18n.language]
  );

  const handleOpenCreate = () => {
    setIsEditing(false);
    setSelectedTemplate(null);
    setNewTemplate({
      name: '',
      description: '',
      customerType: 'Individual',
      businessType: 'SIM Registration',
      channel: 'Direct',
      product: '',
      isActive: true,
      termsAndConditions: t('templates_page.default_declaration_html')
    });
    setIsModalOpen(true);
  };

  const closeViewModal = () => {
    setIsViewModalOpen(false);
    setIsViewPreviewMaximized(false);
  };

  const handleOpenEdit = (tpl: CAFTemplate) => {
    setIsEditing(true);
    setSelectedTemplate(tpl);
    setNewTemplate({
      name: tpl.name,
      description: tpl.description,
      customerType: tpl.customerType,
      businessType: tpl.businessType,
      channel: tpl.channel,
      product: tpl.product,
      isActive: tpl.isActive,
      isFullPageTerms: tpl.isFullPageTerms,
      termsAndConditions: tpl.termsAndConditions
    });
    setIsModalOpen(true);
    setIsViewModalOpen(false);
    setIsViewPreviewMaximized(false);
  };

  const handleDeleteTemplate = (tpl: CAFTemplate, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!window.confirm(t('templates_page.delete_confirm', { name: tpl.name, id: tpl.id }))) return;
    setTemplates((prev) => prev.filter((x) => x.id !== tpl.id));
    if (selectedTemplate?.id === tpl.id) {
      setSelectedTemplate(null);
      setIsViewModalOpen(false);
      setIsViewPreviewMaximized(false);
      if (isEditing) {
        setIsModalOpen(false);
        setIsEditing(false);
      }
    }
  };

  const handleDownloadTemplate = (tpl: CAFTemplate) => {
    try {
      // Create a clean copy of the template for export
      const exportData = {
        id: tpl.id,
        name: tpl.name,
        description: tpl.description,
        customerType: tpl.customerType,
        businessType: tpl.businessType,
        channel: tpl.channel,
        product: tpl.product,
        isActive: tpl.isActive,
        lastModified: tpl.lastModified,
        fields: tpl.fields,
        termsAndConditions: tpl.termsAndConditions,
        isFullPageTerms: tpl.isFullPageTerms,
      };

      // Convert to JSON string with pretty formatting
      const jsonString = JSON.stringify(exportData, null, 2);
      
      // Create a Blob from the JSON string
      const blob = new Blob([jsonString], { type: 'application/json' });
      
      // Create a download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Generate filename: template-name-id.json
      const filename = `${tpl.name.replace(/[^a-z0-9]/gi, '-').toLowerCase()}-${tpl.id}.json`;
      link.download = filename;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      // Optional: Show success message
      console.log(`Template "${tpl.name}" downloaded successfully as ${filename}`);
    } catch (error) {
      console.error('Error downloading template:', error);
      alert('Failed to download template. Please try again.');
    }
  };

  const insertVariable = (key: string) => {
    if (quillRef.current) {
      const quill = quillRef.current.getEditor();
      const range = quill.getSelection();
      const insertText = `{{${key}}}`;
      if (range) {
        quill.insertText(range.index, insertText);
      } else {
        quill.insertText(quill.getLength() - 1, insertText);
      }
    }
  };

  const mapPreviewData = (html: string) => {
    if (!html) return '';
    let content = html;
    content = content.replace(/{{fullName}}/g, '<span class="bg-indigo-50 text-indigo-700 px-1 rounded font-bold underline decoration-indigo-200">M. OMAR KHAN</span>');
    content = content.replace(/{{idNumber}}/g, '<span class="bg-indigo-50 text-indigo-700 px-1 rounded font-bold underline decoration-indigo-200">AZ-10029388</span>');
    content = content.replace(/{{contactNumber}}/g, '<span class="bg-indigo-50 text-indigo-700 px-1 rounded font-bold underline decoration-indigo-200">+93 78 000 1111</span>');
    content = content.replace(/{{address}}/g, '<span class="bg-indigo-50 text-indigo-700 px-1 rounded font-bold underline decoration-indigo-200">Kabul, District 4, House 22</span>');
    content = content.replace(/{{submissionDate}}/g, '<span class="bg-indigo-50 text-indigo-700 px-1 rounded font-bold underline decoration-indigo-200">May 05, 2024</span>');
    content = content.replace(/{{idType}}/g, '<span class="bg-indigo-50 text-indigo-700 px-1 rounded font-bold underline decoration-indigo-200">Tazkira</span>');
    content = content.replace(/{{email}}/g, '<span class="bg-indigo-50 text-indigo-700 px-1 rounded font-bold underline decoration-indigo-200">subscriber@example.com</span>');
    content = content.replace(/{{billingAddress}}/g, '<span class="bg-indigo-50 text-indigo-700 px-1 rounded font-bold underline decoration-indigo-200">Same as residential / PO Box 100</span>');
    content = content.replace(/{{planName}}/g, '<span class="bg-indigo-50 text-indigo-700 px-1 rounded font-bold underline decoration-indigo-200">Elite Plus 50GB</span>');
    content = content.replace(/{{serviceType}}/g, '<span class="bg-indigo-50 text-indigo-700 px-1 rounded font-bold underline decoration-indigo-200">Prepaid Mobile Data</span>');
    content = content.replace(/{{serviceDelivery}}/g, '<span class="bg-indigo-50 text-indigo-700 px-1 rounded font-bold underline decoration-indigo-200">Physical SIM · Standard delivery</span>');
    content = content.replace(/{{activationFee}}/g, '<span class="bg-indigo-50 text-indigo-700 px-1 rounded font-bold underline decoration-indigo-200">USD 2.00</span>');
    content = content.replace(/{{monthlyFee}}/g, '<span class="bg-indigo-50 text-indigo-700 px-1 rounded font-bold underline decoration-indigo-200">USD 15.00 / 30 days</span>');
    content = content.replace(/{{billingCycle}}/g, '<span class="bg-indigo-50 text-indigo-700 px-1 rounded font-bold underline decoration-indigo-200">Monthly (auto-renew)</span>');
    return content;
  };

  const renderBlueprintPreview = (tpl: CAFTemplate, variant: 'modal' | 'fullscreen' = 'modal') => {
    const previewHtml = mapPreviewData(tpl.termsAndConditions || '');
    return (
      <div
        className={cn(
          'bg-white border-2 border-slate-200 rounded-lg shadow-sm relative',
          variant === 'modal' && 'min-h-[400px]',
          variant === 'fullscreen' && 'shadow-xl min-h-0',
          tpl.isFullPageTerms ? 'p-4 overflow-x-auto' : 'p-8 md:p-12'
        )}
      >
        {!tpl.isFullPageTerms && (
          <>
            <div className="border-b-2 border-slate-900 pb-6 mb-8 flex justify-between items-start">
              <div>
                <h2 className="text-xl font-black text-slate-900 italic">{t('templates_page.sample_brand_title')}</h2>
                <p className="text-[8px] font-bold text-slate-400 uppercase">{t('templates_page.sample_brand_subtitle')}</p>
              </div>
              <div className="w-24 h-24 border-2 border-slate-200 rounded flex items-center justify-center text-[8px] font-bold text-slate-300 text-center uppercase p-2">
                {t('templates_page.paste_photo')}
              </div>
            </div>
          </>
        )}

        <div
          className={cn(
            'prose-blueprint ql-editor !p-0',
            tpl.isFullPageTerms && 'caf-full-page-terms text-[8px] leading-snug',
            variant === 'fullscreen' && !tpl.isFullPageTerms && 'text-sm'
          )}
          dangerouslySetInnerHTML={{ __html: previewHtml }}
        />

        {!tpl.isFullPageTerms && (
          <div className="mt-12 pt-12 border-t border-slate-200 grid grid-cols-2 gap-12">
            <div className="space-y-4">
              <div className="h-10 border-b border-slate-300"></div>
              <p className="text-[8px] font-bold text-slate-400 uppercase">{t('templates_page.sig_seal')}</p>
            </div>
            <div className="space-y-4">
              <div className="h-10 border-b border-slate-300"></div>
              <p className="text-[8px] font-bold text-slate-400 uppercase">{t('templates_page.sig_date')}</p>
            </div>
          </div>
        )}
      </div>
    );
  };

  const handleSaveTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isEditing && selectedTemplate) {
      setTemplates((prev) =>
        prev.map((row) =>
          row.id === selectedTemplate.id
            ? ({
                ...row,
                ...newTemplate,
                lastModified: new Date().toISOString(),
              } as CAFTemplate)
            : row
        )
      );
    } else {
      const template: CAFTemplate = {
        ...newTemplate,
        id: `TPL-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        lastModified: new Date().toISOString(),
        fields: [
          { id: 'f1', label: t('templates_page.var_fullName'), type: 'text', required: true },
          { id: 'f2', label: t('templates_page.var_idNumber'), type: 'text', required: true },
        ],
        isActive: true,
      } as CAFTemplate;
      setTemplates((prev) => [template, ...prev]);
    }

    setIsModalOpen(false);
  };

  const handleImportTemplate = (templateId: string) => {
    const sourceTemplate = templates.find(t => t.id === templateId);
    if (sourceTemplate && sourceTemplate.termsAndConditions) {
      setNewTemplate({
        ...newTemplate,
        termsAndConditions: sourceTemplate.termsAndConditions
      });
      setIsImportModalOpen(false);
    }
  };


  const filteredTemplates = templates.filter(tpl => 
    tpl.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tpl.product.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tpl.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tpl.businessType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const templateStatCounts = useMemo(
    () => ({
      activeTemplates: templates.filter((x) => x.isActive).length,
      individual: templates.filter((x) => x.customerType === 'Individual').length,
      corporate: templates.filter((x) => x.customerType === 'Corporate').length,
      globalRulesActive: getActiveGlobalRules().length,
    }),
    [templates]
  );

  return (
    <div className="space-y-10 pb-12 h-full flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-800 tracking-tight">{t('templates_page.title')}</h2>
          <p className="text-slate-500 text-sm mt-1 font-medium">{t('templates_page.subtitle')}</p>
        </div>
        <button 
          onClick={handleOpenCreate}
          className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-900/10 active:scale-95"
        >
          <Plus size={14} /> {t('templates_page.create_button')}
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: t('templates_page.stat_active'), value: String(templateStatCounts.activeTemplates), icon: Activity, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: t('templates_page.stat_individual'), value: String(templateStatCounts.individual), icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: t('templates_page.stat_corporate'), value: String(templateStatCounts.corporate), icon: Building2, color: 'text-amber-600', bg: 'bg-amber-50' },
          {
            label: t('templates_page.stat_global_rules'),
            value: String(templateStatCounts.globalRulesActive),
            icon: Globe,
            color: 'text-blue-600',
            bg: 'bg-blue-50',
            onClick: onOpenGlobalRules,
          },
        ].map((stat, i) => (
          <div
            key={i}
            role={stat.onClick ? 'button' : undefined}
            tabIndex={stat.onClick ? 0 : undefined}
            onClick={stat.onClick}
            onKeyDown={(e) => {
              if (!stat.onClick) return;
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                stat.onClick();
              }
            }}
            className={cn(
              'p-6 bg-white border border-slate-200 rounded-2xl shadow-sm',
              stat.onClick &&
                'cursor-pointer hover:shadow-md hover:border-indigo-200 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/30'
            )}
            aria-label={stat.onClick ? `${stat.label}, ${t('common.global_rules')}` : undefined}
          >
            <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center mb-4 transition-colors', stat.bg)}>
              <stat.icon size={20} className={stat.color} />
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
            <p className="text-2xl font-bold text-slate-800 mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="relative">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input 
          type="text" 
          placeholder={t('templates_page.search_placeholder')}
          className="w-full pl-14 pr-6 py-4 bg-white border border-slate-200 rounded-3xl text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all shadow-sm font-medium"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <div className="absolute right-5 top-1/2 -translate-y-1/2 flex items-center gap-2">
          <button className="p-2 text-slate-400 hover:text-indigo-600 transition-colors">
            <Filter size={18} />
          </button>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm flex-1">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('templates_page.table_name')}</th>
              <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('templates_page.table_segment')}</th>
              <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('templates_page.table_channel_product')}</th>
              <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('templates_page.table_status')}</th>
              <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('templates_page.table_actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredTemplates.map((tpl) => (
              <tr key={tpl.id} className="hover:bg-slate-50/50 transition-colors group">
                <td className="px-8 py-6">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-slate-100 rounded-lg group-hover:bg-indigo-50 transition-colors">
                      <Layers size={18} className="text-slate-400 group-hover:text-indigo-600" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">{tpl.name}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">{tpl.id}</p>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <div className="flex flex-col gap-1">
                    <span className={cn(
                      "text-[9px] font-bold uppercase px-2 py-0.5 rounded w-fit tracking-tighter",
                      tpl.customerType === 'Individual' ? "bg-indigo-50 text-indigo-700" : "bg-amber-50 text-amber-700 font-bold"
                    )}>
                      {customerTypeLabel(tpl.customerType, t)}
                    </span>
                    <span className="text-[10px] font-bold text-slate-500 uppercase">{tpl.businessType}</span>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <p className="text-xs font-bold text-slate-700">{tpl.product}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">
                    {t('templates_page.via', { channel: channelLabel(tpl.channel, t) })}
                  </p>
                </td>
                <td className="px-8 py-6">
                  <div className="flex items-center gap-2">
                    <div className={cn("w-2 h-2 rounded-full", tpl.isActive ? "bg-emerald-500" : "bg-slate-300")} />
                    <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wide">
                      {tpl.isActive ? t('templates_page.status_active') : t('templates_page.status_draft')}
                    </span>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => {
                        setSelectedTemplate(tpl);
                        setIsViewModalOpen(true);
                        setIsViewPreviewMaximized(false);
                      }}
                      className="p-2 text-slate-300 hover:text-indigo-600 transition-colors" 
                      title={t('templates_page.title_view_blueprint')}
                    >
                      <Eye size={16} />
                    </button>
                    <button 
                      onClick={() => handleDownloadTemplate(tpl)}
                      className="p-2 text-slate-300 hover:text-emerald-600 transition-colors" 
                      title="Download Template"
                    >
                      <Download size={16} />
                    </button>
                    <button 
                      onClick={() => handleOpenEdit(tpl)}
                      className="p-2 text-slate-300 hover:text-indigo-600 transition-colors" 
                      title={t('templates_page.title_edit_structure')}
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => handleDeleteTemplate(tpl, e)}
                      className="p-2 text-slate-300 hover:text-rose-600 transition-colors"
                      title={t('templates_page.title_delete')}
                    >
                      <Trash2 size={16} />
                    </button>
                    <button className="p-2 text-slate-300 hover:text-slate-900 transition-colors">
                      <MoreVertical size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        <div className="px-8 py-5 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            {t('templates_page.footer_showing', { count: templates.length })}
          </p>
          <button type="button" className="text-[10px] font-bold text-indigo-600 hover:text-indigo-700 uppercase tracking-widest">
            {t('templates_page.footer_version_history')}
          </button>
        </div>
      </div>

      {/* Create Template Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-4 py-8 sm:py-4 overflow-y-auto bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[min(92dvh,calc(100vh-2rem))] shadow-2xl overflow-hidden flex flex-col min-h-0 my-auto animate-in zoom-in-95 duration-300">
            <div className="px-8 py-6 bg-slate-50 border-b border-slate-200 flex items-center justify-between shrink-0">
              <div>
                <h3 className="text-xl font-bold text-slate-800">
                  {isEditing ? t('templates_page.modal_edit_title') : t('templates_page.modal_create_title')}
                </h3>
                <p className="text-xs text-slate-500 mt-1 font-medium">
                  {isEditing ? t('templates_page.modal_edit_subtitle') : t('templates_page.modal_create_subtitle')}
                </p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full transition-all"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveTemplate} className="flex flex-col flex-1 min-h-0">
              <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-8 pt-8 pb-6 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2 col-span-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('templates_page.field_template_name')}</label>
                  <input 
                    required
                    type="text" 
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 focus:outline-none transition-all text-sm font-medium" 
                    placeholder={t('templates_page.placeholder_template_name')}
                    value={newTemplate.name}
                    onChange={(e) => setNewTemplate({...newTemplate, name: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('templates_page.field_customer_type')}</label>
                  <select 
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 focus:outline-none transition-all text-sm font-medium"
                    value={newTemplate.customerType}
                    onChange={(e) => setNewTemplate({...newTemplate, customerType: e.target.value as CustomerType})}
                  >
                    <option value="Individual">{t('templates_page.customer_type_individual')}</option>
                    <option value="Corporate">{t('templates_page.customer_type_corporate')}</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('templates_page.field_business_type')}</label>
                  <input 
                    required
                    type="text" 
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 focus:outline-none transition-all text-sm font-medium" 
                    placeholder={t('templates_page.placeholder_business_type')}
                    value={newTemplate.businessType}
                    onChange={(e) => setNewTemplate({...newTemplate, businessType: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('templates_page.field_channel')}</label>
                  <select 
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 focus:outline-none transition-all text-sm font-medium"
                    value={newTemplate.channel}
                    onChange={(e) => setNewTemplate({...newTemplate, channel: e.target.value as any})}
                  >
                    <option value="Direct">{t('templates_page.channel_direct')}</option>
                    <option value="Agent">{t('templates_page.channel_agent')}</option>
                    <option value="Online">{t('templates_page.channel_online')}</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('templates_page.field_product')}</label>
                  <input 
                    required
                    type="text" 
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 focus:outline-none transition-all text-sm font-medium" 
                    placeholder={t('templates_page.placeholder_product')}
                    value={newTemplate.product}
                    onChange={(e) => setNewTemplate({...newTemplate, product: e.target.value})}
                  />
                </div>

                <div className="space-y-2 col-span-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('templates_page.field_description')}</label>
                  <textarea 
                    rows={3}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 focus:outline-none transition-all text-sm font-medium resize-none" 
                    placeholder={t('templates_page.placeholder_description')}
                    value={newTemplate.description}
                    onChange={(e) => setNewTemplate({...newTemplate, description: e.target.value})}
                  />
                </div>

                <div className="space-y-2 col-span-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('templates_page.field_legal_terms')}</label>
                    <div className="flex items-center gap-2">
                      <button 
                        type="button"
                        onClick={() => setIsImportModalOpen(true)}
                        className="flex items-center gap-1.5 text-[9px] font-bold text-emerald-600 uppercase tracking-widest hover:bg-emerald-50 px-2 py-1 rounded-lg transition-all"
                      >
                        <FileText size={12} /> {t('templates_page.import_from_template')}
                      </button>
                      <button 
                        type="button"
                        onClick={() => setIsMaximized(true)}
                        className="flex items-center gap-1.5 text-[9px] font-bold text-indigo-600 uppercase tracking-widest hover:bg-indigo-50 px-2 py-1 rounded-lg transition-all"
                      >
                        <Maximize2 size={12} /> {t('templates_page.focus_edit')}
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex gap-4 items-start">
                      <div className="flex-1 min-w-0 bg-slate-50 rounded-xl overflow-hidden border border-slate-200">
                        <QuillEditor 
                          ref={quillRef}
                          theme="snow" 
                          value={newTemplate.termsAndConditions} 
                          onChange={(val: string) => setNewTemplate({...newTemplate, termsAndConditions: val})}
                          className="bg-white ql-custom-container ql-modal-editor"
                        />
                      </div>
                      
                      <div className="w-48 shrink-0 flex flex-col min-h-0 max-h-[min(360px,45vh)] overflow-hidden border border-slate-100 rounded-xl bg-white p-2">
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5 shrink-0 px-1">
                          <Zap size={10} className="text-amber-500" /> {t('templates_page.bind_variables')}
                        </p>
                        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain pr-0.5 grid grid-cols-1 gap-1.5">
                          {availableVariables.map((v) => (
                            <button
                              key={v.key}
                              type="button"
                              onClick={() => insertVariable(v.key)}
                              className="flex items-center gap-2 p-2 rounded-lg border border-slate-100 bg-slate-50/80 hover:border-indigo-600 hover:text-indigo-600 transition-all text-left group"
                            >
                              <v.icon size={12} className="text-slate-400 group-hover:text-indigo-600" />
                              <span className="text-[9px] font-bold truncate">{v.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    {/* Live Preview */}
                    {newTemplate.termsAndConditions && (
                      <div className="space-y-3 pt-4 border-t border-slate-200">
                        <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                          <Eye size={14} className="text-indigo-600" /> {t('templates_page.preview_title')}
                        </h4>
                        {renderBlueprintPreview({
                          ...newTemplate,
                          id: selectedTemplate?.id || 'PREVIEW',
                          lastModified: new Date().toISOString(),
                          fields: selectedTemplate?.fields || [],
                          isActive: true,
                        } as CAFTemplate, 'modal')}
                      </div>
                    )}
                  </div>
                  <p className="text-[9px] text-slate-400 font-medium">
                    {t('templates_page.binding_hint', { marker: '{{fullName}}' })}
                  </p>
                </div>
              </div>
              </div>

              <div className="shrink-0 px-8 py-5 border-t border-slate-200 bg-slate-50/90 flex gap-4">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-6 py-3 border border-slate-200 text-slate-600 text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-white transition-all"
                >
                  {t('templates_page.cancel')}
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-6 py-3 bg-indigo-600 text-white text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-900/10 transition-all active:scale-95"
                >
                  {isEditing ? t('templates_page.save_update') : t('templates_page.save_create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Template Modal */}
      {isViewModalOpen && selectedTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="px-8 py-6 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
                  <Layers size={18} />
                </div>
                <div>
                  <h3 className="text-xl font-bold tracking-tight">{selectedTemplate.name}</h3>
                  <p className="text-[10px] text-indigo-300 uppercase font-bold tracking-widest">{selectedTemplate.id}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {selectedTemplate.termsAndConditions && (
                  <button
                    type="button"
                    onClick={() => setIsViewPreviewMaximized(true)}
                    className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-all"
                    title={t('templates_page.maximize_preview')}
                  >
                    <Maximize2 size={20} />
                  </button>
                )}
                <button 
                  type="button"
                  onClick={closeViewModal}
                  className="p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-full transition-all"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto">
              {/* Metadata Section */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('templates_page.view_segment')}</p>
                  <p className="text-sm font-bold text-slate-800 mt-1">{customerTypeLabel(selectedTemplate.customerType, t)}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('templates_page.view_business')}</p>
                  <p className="text-sm font-bold text-slate-800 mt-1">{selectedTemplate.businessType}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('templates_page.view_channel')}</p>
                  <p className="text-sm font-bold text-slate-800 mt-1">{channelLabel(selectedTemplate.channel, t)}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('templates_page.view_sku')}</p>
                  <p className="text-sm font-bold text-slate-800 mt-1">{selectedTemplate.product}</p>
                </div>
              </div>

              {/* Description */}
              <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 text-center">{t('templates_page.view_blueprint_context')}</p>
                <p className="text-xs text-slate-600 leading-relaxed text-center font-medium">
                  {selectedTemplate.description}
                </p>
              </div>

              {/* Form Architecture Section */}
                <div className="space-y-4">
                  <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <FileText size={14} className="text-indigo-600" />{' '}
                    {t('templates_page.digital_architecture', { count: selectedTemplate.fields.length })}
                  </h4>
                  <div className="space-y-3">
                    {selectedTemplate.fields.map((field) => (
                      <div key={field.id} className="p-4 bg-white border border-slate-200 rounded-xl flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400">
                            <Plus size={14} />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-800">{field.label}</p>
                            <p className="text-[9px] font-bold text-slate-400 uppercase">{fieldTypeLabel(field.type, t)}</p>
                          </div>
                        </div>
                        {field.required && (
                          <span className="text-[8px] font-bold text-rose-500 uppercase bg-rose-50 px-1.5 py-0.5 rounded tracking-widest">
                            {t('templates_page.field_mandatory')}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Rich Text Legal Blueprint Preview */}
                {selectedTemplate.termsAndConditions && (
                  <div className="space-y-4 pt-6 border-t border-slate-100">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                      <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 justify-center sm:justify-start">
                        {t('templates_page.preview_title')}
                      </h4>
                      <button
                        type="button"
                        onClick={() => setIsViewPreviewMaximized(true)}
                        className="flex items-center justify-center gap-2 self-center sm:self-auto text-[10px] font-bold uppercase tracking-widest text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-4 py-2 rounded-xl transition-colors"
                      >
                        <Maximize2 size={14} /> {t('templates_page.maximize_preview')}
                      </button>
                    </div>
                    {renderBlueprintPreview(selectedTemplate, 'modal')}
                  </div>
                )}

              {/* History & Status */}
              <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-400">
                  <Clock size={14} />
                  <span className="text-[10px] font-bold uppercase">
                    {t('templates_page.modified', {
                      date: new Date(selectedTemplate.lastModified).toLocaleDateString(
                        i18n.language.startsWith('zh') ? 'zh-CN' : 'en-US'
                      ),
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={cn("w-2 h-2 rounded-full", selectedTemplate.isActive ? 'bg-emerald-500' : 'bg-slate-300')} />
                  <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                    {selectedTemplate.isActive ? t('templates_page.active_node') : t('templates_page.draft_pattern')}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-6 bg-slate-50 border-t border-slate-200 flex gap-4">
              <button 
                type="button"
                onClick={closeViewModal}
                className="flex-1 px-6 py-3 bg-white border border-slate-200 text-slate-600 text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-slate-50 transition-all"
              >
                {t('templates_page.close_view')}
              </button>
              <button 
                onClick={() => handleOpenEdit(selectedTemplate)}
                className="flex-1 px-6 py-3 bg-indigo-600 text-white text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-900/10 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <Edit2 size={14} /> {t('templates_page.edit_architecture')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen blueprint preview (stack above view modal) */}
      {isViewModalOpen && selectedTemplate && isViewPreviewMaximized && selectedTemplate.termsAndConditions && (
        <div className="fixed inset-0 z-[110] flex flex-col bg-slate-100 animate-in fade-in duration-200">
          <div className="shrink-0 px-4 py-3 sm:px-6 sm:py-4 bg-slate-900 text-white flex items-center justify-between gap-4 shadow-xl">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 shrink-0 bg-indigo-600 rounded-xl flex items-center justify-center">
                <Eye size={18} />
              </div>
              <div className="min-w-0">
                <p className="font-bold truncate">{selectedTemplate.name}</p>
                <p className="text-[10px] text-indigo-300 uppercase font-bold tracking-widest truncate">{selectedTemplate.id}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsViewPreviewMaximized(false)}
              className="shrink-0 flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all"
            >
              <Minimize2 size={14} /> {t('templates_page.exit_fullscreen')}
            </button>
          </div>
          <div className="flex-1 overflow-y-auto overflow-x-auto p-4 md:p-8 min-h-0">
            <div
              className={cn(
                'mx-auto',
                selectedTemplate.isFullPageTerms ? 'max-w-[min(1200px,100%)]' : 'max-w-4xl'
              )}
            >
              {renderBlueprintPreview(selectedTemplate, 'fullscreen')}
            </div>
          </div>
        </div>
      )}

      {/* Maximized Editor Overlay */}
      {isMaximized && (
        <div className="fixed inset-0 z-[100] bg-white flex flex-col animate-in fade-in zoom-in-95 duration-300">
          <div className="px-8 py-4 bg-slate-900 text-white flex items-center justify-between shadow-xl">
             <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
                  <Edit2 size={18} />
                </div>
                <div>
                   <h3 className="font-bold tracking-tight">{t('templates_page.editor_title')}</h3>
                   <div className="flex items-center gap-3 mt-0.5">
                      <p className="text-[9px] text-indigo-300 uppercase font-bold tracking-widest">{t('templates_page.editor_live_schema')}</p>
                      <span className="w-1 h-1 bg-indigo-400 rounded-full" />
                      <p className="text-[9px] text-emerald-400 uppercase font-bold tracking-widest">{t('templates_page.editor_autosave')}</p>
                   </div>
                </div>
             </div>
             <button 
               onClick={() => setIsMaximized(false)}
               className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all"
             >
                <Minimize2 size={14} /> {t('templates_page.exit_fullscreen')}
             </button>
          </div>

          <div className="flex-1 flex overflow-hidden">
             {/* Left: Editor */}
             <div className="flex-1 p-8 overflow-y-auto bg-slate-50">
                <div className="max-w-4xl mx-auto space-y-6">
                   <div className="bg-white rounded-3xl shadow-2xl shadow-slate-200 overflow-hidden border border-slate-200">
                      <QuillEditor 
                        ref={quillRef}
                        theme="snow" 
                        value={newTemplate.termsAndConditions} 
                        onChange={(val: string) => setNewTemplate({...newTemplate, termsAndConditions: val})}
                        className="bg-white min-h-[70vh] ql-editor-xl"
                      />
                   </div>
                </div>
             </div>

             {/* Right: Variable Sidebar */}
             <div className="w-80 bg-white border-l border-slate-200 p-8 overflow-y-auto shadow-2xl">
                <div className="space-y-8">
                   <div>
                      <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                        <Zap size={14} className="text-amber-500" /> {t('templates_page.data_binding_api')}
                      </h4>
                      <p className="text-[11px] text-slate-500 font-medium mb-6 leading-relaxed">
                        {t('templates_page.data_binding_desc')}
                      </p>
                      <div className="space-y-3">
                         {availableVariables.map((v) => (
                           <button
                             key={v.key}
                             onClick={() => insertVariable(v.key)}
                             className="w-full flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-2xl hover:border-indigo-600 hover:bg-indigo-50 transition-all group"
                           >
                              <div className="flex items-center gap-3">
                                 <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-slate-400 group-hover:text-indigo-600 shadow-sm border border-slate-100">
                                    <v.icon size={14} />
                                 </div>
                                 <span className="text-xs font-bold text-slate-700">{v.label}</span>
                              </div>
                              <PlusCircle size={14} className="text-slate-300 group-hover:text-indigo-600" />
                           </button>
                         ))}
                      </div>
                   </div>

                   <div className="p-5 bg-indigo-50 rounded-2xl border border-indigo-100">
                      <h5 className="text-[9px] font-bold text-indigo-600 uppercase tracking-widest mb-3">{t('templates_page.developer_note')}</h5>
                      <p className="text-[10px] text-indigo-800 leading-relaxed font-medium">
                        {t('templates_page.developer_note_body')}
                      </p>
                   </div>
                </div>
             </div>
          </div>
        </div>
      )}

      {/* Import Template Modal */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="px-8 py-6 bg-gradient-to-r from-emerald-600 to-teal-600 text-white flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <FileText size={18} />
                </div>
                <div>
                  <h3 className="text-xl font-bold tracking-tight">{t('templates_page.import_modal_title')}</h3>
                  <p className="text-[10px] text-emerald-100 uppercase font-bold tracking-widest mt-0.5">
                    {t('templates_page.import_modal_subtitle')}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsImportModalOpen(false)}
                className="p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-full transition-all"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-8 max-h-[70vh] overflow-y-auto">
              <div className="space-y-3">
                {templates.filter(t => t.termsAndConditions).map((tpl) => (
                  <div 
                    key={tpl.id}
                    className="group p-6 bg-white border-2 border-slate-200 rounded-2xl hover:border-emerald-500 hover:shadow-lg transition-all cursor-pointer"
                    onClick={() => handleImportTemplate(tpl.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="p-3 bg-slate-100 rounded-xl group-hover:bg-emerald-50 transition-colors">
                          <Layers size={20} className="text-slate-400 group-hover:text-emerald-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="text-sm font-bold text-slate-800">{tpl.name}</h4>
                            <span className={cn(
                              "text-[8px] font-bold uppercase px-2 py-0.5 rounded tracking-tighter",
                              tpl.customerType === 'Individual' ? "bg-indigo-50 text-indigo-700" : "bg-amber-50 text-amber-700"
                            )}>
                              {customerTypeLabel(tpl.customerType, t)}
                            </span>
                          </div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase mb-3">{tpl.id}</p>
                          <div className="flex items-center gap-4 text-[10px] text-slate-500">
                            <span className="flex items-center gap-1.5">
                              <Globe size={12} className="text-slate-400" />
                              {tpl.businessType}
                            </span>
                            <span className="flex items-center gap-1.5">
                              <Building2 size={12} className="text-slate-400" />
                              {tpl.product}
                            </span>
                          </div>
                          {tpl.description && (
                            <p className="text-xs text-slate-600 mt-3 leading-relaxed">{tpl.description}</p>
                          )}
                          
                          {/* Preview of content */}
                          <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-2">{t('templates_page.content_preview')}</p>
                            <div 
                              className="text-xs text-slate-600 line-clamp-3 prose-sm"
                              dangerouslySetInnerHTML={{ 
                                __html: tpl.termsAndConditions?.substring(0, 200) + '...' || '' 
                              }} 
                            />
                          </div>
                        </div>
                      </div>
                      <button 
                        className="ml-4 px-4 py-2 bg-emerald-600 text-white text-[10px] font-bold uppercase tracking-widest rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-emerald-700 flex items-center gap-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleImportTemplate(tpl.id);
                        }}
                      >
                        <FileText size={12} /> {t('templates_page.import_button')}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {templates.filter(t => t.termsAndConditions).length === 0 && (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileText size={24} className="text-slate-400" />
                  </div>
                  <p className="text-sm font-bold text-slate-600">{t('templates_page.import_empty_title')}</p>
                  <p className="text-xs text-slate-400 mt-1">{t('templates_page.import_empty_subtitle')}</p>
                </div>
              )}
            </div>

            <div className="px-8 py-6 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button 
                onClick={() => setIsImportModalOpen(false)}
                className="px-6 py-3 border border-slate-200 text-slate-600 text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-white transition-all"
              >
                {t('templates_page.cancel')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
