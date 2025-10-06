import React, { createContext, useContext, useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { LOCATIONS, CATEGORIES, MENU_ITEMS, CUSTOMERS, DRIVERS, EMPLOYEES, SUPPLIERS, WASTAGE_LOG, ROLES, AUDIT_LOG, PRINTERS, TABLES, SUBSCRIPTIONS, PURCHASE_ORDERS, PLUGINS, SCHEDULE, RESERVATIONS, INGREDIENTS, RECIPES, SIGNAGE_DISPLAYS, SIGNAGE_CONTENT, SIGNAGE_PLAYLISTS, SIGNAGE_SCHEDULE, ACTIVATION_CODES, PAYMENT_TYPES, PIZZA_OPTIONS, PROMOTIONS, MODIFIER_GROUPS, KITCHEN_DISPLAYS, KITCHEN_NOTES, VOID_REASONS, MANUAL_DISCOUNTS, SURCHARGES, CUSTOMER_DISPLAYS, SCALES, CALL_LOG, DEFAULT_KITCHEN_PRINT_SETTINGS, DEFAULT_RECEIPT_SETTINGS, KITCHEN_PROFILE_NAMES } from './constants';
import { MenuItem, CartItem, ModifierOption, Customer, Order, Driver, OrderType, Employee, Location, PaymentMethod, Shift, AppliedDiscount, AIResponse, WastageEntry, Supplier, AIEstimatedWaitTime, Role, AIRoleSuggestion, AuditLogEntry, Notification, Language, ReportSchedule, Printer, ToastNotification, SimulationLogEntry, SimulationReport, Table, Subscription, PurchaseOrder, AppSettings, View, ManagementSubView, SettingsSubView, AppPlugin, ScheduleEntry, Reservation, Ingredient, RecipeItem, SignageDisplay, SignageContentItem, SignagePlaylist, SignageScheduleEntry, WaitlistEntry, WaitlistStatus, Theme, Payment, TableStatus, OrderStatus, PaymentType, PizzaConfiguration, BurgerConfiguration, Category, Promotion, HeldOrder, ModifierGroup, KitchenDisplay, KitchenNote, VoidReason, ManualDiscount, Surcharge, GenericDevice, CustomerDisplay, CallLogEntry, PrintJob, PrintJobStatus, CSVImportResult, ReceiptSettings, KitchenProfileType } from './types';
import { calculateOrderTotals, isItemOutOfStock } from './utils/calculations';
import { ordinoLogoBase64 } from './assets/logo.ts';

const AppContext = createContext<any>(null);

export const useAppContext = () => {
    const context = useContext(AppContext);
    if (!context) throw new Error('useAppContext must be used within an AppProvider');
    return context;
};
export const useDataContext = () => useAppContext();
export const usePOSContext = () => useAppContext();
export const useModalContext = () => useAppContext();
export const useToastContext = () => useAppContext();

const usePersistentState = <T,>(key: string, defaultValue: T): [T, React.Dispatch<React.SetStateAction<T>>] => {
    const [state, setState] = useState<T>(() => {
        try {
            const item = window.localStorage.getItem(key);
            if (!item) {
                return defaultValue;
            }
            
            const loadedState = JSON.parse(item);

            // Special handling for settings to prevent crashes on data structure changes.
            // This merges the default settings with the loaded settings, ensuring any new
            // properties added in updates are present.
            if (key === 'settings' && typeof loadedState === 'object' && loadedState !== null) {
                const defaultSettings = defaultValue as AppSettings;
                const loadedSettings = loadedState as Partial<AppSettings>;
                
                // Deep merge crucial nested objects
                const mergedSettings = {
                    ...defaultSettings,
                    ...loadedSettings,
                    orderSettings: { ...defaultSettings.orderSettings, ...loadedSettings.orderSettings },
                    dualCurrency: { ...defaultSettings.dualCurrency, ...loadedSettings.dualCurrency },
                    zatca: { ...defaultSettings.zatca, ...loadedSettings.zatca },
                    receipt: { ...defaultSettings.receipt, ...loadedSettings.receipt },
                    invoice: { ...defaultSettings.invoice, ...loadedSettings.invoice },
                    theme: { ...defaultSettings.theme, ...loadedSettings.theme },
                    language: { ...defaultSettings.language, ...loadedSettings.language },
                    deliveryApps: { ...defaultSettings.deliveryApps, ...loadedSettings.deliveryApps },
                    iotSensors: { ...defaultSettings.iotSensors, ...loadedSettings.iotSensors },
                    ai: { ...defaultSettings.ai, ...loadedSettings.ai },
                    cfd: { ...defaultSettings.cfd, ...loadedSettings.cfd },
                    notificationSettings: { ...defaultSettings.notificationSettings, ...loadedSettings.notificationSettings },
                    dineIn: { ...defaultSettings.dineIn, ...loadedSettings.dineIn },
                    delivery: { ...defaultSettings.delivery, ...loadedSettings.delivery },
                    takeAway: { ...defaultSettings.takeAway, ...loadedSettings.takeAway },
                    tab: { ...defaultSettings.tab, ...loadedSettings.tab },
                    qrOrdering: { ...defaultSettings.qrOrdering, ...loadedSettings.qrOrdering },
                    devices: { ...defaultSettings.devices, ...loadedSettings.devices },
                    advancedPOS: { ...defaultSettings.advancedPOS, ...loadedSettings.advancedPOS },
                    preferences: { ...defaultSettings.preferences, ...loadedSettings.preferences },
                    loyalty: { ...defaultSettings.loyalty, ...loadedSettings.loyalty },
                    fontSettings: { ...defaultSettings.fontSettings, ...loadedSettings.fontSettings },
                };
                return mergedSettings as T;
            }
            
            return loadedState;
        } catch (error) {
            console.warn(`Error reading localStorage key “${key}”:`, error);
            // On parse error, it's safer to return the default value
            return defaultValue;
        }
    });

    useEffect(() => {
        try {
            window.localStorage.setItem(key, JSON.stringify(state));
        } catch (error) {
            console.error(`Error writing to localStorage for key “${key}”:`, error);
        }
    }, [key, state]);

    return [state, setState];
};

const channel = new BroadcastChannel('ordino_pos_sync');

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // FIX: Changed default view from 'landing' to 'pos' to match the View type definition.
    const [activeView, setActiveView] = usePersistentState<View>('activeView', 'pos');
    const [managementSubView, setManagementSubView] = usePersistentState<ManagementSubView>('managementSubView', 'menu_products');
    const [settingsSubView, setSettingsSubView] = usePersistentState<SettingsSubView>('settingsSubView', 'integrations');
    const [currentEmployee, setCurrentEmployee] = usePersistentState<Employee | null>('currentEmployee', null);
    const [currentLocationId, setCurrentLocationId] = usePersistentState<string>('currentLocationId', LOCATIONS[0].id);
    const [theme, setTheme] = usePersistentState<Theme>('theme', 'light');
    const [settings, setSettings] = usePersistentState<AppSettings>('settings', {
        paymentProvider: 'none', paymentTerminalSecretKey: '', terminalId: '', accountingSoftware: 'none', quickbooksApiKey: '', xeroApiKey: '',
        reservationSystem: 'none', opentableApiKey: '', googleReservationsApiKey: '',
        orderSettings: { gratuityOptions: [15, 18, 20], invoicePrefix: 'INV-', invoiceSuffix: '', nextInvoiceNumber: 1, nextDailyOrderNumber: 1, dailyOrderSequenceLastReset: new Date().toISOString().split('T')[0] },
        dualCurrency: { enabled: false, secondaryCurrency: 'USD', exchangeRate: 1 },
        zatca: { enabled: true, productionCert: '', productionCSR: '', isSandbox: true, fatooraApiKey: '', qrCodeSize: 128, qrCodePosition: 'bottom' },
        receipt: { ...DEFAULT_RECEIPT_SETTINGS, template: 'standard', logoUrl: ordinoLogoBase64, promoMessage: 'Fast • Reliable • Smart POS', footerLogoUrl: '' },
        invoice: { template: 'modern' },
        theme: { primary: '#2563eb', background: '#f4f4f5', surface: '#ffffff', textBase: '#111827', textMuted: '#6b7280' },
        language: { staff: 'en', customer: 'en' },
        deliveryApps: { uberEats: { enabled: false, apiKey: '' }, doordash: { enabled: false, apiKey: '' } },
        iotSensors: { smartFridges: { enabled: false, apiKey: '' }, storageSensors: { enabled: false, apiKey: '' } },
        ai: { enableAIFeatures: true, enableUpsell: true, enableCFDSuggestions: true, enableReportAnalysis: true },
        cfd: { attractScreenPlaylistId: null, featuredItemIds: [] },
        notificationSettings: { duration: 5, position: 'top-right', theme: 'dark' },
        dineIn: { enabled: true, defaultGuests: 2, maxGuests: 20, enableStaffSelection: false, showGuestCountPrompt: true, surcharge: { enabled: false, name: 'Service Charge', type: 'percentage', value: 10 }, minCharge: { enabled: false, amount: 0 } },
        delivery: { enabled: true, surcharge: { enabled: false, surchargeId: null }, zones: [] },
        takeAway: { enabled: true, customName: 'Take Away', requireCustomerName: false, useHoldReason: false, surcharge: { enabled: false, name: 'Packaging Fee', type: 'fixed', value: 0.50 } },
        tab: { enabled: true, customName: 'Tab' },
        qrOrdering: { enabled: true, baseUrl: '' },
        devices: { receiptPrinterId: 'p1', kitchenPrinterId: 'kp1', kioskPrinterId: null, barPrinterId: 'bp1', reportPrinterId: 'p4', customerDisplayId: 'cd1', kitchenDisplayId: 'kds_1', scaleId: 'sc1', printServerUrl: 'http://localhost:5000' },
        advancedPOS: { enableItemNumber: false, separateSameItems: false, combineKitchenItems: true, kitchenPrintFooter: false, kitchenPrintReservedOrder: false, sortItemInKitchen: false, sortModifier: false, sortOrderInKDS: false, printVoidOrderItem: true, printOrderAfterSending: false, quickPay: true, useVoidReason: true, confirmPayment: true, printReceiptAfterPayment: true, combineReceiptItem: true, sortItemInReceipt: false, showItemDiscount: true, showVoidOrderItem: false, emailReceipt: true, showTaxOnReceipt: true, inventoryManagement: true, allowMinusQuantity: false, useInventoryPrint: false, useEndOfDayReport: true, useStaffSalary: false, useCashInOutPrint: true, useWorkTimePrint: true, autoClockOut: false, loginDoNotRememberPassword: false, dateFormat: 'MM/DD/YYYY', lockTillToLocation: false, enableTimeClock: true, defaultPrepTimeMinutes: 15, sendLowStockEmails: true, lowStockEmailRecipients: 'manager@example.com', enableDeliveryMaps: true, enableLiveDriverTracking: true },
        preferences: { actionAfterSendOrder: 'order', actionAfterPayment: 'order', defaultPaymentMethod: 'Cash', enableOrderNotes: true, enableKitchenPrint: true, defaultOrderType: 'dine-in', enableOrderHold: true, resetOrderNumberDaily: true, dashboardWidgetOrder: ['stats', 'chart', 'quickActions', 'topItems', 'lowStock', 'recentTransactions'] },
        loyalty: { enabled: true, pointsPerDollar: 10, redemptionRate: 100 },
        fontSettings: { baseSize: 16, menuItemName: 14, menuItemPrice: 14, orderSummaryItem: 14, orderSummaryTotal: 24, categoryTabs: 14 },
    });
    const [locations, setLocations] = usePersistentState<Location[]>('locations', LOCATIONS);
    const [categories, setCategories] = usePersistentState<Category[]>('categories', CATEGORIES);
    const [menuItems, setMenuItems] = usePersistentState<MenuItem[]>('menuItems', MENU_ITEMS);
    const [customers, setCustomers] = usePersistentState<Customer[]>('customers', CUSTOMERS);
    const [drivers, setDrivers] = usePersistentState<Driver[]>('drivers', DRIVERS);
    const [employees, setEmployees] = usePersistentState<Employee[]>('employees', EMPLOYEES);
    const [suppliers, setSuppliers] = usePersistentState<Supplier[]>('suppliers', SUPPLIERS);
    const [wastageLog, setWastageLog] = usePersistentState<WastageEntry[]>('wastageLog', WASTAGE_LOG);
    const [roles, setRoles] = usePersistentState<Role[]>('roles', ROLES);
    const [auditLog, setAuditLog] = usePersistentState<AuditLogEntry[]>('auditLog', AUDIT_LOG);
    const [printers, setPrinters] = usePersistentState<Printer[]>('printers', PRINTERS);
    const [tables, setTables] = usePersistentState<Table[]>('tables', TABLES);
    const [subscriptions, setSubscriptions] = usePersistentState<Subscription[]>('subscriptions', SUBSCRIPTIONS);
    const [purchaseOrders, setPurchaseOrders] = usePersistentState<PurchaseOrder[]>('purchaseOrders', PURCHASE_ORDERS);
    const [schedule, setSchedule] = usePersistentState<ScheduleEntry[]>('schedule', SCHEDULE);
    const [reservations, setReservations] = usePersistentState<Reservation[]>('reservations', RESERVATIONS);
    const [ingredients, setIngredients] = usePersistentState<Ingredient[]>('ingredients', INGREDIENTS);
    const [recipes, setRecipes] = usePersistentState<Record<number, RecipeItem[]>>('recipes', RECIPES);
    const [signageDisplays, setSignageDisplays] = usePersistentState<SignageDisplay[]>('signageDisplays', SIGNAGE_DISPLAYS);
    const [signageContent, setSignageContent] = usePersistentState<SignageContentItem[]>('signageContent', SIGNAGE_CONTENT);
    const [signagePlaylists, setSignagePlaylists] = usePersistentState<SignagePlaylist[]>('signagePlaylists', SIGNAGE_PLAYLISTS);
    const [signageSchedule, setSignageSchedule] = usePersistentState<SignageScheduleEntry[]>('signageSchedule', SIGNAGE_SCHEDULE);
    const [paymentTypes, setPaymentTypes] = usePersistentState<PaymentType[]>('paymentTypes', PAYMENT_TYPES);
    const [promotions, setPromotions] = usePersistentState<Promotion[]>('promotions', PROMOTIONS);
    const [modifierGroups, setModifierGroups] = usePersistentState<ModifierGroup[]>('modifierGroups', MODIFIER_GROUPS);
    const [kitchenDisplays, setKitchenDisplays] = usePersistentState<KitchenDisplay[]>('kitchenDisplays', KITCHEN_DISPLAYS);
    const [kitchenNotes, setKitchenNotes] = usePersistentState<KitchenNote[]>('kitchenNotes', KITCHEN_NOTES);
    const [voidReasons, setVoidReasons] = usePersistentState<VoidReason[]>('voidReasons', VOID_REASONS);
    const [manualDiscounts, setManualDiscounts] = usePersistentState<ManualDiscount[]>('manualDiscounts', MANUAL_DISCOUNTS);
    const [surcharges, setSurcharges] = usePersistentState<Surcharge[]>('surcharges', SURCHARGES);
    const [customerDisplays, setCustomerDisplays] = usePersistentState<CustomerDisplay[]>('customerDisplays', CUSTOMER_DISPLAYS);
    const [scales, setScales] = usePersistentState<GenericDevice[]>('scales', SCALES);
    const [callLog, setCallLog] = usePersistentState<CallLogEntry[]>('callLog', CALL_LOG);
    const [plugins, setPlugins] = usePersistentState<AppPlugin[]>('plugins', PLUGINS);
    const [printQueue, setPrintQueue] = usePersistentState<PrintJob[]>('printQueue', []);
    const [toasts, setToasts] = useState<ToastNotification[]>([]);
    const [modal, setModal] = useState<{ type: string | null; props: any }>({ type: null, props: {} });
    const [cart, setCart] = useState<CartItem[]>([]);
    const [orderType, setOrderType] = useState<OrderType>(settings.preferences.defaultOrderType);
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [orders, setOrders] = usePersistentState<Order[]>('orders', []);
    const [currentTable, setCurrentTable] = useState<Table | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState('all');
    const [isSuggestingUpsell, setIsSuggestingUpsell] = useState(false);
    const [aiUpsellSuggestions, setAiUpsellSuggestions] = useState<AIResponse | null>(null);
    const [heldOrders, setHeldOrders] = usePersistentState<HeldOrder[]>('heldOrders', []);
    const [activeOrderToSettle, setActiveOrderToSettle] = useState<Order | null>(null);
    const [selectedStaff, setSelectedStaff] = useState<Employee | null>(null);
    const [activeTab, setActiveTab] = useState<Order | null>(null);
    const [appliedLoyaltyPoints, setAppliedLoyaltyPoints] = useState(0);
    const [isSidebarHidden, setIsSidebarHidden] = useState(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);
    const [waitlist, setWaitlist] = usePersistentState<WaitlistEntry[]>('waitlist', []);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [notifications, setNotifications] = usePersistentState<Notification[]>('notifications', []);
    const [appliedDiscount, setAppliedDiscount] = useState<AppliedDiscount | null>(null);
    const [appliedPromotion, setAppliedPromotion] = useState<Promotion | null>(null);
    const [calledOrderNumber, setCalledOrderNumber] = usePersistentState<string | null>('calledOrderNumber', null);
    const [lastCompletedOrder, setLastCompletedOrder] = usePersistentState<Order | null>('lastCompletedOrder', null);
    const [justAddedCategoryId, setJustAddedCategoryId] = useState<string | null>(null);
    const [justAddedCustomer, setJustAddedCustomer] = useState<Customer | null>(null);
    const [reportSchedules, setReportSchedules] = usePersistentState<ReportSchedule[]>('reportSchedules', []);
    
    const addToast = useCallback((toast: Omit<ToastNotification, 'id'>) => {
        setToasts(prev => [...prev, { ...toast, id: Date.now() }]);
    }, []);

    const onClearJustAddedCategoryId = () => setJustAddedCategoryId(null);
    const onClearJustAddedCustomer = () => setJustAddedCustomer(null);
    
    const openModal = useCallback((type: string, props = {}) => setModal({ type, props }), []);
    const closeModal = useCallback(() => setModal({ type: null, props: {} }), []);

    const categoriesWithCounts = useMemo(() => {
        if (!categories || !menuItems) return [];
        const itemCounts = (menuItems || []).reduce((acc: Record<string, number>, item: MenuItem) => {
            if (item.category) {
                acc[item.category] = (acc[item.category] || 0) + 1;
            }
            return acc;
        }, {});
        return (categories || []).map((cat: Category) => ({
            ...cat,
            itemCount: itemCounts[cat.id] || 0,
        }));
    }, [categories, menuItems]);

    // --- All Data Management Handlers ---
    const handleSavePrinter = useCallback((printer: Printer) => {
        setPrinters(prev => {
            const existingIndex = prev.findIndex(p => p.id === printer.id);
            if (existingIndex !== -1) {
                const newPrinters = [...prev];
                newPrinters[existingIndex] = printer;
                addToast({ type: 'success', title: 'Printer Updated', message: `Printer "${printer.name}" has been updated.` });
                return newPrinters;
            } else {
                addToast({ type: 'success', title: 'Printer Added', message: `Printer "${printer.name}" has been added.` });
                return [...prev, printer];
            }
        });
        closeModal();
    }, [setPrinters, addToast, closeModal]);

    const handleDeletePrinter = useCallback((printerId: string) => {
        openModal('confirm', {
            title: 'Delete Printer',
            message: 'Are you sure you want to delete this printer? This action cannot be undone.',
            confirmText: 'Delete',
            onConfirm: () => {
                setPrinters(prev => prev.filter(p => p.id !== printerId));
                addToast({ type: 'info', title: 'Printer Deleted', message: 'The printer has been removed.' });
                closeModal();
            }
        });
    }, [setPrinters, openModal, closeModal, addToast]);
    
    // ... all other handlers would be defined here in a similar fashion ...
    const onNewSaleClick = useCallback(() => { /* implementation */ }, []);
    const onUpdateWaitlistStatus = useCallback(() => { /* implementation */ }, []);
    const handleClockIn = useCallback(() => { /* implementation */ }, []);
    const handleClockOut = useCallback(() => { /* implementation */ }, []);
    const handleStartBreak = useCallback(() => { /* implementation */ }, []);
    const handleEndBreak = useCallback(() => { /* implementation */ }, []);
    const handlePinLogin = useCallback((): boolean => { /* implementation */ return true; }, []);
    // FIX: Change setActiveView to 'pos' on logout as 'landing' is not a valid view type.
    const handleLogout = useCallback(() => {
        setCurrentEmployee(null);
        setActiveView('pos');
     }, [setCurrentEmployee, setActiveView]);
    const onSelectItem = useCallback(() => { /* implementation */ }, []);
    const onSelectCustomer = useCallback(() => { /* implementation */ }, []);
    const handleSaveProduct = useCallback(() => { /* implementation */ }, []);
    const handleDeleteProduct = useCallback(() => { /* implementation */ }, []);
    const handleSaveCategory = useCallback(() => { /* implementation */ }, []);
    const handleDeleteCategory = useCallback(() => { /* implementation */ }, []);
    const handleSaveModifierGroup = useCallback(() => { /* implementation */ }, []);
    const handleDeleteModifierGroup = useCallback(() => { /* implementation */ }, []);
    const handleSavePromotion = useCallback(() => { /* implementation */ }, []);
    const handleDeletePromotion = useCallback(() => { /* implementation */ }, []);
    const handleSaveKitchenNote = useCallback(() => { /* implementation */ }, []);
    const handleDeleteKitchenNote = useCallback(() => { /* implementation */ }, []);
    const handleSaveVoidReason = useCallback(() => { /* implementation */ }, []);
    const handleDeleteVoidReason = useCallback(() => { /* implementation */ }, []);
    const handleSaveManualDiscount = useCallback(() => { /* implementation */ }, []);
    const handleDeleteManualDiscount = useCallback(() => { /* implementation */ }, []);
    const handleSaveSurcharge = useCallback(() => { /* implementation */ }, []);
    const handleDeleteSurcharge = useCallback(() => { /* implementation */ }, []);
    const handleSaveCustomer = useCallback(() => { /* implementation */ }, []);
    const handleDeleteCustomer = useCallback(() => { /* implementation */ }, []);
    const handleSaveSupplier = useCallback(() => { /* implementation */ }, []);
    const handleDeleteSupplier = useCallback(() => { /* implementation */ }, []);
    const handleSaveUser = useCallback(() => { /* implementation */ }, []);
    const handleDeleteUser = useCallback(() => { /* implementation */ }, []);
    const handleSaveRole = useCallback(() => { /* implementation */ }, []);
    const handleDeleteRole = useCallback(() => { /* implementation */ }, []);
    const handleSavePurchaseOrder = useCallback(() => { /* implementation */ }, []);
    const handleSaveIngredient = useCallback(() => { /* implementation */ }, []);
    const handleDeleteIngredient = useCallback(() => { /* implementation */ }, []);
    const handleSaveLocation = useCallback(() => { /* implementation */ }, []);
    const handleDeleteLocation = useCallback(() => { /* implementation */ }, []);
    const handleSaveTable = useCallback(() => { /* implementation */ }, []);
    const handleDeleteTable = useCallback(() => { /* implementation */ }, []);
    const handleSavePaymentType = useCallback(() => { /* implementation */ }, []);
    const handleDeletePaymentType = useCallback(() => { /* implementation */ }, []);
    const handleSaveZatcaSettings = useCallback(() => { /* implementation */ }, []);
    const onToggleTheme = useCallback(() => { /* implementation */ }, []);
    const onToggleSidebar = useCallback(() => { /* implementation */ }, []);
    const onToggleFullScreen = useCallback(() => { /* implementation */ }, []);
    const onLaunchView = useCallback(() => { /* implementation */ }, []);
    // Add other missing handlers...

    const contextValue = useMemo(() => ({
        activeView, setView: setActiveView,
        managementSubView, setManagementSubView,
        settingsSubView, setSettingsSubView,
        currentEmployee, setCurrentEmployee,
        currentLocationId, setCurrentLocationId,
        currentLocation: locations.find(l => l.id === currentLocationId) || locations[0],
        onLocationChange: (id: string) => setCurrentLocationId(id),
        theme, setTheme, onToggleTheme,
        settings, setSettings,
        toasts, addToast, dismissToast: (id: number) => setToasts(prev => prev.filter(t => t.id !== id)),
        modal, openModal, closeModal,
        cart, setCart,
        orderType, setOrderType,
        selectedCustomer, setSelectedCustomer,
        onSelectCustomer,
        orders, setOrders,
        currentTable, setCurrentTable,
        searchQuery, onSearchChange: setSearchQuery,
        activeCategory, setActiveCategory,
        isSuggestingUpsell, setIsSuggestingUpsell,
        aiUpsellSuggestions, setAiUpsellSuggestions,
        heldOrders, setHeldOrders,
        // handleHoldOrder,
        // handleReopenOrder,
        // handleDeleteHeldOrder,
        activeOrderToSettle, setActiveOrderToSettle,
        selectedStaff, setSelectedStaff,
        activeTab, setActiveTab,
        // handleSettleTab,
        // handleTransferTable,
        appliedLoyaltyPoints, setAppliedLoyaltyPoints,
        appliedDiscount, setAppliedDiscount,
        appliedPromotion, setAppliedPromotion,
        isSidebarHidden, onToggleSidebar,
        isSidebarCollapsed, onToggleSidebarCollapse: () => setIsSidebarCollapsed(p => !p),
        plugins, setPlugins,
        // isWaitlistPluginActive,
        // isReservationPluginActive,
        // isMultiStorePluginActive,
        // isKsaPluginActive,
        // isOrderNumberDisplayPluginActive,
        // isQRCodePluginActive,
        handleClockIn, handleClockOut, handleStartBreak, handleEndBreak,
        onSelectItem,
        waitlist, setWaitlist,
        onUpdateWaitlistStatus,
        handlePinLogin, handleLogout,
        onNewSaleClick,
        // Expose all states and handlers from data context
        locations, menuItems, categories, customers, drivers, employees, suppliers, wastageLog, roles, auditLog, printers, tables,
        subscriptions, purchaseOrders, schedule, reservations, ingredients, recipes, signageDisplays, signageContent,
        signagePlaylists, signageSchedule, paymentTypes, promotions, modifierGroups, kitchenDisplays,
        kitchenNotes, voidReasons, manualDiscounts, surcharges, customerDisplays, scales, callLog, printQueue,
        notifications,
        categoriesWithCounts,
        lastCompletedOrder, calledOrderNumber,
        justAddedCategoryId, onClearJustAddedCategoryId,
        justAddedCustomer, onClearJustAddedCustomer,
        // Expose all action handlers
        handleSaveProduct, handleDeleteProduct,
        handleSaveCategory, handleDeleteCategory,
        handleSaveModifierGroup, handleDeleteModifierGroup,
        handleSavePromotion, handleDeletePromotion,
        handleSaveKitchenNote, handleDeleteKitchenNote,
        handleSaveVoidReason, handleDeleteVoidReason,
        handleSaveManualDiscount, handleDeleteManualDiscount,
        handleSaveSurcharge, handleDeleteSurcharge,
        handleSaveCustomer, handleDeleteCustomer,
        handleSaveSupplier, handleDeleteSupplier,
        handleSaveUser, handleDeleteUser,
        handleSaveRole, handleDeleteRole,
        handleSavePurchaseOrder,
        handleSaveIngredient, handleDeleteIngredient,
        handleSaveLocation, handleDeleteLocation,
        handleSaveTable, handleDeleteTable,
        handleSavePaymentType, handleDeletePaymentType,
        handleSavePrinter,
        handleDeletePrinter,
        handleSaveZatcaSettings,
        setPrintQueue,
        isFullscreen, onToggleFullScreen, onLaunchView,
        reportSchedules,
    }), [
        activeView, managementSubView, settingsSubView, currentEmployee, currentLocationId, theme, settings, toasts, modal, cart, orderType, selectedCustomer, orders, currentTable, searchQuery, activeCategory, isSuggestingUpsell, aiUpsellSuggestions, heldOrders, activeOrderToSettle, selectedStaff, activeTab, appliedLoyaltyPoints, appliedDiscount, appliedPromotion, isSidebarHidden, isSidebarCollapsed, plugins, waitlist, printQueue, notifications, isFullscreen, lastCompletedOrder, calledOrderNumber, justAddedCategoryId, justAddedCustomer,
        locations, menuItems, categories, customers, drivers, employees, suppliers, wastageLog, roles, auditLog, printers, tables, subscriptions, purchaseOrders, schedule, reservations, ingredients, recipes, signageDisplays, signageContent, signagePlaylists, signageSchedule, paymentTypes, promotions, modifierGroups, kitchenDisplays, kitchenNotes, voidReasons, manualDiscounts, surcharges, customerDisplays, scales, callLog, categoriesWithCounts, reportSchedules,
        // Add all useCallback handlers to dependency array
        setActiveView, setManagementSubView, setSettingsSubView, setCurrentEmployee, setCurrentLocationId, setTheme, setSettings, addToast, openModal, closeModal, setCart, setOrderType, setSelectedCustomer, onSelectCustomer, setOrders, setCurrentTable, setSearchQuery, setActiveCategory, setIsSuggestingUpsell, setAiUpsellSuggestions, setHeldOrders, setActiveOrderToSettle, setSelectedStaff, setActiveTab, setAppliedLoyaltyPoints, setAppliedDiscount, setAppliedPromotion, onToggleSidebar, setPlugins, setWaitlist, onUpdateWaitlistStatus, handlePinLogin, handleLogout, onNewSaleClick,
        handleSaveProduct, handleDeleteProduct, handleSaveCategory, handleDeleteCategory, handleSaveModifierGroup, handleDeleteModifierGroup, handleSavePromotion, handleDeletePromotion, handleSaveKitchenNote, handleDeleteKitchenNote, handleSaveVoidReason, handleDeleteVoidReason, handleSaveManualDiscount, handleDeleteManualDiscount, handleSaveSurcharge, handleDeleteSurcharge, handleSaveCustomer, handleDeleteCustomer, handleSaveSupplier, handleDeleteSupplier, handleSaveUser, handleDeleteUser, handleSaveRole, handleDeleteRole, handleSavePurchaseOrder, handleSaveIngredient, handleDeleteIngredient, handleSaveLocation, handleDeleteLocation, handleSaveTable, handleDeleteTable, handleSavePaymentType, handleDeletePaymentType, handleSavePrinter, handleDeletePrinter, handleSaveZatcaSettings, onToggleTheme, setPrintQueue, onToggleFullScreen, onLaunchView, onClearJustAddedCategoryId, onClearJustAddedCustomer, handleClockIn, handleClockOut, handleStartBreak, handleEndBreak, onSelectItem
    ]);

    return (
        <AppContext.Provider value={contextValue}>
            {children}
        </AppContext.Provider>
    );
};