
import React, { useMemo } from 'react';
import { Order } from '../types';
import ClipboardDocumentListIcon from './icons/ClipboardDocumentListIcon';

interface TopItemsWidgetProps {
    orders: Order[];
}

const TopItemsWidget: React.FC<TopItemsWidgetProps> = ({ orders }) => {
    const topItems = useMemo(() => {
        const itemMap = new Map<string, { name: string, revenue: number }>();
        orders.forEach(order => {
            order.cart.forEach(cartItem => {
                const itemRevenue = (cartItem.menuItem.price + cartItem.selectedModifiers.reduce((sum, mod) => sum + mod.price, 0)) * cartItem.quantity;
                const current = itemMap.get(cartItem.menuItem.name) || { name: cartItem.menuItem.name, revenue: 0 };
                current.revenue += itemRevenue;
                itemMap.set(cartItem.menuItem.name, current);
            });
        });
        return Array.from(itemMap.values()).sort((a, b) => b.revenue - a.revenue).slice(0, 5);
    }, [orders]);

    return (
        <div>
            <h3 className="font-bold text-lg text-foreground mb-4 flex items-center gap-2">
                <ClipboardDocumentListIcon className="w-6 h-6" /> Top Selling Items
            </h3>
            {topItems.length > 0 ? (
                <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                    {topItems.map(item => (
                        <li key={item.name} className="flex justify-between items-center text-sm">
                            <span className="text-foreground font-medium">{item.name}</span>
                            <span className="font-mono bg-secondary px-2 py-0.5 rounded-md text-green-500">${item.revenue.toFixed(2)}</span>
                        </li>
                    ))}
                </ol>
            ) : (
                <p className="text-center text-muted-foreground pt-8">No item sales data for this period.</p>
            )}
        </div>
    );
};

export default TopItemsWidget;
