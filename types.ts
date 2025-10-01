import React from 'react';

// BASIC TYPES
export type Language = 'en' | 'es' | 'ar';
export type Theme = 'light' | 'dark';
export type TranslationKey = string;

// VIEW & NAVIGATION
export type View = 'dashboard' | 'pos' | 'kds' | 'delivery' | 'cfd' | 'kiosk' | 'history' | 'tables' | 'timeclock' | 'management' | 'settings' | 'waitlist' | 'reservations' | 'qr_ordering' | 'order_number_display';

export type ManagementSubView = 
  'customers' | 'users' | 'roles' | 'purchasing' | 
  'plugins' | 'email_reporting' | 'reports' | 'signage' | 'accounting' | 
  'locations' | 'tax_rates' | 'payment_types' |
  'menu_products' | 'menu_categories' | 'menu_modifiers' | 'menu_promotions' | 'menu_pizza_builder' |
  'menu_burger_builder' | 'menu_kitchen_notes' | 'menu_void_reasons' | 'menu_discounts' |
  'menu_surcharges' | 'menu_gratuity' | 'dine_in_settings' | 'delivery_settings' | 'take_away_settings' |
  'tab_settings' | 'qr_ordering_settings' | 'loyalty' | 'suppliers' | 'ingredients' |
  'call_log' | 'advanced';

export type SettingsSubView = 
  'integrations' | 'customization' | 'fonts' | 'numbering' | 
  'preferences_settings' | 'advanced_pos_settings' | 'device_settings' | 'printers' | 
  'zatca' | 'ai' | 'activity';
  
export interface NavItem {
    id: string;
    label: string;
    icon: React.FC<React.SVGProps<SVGSVGElement>>;
    children?: NavItem[];
    parentId?: string;
}

// MENU & PRODUCTS
export interface Category {
  id: string;
  name: string;
  itemCount: number;
}
export interface MenuItem {
  id: number;
  name: string;
  price: number;
  takeawayPrice?: number;
  deliveryPrice?: number;
  cost?: number;
  category: string;
  imageUrl?: string;
  locationIds: string[];
  taxCategory: string;
  isVeg?: boolean;
  color?: string;
  kdsId?: string;
  kitchenPrinterId?: string;
  askQuantity?: boolean;
  askPrice?: boolean;
  modifierGroupIds?: string[];
  isDiscountable?: boolean;
  stock?: number;
  warnQty?: number;
  stopSaleAtZeroStock?: boolean;
  course?: string;
  isCustomizablePizza?: boolean;
  isCustomizableBurger?: boolean;
  isActive?: boolean;
  displayImage?: boolean;
  hideName?: boolean;
  useScale?: boolean;
  alwaysShowModifiers?: boolean;
  promptForKitchenNote?: boolean;
  memberPrice1?: number;
  memberPrice2?: number;
  memberPrice3?: number;
  barcodes?: string[];
  kitchenName?: string;
  displayOrder?: number;
  kitchenNote?: string;
}
export interface ModifierOption {
  name: string;
  price: number;
}
export interface ModifierGroup {
    id: string;
    name: string;
    allowMultiple: boolean;
    isRequired?: boolean;
    options: ModifierOption[];
}

// PIZZA BUILDER
export interface PizzaSize { id: string; name: string; price: number; }
export interface PizzaCrust { id: string; name: string; price: number; }
export interface PizzaSauce { id: string; name: string; price: number; }
export interface PizzaCheese { id: string; name: string; price: number; }
export interface PizzaToppingItem { id: string; name: string; price: number; }
export type PizzaToppingPlacement = 'left' | 'whole' | 'right';
export interface PizzaTopping {
    id: string;
    name: string;
    placement: PizzaToppingPlacement;
}
export interface PizzaConfiguration {
    size: PizzaSize;
    crust: PizzaCrust;
    sauce: PizzaSauce;
    cheese: PizzaCheese;
    toppings: PizzaTopping[];
}
export interface PizzaBuilderSettings {
    sizes: PizzaSize[];
    crusts: PizzaCrust[];
    sauces: PizzaSauce[];
    cheeses: PizzaCheese[];
    toppings: PizzaToppingItem[];
}

