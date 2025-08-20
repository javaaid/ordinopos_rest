

import React from 'react';
import { AppPlugin, ManagementSubView, NavItem, SettingsSubView, Category } from '../types';

// Import all icons used by plugins
import BuildingOfficeIcon from '../components/icons/BuildingOfficeIcon';
import PizzaIcon from '../components/icons/PizzaIcon';
import TvIcon from '../components/icons/TvIcon';
import PuzzlePieceIcon from '../components/icons/PuzzlePieceIcon';
import QrCodeIcon from '../components/icons/QrCodeIcon';
import PhoneIcon from '../components/icons/PhoneIcon';
import ClipboardDocumentListIcon from '../components/icons/ClipboardDocumentListIcon';
import CubeIcon from '../components/icons/CubeIcon';
import Squares2X2Icon from '../components/icons/Squares2X2Icon';
import ShoppingBagIcon from '../components/icons/ShoppingBagIcon';
import BeakerIcon from '../components/icons/BeakerIcon';
import TagIcon from '../components/icons/TagIcon';
import ReceiptPercentIcon from '../components/icons/ReceiptPercentIcon';
import ServerStackIcon from '../components/icons/ServerStackIcon';
import UsersIcon from '../components/icons/UsersIcon';
import TruckIcon from '../components/icons/TruckIcon';
import CreditCardIcon from '../components/icons/CreditCardIcon';
import WrenchScrewdriverIcon from '../components/icons/WrenchScrewdriverIcon';
import Cog6ToothIcon from '../components/icons/Cog6ToothIcon';
import UserCircleIcon from '../components/icons/UserCircleIcon';
import ShieldCheckIcon from '../components/icons/ShieldCheckIcon';
import ShoppingCartIcon from '../components/icons/ShoppingCartIcon';
import ChartBarIcon from '../components/icons/ChartBarIcon';
import CalendarClockIcon from '../components/icons/CalendarClockIcon';
import AccountingIcon from '../components/icons/AccountingIcon';
import LinkIcon from '../components/icons/LinkIcon';
import SwatchIcon from '../components/icons/SwatchIcon';
import DocumentDuplicateIcon from '../components/icons/DocumentDuplicateIcon';
import ClipboardDocumentCheckIcon from '../components/icons/ClipboardDocumentCheckIcon';
import ExclamationTriangleIcon from '../components/icons/ExclamationTriangleIcon';
import CpuChipIcon from '../components/icons/CpuChipIcon';
import PrinterIcon from '../components/icons/PrinterIcon';
import ArchiveBoxIcon from '../components/icons/ArchiveBoxIcon';
import StarIcon from '../components/icons/StarIcon';
import BurgerIcon from '../components/icons/BurgerIcon';

export interface PluginModule {
    manifest: Omit<AppPlugin, 'status' | 'trialStartDate' | 'activationDate' | 'licenseDurationDays'>;
    getManagementNavItem?: (t: (key: any) => string) => NavItem | null;
    getSettingsNavItem?: (t: (key: any) => string) => NavItem | null;
}

