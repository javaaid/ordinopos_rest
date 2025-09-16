import React, { useEffect, useMemo, useCallback, useState, useRef } from 'react';
import MenuGrid from './components/MenuGrid';
import OrderSummary from './components/OrderSummary';
import DeliveryView from './components/DeliveryView';
import PermissionDenied from './components/PermissionDenied';
import { LoginPage } from './components/LoginPage';
import LandingPage from './components/LandingPage';
import OrderHistoryView from './components/OrderHistoryView';
import ToastContainer from './components/ToastContainer';
import SidebarLayout from './components/SidebarLayout';
import { MainSidebar } from './components/MainSidebar';
import CategoryTabs from './components/CategoryTabs';
import TableServicesView from './components/TableServicesView';
import { View, ManagementSubView, SettingsSubView, Order, Table, Location, Role, Category } from './types';
import POSHeader from './components/POSHeader';
import POSSubHeader from './components/POSSubHeader';
import { useAppContext } from './contexts/AppContext';
import ModalManager from './components/ModalManager';
import { cn } from './lib/utils';
import PrintQueueMonitor from './components/PrintQueueMonitor';
import { useTranslations } from './hooks/useTranslations';
import ActiveTablesBar from './components/ActiveTablesBar';

// Management Sub-Views (Dynamically imported or directly used)
import ProductsView from './components/ProductsView';
import CategoryManagementTab from './components/CategoryManagementTab';
import ModifierManagementTab from './components/ModifierManagementTab';
import PromotionsView from './components/PromotionsView';
import PizzaBuilderSettingsView from './components/PizzaBuilderSettingsView';
import BurgerBuilderSettingsView from './components/BurgerBuilderSettingsView';
import KitchenNoteManagementTab from './components/KitchenNoteManagementTab';
import VoidReasonManagementTab from './components/VoidReasonManagementTab';
import DiscountManagementTab from './components/DiscountManagementTab';
import SurchargeManagementTab from './components/SurchargeManagementTab';
import GratuityManagementTab from './components/GratuityManagementTab';
import DineInSettingsView from './components/DineInSettingsView';
import DeliverySettingsView from './components/DeliverySettingsView';
import TakeAwaySettingsView from './components/TakeAwaySettingsView';
import TabSettingsView from './components/TabSettingsView';
import QRCodeOrderingSettingsView from './components/QRCodeOrderingSettingsView';
import LoyaltySettingsView from './components/LoyaltySettingsView';
import CustomersView from './components/CustomersView';
import SuppliersView from './components/SuppliersView';
import UserManagementView from './components/UserManagementView';
import RoleManagementView from './components/RoleManagementView';
import PurchaseOrdersView from './components/PurchaseOrdersView';
import IngredientsView from './components/IngredientsView';
import { ReportsView } from './components/ReportsView';
import EmailReportingView from './components/EmailReportingView';
import AccountingView from './components/AccountingView';
import LocationSettings from './components/LocationSettings';
import TaxRatesView from './components/TaxRatesView';
import PaymentTypesView from './components/PaymentTypesView';
import CallLogView from './components/CallLogView';
import PluginsView from './components/PluginsView';
import DigitalSignageView from './components/DigitalSignageView';

// Settings Sub-Views
import IntegrationsSettings from './components/IntegrationsSettings';
import CustomizationSettings from './components/CustomizationSettings';
import FontSettingsView from './components/FontSettingsView';
import NumberingSettingsView from './components/NumberingSettingsView';
import PreferencesSettingsView from './components/PreferencesSettingsView';
// FIX: Changed to a named import to resolve module resolution error.
import { AdvancedPOSSettingsView } from './components/AdvancedPOSSettingsView';
import DeviceSettingsView from './components/DeviceSettingsView';
import PrintersView from './components/PrintersView';
import ZatcaSettingsView from './components/ZatcaSettingsView';
import AISettingsComponent from './components/AISettings';
import UserActivityReport from './components/UserActivityReport';
import AdvancedSettings from './components/AdvancedSettings';
import TimeClockView from './components/TimeClockView';
import QRCodeOrderingView from './components/QRCodeOrderingView';
import DashboardView from './components/DashboardView';
import { KDSModal } from './components/KDSView';
import { CFDModal } from './components/CFDView';
import { KioskModal } from './components/KIOSKView';
import { NumberDisplayModal } from './components/OrderNumberDisplayView';

