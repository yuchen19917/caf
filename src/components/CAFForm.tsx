import React, { useState } from 'react';
import {
  User, Building2, MapPin, Phone, Mail, CreditCard,
  FileText, Upload, CheckCircle, AlertCircle, Globe,
  Hash, Wifi, Server, Network
} from 'lucide-react';
import { cn } from '../lib/utils';
import { CustomerType } from '../types';
import { useApplications } from '../context/ApplicationContext';
import type { CustomerApplicationForm } from '../types';
import { DocumentUploader } from './DocumentUploader';
import type { UploadedFile } from '../lib/fileStorage';

//  Extracted outside component to prevent focus loss on re-render 
interface FieldProps {
  label: string;
  icon?: any;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
}

const FormField = ({ label, icon: Icon, value, onChange, placeholder, type = 'text', required = false }: FieldProps) => (
  <div className="space-y-2">
    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
      {label}{required && <span className="text-rose-500 ml-0.5">*</span>}
    </label>
    <div className="relative">
      {Icon && <Icon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={15} />}
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn(
          "w-full pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 focus:outline-none transition-all text-sm font-medium",
          Icon ? "pl-11" : "pl-4"
        )}
      />
    </div>
  </div>
);

interface FormData {
  businessType: string; customerType: CustomerType; applicantType: string;
  fullName: string; contactNumber: string; email: string; address: string;
  licenceDetails: string; directorName: string; altContactNumber: string;
  signatoryName: string; signatoryAddress: string; signatoryEmail: string; signatoryContact: string;
  techName: string; techDesignation: string; techMobile: string; techEmail: string;
  billingName: string; billingDesignation: string; billingMobile: string; billingEmail: string; billingAddress: string;
  serviceType: string; serviceDelivery: string; planName: string;
  subscriberType: string; billingCycle: string;
  staticIpRequired: boolean; staticIpCount: string;
  activationFee: string; securityDeposit: string; cpeCost: string; cpeRental: string;
  uploadedDocs: UploadedFile[];
}

const EMPTY: FormData = {
  businessType: 'Enterprise', customerType: 'Corporate', applicantType: 'Pvt. Ltd. Company',
  fullName: '', contactNumber: '', email: '', address: '',
  licenceDetails: '', directorName: '', altContactNumber: '',
  signatoryName: '', signatoryAddress: '', signatoryEmail: '', signatoryContact: '',
  techName: '', techDesignation: '', techMobile: '', techEmail: '',
  billingName: '', billingDesignation: '', billingMobile: '', billingEmail: '', billingAddress: '',
  serviceType: 'FTTX (FiberOne)', serviceDelivery: 'Optical Fiber', planName: '',
  subscriberType: 'Post Pay', billingCycle: 'Monthly',
  staticIpRequired: false, staticIpCount: '',
  activationFee: '', securityDeposit: '', cpeCost: '', cpeRental: '',
  uploadedDocs: [],
};