export const CORE_MODULE_DEFINITIONS: PluginModule[] = [
    // --- MANAGEMENT VIEW GROUPS ---
    {
        manifest: { id: 'group-menu', name: 'Menu', description: 'Menu group', isFree: true, version: '1.0.0', sortOrder: 10 },
        getManagementNavItem: (t) => ({ 
            id: 'menu', label: t('menu'), icon: CubeIcon,
            children: [
                { id: 'menu_categories', label: t('menu_categories'), icon: Squares2X2Icon },
                { id: 'menu_products', label: t('menu_products'), icon: ShoppingBagIcon },
                { id: 'menu_modifiers', label: t('menu_modifiers'), icon: BeakerIcon },
                { id: 'menu_promotions', label: t('menu_promotions'), icon: TagIcon },
                { id: 'menu_kitchen_notes', label: t('menu_kitchen_notes'), icon: ClipboardDocumentListIcon },
                { id: 'menu_void_reasons', label: t('menu_void_reasons'), icon: ClipboardDocumentListIcon },
                { id: 'menu_discounts', label: t('menu_discounts'), icon: ReceiptPercentIcon },
                { id: 'menu_surcharges', label: t('menu_surcharges'), icon: ReceiptPercentIcon },
                { id: 'menu_gratuity', label: t('menu_gratuity'), icon: ReceiptPercentIcon },
            ]
        }),
    },
    {
        manifest: { id: 'group-services', name: 'Services', description: 'Services settings group', isFree: true, version: '1.0.0', sortOrder: 15 },
        getManagementNavItem: (t) => ({
            id: 'services', label: t('services'), icon: Cog6ToothIcon,
            children: [
                { id: 'dine_in_settings', label: 'Dine-In', icon: UsersIcon },
                { id: 'delivery_settings', label: 'Delivery', icon: TruckIcon },
                { id: 'take_away_settings', label: 'Take Away', icon: ShoppingBagIcon },
                { id: 'tab_settings', label: 'Tabs', icon: CreditCardIcon },
            ]
        })
    },
    {
        manifest: { id: 'group-contacts', name: 'Contacts', description: 'Contacts group', isFree: true, version: '1.0.0', sortOrder: 20 },
        getManagementNavItem: (t) => ({
            id: 'contacts', label: t('contacts'), icon: UserCircleIcon,
            children: [
                { id: 'customers', label: t('customers'), icon: UserCircleIcon },
                { id: 'suppliers', label: t('suppliers'), icon: TruckIcon },
                { id: 'loyalty', label: t('loyalty_program'), icon: StarIcon },
            ]
        }),
    },
    {
        manifest: { id: 'group-users', name: 'Users & Roles', description: 'Users & Roles group', isFree: true, version: '1.0.0', sortOrder: 25 },
        getManagementNavItem: (t) => ({
            id: 'users_and_roles', label: t('users_and_roles'), icon: UsersIcon,
            children: [
                { id: 'users', label: t('users'), icon: UsersIcon },
                { id: 'roles', label: t('roles'), icon: ShieldCheckIcon },
            ]
        }),
    },
     {
        manifest: { id: 'group-reports', name: 'Reports', description: 'Reports group', isFree: true, version: '1.0.0', sortOrder: 40 },
        getManagementNavItem: (t) => ({
            id: 'reports_group', label: t('reports'), icon: ChartBarIcon,
            children: [
                { id: 'reports', label: t('view_reports'), icon: ChartBarIcon },
                { id: 'email_reporting', label: t('email_reporting'), icon: CalendarClockIcon },
                { id: 'accounting', label: t('accounting'), icon: AccountingIcon },
            ]
        }),
    },
    {
        manifest: { id: 'group-system-management', name: 'System Management', description: 'System Management group', isFree: true, version: '1.0.0', sortOrder: 50 },
        getManagementNavItem: (t) => ({
            id: 'system_management', label: 'System', icon: Cog6ToothIcon,
            children: [
                { id: 'locations', label: t('locations'), icon: BuildingOfficeIcon },
                { id: 'tax_rates', label: t('tax_rates'), icon: ReceiptPercentIcon },
                { id: 'payment_types', label: t('payment_types'), icon: CreditCardIcon },
                { id: 'plugins', label: t('plugins'), icon: PuzzlePieceIcon },
            ]
        }),
    },

    // --- SETTINGS VIEW GROUPS ---
    {
        manifest: { id: 'group-settings-general', name: 'Branding & Localization', description: 'Branding & Localization settings group', isFree: true, version: '1.0.0', sortOrder: 10 },
        getSettingsNavItem: (t) => ({ 
            id: 'branding_localization', label: t('branding_localization'), icon: SwatchIcon,
            children: [
                { id: 'customization', label: t('customization'), icon: SwatchIcon },
                { id: 'numbering', label: t('numbering'), icon: DocumentDuplicateIcon },
            ]
        }),
    },
    {
        manifest: { id: 'group-settings-pos', name: 'POS Configuration', description: 'POS Configuration settings group', isFree: true, version: '1.0.0', sortOrder: 20 },
        getSettingsNavItem: (t) => ({
            id: 'pos_configuration', label: t('pos_configuration'), icon: WrenchScrewdriverIcon,
            children: [
                { id: 'preferences_settings', label: t('preferences'), icon: Cog6ToothIcon },
                { id: 'advanced_pos_settings', label: t('advanced_pos'), icon: WrenchScrewdriverIcon },
            ]
        }),
    },
    {
        manifest: { id: 'group-settings-hardware', name: 'Hardware', description: 'Hardware settings group', isFree: true, version: '1.0.0', sortOrder: 30 },
        getSettingsNavItem: (t) => ({
            id: 'hardware', label: t('devices'), icon: ServerStackIcon,
            children: [
                { id: 'device_settings', label: t('devices'), icon: ServerStackIcon },
                { id: 'printers', label: t('printers'), icon: PrinterIcon },
            ]
        }),
    },
    {
        manifest: { id: 'group-settings-integrations', name: 'Integrations', description: 'Integrations settings group', isFree: true, version: '1.0.0', sortOrder: 40 },
        getSettingsNavItem: (t) => ({
            id: 'integrations_group', label: t('integrations'), icon: LinkIcon,
            children: [
                { id: 'integrations', label: t('integrations'), icon: LinkIcon },
                { id: 'ai', label: t('ai_settings'), icon: CpuChipIcon },
            ]
        }),
    },
    {
        manifest: { id: 'group-settings-system', name: 'System & Data', description: 'System & Data settings group', isFree: true, version: '1.0.0', sortOrder: 50 },
        getSettingsNavItem: (t) => ({
            id: 'system_and_data', label: t('system_and_data'), icon: ShieldCheckIcon,
            children: [
                { id: 'activity', label: t('activity_log'), icon: ClipboardDocumentCheckIcon },
                { id: 'advanced', label: t('backup_restore'), icon: ExclamationTriangleIcon },
            ]
        }),
    },
];

