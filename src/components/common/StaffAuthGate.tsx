import React, { useState } from 'react';
import { useSangira } from '../../context/SangiraContext';
import { Role } from '../../types';
import {
  ShieldCheck,
  Mail,
  Lock,
  User,
  Building2,
  ArrowLeft,
  AlertTriangle,
  KeyRound,
  LogIn,
  UserPlus,
  Eye,
} from 'lucide-react';
import { IntegrationAlertBanner } from './IntegrationAlertBanner';

const STAFF_ROLES: { value: Role; label: string; department: string }[] = [
  { value: 'SYSTEM_ADMIN', label: 'Platform Superadmin', department: 'Platform Administration' },
  { value: 'HOTEL_MANAGER', label: 'Hotel / General Manager', department: 'Executive Management' },
  { value: 'KITCHEN_MANAGER', label: 'Executive Chef (Kitchen KDS)', department: 'Main Kitchen' },
  { value: 'KITCHEN_STAFF', label: 'Kitchen Crew', department: 'Main Kitchen' },
  { value: 'BAR_MANAGER', label: 'Bar & Mixology Manager', department: 'Terrace & Cocktail Bar' },
  { value: 'BARTENDER', label: 'Lead Bartender', department: 'Terrace & Cocktail Bar' },
  { value: 'STOCK_MANAGER', label: 'Stock & Inventory Manager', department: 'Central Warehouse & Inventory' },
  { value: 'CASHIER', label: 'Cashier & MoMo Settlement', department: 'Cashier & Settlement' },
  { value: 'SERVER', label: 'Floor Server', department: 'Dining Room & Service' },
];

