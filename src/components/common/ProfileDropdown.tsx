import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useSangira } from '../../context/SangiraContext';
import { useLanguage, SUPPORTED_LANGUAGES } from '../../context/LanguageContext';
import { Role } from '../../types';
import {
  User,
  Settings,
  ShieldCheck,
  Bell,
  LogOut,
  LogIn,
  ChevronDown,
  ChevronRight,
  Cloud,
  CloudOff,
  Sun,
  Moon,
  Clock,
  Phone,
  Mail,
  Building2,
  KeyRound,
  Check,
  ChefHat,
  Wine,
  Package,
  CreditCard,
  UserCheck,
  Globe,
  BadgeCheck,
} from 'lucide-react';

interface ProfileDropdownProps {
  onOpenNotifications: () => void;
}

type DropdownSection = 'profile' | 'settings' | 'security' | null;

const ROLE_METADATA: Record<
  string,
  {
    label: string;
    department: string;
    permissions: string;
    icon: React.ElementType;
    defaultName: string;
    defaultEmail: string;
    defaultPhone: string;
    defaultEmployeeId: string;
  }
> = {
  SYSTEM_ADMIN: {
    label: 'Platform Superadmin',
    department: 'Platform Administration',
    permissions: 'Full Multi-Tenant Control, Tenant Approvals & Global Audit Logs',
    icon: ShieldCheck,
    defaultName: 'System Administrator',
    defaultEmail: 'admin@sangira.rw',
    defaultPhone: '+250 788 000 001',
    defaultEmployeeId: 'SYS-01',
  },
  HOTEL_MANAGER: {
    label: 'General Manager',
    department: 'Executive Management',
    permissions: 'Menu, Recipes, Inventory, Financials, Staff Shifts & Operations',
    icon: Building2,
    defaultName: 'Aline Mukamana',
    defaultEmail: 'aline@grandkigali.rw',
    defaultPhone: '+250 788 111 001',
    defaultEmployeeId: 'EMP-01',
  },
  KITCHEN_MANAGER: {
    label: 'Executive Chef',
    department: 'Main Kitchen',
    permissions: 'Kitchen KDS Control, Recipe Specs, Prep Line & Stock Requisitions',
    icon: ChefHat,
    defaultName: 'Eric Bizimana',
    defaultEmail: 'chef.eric@grandkigali.rw',
    defaultPhone: '+250 788 111 002',
    defaultEmployeeId: 'EMP-02',
  },
  KITCHEN_STAFF: {
    label: 'Kitchen Crew',
    department: 'Main Kitchen',
    permissions: 'Kitchen Ticket Preparation & Dish Readiness Updates',
    icon: ChefHat,
    defaultName: 'Cyril Ntwari',
    defaultEmail: 'cyril@grandkigali.rw',
    defaultPhone: '+250 788 111 003',
    defaultEmployeeId: 'EMP-03',
  },
  BAR_MANAGER: {
    label: 'Bar & Mixology Manager',
    department: 'Terrace & Cocktail Bar',
    permissions: 'Bar Drink Queue, Cocktail Recipes & Beverage Stock Requests',
    icon: Wine,
    defaultName: 'Claude Hakizimana',
    defaultEmail: 'claude@grandkigali.rw',
    defaultPhone: '+250 788 111 004',
    defaultEmployeeId: 'EMP-04',
  },
  BARTENDER: {
    label: 'Lead Bartender',
    department: 'Terrace & Cocktail Bar',
    permissions: 'Bar Queue Preparation & Drink Service Release',
    icon: Wine,
    defaultName: 'Sandrine Umuhoza',
    defaultEmail: 'sandrine@grandkigali.rw',
    defaultPhone: '+250 788 111 005',
    defaultEmployeeId: 'EMP-05',
  },
  STOCK_MANAGER: {
    label: 'Inventory Controller',
    department: 'Central Warehouse & Inventory',
    permissions: 'Central Stock, Purchase Receipts, Requisition Approval & Costing',
    icon: Package,
    defaultName: 'Patrick Ndayisaba',
    defaultEmail: 'stock@grandkigali.rw',
    defaultPhone: '+250 788 111 006',
    defaultEmployeeId: 'EMP-06',
  },
  CASHIER: {
    label: 'Cashier Terminal',
    department: 'Cashier & Settlement',
    permissions: 'MoMo / Card / Cash Reconciliation & Shift Drawer Closure',
    icon: CreditCard,
    defaultName: 'Diane Ingabire',
    defaultEmail: 'cashier@grandkigali.rw',
    defaultPhone: '+250 788 111 007',
    defaultEmployeeId: 'EMP-07',
  },
  SERVER: {
    label: 'Floor Server',
    department: 'Dining Room & Service',
    permissions: 'Table Ordering, Delivery Confirmation & Stock Deduction Trigger',
    icon: UserCheck,
    defaultName: 'Samuel Rutayisire',
    defaultEmail: 'samuel@grandkigali.rw',
    defaultPhone: '+250 788 111 008',
    defaultEmployeeId: 'EMP-08',
  },
};