export default function CAFForm({
  initialData,
  onGoToApplications,
  user,
}: {
  initialData?: any;
  onGoToApplications?: () => void;
  user: any;
}) {
  const { addApplicationFromForm, resubmitCorrection } = useApplications();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormData>({
    ...EMPTY,
    customerType: initialData?.customerType ?? 'Corporate',
    businessType: initialData?.businessType ?? 'Enterprise',
    fullName: initialData?.fullName ?? '',
    contactNumber: initialData?.contactNumber ?? '',
    email: initialData?.email ?? '',
    address: initialData?.address ?? '',
  });
  const [confirmed, setConfirmed] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [submittedRecord, setSubmittedRecord] = useState<CustomerApplicationForm | null>(null);

  const set = (patch: Partial<FormData>) => setForm(f => ({ ...f, ...patch }));
  const steps = ['Type & Profile', 'Service Details', 'Documents', 'Review & Submit'];
  const isCorrection = !!initialData;
  const nextStep = () => setStep(s => Math.min(s + 1, 4));
  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  const handleSubmit = () => {
    setIsVerifying(true);
    setTimeout(() => {
      const record = initialData?.id
        ? resubmitCorrection(initialData.id, form, user)
        : addApplicationFromForm(form, user);
      setSubmittedRecord(record);
      setIsVerifying(false);
      setIsSubmitted(true);
    }, 2500);
  };

  const requiredDocs = form.customerType === 'Individual'
    ? ['National ID Card', 'SIM Registration Form', 'Biometric Signature', 'Applicant Photo']
    : ['Address of Company', 'GST Details', 'Identity Proof', 'Registration of Company',
       'PAN / Aadhar', 'Passport No', 'PAN Card (Signatory)', 'Aadhar Card (Signatory)', 'Passport No (Signatory)'];

  const handleFileUpload = (doc: string, file: UploadedFile) => {
    set({
      uploadedDocs: [...form.uploadedDocs.filter(f => f.category !== doc), { ...file, category: doc }]
    });
  };

  const handleFileRemove = (doc: string) => {
    set({
      uploadedDocs: form.uploadedDocs.filter(f => f.category !== doc)
    });
  };

  if (isVerifying) {
    return (
      <div className="max-w-xl mx-auto py-32 text-center space-y-8 animate-in fade-in duration-500">
        <div className="relative w-24 h-24 mx-auto">
          <div className="absolute inset-0 border-4 border-indigo-100 rounded-full" />
          <div className="absolute inset-0 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center text-indigo-600">
            <Globe size={32} className="animate-pulse" />
          </div>
        </div>
        <div>
          <h3 className="text-2xl font-bold text-slate-800">System Processing</h3>
          <p className="text-slate-500 mt-2 font-medium">Executing multi-layer validation engine...</p>
        </div>
        <div className="space-y-3 max-w-xs mx-auto">
          {['Field-level Integrity Check', 'Duplicate Customer ID Search', 'Document Authenticity Scores', 'Regulatory Blacklist Cross-check'].map((task, i) => (
            <div key={i} className="flex items-center gap-3 text-xs font-bold text-slate-400 uppercase tracking-widest animate-pulse" style={{ animationDelay: `${i * 300}ms` }}>
              <CheckCircle size={14} className="text-emerald-500" /> {task}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (isSubmitted && submittedRecord) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center space-y-6 animate-in fade-in zoom-in-95 duration-500">
        <div className="w-24 h-24 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm border border-emerald-100">
          <CheckCircle size={48} />
        </div>
        <div>
          <h2 className="text-3xl font-bold text-slate-800 tracking-tight">Application Submitted</h2>
          <p className="text-slate-500 mt-2 font-medium">CAF Reference: <span className="font-mono text-indigo-600">{submittedRecord.id}</span></p>
          <div className="mt-6 p-6 bg-slate-50 border border-slate-200 rounded-2xl text-left max-w-sm mx-auto space-y-3">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Submission Summary</p>
            {[
              ['Subscriber', form.fullName || ''],
              ['Customer Type', form.customerType],
              ['Service', form.serviceType],
              ['Plan', form.planName || ''],
              ['Billing', form.billingCycle],
              ['Documents', `${form.uploadedDocs.length} / ${requiredDocs.length} attached`],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between text-xs">
                <span className="text-slate-400 font-bold uppercase">{k}</span>
                <span className="text-slate-800 font-bold">{v}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-8">
          <button
            type="button"
            onClick={() => {
              setIsSubmitted(false);
              setSubmittedRecord(null);
              setStep(1);
              setForm({ ...EMPTY });
              setConfirmed(false);
            }}
            className="px-8 py-3 bg-indigo-600 text-white text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-900/10"
          >
            New Entry
          </button>
          <button
            type="button"
            onClick={() => onGoToApplications?.()}
            className="px-8 py-3 bg-white border border-slate-200 text-slate-600 text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-slate-50 transition-all"
          >
            Return to Registry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <div className="mb-10">
        <h2 className="text-3xl font-bold text-slate-800 tracking-tight">
          {isCorrection ? `Correcting CAF: ${initialData.id}` : 'New Business Application (CAF)'}
        </h2>
        <p className="text-slate-500 mt-1 font-medium">
          {isCorrection ? 'Review and update rejected information to re-submit' : 'SME / ISP / OSP / Corporate / Lease Line'}
        </p>
      </div>

      {/* Stepper */}
      <div className="mb-10 flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        {steps.map((label, index) => (
          <div key={label} className="relative z-10 flex flex-col items-center flex-1">
            <div className={cn("w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-500 border-2",
              step > index + 1 ? "bg-indigo-600 border-indigo-600 text-white" :
              step === index + 1 ? "bg-white border-indigo-600 text-indigo-600" :
              "bg-slate-50 border-slate-200 text-slate-400")}>
              {step > index + 1 ? <CheckCircle size={14} /> : index + 1}
            </div>
            <span className={cn("mt-2 text-[9px] font-bold uppercase tracking-widest whitespace-nowrap",
              step === index + 1 ? "text-indigo-600" : "text-slate-400")}>{label}</span>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/40 p-8 lg:p-12 mb-8 animate-in fade-in slide-in-from-bottom-2 duration-500">

        {/*  STEP 1: Type & Profile  */}
        {step === 1 && (
          <div className="space-y-10">
            {/* Business type */}
            <div className="space-y-4">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">1.1  Business Portfolio</p>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { id: 'Mobile', icon: Phone, desc: 'SIM / Prepaid / Postpaid' },
                  { id: 'Broadband', icon: Wifi, desc: 'Fixed Wi-Fi / FTTX' },
                  { id: 'Enterprise', icon: Server, desc: 'ISP / OSP / Lease Line' },
                ].map(({ id, icon: Icon, desc }) => (
                  <button key={id} type="button" onClick={() => set({ businessType: id })}
                    className={cn("p-5 rounded-2xl border-2 transition-all text-center space-y-2",
                      form.businessType === id ? "border-indigo-600 bg-indigo-50 shadow-sm" : "border-slate-100 hover:border-slate-200")}>
                    <Icon size={22} className={form.businessType === id ? "text-indigo-600 mx-auto" : "text-slate-400 mx-auto"} />
                    <p className={cn("text-xs font-bold uppercase tracking-wider", form.businessType === id ? "text-indigo-600" : "text-slate-500")}>{id}</p>
                    <p className="text-[9px] text-slate-400">{desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Customer type */}
            <div className="space-y-4 py-8 border-y border-slate-100">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">1.2  Identity Segment</p>
              <div className="flex gap-4">
                {[
                  { id: 'Individual' as CustomerType, icon: User, title: 'Individual Applicant', sub: 'Single consumer line' },
                  { id: 'Corporate' as CustomerType, icon: Building2, title: 'Enterprise / Corporate', sub: 'Multi-line / ISP / OSP' },
                ].map(({ id, icon: Icon, title, sub }) => (
                  <button key={id} type="button" onClick={() => set({ customerType: id })}
                    className={cn("flex-1 p-6 rounded-2xl border-2 transition-all text-left",
                      form.customerType === id ? "border-indigo-600 bg-indigo-50/30" : "border-slate-100 hover:border-slate-200")}>
                    <Icon size={24} className={form.customerType === id ? "text-indigo-600" : "text-slate-400"} />
                    <h4 className="font-bold text-slate-800 mt-3 text-sm">{title}</h4>
                    <p className="text-xs text-slate-500 mt-1">{sub}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* General Information */}
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                <FileText size={12} className="text-indigo-600" /> General Information
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField label="Subscriber Name / Company Name" icon={form.customerType === 'Corporate' ? Building2 : User}
                  value={form.fullName} onChange={v => set({ fullName: v })} placeholder="Full legal name" required />
                {form.customerType === 'Corporate' && (
                  <FormField label="Licence Details (For ISP/OSP)" icon={Hash}
                    value={form.licenceDetails} onChange={v => set({ licenceDetails: v })} placeholder="Licence number" />
                )}
                {form.customerType === 'Corporate' && (
                  <FormField label="Director / Owner / Manager" icon={User}
                    value={form.directorName} onChange={v => set({ directorName: v })} placeholder="Name" />
                )}
                {form.customerType === 'Corporate' && (
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Type of Applicant</label>
                    <select value={form.applicantType} onChange={e => set({ applicantType: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 focus:outline-none transition-all text-sm font-medium">
                      {['Proprietorship', 'Pvt. Ltd. Company', 'Ltd. Company', 'Partnership', 'ISP/OSP', 'Institute', 'Govt. Sector', 'Other'].map(o => (
                        <option key={o}>{o}</option>
                      ))}
                    </select>
                  </div>
                )}
                <div className="md:col-span-2 space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Connection Installation Address <span className="text-rose-500">*</span></label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-4 text-slate-300" size={15} />
                    <textarea rows={3} value={form.address} onChange={e => set({ address: e.target.value })}
                      placeholder="Street, District, City, State, PIN..."
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 focus:outline-none transition-all text-sm font-medium resize-none" />
                  </div>
                </div>
                <FormField label="Mobile No. (Registered)" icon={Phone} value={form.contactNumber} onChange={v => set({ contactNumber: v })} placeholder="+91 ..." required />
                <FormField label="Alternate No." icon={Phone} value={form.altContactNumber} onChange={v => set({ altContactNumber: v })} placeholder="+91 ..." />
                <FormField label="Email Id (Registered)" icon={Mail} value={form.email} onChange={v => set({ email: v })} type="email" placeholder="email@company.com" />
              </div>
            </div>

            {/* Authorised Signatory (Corporate only) */}
            {form.customerType === 'Corporate' && (
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                  <User size={12} className="text-indigo-600" /> Authorised Signatory
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField label="Director / Owner / Manager" icon={User} value={form.signatoryName} onChange={v => set({ signatoryName: v })} placeholder="Full name" />
                  <FormField label="Contact No." icon={Phone} value={form.signatoryContact} onChange={v => set({ signatoryContact: v })} placeholder="+91 ..." />
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Residence Address</label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-4 text-slate-300" size={15} />
                      <textarea rows={2} value={form.signatoryAddress} onChange={e => set({ signatoryAddress: e.target.value })}
                        placeholder="Residential address..."
                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 focus:outline-none transition-all text-sm font-medium resize-none" />
                    </div>
                  </div>
                  <FormField label="Email Id" icon={Mail} value={form.signatoryEmail} onChange={v => set({ signatoryEmail: v })} type="email" placeholder="signatory@company.com" />
                </div>
              </div>
            )}

            {/* Technical Coordinator (Corporate only) */}
            {form.customerType === 'Corporate' && (
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                  <Network size={12} className="text-indigo-600" /> Customer Co-ordinator  Technical
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField label="Name" icon={User} value={form.techName} onChange={v => set({ techName: v })} placeholder="Technical contact name" />
                  <FormField label="Designation" value={form.techDesignation} onChange={v => set({ techDesignation: v })} placeholder="e.g. IT Manager" />
                  <FormField label="Mobile No." icon={Phone} value={form.techMobile} onChange={v => set({ techMobile: v })} placeholder="+91 ..." />
                  <FormField label="E-mail" icon={Mail} value={form.techEmail} onChange={v => set({ techEmail: v })} type="email" placeholder="tech@company.com" />
                </div>
              </div>
            )}

            {/* Billing Coordinator (Corporate only) */}
            {form.customerType === 'Corporate' && (
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                  <CreditCard size={12} className="text-indigo-600" /> Customer Co-ordinator  Payment / Billing
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField label="Name" icon={User} value={form.billingName} onChange={v => set({ billingName: v })} placeholder="Billing contact name" />
                  <FormField label="Designation" value={form.billingDesignation} onChange={v => set({ billingDesignation: v })} placeholder="e.g. Finance Manager" />
                  <FormField label="Mobile No." icon={Phone} value={form.billingMobile} onChange={v => set({ billingMobile: v })} placeholder="+91 ..." />
                  <FormField label="E-mail" icon={Mail} value={form.billingEmail} onChange={v => set({ billingEmail: v })} type="email" placeholder="billing@company.com" />
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Customer Billing Address (if different)</label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-4 text-slate-300" size={15} />
                      <textarea rows={2} value={form.billingAddress} onChange={e => set({ billingAddress: e.target.value })}
                        placeholder="Billing address..."
                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 focus:outline-none transition-all text-sm font-medium resize-none" />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/*  STEP 2: Service Details  */}
        {step === 2 && (
          <div className="space-y-10 animate-in slide-in-from-right-4 duration-300">
            {/* Required Service */}
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Wifi size={12} className="text-indigo-600" /> Required Service
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {['Fixed Wi-Fi Broadband', 'FTTX (FiberOne)', 'Internet Leaseline (DIA-ILL)'].map(s => (
                  <button key={s} type="button" onClick={() => set({ serviceType: s })}
                    className={cn("p-4 rounded-xl border-2 transition-all text-center",
                      form.serviceType === s ? "border-indigo-600 bg-indigo-50 shadow-sm" : "border-slate-100 hover:border-slate-200")}>
                    <span className={cn("text-xs font-bold", form.serviceType === s ? "text-indigo-600" : "text-slate-500")}>{s}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Service Delivery */}
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Service Delivery</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {['On Fixed Wi-Fi CPE', 'Copper/Ethernet Cable', 'Optical Fiber'].map(s => (
                  <button key={s} type="button" onClick={() => set({ serviceDelivery: s })}
                    className={cn("p-4 rounded-xl border-2 transition-all text-center",
                      form.serviceDelivery === s ? "border-indigo-600 bg-indigo-50 shadow-sm" : "border-slate-100 hover:border-slate-200")}>
                    <span className={cn("text-xs font-bold", form.serviceDelivery === s ? "text-indigo-600" : "text-slate-500")}>{s}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Financial Charges */}
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                <CreditCard size={12} className="text-indigo-600" /> Financial Charges Details
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField label="One Time Activation Fee (Non-refundable)" icon={CreditCard}
                  value={form.activationFee} onChange={v => set({ activationFee: v })} placeholder="e.g. USD 50" />
                <FormField label="Security Deposit (Refundable)" icon={CreditCard}
                  value={form.securityDeposit} onChange={v => set({ securityDeposit: v })} placeholder="e.g. USD 100" />
                <FormField label="CPE Cost (Non-refundable)" icon={CreditCard}
                  value={form.cpeCost} onChange={v => set({ cpeCost: v })} placeholder="e.g. USD 0" />
                <FormField label="CPE Rental (Non-refundable)" icon={CreditCard}
                  value={form.cpeRental} onChange={v => set({ cpeRental: v })} placeholder="e.g. USD 5/mo" />
              </div>
            </div>

            {/* Subscriber & Billing Type */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Subscriber Type</p>
                <div className="flex gap-3">
                  {['Prepaid', 'Post Pay'].map(t => (
                    <button key={t} type="button" onClick={() => set({ subscriberType: t })}
                      className={cn("flex-1 py-3 rounded-xl border-2 text-xs font-bold transition-all",
                        form.subscriberType === t ? "border-indigo-600 bg-indigo-50 text-indigo-600" : "border-slate-100 text-slate-500 hover:border-slate-200")}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Billing Cycle</p>
                <div className="flex gap-2 flex-wrap">
                  {['Monthly', 'Quarterly', 'Half Yearly', 'Yearly'].map(t => (
                    <button key={t} type="button" onClick={() => set({ billingCycle: t })}
                      className={cn("px-3 py-2 rounded-xl border-2 text-xs font-bold transition-all",
                        form.billingCycle === t ? "border-indigo-600 bg-indigo-50 text-indigo-600" : "border-slate-100 text-slate-500 hover:border-slate-200")}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Plan & Static IP */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField label="Tariff Plan Name" icon={Server} value={form.planName} onChange={v => set({ planName: v })} placeholder="As per plan sheet" required />
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Required Static Public IP</label>
                <div className="flex gap-3 items-center">
                  <button type="button" onClick={() => set({ staticIpRequired: true })}
                    className={cn("px-4 py-2 rounded-xl border-2 text-xs font-bold transition-all",
                      form.staticIpRequired ? "border-indigo-600 bg-indigo-50 text-indigo-600" : "border-slate-100 text-slate-500")}>Yes</button>
                  <button type="button" onClick={() => set({ staticIpRequired: false })}
                    className={cn("px-4 py-2 rounded-xl border-2 text-xs font-bold transition-all",
                      !form.staticIpRequired ? "border-indigo-600 bg-indigo-50 text-indigo-600" : "border-slate-100 text-slate-500")}>No</button>
                  {form.staticIpRequired && (
                    <input type="number" value={form.staticIpCount} onChange={e => set({ staticIpCount: e.target.value })}
                      placeholder="No. of IPs" className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:border-indigo-500" />
                  )}
                </div>
              </div>
            </div>

            {/* Plan preview card */}
            {form.planName && (
              <div className="p-8 bg-indigo-900 rounded-2xl text-white">
                <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <CreditCard size={14} /> Selected Plan
                </h4>
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-2xl font-bold tracking-tight">{form.planName}</p>
                    <p className="text-xs text-indigo-300 mt-1 uppercase font-bold">{form.serviceType}  {form.serviceDelivery}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-indigo-300 uppercase font-bold">{form.subscriberType}</p>
                    <p className="text-lg font-bold mt-1">{form.billingCycle}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/*  STEP 3: Documents  */}
        {step === 3 && (
          <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
            <div className="flex items-center gap-3 p-4 bg-slate-100 rounded-xl border border-slate-200">
              <AlertCircle size={18} className="text-indigo-600 shrink-0" />
              <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">
                Document Checklist — {form.customerType} — {form.businessType} — Upload all required documents
              </p>
            </div>

            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Required Documents</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {requiredDocs.map((doc) => {
                  const uploadedFile = form.uploadedDocs.find(f => f.category === doc);
                  return (
                    <DocumentUploader
                      key={doc}
                      documentName={doc}
                      category={doc}
                      onUpload={(file) => handleFileUpload(doc, file)}
                      onRemove={() => handleFileRemove(doc)}
                      uploadedFile={uploadedFile}
                    />
                  );
                })}
              </div>
            </div>

            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-3">
              <AlertCircle size={16} className="text-amber-600 shrink-0" />
              <p className="text-xs text-amber-700 font-medium">
                {form.uploadedDocs.length} of {requiredDocs.length} documents uploaded.
                {form.uploadedDocs.length < requiredDocs.length && ' Please upload all required documents before submission.'}
              </p>
            </div>
          </div>
        )}

        {/*  STEP 4: Review & Submit  */}
        {step === 4 && (
          <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-8 space-y-6">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-200 pb-4">
                CAF Verification Summary
              </h4>

              {/* General */}
              <div>
                <p className="text-[9px] font-bold text-indigo-600 uppercase tracking-widest mb-3">General Information</p>
                <div className="grid grid-cols-2 gap-y-3 gap-x-8">
                  {[
                    ['Subscriber / Company', form.fullName || ''],
                    ['Customer Type', form.customerType],
                    ['Business Portfolio', form.businessType],
                    ['Applicant Type', form.customerType === 'Corporate' ? form.applicantType : 'N/A'],
                    ['Contact Number', form.contactNumber || ''],
                    ['Email', form.email || ''],
                    ['Installation Address', form.address || ''],
                  ].map(([k, v]) => (
                    <div key={k}>
                      <p className="text-[9px] text-slate-400 font-bold uppercase">{k}</p>
                      <p className="text-xs font-bold text-slate-800 mt-0.5 break-words">{v}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Corporate contacts */}
              {form.customerType === 'Corporate' && (
                <div>
                  <p className="text-[9px] font-bold text-indigo-600 uppercase tracking-widest mb-3">Authorised Signatory</p>
                  <div className="grid grid-cols-2 gap-y-3 gap-x-8">
                    {[
                      ['Signatory Name', form.signatoryName || ''],
                      ['Contact', form.signatoryContact || ''],
                      ['Email', form.signatoryEmail || ''],
                    ].map(([k, v]) => (
                      <div key={k}>
                        <p className="text-[9px] text-slate-400 font-bold uppercase">{k}</p>
                        <p className="text-xs font-bold text-slate-800 mt-0.5">{v}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Service */}
              <div>
                <p className="text-[9px] font-bold text-indigo-600 uppercase tracking-widest mb-3">Service Details</p>
                <div className="grid grid-cols-2 gap-y-3 gap-x-8">
                  {[
                    ['Required Service', form.serviceType],
                    ['Service Delivery', form.serviceDelivery],
                    ['Plan Name', form.planName || ''],
                    ['Subscriber Type', form.subscriberType],
                    ['Billing Cycle', form.billingCycle],
                    ['Static IP', form.staticIpRequired ? `Yes  ${form.staticIpCount || '?'} IPs` : 'No'],
                    ['Activation Fee', form.activationFee || ''],
                    ['Security Deposit', form.securityDeposit || ''],
                  ].map(([k, v]) => (
                    <div key={k}>
                      <p className="text-[9px] text-slate-400 font-bold uppercase">{k}</p>
                      <p className="text-xs font-bold text-slate-800 mt-0.5">{v}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Documents */}
              <div>
                <p className="text-[9px] font-bold text-indigo-600 uppercase tracking-widest mb-3">
                  Document Checklist — {form.uploadedDocs.length}/{requiredDocs.length} Uploaded
                </p>
                <div className="flex flex-wrap gap-2">
                  {requiredDocs.map(doc => {
                    const uploaded = form.uploadedDocs.find(f => f.category === doc);
                    return (
                      <span key={doc} className={cn("text-[9px] font-bold px-2 py-1 rounded-lg",
                        uploaded ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-400")}>
                        {uploaded ? '✓ ' : '○ '}{doc}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Customer Acceptance */}
            <div className="p-6 bg-indigo-50 border border-indigo-100 rounded-2xl space-y-4">
              <p className="text-[10px] font-bold text-indigo-700 uppercase tracking-widest text-center">Customer Acceptance</p>
              <p className="text-xs text-slate-600 leading-relaxed">
                I declare that all the information submitted by me in the application form is correct, true and valid.
                I will present the supporting documents as and when required. I have read and understood the Terms and
                Conditions mentioned overleaf. I hereby agree to abide by them. I will use the requested Wi-Fi internet
                facility only for lawful activity. I also agree that my connection is subject to verification and acceptance.
              </p>
              <label className="flex items-start gap-4 cursor-pointer">
                <input type="checkbox" checked={confirmed} onChange={e => setConfirmed(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 shadow-sm" />
                <span className="text-xs text-slate-700 font-bold leading-relaxed">
                  I confirm that the applicant's identity has been verified against the physical identity document.
                  I take full responsibility for the data integrity of this CAF submission.
                </span>
              </label>
            </div>
          </div>
        )}

        {/* Footer nav */}
        <div className="mt-12 flex justify-between items-center pt-8 border-t border-slate-100">
          {step > 1
            ? <button type="button" onClick={prevStep} className="px-6 py-2.5 text-slate-500 text-xs font-bold uppercase tracking-widest hover:text-slate-900 transition-colors"> Back</button>
            : <div />}
          <button type="button"
            onClick={step === 4 ? handleSubmit : nextStep}
            disabled={step === 4 && !confirmed}
            className={cn("px-10 py-3 text-white text-xs font-bold uppercase tracking-widest rounded-xl shadow-lg transition-all active:scale-95",
              step === 4 && !confirmed
                ? "bg-slate-300 cursor-not-allowed shadow-none"
                : "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-900/10")}>
            {step === 4 ? 'Confirm & Submit CAF' : 'Continue '}
          </button>
        </div>
      </div>
    </div>
  );
}
