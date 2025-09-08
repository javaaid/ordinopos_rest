import React, { createContext, useContext, useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { LOCATIONS, CATEGORIES, MENU_ITEMS, CUSTOMERS, DRIVERS, EMPLOYEES, SUPPLIERS, WASTAGE_LOG, ROLES, AUDIT_LOG, PRINTERS, TABLES, SUBSCRIPTIONS, PURCHASE_ORDERS, PLUGINS, SCHEDULE, RESERVATIONS, INGREDIENTS, RECIPES, SIGNAGE_DISPLAYS, SIGNAGE_CONTENT, SIGNAGE_PLAYLISTS, SIGNAGE_SCHEDULE, ACTIVATION_CODES, PAYMENT_TYPES, PIZZA_OPTIONS, PROMOTIONS, MODIFIER_GROUPS, KITCHEN_DISPLAYS, KITCHEN_NOTES, VOID_REASONS, MANUAL_DISCOUNTS, SURCHARGES, CUSTOMER_DISPLAYS, SCALES, CALL_LOG, DEFAULT_KITCHEN_PRINT_SETTINGS, DEFAULT_RECEIPT_SETTINGS, KITCHEN_PROFILE_NAMES } from '../constants';
import { MenuItem, CartItem, ModifierOption, Customer, Order, Driver, OrderType, Employee, Location, PaymentMethod, Shift, AppliedDiscount, AIResponse, WastageEntry, Supplier, AIEstimatedWaitTime, Role, AIRoleSuggestion, AuditLogEntry, Notification, Language, ReportSchedule, Printer, ToastNotification, SimulationLogEntry, SimulationReport, Table, Subscription, PurchaseOrder, AppSettings, View, ManagementSubView, SettingsSubView, AppPlugin, ScheduleEntry, Reservation, Ingredient, RecipeItem, SignageDisplay, SignageContentItem, SignagePlaylist, SignageScheduleEntry, WaitlistEntry, WaitlistStatus, Theme, Payment, TableStatus, OrderStatus, PaymentType, PizzaConfiguration, BurgerConfiguration, Category, Promotion, HeldOrder, ModifierGroup, KitchenDisplay, KitchenNote, VoidReason, ManualDiscount, Surcharge, GenericDevice, CustomerDisplay, CallLogEntry, PrintJob, PrintJobStatus, CSVImportResult, ReceiptSettings, KitchenProfileType } from '../types';
import { calculateOrderTotals, isItemOutOfStock } from '../utils/calculations';
import { ordinoLogoBase64 } from '../assets/logo';

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

            if (key === 'settings' && typeof loadedState === 'object' && loadedState !== null) {
                const defaultSettings = defaultValue as AppSettings;
                const loadedSettings = loadedState as Partial<AppSettings>;
                
                const mergedSettings = {
                    ...defaultSettings, ...loadedSettings,
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
    const [activeView, setActiveView] = usePersistentState<View>('activeView', 'landing');
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
        dineIn: { enabled: true, defaultGuests: 2, maxGuests: 20, enableStaffSelection: false, surcharge: { enabled: false, name: 'Service Charge', type: 'percentage', value: 10 }, minCharge: { enabled: false, amount: 0 } },
        delivery: { enabled: true, surcharge: { enabled: false, surchargeId: null }, zones: [] },
        takeAway: { enabled: true, customName: 'Take Away', requireCustomerName: false, useHoldReason: false, surcharge: { enabled: false, name: 'Packaging Fee', type: 'fixed', value: 0.50 } },
        tab: { enabled: true, customName: 'Tab' },
        qrOrdering: { enabled: true, baseUrl: '' },
        devices: { receiptPrinterId: 'p1', kitchenPrinterId: 'kp1', kioskPrinterId: null, barPrinterId: 'bp1', reportPrinterId: 'p4', customerDisplayId: 'cd1', kitchenDisplayId: 'kds_1', scaleId: 'sc1', printServerUrl: 'http://localhost:5000' },
        advancedPOS: { enableItemNumber: false, separateSameItems: false, combineKitchenItems: true, kitchenPrintFooter: false, kitchenPrintReservedOrder: false, sortItemInKitchen: false, sortModifier: false, sortOrderInKDS: false, printVoidOrderItem: true, printOrderAfterSending: false, quickPay: true, useVoidReason: true, confirmPayment: true, printReceiptAfterPayment: true, combineReceiptItem: true, sortItemInReceipt: false, showItemDiscount: true, showVoidOrderItem: false, emailReceipt: true, showTaxOnReceipt: true, inventoryManagement: true, allowMinusQuantity: false, useInventoryPrint: false, useEndOfDayReport: true, useStaffSalary: false, useCashInOutPrint: true, useWorkTimePrint: true, autoClockOut: false, loginDoNotRememberPassword: false, dateFormat: 'MM/DD/YYYY', lockTillToLocation: false, enableTimeClock: true, defaultPrepTimeMinutes: 15, sendLowStockEmails: true, lowStockEmailRecipients: 'manager@example.com' },
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
    
    const addToast = useCallback((toast: Omit<ToastNotification, 'id'>) => {
        setToasts(prev => [...prev, { ...toast, id: Date.now() }]);
    }, []);

    const openModal = useCallback((type: string, props = {}) => setModal({ type, props }), []);
    const closeModal = useCallback(() => setModal({ type: null, props: {} }), []);
    
    const resetPosState = useCallback((showToast = false) => {
        setCart([]);
        setSelectedCustomer(null);
        setCurrentTable(null);
        setActiveOrderToSettle(null);
        setActiveTab(null);
        setAppliedDiscount(null);
        setAppliedPromotion(null);
        setAppliedLoyaltyPoints(0);
        setSelectedStaff(null);
        setAiUpsellSuggestions(null);
        if (showToast) {
            addToast({ type: 'info', title: 'New Sale', message: 'Cart has been cleared.' });
        }
    }, [addToast]);
    
    // Broadcast Channel for CFD Syncing
    const isApplyingSync = useRef(false);
    
    const fullSyncState = useMemo(() => ({
        cart, orderType, lastCompletedOrder, settings, currentLocationId, calledOrderNumber,
        orders, locations, surcharges, menuItems, signagePlaylists, signageContent, tables,
    }), [
        cart, orderType, lastCompletedOrder, settings, currentLocationId, calledOrderNumber, orders,
        locations, surcharges, menuItems, signagePlaylists, signageContent, tables
    ]);

    useEffect(() => {
        if (!isApplyingSync.current) {
            channel.postMessage({ type: 'STATE_SYNC', payload: fullSyncState });
        }
    }, [fullSyncState]);

    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            const { type, payload } = event.data;

            if (type === 'REQUEST_STATE') {
                channel.postMessage({ type: 'STATE_SYNC', payload: fullSyncState });
            } else if (type === 'STATE_SYNC') {
                isApplyingSync.current = true;
                setCart(payload.cart);
                setOrderType(payload.orderType);
                setSettings(payload.settings);
                setCurrentLocationId(payload.currentLocationId);
                setCalledOrderNumber(payload.calledOrderNumber);
                setOrders(payload.orders);
                
                if (JSON.stringify(lastCompletedOrder) !== JSON.stringify(payload.lastCompletedOrder)) {
                    if (payload.lastCompletedOrder) {
                        resetPosState(false);
                    }
                    setLastCompletedOrder(payload.lastCompletedOrder);
                }
                setTimeout(() => { isApplyingSync.current = false; }, 100);
            }
        };

        channel.addEventListener('message', handleMessage);
        channel.postMessage({ type: 'REQUEST_STATE' });

        return () => channel.removeEventListener('message', handleMessage);
    }, [fullSyncState, lastCompletedOrder, resetPosState]);

    // Many many handlers here...
    
    const handleLogout = useCallback(() => {
        // ...
        setCurrentEmployee(null);
        setActiveView('landing');
    }, [currentEmployee, setCurrentEmployee, setAuditLog, setActiveView]);

    const contextValue = useMemo(() => ({
        activeView, setView: setActiveView,
        managementSubView, setManagementSubView,
        settingsSubView, setSettingsSubView,
        currentEmployee, setCurrentEmployee,
        currentLocationId, setCurrentLocationId,
        currentLocation: locations.find(l => l.id === currentLocationId) || locations[0],
        onLocationChange: setCurrentLocationId,
        theme, setTheme,
        settings, setSettings,
        toasts, addToast,
        dismissToast: (id: number) => setToasts(prev => prev.filter(t => t.id !== id)),
        modal, openModal, closeModal,
        cart, setCart,
        orderType, setOrderType,
        selectedCustomer, setSelectedCustomer,
        orders, setOrders,
        currentTable, setCurrentTable,
        searchQuery, setSearchQuery,
        activeCategory, setActiveCategory,
        //... all other states and handlers
        handleLogout,
    }), [
        // Huge dependency array
        activeView, managementSubView, settingsSubView, currentEmployee, currentLocationId, theme, settings, toasts, modal, cart, orderType, selectedCustomer, orders, currentTable, searchQuery, activeCategory, locations, handleLogout
    ]);

    return (
        <AppContext.Provider value={contextValue}>
            {children}
        </AppContext.Provider>
    );
};
