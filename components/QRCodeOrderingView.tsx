

import React, { useState, useEffect, useMemo } from 'react';
import { MenuItem, Category, CartItem, ModifierOption, Order, Language, Location, Table } from '../types';
import { useTranslations } from '../hooks/useTranslations';
import CheckCircleIcon from './icons/CheckCircleIcon';
import PlusIcon from './icons/PlusIcon';
import MinusIcon from './icons/MinusIcon';
import TrashIcon from './icons/TrashIcon';

const channel = new BroadcastChannel('ordino_pos_sync');

const QRCodeOrderingView: React.FC = () => {
    const [step, setStep] = useState<'loading' | 'ordering' | 'checkout' | 'confirmation'>('loading');
    const [cart, setCart] = useState<CartItem[]>([]);
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [location, setLocation] = useState<Location | null>(null);
    const [table, setTable] = useState<Table | null>(null);
    const [customerDetails, setCustomerDetails] = useState({ name: '', phone: '' });
    const [lastOrderNumber, setLastOrderNumber] = useState<string | null>(null);


    const { tableId, locationId } = useMemo(() => {
        const hash = window.location.hash; // e.g., #/qr_ordering?table=t1&location=loc_1
        const searchPart = hash.split('?')[1] || '';
        const params = new URLSearchParams(searchPart);
        return {
            tableId: params.get('table'),
            locationId: params.get('location'),
        };
    }, []);

    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            try {
                if (event.data.type === 'STATE_SYNC') {
                    const { payload } = event.data;
                    if (payload.allMenuItems && payload.allLocations && payload.allTables) {
                        const currentLocation = payload.allLocations.find((l: Location) => l.id === locationId);
                        const currentTable = payload.allTables.find((t: Table) => t.id === tableId);
                        
                        setMenuItems(payload.allMenuItems.filter((item: MenuItem) => item.locationIds.includes(locationId) && item.isActive !== false));
                        setLocation(currentLocation);
                        setTable(currentTable);
                        setStep('ordering');
                    }
                } else if (event.data.type === 'QR_ORDER_CONFIRMED') {
                    setLastOrderNumber(event.data.payload.orderNumber);
                }
            } catch (e) {
                console.error("QR Ordering view failed to handle message", e);
            }
        };
        channel.addEventListener('message', handleMessage);
        channel.postMessage({ type: 'REQUEST_STATE' });
        
        return () => channel.removeEventListener('message', handleMessage);
    }, [tableId, locationId]);

    const addToCart = (item: MenuItem, quantity = 1) => {
        setCart(prev => {
            const existingItem = prev.find(ci => ci.menuItem.id === item.id);
            if (existingItem) {
                return prev.map(ci => ci.menuItem.id === item.id ? { ...ci, quantity: ci.quantity + quantity } : ci);
            }
            const newItem: CartItem = {
                cartId: `${Date.now()}`,
                menuItem: item,
                quantity,
                selectedModifiers: []
            };
            return [...prev, newItem];
        });
    };
    
    const updateQuantity = (cartId: string, newQuantity: number) => {
        setCart(prev => {
            if (newQuantity <= 0) {
                return prev.filter(item => item.cartId !== cartId);
            }
            return prev.map(item => item.cartId === cartId ? { ...item, quantity: newQuantity } : item);
        });
    };

    const handlePlaceOrder = () => {
        if (!customerDetails.name || !customerDetails.phone) {
            alert('Please enter your name and phone number.');
            return;
        }
        channel.postMessage({
            type: 'QR_ORDER_PLACED',
            payload: {
                cart,
                customer: customerDetails,
                tableId,
                locationId
            }
        });
        setStep('confirmation');
    };

    const { subtotal, tax, total } = useMemo(() => {
        const sub = cart.reduce((acc, item) => acc + item.menuItem.price * item.quantity, 0);
        const taxRate = location?.taxRates?.Standard || 0.1;
        const taxAmount = sub * taxRate;
        return { subtotal: sub, tax: taxAmount, total: sub + taxAmount };
    }, [cart, location]);
    
    if (step === 'loading' || !location || !table) {
        return <div className="w-screen h-screen bg-gray-50 flex items-center justify-center"><p className="text-gray-600 animate-pulse text-lg">Connecting to restaurant...</p></div>;
    }

    if (step === 'confirmation') {
        return (
            <div className="w-screen h-screen bg-white flex flex-col items-center justify-center p-8 text-center">
                <CheckCircleIcon className="w-24 h-24 text-green-500 mb-4" />
                <h1 className="text-4xl font-bold text-gray-800">Thank You, {customerDetails.name}!</h1>
                <p className="text-xl text-gray-600 mt-2">Your order for Table {table.name} has been sent to the kitchen.</p>
                {lastOrderNumber && <p className="text-lg text-gray-500 mt-1">Order #{lastOrderNumber}</p>}
                <p className="mt-8 text-gray-500">Your server will be with you shortly.</p>
            </div>
        );
    }

    const categories = [...new Set(menuItems.map(item => item.category))];
    
    return (
        <div className="bg-gray-50 min-h-screen font-sans text-gray-800">
            <header className="bg-white shadow-sm p-4 sticky top-0 z-20">
                <h1 className="text-xl font-bold text-center">{location.name}</h1>
                <p className="text-center text-gray-500 text-sm">Ordering for Table {table.name}</p>
            </header>
            
            <main className="p-4 pb-56">
                {step === 'ordering' && (
                    <div className="space-y-6">
                        {categories.map(category => (
                            <div key={category}>
                                <h2 className="text-2xl font-bold capitalize mb-3">{category}</h2>
                                <div className="grid grid-cols-1 gap-3">
                                    {menuItems.filter(item => item.category === category).map(item => (
                                        <div key={item.id} className="bg-white p-3 rounded-xl shadow-md flex items-center gap-4">
                                            <img src={item.imageUrl} alt={item.name} className="w-24 h-24 rounded-lg object-cover"/>
                                            <div className="flex-grow">
                                                <h3 className="font-bold text-lg">{item.name}</h3>
                                                <p className="text-gray-600 font-semibold">${item.price.toFixed(2)}</p>
                                            </div>
                                            <button onClick={() => addToCart(item)} className="bg-blue-500 text-white rounded-full p-3 hover:bg-blue-600 transition-colors">
                                                <PlusIcon className="w-6 h-6"/>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                {step === 'checkout' && (
                    <div className="space-y-4 max-w-lg mx-auto bg-white p-6 rounded-2xl shadow-lg">
                        <h2 className="text-3xl font-bold text-gray-800 border-b pb-3 mb-4">Review Your Order</h2>
                        {cart.map(item => (
                            <div key={item.cartId} className="flex items-center gap-4">
                                <div className="flex-grow">
                                    <p className="font-semibold">{item.menuItem.name}</p>
                                    <p className="text-sm text-gray-500">${item.menuItem.price.toFixed(2)}</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <button onClick={() => updateQuantity(item.cartId, item.quantity - 1)} className="p-1 rounded-full bg-gray-200 text-gray-600"><MinusIcon className="w-4 h-4"/></button>
                                    <span className="font-bold w-5 text-center">{item.quantity}</span>
                                     <button onClick={() => updateQuantity(item.cartId, item.quantity + 1)} className="p-1 rounded-full bg-gray-200 text-gray-600"><PlusIcon className="w-4 h-4"/></button>
                                </div>
                                <p className="font-bold w-16 text-right">${(item.menuItem.price * item.quantity).toFixed(2)}</p>
                            </div>
                        ))}
                        <div className="space-y-4 pt-6 border-t mt-6">
                            <h3 className="text-xl font-semibold">Your Details</h3>
                            <input type="text" placeholder="Your Name" value={customerDetails.name} onChange={e => setCustomerDetails(p=>({...p, name: e.target.value}))} className="w-full border-gray-300 border p-3 rounded-lg text-lg" required />
                            <input type="tel" placeholder="Phone Number" value={customerDetails.phone} onChange={e => setCustomerDetails(p=>({...p, phone: e.target.value}))} className="w-full border-gray-300 border p-3 rounded-lg text-lg" required />
                        </div>
                    </div>
                )}
            </main>

            <footer className="bg-white p-4 shadow-top fixed bottom-0 left-0 right-0 z-20">
                <div className="max-w-lg mx-auto">
                    {step === 'checkout' && (
                        <div className="space-y-1 text-gray-600 mb-3">
                            <div className="flex justify-between"><span>Subtotal</span><span className="font-mono">${subtotal.toFixed(2)}</span></div>
                            <div className="flex justify-between"><span>Tax</span><span className="font-mono">${tax.toFixed(2)}</span></div>
                            <div className="flex justify-between text-xl font-bold text-gray-800 pt-1 border-t"><span>Total</span><span className="font-mono">${total.toFixed(2)}</span></div>
                        </div>
                    )}
                    {step === 'ordering' && (
                        <button onClick={() => setStep('checkout')} disabled={cart.length === 0} className="w-full bg-green-500 text-white font-bold py-4 rounded-xl text-lg disabled:bg-gray-300 transition-colors flex items-center justify-between px-6">
                            <span>View Cart</span>
                            <span className="bg-green-700 text-white rounded-full px-3 py-1 text-sm">{cart.reduce((sum, item) => sum + item.quantity, 0)} items</span>
                        </button>
                    )}
                    {step === 'checkout' && (
                         <button onClick={handlePlaceOrder} className="w-full bg-green-500 text-white font-bold py-4 rounded-xl text-lg transition-colors">Pay & Place Order</button>
                    )}
                </div>
            </footer>
            <style>{`.shadow-top { box-shadow: 0 -4px 12px -1px rgb(0 0 0 / 0.07); }`}</style>
        </div>
    );
};

export default QRCodeOrderingView;
