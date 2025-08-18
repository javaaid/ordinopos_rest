

import React, { useState, useMemo } from 'react';
import { Order, Category, Ingredient, RecipeItem } from '../types';
import { useAppContext } from '../contexts/AppContext';

interface CategoryReportProps {
    orders: Order[];
    categories: Category[];
    ingredients: Ingredient[];
    recipes: Record<number, RecipeItem[]>;
    filterCategoryId?: string;
}

interface ReportItem {
    id: string;
    name: string;
    quantitySold: number;
    revenue: number;
    cost: number;
    profit: number;
}

type SortKey = 'name' | 'quantitySold' | 'revenue' | 'profit';
type SortDirection = 'asc' | 'desc';

const CategoryReport: React.FC<CategoryReportProps> = ({ orders, categories, ingredients, recipes, filterCategoryId }) => {
    const [sortKey, setSortKey] = useState<SortKey>('revenue');
    const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
    const { isAdvancedInventoryPluginActive } = useAppContext();

    const calculateMenuItemCost = (menuItemId: number): number => {
        const recipe = recipes[menuItemId];
        if (!recipe) return 0;
        return recipe.reduce((totalCost, recipeItem) => {
          const ingredient = ingredients.find(i => i.id === recipeItem.ingredientId);
          return totalCost + (ingredient ? ingredient.costPerUnit * recipeItem.quantity : 0);
        }, 0);
    };

    const { reportData, totalRevenue } = useMemo(() => {
        const categoryMap = new Map<string, ReportItem>();

        const relevantCategories = filterCategoryId
            ? (categories || []).filter(c => c.id === filterCategoryId)
            : (categories || []);

        relevantCategories.forEach(cat => {
            categoryMap.set(cat.id, {
                id: cat.id,
                name: cat.name,
                quantitySold: 0,
                revenue: 0,
                cost: 0,
                profit: 0
            });
        });
        
        let runningTotalRevenue = 0;

        (orders || []).forEach(order => {
            runningTotalRevenue += order.total;
            order.cart.forEach(cartItem => {
                const categoryId = cartItem.menuItem.category;
                const item = categoryMap.get(categoryId);
                if (item) {
                    const modifiersTotal = cartItem.selectedModifiers.reduce((acc, mod) => acc + mod.price, 0);
                    const itemRevenue = (cartItem.menuItem.price + modifiersTotal) * cartItem.quantity;
                    const itemCost = calculateMenuItemCost(cartItem.menuItem.id) * cartItem.quantity;

                    item.quantitySold += cartItem.quantity;
                    item.revenue += itemRevenue;
                    item.cost += itemCost;
                    item.profit += itemRevenue - itemCost;
                }
            });
        });
        
        return { reportData: Array.from(categoryMap.values()), totalRevenue: runningTotalRevenue };
    }, [orders, categories, filterCategoryId, ingredients, recipes]);

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
            <h2 className="text-2xl font-bold text-foreground mb-4">Category Performance Analysis</h2>
            <div className="overflow-x-auto bg-card rounded-lg border border-border">
                <table className="min-w-full divide-y divide-border">
                    <thead className="bg-muted/50">
                        <tr>
                            <th className={thClass} onClick={() => handleSort('name')}>
                                Category <SortIndicator for_key="name" />
                            </th>
                            <th className={thClass} onClick={() => handleSort('quantitySold')}>
                                Items Sold <SortIndicator for_key="quantitySold" />
                            </th>
                             <th className={thClass} onClick={() => handleSort('revenue')}>
                                Revenue <SortIndicator for_key="revenue" />
                            </th>
                            {isAdvancedInventoryPluginActive && <th className={thClass}>COGS</th>}
                            {isAdvancedInventoryPluginActive && <th className={thClass} onClick={() => handleSort('profit')}>
                                Profit <SortIndicator for_key="profit" />
                            </th>}
                             <th className={thClass.replace('cursor-pointer', '')}>% of Total Revenue</th>
                        </tr>
                    </thead>
                    <tbody className="bg-card divide-y divide-border">
                        {sortedData.map(item => (
                            <tr key={item.id} className="hover:bg-muted/50 transition-colors">
                                <td className="px-4 py-3 whitespace-nowrap text-foreground font-medium">{item.name}</td>
                                <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">{item.quantitySold}</td>
                                <td className="px-4 py-3 whitespace-nowrap text-foreground">${item.revenue.toFixed(2)}</td>
                                {isAdvancedInventoryPluginActive && <td className="px-4 py-3 whitespace-nowrap text-foreground">${item.cost.toFixed(2)}</td>}
                                {isAdvancedInventoryPluginActive && <td className="px-4 py-3 whitespace-nowrap font-semibold text-green-500 dark:text-green-400">${item.profit.toFixed(2)}</td>}
                                 <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
                                    {totalRevenue > 0 ? `${((item.revenue / totalRevenue) * 100).toFixed(1)}%` : 'N/A'}
                                 </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default CategoryReport;