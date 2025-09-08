import React, { useMemo, useEffect } from 'react';
import { CartItem, Order, MenuItem, AppSettings, SignagePlaylist, SignageContentItem, Location, OrderType } from '../types';
import SparklesIcon from './icons/SparklesIcon';
import CheckCircleIcon from './icons/CheckCircleIcon';
import { useTranslations } from '../hooks/useTranslations';
import CFDAttractScreen from './CFDAttractScreen';
import { calculateOrderTotals } from '../utils/calculations';
import { ordinoLogoBase64 } from '../assets/logo';
import { useAppContext } from '../contexts/AppContext';
import { Modal } from './ui/Modal';

export const CFDModal: React.FC<{ isOpen: boolean; onClose: () => void; }> = ({ isOpen, onClose }) => {
    const { 
        cart, orderType, settings, lastCompletedOrder, setLastCompletedOrder, menuItems, signagePlaylists, 
        signageContent, currentLocation, surcharges
    } = useAppContext();

    const language = settings?.language.customer || 'en';
    const t = useTranslations(language);

    useEffect(() => {
        if (lastCompletedOrder) {
            const timer = setTimeout(() => {
                setLastCompletedOrder(null);
            }, 10000); // clear after 10 seconds
            return () => clearTimeout(timer);
        }
    }, [lastCompletedOrder, setLastCompletedOrder]);

    const attractScreenContent = useMemo(() => {
        if (!settings?.cfd.attractScreenPlaylistId) return [];
        const playlist = signagePlaylists.find((p: SignagePlaylist) => p.id === settings.cfd.attractScreenPlaylistId);
        if (!playlist) return [];
        return playlist.items.map((itemId: string) => signageContent.find((c: SignageContentItem) => c.id === itemId)).filter(Boolean);
    }, [settings?.cfd, signagePlaylists, signageContent]);

    const { subtotal, tax, total } = useMemo(() => {
        if (!currentLocation) return { subtotal: 0, tax: 0, total: 0 };
        return calculateOrderTotals(cart, currentLocation, null, null, orderType, settings, null, surcharges);
    }, [cart, currentLocation, settings, orderType, surcharges]);


    const renderContent = () => {
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
        
        if ((cart || []).length === 0) {
            return <CFDAttractScreen contentItems={attractScreenContent as SignageContentItem[]} menuItems={menuItems} settings={settings} />;
        }

        return (
            <div className="w-full h-full bg-background text-foreground flex flex-col p-8 gap-8 relative">
                <div className="absolute top-8 left-8">
                    <img src={ordinoLogoBase64} alt="Logo" className="h-16 w-auto opacity-80 drop-shadow-lg" />
                </div>
                <div className="flex-grow flex gap-8 mt-16">
                    <div className="w-1/2 flex flex-col bg-card rounded-2xl p-6 shadow-2xl border border-border">
                        <h1 className="text-5xl font-bold pb-4 border-b border-border">{t('your_order')}</h1>
                        <div className="flex-grow overflow-y-auto py-4 space-y-4">
                            {cart.map((item: CartItem) => (
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
                </div>
                <footer className="absolute bottom-8 text-center w-full">
                    <p className="text-2xl text-muted-foreground mb-2">Fast • Reliable • Smart POS</p>
                </footer>
            </div>
        );
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} className="max-w-full h-full !rounded-none">
            {renderContent()}
        </Modal>
    );
};