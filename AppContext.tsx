import React, { createContext, useContext, useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { LOCATIONS, CATEGORIES, MENU_ITEMS, CUSTOMERS, DRIVERS, EMPLOYEES, SUPPLIERS, WASTAGE_LOG, ROLES, AUDIT_LOG, PRINTERS, TABLES, SUBSCRIPTIONS, PURCHASE_ORDERS, PLUGINS, SCHEDULE, RESERVATIONS, INGREDIENTS, RECIPES, SIGNAGE_DISPLAYS, SIGNAGE_CONTENT, SIGNAGE_PLAYLISTS, SIGNAGE_SCHEDULE, ACTIVATION_CODES, PAYMENT_TYPES, PIZZA_OPTIONS, PROMOTIONS, MODIFIER_GROUPS, KITCHEN_DISPLAYS, KITCHEN_NOTES, VOID_REASONS, MANUAL_DISCOUNTS, SURCHARGES, CUSTOMER_DISPLAYS, SCALES, CALL_LOG, DEFAULT_KITCHEN_PRINT_SETTINGS, DEFAULT_RECEIPT_SETTINGS, KITCHEN_PROFILE_NAMES } from '../constants';
import { MenuItem, CartItem, ModifierOption, Customer, Order, Driver, OrderType, OrderSource, Employee, Location, PaymentMethod, Shift, AppliedDiscount, AIResponse, WastageEntry, Supplier, AIEstimatedWaitTime, Role, AIRoleSuggestion, AuditLogEntry, Notification, Language, ReportSchedule, Printer, ToastNotification, SimulationLogEntry, SimulationReport, Table, Subscription, PurchaseOrder, AIFloorPlanSuggestion, AIBusyZoneAnalysis, AIInvoiceWarning, AILoyaltyResponse, AppSettings, View, ManagementSubView, SettingsSubView, AppPlugin, ScheduleEntry, Reservation, ReservationStatus, Ingredient, RecipeItem, SignageDisplay, SignageContentItem, SignagePlaylist, SignageScheduleEntry, WaitlistEntry, WaitlistStatus, Theme, Payment, TableStatus, OrderStatus, PaymentType, ReceiptSettings, ZatcaSettings, PizzaConfiguration, Category, Promotion, HeldOrder, ModifierGroup, KitchenDisplay, KitchenNote, VoidReason, ManualDiscount, Surcharge, POSPreferences, GenericDevice, CustomerDisplay, CallLogEntry, PizzaToppingItem, KitchenPrintSettings, KitchenProfileType, PrintJob, PrintJobStatus } from '../types';
import { calculateOrderTotals, getPriceForItem } from '../utils/calculations';

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
        receipt: { logoUrl: 'https://raw.githubusercontent.com/ordino-pos/ordino-pos-media/main/logo-dark.png', promoMessage: 'Thank you!', showBarcode: true, template: 'standard' },
        invoice: { template: 'modern' },
        theme: { primary: '#2563eb', background: '#f4f4f5', surface: '#ffffff', textBase: '#111827', textMuted: '#6b7280' },
        language: { staff: 'en', customer: 'en' },
        deliveryApps: { uberEats: { enabled: false, apiKey: '' }, doordash: { enabled: false, apiKey: '' } },
        iotSensors: { smartFridges: { enabled: false, apiKey: '' }, storageSensors: { enabled: false, apiKey: '' } },
        ai: { enableAIFeatures: true, enableUpsell: true, enableCFDSuggestions: true, enableReportAnalysis: true },
        cfd: { attractScreenPlaylistId: null, featuredItemIds: [] },
        notificationSettings: { duration: 5, position: 'top-right', theme: 'dark' },
        dineIn: { enabled: true, defaultGuests: 2, maxGuests: 20, enableStaffSelection: true, surcharge: { enabled: false, name: 'Service Charge', type: 'percentage', value: 10 }, minCharge: { enabled: false, amount: 15 } },
        delivery: { enabled: true, surcharge: { enabled: false, surchargeId: null }, zones: [{id: 'zone1', name: 'Local', fee: 5 }] },
        takeAway: { enabled: true, customName: 'Take Away', requireCustomerName: true, useHoldReason: false, surcharge: { enabled: false, name: 'Packaging Fee', type: 'fixed', value: 0.50 } },
        tab: { enabled: true, customName: 'Tab' },
        devices: { receiptPrinterId: 'p1', kitchenPrinterId: 'kp1', kioskPrinterId: 'p1', barPrinterId: null, reportPrinterId: 'p4', customerDisplayId: 'cd1', kitchenDisplayId: 'kds_1', scaleId: 'sc1', printServerUrl: 'http://localhost:3000' },
        advancedPOS: { enableItemNumber: false, separateSameItems: false, combineKitchenItems: true, kitchenPrintFooter: false, kitchenPrintReservedOrder: true, sortItemInKitchen: true, sortModifier: true, sortOrderInKDS: true, printVoidOrderItem: true, printOrderAfterSending: false, quickPay: true, useVoidReason: true, confirmPayment: false, printReceiptAfterPayment: true, combineReceiptItem: true, sortItemInReceipt: true, showItemDiscount: true, showVoidOrderItem: false, emailReceipt: true, showTaxOnReceipt: true, inventoryManagement: true, allowMinusQuantity: false, useInventoryPrint: false, useEndOfDayReport: true, useStaffSalary: false, useCashInOutPrint: false, useExpensePrint: false, useWorkTimePrint: false, autoClockOut: false, loginDoNotRememberPassword: false, dateFormat: 'MM/DD/YYYY', timeFormatAmPm: true, lockTillToLocation: false, },
        preferences: { actionAfterSendOrder: 'order', actionAfterPayment: 'order', defaultPaymentMethod: 'Cash', enableOrderNotes: true, enableKitchenPrint: true, defaultOrderType: 'dine-in', enableOrderHold: true, resetOrderNumberDaily: true, dashboardWidgetOrder: ['stats', 'salesChart', 'quickActions', 'topItems', 'lowStock', 'recentTransactions'], }
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
    
    const openModal = (type: string, props = {}) => setModal({ type, props });
    const closeModal = () => setModal({ type: null, props: {} });
    
    // --- POS State Reset ---
    const resetCartState = useCallback(() => {
        setCart([]);
        setAppliedDiscount(null);
        setAppliedPromotion(null);
        setAIUpsellSuggestions(null);
    }, [setCart, setAppliedDiscount, setAppliedPromotion, setAIUpsellSuggestions]);

    const resetPOSState = useCallback(() => {
        resetCartState();
        setSelectedCustomer(null);
        setCurrentTable(null);
        setActiveOrderToSettle(null);
        setActiveTab(null);
        setSelectedStaff(null);
        setOrderType(settings.preferences.defaultOrderType);
        setActiveCategory('all');
    }, [resetCartState, settings.preferences.defaultOrderType, setActiveCategory]);
    
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
    
    const addPrintJobs = useCallback((jobs: Omit<PrintJob, 'id'|'timestamp'|'status'>[]) => {
        const newJobs = jobs.map(job => ({ ...job, id: `job_${Date.now()}_${Math.random()}`, timestamp: Date.now(), status: 'pending' as PrintJobStatus }));
        setPrintQueue(prev => [...(prev || []), ...newJobs]);
    }, [setPrintQueue]);

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
        
        const cartItemsForThisProduct = cart.filter((ci: CartItem) => ci.menuItem.id === item.id);
        const cartQuantity = cartItemsForThisProduct.reduce((sum: number, i: CartItem) => sum + i.quantity, 0);
        const isOutOfStock = item.stopSaleAtZeroStock && typeof item.stock === 'number' && item.stock <= cartQuantity;

        if (isOutOfStock) {
            addToast({ type: 'error', title: 'Out of Stock', message: `${item.name} is currently out of stock.` });
            return;
        }
        
        if (item.isCustomizablePizza) {
            openModal('pizzaBuilder', { item });
            return;
        }

        processNextStep({
            menuItem: item,
            selectedModifiers: [],
        });
    }, [cart, openModal, closeModal, settings, addToast, modifierGroups]);

    const onNewSaleClick = useCallback(() => {
        if (cart.length > 0 || currentTable || activeOrderToSettle || activeTab) {
            openModal('confirm', {
                title: 'Start New Sale?', message: 'This will clear the current order. Are you sure?',
                onConfirm: () => { resetPOSState(); closeModal(); },
            });
        } else {
            resetPOSState();
        }
    }, [cart.length, currentTable, activeOrderToSettle, activeTab, resetPOSState, openModal, closeModal]);
    
    const onVoidOrder = useCallback(() => {
        openModal('voidOrder', { onConfirm: (reason: string) => {
            addLogEntry('Voided order with reason: ' + reason);
            resetPOSState();
            closeModal();
        }});
    }, [addLogEntry, resetPOSState, openModal, closeModal]);
    
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

    const handleKitchenPrinting = useCallback((order: Order) => {
        // ... implementation
    }, [printers, settings, addPrintJobs, addToast]);
    
    const createOrderObject = useCallback((finalCart: CartItem[], payments: Payment[], explicitOrderType: OrderType): Order => {
        // ... implementation
    }, [currentLocation, appliedDiscount, appliedPromotion, settings, selectedCustomer, currentEmployee, currentTable, selectedStaff]);

    const onProcessFinalOrder = useCallback((
        finalCart: CartItem[],
        payments: Payment[],
        explicitOrderType: OrderType,
        sourceOrder?: Order
    ): Order => {
        // ... implementation
    }, [createOrderObject, settings.orderSettings, settings.advancedPOS.inventoryManagement, setSettings, setOrders, setTables, setLastCompletedOrder, resetPOSState, recipes, setMenuItems, setIngredients, handleKitchenPrinting]);
    
    const handlePrintA4 = useCallback((order: Order) => {
        const locationForOrder = locations.find((l: Location) => l.id === order.locationId) || locations[0];
        const newJob: Omit<PrintJob, 'id'|'timestamp'|'status'> = {
          component: 'A4Invoice',
          props: { order, location: locationForOrder, settings }
        };
        addPrintJobs([newJob]);
    }, [locations, settings, addPrintJobs]);

    const onUpdateCartQuantity = useCallback((cartId: string, newQuantity: number) => {
        // ... implementation
    }, [cart, setCart, addToast]);

    const onRemoveItem = useCallback((cartId: string) => {
        setCart(prev => (prev || []).filter(item => item.cartId !== cartId));
    }, [setCart]);

    const onToggleTheme = useCallback(() => {
      setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
    }, [setTheme]);

    const handleMarkAllNotificationsAsRead = useCallback(() => {
        setNotifications((prev: Notification[]) => (prev || []).map(n => ({...n, read: true})));
    }, [setNotifications]);

    const handleSendToKitchen = useCallback((orderType: OrderType) => {
        if (cart.length === 0 || !currentTable) return;
        const baseOrder = createOrderObject(cart, [], orderType);
        const newOrder = { ...baseOrder, status: 'kitchen' as OrderStatus };
        setOrders((prev: Order[]) => [...(prev || []), newOrder]);
        setTables((prev: Table[]) => (prev || []).map(t => t.id === currentTable.id ? { ...t, status: 'occupied', orderId: newOrder.id, occupiedSince: Date.now(), customerName: selectedCustomer?.name } : t));
        handleKitchenPrinting(newOrder);
        resetCartState();
    }, [cart, currentTable, createOrderObject, setOrders, setTables, handleKitchenPrinting, selectedCustomer, resetCartState]);
    
    const handleSettleBill = useCallback(() => {
        if (!currentTable) return;
        const pendingTableOrders = (orders || []).filter((o: Order) => o.tableId === currentTable.id && ['kitchen', 'served'].includes(o.status));
        const allItems = [...pendingTableOrders.flatMap(o => o.cart), ...cart];
        if (allItems.length === 0) return;
        const consolidatedOrder = createOrderObject(allItems, [], 'dine-in');
        consolidatedOrder.originalOrderIds = pendingTableOrders.map(o => o.id);
        setActiveOrderToSettle(consolidatedOrder);
    }, [currentTable, orders, cart, createOrderObject]);
    
    const handleInitiatePayment = useCallback((orderType: OrderType) => {
        // ... implementation
    }, [cart, createOrderObject, openModal, closeModal, onProcessFinalOrder, handlePrintA4, plugins, paymentTypes, currentLocation, settings, setSettings, addToast]);
    
    const handleInitiateSettlePayment = useCallback(() => {
        // ... implementation
    }, [activeOrderToSettle, openModal, closeModal, onProcessFinalOrder, handlePrintA4, plugins, paymentTypes, currentLocation, settings, setSettings, addToast]);
    
    const handleSaveTab = useCallback(() => {
        if (!selectedCustomer) { addToast({ type: 'error', title: 'Customer Required', message: 'Please select a customer to open or add to a tab.' }); return; }
        const existingTab = (orders || []).find((o: Order) => o.customer?.id === selectedCustomer.id && o.status === 'partially-paid');
        if (existingTab) {
            const updatedCart = [...existingTab.cart, ...cart];
            const { subtotal, tax, total, finalAppliedDiscount } = calculateOrderTotals(updatedCart, currentLocation, appliedDiscount, appliedPromotion, 'tab', settings, selectedCustomer);
            const updatedTab: Order = { ...existingTab, cart: updatedCart, subtotal, tax, total, balanceDue: total, appliedDiscount: finalAppliedDiscount };
            setOrders((prev: Order[]) => prev.map(o => o.id === existingTab.id ? updatedTab : o));
        } else {
            const newTab = createOrderObject(cart, [], 'tab');
            setOrders((prev: Order[]) => [...(prev || []), newTab]);
        }
        resetPOSState();
        addToast({ type: 'success', title: 'Tab Updated', message: `Items added to ${selectedCustomer.name}'s tab.` });
    }, [selectedCustomer, cart, orders, appliedDiscount, appliedPromotion, settings, currentLocation, createOrderObject, setOrders, resetPOSState, addToast]);

    const handleSettleTab = useCallback(() => {
        if (!activeTab) return;
        setActiveOrderToSettle(activeTab);
    }, [activeTab]);
    
    const handleSelectTab = useCallback((orderId: string) => {
        const tab = (orders || []).find((o: Order) => o.id === orderId);
        if (tab) { resetPOSState(); setActiveTab(tab); setSelectedCustomer(tab.customer || null); setOrderType('tab'); }
    }, [orders, resetPOSState]);
    
    const handleApplyManualDiscount = useCallback((discount: ManualDiscount) => {
        // ... implementation
    }, [activeOrderToSettle, activeTab, cart, currentLocation, orderType, settings, selectedCustomer, closeModal]);

    const handleApplyPromotion = useCallback((promotion: Promotion) => {
        setAppliedPromotion(promotion);
        setAppliedDiscount(null);
        closeModal();
    }, [closeModal]);
    
    const handleRemoveDiscount = useCallback(() => {
        setAppliedDiscount(null);
        setAppliedPromotion(null);
        closeModal();
    }, [closeModal]);
    
    const onLoadOrder = useCallback((order: Order) => {
        resetPOSState();
        setActiveOrderToSettle(order);
        addToast({ type: 'info', title: 'Order Loaded', message: `Order #${order.orderNumber} is ready for settlement.` });
        setActiveView('pos');
    }, [resetPOSState, addToast, setActiveView]);
    
    const handleAddPizzaToCart = useCallback((item: MenuItem, config: PizzaConfiguration, price: number) => {
        // ... implementation
    }, [setCart, closeModal, currentLocation.pizzaBuilder.toppings]);
    
    const handleGetUpsellSuggestions = useCallback(async () => {
        // ... implementation
    }, [cart, menuItems, settings.ai.enableAIFeatures, settings.ai.enableUpsell, addToast]);

    const handleSaveUser = (userToSave: Employee, isNew: boolean) => {
        setEmployees(prev => {
            if (isNew) {
                addLogEntry(`Created new user: ${userToSave.name}`);
                return [...(prev || []), userToSave];
            }
            addLogEntry(`Edited user: ${userToSave.name}`);
            return (prev || []).map(u => u.id === userToSave.id ? userToSave : u);
        });
        addToast({ type: 'success', title: 'User Saved', message: `${userToSave.name} has been saved.` });
    };

    const handleDeleteUser = (userId: string) => {
        setEmployees(prev => {
            const user = (prev || []).find(u => u.id === userId);
            if (user) {
                addLogEntry(`Deleted user: ${user.name}`);
            }
            return (prev || []).filter(u => u.id !== userId);
        });
    };

    const handleSaveRole = (roleToSave: Role) => {
        setRoles(prev => {
            const isNew = !(prev || []).some(r => r.id === roleToSave.id);
            if (isNew) {
                addLogEntry(`Created new role: ${roleToSave.name}`);
                return [...(prev || []), roleToSave];
            }
            addLogEntry(`Updated permissions for role: ${roleToSave.name}`);
            return (prev || []).map(r => r.id === roleToSave.id ? roleToSave : r);
        });
        addToast({ type: 'success', title: 'Role Saved', message: `Role ${roleToSave.name} has been saved.` });
        closeModal();
    };

    const handleDeleteRole = (roleId: string) => {
        if ((employees || []).some(e => e.roleId === roleId)) {
            addToast({ type: 'error', title: 'Cannot Delete Role', message: 'This role is currently assigned to one or more users.' });
            return;
        }
        setRoles(prev => {
            const role = (prev || []).find(r => r.id === roleId);
            if (role) {
                addLogEntry(`Deleted role: ${role.name}`);
            }
            return (prev || []).filter(r => r.id !== roleId)
        });
    };

    const handleSaveLocation = (locationToSave: Location, isNew: boolean) => {
        setLocations(prev => {
            if (isNew) {
                addLogEntry(`Created new location: ${locationToSave.name}`);
                return [...(prev || []), locationToSave];
            }
            addLogEntry(`Edited location: ${locationToSave.name}`);
            return (prev || []).map(l => l.id === locationToSave.id ? locationToSave : l);
        });
        closeModal();
    };

    const handleDeleteLocation = (locationId: string) => {
        if (locations.length <= 1) {
            addToast({ type: 'error', title: 'Cannot Delete', message: 'You must have at least one location.' });
            return;
        }
        setLocations(prev => (prev || []).filter(l => l.id !== locationId));
    };

    const onSuggestRole = async (jobTitle: string): Promise<AIRoleSuggestion | null> => {
        if (!settings.ai.enableAIFeatures) {
            addToast({ type: 'info', title: 'AI Disabled', message: 'AI features are not enabled in settings.' });
            return null;
        }
        try {
            if (!process.env.API_KEY) throw new Error("API key is not configured.");
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const prompt = `Based on the job title "${jobTitle}", suggest a pre-defined role ID from this list: [${roles.map(r => `'${r.id}' (${r.name})`).join(', ')}]. Provide a brief reason for your choice.`;
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: {
                    responseMimeType: 'application/json',
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            suggestedRoleId: { type: Type.STRING },
                            reason: { type: Type.STRING }
                        },
                        required: ['suggestedRoleId', 'reason']
                    }
                }
            });
            const suggestion = JSON.parse(response.text) as AIRoleSuggestion;
            return suggestion;
        } catch (e) {
            console.error("AI role suggestion failed:", e);
            addToast({ type: 'error', title: 'AI Suggestion Failed', message: 'Could not get a role suggestion.' });
            return null;
        }
    };

    // #endregion

    const allContexts = {
        // App
        activeView, setView: setActiveView, managementSubView, setManagementSubView, settingsSubView, setSettingsSubView,
        currentEmployee, handleLogout: () => { setCurrentEmployee(null); setActiveView('landing'); },
        handlePinLogin: (employeeId: string, pin: string) => {
            const employee = employees.find(e => e.id === employeeId && e.pin === pin);
            if(employee) { setCurrentEmployee(employee); setActiveView('pos'); return true; }
            return false;
        },
        settings, setSettings, isFullscreen, onToggleFullScreen: () => setIsFullscreen(f => !f),
        currentLocationId, onLocationChange: setCurrentLocationId, currentLocation, theme, onToggleTheme, isSidebarCollapsed,
        onToggleSidebarCollapse: () => setIsSidebarCollapsed(c => !c), isSidebarHidden, onToggleSidebar: () => setIsSidebarHidden(h => !h),
        plugins, notifications, handleMarkAllNotificationsAsRead, isKsaPluginActive,
        isMultiStorePluginActive: true, isReservationPluginActive: true, isWaitlistPluginActive: true, 
        isOrderNumberDisplayPluginActive: true, isPizzaBuilderPluginActive: true, isQRCodePluginActive: true, isCallerIdPluginActive: true,
        onLaunchView: (view: View) => window.open(`#/${view}`, '_blank'),
        justAddedCategoryId, onClearJustAddedCategoryId: () => setJustAddedCategoryId(null),
        justAddedCustomer, onClearJustAddedCustomer: () => setJustAddedCustomer(null),
        
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
        handleSaveUser, handleDeleteUser, handleSaveRole, handleDeleteRole, handleSaveLocation, handleDeleteLocation,
        onSuggestRole,
        
        // POS
        cart, setCart, activeCategory, onSelectCategory: setActiveCategory, searchQuery, onSearchChange: setSearchQuery,
        selectedCustomer, setSelectedCustomer, currentTable, setCurrentTable, orderType, setOrderType,
        appliedDiscount, setAppliedDiscount, appliedPromotion, setAppliedPromotion,
        aiUpsellSuggestions, isSuggestingUpsell, selectedStaff, setSelectedStaff, activeOrderToSettle,
        activeTab, setActiveTab, availablePromotions,
        resetPOSState, onNewSaleClick, onSelectItem,
        onUpdateCartQuantity,
        onRemoveItem, onVoidOrder, handleGetUpsellSuggestions, handleHoldOrder, handleReopenOrder,
        handleDeleteHeldOrder, handleApplyManualDiscount, handleApplyPromotion, handleRemoveDiscount,
        handleInitiatePayment, handleInitiateSettlePayment, handleSendToKitchen, handleSettleBill,
        onProcessFinalOrder,
        handleSaveTab, handleSettleTab, handleSelectTab, onLoadOrder, handleAddPizzaToCart,
        handleKitchenPrinting, onPrintA4: handlePrintA4,
        
        // Modal
        modal, openModal, closeModal,
        
        // Toast
        toasts, addToast, dismissToast: (id: number) => setToasts(prev => prev.filter(t => t.id !== id)),

        // Print
        printQueue, addPrintJobs, clearPrintQueue: () => setPrintQueue([]),
        updatePrintJobStatus: (id: string, status: PrintJobStatus) => setPrintQueue(prev => prev.map(job => job.id === id ? { ...job, status } : job)),
    };

    const posContextValue = allContexts;
    const modalContextValue = allContexts;
    const toastContextValue = allContexts;
    const dataContextValue = allContexts;
    const appContextValue = allContexts;

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