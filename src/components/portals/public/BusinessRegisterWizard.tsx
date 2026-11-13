import React, { useState } from 'react';
import { useSangira } from '../../../context/SangiraContext';
import { BusinessType } from '../../../types';
import {
  CheckCircle,
  Building2,
  Mail,
  User,
  FileText,
  Upload,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  ExternalLink,
} from 'lucide-react';

export const BusinessRegisterWizard: React.FC = () => {
  const { submitApplication, setActiveTab, setRole } = useSangira();
  const [step, setStep] = useState<number>(1);
  const [submittedRef, setSubmittedRef] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    businessName: '',
    businessType: 'hotel' as BusinessType,
    location: '',
    description: '',
    phone: '',
    email: '',
    physicalAddress: '',
    website: '',
    ownerName: '',
    ownerEmail: '',
    ownerPhone: '',
    position: 'General Manager',
    docRegistration: 'RDB_Cert_Validated.pdf',
    docTax: 'RRA_Tax_Clearance_2026.pdf',
    docIdentity: 'National_ID_Verified.pdf',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateStep = (currentStep: number): boolean => {
    const newErrors: Record<string, string> = {};
    if (currentStep === 1) {
      if (!formData.businessName.trim()) newErrors.businessName = 'Business name is required';
      if (!formData.location.trim()) newErrors.location = 'City / District location is required';
      if (!formData.description.trim()) newErrors.description = 'Brief operations description is required';
    } else if (currentStep === 2) {
      if (!formData.phone.trim()) newErrors.phone = 'Contact telephone is required';
      if (!formData.email.trim() || !formData.email.includes('@')) newErrors.email = 'Valid corporate email is required';
      if (!formData.physicalAddress.trim()) newErrors.physicalAddress = 'Physical street address is required';
    } else if (currentStep === 3) {
      if (!formData.ownerName.trim()) newErrors.ownerName = 'Authorized representative name is required';
      if (!formData.ownerEmail.trim()) newErrors.ownerEmail = 'Owner email is required';
      if (!formData.ownerPhone.trim()) newErrors.ownerPhone = 'Owner phone is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep((prev) => Math.min(prev + 1, 5));
    }
  };

  const handlePrev = () => {
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(3)) return;

    const ref = submitApplication({
      businessName: formData.businessName,
      businessType: formData.businessType,
      location: formData.location,
      description: formData.description,
      ownerName: formData.ownerName,
      email: formData.email,
      phone: formData.phone,
      position: formData.position,
      documents: {
        businessRegistration: formData.docRegistration,
        taxCertificate: formData.docTax,
        identityDocument: formData.docIdentity,
      },
    });

    setSubmittedRef(ref);
  };

  if (submittedRef) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 sm:px-6">
        <div className="bg-white dark:bg-[#121614] rounded-2xl border border-stone-200 dark:border-stone-800 p-8 text-center space-y-6 shadow-sm">
          <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center mx-auto text-emerald-800 dark:text-emerald-400">
            <CheckCircle className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-stone-900 dark:text-stone-100">
              Application Submitted Successfully!
            </h2>
            <p className="text-sm text-stone-600 dark:text-stone-400 max-w-md mx-auto">
              Your registration application for <strong className="text-stone-900 dark:text-stone-200">{formData.businessName}</strong> has been submitted to the Sangira Platform Administration team for review.
            </p>
          </div>

          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800/60 max-w-sm mx-auto text-center">
            <div className="text-xs uppercase font-semibold text-emerald-800 dark:text-emerald-300">
              Your Application Reference Code
            </div>
            <div className="text-xl font-bold font-mono text-emerald-950 dark:text-emerald-100 mt-1 select-all">
              {submittedRef}
            </div>
          </div>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => setActiveTab('status')}
              className="px-5 py-2.5 rounded-lg bg-emerald-900 dark:bg-emerald-700 text-white font-medium text-xs hover:bg-emerald-800 transition-colors flex items-center gap-1.5"
            >
              <span>Track Application Progress</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setRole('SYSTEM_ADMIN');
                setActiveTab('applications');
              }}
              className="px-5 py-2.5 rounded-lg border border-purple-300 dark:border-purple-800 bg-purple-50 dark:bg-purple-950/30 text-purple-900 dark:text-purple-300 font-medium text-xs hover:bg-purple-100 transition-colors flex items-center gap-1.5"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Switch to Platform Admin to Approve</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const steps = [
    { num: 1, label: 'Business Profile', icon: Building2 },
    { num: 2, label: 'Contact Details', icon: Mail },
    { num: 3, label: 'Ownership & Legal', icon: User },
    { num: 4, label: 'Documents', icon: FileText },
    { num: 5, label: 'Review & Confirm', icon: CheckCircle },
  ];

  return (
    <div className="max-w-3xl mx-auto py-10 px-4 sm:px-6">
      {/* Top Return Button */}
      <div className="mb-6">
        <button
          onClick={() => setActiveTab('landing')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-600 dark:text-stone-400 hover:text-emerald-800 dark:hover:text-emerald-300 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Discover Hotels & Dining</span>
        </button>
      </div>

      {/* Wizard Progress Stepper */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100 text-center mb-6">
          Register Your Hospitality Business
        </h1>

        <div className="flex items-center justify-between relative">
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-stone-200 dark:bg-stone-800 -translate-y-1/2 -z-0" />
          {steps.map((s) => {
            const isCompleted = step > s.num;
            const isCurrent = step === s.num;
            return (
              <div key={s.num} className="relative z-10 flex flex-col items-center">
                <div
                  className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                    isCurrent
                      ? 'bg-[#0E382B] text-[#F3DF95] ring-4 ring-[#D4AF37]/25 border border-[#D4AF37]'
                      : isCompleted
                      ? 'bg-[#D4AF37] text-stone-950 font-bold'
                      : 'bg-stone-200 dark:bg-stone-800 text-stone-600 dark:text-stone-400'
                  }`}
                >
                  {isCompleted ? <CheckCircle className="w-4 h-4 text-stone-950" /> : s.num}
                </div>
                <span className="hidden sm:block text-[11px] font-medium text-stone-600 dark:text-stone-400 mt-1.5 whitespace-nowrap">
                  {s.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Form Container */}
      <div className="bg-[#FFFDF9] dark:bg-[#121614] rounded-2xl border border-[#D4AF37]/35 dark:border-[#D4AF37]/25 p-4 sm:p-8 shadow-xs">
        {step === 1 && (
          <div className="space-y-5">
            <h3 className="font-bold text-base text-stone-900 dark:text-stone-100 border-b border-stone-200 dark:border-stone-800 pb-2">
              Step 1: Business Profile & Type
            </h3>

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Business Legal Name *
              </label>
              <input
                type="text"
                placeholder="e.g., Virunga View Eco-Resort & Grill"
                value={formData.businessName}
                onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-emerald-700 focus:outline-hidden"
              />
              {errors.businessName && <p className="text-xs text-rose-600 mt-1">{errors.businessName}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Primary Business Category *
              </label>
              <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'hotel', label: 'Hotel & Resort', desc: 'Rooms + Restaurant' },
                  { id: 'restaurant', label: 'Restaurant', desc: 'Full Kitchen Dining' },
                  { id: 'bar', label: 'Bar & Pub', desc: 'Drinks & Tapas' },
                  { id: 'lounge', label: 'Lounge & Cafe', desc: 'Terrace & Beverages' },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, businessType: cat.id as BusinessType })}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      formData.businessType === cat.id
                        ? 'border-emerald-700 bg-emerald-50/60 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-100 ring-1 ring-emerald-700'
                        : 'border-stone-200 dark:border-stone-800 hover:bg-stone-50 dark:hover:bg-stone-800/40 text-stone-800 dark:text-stone-300'
                    }`}
                  >
                    <div className="font-bold text-xs">{cat.label}</div>
                    <div className="text-[10px] text-stone-500 dark:text-stone-400 mt-0.5">{cat.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                City / District / Province *
              </label>
              <input
                type="text"
                placeholder="e.g., Musanze, Northern Province, Rwanda"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-emerald-700 focus:outline-hidden"
              />
              {errors.location && <p className="text-xs text-rose-600 mt-1">{errors.location}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Brief Hospitality Description *
              </label>
              <textarea
                rows={3}
                placeholder="Describe your dining concepts, seating capacity, or accommodation features..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-emerald-700 focus:outline-hidden"
              />
              {errors.description && <p className="text-xs text-rose-600 mt-1">{errors.description}</p>}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <h3 className="font-bold text-base text-stone-900 dark:text-stone-100 border-b border-stone-200 dark:border-stone-800 pb-2">
              Step 2: Business Contact Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Business Telephone *
                </label>
                <input
                  type="text"
                  placeholder="+250 788 000 000"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-emerald-700 focus:outline-hidden"
                />
                {errors.phone && <p className="text-xs text-rose-600 mt-1">{errors.phone}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Corporate / Invoicing Email *
                </label>
                <input
                  type="email"
                  placeholder="contact@business.rw"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-emerald-700 focus:outline-hidden"
                />
                {errors.email && <p className="text-xs text-rose-600 mt-1">{errors.email}</p>}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Physical Street Address *
              </label>
              <input
                type="text"
                placeholder="e.g., KG 14 Ave, Plot 22, Kiyovu"
                value={formData.physicalAddress}
                onChange={(e) => setFormData({ ...formData, physicalAddress: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-emerald-700 focus:outline-hidden"
              />
              {errors.physicalAddress && <p className="text-xs text-rose-600 mt-1">{errors.physicalAddress}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Website / Social Handle (Optional)
              </label>
              <input
                type="text"
                placeholder="https://virungaresort.rw"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-emerald-700 focus:outline-hidden"
              />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-5">
            <h3 className="font-bold text-base text-stone-900 dark:text-stone-100 border-b border-stone-200 dark:border-stone-800 pb-2">
              Step 3: Business Owner & Executive Representative
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Representative Full Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g., Patrick Habimana"
                  value={formData.ownerName}
                  onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-emerald-700 focus:outline-hidden"
                />
                {errors.ownerName && <p className="text-xs text-rose-600 mt-1">{errors.ownerName}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Executive Position *
                </label>
                <select
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-emerald-700 focus:outline-hidden"
                >
                  <option value="Managing Director">Managing Director</option>
                  <option value="General Manager">General Manager</option>
                  <option value="Proprietor / Owner">Proprietor / Owner</option>
                  <option value="Operations Director">Operations Director</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Owner Email *
                </label>
                <input
                  type="email"
                  placeholder="owner@business.rw"
                  value={formData.ownerEmail}
                  onChange={(e) => setFormData({ ...formData, ownerEmail: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-emerald-700 focus:outline-hidden"
                />
                {errors.ownerEmail && <p className="text-xs text-rose-600 mt-1">{errors.ownerEmail}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Owner Mobile *
                </label>
                <input
                  type="text"
                  placeholder="+250 788 123 456"
                  value={formData.ownerPhone}
                  onChange={(e) => setFormData({ ...formData, ownerPhone: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-emerald-700 focus:outline-hidden"
                />
                {errors.ownerPhone && <p className="text-xs text-rose-600 mt-1">{errors.ownerPhone}</p>}
              </div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-5">
            <h3 className="font-bold text-base text-stone-900 dark:text-stone-100 border-b border-stone-200 dark:border-stone-800 pb-2">
              Step 4: Registration & Compliance Documents
            </h3>
            <p className="text-xs text-stone-600 dark:text-stone-400">
              Upload verified PDF copies of your company registration and tax compliance certifications.
            </p>

            <div className="space-y-3">
              {[
                { title: 'RDB Business Registration Certificate', file: formData.docRegistration, state: 'Verified 450 KB' },
                { title: 'RRA Tax Clearance Certificate (Current Year)', file: formData.docTax, state: 'Verified 280 KB' },
                { title: 'Authorized Representative National ID / Passport', file: formData.docIdentity, state: 'Verified 620 KB' },
              ].map((doc, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/70 dark:bg-stone-900/30 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-800 dark:text-emerald-400 shrink-0">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-stone-900 dark:text-stone-100">{doc.title}</div>
                      <div className="text-[11px] text-stone-500 font-mono">{doc.file} · {doc.state}</div>
                    </div>
                  </div>
                  <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" />
                    Ready
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-5">
            <h3 className="font-bold text-base text-stone-900 dark:text-stone-100 border-b border-stone-200 dark:border-stone-800 pb-2">
              Step 5: Review & Submit Application
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-stone-50 dark:bg-stone-900/30 rounded-xl space-y-1">
                <span className="text-stone-400 uppercase text-[10px] font-bold">Business Entity</span>
                <div className="font-bold text-stone-900 dark:text-stone-100 text-sm">{formData.businessName || 'Virunga Eco-Resort'}</div>
                <div className="capitalize text-stone-600 dark:text-stone-300">Category: {formData.businessType}</div>
                <div className="text-stone-500">{formData.location}</div>
              </div>

              <div className="p-3 bg-stone-50 dark:bg-stone-900/30 rounded-xl space-y-1">
                <span className="text-stone-400 uppercase text-[10px] font-bold">Authorized Contact</span>
                <div className="font-bold text-stone-900 dark:text-stone-100 text-sm">{formData.ownerName || 'Patrick Habimana'}</div>
                <div className="text-stone-600 dark:text-stone-300">{formData.position}</div>
                <div className="text-stone-500 font-mono">{formData.email} · {formData.phone}</div>
              </div>
            </div>

            <div className="p-3 bg-emerald-50/60 dark:bg-emerald-950/20 rounded-xl border border-emerald-200/60 dark:border-emerald-900/40 text-xs text-emerald-900 dark:text-emerald-200 flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
              <p>
                By clicking Submit Application, you certify that all submitted business identification and tax clearance records are authentic and ready for platform review.
              </p>
            </div>
          </div>
        )}

        {/* Wizard Navigation Actions */}
        <div className="mt-8 pt-4 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between">
          {step > 1 ? (
            <button
              type="button"
              onClick={handlePrev}
              className="px-4 py-2 rounded-lg border border-stone-300 dark:border-stone-700 text-xs font-semibold text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Previous</span>
            </button>
          ) : (
            <div />
          )}

          {step < 5 ? (
            <button
              type="button"
              onClick={handleNext}
              className="px-5 py-2 rounded-lg bg-emerald-900 dark:bg-emerald-700 text-white text-xs font-semibold hover:bg-emerald-800 flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <span>Next Step</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              className="px-6 py-2.5 rounded-lg bg-emerald-900 dark:bg-emerald-700 text-white text-xs font-bold hover:bg-emerald-800 flex items-center gap-2 transition-colors shadow-sm"
            >
              <span>Submit Business Application</span>
              <CheckCircle className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
