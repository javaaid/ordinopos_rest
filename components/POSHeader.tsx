import React, { useState, useEffect, useRef } from 'react';
import { View } from '../types';
import ChefHatIcon from './icons/ChefHatIcon';
import TvIcon from './icons/TvIcon';
import ComputerDesktopIcon from './icons/ComputerDesktopIcon';
import ArrowsPointingOutIcon from './icons/ArrowsPointingOutIcon';
import ArrowsPointingInIcon from './icons/ArrowsPointingInIcon';
import SearchIcon from './icons/SearchIcon';
import BuildingStorefrontIcon from './icons/BuildingStorefrontIcon';
import PizzaIcon from './icons/PizzaIcon';
import { useAppContext, useDataContext, usePOSContext, useModalContext } from '../contexts/AppContext';
import QueueListIcon from './icons/QueueListIcon';
import Squares2X2Icon from './icons/Squares2X2Icon';
import PhoneIcon from './icons/PhoneIcon';
import OrderNumberControl from './OrderNumberControl';
import { useTranslations } from '../hooks/useTranslations';

const POSHeader: React.FC = () => {
    const { 
        isFullscreen, onToggleFullScreen, isMultiStorePluginActive, 
        currentLocation, onLocationChange, isPizzaBuilderPluginActive,
        onLaunchView, settings, isOrderNumberDisplayPluginActive,
        isCallerIdPluginActive, handleIncomingCall
    } = useAppContext();
    const { locations, menuItems, heldOrders } = useDataContext();
    const { searchQuery, onSearchChange, handleReopenOrder, handleDeleteHeldOrder } = usePOSContext();
    const { openModal } = useModalContext();
    const [isLaunchpadOpen, setIsLaunchpadOpen] = useState(false);
    const [isLocationDropdownOpen, setIsLocationDropdownOpen] = useState(false);
    const [simulatedPhone, setSimulatedPhone] = useState('');
    const launchpadRef = useRef<HTMLDivElement>(null);
    const locationDropdownRef = useRef<HTMLDivElement>(null);
    const t = useTranslations(settings.language.staff);

     useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (launchpadRef.current && !launchpadRef.current.contains(event.target as Node)) {
                setIsLaunchpadOpen(false);
            }
            if (locationDropdownRef.current && !locationDropdownRef.current.contains(event.target as Node)) {
                setIsLocationDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleOpenPizzaBuilder = () => {
        const pizzaItem = menuItems.find((item: any) => item.isCustomizablePizza);
        if (pizzaItem) {
            openModal('pizzaBuilder', { item: pizzaItem });
        } else {
            alert("Pizza builder item not found in menu!");
        }
        setIsLaunchpadOpen(false);
    };

    const handleOpenHeldOrders = () => {
        openModal('heldOrders', { heldOrders, onReopenOrder: handleReopenOrder, onDeleteHeldOrder: handleDeleteHeldOrder });
    };
    
    const handleSimulateCall = () => {
        if (simulatedPhone) {
            handleIncomingCall(simulatedPhone);
        }
    };

    const dropdownItemClass = "w-full flex items-center gap-3 px-3 py-2 text-left text-sm rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground";

    return (
        <header className="p-1 flex items-center justify-between gap-2 border-b border-border shrink-0 flex-wrap">
            <div className="flex items-center gap-2">
                <div className="relative w-full max-w-xs">
                    <SearchIcon className="w-4 h-4 text-muted-foreground absolute start-3 top-1/2 -translate-y-1/2 pointer-events-none"/>
                    <input 
                        type="search"
                        placeholder={t('search_items')}
                        value={searchQuery}
                        onChange={e => onSearchChange(e.target.value)}
                        className="w-full bg-background rounded-lg ps-9 pe-4 h-9 text-sm text-foreground border border-border focus:border-primary focus:ring-0"
                    />
                </div>
                <button onClick={handleOpenHeldOrders} className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold h-9 px-3 rounded-lg text-sm transition-colors relative">
                    {t('held_orders')}
                    {heldOrders.length > 0 && <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-xs font-bold text-destructive-foreground">{heldOrders.length}</span>}
                </button>

                <div className="relative" ref={launchpadRef}>
                    <button onClick={() => setIsLaunchpadOpen(p => !p)} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold h-9 px-3 rounded-lg text-sm transition-colors" title={t('launchpad')}>
                        <Squares2X2Icon className="w-5 h-5" />
                    </button>
                    {isLaunchpadOpen && (
                        <div className="absolute top-full left-0 mt-2 w-48 bg-card border border-border rounded-lg shadow-lg z-10 animate-fade-in-down">
                            <div className="p-1">
                                {isPizzaBuilderPluginActive && (
                                    <button onClick={handleOpenPizzaBuilder} className={dropdownItemClass}>
                                        <PizzaIcon className="w-5 h-5" /> {t('pizza_builder')}
                                    </button>
                                )}
                                <button onClick={() => { onLaunchView('kds'); setIsLaunchpadOpen(false); }} className={dropdownItemClass}>
                                    <ChefHatIcon className="w-5 h-5" /> {t('kds')}
                                </button>
                                <button onClick={() => { onLaunchView('cfd'); setIsLaunchpadOpen(false); }} className={dropdownItemClass}>
                                    <TvIcon className="w-5 h-5" /> {t('cfd')}
                                </button>
                                <button onClick={() => { onLaunchView('kiosk'); setIsLaunchpadOpen(false); }} className={dropdownItemClass}>
                                    <ComputerDesktopIcon className="w-5 h-5" /> {t('kiosk')}
                                </button>
                                {isOrderNumberDisplayPluginActive && (
                                    <button onClick={() => { onLaunchView('order_number_display'); setIsLaunchpadOpen(false); }} className={dropdownItemClass}>
                                        <QueueListIcon className="w-5 h-5" /> {t('order_display')}
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </div>
                
                <button onClick={onToggleFullScreen} className="flex items-center gap-2 bg-secondary hover:bg-muted text-secondary-foreground font-semibold h-9 px-3 rounded-lg text-sm transition-colors" title="Toggle Fullscreen (F11)">
                    {isFullscreen ? <ArrowsPointingInIcon className="w-5 h-5" /> : <ArrowsPointingOutIcon className="w-5 h-5" />}
                </button>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
                {isCallerIdPluginActive && (
                    <div className="bg-secondary h-9 px-2 rounded-lg flex items-center gap-2">
                        <span className="text-xs font-bold text-muted-foreground ml-2 hidden sm:inline">CALL SIM:</span>
                        <input 
                            type="tel" 
                            value={simulatedPhone}
                            onChange={e => setSimulatedPhone(e.target.value)}
                            placeholder="e.g., 555-1234"
                            className="bg-background border border-border rounded-md px-2 h-7 text-sm w-36"
                        />
                        <button onClick={handleSimulateCall} className="bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-semibold px-3 h-7 rounded-md flex items-center gap-1">
                            <PhoneIcon className="w-4 h-4" /> <span className="hidden md:inline">Simulate</span>
                        </button>
                    </div>
                )}
                {isOrderNumberDisplayPluginActive && <OrderNumberControl />}
                
                {!settings.advancedPOS.lockTillToLocation && isMultiStorePluginActive && locations.length > 1 && (
                    <div className="relative" ref={locationDropdownRef}>
                        <button onClick={() => setIsLocationDropdownOpen(p => !p)} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold h-9 px-3 rounded-lg text-sm transition-colors" title={t('change_location')}>
                                <BuildingStorefrontIcon className="w-5 h-5" />
                                <span className="hidden md:inline">{currentLocation.name}</span>
                        </button>
                        {isLocationDropdownOpen && (
                            <div className="absolute top-full right-0 mt-2 w-48 bg-card border border-border rounded-lg shadow-lg z-10 animate-fade-in-down">
                                <div className="p-1">
                                    {locations.map((loc: any) => (
                                            <button
                                            key={loc.id}
                                            onClick={() => {
                                                onLocationChange(loc.id);
                                                setIsLocationDropdownOpen(false);
                                            }}
                                            className={dropdownItemClass}
                                        >
                                            {loc.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </header>
    );
};

export default POSHeader;