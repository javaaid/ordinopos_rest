


import React, { useMemo } from 'react';
import { Order, Location, RecipeItem, Ingredient } from '../types';
import BuildingStorefrontIcon from './icons/BuildingStorefrontIcon';
import { calculateMenuItemCost } from '../utils/calculations';
import { useAppContext } from '../contexts/AppContext';

interface LocationPerformanceWidgetProps {
    orders: Order[];
    locations: Location[];
    ingredients: Ingredient[];
    recipes: Record<number, RecipeItem[]>;
}

interface LocationStat {
    id: string;
    name: string;
    revenue: number;
    profit: number;
    orderCount: number;
}

const LocationPerformanceWidget: React.FC<LocationPerformanceWidgetProps> = ({ orders, locations, ingredients, recipes }) => {
    const { isAdvancedInventoryPluginActive } = useAppContext();
    
    const locationStats = useMemo<LocationStat[]>(() => {
        const statsMap = new Map<string, LocationStat>();
        locations.forEach(loc => {
            statsMap.set(loc.id, {
                id: loc.id,
                name: loc.name,
                revenue: 0,
                profit: 0,
                orderCount: 0,
            });
        });

        orders.forEach(order => {
            const stat = statsMap.get(order.locationId);
            if (stat) {
                const orderCost = order.cart.reduce((sum, item) => sum + calculateMenuItemCost(item.menuItem.id, ingredients, recipes) * item.quantity, 0);
                stat.revenue += order.total;
                stat.profit += order.total - orderCost;
                stat.orderCount += 1;
            }
        });

        return Array.from(statsMap.values()).sort((a,b) => b.revenue - a.revenue);

    }, [orders, locations, ingredients, recipes]);

    const thClass = "px-4 py-3 text-start text-xs font-semibold text-muted-foreground uppercase tracking-wider";

    return (
        <div>
            <h3 className="font-bold text-lg text-foreground mb-4 flex items-center gap-2">
                <BuildingStorefrontIcon className="w-6 h-6" /> Location Performance
            </h3>
            <div className="overflow-x-auto bg-secondary rounded-lg">
                <table className="min-w-full divide-y divide-border">
                    <thead className="bg-secondary/50">
                        <tr>
                            <th className={thClass}>Location</th>
                            <th className={thClass}>Total Revenue</th>
                            {isAdvancedInventoryPluginActive && <th className={thClass}>Total Profit</th>}
                            <th className={thClass}>Orders</th>
                        </tr>
                    </thead>
                    <tbody className="bg-card divide-y divide-border">
                        {locationStats.map(loc => (
                             <tr key={loc.id} className="hover:bg-muted/50">
                                <td className="px-4 py-3 font-medium text-foreground">{loc.name}</td>
                                <td className="px-4 py-3 font-mono text-foreground">${loc.revenue.toFixed(2)}</td>
                                {isAdvancedInventoryPluginActive && <td className="px-4 py-3 font-mono font-semibold text-green-500 dark:text-green-400">${loc.profit.toFixed(2)}</td>}
                                <td className="px-4 py-3 font-mono text-foreground">{loc.orderCount}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default LocationPerformanceWidget;