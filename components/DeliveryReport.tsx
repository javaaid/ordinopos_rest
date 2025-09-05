


import React, { useMemo } from 'react';
import { Order, OrderSource, OrderType } from '../types';
import ChartPieIcon from './icons/ChartPieIcon';
import TruckIcon from './icons/TruckIcon';
import ClockIcon from './icons/ClockIcon';
import ClipboardDocumentListIcon from './icons/ClipboardDocumentListIcon';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/Card';

interface DeliveryReportProps {
    orders: Order[];
}

interface DeliveryReportData {
  totalSales: number;
  salesByType: Record<OrderType, number>;
  avgDeliveryTimeMins: number;
  deliveryOrdersCount: number;
  topDeliveryItems: { name: string; count: number }[];
  salesBySource: Record<OrderSource, number>;
}

const DeliveryReport: React.FC<DeliveryReportProps> = ({ orders }) => {

    const reportData = useMemo<DeliveryReportData>(() => {
        const safeOrders = orders || [];
        const salesByType: Record<OrderType, number> = { 'dine-in': 0, 'takeaway': 0, 'delivery': 0, 'kiosk': 0, 'tab': 0 };
        const totalSales = safeOrders.reduce((sum, o) => {
             if (salesByType[o.orderType] !== undefined) {
                salesByType[o.orderType] += o.total;
            }
            return sum + o.total;
        }, 0);

        const deliveryOrders = safeOrders.filter(o => o.orderType === 'delivery' && o.status === 'delivered' && o.deliveredAt && o.completedAt);
        const totalDeliveryTime = deliveryOrders.reduce((sum, o) => sum + (Number(o.deliveredAt) - Number(o.completedAt)), 0);
        const avgDeliveryTimeMins = deliveryOrders.length > 0 ? (totalDeliveryTime / deliveryOrders.length / 60000) : 0;
        
        const deliveryItems = new Map<string, {name: string, count: number}>();
        safeOrders.filter(o => o.orderType === 'delivery').forEach(o => {
            o.cart.forEach(cartItem => {
                const current = deliveryItems.get(cartItem.menuItem.name) || { name: cartItem.menuItem.name, count: 0 };
                current.count += cartItem.quantity;
                deliveryItems.set(cartItem.menuItem.name, current);
            });
        });
        const topDeliveryItems = Array.from(deliveryItems.values()).sort((a,b) => b.count - a.count).slice(0, 5);

        const salesBySource: Record<OrderSource, number> = { 'in-store': 0, 'online': 0, 'uber-eats': 0, 'doordash': 0, 'kiosk': 0, 'qr_ordering': 0 };
        safeOrders.forEach(o => {
            if (salesBySource[o.source] !== undefined) {
                salesBySource[o.source] += o.total;
            }
        });

        return { totalSales, salesByType, avgDeliveryTimeMins, deliveryOrdersCount: deliveryOrders.length, topDeliveryItems, salesBySource };
    }, [orders]);

    return (
        <div className="w-full">
            <h2 className="text-2xl font-bold text-foreground mb-2 flex items-center gap-3">
                <TruckIcon className="w-8 h-8"/>
                Delivery & Online Order Report
            </h2>
            <p className="text-sm text-muted-foreground mb-6">Analyze performance of your delivery and off-premise orders.</p>

             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card><CardHeader><CardDescription>Total Delivery Orders</CardDescription><CardTitle>{reportData.deliveryOrdersCount}</CardTitle></CardHeader></Card>
                 <Card><CardHeader><CardDescription>Avg. Delivery Time</CardDescription><CardTitle>{reportData.avgDeliveryTimeMins.toFixed(1)} <span className="text-lg">min</span></CardTitle><p className="text-xs text-muted-foreground pt-1">From kitchen complete to delivered</p></CardHeader></Card>
                <Card><CardHeader><CardDescription>Total Delivery Sales</CardDescription><CardTitle className="text-amber-500">${(reportData.salesByType.delivery || 0).toFixed(2)}</CardTitle></CardHeader></Card>
                <Card><CardHeader><CardDescription>Delivery % of Sales</CardDescription><CardTitle className="text-amber-500">{reportData.totalSales > 0 ? `${((reportData.salesByType.delivery / reportData.totalSales) * 100).toFixed(1)}%` : '0.0%'}</CardTitle></CardHeader></Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader><CardTitle className="flex items-center gap-2"><ChartPieIcon className="w-6 h-6"/> Sales by Order Type</CardTitle></CardHeader>
                    <CardContent>
                         <div className="space-y-4">
                            {Object.entries(reportData.salesByType).map(([type, total]) => {
                                const percentage = reportData.totalSales > 0 ? (total / reportData.totalSales) * 100 : 0;
                                return (
                                    <div key={type}>
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="font-semibold text-foreground capitalize">{type.replace('-', ' ')}</span>
                                            <span className="text-sm text-muted-foreground font-mono">${total.toFixed(2)}</span>
                                        </div>
                                        <div className="w-full bg-secondary rounded-full h-4">
                                            <div className="bg-primary h-4 rounded-full text-right pr-2 text-xs font-bold flex items-center justify-end" style={{width: `${percentage}%`}}>
                                            {percentage > 10 && <span className="text-primary-foreground">{`${percentage.toFixed(1)}%`}</span>}
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </CardContent>
                </Card>

                 <Card>
                    <CardHeader><CardTitle className="flex items-center gap-2"><ClipboardDocumentListIcon className="w-6 h-6"/> Top 5 Delivery Items</CardTitle></CardHeader>
                    <CardContent>
                        {reportData.topDeliveryItems.length > 0 ? (
                            <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                            {reportData.topDeliveryItems.map(item => (
                                <li key={item.name} className="flex justify-between items-center">
                                    <span className="text-foreground font-medium">{item.name}</span>
                                    <span className="font-mono bg-secondary px-2 py-0.5 rounded-md text-sm">{item.count} sold</span>
                                </li>
                            ))}
                            </ol>
                        ) : (
                            <p className="text-center text-muted-foreground pt-8">No delivery item data for this period.</p>
                        )}
                    </CardContent>
                </Card>

                <Card className="lg:col-span-2">
                    <CardHeader><CardTitle>Sales by Source</CardTitle></CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 text-center">
                            {Object.entries(reportData.salesBySource).map(([source, total]) => (
                                <div key={source} className="bg-background p-4 rounded-lg border">
                                    <p className="text-sm text-muted-foreground capitalize">{source.replace('-', ' ')}</p>
                                    <p className="text-2xl font-bold text-green-500">${total.toFixed(2)}</p>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default DeliveryReport;