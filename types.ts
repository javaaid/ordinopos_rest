

import React from 'react';

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

export type Language = 'en' | 'es' | 'ar';

export type Theme = 'light' | 'dark';
export type View = 'dashboard' | 'pos' | 'kds' | 'delivery' | 'cfd' | 'kiosk' | 'history' | 'tables' | 'timeclock' | 'management' | 'settings' | 'waitlist' | 'reservations' | 'qr_ordering' | 'order_number_display' | 'landing';
export type ManagementSubView = 
  'customers' | 'users' | 'roles' | 'purchasing' | 
  'plugins' | 'email_reporting' | 'reports' | 'signage' | 'accounting' | 
  'locations' | 'tax_rates' | 'payment_types' | 'suppliers' | 'ingredients' |
  'dine_in_settings' | 'delivery_settings' | 'take_away_settings' | 'tab_settings' |
  // New Menu sub-views
  'menu_categories' | 'menu_products' | 'menu_modifiers' | 'menu_promotions' | 
  'menu_kitchen_notes' | 'menu_void_reasons' | 'menu_discounts' | 
  'menu_surcharges' | 'menu_gratuity' | 'menu_pizza_builder' | 'menu_burger_builder' |
  // New Telephony sub-view
  'call_log' |
  // New Loyalty sub-view
  'loyalty';
export type SettingsSubView = 'integrations' | 'customization' | 'activity' | 'advanced' | 'zatca' | 'ai' | 'numbering' | 'device_settings' | 'printers' | 'advanced_pos_settings' | 'preferences_settings';
export type SignageSubView = 'displays' | 'content' | 'playlists' | 'scheduler' | 'cfd_attract';

export type TranslationKey = 
  // General
  'add' | 'all' | 'total' | 'cancel' | 'tax' | 'subtotal' | 'discount' | 'change' |
  
  // Kiosk / CFD Shared
  'welcome' | 'your_order' | 'thank_you' |
  
  // Kiosk specific
  'tap_to_start' | 'start_order' | 'tap_to_start_button' | 'cart_empty' | 'cart_empty_subtitle' |
  'confirm_and_pay' | 'finalizing_order' | 'tap_card' | 'processing_payment' |
  'order_placed' | 'pickup_at_counter' |
  
  // CFD specific
  'place_order_cashier' | 'you_might_like' | 'finalize_payment' | 'follow_instructions' |
  'your_order_number_is' | 'estimated_wait_time' | 'estimating_wait_time_loading' | 
  'scan_receipt' | 'scan_tracking' |
  
  // Modifier Modal
  'customize_item' | 'add_to_order' |

  // AI Suggestions
  'ai_suggestions' | 'thinking_suggestions' |
  
  // Order Summary
  'walk_in_customer' | 'member' | 'guest' | 'choose_staff' | 'serving' | 'ai_upsell' |
  'hold_order' | 'void_order' | 'new_sale' | 'settling' | 'new_order' | 'dine_in' | 'take_away' | 'delivery' | 'tab' |
  'select_table' |
  'new_items' | 'running_tab' | 'items_on_bill' |
  'your_cart_is_empty' | 'apply_discount' | 'settle_payment' |
  'send_to_kitchen' | 'settle_bill' |
  'delivery_needs_customer' | 'tab_needs_customer' | 'on_tab' | 'add_to_tab' | 'settle_tab' | 'place_order' | 'open_tab' |

  // POS Header
  'search_items' | 'change_location' | 'held_orders' | 'launchpad' | 'kds' | 'cfd' | 'kiosk' | 'pizza_builder' | 'order_display' |
  
  // Main Sidebar
  'dashboard' | 'pos' | 'tables' | 'order_history' | 'time_clock' | 'management' | 'settings' | 'logout' | 'sidebar_user' | 'sidebar_role' |

  // Print Queue
  'print_queue' |

  // Order Number Display
  'now_serving' | 'close_window' | 'back_to_main_screen' |
  
  // Management Sidebar
  'menu' | 'menu_categories' | 'menu_products' | 'menu_modifiers' | 'menu_promotions' | 
  'menu_pizza_builder' | 'menu_kitchen_notes' | 'menu_void_reasons' | 'menu_discounts' | 
  'menu_surcharges' | 'menu_gratuity' | 'services' | 'preferences' | 
  'contacts' | 'customers' | 'suppliers' | 'users_and_roles' | 'users' | 'roles' | 
  'purchasing' | 'reports' | 'view_reports' | 'email_reporting' | 'accounting' | 
  'locations' | 'tax_rates' | 'payment_types' | 'telephony' | 'call_log' | 'plugins' | 
  'digital_signage' | 'menu_burger_builder' |
  
  // Settings Sidebar
  'integrations' | 'customization' | 'devices' | 'printers' | 'numbering' | 'activity_log' | 
  'zatca_ksa' | 'ai_settings' | 'advanced' | 'branding_localization' | 'pos_configuration' | 
  'advanced_pos' | 'system_and_data' | 'backup_restore' |
  
  // Order History
  'order_hash' | 'date_time' | 'balance_due' | 'status' | 'actions' |
  
  // Loyalty Program
  'loyalty_program' | 'loyalty_points' | 'redeem_points' | 'apply_points' | 
  'points_to_redeem' | 'points_balance' | 'loyalty_discount';

