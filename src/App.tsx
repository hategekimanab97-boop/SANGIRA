import React, { useState, lazy, Suspense } from 'react';
import { SangiraProvider, useSangira } from './context/SangiraContext';
import { LanguageProvider } from './context/LanguageContext';
import { RoleSwitcherBar } from './components/common/RoleSwitcherBar';
import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';
import { MobileBottomBar } from './components/common/MobileBottomBar';
import { IntegrationAlertBanner } from './components/common/IntegrationAlertBanner';
import { StaffAuthGate } from './components/common/StaffAuthGate';

// Code-split portals via React.lazy for instant initial page loads and high performance
const LandingView = lazy(() =>
  import('./components/portals/public/LandingView').then((m) => ({ default: m.LandingView }))
);
const BusinessRegisterWizard = lazy(() =>
  import('./components/portals/public/BusinessRegisterWizard').then((m) => ({ default: m.BusinessRegisterWizard }))
);
const ApplicationStatusView = lazy(() =>
  import('./components/portals/public/ApplicationStatusView').then((m) => ({ default: m.ApplicationStatusView }))
);
const AdminDashboardView = lazy(() =>
  import('./components/portals/admin/AdminDashboardView').then((m) => ({ default: m.AdminDashboardView }))
);
const ManagerDashboardView = lazy(() =>
  import('./components/portals/manager/ManagerDashboardView').then((m) => ({ default: m.ManagerDashboardView }))
);
const OrdersListView = lazy(() =>
  import('./components/portals/manager/OrdersListView').then((m) => ({ default: m.OrdersListView }))
);
const DepartmentsView = lazy(() =>
  import('./components/portals/manager/DepartmentsView').then((m) => ({ default: m.DepartmentsView }))
);
const StaffShiftsView = lazy(() =>
  import('./components/portals/manager/StaffShiftsView').then((m) => ({ default: m.StaffShiftsView }))
);
const QRCodeGeneratorView = lazy(() =>
  import('./components/portals/manager/QRCodeGeneratorView').then((m) => ({ default: m.QRCodeGeneratorView }))
);
const BusinessSettingsView = lazy(() =>
  import('./components/portals/manager/BusinessSettingsView').then((m) => ({ default: m.BusinessSettingsView }))
);
const HotelOperationsView = lazy(() =>
  import('./components/portals/manager/HotelOperationsView').then((m) => ({ default: m.HotelOperationsView }))
);
const MenuManagementView = lazy(() =>
  import('./components/portals/manager/MenuManagementView').then((m) => ({ default: m.MenuManagementView }))
);
const KitchenKdsView = lazy(() =>
  import('./components/portals/kitchen/KitchenKdsView').then((m) => ({ default: m.KitchenKdsView }))
);
const BarKdsView = lazy(() =>
  import('./components/portals/bar/BarKdsView').then((m) => ({ default: m.BarKdsView }))
);
const StockInventoryView = lazy(() =>
  import('./components/portals/stock/StockInventoryView').then((m) => ({ default: m.StockInventoryView }))
);
const CashierTerminalView = lazy(() =>
  import('./components/portals/cashier/CashierTerminalView').then((m) => ({ default: m.CashierTerminalView }))
);
const ServerFloorView = lazy(() =>
  import('./components/portals/server/ServerFloorView').then((m) => ({ default: m.ServerFloorView }))
);
const CustomerOrderingView = lazy(() =>
  import('./components/portals/customer/CustomerOrderingView').then((m) => ({ default: m.CustomerOrderingView }))
);

