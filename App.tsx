import React, { useEffect, useMemo, useCallback, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import MenuGrid from './components/MenuGrid';
import OrderSummary from './components/OrderSummary';
import KDSView from './components/KDSView';
import DeliveryView from './components/DeliveryView';
import ReportsView from './components/ReportsView';
import CustomersView from './components/CustomersView';
import PermissionDenied from './components/PermissionDenied';
import CFDView from './components/CFDView';
import KIOSKView from './components/KIOSKView';
import SessionTimeoutWarningModal from './components/SessionTimeoutWarningModal';
import NotificationsPanel from './components/NotificationsPanel';
import { LoginPage } from './components/LoginPage';
import OrderHistoryView from './components/OrderHistoryView';
import ToastContainer from './components/ToastContainer';
import PurchaseOrdersView from './components/PurchaseOrdersView';
import DashboardView from './components/DashboardView';
import UserManagementView from './components/UserManagementView';
import RoleManagementView from './components/RoleManagementView';
import EmailReportingView from './components/EmailReportingView';
import PluginsView from './components/PluginsView';
import TimeClockView from './components/TimeClockView';
import SidebarLayout from './components/SidebarLayout';
import IntegrationsSettings from './components/IntegrationsSettings';
import CustomizationSettings from './components/CustomizationSettings';
import AdvancedSettings from './components/AdvancedSettings';
import AISettingsComponent from './components/AISettings';
import UserActivityReport from './components/UserActivityReport';
import LocationSettings from './components/LocationSettings';
import DigitalSignageView from './components/DigitalSignageView';
import { MainSidebar } from './components/MainSidebar';
import ActiveTablesBar from './components/ActiveTablesBar';
import CategoryTabs from './components/CategoryTabs';
import TableServicesView from './components/TableServicesView';
import TaxRatesView from './components/TaxRatesView';
import PaymentTypesView from './components/PaymentTypesView';
import SuppliersView from './components/SuppliersView';
import AccountingView from './components/AccountingView';
import ReservationsView from './components/ReservationsView';
import ZatcaSettingsView from './components/ZatcaSettingsView';
import { View, ManagementSubView, SettingsSubView, AppSettings, Order, Table, AISettings, AppPlugin, Location, Language, Role, CartItem, Category, PrintJob } from './types';
import { LOCATIONS } from './constants';
import WaitlistView from './components/WaitlistView';
import QRCodeOrderingView from './components/QRCodeOrderingView';
import POSHeader from './components/POSHeader';
import { useAppContext, useDataContext, useModalContext, usePOSContext, useToastContext } from './contexts/AppContext';
import { calculateOrderTotals, getPriceForItem } from './utils/calculations';
import ModalManager from './components/ModalManager';
import { hexToHsl, cn } from './lib/utils';
import IngredientsView from './components/IngredientsView';
import DineInSettingsView from './components/DineInSettingsView';
import DeliverySettingsView from './components/DeliverySettingsView';
import TakeAwaySettingsView from './components/TakeAwaySettingsView';
import TabSettingsView from './components/TabSettingsView';
import DeviceSettingsView from './components/DeviceSettingsView';
import AdvancedPOSSettingsView from './components/AdvancedPOSSettingsView';
import PreferencesSettingsView from './components/PreferencesSettingsView';
import CategoryManagementTab from './components/CategoryManagementTab';
import ModifierManagementTab from './components/ModifierManagementTab';
import PromotionsView from './components/PromotionsView';
import KitchenNoteManagementTab from './components/KitchenNoteManagementTab';
import VoidReasonManagementTab from './components/VoidReasonManagementTab';
import DiscountManagementTab from './components/DiscountManagementTab';
import GratuityManagementTab from './components/GratuityManagementTab';
import SurchargeManagementTab from './components/SurchargeManagementTab';
import NumberingSettingsView from './components/NumberingSettingsView';
import ProductsView from './components/ProductsView';
import OrderNumberDisplayView from './components/OrderNumberDisplayView';
import PizzaBuilderSettingsView from './components/PizzaBuilderSettingsView';
import LandingPage from './components/LandingPage';
import QRCode from "react-qr-code";
import CallLogView from './components/CallLogView';
import ChatBubbleOvalLeftEllipsisIcon from './components/icons/ChatBubbleOvalLeftEllipsisIcon';
import PrintQueueMonitor from './components/PrintQueueMonitor';
import { useTranslations } from './hooks/useTranslations';
import ChevronDoubleLeftIcon from './components/icons/ChevronDoubleLeftIcon';
import ChevronDoubleRightIcon from './components/icons/ChevronDoubleRightIcon';
import PrintersView from './components/PrintersView';

const App: React.FC = () => {
  const { 
    activeView, setView, managementSubView, setManagementSubView, settingsSubView, setSettingsSubView,
    currentEmployee, settings, setSettings, 
    isFullscreen, currentLocation,
    isMultiStorePluginActive, isKsaPluginActive,
    isReservationPluginActive, isWaitlistPluginActive, isOrderNumberDisplayPluginActive,
    addPrintJobs, isSidebarHidden, onToggleSidebar
  } = useAppContext();

  const { roles, orders, tables, customers, categories, locations, employees, handleSaveCategory, handleDeleteCategory, onRequestRefund, onApproveRefund, onDenyRefund } = useDataContext();
  const { toasts, dismissToast } = useToastContext();
  const { openModal, closeModal } = useModalContext();
  const { setCurrentTable, onLoadOrder, onPrintA4 } = usePOSContext();
  
  if (!settings) {
    return null; // or a loading spinner
  }
  const t = useTranslations(settings.language.staff);

  const currentRole = useMemo(() => {
    if (!currentEmployee) return null;
    return roles.find((r: Role) => r.id === currentEmployee.roleId);
  }, [currentEmployee, roles]);
  
  const permissions = useMemo(() => {
    if (!currentRole) return null;
    
    const effectivePermissions = { ...currentRole.permissions };

    if (!isReservationPluginActive) {
        effectivePermissions.viewReservations = false;
    }
    if (!isWaitlistPluginActive) {
        effectivePermissions.viewWaitlist = false;
    }
    if (!isOrderNumberDisplayPluginActive) {
        effectivePermissions.viewOrderNumberDisplay = false;
    }
    
    return effectivePermissions;
  }, [currentRole, isReservationPluginActive, isWaitlistPluginActive, isOrderNumberDisplayPluginActive]);
  
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
    // Set language and direction for RTL support
    const dir = settings.language.staff === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.dir = dir;
    document.documentElement.lang = settings.language.staff;
  }, [settings.language.staff]);

  const handleSelectTableFromBar = (table: Table) => {
    setCurrentTable(table);
    setView('pos');
  };
  
  const handleEditCategory = (category: Category) => openModal('categoryEdit', {
      category,
      onSave: (cat: Category) => handleSaveCategory(cat, false)
  });

  const handleAddNewCategory = () => openModal('categoryEdit', {
      onSave: (cat: Category) => {
          const newCat = { ...cat, id: cat.id || cat.name.toLowerCase().replace(/\s+/g, '_') };
          handleSaveCategory(newCat, true);
      }
  });

  const onSendDigitalReceipt = (type: 'email' | 'sms', destination: string) => {
    // This is a placeholder for a real implementation
    console.log(`Simulating sending ${type} receipt to ${destination}`);
  };

  const handleViewReceipt = (order: Order) => {
    const locationForOrder = locations.find((l: Location) => l.id === order.locationId) || LOCATIONS.find(l => l.id === order.locationId) || LOCATIONS[0];
    openModal('receipt', { 
        order,
        location: locationForOrder,
        onSendDigitalReceipt,
        settings,
        isSaudiCompliancePluginActive: isKsaPluginActive,
        receiptSettings: settings.receipt,
        onPrintA4,
        language: settings.language.staff
    });
  };

  const handleInitiateRefund = (order: Order) => {
    const locationForOrder = locations.find((l: Location) => l.id === order.locationId) || LOCATIONS.find(l => l.id === order.locationId) || LOCATIONS[0];
     openModal('receipt', { 
        order,
        location: locationForOrder,
        onSendDigitalReceipt,
        settings,
        isSaudiCompliancePluginActive: isKsaPluginActive,
        receiptSettings: settings.receipt,
        onPrintA4,
        language: settings.language.staff
    });
  };
  
  const publicViews: View[] = ['kds', 'cfd', 'kiosk', 'qr_ordering', 'order_number_display', 'landing'];

  // Login check for non-public views
  if (!currentEmployee && !publicViews.includes(activeView)) {
      return <LoginPage settings={settings} />;
  }

  const renderActiveView = () => {
    // Render public views first, as they don't need permissions
    if (publicViews.includes(activeView)) {
        switch(activeView) {
            case 'landing': return <LandingPage />;
            case 'kds': return <KDSView />;
            case 'cfd': return <CFDView />;
            case 'kiosk': return <KIOSKView />;
            case 'qr_ordering': return <QRCodeOrderingView />;
            case 'order_number_display': return <OrderNumberDisplayView />;
            default: return <PermissionDenied />; // Should not happen if publicViews list is correct
        }
    }

    // For protected views, we must have a logged-in user with permissions.
    if (!permissions) return <PermissionDenied />;

    const renderManagementSubView = () => {
      const canManageMenu = permissions.canPerformManagerFunctions;
      switch(managementSubView) {
          case 'users': return permissions.canManageUsersAndRoles ? <UserManagementView /> : <PermissionDenied />;
          case 'roles': return permissions.canManageUsersAndRoles ? <RoleManagementView /> : <PermissionDenied />;
          case 'email_reporting': return permissions.viewReports ? <EmailReportingView /> : <PermissionDenied />;
          case 'tax_rates': return permissions.canPerformManagerFunctions ? <TaxRatesView /> : <PermissionDenied />;
          case 'payment_types': return permissions.canPerformManagerFunctions ? <PaymentTypesView /> : <PermissionDenied />;
          case 'customers': return permissions.viewCustomers ? <CustomersView /> : <PermissionDenied />;
          case 'suppliers': return permissions.viewPurchasing ? <SuppliersView /> : <PermissionDenied />;
          case 'plugins': return permissions.canPerformManagerFunctions ? <PluginsView /> : <PermissionDenied />;
          case 'purchasing': return permissions.viewPurchasing ? <PurchaseOrdersView /> : <PermissionDenied />;
          case 'reports': return permissions.viewReports ? <ReportsView /> : <PermissionDenied />;
          case 'locations': return permissions.canManageUsersAndRoles ? <LocationSettings /> : <PermissionDenied />;
          case 'accounting': return permissions.canViewAllReports ? <AccountingView /> : <PermissionDenied />;
          case 'ingredients': return permissions.viewPurchasing ? <IngredientsView /> : <PermissionDenied />;
          case 'signage': return permissions.canPerformManagerFunctions ? <DigitalSignageView /> : <PermissionDenied />;
          case 'dine_in_settings': return permissions.canPerformManagerFunctions ? <DineInSettingsView /> : <PermissionDenied />;
          case 'delivery_settings': return permissions.canPerformManagerFunctions ? <DeliverySettingsView /> : <PermissionDenied />;
          case 'take_away_settings': return permissions.canPerformManagerFunctions ? <TakeAwaySettingsView /> : <PermissionDenied />;
          case 'tab_settings': return permissions.canPerformManagerFunctions ? <TabSettingsView /> : <PermissionDenied />;
          case 'advanced_pos_settings': return permissions.canPerformManagerFunctions ? <AdvancedPOSSettingsView /> : <PermissionDenied />;
          case 'preferences_settings': return permissions.canPerformManagerFunctions ? <PreferencesSettingsView /> : <PermissionDenied />;
          case 'menu_products': return canManageMenu ? <ProductsView /> : <PermissionDenied />;
          case 'menu_categories': return canManageMenu ? <div className="p-6 h-full"><CategoryManagementTab categories={categories} onAddNew={handleAddNewCategory} onEdit={handleEditCategory} onDelete={handleDeleteCategory} /></div> : <PermissionDenied />;
          case 'menu_modifiers': return canManageMenu ? <div className="h-full"><ModifierManagementTab /></div> : <PermissionDenied />;
          case 'menu_promotions': return canManageMenu ? <PromotionsView /> : <PermissionDenied />;
          case 'menu_pizza_builder': return canManageMenu ? <PizzaBuilderSettingsView /> : <PermissionDenied />;
          case 'menu_kitchen_notes': return canManageMenu ? <KitchenNoteManagementTab /> : <PermissionDenied />;
          case 'menu_void_reasons': return canManageMenu ? <VoidReasonManagementTab /> : <PermissionDenied />;
          case 'menu_discounts': return canManageMenu ? <DiscountManagementTab /> : <PermissionDenied />;
          case 'menu_surcharges': return canManageMenu ? <SurchargeManagementTab /> : <PermissionDenied />;
          case 'menu_gratuity': return canManageMenu ? <GratuityManagementTab /> : <PermissionDenied />;
          case 'call_log': return permissions.viewCustomers ? <CallLogView /> : <PermissionDenied />;
          default: return <PermissionDenied />;
      }
    };
      
    const renderSettingsSubView = () => {
        switch(settingsSubView) {
            case 'integrations': return <IntegrationsSettings />;
            case 'customization': return <CustomizationSettings />;
            case 'advanced': return <AdvancedSettings />;
            case 'activity': return <UserActivityReport />;
            case 'zatca': return <ZatcaSettingsView />;
            case 'ai': return <AISettingsComponent />;
            case 'numbering': return permissions.canPerformManagerFunctions ? <NumberingSettingsView /> : <PermissionDenied />;
            case 'device_settings': return permissions.canPerformManagerFunctions ? <DeviceSettingsView /> : <PermissionDenied />;
            case 'printers': return permissions.canPerformManagerFunctions ? <PrintersView /> : <PermissionDenied />;
            default: return null;
        }
    };

    switch(activeView) {
      case 'pos': return permissions.viewPOS ? (
        <div className="flex flex-row gap-1 p-1 h-screen overflow-hidden">
            <main className="flex-1 flex flex-col gap-2 overflow-hidden">
                <div className="flex-shrink-0">
                    <POSHeader />
                </div>
                 <div className="flex-shrink-0">
                    <CategoryTabs />
                </div>
                <div className="flex-grow overflow-y-auto pr-1">
                    <MenuGrid />
                </div>
            </main>
            <aside className="w-[380px] shrink-0">
                <OrderSummary />
            </aside>
             <button 
                onClick={() => openModal('aiChat')} 
                title="Gem AI Assistant" 
                className="fixed bottom-4 right-[calc(380px+0.5rem+1.5rem)] bg-primary text-primary-foreground p-3 rounded-full shadow-lg hover:bg-primary/90 transition-all duration-300 hover:scale-110 z-30 animate-fade-in-up"
              >
               <ChatBubbleOvalLeftEllipsisIcon className="w-6 h-6"/>
             </button>
        </div>
      ) : <PermissionDenied />;
      case 'delivery': return permissions.viewDelivery ? <DeliveryView /> : <PermissionDenied />;
      case 'history': return permissions.viewHistory ? <OrderHistoryView 
          orders={orders}
          onRequestRefund={onRequestRefund}
          onApproveRefund={onApproveRefund}
          onDenyRefund={onDenyRefund}
          currentEmployee={currentEmployee}
          currentRole={currentRole}
          onLoadOrder={onLoadOrder}
          onPrintA4={onPrintA4}
          onInitiateRefund={handleInitiateRefund}
          onViewReceipt={handleViewReceipt}
        /> : <PermissionDenied />;
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
  
  const backOfficeViews: View[] = ['management', 'settings', 'dashboard', 'history'];
  const isBackOffice = backOfficeViews.includes(activeView);

  return (
      <div className="flex bg-background text-foreground">
          {showSidebar && !isSidebarHidden && (
            <aside className="sticky top-0 h-screen">
              <MainSidebar officeType={isBackOffice ? 'back-office' : 'front-office'} />
            </aside>
          )}
          <div className="flex-grow w-full min-w-0">
              {showSidebar && isSidebarHidden && (
                <button 
                  onClick={onToggleSidebar} 
                  className="fixed top-4 left-4 z-40 bg-card p-2 rounded-full border border-border shadow-md hover:bg-secondary transition-all focus:outline-none focus:ring-2 focus:ring-ring"
                  title="Show sidebar"
                  aria-label="Show sidebar"
                >
                  <ChevronDoubleRightIcon className="w-5 h-5 text-foreground" />
                </button>
              )}
              {renderActiveView()}
          </div>
          
          <ModalManager />
          {showPrintMonitor && <PrintQueueMonitor />}
          <ToastContainer notifications={toasts} onDismiss={dismissToast}/>
      </div>
  );
}
export default App;