// BURGER BUILDER
export interface BurgerBun { id: string; name: string; price: number; }
export interface BurgerPatty { id: string; name: string; price: number; weight?: string; }
export interface BurgerCheese { id: string; name: string; price: number; }
export interface BurgerToppingItem { id: string; name: string; price: number; }
export interface BurgerSauce { id: string; name: string; price: number; }
export interface BurgerExtras { id: string; name: string; price: number; }
export interface BurgerConfiguration {
  bun: BurgerBun;
  patty: BurgerPatty;
  cheese?: BurgerCheese;
  toppings: BurgerToppingItem[];
  sauces: BurgerSauce[];
  extras: BurgerExtras[];
  isDouble?: boolean;
}
export interface BurgerBuilderSettings {
    buns: BurgerBun[];
    patties: BurgerPatty[];
    cheeses: BurgerCheese[];
    toppings: BurgerToppingItem[];
    sauces: BurgerSauce[];
    extras: BurgerExtras[];
}

// ORDER & CART
export type OrderType = 'dine-in' | 'takeaway' | 'delivery' | 'kiosk' | 'tab';
export type OrderStatus = 'pending' | 'kitchen' | 'served' | 'completed' | 'partially-paid' | 'out-for-delivery' | 'delivered' | 'refund-pending' | 'refunded' | 'process';
export interface CartItem {
  cartId: string;
  menuItem: MenuItem;
  quantity: number;
  selectedModifiers: ModifierOption[];
  priceOverride?: number;
  appliedManualDiscount?: ManualDiscount | null;
  kitchenNote?: string;
  pizzaConfiguration?: PizzaConfiguration;
  burgerConfiguration?: BurgerConfiguration;
}
export interface Order {
    id: string;
    orderNumber: string;
    invoiceNumber: string;
    createdAt: number;
    completedAt?: number;
    deliveredAt?: number;
    cart: CartItem[];
    customer?: Customer;
    employeeId?: string;
    subtotal: number;
    tax: number;
    taxDetails: Record<string, number>;
    total: number;
    balanceDue: number;
    orderType: OrderType;
    status: OrderStatus;
    source: 'in-store' | 'online' | 'uber-eats' | 'doordash' | 'kiosk' | 'qr_ordering';
    payments: Payment[];
    tableId?: string;
    locationId: string;
    isTraining: boolean;
    appliedDiscount: AppliedDiscount | null;
    appliedPromotion?: Promotion;
    appliedLoyaltyPoints?: number;
    guestCount?: number;
    notes?: string;
    preparedCartItemIds?: string[];
    originalOrderIds?: string[];
    refundedAmount?: number;
    estimatedPrepTimeMinutes?: number;
    estimatedWaitTime?: string;
    driverId?: string;
    lateFee?: number;
}
export interface HeldOrder {
  id: string;
  timestamp: number;
  cart: CartItem[];
  customer: Customer | null;
  table: Table | null;
  appliedDiscount: AppliedDiscount | null;
  appliedPromotion?: Promotion | null;
  employeeName: string;
  orderType: OrderType;
}

// PAYMENT & DISCOUNTS
export type PaymentMethod = 'Cash' | 'Card' | 'Online' | string;
export interface Payment {
    method: PaymentMethod;
    amount: number;
    timestamp: number;
}
export interface PaymentType {
    id: string;
    name: string;
    isEnabled: boolean;
}
export interface AppliedDiscount {
  name: string;
  amount: number;
  id?: string;
}
export type PromotionType = 'percentage' | 'fixed' | 'bogo';
export interface Promotion {
    id: string;
    name: string;
    type: PromotionType;
    value: number;
    startTime: string;
    endTime: string;
    daysOfWeek: number[];
    applicableCategoryIds: string[];
    applicableProductIds: number[];
    isActive: boolean;
}
export interface ManualDiscount {
    id: string;
    name: string;
    percentage: number;
}
export interface Surcharge {
    id: string;
    name: string;
    type: 'fixed' | 'percentage';
    value: number;
}

// FIX: Added missing Location interface.
// BUSINESS & SETUP
export interface Location {
    id: string;
    name: string;
    address: string;
    phone: string;
    email: string;
    taxRates: Record<string, number>;
    invoiceFooterText: string;
    countryCode: string;
    currency: string;
    pizzaBuilder: PizzaBuilderSettings;
    burgerBuilder: BurgerBuilderSettings;
    vatNumber?: string;
}

