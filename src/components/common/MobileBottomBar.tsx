import React from 'react';
import { useSangira } from '../../context/SangiraContext';
import {
  LayoutDashboard,
  ClipboardList,
  Building2,
  QrCode,
  Menu,
  UtensilsCrossed,
  ShoppingBag,
  Clock,
  Home,
  FileText,
  ChefHat,
  Wine,
  CreditCard,
  UserCheck,
  Search,
} from 'lucide-react';

interface MobileBottomBarProps {
  onOpenSidebar: () => void;
}

export const MobileBottomBar: React.FC<MobileBottomBarProps> = ({ onOpenSidebar }) => {
  const { role, activeTab, setActiveTab, cart, orders, tickets } = useSangira();

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const pendingOrdersCount = orders.filter((o) => o.status !== 'delivered' && o.status !== 'cancelled').length;
  const kitchenTicketsCount = tickets.filter((t) => t.department === 'kitchen' && t.status !== 'released_to_service').length;
  const barTicketsCount = tickets.filter((t) => t.department === 'bar' && t.status !== 'released_to_service').length;

  interface BottomNavItem {
    id: string;
    label: string;
    icon: React.ElementType;
    badge?: number;
    onClick?: () => void;
  }

  const getItems = (): BottomNavItem[] => {
    switch (role) {
      case 'CUSTOMER':
        return [
          {
            id: 'menu',
            label: 'Menu',
            icon: UtensilsCrossed,
            onClick: () => setActiveTab('menu'),
          },
          {
            id: 'cart',
            label: 'Cart',
            icon: ShoppingBag,
            badge: cartCount > 0 ? cartCount : undefined,
            onClick: () => setActiveTab('cart'),
          },
          {
            id: 'track',
            label: 'Track',
            icon: Clock,
            badge: orders.length > 0 ? orders.length : undefined,
            onClick: () => setActiveTab('track'),
          },
          {
            id: 'more',
            label: 'Explore',
            icon: Home,
            onClick: () => {
              window.scrollTo({ top: 0, behavior: 'smooth' });
            },
          },
        ];

      case 'HOTEL_MANAGER':
        return [
          {
            id: 'dashboard',
            label: 'Overview',
            icon: LayoutDashboard,
            onClick: () => setActiveTab('dashboard'),
          },
          {
            id: 'orders',
            label: 'Orders',
            icon: ClipboardList,
            badge: pendingOrdersCount > 0 ? pendingOrdersCount : undefined,
            onClick: () => setActiveTab('orders'),
          },
          {
            id: 'menu_catalog',
            label: 'Dishes',
            icon: UtensilsCrossed,
            onClick: () => setActiveTab('menu_catalog'),
          },
          {
            id: 'qr_codes',
            label: 'QR Link',
            icon: QrCode,
            onClick: () => setActiveTab('qr_codes'),
          },
          {
            id: 'drawer',
            label: 'Menu',
            icon: Menu,
            onClick: onOpenSidebar,
          },
        ];

      case 'KITCHEN_MANAGER':
      case 'KITCHEN_STAFF':
        return [
          {
            id: 'dashboard',
            label: 'KDS Queue',
            icon: ChefHat,
            badge: kitchenTicketsCount > 0 ? kitchenTicketsCount : undefined,
            onClick: () => setActiveTab('dashboard'),
          },
          {
            id: 'drawer',
            label: 'All Modules',
            icon: Menu,
            onClick: onOpenSidebar,
          },
        ];

      case 'BAR_MANAGER':
      case 'BARTENDER':
        return [
          {
            id: 'dashboard',
            label: 'Bar Queue',
            icon: Wine,
            badge: barTicketsCount > 0 ? barTicketsCount : undefined,
            onClick: () => setActiveTab('dashboard'),
          },
          {
            id: 'drawer',
            label: 'All Modules',
            icon: Menu,
            onClick: onOpenSidebar,
          },
        ];

      case 'CASHIER':
        return [
          {
            id: 'dashboard',
            label: 'Terminal',
            icon: CreditCard,
            onClick: () => setActiveTab('dashboard'),
          },
          {
            id: 'drawer',
            label: 'All Modules',
            icon: Menu,
            onClick: onOpenSidebar,
          },
        ];

      case 'SERVER':
        return [
          {
            id: 'dashboard',
            label: 'Floor Tables',
            icon: UserCheck,
            onClick: () => setActiveTab('dashboard'),
          },
          {
            id: 'drawer',
            label: 'All Modules',
            icon: Menu,
            onClick: onOpenSidebar,
          },
        ];

      case 'SYSTEM_ADMIN':
        return [
          {
            id: 'dashboard',
            label: 'Overview',
            icon: LayoutDashboard,
            onClick: () => setActiveTab('dashboard'),
          },
          {
            id: 'applications',
            label: 'Partners',
            icon: FileText,
            onClick: () => setActiveTab('applications'),
          },
          {
            id: 'businesses',
            label: 'Tenants',
            icon: Building2,
            onClick: () => setActiveTab('businesses'),
          },
          {
            id: 'drawer',
            label: 'All Modules',
            icon: Menu,
            onClick: onOpenSidebar,
          },
        ];

      case 'PUBLIC':
      default:
        return [
          {
            id: 'landing',
            label: 'Discover',
            icon: Home,
            onClick: () => setActiveTab('landing'),
          },
          {
            id: 'register',
            label: 'List Venue',
            icon: Building2,
            onClick: () => setActiveTab('register'),
          },
          {
            id: 'status',
            label: 'Status',
            icon: FileText,
            onClick: () => setActiveTab('status'),
          },
        ];
    }
  };

  const items = getItems();

  return (
    <nav
      className={`${role === 'CUSTOMER' ? 'fixed' : 'md:hidden fixed'} bottom-0 left-0 right-0 z-40 bg-[#FFFDF9]/95 dark:bg-[#0E1310]/95 backdrop-blur-md border-t border-[#D4AF37]/35 dark:border-[#D4AF37]/25 pb-[env(safe-area-inset-bottom,0px)] shadow-[0_-4px_20px_rgba(0,0,0,0.08)]`}
      aria-label="Bottom Navigation"
    >
      <div className="flex items-center justify-around h-14 px-1 max-w-lg mx-auto">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={item.onClick}
              className={`relative flex-1 flex flex-col items-center justify-center min-h-[44px] py-1 transition-all cursor-pointer rounded-lg ${
                isActive
                  ? 'text-[#0E382B] dark:text-[#D4AF37] font-semibold'
                  : 'text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110 text-[#0E382B] dark:text-[#D4AF37]' : ''}`} />
                {item.badge !== undefined && (
                  <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 px-1 rounded-full bg-[#0E382B] dark:bg-[#D4AF37] text-[#FAF6EB] dark:text-stone-950 text-[10px] font-bold flex items-center justify-center shadow-xs">
                    {item.badge}
                  </span>
                )}
                {/* Live pulsing radar beacon on Track button when orders are active in kitchen/bar */}
                {item.id === 'track' && pendingOrdersCount > 0 && (
                  <span className="absolute -top-1 -left-1.5 flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-90"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 border border-white dark:border-stone-900"></span>
                  </span>
                )}
              </div>
              <span className={`text-[10px] mt-0.5 tracking-tight truncate max-w-[64px] ${isActive ? 'font-bold' : 'font-normal'}`}>
                {item.label}
              </span>
              {isActive && (
                <span className="w-1 h-1 rounded-full bg-[#D4AF37] mt-0.5" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
