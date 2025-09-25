
import React, { useMemo } from 'react';
import { Order } from '../types';
import TruckIcon from './icons/TruckIcon';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/Card';
import { useAppContext } from '../contexts/AppContext';
import { useTranslations } from '../hooks/useTranslations';

interface DeliveryReportProps {
    orders: Order[];
}

const DeliveryReport: React.FC<DeliveryReportProps> = ({ orders }) => {
    const { settings } = useAppContext();
    const t = useTranslations(settings.language.staff);

    const deliveryOrders = useMemo(() => {
        return (orders || []).filter(o => o.orderType === 'delivery' || o.source === 'uber-eats' || o.source === 'doordash');
    }, [orders]);

    const reportData = useMemo(() => {
        const totalOrders = deliveryOrders.length;
        const totalRevenue = deliveryOrders.reduce((sum, o) => sum + o.total, 0);
        const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
        
        const completedDeliveries = deliveryOrders.filter(o => o.deliveredAt && o.createdAt);
        const totalDeliveryTime = completedDeliveries.reduce((sum, o) => sum + (o.deliveredAt! - o.createdAt), 0);
        const avgDeliveryTimeMins = completedDeliveries.length > 0 ? (totalDeliveryTime / completedDeliveries.length) / 60000 : 0;

        return {
            totalOrders,
            totalRevenue,
            avgOrderValue,
            avgDeliveryTimeMins
        };
    }, [deliveryOrders]);
    
    return (
        <div className="w-full">
            <h2 className="text-2xl font-bold text-foreground mb-2 flex items-center gap-3">
                <TruckIcon className="w-8 h-8"/>
                {t('deliveryOnlineOrderReport')}
            </h2>
            <p className="text-sm text-muted-foreground mb-6">Analyze delivery performance and online order trends.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <Card>
                    <CardHeader><CardDescription>Total Delivery Orders</CardDescription><CardTitle>{reportData.totalOrders}</CardTitle></CardHeader>
                </Card>
                <Card>
                    <CardHeader><CardDescription>Total Delivery Revenue</CardDescription><CardTitle>${reportData.totalRevenue.toFixed(2)}</CardTitle></CardHeader>
                </Card>
                 <Card>
                    <CardHeader><CardDescription>Avg. Delivery Value</CardDescription><CardTitle>${reportData.avgOrderValue.toFixed(2)}</CardTitle></CardHeader>
                </Card>
                 <Card>
                    <CardHeader><CardDescription>Avg. Delivery Time</CardDescription><CardTitle>{reportData.avgDeliveryTimeMins.toFixed(1)} min</CardTitle></CardHeader>
                </Card>
            </div>

            {reportData.totalOrders === 0 && (
                <div className="text-center text-muted-foreground pt-16">
                    <p>No delivery orders found in this period.</p>
                </div>
            )}
        </div>
    );
};

export default DeliveryReport;
