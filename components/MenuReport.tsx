

import React, { useState, useMemo } from 'react';
import { Order, MenuItem, Location, Ingredient, RecipeItem, AISettings } from '../types';
import AIReportSummary from './AIReportSummary';
import { calculateMenuItemCost } from '../utils/calculations';
import { useAppContext } from '../contexts/AppContext';

interface MenuReportProps {
    orders: Order[];
    menuItems: MenuItem[];
    ingredients: Ingredient[];
    recipes: Record<number, RecipeItem[]>;
    filterCategoryId?: string;
    locations: Location[];
    currentLocationId: string;
    aiSettings: AISettings;
}

interface ReportItem {
    id: number;
    name: string;
    category: string;
    quantitySold: number;
    revenue: number;
    cost: number;
    profit: number;
    locationIds: string[];
}

type SortKey = 'name' | 'quantitySold' | 'revenue' | 'profit';
type SortDirection = 'asc' | 'desc';

const MenuReport: React.FC<MenuReportProps> = ({ orders, menuItems, ingredients, recipes, filterCategoryId, locations, currentLocationId, aiSettings }) => {
    const [sortKey, setSortKey] = useState<SortKey>('revenue');
    const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
    const { isAdvancedInventoryPluginActive } = useAppContext();

    const reportData = useMemo<ReportItem[]>(() => {
        const itemMap = new Map<number, ReportItem>();
        const validOrders = (orders || []).filter(o => o.status !== 'refunded');

        const relevantMenuItems = filterCategoryId
            ? (menuItems || []).filter(item => item.category === filterCategoryId)
            : (menuItems || []);

        relevantMenuItems.forEach(item => {
            itemMap.set(item.id, {
                id: item.id,
                name: item.name,
                category: item.category,
                quantitySold: 0,
                revenue: 0,
                cost: 0,
                profit: 0,
                locationIds: item.locationIds
            });
        });

        validOrders.forEach(order => {
            order.cart.forEach(cartItem => {
                const item = itemMap.get(cartItem.menuItem.id);
                if (item) {
                    const modifiersTotal = cartItem.selectedModifiers.reduce((acc, mod) => acc + mod.price, 0);
                    const itemRevenue = (cartItem.menuItem.price + modifiersTotal) * cartItem.quantity;
                    const itemCost = calculateMenuItemCost(cartItem.menuItem.id, ingredients, recipes) * cartItem.quantity;
                    
                    item.quantitySold += cartItem.quantity;
                    item.revenue += itemRevenue;
                    item.cost += itemCost;
                    item.profit += itemRevenue - itemCost;
                }
            });
        });
        
        return Array.from(itemMap.values());
    }, [orders, menuItems, filterCategoryId, ingredients, recipes]);

    const sortedData = useMemo(() => {
        return [...reportData].sort((a, b) => {
            if (a[sortKey] < b[sortKey]) {
                return sortDirection === 'asc' ? -1 : 1;
            }
            if (a[sortKey] > b[sortKey]) {
                return sortDirection === 'asc' ? 1 : -1;
            }
            return 0;
        });
    }, [reportData, sortKey, sortDirection]);

    const handleSort = (key: SortKey) => {
        if (sortKey === key) {
            setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
        } else {
            setSortKey(key);
            setSortDirection('desc');
        }
    };
    
    const SortIndicator = ({ for_key }: { for_key: SortKey }) => {
        if (sortKey !== for_key) return <span className="text-muted-foreground/50">↕</span>;
        return sortDirection === 'desc' ? '▼' : '▲';
    };
    
    const thClass = "px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider cursor-pointer";

    return (
        <div className="w-full">
            <h2 className="text-2xl font-bold text-foreground mb-4">Menu Performance Analysis</h2>
            <AIReportSummary reportData={sortedData} isEnabled={aiSettings.enableAIFeatures && aiSettings.enableReportAnalysis} />
            <div className="overflow-x-auto bg-card rounded-lg border border-border">
                <table className="min-w-full divide-y divide-border">
                    <thead className="bg-muted/50">
                        <tr>
                            <th className={thClass} onClick={() => handleSort('name')}>
                                Item <SortIndicator for_key="name" />
                            </th>
                            <th className={thClass} onClick={() => handleSort('quantitySold')}>
                                Qty Sold <SortIndicator for_key="quantitySold" />
                            </th>
                             <th className={thClass} onClick={() => handleSort('revenue')}>
                                Revenue <SortIndicator for_key="revenue" />
                            </th>
                            {isAdvancedInventoryPluginActive && <th className={thClass}>COGS</th>}
                            {isAdvancedInventoryPluginActive && <th className={thClass} onClick={() => handleSort('profit')}>
                                Profit <SortIndicator for_key="profit" />
                            </th>}
                        </tr>
                    </thead>
                    <tbody className="bg-card divide-y divide-border">
                        {sortedData.map(item => (
                            <tr key={item.id} className="hover:bg-muted/50 transition-colors">
                                <td className="px-4 py-3 whitespace-nowrap text-foreground font-medium">{item.name}</td>
                                <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">{item.quantitySold}</td>
                                <td className="px-4 py-3 whitespace-nowrap text-foreground">${item.revenue.toFixed(2)}</td>
                                {isAdvancedInventoryPluginActive && <td className="px-4 py-3 whitespace-nowrap text-foreground">${item.cost.toFixed(2)}</td>}
                                {isAdvancedInventoryPluginActive && <td className="px-4 py-3 whitespace-nowrap font-semibold text-green-600 dark:text-green-500">${item.profit.toFixed(2)}</td>}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default MenuReport;