export const StaffAuthGate: React.FC = () => {
  const {
    allBusinesses,
    integrationStatus,
    signInStaff,
    signUpStaff,
    setRole,
    setActiveTab,
    setPreKeyPreviewMode,
    setIsAuthModalOpen,
  } = useSangira();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<Role>('HOTEL_MANAGER');
  const [selectedBusinessId, setSelectedBusinessId] = useState(
    allBusinesses[0]?.id || 'biz-grand-kigali'
  );
  const [phone, setPhone] = useState('+250 788 000 000');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const betterAuthConfigured = integrationStatus?.services.betterAuth.configured ?? false;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsSubmitting(true);

    if (mode === 'signin') {
      const res = await signInStaff(email, password);
      if (!res.ok) {
        setErrorMsg(res.error || 'Authentication failed');
      }
    } else {
      const roleMeta = STAFF_ROLES.find((r) => r.value === selectedRole);
      const res = await signUpStaff({
        name,
        email,
        password,
        role: selectedRole,
        businessId: selectedBusinessId,
        department: roleMeta?.department || 'Operations',
        phone,
      });
      if (!res.ok) {
        setErrorMsg(res.error || 'Could not create staff account');
      }
    }

    setIsSubmitting(false);
  };

  const handleEnterPreKeyPreview = (previewRole: Role) => {
    setPreKeyPreviewMode(true);
    setRole(previewRole);
    setActiveTab('dashboard');
    setIsAuthModalOpen(false);
  };

  return (
    <div className="min-h-dvh bg-[#FAF6EB] dark:bg-[#0A0E0C] text-stone-900 dark:text-stone-100 flex flex-col">
      <IntegrationAlertBanner />

      <div className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-5 rounded-2xl border border-[#D4AF37]/40 bg-[#FFFDF9] dark:bg-[#121614] overflow-hidden">
          {/* Left Panel: Brand & Better Auth Security Summary */}
          <div className="lg:col-span-2 bg-[#0E382B] text-[#FAF6EB] p-6 sm:p-8 flex flex-col justify-between gap-6 border-b lg:border-b-0 lg:border-r border-[#D4AF37]/30">
            <div className="space-y-4">
              <button
                type="button"
                onClick={() => {
                  setRole('PUBLIC');
                  setActiveTab('landing');
                  setIsAuthModalOpen(false);
                }}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#F3DF95] hover:underline cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Public Discovery</span>
              </button>

              <div>
                <div className="text-[11px] font-bold uppercase tracking-widest text-[#D4AF37]">
                  SANGIRA STAFF PORTAL
                </div>
                <h1 className="text-2xl font-extrabold tracking-tight text-white mt-1">
                  Authenticated Operations Access
                </h1>
                <p className="text-xs text-stone-300 mt-2 leading-relaxed">
                  Powered by Better Auth session security and Supabase PostgreSQL Row-Level Security (RLS) scoped per hospitality property and staff role.
                </p>
              </div>
            </div>

            <div className="space-y-3 text-xs border-t border-white/15 pt-4">
              <div className="flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
                <span>Role-enforced access across Management, Kitchen KDS, Bar, Inventory, Cashier, and Floor Service.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <KeyRound className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
                <span>
                  Auth Status:{' '}
                  <strong className={betterAuthConfigured ? 'text-emerald-300' : 'text-amber-300'}>
                    {betterAuthConfigured ? 'Better Auth Ready' : 'Awaiting DATABASE_URL & BETTER_AUTH_SECRET'}
                  </strong>
                </span>
              </div>
            </div>
          </div>

          {/* Right Panel: Better Auth Login / Registration Form */}
          <div className="lg:col-span-3 p-6 sm:p-8 space-y-5">
            {/* Mode Switcher */}
            <div className="flex items-center gap-1 p-1 rounded-xl bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-xs font-semibold">
              <button
                type="button"
                onClick={() => {
                  setMode('signin');
                  setErrorMsg(null);
                }}
                className={`flex-1 min-h-[40px] px-3 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
                  mode === 'signin'
                    ? 'bg-[#0E382B] text-[#F3DF95]'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
                }`}
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Staff Sign In</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('signup');
                  setErrorMsg(null);
                }}
                className={`flex-1 min-h-[40px] px-3 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
                  mode === 'signup'
                    ? 'bg-[#0E382B] text-[#F3DF95]'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Register Staff</span>
              </button>
            </div>

            {!betterAuthConfigured && (
              <div className="p-3.5 rounded-xl border border-amber-300 dark:border-amber-800 bg-amber-50/70 dark:bg-amber-950/25 text-xs space-y-2">
                <div className="flex items-center gap-2 font-bold text-amber-900 dark:text-amber-300">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>Better Auth & PostgreSQL Keys Not Configured Yet</span>
                </div>
                <p className="text-[11px] text-amber-800 dark:text-amber-200 leading-relaxed">
                  Add <span className="font-mono font-semibold">DATABASE_URL</span> and{' '}
                  <span className="font-mono font-semibold">BETTER_AUTH_SECRET</span> in Secrets to authenticate live staff sessions against Supabase PostgreSQL.
                </p>
                <div className="pt-1 flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleEnterPreKeyPreview('HOTEL_MANAGER')}
                    className="min-h-[36px] px-3 py-1.5 rounded-lg bg-amber-900 text-white font-semibold text-[11px] flex items-center gap-1.5 cursor-pointer hover:bg-amber-800 transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Preview Staff Workspace (Pre-Key Mode)</span>
                  </button>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {mode === 'signup' && (
                <div>
                  <label className="block text-[11px] font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Full Name *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Aline Mukamana"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 focus:outline-hidden focus:border-[#D4AF37]"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Staff Email *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    placeholder="staff@grandkigali.rw"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 focus:outline-hidden focus:border-[#D4AF37]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Password *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    minLength={8}
                    placeholder="Minimum 8 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 focus:outline-hidden focus:border-[#D4AF37]"
                  />
                </div>
              </div>

              {mode === 'signup' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-stone-700 dark:text-stone-300 mb-1">
                      Assigned Role
                    </label>
                    <select
                      value={selectedRole}
                      onChange={(e) => setSelectedRole(e.target.value as Role)}
                      className="w-full px-3 py-2.5 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 focus:outline-hidden focus:border-[#D4AF37]"
                    >
                      {STAFF_ROLES.map((r) => (
                        <option key={r.value} value={r.value}>
                          {r.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-stone-700 dark:text-stone-300 mb-1">
                      Hospitality Property
                    </label>
                    <div className="relative">
                      <Building2 className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <select
                        value={selectedBusinessId}
                        onChange={(e) => setSelectedBusinessId(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 focus:outline-hidden focus:border-[#D4AF37]"
                      >
                        {allBusinesses.map((b) => (
                          <option key={b.id} value={b.id}>
                            {b.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-semibold text-stone-700 dark:text-stone-300 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 font-mono text-stone-900 dark:text-stone-100 focus:outline-hidden focus:border-[#D4AF37]"
                    />
                  </div>
                </div>
              )}

              {errorMsg && (
                <div className="p-3 rounded-lg border border-rose-300 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 text-xs">
                  {errorMsg}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full min-h-[44px] py-2.5 px-4 rounded-xl bg-[#0E382B] hover:bg-[#144737] text-[#F3DF95] border border-[#D4AF37]/60 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors disabled:opacity-60"
              >
                {mode === 'signin' ? <LogIn className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                <span>
                  {isSubmitting
                    ? 'Verifying with Better Auth...'
                    : mode === 'signin'
                    ? 'Sign In with Better Auth'
                    : 'Create Staff Account'}
                </span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
