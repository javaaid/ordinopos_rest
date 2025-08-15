
import React, { useState } from 'react';
import { Customer, CartItem, MenuItem, Subscription } from '../types';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (subscription: Omit<Subscription, 'id' | 'locationId' | 'status'>) => void;
  customer: Customer;
  menuItems: MenuItem[];
}

const SubscriptionModal: React.FC<SubscriptionModalProps> = ({ isOpen, onClose, onSave, customer, menuItems }) => {
    const [cart, setCart] = useState<CartItem[]>([]);
    const [frequency, setFrequency] = useState<'weekly' | 'monthly'>('weekly');
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);

    if (!isOpen) return null;

    const handleAddItem = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const itemId = parseInt(e.target.value, 10);
        if (!itemId) return;
        const menuItem = menuItems.find(mi => mi.id === itemId);
        if (menuItem && !cart.some(ci => ci.menuItem.id === itemId)) {
            const newCartItem: CartItem = {
                cartId: `sub-${Date.now()}`,
                menuItem,
                quantity: 1,
                selectedModifiers: [],
            };
            setCart(prev => [...prev, newCartItem]);
        }
        e.target.value = '';
    };
    
    const handleRemoveItem = (cartId: string) => {
        setCart(prev => prev.filter(item => item.cartId !== cartId));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (cart.length === 0) {
            alert("Please add at least one item to the subscription.");
            return;
        }
        onSave({
            customerId: customer.id,
            cart,
            frequency,
            startDate: new Date(startDate).getTime(),
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4">
            <div className="bg-card rounded-lg shadow-xl w-full max-w-lg border border-border">
                <form onSubmit={handleSubmit}>
                    <div className="p-6 border-b border-border">
                        <h2 className="text-2xl font-bold text-foreground">New Recurring Subscription</h2>
                        <p className="text-muted-foreground">For: {customer.name}</p>
                    </div>
                    <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                        <div>
                            <label className="block text-sm font-medium text-muted-foreground mb-1">Items in Subscription</label>
                            <div className="space-y-2 mb-2">
                                {cart.map(item => (
                                    <div key={item.cartId} className="flex justify-between items-center bg-secondary p-2 rounded-md">
                                        <span className="text-foreground">{item.quantity}x {item.menuItem.name}</span>
                                        <button type="button" onClick={() => handleRemoveItem(item.cartId)} className="text-destructive hover:opacity-80">Remove</button>
                                    </div>
                                ))}
                            </div>
                            <select onChange={handleAddItem} className="w-full bg-input border border-border rounded-md px-3 py-2 text-foreground">
                                <option value="">Add an item...</option>
                                {menuItems.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}
                            </select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                             <div>
                                <label className="block text-sm font-medium text-muted-foreground mb-1">Frequency</label>
                                <select value={frequency} onChange={e => setFrequency(e.target.value as any)} className="w-full bg-input border border-border rounded-md px-3 py-2 text-foreground">
                                    <option value="weekly">Weekly</option>
                                    <option value="monthly">Monthly</option>
                                </select>
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-muted-foreground mb-1">Start Date</label>
                                <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full bg-input border border-border rounded-md px-3 py-2 text-foreground"/>
                            </div>
                        </div>
                        <div className="bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 text-sm p-3 rounded-md">
                            <strong>Simulation Note:</strong> This will create a subscription plan. In a real application, a backend service would automatically process payments and create orders based on this schedule.
                        </div>
                    </div>
                    <div className="p-6 border-t border-border flex justify-end items-center space-x-4">
                        <button type="button" onClick={onClose} className="px-6 py-2 rounded-md bg-secondary text-secondary-foreground font-semibold hover:bg-muted">Cancel</button>
                        <button type="submit" className="px-6 py-2 rounded-md bg-primary text-primary-foreground font-semibold hover:bg-primary/90">Save Subscription</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SubscriptionModal;