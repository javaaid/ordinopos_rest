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
  'qr_ordering_settings' |
  // New Menu sub-views
  'menu_categories' | 'menu_products' | 'menu_modifiers' | 'menu_promotions' | 
  'menu_kitchen_notes' | 'menu_void_reasons' | 'menu_discounts' | 
  'menu_surcharges' | 'menu_gratuity' | 'menu_pizza_builder' | 'menu_burger_builder' |
  // New Telephony sub-view
  'call_log' |
  // New Loyalty sub-view
  'loyalty' |
  // Moved from Settings
  'advanced';
export type SettingsSubView = 'integrations' | 'customization' | 'activity' | 'zatca' | 'ai' | 'numbering' | 'device_settings' | 'printers' | 'advanced_pos_settings' | 'preferences_settings' | 'fonts';
export type SignageSubView = 'displays' | 'content' | 'playlists' | 'scheduler' | 'cfd_attract';

// FIX: Added missing ReportGroup and ReportTab types for the ReportsView.
export type ReportGroup = 'sales' | 'people' | 'operations' | 'bi';
export type ReportTab = 
  'summary' | 'sales' | 'menu' | 'categories' | 'financials' | 
  'discounts' | 'delivery' | 'staff_performance' | 'labor' | 
  'customer' | 'retention' | 'inventory' | 'kiosk' | 'cfd' | 'bi_dashboard';

export type TranslationKey = 
  // General
  'add' | 'all' | 'total' | 'cancel' | 'tax' | 'subtotal' | 'discount' | 'change' | 'save' |
  
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
  'floorplan' | 'reservations' | 'waitingList' |

  // Print Queue
  'print_queue' |

  // Order Number Display
  'now_serving' | 'close_window' | 'back_to_main_screen' |
  
  // Management Sidebar
  'menu' | 'menu_categories' | 'menu_products' | 'menu_modifiers' | 'menu_promotions' | 
  'menu_kitchen_notes' | 'menu_void_reasons' | 'menu_discounts' | 
  'menu_surcharges' | 'menu_gratuity' | 'services' | 'preferences' | 
  // FIX: Added 'menu_pizza_builder' to TranslationKey to match its usage in the management sidebar navigation.
  'menu_pizza_builder' |
  // FIX: Added 'menu_burger_builder' to TranslationKey to support translations for this feature.