// PEOPLE & ROLES
export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  locationId: string;
  loyaltyPoints?: number;
  membershipId?: string;
  zipCode?: string;
  country?: string;
  allergies?: string;
  notes?: string;
  membershipTier?: 1 | 2 | 3;
}
export type ShiftStatus = 'clocked-in' | 'clocked-out' | 'on-break';
export interface Break {
    start: number;
    end?: number;
}
export interface Shift {
    clockIn: number;
    clockOut?: number;
    breaks?: Break[];
}
export interface Employee {
    id: string;
    name: string;
    pin: string;
    roleId: string;
    shiftStatus: ShiftStatus;
    shifts: Shift[];
    locationId: string;
    avatar?: string;
}
export type DriverStatus = 'available' | 'on-delivery' | 'offline';
export interface Driver {
    id: string;
    name: string;
    phone: string;
    status: DriverStatus;
    locationId: string;
}
export interface PermissionSet {
    viewDashboard: boolean;
    viewPOS: boolean;
    viewFloorPlan: boolean;
    viewKDS: boolean;
    viewDelivery: boolean;
    viewPurchasing: boolean;
    viewCustomers: boolean;
    viewReports: boolean;
    viewSettings: boolean;
    viewHistory: boolean;
    viewTimeClock: boolean;
    viewReservations: boolean;
    viewWaitlist: boolean;
    canViewAllReports: boolean;
    canViewInventoryReport: boolean;
    canPerformManagerFunctions: boolean;
    canManageUsersAndRoles: boolean;
    canApproveRefunds: boolean;
    viewOrderNumberDisplay: boolean;
}
export interface Role {
    id: string;
    name: string;
    permissions: PermissionSet;
}

// INVENTORY & SUPPLIERS
export interface Supplier {
    id: string;
    name: string;
    phone: string;
    email: string;
    address: string;
}
export interface Ingredient {
    id: string;
    name: string;
    stock: number;
    unit: 'g' | 'kg' | 'ml' | 'l' | 'unit';
    costPerUnit: number;
    reorderThreshold: number;
    supplierId: string;
    locationId: string;
}
export interface RecipeItem {
    ingredientId: string;
    quantity: number;
}
export interface WastageEntry {
    id: string;
    ingredientId: string;
    quantity: number;
    cost: number;
    reason: string;
    date: number;
    locationId: string;
}
export interface PurchaseOrderItem {
    ingredientId: string;
    quantity: number;
    costPerItem: number;
}
export interface PurchaseOrder {
    id: string;
    supplierId: string;
    items: PurchaseOrderItem[];
    status: 'draft' | 'sent' | 'fulfilled';
    totalCost: number;
    createdAt: number;
    locationId: string;
}

// TABLES & RESERVATIONS
export type TableStatus = 'available' | 'occupied' | 'reserved';
export type TableShape = 'square' | 'round' | 'rectangle-h' | 'rectangle-v';
export interface Table {
  id: string;
  name: string;
  capacity: number;
  status: TableStatus;
  locationId: string;
  shape: TableShape;
  x: number;
  y: number;
  floor: string;
  orderId?: string;
  occupiedSince?: number;
  customerName?: string;
  guestCount?: number;
  reservationTime?: number;
}
export type ReservationStatus = 'pending' | 'seated' | 'cancelled' | 'no-show';
export type ReservationSystem = 'none' | 'opentable' | 'google';
export interface Reservation {
    id: string;
    customerId: string;
    tableId: string;
    partySize: number;
    reservationTime: number;
    status: ReservationStatus;
    notes?: string;
    locationId: string;
}
export type WaitlistStatus = 'Waiting' | 'Notified' | 'Seated' | 'Removed';
export interface WaitlistEntry {
    id: string;
    customerName: string;
    phone: string;
    partySize: number;
    quotedWaitTime: number; // in minutes
    addedAt: number;
    status: WaitlistStatus;
    notifiedAt?: number;
    locationId: string;
}

