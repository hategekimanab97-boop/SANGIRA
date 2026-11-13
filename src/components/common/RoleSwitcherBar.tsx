import React from 'react';
import { useSangira, UserRoleOrPublic } from '../../context/SangiraContext';
import { LanguageSelector } from './LanguageSelector';
import {
  ShieldCheck,
  Building2,
  ChefHat,
  Wine,
  Package,
  CreditCard,
  UserCheck,
  Smartphone,
  Globe,
  Sun,
  Moon,
  LogIn,
  KeyRound,
} from 'lucide-react';

interface RoleOption {
  id: UserRoleOrPublic;
  label: string;
  icon: React.ElementType;
  badge?: string;
}

const staffRoleOptions: RoleOption[] = [
  { id: 'SYSTEM_ADMIN', label: 'Platform Admin', icon: ShieldCheck },
  { id: 'HOTEL_MANAGER', label: 'Hotel Manager', icon: Building2 },
  { id: 'KITCHEN_MANAGER', label: 'Kitchen KDS', icon: ChefHat },
  { id: 'BAR_MANAGER', label: 'Bar & Drinks', icon: Wine },
  { id: 'STOCK_MANAGER', label: 'Stock & Inventory', icon: Package },
  { id: 'CASHIER', label: 'Cashier & MoMo', icon: CreditCard },
  { id: 'SERVER', label: 'Server Floor', icon: UserCheck },
];