'menu_burger_builder' |
  'contacts' | 'customers' | 'suppliers' | 'users_and_roles' | 'users' | 'roles' | 
  'purchasing' | 'reports' | 'view_reports' | 'email_reporting' | 'accounting' | 
  'locations' | 'tax_rates' | 'payment_types' | 'telephony' | 'call_log' | 'plugins' | 
  'digital_signage' | 'usersRoles' |
  
  // Settings Sidebar - Standardized Keys
  // Groups
  'brandingLocalization' | 'posConfiguration' | 'hardwareDevices' | 'integrationsGroup' | 'systemAndData' |
  // Items
  'appearance' | 'fonts' | 'numbering' | 'generalSettings' | 'advancedPOS' | 'deviceSettings' | 'printers' |
  'integrations' | 'aiSettings' | 'zatcaKsa' | 'activityLog' | 'backupRestore' | 'languageRegion' | 'receipts' | 'taxes' |
  'discounts' | 'paymentMethods' | 'userPermissions' | 'notifications' | 'timeClock' |
  
  // Order History
  'order_hash' | 'date_time' | 'balance_due' | 'status' | 'actions' |
  
  // Loyalty Program
  'loyalty_program' | 'loyalty_points' | 'redeem_points' | 'apply_points' | 
  'points_to_redeem' | 'points_balance' | 'loyalty_discount' |

  // New Dashboard Keys
  'upsell' | 'offers' | 'customize' | 'todaysRevenue' | 'todaysOrders' |
  'avgOrderValue' | 'todaysSales' | 'revenueByHour' | 'quickActions' |
  'topSellingProducts' | 'lowStockAlerts' | 'allStockHealthy' | 'recentTransactions' |
  // Customize Dashboard Modal Keys
  'customizeDashboard' | 'reorderWidgets' | 'keyStatCards' | 'salesTrendChart' |
  'topSellingItems' | 'saveLayout' | 'paymentBreakdown' | 'locationPerformance' |

  // Table Services & Floor Plan
  'editFloor' | 'finishEditing' | 'addFloor' | 'rename' | 'delete' | 'addTable' |
  'available' | 'occupied' | 'reserved' | 'seats' |
  'editTable' | 'addNewTable' | 'tableName' | 'capacity' | 'shape' | 'floor' | 'addNewFloor' | 'enterNewFloorName' |
  
  // Reservations
  'time' | 'partySize' | 'notes' | 'syncNow' | 'lastSynced' | 'notSynced' | 'seatParty' | 'edit' | 'noShow' | 'date' |
  'noReservationsForDate' | 'newReservation' | 'editReservation' | 'searchByName' | 'selectAvailableTable' |
  'saveReservation' | 'addNewCustomer' |

  // Waitlist
  'quotedWait' | 'waitlistEmpty' | 'notify' | 'remove' | 'addToWaitlist' | 'customerName' |
  'phoneNumber' | 'quotedWaitTimeMinutes' | 'aiSuggest' | 'addParty' |

  // New reservation/waitlist keys
  'completeReservation' | 'cancelReservation' | 'confirmReservation' | 'moveUp' | 'moveDown' |

  // New keys from user
  'deleteTable' | 'tableNo' | 'reservation' | 'addReservation' | 'addToWaitingList' |
  
  // Delivery View
  'deliveryManagement' | 'syncDeliveryOrders' | 'outForDelivery' | 'noOrdersOutForDelivery' |
  'readyForDelivery' | 'noOrdersWaitingDriver' | 'preparing' | 'noOrdersBeingPrepared' |
  'incoming' | 'noNewDeliveryOrders' | 'clickSync' | 'acceptAndSendToKitchen' |
  'preparingInKitchen' | 'assignDriverPlaceholder' | 'assign' | 'markAsDelivered' | 'assignedTo' |

  // Time Clock View
  'timeClockScheduling' | 'timeClockDescription' | 'weeklySchedule' | 'weeklyScheduleComingSoon' |
  'myTimeClock' | 'clockIn' | 'clockOut' | 'clockedInSince' | 'timesheetFor' | 'noShiftsRecorded' |

  // ** START: Management Views Translation Keys **
  'categories' | 'products' | 'modifiers' | 'promotions' | 'kitchenNotes' | 'voidReasons' |
  'categoryName' | 'itemCount' | 'addNewCategory' | 'searchCategories' | 'addItem' | 'bulkEdit' |
  'importCSV' | 'searchModifierGroups' | 'addNewModifierGroup' | 'groupName' | 'options' | 'rules' |
  'appliedTo' | 'managePromotions' | 'addPromotion' | 'schedule' | 'name' | 'predefinedKitchenNotes' |
  'addNote' | 'note' | 'predefinedVoidReasons' | 'addReason' | 'reason' | 'manualDiscounts' |
  'addDiscount' | 'discountName' | 'percentage' | 'surcharges' | 'addSurcharge' | 'surchargeName' | 'value' |
  'gratuitySettings' | 'gratuitySettingsDescription' | 'option1' | 'option2' | 'option3' | 'option4' | 'saveGratuitySettings' | 'pizzaBuilderSettings' |
  'pizzaBuilderSettingsDescription' | 'sizes' | 'crusts' | 'sauces' | 'cheeses' | 'toppings' | 'savePizzaSettings' |
  'burgerBuilderSettings' | 'burgerBuilderSettingsDescription' | 'buns' | 'patties' | 'extras' | 'saveBurgerSettings' |
  'dineInSettings' | 'dineInSettingsDescription' | 'general' | 'guestManagement' | 'minimumCharge' | 'surcharge' |
  'enableDineIn' | 'defaultGuests' | 'maxGuests' | 'chooseStaffStart' | 'enableMinimumCharge' |
  'minimumAmount' | 'enableDineInSurcharge' | 'surchargeType' | 'saveDineInSettings' | 'deliverySettings' |
  'deliverySettingsDescription' | 'deliveryZonesAndFees' | 'zoneName' | 'fee' | 'addDeliveryZone' |
  'enableDeliverySurcharge' | 'selectSurcharge' | 'saveDeliverySettings' | 'takeAwaySettings' |
  'takeAwaySettingsDescription' | 'customName' | 'requireCustomerName' | 'useHoldReasons' | 'saveTakeAwaySettings' |
  'tabSettings' | 'tabSettingsDescription' | 'enableTabs' | 'saveTabSettings' | 'addCustomer' | 'sendPromo' |
  'phone' | 'membershipId' | 'email' | 'totalSpent' | 'loyaltyPoints' | 'subscribe' | 'manageSuppliers' |
  'addSupplier' | 'address' | 'manageUsers' | 'addUser' | 'role' | 'location' | 'manageRolesPermissions' |
  'addNewRole' | 'roleName' | 'export' | 'dateRange' | 'salesFinancials' | 'peopleCustomers' | 'operations' |
  'biAnalytics' | 'executiveSummary' | 'salesDashboard' | 'menuPerformanceAnalysis' | 'categoryPerformanceAnalysis' |
  'financialsReportZ' | 'discountPromotionReport' | 'deliveryOnlineOrderReport' | 'staffPerformanceReport' |
  'laborAttendanceReport' | 'customerSpendingHabits' | 'customerRetentionReport' | 'inventoryReport' |
  'kioskPerformanceReport' | 'cfdPerformanceReport' | 'businessIntelligence' | 'csv' | 'excel' | 'pdf' | 'print' |
  'manageIngredients' | 'addIngredient' | 'stock' | 'unitCost' | 'onHandValue' | 'reorderAt' | 'createPO' |
  'poNumber' | 'supplier' | 'totalCost' | 'saveLoyaltySettings' | 'loyaltyProgramDescription' |
  'enableLoyaltyProgram' | 'pointsPerDollar' | 'redemptionRate' | 'bulkEditSelected' |
  'active' | 'inactive' | 'manageCategories' | 'bulkEditN' | 'import' |
  // New Service Settings Keys
  'serviceCharge' | 'type' |
  'enableDelivery' | 'enableTakeAway' | 'customNameUsage' |
  'orderRules' | 'enableTakeAwaySurcharge' | 'tabCustomNameUsage' |
  'loyaltyProgram' | 'loyaltyDescription' | 'enableLoyaltyProgram' | 'pointsEarnedPerDollar' |
  'pointsEarnedDescription' | 'redemptionDescription' |
  'callLogDescription' | 'searchByPhoneOrName' | 'dateTime' | 'customer' |
  'today' | 'yesterday' | 'last7Days' | 'thisMonth' | 'noDataSummary' |
  'noAccountingConnected' | 'connectAccounting' | 'manageLocations' | 'addLocation' |
  'manageTaxRates' | 'selectLocationTaxes' | 'addTaxRate' | 'managePaymentTypes' |
  'addPaymentType' | 'pluginsDescription' | 'displaysPreview' |
  'contentLibrary' | 'playlists' | 'scheduler' | 'cfdAttractScreen' | 'displays' |
  'mainEntranceTV' | 'online' | 'barScreen' | 'offline' | 'livePreview' | 'addContent' |
  'addPlaylist' | 'addSchedule' | 'cfdAttractSettings' | 'cfdAttractDescription' |
  'activePlaylist' | 'noAttractScreen' |
  // Digital Signage Modals
  'addNewDisplay' | 'displayName' | 'displayExample' | 'saveDisplay' |
  'addNewPlaylist' | 'playlistName' | 'availableContent' | 'inPlaylist' | 'burgerPromo' | 'drinkSpecials' | 'savePlaylist' |
  'addNewSchedule' | 'display' | 'playlist' | 'lunchSpecials' | 'dayOfWeek' |
  'sunday' | 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' |
  'startTime' | 'endTime' | 'saveSchedule' |
  'addNewContent' | 'contentName' | 'image' | 'video' | 'menu_promo' | 'durationSeconds' | 'imageUrl' | 'saveContent' |
  // Add Payment Type Modal
  'paymentMethodName' | 'enabled' |
  // Add Tax Rate Modal
  'addNewTaxRate' | 'taxName' | 'ratePercent' | 'applyToLocations' | 'allLocations' | 'saveTaxRate' |
  // Add Location Modal
  'addNewLocation' | 'locationName' | 'countryOfOperation' | 'unitedStates' | 'currencySymbol' |
  'taxRates' | 'standard' | 'addNewTaxRateSmall' | 'receiptFooterText' | 'thankYouBusiness' |
  // Category & Product Modals
  'saveCategory' | 'addNewProduct' | 'editProduct' | 'pricing' | 'inventory' | 'recipe' | 'advanced' | 'productName' | 'new' |
  'course' | 'kitchenName' | 'addBarcode' | 'generateEAN13' | 'displayOrder' | 'displayOrderExample' | 'isVeg' | 'displayImageOnPOS' |
  'saveProduct' | 'dineInPrice' | 'takeOutPrice' | 'deliveryPrice' | 'cost' | 'memberPricing' | 'memberPrice1' | 'memberPrice2' |
  'memberPrice3' | 'askPriceOnSale' | 'discountable' | 'hideNameOnBill' | 'askForQuantity' | 'useWeighingScale' |
  'alwaysShowModifiers' | 'promptForKitchenNote' | 'addOns' | 'customizations' | 'kitchenPrinter' | 'kitchenDisplay' |
  'inventoryManagedByRecipe' | 'inventoryManagedByRecipeDesc' | 'directStockManagementInfo' | 'warnQty' |
  'addIngredientToRecipe' | 'selectAnIngredient' | 'noIngredientsInRecipe' | 'appetizers' | 'cheese' |
  // FIX: Add missing translation keys for product editing.
  'barcodes' | 'stopSaleAtZeroStock' | 'kitchenNote' |
  // ** END: Management Views Translation Keys **

  // ** START: Settings Views Translation Keys **
  'saveChanges' | 'saveSettings' |
  // PrintersView
  'managePrinters' | 'discoverPrinters' | 'addPrinter' | 'printers_col_name' | 'printers_col_type' | 'printers_col_connection' | 'printers_col_ip' | 'printers_col_status' | 'printers_col_actions' |
  // DeviceSettingsView
  'devices_title' | 'devices_description' | 'devices_printers_group' | 'devices_defaultReceiptPrinter_label' | 'devices_defaultKitchenPrinter_label' | 'devices_kioskReceiptPrinter_label' | 'devices_defaultBarPrinter_label' | 'devices_defaultReportPrinter_label' | 'devices_displaysHardware_group' | 'devices_cfd_label' | 'devices_kds_label' | 'devices_scale_label' | 'devices_printServer_group' | 'devices_printServerUrl_label' | 'devices_printServerUrl_desc' |
  // AdvancedPOSSettingsView
  'advpos_title' | 'advpos_description' | 'advpos_ordering_group' | 'advpos_paymentReceipt_group' | 'advpos_inventoryNotifications_group' | 'advpos_staffEndOfDay_group' | 'advpos_enableItemNumber_label' | 'advpos_enableItemNumber_desc' | 'advpos_separateSameItems_label' | 'advpos_separateSameItems_desc' | 'advpos_combineKitchenItems_label' | 'advpos_combineKitchenItems_desc' | 'advpos_kitchenPrintFooter_label' | 'advpos_kitchenPrintFooter_desc' | 'advpos_printReservedOrder_label' | 'advpos_printReservedOrder_desc' | 'advpos_sortItemsInKitchen_label' | 'advpos_sortItemsInKitchen_desc' | 'advpos_sortModifiers_label' | 'advpos_sortModifiers_desc' | 'advpos_sortOrderInKDS_label' | 'advpos_sortOrderInKDS_desc' | 'advpos_printVoidedItems_label' | 'advpos_printVoidedItems_desc' | 'advpos_printAfterSending_label' | 'advpos_printAfterSending_desc' | 'advpos_quickPay_label' | 'advpos_quickPay_desc' | 'advpos_useVoidReason_label' | 'advpos_useVoidReason_desc' | 'advpos_defaultPrepTime_label' | 'advpos_defaultPrepTime_desc' | 'advpos_confirmPayment_label' | 'advpos_confirmPayment_desc' | 'advpos_printReceiptAfterPayment_label' | 'advpos_printReceiptAfterPayment_desc' | 'advpos_combineReceiptItems_label' | 'advpos_combineReceiptItems_desc' | 'advpos_sortItemsOnReceipt_label' | 'advpos_sortItemsOnReceipt_desc' | 'advpos_showItemDiscount_label' | 'advpos_showItemDiscount_desc' | 'advpos_showVoidedItems_label' | 'advpos_showVoidedItems_desc' | 'advpos_emailReceipt_label' | 'advpos_emailReceipt_desc' | 'advpos_showTaxOnReceipt_label' | 'advpos_showTaxOnReceipt_desc' | 'advpos_enableInventory_label' | 'advpos_enableInventory_desc' | 'advpos_allowNegativeStock_label' | 'advpos_allowNegativeStock_desc' | 'advpos_useInventoryPrint_label' | 'advpos_useInventoryPrint_desc' | 'advpos_sendLowStockEmails_label' | 'advpos_sendLowStockEmails_desc' | 'advpos_lowStockRecipients_label' | 'advpos_eodReport_label' | 'advpos_eodReport_desc' | 'advpos_staffSalary_label' | 'advpos_staffSalary_desc' | 'advpos_printCashInOut_label' | 'advpos_printCashInOut_desc' | 'advpos_printWorkTime_label' | 'advpos_printWorkTime_desc' | 'advpos_enableTimeClock_label' | 'advpos_enableTimeClock_desc' | 'advpos_autoClockOut_label' | 'advpos_autoClockOut_desc' | 'advpos_forcePinEntry_label' | 'advpos_forcePinEntry_desc' |
  // PreferencesSettingsView
  'prefs_title' | 'prefs_description' | 'prefs_actionAfterSend_label' | 'prefs_actionAfterSend_desc' | 'prefs_actionAfterPayment_label' | 'prefs_actionAfterPayment_desc' | 'prefs_defaultPayment_label' | 'prefs_defaultOrderType_label' | 'prefs_enableOrderNotes_label' | 'prefs_enableKitchenPrint_label' | 'prefs_enableOrderHold_label' | 'prefs_resetOrderNumberDaily_label' | 'prefs_action_option_order' | 'prefs_action_option_tables' | 'prefs_action_option_login' |
  // ZatcaSettingsView
  'zatca_title' | 'zatca_description' | 'zatca_enable_label' | 'zatca_qrSize_label' | 'zatca_qrPosition_label' | 'zatca_qrPosition_top' | 'zatca_qrPosition_bottom' | 'zatca_save_button' |
  // FontSettingsView
  'fonts_title' | 'fonts_description' | 'fonts_base_label' | 'fonts_menuItemName_label' | 'fonts_menuItemPrice_label' | 'fonts_orderSummaryItem_label' | 'fonts_orderSummaryTotal_label' | 'fonts_categoryTabs_label' |
  // NumberingSettingsView
  'numbering_title' | 'numbering_description' | 'numbering_invoice_group' | 'numbering_invoicePrefix_label' | 'numbering_nextInvoiceNum_label' | 'numbering_invoiceSuffix_label' | 'numbering_invoiceExample_label' | 'numbering_dailyOrder_group' | 'numbering_dailyOrder_desc' | 'numbering_nextOrderNum_label' |
  // CustomizationSettingsView
  'customize_title' | 'customize_description' | 'customize_receiptTemplate_group' | 'customize_receiptTemplate_desc' | 'customize_template_standard_title' | 'customize_template_standard_desc' | 'customize_template_compact_title' | 'customize_template_compact_desc' | 'customize_template_bilingual_title' | 'customize_template_bilingual_desc' | 'customize_invoiceTemplate_group' | 'customize_invoiceTemplate_modern_title' | 'customize_invoiceTemplate_modern_desc' | 'customize_invoiceTemplate_classic_title' | 'customize_invoiceTemplate_classic_desc' | 'customize_receiptBranding_group' | 'customize_logoUrl_label' | 'customize_promoMessage_label' | 'customize_uiTheme_group' | 'customize_uiTheme_desc' | 'customize_theme_preset_dark' | 'customize_theme_preset_ocean' | 'customize_language_group' | 'customize_staffLang_label' | 'customize_customerLang_label' | 'customize_notifications_group' | 'customize_notifDuration_label' | 'customize_notifPosition_label' | 'customize_notifPosition_tr' | 'customize_notifPosition_tl' | 'customize_notifPosition_br' | 'customize_notifPosition_bl' | 'customize_notifTheme_label' | 'customize_notifTheme_dark' | 'customize_notifTheme_transparent' |
  // IntegrationsSettingsView
  'integrations_title' | 'integrations_description' | 'integrations_delivery_group' | 'integrations_uberEats_name' | 'integrations_uberEats_desc' | 'integrations_doordash_name' | 'integrations_doordash_desc' | 'integrations_iot_group' | 'integrations_smartFridges_name' | 'integrations_smartFridges_desc' | 'integrations_storageSensors_name' | 'integrations_storageSensors_desc' | 'integrations_dualCurrency_group' | 'integrations_dualCurrency_enable_label' | 'integrations_dualCurrency_enable_desc' | 'integrations_dualCurrency_symbol_label' | 'integrations_dualCurrency_rate_label' | 'integrations_connected_badge' | 'integrations_connect_button' | 'integrations_hide_button' | 'integrations_apiKey_label' | 'integrations_apiKeyEndpoint_label' | 'pro' | 'saveIntegrationSettings' |
  // AISettings
  'ai_title' | 'ai_description' | 'ai_apiStatus_group' | 'ai_apiKey_label' | 'ai_apiKey_help' | 'ai_apiKeyStatus_configured' | 'ai_apiKeyStatus_notConfigured' | 'ai_featureControls_group' | 'ai_enableAll_label' | 'ai_enableUpsell_label' | 'ai_enableCFDSuggestions_label' | 'ai_enableReportAnalysis_label' | 'ai_save_button' |
  // UserActivityReport
  'activity_title' | 'activity_description' | 'activity_summary' | 'activity_newUsers' | 'activity_editedUsers' | 'activity_editedRoles' | 'activity_failedLogins' | 'activity_recentActivity' | 'activity_by' | 'activity_notTracked' | 'loggedInByAdmin' |
  // AdvancedSettings
  'advanced' | 'advanced_title' | 'advanced_description' | 'advanced_partialRefunds_title' | 'advanced_partialRefunds_desc' | 'advanced_archiving_title' | 'advanced_archiving_desc' | 'advanced_disasterRecovery_title' | 'advanced_disasterRecovery_desc' | 'advanced_fullRefund_note' |
  'backup_title' | 'backup_desc' | 'backup_backup_button' | 'backup_restore_button' | 'backup_backingUp' | 'backup_restoring' |
  // PrinterEditModal
  'addNewPrinter' | 'printerName' | 'newPrinter' | 'printerRole' | 'standardReceiptPrinter' | 'printsReceipts' | 'kitchenStationPrinter' | 'kitchenStationPrinterDesc' | 'kitchenProfileHub' | 'kitchenProfileHubDesc' | 'createAndConfigure'
  // ** END: Settings Views Translation Keys **
  ;
  
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
  appliedManualDiscount?: ManualDiscount | null;
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
  membershipId?: string;
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
  type: 'success' | 'error' | 'info';
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
  estimatedPrepTimeMinutes?: number;
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
  name: TranslationKey | string;
  type: SignageContentType;
  sourceUrl: string;
  duration: number;
  menuItemIds?: number[];
}
export interface SignagePlaylist {
  id: string;
  name: TranslationKey | string;
  items: string[]; // array of SignageContentItem ids
}
export interface SignageDisplay {
  id: string;
  name: TranslationKey | string;
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

export interface FontSettings {
    baseSize: number;
    menuItemName: number;
    menuItemPrice: number;
    orderSummaryItem: number;
    orderSummaryTotal: number;
    categoryTabs: number;
}

// FIX: Add missing ThemeSettings interface to support theme customization.
export interface ThemeSettings {
    primary: string;
    background: string;
    surface: string;
    textBase: string;
    textMuted: string;
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
export interface QROrderingSettings {
    enabled: boolean;
    baseUrl: string;
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
    defaultPrepTimeMinutes: number;
    sendLowStockEmails: boolean;
    lowStockEmailRecipients: string;
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
    qrOrdering: QROrderingSettings;
    devices: DeviceSettings;
    advancedPOS: AdvancedPOSSettings;
    preferences: POSPreferences;
    loyalty: LoyaltySettings;
    fontSettings: FontSettings;
    // FIX: Add missing theme property to AppSettings interface.
    theme: ThemeSettings;
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