// HARDWARE & DEVICES
export type KitchenProfileType = 'kitchen_1' | 'kitchen_2' | 'kitchen_3' | 'kitchen_4' | 'kitchen_5' | 'kitchen_6' | 'bar' | 'order' | 'takeaway' | 'report';
export type PrinterConnectionType = 'Print Server' | 'PDF Printer' | 'Bluetooth' | 'USB';
export interface PrinterReceiptSettings {
    headerLines: string[];
    footerLines: string[];
    fontSize: number;
    copies: number;
    marginTop: number;
    marginBottom: number;
    marginLeft: number;
    marginRight: number;
    showCustomer: boolean;
    showTable: boolean;
    showGuests: boolean;
    showInvoiceNumber: boolean;
    showOrderNumber: boolean;
    showStaff: boolean;
    showOrderTime: boolean;
    showItemIndex: boolean;
    showZeroPriceItems: boolean;
    showUnitPrice: boolean;
    showItemQuantity: boolean;
    showQuantityBeforeItem: boolean;
    showKitchenNote: boolean;
    showTotalQuantity: boolean;
    showTipGuide: boolean;
    showBarcode: boolean;
    logoUrl: string;
    footerLogoUrl: string;
    promoMessage: string;
}
export interface KitchenPrintSettings extends Omit<PrinterReceiptSettings, 'showTipGuide' | 'promoMessage' | 'logoUrl' | 'footerLogoUrl' > {
    showBarcode: boolean;
}

export interface Printer {
    id: string;
    name: string;
    type: 'thermal' | 'a4';
    connection: PrinterConnectionType;
    model?: string;
    paperWidth: number;
    initialCommand?: string;
    cutterCommand?: string;
    drawerCommand?: string;
    useRasterImage?: boolean;
    hasDrawer?: boolean;
    isEnabled: boolean;
    status: 'connected' | 'disconnected' | 'error';
    receiptSettings?: PrinterReceiptSettings;
    kitchenProfiles?: Partial<Record<KitchenProfileType, KitchenPrintSettings>>;
    isDefault: boolean;
    ipAddress?: string;
    isProfileHub?: boolean;
    port?: number;
}
export interface KitchenDisplay {
    id: string;
    name: string;
    status: 'connected' | 'disconnected';
    connectionType: 'network' | 'local';
    ipAddress?: string;
    isEnabled: boolean;
    isDefault: boolean;
}
export interface CustomerDisplay {
    id: string;
    name: string;
    type: 'display';
    status: 'connected' | 'disconnected';
    ipAddress: string;
    isEnabled: boolean;
    isDefault: boolean;
}
export interface GenericDevice {
    id: string;
    name: string;
    type: 'scale' | 'scanner' | 'other';
    status: 'connected' | 'disconnected';
    isDefault: boolean;
}
export type PrintJobStatus = 'pending' | 'printing' | 'completed' | 'error';
export interface PrintJob {
  id: string;
  timestamp: number;
  status: PrintJobStatus;
  component: string;
  props: any;
}

// LOGS & MISC
export interface AuditLogEntry {
    id: string;
    timestamp: number;
    employeeId: string;
    employeeName: string;
    action: string;
}
export interface CallLogEntry {
    id: string;
    timestamp: number;
    phoneNumber: string;
    customerId?: string;
    orderId?: string;
}
export interface KitchenNote {
    id: string;
    note: string;
}
export interface VoidReason {
    id: string;
    reason: string;
}
export interface Subscription {
    id: string;
    customerId: string;
    cart: CartItem[];
    frequency: 'weekly' | 'monthly';
    startDate: number;
    locationId: string;
    status: 'active' | 'paused' | 'cancelled';
}
export interface ScheduleEntry {
    id: string;
    employeeId: string;
    dayOfWeek: number; // 0 for Sunday, 1 for Monday, etc.
    startTime: string; // "HH:MM"
    endTime: string; // "HH:MM"
}

// DIGITAL SIGNAGE
export type SignageContentType = 'image' | 'video' | 'menu_promo';
export type SignageSubView = 'displays' | 'content' | 'playlists' | 'scheduler' | 'cfd_attract';
export interface SignageDisplay {
    id: string;
    name: TranslationKey;
    status: 'online' | 'offline';
}
export interface SignageContentItem {
    id: string;
    name: TranslationKey;
    type: SignageContentType;
    sourceUrl: string;
    duration: number; // in seconds
    menuItemIds?: number[];
}
export interface SignagePlaylist {
    id: string;
    name: TranslationKey;
    items: string[]; // array of content_ids
}
export interface SignageScheduleEntry {
    id: string;
    displayId: string;
    playlistId: string;
    dayOfWeek: number;
    startTime: string;
    endTime: string;
}

