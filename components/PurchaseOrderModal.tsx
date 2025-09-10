import React, { useState, useEffect, useMemo } from 'react';
import { PurchaseOrder, PurchaseOrderItem, Supplier, Ingredient } from '../types';
import TrashIcon from './icons/TrashIcon';
import { useDataContext } from '../contexts/AppContext';

interface PurchaseOrderModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (po: PurchaseOrder) => void;
    po: PurchaseOrder | null;
}

const PurchaseOrderModal: React.FC<PurchaseOrderModalProps> = ({ isOpen, onClose, onSave, po }) => {
    const { suppliers, ingredients } = useDataContext();
    const [supplierId, setSupplierId] = useState('');
    const [items, setItems] = useState<PurchaseOrderItem[]>([]);
    const [status, setStatus] = useState<PurchaseOrder['status']>('draft');

    useEffect(() => {
        if (po) {
            setSupplierId(po.supplierId);
            setItems(po.items);
            setStatus(po.status);
        } else {
            setSupplierId((suppliers || [])[0]?.id || '');
            setItems([]);
            setStatus('draft');
        }
    }, [po, suppliers, isOpen]);

    const totalCost = useMemo(() => {
        return items.reduce((sum, item) => {
            const ingredient = (ingredients || []).find((i: Ingredient) => i.id === item.ingredientId);
            const cost = ingredient?.costPerUnit || item.costPerItem; // Use current ingredient cost if available
            return sum + cost * item.quantity;
        }, 0);
    }, [items, ingredients]);

    if (!isOpen) return null;

    const handleAddItem = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const ingredientId = e.target.value;
        if (!ingredientId) return;

        const ingredient = (ingredients || []).find((i: Ingredient) => i.id === ingredientId);
        if (ingredient && !items.some(i => i.ingredientId === ingredientId)) {
            const newItem: PurchaseOrderItem = {
                ingredientId,
                quantity: 1,
                costPerItem: ingredient.costPerUnit,
            };
            setItems(prev => [...prev, newItem]);
        }
        e.target.value = ''; // Reset dropdown
    };
    
    const handleUpdateItem = (ingredientId: string, field: 'quantity' | 'costPerItem', value: number) => {
        setItems(prev => prev.map(item => 
            item.ingredientId === ingredientId 
                ? { ...item, [field]: Math.max(field === 'quantity' ? 1 : 0, value) } 
                : item
        ));
    };

    const handleRemoveItem = (ingredientId: string) => {
        setItems(prev => prev.filter(item => item.ingredientId !== ingredientId));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!supplierId) {
            alert("Please select a supplier.");
            return;
        }

        const newPO: PurchaseOrder = {
            id: po?.id || `po_${Date.now()}`,
            supplierId,
            items,
            status: po ? status : 'draft',
            totalCost,
            createdAt: po?.createdAt || Date.now(),
            locationId: '', // Should be set in context by the handler
        };
        onSave(newPO);
    };
    
    const isFulfilled = status === 'fulfilled';

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4">
            <div className="bg-card rounded-lg shadow-xl w-full max-w-3xl border border-border flex flex-col max-h-[90vh]">
                <form onSubmit={handleSubmit} className="flex flex-col h-full">
                    <div className="p-6 border-b border-border">
                        <h2 className="text-2xl font-bold text-foreground">{po ? `Purchase Order #${po.id.slice(-6)}` : 'New Purchase Order'}</h2>
                    </div>
                    <div className="p-6 space-y-4 flex-grow overflow-y-auto">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-muted-foreground mb-1">Supplier</label>
                                <select value={supplierId} onChange={e => setSupplierId(e.target.value)} className="w-full bg-input p-2 rounded-md border border-border" disabled={isFulfilled}>
                                    {(suppliers || []).map((s: Supplier) => <option key={s.id} value={s.id}>{s.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-muted-foreground mb-1">Status</label>
                                <select value={status} onChange={e => setStatus(e.target.value as any)} className="w-full bg-input p-2 rounded-md border border-border">
                                    <option value="draft">Draft</option>
                                    <option value="sent">Sent</option>
                                    <option value="fulfilled">Fulfilled</option>
                                </select>
                            </div>
                        </div>
                        
                        <div className="pt-4">
                             <label className="block text-sm font-medium text-muted-foreground mb-2">Items</label>
                            <div className="space-y-2">
                                {items.map(item => {
                                    const ingredient = (ingredients || []).find((i: Ingredient) => i.id === item.ingredientId);
                                    return (
                                        <div key={item.ingredientId} className="grid grid-cols-12 items-center gap-2 bg-secondary p-2 rounded-md">
                                            <span className="col-span-5 text-foreground">{ingredient?.name}</span>
                                            <input type="number" value={item.quantity} onChange={e => handleUpdateItem(item.ingredientId, 'quantity', parseFloat(e.target.value))} className="col-span-2 bg-input p-1 rounded text-right border border-border" disabled={isFulfilled}/>
                                            <span className="col-span-1 text-center text-muted-foreground">x</span>
                                            <input type="number" step="0.01" value={item.costPerItem} onChange={e => handleUpdateItem(item.ingredientId, 'costPerItem', parseFloat(e.target.value))} className="col-span-3 bg-input p-1 rounded text-right border border-border" disabled={isFulfilled}/>
                                            <button type="button" onClick={() => handleRemoveItem(item.ingredientId)} className="col-span-1 text-destructive" disabled={isFulfilled}><TrashIcon className="w-5 h-5"/></button>
                                        </div>
                                    )
                                })}
                            </div>
                            {!isFulfilled && (
                                <select onChange={handleAddItem} className="mt-2 w-full bg-input p-2 rounded-md border border-border">
                                    <option value="">-- Add an ingredient --</option>
                                    {(ingredients || []).filter((i: Ingredient) => !items.some(pi => pi.ingredientId === i.id)).map((i: Ingredient) => <option key={i.id} value={i.id}>{i.name}</option>)}
                                </select>
                            )}
                        </div>
                    </div>
                    <div className="p-6 border-t border-border mt-auto flex justify-between items-center bg-muted/50 rounded-b-lg">
                        <div>
                            <span className="text-muted-foreground">Total Cost:</span>
                            <p className="text-2xl font-bold text-green-600">${totalCost.toFixed(2)}</p>
                        </div>
                        <div className="flex gap-4">
                            <button type="button" onClick={onClose} className="px-6 py-2 rounded-md bg-secondary text-secondary-foreground font-semibold hover:bg-muted">Cancel</button>
                            <button type="submit" className="px-6 py-2 rounded-md bg-primary text-primary-foreground font-semibold hover:bg-primary/90">Save PO</button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PurchaseOrderModal;