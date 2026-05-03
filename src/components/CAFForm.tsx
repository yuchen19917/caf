import React, { useState } from 'react';
import { 
  User, 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  CreditCard, 
  FileText, 
  Upload, 
  ChevronRight, 
  ChevronLeft,
  CheckCircle,
  AlertCircle,
  Globe
} from 'lucide-react';
import { cn } from '../lib/utils';
import { CustomerType, ServiceType } from '../types';

export default function CAFForm({ initialData }: { initialData?: any }) {
  const [step, setStep] = useState(1);
  const [customerType, setCustomerType] = useState<CustomerType>(initialData?.customerType || 'Individual');
  const [businessType, setBusinessType] = useState(initialData?.businessType || 'Mobile');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const steps = ['Type & Profile', 'Service Selection', 'Assets & Docs', 'Verification'];

  const isCorrection = !!initialData;

  const nextStep = () => setStep(s => Math.min(s + 1, 4));
  const prevStep = () => setStep(s => Math.max(s - 1, 1));

   const handleSubmit = () => {
    setIsVerifying(true);
    // Simulate real-time validation: field check, doc completeness, duplicate customer check
    setTimeout(() => {
      setIsVerifying(false);
      setIsSubmitted(true);
    }, 2500);
  };

  if (isVerifying) {
    return (
      <div className="max-w-xl mx-auto py-32 text-center space-y-8 animate-in fade-in duration-500">
        <div className="relative w-24 h-24 mx-auto">
          <div className="absolute inset-0 border-4 border-indigo-100 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center text-indigo-600">
            <Globe size={32} className="animate-pulse" />
          </div>
        </div>
        <div>
          <h3 className="text-2xl font-bold text-slate-800">System Processing</h3>
          <p className="text-slate-500 mt-2 font-medium">Executing multi-layer validation engine...</p>
        </div>
        <div className="space-y-3 max-w-xs mx-auto">
          {[
            'Performing Field-level Integrity Check',
            'Executing Duplicate Customer ID Search',
            'Validating Document Authenticity Scores',
            'Cross-referencing Regulatory Blacklists'
          ].map((task, i) => (
            <div key={i} className="flex items-center gap-3 text-xs font-bold text-slate-400 uppercase tracking-widest animate-pulse" style={{ animationDelay: `${i * 300}ms` }}>
              <CheckCircle size={14} className="text-emerald-500" /> {task}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center space-y-6 animate-in fade-in zoom-in-95 duration-500">
        <div className="w-24 h-24 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm border border-emerald-100">
          <CheckCircle size={48} />
        </div>
        <div>
          <h2 className="text-3xl font-bold text-slate-800 tracking-tight">Application Submitted</h2>
          <p className="text-slate-500 mt-2 font-medium">Digital Trace ID: <span className="font-mono text-indigo-600">AT-2024-X982</span></p>
          <p className="text-sm text-slate-500 mt-6 leading-relaxed max-w-sm mx-auto">
            The application has been securely archived and transmitted to the regional audit queue for processing.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-8">
          <button 
            onClick={() => { setIsSubmitted(false); setStep(1); }}
            className="px-8 py-3 bg-indigo-600 text-white text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-900/10"
          >
            New Entry
          </button>
          <button className="px-8 py-3 bg-white border border-slate-200 text-slate-600 text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-slate-50 transition-all">
            Return to Registry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <div className="mb-12">
        <h2 className="text-3xl font-bold text-slate-800 tracking-tight">
          {isCorrection ? `Correcting CAF: ${initialData.id}` : 'Customer Onboarding'}
        </h2>
        <p className="text-slate-500 mt-1 font-medium">
          {isCorrection ? 'Review and update rejected information to re-submit' : 'Capture applicant details and regulatory evidence'}
        </p>
      </div>

      {/* Modern Stepper */}
      <div className="mb-12 flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-200 shadow-sm relative">
        {steps.map((label, index) => (
          <div key={label} className="relative z-10 flex flex-col items-center flex-1 group">
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-500 border-2",
              step > index + 1 ? "bg-indigo-600 border-indigo-600 text-white" :
              step === index + 1 ? "bg-white border-indigo-600 text-indigo-600" :
              "bg-slate-50 border-slate-200 text-slate-400"
            )}>
              {step > index + 1 ? <CheckCircle size={14} /> : index + 1}
            </div>
            <span className={cn(
              "mt-2 text-[9px] font-bold uppercase tracking-widest whitespace-nowrap",
              step === index + 1 ? "text-indigo-600" : "text-slate-400"
            )}>{label}</span>
          </div>
        ))}
      </div>

      {/* Form Content */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/40 p-8 lg:p-12 mb-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
        
        {step === 1 && (
          <div className="space-y-10">
            <div className="space-y-4">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block text-center">Step 1.1: Business Portfolio</label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {['Mobile', 'Broadband', 'Enterprise'].map((type) => (
                  <button 
                    key={type}
                    onClick={() => setBusinessType(type)}
                    className={cn(
                      "p-4 rounded-xl border-2 transition-all text-center",
                      businessType === type ? "border-indigo-600 bg-indigo-50 shadow-sm" : "border-slate-100 hover:border-slate-200"
                    )}
                  >
                    <span className={cn("text-xs font-bold uppercase tracking-wider", businessType === type ? "text-indigo-600" : "text-slate-500")}>
                      {type}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4 py-8 border-y border-slate-100">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block text-center">Step 1.2: Identity Segment</label>
              <div className="flex space-x-4">
                <button 
                  onClick={() => setCustomerType('Individual')}
                  className={cn(
                    "flex-1 p-6 rounded-2xl border-2 transition-all text-left group",
                    customerType === 'Individual' ? "border-indigo-600 bg-indigo-50/30" : "border-slate-100 hover:border-slate-200"
                  )}
                >
                  <User size={24} className={customerType === 'Individual' ? "text-indigo-600" : "text-slate-400"} />
                  <h4 className="font-bold text-slate-800 mt-3 text-sm">Individual Applicant</h4>
                  <p className="text-xs text-slate-500 mt-1">Single consumer line</p>
                </button>
                <button 
                  onClick={() => setCustomerType('Corporate')}
                  className={cn(
                    "flex-1 p-6 rounded-2xl border-2 transition-all text-left group",
                    customerType === 'Corporate' ? "border-indigo-600 bg-indigo-50/30" : "border-slate-100 hover:border-slate-200"
                  )}
                >
                  <Building2 size={24} className={customerType === 'Corporate' ? "text-indigo-600" : "text-slate-400"} />
                  <h4 className="font-bold text-slate-800 mt-3 text-sm">Enterprise Account</h4>
                  <p className="text-xs text-slate-500 mt-1">Multi-line corporate services</p>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Full Legal Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                  <input 
                    type="text" 
                    defaultValue={initialData?.fullName}
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 focus:outline-none transition-all text-sm font-medium" 
                    placeholder="E.g. Mohammad Omar" 
                  />
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Contact Phone</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                  <input 
                    type="tel" 
                    defaultValue={initialData?.contactNumber}
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 focus:outline-none transition-all text-sm font-medium" 
                    placeholder="+93 -- --- ----" 
                  />
                </div>
              </div>
              <div className="md:col-span-2 space-y-3">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Permanent Address</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-4 text-slate-300" size={16} />
                  <textarea 
                    rows={3} 
                    defaultValue={initialData?.address}
                    className="w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 focus:outline-none transition-all text-sm font-medium resize-none" 
                    placeholder="Street, District, Province..."
                  ></textarea>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-10 animate-in slide-in-from-right-4 duration-300">
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {['Prepaid', 'Postpaid', 'Data Only'].map((type) => (
                <button 
                  key={type}
                  className="group p-8 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col items-center hover:border-indigo-600 hover:bg-white transition-all shadow-sm active:scale-95"
                >
                  <div className="w-10 h-10 bg-white border border-slate-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-indigo-50 transition-colors">
                    <Globe size={20} className="text-slate-400 group-hover:text-indigo-600" />
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest group-hover:text-indigo-600 transition-colors">{type}</span>
                </button>
              ))}
            </div>
            
            <div className="p-8 bg-indigo-900 rounded-2xl text-white relative overflow-hidden">
               <div className="relative z-10">
                 <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-widest mb-6 flex items-center gap-2">
                   <CreditCard size={14} /> Selected Plan
                 </h4>
                 <div className="flex justify-between items-end">
                    <div>
                      <p className="text-2xl font-bold tracking-tight">Unlimited Pro 5G</p>
                      <p className="text-xs text-indigo-300 mt-1 uppercase font-bold tracking-tighter">Business Enterprise Package</p>
                    </div>
                    <span className="text-2xl font-bold tracking-tighter italic">2,500 AFN</span>
                 </div>
               </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
            <div className="flex items-center gap-3 p-4 bg-slate-100 rounded-xl text-slate-500 border border-slate-200">
               <AlertCircle size={18} className="text-indigo-600 shrink-0" />
               <p className="text-[10px] font-bold uppercase tracking-wide">
                 CAF Template: {customerType} {businessType} Loaded. Please provide mandatory evidence.
               </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {(customerType === 'Individual' 
                ? ['National ID Card', 'SIM Registration Form', 'Biometric Signature', 'Applicant Photo']
                : ['Business License', 'Corporate POA', 'Authorized Representative ID', 'MoM Board Resolution']
              ).map((doc, idx) => (
                <div key={idx} className="group p-10 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center space-y-4 hover:border-indigo-600 hover:bg-indigo-50/50 transition-all cursor-pointer">
                  <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 group-hover:text-indigo-600 group-hover:bg-white transition-colors">
                    <Upload size={24} />
                  </div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center group-hover:text-indigo-900">{doc}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-8 space-y-6">
               <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-200 pb-4">Verification Summary</h4>
               <div className="grid grid-cols-2 gap-y-4">
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Full Name</p>
                    <p className="text-sm font-bold text-slate-900 mt-1 uppercase">Mohammad Farooq</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Account Type</p>
                    <p className="text-sm font-bold text-slate-900 mt-1 uppercase">Individual</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Regional Center</p>
                    <p className="text-sm font-bold text-slate-900 mt-1 uppercase">Kabul-01 Hub</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Attachments</p>
                    <p className="text-sm font-bold text-emerald-600 mt-1 uppercase">Ready (4/4)</p>
                  </div>
               </div>
            </div>

            <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-xl">
               <label className="flex items-start gap-4 cursor-pointer">
                  <input type="checkbox" className="mt-1 w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 shadow-sm" />
                  <span className="text-xs text-slate-600 leading-relaxed font-medium">
                    I confirm that the applicant's identity has been verified against the physical identity document. I take full responsibility for the data integrity of this CAF.
                  </span>
               </label>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 flex justify-between items-center pt-8 border-t border-slate-100">
           {step > 1 ? (
             <button 
              onClick={prevStep}
              className="px-6 py-2.5 text-slate-500 text-xs font-bold uppercase tracking-widest hover:text-slate-900 transition-colors"
             >
               Back
             </button>
           ) : <div />}
           
           <button 
             onClick={step === 4 ? handleSubmit : nextStep}
             className="px-10 py-3 bg-indigo-600 text-white text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-900/10 transition-all active:scale-95"
           >
             {step === 4 ? 'Confirm Submission' : 'Continue'}
           </button>
        </div>
      </div>
    </div>
  );
}