export const OPTIONAL_PLUGIN_DEFINITIONS: PluginModule[] = [
    // Free plugins
    {
        manifest: { id: 'payment-terminal', name: 'Advanced Card Payments', description: 'Integrate with physical card terminals (Stripe, Adyen, etc).', isFree: true, version: '1.0.0', sortOrder: 10 },
    },
    {
        manifest: { id: 'pizza-builder', name: 'Pizza Builder', description: 'Advanced interface for creating customizable pizzas with various toppings, crusts, and sizes.', isFree: true, version: '1.2.0', sortOrder: 105 },
        getManagementNavItem: (t) => ({ id: 'menu_pizza_builder', label: t('menu_pizza_builder'), icon: PizzaIcon, parentId: 'menu' }),
    },
    {
        manifest: { id: 'qr-ordering', name: 'QR Code Ordering', description: 'Allow customers to order and pay via QR codes at their table.', isFree: true, version: '1.0.0', sortOrder: 210 },
    },
    {
        manifest: { id: 'digital-signage', name: 'Digital Signage', description: 'Manage content on customer-facing screens and displays.', isFree: true, version: '1.1.0', sortOrder: 305 },
        getManagementNavItem: (t) => ({ id: 'signage', label: t('digital_signage'), icon: TvIcon, parentId: 'system_management' }),
    },
    {
        manifest: { id: 'e-invoice-ksa', name: 'E-invoicing (ZATCA)', description: 'Compliance with ZATCA regulations for e-invoicing in Saudi Arabia.', isFree: true, version: '1.0.0', sortOrder: 310 },
        getSettingsNavItem: (t) => ({ id: 'zatca', label: t('zatca_ksa'), icon: QrCodeIcon, parentId: 'integrations_group' }),
    },
    {
        manifest: { id: 'order_number_display', name: 'Order Number Display', description: 'A simple screen to show called order numbers for pickup.', isFree: true, version: '1.0.0', sortOrder: 400 },
    },
    // Paid plugins
    {
        manifest: { id: 'multi-store', name: 'Multi-Store Management', description: 'Manage multiple locations from a single interface.', isFree: false, version: '1.0.0', sortOrder: 100 },
    },
    {
        manifest: { id: 'burger-builder', name: 'Burger Builder', description: 'Advanced interface for creating customizable burgers with various buns, patties, and toppings.', isFree: false, version: '1.0.0', sortOrder: 106 },
        getManagementNavItem: (t) => ({ id: 'menu_burger_builder', label: t('menu_burger_builder'), icon: BurgerIcon, parentId: 'menu' }),
    },
    {
        manifest: { id: 'advanced-inventory', name: 'Advanced Inventory', description: 'Track stock levels, manage suppliers, create purchase orders, and calculate profit margins.', isFree: false, version: '1.0.0', sortOrder: 110 },
        getManagementNavItem: (t) => ({
            id: 'inventory',
            label: 'Inventory',
            icon: ArchiveBoxIcon,
            parentId: 'management', // Corrected parent
            children: [
                { id: 'purchasing', label: 'Purchase Orders', icon: ShoppingCartIcon },
                { id: 'ingredients', label: 'Ingredients', icon: CubeIcon },
            ]
        }),
    },
    {
        manifest: { id: 'reservations', name: 'Reservations', description: 'Manage table reservations and bookings.', isFree: false, version: '1.0.0', sortOrder: 200 },
    },
    {
        manifest: { id: 'waitlist', name: 'Waitlist', description: 'Manage a digital waitlist for walk-in customers.', isFree: false, version: '1.0.0', sortOrder: 205 },
    },
    {
        manifest: { id: 'caller-id', name: 'Caller ID', description: 'Identify customers and view their history upon receiving a call.', isFree: false, version: '1.3.0', sortOrder: 505 },
        getManagementNavItem: (t) => ({
            id: 'call_log', 
            label: t('call_log'), 
            icon: PhoneIcon, 
            parentId: 'contacts'
        }),
    },
];