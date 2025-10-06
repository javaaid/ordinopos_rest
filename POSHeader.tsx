


import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { View, Role, Notification, Customer, Order, Employee } from './types';
import ChefHatIcon from './components/icons/ChefHatIcon';
import TvIcon from './components/icons/TvIcon';
import ComputerDesktopIcon from './components/icons/ComputerDesktopIcon';
import ArrowsPointingOutIcon from './components/icons/ArrowsPointingOutIcon';
import ArrowsPointingInIcon from './components/icons/ArrowsPointingInIcon';
import SearchIcon from './components/icons/SearchIcon';
import BuildingStorefrontIcon from './components/icons/BuildingStorefrontIcon';
import PizzaIcon from './components/icons/PizzaIcon';
import { useAppContext } from './contexts/AppContext';
import QueueListIcon from './components/icons/QueueListIcon';
import Squares2X2Icon from './components/icons/Squares2X2Icon';
import PhoneIcon from './components/icons/PhoneIcon';
import OrderNumberControl from './components/OrderNumberControl';
import { useTranslations } from './hooks/useTranslations';
import HomeIcon from './components/icons/HomeIcon';
import Cog6ToothIcon from './components/icons/Cog6ToothIcon';
import BellIcon from './components/icons/BellIcon';
import LogoutIcon from './components/icons/LogoutIcon';
import { cn } from './lib/utils';
import SunIcon from './components/icons/SunIcon';
import MoonIcon from './components/icons/MoonIcon';
import NotificationsPanel from './components/NotificationsPanel';
import BarcodeScannerIcon from './components/icons/BarcodeScannerIcon';
import Bars3Icon from './components/icons/Bars3Icon';
import { Button } from './components/ui/Button';
import UserCircleIcon from './components/icons/UserCircleIcon';
import UserIcon from './components/icons/UserIcon';


interface POSHeaderProps {
}