// AI & PLUGINS
export interface AIResponse {
    suggestions: Array<{ itemName: string; reason: string }>;
}
export interface AIReportAnalysis {
    summary: string;
    positiveInsight: string;
    actionableRecommendation: string;
}
export interface AIExecutiveSummary {
    title: string;
    salesSummary: string[];
    menuInsights: string[];
    staffPerformance: string[];
}
export interface AIRoleSuggestion {
    suggestedRoleId: string;
    reason: string;
}
export interface AIBusyZoneAnalysis {
    summary: string;
    positivePoints: string[];
    recommendations: string[];
}
export interface AIEstimatedWaitTime {
    estimatedWait: string;
}
export interface AppPlugin {
    id: string;
    name: string;
    description: string;
    version: string;
    isFree: boolean;
    sortOrder: number;
    status: 'enabled' | 'disabled' | 'trial' | 'expired';
    trialStartDate: number | null;
    activationDate?: number;
    licenseDurationDays?: number;
}

// SETTINGS
export interface FontSettings {
    baseSize: number;
    menuItemName: number;
    menuItemPrice: number;
    orderSummaryItem: number;
    orderSummaryTotal: number;
    categoryTabs: number;
}
export interface LoyaltySettings {
    enabled: boolean;
    pointsPerDollar: number;
    redemptionRate: number; // points per $1
}
export type SalesDashboardWidgetId = 'stats' | 'chart' | 'payment' | 'topItems' | 'locationPerformance' | 'quickActions' | 'lowStock' | 'recentTransactions';
export interface POSPreferences {
    actionAfterSendOrder: 'order' | 'tables' | 'login';
    actionAfterPayment: 'order' | 'tables' | 'login';
    defaultPaymentMethod: string;
    enableOrderNotes: boolean;
    enableKitchenPrint: boolean;
    defaultOrderType: OrderType;
    enableOrderHold: boolean;
    resetOrderNumberDaily: boolean;
    dashboardWidgetOrder: SalesDashboardWidgetId[];
}
export interface AdvancedPOSSettings {
    enableItemNumber: boolean;
    separateSameItems: boolean;
    combineKitchenItems: boolean;
    kitchenPrintFooter: boolean;
    kitchenPrintReservedOrder: boolean;
    sortItemInKitchen: boolean;
    sortModifier: boolean;
    sortOrderInKDS: boolean;
    printVoidOrderItem: boolean;
    printOrderAfterSending: boolean;
    quickPay: boolean;
    useVoidReason: boolean;
    confirmPayment: boolean;
    printReceiptAfterPayment: boolean;
    combineReceiptItem: boolean;
    sortItemInReceipt: boolean;
    showItemDiscount: boolean;
    showVoidOrderItem: boolean;
    emailReceipt: boolean;
    showTaxOnReceipt: boolean;
    inventoryManagement: boolean;
    allowMinusQuantity: boolean;
    useInventoryPrint: boolean;
    useEndOfDayReport: boolean;
    useStaffSalary: boolean;
    useCashInOutPrint: boolean;
    useWorkTimePrint: boolean;
    autoClockOut: boolean;
    loginDoNotRememberPassword: boolean;
    dateFormat: string;
    lockTillToLocation: boolean;
    enableTimeClock: boolean;
    defaultPrepTimeMinutes: number;
    sendLowStockEmails: boolean;
    lowStockEmailRecipients: string;
    enableDeliveryMaps: boolean;
    enableLiveDriverTracking: boolean;
}
export interface DeviceSettings {
    receiptPrinterId: string | null;
    kitchenPrinterId: string | null;
    kioskPrinterId: string | null;
    barPrinterId: string | null;
    reportPrinterId: string | null;
    customerDisplayId: string | null;
    kitchenDisplayId: string | null;
    scaleId: string | null;
    printServerUrl: string;
}
export interface QROrderingSettings {
    enabled: boolean;
    baseUrl: string;
}
export interface TabSettings {
    enabled: boolean;
    customName: string;
}
export interface TakeAwaySettings {
    enabled: boolean;
    customName: string;
    requireCustomerName: boolean;
    useHoldReason: boolean;
    surcharge: {
        enabled: boolean;
        name: string;
        type: 'fixed' | 'percentage';
        value: number;
    };
}
export interface DeliveryZone {
    id: string;
    name: string;
    fee: number;
    geojson: any | null; // For map data
}
export interface DeliverySettings {
    enabled: boolean;
    surcharge: {
        enabled: boolean;
        surchargeId: string | null;
    };
    zones: DeliveryZone[];
}
export interface DineInSettings {
    enabled: boolean;
    defaultGuests: number;
    maxGuests: number;
    enableStaffSelection: boolean;
    showGuestCountPrompt: boolean;
    surcharge: {
        enabled: boolean;
        name: string;
        type: 'fixed' | 'percentage';
        value: number;
    };
    minCharge: {
        enabled: boolean;
        amount: number;
    };
}
export interface NotificationSettings {
    duration: number; // in seconds
    position: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
    theme: 'dark' | 'transparent';
}
export type PaymentProvider = 'stripe' | 'adyen' | 'square' | 'none';
export type AccountingSoftware = 'quickbooks' | 'xero' | 'none';
export interface LanguageSettings {
    staff: Language;
    customer: Language;
}
export type ReceiptTemplateId = 'standard' | 'compact' | 'zatca_bilingual';
export type InvoiceTemplateId = 'modern' | 'classic' | 'zatca_bilingual';
export interface ReceiptSettings extends PrinterReceiptSettings {
    template: ReceiptTemplateId;
}
export interface ZatcaSettings {
    enabled: boolean;
    productionCert: string;
    productionCSR: string;
    isSandbox: boolean;
    fatooraApiKey: string;
    qrCodeSize: number;
    qrCodePosition: 'top' | 'bottom';
}
export interface DualCurrencySettings {
    enabled: boolean;
    secondaryCurrency: string;
    exchangeRate: number;
}
export interface OrderSettings {
    gratuityOptions: number[];
    invoicePrefix: string;
    invoiceSuffix: string;
    nextInvoiceNumber: number;
    nextDailyOrderNumber: number;
    dailyOrderSequenceLastReset: string;
}
export interface AISettings {
    enableAIFeatures: boolean;
    enableUpsell: boolean;
    enableCFDSuggestions: boolean;
    enableReportAnalysis: boolean;
}
export interface AppSettings {
    paymentProvider: PaymentProvider;
    paymentTerminalSecretKey: string;
    terminalId: string;
    accountingSoftware: AccountingSoftware;
    quickbooksApiKey: string;
    xeroApiKey: string;
    reservationSystem: ReservationSystem;
    opentableApiKey: string;
    googleReservationsApiKey: string;
    orderSettings: OrderSettings;
    dualCurrency: DualCurrencySettings;
    zatca: ZatcaSettings;
    receipt: ReceiptSettings;
    invoice: { template: InvoiceTemplateId };
    theme: {
        primary: string;
        background: string;
        surface: string;
        textBase: string;
        textMuted: string;
    };
    language: LanguageSettings;
    deliveryApps: {
        uberEats: { enabled: boolean; apiKey: string };
        doordash: { enabled: boolean; apiKey: string };
    };
    iotSensors: {
        smartFridges: { enabled: boolean; apiKey: string };
        storageSensors: { enabled: boolean; apiKey: string };
    };
    ai: AISettings;
    cfd: {
        attractScreenPlaylistId: string | null;
        featuredItemIds: number[];
    };
    notificationSettings: NotificationSettings;
    dineIn: DineInSettings;
    delivery: DeliverySettings;
    takeAway: TakeAwaySettings;
    tab: TabSettings;
    qrOrdering: QROrderingSettings;
    devices: DeviceSettings;
    advancedPOS: AdvancedPOSSettings;
    preferences: POSPreferences;
    loyalty: LoyaltySettings;
    fontSettings: FontSettings;
}
export interface Notification {
  id: number;
  message: string;
  timestamp: number;
  read: boolean;
  type: 'info' | 'success' | 'error';
}
export interface ToastNotification extends Notification {}
export interface ReportSchedule {
    id: string;
    reportName: 'Daily Sales Summary' | 'Weekly Sales Summary';
    frequency: 'daily' | 'weekly';
    recipients: string[];
    locationId: string;
}
// FIX: Add missing ReportGroup and ReportTab types
export type ReportGroup = 'sales' | 'people' | 'operations' | 'bi';
export type ReportTab =
  | 'summary' | 'sales' | 'menu' | 'categories' | 'financials'
  | 'discounts' | 'delivery' | 'staff_performance' | 'labor'
  | 'customer' | 'retention' | 'inventory' | 'kiosk' | 'cfd' | 'bi_dashboard';

export interface SimulationLogEntry {
  timestamp: number;
  message: string;
}
export interface SimulationReport {
  totalOrders: number;
  ordersPerMinute: number;
  printerJobs: Record<string, number>;
}
export interface CSVImportResult {
    success: boolean;
    message: string;
    addedCount: number;
    updatedCount: number;
    errorCount: number;
    errors: string[];
}