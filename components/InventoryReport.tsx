



import React, { useState, useMemo, useEffect } from 'react';
import { Ingredient, Order, Supplier, WastageEntry, RecipeItem } from '../types';
import { GoogleGenAI, Type } from "@google/genai";
import ShoppingCartIcon from './icons/ShoppingCartIcon';
import ArchiveBoxXMarkIcon from './icons/ArchiveBoxXMarkIcon';
import BarcodeScannerIcon from './icons/BarcodeScannerIcon';
import ExclamationTriangleIcon from './icons/ExclamationTriangleIcon';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Badge } from './ui/Badge';

// Sub-component for AI Reorder Suggestions
const AIReorderSuggestions: React.FC<{ ingredients: Ingredient[], orders: Order[], suppliers: Supplier[], recipes: Record<number, RecipeItem[]> }> = ({ ingredients, orders, suppliers, recipes }) => {
    const [suggestion, setSuggestion] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const dataSignature = JSON.stringify({ 
        items: (ingredients || []).map(i => ({ id: i.id, stock: i.stock, reorder: i.reorderThreshold })),
        orderCount: (orders || []).length 
    });

    useEffect(() => {
        const lowStockItems = (ingredients || []).filter(item => item.stock <= item.reorderThreshold);
        
        if (lowStockItems.length === 0) {
            setSuggestion("All stock levels are healthy.");
            return;
        }

        const fetchSuggestion = async () => {
            setIsLoading(true);
            setSuggestion(null);
            try {
                if (!process.env.API_KEY) {
                    throw new Error("API Key not found.");
                }
                const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
                const prompt = `
                    Based on the following data, generate a simple, actionable reorder suggestion list for a restaurant manager.
                    - Low Stock Ingredients: ${JSON.stringify(lowStockItems.map(i => ({name: i.name, stock: i.stock, reorder_level: i.reorderThreshold, supplierId: i.supplierId})))}
                    - Suppliers: ${JSON.stringify(suppliers)}
                    - Number of orders in the period: ${(orders || []).length}
                    Generate a brief, bulleted list of ingredients to reorder. For example: '• Mozzarella (Supplier: General Food Supplies Co.): Consider ordering 10kg.'
                `;

                const response = await ai.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: prompt,
                });
                setSuggestion(response.text);
            } catch (error) {
                console.error("AI suggestion failed:", error);
                setSuggestion("Could not generate suggestions at this time.");
            } finally {
                setIsLoading(false);
            }
        };

        const timeoutId = setTimeout(fetchSuggestion, 500);
        return () => clearTimeout(timeoutId);

    }, [dataSignature, suppliers, ingredients, orders]);

    return (
        <div className="bg-primary/10 border-s-4 border-primary rounded-e-lg p-4 mb-6 no-print">
            <h3 className="font-bold text-lg text-primary flex items-center gap-2 mb-2">
                <ShoppingCartIcon className="w-6 h-6" />
                AI Reorder Suggestions
            </h3>
            {isLoading ? (
                <p className="text-muted-foreground animate-pulse">Analyzing stock and sales...</p>
            ) : (
                <p className="text-foreground text-sm whitespace-pre-wrap">{suggestion}</p>
            )}
        </div>
    );
};

