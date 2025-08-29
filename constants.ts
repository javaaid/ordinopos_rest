import { Category, MenuItem, Customer, Driver, Employee, Location, Supplier, WastageEntry, Role, PermissionSet, AuditLogEntry, Printer, Table, Subscription, PurchaseOrder, AppPlugin, ScheduleEntry, Reservation, WaitlistEntry, Ingredient, RecipeItem, SignageDisplay, SignageContentItem, SignagePlaylist, SignageScheduleEntry, PaymentType, PizzaSize, PizzaCrust, PizzaSauce, PizzaCheese, PizzaToppingItem, Promotion, ModifierGroup, KitchenDisplay, KitchenNote, VoidReason, ManualDiscount, Surcharge, GenericDevice, PrinterReceiptSettings, KitchenPrintSettings, CustomerDisplay, CallLogEntry, KitchenProfileType, BurgerBuilderSettings, BurgerBun, BurgerPatty, BurgerCheese, BurgerToppingItem, BurgerSauce, BurgerExtras } from './types';
import { OPTIONAL_PLUGIN_DEFINITIONS } from './plugins/definitions';

// New Pizza Builder Settings
export const PIZZA_SIZES: PizzaSize[] = [
    { id: 'size_sm', name: 'Small (10")', price: 0 },
    { id: 'size_md', name: 'Medium (12")', price: 2 },
    { id: 'size_lg', name: 'Large (14")', price: 4 },
];
export const PIZZA_CRUSTS: PizzaCrust[] = [
    { id: 'crust_th', name: 'Thin Crust', price: 0 },
    { id: 'crust_reg', name: 'Regular', price: 0 },
    { id: 'crust_stuffed', name: 'Stuffed Crust', price: 2.5 },
];
export const PIZZA_SAUCES: PizzaSauce[] = [
    { id: 'sauce_tomato', name: 'Classic Tomato', price: 0 },
    { id: 'sauce_bbq', name: 'Smokey BBQ', price: 1.0 },
    { id: 'sauce_pesto', name: 'Pesto', price: 1.5 },
];
export const PIZZA_CHEESES: PizzaCheese[] = [
    { id: 'cheese_mozz', name: 'Mozzarella', price: 0 },
    { id: 'cheese_blend', name: 'Provolone Blend', price: 1.0 },
    { id: 'cheese_vegan', name: 'Vegan Mozzarella', price: 2.0 },
];
export const PIZZA_TOPPINGS: PizzaToppingItem[] = [
    { id: 'top_pep', name: 'Pepperoni', price: 1.5 },
    { id: 'top_mush', name: 'Mushrooms', price: 1.0 },
    { id: 'top_onion', name: 'Onions', price: 1.0 },
    { id: 'top_bacon', name: 'Bacon', price: 2.0 },
    { id: 'top_olives', name: 'Olives', price: 1.0 },
    { id: 'top_peppers', name: 'Bell Peppers', price: 1.0 },
];

export const PIZZA_OPTIONS = {
    sizes: PIZZA_SIZES,
    crusts: PIZZA_CRUSTS,
    sauces: PIZZA_SAUCES,
    cheeses: PIZZA_CHEESES,
    toppings: PIZZA_TOPPINGS,
};

export const PIZZA_OPTIONS_SUBURBIA = {
    sizes: [
        { id: 'size_sm', name: 'Small (10")', price: 0 },
        { id: 'size_md', name: 'Medium (12")', price: 2 },
        { id: 'size_lg', name: 'Large (14")', price: 4 },
        { id: 'size_xl', name: 'X-Large (16")', price: 6 }, // Extra size for Suburbia
    ],
    crusts: [
        { id: 'crust_th', name: 'Thin Crust', price: 0 },
        { id: 'crust_reg', name: 'Regular', price: 0 },
    ],
    sauces: PIZZA_SAUCES,
    cheeses: PIZZA_CHEESES,
    toppings: [
        { id: 'top_pep', name: 'Pepperoni', price: 1.5 },
        { id: 'top_mush', name: 'Mushrooms', price: 1.0 },
        { id: 'top_ham', name: 'Ham', price: 1.75 },
        { id: 'top_pine', name: 'Pineapple', price: 1.25 },
        { id: 'top_olives', name: 'Olives', price: 1.0 },
    ],
};

export const BURGER_BUNS: BurgerBun[] = [
    { id: 'bun_brioche', name: 'Brioche Bun', price: 0 },
    { id: 'bun_sesame', name: 'Sesame Seed Bun', price: 0 },
    { id: 'bun_pretzel', name: 'Pretzel Bun', price: 1.0 },
];
export const BURGER_PATTIES: BurgerPatty[] = [
    { id: 'patty_beef', name: 'Beef Patty', price: 0, weight: '1/3 lb' },
    { id: 'patty_chicken', name: 'Grilled Chicken', price: 0 },
    { id: 'patty_veggie', name: 'Veggie Patty', price: 0 },
];
export const BURGER_CHEESES: BurgerCheese[] = [
    { id: 'bcheese_american', name: 'American Cheese', price: 1.0 },
    { id: 'bcheese_cheddar', name: 'Cheddar', price: 1.0 },
    { id: 'bcheese_swiss', name: 'Swiss', price: 1.0 },
];
export const BURGER_TOPPINGS: BurgerToppingItem[] = [
    { id: 'btop_lettuce', name: 'Lettuce', price: 0 },
    { id: 'btop_tomato', name: 'Tomato', price: 0 },
    { id: 'btop_onion', name: 'Onion', price: 0 },
    { id: 'btop_bacon', name: 'Bacon', price: 2.0 },
    { id: 'btop_avocado', name: 'Avocado', price: 2.5 },
];
export const BURGER_SAUCES: BurgerSauce[] = [
    { id: 'bsauce_ketchup', name: 'Ketchup', price: 0 },
    { id: 'bsauce_mayo', name: 'Mayonnaise', price: 0 },
    { id: 'bsauce_bbq', name: 'BBQ Sauce', price: 0.5 },
];
export const BURGER_EXTRAS: BurgerExtras[] = [
    { id: 'bextra_fries', name: 'Side of Fries', price: 3.0 },
    { id: 'bextra_rings', name: 'Onion Rings', price: 4.0 },
];

export const BURGER_OPTIONS: BurgerBuilderSettings = {
    buns: BURGER_BUNS,
    patties: BURGER_PATTIES,
    cheeses: BURGER_CHEESES,
    toppings: BURGER_TOPPINGS,
    sauces: BURGER_SAUCES,
    extras: BURGER_EXTRAS,
};

export const PAYMENT_TYPES: PaymentType[] = [
    { id: 'cash', name: 'Cash', isEnabled: true },
    { id: 'card', name: 'Card', isEnabled: true },
    { id: 'online', name: 'Online', isEnabled: true },
];

export const KITCHEN_PROFILE_NAMES: Record<KitchenProfileType, string> = {
    kitchen_1: 'Kitchen Printer 1',
    kitchen_2: 'Kitchen Printer 2',
    kitchen_3: 'Kitchen Printer 3',
    kitchen_4: 'Kitchen Printer 4',
    kitchen_5: 'Kitchen Printer 5',
    kitchen_6: 'Kitchen Printer 6',
    bar: 'Bar Printer',
    order: 'Order (Dine In/Tab)',
    takeaway: 'Pickup (Takeaway)',
    report: 'Report',
};

