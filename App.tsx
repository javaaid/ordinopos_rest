import React, { useEffect, useMemo, useCallback, useState, useRef } from 'react';
import MenuGrid from './components/MenuGrid';
import OrderSummary from './components/OrderSummary';
import KDSView from './components/KDSView';
import DeliveryView from './components/DeliveryView';
import ReportsView from './components/ReportsView';
import CustomersView from './components/CustomersView';
import PermissionDenied from './components/PermissionDenied';
import CFDView from './components/CFDView';
import KIOSKView from './components/KIOSKView';
import { LoginPage } from './components/LoginPage';
import LandingPage from './components/LandingPage';
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
import { View, ManagementSubView, SettingsSubView, Order, Table, Location, Role, Category } from './types';
import { LOCATIONS } from './constants';
import WaitlistView from './components/WaitlistView';
import QRCodeOrderingView from './components/QRCodeOrderingView';
import POSHeader from './components/POSHeader';
import { useAppContext } from './contexts/AppContext';
import ModalManager from './components/ModalManager';
import { cn } from './lib/utils';
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
import BurgerBuilderSettingsView from './components/BurgerBuilderSettingsView';
import CallLogView from './components/CallLogView';
import ChatBubbleOvalLeftEllipsisIcon from './components/icons/ChatBubbleOvalLeftEllipsisIcon';
import PrintQueueMonitor from './components/PrintQueueMonitor';
import { useTranslations } from './hooks/useTranslations';
import ChevronDoubleRightIcon from './components/icons/ChevronDoubleRightIcon';
import PrintersView from './components/PrintersView';
import POSSubHeader from './components/POSSubHeader';
import LoyaltySettingsView from './components/LoyaltySettingsView';
import FontSettingsView from './components/FontSettingsView';

