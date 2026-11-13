import React, { useState } from 'react';
import { useSangira } from '../../../context/SangiraContext';
import { BusinessApplication } from '../../../types';
import {
  Building2,
  Users,
  CheckCircle,
  XCircle,
  Clock,
  ShieldCheck,
  Search,
  FileText,
  AlertTriangle,
  History,
  Lock,
  Unlock,
  ChevronRight,
  X,
} from 'lucide-react';

export const AdminDashboardView: React.FC = () => {
  const {
    applications,
    reviewApplication,
    allBusinesses,
    auditLogs,
    activeTab,
    setActiveTab,
    setActiveBusiness,
    setRole,
  } = useSangira();

  const [selectedApp, setSelectedApp] = useState<BusinessApplication | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Stats
  const totalBusinesses = allBusinesses.length;
  const activeBusinesses = allBusinesses.filter((b) => b.status === 'active').length;
  const pendingApps = applications.filter((a) => a.status === 'pending');

  const filteredApps = applications.filter(
    (a) =>
      a.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.reference.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-purple-700 dark:text-purple-400" />
            <span>Platform Governance & Tenant Administration</span>
          </h1>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
            Central Sangira administration dashboard: review applications, audit compliance, and manage tenant environments.
          </p>
        </div>

        {/* Tab switch pills */}
        <div className="flex items-center gap-1 bg-stone-100 dark:bg-stone-900 p-1 rounded-xl text-xs font-semibold overflow-x-auto scrollbar-none max-w-full">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`min-h-[36px] px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'dashboard'
                ? 'bg-white dark:bg-stone-800 text-purple-900 dark:text-purple-300 shadow-xs'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('applications')}
            className={`min-h-[36px] px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'applications'
                ? 'bg-white dark:bg-stone-800 text-purple-900 dark:text-purple-300 shadow-xs'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
            }`}
          >
            <span>Applications Queue</span>
            {pendingApps.length > 0 && (
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-purple-200 dark:bg-purple-950 text-purple-800 dark:text-purple-300">
                {pendingApps.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('businesses')}
            className={`min-h-[36px] px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'businesses'
                ? 'bg-white dark:bg-stone-800 text-purple-900 dark:text-purple-300 shadow-xs'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
            }`}
          >
            Registered Tenants
          </button>
          <button
            onClick={() => setActiveTab('audit_logs')}
            className={`min-h-[36px] px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'audit_logs'
                ? 'bg-white dark:bg-stone-800 text-purple-900 dark:text-purple-300 shadow-xs'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
            }`}
          >
            Audit Trail
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-[#121614] shadow-xs">
          <div className="flex items-center justify-between text-xs text-stone-500">
            <span>Registered Businesses</span>
            <Building2 className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-stone-900 dark:text-stone-100 mt-2 tabular-nums">
            {totalBusinesses}
          </div>
          <div className="text-[11px] text-emerald-600 mt-1 font-medium">All active multi-tenants</div>
        </div>

        <div className="p-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-[#121614] shadow-xs">
          <div className="flex items-center justify-between text-xs text-stone-500">
            <span>Pending Approvals</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-amber-600 dark:text-amber-400 mt-2 tabular-nums">
            {pendingApps.length}
          </div>
          <div className="text-[11px] text-stone-500 mt-1">Requires admin sign-off</div>
        </div>

        <div className="p-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-[#121614] shadow-xs">
          <div className="flex items-center justify-between text-xs text-stone-500">
            <span>Active Tenants</span>
            <CheckCircle className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-700 dark:text-emerald-400 mt-2 tabular-nums">
            {activeBusinesses}
          </div>
          <div className="text-[11px] text-stone-500 mt-1">Live customer environments</div>
        </div>

        <div className="p-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-[#121614] shadow-xs">
          <div className="flex items-center justify-between text-xs text-stone-500">
            <span>Security Events</span>
            <History className="w-4 h-4 text-stone-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-stone-900 dark:text-stone-100 mt-2 tabular-nums">
            {auditLogs.length}
          </div>
          <div className="text-[11px] text-stone-500 mt-1">Immutable audit records</div>
        </div>
      </div>

      {/* Main Tab View: Overview or Applications Queue */}
      {(activeTab === 'dashboard' || activeTab === 'applications') && (
        <div className="bg-white dark:bg-[#121614] rounded-2xl border border-stone-200 dark:border-stone-800 p-4 sm:p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-200 dark:border-stone-800 pb-4">
            <div>
              <h3 className="font-bold text-base text-stone-900 dark:text-stone-100">
                Business Applications Verification Queue
              </h3>
              <p className="text-xs text-stone-500">
                Inspect prospective hotel and restaurant tenant credentials before issuing live workspaces.
              </p>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                placeholder="Search reference or name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 text-stone-900 dark:text-stone-100 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 dark:bg-stone-900/40 text-stone-500 uppercase text-[10px] tracking-wider border-b border-stone-200 dark:border-stone-800">
                <tr>
                  <th className="py-2.5 px-3">Reference</th>
                  <th className="py-2.5 px-3">Business Name</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3">Owner / Contact</th>
                  <th className="py-2.5 px-3">Location</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-stone-800/60">
                {filteredApps.map((app) => (
                  <tr key={app.id} className="hover:bg-stone-50/60 dark:hover:bg-stone-800/30 transition-colors">
                    <td className="py-3 px-3 font-mono font-medium text-purple-900 dark:text-purple-300">
                      {app.reference}
                    </td>
                    <td className="py-3 px-3 font-semibold text-stone-900 dark:text-stone-100">
                      {app.businessName}
                    </td>
                    <td className="py-3 px-3 capitalize text-stone-600 dark:text-stone-400">
                      {app.businessType}
                    </td>
                    <td className="py-3 px-3 text-stone-600 dark:text-stone-300">
                      <div>{app.ownerName}</div>
                      <div className="text-[11px] text-stone-400 font-mono">{app.email}</div>
                    </td>
                    <td className="py-3 px-3 text-stone-500 truncate max-w-[140px]">
                      {app.location}
                    </td>
                    <td className="py-3 px-3">
                      {app.status === 'approved' && (
                        <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5" /> Approved
                        </span>
                      )}
                      {app.status === 'pending' && (
                        <span className="text-[11px] font-semibold text-amber-700 dark:text-amber-400 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" /> Pending
                        </span>
                      )}
                      {app.status === 'rejected' && (
                        <span className="text-[11px] font-semibold text-rose-700 dark:text-rose-400 flex items-center gap-1">
                          <XCircle className="w-3.5 h-3.5" /> Rejected
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => setSelectedApp(app)}
                        className="px-2.5 py-1 rounded-md bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 font-medium text-[11px] transition-colors"
                      >
                        Inspect Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Registered Tenants List */}
      {activeTab === 'businesses' && (
        <div className="bg-white dark:bg-[#121614] rounded-2xl border border-stone-200 dark:border-stone-800 p-4 sm:p-6 shadow-xs space-y-4">
          <div className="border-b border-stone-200 dark:border-stone-800 pb-3">
            <h3 className="font-bold text-base text-stone-900 dark:text-stone-100">
              Registered Multi-Tenant Workspaces
            </h3>
            <p className="text-xs text-stone-500">
              Direct access to tenant environments, status controls, and database isolation validation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {allBusinesses.map((biz) => (
              <div
                key={biz.id}
                className="p-5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/60 dark:bg-stone-900/30 space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="font-bold text-base text-stone-900 dark:text-stone-100">
                      {biz.name}
                    </h4>
                    <div className="text-xs text-stone-500 font-mono mt-0.5">
                      ID: {biz.id} · {biz.location}
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 uppercase">
                    {biz.status}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs py-2 border-y border-stone-200/60 dark:border-stone-800/60">
                  <div>
                    <span className="text-stone-400 text-[10px] uppercase font-bold">Category</span>
                    <div className="capitalize font-semibold text-stone-800 dark:text-stone-200">{biz.type}</div>
                  </div>
                  <div>
                    <span className="text-stone-400 text-[10px] uppercase font-bold">Hotel Rooms</span>
                    <div className="font-semibold text-stone-800 dark:text-stone-200">
                      {biz.hasHotelModule ? 'Active' : 'Disabled'}
                    </div>
                  </div>
                  <div>
                    <span className="text-stone-400 text-[10px] uppercase font-bold">Tables</span>
                    <div className="font-mono font-semibold text-stone-800 dark:text-stone-200">{biz.tableCount}</div>
                  </div>
                </div>

                <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-2 pt-1 text-xs">
                  <span className="text-stone-500 font-mono truncate">{biz.email}</span>
                  <button
                    onClick={() => {
                      setActiveBusiness(biz);
                      setRole('HOTEL_MANAGER');
                      setActiveTab('dashboard');
                    }}
                    className="px-3 py-1.5 rounded-lg bg-emerald-900 dark:bg-emerald-700 text-white font-semibold text-xs hover:bg-emerald-800 flex items-center justify-center gap-1 transition-colors shrink-0 cursor-pointer"
                  >
                    <span>Enter Workspace</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Audit Logs Tab */}
      {activeTab === 'audit_logs' && (
        <div className="bg-white dark:bg-[#121614] rounded-2xl border border-stone-200 dark:border-stone-800 p-4 sm:p-6 shadow-xs space-y-4">
          <div className="border-b border-stone-200 dark:border-stone-800 pb-3 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-stone-900 dark:text-stone-100">
                Immutable System Audit Trail
              </h3>
              <p className="text-xs text-stone-500">
                Cryptographically sequenced operational log of approvals, stock issuances, and payment verifications.
              </p>
            </div>
            <span className="text-xs font-mono text-purple-700 dark:text-purple-400 font-semibold">
              {auditLogs.length} events logged
            </span>
          </div>

          <div className="space-y-2">
            {auditLogs.map((log) => (
              <div
                key={log.id}
                className="p-3 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/30 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-purple-900 dark:text-purple-300">
                      [{log.action}]
                    </span>
                    <span className="font-semibold text-stone-900 dark:text-stone-100">
                      by {log.performedBy} ({log.role})
                    </span>
                    <span className="text-stone-400">· {log.department}</span>
                  </div>
                  <p className="text-stone-600 dark:text-stone-300">{log.details}</p>
                </div>
                <div className="text-[11px] text-stone-500 dark:text-stone-400 font-mono shrink-0">
                  {log.timestamp}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Slide-over Inspection Drawer for Application */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-xs flex justify-end">
          <div className="w-full max-w-lg bg-white dark:bg-[#121614] h-full shadow-2xl border-l border-stone-200 dark:border-stone-800 p-4 sm:p-6 flex flex-col overflow-y-auto">
            <div className="flex items-center justify-between gap-2 pb-4 border-b border-stone-200 dark:border-stone-800">
              <div className="min-w-0">
                <span className="text-[10px] font-bold text-stone-400 uppercase">Tenant Inspection</span>
                <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100 truncate">
                  {selectedApp.businessName}
                </h3>
              </div>
              <button
                onClick={() => setSelectedApp(null)}
                className="p-2 rounded text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 shrink-0 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-4 flex-1 text-xs">
              <div className="p-3 bg-stone-50 dark:bg-stone-900/40 rounded-xl space-y-2">
                <div className="flex justify-between gap-2">
                  <span className="text-stone-500 shrink-0">Application Reference:</span>
                  <span className="font-mono font-bold text-stone-900 dark:text-stone-100 truncate text-right">{selectedApp.reference}</span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-stone-500 shrink-0">Business Type:</span>
                  <span className="font-semibold capitalize text-stone-900 dark:text-stone-100 truncate text-right">{selectedApp.businessType}</span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-stone-500 shrink-0">Location:</span>
                  <span className="text-stone-800 dark:text-stone-200 truncate text-right">{selectedApp.location}</span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-stone-500 shrink-0">Owner / Applicant:</span>
                  <span className="font-semibold text-stone-900 dark:text-stone-100 truncate text-right">{selectedApp.ownerName} ({selectedApp.position})</span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-stone-500 shrink-0">Contact:</span>
                  <span className="font-mono text-stone-800 dark:text-stone-200 truncate text-right">{selectedApp.email}</span>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-stone-900 dark:text-stone-100 mb-1">Concept Description</h4>
                <p className="text-stone-600 dark:text-stone-300 leading-relaxed bg-stone-50 dark:bg-stone-900/20 p-3 rounded-lg border border-stone-200 dark:border-stone-800">
                  {selectedApp.description}
                </p>
              </div>

              <div>
                <h4 className="font-bold text-stone-900 dark:text-stone-100 mb-2">Compliance Documents</h4>
                <div className="space-y-2">
                  {Object.entries(selectedApp.documents).map(([key, filename]) => (
                    <div
                      key={key}
                      className="p-2.5 rounded-lg border border-stone-200 dark:border-stone-800 flex flex-wrap items-center justify-between gap-2"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <FileText className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span className="capitalize font-medium">{key.replace(/([A-Z])/g, ' $1')}:</span>
                        <span className="text-stone-500 font-mono text-[11px] truncate">{filename}</span>
                      </div>
                      <span className="text-emerald-700 text-[11px] font-bold shrink-0">Verified</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Decision Controls */}
            {selectedApp.status === 'pending' ? (
              <div className="pt-4 border-t border-stone-200 dark:border-stone-800 flex items-center gap-2">
                <button
                  onClick={() => {
                    reviewApplication(selectedApp.id, 'approved', 'Verified and approved by System Superadmin.');
                    setSelectedApp(null);
                  }}
                  className="flex-1 py-2.5 rounded-lg bg-emerald-900 dark:bg-emerald-700 text-white font-bold text-xs hover:bg-emerald-800 transition-colors flex items-center justify-center gap-1.5"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Approve & Provision Workspace</span>
                </button>
                <button
                  onClick={() => setIsRejectModalOpen(true)}
                  className="px-4 py-2.5 rounded-lg border border-rose-300 text-rose-700 hover:bg-rose-50 text-xs font-semibold transition-colors"
                >
                  Reject
                </button>
              </div>
            ) : (
              <div className="pt-4 border-t border-stone-200 dark:border-stone-800 text-center text-xs text-stone-500 font-medium">
                Application status is currently <strong className="capitalize">{selectedApp.status}</strong>.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Reject Confirmation Dialog */}
      {isRejectModalOpen && selectedApp && (
        <div className="fixed inset-0 z-60 bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white dark:bg-[#121614] rounded-2xl border border-stone-200 dark:border-stone-800 p-4 sm:p-6 max-w-md w-full max-h-[92dvh] overflow-y-auto space-y-4">
            <h3 className="font-bold text-base text-rose-700 dark:text-rose-400 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              <span>Reject Application: {selectedApp.businessName}</span>
            </h3>
            <p className="text-xs text-stone-600 dark:text-stone-300">
              Please enter the compliance or legal deficiency reason to be communicated to the applicant.
            </p>
            <textarea
              rows={3}
              placeholder="e.g. Expired business registration document. Please re-upload updated RDB certificate."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full p-2.5 text-xs rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 focus:outline-hidden"
            />
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setIsRejectModalOpen(false)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-stone-600 hover:bg-stone-100"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  reviewApplication(selectedApp.id, 'rejected', rejectReason || 'Insufficient documentation.');
                  setIsRejectModalOpen(false);
                  setSelectedApp(null);
                }}
                className="px-4 py-1.5 rounded-lg bg-rose-700 text-white text-xs font-bold hover:bg-rose-800"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
