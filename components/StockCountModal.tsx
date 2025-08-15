
import React, { useState, useEffect, useRef } from 'react';
import { Ingredient } from '../types';
import BarcodeScannerIcon from './icons/BarcodeScannerIcon';

interface StockCountModalProps {
    isOpen: boolean;
    onClose: () => void;
    ingredients: Ingredient[];
    onUpdateStock: (ingredientId: string, newCount: number) => void;
}

const StockCountModal: React.FC<StockCountModalProps> = ({ isOpen, onClose, ingredients, onUpdateStock }) => {
    const [scannedItem, setScannedItem] = useState<Ingredient | null>(null);
    const [newCount, setNewCount] = useState('');
    const [message, setMessage] = useState({ text: '', type: 'info' });
    const countInputRef = useRef<HTMLInputElement>(null);
    const [selectedIngredientId, setSelectedIngredientId] = useState('');

    useEffect(() => {
        if(scannedItem) {
            setTimeout(() => countInputRef.current?.select(), 100);
        }
    }, [scannedItem]);

    if (!isOpen) return null;
    
    const showTemporaryMessage = (text: string, type: 'info' | 'error' | 'success') => {
        setMessage({ text, type });
        setTimeout(() => setMessage({ text: '', type: 'info' }), 3000);
    };

    const handleSelectIngredient = (id: string) => {
        const item = (ingredients || []).find(i => i.id === id);
        if (item) {
            setScannedItem(item);
            setNewCount(String(item.stock));
            setMessage({ text: '', type: 'info' });
        }
        setSelectedIngredientId(id);
    }
    
    const handleUpdate = () => {
        if (scannedItem && newCount.trim() !== '') {
            const count = parseFloat(newCount);
            if (!isNaN(count)) {
                onUpdateStock(scannedItem.id, count);
                showTemporaryMessage(`${scannedItem.name} stock updated to ${count}.`, 'success');
                resetForNextScan();
            }
        }
    };

    const resetForNextScan = () => {
        setScannedItem(null);
        setNewCount('');
        setSelectedIngredientId('');
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4">
            <div className="bg-card rounded-lg shadow-xl w-full max-w-md border border-border">
                <div className="p-6 border-b border-border">
                    <h2 className="text-2xl font-bold text-foreground">Stock Count</h2>
                    <p className="text-muted-foreground">Manually update inventory levels for your ingredients.</p>
                </div>
                <div className="p-6 space-y-4">
                    <div>
                        <label htmlFor="ingredient-select" className="block text-sm font-medium text-muted-foreground mb-1">Select Ingredient</label>
                         <select
                            id="ingredient-select"
                            value={selectedIngredientId}
                            onChange={e => handleSelectIngredient(e.target.value)}
                            className="w-full bg-input border border-border rounded-md px-3 py-2 text-foreground"
                        >
                            <option value="">Choose an ingredient...</option>
                            {(ingredients || []).map(ing => <option key={ing.id} value={ing.id}>{ing.name}</option>)}
                        </select>
                    </div>

                    {scannedItem && (
                        <div className="bg-secondary p-4 rounded-lg space-y-3 animate-fade-in">
                            <h3 className="font-bold text-lg text-foreground">{scannedItem.name}</h3>
                            <p className="text-sm text-muted-foreground">Current Stock: {scannedItem.stock} {scannedItem.unit}</p>
                            <div>
                                <label htmlFor="new-stock-count" className="block text-sm font-medium text-muted-foreground mb-1">New Physical Count</label>
                                <input
                                    ref={countInputRef}
                                    id="new-stock-count"
                                    type="number"
                                    value={newCount}
                                    onChange={(e) => setNewCount(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleUpdate()}
                                    className="w-full bg-input border border-border rounded-md px-3 py-2 text-foreground text-xl"
                                />
                            </div>
                            <div className="flex gap-2">
                                <button onClick={resetForNextScan} className="flex-1 px-4 py-2 rounded-md bg-muted text-muted-foreground font-semibold hover:bg-accent">Cancel</button>
                                <button onClick={handleUpdate} className="flex-1 px-4 py-2 rounded-md bg-primary text-primary-foreground font-semibold hover:bg-primary/90">Update Stock</button>
                            </div>
                        </div>
                    )}
                    
                    <div className="h-5 text-center text-sm">
                        {message.text && <span className={`${message.type === 'error' ? 'text-red-400' : 'text-green-400'}`}>{message.text}</span>}
                    </div>

                </div>
                <div className="p-4 border-t border-border">
                    <button onClick={onClose} className="w-full py-2 rounded-md text-muted-foreground font-semibold hover:bg-secondary">Close</button>
                </div>
            </div>
             <style>{`
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
            `}</style>
        </div>
    );
};

export default StockCountModal;