export const KITCHEN_DISPLAYS: KitchenDisplay[] = [
    { id: 'kds_1', name: 'Kitchen Display 1', status: 'connected', connectionType: 'network', ipAddress: '192.168.1.201', isEnabled: true, isDefault: true },
    { id: 'kds_2', name: 'Kitchen Display 2', status: 'disconnected', connectionType: 'network', ipAddress: '192.168.1.202', isEnabled: true, isDefault: true },
    { id: 'kds_3', name: 'Kitchen Display 3', status: 'connected', connectionType: 'network', ipAddress: '192.168.1.203', isEnabled: true, isDefault: true },
    { id: 'kds_4', name: 'Kitchen Display 4', status: 'connected', connectionType: 'network', ipAddress: '192.168.1.204', isEnabled: false, isDefault: true },
    { id: 'kds_5', name: 'Kitchen Display 5', status: 'connected', connectionType: 'network', ipAddress: '192.168.1.205', isEnabled: false, isDefault: true },
    { id: 'kds_6', name: 'Kitchen Display 6', status: 'connected', connectionType: 'network', ipAddress: '192.168.1.206', isEnabled: false, isDefault: true },
    { id: 'kds_local', name: 'Local Kitchen Screen', status: 'connected', connectionType: 'local', isEnabled: true, isDefault: false },
];

export const CUSTOMER_DISPLAYS: CustomerDisplay[] = [
    { id: 'cd1', name: 'Customer Display 1', type: 'display', status: 'connected', ipAddress: '192.168.1.210', isEnabled: true, isDefault: true },
];

export const SCALES: GenericDevice[] = [
    { id: 'sc1', name: 'Weighing Scale', type: 'scale', status: 'connected', isDefault: true },
];

export const LOCATIONS: Location[] = [
    { 
        id: 'loc_1', 
        name: 'ordino Pos Downtown',
        address: '123 Main Street, Anytown, USA 12345',
        phone: '(555) 123-4567',
        email: 'downtown@ordinopos.com',
        taxRates: { 'Exempt': 0, 'Standard': 0.10, 'High Rate': 0.15 },
        invoiceFooterText: 'Thank you for dining with us!',
        countryCode: 'US',
        currency: '$',
        pizzaBuilder: PIZZA_OPTIONS,
        burgerBuilder: BURGER_OPTIONS,
    },
    { 
        id: 'loc_2', 
        name: 'ordino Pos Suburbia',
        address: '456 Oak Avenue, Suburbia, USA 67890',
        phone: '(555) 987-6543',
        email: 'suburbia@ordinopos.com',
        taxRates: { 'Standard': 0.07 },
        invoiceFooterText: 'Come back soon!',
        countryCode: 'US',
        currency: '$',
        pizzaBuilder: PIZZA_OPTIONS_SUBURBIA,
        burgerBuilder: BURGER_OPTIONS,
    },
    { 
        id: 'loc_3', 
        name: 'ordino Pos Beachfront',
        address: '789 Ocean Drive, Beachtown, USA 11223',
        phone: '(555) 246-8135',
        email: 'beach@ordinopos.com',
        taxRates: { 'Standard': 0.09, 'Resort Fee': 0.05 },
        invoiceFooterText: 'Enjoy the waves!',
        countryCode: 'US',
        currency: '$',
        pizzaBuilder: PIZZA_OPTIONS,
        burgerBuilder: BURGER_OPTIONS,
    },
    { 
        id: 'loc_4', 
        name: 'ordino Pos Riyadh',
        address: 'King Fahd Road, Riyadh 12345, KSA',
        phone: '+966 11 123 4567',
        email: 'riyadh@ordinopos.com',
        taxRates: { 'Standard': 0.15 },
        invoiceFooterText: 'شكرا لزيارتكم (Thank you for your visit)',
        vatNumber: '300000000000003',
        countryCode: 'SA',
        currency: 'SAR',
        pizzaBuilder: PIZZA_OPTIONS,
        burgerBuilder: BURGER_OPTIONS,
    },
];

const PERMISSIONS_ADMIN: PermissionSet = {
    viewDashboard: true, viewPOS: true, viewFloorPlan: true, viewKDS: true, viewDelivery: true, viewPurchasing: true, viewCustomers: true, viewReports: true, viewSettings: true, viewHistory: true, viewTimeClock: true, viewReservations: true, viewWaitlist: true,
    canViewAllReports: true, canViewInventoryReport: true,
    canPerformManagerFunctions: true, canManageUsersAndRoles: true, canApproveRefunds: true,
    viewOrderNumberDisplay: true,
};

const PERMISSIONS_MANAGER: PermissionSet = {
    ...PERMISSIONS_ADMIN,
    canManageUsersAndRoles: false, // Managers might not manage other managers/admins
};

const PERMISSIONS_CHEF: PermissionSet = {
    viewDashboard: false, viewPOS: true, viewFloorPlan: false, viewKDS: true, viewDelivery: false, viewPurchasing: true, viewCustomers: false, viewReports: false, viewSettings: false, viewHistory: false, viewTimeClock: true, viewReservations: false, viewWaitlist: false,
    canViewAllReports: false, canViewInventoryReport: true, // Chef can see inventory
    canPerformManagerFunctions: true, canManageUsersAndRoles: false, canApproveRefunds: false,
    viewOrderNumberDisplay: false,
};

const PERMISSIONS_SERVER: PermissionSet = {
    viewDashboard: false, viewPOS: true, viewFloorPlan: true, viewKDS: false, viewDelivery: false, viewPurchasing: false, viewCustomers: true, viewReports: false, viewSettings: false, viewHistory: true, viewTimeClock: true, viewReservations: true, viewWaitlist: true,
    canViewAllReports: false, canViewInventoryReport: false,
    canPerformManagerFunctions: true, canManageUsersAndRoles: false, canApproveRefunds: false,
    viewOrderNumberDisplay: true,
};

const PERMISSIONS_CASHIER: PermissionSet = {
    viewDashboard: false, viewPOS: true, viewFloorPlan: false, viewKDS: false, viewDelivery: false, viewPurchasing: false, viewCustomers: true, viewReports: false, viewSettings: false, viewHistory: true, viewTimeClock: true, viewReservations: false, viewWaitlist: false,
    canViewAllReports: false, canViewInventoryReport: false,
    canPerformManagerFunctions: true, canManageUsersAndRoles: false, canApproveRefunds: false,
    viewOrderNumberDisplay: true,
};

export const ROLES: Role[] = [
    { id: 'role_admin', name: 'Admin', permissions: PERMISSIONS_ADMIN },
    { id: 'role_manager', name: 'Manager', permissions: PERMISSIONS_MANAGER },
    { id: 'role_chef', name: 'Chef', permissions: PERMISSIONS_CHEF },
    { id: 'role_server', name: 'Server', permissions: PERMISSIONS_SERVER },
    { id: 'role_cashier', name: 'Cashier', permissions: PERMISSIONS_CASHIER },
];


export const SUPPLIERS: Supplier[] = [
    { id: 'sup_1', name: 'Global Restaurant Supplies', phone: '555-SUPPLY', email: 'sales@global.com', address: '1 Supply Chain Blvd' },
    { id: 'sup_2', name: 'Fresh Produce Inc.', phone: '555-FRESH', email: 'orders@freshproduce.com', address: '45 Farm to Table Rd' },
    { id: 'sup_3', name: 'Beverage Distributors Co.', phone: '555-DRINK', email: 'contact@bevdist.com', address: '99 Liquid Ln' },
];

export const CATEGORIES: Category[] = [
  { id: 'appetizers', name: 'Appetizers', itemCount: 5 },
  { id: 'soups', name: 'Soups', itemCount: 3 },
  { id: 'burgers', name: 'Burgers', itemCount: 4 },
  { id: 'pizza', name: 'Pizza', itemCount: 2 },
  { id: 'main_course', name: 'Main Course', itemCount: 6 },
  { id: 'pasta', name: 'Pasta', itemCount: 3 },
  { id: 'desserts', name: 'Desserts', itemCount: 4 },
  { id: 'beverages', name: 'Beverages', itemCount: 6 },
];