const ViewLoadingFallback: React.FC = () => (
  <div className="flex-1 min-h-[50vh] flex flex-col items-center justify-center p-8">
    <div className="relative w-12 h-12">
      <div className="w-12 h-12 rounded-full border-2 border-stone-200 dark:border-stone-800 border-t-[#0E382B] dark:border-t-[#D4AF37] animate-spin" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-2.5 h-2.5 rounded-full bg-[#D4AF37] animate-ping" />
      </div>
    </div>
    <p className="mt-4 text-xs font-semibold text-stone-500 dark:text-stone-400 tracking-wider uppercase">
      Loading Sangira...
    </p>
  </div>
);

const AppContent: React.FC = () => {
  const {
    role,
    activeTab,
    staffSession,
    integrationStatus,
    preKeyPreviewMode,
    isAuthModalOpen,
  } = useSangira();
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 1024;
    }
    return true;
  });

  // Render Portal by Role with Suspense
  const renderPortal = () => {
    switch (role) {
      case 'PUBLIC':
        if (activeTab === 'register') return <BusinessRegisterWizard />;
        if (activeTab === 'status') return <ApplicationStatusView />;
        return <LandingView />;

      case 'CUSTOMER':
        return <CustomerOrderingView />;

      case 'SYSTEM_ADMIN':
        return <AdminDashboardView />;

      case 'HOTEL_MANAGER':
        if (activeTab === 'orders') return <OrdersListView />;
        if (activeTab === 'menu_catalog') return <MenuManagementView />;
        if (activeTab === 'departments') return <DepartmentsView />;
        if (activeTab === 'staff') return <StaffShiftsView />;
        if (activeTab === 'qr_codes') return <QRCodeGeneratorView />;
        if (activeTab === 'settings') return <BusinessSettingsView />;
        if (activeTab === 'hotel_ops') return <HotelOperationsView />;
        return <ManagerDashboardView />;

      case 'KITCHEN_MANAGER':
      case 'KITCHEN_STAFF':
        if (activeTab === 'menu_catalog') return <MenuManagementView />;
        return <KitchenKdsView />;

      case 'BAR_MANAGER':
      case 'BARTENDER':
        return <BarKdsView />;

      case 'STOCK_MANAGER':
        return <StockInventoryView />;

      case 'CASHIER':
        return <CashierTerminalView />;

      case 'SERVER':
        return <ServerFloorView />;

      default:
        return <LandingView />;
    }
  };

  const isPublicOrCustomer = role === 'PUBLIC' || role === 'CUSTOMER';
  const betterAuthConfigured = integrationStatus?.services.betterAuth.configured ?? false;
  const canAccessStaffPortal =
    staffSession.authenticated || (!betterAuthConfigured && preKeyPreviewMode);

  const showStaffAuthGate = isAuthModalOpen || (!isPublicOrCustomer && !canAccessStaffPortal);

  return (
    <div className="min-h-dvh bg-[#FAF6EB] dark:bg-[#0A0E0C] text-stone-900 dark:text-stone-100 flex flex-col font-sans overflow-x-clip">
      {/* Workspace & Session Top Bar */}
      <RoleSwitcherBar />

      {showStaffAuthGate ? (
        <StaffAuthGate />
      ) : !isPublicOrCustomer ? (
        <div className="flex-1 flex flex-col min-w-0">
          <Header
            isSidebarOpen={sidebarOpen}
            onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
          />
          <div className="flex-1 flex relative min-w-0">
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            <div className="flex-1 min-w-0 flex flex-col">
              <IntegrationAlertBanner />
              <main className="flex-1 min-w-0 pb-20 md:pb-4">
                <Suspense fallback={<ViewLoadingFallback />}>
                  {renderPortal()}
                </Suspense>
              </main>
            </div>
          </div>
          {/* Mobile Bottom Navigation Bar for authenticated staff & managers */}
          <MobileBottomBar onOpenSidebar={() => setSidebarOpen(true)} />
        </div>
      ) : (
        /* Public or Customer View (full-width experience with responsive mobile bottom bar) */
        <div className="flex-1 flex flex-col min-w-0">
          <main className="flex-1 min-w-0 pb-20 md:pb-0">
            <Suspense fallback={<ViewLoadingFallback />}>
              {renderPortal()}
            </Suspense>
          </main>
          <MobileBottomBar onOpenSidebar={() => setSidebarOpen(true)} />
        </div>
      )}
    </div>
  );
};

export default function App() {
  return (
    <SangiraProvider>
      <LanguageProvider>
        <AppContent />
      </LanguageProvider>
    </SangiraProvider>
  );
}