export type PaymentMethod = string;
export type OrderType = 'dine-in' | 'takeaway' | 'delivery' | 'kiosk' | 'tab';

export interface PaymentType {
  id: string;
  name: string;
  isEnabled: boolean;
}

export interface ModifierOption {
  name: string;
  price: number;
}

export interface ModifierGroup {
  id: string;
  name:string;
  allowMultiple: boolean;
  options: ModifierOption[];
  isPizzaToppings?: boolean;
  isRequired?: boolean;
}

export interface Location {
    id: string;
    name: string;
    address?: string;
    phone?: string;
    email?: string;
    taxRates: Record<string, number>; // e.g. { "standard": 0.08, "alcohol": 0.10 }
    invoiceFooterText: string;
    vatNumber?: string;
    countryCode: string;
    currency: string;
    pizzaBuilder: PizzaBuilderSettings;
    burgerBuilder: BurgerBuilderSettings;
}

export interface Supplier {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
}

export interface Ingredient {
  id: string;
  name: string;
  stock: number; // in base unit (e.g., grams, ml, or units)
  unit: 'g' | 'kg' | 'ml' | 'l' | 'unit';
  costPerUnit: number;
  reorderThreshold: number;
  supplierId?: string;
  locationId: string;
}

export interface RecipeItem {
  ingredientId: string;
  quantity: number; // in the ingredient's base unit
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

export interface KitchenDisplay {
  id: string;
  name: string;
  status: 'connected' | 'disconnected';
  connectionType: 'network' | 'local';
  ipAddress?: string;
  isEnabled: boolean;
  isDefault?: boolean;
}

export interface MenuItem {
  id: number;
  name:string;
  price: number; // Dine In Price
  category: string;
  imageUrl: string;
  locationIds: string[];
  taxCategory: string; // e.g. "standard", "alcohol"
  modifierGroupIds?: string[];
  barcodes?: string[];
  isActive?: boolean;
  code?: string;
  uom?: string;
  isVeg?: boolean;
  discount?: number; // e.g. 0.2 for 20%
  color?: string;
  isCustomizablePizza?: boolean;
  isCustomizableBurger?: boolean;

  // New fields
  course?: string;
  kitchenName?: string;
  takeawayPrice?: number;
  deliveryPrice?: number;
  memberPrice1?: number;
  memberPrice2?: number;
  memberPrice3?: number;
  cost?: number;
  stock?: number;
  warnQty?: number;
  
  stopSaleAtZeroStock?: boolean;
  askPrice?: boolean;
  askQuantity?: boolean;
  hideName?: boolean;
  isDiscountable?: boolean;
  useScale?: boolean;
  displayOrder?: number;
  displayImage?: boolean;
  promptForKitchenNote?: boolean;
  alwaysShowModifiers?: boolean;