export const COUNTRIES = [
    { code: 'AF', name: 'Afghanistan' }, { code: 'AL', name: 'Albania' }, { code: 'DZ', name: 'Algeria' }, { code: 'AS', name: 'American Samoa' },
    { code: 'AD', name: 'Andorra' }, { code: 'AO', name: 'Angola' }, { code: 'AI', name: 'Anguilla' }, { code: 'AQ', name: 'Antarctica' },
    { code: 'AG', name: 'Antigua and Barbuda' }, { code: 'AR', name: 'Argentina' }, { code: 'AM', name: 'Armenia' }, { code: 'AW', name: 'Aruba' },
    { code: 'AU', name: 'Australia' }, { code: 'AT', name: 'Austria' }, { code: 'AZ', name: 'Azerbaijan' }, { code: 'BS', name: 'Bahamas' },
    { code: 'BH', name: 'Bahrain' }, { code: 'BD', name: 'Bangladesh' }, { code: 'BB', name: 'Barbados' }, { code: 'BY', name: 'Belarus' },
    { code: 'BE', name: 'Belgium' }, { code: 'BZ', name: 'Belize' }, { code: 'BJ', name: 'Benin' }, { code: 'BM', name: 'Bermuda' },
    { code: 'BT', name: 'Bhutan' }, { code: 'BO', name: 'Bolivia' }, { code: 'BA', name: 'Bosnia and Herzegovina' }, { code: 'BW', name: 'Botswana' },
    { code: 'BR', name: 'Brazil' }, { code: 'IO', name: 'British Indian Ocean Territory' }, { code: 'VG', name: 'British Virgin Islands' },
    { code: 'BN', name: 'Brunei' }, { code: 'BG', name: 'Bulgaria' }, { code: 'BF', name: 'Burkina Faso' }, { code: 'BI', name: 'Burundi' },
    { code: 'KH', name: 'Cambodia' }, { code: 'CM', name: 'Cameroon' }, { code: 'CA', name: 'Canada' }, { code: 'CV', name: 'Cape Verde' },
    { code: 'KY', name: 'Cayman Islands' }, { code: 'CF', name: 'Central African Republic' }, { code: 'TD', name: 'Chad' }, { code: 'CL', name: 'Chile' },
    { code: 'CN', name: 'China' }, { code: 'CX', name: 'Christmas Island' }, { code: 'CC', name: 'Cocos Islands' }, { code: 'CO', name: 'Colombia' },
    { code: 'KM', name: 'Comoros' }, { code: 'CK', name: 'Cook Islands' }, { code: 'CR', name: 'Costa Rica' }, { code: 'HR', name: 'Croatia' },
    { code: 'CU', name: 'Cuba' }, { code: 'CW', name: 'Curacao' }, { code: 'CY', name: 'Cyprus' }, { code: 'CZ', name: 'Czech Republic' },
    { code: 'CD', name: 'Democratic Republic of the Congo' }, { code: 'DK', name: 'Denmark' }, { code: 'DJ', name: 'Djibouti' }, { code: 'DM', name: 'Dominica' },
    { code: 'DO', name: 'Dominican Republic' }, { code: 'TL', name: 'East Timor' }, { code: 'EC', name: 'Ecuador' }, { code: 'EG', name: 'Egypt' },
    { code: 'SV', name: 'El Salvador' }, { code: 'GQ', name: 'Equatorial Guinea' }, { code: 'ER', name: 'Eritrea' }, { code: 'EE', name: 'Estonia' },
    { code: 'ET', name: 'Ethiopia' }, { code: 'FK', name: 'Falkland Islands' }, { code: 'FO', name: 'Faroe Islands' }, { code: 'FJ', name: 'Fiji' },
    { code: 'FI', name: 'Finland' }, { code: 'FR', name: 'France' }, { code: 'PF', name: 'French Polynesia' }, { code: 'GA', name: 'Gabon' },
    { code: 'GM', name: 'Gambia' }, { code: 'GE', name: 'Georgia' }, { code: 'DE', name: 'Germany' }, { code: 'GH', name: 'Ghana' },
    { code: 'GI', name: 'Gibraltar' }, { code: 'GR', name: 'Greece' }, { code: 'GL', name: 'Greenland' }, { code: 'GD', name: 'Grenada' },
    { code: 'GU', name: 'Guam' }, { code: 'GT', name: 'Guatemala' }, { code: 'GG', name: 'Guernsey' }, { code: 'GN', name: 'Guinea' },
    { code: 'GW', name: 'Guinea-Bissau' }, { code: 'GY', name: 'Guyana' }, { code: 'HT', name: 'Haiti' }, { code: 'HN', name: 'Honduras' },
    { code: 'HK', name: 'Hong Kong' }, { code: 'HU', name: 'Hungary' }, { code: 'IS', name: 'Iceland' }, { code: 'IN', name: 'India' },
    { code: 'ID', name: 'Indonesia' }, { code: 'IR', name: 'Iran' }, { code: 'IQ', name: 'Iraq' }, { code: 'IE', name: 'Ireland' },
    { code: 'IM', name: 'Isle of Man' }, { code: 'IL', name: 'Israel' }, { code: 'IT', name: 'Italy' }, { code: 'CI', name: 'Ivory Coast' },
    { code: 'JM', name: 'Jamaica' }, { code: 'JP', name: 'Japan' }, { code: 'JE', name: 'Jersey' }, { code: 'JO', name: 'Jordan' },
    { code: 'KZ', name: 'Kazakhstan' }, { code: 'KE', name: 'Kenya' }, { code: 'KI', name: 'Kiribati' }, { code: 'KW', name: 'Kuwait' },
    { code: 'KG', name: 'Kyrgyzstan' }, { code: 'LA', name: 'Laos' }, { code: 'LV', name: 'Latvia' }, { code: 'LB', name: 'Lebanon' },
    { code: 'LS', name: 'Lesotho' }, { code: 'LR', name: 'Liberia' }, { code: 'LY', name: 'Libya' }, { code: 'LI', name: 'Liechtenstein' },
    { code: 'LT', name: 'Lithuania' }, { code: 'LU', name: 'Luxembourg' }, { code: 'MO', name: 'Macau' }, { code: 'MK', name: 'Macedonia' },
    { code: 'MG', name: 'Madagascar' }, { code: 'MW', name: 'Malawi' }, { code: 'MY', name: 'Malaysia' }, { code: 'MV', name: 'Maldives' },
    { code: 'ML', name: 'Mali' }, { code: 'MT', name: 'Malta' }, { code: 'MH', name: 'Marshall Islands' }, { code: 'MR', name: 'Mauritania' },
    { code: 'MU', name: 'Mauritius' }, { code: 'YT', name: 'Mayotte' }, { code: 'MX', name: 'Mexico' }, { code: 'FM', name: 'Micronesia' },
    { code: 'MD', name: 'Moldova' }, { code: 'MC', name: 'Monaco' }, { code: 'MN', name: 'Mongolia' }, { code: 'ME', name: 'Montenegro' },
    { code: 'MS', name: 'Montserrat' }, { code: 'MA', name: 'Morocco' }, { code: 'MZ', name: 'Mozambique' }, { code: 'MM', name: 'Myanmar' },
    { code: 'NA', name: 'Namibia' }, { code: 'NR', name: 'Nauru' }, { code: 'NP', name: 'Nepal' }, { code: 'NL', name: 'Netherlands' },
    { code: 'AN', name: 'Netherlands Antilles' }, { code: 'NC', name: 'New Caledonia' }, { code: 'NZ', name: 'New Zealand' }, { code: 'NI', name: 'Nicaragua' },
    { code: 'NE', name: 'Niger' }, { code: 'NG', name: 'Nigeria' }, { code: 'NU', name: 'Niue' }, { code: 'KP', name: 'North Korea' },
    { code: 'MP', name: 'Northern Mariana Islands' }, { code: 'NO', name: 'Norway' }, { code: 'OM', name: 'Oman' }, { code: 'PK', name: 'Pakistan' },
    { code: 'PW', name: 'Palau' }, { code: 'PS', name: 'Palestine' }, { code: 'PA', name: 'Panama' }, { code: 'PG', name: 'Papua New Guinea' },
    { code: 'PY', name: 'Paraguay' }, { code: 'PE', name: 'Peru' }, { code: 'PH', name: 'Philippines' }, { code: 'PN', name: 'Pitcairn' },
    { code: 'PL', name: 'Poland' }, { code: 'PT', name: 'Portugal' }, { code: 'PR', name: 'Puerto Rico' }, { code: 'QA', name: 'Qatar' },
    { code: 'CG', name: 'Republic of the Congo' }, { code: 'RE', name: 'Reunion' }, { code: 'RO', name: 'Romania' }, { code: 'RU', name: 'Russia' },
    { code: 'RW', name: 'Rwanda' }, { code: 'BL', name: 'Saint Barthelemy' }, { code: 'SH', name: 'Saint Helena' }, { code: 'KN', name: 'Saint Kitts and Nevis' },
    { code: 'LC', name: 'Saint Lucia' }, { code: 'MF', name: 'Saint Martin' }, { code: 'PM', name: 'Saint Pierre and Miquelon' }, { code: 'VC', name: 'Saint Vincent and the Grenadines' },
    { code: 'WS', name: 'Samoa' }, { code: 'SM', name: 'San Marino' },
    { code: 'ST', name: 'Sao Tome and Principe' }, { code: 'SA', name: 'Saudi Arabia' }, { code: 'SN', name: 'Senegal' }, { code: 'RS', name: 'Serbia' },
    { code: 'SC', name: 'Seychelles' }, { code: 'SL', name: 'Sierra Leone' }, { code: 'SG', name: 'Singapore' }, { code: 'SX', name: 'Sint Maarten' },
    { code: 'SK', name: 'Slovakia' }, { code: 'SI', name: 'Slovenia' }, { code: 'SB', name: 'Solomon Islands' }, { code: 'SO', name: 'Somalia' },
    { code: 'ZA', name: 'South Africa' }, { code: 'KR', name: 'South Korea' }, { code: 'SS', name: 'South Sudan' }, { code: 'ES', name: 'Spain' },
    { code: 'LK', name: 'Sri Lanka' }, { code: 'SD', name: 'Sudan' }, { code: 'SR', name: 'Suriname' }, { code: 'SJ', name: 'Svalbard and Jan Mayen' },
    { code: 'SZ', name: 'Swaziland' }, { code: 'SE', name: 'Sweden' }, { code: 'CH', name: 'Switzerland' }, { code: 'SY', name: 'Syria' },
    { code: 'TW', name: 'Taiwan' }, { code: 'TJ', name: 'Tajikistan' }, { code: 'TZ', name: 'Tanzania' }, { code: 'TH', name: 'Thailand' },
    { code: 'TG', name: 'Togo' }, { code: 'TK', name: 'Tokelau' }, { code: 'TO', name: 'Tonga' }, { code: 'TT', name: 'Trinidad and Tobago' },
    { code: 'TN', name: 'Tunisia' }, { code: 'TR', name: 'Turkey' }, { code: 'TM', name: 'Turkmenistan' }, { code: 'TC', name: 'Turks and Caicos Islands' },
    { code: 'TV', name: 'Tuvalu' }, { code: 'VI', name: 'U.S. Virgin Islands' }, { code: 'UG', name: 'Uganda' }, { code: 'UA', name: 'Ukraine' },
    { code: 'AE', name: 'United Arab Emirates' }, { code: 'GB', name: 'United Kingdom' }, { code: 'US', name: 'United States' },
    { code: 'UY', name: 'Uruguay' }, { code: 'UZ', name: 'Uzbekistan' }, { code: 'VU', name: 'Vanuatu' }, { code: 'VA', name: 'Vatican' },
    { code: 'VE', name: 'Venezuela' }, { code: 'VN', name: 'Vietnam' }, { code: 'WF', name: 'Wallis and Futuna' }, { code: 'EH', name: 'Western Sahara' },
    { code: 'YE', name: 'Yemen' }, { code: 'ZM', name: 'Zambia' }, { code: 'ZW', name: 'Zimbabwe' }
];

