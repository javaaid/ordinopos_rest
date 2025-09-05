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

    const updatePrintJobStatus = useCallback((jobId: string, status: PrintJobStatus) => {
        setPrintQueue(prev => prev.map(job => (job.id === jobId ? { ...job, status } : job)));
    }, [setPrintQueue]);

    const addPrintJobs = useCallback((jobsToAdd: Omit<PrintJob, 'id' | 'timestamp' | 'status'>[]) => {
        const newJobs: PrintJob[] = jobsToAdd.map(job => ({
            ...job,
            id: `job_${Date.now()}_${Math.random()}`,
            timestamp: Date.now(),
            status: 'pending',
        }));
        setPrintQueue(prev => [...prev, ...newJobs]);
    }, [setPrintQueue]);

    const onDirectPrintReceipt = useCallback((order: Order) => {
        const locationForOrder = locations.find((l: Location) => l.id === order.locationId);
        if (!locationForOrder) {
            addToast({ type: 'error', title: 'Print Error', message: 'Could not find location for order.' });
            return;
        }
        const newJob: Omit<PrintJob, 'id' | 'timestamp' | 'status'> = {
            component: 'TemplateRenderer',
            props: {
                format: 'thermal',
                order,
                location: locationForOrder,
                settings: settings,
                receiptSettings: settings.receipt,
                employees: employees,
            }
        };
        addPrintJobs([newJob]);
    }, [locations, settings, employees, addToast, addPrintJobs]);
    
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

    const onToggleTheme = () => setTheme(prev => (prev === 'light' ? 'dark' : 'light'));

    const onToggleClockStatus = useCallback((employeeId: string) => {
        setEmployees(prev => {
            const employeeIndex = prev.findIndex(e => e.id === employeeId);
            if (employeeIndex === -1) return prev;

            const newEmployees = [...prev];
            const employee = { ...newEmployees[employeeIndex] };
            const now = Date.now();
            const shifts = [...employee.shifts];

            if (employee.shiftStatus === 'clocked-out' || !employee.shiftStatus) {
                employee.shiftStatus = 'clocked-in';
                shifts.push({ clockIn: now });
                addToast({ type: 'success', title: 'Clocked In', message: `${employee.name} has clocked in.` });
            } else {
                employee.shiftStatus = 'clocked-out';
                const lastShift = shifts[shifts.length - 1];
                if (lastShift && !lastShift.clockOut) {
                    lastShift.clockOut = now;
                }
                addToast({ type: 'info', title: 'Clocked Out', message: `${employee.name} has clocked out.` });
            }
            
            employee.shifts = shifts;
            newEmployees[employeeIndex] = employee;
            return newEmployees;
        });
    }, [setEmployees, addToast]);

    const onToggleFullScreen = useCallback(() => {
        const docEl = document.documentElement as any;
        const requestFullscreen = docEl.requestFullscreen || docEl.mozRequestFullScreen || docEl.webkitRequestFullscreen || docEl.msRequestFullscreen;
        const exitFullscreen = document.exitFullscreen || (document as any).mozCancelFullScreen || (document as any).webkitExitFullscreen || (document as any).msExitFullscreen;

        if (!document.fullscreenElement && !(document as any).webkitIsFullScreen && !(document as any).mozFullScreen && !(document as any).msFullscreenElement) {
            if (requestFullscreen) {
                requestFullscreen.call(docEl).catch((err: Error) => {
                    console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
                });
            }
        } else {
            if (exitFullscreen) {
                exitFullscreen.call(document).catch((err: Error) => {
                     console.error(`Error attempting to exit full-screen mode: ${err.message} (${err.name})`);
                });
            }
        }
    }, []);
    
    const onLaunchView = (view: View) => {
        const url = `${window.location.origin}${window.location.pathname}#/${view}`;
        window.open(url, view, 'width=1280,height=800,resizable=yes,scrollbars=yes');
    };

    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!(document.fullscreenElement || (document as any).webkitFullscreenElement || (document as any).mozFullScreenElement || (document as any).msFullscreenElement));
        };
        const events = ['fullscreenchange', 'webkitfullscreenchange', 'mozfullscreenchange', 'msfullscreenchange'];
        events.forEach(event => document.addEventListener(event, handleFullscreenChange));
        return () => {
            events.forEach(event => document.removeEventListener(event, handleFullscreenChange));
        };
    }, []);

    const isWaitlistPluginActive = useMemo(() => {
        const plugin = plugins.find(p => p.id === 'waitlist');
        return plugin && (plugin.status === 'enabled' || plugin.status === 'trial');
    }, [plugins]);
    const isReservationPluginActive = useMemo(() => {
        const plugin = plugins.find(p => p.id === 'reservations');
        return plugin && (plugin.status === 'enabled' || plugin.status === 'trial');
    }, [plugins]);
    //... other plugins
    const isMultiStorePluginActive = useMemo(() => { const p = plugins.find(pl => pl.id === 'multi-store'); return p && (p.status === 'enabled' || p.status === 'trial'); }, [plugins]);
    const isKsaPluginActive = useMemo(() => { const p = plugins.find(pl => pl.id === 'e-invoice-ksa'); return p && (p.status === 'enabled' || p.status === 'trial'); }, [plugins]);
    const isOrderNumberDisplayPluginActive = useMemo(() => { const p = plugins.find(pl => pl.id === 'order_number_display'); return p && (p.status === 'enabled' || p.status === 'trial'); }, [plugins]);
    const isQRCodePluginActive = useMemo(() => { const p = plugins.find(pl => pl.id === 'qr-ordering'); return p && (p.status === 'enabled' || p.status === 'trial'); }, [plugins]);
    
    const onToggleSidebar = () => setIsSidebarHidden(p => !p);

    const handlePinLogin = useCallback((employeeId: string, pin: string): boolean => {
        const employee = employees.find((e: Employee) => e.id === employeeId);
        if (employee && employee.pin === pin) {
            setCurrentEmployee(employee);
            setAuditLog(prev => [...prev, {
                id: `log_${Date.now()}`,
                timestamp: Date.now(),
                employeeId: employee.id,
                employeeName: employee.name,
                action: 'Logged in'
            }]);
            setActiveView('pos'); // Go to POS after login
            return true;
        }
        return false;
    }, [employees, setCurrentEmployee, setAuditLog, setActiveView]);

    const handleLogout = useCallback(() => {
        if (currentEmployee) {
            setAuditLog(prev => [...prev, {
                id: `log_${Date.now()}`,
                timestamp: Date.now(),
                employeeId: currentEmployee.id,
                employeeName: currentEmployee.name,
                action: 'Logged out'
            }]);
        }
        setCurrentEmployee(null);
        setActiveView('landing');
    }, [currentEmployee, setCurrentEmployee, setAuditLog, setActiveView]);
    
    const handleTogglePlugin = useCallback((pluginId: string) => {
        setPlugins(prevPlugins =>
          prevPlugins.map(p => {
            if (p.id === pluginId) {
              if (p.id === 'plugins-viewer') {
                addToast({ type: 'error', title: 'Action Denied', message: 'The Plugin Manager cannot be disabled.' });
                return p;
              }
              const newStatus = (p.status === 'enabled' || p.status === 'trial') ? 'disabled' : (p.isFree ? 'enabled' : 'trial');
              const trialStartDate = (newStatus === 'trial' && (p.status === 'disabled' || p.status === 'expired')) ? Date.now() : p.trialStartDate;
              const toastMessage = newStatus === 'disabled' ? `Plugin '${p.name}' disabled.` : `Plugin '${p.name}' enabled.`;
              addToast({ type: 'info', title: 'Plugin Status Changed', message: toastMessage });
              return { ...p, status: newStatus, trialStartDate };
            }
            return p;
          })
        );
    }, [setPlugins, addToast]);

    const onUpdateWaitlistStatus = (id: string, status: WaitlistStatus) => {
        setWaitlist(prev => {
            return prev.map(entry => {
                if (entry.id === id) {
                    const updatedEntry = { ...entry, status };
                    if (status === 'Notified') {
                        updatedEntry.notifiedAt = Date.now();
                        addToast({
                            type: 'info',
                            title: `Notifying ${entry.customerName}`,
                            message: `SMS notification sent to ${entry.phone}. They have 5 minutes to return.`
                        });
                    }
                    return updatedEntry;
                }
                return entry;
            });
        });
    };
    
    // Core POS Actions
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

    const onNewSaleClick = useCallback(() => resetPosState(true), [resetPosState]);

    const handleSendToKitchen = useCallback(() => {
        if (cart.length === 0) {
            addToast({ type: 'error', title: 'Empty Cart', message: 'Cannot send an empty order to the kitchen.' });
            return;
        }
        if (orderType === 'dine-in' && !currentTable) {
            addToast({ type: 'error', title: 'No Table Selected', message: 'Please select a table for this dine-in order.' });
            return;
        }

        const currentLocation = locations.find(l => l.id === currentLocationId)!;
        const existingOrder = orders.find((o: Order) => o.tableId && o.tableId === currentTable?.id && (o.status === 'kitchen' || o.status === 'served'));

        if (existingOrder) {
            const combinedCart = [...existingOrder.cart, ...cart];
            const { subtotal, tax, total, taxDetails } = calculateOrderTotals(combinedCart, currentLocation, existingOrder.appliedDiscount, existingOrder.appliedPromotion, 'dine-in', settings, existingOrder.customer, surcharges, existingOrder.appliedLoyaltyPoints);
            
            const updatedOrder: Order = {
                ...existingOrder,
                cart: combinedCart,
                subtotal, tax, total, taxDetails,
                balanceDue: total - existingOrder.payments.reduce((sum, p) => sum + p.amount, 0),
            };
            setOrders(prev => prev.map(o => o.id === existingOrder.id ? updatedOrder : o));
            addToast({ type: 'success', title: 'Order Updated', message: `New items sent to kitchen for table ${currentTable!.name}.` });
        } else {
            const { subtotal, tax, total, taxDetails, finalAppliedDiscount, loyaltyDiscountAmount } = calculateOrderTotals(cart, currentLocation, appliedDiscount, appliedPromotion, orderType, settings, selectedCustomer, surcharges, appliedLoyaltyPoints);
            
            const newOrder: Order = {
                id: `ord_${Date.now()}`,
                orderNumber: String(settings.orderSettings.nextDailyOrderNumber).padStart(4, '0'),
                invoiceNumber: '', createdAt: Date.now(), cart, customer: selectedCustomer || undefined, employeeId: currentEmployee?.id,
                subtotal, tax, total, taxDetails, balanceDue: total, orderType, status: 'kitchen', source: 'in-store', payments: [],
                tableId: currentTable?.id, locationId: currentLocationId, isTraining: false, appliedDiscount: finalAppliedDiscount, appliedPromotion: appliedPromotion || undefined,
                appliedLoyaltyPoints: loyaltyDiscountAmount > 0 ? appliedLoyaltyPoints : undefined, guestCount: currentTable?.guestCount, notes: '',
            };

            setOrders(prev => [...prev, newOrder]);
            
            if (currentTable) {
                setTables(prev => prev.map(t => t.id === currentTable.id ? { ...t, status: 'occupied', occupiedSince: t.occupiedSince || Date.now(), orderId: newOrder.id, customerName: selectedCustomer?.name || 'Walk-in' } : t));
            }

            setSettings(prev => ({ ...prev, orderSettings: { ...prev.orderSettings, nextDailyOrderNumber: prev.orderSettings.nextDailyOrderNumber + 1 }}));
            addToast({ type: 'success', title: 'Order Sent', message: `Order sent to kitchen.` });
        }

        resetPosState();
        setActiveCategory('all');
    }, [cart, currentTable, orderType, selectedCustomer, currentEmployee, settings, locations, currentLocationId, orders, surcharges, appliedDiscount, appliedPromotion, appliedLoyaltyPoints, addToast, setOrders, setTables, setSettings, resetPosState, setActiveCategory]);

    const handleFinalizePayment = (payments: Payment[], orderBeingPaid: Order) => {
        try {
            const finalOrder: Order = {
                ...orderBeingPaid,
                payments,
                balanceDue: 0,
                status: 'completed',
                completedAt: Date.now()
            };

            if (finalOrder.id.startsWith('settle_')) {
                const originalIds = finalOrder.originalOrderIds || [];
                setOrders(prev => {
                    const otherOrders = prev.filter(o => !originalIds.includes(o.id));
                    const updatedOriginals = prev.filter(o => originalIds.includes(o.id)).map(o => ({ ...o, status: 'completed' as OrderStatus, completedAt: Date.now() }));
                    return [...otherOrders, ...updatedOriginals];
                });
            } else {
                 setOrders(prev => [...prev.filter(o => o.id !== finalOrder.id), finalOrder]);
            }
            
            if (settings.advancedPOS?.inventoryManagement) {
                setIngredients(prevIngredients => {
                    const newIngredients = JSON.parse(JSON.stringify(prevIngredients));
                    finalOrder.cart.forEach(cartItem => {
                        const recipe = recipes[cartItem.menuItem.id];
                        if (recipe) {
                            recipe.forEach(recipeItem => {
                                const ingIndex = newIngredients.findIndex((ing: Ingredient) => ing.id === recipeItem.ingredientId);
                                if (ingIndex > -1) {
                                    const prevIng = ingredients.find(i => i.id === newIngredients[ingIndex].id);
                                    newIngredients[ingIndex].stock -= recipeItem.quantity * cartItem.quantity;
                                    
                                    if (prevIng && prevIng.stock > prevIng.reorderThreshold && newIngredients[ingIndex].stock <= prevIng.reorderThreshold) {
                                        const message = `${newIngredients[ingIndex].name} is low on stock (${newIngredients[ingIndex].stock} ${newIngredients[ingIndex].unit} remaining).`;
                                        setNotifications(prev => [{ id: Date.now(), message, timestamp: Date.now(), read: false, type: 'info' }, ...prev]);
                                        if (settings.advancedPOS?.sendLowStockEmails && settings.advancedPOS?.lowStockEmailRecipients) {
                                            console.log(`SIMULATING EMAIL to ${settings.advancedPOS.lowStockEmailRecipients}: Low Stock Alert - ${message}`);
                                            addToast({ type: 'info', title: 'Low Stock Email Sent', message: `An alert for ${newIngredients[ingIndex].name} was sent.` });
                                        }
                                    }
                                }
                            });
                        }
                    });
                    return newIngredients;
                });
            }

            if (finalOrder.tableId) {
                setTables(prev => prev.map(t => t.id === finalOrder.tableId ? { ...t, status: 'available' as const, orderId: undefined, occupiedSince: undefined, customerName: undefined, guestCount: undefined } : t));
            }
            
            if (finalOrder.orderType === 'tab') {
                 setActiveTab(null);
            }

            setLastCompletedOrder(finalOrder);
            if (finalOrder.orderType === 'takeaway' || finalOrder.orderType === 'kiosk') {
                setCalledOrderNumber(finalOrder.orderNumber);
            }

            if (settings.advancedPOS?.printReceiptAfterPayment) onDirectPrintReceipt(finalOrder);

            resetPosState();
            return finalOrder; 
        } catch(error) {
            console.error("Error finalizing payment:", error);
            addToast({ type: 'error', title: 'Payment Error', message: 'Failed to finalize and save the order.' });
            addToast({ type: 'error', title: 'Critical Payment Error', message: `Critical error during payment for order ${orderBeingPaid.orderNumber}.` });
            return orderBeingPaid;
        }
    };
    
    const handleSettleBill = () => {};
    const handleInitiateSettlePayment = () => {};

    const handleInitiatePayment = () => {
        if (cart.length === 0) {
            addToast({ type: 'error', title: 'Empty Cart', message: 'Cannot process payment for an empty cart.' });
            return;
        }
        if (orderType === 'delivery' && !selectedCustomer) {
            addToast({ type: 'error', title: 'Customer Required', message: 'Delivery orders require a customer to be selected.' });
            return;
        }

        try {
            const currentLocation = locations.find(l => l.id === currentLocationId)!;
            const { subtotal, tax, total, taxDetails, finalAppliedDiscount, surchargeDetails, loyaltyDiscountAmount } = calculateOrderTotals(cart, currentLocation, appliedDiscount, appliedPromotion, orderType, settings, selectedCustomer, surcharges, appliedLoyaltyPoints);
            
            const orderToPay: Order = {
                id: `ord_${Date.now()}`,
                orderNumber: String(settings.orderSettings.nextDailyOrderNumber).padStart(4, '0'),
                invoiceNumber: `${settings.orderSettings.invoicePrefix}${settings.orderSettings.nextInvoiceNumber}`,
                createdAt: Date.now(),
                cart: cart,
                customer: selectedCustomer || undefined,
                employeeId: currentEmployee?.id,
                subtotal, tax, total, taxDetails,
                balanceDue: total,
                orderType,
                status: 'pending',
                source: 'in-store',
                payments: [],
                locationId: currentLocationId,
                isTraining: false,
                appliedDiscount: finalAppliedDiscount,
                appliedPromotion: appliedPromotion || undefined,
                appliedLoyaltyPoints: loyaltyDiscountAmount > 0 ? appliedLoyaltyPoints : undefined,
                guestCount: orderType === 'dine-in' ? currentTable?.guestCount : undefined,
                notes: '',
            };
            
            setSettings(prev => ({
                ...prev,
                orderSettings: {
                    ...prev.orderSettings,
                    nextDailyOrderNumber: prev.orderSettings.nextDailyOrderNumber + 1,
                    nextInvoiceNumber: prev.orderSettings.nextInvoiceNumber + 1
                }
            }));

            if (settings.advancedPOS.confirmPayment) {
                const cardPlugin = plugins.find(p => p.id === 'payment-terminal');
                openModal('payment', {
                    orderToPay: [orderToPay],
                    onFinalize: (payments: Payment[]) => handleFinalizePayment(payments, orderToPay),
                    onDirectPrintReceipt,
                    onPrintA4: (order: Order) => addPrintJobs([{ component: 'A4Invoice', props: { order, location: currentLocation, settings, employees } }]),
                    cardPlugin,
                    allPaymentTypes: paymentTypes,
                    currency: currentLocation.currency,
                    settings,
                    setSettings,
                    addToast,
                });
            } else {
                // Directly finalize with the default payment method
                const defaultPayments: Payment[] = [{
                    method: settings.preferences.defaultPaymentMethod,
                    amount: total,
                    timestamp: Date.now()
                }];
                handleFinalizePayment(defaultPayments, orderToPay);
            }
        } catch(e) {
            console.error(e);
            addToast({ type: 'error', title: 'Payment Error', message: 'Could not initiate payment.' });
        }
    };
    
    const handleSaveTab = async () => {
      if (!cart || cart.length === 0) {
        addToast({ type: "error", title: "Empty Cart", message: "There are no new items to save to the tab." });
        return;
      }
    
      if (!selectedCustomer) {
        addToast({ type: 'error', title: 'Customer Required', message: 'Please select a customer to open or add to a tab.' });
        return;
      }
    
      const saveOrderToTab = () => new Promise<void>((resolve, reject) => {
        setTimeout(() => {
          try {
            if (activeTab) {
              const updatedCart = [...activeTab.cart, ...cart];
              const { subtotal, tax, total, taxDetails } = calculateOrderTotals(updatedCart, locations.find(l => l.id === currentLocationId)!, null, null, 'tab', settings, selectedCustomer, surcharges);
              const updatedTab: Order = { ...activeTab, cart: updatedCart, subtotal, tax, total, taxDetails, balanceDue: total - activeTab.payments.reduce((sum, p) => sum + p.amount, 0) };
              setOrders(prev => prev.map(o => o.id === updatedTab.id ? updatedTab : o));
              setActiveTab(updatedTab);
            } else {
              const { subtotal, tax, total, taxDetails } = calculateOrderTotals(cart, locations.find(l => l.id === currentLocationId)!, null, null, 'tab', settings, selectedCustomer, surcharges);
              const newTab: Order = {
                id: `ord_tab_${Date.now()}`,
                orderNumber: 'T-' + String(settings.orderSettings.nextDailyOrderNumber).padStart(4, '0'),
                invoiceNumber: '', createdAt: Date.now(), cart, customer: selectedCustomer, employeeId: currentEmployee?.id,
                subtotal, tax, total, taxDetails, balanceDue: total, orderType: 'tab', status: 'partially-paid', source: 'in-store', payments: [], locationId: currentLocationId, isTraining: false, appliedDiscount: null
              };
              setOrders(prev => [...prev, newTab]);
              setActiveTab(newTab);
              setSettings(prev => ({
                  ...prev,
                  orderSettings: {
                      ...prev.orderSettings,
                      nextDailyOrderNumber: prev.orderSettings.nextDailyOrderNumber + 1
                  }
              }));
            }
            resolve();
          } catch(e) {
            reject(e);
          }
        }, 300);
      });
    
      try {
        await saveOrderToTab();
        addToast({ type: 'success', title: 'Tab Updated', message: `Items added to ${selectedCustomer.name}'s tab.` });
        resetPosState(false)
      } catch (error) {
        console.error("Error saving tab:", error);
        addToast({ type: 'error', title: 'Save Failed', message: 'Could not save the tab.' });
      }
    };
    
     const handleVoidOrder = () => {
        if (cart.length === 0 && !activeOrderToSettle) {
            addToast({ type: 'info', title: 'Nothing to Void', message: 'The current order is empty.' });
            return;
        }
        try {
            openModal('voidOrder', {
                onConfirm: (reason: string) => {
                    addToast({ type: 'success', title: 'Order Voided', message: `Reason: ${reason}` });
                    resetPosState(false);
                    closeModal();
                },
            });
        } catch(e) {
             console.error("Error voiding order:", e);
             addToast({ type: 'error', title: 'Void Failed', message: 'Could not void the order.' });
             addToast({ type: 'error', title: 'Void Error', message: 'An attempt to void an order failed unexpectedly.' });
        }
    };

     const handleHoldOrder = useCallback(() => {
        if (cart.length === 0) {
            addToast({ type: 'error', title: 'Empty Cart', message: 'Cannot hold an empty order.' });
            return;
        }
        const newHeldOrder: HeldOrder = {
            id: `held_${Date.now()}`,
            timestamp: Date.now(),
            cart,
            customer: selectedCustomer,
            table: currentTable,
            appliedDiscount,
            appliedPromotion,
            employeeName: currentEmployee?.name || 'Unknown',
            orderType,
        };
        setHeldOrders(prev => [...prev, newHeldOrder]);
        addToast({ type: 'success', title: 'Order Held', message: 'The current order has been saved for later.' });
        resetPosState(false);
    }, [cart, selectedCustomer, currentTable, appliedDiscount, appliedPromotion, currentEmployee, orderType, setHeldOrders, addToast, resetPosState]);

    const handleReopenOrder = useCallback((id: string) => {
        const orderToReopen = heldOrders.find(o => o.id === id);
        if (orderToReopen) {
            setCart(orderToReopen.cart);
            setSelectedCustomer(orderToReopen.customer);
            setCurrentTable(orderToReopen.table);
            setOrderType(orderToReopen.orderType);
            setAppliedDiscount(orderToReopen.appliedDiscount);
            setAppliedPromotion(orderToReopen.appliedPromotion || null);
            setHeldOrders(prev => prev.filter(o => o.id !== id));
            closeModal();
        }
    }, [heldOrders, setHeldOrders, setCart, setSelectedCustomer, setCurrentTable, setOrderType, setAppliedDiscount, setAppliedPromotion, closeModal]);

    const handleDeleteHeldOrder = useCallback((id: string) => {
        setHeldOrders(prev => prev.filter(o => o.id !== id));
    }, [setHeldOrders]);
    
    // KDS & Kiosk Actions (previously via BroadcastChannel)
    const onCompleteKdsOrder = (orderId: string) => {
        setOrders(prev => prev.map(o => {
            if (o.id === orderId) {
                let newStatus: OrderStatus = 'completed'; // default for takeaway
                if (o.orderType === 'dine-in') newStatus = 'served';
                
                addToast({ type: 'success', title: 'Order Prepared', message: `Order #${o.orderNumber} is ready.` });
                return { ...o, status: newStatus };
            }
            return o;
        }));
    };

    const onTogglePreparedItem = (orderId: string, cartId: string) => {
        setOrders(prev => prev.map(o => {
            if (o.id === orderId) {
                const preparedIds = o.preparedCartItemIds || [];
                const newPreparedIds = preparedIds.includes(cartId)
                    ? preparedIds.filter(id => id !== cartId)
                    : [...preparedIds, cartId];
                return { ...o, preparedCartItemIds: newPreparedIds };
            }
            return o;
        }));
    };

    const handleKioskOrderPlaced = (kioskCart: CartItem[]): Order | null => {
        if (!kioskCart || kioskCart.length === 0) return null;
        const currentLocation = locations.find(l => l.id === currentLocationId)!;
        const { subtotal, tax, total, taxDetails } = calculateOrderTotals(kioskCart, currentLocation, null, null, 'kiosk', settings, null, surcharges);
        const newOrderNumber = 'K-' + String(settings.orderSettings.nextDailyOrderNumber).padStart(4, '0');
        const newOrder: Order = {
            id: `ord_kiosk_${Date.now()}`,
            orderNumber: newOrderNumber,
            invoiceNumber: '',
            createdAt: Date.now(),
            cart: kioskCart,
            employeeId: 'emp_kiosk',
            subtotal,
            tax,
            total,
            taxDetails,
            balanceDue: 0, // Kiosk orders are pre-paid
            orderType: 'kiosk',
            status: 'kitchen',
            source: 'kiosk',
            payments: [{ method: 'Card', amount: total, timestamp: Date.now() }],
            locationId: currentLocationId,
            isTraining: false,
            appliedDiscount: null,
        };
        setOrders(prev => [...prev, newOrder]);
        setSettings(prev => ({ ...prev, orderSettings: { ...prev.orderSettings, nextDailyOrderNumber: prev.orderSettings.nextDailyOrderNumber + 1 }}));
        addToast({ type: 'success', title: 'Kiosk Order Received', message: `New order #${newOrder.orderNumber} is in the kitchen.` });
        
        // This is for the Kiosk modal itself to know the order number
        channel.postMessage({ type: 'KIOSK_ORDER_CONFIRMED', payload: { orderNumber: newOrder.orderNumber } });
        return newOrder;
    };

    // Broadcast Channel Logic for other windows (QR ordering, KDS/CFD/etc if they remain open)
    useEffect(() => {
        const broadcastState = () => {
            const fullState = {
                allSettings: settings,
                allMenuItems: menuItems,
                allLocations: locations,
                allTables: tables,
                allOrders: orders,
                currentLocationId: currentLocationId,
                lastCompletedOrder: lastCompletedOrder,
                calledOrderNumber: calledOrderNumber,
                currentCart: cart,
                currentOrderType: orderType,
                allSignagePlaylists: signagePlaylists,
                allSignageContent: signageContent,
            };
            try { channel.postMessage({ type: 'STATE_SYNC', payload: fullState }); } 
            catch (error) { console.error("BroadcastChannel postMessage failed:", error); }
        };

        const handleMessage = (event: MessageEvent) => {
            const { type, payload } = event.data;
            switch (type) {
                case 'REQUEST_STATE':
                    broadcastState();
                    break;
                case 'QR_ORDER_PLACED': {
                    const { cart: qrCart, customer: qrCustomer, tableId: qrTableId, locationId: qrLocationId } = payload;
                    if (!qrCart || qrCart.length === 0) break;
                    let customerRecord = customers.find((c: Customer) => c.phone === qrCustomer.phone);
                    if (!customerRecord) {
                        customerRecord = { id: `cust_${Date.now()}`, name: qrCustomer.name, phone: qrCustomer.phone, email: '', address: '', locationId: qrLocationId };
                        setCustomers(prev => [...prev, customerRecord!]);
                    }
                    const currentLocation = locations.find(l => l.id === qrLocationId)!;
                    const { subtotal, tax, total, taxDetails } = calculateOrderTotals(qrCart, currentLocation, null, null, 'dine-in', settings, customerRecord, surcharges);
                    const newOrderNumber = String(settings.orderSettings.nextDailyOrderNumber).padStart(4, '0');
                    const newOrder: Order = {
                        id: `ord_${Date.now()}`, orderNumber: newOrderNumber, invoiceNumber: '', createdAt: Date.now(), cart: qrCart,
                        customer: customerRecord, employeeId: 'qr_system', subtotal, tax, total, taxDetails, balanceDue: 0,
                        orderType: 'dine-in', status: 'kitchen', source: 'qr_ordering', payments: [{ method: 'Online', amount: total, timestamp: Date.now() }],
                        locationId: qrLocationId, tableId: qrTableId, isTraining: false, appliedDiscount: null,
                    };
                    setOrders(prev => [...prev, newOrder]);
                    setTables(prev => prev.map(t => t.id === qrTableId ? { ...t, status: 'occupied', orderId: newOrder.id } : t));
                    setSettings(prev => ({ ...prev, orderSettings: { ...prev.orderSettings, nextDailyOrderNumber: prev.orderSettings.nextDailyOrderNumber + 1 }}));
                    addToast({ type: 'success', title: 'QR Order Received', message: `New order #${newOrder.orderNumber} for table ${qrTableId}.` });
                    channel.postMessage({ type: 'QR_ORDER_CONFIRMED', payload: { orderNumber: newOrder.orderNumber } });
                    break;
                }
            }
        };
        channel.addEventListener('message', handleMessage);
        broadcastState(); // Initial broadcast
        
        // Also broadcast on any significant state change
        const intervalId = setInterval(broadcastState, 2000); // Broadcast every 2 seconds

        return () => {
            channel.removeEventListener('message', handleMessage);
            clearInterval(intervalId);
        };
    }, [
        settings, lastCompletedOrder, menuItems, signagePlaylists, signageContent,
        currentLocationId, locations, tables, orders, calledOrderNumber, customers,
        cart, orderType,
        setOrders, addToast, setSettings, surcharges, currentEmployee, setCustomers, setTables
    ]);


     const handleGetUpsellSuggestions = useCallback(async () => {
        if (!process.env.API_KEY || cart.length === 0) return;
        setIsSuggestingUpsell(true);
        setAiUpsellSuggestions(null);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const cartItemsText = cart.map(item => `${item.quantity}x ${item.menuItem.name}`).join(', ');
            const prompt = `Based on a customer's current order (${cartItemsText}), suggest two relevant items to upsell. Provide a very brief reason for each suggestion. The goal is to increase the order value with items that complement the current selection.`;
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: {
                    responseMimeType: 'application/json',
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            suggestions: {
                                type: Type.ARRAY,
                                items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        itemName: { type: Type.STRING },
                                        reason: { type: Type.STRING }
                                    },
                                    required: ['itemName', 'reason']
                                }
                            }
                        },
                        required: ['suggestions']
                    }
                }
            });
            setAiUpsellSuggestions(JSON.parse(response.text));
        } catch (error) {
            console.error("AI Upsell failed:", error);
            addToast({ type: 'error', title: 'AI Error', message: 'Could not fetch upsell suggestions.' });
        } finally {
            setIsSuggestingUpsell(false);
        }
    }, [cart, addToast]);

    const onSelectItem = useCallback((item: MenuItem) => {
        if(item.modifierGroupIds && item.modifierGroupIds.length > 0) {
            openModal('modifier', { item, onAddItem: (itemWithMods: MenuItem, mods: ModifierOption[]) => {
                const newCartItem: CartItem = {
                    cartId: `${Date.now()}-${Math.random()}`,
                    menuItem: itemWithMods,
                    quantity: 1,
                    selectedModifiers: mods
                };
                setCart(prev => [...prev, newCartItem]);
            }, language: settings.language.staff });
        } else {
            setCart(prevCart => {
                const existingItem = prevCart.find(ci => ci.menuItem.id === item.id && ci.selectedModifiers.length === 0);
                if (existingItem) {
                    return prevCart.map(ci => ci.cartId === existingItem.cartId ? { ...ci, quantity: ci.quantity + 1 } : ci);
                }
                const newCartItem: CartItem = {
                    cartId: `${Date.now()}-${Math.random()}`, menuItem: item, quantity: 1, selectedModifiers: []
                };
                return [...prevCart, newCartItem];
            });
        }
    }, [openModal, settings.language.staff]);
    
    const onSelectUpsellSuggestion = useCallback((itemName: string) => {
        const itemToAdd = menuItems.find((item: MenuItem) => item.name === itemName);
        if (itemToAdd) {
            onSelectItem(itemToAdd);
            addToast({ type: 'success', title: 'Item Added', message: `${itemName} added to cart.` });
        } else {
            addToast({ type: 'error', title: 'Item Not Found', message: `Could not find "${itemName}" in the menu.` });
        }
        setAiUpsellSuggestions(null); // Hide suggestions after one is selected
    }, [menuItems, onSelectItem, addToast]);


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
        toasts, addToast,
        dismissToast: (id: number) => setToasts(prev => prev.filter(t => t.id !== id)),
        modal, openModal, closeModal,
        cart, setCart,
        orderType, setOrderType,
        selectedCustomer, setSelectedCustomer,
        orders, setOrders,
        currentTable, setCurrentTable,
        searchQuery, onSearchChange: setSearchQuery,
        activeCategory, setActiveCategory,
        isSuggestingUpsell, setIsSuggestingUpsell,
        aiUpsellSuggestions, setAiUpsellSuggestions,
        heldOrders, setHeldOrders,
        handleHoldOrder,
        handleReopenOrder,
        handleDeleteHeldOrder,
        activeOrderToSettle, setActiveOrderToSettle,
        selectedStaff, setSelectedStaff,
        activeTab, setActiveTab,
        appliedLoyaltyPoints, setAppliedLoyaltyPoints,
        isSidebarHidden, onToggleSidebar,
        isSidebarCollapsed, onToggleSidebarCollapse: () => setIsSidebarCollapsed(p => !p),
        plugins, setPlugins,
        isWaitlistPluginActive,
        isReservationPluginActive,
        isMultiStorePluginActive,
        isKsaPluginActive,
        isOrderNumberDisplayPluginActive,
        isQRCodePluginActive,
        onToggleClockStatus,
        onSelectItem,
        waitlist, setWaitlist,
        onUpdateWaitlistStatus,
        onAddToWaitlist: () => openModal('waitlist', { 
            onSave: (entry: Omit<WaitlistEntry, 'id'|'status'|'addedAt'|'locationId'>) => {
                setWaitlist(p => [...p, {...entry, id: `w_${Date.now()}`, status: 'Waiting', addedAt: Date.now(), locationId: currentLocationId}]);
                closeModal();
            },
            onSuggestWaitTime: async () => '15-20 minutes'
        }),
        onSeatWaitlistParty: (id: string) => {
            onUpdateWaitlistStatus(id, 'Seated');
            addToast({type: 'success', title: 'Party Seated', message: 'The party has been seated.'});
        },
        handlePinLogin,
        handleLogout,
        // Expose all states and handlers
        locations,
        categories,
        categoriesWithCounts,
        menuItems,
        customers,
        drivers,
        employees,
        suppliers,
        wastageLog,
        roles,
        auditLog,
        printers,
        handleSavePrinter,
        handleDeletePrinter,
        tables,
        subscriptions,
        purchaseOrders,
        schedule,
        reservations,
        ingredients,
        recipes,
        signageDisplays,
        signageContent,
        signagePlaylists,
        signageSchedule,
        paymentTypes,
        modifierGroups,
        kitchenDisplays,
        kitchenNotes,
        voidReasons,
        manualDiscounts,
        surcharges,
        customerDisplays,
        scales,
        callLog,
        printQueue,
        setPrintQueue,
        addPrintJobs,
        updatePrintJobStatus,
        notifications,
        isFullscreen, onToggleFullScreen, onLaunchView,
        // Core POS Handlers
        onNewSaleClick,
        handleSendToKitchen,
        handleInitiatePayment,
        handlePlaceOrder: handleInitiatePayment,
        handleSaveTab,
        handleVoidOrder,
        handleFinalizePayment,
        handleSettleBill,
        handleInitiateSettlePayment,
        handleGetUpsellSuggestions,
        onSelectUpsellSuggestion,
        onCompleteKdsOrder,
        onTogglePreparedItem,
        handleKioskOrderPlaced,
        lastCompletedOrder,
    }), [
        activeView, managementSubView, settingsSubView, currentEmployee, currentLocationId, locations, theme, settings, toasts, modal, cart, orderType, selectedCustomer, orders, currentTable, searchQuery, activeCategory, isSuggestingUpsell, aiUpsellSuggestions, heldOrders, onNewSaleClick, activeOrderToSettle, selectedStaff, activeTab, appliedLoyaltyPoints, isSidebarHidden, isSidebarCollapsed, plugins, isWaitlistPluginActive, isReservationPluginActive, isMultiStorePluginActive, isKsaPluginActive, isOrderNumberDisplayPluginActive, isQRCodePluginActive, onToggleClockStatus, waitlist, onUpdateWaitlistStatus, handlePinLogin, handleLogout, printQueue, notifications, isFullscreen, onToggleFullScreen, onLaunchView, updatePrintJobStatus, addPrintJobs, openModal, closeModal, addToast,
        categories, categoriesWithCounts, menuItems, customers, drivers, employees, suppliers, wastageLog, roles, auditLog, printers, tables, subscriptions, purchaseOrders, schedule, reservations, ingredients, recipes, signageDisplays, signageContent, signagePlaylists, signageSchedule, paymentTypes, modifierGroups, kitchenDisplays, kitchenNotes, voidReasons, manualDiscounts, surcharges, customerDisplays, scales, callLog, handleSendToKitchen, handleInitiatePayment, handleSaveTab, handleVoidOrder, handleFinalizePayment, handleSettleBill, handleInitiateSettlePayment, handleSavePrinter, handleDeletePrinter, handleHoldOrder, handleReopenOrder, handleDeleteHeldOrder, onToggleTheme, handleGetUpsellSuggestions, onSelectItem, onSelectUpsellSuggestion, lastCompletedOrder
    ]);

    return (
        <AppContext.Provider value={contextValue}>
            {children}
        </AppContext.Provider>
    );
};