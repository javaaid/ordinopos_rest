

import React, { useMemo } from 'react';
import { Order } from '../types';
import ComputerSpeakerIcon from './icons/ComputerSpeakerIcon';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/Card';

interface KioskReportProps {
    orders: Order[];
}

const KioskReport: React.FC<KioskReportProps> = ({ orders }) => {

    const reportData = useMemo(() => {
        const safeOrders = orders || [];
        const kioskOrders = safeOrders.filter(o => o.source === 'kiosk');
        const inStoreOrders = safeOrders.filter(o => o.source === 'in-store');
        
        const kioskOrderCount = kioskOrders.length;
        const totalOrders = safeOrders.length;
        const kioskPercentage = totalOrders > 0 ? (kioskOrderCount / totalOrders) * 100 : 0;
        
        const kioskRevenue = kioskOrders.reduce((sum, o) => sum + o.total, 0);
        const inStoreRevenue = inStoreOrders.reduce((sum, o) => sum + o.total, 0);

        const kioskAvgOrderValue = kioskOrderCount > 0 ? kioskRevenue / kioskOrderCount : 0;
        const inStoreAvgOrderValue = inStoreOrders.length > 0 ? inStoreRevenue / inStoreOrders.length : 0;

        const itemMap = new Map<string, { name: string, count: number }>();
        kioskOrders.forEach(o => {
            o.cart.forEach(cartItem => {
                const current = itemMap.get(cartItem.menuItem.name) || { name: cartItem.menuItem.name, count: 0 };
                current.count += cartItem.quantity;
                itemMap.set(cartItem.menuItem.name, current);
            });
        });

        const topKioskItems = Array.from(itemMap.values()).sort((a,b) => b.count - a.count).slice(0, 5);
        
        return {
            kioskPercentage,
            kioskAvgOrderValue,
            inStoreAvgOrderValue,
            topKioskItems,
            kioskOrderCount
        };
    }, [orders]);

    const aovDiff = reportData.kioskAvgOrderValue - reportData.inStoreAvgOrderValue;

    return (
        <div className="w-full">
            <h2 className="text-2xl font-bold text-foreground mb-2 flex items-center gap-3">
                <ComputerSpeakerIcon className="w-8 h-8"/>
                Self-Service Kiosk Performance
            </h2>
            <p className="text-sm text-muted-foreground mb-6">Analyze the effectiveness of your customer-facing kiosk.</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card><CardHeader><CardDescription>Kiosk % of Total Orders</CardDescription><CardTitle>{reportData.kioskPercentage.toFixed(1)}%</CardTitle></CardHeader></Card>
                <Card><CardHeader><CardDescription>Avg. Kiosk Order Value</CardDescription><CardTitle>${reportData.kioskAvgOrderValue.toFixed(2)}</CardTitle></CardHeader></Card>
                <Card>
                    <CardHeader>
                        <CardDescription>AOV vs. Cashier</CardDescription>
                        <CardTitle className={aovDiff >= 0 ? 'text-green-500' : 'text-destructive'}>
                            {aovDiff >= 0 ? '+' : ''}${aovDiff.toFixed(2)}
                        </CardTitle>
                    </CardHeader>
                </Card>
            </div>
            
            <Card>
                <CardHeader><CardTitle>Top 5 Kiosk Items</CardTitle></CardHeader>
                <CardContent>
                    {reportData.topKioskItems.length > 0 ? (
                        <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                        {reportData.topKioskItems.map(item => (
                            <li key={item.name} className="flex justify-between items-center">
                                <span className="text-foreground font-medium">{item.name}</span>
                                <span className="font-mono bg-secondary px-2 py-0.5 rounded-md text-sm">{item.count} sold</span>
                            </li>
                        ))}
                        </ol>
                    ) : (
                        <p className="text-center text-muted-foreground pt-8">No Kiosk orders in this period.</p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default KioskReport;
