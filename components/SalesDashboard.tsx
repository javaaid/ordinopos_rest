

import React, { useMemo, useState, useRef } from 'react';
import { Order, PaymentType, SalesDashboardWidgetId, Location, RecipeItem, Ingredient, PaymentType as AllPaymentTypes } from '../types';
import ChartPieIcon from './icons/ChartPieIcon';
import CurrencyDollarIcon from './icons/CurrencyDollarIcon';
import CreditCardIcon from './icons/CreditCardIcon';
import GlobeAltIcon from './icons/GlobeAltIcon';
import SquaresPlusIcon from './icons/SquaresPlusIcon';
import ArrowsUpDownIcon from './icons/ArrowsUpDownIcon';
import CustomizeDashboardModal from './CustomizeDashboardModal';
import TopItemsWidget from './TopItemsWidget';
import LocationPerformanceWidget from './LocationPerformanceWidget';
import QrCodeIcon from './icons/QrCodeIcon';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/Card';
import { calculateMenuItemCost } from '../utils/calculations';
import { useAppContext } from '../contexts/AppContext';
import { cn } from '../lib/utils';

const paymentMethodIcons: Record<string, React.FC<React.SVGProps<SVGSVGElement>>> = {
    cash: CurrencyDollarIcon,
    card: CreditCardIcon,
    online: GlobeAltIcon,
    qr: QrCodeIcon,
};

const widgetClasses: Record<SalesDashboardWidgetId, string> = {
    stats: 'lg:col-span-4',
    chart: 'lg:col-span-2',
    payment: 'lg:col-span-2',
    topItems: 'lg:col-span-2',
    locationPerformance: 'lg:col-span-4',
};

// --- Widget Components ---

const StatsWidget: React.FC<{ stats: any, showProfit: boolean }> = ({ stats, showProfit }) => (
    <div className={cn("grid grid-cols-2 gap-6", showProfit ? "md:grid-cols-4" : "md:grid-cols-3")}>
        <Card><CardHeader><CardDescription>Total Revenue</CardDescription><CardTitle>${stats.totalRevenue.toFixed(2)}</CardTitle></CardHeader></Card>
        {showProfit && <Card><CardHeader><CardDescription>Total Profit</CardDescription><CardTitle className="text-primary">${stats.totalProfit.toFixed(2)}</CardTitle></CardHeader></Card>}
        <Card><CardHeader><CardDescription>Total Orders</CardDescription><CardTitle>{stats.orderCount}</CardTitle></CardHeader></Card>
        <Card><CardHeader><CardDescription>Avg. Order Value</CardDescription><CardTitle>${stats.avgOrderValue.toFixed(2)}</CardTitle></CardHeader></Card>
    </div>
);

const ChartWidget: React.FC<{ orders: Order[], startDate: Date, endDate: Date }> = ({ orders, startDate, endDate }) => {
    const chartData = useMemo(() => {
        if (!orders || orders.length === 0) return [];
        const rangeInDays = (endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24);
        if (rangeInDays < 2) {
            const hourlyData = Array(24).fill(0).map((_, i) => ({ label: `${i}:00`, value: 0}));
            orders.forEach(order => { const hour = new Date(order.createdAt).getHours(); hourlyData[hour].value += order.total; });
            return hourlyData;
        } else {
            const dateMap = new Map<string, { label: string, value: number, date: Date }>();
            let currentDate = new Date(startDate); currentDate.setHours(0,0,0,0);
            let endLoopDate = new Date(endDate); endLoopDate.setHours(0,0,0,0);
            while (currentDate <= endLoopDate) {
                const label = currentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                dateMap.set(label, { label, value: 0, date: new Date(currentDate) });
                currentDate.setDate(currentDate.getDate() + 1);
            }
            orders.forEach(order => {
                const label = new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                if (dateMap.has(label)) dateMap.get(label)!.value += order.total;
            });
            return Array.from(dateMap.values()).sort((a,b) => a.date.getTime() - b.date.getTime());
        }
    }, [orders, startDate, endDate]);
    const maxChartValue = Math.max(...chartData.map(d => d.value), 1);
    return (
        <Card>
            <CardHeader><CardTitle>Sales Trend</CardTitle></CardHeader>
            <CardContent>
                {chartData.length > 0 ? (
                    <div className="h-72 w-full flex items-end justify-around gap-2">
                        {chartData.map((d, i) => (
                            <div key={i} className="flex-1 flex flex-col items-center group">
                                <div className="relative w-full h-full flex items-end">
                                    <div className="w-full bg-primary rounded-t-md hover:bg-primary/80 transition-all" style={{ height: `${(d.value / maxChartValue) * 100}%` }}>
                                        <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-sm text-primary-foreground bg-primary/80 px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">${d.value.toFixed(2)}</span>
                                    </div>
                                </div><p className="text-xs text-muted-foreground mt-2 text-center">{d.label}</p>
                            </div>
                        ))}
                    </div>
                ) : <div className="h-72 w-full flex items-center justify-center text-muted-foreground">No sales data for the selected period.</div>}
            </CardContent>
        </Card>
    );
};

