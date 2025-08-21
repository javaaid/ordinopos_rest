
import React, { createContext, useContext, useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { LOCATIONS, CATEGORIES, MENU_ITEMS, CUSTOMERS, DRIVERS, EMPLOYEES, SUPPLIERS, WASTAGE_LOG, ROLES, AUDIT_LOG, PRINTERS, TABLES, SUBSCRIPTIONS, PURCHASE_ORDERS, PLUGINS, SCHEDULE, RESERVATIONS, INGREDIENTS, RECIPES, SIGNAGE_DISPLAYS, SIGNAGE_CONTENT, SIGNAGE_PLAYLISTS, SIGNAGE_SCHEDULE, ACTIVATION_CODES, PAYMENT_TYPES, PIZZA_OPTIONS, PROMOTIONS, MODIFIER_GROUPS, KITCHEN_DISPLAYS, KITCHEN_NOTES, VOID_REASONS, MANUAL_DISCOUNTS, SURCHARGES, CUSTOMER_DISPLAYS, SCALES, CALL_LOG, DEFAULT_KITCHEN_PRINT_SETTINGS, DEFAULT_RECEIPT_SETTINGS, KITCHEN_PROFILE_NAMES } from '../constants';
import { MenuItem, CartItem, ModifierOption, Customer, Order, Driver, OrderType, OrderSource, Employee, Location, PaymentMethod, Shift, AppliedDiscount, AIResponse, WastageEntry, Supplier, AIEstimatedWaitTime, Role, AIRoleSuggestion, AuditLogEntry, Notification, Language, ReportSchedule, Printer, ToastNotification, SimulationLogEntry, SimulationReport, Table, Subscription, PurchaseOrder, AIFloorPlanSuggestion, AIBusyZoneAnalysis, AIInvoiceWarning, AILoyaltyResponse, AppSettings, View, ManagementSubView, SettingsSubView, AppPlugin, ScheduleEntry, Reservation, ReservationStatus, Ingredient, RecipeItem, SignageDisplay, SignageContentItem, SignagePlaylist, SignageScheduleEntry, WaitlistEntry, WaitlistStatus, Theme, Payment, TableStatus, OrderStatus, PaymentType, ReceiptSettings, ZatcaSettings, PizzaConfiguration, BurgerConfiguration, Category, Promotion, HeldOrder, ModifierGroup, KitchenDisplay, KitchenNote, VoidReason, ManualDiscount, Surcharge, POSPreferences, GenericDevice, CustomerDisplay, CallLogEntry, PizzaToppingItem, KitchenPrintSettings, KitchenProfileType, PrintJob, PrintJobStatus, CSVImportResult, CsvImportFunction } from '../types';
import { calculateOrderTotals, getPriceForItem, isItemOutOfStock } from '../utils/calculations';

// #region Context Creation
const AppContext = createContext<any>(null);
const DataContext = createContext<any>(null);
const POSContext = createContext<any>(null);
const ModalContext = createContext<any>(null);
const ToastContext = createContext<any>(null);
// #endregion

export const useAppContext = () => useContext(AppContext);
export const useDataContext = () => useContext(DataContext);
export const usePOSContext = () => useContext(POSContext);
export const useModalContext = () => useContext(ModalContext);
export const useToastContext = () => useContext(ToastContext);

// #region Persistence
const isObject = (item: any): item is { [key: string]: any } => (item && typeof item === 'object' && !Array.isArray(item));

const isObjectWithId = (item: any): item is { id: any; [key: string]: any } => {
  return isObject(item) && 'id' in item;
};

const safeMerge = (defaultValue: any, storedValue: any): any => {
    if (Array.isArray(defaultValue) && Array.isArray(storedValue)) {
        if (storedValue.length === 0 && defaultValue.length > 0) {
            return defaultValue;
        }

        const storedItemsById = new Map<any, any>(
            storedValue.filter(isObjectWithId).map(item => [item.id, item])
        );

        if (storedItemsById.size === 0 && storedValue.length > 0) {
            return storedValue;
        }
        
        const defaultItemsById = new Map<any, any>(
            defaultValue.filter(isObjectWithId).map(item => [item.id, item])
        );

        const merged = defaultValue.map(defaultItem => {
            if (isObjectWithId(defaultItem) && storedItemsById.has(defaultItem.id)) {
                return safeMerge(defaultItem, storedItemsById.get(defaultItem.id));
            }
            return defaultItem;
        });

        storedValue.forEach(storedItem => {
            if (isObjectWithId(storedItem) && !defaultItemsById.has(storedItem.id)) {
                merged.push(storedItem); // Add user-created data that's not in defaults
            }
        });
        
        return merged;
    }

    if (isObject(defaultValue) && isObject(storedValue)) {
        const output = { ...defaultValue };
        for (const key in defaultValue) {
            if (Object.prototype.hasOwnProperty.call(storedValue, key)) {
                const defaultVal = defaultValue[key];
                const storedVal = storedValue[key];
                
                if ((isObject(defaultVal) && isObject(storedVal)) || (Array.isArray(defaultVal) && Array.isArray(storedVal))) {
                    output[key] = safeMerge(defaultVal, storedVal);
                } else if (storedVal !== undefined) {
                    output[key] = storedVal;
                }
            }
        }
         for (const key in storedValue) {
             if (!Object.prototype.hasOwnProperty.call(defaultValue, key)) {
                 output[key] = storedValue[key];
             }
        }
        return output;
    }
    
    return storedValue !== undefined ? storedValue : defaultValue;
};


const getInitialState = <T,>(key: string, defaultValue: T): T => {
    try {
        const item = window.localStorage.getItem(key);
        if (item) {
            const storedState = JSON.parse(item);
            if (storedState === null) {
                window.localStorage.setItem(key, JSON.stringify(defaultValue));
                return defaultValue;
            }
            return safeMerge(defaultValue, storedState);
        } else {
            window.localStorage.setItem(key, JSON.stringify(defaultValue));
            return defaultValue;
        }
    } catch (error) {
        console.warn('Error reading localStorage key ' + key + ':', error);
        window.localStorage.setItem(key, JSON.stringify(defaultValue));
        return defaultValue;
    }
};

const usePersistentState = <T,>(key: string, defaultValue: T): [T, React.Dispatch<React.SetStateAction<T>>] => {
    const [state, setState] = useState<T>(() => getInitialState(key, defaultValue));

    const setAndPersistState: React.Dispatch<React.SetStateAction<T>> = (value) => {
        setState(prevState => {
            const newState = value instanceof Function ? value(prevState) : value;
            try {
                window.localStorage.setItem(key, JSON.stringify(newState));
            } catch (error) {
                console.error('Error writing to localStorage for key ' + key + ':', error);
            }
            return newState;
        });
    };

    return [state, setAndPersistState];
};
// #endregion

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // #region ========== STATE DEFINITIONS ==========
    // --- App State ---
    const [activeView, setActiveView] = usePersistentState<View>('activeView', 'landing');
    const [managementSubView, setManagementSubView] = usePersistentState<ManagementSubView>('managementSubView', 'menu_products');
    const [settingsSubView, setSettingsSubView] = usePersistentState<SettingsSubView>('settingsSubView', 'integrations');
    const [currentEmployee, setCurrentEmployee] = usePersistentState<Employee | null>('currentEmployee', null);
    const [currentLocationId, setCurrentLocationId] = usePersistentState<string>('currentLocationId', LOCATIONS[0].id);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = usePersistentState('isSidebarCollapsed', true);
    const [theme, setTheme] = usePersistentState<Theme>('appTheme', 'light');
    const [isSidebarHidden, setIsSidebarHidden] = usePersistentState('isSidebarHidden', false);

    const [settings, setSettings] = usePersistentState<AppSettings>('appSettings', {
        paymentProvider: 'none', paymentTerminalSecretKey: '', terminalId: '', accountingSoftware: 'none', quickbooksApiKey: '', xeroApiKey: '',
        reservationSystem: 'none', opentableApiKey: '', googleReservationsApiKey: '',
        orderSettings: { gratuityOptions: [15, 18, 20], invoicePrefix: 'INV-', invoiceSuffix: '', nextInvoiceNumber: 1, nextDailyOrderNumber: 1, dailyOrderSequenceLastReset: new Date().toISOString().split('T')[0] },
        dualCurrency: { enabled: false, secondaryCurrency: 'USD', exchangeRate: 1 },
        zatca: { enabled: false, productionCert: '', productionCSR: '', isSandbox: true, fatooraApiKey: '', qrCodeSize: 128, qrCodePosition: 'bottom' },
        receipt: { ...DEFAULT_RECEIPT_SETTINGS, logoUrl: 'https://raw.githubusercontent.com/ordino-pos/ordino-pos-media/main/logo-dark.png', promoMessage: 'Thank you!', template: 'standard' },
        invoice: { template: 'modern' },
        theme: { primary: '#2563eb', background: '#f4f4f5', surface: '#ffffff', textBase: '#111827', textMuted: '#6b7280' },
        language: { staff: 'en', customer: 'en' },
        deliveryApps: { uberEats: { enabled: false, apiKey: '' }, doordash: { enabled: false, apiKey: '' } },
        iotSensors: { smartFridges: { enabled: false, apiKey: '' }, storageSensors: { enabled: false, apiKey: '' } },
        ai: { enableAIFeatures: true, enableUpsell: true, enableCFDSuggestions: true, enableReportAnalysis: true },
        cfd: { attractScreenPlaylistId: null, featuredItemIds: [] },
        notificationSettings: { duration: 8, position: 'top-right', theme: 'dark' },
        dineIn: { enabled: true, defaultGuests: 2, maxGuests: 20, enableStaffSelection: true, surcharge: { enabled: false, name: 'Service Charge', type: 'percentage', value: 10 }, minCharge: { enabled: false, amount: 15 } },
        delivery: { enabled: true, surcharge: { enabled: false, surchargeId: null }, zones: [{id: 'zone1', name: 'Local', fee: 5 }] },
        takeAway: { enabled: true, customName: 'Take Away', requireCustomerName: true, useHoldReason: false, surcharge: { enabled: false, name: 'Packaging Fee', type: 'fixed', value: 0.50 } },
        tab: { enabled: true, customName: 'Tab' },
        devices: { receiptPrinterId: 'p1', kitchenPrinterId: 'kp1', kioskPrinterId: 'p1', barPrinterId: null, reportPrinterId: 'p4', customerDisplayId: 'cd1', kitchenDisplayId: 'kds_1', scaleId: 'sc1', printServerUrl: 'http://localhost:3000' },
        advancedPOS: { enableItemNumber: false, separateSameItems: false, combineKitchenItems: true, kitchenPrintFooter: false, kitchenPrintReservedOrder: true, sortItemInKitchen: true, sortModifier: true, sortOrderInKDS: true, printVoidOrderItem: true, printOrderAfterSending: false, quickPay: true, useVoidReason: true, confirmPayment: false, printReceiptAfterPayment: true, combineReceiptItem: true, sortItemInReceipt: true, showItemDiscount: true, showVoidOrderItem: false, emailReceipt: true, showTaxOnReceipt: true, inventoryManagement: true, allowMinusQuantity: false, useInventoryPrint: false, useEndOfDayReport: true, useStaffSalary: false, useCashInOutPrint: false, useWorkTimePrint: false, autoClockOut: false, loginDoNotRememberPassword: false, dateFormat: 'MM/DD/YYYY', lockTillToLocation: false, enableTimeClock: true },
        preferences: { actionAfterSendOrder: 'order', actionAfterPayment: 'order', defaultPaymentMethod: 'Cash', enableOrderNotes: true, enableKitchenPrint: true, defaultOrderType: 'takeaway', enableOrderHold: true, resetOrderNumberDaily: true, dashboardWidgetOrder: ['stats', 'chart', 'quickActions', 'topItems', 'lowStock', 'recentTransactions'], },
        loyalty: { enabled: true, pointsPerDollar: 100, redemptionRate: 100 },
        fontSettings: { baseSize: 16, menuItemName: 14, menuItemPrice: 14, orderSummaryItem: 14, orderSummaryTotal: 24, categoryTabs: 14 },
    });

    // --- Data States ---
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
    const [plugins, setPlugins] = usePersistentState<AppPlugin[]>('plugins', PLUGINS);
    const [schedule, setSchedule] = usePersistentState<ScheduleEntry[]>('schedule', SCHEDULE);
    const [reservations, setReservations] = usePersistentState<Reservation[]>('reservations', RESERVATIONS);
    const [ingredients, setIngredients] = usePersistentState<Ingredient[]>('ingredients', INGREDIENTS);
    const [recipes, setRecipes] = usePersistentState<Record<number, RecipeItem[]>>('recipes', RECIPES);
    const [signageDisplays, setSignageDisplays] = usePersistentState<SignageDisplay[]>('signageDisplays', SIGNAGE_DISPLAYS);
    const [signageContent, setSignageContent] = usePersistentState<SignageContentItem[]>('signageContent', SIGNAGE_CONTENT);
    const [signagePlaylists, setSignagePlaylists] = usePersistentState<SignagePlaylist[]>('signagePlaylists', SIGNAGE_PLAYLISTS);
    const [signageSchedule, setSignageSchedule] = usePersistentState<SignageScheduleEntry[]>('signageSchedule', SIGNAGE_SCHEDULE);
    const [waitlist, setWaitlist] = usePersistentState<WaitlistEntry[]>('waitlist', []);
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
    const [orders, setOrders] = usePersistentState<Order[]>('orders', []);
    const [heldOrders, setHeldOrders] = usePersistentState<HeldOrder[]>('heldOrders', []);
    const [reportSchedules, setReportSchedules] = usePersistentState<ReportSchedule[]>('reportSchedules', []);
    const [lastCompletedOrder, setLastCompletedOrder] = usePersistentState<Order | null>('lastCompletedOrder', null);
    const [lastReservationSync, setLastReservationSync] = usePersistentState<number | null>('lastReservationSync', null);
    const [lastAccountingSync, setLastAccountingSync] = usePersistentState<number | null>('lastAccountingSync', null);
    const [notifications, setNotifications] = usePersistentState<Notification[]>('notifications', []);
    
    // --- POS State ---
    const [cart, setCart] = useState<CartItem[]>([]);
    const [activeCategory, setActiveCategory] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [currentTable, setCurrentTable] = useState<Table | null>(null);
    const [orderType, setOrderType] = useState<OrderType>(settings.preferences.defaultOrderType);
    const [appliedDiscount, setAppliedDiscount] = useState<AppliedDiscount | null>(null);
    const [appliedPromotion, setAppliedPromotion] = useState<Promotion | null>(null);
    const [aiUpsellSuggestions, setAIUpsellSuggestions] = useState<AIResponse | null>(null);
    const [isSuggestingUpsell, setIsSuggestingUpsell] = useState(false);
    const [selectedStaff, setSelectedStaff] = useState<Employee | null>(null);
    const [activeOrderToSettle, setActiveOrderToSettle] = useState<Order | null>(null);
    const [activeTab, setActiveTab] = useState<Order | null>(null);
    const [appliedLoyaltyPoints, setAppliedLoyaltyPoints] = useState(0);

    // --- Modal State ---
    const [modal, setModal] = useState({ type: null, props: {} });
    const [justAddedCategoryId, setJustAddedCategoryId] = useState<string | null>(null);
    const [justAddedCustomer, setJustAddedCustomer] = useState<Customer | null>(null);

    // --- Toast State ---
    const [toasts, setToasts] = useState<ToastNotification[]>([]);
    const toastId = useRef(0);
    
    // --- UI State ---
    const [printQueue, setPrintQueue] = usePersistentState<PrintJob[]>('printQueue', []);
    const [calledOrderNumber, setCalledOrderNumber] = usePersistentState<string | null>('calledOrderNumber', null);
    const [isFullscreen, setIsFullscreen] = useState(!!document.fullscreenElement);
    
    // #endregion

    // #region ========== DERIVED STATE & MEMOS ==========
    const currentLocation = useMemo(() => {
        const foundLocation = (locations || []).find((l: Location) => l.id === currentLocationId);
        if (foundLocation) return foundLocation;
        if ((locations || []).length > 0) return locations[0];
        return LOCATIONS[0];
    }, [locations, currentLocationId]);

    const isKsaPluginActive = useMemo(() => plugins.some((p: AppPlugin) => p.id === 'e-invoice-ksa' && (p.status === 'enabled' || p.status === 'trial')), [plugins]);
    const isAdvancedInventoryPluginActive = useMemo(() => plugins.some((p: AppPlugin) => p.id === 'advanced-inventory' && (p.status === 'enabled' || p.status === 'trial')), [plugins]);
    const isPizzaBuilderPluginActive = useMemo(() => plugins.some((p: AppPlugin) => p.id === 'pizza-builder' && (p.status === 'enabled' || p.status === 'trial')), [plugins]);
    const isBurgerBuilderPluginActive = useMemo(() => plugins.some((p: AppPlugin) => p.id === 'burger-builder' && (p.status === 'enabled' || p.status === 'trial')), [plugins]);
    
    const floors = useMemo(() => {
        if (!tables) return ['Main Floor'];
        const floorSet = new Set((tables as Table[]).map(t => t.floor).filter(Boolean));
        return floorSet.size > 0 ? Array.from(floorSet).sort() : ['Main Floor'];
    }, [tables]);

    const categoriesWithCounts = useMemo(() => {
        if (!menuItems || !categories) return [];
        const locationMenuItems = menuItems.filter((item: MenuItem) => (item.locationIds || []).includes(currentLocation.id));
        const counts = locationMenuItems.reduce((acc: Record<string, number>, item: MenuItem) => {
            acc[item.category] = (acc[item.category] || 0) + 1;
            return acc;
        }, {});
        return categories.map((cat: Category) => ({ ...cat, itemCount: counts[cat.id] || 0 })).filter((cat: Category) => cat.itemCount > 0);
    }, [categories, menuItems, currentLocation.id]);
    
    const availablePromotions = useMemo(() => {
        const now = new Date();
        const currentTime = String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');
        const currentDay = now.getDay();
        return (promotions || []).filter((p: Promotion) => p.isActive && p.daysOfWeek.includes(currentDay) && p.startTime <= currentTime && p.endTime >= currentTime);
    }, [promotions]);
    // #endregion

    // #region ========== HOOKS & EFFECT ==========
    useEffect(() => {
        const root = window.document.documentElement;
        root.classList.remove('light', 'dark');
        root.classList.add(theme);
    }, [theme]);
    // #endregion

    // #region ========== HANDLER FUNCTIONS ==========
    const addToast = useCallback((toast: Omit<ToastNotification, 'id'>) => {
        const newToast = { ...toast, id: toastId.current++ };
        setToasts(prev => [...prev, newToast]);
    }, [setToasts]);
    
    const openModal = useCallback((type: string, props = {}) => setModal({ type, props }), []);
    const closeModal = useCallback(() => setModal({ type: null, props: {} }), []);
    
    const addLogEntry = useCallback((action: string) => {
        if (currentEmployee) {
            setAuditLog(prev => [...(prev || []), {
                id: `log_${Date.now()}`,
                timestamp: Date.now(),
                employeeId: currentEmployee.id,
                employeeName: currentEmployee.name,
                action,
            }]);
        }
    }, [setAuditLog, currentEmployee]);
    
    const resetCartState = useCallback(() => {
        setCart([]);
        setAppliedDiscount(null);
        setAppliedPromotion(null);
        setAIUpsellSuggestions(null);
        setAppliedLoyaltyPoints(0);
    }, [setCart, setAppliedDiscount, setAppliedPromotion, setAIUpsellSuggestions, setAppliedLoyaltyPoints]);

    const resetPOSState = useCallback(() => {
        resetCartState();
        setSelectedCustomer(null);
        setCurrentTable(null);
        setActiveOrderToSettle(null);
        setActiveTab(null);
        setSelectedStaff(null);
        setOrderType(settings.preferences.defaultOrderType);
        setActiveCategory('all');
    }, [resetCartState, settings.preferences.defaultOrderType]);
    
    const onNewSaleClick = useCallback((): void => {
        if (cart.length > 0 || currentTable || activeOrderToSettle || activeTab) {
            openModal('confirm', {
                title: 'Start New Sale?',
                message: 'This will clear the current order. Are you sure?',
                onConfirm: () => { resetPOSState(); closeModal(); },
            });
        } else {
            resetPOSState();
        }
    }, [cart.length, currentTable, activeOrderToSettle, activeTab, resetPOSState, openModal, closeModal]);
    
    const addPrintJobs = useCallback((jobs: Omit<PrintJob, 'id'|'timestamp'|'status'>[]) => {
        const newJobs = jobs.map(job => ({ ...job, id: `job_${Date.now()}_${Math.random()}`, timestamp: Date.now(), status: 'pending' as PrintJobStatus }));
        setPrintQueue(prev => [...(prev || []), ...newJobs]);
    }, [setPrintQueue]);

    const handleMarkAllNotificationsAsRead = useCallback(() => {
        setNotifications((prev: Notification[]) => (prev || []).map(n => ({...n, read: true})));
    }, [setNotifications]);

    const onToggleTheme = useCallback(() => {
      setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
    }, [setTheme]);

    const handleSaveCustomer = useCallback((customerToSave: Customer, isNew: boolean): void => {
        setCustomers(prev => {
            const prevCustomers = prev || [];
            if (isNew) {
                const newCustomerWithLocation = { ...customerToSave, locationId: currentLocationId };
                addLogEntry(`Created new customer: ${newCustomerWithLocation.name}`);
                setJustAddedCustomer(newCustomerWithLocation);
                return [...prevCustomers, newCustomerWithLocation];
            }
            addLogEntry(`Edited customer: ${customerToSave.name}`);
            return prevCustomers.map(c => c.id === customerToSave.id ? customerToSave : c);
        });
        addToast({ type: 'success', title: 'Customer Saved', message: `${customerToSave.name} has been successfully saved.` });
    }, [setCustomers, addLogEntry, addToast, setJustAddedCustomer, currentLocationId]);

    const onToggleClockStatus = useCallback((employeeId: string) => {
        let updatedEmployee: Employee | undefined;
        setEmployees(prev => {
            const newEmployees = (prev || []).map(emp => {
                if (emp.id === employeeId) {
                    const isClockingIn = emp.shiftStatus === 'clocked-out';
                    const newShifts = [...emp.shifts];
                    
                    if (isClockingIn) {
                        newShifts.push({ clockIn: Date.now() });
                        addLogEntry(`${emp.name} clocked in.`);
                    } else {
                        const lastShift = newShifts[newShifts.length - 1];
                        if (lastShift && !lastShift.clockOut) {
                            lastShift.clockOut = Date.now();
                        }
                        addLogEntry(`${emp.name} clocked out.`);
                    }
                    
                    updatedEmployee = {
                        ...emp,
                        shiftStatus: isClockingIn ? 'clocked-in' : 'clocked-out',
                        shifts: newShifts
                    };
                    return updatedEmployee;
                }
                return emp;
            });
            return newEmployees;
        });

        if (currentEmployee && currentEmployee.id === employeeId && updatedEmployee) {
            setCurrentEmployee(updatedEmployee);
        }
    }, [setEmployees, addLogEntry, currentEmployee, setCurrentEmployee]);

    const onSaveScheduleEntry = useCallback(() => {
        addToast({ type: 'info', title: 'Not Implemented', message: 'Saving schedule entries is not yet implemented.' });
    }, [addToast]);
    
    const onDeleteScheduleEntry = useCallback(() => {
        addToast({ type: 'info', title: 'Not Implemented', message: 'Deleting schedule entries is not yet implemented.' });
    }, [addToast]);
    
    const handleAddPizzaToCart = useCallback((item: MenuItem, config: PizzaConfiguration, finalPrice: number) => {
        const cartItem: CartItem = {
            cartId: `pizza-${Date.now()}`,
            menuItem: item,
            quantity: 1,
            selectedModifiers: [], // Modifiers are part of the configuration
            pizzaConfiguration: config,
            priceOverride: finalPrice,
        };
        setCart(prev => [...prev, cartItem]);
        closeModal();
    }, [setCart, closeModal]);

    const handleAddBurgerToCart = useCallback((item: MenuItem, config: BurgerConfiguration, finalPrice: number) => {
        const cartItem: CartItem = {
            cartId: `burger-${Date.now()}`,
            menuItem: item,
            quantity: 1,
            selectedModifiers: [],
            burgerConfiguration: config,
            priceOverride: finalPrice,
        };
        setCart(prev => [...prev, cartItem]);
        closeModal();
    }, [setCart, closeModal]);

    const onSelectItem = useCallback((item: MenuItem) => {
        const addItemToCart = (finalizedItem: Omit<CartItem, 'cartId'>) => {
            const cartItem: CartItem = {
                ...finalizedItem,
                cartId: `${Date.now()}-${Math.random()}`,
            };
            
            setCart(prev => {
                const canMerge = !cartItem.priceOverride && !cartItem.kitchenNote && (cartItem.selectedModifiers?.length ?? 0) === 0;
                if (canMerge && !settings.advancedPOS.separateSameItems) {
                     const existing = prev.find(ci => 
                        ci.menuItem.id === cartItem.menuItem.id &&
                        !ci.priceOverride &&
                        !ci.kitchenNote &&
                        (ci.selectedModifiers?.length ?? 0) === 0
                    );
                    if (existing) {
                        return prev.map(ci =>
                            ci.cartId === existing.cartId
                                ? { ...ci, quantity: ci.quantity + cartItem.quantity }
                                : ci
                        );
                    }
                }
                return [...prev, cartItem];
            });
        };

        const processNextStep = (
            currentItemConfig: Omit<CartItem, 'cartId' | 'quantity'>,
            quantity: number = 1
        ) => {
            const { menuItem } = currentItemConfig;
            
            const shouldOpenModifiers = (
                menuItem.modifierGroupIds && 
                menuItem.modifierGroupIds.length > 0 &&
                (
                    menuItem.alwaysShowModifiers || 
                    (modifierGroups || []).some((mg: ModifierGroup) => menuItem.modifierGroupIds?.includes(mg.id) && mg.isRequired)
                ) &&
                !currentItemConfig.selectedModifiers?.length
            );

            if (shouldOpenModifiers) {
                openModal('modifier', {
                    item: menuItem,
                    onAddItem: (itemWithModifiers: MenuItem, selectedModifiers: ModifierOption[]) => {
                        closeModal();
                        processNextStep({ ...currentItemConfig, selectedModifiers }, quantity);
                    },
                    language: settings.language.staff,
                });
                return;
            }

            if (menuItem.askQuantity && quantity === 1) {
                 openModal('numberInput', {
                    title: 'Enter Quantity',
                    label: `Quantity for ${menuItem.name}`,
                    initialValue: 1,
                    onConfirm: (newQuantity: number) => {
                        closeModal();
                        processNextStep(currentItemConfig, newQuantity);
                    },
                });
                return;
            }

            if (menuItem.askPrice && !currentItemConfig.priceOverride) {
                openModal('numberInput', {
                    title: 'Enter Price',
                    label: `Price for ${menuItem.name}`,
                    initialValue: menuItem.price,
                    onConfirm: (price: number) => {
                        closeModal();
                        processNextStep({ ...currentItemConfig, priceOverride: price }, quantity);
                    },
                });
                return;
            }

            if (menuItem.promptForKitchenNote && !currentItemConfig.kitchenNote) {
                openModal('textInput', {
                    title: 'Kitchen Note',
                    label: `Add a note for ${menuItem.name}`,
                    onSubmit: (note: string) => {
                        closeModal();
                        processNextStep({ ...currentItemConfig, kitchenNote: note }, quantity);
                    }
                });
                return;
            }

            addItemToCart({ ...currentItemConfig, quantity });
        };
        
        const isOutOfStock = isAdvancedInventoryPluginActive && isItemOutOfStock(item, cart, ingredients, recipes);

        if (isOutOfStock) {
            addToast({ type: 'error', title: 'Out of Stock', message: `${item.name} is currently out of stock.` });
            return;
        }
        
        if (isPizzaBuilderPluginActive && item.isCustomizablePizza) {
            openModal('pizzaBuilder', { item });
            return;
        }

        if (isBurgerBuilderPluginActive && item.isCustomizableBurger) {
            openModal('burgerBuilder', { item });
            return;
        }

        processNextStep({
            menuItem: item,
            selectedModifiers: [],
        });
    }, [cart, openModal, closeModal, settings, addToast, modifierGroups, isAdvancedInventoryPluginActive, ingredients, recipes, isPizzaBuilderPluginActive, isBurgerBuilderPluginActive]);

    const onVoidOrder = useCallback(() => {
        const performVoid = (reason: string) => {
            addLogEntry('Voided order with reason: ' + reason);
            resetPOSState();
            closeModal();
        }
        
        if (settings.advancedPOS.useVoidReason) {
            openModal('voidOrder', { onConfirm: performVoid });
        } else {
             openModal('confirm', {
                title: 'Void Order?',
                message: 'Are you sure you want to clear this entire order?',
                confirmText: 'Void Order',
                onConfirm: () => performVoid('No reason required'),
            });
        }
    }, [settings.advancedPOS.useVoidReason, addLogEntry, resetPOSState, openModal, closeModal]);
    
    const handleHoldOrder = useCallback(() => {
        if ((cart || []).length === 0) return;
        const newHeldOrder: HeldOrder = {
            id: 'held_' + Date.now(),
            timestamp: Date.now(),
            cart,
            customer: selectedCustomer,
            table: currentTable,
            appliedDiscount,
            appliedPromotion,
            employeeName: currentEmployee?.name || 'Unknown',
            orderType: orderType,
        };
        setHeldOrders((prev: HeldOrder[]) => [...(prev || []), newHeldOrder]);
        resetPOSState();
    }, [cart, selectedCustomer, currentTable, appliedDiscount, appliedPromotion, currentEmployee, setHeldOrders, resetPOSState, orderType]);

    const handleReopenOrder = useCallback((id: string) => {
        const reopenLogic = () => {
            const orderToReopen = (heldOrders || []).find((o: HeldOrder) => o.id === id);
            if (orderToReopen) {
                setCart(orderToReopen.cart);
                setSelectedCustomer(orderToReopen.customer);
                setCurrentTable(orderToReopen.table);
                setAppliedDiscount(orderToReopen.appliedDiscount);
                setAppliedPromotion(orderToReopen.appliedPromotion || null);
                setOrderType(orderToReopen.orderType || 'dine-in');
                setHeldOrders((prev: HeldOrder[]) => (prev || []).filter(o => o.id !== id));
                closeModal();
            }
        };

        if ((cart || []).length > 0) {
            openModal('confirm', {
                title: 'Re-open Held Order?',
                message: 'This will clear your current cart. Are you sure you want to continue?',
                onConfirm: reopenLogic,
            });
        } else {
            reopenLogic();
        }
    }, [heldOrders, cart, setHeldOrders, setCart, setSelectedCustomer, setCurrentTable, setAppliedDiscount, setOrderType, openModal, closeModal, setAppliedPromotion]);

    const handleDeleteHeldOrder = useCallback((id: string) => {
        openModal('confirm', {
            title: 'Delete Held Order?',
            message: 'Are you sure you want to delete this held order? This action cannot be undone.',
            confirmText: 'Delete',
            onConfirm: () => {
                setHeldOrders((prev: HeldOrder[]) => (prev || []).filter(o => o.id !== id));
                closeModal();
            },
        });
    }, [setHeldOrders, openModal, closeModal]);

    const handleKitchenPrinting = useCallback((order: Order): void => {
        if (!settings.preferences.enableKitchenPrint) return;
        
        const kitchenPrinterId = settings.devices.kitchenPrinterId;
        if (!kitchenPrinterId) {
            addToast({ type: 'error', title: 'Print Failed', message: 'No default kitchen printer assigned.' });
            return;
        }
        
        const printer = printers.find(p => p.id === kitchenPrinterId);
        if (printer) {
            const kitchenProfile = printer.kitchenProfiles?.kitchen_1 || DEFAULT_KITCHEN_PRINT_SETTINGS;
            const job: Omit<PrintJob, 'id'|'timestamp'|'status'> = {
                component: 'KitchenReceiptContent',
                props: { order, isPrintable: true, settings: kitchenProfile, profileName: 'Kitchen' }
            };
            addPrintJobs([job]);
            addToast({ type: 'info', title: 'Printing', message: 'Sending ticket to the kitchen.' });
        }
    }, [printers, settings.preferences.enableKitchenPrint, settings.devices.kitchenPrinterId, addPrintJobs, addToast]);
    
    const createOrderObject = useCallback((finalCart: CartItem[], payments: Payment[], explicitOrderType: OrderType): Order => {
        const { subtotal, tax, total, taxDetails, finalAppliedDiscount } = calculateOrderTotals(
            finalCart,
            currentLocation,
            appliedDiscount,
            appliedPromotion,
            explicitOrderType,
            settings,
            selectedCustomer,
            surcharges,
            appliedLoyaltyPoints
        );
        const totalPaid = payments.reduce((acc, p) => acc + p.amount, 0);
        const balanceDue = total - totalPaid;

        const order: Order = {
            id: `ord_${Date.now()}`,
            orderNumber: String(settings.orderSettings.nextDailyOrderNumber).padStart(4, '0'),
            invoiceNumber: `${settings.orderSettings.invoicePrefix}${settings.orderSettings.nextInvoiceNumber}${settings.orderSettings.invoiceSuffix}`,
            createdAt: Date.now(),
            cart: finalCart,
            customer: selectedCustomer || undefined,
            employeeId: selectedStaff?.id || currentEmployee?.id,
            subtotal,
            tax,
            total,
            balanceDue,
            taxDetails,
            orderType: explicitOrderType,
            status: balanceDue > 0.009 ? 'partially-paid' : 'completed',
            source: 'in-store', // default for POS
            payments,
            tableId: currentTable?.id,
            locationId: currentLocation.id,
            isTraining: false,
            appliedDiscount: finalAppliedDiscount,
            appliedPromotion: appliedPromotion || undefined,
            appliedLoyaltyPoints: appliedLoyaltyPoints > 0 ? appliedLoyaltyPoints : undefined,
            preparedCartItemIds: [],
        };
        return order;
    }, [currentLocation, appliedDiscount, appliedPromotion, settings, selectedCustomer, currentEmployee, selectedStaff, currentTable, surcharges, appliedLoyaltyPoints]);

    const onProcessFinalOrder = useCallback((
        finalCart: CartItem[],
        payments: Payment[],
        explicitOrderType: OrderType,
        sourceOrder?: Order
    ): Order => {
        const finalOrder = createOrderObject(finalCart, payments, explicitOrderType);
        
        if (['takeaway', 'delivery', 'kiosk'].includes(explicitOrderType)) {
            finalOrder.status = 'kitchen';
        }

        if (sourceOrder?.originalOrderIds) {
            // Settling a table bill
            setOrders((prev: Order[]) => {
                const updatedOrders = (prev || []).map((o): Order => {
                    if (sourceOrder!.originalOrderIds!.includes(o.id)) {
                        return { ...o, status: 'completed', completedAt: finalOrder.createdAt };
                    }
                    return o;
                });
                return [...updatedOrders, finalOrder];
            });
            if (sourceOrder.tableId) {
                setTables((prev: Table[]) => (prev || []).map(t => t.id === sourceOrder.tableId ? { ...t, status: 'available', orderId: undefined, occupiedSince: undefined, customerName: undefined, guestCount: undefined } : t));
            }
        } else if (activeTab && sourceOrder && sourceOrder.id === activeTab.id) {
            // Settling a tab
            finalOrder.id = activeTab.id; // Overwrite ID to update existing tab order
            setOrders((prev: Order[]) => (prev || []).map(o => o.id === activeTab.id ? finalOrder : o));
        } else {
            // New sale (takeaway, delivery, kiosk)
            setOrders((prev: Order[]) => [...(prev || []), finalOrder]);
        }

        // Update numbering
        const today = new Date().toISOString().split('T')[0];
        if (settings.preferences.resetOrderNumberDaily && settings.orderSettings.dailyOrderSequenceLastReset !== today) {
            setSettings((prev: AppSettings) => ({
                ...prev,
                orderSettings: {
                    ...prev.orderSettings,
                    nextInvoiceNumber: prev.orderSettings.nextInvoiceNumber + 1,
                    nextDailyOrderNumber: 2, // Reset to 2 because we just used 1
                    dailyOrderSequenceLastReset: today,
                }
            }));
        } else {
            setSettings((prev: AppSettings) => ({
                ...prev,
                orderSettings: {
                    ...prev.orderSettings,
                    nextInvoiceNumber: prev.orderSettings.nextInvoiceNumber + 1,
                    nextDailyOrderNumber: prev.orderSettings.nextDailyOrderNumber + 1,
                }
            }));
        }
        
        // Handle Loyalty Points
        if (finalOrder.customer) {
            // 1. Deduct redeemed points
            if (finalOrder.appliedLoyaltyPoints && finalOrder.appliedLoyaltyPoints > 0) {
                setCustomers((prev => (prev || []).map(c =>
                    c.id === finalOrder.customer!.id
                        ? { ...c, loyaltyPoints: (c.loyaltyPoints || 0) - finalOrder.appliedLoyaltyPoints! }
                        : c
                )));
            }
            
            // 2. Accrue new points (if not redeeming)
            if (settings.loyalty.enabled && (!finalOrder.appliedLoyaltyPoints || finalOrder.appliedLoyaltyPoints === 0)) {
                const pointsEarned = Math.floor(finalOrder.total * settings.loyalty.pointsPerDollar);
                if (pointsEarned > 0) {
                    setCustomers(prev => (prev || []).map(c => 
                        c.id === finalOrder.customer!.id 
                            ? { ...c, loyaltyPoints: (c.loyaltyPoints || 0) + pointsEarned }
                            : c
                    ));
                    addToast({
                        type: 'success',
                        title: 'Loyalty Points Earned',
                        message: `${finalOrder.customer.name} earned ${pointsEarned} points!`
                    });
                }
            }
        }

        setLastCompletedOrder(finalOrder);
        resetPOSState();
        handleKitchenPrinting(finalOrder);

        // Update inventory
        if (settings.advancedPOS.inventoryManagement) {
           finalCart.forEach(cartItem => {
               const itemRecipe = recipes[cartItem.menuItem.id];
               if (itemRecipe) {
                   itemRecipe.forEach(recipeItem => {
                       setIngredients((prev: Ingredient[]) => (prev || []).map(ing => 
                           ing.id === recipeItem.ingredientId ? { ...ing, stock: ing.stock - (recipeItem.quantity * cartItem.quantity) } : ing
                       ));
                   });
               } else if (cartItem.menuItem.stock !== undefined && cartItem.menuItem.stock !== null) {
                   setMenuItems((prev: MenuItem[]) => (prev || []).map(mi => 
                       mi.id === cartItem.menuItem.id ? { ...mi, stock: (mi.stock || 0) - cartItem.quantity } : mi
                   ));
               }
           });
       }

        return finalOrder;
    }, [createOrderObject, setOrders, setTables, setSettings, setLastCompletedOrder, resetPOSState, handleKitchenPrinting, settings, recipes, setIngredients, setMenuItems, activeTab, setCustomers, addToast]);
    
    const handlePrintA4 = useCallback((order: Order): void => {
        const locationForOrder = locations.find((l: Location) => l.id === order.locationId) || locations[0];
        const newJob: Omit<PrintJob, 'id'|'timestamp'|'status'> = {
          component: 'A4Invoice',
          props: { order, location: locationForOrder, settings }
        };
        addPrintJobs([newJob]);
    }, [locations, settings, addPrintJobs]);

    const onUpdateCartQuantity = useCallback((cartId: string, newQuantity: number) => {
        if (newQuantity <= 0) {
            setCart(prev => (prev || []).filter(item => item.cartId !== cartId));
        } else {
            setCart(prev => (prev || []).map(item =>
                item.cartId === cartId ? { ...item, quantity: newQuantity } : item
            ));
        }
    }, [setCart]);

    const onRemoveItem = useCallback((cartId: string) => {
        setCart(prev => (prev || []).filter(item => item.cartId !== cartId));
    }, [setCart]);

    const handleSendToKitchen = useCallback(() => {
        if (cart.length === 0 || !currentTable) {
          addToast({ type: 'error', title: 'Action Failed', message: 'Please select a table and add items to the cart first.' });
          return;
        }
      
        const orderForKitchen = createOrderObject(cart, [], 'dine-in');
        orderForKitchen.status = 'kitchen';
        
        setOrders(prev => [...(prev || []), orderForKitchen]);
        
        setTables(prev => (prev || []).map(t => 
          t.id === currentTable.id 
            ? { ...t, status: 'occupied' as TableStatus, orderId: t.orderId || orderForKitchen.id, occupiedSince: t.occupiedSince || Date.now() } 
            : t
        ));
      
        handleKitchenPrinting(orderForKitchen);
        
        addToast({ type: 'success', title: 'Order Sent', message: `New items for ${currentTable.name} sent to the kitchen.` });
        
        // Fulfill user request: Clear cart and reset category after sending to kitchen.
        resetCartState();
        setActiveCategory('all');
        
    }, [cart, currentTable, addToast, createOrderObject, setOrders, setTables, handleKitchenPrinting, resetCartState, setActiveCategory]);
      
    const handleInitiatePayment = useCallback(() => {
        if (cart.length === 0) return;
    
        const placeOrderDirectly = () => {
            const { total } = calculateOrderTotals(
                cart,
                currentLocation,
                appliedDiscount,
                appliedPromotion,
                orderType,
                settings,
                selectedCustomer,
                surcharges,
                appliedLoyaltyPoints
            );
            const payment: Payment = {
                method: settings.preferences.defaultPaymentMethod,
                amount: total,
                timestamp: Date.now(),
            };
            onProcessFinalOrder(cart, [payment], orderType);
        };
    
        if (settings.advancedPOS.confirmPayment) {
            const tempOrder = createOrderObject(cart, [], orderType);
            openModal('payment', {
                orderToPay: [tempOrder],
                onFinalize: (payments: Payment[]) => {
                    const finalOrder = onProcessFinalOrder(cart, payments, orderType);
                    return finalOrder;
                },
                onDirectPrintReceipt: (order: Order) => {
                    const printerId = settings.devices.receiptPrinterId;
                    const printer = printers.find((p: Printer) => p.id === printerId);
                    if (!printer) {
                        addToast({ type: 'error', title: 'Print Error', message: 'No receipt printer configured.' });
                        return;
                    }
                    addPrintJobs([{
                        component: 'TemplateRenderer',
                        props: {
                            format: 'thermal',
                            order,
                            location: currentLocation,
                            settings,
                            receiptSettings: printer.receiptSettings || settings.receipt,
                        }
                    }]);
                },
                onPrintA4: handlePrintA4,
                cardPlugin: plugins.find((p: AppPlugin) => p.id === 'payment-terminal'),
                allPaymentTypes: paymentTypes,
                currency: currentLocation.currency,
                settings,
                setSettings,
                addToast,
            });
        } else {
            placeOrderDirectly();
        }
    }, [
        cart, settings, currentLocation, appliedDiscount, appliedPromotion, orderType, selectedCustomer, surcharges, appliedLoyaltyPoints,
        onProcessFinalOrder, createOrderObject, openModal, handlePrintA4, plugins, paymentTypes, setSettings, addToast, printers
    ]);
      
    const handleSettleBill = useCallback(() => {
        if (!currentTable) {
            addToast({ type: 'error', title: 'No Table Selected', message: 'Please select a table to settle the bill.' });
            return;
        }

        const pendingOrdersForTable = (orders || []).filter(
            (o: Order) => o.tableId === currentTable.id && ['kitchen', 'served'].includes(o.status)
        );
        const sentItems = pendingOrdersForTable.flatMap(o => o.cart);
        const allItemsForBill = [...sentItems, ...cart];

        if (allItemsForBill.length === 0) {
            addToast({ type: 'info', title: 'Empty Bill', message: 'There are no items to settle.' });
            return;
        }

        const totals = calculateOrderTotals(
            allItemsForBill, currentLocation, appliedDiscount, appliedPromotion, 'dine-in', settings, selectedCustomer, surcharges, appliedLoyaltyPoints
        );

        const settlementOrder: Order = {
            id: `settle_${currentTable.id}_${Date.now()}`,
            orderNumber: 'BILL',
            invoiceNumber: 'BILL',
            createdAt: Date.now(),
            cart: allItemsForBill,
            customer: selectedCustomer || undefined,
            employeeId: currentEmployee?.id,
            orderType: 'dine-in',
            status: 'pending',
            source: 'in-store',
            payments: [],
            tableId: currentTable.id,
            locationId: currentLocation.id,
            isTraining: false,
            originalOrderIds: pendingOrdersForTable.map(o => o.id),
            subtotal: totals.subtotal,
            tax: totals.tax,
            total: totals.total,
            taxDetails: totals.taxDetails,
            appliedDiscount: totals.finalAppliedDiscount,
            appliedPromotion: appliedPromotion || undefined,
            appliedLoyaltyPoints: appliedLoyaltyPoints > 0 ? appliedLoyaltyPoints : undefined,
            balanceDue: totals.total,
        };
        
        setActiveOrderToSettle(settlementOrder);
    }, [currentTable, orders, cart, currentLocation, appliedDiscount, appliedPromotion, settings, selectedCustomer, surcharges, appliedLoyaltyPoints, addToast, setActiveOrderToSettle, currentEmployee]);

    const handleInitiateSettlePayment = useCallback(() => {
        if (!activeOrderToSettle) return;
        openModal('payment', {
            orderToPay: [activeOrderToSettle],
            onFinalize: (payments: Payment[]) => {
                const finalOrder = onProcessFinalOrder(activeOrderToSettle.cart, payments, activeOrderToSettle.orderType, activeOrderToSettle);
                return finalOrder;
            },
            onDirectPrintReceipt: (order: Order) => {
                const printerId = settings.devices.receiptPrinterId;
                const printer = printers.find((p: Printer) => p.id === printerId);
                if (!printer) {
                    addToast({ type: 'error', title: 'Print Error', message: 'No receipt printer configured.' });
                    return;
                }
                addPrintJobs([{
                    component: 'TemplateRenderer',
                    props: {
                        format: 'thermal',
                        order,
                        location: currentLocation,
                        settings,
                        receiptSettings: printer.receiptSettings || settings.receipt,
                    }
                }]);
            },
            onPrintA4: handlePrintA4,
            cardPlugin: plugins.find((p: AppPlugin) => p.id === 'payment-terminal'),
            allPaymentTypes: paymentTypes,
            currency: currentLocation.currency,
            settings,
            setSettings,
            addToast,
        });
    }, [activeOrderToSettle, openModal, onProcessFinalOrder, settings, printers, addPrintJobs, currentLocation, addToast, handlePrintA4, plugins, paymentTypes, setSettings]);
    
    const handleSaveTab = useCallback(() => {
        if (!selectedCustomer) {
            addToast({ type: 'error', title: 'No Customer', message: 'Please select a customer to save items to a tab.' });
            return;
        }
        if (cart.length === 0) {
            addToast({ type: 'info', title: 'Empty Cart', message: 'Add items to the cart before saving to the tab.' });
            return;
        }

        let updatedTabOrder: Order;
        if (activeTab) {
            const updatedCart = [...activeTab.cart, ...cart];
            const totals = calculateOrderTotals(updatedCart, currentLocation, activeTab.appliedDiscount || null, activeTab.appliedPromotion || null, 'tab', settings, selectedCustomer, surcharges, activeTab.appliedLoyaltyPoints || 0);
            updatedTabOrder = { ...activeTab, cart: updatedCart, ...totals, balanceDue: totals.total, payments: [] };
            setOrders(prev => (prev || []).map(o => o.id === activeTab.id ? updatedTabOrder : o));
        } else {
            updatedTabOrder = createOrderObject(cart, [], 'tab');
            updatedTabOrder.status = 'partially-paid';
            setOrders(prev => [...(prev || []), updatedTabOrder]);
        }
        
        setActiveTab(updatedTabOrder);
        resetCartState();
        addToast({ type: 'success', title: 'Tab Updated', message: `Items added to ${selectedCustomer.name}'s tab.` });
    }, [cart, selectedCustomer, activeTab, addToast, createOrderObject, setOrders, setActiveTab, resetCartState, currentLocation, settings, surcharges]);

    const handleSettleTab = useCallback(() => {
        if (!activeTab && cart.length === 0) {
            addToast({ type: 'error', title: 'No Tab', message: 'No active tab to settle.' });
            return;
        }

        const allItemsForBill = [...(activeTab?.cart || []), ...cart];

        if (allItemsForBill.length === 0) {
            addToast({ type: 'info', title: 'Empty Tab', message: 'There are no items to settle.' });
            return;
        }
        
        const currentAppliedDiscount = appliedDiscount || activeTab?.appliedDiscount || null;
        const currentAppliedPromotion = appliedPromotion || activeTab?.appliedPromotion || null;
        const currentAppliedLoyalty = appliedLoyaltyPoints || activeTab?.appliedLoyaltyPoints || 0;

        const totals = calculateOrderTotals(
            allItemsForBill, currentLocation, currentAppliedDiscount, currentAppliedPromotion, 'tab', settings, selectedCustomer, surcharges, currentAppliedLoyalty
        );

        const settlementOrder: Order = {
            id: activeTab?.id || `settle_tab_${Date.now()}`,
            orderNumber: activeTab?.orderNumber || 'TAB',
            invoiceNumber: activeTab?.invoiceNumber || 'TAB',
            createdAt: activeTab?.createdAt || Date.now(),
            cart: allItemsForBill,
            customer: selectedCustomer || undefined,
            employeeId: currentEmployee?.id,
            orderType: 'tab',
            status: 'partially-paid',
            source: 'in-store',
            payments: [],
            locationId: currentLocation.id,
            isTraining: false,
            subtotal: totals.subtotal,
            tax: totals.tax,
            total: totals.total,
            taxDetails: totals.taxDetails,
            appliedDiscount: totals.finalAppliedDiscount,
            appliedPromotion: currentAppliedPromotion || undefined,
            appliedLoyaltyPoints: currentAppliedLoyalty > 0 ? currentAppliedLoyalty : undefined,
            balanceDue: totals.total,
        };
        
        setActiveOrderToSettle(settlementOrder);
    }, [activeTab, cart, addToast, currentLocation, appliedDiscount, appliedPromotion, settings, selectedCustomer, surcharges, appliedLoyaltyPoints, setActiveOrderToSettle, currentEmployee]);

    const onLoadOrder = useCallback((orderToLoad: Order) => {
        if(cart.length > 0) {
            openModal('confirm', {
                title: 'Load Order for Payment?',
                message: 'This will clear your current cart. Are you sure you want to continue?',
                onConfirm: () => {
                    resetPOSState();
                    setActiveOrderToSettle(orderToLoad);
                    setSelectedCustomer(orderToLoad.customer || null);
                    addToast({ type: 'info', title: 'Order Loaded', message: `Loaded order #${orderToLoad.orderNumber} for payment.` });
                    closeModal();
                },
            });
        } else {
            resetPOSState();
            setActiveOrderToSettle(orderToLoad);
            setSelectedCustomer(orderToLoad.customer || null);
            addToast({ type: 'info', title: 'Order Loaded', message: `Loaded order #${orderToLoad.orderNumber} for payment.` });
        }
    }, [resetPOSState, setActiveOrderToSettle, setSelectedCustomer, addToast, cart, openModal, closeModal]);
    
    const handleSelectTab = useCallback((orderId: string) => {
        const tabOrder = (orders || []).find((o: Order) => o.id === orderId);
        if (tabOrder) {
            if(cart.length > 0) {
                 openModal('confirm', {
                    title: 'Switch to Tab?',
                    message: 'This will clear your current cart. Are you sure you want to continue?',
                    onConfirm: () => {
                        resetPOSState();
                        setActiveTab(tabOrder);
                        setSelectedCustomer(tabOrder.customer || null);
                        setOrderType('tab');
                        addToast({ type: 'info', title: 'Tab Loaded', message: `Switched to ${tabOrder.customer?.name}'s tab.` });
                        closeModal();
                    }
                 });
            } else {
                resetPOSState();
                setActiveTab(tabOrder);
                setSelectedCustomer(tabOrder.customer || null);
                setOrderType('tab');
                addToast({ type: 'info', title: 'Tab Loaded', message: `Switched to ${tabOrder.customer?.name}'s tab.` });
            }
        }
    }, [orders, resetPOSState, setActiveTab, setSelectedCustomer, setOrderType, addToast, cart, openModal, closeModal]);
    // #endregion

    const allContexts = {
        // App
        activeView, setView: setActiveView, managementSubView, setManagementSubView, settingsSubView, setSettingsSubView,
        currentEmployee, handleLogout: () => { setCurrentEmployee(null); setActiveView('landing'); },
        handlePinLogin: (employeeId: string, pin: string) => {
            const employee = employees.find((e: any) => e.id === employeeId && e.pin === pin);
            if(employee) { setCurrentEmployee(employee); setActiveView('pos'); return true; }
            return false;
        },
        settings, setSettings, isFullscreen, onToggleFullScreen: () => setIsFullscreen((f: any) => !f),
        currentLocationId, onLocationChange: setCurrentLocationId, currentLocation, theme, onToggleTheme, isSidebarCollapsed,
        onToggleSidebarCollapse: () => setIsSidebarCollapsed((c: any) => !c), isSidebarHidden, onToggleSidebar: () => setIsSidebarHidden((h: any) => !h),
        plugins, notifications, handleMarkAllNotificationsAsRead, isKsaPluginActive,
        isMultiStorePluginActive: true, isReservationPluginActive: true, isWaitlistPluginActive: true, 
        isOrderNumberDisplayPluginActive: true, isPizzaBuilderPluginActive, isQRCodePluginActive: true, isCallerIdPluginActive: true,
        isBurgerBuilderPluginActive,
        isAdvancedInventoryPluginActive,
        onLaunchView: (view: View) => window.open(`#/${view}`, '_blank'),
        justAddedCategoryId, onClearJustAddedCategoryId: () => setJustAddedCategoryId(null),
        justAddedCustomer, onClearJustAddedCustomer: () => setJustAddedCustomer(null),
        calledOrderNumber, cycleCalledOrderNumber: () => {}, clearCalledOrderNumber: () => {}, handleIncomingCall: () => {},
        handleTogglePlugin: (pluginId: string) => {
          setPlugins((prevPlugins: AppPlugin[]) =>
            prevPlugins.map(p => {
              if (p.id === pluginId) {
                const isDisabling = p.status === 'enabled' || p.status === 'trial';
                return { ...p, status: isDisabling ? 'disabled' : (p.isFree ? 'enabled' : 'trial') };
              }
              return p;
            })
          );
        },
        
        // Data
        locations, setLocations, categories, setCategories, menuItems, setMenuItems, customers, setCustomers,
        drivers, setDrivers, employees, setEmployees, suppliers, setSuppliers, wastageLog, setWastageLog,
        roles, setRoles, auditLog, setAuditLog, printers, setPrinters, tables, setTables,
        subscriptions, setSubscriptions, purchaseOrders, setPurchaseOrders, schedule, setSchedule,
        reservations, setReservations, ingredients, setIngredients, recipes, setRecipes,
        signageDisplays, setSignageDisplays, signageContent, setSignageContent, signagePlaylists, setSignagePlaylists,
        signageSchedule, setSignageSchedule, waitlist, setWaitlist, paymentTypes, setPaymentTypes,
        promotions, setPromotions, modifierGroups, setModifierGroups, kitchenDisplays, setKitchenDisplays,
        kitchenNotes, setKitchenNotes, voidReasons, setVoidReasons, manualDiscounts, setManualDiscounts,
        surcharges, setSurcharges, customerDisplays, setCustomerDisplays, scales, setScales, callLog, setCallLog,
        orders, setOrders, heldOrders, setHeldOrders, reportSchedules, setReportSchedules,
        lastCompletedOrder, lastReservationSync, lastAccountingSync,
        categoriesWithCounts, floors,
        handleSaveCustomer,
        onToggleClockStatus, onSaveScheduleEntry, onDeleteScheduleEntry,
        
        // POS
        cart, setCart, activeCategory, onSelectCategory: setActiveCategory, searchQuery, onSearchChange: setSearchQuery,
        selectedCustomer, setSelectedCustomer, currentTable, setCurrentTable, orderType, setOrderType,
        appliedDiscount, setAppliedDiscount, appliedPromotion, setAppliedPromotion,
        aiUpsellSuggestions, isSuggestingUpsell, selectedStaff, setSelectedStaff, activeOrderToSettle,
        activeTab, setActiveTab, availablePromotions,
        appliedLoyaltyPoints, setAppliedLoyaltyPoints,
        resetPOSState, onNewSaleClick, onSelectItem,
        
        // Modal
        modal, openModal, closeModal,
        
        // Toast
        toasts, addToast, dismissToast: (id: number) => setToasts((prev: any) => prev.filter((t: any) => t.id !== id)),

        // Print
        printQueue, addPrintJobs, clearPrintQueue: () => setPrintQueue([]),
        updatePrintJobStatus: (id: string, status: PrintJobStatus) => setPrintQueue((prev: any) => prev.map((job: any) => job.id === id ? { ...job, status } : job)),
    };
    
    const appContextValue = allContexts;
    const dataContextValue = allContexts;
    const modalContextValue = allContexts;
    const toastContextValue = allContexts;

    const posContextValue = {
        ...allContexts,
        onUpdateCartQuantity,
        onRemoveItem, 
        onVoidOrder, 
        handleReopenOrder, 
        handleDeleteHeldOrder, 
        handleHoldOrder,
        handleInitiatePayment,
        handleInitiateSettlePayment,
        handleSendToKitchen,
        handleSettleBill,
        onProcessFinalOrder,
        handleSaveTab, 
        handleSettleTab, 
        handleSelectTab, 
        onLoadOrder, 
        handleAddPizzaToCart,
        handleAddBurgerToCart,
        handleKitchenPrinting, 
        onPrintA4: handlePrintA4,
    };
    

    return (
        <AppContext.Provider value={appContextValue}>
            <DataContext.Provider value={dataContextValue}>
                <POSContext.Provider value={posContextValue}>
                    <ModalContext.Provider value={modalContextValue}>
                        <ToastContext.Provider value={toastContextValue}>
                            {children}
                        </ToastContext.Provider>
                    </ModalContext.Provider>
                </POSContext.Provider>
            </DataContext.Provider>
        </AppContext.Provider>
    );
};
