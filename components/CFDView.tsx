import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { CartItem, AppliedDiscount, AIResponse, Order, Language, MenuItem, AppSettings, SignagePlaylist, SignageContentItem, Location, Theme, OrderType } from '../types';
import SparklesIcon from './icons/SparklesIcon';
import QrCodeIcon from './icons/QrCodeIcon';
import CheckCircleIcon from './icons/CheckCircleIcon';
import { useTranslations } from '../hooks/useTranslations';
import CFDAttractScreen from './CFDAttractScreen';
import { calculateOrderTotals } from '../utils/calculations';
import { hexToHsl } from '../lib/utils';
import ArrowsPointingOutIcon from './icons/ArrowsPointingOutIcon';
import ArrowsPointingInIcon from './icons/ArrowsPointingInIcon';

const CFDView: React.FC = () => {
    const [cart, setCart] = useState<CartItem[]>([]);
    const [orderType, setOrderType] = useState<OrderType>('dine-in');
    const [settings, setSettings] = useState<AppSettings | null>(null);
    const [lastCompletedOrder, setLastCompletedOrder] = useState<Order | null>(null);
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [signagePlaylists, setSignagePlaylists] = useState<SignagePlaylist[]>([]);
    const [signageContent, setSignageContent] = useState<SignageContentItem[]>([]);
    const [currentLocationId, setCurrentLocationId] = useState<string | null>(null);
    const [allLocations, setAllLocations] = useState<Location[]>([]);
    
    const channelRef = useRef<BroadcastChannel | null>(null);

    const [isFullscreen, setIsFullscreen] = useState(() => !!(document.fullscreenElement || (document as any).webkitFullscreenElement || (document as any).mozFullScreenElement || (document as any).msFullscreenElement));

    const toggleFullScreen = useCallback(() => {
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

    useEffect(() => {
        if (settings?.theme) {
            const root = document.documentElement;
            root.style.setProperty('--primary', hexToHsl(settings.theme.primary));
            root.style.setProperty('--background', hexToHsl(settings.theme.background));
            root.style.setProperty('--card', hexToHsl(settings.theme.surface));
            root.style.setProperty('--foreground', hexToHsl(settings.theme.textBase));
            root.style.setProperty('--muted-foreground', hexToHsl(settings.theme.textMuted));
            root.style.setProperty('--popover', hexToHsl(settings.theme.surface));
            root.style.setProperty('--ring', hexToHsl(settings.theme.primary));
        }
        document.documentElement.setAttribute('data-theme', 'dark');
    }, [settings?.theme]);


    useEffect(() => {
        const channel = new BroadcastChannel('ordino_pos_sync');
        channelRef.current = channel;

        const handleMessage = (event: MessageEvent) => {
            try {
                const { type, payload } = event.data;
                if (type === 'STATE_SYNC') {
                    setCart(payload.currentCart || []);
                    setOrderType(payload.currentOrderType || 'dine-in');
                    setSettings(payload.allSettings || null);
                    setLastCompletedOrder(payload.lastCompletedOrder || null);
                    const locId = payload.currentLocationId;
                    const allItems = payload.allMenuItems || [];
                    if (locId) {
                        setMenuItems(allItems.filter((item: MenuItem) => item.locationIds.includes(locId)));
                    } else {
                        setMenuItems(allItems);
                    }
                    setSignagePlaylists(payload.allSignagePlaylists || []);
                    setSignageContent(payload.allSignageContent || []);
                    setCurrentLocationId(payload.currentLocationId || null);
                    setAllLocations(payload.allLocations || []);
                }
            } catch (e) {
                console.error("CFD failed to handle message", e);
            }
        };

        channel.addEventListener('message', handleMessage);
        channel.postMessage({ type: 'REQUEST_STATE' });

        return () => {
            channel.removeEventListener('message', handleMessage);
            channel.close();
        };
    }, []);

    const language = settings?.language.customer || 'en';
    const t = useTranslations(language);

    useEffect(() => {
        let timer: number;
        if (lastCompletedOrder) {
            timer = window.setTimeout(() => {
                setLastCompletedOrder(null);
            }, 15000); // 15 seconds to show confirmation
        }
        return () => clearTimeout(timer);
    }, [lastCompletedOrder]);
    
    const attractScreenContent = useMemo(() => {
        if (!settings?.cfd.attractScreenPlaylistId) return [];
        const playlist = signagePlaylists.find(p => p.id === settings.cfd.attractScreenPlaylistId);
        if (!playlist) return [];
        return playlist.items.map(itemId => signageContent.find(c => c.id === itemId)).filter(Boolean);
    }, [settings?.cfd, signagePlaylists, signageContent]);

    const locationForCalcs: Location | null = useMemo(() => {
        if (!currentLocationId || allLocations.length === 0) return null;
        return allLocations.find(l => l.id === currentLocationId) || null;
    }, [currentLocationId, allLocations]);


    const { subtotal, tax, total } = useMemo(() => {
        if (!locationForCalcs) return { subtotal: 0, tax: 0, total: 0 };
        return calculateOrderTotals(cart, locationForCalcs, null, null, orderType, settings ?? undefined, undefined, []);
    }, [cart, locationForCalcs, settings, orderType]);


    if (lastCompletedOrder) {
        return (
            <div className="w-full h-full flex flex-col items-center justify-center bg-background text-foreground p-8 text-center animate-fade-in">
                <CheckCircleIcon className="w-48 h-48 text-primary mx-auto mb-8" />
                <p className="text-4xl text-muted-foreground">{t('thank_you')}</p>
                <h1 className="text-9xl font-bold font-mono my-4">{lastCompletedOrder.orderNumber}</h1>
                <p className="text-2xl text-muted-foreground">{t('follow_instructions')}</p>
                <p className="text-xl text-muted-foreground">{t('finalize_payment')}</p>
            </div>
        );
    }
    
    if (cart.length === 0) {
        return <CFDAttractScreen contentItems={attractScreenContent} menuItems={menuItems} settings={settings} />;
    }

    return (
        <div className="w-full h-full bg-background text-foreground flex p-8 gap-8 relative">
            <div className="absolute top-8 left-8">
                {settings?.receipt.logoUrl && (
                    <img src={settings.receipt.logoUrl} alt="Logo" className="h-16 w-auto opacity-80 drop-shadow-lg" />
                )}
            </div>
            <div className="w-1/2 flex flex-col bg-card rounded-2xl p-6 shadow-2xl border border-border">
                <h1 className="text-5xl font-bold pb-4 border-b border-border">{t('your_order')}</h1>
                <div className="flex-grow overflow-y-auto py-4 space-y-4">
                    {cart.map(item => (
                        <div key={item.cartId} className="flex items-center gap-4">
                            <span className="text-2xl font-bold bg-secondary w-12 h-12 flex items-center justify-center rounded-lg">{item.quantity}x</span>
                            <div>
                                <p className="text-2xl font-semibold">{item.menuItem.name}</p>
                                <p className="text-lg text-muted-foreground">${item.menuItem.price.toFixed(2)}</p>
                            </div>
                            <p className="ml-auto text-2xl font-semibold">${(item.menuItem.price * item.quantity).toFixed(2)}</p>
                        </div>
                    ))}
                </div>
                <div className="mt-auto pt-4 border-t-2 border-border text-2xl space-y-2">
                    <div className="flex justify-between text-muted-foreground"><span>{t('subtotal')}</span><span>${subtotal.toFixed(2)}</span></div>
                    <div className="flex justify-between text-muted-foreground"><span>{t('tax')}</span><span>${tax.toFixed(2)}</span></div>
                    <div className="flex justify-between text-4xl font-bold text-foreground mt-2"><span>{t('total')}</span><span className="text-primary">${total.toFixed(2)}</span></div>
                </div>
            </div>
            <div className="w-1/2 flex flex-col items-center justify-center">
                <div className="text-center">
                    <h2 className="text-4xl font-bold text-muted-foreground">{t('place_order_cashier')}</h2>
                    <p className="text-2xl text-muted-foreground mt-4">{t('finalize_payment')}</p>
                </div>
                {settings?.ai.enableAIFeatures && settings?.ai.enableCFDSuggestions && (
                     <div className="mt-12 bg-card p-6 rounded-2xl w-full max-w-md shadow-lg border border-border">
                        <h3 className="text-2xl font-bold text-primary flex items-center gap-2 mb-4"><SparklesIcon className="w-6 h-6"/> {t('you_might_like')}</h3>
                        <p className="text-muted-foreground">AI suggestions are coming soon!</p>
                    </div>
                )}
            </div>
             <button onClick={toggleFullScreen} className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground">
                {isFullscreen ? <ArrowsPointingInIcon className="w-6 h-6"/> : <ArrowsPointingOutIcon className="w-6 h-6"/>}
            </button>
        </div>
    );
};

export default CFDView;