export const ProfileDropdown: React.FC<ProfileDropdownProps> = ({ onOpenNotifications }) => {
  const {
    role,
    setRole,
    setActiveTab,
    activeBusiness,
    employees,
    shifts,
    notifications,
    theme,
    toggleTheme,
    currentStaffUser,
    staffSession,
    dbConnected,
    integrationStatus,
    setIsAuthModalOpen,
    logoutUser,
    clockInShift,
    clockOutShift,
  } = useSangira();

  const { language, setLanguage } = useLanguage();

  const [isOpen, setIsOpen] = useState(false);
  const [expandedSection, setExpandedSection] = useState<DropdownSection>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Per-role editable profile overrides stored locally
  const [customOverrides, setCustomOverrides] = useState<
    Record<string, { fullName?: string; phone?: string; pin?: string }>
  >(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('sangira_profile_overrides');
        if (saved) return JSON.parse(saved);
      } catch {
        // Ignore storage error
      }
    }
    return {};
  });

  // Inline editing states inside expanded dropdown
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [profileSavedMsg, setProfileSavedMsg] = useState(false);

  // Security PIN states
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [pinError, setPinError] = useState<string | null>(null);
  const [pinSuccessMsg, setPinSuccessMsg] = useState(false);

  // Close dropdown on click outside or Escape key
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  // Resolve current staff identity
  const activeProfile = useMemo(() => {
    const meta = ROLE_METADATA[role] || ROLE_METADATA.HOTEL_MANAGER;
    const matchedEmployee = employees.find((e) => e.roles.includes(role as Role));
    const override = customOverrides[role] || {};

    const fullName =
      override.fullName ||
      currentStaffUser?.name ||
      matchedEmployee?.fullName ||
      meta.defaultName;
    const email = currentStaffUser?.email || matchedEmployee?.email || meta.defaultEmail;
    const phone =
      override.phone || currentStaffUser?.phone || matchedEmployee?.phone || meta.defaultPhone;
    const employeeId =
      currentStaffUser?.employeeId || matchedEmployee?.employeeId || meta.defaultEmployeeId;
    const department =
      currentStaffUser?.department || matchedEmployee?.department || meta.department;
    const activeShift = shifts.find(
      (s) => s.employeeId === employeeId && s.status === 'active'
    );

    const nameParts = fullName.trim().split(/\s+/);
    const initials =
      nameParts.length >= 2
        ? `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`.toUpperCase()
        : fullName.slice(0, 2).toUpperCase();

    return {
      fullName,
      email,
      phone,
      employeeId,
      department,
      roleLabel: meta.label,
      permissions: meta.permissions,
      RoleIcon: meta.icon,
      initials,
      photoURL: currentStaffUser?.image || null,
      isOnShift: Boolean(activeShift) || matchedEmployee?.shiftStatus === 'on_duty',
      shiftClockIn: activeShift?.clockIn || '08:00',
    };
  }, [role, employees, shifts, currentStaffUser, customOverrides]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const toggleSection = (section: Exclude<DropdownSection, null>) => {
    setExpandedSection((prev) => (prev === section ? null : section));
    setIsEditingProfile(false);
    setPinError(null);
  };

  const handleStartEditProfile = () => {
    setEditName(activeProfile.fullName);
    setEditPhone(activeProfile.phone);
    setIsEditingProfile(true);
    setProfileSavedMsg(false);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim()) return;

    const updated = {
      ...customOverrides,
      [role]: {
        ...(customOverrides[role] || {}),
        fullName: editName.trim(),
        phone: editPhone.trim() || activeProfile.phone,
      },
    };
    setCustomOverrides(updated);
    try {
      localStorage.setItem('sangira_profile_overrides', JSON.stringify(updated));
    } catch {
      // Ignore quota
    }
    setIsEditingProfile(false);
    setProfileSavedMsg(true);
    setTimeout(() => setProfileSavedMsg(false), 2500);
  };

  const handleSavePin = (e: React.FormEvent) => {
    e.preventDefault();
    setPinError(null);
    if (!/^\d{4}$/.test(newPin)) {
      setPinError('Enter a 4-digit numeric PIN');
      return;
    }
    if (newPin !== confirmPin) {
      setPinError('PIN confirmation does not match');
      return;
    }
    const updated = {
      ...customOverrides,
      [role]: {
        ...(customOverrides[role] || {}),
        pin: newPin,
      },
    };
    setCustomOverrides(updated);
    try {
      localStorage.setItem('sangira_profile_overrides', JSON.stringify(updated));
    } catch {
      // Ignore quota
    }
    setNewPin('');
    setConfirmPin('');
    setPinSuccessMsg(true);
    setTimeout(() => setPinSuccessMsg(false), 2500);
  };

  const handleToggleShift = () => {
    if (activeProfile.isOnShift) {
      clockOutShift(activeProfile.employeeId);
    } else {
      clockInShift(
        activeProfile.employeeId,
        activeProfile.fullName,
        activeProfile.department,
        (role === 'PUBLIC' ? 'HOTEL_MANAGER' : role) as Role
      );
    }
  };

  const handleLogout = async () => {
    setIsOpen(false);
    setExpandedSection(null);
    await logoutUser();
  };

  const RoleIcon = activeProfile.RoleIcon;
  const resendReady = integrationStatus?.services.resend.configured ?? false;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Circular Profile Avatar Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label="Open personal profile menu"
        className="min-h-[44px] min-w-[44px] flex items-center justify-center gap-1.5 p-1 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800/80 transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D4AF37]"
      >
        <div className="relative shrink-0">
          <div className="w-9 h-9 rounded-full border-2 border-[#D4AF37] bg-[#0E382B] text-[#F3DF95] flex items-center justify-center font-bold text-xs shadow-xs overflow-hidden">
            {activeProfile.photoURL ? (
              <img
                src={activeProfile.photoURL}
                alt={activeProfile.fullName}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            ) : (
              <span>{activeProfile.initials}</span>
            )}
          </div>
          <span
            title={activeProfile.isOnShift ? 'On Duty · Active Session' : 'Off Duty'}
            className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-[#FFFDF9] dark:border-[#0E1310] ${
              activeProfile.isOnShift ? 'bg-emerald-500' : 'bg-stone-400'
            }`}
          />
        </div>
        <ChevronDown
          className={`w-3.5 h-3.5 text-stone-500 dark:text-stone-400 transition-transform duration-150 hidden sm:block ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Personal Profile Dropdown Menu */}
      {isOpen && (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-[min(352px,calc(100vw-1.5rem))] rounded-2xl bg-[#FFFDF9] dark:bg-[#121614] border border-[#D4AF37]/40 shadow-2xl z-50 overflow-hidden text-xs"
        >
          {/* 1. User Identity Header */}
          <div className="p-4 bg-[#0E382B] text-[#FAF6EB] border-b border-[#D4AF37]/30">
            <div className="flex items-start gap-3">
              <div className="w-11 h-11 rounded-full border-2 border-[#D4AF37] bg-[#144737] text-[#F3DF95] flex items-center justify-center font-bold text-sm shrink-0 overflow-hidden">
                {activeProfile.photoURL ? (
                  <img
                    src={activeProfile.photoURL}
                    alt={activeProfile.fullName}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span>{activeProfile.initials}</span>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="font-bold text-sm text-white truncate flex items-center gap-1.5">
                  <span className="truncate">{activeProfile.fullName}</span>
                  <BadgeCheck className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
                </div>
                <div className="text-[11px] text-stone-300 truncate">{activeProfile.email}</div>
                <div className="mt-1.5 flex items-center gap-1.5 text-[11px] font-semibold text-[#F3DF95]">
                  <RoleIcon className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
                  <span className="truncate">{activeProfile.roleLabel}</span>
                </div>
              </div>
            </div>

            {/* Consolidated Supabase PostgreSQL + Resend + Property Strip */}
            <div className="mt-3 pt-2.5 border-t border-white/15 flex flex-wrap items-center justify-between gap-2 text-[11px] text-stone-200">
              <div className="flex items-center gap-1.5">
                {dbConnected ? (
                  <Cloud className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                ) : (
                  <CloudOff className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                )}
                <span className="font-mono text-[10px]">
                  {dbConnected ? 'Supabase RLS' : 'DB Keys Needed'} · {resendReady ? 'Resend Ready' : 'Email Pending'}
                </span>
              </div>

              <div className="flex items-center gap-2 text-[10px] text-stone-300 font-mono">
                <span className="truncate max-w-[115px]">
                  {role === 'SYSTEM_ADMIN' ? 'All Tenants' : activeBusiness.name}
                </span>
                <span aria-hidden="true">·</span>
                <span className="inline-flex items-center gap-1">
                  <Clock className="w-3 h-3 text-[#D4AF37]" />
                  Kigali
                </span>
              </div>
            </div>
          </div>

          {/* 2. Better Auth Sign-In Prompt (if viewing in pre-key preview mode without live session) */}
          {!staffSession.authenticated && (
            <div className="px-3.5 py-2.5 bg-[#FAF6EB] dark:bg-stone-900/60 border-b border-[#D4AF37]/25 flex items-center justify-between gap-2">
              <span className="text-[11px] text-stone-600 dark:text-stone-300">
                Sign in via Better Auth for live RLS sync
              </span>
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  setIsAuthModalOpen(true);
                }}
                className="px-2.5 py-1 rounded-lg bg-[#0E382B] hover:bg-[#144737] text-[#F3DF95] text-[11px] font-semibold flex items-center gap-1 cursor-pointer shrink-0 transition-colors"
              >
                <LogIn className="w-3 h-3" />
                <span>Sign In</span>
              </button>
            </div>
          )}

          {/* 3. Menu Navigation & Compact Expandable Drawers */}
          <div className="p-2 space-y-1 max-h-[58dvh] overflow-y-auto">
            {/* A. My Profile (Expandable Inline) */}
            <div>
              <button
                type="button"
                onClick={() => toggleSection('profile')}
                className={`w-full px-3 py-2.5 rounded-xl flex items-center justify-between text-left transition-colors cursor-pointer ${
                  expandedSection === 'profile'
                    ? 'bg-[#FAF6EB] dark:bg-stone-800/80 text-stone-900 dark:text-stone-100 font-semibold'
                    : 'text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800/50'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <User className="w-4 h-4 text-[#B89320] dark:text-[#D4AF37]" />
                  <span>My Profile</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-mono text-stone-500 dark:text-stone-400">
                    {activeProfile.employeeId}
                  </span>
                  <ChevronRight
                    className={`w-3.5 h-3.5 text-stone-400 transition-transform ${
                      expandedSection === 'profile' ? 'rotate-90' : ''
                    }`}
                  />
                </div>
              </button>

              {expandedSection === 'profile' && (
                <div className="mt-1 mx-1 p-3 rounded-xl bg-stone-50 dark:bg-stone-900/70 border border-stone-200 dark:border-stone-800 space-y-2.5 text-[11px]">
                  {!isEditingProfile ? (
                    <>
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-stone-500 shrink-0">Department</span>
                          <span className="font-semibold text-stone-900 dark:text-stone-100 text-right truncate">
                            {activeProfile.department}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-stone-500 flex items-center gap-1 shrink-0">
                            <Mail className="w-3 h-3" /> Email
                          </span>
                          <span className="font-mono text-stone-800 dark:text-stone-200 truncate min-w-0">
                            {activeProfile.email}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-stone-500 flex items-center gap-1 shrink-0">
                            <Phone className="w-3 h-3" /> Phone
                          </span>
                          <span className="font-mono text-stone-800 dark:text-stone-200 truncate">
                            {activeProfile.phone}
                          </span>
                        </div>
                        <div className="flex items-center justify-between pt-1 border-t border-stone-200 dark:border-stone-800">
                          <span className="text-stone-500">Shift Status</span>
                          <div className="flex items-center gap-2">
                            <span
                              className={`font-semibold ${
                                activeProfile.isOnShift
                                  ? 'text-emerald-700 dark:text-emerald-400'
                                  : 'text-stone-500'
                              }`}
                            >
                              {activeProfile.isOnShift
                                ? `On Duty · ${activeProfile.shiftClockIn}`
                                : 'Off Duty'}
                            </span>
                            <button
                              type="button"
                              onClick={handleToggleShift}
                              className="px-2 py-0.5 rounded bg-stone-200 dark:bg-stone-800 hover:bg-[#0E382B] hover:text-[#F3DF95] text-[10px] font-semibold transition-colors cursor-pointer"
                            >
                              {activeProfile.isOnShift ? 'Clock Out' : 'Clock In'}
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="pt-1.5 flex items-center justify-between border-t border-stone-200 dark:border-stone-800">
                        {profileSavedMsg ? (
                          <span className="text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1">
                            <Check className="w-3 h-3" /> Saved
                          </span>
                        ) : (
                          <span className="text-stone-400 text-[10px]">Staff directory synced</span>
                        )}
                        <button
                          type="button"
                          onClick={handleStartEditProfile}
                          className="text-[11px] font-semibold text-[#8B6E15] dark:text-[#D4AF37] hover:underline cursor-pointer"
                        >
                          Edit Details
                        </button>
                      </div>
                    </>
                  ) : (
                    <form onSubmit={handleSaveProfile} className="space-y-2">
                      <div>
                        <label className="block text-[10px] font-semibold text-stone-500 mb-0.5">
                          Full Name
                        </label>
                        <input
                          type="text"
                          required
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-xs focus:outline-hidden"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-stone-500 mb-0.5">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          value={editPhone}
                          onChange={(e) => setEditPhone(e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 font-mono text-xs focus:outline-hidden"
                        />
                      </div>
                      <div className="flex items-center justify-end gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setIsEditingProfile(false)}
                          className="px-2.5 py-1 rounded-lg text-stone-500 hover:bg-stone-200 dark:hover:bg-stone-800 cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-3 py-1 rounded-lg bg-[#0E382B] text-[#F3DF95] font-semibold cursor-pointer"
                        >
                          Save
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}
            </div>

            {/* B. Account Settings (Theme & Language inside Dropdown) */}
            <div>
              <button
                type="button"
                onClick={() => toggleSection('settings')}
                className={`w-full px-3 py-2.5 rounded-xl flex items-center justify-between text-left transition-colors cursor-pointer ${
                  expandedSection === 'settings'
                    ? 'bg-[#FAF6EB] dark:bg-stone-800/80 text-stone-900 dark:text-stone-100 font-semibold'
                    : 'text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800/50'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Settings className="w-4 h-4 text-[#B89320] dark:text-[#D4AF37]" />
                  <span>Account Settings</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-medium text-stone-500 dark:text-stone-400 capitalize">
                    {theme} · {language.toUpperCase()}
                  </span>
                  <ChevronRight
                    className={`w-3.5 h-3.5 text-stone-400 transition-transform ${
                      expandedSection === 'settings' ? 'rotate-90' : ''
                    }`}
                  />
                </div>
              </button>

              {expandedSection === 'settings' && (
                <div className="mt-1 mx-1 p-3 rounded-xl bg-stone-50 dark:bg-stone-900/70 border border-stone-200 dark:border-stone-800 space-y-3 text-[11px]">
                  {/* Appearance Theme Toggle */}
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-stone-700 dark:text-stone-300">
                      Interface Theme
                    </span>
                    <button
                      type="button"
                      onClick={toggleTheme}
                      className="px-2.5 py-1 rounded-lg bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-200 font-semibold flex items-center gap-1.5 cursor-pointer hover:border-[#D4AF37] transition-colors"
                    >
                      {theme === 'light' ? (
                        <>
                          <Sun className="w-3.5 h-3.5 text-amber-500" />
                          <span>Light Mode</span>
                        </>
                      ) : (
                        <>
                          <Moon className="w-3.5 h-3.5 text-[#D4AF37]" />
                          <span>Dark Mode</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Preferred Language */}
                  <div className="space-y-1.5 pt-2 border-t border-stone-200 dark:border-stone-800">
                    <div className="flex items-center gap-1.5 font-medium text-stone-700 dark:text-stone-300">
                      <Globe className="w-3.5 h-3.5 text-[#B89320]" />
                      <span>Workspace Language</span>
                    </div>
                    <div className="grid grid-cols-4 gap-1">
                      {SUPPORTED_LANGUAGES.map((lang) => (
                        <button
                          key={lang.code}
                          type="button"
                          onClick={() => setLanguage(lang.code)}
                          className={`min-h-[36px] py-1 px-1.5 rounded-lg text-[10px] font-bold uppercase border transition-colors cursor-pointer ${
                            language === lang.code
                              ? 'bg-[#0E382B] text-[#F3DF95] border-[#D4AF37]'
                              : 'bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-400 border-stone-200 dark:border-stone-700'
                          }`}
                        >
                          {lang.code}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* C. Security & Password / PIN (Expandable Inline) */}
            <div>
              <button
                type="button"
                onClick={() => toggleSection('security')}
                className={`w-full px-3 py-2.5 rounded-xl flex items-center justify-between text-left transition-colors cursor-pointer ${
                  expandedSection === 'security'
                    ? 'bg-[#FAF6EB] dark:bg-stone-800/80 text-stone-900 dark:text-stone-100 font-semibold'
                    : 'text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800/50'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <KeyRound className="w-4 h-4 text-[#B89320] dark:text-[#D4AF37]" />
                  <span>Security & Password</span>
                </div>
                <ChevronRight
                  className={`w-3.5 h-3.5 text-stone-400 transition-transform ${
                    expandedSection === 'security' ? 'rotate-90' : ''
                  }`}
                />
              </button>

              {expandedSection === 'security' && (
                <div className="mt-1 mx-1 p-3 rounded-xl bg-stone-50 dark:bg-stone-900/70 border border-stone-200 dark:border-stone-800 space-y-2.5 text-[11px]">
                  <div>
                    <div className="font-semibold text-stone-800 dark:text-stone-200">
                      Role Permissions
                    </div>
                    <p className="text-stone-500 dark:text-stone-400 mt-0.5 leading-relaxed">
                      {activeProfile.permissions}
                    </p>
                  </div>

                  <form
                    onSubmit={handleSavePin}
                    className="pt-2 border-t border-stone-200 dark:border-stone-800 space-y-2"
                  >
                    <div className="font-semibold text-stone-800 dark:text-stone-200">
                      Update Terminal PIN (4 Digits)
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="password"
                        maxLength={4}
                        inputMode="numeric"
                        placeholder="New PIN"
                        value={newPin}
                        onChange={(e) => setNewPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 font-mono text-center tracking-widest text-xs focus:outline-hidden"
                      />
                      <input
                        type="password"
                        maxLength={4}
                        inputMode="numeric"
                        placeholder="Confirm"
                        value={confirmPin}
                        onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 font-mono text-center tracking-widest text-xs focus:outline-hidden"
                      />
                    </div>
                    {pinError && <div className="text-rose-600 dark:text-rose-400">{pinError}</div>}
                    {pinSuccessMsg && (
                      <div className="text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1">
                        <Check className="w-3 h-3" /> Terminal PIN updated
                      </div>
                    )}
                    <button
                      type="submit"
                      className="w-full py-1.5 rounded-lg bg-[#0E382B] hover:bg-[#144737] text-[#F3DF95] font-semibold cursor-pointer transition-colors"
                    >
                      Update Staff PIN
                    </button>
                  </form>
                </div>
              )}
            </div>

            {/* D. Notifications Shortcut */}
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                onOpenNotifications();
              }}
              className="w-full px-3 py-2.5 rounded-xl flex items-center justify-between text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800/50 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <Bell className="w-4 h-4 text-[#B89320] dark:text-[#D4AF37]" />
                <span>Notifications</span>
              </div>
              {unreadCount > 0 && (
                <span className="font-mono text-[10px] font-bold text-rose-600 dark:text-rose-400">
                  {unreadCount} unread
                </span>
              )}
            </button>
          </div>

          {/* 4. Logout Footer */}
          <div className="p-2 border-t border-stone-200 dark:border-stone-800 bg-stone-50/70 dark:bg-stone-900/40">
            <button
              type="button"
              onClick={handleLogout}
              className="w-full px-3 py-2 rounded-xl flex items-center justify-between text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 font-semibold transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </div>
              <span className="text-[10px] text-stone-500 dark:text-stone-400 font-normal">
                End session
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
