import React, { useState, useMemo, useEffect, useRef } from 'react';
import { MenuItem, Category, CartItem, ModifierOption, Order, AIResponse, Language, AppSettings } from '../types';
import CategoryTabs from './CategoryTabs';
import MenuItemCard from './MenuItemCard';
import OrderItem from './OrderItem';
import ModifierModal from './ModifierModal';
import CheckCircleIcon from './icons/CheckCircleIcon';
import AISuggestions from './AISuggestions';
import LanguageSwitcher from './LanguageSwitcher';
import { useTranslations } from '../hooks/useTranslations';
import { ordinoLogoBase64 } from '../assets/logo';
import { Modal } from './ui/Modal';
import { useAppContext } from '../contexts/AppContext';

type KioskStep = 'welcome' | 'ordering' | 'payment' | 'confirmation';

const PAYMENT_STEPS = [
    'Connecting to payment network...',
    'Authorizing transaction...',
    'Processing payment...',
    'Finalizing...',
];

export const KioskModal: React.FC<{ isOpen: boolean, onClose: () => void }> = ({ isOpen, onClose }) => {
    const { menuItems, categoriesWithCounts, settings, handleKioskOrderPlaced } = useAppContext();
    const [step, setStep] = useState<KioskStep>('welcome');
    const [cart, setCart] = useState<CartItem[]>([]);
    const [activeCategory, setActiveCategory] = useState<string>('all');
    const [isModifierModalOpen, setIsModifierModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
    const [lastOrder, setLastOrder] = useState<Order | null>(null);
    const [language, setLanguage] = useState<Language>(settings.language.customer);
    
    const [isAISuggesting, setIsAISuggesting] = useState<boolean>(false);
    const [aiSuggestions, setAISuggestions] = useState<AIResponse | null>(null);
    const t = useTranslations(language);
    
    const [paymentStep, setPaymentStep] = useState(0);

    const TAX_RATE = 0.08;

    const subtotal = useMemo(() => {
        return cart.reduce((acc, item) => {
            const modifiersTotal = item.selectedModifiers.reduce((acc, mod) => acc + mod.price, 0);
            return acc + (item.menuItem.price + modifiersTotal) * item.quantity;
        }, 0);
    }, [cart]);
    
    const tax = useMemo(() => subtotal * TAX_RATE, [subtotal]);
    const total = useMemo(() => subtotal + tax, [subtotal, tax]);

    const filteredMenuItems = useMemo(() => {
        if (activeCategory === 'all') return menuItems;
        return menuItems.filter((item: MenuItem) => item.category === activeCategory);
    }, [menuItems, activeCategory]);
    
    const isOutOfStockMap = useMemo(() => new Map<number, boolean>(), []);
    
    const addToCart = (item: MenuItem, modifiers: ModifierOption[]) => {
      setCart((prevCart) => {
        const existingItem = prevCart.find(ci => 
          ci.menuItem.id === item.id && 
          JSON.stringify(ci.selectedModifiers.map(m=>m.name).sort()) === JSON.stringify(modifiers.map(m=>m.name).sort())
        );
        
        if (existingItem) {
          return prevCart.map(ci => 
            ci.cartId === existingItem.cartId ? { ...ci, quantity: ci.quantity + 1 } : ci
          );
        }
        
        const newCartItem: CartItem = {
          cartId: `${Date.now()}-${Math.random()}`,
          menuItem: item,
          quantity: 1,
          selectedModifiers: modifiers
        };
        return [...prevCart, newCartItem];
      });
    };

    const handleUpdateQuantity = (cartId: string, newQuantity: number) => {
      if (newQuantity <= 0) {
        handleRemoveItem(cartId);
      } else {
        setCart((prevCart) =>
          prevCart.map((item) =>
            item.cartId === cartId ? { ...item, quantity: newQuantity } : item
          )
        );
      }
    };

    const handleRemoveItem = (cartId: string) => {
      setCart((prevCart) => prevCart.filter((item) => item.cartId !== cartId));
    };
    
    const handleSelectItem = (item: MenuItem) => {
      if (item.modifierGroupIds && item.modifierGroupIds.length > 0) {
        setSelectedItem(item);
        setIsModifierModalOpen(true);
      } else {
        addToCart(item, []);
      }
    };

    const handleSelectAISuggestion = (itemName: string) => {
        const item = menuItems.find((m: MenuItem) => m.name === itemName);
        if (item) {
            handleSelectItem(item);
        }
    };
    
    const handleCloseModifierModal = () => {
      setIsModifierModalOpen(false);
      setSelectedItem(null);
    }
    
    const handleStartOrder = () => {
        setStep('ordering');
    };

    const handleConfirmOrder = () => {
        setStep('payment');
    };

    const handlePaymentComplete = () => {
        const order = handleKioskOrderPlaced(cart);
        setLastOrder(order);
        setStep('confirmation');
    };
    
    useEffect(() => {
        if (step === 'payment') {
            const timer = setInterval(() => {
                setPaymentStep(prev => {
                    if (prev >= PAYMENT_STEPS.length - 1) {
                        clearInterval(timer);
                        handlePaymentComplete();
                        return prev;
                    }
                    return prev + 1;
                });
            }, 1500);
            return () => clearInterval(timer);
        }
    }, [step]);
    
    useEffect(() => {
        if (step === 'confirmation') {
            const timer = setTimeout(() => {
                setCart([]);
                setLastOrder(null);
                setStep('ordering');
            }, 10000); 
            return () => clearTimeout(timer);
        }
    }, [step]);
    
    const handleOpenPizzaBuilder = (item: MenuItem) => {
        console.warn("Kiosk mode does not support the Pizza Builder. Item:", item.name);
    };

    const handleOpenBurgerBuilder = (item: MenuItem) => {
        console.warn("Kiosk mode does not support the Burger Builder. Item:", item.name);
    };

    const renderWelcomeScreen = () => (
        <div className="flex flex-col items-center justify-center text-center relative w-full h-full">
            <div className="absolute top-8 right-8 z-10">
                <LanguageSwitcher currentLanguage={language} onLanguageChange={setLanguage} />
            </div>
            <img src={ordinoLogoBase64} alt="Logo" className="h-48 w-auto mb-8" />
            <h1 className="text-8xl font-bold text-foreground mb-4">{t('welcome')}</h1>
            <p className="text-3xl text-muted-foreground mb-12">{t('tap_to_start')}</p>
            <button onClick={handleStartOrder} className="w-full h-full absolute inset-0 z-0" aria-label={t('start_order')}></button>
            <div onClick={handleStartOrder} className="bg-primary rounded-full p-12 shadow-2xl shadow-primary/30 animate-pulse">
                <p className="text-primary-foreground font-bold text-4xl">{t('tap_to_start_button')}</p>
            </div>
            <footer className="absolute bottom-8 text-center w-full">
                <p className="text-2xl text-muted-foreground mb-2">Fast • Reliable • Smart POS</p>
            </footer>
        </div>
    );
    
    const renderOrderingScreen = () => (
        <div className="w-full h-full flex gap-8 p-8">
            <div className="flex-grow w-3/5 flex flex-col">
                <CategoryTabs categories={categoriesWithCounts} activeCategory={activeCategory} onSelectCategory={setActiveCategory} />
                <div className="overflow-y-auto flex-grow grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4">
                    {filteredMenuItems.map((item: MenuItem) => {
                        const cartItemsWithThisId = cart.filter(ci => ci.menuItem.id === item.id);
                        const cartQuantity = cartItemsWithThisId.reduce((sum, i) => sum + i.quantity, 0);
                        return (
                            <MenuItemCard 
                                key={item.id} 
                                item={item} 
                                cartQuantity={cartQuantity}
                                onSelectItem={handleSelectItem}
                                isOutOfStock={isOutOfStockMap.get(item.id) || false} 
                                onContextMenu={(e) => e.preventDefault()}
                                onOpenPizzaBuilder={handleOpenPizzaBuilder}
                                onOpenBurgerBuilder={handleOpenBurgerBuilder}
                            />
                        )
                    })}
                </div>
            </div>
            <aside className="w-2/5 bg-card rounded-2xl flex flex-col p-6 shadow-2xl border border-border">
                <h2 className="text-4xl font-bold text-foreground mb-4 border-b border-border pb-4">{t('your_order')}</h2>
                {cart.length === 0 ? (
                    <div className="flex-grow flex flex-col justify-center items-center text-muted-foreground">
                        <p className="text-2xl">{t('cart_empty')}</p>
                        <p className="text-lg">{t('cart_empty_subtitle')}</p>
                    </div>
                ) : (
                    <div className="flex-grow overflow-y-auto divide-y divide-border -mr-2 pr-2">
                        {cart.map(item => <OrderItem key={item.cartId} cartItem={item} onRemoveItem={handleRemoveItem} onUpdateCartQuantity={handleUpdateQuantity} orderType="kiosk" customer={null} onClick={() => {}} />)}
                    </div>
                )}
                 <div className="mt-auto">
                    <div className="pt-4 border-t border-border">
                        <div className="mb-4">
                            <AISuggestions
                                suggestions={aiSuggestions}
                                isLoading={isAISuggesting}
                                onSelectSuggestion={handleSelectAISuggestion}
                                language={language}
                            />
                        </div>
                        <div className="space-y-2 mb-4 text-xl">
                            <div className="flex justify-between text-muted-foreground"><span>{t('subtotal')}</span><span>${subtotal.toFixed(2)}</span></div>
                            <div className="flex justify-between text-muted-foreground"><span>{t('tax')}</span><span>${tax.toFixed(2)}</span></div>
                            <div className="flex justify-between text-foreground font-bold text-3xl mt-2 pt-2 border-t border-border/50"><span>{t('total')}</span><span className="text-primary">${total.toFixed(2)}</span></div>
                        </div>
                        <button 
                            onClick={handleConfirmOrder}
                            disabled={cart.length === 0}
                            className="w-full bg-green-600 text-white py-6 rounded-xl font-bold text-2xl hover:bg-green-500 transition-colors disabled:bg-muted disabled:cursor-not-allowed"
                        >
                            {t('confirm_and_pay')}
                        </button>
                    </div>
                    <footer className="text-center pt-4 mt-2">
                        <img src={ordinoLogoBase64} alt="Logo" className="h-10 w-auto mx-auto mb-1 opacity-80" />
                        <p className="text-lg text-muted-foreground">Fast • Reliable • Smart POS</p>
                    </footer>
                 </div>
            </aside>
        </div>
    );

    const renderPaymentScreen = () => (
         <div className="text-center bg-card/80 backdrop-blur-sm rounded-2xl p-12 shadow-2xl border border-border flex flex-col">
            <div className="flex-grow">
                <h1 className="text-6xl font-bold text-foreground mb-4">{t('finalizing_order')}</h1>
                <p className="text-3xl text-muted-foreground mb-8">{t('tap_card')}</p>
                <div className="inline-block bg-secondary px-12 py-6 rounded-xl">
                    <p className="text-3xl text-muted-foreground">{t('total')}</p>
                    <p className="text-8xl font-bold text-green-500 font-mono">${total.toFixed(2)}</p>
                </div>
                <div className="mt-12 flex justify-center items-center gap-4 text-2xl text-muted-foreground">
                    <svg className="animate-spin h-8 w-8 text-foreground" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>{paymentStep >= PAYMENT_STEPS.length ? 'Success!' : PAYMENT_STEPS[paymentStep]}</span>
                </div>
            </div>
            <footer className="text-center pt-8 mt-8 border-t border-border">
                <img src={ordinoLogoBase64} alt="Logo" className="h-8 w-auto mx-auto mb-2 opacity-70" />
                <p className="text-sm text-muted-foreground">Fast • Reliable • Smart POS</p>
            </footer>
        </div>
    );
    
    const renderConfirmationScreen = () => (
         <div className="text-center flex flex-col items-center justify-center h-full">
            <div className="flex-grow flex flex-col items-center justify-center">
                <CheckCircleIcon className="w-48 h-48 text-green-500 mx-auto mb-8"/>
                <h1 className="text-8xl font-bold text-foreground mb-4">{t('thank_you')}</h1>
                <p className="text-4xl text-muted-foreground mb-2">{t('order_placed')}</p>
                {lastOrder && (
                    <>
                        <p className="text-4xl text-muted-foreground mb-2">{t('your_order_number_is')}</p>
                        <p className="text-9xl font-bold text-primary font-mono mb-12">#{lastOrder.orderNumber}</p>
                    </>
                )}
                <p className="text-4xl text-muted-foreground mb-12">{t('pickup_at_counter')}</p>
            </div>
            <footer className="text-center pt-8 mt-auto w-full">
                <img src={ordinoLogoBase64} alt="Logo" className="h-10 w-auto mx-auto mb-2 opacity-80" />
                <p className="text-lg text-muted-foreground">Fast • Reliable • Smart POS</p>
            </footer>
        </div>
    );

    const renderStep = () => {
        switch(step) {
            case 'welcome': return renderWelcomeScreen();
            case 'ordering': return renderOrderingScreen();
            case 'payment': return renderPaymentScreen();
            case 'confirmation': return renderConfirmationScreen();
            default: return <h1>Something went wrong</h1>
        }
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} className="max-w-full h-full !rounded-none">
            {renderStep()}
             <ModifierModal 
                isOpen={isModifierModalOpen}
                onClose={handleCloseModifierModal}
                item={selectedItem}
                onAddItem={addToCart}
                language={language}
              />
        </Modal>
    );
};