const POSHeader: React.FC<POSHeaderProps> = () => {
    const { 
        isFullscreen, onToggleFullScreen, isMultiStorePluginActive, 
        currentLocation, onLocationChange, isPizzaBuilderPluginActive,
        onLaunchView, settings, isOrderNumberDisplayPluginActive,
        isCallerIdPluginActive, handleIncomingCall,
        setView, currentEmployee, handleLogout, notifications,
        theme, onToggleTheme, handleMarkAllNotificationsAsRead,
        handleBarcodeScanned,
        locations, menuItems, heldOrders, roles,
        searchQuery, onSearchChange, handleReopenOrder, handleDeleteHeldOrder,
        openModal, closeModal, addToast,
        onToggleSidebarCollapse,
        cart, activeTab, activeOrderToSettle, onNewSaleClick, onVoidOrder
    } = useAppContext();

    const [isLaunchpadOpen, setIsLaunchpadOpen] = useState(false);
    const [isLocationDropdownOpen, setIsLocationDropdownOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

    const launchpadRef = useRef<HTMLDivElement>(null);
    const locationDropdownRef = useRef<HTMLDivElement>(null);
    const userMenuRef = useRef<HTMLDivElement>(null);
    const notificationPanelRef = useRef<HTMLDivElement>(null);

    // Add a guard clause to prevent crashes if settings are not yet loaded.
    if (!settings || !settings.advancedPOS) {
        return null;
    }

    const t = useTranslations(settings.language.staff);
    
     useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (launchpadRef.current && !launchpadRef.current.contains(event.target as Node)) setIsLaunchpadOpen(false);
            if (locationDropdownRef.current && !locationDropdownRef.current.contains(event.target as Node)) setIsLocationDropdownOpen(false);
            if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) setIsUserMenuOpen(false);
            if (notificationPanelRef.current && !notificationPanelRef.current.contains(event.target as Node)) setIsNotificationsOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const role = useMemo(() => {
        return currentEmployee ? roles.find((r: Role) => r.id === currentEmployee.roleId) : null;
    }, [currentEmployee, roles]);

    const handleOpenPizzaBuilder = () => {
        const pizzaItem = menuItems.find((item: any) => item.isCustomizablePizza);
        if (pizzaItem) {
            openModal('pizzaBuilder', { item: pizzaItem });
        } else {
            addToast({type: 'error', title: 'Setup Required', message: 'Pizza builder menu item not found.'});
        }
        setIsLaunchpadOpen(false);
    };

    const handleOpenHeldOrders = () => {
        openModal('heldOrders', { heldOrders, onReopenOrder: handleReopenOrder, onDeleteHeldOrder: handleDeleteHeldOrder });
    };

    const handleOpenBarcodeScanner = () => {
        openModal('barcodeScanner', { onScan: handleBarcodeScanned });
    };

    const dropdownItemClass = "w-full flex items-center gap-3 px-3 py-2 text-left text-sm rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground";
    const unreadNotificationCount = (notifications || []).filter((n: Notification) => !n.read).length;
    const hasCriticalNotifications = (notifications || []).some((n: Notification) => !n.read && n.type === 'error');

    return (
        <header className="p-1.5 flex items-center justify-between gap-2 border-b border-border shrink-0">
            <div className="flex items-center gap-2 flex-1">
                 <button onClick={onToggleSidebarCollapse} className="flex-shrink-0 flex items-center justify-center bg-secondary hover:bg-muted text-secondary-foreground font-semibold h-9 w-9 rounded-lg text-sm transition-colors" title="Toggle Sidebar">
                    <Bars3Icon className="w-5 h-5" />
                </button>
                 <div className="relative w-full max-w-sm">
                    <SearchIcon className="w-4 h-4 text-muted-foreground absolute start-3 top-1/2 -translate-y-1/2 pointer-events-none"/>
                    <input 
                        type="search"
                        placeholder={t('search_items')}
                        value={searchQuery}
                        onChange={e => onSearchChange(e.target.value)}
                        className="w-full bg-background rounded-lg ps-9 pe-4 h-9 text-sm text-foreground border border-border focus:border-primary focus:ring-0"
                    />
                </div>
            </div>
            <div className="flex items-center gap-2">
                 <button onClick={handleOpenHeldOrders} className="flex items-center gap-2 bg-secondary hover:bg-muted text-secondary-foreground font-semibold h-9 px-3 rounded-lg text-sm transition-colors relative">
                    {t('held_orders')}
                    {heldOrders.length > 0 && <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-xs font-bold text-destructive-foreground">{heldOrders.length}</span>}
                </button>
                 <div className="relative" ref={launchpadRef}>
                    <button onClick={() => setIsLaunchpadOpen(p => !p)} className="flex items-center gap-2 bg-secondary hover:bg-muted text-secondary-foreground font-semibold h-9 w-9 justify-center rounded-lg text-sm transition-colors" title={t('launchpad')}>
                        <Squares2X2Icon className="w-5 h-5" />
                    </button>
                    {isLaunchpadOpen && (
                        <div className="absolute top-full right-0 mt-2 w-48 bg-card border border-border rounded-lg shadow-lg z-50 animate-fade-in-down">
                            <div className="p-1">
                                {isPizzaBuilderPluginActive && (<button onClick={handleOpenPizzaBuilder} className={dropdownItemClass}><PizzaIcon className="w-5 h-5" /> {t('pizza_builder')}</button>)}
                                <button onClick={() => { onLaunchView('kds'); setIsLaunchpadOpen(false); }} className={dropdownItemClass}><ChefHatIcon className="w-5 h-5" /> {t('kds')}</button>
                                <button onClick={() => { onLaunchView('cfd'); setIsLaunchpadOpen(false); }} className={dropdownItemClass}><TvIcon className="w-5 h-5" /> {t('cfd')}</button>
                                <button onClick={() => { onLaunchView('kiosk'); setIsLaunchpadOpen(false); }} className={dropdownItemClass}><ComputerDesktopIcon className="w-5 h-5" /> {t('kiosk')}</button>
                                {isOrderNumberDisplayPluginActive && (<button onClick={() => { onLaunchView('order_number_display'); setIsLaunchpadOpen(false); }} className={dropdownItemClass}><QueueListIcon className="w-5 h-5" /> {t('order_display')}</button>)}
                            </div>
                        </div>
                    )}
                </div>
                 {!settings.advancedPOS.lockTillToLocation && isMultiStorePluginActive && locations.length > 1 && (
                    <div className="relative" ref={locationDropdownRef}>
                        <button onClick={() => setIsLocationDropdownOpen(p => !p)} className="flex items-center gap-2 bg-secondary hover:bg-muted text-secondary-foreground font-semibold h-9 px-3 rounded-lg text-sm transition-colors" title={t('change_location')}>
                                <BuildingStorefrontIcon className="w-5 h-5" />
                                <span className="hidden md:inline">{currentLocation.name}</span>
                        </button>
                        {isLocationDropdownOpen && (
                            <div className="absolute top-full right-0 mt-2 w-48 bg-card border border-border rounded-lg shadow-lg z-50 animate-fade-in-down"><div className="p-1">{locations.map((loc: any) => (<button key={loc.id} onClick={() => { onLocationChange(loc.id); setIsLocationDropdownOpen(false);}} className={dropdownItemClass}>{loc.name}</button>))}</div></div>
                        )}
                    </div>
                )}
                
                <button onClick={onToggleTheme} className="flex items-center gap-2 bg-secondary hover:bg-muted text-secondary-foreground font-semibold h-9 w-9 justify-center rounded-lg text-sm transition-colors" title="Toggle Theme">
                    {theme === 'light' ? <MoonIcon className="w-5 h-5" /> : <SunIcon className="w-5 h-5" />}
                </button>

                <div className="h-6 w-px bg-border mx-1"></div>

                <div className="relative" ref={notificationPanelRef}>
                    <button onClick={() => setIsNotificationsOpen(p => !p)} className="relative flex items-center gap-2 bg-secondary hover:bg-muted text-secondary-foreground font-semibold h-9 w-9 justify-center rounded-lg text-sm transition-colors" title="Notifications">
                        <BellIcon className="w-5 h-5" />
                        {unreadNotificationCount > 0 && 
                            <span className={cn(
                                "absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-xs font-bold text-destructive-foreground",
                                hasCriticalNotifications && "animate-pulse ring-2 ring-destructive ring-offset-2 ring-offset-card"
                            )}>
                                {unreadNotificationCount}
                            </span>
                        }
                    </button>
                    {isNotificationsOpen && (
                        <NotificationsPanel
                          notifications={notifications}
                          onMarkAllAsRead={handleMarkAllNotificationsAsRead}
                          onClose={() => setIsNotificationsOpen(false)}
                        />
                    )}
                </div>

                 <div className="relative" ref={userMenuRef}>
                    <button onClick={() => setIsUserMenuOpen(p => !p)} className="h-9 w-9 rounded-full overflow-hidden border-2 border-border hover:border-primary transition-colors">
                        <img src={currentEmployee?.avatar} alt={currentEmployee?.name} className="h-full w-full object-cover" />
                    </button>
                     {isUserMenuOpen && (
                        <div className="absolute top-full right-0 mt-2 w-56 bg-card border border-border rounded-lg shadow-lg z-50 animate-fade-in-down">
                            <div className="p-3 border-b border-border">
                                <p className="font-bold text-foreground text-sm">{currentEmployee?.name}</p>
                                <p className="text-xs text-muted-foreground">{role?.name}</p>
                            </div>
                            <div className="p-1">
                                <button onClick={() => handleLogout()} className={cn(dropdownItemClass, 'text-destructive')}>
                                    <LogoutIcon className="w-5 h-5"/> {t('logout')}
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                <button onClick={onToggleFullScreen} className="flex items-center gap-2 bg-secondary hover:bg-muted text-secondary-foreground font-semibold h-9 w-9 justify-center rounded-lg text-sm transition-colors" title="Toggle Fullscreen (F11)">
                    {isFullscreen ? <ArrowsPointingInIcon className="w-5 h-5" /> : <ArrowsPointingOutIcon className="w-5 h-5" />}
                </button>
            </div>
        </header>
    );
};

export default POSHeader;