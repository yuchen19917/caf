import { renderBlueprint, getTemplatePreviewValues } from '../lib/blueprintPreview';
import { PreviewDrawer } from './PreviewDrawer';
import { RecordList } from './RecordList';
import React, { useState, useRef, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Layers, 
  Plus, 
  Edit2, 
  Trash2, 
  MoreVertical,
  Globe,
  Building2,
  X,
  Eye,
  FileText,
  Maximize2,
  User,
  Hash,
  MapPin,
  Calendar,
  Mail,
  Package,
  CreditCard,
  Download,
  Settings,
} from 'lucide-react';
import { useTemplates } from '../hooks/useTemplates';
import { PrepaidTemplateEditor } from './PrepaidTemplateEditor';
import { cn } from '../lib/utils';
import { CAFTemplate, CustomerType } from '../types';
import ReactQuill from 'react-quill-new';
import type { TFunction } from 'i18next';
import 'react-quill-new/dist/quill.snow.css';

const QuillEditor = ReactQuill as any;
const richTextModules = {
  toolbar: [
    [{ header: [1, 2, 3, false] }, { size: ['small', false, 'large', 'huge'] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ color: [] }, { background: [] }],
    [{ align: [] }, { direction: 'rtl' }, { indent: '-1' }, { indent: '+1' }],
    [{ list: 'ordered' }, { list: 'bullet' }, 'blockquote'],
    ['link', 'clean'],
  ],
};

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

