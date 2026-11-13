import React from 'react';
import { useSangira } from '../../context/SangiraContext';
import {
  LayoutDashboard,
  FileText,
  Building2,
  Users,
  QrCode,
  Settings,
  ChefHat,
  Wine,
  Package,
  History,
  CreditCard,
  UserCheck,
  Clock,
  BedDouble,
  BookOpen,
  ClipboardList,
  Sparkles,
  ShoppingBag,
  Home,
  CheckCircle2,
  ChevronLeft,
  X,
  UtensilsCrossed,
} from 'lucide-react';

interface SidebarItem {
  id: string;
  label: string;
  icon: React.ElementType;
  badge?: number;
}

export const Sidebar: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const {
    role,
    activeTab,
    setActiveTab,
    activeBusiness,
    applications,
    tickets,
    payments,
    stockRequests,
    cart,
  } = useSangira();

  const getNavItems = (): SidebarItem[] => {
    switch (role) {
      case 'SYSTEM_ADMIN':
        return [
          { id: 'dashboard', label: 'Platform Overview', icon: LayoutDashboard },
          {
            id: 'applications',
            label: 'Business Applications',
            icon: FileText,
            badge: applications.filter((a) => a.status === 'pending').length,
          },
          { id: 'businesses', label: 'Registered Tenants', icon: Building2 },
          { id: 'audit_logs', label: 'Platform Audit Log', icon: History },
        ];

      case 'HOTEL_MANAGER': {
        const items: SidebarItem[] = [
          { id: 'dashboard', label: 'Executive Overview', icon: LayoutDashboard },
          { id: 'orders', label: 'Live Orders', icon: ClipboardList },
          { id: 'menu_catalog', label: 'Digital Menu & Dishes', icon: UtensilsCrossed },
          { id: 'departments', label: 'Departments', icon: Building2 },
          { id: 'staff', label: 'Staff & Shifts', icon: Users },
          { id: 'qr_codes', label: 'Digital Menu QR Code', icon: QrCode },
          { id: 'settings', label: 'Business Settings', icon: Settings },
        ];
        // Conditional Hotel Accommodations module
        if (activeBusiness.hasHotelModule) {
          items.push({ id: 'hotel_ops', label: 'Hotel Accommodations', icon: BedDouble });
        }
        return items;
      }

      case 'KITCHEN_MANAGER':
      case 'KITCHEN_STAFF':
        return [
          {
            id: 'dashboard',
            label: 'Kitchen KDS Queue',
            icon: ChefHat,
            badge: tickets.filter((t) => t.department === 'kitchen' && t.status !== 'released_to_service').length,
          },
          { id: 'menu_catalog', label: 'Dish & Photo Catalog', icon: UtensilsCrossed },
          { id: 'staff_view', label: 'Chef Prep Station', icon: ClipboardList },
          { id: 'stock_req', label: 'Stock Requisitions', icon: Package },
          { id: 'recipes', label: 'Recipe Book', icon: BookOpen },
        ];

      case 'BAR_MANAGER':
      case 'BARTENDER':
        return [
          {
            id: 'dashboard',
            label: 'Bar Drink Queue',
            icon: Wine,
            badge: tickets.filter((t) => t.department === 'bar' && t.status !== 'released_to_service').length,
          },
          { id: 'bartender_view', label: 'Bartender Station', icon: Sparkles },
          { id: 'stock_req', label: 'Bar Supplies Request', icon: Package },
          { id: 'recipes', label: 'Cocktail Recipes', icon: BookOpen },
        ];

      case 'STOCK_MANAGER':
        return [
          { id: 'dashboard', label: 'Central Inventory', icon: Package },
          {
            id: 'requests',
            label: 'Department Requisitions',
            icon: ClipboardList,
            badge: stockRequests.filter((r) => r.status === 'pending').length,
          },
          { id: 'movements', label: 'Stock Movement Ledger', icon: History },
        ];

      case 'CASHIER':
        return [
          {
            id: 'dashboard',
            label: 'Payment Terminal',
            icon: CreditCard,
            badge: payments.filter((p) => p.status === 'pending').length,
          },
          { id: 'closing', label: 'Register Closing & Reconciliation', icon: Clock },
        ];

      case 'SERVER':
        return [
          { id: 'dashboard', label: 'Floor Service & Ready Orders', icon: UserCheck },
          { id: 'shifts', label: 'Shift Clock In / Out', icon: Clock },
        ];

      case 'CUSTOMER':
        return [
          { id: 'menu', label: 'Digital Menu', icon: BookOpen },
          { id: 'cart', label: 'My Cart', icon: ShoppingBag, badge: cart.length > 0 ? cart.length : undefined },
          { id: 'track', label: 'Order Progress', icon: CheckCircle2 },
        ];

      case 'PUBLIC':
      default:
        return [
          { id: 'landing', label: 'Sangira Home', icon: Home },
          { id: 'register', label: 'Register Your Business', icon: Building2 },
          { id: 'status', label: 'Check Application Status', icon: FileText },
        ];
    }
  };

  const navItems = getNavItems();

  return (
    <>
      {/* Mobile backdrop overlay with blur */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-50 bg-black/60 md:hidden backdrop-blur-xs transition-opacity duration-300"
          aria-hidden="true"
        />
      )}

      {/* Responsive Sidebar Drawer: Slide-over drawer on mobile (<md), sticky collapsible sidebar on tablet/desktop (md+) */}
      <aside
        className={`fixed md:sticky md:top-[54px] inset-y-0 left-0 z-50 md:z-30 h-dvh md:h-[calc(100dvh-54px)] bg-[#FFFDF9] dark:bg-[#0E1310] border-r border-[#D4AF37]/30 dark:border-[#D4AF37]/20 transition-all duration-300 ease-in-out flex flex-col shrink-0 ${
          isOpen
            ? 'w-72 max-w-[85vw] md:w-60 lg:w-64 translate-x-0 opacity-100 shadow-2xl md:shadow-none'
            : '-translate-x-full md:translate-x-0 md:w-0 overflow-hidden border-r-0 opacity-0 pointer-events-none'
        }`}
      >
        {/* Workspace Brand Summary with slide collapse button */}
        <div className="p-3.5 border-b border-[#D4AF37]/25 dark:border-[#D4AF37]/20 flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="text-[10px] font-bold text-[#B89320] dark:text-[#D4AF37] uppercase tracking-wider">
              {role === 'SYSTEM_ADMIN' ? 'Platform Governance' : 'Workspace'}
            </div>
            <div className="font-bold text-sm text-stone-900 dark:text-stone-100 truncate mt-0.5">
              {role === 'SYSTEM_ADMIN' ? 'Sangira Superadmin' : activeBusiness.name}
            </div>
            <div className="text-[11px] text-stone-500 dark:text-stone-400 capitalize mt-0.5 truncate">
              {role === 'SYSTEM_ADMIN' ? 'All Tenants' : `${activeBusiness.type} · ${activeBusiness.currency}`}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-[#FAF6EB] dark:hover:bg-stone-800 transition-colors cursor-pointer shrink-0"
            title="Slide hide menu bar"
            aria-label="Slide hide menu bar"
          >
            <span className="hidden md:inline"><ChevronLeft className="w-4 h-4 text-[#D4AF37]" /></span>
            <span className="md:hidden"><X className="w-5 h-5 text-[#D4AF37]" /></span>
          </button>
        </div>

        {/* Navigation list with touch-friendly 44px min height */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1.5 pb-20 md:pb-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  if (typeof window !== 'undefined' && window.innerWidth < 768) {
                    onClose();
                  }
                }}
                className={`w-full min-h-[44px] flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#0E382B] text-[#F3DF95] border-l-2 border-[#D4AF37] shadow-xs'
                    : 'text-stone-700 dark:text-stone-300 hover:bg-[#FAF6EB] dark:hover:bg-stone-800/70'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#D4AF37]' : 'text-stone-500 dark:text-stone-400'}`} />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-semibold ${
                      isActive
                        ? 'bg-[#D4AF37] text-stone-950 font-bold'
                        : 'bg-[#D4AF37]/20 text-[#8B6E15] dark:text-[#E6C665] border border-[#D4AF37]/30'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer info */}
        <div className="p-3 border-t border-stone-200 dark:border-stone-800 text-[11px] text-stone-500 dark:text-stone-400">
          <div className="flex items-center justify-between">
            <span>Sangira v2.4</span>
            <span className="font-mono text-emerald-700 dark:text-emerald-400">Active</span>
          </div>
        </div>
      </aside>
    </>
  );
};