  kitchenNote?: string;
  kitchenPrinterId?: string;
  kdsId?: string;
}

export interface Category {
  id: string;
  name: string;
  itemCount: number;
}

export interface CartItem {
  cartId: string;
  menuItem: MenuItem;
  quantity: number;
  selectedModifiers: ModifierOption[];
  priceOverride?: number;
  kitchenNote?: string;
  pizzaConfiguration?: PizzaConfiguration;
  burgerConfiguration?: BurgerConfiguration;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  locationId: string;
  loyaltyPoints?: number;
  membershipTier?: 1 | 2 | 3;
  zipCode?: string;
  country?: string;
  allergies?: string;
  notes?: string;
}

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

export interface AppliedDiscount {
  name: string;
  amount: number;
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

export interface PizzaSize {
    id: string;
    name: string;
    price: number;
}
export interface PizzaCrust {
    id: string;
    name: string;
    price: number;
}
export interface PizzaSauce {
    id: string;
    name: string;
    price: number;
}
export interface PizzaCheese {
    id: string;
    name: string;
    price: number;
}
export interface PizzaToppingItem {
    id: string;
    name: string;
    price: number;
}

export interface PizzaBuilderSettings {
    sizes: PizzaSize[];
    crusts: PizzaCrust[];
    sauces: PizzaSauce[];
    cheeses: PizzaCheese[];
    toppings: PizzaToppingItem[];
}

export interface BurgerBun {
    id: string;
    name: string;
    price: number;
}
export interface BurgerPatty {
    id: string;
    name: string;
    price: number;
    weight?: string;
}
export interface BurgerCheese {
    id: string;
    name: string;
    price: number;
}
export interface BurgerToppingItem {
    id: string;
    name: string;
    price: number;
}
export interface BurgerSauce {
    id: string;
    name: string;
    price: number;
}
export interface BurgerExtras {
    id: string;
    name: string;
    price: number;
}

export interface BurgerBuilderSettings {
    buns: BurgerBun[];
    patties: BurgerPatty[];
    cheeses: BurgerCheese[];
    toppings: BurgerToppingItem[];
    sauces: BurgerSauce[];
    extras: BurgerExtras[];
}

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

export interface BurgerConfiguration {
  bun: BurgerBun;
  patty: BurgerPatty;
  cheese?: BurgerCheese;
  toppings: BurgerToppingItem[];
  sauces: BurgerSauce[];
  extras: BurgerExtras[];
  isDouble?: boolean;
}

export interface Driver {
  id: string;
  name: string;
  phone: string;
  status: 'available' | 'on-delivery' | 'offline';
  locationId: string;
}

export interface Shift {
  clockIn: number;
  clockOut?: number;
}

export interface Employee {
  id: string;
  name: string;
  pin: string;
  roleId: string;
  shiftStatus: 'clocked-in' | 'clocked-out' | 'on-break';
  shifts: Shift[];
  locationId: string;
  avatar?: string;
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

export interface AuditLogEntry {
  id: string;
  timestamp: number;
  employeeId: string;
  employeeName: string;
  action: string;
}

export type PrinterType = 'thermal' | 'a4';
export type PrinterConnectionType = 'PDF Printer' | 'ESC/POS Printer Wifi/Lan' | 'Bluetooth' | 'USB' | 'Print Server';
export type KitchenProfileType = 'kitchen_1' | 'kitchen_2' | 'kitchen_3' | 'kitchen_4' | 'kitchen_5' | 'kitchen_6' | 'bar' | 'order' | 'takeaway' | 'report';

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

export interface KitchenPrintSettings {
  headerLines: string[];
  footerLines: string[];
  fontSize: number;
  copies: number;
  marginTop: number;
  marginBottom: number;
  marginLeft: number;
  marginRight: number;
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
  showTable: boolean;
  showGuests: boolean;
  showCustomer: boolean;
  showInvoiceNumber: boolean;
  showBarcode: boolean;
}

// Misc & UI
export type SalesDashboardWidgetId = 'stats' | 'chart' | 'payment' | 'topItems' | 'locationPerformance' | 'quickActions' | 'lowStock' | 'recentTransactions';
export interface NavItem {
    id: ManagementSubView | SettingsSubView | string;
    label: string;
    icon: React.FC<React.SVGProps<SVGSVGElement>>;
    children?: NavItem[];
    parentId?: string;
}
export interface Notification {
  id: number;
  message: string;
  timestamp: number;
  read: boolean;
}
export interface ToastNotification {
  id: number;
  type: 'success' | 'error' | 'info';
  title: string;
  message: string;
}
export type PrintJobStatus = 'pending' | 'printing' | 'completed' | 'error';
export interface PrintJob {
  id: string;
  timestamp: number;
  component: string;
  props: any;
  status: PrintJobStatus;
}

export interface ReportSchedule {
  id: string;
  reportName: 'Daily Sales Summary' | 'Weekly Sales Summary';
  frequency: 'daily' | 'weekly';
  recipients: string[];
  locationId: string;
}

export interface CSVImportResult {
    success: boolean;
    message: string;
    added: number;
    updated: number;
    errors: number;
}
export type CsvImportFunction = (csvText: string) => Promise<CSVImportResult>;

// AI Related
export interface AIResponse {
  suggestions: {
    itemName: string;
    reason: string;
  }[];
}
export interface AIEstimatedWaitTime {
  wait_time: string;
}
export interface AIRoleSuggestion {
  suggestedRoleId: string;
  reason: string;
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
export interface AIFloorPlanSuggestion {
    floorName: string;
    suggestions: string[];
}
export interface AIBusyZoneAnalysis {
    summary: string;
    positivePoints: string[];
    recommendations: string[];
}
export interface AIInvoiceWarning {
    is_late: boolean;
    reason: string;
}
export interface AILoyaltyResponse {
    suggestion: string;
    reason: string;
}

export interface AISettings {
  enableAIFeatures: boolean;
  enableUpsell: boolean;
  enableCFDSuggestions: boolean;
  enableReportAnalysis: boolean;
}

// Data models
export interface KitchenNote {
  id: string;
  note: string;
}
export interface VoidReason {
  id: string;
  reason: string;
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

export interface Subscription {
  id: string;
  customerId: string;
  cart: CartItem[];
  frequency: 'weekly' | 'monthly';
  startDate: number;
  status: 'active' | 'paused' | 'cancelled';
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
  totalCost: number;
  status: 'draft' | 'sent' | 'fulfilled';
  createdAt: number;
  locationId: string;
}

export type ReservationStatus = 'pending' | 'seated' | 'cancelled' | 'no-show';
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

export interface ScheduleEntry {
  id: string;
  employeeId: string;
  dayOfWeek: number; // 0 for Sunday, 6 for Saturday
  startTime: string; // "HH:mm"
  endTime: string; // "HH:mm"
}

export type OrderStatus = 'pending' | 'kitchen' | 'served' | 'completed' | 'partially-paid' | 'out-for-delivery' | 'delivered' | 'refund-pending' | 'refunded' | 'process';
export type OrderSource = 'in-store' | 'online' | 'uber-eats' | 'doordash' | 'kiosk' | 'qr_ordering';
export interface Payment {
  method: PaymentMethod;
  amount: number;
  timestamp: number;
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
  total: number;
  balanceDue: number;
  taxDetails: Record<string, number>;
  orderType: OrderType;
  status: OrderStatus;
  source: OrderSource;
  payments: Payment[];
  tableId?: string;
  locationId: string;
  isTraining: boolean;
  appliedDiscount: AppliedDiscount | null;
  appliedPromotion?: Promotion | null;
  appliedLoyaltyPoints?: number;
  guestCount?: number;
  notes?: string;
  driverId?: string;
  refundedAmount?: number;
  preparedCartItemIds?: string[];
  estimatedWaitTime?: string;
  originalOrderIds?: string[]; // For merged table bills
  lateFee?: number;
}

// Hardware & Devices
export interface GenericDevice {
  id: string;
  name: string;
  type: 'scale' | 'scanner';
  status: 'connected' | 'disconnected';
  isDefault?: boolean;
}
export interface CustomerDisplay {
  id: string;
  name: string;
  type: 'display';
  status: 'connected' | 'disconnected';
  ipAddress?: string;
  isEnabled: boolean;
  isDefault?: boolean;
}
export interface Printer {
  id: string;
  name: string;
  type: PrinterType;
  connection: PrinterConnectionType;
  model?: string;
  paperWidth: 48 | 58 | 80;
  initialCommand?: string;
  cutterCommand?: string;
  drawerCommand?: string;
  useRasterImage?: boolean;
  hasDrawer?: boolean;
  isEnabled: boolean;
  status: 'connected' | 'disconnected';
  ipAddress?: string;
  port?: number;
  isDefault?: boolean;
  receiptSettings?: PrinterReceiptSettings;
  kitchenProfiles?: Partial<Record<KitchenProfileType, KitchenPrintSettings>>;
  isProfileHub?: boolean;
}

// Telephony
export interface CallLogEntry {
  id: string;
  timestamp: number;
  phoneNumber: string;
  customerId?: string;
  orderId?: string;
}
// Signage
export type SignageContentType = 'image' | 'video' | 'menu_promo';
export interface SignageContentItem {
  id: string;
  name: string;
  type: SignageContentType;
  sourceUrl: string;
  duration: number;
  menuItemIds?: number[];
}
export interface SignagePlaylist {
  id: string;
  name: string;
  items: string[]; // array of SignageContentItem ids
}
export interface SignageDisplay {
  id: string;
  name: string;
  status: 'online' | 'offline';
}
export interface SignageScheduleEntry {
  id: string;
  displayId: string;
  playlistId: string;
  dayOfWeek: number;
  startTime: string; // "HH:mm"
  endTime: string; // "HH:mm"
}

// App Settings
export interface AppPlugin {
  id: string;
  name: string;
  description: string;
  version: string;
  isFree: boolean;
  sortOrder: number;
  status: 'enabled' | 'disabled' | 'trial' | 'expired';
  trialStartDate?: number | null;
  activationDate?: number;
  licenseDurationDays?: number;
}
export type PaymentProvider = 'none' | 'stripe' | 'adyen' | 'square';
export type AccountingSoftware = 'none' | 'quickbooks' | 'xero';
export type ReservationSystem = 'none' | 'opentable' | 'google';
export interface DualCurrencySettings {
    enabled: boolean;
    secondaryCurrency: string;
    exchangeRate: number;
    [key: string]: any;
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
export interface ThemeSettings {
    primary: string;
    background: string;
    surface: string;
    textBase: string;
    textMuted: string;
}
export interface LanguageSettings {
    staff: Language;
    customer: Language;
}
export interface DeliveryAppSettings {
    enabled: boolean;
    apiKey: string;
}
export interface IoTSensorIntegrations {
    [key: string]: { enabled: boolean; apiKey: string };
}
export interface CFDSettings {
    attractScreenPlaylistId: string | null;
    featuredItemIds: number[];
}
export interface NotificationSettings {
    duration: number;
    position: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
    theme: 'dark' | 'transparent';
}
export interface DineInSettings {
    enabled: boolean;
    defaultGuests: number;
    maxGuests: number;
    enableStaffSelection: boolean;
    surcharge: { enabled: boolean; name: string; type: 'percentage' | 'fixed'; value: number };
    minCharge: { enabled: boolean; amount: number };
}
export interface DeliveryZone {
    id: string;
    name: string;
    fee: number;
}
export interface DeliverySettings {
    enabled: boolean;
    surcharge: { enabled: boolean; surchargeId: string | null; };
    zones: DeliveryZone[];
}
export interface TakeAwaySettings {
    enabled: boolean;
    customName: string;
    requireCustomerName: boolean;
    useHoldReason: boolean;
    surcharge: { enabled: boolean; name: string; type: 'percentage' | 'fixed'; value: number };
}
export interface TabSettings {
    enabled: boolean;
    customName: string;
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
    printServerUrl?: string;
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
}
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
export interface LoyaltySettings {
    enabled: boolean;
    pointsPerDollar: number;
    redemptionRate: number; // e.g. 100 points = $1
}
export interface OrderSettings {
    gratuityOptions: number[];
    invoicePrefix: string;
    invoiceSuffix: string;
    nextInvoiceNumber: number;
    nextDailyOrderNumber: number;
    dailyOrderSequenceLastReset: string;
}
export type ReceiptTemplateId = 'standard' | 'compact' | 'zatca_bilingual';
export type InvoiceTemplateId = 'modern' | 'classic' | 'zatca_bilingual';

export interface ReceiptSettings extends PrinterReceiptSettings {
    template: ReceiptTemplateId;
}

export interface InvoiceSettings {
    template: InvoiceTemplateId;
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
    invoice: InvoiceSettings;
    theme: ThemeSettings;
    language: LanguageSettings;
    deliveryApps: { [key: string]: DeliveryAppSettings };
    iotSensors: IoTSensorIntegrations;
    ai: AISettings;
    cfd: CFDSettings;
    notificationSettings: NotificationSettings;
    dineIn: DineInSettings;
    delivery: DeliverySettings;
    takeAway: TakeAwaySettings;
    tab: TabSettings;
    devices: DeviceSettings;
    advancedPOS: AdvancedPOSSettings;
    preferences: POSPreferences;
    loyalty: LoyaltySettings;
}

export interface SimulationLogEntry {
  timestamp: number;
  message: string;
}

export interface SimulationReport {
  totalOrders: number;
  durationSeconds: number;
  ordersPerMinute: number;
  printerJobs: Record<string, number>;
}