const App: React.FC = () => {
  const { 
    activeView, setView, managementSubView, setManagementSubView, settingsSubView, setSettingsSubView,
    currentEmployee, settings, theme,
    isMultiStorePluginActive, isKsaPluginActive,
    isReservationPluginActive, isWaitlistPluginActive, isOrderNumberDisplayPluginActive,
    roles, orders, locations, categories, categoriesWithCounts, handleSaveCategory, handleDeleteCategory, onRequestRefund, onApproveRefund, onDenyRefund,
    toasts, dismissToast,
    openModal, closeModal,
    setCurrentTable, onLoadOrder, onPrintA4
  } = useAppContext();


  // State and handlers for the draggable AI FAB
  const [aiFabPosition, setAiFabPosition] = useState({ x: 0, y: 0 });
  const aiFabDragInfoRef = useRef({
      isDragging: false,
      startX: 0,
      startY: 0,
      initialX: 0,
      initialY: 0,
      hasMoved: false,
  });
  
  const handleAiFabMouseMove = useCallback((e: MouseEvent) => {
      if (!aiFabDragInfoRef.current.isDragging) return;
  
      const dx = e.clientX - aiFabDragInfoRef.current.startX;
      const dy = e.clientY - aiFabDragInfoRef.current.startY;
      
      if (!aiFabDragInfoRef.current.hasMoved && (Math.abs(dx) > 5 || Math.abs(dy) > 5)) {
          aiFabDragInfoRef.current.hasMoved = true;
      }
  
      setAiFabPosition({
          x: aiFabDragInfoRef.current.initialX + dx,
          y: aiFabDragInfoRef.current.initialY + dy,
      });
  }, []);
  
  const handleAiFabMouseUp = useCallback(() => {
      window.removeEventListener('mousemove', handleAiFabMouseMove);
      window.removeEventListener('mouseup', handleAiFabMouseUp);
      
      if (!aiFabDragInfoRef.current.hasMoved) {
          openModal('aiChat');
      }
  
      aiFabDragInfoRef.current.isDragging = false;
  }, [handleAiFabMouseMove, openModal]);

  const handleAiFabMouseDown = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (e.button !== 0) return;
      aiFabDragInfoRef.current = {
          isDragging: true,
          startX: e.clientX,
          startY: e.clientY,
          initialX: aiFabPosition.x,
          initialY: aiFabPosition.y,
          hasMoved: false,
      };
      window.addEventListener('mousemove', handleAiFabMouseMove);
      window.addEventListener('mouseup', handleAiFabMouseUp);
  };
  
  useEffect(() => {
    return () => {
        window.removeEventListener('mousemove', handleAiFabMouseMove);
        window.removeEventListener('mouseup', handleAiFabMouseUp);
    };
  }, [handleAiFabMouseMove, handleAiFabMouseUp]);
  
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);
  
  if (!settings) {
    return null; // or a loading spinner
  }
  const t = useTranslations(settings.language.staff);

  const currentRole = useMemo(() => {
    if (!currentEmployee) return null;
    return roles.find((r: Role) => r.id === currentEmployee.roleId);
  }, [currentEmployee, roles]);
  
  const permissions = useMemo(() => {
    if (!currentRole || !settings) {
        return null;
    }
    const { advancedPOS } = settings;
    if (typeof advancedPOS !== 'object' || advancedPOS === null) {
        return null;
    }
    
    const effectivePermissions = { ...currentRole.permissions };

    if (!isReservationPluginActive) effectivePermissions.viewReservations = false;
    if (!isWaitlistPluginActive) effectivePermissions.viewWaitlist = false;
    if (!isOrderNumberDisplayPluginActive) effectivePermissions.viewOrderNumberDisplay = false;
    
    if (advancedPOS.enableTimeClock === false) {
        effectivePermissions.viewTimeClock = false;
    }
    
    return effectivePermissions;
}, [currentRole, isReservationPluginActive, isWaitlistPluginActive, isOrderNumberDisplayPluginActive, settings]);
  
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
  
  const publicViews: View[] = ['kds', 'cfd', 'kiosk', 'qr_ordering', 'order_number_display'];

  // FIX: Differentiate between the initial landing page and the login page for protected views.
  if (!currentEmployee) {
    if (activeView === 'landing') {
      return <LandingPage />;
    }
    if (!publicViews.includes(activeView)) {
      return <LoginPage settings={settings} />;
    }
  }

  const renderActiveView = () => {
    if (publicViews.includes(activeView)) {
        switch(activeView) {
            case 'kds': return <KDSView />;
            case 'cfd': return <CFDView />;
            case 'kiosk': return <KIOSKView />;
            case 'qr_ordering': return <QRCodeOrderingView />;
            case 'order_number_display': return <OrderNumberDisplayView />;
            default: return <PermissionDenied />;
        }
    }

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
          case 'menu_products': return canManageMenu ? <ProductsView /> : <PermissionDenied />;
          case 'menu_categories': return canManageMenu ? <div className="p-6 h-full"><CategoryManagementTab categories={categoriesWithCounts} onAddNew={handleAddNewCategory} onEdit={handleEditCategory} onDelete={handleDeleteCategory} /></div> : <PermissionDenied />;
          case 'menu_modifiers': return canManageMenu ? <div className="h-full"><ModifierManagementTab /></div> : <PermissionDenied />;
          case 'menu_promotions': return canManageMenu ? <PromotionsView /> : <PermissionDenied />;
          case 'menu_pizza_builder': return canManageMenu ? <PizzaBuilderSettingsView /> : <PermissionDenied />;
          case 'menu_burger_builder': return canManageMenu ? <BurgerBuilderSettingsView /> : <PermissionDenied />;
          case 'menu_kitchen_notes': return canManageMenu ? <KitchenNoteManagementTab /> : <PermissionDenied />;
          case 'menu_void_reasons': return canManageMenu ? <VoidReasonManagementTab /> : <PermissionDenied />;
          case 'menu_discounts': return canManageMenu ? <DiscountManagementTab /> : <PermissionDenied />;
          case 'menu_surcharges': return canManageMenu ? <SurchargeManagementTab /> : <PermissionDenied />;
          case 'menu_gratuity': return canManageMenu ? <GratuityManagementTab /> : <PermissionDenied />;
          case 'call_log': return permissions.viewCustomers ? <CallLogView /> : <PermissionDenied />;
          case 'loyalty': return permissions.canPerformManagerFunctions ? <LoyaltySettingsView /> : <PermissionDenied />;
          default: return <PermissionDenied />;
      }
    };
      
    const renderSettingsSubView = () => {
        switch(settingsSubView) {
            case 'integrations': return <IntegrationsSettings />;
            case 'customization': return <CustomizationSettings />;
            case 'fonts': return <FontSettingsView />;
            case 'advanced': return <AdvancedSettings />;
            case 'activity': return <UserActivityReport />;
            case 'zatca': return <ZatcaSettingsView />;
            case 'ai': return <AISettingsComponent />;
            case 'numbering': return permissions.canPerformManagerFunctions ? <NumberingSettingsView /> : <PermissionDenied />;
            case 'device_settings': return permissions.canPerformManagerFunctions ? <DeviceSettingsView /> : <PermissionDenied />;
            case 'printers': return permissions.canPerformManagerFunctions ? <PrintersView /> : <PermissionDenied />;
            case 'advanced_pos_settings': return permissions.canPerformManagerFunctions ? <AdvancedPOSSettingsView /> : <PermissionDenied />;
            case 'preferences_settings': return permissions.canPerformManagerFunctions ? <PreferencesSettingsView /> : <PermissionDenied />;
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
                <div className="flex-shrink-0">
                    <POSSubHeader />
                </div>
                 <div className="flex-shrink-0 px-1.5">
                    <CategoryTabs />
                </div>
                <div className="flex-grow overflow-y-auto pr-1.5 pl-1.5">
                    <MenuGrid />
                </div>
                <div className="flex-shrink-0 mt-2 px-1.5">
                    <ActiveTablesBar onSelectTable={handleSelectTableFromBar} />
                </div>
            </main>
            <aside className="w-[420px] shrink-0">
                <OrderSummary />
            </aside>
             <div 
                className="fixed bottom-4 right-[calc(420px+0.5rem+1.5rem)] z-30"
                style={{ transform: `translate(${aiFabPosition.x}px, ${aiFabPosition.y}px)` }}
              >
                <button 
                  onMouseDown={handleAiFabMouseDown}
                  title="Gem AI Assistant" 
                  className="bg-primary text-primary-foreground w-14 h-14 flex items-center justify-center rounded-full shadow-lg hover:bg-primary/90 transition-all duration-300 hover:scale-110 cursor-grab active:cursor-grabbing"
                >
                  <ChatBubbleOvalLeftEllipsisIcon className="w-7 h-7"/>
                </button>
              </div>
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