export const INGREDIENTS: Ingredient[] = [
    { id: 'ing_1', name: 'All-Purpose Flour', stock: 50000, unit: 'g', costPerUnit: 0.0015, reorderThreshold: 10000, supplierId: 'sup_1', locationId: 'loc_1' },
    { id: 'ing_2', name: 'Chicken Breast', stock: 20000, unit: 'g', costPerUnit: 0.009, reorderThreshold: 5000, supplierId: 'sup_2', locationId: 'loc_1' },
    { id: 'ing_3', name: 'Tomato', stock: 15000, unit: 'g', costPerUnit: 0.003, reorderThreshold: 2000, supplierId: 'sup_2', locationId: 'loc_1' },
    { id: 'ing_4', name: 'Mozzarella Cheese', stock: 10000, unit: 'g', costPerUnit: 0.012, reorderThreshold: 2000, supplierId: 'sup_1', locationId: 'loc_1' },
    { id: 'ing_5', name: 'Coca-Cola Syrup', stock: 10, unit: 'l', costPerUnit: 5.50, reorderThreshold: 2, supplierId: 'sup_3', locationId: 'loc_1' },
];

export const RECIPES: Record<number, RecipeItem[]> = {};

export const MODIFIER_GROUPS: ModifierGroup[] = [
    {
        id: 'mg_1',
        name: 'Cheese',
        allowMultiple: false,
        isRequired: true,
        options: [
            { name: 'American Cheese', price: 0 },
            { name: 'Cheddar Cheese', price: 1.00 },
            { name: 'Swiss Cheese', price: 1.00 },
        ],
    },
    {
        id: 'mg_2',
        name: 'Add-ons',
        allowMultiple: true,
        options: [
            { name: 'Bacon', price: 1.50 },
            { name: 'Avocado', price: 2.00 },
            { name: 'Extra Patty', price: 3.00 },
        ],
    },
    {
        id: 'mg_3',
        name: 'Extras',
        allowMultiple: true,
        options: [
          { name: 'Extra BBQ Sauce', price: 0.50 },
          { name: 'Jalapeños', price: 0.75 },
          { name: 'Crispy Onions', price: 1.00 },
        ],
      },
      {
        id: 'mg_4',
        name: 'Customizations',
        allowMultiple: false,
        options: [
          { name: 'Standard', price: 0 },
          { name: 'No Bacon', price: 0 },
          { name: 'Lettuce Wrap (No Bun)', price: 0 },
        ],
      },
];