export const RoleSwitcherBar: React.FC = () => {
  const {
    role,
    setRole,
    activeBusiness,
    setActiveBusiness,
    allBusinesses,
    theme,
    toggleTheme,
    setActiveTab,
    staffSession,
    integrationStatus,
    preKeyPreviewMode,
    setIsAuthModalOpen,
  } = useSangira();

  const betterAuthConfigured = integrationStatus?.services.betterAuth.configured ?? false;
  const missingKeysCount = integrationStatus?.allMissingKeys.length ?? 0;

  const handleOpenStaffPortal = () => {
    if (staffSession.authenticated && staffSession.user) {
      setRole((staffSession.user.role as UserRoleOrPublic) || 'HOTEL_MANAGER');
      setActiveTab('dashboard');
    } else {
      setIsAuthModalOpen(true);
    }
  };

  return (
    <div className="bg-[#09261D] text-stone-200 border-b border-[#144233] px-2 sm:px-3 py-1 text-xs flex flex-wrap lg:flex-nowrap items-center justify-between gap-1.5 sm:gap-2 z-50">
      {/* Left: Guest Discovery, QR Dining, and Authenticated Staff Entry */}
      <div className="flex items-center gap-1.5 py-0.5 w-full lg:w-auto min-w-0 overflow-x-auto scrollbar-none">
        <button
          onClick={() => {
            setIsAuthModalOpen(false);
            setRole('PUBLIC');
            setActiveTab('landing');
          }}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 min-h-[36px] rounded-md transition-all whitespace-nowrap text-xs cursor-pointer shrink-0 ${
            role === 'PUBLIC'
              ? 'bg-[#D4AF37]/25 text-[#F0D586] font-semibold border border-[#D4AF37]/70'
              : 'text-stone-300 hover:text-white hover:bg-white/5'
          }`}
        >
          <Globe className="w-3.5 h-3.5 shrink-0" />
          <span>Public & Discovery</span>
        </button>

        <button
          onClick={() => {
            setIsAuthModalOpen(false);
            setRole('CUSTOMER');
            setActiveTab('menu');
          }}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 min-h-[36px] rounded-md transition-all whitespace-nowrap text-xs cursor-pointer shrink-0 ${
            role === 'CUSTOMER'
              ? 'bg-[#D4AF37]/25 text-[#F0D586] font-semibold border border-[#D4AF37]/70'
              : 'text-stone-300 hover:text-white hover:bg-white/5'
          }`}
        >
          <Smartphone className="w-3.5 h-3.5 shrink-0" />
          <span>Customer QR Menu</span>
          <span className="text-[9px] bg-[#D4AF37]/30 text-[#F5E2A8] px-1 py-0.2 rounded font-medium">
            Guest
          </span>
        </button>

        {/* Authenticated Staff Workspace or Better Auth Login Trigger */}
        <button
          onClick={handleOpenStaffPortal}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 min-h-[36px] rounded-md transition-all whitespace-nowrap text-xs cursor-pointer shrink-0 ${
            role !== 'PUBLIC' && role !== 'CUSTOMER'
              ? 'bg-[#D4AF37]/25 text-[#F0D586] font-semibold border border-[#D4AF37]/70'
              : 'text-stone-200 bg-white/10 hover:bg-white/15 border border-white/15'
          }`}
        >
          <LogIn className="w-3.5 h-3.5 shrink-0 text-[#D4AF37]" />
          <span>
            {staffSession.authenticated && staffSession.user
              ? `Staff (${staffSession.user.role})`
              : 'Staff Sign In'}
          </span>
        </button>

        {/* Pre-Key Preview Role Selector (only visible before BETTER_AUTH_SECRET + DATABASE_URL are configured) */}
        {!betterAuthConfigured && preKeyPreviewMode && role !== 'PUBLIC' && role !== 'CUSTOMER' && (
          <div className="flex items-center gap-1 pl-2 ml-1 border-l border-white/15">
            <span className="text-[10px] font-semibold text-amber-300 whitespace-nowrap shrink-0">
              Preview Role:
            </span>
            {staffRoleOptions.map((opt) => {
              const Icon = opt.icon;
              const isActive = role === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => {
                    setRole(opt.id);
                    setActiveTab('dashboard');
                  }}
                  className={`flex items-center gap-1 px-2 py-1 min-h-[32px] rounded text-[11px] whitespace-nowrap cursor-pointer shrink-0 transition-colors ${
                    isActive
                      ? 'bg-[#D4AF37]/25 text-[#F0D586] font-semibold border border-[#D4AF37]/60'
                      : 'text-stone-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-3 h-3 shrink-0" />
                  <span>{opt.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Right: Missing Keys Indicator, Tenant Switcher, Language & Theme Toggle */}
      <div className="flex items-center justify-between sm:justify-end gap-1.5 sm:gap-2 shrink-0 w-full lg:w-auto ml-auto">
        {missingKeysCount > 0 && (
          <button
            type="button"
            onClick={handleOpenStaffPortal}
            className="flex items-center gap-1.5 px-2.5 py-1 min-h-[32px] rounded bg-amber-500/20 border border-amber-400/50 text-amber-200 hover:bg-amber-500/30 text-[11px] font-semibold whitespace-nowrap shrink-0 cursor-pointer transition-colors"
            title="View missing API keys setup checklist"
          >
            <KeyRound className="w-3 h-3 shrink-0" />
            <span>Setup Keys ({missingKeysCount})</span>
          </button>
        )}

        {role !== 'SYSTEM_ADMIN' && role !== 'PUBLIC' && (
          <div className="flex items-center gap-1.5 bg-black/30 px-2 py-0.5 rounded border border-white/10 min-w-0 flex-1 sm:flex-initial">
            <Building2 className="w-3 h-3 text-stone-400 shrink-0" />
            <span className="hidden sm:inline text-[11px] text-stone-400 shrink-0">Tenant:</span>
            <select
              value={activeBusiness.id}
              onChange={(e) => {
                const found = allBusinesses.find((b) => b.id === e.target.value);
                if (found) setActiveBusiness(found);
              }}
              aria-label="Select active property"
              className="bg-transparent text-emerald-300 font-medium text-xs focus:outline-hidden cursor-pointer truncate max-w-full sm:max-w-[190px]"
            >
              {allBusinesses.map((b) => (
                <option key={b.id} value={b.id} className="bg-stone-900 text-stone-100">
                  {b.name} ({b.type.toUpperCase()})
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="flex items-center gap-1.5 shrink-0 ml-auto">
          <LanguageSelector variant="inline-buttons" />

          <button
            onClick={toggleTheme}
            aria-label="Toggle Theme"
            className="min-h-[34px] min-w-[34px] flex items-center justify-center p-1.5 rounded text-stone-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
          >
            {theme === 'light' ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>
    </div>
  );
};
