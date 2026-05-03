import React, { useState, useRef, useMemo } from 'react';
import { 
  Settings, 
  Layers, 
  Plus, 
  Edit2, 
  Trash2, 
  Search, 
  Filter,
  CheckCircle2,
  XCircle,
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
  PlusCircle
} from 'lucide-react';
import { MOCK_TEMPLATES } from '../mockData';
import { cn } from '../lib/utils';
import { CAFTemplate, CustomerType } from '../types';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

const QuillEditor = ReactQuill as any;

export function TemplateManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [templates, setTemplates] = useState<CAFTemplate[]>(MOCK_TEMPLATES);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
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
    termsAndConditions: '<h2>Customer Declaration</h2><p>I, <strong>{{fullName}}</strong>, holder of ID <strong>{{idNumber}}</strong>, hereby certify that...</p>'
  });

  const availableVariables = [
    { key: 'fullName', label: 'Full Name', icon: User },
    { key: 'idNumber', label: 'ID Number', icon: Hash },
    { key: 'contactNumber', label: 'Contact Number', icon: Globe },
    { key: 'address', label: 'Home Address', icon: MapPin },
    { key: 'submissionDate', label: 'Submission Date', icon: Calendar },
    { key: 'idType', label: 'Identity Type', icon: FileText },
  ];

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
      termsAndConditions: '<h2>Customer Declaration</h2><p>I, <strong>{{fullName}}</strong>, holder of ID <strong>{{idNumber}}</strong>, hereby certify that...</p>'
    });
    setIsModalOpen(true);
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
      termsAndConditions: tpl.termsAndConditions
    });
    setIsModalOpen(true);
    setIsViewModalOpen(false);
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
    return content;
  };

  const handleSaveTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isEditing && selectedTemplate) {
      const updatedTemplates = templates.map(t => 
        t.id === selectedTemplate.id 
          ? { 
              ...t, 
              ...newTemplate, 
              lastModified: new Date().toISOString() 
            } as CAFTemplate
          : t
      );
      setTemplates(updatedTemplates);
    } else {
      const template: CAFTemplate = {
        ...newTemplate,
        id: `TPL-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        lastModified: new Date().toISOString(),
        fields: [
          { id: 'f1', label: 'Full Name', type: 'text', required: true },
          { id: 'f2', label: 'ID Number', type: 'text', required: true }
        ],
        isActive: true
      } as CAFTemplate;
      setTemplates([template, ...templates]);
    }

    setIsModalOpen(false);
  };


  const filteredTemplates = templates.filter(tpl => 
    tpl.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tpl.product.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tpl.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tpl.businessType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-10 pb-12 h-full flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-800 tracking-tight">CAF Template Manager</h2>
          <p className="text-slate-500 text-sm mt-1 font-medium">Configure dynamic form structures for diverse customer segments</p>
        </div>
        <button 
          onClick={handleOpenCreate}
          className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-900/10 active:scale-95"
        >
          <Plus size={14} /> Create New Template
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Active Templates', value: '18', icon: Activity, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Individual', value: '12', icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: 'Corporate', value: '6', icon: Building2, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Global Rules', value: '24', icon: Globe, color: 'text-blue-600', bg: 'bg-blue-50' },
        ].map((stat, i) => (
          <div key={i} className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm">
            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-4 transition-colors", stat.bg)}>
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
          placeholder="Search templates by name, channel, or product type..."
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
              <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Template Name</th>
              <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Target Segment</th>
              <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Channel / Product</th>
              <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
              <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Actions</th>
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
                      {tpl.customerType}
                    </span>
                    <span className="text-[10px] font-bold text-slate-500 uppercase">{tpl.businessType}</span>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <p className="text-xs font-bold text-slate-700">{tpl.product}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">via {tpl.channel}</p>
                </td>
                <td className="px-8 py-6">
                  <div className="flex items-center gap-2">
                    <div className={cn("w-2 h-2 rounded-full", tpl.isActive ? "bg-emerald-500" : "bg-slate-300")} />
                    <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wide">
                      {tpl.isActive ? 'Active' : 'Draft'}
                    </span>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => { setSelectedTemplate(tpl); setIsViewModalOpen(true); }}
                      className="p-2 text-slate-300 hover:text-indigo-600 transition-colors" 
                      title="View Blueprint"
                    >
                      <Eye size={16} />
                    </button>
                    <button 
                      onClick={() => handleOpenEdit(tpl)}
                      className="p-2 text-slate-300 hover:text-indigo-600 transition-colors" 
                      title="Edit Structure"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button className="p-2 text-slate-300 hover:text-rose-600 transition-colors" title="Delete">
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
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Showing {templates.length} core profiles</p>
          <button className="text-[10px] font-bold text-indigo-600 hover:text-indigo-700 uppercase tracking-widest">View Version History</button>
        </div>
      </div>

      {/* Create Template Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="px-8 py-6 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-slate-800">{isEditing ? 'Modify Blueprint' : 'Generate New Blueprint'}</h3>
                <p className="text-xs text-slate-500 mt-1 font-medium">{isEditing ? 'Updating logic and segment for the existing CAF template' : 'Define logic and segment for the new CAF template'}</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full transition-all"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveTemplate} className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2 col-span-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Template Name</label>
                  <input 
                    required
                    type="text" 
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 focus:outline-none transition-all text-sm font-medium" 
                    placeholder="E.g. Corporate High-Value Postpaid"
                    value={newTemplate.name}
                    onChange={(e) => setNewTemplate({...newTemplate, name: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Customer Type</label>
                  <select 
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 focus:outline-none transition-all text-sm font-medium"
                    value={newTemplate.customerType}
                    onChange={(e) => setNewTemplate({...newTemplate, customerType: e.target.value as CustomerType})}
                  >
                    <option value="Individual">Individual</option>
                    <option value="Corporate">Corporate</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Business Type</label>
                  <input 
                    required
                    type="text" 
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 focus:outline-none transition-all text-sm font-medium" 
                    placeholder="E.g. SIM Registration"
                    value={newTemplate.businessType}
                    onChange={(e) => setNewTemplate({...newTemplate, businessType: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Channel</label>
                  <select 
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 focus:outline-none transition-all text-sm font-medium"
                    value={newTemplate.channel}
                    onChange={(e) => setNewTemplate({...newTemplate, channel: e.target.value as any})}
                  >
                    <option value="Direct">Direct Sales</option>
                    <option value="Agent">Third-party Agent</option>
                    <option value="Online">Online / Web</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Associated Product</label>
                  <input 
                    required
                    type="text" 
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 focus:outline-none transition-all text-sm font-medium" 
                    placeholder="E.g. Elite Business 5G"
                    value={newTemplate.product}
                    onChange={(e) => setNewTemplate({...newTemplate, product: e.target.value})}
                  />
                </div>

                <div className="space-y-2 col-span-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Context / Description</label>
                  <textarea 
                    rows={3}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 focus:outline-none transition-all text-sm font-medium resize-none" 
                    placeholder="Briefly describe the purpose of this template..."
                    value={newTemplate.description}
                    onChange={(e) => setNewTemplate({...newTemplate, description: e.target.value})}
                  />
                </div>

                <div className="space-y-2 col-span-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Legal Terms & Blueprint Content (Rich Text)</label>
                    <button 
                      type="button"
                      onClick={() => setIsMaximized(true)}
                      className="flex items-center gap-1.5 text-[9px] font-bold text-indigo-600 uppercase tracking-widest hover:bg-indigo-50 px-2 py-1 rounded-lg transition-all"
                    >
                      <Maximize2 size={12} /> Focus Edit
                    </button>
                  </div>
                  
                  <div className="flex gap-4">
                    <div className="flex-1 bg-slate-50 rounded-xl overflow-hidden border border-slate-200">
                      <QuillEditor 
                        ref={quillRef}
                        theme="snow" 
                        value={newTemplate.termsAndConditions} 
                        onChange={(val: string) => setNewTemplate({...newTemplate, termsAndConditions: val})}
                        className="bg-white ql-custom-container"
                      />
                    </div>
                    
                    <div className="w-48 space-y-2 shrink-0">
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                        <Zap size={10} className="text-amber-500" /> Bind Variables
                      </p>
                      <div className="grid grid-cols-1 gap-1.5">
                        {availableVariables.map((v) => (
                          <button
                            key={v.key}
                            type="button"
                            onClick={() => insertVariable(v.key)}
                            className="flex items-center gap-2 p-2 rounded-lg border border-slate-100 bg-white hover:border-indigo-600 hover:text-indigo-600 transition-all text-left group"
                          >
                            <v.icon size={12} className="text-slate-400 group-hover:text-indigo-600" />
                            <span className="text-[9px] font-bold truncate">{v.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-[9px] text-slate-400 font-medium">Use markers like <code className="text-indigo-600">{"{{fullName}}"}</code> for dynamic data binding during CAF submission.</p>
                </div>
              </div>

              <div className="pt-6 flex gap-4">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-6 py-3 border border-slate-200 text-slate-600 text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-slate-50 transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-6 py-3 bg-indigo-600 text-white text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-900/10 transition-all active:scale-95"
                >
                  {isEditing ? 'Update Node' : 'Confirm & Initialize'}
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
              <button 
                onClick={() => setIsViewModalOpen(false)}
                className="p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-full transition-all"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto">
              {/* Metadata Section */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Customer Segment</p>
                  <p className="text-sm font-bold text-slate-800 mt-1">{selectedTemplate.customerType}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Business Category</p>
                  <p className="text-sm font-bold text-slate-800 mt-1">{selectedTemplate.businessType}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Distribution Channel</p>
                  <p className="text-sm font-bold text-slate-800 mt-1">{selectedTemplate.channel}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Associated SKU</p>
                  <p className="text-sm font-bold text-slate-800 mt-1">{selectedTemplate.product}</p>
                </div>
              </div>

              {/* Description */}
              <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 text-center">Blueprint Context</p>
                <p className="text-xs text-slate-600 leading-relaxed text-center font-medium">
                  {selectedTemplate.description}
                </p>
              </div>

              {/* Form Architecture Section */}
                <div className="space-y-4">
                  <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <FileText size={14} className="text-indigo-600" /> Digital Architecture ({selectedTemplate.fields.length} Fields)
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
                            <p className="text-[9px] font-bold text-slate-400 uppercase">{field.type}</p>
                          </div>
                        </div>
                        {field.required && (
                          <span className="text-[8px] font-bold text-rose-500 uppercase bg-rose-50 px-1.5 py-0.5 rounded tracking-widest">Mandatory</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Rich Text Legal Blueprint Preview */}
                {selectedTemplate.termsAndConditions && (
                  <div className="space-y-4 pt-6 border-t border-slate-100">
                    <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-4 text-center justify-center">
                      Official Blueprint Preview (Print Style)
                    </h4>
                    <div className="bg-white border-2 border-slate-200 p-12 rounded-lg shadow-sm min-h-[400px] relative">
                      {/* PDF Reference Styling: Header */}
                      <div className="border-b-2 border-slate-900 pb-6 mb-8 flex justify-between items-start">
                        <div>
                          <h2 className="text-xl font-black text-slate-900 italic">ATOMA MOBILE SOLUTIONS</h2>
                          <p className="text-[8px] font-bold text-slate-400 uppercase">Enterprise Infrastructure Division</p>
                        </div>
                        <div className="w-24 h-24 border-2 border-slate-200 rounded flex items-center justify-center text-[8px] font-bold text-slate-300 text-center uppercase p-2">
                          Paste Photo Here
                        </div>
                      </div>

                      <div 
                        className="prose-blueprint ql-editor !p-0" 
                        dangerouslySetInnerHTML={{ __html: mapPreviewData(selectedTemplate.termsAndConditions || '') }} 
                      />
                      
                      {/* PDF Reference Styling: Bottom Signature */}
                      <div className="mt-12 pt-12 border-t border-slate-200 grid grid-cols-2 gap-12">
                        <div className="space-y-4">
                          <div className="h-10 border-b border-slate-300"></div>
                          <p className="text-[8px] font-bold text-slate-400 uppercase">Authorized Signature & Seal</p>
                        </div>
                        <div className="space-y-4">
                          <div className="h-10 border-b border-slate-300"></div>
                          <p className="text-[8px] font-bold text-slate-400 uppercase">Date of Approval</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

              {/* History & Status */}
              <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-400">
                  <Clock size={14} />
                  <span className="text-[10px] font-bold uppercase">Modified {new Date(selectedTemplate.lastModified).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={cn("w-2 h-2 rounded-full", selectedTemplate.isActive ? 'bg-emerald-500' : 'bg-slate-300')} />
                  <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">{selectedTemplate.isActive ? 'Active Node' : 'Draft Pattern'}</span>
                </div>
              </div>
            </div>

            <div className="p-6 bg-slate-50 border-t border-slate-200 flex gap-4">
              <button 
                onClick={() => setIsViewModalOpen(false)}
                className="flex-1 px-6 py-3 bg-white border border-slate-200 text-slate-600 text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-slate-50 transition-all"
              >
                Close View
              </button>
              <button 
                onClick={() => handleOpenEdit(selectedTemplate)}
                className="flex-1 px-6 py-3 bg-indigo-600 text-white text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-900/10 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <Edit2 size={14} /> Edit Architecture
              </button>
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
                   <h3 className="font-bold tracking-tight">Legal Blueprint Core Editor</h3>
                   <div className="flex items-center gap-3 mt-0.5">
                      <p className="text-[9px] text-indigo-300 uppercase font-bold tracking-widest">Live Document Schema</p>
                      <span className="w-1 h-1 bg-indigo-400 rounded-full" />
                      <p className="text-[9px] text-emerald-400 uppercase font-bold tracking-widest">Auto-saving local cache</p>
                   </div>
                </div>
             </div>
             <button 
               onClick={() => setIsMaximized(false)}
               className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all"
             >
                <Minimize2 size={14} /> Exit Fullscreen
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
                        <Zap size={14} className="text-amber-500" /> Data Binding API
                      </h4>
                      <p className="text-[11px] text-slate-500 font-medium mb-6 leading-relaxed">
                        Insert placeholders that will be dynamically replaced by real customer data from the CRM during the activation flow.
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
                      <h5 className="text-[9px] font-bold text-indigo-600 uppercase tracking-widest mb-3">Developer Note</h5>
                      <p className="text-[10px] text-indigo-800 leading-relaxed font-medium">
                        Custom variables can be added by declaring them in the <code className="bg-white px-1">types.ts</code> schema and mapping them in the activation service.
                      </p>
                   </div>
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}