export const MENU_ITEMS: MenuItem[] = [
  // Appetizers
  { id: 1, name: 'Bruschetta', price: 8.99, category: 'appetizers', imageUrl: 'https://images.unsplash.com/photo-1579523595213-2a4b4817a028?auto=format&fit=crop&w=400&q=80&fm=webp', locationIds: ['loc_1', 'loc_2', 'loc_3', 'loc_4'], taxCategory: 'Standard', isVeg: true, color: '#84cc16', kdsId: 'kds_1', kitchenPrinterId: 'kp1' },
  { id: 2, name: 'Spinach Artichoke Dip', price: 10.99, category: 'appetizers', imageUrl: 'https://images.unsplash.com/photo-16290A2335136-15a4d75e8331?auto=format&fit=crop&w=400&q=80&fm=webp', locationIds: ['loc_1', 'loc_2'], taxCategory: 'Standard', isVeg: true, color: '#22c55e', kdsId: 'kds_1', kitchenPrinterId: 'kp1' },
  { id: 3, name: 'Fried Calamari', price: 12.99, category: 'appetizers', imageUrl: 'https://images.unsplash.com/photo-1598511653313-28a16f2c9918?auto=format&fit=crop&w=400&q=80&fm=webp', locationIds: ['loc_3', 'loc_4'], taxCategory: 'Standard', kdsId: 'kds_1', kitchenPrinterId: 'kp1' },
  { id: 4, name: 'Garlic Knots', price: 6.99, category: 'appetizers', imageUrl: 'https://images.unsplash.com/photo-1598214886328-795c6902b489?auto=format&fit=crop&w=400&q=80&fm=webp', locationIds: ['loc_1', 'loc_2', 'loc_3', 'loc_4'], taxCategory: 'Standard', isVeg: true, askQuantity: true, kdsId: 'kds_1', kitchenPrinterId: 'kp1' },
  { id: 5, name: 'Chicken Wings', price: 14.99, category: 'appetizers', imageUrl: 'https://images.unsplash.com/photo-1527477396000-e27163b481c2?auto=format&fit=crop&w=400&q=80&fm=webp', locationIds: ['loc_1', 'loc_2', 'loc_3', 'loc_4'], taxCategory: 'Standard', kdsId: 'kds_1', kitchenPrinterId: 'kp1', askPrice: true },
  // Soups
  { id: 6, name: 'Tomato Soup', price: 7.50, category: 'soups', imageUrl: 'https://images.unsplash.com/photo-1556910110-a5a6350d39d8?auto=format&fit=crop&w=400&q=80&fm=webp', locationIds: ['loc_1', 'loc_2'], taxCategory: 'Standard', isVeg: true, kdsId: 'kds_1', kitchenPrinterId: 'kp1' },
  { id: 7, name: 'French Onion Soup', price: 8.50, category: 'soups', imageUrl: 'https://plus.unsplash.com/premium_photo-1671401314332-6014ac273012?auto=format&fit=crop&w=400&q=80&fm=webp', locationIds: ['loc_1', 'loc_4'], taxCategory: 'Standard', kdsId: 'kds_1', kitchenPrinterId: 'kp1' },
  { id: 8, name: 'Chicken Noodle Soup', price: 8.00, category: 'soups', imageUrl: 'https://images.unsplash.com/photo-1611270418597-a6c77f724c35?auto=format&fit=crop&w=400&q=80&fm=webp', locationIds: ['loc_1', 'loc_2', 'loc_3', 'loc_4'], taxCategory: 'Standard', kdsId: 'kds_1', kitchenPrinterId: 'kp1' },
  // Burgers
  { id: 9, name: 'Classic Cheeseburger', price: 15.99, takeawayPrice: 15.99, deliveryPrice: 16.99, cost: 4.50, category: 'burgers', imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=400&q=80&fm=webp', locationIds: ['loc_1', 'loc_2', 'loc_3', 'loc_4'], taxCategory: 'Standard', modifierGroupIds: ['mg_1', 'mg_2'], isDiscountable: true, stock: 100, warnQty: 10, stopSaleAtZeroStock: true, kitchenPrinterId: 'kp1', kdsId: 'kds_1', course: 'Main' },
  { id: 10, name: 'Bacon BBQ Burger', price: 17.99, category: 'burgers', imageUrl: 'https://images.unsplash.com/photo-1603043435882-75c1d3921345?auto=format&fit=crop&w=400&q=80&fm=webp', locationIds: ['loc_1', 'loc_2', 'loc_3', 'loc_4'], taxCategory: 'Standard', modifierGroupIds: ['mg_3', 'mg_4'], kdsId: 'kds_1', kitchenPrinterId: 'kp1' },
  { id: 34, name: 'Build Your Own Burger', price: 10, category: 'burgers', imageUrl: 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=400&q=80&fm=webp', locationIds: ['loc_1', 'loc_2', 'loc_3', 'loc_4'], taxCategory: 'Standard', isCustomizableBurger: true, kdsId: 'kds_1', kitchenPrinterId: 'kp1' },
  { id: 12, name: 'Mushroom Swiss Burger', price: 16.99, category: 'burgers', imageUrl: 'https://images.unsplash.com/photo-1607013251379-e6eecfffe234?auto=format&fit=crop&w=400&q=80&fm=webp', locationIds: ['loc_1', 'loc_2'], taxCategory: 'Standard', modifierGroupIds: ['mg_1'], kdsId: 'kds_1', kitchenPrinterId: 'kp1' },
  { id: 13, name: 'Veggie Burger', price: 14.99, category: 'burgers', imageUrl: 'https://images.unsplash.com/photo-1551782450-a2132b4ba21d?auto=format&fit=crop&w=400&q=80&fm=webp', locationIds: ['loc_1', 'loc_2', 'loc_3', 'loc_4'], taxCategory: 'Standard', isVeg: true, kdsId: 'kds_1', kitchenPrinterId: 'kp1' },
  // Pizza
  { id: 11, name: 'Build Your Own Pizza', price: 12, category: 'pizza', imageUrl: 'https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?auto=format&fit=crop&w=400&q=80&fm=webp', locationIds: ['loc_1', 'loc_2', 'loc_3', 'loc_4'], taxCategory: 'Standard', isCustomizablePizza: true, kdsId: 'kds_1', kitchenPrinterId: 'kp1' },
  { id: 14, name: 'Margherita Pizza', price: 14.50, category: 'pizza', imageUrl: 'https://images.unsplash.com/photo-1598021680131-33f17c4384e2?auto=format&fit=crop&w=400&q=80&fm=webp', locationIds: ['loc_1', 'loc_2', 'loc_3', 'loc_4'], taxCategory: 'Standard', isVeg: true, kdsId: 'kds_1', kitchenPrinterId: 'kp1' },
  // Main Course
  { id: 15, name: 'Grilled Salmon', price: 24.99, category: 'main_course', imageUrl: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=400&q=80&fm=webp', locationIds: ['loc_1', 'loc_2', 'loc_3', 'loc_4'], taxCategory: 'Standard', kdsId: 'kds_1', kitchenPrinterId: 'kp1' },
  { id: 16, name: 'Steak Frites', price: 29.99, category: 'main_course', imageUrl: 'https://images.unsplash.com/photo-1600891964092-4316c288032e?auto=format&fit=crop&w=400&q=80&fm=webp', locationIds: ['loc_1', 'loc_4'], taxCategory: 'Standard', kdsId: 'kds_1', kitchenPrinterId: 'kp1' },
  { id: 17, name: 'Chicken Parmesan', price: 21.99, category: 'main_course', imageUrl: 'https://images.unsplash.com/photo-1632778149955-e83f0ce923e0?auto=format&fit=crop&w=400&q=80&fm=webp', locationIds: ['loc_1', 'loc_2'], taxCategory: 'Standard', kdsId: 'kds_1', kitchenPrinterId: 'kp1' },
  { id: 18, name: 'Roast Chicken', price: 22.50, category: 'main_course', imageUrl: 'https://images.unsplash.com/photo-1594041682492-3d0a8d513834?auto=format&fit=crop&w=400&q=80&fm=webp', locationIds: ['loc_1', 'loc_2', 'loc_3', 'loc_4'], taxCategory: 'Standard', kdsId: 'kds_1', kitchenPrinterId: 'kp1' },
  { id: 19, name: 'Fish and Chips', price: 18.99, category: 'main_course', imageUrl: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?auto=format&fit=crop&w=400&q=80&fm=webp', locationIds: ['loc_1', 'loc_3'], taxCategory: 'Standard', kdsId: 'kds_1', kitchenPrinterId: 'kp1' },
  { id: 20, name: 'Lamb Chops', price: 32.00, category: 'main_course', imageUrl: 'https://images.unsplash.com/photo-1629509095204-5853bd5a7a70?auto=format&fit=crop&w=400&q=80&fm=webp', locationIds: ['loc_1', 'loc_4'], taxCategory: 'Standard', kdsId: 'kds_1', kitchenPrinterId: 'kp1' },
  // Pasta
  { id: 21, name: 'Spaghetti Carbonara', price: 18.50, category: 'pasta', imageUrl: 'https://images.unsplash.com/photo-1588013273468-31508b946d3d?auto=format&fit=crop&w=400&q=80&fm=webp', locationIds: ['loc_1', 'loc_2', 'loc_3', 'loc_4'], taxCategory: 'Standard', kdsId: 'kds_1', kitchenPrinterId: 'kp1' },
  { id: 22, name: 'Fettuccine Alfredo', price: 17.99, category: 'pasta', imageUrl: 'https://images.unsplash.com/photo-1621996346565-e326e22e3e20?auto=format&fit=crop&w=400&q=80&fm=webp', locationIds: ['loc_1', 'loc_2'], taxCategory: 'Standard', isVeg: true, kdsId: 'kds_1', kitchenPrinterId: 'kp1' },
  { id: 23, name: 'Lasagna', price: 19.99, category: 'pasta', imageUrl: 'https://images.unsplash.com/photo-1574894709920-11b28e7367e3?auto=format&fit=crop&w=400&q=80&fm=webp', locationIds: ['loc_1', 'loc_2', 'loc_3', 'loc_4'], taxCategory: 'Standard', kdsId: 'kds_1', kitchenPrinterId: 'kp1' },
  // Desserts
  { id: 24, name: 'Chocolate Lava Cake', price: 9.99, category: 'desserts', imageUrl: 'https://images.unsplash.com/photo-1587314168485-3236d6710814?auto=format&fit=crop&w=400&q=80&fm=webp', locationIds: ['loc_1', 'loc_2', 'loc_3', 'loc_4'], taxCategory: 'Standard', isVeg: true, kdsId: 'kds_1', kitchenPrinterId: 'kp1' },
  { id: 25, name: 'Cheesecake', price: 8.50, category: 'desserts', imageUrl: 'https://images.unsplash.com/photo-1542826438-643292d59490?auto=format&fit=crop&w=400&q=80&fm=webp', locationIds: ['loc_1', 'loc_2'], taxCategory: 'Standard', isVeg: true, kdsId: 'kds_1', kitchenPrinterId: 'kp1' },
  { id: 26, name: 'Tiramisu', price: 9.00, category: 'desserts', imageUrl: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&w=400&q=80&fm=webp', locationIds: ['loc_1', 'loc_4'], taxCategory: 'Standard', isVeg: true, kdsId: 'kds_1', kitchenPrinterId: 'kp1' },
  { id: 27, name: 'Ice Cream Sundae', price: 7.99, category: 'desserts', imageUrl: 'https://images.unsplash.com/photo-1570197788417-0e82375c934d?auto=format&fit=crop&w=400&q=80&fm=webp', locationIds: ['loc_1', 'loc_2', 'loc_3', 'loc_4'], taxCategory: 'Standard', isVeg: true, kdsId: 'kds_1', kitchenPrinterId: 'kp1' },
  // Beverages
  { id: 28, name: 'Coca-Cola', price: 3.50, category: 'beverages', imageUrl: 'https://images.unsplash.com/photo-1554866585-cd94860890b7?auto=format&fit=crop&w=400&q=80&fm=webp', locationIds: ['loc_1', 'loc_2', 'loc_3', 'loc_4'], taxCategory: 'Standard', kdsId: 'kds_1', kitchenPrinterId: 'kp1' },
  { id: 29, name: 'Iced Tea', price: 3.00, category: 'beverages', imageUrl: 'https://images.unsplash.com/photo-1556679343-c7306c19761a?auto=format&fit=crop&w=400&q=80&fm=webp', locationIds: ['loc_1', 'loc_2', 'loc_3', 'loc_4'], taxCategory: 'Standard', kdsId: 'kds_1', kitchenPrinterId: 'kp1' },
  { id: 30, name: 'Orange Juice', price: 4.00, category: 'beverages', imageUrl: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?auto=format&fit=crop&w=400&q=80&fm=webp', locationIds: ['loc_1', 'loc_2', 'loc_3', 'loc_4'], taxCategory: 'Standard', kdsId: 'kds_1', kitchenPrinterId: 'kp1' },
  { id: 31, name: 'Coffee', price: 3.50, category: 'beverages', imageUrl: 'https://images.unsplash.com/photo-1512568400610-62da2848a098?auto=format&fit=crop&w=400&q=80&fm=webp', locationIds: ['loc_1', 'loc_2', 'loc_3', 'loc_4'], taxCategory: 'Standard', kdsId: 'kds_1', kitchenPrinterId: 'kp1' },
  { id: 32, name: 'Mojito', price: 12.00, category: 'beverages', imageUrl: 'https://images.unsplash.com/photo-1551538850-024e05a54825?auto=format&fit=crop&w=400&q=80&fm=webp', locationIds: ['loc_1', 'loc_3'], taxCategory: 'High Rate', kdsId: 'kds_1', kitchenPrinterId: 'kp1' },
  { id: 33, name: 'Water Bottle', price: 2.00, category: 'beverages', imageUrl: 'https://images.unsplash.com/photo-1523961131990-5ea7c61b2107?auto=format&fit=crop&w=400&q=80&fm=webp', locationIds: ['loc_1', 'loc_2', 'loc_3', 'loc_4'], taxCategory: 'Exempt', kdsId: 'kds_1', kitchenPrinterId: 'kp1' },
];

export const CUSTOMERS: Customer[] = [
    { id: 'cust_1', name: 'John Doe', phone: '555-1234', email: 'john.d@example.com', address: '123 Main St', locationId: 'loc_1', loyaltyPoints: 1250, membershipId: 'CUST-1704067201' },
    { id: 'cust_2', name: 'Jane Smith', phone: '555-5678', email: 'jane.s@example.com', address: '456 Oak Ave', locationId: 'loc_2', loyaltyPoints: 540, membershipId: 'CUST-1704067202' },
];

export const DRIVERS: Driver[] = [
    { id: 'driver_1', name: 'Mike Johnson', phone: '555-1111', status: 'available', locationId: 'loc_1' },
    { id: 'driver_2', name: 'Sarah Chen', phone: '555-2222', status: 'on-delivery', locationId: 'loc_1' },
];

export const EMPLOYEES: Employee[] = [
    { id: 'emp_1', name: 'Admin User', pin: '123456', roleId: 'role_admin', shiftStatus: 'clocked-out', shifts: [], locationId: 'loc_1', avatar: 'https://randomuser.me/api/portraits/men/1.jpg' },
    { id: 'emp_2', name: 'Manager Mike', pin: '654321', roleId: 'role_manager', shiftStatus: 'clocked-in', shifts: [{ clockIn: Date.now() - 4 * 3600 * 1000 }], locationId: 'loc_1', avatar: 'https://randomuser.me/api/portraits/men/2.jpg' },
    { id: 'emp_3', name: 'Chef Charlie', pin: '112233', roleId: 'role_chef', shiftStatus: 'clocked-in', shifts: [{ clockIn: Date.now() - 2 * 3600 * 1000 }], locationId: 'loc_1', avatar: 'https://randomuser.me/api/portraits/women/3.jpg' },
    { id: 'emp_4', name: 'Server Sally', pin: '445566', roleId: 'role_server', shiftStatus: 'clocked-out', shifts: [], locationId: 'loc_2', avatar: 'https://randomuser.me/api/portraits/women/4.jpg' },
    { id: 'emp_5', name: 'Cashier Chris', pin: '778899', roleId: 'role_cashier', shiftStatus: 'clocked-out', shifts: [], locationId: 'loc_1', avatar: 'https://randomuser.me/api/portraits/men/5.jpg' },
];

export const WASTAGE_LOG: WastageEntry[] = [
    { id: 'waste_1', ingredientId: 'ing_3', quantity: 500, cost: 1.5, reason: 'Spoiled', date: Date.now() - 86400000, locationId: 'loc_1' },
];

export const AUDIT_LOG: AuditLogEntry[] = [
    { id: 'log_1', timestamp: Date.now(), employeeId: 'emp_1', employeeName: 'Admin User', action: 'Logged in' },
];

export const DEFAULT_RECEIPT_SETTINGS: PrinterReceiptSettings = {
    headerLines: ['Company Name', '123 Main Street', 'Anytown, USA 12345', '(555) 123-4567', '', ''],
    footerLines: ['Thank you for your visit!', 'Please come again!', '', '', '', ''],
    fontSize: 1,
    copies: 1,
    marginTop: 5,
    marginBottom: 5,
    marginLeft: 3,
    marginRight: 3,
    showCustomer: true,
    showTable: true,
    showGuests: true,
    showInvoiceNumber: true,
    showOrderNumber: true,
    showStaff: true,
    showOrderTime: true,
    showItemIndex: false,
    showZeroPriceItems: false,
    showUnitPrice: true,
    showItemQuantity: true,
    showQuantityBeforeItem: true,
    showKitchenNote: false,
    showTotalQuantity: true,
    showTipGuide: false,
    showBarcode: true,
    logoUrl: '',
    footerLogoUrl: '',
    promoMessage: 'Thank you for your visit!',
};

export const DEFAULT_KITCHEN_PRINT_SETTINGS: KitchenPrintSettings = {
    headerLines: ['', '', '', '', '', ''],
    footerLines: ['', '', '', '', '', ''],
    fontSize: 1.2,
    copies: 1,
    marginTop: 5,
    marginBottom: 5,
    marginLeft: 3,
    marginRight: 3,
    showOrderNumber: true,
    showStaff: true,
    showOrderTime: true,
    showItemIndex: false,
    showZeroPriceItems: false,
    showUnitPrice: false,
    showItemQuantity: true,
    showQuantityBeforeItem: true,
    showKitchenNote: true,
    showTotalQuantity: true,
    showTable: true,
    showGuests: true,
    showCustomer: true,
    showInvoiceNumber: true,
    showBarcode: false,
};

export const PRINTERS: Printer[] = [
    { id: 'p1', name: 'Receipt Printer', type: 'thermal', connection: 'Print Server', model: 'Generic Thermal', paperWidth: 48, initialCommand: '1b,40', cutterCommand: '1d,56,30', drawerCommand: '1b,70,00,19,fa', useRasterImage: false, hasDrawer: true, isEnabled: true, status: 'connected', receiptSettings: { ...DEFAULT_RECEIPT_SETTINGS }, isDefault: true },
    { 
        id: 'kp1', 
        name: 'Kitchen Printer 1', 
        type: 'thermal', 
        connection: 'Print Server', 
        model: 'Generic Thermal', 
        paperWidth: 80, 
        initialCommand: '1b,40',
        cutterCommand: '1d,56,30',
        useRasterImage: false,
        isEnabled: true, 
        status: 'connected',
        hasDrawer: false,
        kitchenProfiles: {
            kitchen_1: { ...DEFAULT_KITCHEN_PRINT_SETTINGS },
        },
        isDefault: false,
    },
    { 
        id: 'kp2', 
        name: 'Kitchen Printer 2', 
        type: 'thermal', 
        connection: 'PDF Printer', 
        model: 'Generic Thermal', 
        paperWidth: 80, 
        initialCommand: '1b,40',
        cutterCommand: '1d,56,30',
        useRasterImage: false,
        isEnabled: true, 
        status: 'connected',
        hasDrawer: false,
        kitchenProfiles: {
            kitchen_2: { ...DEFAULT_KITCHEN_PRINT_SETTINGS },
        },
        isDefault: false,
    },
    { 
        id: 'kp3', 
        name: 'Kitchen Printer 3', 
        type: 'thermal', 
        connection: 'PDF Printer', 
        model: 'Generic Thermal', 
        paperWidth: 80, 
        initialCommand: '1b,40',
        cutterCommand: '1d,56,30',
        useRasterImage: false,
        isEnabled: true, 
        status: 'connected',
        hasDrawer: false,
        kitchenProfiles: {
            kitchen_3: { ...DEFAULT_KITCHEN_PRINT_SETTINGS },
        },
        isDefault: false,
    },
    { 
        id: 'kp4', 
        name: 'Kitchen Printer 4', 
        type: 'thermal', 
        connection: 'PDF Printer', 
        model: 'Generic Thermal', 
        paperWidth: 80, 
        initialCommand: '1b,40',
        cutterCommand: '1d,56,30',
        useRasterImage: false,
        isEnabled: true, 
        status: 'connected',
        hasDrawer: false,
        kitchenProfiles: {
            kitchen_4: { ...DEFAULT_KITCHEN_PRINT_SETTINGS },
        },
        isDefault: false,
    },
    { 
        id: 'kp5', 
        name: 'Kitchen Printer 5', 
        type: 'thermal', 
        connection: 'PDF Printer', 
        model: 'Generic Thermal', 
        paperWidth: 80, 
        initialCommand: '1b,40',
        cutterCommand: '1d,56,30',
        useRasterImage: false,
        isEnabled: true, 
        status: 'connected',
        hasDrawer: false,
        kitchenProfiles: {
            kitchen_5: { ...DEFAULT_KITCHEN_PRINT_SETTINGS },
        },
        isDefault: false,
    },
    { 
        id: 'kp6', 
        name: 'Kitchen Printer 6', 
        type: 'thermal', 
        connection: 'PDF Printer', 
        model: 'Generic Thermal', 
        paperWidth: 80, 
        initialCommand: '1b,40',
        cutterCommand: '1d,56,30',
        useRasterImage: false,
        isEnabled: true, 
        status: 'connected',
        hasDrawer: false,
        kitchenProfiles: {
            kitchen_6: { ...DEFAULT_KITCHEN_PRINT_SETTINGS },
        },
        isDefault: false,
    },
    { 
        id: 'bp1', 
        name: 'Bar Printer', 
        type: 'thermal', 
        connection: 'PDF Printer', 
        model: 'Generic Thermal', 
        paperWidth: 80, 
        initialCommand: '1b,40',
        cutterCommand: '1d,56,30',
        useRasterImage: false,
        isEnabled: true, 
        status: 'connected',
        hasDrawer: false,
        kitchenProfiles: {
            bar: { ...DEFAULT_KITCHEN_PRINT_SETTINGS },
        },
        isDefault: false,
    },
    { id: 'p5', name: 'Order Printer (Dine In, Tab)', type: 'thermal', connection: 'PDF Printer', model: 'Generic Thermal', paperWidth: 80, initialCommand: '1b,40', cutterCommand: '1d,56,30', useRasterImage: false, hasDrawer: false, isEnabled: true, status: 'connected', kitchenProfiles: { order: { ...DEFAULT_KITCHEN_PRINT_SETTINGS } }, isDefault: false },
    { id: 'p3', name: 'Pickup (takeaway) Printer', type: 'thermal', connection: 'PDF Printer', isEnabled: true, status: 'connected', model: 'Generic Thermal', paperWidth: 80, initialCommand: '1b,40', cutterCommand: '1d,56,30', useRasterImage: false, hasDrawer: false, kitchenProfiles: { takeaway: { ...DEFAULT_KITCHEN_PRINT_SETTINGS } }, isDefault: false },
    { id: 'p4', name: 'Report Printer', type: 'a4', connection: 'PDF Printer', isEnabled: true, status: 'connected', kitchenProfiles: { report: { ...DEFAULT_KITCHEN_PRINT_SETTINGS, paperWidth: 80 } as any }, paperWidth: 80, isDefault: false },
];

export const TABLES: Table[] = [
    // Main Floor - 10 tables
    { id: 't1', name: 'T1', capacity: 4, status: 'available', locationId: 'loc_1', shape: 'square', x: 10, y: 10, floor: 'Main Floor' },
    { id: 't2', name: 'T2', capacity: 2, status: 'available', locationId: 'loc_1', shape: 'round', x: 28, y: 10, floor: 'Main Floor' },
    { id: 't3', name: 'T3', capacity: 4, status: 'available', locationId: 'loc_1', shape: 'square', x: 46, y: 10, floor: 'Main Floor' },
    { id: 't4', name: 'T4', capacity: 2, status: 'available', locationId: 'loc_1', shape: 'round', x: 64, y: 10, floor: 'Main Floor' },
    { id: 't5', name: 'T5', capacity: 4, status: 'available', locationId: 'loc_1', shape: 'square', x: 82, y: 10, floor: 'Main Floor' },
    { id: 't6', name: 'T6', capacity: 6, status: 'available', locationId: 'loc_1', shape: 'rectangle-h', x: 10, y: 35, floor: 'Main Floor' },
    { id: 't7', name: 'T7', capacity: 6, status: 'available', locationId: 'loc_1', shape: 'rectangle-h', x: 40, y: 35, floor: 'Main Floor' },
    { id: 't8', name: 'T8', capacity: 4, status: 'available', locationId: 'loc_1', shape: 'square', x: 70, y: 35, floor: 'Main Floor' },
    { id: 't9', name: 'T9', capacity: 2, status: 'available', locationId: 'loc_1', shape: 'round', x: 10, y: 60, floor: 'Main Floor' },
    { id: 't10', name: 'T10', capacity: 2, status: 'available', locationId: 'loc_1', shape: 'round', x: 28, y: 60, floor: 'Main Floor' },

    // Patio - 10 tables
    { id: 'p1', name: 'P1', capacity: 4, status: 'available', locationId: 'loc_1', shape: 'square', x: 10, y: 10, floor: 'Patio' },
    { id: 'p2', name: 'P2', capacity: 2, status: 'available', locationId: 'loc_1', shape: 'round', x: 28, y: 10, floor: 'Patio' },
    { id: 'p3', name: 'P3', capacity: 4, status: 'available', locationId: 'loc_1', shape: 'square', x: 46, y: 10, floor: 'Patio' },
    { id: 'p4', name: 'P4', capacity: 2, status: 'available', locationId: 'loc_1', shape: 'round', x: 64, y: 10, floor: 'Patio' },
    { id: 'p5', name: 'P5', capacity: 4, status: 'available', locationId: 'loc_1', shape: 'square', x: 82, y: 10, floor: 'Patio' },
    { id: 'p6', name: 'P6', capacity: 8, status: 'available', locationId: 'loc_1', shape: 'rectangle-h', x: 10, y: 35, floor: 'Patio' },
    { id: 'p7', name: 'P7', capacity: 8, status: 'available', locationId: 'loc_1', shape: 'rectangle-h', x: 46, y: 35, floor: 'Patio' },
    { id: 'p8', name: 'P8', capacity: 4, status: 'available', locationId: 'loc_1', shape: 'round', x: 82, y: 35, floor: 'Patio' },
    { id: 'p9', name: 'P9', capacity: 2, status: 'available', locationId: 'loc_1', shape: 'round', x: 10, y: 60, floor: 'Patio' },
    { id: 'p10', name: 'P10', capacity: 4, status: 'available', locationId: 'loc_1', shape: 'square', x: 28, y: 60, floor: 'Patio' },
];

export const SUBSCRIPTIONS: Subscription[] = [];
export const PURCHASE_ORDERS: PurchaseOrder[] = [];

export const SCHEDULE: ScheduleEntry[] = [];
export const RESERVATIONS: Reservation[] = [];
export const WAITLIST: WaitlistEntry[] = [];

export const SIGNAGE_DISPLAYS: SignageDisplay[] = [
    { id: 'disp_1', name: 'Main Entrance TV', status: 'online' },
    { id: 'disp_2', name: 'Bar Screen', status: 'offline' },
];

export const SIGNAGE_CONTENT: SignageContentItem[] = [
    { id: 'content_1', name: 'Burger Promo', type: 'menu_promo', sourceUrl: '', duration: 10, menuItemIds: [9] },
    { id: 'content_2', name: 'Drink Specials', type: 'image', sourceUrl: 'https://images.unsplash.com/photo-1551024709-8f237c2045e5', duration: 15 },
];

export const SIGNAGE_PLAYLISTS: SignagePlaylist[] = [
    { id: 'pl_1', name: 'Lunch Specials', items: ['content_1', 'content_2'] },
];

export const SIGNAGE_SCHEDULE: SignageScheduleEntry[] = [
    { id: 'sch_1', displayId: 'disp_1', playlistId: 'pl_1', dayOfWeek: 3, startTime: '11:00', endTime: '14:00' },
];

export const ACTIVATION_CODES = new Set(['PRO-LICENSE-123', 'MULTI-STORE-KEY', 'QR-ORDER-KEY']);

export const PROMOTIONS: Promotion[] = [
    {
        id: 'promo_1',
        name: 'Happy Hour Appetizers',
        type: 'percentage',
        value: 0.2, // 20%
        startTime: '16:00',
        endTime: '18:00',
        daysOfWeek: [1, 2, 3, 4, 5], // Monday - Friday
        applicableCategoryIds: ['appetizers'],
        applicableProductIds: [],
        isActive: true,
    },
    {
        id: 'promo_2',
        name: 'Weekend Pizza Deal',
        type: 'fixed',
        value: 5.00, // $5 off
        startTime: '00:00',
        endTime: '23:59',
        daysOfWeek: [0, 6], // Sunday, Saturday
        applicableCategoryIds: ['pizza'],
        applicableProductIds: [],
        isActive: true,
    },
    {
        id: 'promo_3',
        name: 'BOGO Burgers',
        type: 'bogo',
        value: 1, // Buy 1 Get 1
        startTime: '00:00',
        endTime: '23:59',
        daysOfWeek: [2], // Wednesdays
        applicableCategoryIds: ['burgers'],
        applicableProductIds: [],
        isActive: true,
    },
    {
        id: 'promo_4',
        name: 'Lunch Special',
        type: 'fixed',
        value: 3.00,
        startTime: '11:00',
        endTime: '14:00',
        daysOfWeek: [1, 2, 3, 4, 5],
        applicableCategoryIds: [],
        applicableProductIds: [16, 17, 19, 23], // Steak, Chicken Parm, Fish & Chips, Lasagna
        isActive: false,
    }
];


export const KITCHEN_NOTES: KitchenNote[] = [
    { id: 'kn_1', note: 'No onions' },
    { id: 'kn_2', note: 'Extra spicy' },
    { id: 'kn_3', note: 'Allergy: Peanuts' },
];

export const VOID_REASONS: VoidReason[] = [
    { id: 'vr_1', reason: 'Item out of stock' },
    { id: 'vr_2', reason: 'Customer changed mind' },
    { id: 'vr_3', reason: 'Mistake in order' },
];

export const MANUAL_DISCOUNTS: ManualDiscount[] = [
    { id: 'md_1', name: 'Employee Discount', percentage: 0.20 },
    { id: 'md_2', name: 'Friends & Family', percentage: 0.15 },
    { id: 'md_3', name: 'Manager Comp', percentage: 1.00 },
];

export const SURCHARGES: Surcharge[] = [];

export const CALL_LOG: CallLogEntry[] = [];

export const PLUGINS: AppPlugin[] = OPTIONAL_PLUGIN_DEFINITIONS.map(p => ({
    ...p.manifest,
    status: p.manifest.isFree ? 'enabled' : 'trial',
    trialStartDate: p.manifest.isFree ? null : Date.now(),
}));