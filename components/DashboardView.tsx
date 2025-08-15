import React, { useState, useMemo, useCallback } from 'react';
import { Order, Ingredient, View, ManagementSubView, DashboardWidgetId, AppSettings } from '../types';
import CurrencyDollarIcon from './icons/CurrencyDollarIcon';
import RectangleStackIcon from './icons/RectangleStackIcon';
import ChartBarIcon from './icons/ChartBarIcon';
import ExclamationTriangleIcon from './icons/ExclamationTriangleIcon';
import ClipboardDocumentListIcon from './icons/ClipboardDocumentListIcon';
import RocketLaunchIcon from './icons/RocketLaunchIcon';
import Cog6ToothIcon from './icons/Cog6ToothIcon';
import BuildingStorefrontIcon from './icons/BuildingStorefrontIcon';
import { useAppContext, useDataContext, useModalContext } from '../contexts/AppContext';
import { Button } from './ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/Card';

// #region Widget Components
const StatCard: React.FC<{ icon: React.ReactNode, title: string, value: string, subtext?: string, color: string }> = ({ icon, title, value, subtext, color }) => (
    <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
            <div className={`text-2xl`} style={{ color }}>{icon}</div>
        </CardHeader>
        <CardContent>
            <div className="text-3xl font-bold text-foreground">{value}</div>
            {subtext && <p className="text-xs text-muted-foreground">{subtext}</p>}
        </CardContent>
    </Card>
);

