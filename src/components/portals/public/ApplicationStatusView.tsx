import React, { useState } from 'react';
import { useSangira } from '../../../context/SangiraContext';
import {
  Search,
  CheckCircle,
  Clock,
  XCircle,
  FileText,
  Building2,
  Calendar,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';

export const ApplicationStatusView: React.FC = () => {
  const { applications, setRole, setActiveTab } = useSangira();
  const [searchRef, setSearchRef] = useState('SNG-APP-2026-081');
  const [selectedApp, setSelectedApp] = useState(applications[0] || null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const found = applications.find(
      (a) => a.reference.toLowerCase() === searchRef.trim().toLowerCase()
    );
    if (found) {
      setSelectedApp(found);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-10 px-4 sm:px-6 space-y-6">
      {/* Return to Home button */}
      <div>
        <button
          onClick={() => setActiveTab('landing')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-600 dark:text-stone-400 hover:text-emerald-800 dark:hover:text-emerald-300 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Discover Hotels & Dining</span>
        </button>
      </div>

      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100">
          Application Status Verification
        </h1>
        <p className="text-xs text-stone-600 dark:text-stone-400">
          Enter your unique Sangira registration reference code to verify your review milestone.
        </p>
      </div>

      {/* Search Input Box */}
      <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            placeholder="e.g. SNG-APP-2026-081"
            value={searchRef}
            onChange={(e) => setSearchRef(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs font-mono rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-emerald-700 focus:outline-hidden"
          />
        </div>
        <button
          type="submit"
          className="px-4 py-2 bg-[#0E382B] hover:bg-[#144737] text-[#FAF6EB] border border-[#D4AF37]/60 text-xs font-semibold rounded-lg transition-colors shadow-xs"
        >
          Check Status
        </button>
      </form>

      {/* Preset Reference Quick Pickers */}
      <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-stone-500">
        <span>Sample Applications:</span>
        {applications.slice(0, 3).map((app) => (
          <button
            key={app.id}
            onClick={() => {
              setSearchRef(app.reference);
              setSelectedApp(app);
            }}
            className={`px-2 py-0.5 rounded-md font-mono text-[11px] border transition-colors ${
              selectedApp?.id === app.id
                ? 'bg-[#D4AF37]/20 text-[#8B6E15] dark:text-[#E6C665] border-[#D4AF37]/50'
                : 'border-stone-200 dark:border-stone-800 hover:bg-[#FAF6EB] dark:hover:bg-stone-800'
            }`}
          >
            {app.reference} ({app.status})
          </button>
        ))}
      </div>

      {/* Status Details Card */}
      {selectedApp && (
        <div className="bg-[#FFFDF9] dark:bg-[#121614] rounded-2xl border border-[#D4AF37]/35 dark:border-[#D4AF37]/25 p-4 sm:p-8 space-y-6 shadow-xs">
          {/* Top banner */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-200 dark:border-stone-800 pb-4">
            <div>
              <span className="text-[10px] uppercase font-bold text-stone-400">Application Reference</span>
              <h3 className="text-xl font-bold font-mono text-stone-900 dark:text-stone-100">
                {selectedApp.reference}
              </h3>
            </div>

            <div className="flex items-center gap-2">
              {selectedApp.status === 'approved' && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  <CheckCircle className="w-3.5 h-3.5" /> Approved & Active
                </span>
              )}
              {selectedApp.status === 'pending' && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                  <Clock className="w-3.5 h-3.5" /> Under Compliance Review
                </span>
              )}
              {selectedApp.status === 'rejected' && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                  <XCircle className="w-3.5 h-3.5" /> Action Required / Rejected
                </span>
              )}
            </div>
          </div>

          {/* Business overview */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <span className="text-stone-400 font-semibold uppercase text-[10px]">Registered Entity</span>
              <div className="font-bold text-stone-900 dark:text-stone-100 text-sm">{selectedApp.businessName}</div>
              <div className="capitalize text-stone-600 dark:text-stone-300">Category: {selectedApp.businessType}</div>
              <div className="text-stone-500">{selectedApp.location}</div>
            </div>

            <div className="space-y-1">
              <span className="text-stone-400 font-semibold uppercase text-[10px]">Primary Contact</span>
              <div className="font-bold text-stone-900 dark:text-stone-100 text-sm">{selectedApp.ownerName}</div>
              <div className="text-stone-600 dark:text-stone-300">{selectedApp.position}</div>
              <div className="text-stone-500 font-mono">{selectedApp.email} · {selectedApp.phone}</div>
            </div>
          </div>

          {/* Review Milestones timeline */}
          <div className="pt-2">
            <h4 className="text-xs font-bold text-stone-900 dark:text-stone-100 mb-3">Review Progress</h4>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs shrink-0 mt-0.5">
                  ✓
                </div>
                <div>
                  <div className="text-xs font-semibold text-stone-900 dark:text-stone-100">Application & Compliance Documents Received</div>
                  <div className="text-[11px] text-stone-500">Submitted on {new Date(selectedApp.submittedAt).toLocaleDateString()}</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs shrink-0 mt-0.5 ${
                    selectedApp.status === 'approved'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-amber-500 text-white animate-pulse'
                  }`}
                >
                  {selectedApp.status === 'approved' ? '✓' : '•'}
                </div>
                <div>
                  <div className="text-xs font-semibold text-stone-900 dark:text-stone-100">
                    Regulatory Verification & Licensing Review
                  </div>
                  <div className="text-[11px] text-stone-500">
                    {selectedApp.reviewerNotes || 'Under inspection by Platform Superadmin.'}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs shrink-0 mt-0.5 ${
                    selectedApp.status === 'approved'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-stone-200 dark:bg-stone-800 text-stone-400'
                  }`}
                >
                  {selectedApp.status === 'approved' ? '✓' : '3'}
                </div>
                <div>
                  <div className="text-xs font-semibold text-stone-900 dark:text-stone-100">
                    Tenant Workspace Provisioning & Manager Onboarding
                  </div>
                  <div className="text-[11px] text-stone-500">
                    {selectedApp.status === 'approved'
                      ? 'Active. Workspace provisioned with full operational dashboards.'
                      : 'Pending final administrative sign-off.'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Admin shortcut if pending */}
          {selectedApp.status === 'pending' && (
            <div className="p-4 bg-purple-50 dark:bg-purple-950/20 rounded-xl border border-purple-200 dark:border-purple-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-purple-900 dark:text-purple-300">
                <ShieldCheck className="w-4 h-4 shrink-0 text-purple-700" />
                <span>Simulate administrative approval for this application:</span>
              </div>
              <button
                onClick={() => {
                  setRole('SYSTEM_ADMIN');
                  setActiveTab('applications');
                }}
                className="px-3 py-1.5 rounded-lg bg-purple-900 dark:bg-purple-700 text-white font-semibold hover:bg-purple-800 transition-colors shrink-0"
              >
                Review in Admin Portal
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