const PaymentWidget: React.FC<{ orders: Order[], totalRevenue: number, allPaymentTypes: AllPaymentTypes[] }> = ({ orders, totalRevenue, allPaymentTypes }) => {
    const paymentStats = useMemo(() => {
        const pStats = new Map<string, { total: number; count: number }>();
        (allPaymentTypes || []).forEach(pt => pStats.set(pt.name, { total: 0, count: 0 }));

        (orders || []).forEach(order => {
            order.payments.forEach(payment => {
                const current = pStats.get(payment.method);
                if (current) {
                    pStats.set(payment.method, { total: current.total + payment.amount, count: current.count + 1 });
                }
            });
        });
        return Array.from(pStats.entries());
    }, [orders, allPaymentTypes]);
    return (
        <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><ChartPieIcon className="w-6 h-6"/> Payment Breakdown</CardTitle></CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {paymentStats.map(([method, data]) => {
                        const Icon = paymentMethodIcons[method.toLowerCase()] || CurrencyDollarIcon;
                        const percentage = totalRevenue > 0 ? (data.total / totalRevenue) * 100 : 0;
                        return (
                            <div key={method}>
                                <div className="flex justify-between items-center mb-1"><div className="flex items-center gap-2"><Icon className="w-5 h-5 text-muted-foreground"/><span className="font-semibold text-foreground capitalize">{method}</span></div><span className="text-sm text-foreground font-mono">${data.total.toFixed(2)} ({data.count})</span></div>
                                <div className="w-full bg-secondary rounded-full h-2.5"><div className="bg-primary h-2.5 rounded-full" style={{width: `${percentage}%`}}></div></div>
                            </div>
                        );
                    })}
                    {(!orders || orders.length === 0) && <p className="text-sm text-muted-foreground text-center pt-8">No payment data for this period.</p>}
                </div>
            </CardContent>
        </Card>
    );
};


// --- Main Dashboard Component ---

interface SalesDashboardProps {
    orders: Order[];
    startDate: Date;
    endDate: Date;
    locations: Location[];
    currentLocationId: string;
    recipes: Record<number, RecipeItem[]>;
    ingredients: Ingredient[];
    allPaymentTypes: AllPaymentTypes[];
}

const SalesDashboard: React.FC<SalesDashboardProps> = (props) => {
    const { orders, startDate, endDate, locations, currentLocationId, recipes, ingredients, allPaymentTypes } = props;
    const { isAdvancedInventoryPluginActive } = useAppContext();

    const stats = useMemo(() => {
        const safeOrders = orders || [];
        const totalRevenue = safeOrders.reduce((sum, order) => sum + order.total, 0);
        const orderCount = safeOrders.length;
        const avgOrderValue = orderCount > 0 ? totalRevenue / orderCount : 0;

        const totalCost = safeOrders.reduce((sum, order) => {
            const orderCost = order.cart.reduce((cartSum, cartItem) => {
                return cartSum + (calculateMenuItemCost(cartItem.menuItem.id, ingredients, recipes) * cartItem.quantity);
            }, 0);
            return sum + orderCost;
        }, 0);

        const totalProfit = totalRevenue - totalCost;

        return { totalRevenue, orderCount, avgOrderValue, totalProfit };
    }, [orders, ingredients, recipes]);

    const [visibleWidgets, setVisibleWidgets] = useState<SalesDashboardWidgetId[]>(['stats', 'chart', 'payment', 'topItems', 'locationPerformance']);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const widgetComponents: Record<SalesDashboardWidgetId, React.ReactNode> = {
        stats: <StatsWidget stats={stats} showProfit={isAdvancedInventoryPluginActive} />,
        chart: <ChartWidget orders={orders} startDate={startDate} endDate={endDate} />,
        payment: <PaymentWidget orders={orders} totalRevenue={stats.totalRevenue} allPaymentTypes={allPaymentTypes} />,
        topItems: <TopItemsWidget orders={orders} />,
        locationPerformance: <LocationPerformanceWidget orders={orders} locations={locations} ingredients={ingredients} recipes={recipes} />,
    };

    return (
        <div className="w-full">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-foreground">Sales Dashboard</h2>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 text-muted-foreground hover:text-foreground font-semibold text-sm py-2 px-3 rounded-lg hover:bg-secondary"
                    >
                        <ArrowsUpDownIcon className="w-5 h-5" /> Customize
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {visibleWidgets.map(widgetId => {
                    // Only render location performance if there are multiple locations
                    if (widgetId === 'locationPerformance' && locations.length <= 1) return null;
                    return (
                        <div key={widgetId} className={widgetClasses[widgetId]}>
                            {widgetComponents[widgetId]}
                        </div>
                    );
                })}
            </div>

            <CustomizeDashboardModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={(widgets) => { setVisibleWidgets(widgets); setIsModalOpen(false); }}
                allWidgets={['stats', 'chart', 'payment', 'topItems', 'locationPerformance']}
                visibleWidgets={visibleWidgets}
            />
        </div>
    );
};

export default SalesDashboard;