const App: React.FC = () => {
  const { 
    activeView, setView, managementSubView, setManagementSubView, settingsSubView, setSettingsSubView,
    currentEmployee, settings, theme,
    roles,
    toasts, dismissToast,
    openModal,
    setCurrentTable,
    isSidebarCollapsed
  } = useAppContext();

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    const handleHashChange = () => {
        const hash = window.location.hash.replace(/^#\/?/, '');
        const validViews: View[] = ['kds', 'cfd', 'kiosk', 'order_number_display', 'qr_ordering', 'landing', 'pos', 'dashboard', 'tables', 'history', 'timeclock', 'management', 'settings'];
        
        if (hash && validViews.includes(hash as View)) {
            setView(hash as View);
        } else if (!hash) {
            if (!currentEmployee) {
                setView('landing');
            } else {
                setView('dashboard');
            }
        }
    };

    window.addEventListener('hashchange', handleHashChange, false);
    handleHashChange();

    return () => window.removeEventListener('hashchange', handleHashChange, false);
}, [setView, currentEmployee]);
  
  if (!settings) {
    return null; // or a loading spinner
  }
  const t = useTranslations(settings.language.staff);
  
  const currentRole = useMemo(() => {
    if (!currentEmployee) return null;
    return (roles || []).find((r: Role) => r.id === currentEmployee.roleId);
  }, [currentEmployee, roles]);
  
  const permissions = currentRole?.permissions;
  
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };
    document.addEventListener('contextmenu', handleContextMenu);
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
    };
  }, []);
  
  useEffect(() => {
    const dir = settings.language.staff === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.dir = dir;
    document.documentElement.lang = settings.language.staff;
  }, [settings.language.staff]);

  useEffect(() => {
    if (settings.fontSettings) {
        const root = document.documentElement;
        root.style.setProperty('--font-size-base', `${settings.fontSettings.baseSize}px`);
        root.style.setProperty('--font-size-menu-item-name', `${settings.fontSettings.menuItemName}px`);
        root.style.setProperty('--font-size-menu-item-price', `${settings.fontSettings.menuItemPrice}px`);
        root.style.setProperty('--font-size-order-summary-item', `${settings.fontSettings.orderSummaryItem}px`);
        root.style.setProperty('--font-size-order-summary-total', `${settings.fontSettings.orderSummaryTotal}px`);
        root.style.setProperty('--font-size-category-tabs', `${settings.fontSettings.categoryTabs}px`);
    }
  }, [settings.fontSettings]);

  const handleSelectTableFromBar = (table: Table) => {
    setCurrentTable(table);
    setView('pos');
  };
  
  const standaloneViews: View[] = ['kds', 'cfd', 'kiosk', 'order_number_display'];
  if (standaloneViews.includes(activeView)) {
      const handleCloseWindow = () => window.close();

      switch (activeView) {
          case 'kds': return <KDSModal isOpen={true} onClose={handleCloseWindow} />;
          case 'cfd': return <CFDModal isOpen={true} onClose={handleCloseWindow} />;
          case 'kiosk': return <KioskModal isOpen={true} onClose={handleCloseWindow} />;
          case 'order_number_display': return <NumberDisplayModal isOpen={true} onClose={handleCloseWindow} />;
          default: return null;
      }
  }

  const publicViews: View[] = ['qr_ordering'];
  if (!currentEmployee) {
    if (activeView === 'landing') {
      return <LandingPage />;
    }
    if (publicViews.includes(activeView)) {
        switch(activeView) {
            case 'qr_ordering': return <QRCodeOrderingView />;
            default: return <PermissionDenied />;
        }
    }
    return <LoginPage settings={settings} />;
  }

  const renderActiveView = () => {
    if (!permissions) return <PermissionDenied />;

    const renderManagementSubView = () => {
      switch(managementSubView) {
          case 'menu_products': return permissions.canPerformManagerFunctions ? <ProductsView /> : <PermissionDenied />;
          case 'menu_categories': return permissions.canPerformManagerFunctions ? <div className="p-6 h-full"><CategoryManagementTab /></div> : <PermissionDenied />;
          case 'menu_modifiers': return permissions.canPerformManagerFunctions ? <div className="h-full"><ModifierManagementTab /></div> : <PermissionDenied />;
          case 'menu_promotions': return permissions.canPerformManagerFunctions ? <PromotionsView /> : <PermissionDenied />;
          case 'menu_pizza_builder': return permissions.canPerformManagerFunctions ? <PizzaBuilderSettingsView /> : <PermissionDenied />;
          case 'menu_burger_builder': return permissions.canPerformManagerFunctions ? <BurgerBuilderSettingsView /> : <PermissionDenied />;
          case 'menu_kitchen_notes': return permissions.canPerformManagerFunctions ? <KitchenNoteManagementTab /> : <PermissionDenied />;
          case 'menu_void_reasons': return permissions.canPerformManagerFunctions ? <VoidReasonManagementTab /> : <PermissionDenied />;
          case 'menu_discounts': return permissions.canPerformManagerFunctions ? <DiscountManagementTab /> : <PermissionDenied />;
          case 'menu_surcharges': return permissions.canPerformManagerFunctions ? <SurchargeManagementTab /> : <PermissionDenied />;
          case 'menu_gratuity': return permissions.canPerformManagerFunctions ? <GratuityManagementTab /> : <PermissionDenied />;
          case 'dine_in_settings': return permissions.canPerformManagerFunctions ? <div className="p-6 h-full"><DineInSettingsView /></div> : <PermissionDenied />;
          case 'delivery_settings': return permissions.canPerformManagerFunctions ? <div className="p-6 h-full"><DeliverySettingsView /></div> : <PermissionDenied />;
          case 'take_away_settings': return permissions.canPerformManagerFunctions ? <div className="p-6 h-full"><TakeAwaySettingsView /></div> : <PermissionDenied />;
          case 'tab_settings': return permissions.canPerformManagerFunctions ? <div className="p-6 h-full"><TabSettingsView /></div> : <PermissionDenied />;
          case 'qr_ordering_settings': return permissions.canPerformManagerFunctions ? <div className="p-6 h-full"><QRCodeOrderingSettingsView /></div> : <PermissionDenied />;
          case 'loyalty': return permissions.canPerformManagerFunctions ? <LoyaltySettingsView /> : <PermissionDenied />;
          case 'customers': return permissions.viewCustomers ? <CustomersView /> : <PermissionDenied />;
          case 'suppliers': return permissions.viewPurchasing ? <SuppliersView /> : <PermissionDenied />;
          case 'users': return permissions.canManageUsersAndRoles ? <UserManagementView /> : <PermissionDenied />;
          case 'roles': return permissions.canManageUsersAndRoles ? <RoleManagementView /> : <PermissionDenied />;
          case 'purchasing': return permissions.viewPurchasing ? <PurchaseOrdersView /> : <PermissionDenied />;
          case 'ingredients': return permissions.viewPurchasing ? <IngredientsView /> : <PermissionDenied />;
          case 'reports': return permissions.viewReports ? <ReportsView /> : <PermissionDenied />;
          case 'email_reporting': return permissions.viewReports ? <EmailReportingView /> : <PermissionDenied />;
          case 'accounting': return permissions.canViewAllReports ? <AccountingView /> : <PermissionDenied />;
          case 'locations': return permissions.canManageUsersAndRoles ? <LocationSettings /> : <PermissionDenied />;
          case 'tax_rates': return permissions.canPerformManagerFunctions ? <TaxRatesView /> : <PermissionDenied />;
          case 'payment_types': return permissions.canPerformManagerFunctions ? <PaymentTypesView /> : <PermissionDenied />;
          case 'call_log': return permissions.viewCustomers ? <CallLogView /> : <PermissionDenied />;
          case 'plugins': return permissions.canPerformManagerFunctions ? <PluginsView /> : <PermissionDenied />;
          case 'signage': return permissions.canPerformManagerFunctions ? <DigitalSignageView /> : <PermissionDenied />;
          case 'advanced': return <AdvancedSettings />;
          default: return <PermissionDenied />;
      }
    };
      
    const renderSettingsSubView = () => {
        switch(settingsSubView) {
            case 'integrations': return <IntegrationsSettings />;
            case 'customization': return <CustomizationSettings />;
            case 'fonts': return <FontSettingsView />;
            case 'numbering': return permissions.canPerformManagerFunctions ? <div className="p-6 h-full"><NumberingSettingsView /></div> : <PermissionDenied />;
            case 'preferences_settings': return permissions.canPerformManagerFunctions ? <PreferencesSettingsView /> : <PermissionDenied />;
            case 'advanced_pos_settings': return permissions.canPerformManagerFunctions ? <AdvancedPOSSettingsView /> : <PermissionDenied />;
            case 'device_settings': return permissions.canPerformManagerFunctions ? <DeviceSettingsView /> : <PermissionDenied />;
            case 'printers': return permissions.canPerformManagerFunctions ? <PrintersView /> : <PermissionDenied />;
            case 'zatca': return <ZatcaSettingsView />;
            case 'ai': return <AISettingsComponent />;
            case 'activity': return <UserActivityReport />;
            default: return null;
        }
    };

    switch(activeView) {
      case 'pos': return permissions.viewPOS ? (
        <div className="flex flex-row gap-2 p-2 h-screen overflow-hidden">
            <main className="flex-1 flex flex-col gap-2 overflow-hidden">
                <div className="flex-shrink-0">
                    <POSHeader />
                </div>
                <POSSubHeader />
                <div className="flex-shrink-0 px-1.5">
                    <CategoryTabs />
                </div>
                <div className="flex-grow overflow-y-auto pe-1.5 ps-1.5">
                    <MenuGrid />
                </div>
                <div className="flex-shrink-0 mt-2 px-1.5">
                    <ActiveTablesBar onSelectTable={handleSelectTableFromBar} />
                </div>
            </main>
            <aside className={cn("shrink-0 transition-all duration-300", isSidebarCollapsed ? 'w-[420px]' : 'w-[420px]')}>
                <OrderSummary />
            </aside>
        </div>
      ) : <PermissionDenied />;
      case 'delivery': return permissions.viewDelivery ? <DeliveryView /> : <PermissionDenied />;
      case 'history': return permissions.viewHistory ? <OrderHistoryView /> : <PermissionDenied />;
      case 'tables': return permissions.viewFloorPlan ? <TableServicesView /> : <PermissionDenied />;
      case 'timeclock': return permissions.viewTimeClock ? <TimeClockView /> : <PermissionDenied />;
      case 'management': return <SidebarLayout title={t('management')} activeItem={managementSubView} onNavItemClick={(id) => setManagementSubView(id as ManagementSubView)}>{renderManagementSubView()}</SidebarLayout>;
      case 'settings': return permissions.viewSettings ? <SidebarLayout title={t('settings')} activeItem={settingsSubView} onNavItemClick={(id) => setSettingsSubView(id as SettingsSubView)}>{renderSettingsSubView()}</SidebarLayout> : <PermissionDenied />;
      case 'dashboard': return permissions.viewDashboard ? <DashboardView /> : <PermissionDenied />;
      default: return <PermissionDenied />;
    }
  };

  const showSidebar = !!currentEmployee && !publicViews.includes(activeView);
  const showPrintMonitor = !!currentEmployee && !publicViews.includes(activeView);
  
  return (
      <div className="flex bg-background text-foreground">
          {showSidebar && (
            <aside className="sticky top-0 h-screen">
              <MainSidebar />
            </aside>
          )}
          <div className="flex-grow w-full min-w-0">
              {renderActiveView()}
          </div>
          
          <ModalManager />
          {showPrintMonitor && <PrintQueueMonitor />}
          <ToastContainer notifications={toasts} onDismiss={dismissToast}/>
      </div>
  );
}
export default App;