// Main Inventory Report Component
const InventoryReport: React.FC<{
    ingredients: Ingredient[];
    orders: Order[];
    recipes: Record<number, RecipeItem[]>;
    suppliers: Supplier[];
    wastageLog: WastageEntry[];
    onRequestLogWaste: () => void;
    onRequestStockCount: () => void;
    startDate: Date;
    endDate: Date;
}> = ({ ingredients, orders, recipes, suppliers, wastageLog, onRequestLogWaste, onRequestStockCount, startDate, endDate }) => {
    const [sortKey, setSortKey] = useState<keyof Ingredient | 'onHandValue'>('stock');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

    const lowStockItemsCount = useMemo(() =>
        (ingredients || []).filter(item => item.stock <= item.reorderThreshold).length
    , [ingredients]);

    const wastageInPeriod = useMemo(() => {
        const start = startDate.getTime();
        const end = endDate.getTime();
        return (wastageLog || []).filter(w => w.date >= start && w.date <= end);
    }, [wastageLog, startDate, endDate]);

    const totalWastageCost = useMemo(() => {
        return wastageInPeriod.reduce((sum, entry) => sum + entry.cost, 0);
    }, [wastageInPeriod]);

    const sortedIngredients = useMemo(() => {
        return [...(ingredients || [])].sort((a, b) => {
            const getVal = (item: Ingredient, key: typeof sortKey) => {
                if (key === 'onHandValue') return item.costPerUnit * item.stock;
                return item[key as keyof Ingredient] as any;
            };
            const valA = getVal(a, sortKey);
            const valB = getVal(b, sortKey);

            if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
            if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        });
    }, [ingredients, sortKey, sortDirection]);

    const handleSort = (key: keyof Ingredient | 'onHandValue') => {
        if (sortKey === key) {
            setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
        } else {
            setSortKey(key);
            setSortDirection(key === 'stock' ? 'asc' : 'desc');
        }
    };

    const getStockStatus = (item: Ingredient): { text: string; variant: "default" | "destructive" | "secondary" } => {
        if (item.stock <= 0) return { text: 'Out of Stock', variant: 'destructive' };
        if (item.stock <= item.reorderThreshold) return { text: 'Low Stock', variant: 'secondary' };
        return { text: 'In Stock', variant: 'default' };
    };

    const thClass = "px-4 py-3 text-start text-xs font-semibold text-muted-foreground uppercase tracking-wider cursor-pointer";
    const SortIndicator = ({ for_key }: { for_key: typeof sortKey }) => {
        if (sortKey !== for_key) return <span className="text-muted-foreground/50">↕</span>;
        return sortDirection === 'desc' ? '▼' : '▲';
    };

    return (
        <div className="w-full space-y-8">
            {lowStockItemsCount > 0 && (
                <div className="bg-red-100 dark:bg-red-900/40 border-s-4 border-red-500 text-red-800 dark:text-red-200 p-4 rounded-md" role="alert">
                    <div className="flex">
                        <div className="py-1">
                            <ExclamationTriangleIcon className="h-6 w-6 text-red-500 me-4" />
                        </div>
                        <div>
                            <p className="font-bold">Action Required</p>
                            <p className="text-sm">
                                {lowStockItemsCount} ingredient(s) are at or below their reorder threshold. Use the AI suggestions below or create a purchase order.
                            </p>
                        </div>
                    </div>
                </div>
            )}
            <div className="flex justify-between items-center">
                 <h2 className="text-2xl font-bold text-foreground">Inventory Report</h2>
                 <div className="flex gap-2">
                    <button 
                        onClick={onRequestStockCount}
                        className="flex items-center gap-2 bg-secondary hover:bg-muted text-secondary-foreground font-bold py-2 px-4 rounded-lg transition-colors no-print"
                    >
                        <BarcodeScannerIcon className="w-5 h-5" />
                        Stock Count
                    </button>
                    <button 
                        onClick={onRequestLogWaste}
                        className="flex items-center gap-2 bg-destructive/80 hover:bg-destructive text-destructive-foreground font-bold py-2 px-4 rounded-lg transition-colors no-print"
                    >
                        <ArchiveBoxXMarkIcon className="w-5 h-5" />
                        Log Waste
                    </button>
                 </div>
            </div>
            
            <AIReorderSuggestions ingredients={ingredients} orders={orders} suppliers={suppliers} recipes={recipes} />
            
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><ArchiveBoxXMarkIcon className="w-6 h-6 text-destructive" /> Wastage Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-foreground">Total wastage cost for period: <span className="font-bold text-destructive">${totalWastageCost.toFixed(2)}</span></p>
                </CardContent>
            </Card>

            <div>
                 <h3 className="text-xl font-bold text-foreground mb-4">Current Stock Levels</h3>
                <div className="overflow-x-auto bg-card rounded-lg border border-border">
                    <table className="min-w-full divide-y divide-border">
                        <thead className="bg-muted/50">
                            <tr>
                                <th className={thClass} onClick={() => handleSort('name')}>Ingredient <SortIndicator for_key="name" /></th>
                                <th className="px-4 py-3 text-start text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                                <th className={thClass} onClick={() => handleSort('stock')}>Stock <SortIndicator for_key="stock" /></th>
                                <th className={thClass} onClick={() => handleSort('costPerUnit')}>Unit Cost <SortIndicator for_key="costPerUnit" /></th>
                                <th className={thClass} onClick={() => handleSort('onHandValue')}>On-Hand Value <SortIndicator for_key="onHandValue" /></th>
                            </tr>
                        </thead>
                        <tbody className="bg-card divide-y divide-border">
                            {sortedIngredients.map(item => {
                                const status = getStockStatus(item);
                                const onHandValue = (item.costPerUnit || 0) * item.stock;
                                return (
                                    <tr key={item.id} className="hover:bg-muted/50">
                                        <td className="px-4 py-3 text-foreground font-medium">{item.name}</td>
                                        <td className="px-4 py-3"><Badge variant={status.variant}>{status.text}</Badge></td>
                                        <td className="px-4 py-3 font-mono text-muted-foreground">{item.stock} {item.unit}</td>
                                        <td className="px-4 py-3 font-mono text-muted-foreground">${(item.costPerUnit || 0).toFixed(4)} / {item.unit}</td>
                                        <td className="px-4 py-3 font-mono font-semibold text-green-600 dark:text-green-500">${onHandValue.toFixed(2)}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default InventoryReport;