export function TemplateManagement({ onOpenGlobalRules, canPublishPrepaid = false }: {
  onOpenGlobalRules?: () => void;
  canPublishPrepaid?: boolean;
} = {}) {
  const { t, i18n } = useTranslation();
  const { templates, setTemplates } = useTemplates();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [showPrepaidRules, setShowPrepaidRules] = useState(false);
  const [showPreviewDetails, setShowPreviewDetails] = useState(false);
  const [previewZoom, setPreviewZoom] = useState(1);
  const [isEditing, setIsEditing] = useState(false);
  const [showEditorPreview, setShowEditorPreview] = useState(false);
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
    setShowEditorPreview(false);
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
    setShowPreviewDetails(false);
  };

  const handleOpenEdit = (tpl: CAFTemplate) => {
    setShowEditorPreview(false);
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
    setShowPreviewDetails(false);
  };

  const handleDeleteTemplate = (tpl: CAFTemplate, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!window.confirm(t('templates_page.delete_confirm', { name: tpl.name, id: tpl.id }))) return;
    setTemplates((prev) => prev.filter((x) => x.id !== tpl.id));
    if (selectedTemplate?.id === tpl.id) {
      setSelectedTemplate(null);
      setIsViewModalOpen(false);
      setShowPreviewDetails(false);
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
    const editor = quillRef.current;
    if (editor) {
      const quill = editor.getEditor();
      const range = quill.getSelection(true);
      const insertText = `{{${key}}}`;
      if (range) {
        quill.insertText(range.index, insertText, 'user');
        quill.setSelection(range.index + insertText.length, 0);
      } else {
        quill.insertText(quill.getLength() - 1, insertText, 'user');
      }
    }
  };

  function insertPageBreak() {
    const editor = quillRef.current?.getEditor();
    if (!editor) return;
    const position = editor.getSelection(true)?.index ?? editor.getLength() - 1;
    const marker = '\n{{pageBreak}}\n';
    editor.insertText(position, marker, {}, 'user');
    editor.setSelection(position + marker.length, 0);
  }

  const renderBlueprintPreview = (tpl: CAFTemplate) => (
    <div dangerouslySetInnerHTML={{ __html: renderBlueprint(tpl, getTemplatePreviewValues(tpl), t('templates_page.paper_format')) }} />
  );

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
        version: '1.0',
        lifecycle: 'active',
        lastModified: new Date().toISOString(),
        fields: [
          { id: 'fullName', label: t('templates_page.var_fullName'), type: 'text', required: true },
          { id: 'idType', label: t('templates_page.var_idType'), type: 'select', required: true, options: ['National ID', 'Tazkira', 'Passport'] },
          { id: 'idNumber', label: t('templates_page.var_idNumber'), type: 'text', required: true },
          { id: 'contactNumber', label: t('templates_page.var_contactNumber'), type: 'text', required: true },
          { id: 'address', label: t('templates_page.var_address'), type: 'textarea', required: true },
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


  return (
    <div className="space-y-5 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-800 tracking-tight">{t('templates_page.title')}</h2>
          <p className="text-slate-500 text-sm mt-1 font-medium">{t('templates_page.subtitle')}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {onOpenGlobalRules && (
            <button type="button" onClick={onOpenGlobalRules}
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">
              <Globe size={15} /> {t('common.global_rules')}
            </button>
          )}
          <button type="button" onClick={handleOpenCreate}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700">
            <Plus size={15} /> {t('templates_page.create_button')}
          </button>
        </div>
      </div>

      <RecordList<CAFTemplate> rows={templates}
        columns={['table_name', 'table_code', 'filter_customer', 'field_business_type', 'filter_channel', 'field_product', 'table_status', 'table_actions'].map(key => t('templates_page.' + key))}
        filters={[
          { label: t('templates_page.table_name'), value: tpl => tpl.name, mode: 'text' },
          { label: t('templates_page.table_code'), value: tpl => tpl.id, mode: 'text' },
          { label: t('templates_page.filter_customer'), value: tpl => tpl.customerType, display: value => customerTypeLabel(value, t) },
          { label: t('templates_page.field_business_type'), value: tpl => tpl.businessType, mode: 'text' },
          { label: t('templates_page.filter_channel'), value: tpl => tpl.channel, display: value => channelLabel(value, t) },
          { label: t('templates_page.field_product'), value: tpl => tpl.product, mode: 'text' },
          { label: t('templates_page.table_status'), value: tpl => tpl.isActive ? 'active' : 'draft',
            display: value => t('templates_page.status_' + value) },
        ]}
        renderRow={tpl => (
              <tr key={tpl.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-4 py-3 text-sm font-semibold text-slate-800">{tpl.name}</td>
                <td className="px-4 py-3 text-xs font-medium text-slate-600">{tpl.id}</td>
                <td className="px-4 py-3">
                  <span className={cn('rounded px-2 py-0.5 text-xs font-semibold',
                    tpl.customerType === 'Individual' ? 'bg-indigo-50 text-indigo-700' : 'bg-amber-50 text-amber-700')}>
                    {customerTypeLabel(tpl.customerType, t)}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-slate-700">{tpl.businessType}</td>
                <td className="px-4 py-3 text-xs text-slate-700">{channelLabel(tpl.channel, t)}</td>
                <td className="px-4 py-3 text-xs text-slate-700">{tpl.product}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className={cn("w-2 h-2 rounded-full", tpl.isActive ? "bg-emerald-500" : "bg-slate-300")} />
                    <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wide">
                      {tpl.isActive ? t('templates_page.status_active') : t('templates_page.status_draft')}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <button 
                      onClick={() => {
                        setSelectedTemplate(tpl);
                        setPreviewZoom(1);
                        setIsViewModalOpen(true);
                        setShowPreviewDetails(false);
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
                    {tpl.id === 'TPL-IND-PRE-001' ? <button type="button"
                      onClick={() => setShowPrepaidRules(true)}
                      className="p-2 text-slate-500 hover:text-indigo-600"
                      title={t('templates_page.prepaid_rules')} aria-label={t('templates_page.prepaid_rules')}>
                      <Settings size={16} />
                    </button> : <button className="p-2 text-slate-300 hover:text-slate-900 transition-colors">
                      <MoreVertical size={16} />
                    </button>}
                  </div>
                </td>
              </tr>
        )}
      />

      {showPrepaidRules && (
        <PreviewDrawer label={t('templates_page.prepaid_rules')} onClose={() => setShowPrepaidRules(false)}>
          <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
            <h3 className="text-lg font-semibold">{t('templates_page.prepaid_rules')}</h3>
            <button type="button" onClick={() => setShowPrepaidRules(false)}
              className="rounded-lg p-2 hover:bg-slate-100" aria-label={t('app_shell.close')}>
              <X size={20} />
            </button>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto px-6 py-2">
            <PrepaidTemplateEditor canPublish={canPublishPrepaid} />
          </div>
        </PreviewDrawer>
      )}

      {/* Create Template Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center sm:p-3 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div role="dialog" aria-modal="true" aria-labelledby="template-editor-title"
            className="bg-white w-full h-dvh sm:h-[96dvh] sm:w-[97vw] sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col min-h-0 animate-in zoom-in-95 duration-300">
            <div className="px-4 py-3 sm:px-6 bg-white border-b border-slate-200 flex items-center justify-between shrink-0">
              <div>
                <h3 id="template-editor-title" className="text-xl font-bold text-slate-800">
                  {isEditing ? t('templates_page.modal_edit_title') : t('templates_page.modal_create_title')}
                </h3>
                <p className="text-xs text-slate-500 mt-1 font-medium">
                  {isEditing ? t('templates_page.modal_edit_subtitle') : t('templates_page.modal_create_subtitle')}
                </p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                aria-label={t('templates_page.cancel')}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full transition-all"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveTemplate} className="flex flex-col flex-1 min-h-0">
              <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-4 sm:p-6 space-y-4">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr_1fr]">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('templates_page.field_template_name')}</label>
                  <input 
                    required
                    type="text" 
                    className="w-full min-w-0 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 focus:outline-none transition-all text-sm font-medium"
                    placeholder={t('templates_page.placeholder_template_name')}
                    value={newTemplate.name}
                    onChange={(e) => setNewTemplate({...newTemplate, name: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('templates_page.field_customer_type')}</label>
                  <select 
                    className="w-full min-w-0 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 focus:outline-none transition-all text-sm font-medium"
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
                    className="w-full min-w-0 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 focus:outline-none transition-all text-sm font-medium"
                    placeholder={t('templates_page.placeholder_business_type')}
                    value={newTemplate.businessType}
                    onChange={(e) => setNewTemplate({...newTemplate, businessType: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('templates_page.field_channel')}</label>
                  <select 
                    className="w-full min-w-0 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 focus:outline-none transition-all text-sm font-medium"
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
                    className="w-full min-w-0 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 focus:outline-none transition-all text-sm font-medium"
                    placeholder={t('templates_page.placeholder_product')}
                    value={newTemplate.product}
                    onChange={(e) => setNewTemplate({...newTemplate, product: e.target.value})}
                  />
                </div>

              </div>

                <details className="rounded-lg border border-slate-200 px-3 py-2">
                  <summary className="cursor-pointer text-sm font-medium text-slate-700">{t('templates_page.field_description')}</summary>
                  <textarea 
                    rows={2}
                    aria-label={t('templates_page.field_description')}
                    className="w-full min-w-0 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 focus:outline-none transition-all text-sm font-medium resize-none"
                    placeholder={t('templates_page.placeholder_description')}
                    value={newTemplate.description}
                    onChange={(e) => setNewTemplate({...newTemplate, description: e.target.value})}
                  />
                </details>

                <div className="min-w-0 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h4 className="text-sm font-semibold text-slate-800">{t('templates_page.editor_body')}</h4>
                    <div className="flex flex-wrap items-center gap-2">
                      <button type="button" onClick={() => setIsImportModalOpen(true)}
                        className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm hover:bg-slate-50">
                        <FileText size={15} /> {t('templates_page.import_from_template')}
                      </button>
                      <select aria-label={t('templates_page.insert_variable')} value="" disabled={showEditorPreview}
                        className="max-w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm disabled:opacity-50"
                        onChange={event => { if (event.target.value) insertVariable(event.target.value); }}>
                        <option value="" disabled>{t('templates_page.insert_variable')}</option>
                        {availableVariables.map(variable => (
                          <option key={variable.key} value={variable.key}>{variable.label}</option>
                        ))}
                      </select>
                      <button type="button" onClick={insertPageBreak} disabled={showEditorPreview}
                        className="rounded-lg border border-slate-200 px-3 py-2 text-sm hover:bg-slate-50 disabled:opacity-50">
                        {t('templates_page.insert_page_break')}
                      </button>
                      <button type="button" aria-pressed={showEditorPreview}
                        onClick={() => setShowEditorPreview(value => !value)}
                        className="inline-flex items-center gap-2 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2 text-sm font-medium text-indigo-700 hover:bg-indigo-100">
                        {showEditorPreview ? <Edit2 size={15} /> : <Eye size={15} />}
                        {t(showEditorPreview ? 'templates_page.back_to_editing' : 'templates_page.show_preview')}
                      </button>
                    </div>
                  </div>

                  <div hidden={showEditorPreview} className="min-w-0 rounded-xl border border-slate-200 bg-white">
                    <QuillEditor
                      ref={quillRef}
                      theme="snow"
                      modules={richTextModules}
                      value={newTemplate.termsAndConditions}
                      onChange={(value: string) => setNewTemplate(previous => ({ ...previous, termsAndConditions: value }))}
                      className="ql-custom-container ql-workspace-editor"
                    />
                  </div>
                  {showEditorPreview && (
                    <div className="min-h-80 overflow-auto rounded-xl bg-slate-100 p-3 sm:p-5">
                      <div className="mx-auto w-max">
                        {renderBlueprintPreview({ ...newTemplate, id: isEditing ? selectedTemplate?.id : undefined } as CAFTemplate)}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="shrink-0 px-4 py-3 sm:px-6 border-t border-slate-200 bg-slate-50 flex justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-white transition-all"
                >
                  {t('templates_page.cancel')}
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-900/10 transition-all active:scale-95"
                >
                  {isEditing ? t('templates_page.save_update') : t('templates_page.save_create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isViewModalOpen && selectedTemplate && (
        <PreviewDrawer label={selectedTemplate.name} onClose={closeViewModal} width="max-w-7xl">
            <header className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-4 py-3 sm:px-6">
              <div className="min-w-0 flex-1">
                <h2 id="template-preview-title" className="break-words text-lg font-semibold leading-tight sm:text-xl">
                  {selectedTemplate.name}
                </h2>
                <p className="text-xs text-slate-500">{selectedTemplate.id}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {selectedTemplate.termsAndConditions && (
                  <label className="flex items-center gap-2 text-sm">
                    {t('templates_page.preview_zoom')}
                    <select className="rounded-lg border border-slate-200 bg-white px-2 py-1.5" value={previewZoom}
                      onChange={event => setPreviewZoom(Number(event.target.value))}>
                      {[0.75, 1, 1.25, 1.5, 1.75, 2].map(zoom => <option key={zoom} value={zoom}>{zoom * 100}%</option>)}
                    </select>
                  </label>
                )}
                {selectedTemplate.termsAndConditions && (
                  <button type="button" aria-expanded={showPreviewDetails} aria-controls="template-preview-details"
                    onClick={() => setShowPreviewDetails(value => !value)}
                    className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm hover:bg-slate-50">
                    {t('templates_page.preview_details')}
                  </button>
                )}
                <button type="button" onClick={() => handleOpenEdit(selectedTemplate)}
                  className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-indigo-700">
                  <Edit2 size={14} /> {t('templates_page.edit_architecture')}
                </button>
                <button type="button" onClick={closeViewModal} aria-label={t('templates_page.close_view')}
                  className="rounded-lg p-2 text-slate-600 hover:bg-slate-100">
                  <X size={20} />
                </button>
              </div>
            </header>

            <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
              {selectedTemplate.termsAndConditions && (
                <div className="min-w-0 flex-1 overflow-auto bg-slate-100 p-2 sm:p-5">
                  <div className="mx-auto w-max">
                    <div style={{ zoom: previewZoom }}>
                      {renderBlueprintPreview(selectedTemplate)}
                    </div>
                  </div>
                </div>
              )}

              {(!selectedTemplate.termsAndConditions || showPreviewDetails) && (
                <aside id="template-preview-details"
                  className={cn('min-h-0 space-y-4 overflow-auto bg-white p-4 sm:p-5',
                    selectedTemplate.termsAndConditions
                      ? 'max-h-[40%] shrink-0 border-t border-slate-200 lg:max-h-none lg:w-80 lg:border-s lg:border-t-0'
                      : 'flex-1')}>
                  <dl className="grid grid-cols-2 gap-3 text-sm">
                    {[
                      [t('templates_page.view_segment'), customerTypeLabel(selectedTemplate.customerType, t)],
                      [t('templates_page.view_business'), selectedTemplate.businessType],
                      [t('templates_page.view_channel'), channelLabel(selectedTemplate.channel, t)],
                      [t('templates_page.view_sku'), selectedTemplate.product],
                    ].map(([label, value]) => (
                      <div key={label} className="min-w-0">
                        <dt className="text-xs text-slate-500">{label}</dt>
                        <dd className="break-words font-medium">{value}</dd>
                      </div>
                    ))}
                  </dl>
                  {selectedTemplate.description && (
                    <p className="border-t border-slate-200 pt-3 text-sm text-slate-600">{selectedTemplate.description}</p>
                  )}
                  <h3 className="border-t border-slate-200 pt-3 text-sm font-semibold">
                    {t('templates_page.digital_architecture', { count: selectedTemplate.fields.length })}
                  </h3>
                  <ul className={cn('grid gap-2', !selectedTemplate.termsAndConditions && 'sm:grid-cols-2 xl:grid-cols-3')}>
                    {selectedTemplate.fields.map(field => (
                      <li key={field.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-slate-50 px-3 py-2 text-sm">
                        <span className="font-medium">{field.label}</span>
                        <span className="text-xs text-slate-500">
                          {fieldTypeLabel(field.type, t)}
                          {field.required && <span className="ms-2 text-rose-700">{t('templates_page.field_mandatory')}</span>}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <p className="text-xs text-slate-500">
                    {selectedTemplate.isActive ? t('templates_page.status_active') : t('templates_page.status_draft')}
                    {' · '}
                    {t('templates_page.modified', { date: new Date(selectedTemplate.lastModified).toLocaleDateString(i18n.language) })}
                  </p>
                </aside>
              )}
            </div>
        </PreviewDrawer>
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