const SalesChartWidget: React.FC<{ orders: Order[], currency: string }> = ({ orders, currency }) => {
    const chartData = useMemo(() => {
        const hours = Array.from({ length: 17 }, (_, i) => ({ label: `${i + 6}`, sales: 0 })); // 6am to 10pm
        orders.forEach(o => {
            const hour = new Date(o.createdAt).getHours();
            if (hour >= 6 && hour <= 22) {
                hours[hour - 6].sales += o.total;
            }
        });
        const maxSales = Math.max(...hours.map(h => h.sales), 1);
        return hours.map(h => ({ ...h, height: Math.round((h.sales / maxSales) * 100) }));
    }, [orders]);

    return (
        <Card className="h-full flex flex-col">
            <CardHeader>
                <CardTitle>Today's Sales</CardTitle>
                <CardDescription>Revenue by hour</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow flex items-end justify-between gap-2">
                {chartData.map((d, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center group h-full justify-end">
                        <div className="relative w-full h-full flex items-end">
                            <div className="w-full bg-blue-200 rounded-t-md hover:bg-primary/80 transition-all group-hover:bg-primary" style={{ height: `${d.height}%` }}>
                                <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs text-primary-foreground bg-primary/90 px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">{currency}{d.sales.toFixed(0)}</span>
                            </div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2 text-center">{d.label}:00</p>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
};

const TopProductsWidget: React.FC<{ orders: Order[], currency: string }> = ({ orders, currency }) => {
     const topItems = useMemo(() => {
        const itemMap = new Map<string, { name: string, revenue: number }>();
        orders.forEach(order => {
            order.cart.forEach(cartItem => {
                const itemRevenue = (cartItem.menuItem.price + (cartItem.selectedModifiers?.reduce((sum, mod) => sum + mod.price, 0) || 0)) * cartItem.quantity;
                const current = itemMap.get(cartItem.menuItem.name) || { name: cartItem.menuItem.name, revenue: 0 };
                current.revenue += itemRevenue;
                itemMap.set(cartItem.menuItem.name, current);
            });
        });
        return Array.from(itemMap.values()).sort((a, b) => b.revenue - a.revenue).slice(0, 5);
    }, [orders]);
    return (
        <Card className="h-full">
             <CardHeader>
                <CardTitle>Top Selling Products</CardTitle>
             </CardHeader>
             <CardContent>
                 {topItems.map(item => (
                     <div key={item.name} className="flex justify-between items-center text-sm py-2 border-b border-border last:border-0">
                         <span className="text-foreground font-medium">{item.name}</span>
                         <span className="font-mono bg-accent px-2 py-0.5 rounded-md text-foreground font-semibold">{currency}{item.revenue.toFixed(2)}</span>
                     </div>
                 ))}
             </CardContent>
        </Card>
    )
};

const QuickActionsWidget: React.FC = () => {
    const { setView, setManagementSubView } = useAppContext();
    return (
        <Card className="h-full">
            <CardHeader><CardTitle>Quick Actions</CardTitle></CardHeader>
            <CardContent className="space-y-3">
                <Button onClick={() => setView('pos')} className="w-full justify-start text-base" variant="ghost"><BuildingStorefrontIcon className="w-5 h-5 mr-3 text-primary" /> New Sale</Button>
                <Button onClick={() => setView('history')} className="w-full justify-start text-base" variant="ghost"><RectangleStackIcon className="w-5 h-5 mr-3 text-purple-500"/> Order History</Button>
                <Button onClick={() => { setView('management'); setManagementSubView('reports') }} className="w-full justify-start text-base" variant="ghost"><ChartBarIcon className="w-5 h-5 mr-3 text-green-500"/> View Reports</Button>
            </CardContent>
        </Card>
    )
};

const LowStockAlertsWidget: React.FC<{ ingredients: Ingredient[] }> = ({ ingredients }) => {
    const lowStockItems = useMemo(() => ingredients.filter(i => i.stock <= i.reorderThreshold).slice(0, 5), [ingredients]);
    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><ExclamationTriangleIcon className="w-5 h-5 text-yellow-500" /> Low Stock Alerts</CardTitle>
            </CardHeader>
            <CardContent>
            {lowStockItems.length > 0 ? (
                <div className="space-y-2">
                    {lowStockItems.map(item => (
                        <div key={item.id} className="flex justify-between items-center text-sm p-2 bg-yellow-400/10 rounded-md">
                            <span className="text-foreground font-medium">{item.name}</span>
                            <span className="font-mono text-yellow-600 font-semibold">{item.stock} {item.unit} left</span>
                        </div>
                    ))}
                </div>
            ) : <p className="text-sm text-muted-foreground">All stock levels are healthy.</p>}
            </CardContent>
        </Card>
    )
};

const RecentTransactionsWidget: React.FC<{ orders: Order[], currency: string }> = ({ orders, currency }) => {
     return (
        <Card className="h-full">
            <CardHeader><CardTitle>Recent Transactions</CardTitle></CardHeader>
            <CardContent>
                 {orders.slice(0, 5).map(o => (
                    <div key={o.id} className="flex justify-between items-center text-sm py-2 border-b border-border last:border-b-0">
                        <div>
                            <p className="font-semibold text-foreground">#{o.orderNumber} - {o.customer?.name || 'Walk-in'}</p>
                            <p className="text-xs text-muted-foreground">{new Date(o.createdAt).toLocaleTimeString()}</p>
                        </div>
                        <span className="font-mono text-foreground font-semibold">{currency}{o.total.toFixed(2)}</span>
                    </div>
                ))}
            </CardContent>
        </Card>
    )
};
// #endregion

const DashboardView: React.FC = () => {
    const { settings, setSettings } = useAppContext();
    const { openModal, closeModal } = useModalContext();
    const { orders: allOrders, ingredients } = useDataContext();

    const todayStart = useMemo(() => {
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        return d.getTime();
    }, []);

    const todaysOrders = useMemo(() => 
        (allOrders || []).filter((o: Order) => o.createdAt >= todayStart).sort((a, b) => b.createdAt - a.createdAt)
    , [allOrders, todayStart]);

    const { todaysRevenue, avgOrderValue } = useMemo(() => {
        const revenue = todaysOrders.reduce((sum, o) => sum + o.total, 0);
        const avg = todaysOrders.length > 0 ? revenue / todaysOrders.length : 0;
        return { todaysRevenue: revenue, avgOrderValue: avg };
    }, [todaysOrders]);

    const currentLocation = useAppContext().currentLocation;
    const currency = currentLocation?.currency || '$';

    const widgetOrder = settings.preferences.dashboardWidgetOrder || ['stats', 'salesChart', 'quickActions', 'topItems', 'lowStock', 'recentTransactions'];

    const widgetComponents: Record<DashboardWidgetId, React.ReactNode> = {
        stats: (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                 <StatCard icon={<CurrencyDollarIcon className="w-7 h-7"/>} title="Today's Revenue" value={`${currency}${todaysRevenue.toFixed(2)}`} color="#2563eb" />
                <StatCard icon={<RectangleStackIcon className="w-7 h-7"/>} title="Today's Orders" value={todaysOrders.length.toString()} color="#16a34a"/>
                <StatCard icon={<ChartBarIcon className="w-7 h-7"/>} title="Avg. Order Value" value={`${currency}${avgOrderValue.toFixed(2)}`} color="#9333ea"/>
            </div>
        ),
        salesChart: <SalesChartWidget orders={todaysOrders} currency={currency} />,
        quickActions: <QuickActionsWidget />,
        topItems: <TopProductsWidget orders={todaysOrders} currency={currency} />,
        lowStock: <LowStockAlertsWidget ingredients={ingredients} />,
        recentTransactions: <RecentTransactionsWidget orders={todaysOrders} currency={currency} />,
    };

    const widgetSpans: Record<DashboardWidgetId, string> = {
        stats: 'lg:col-span-3',
        salesChart: 'lg:col-span-2',
        quickActions: 'lg:col-span-1',
        topItems: 'lg:col-span-1',
        lowStock: 'lg:col-span-1',
        recentTransactions: 'lg:col-span-2',
    };

    const handleCustomize = () => {
        openModal('dashboardCustomize', {
            widgetOrder: widgetOrder,
            onSave: (newOrder: DashboardWidgetId[]) => {
                setSettings((prev: AppSettings) => ({
                    ...prev,
                    preferences: { ...prev.preferences, dashboardWidgetOrder: newOrder }
                }));
                closeModal();
            }
        });
    };
    
    return (
        <div className="bg-background text-foreground h-full flex flex-col">
            <header className="bg-card p-4 flex justify-between items-center border-b border-border shrink-0">
                <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
                <Button onClick={handleCustomize} variant="outline" size="sm" className="flex items-center gap-2">
                    <Cog6ToothIcon className="w-5 h-5"/> Customize
                </Button>
            </header>
            
            <main className="flex-grow p-6 overflow-y-auto">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                   {widgetOrder.map(widgetId => (
                        <div key={widgetId} className={widgetSpans[widgetId]}>
                            {widgetComponents[widgetId]}
                        </div>
                   ))}
                </div>
            </main>
        </div>
    );
};

export default DashboardView;