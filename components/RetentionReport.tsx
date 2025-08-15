import React, { useMemo } from 'react';
import { Order } from '../types';
import ChartPieIcon from './icons/ChartPieIcon';
import ArrowPathIcon from './icons/ArrowPathIcon';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/Card';

interface RetentionReportProps {
    ordersInDateRange: Order[];
    allOrders: Order[];
    startDate: Date;
}

const RetentionReport: React.FC<RetentionReportProps> = ({ ordersInDateRange, allOrders, startDate }) => {

    const reportData = useMemo(() => {
        const firstOrderDateMap = new Map<string, number>();
        for (const order of allOrders) {
            if (order.customer) {
                const existingDate = firstOrderDateMap.get(order.customer.id);
                if (!existingDate || order.createdAt < existingDate) {
                    firstOrderDateMap.set(order.customer.id, order.createdAt);
                }
            }
        }

        const periodStartTimestamp = startDate.getTime();

        const newCustomerIds = new Set<string>();
        const repeatCustomerIds = new Set<string>();

        let newCustomerRevenue = 0;
        let repeatCustomerRevenue = 0;

        for (const order of ordersInDateRange) {
            if (order.customer) {
                const customerId = order.customer.id;
                const firstOrderDate = firstOrderDateMap.get(customerId);
                
                if (firstOrderDate && firstOrderDate >= periodStartTimestamp) {
                    newCustomerIds.add(customerId);
                    newCustomerRevenue += order.total;
                } else {
                    repeatCustomerIds.add(customerId);
                    repeatCustomerRevenue += order.total;
                }
            }
        }

        const newCustomerCount = newCustomerIds.size;
        const repeatCustomerCount = repeatCustomerIds.size;
        const totalUniqueCustomers = newCustomerCount + repeatCustomerCount;
        const retentionRate = totalUniqueCustomers > 0 ? (repeatCustomerCount / totalUniqueCustomers) * 100 : 0;
        const totalRevenue = newCustomerRevenue + repeatCustomerRevenue;

        return { newCustomerCount, repeatCustomerCount, totalUniqueCustomers, retentionRate, newCustomerRevenue, repeatCustomerRevenue, totalRevenue };
    }, [ordersInDateRange, allOrders, startDate]);
    
    const newRevenuePercent = reportData.totalRevenue > 0 ? (reportData.newCustomerRevenue / reportData.totalRevenue) * 100 : 0;

    return (
        <div className="w-full">
            <h2 className="text-2xl font-bold text-foreground mb-2 flex items-center gap-3">
                <ArrowPathIcon className="w-8 h-8"/>
                Customer Retention Report
            </h2>
            <p className="text-sm text-muted-foreground mb-6">Analyze the ratio of new vs. returning customers and their impact on revenue.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card className="md:col-span-2 lg:col-span-4 bg-muted"><CardHeader><CardDescription>Customer Retention Rate</CardDescription><CardTitle className="text-primary">{reportData.retentionRate.toFixed(1)}%</CardTitle><p className="text-xs text-muted-foreground pt-1">of customers in this period were returning customers.</p></CardHeader></Card>
                <Card><CardHeader><CardDescription>New Customers</CardDescription><CardTitle>{reportData.newCustomerCount}</CardTitle></CardHeader></Card>
                 <Card><CardHeader><CardDescription>Revenue from New</CardDescription><CardTitle>${reportData.newCustomerRevenue.toFixed(2)}</CardTitle></CardHeader></Card>
                <Card><CardHeader><CardDescription>Repeat Customers</CardDescription><CardTitle className="text-green-500">{reportData.repeatCustomerCount}</CardTitle></CardHeader></Card>
                 <Card><CardHeader><CardDescription>Revenue from Repeat</CardDescription><CardTitle className="text-green-500">${reportData.repeatCustomerRevenue.toFixed(2)}</CardTitle></CardHeader></Card>
            </div>

            <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><ChartPieIcon className="w-6 h-6"/> Revenue by Customer Type</CardTitle></CardHeader>
                <CardContent>
                {reportData.totalRevenue > 0 ? (
                    <div className="flex flex-col md:flex-row items-center gap-8">
                        <div className="relative w-48 h-48">
                            <svg className="w-full h-full" viewBox="0 0 36 36">
                                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" className="stroke-green-500" strokeWidth="4" />
                                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" className="stroke-blue-500" strokeWidth="4" strokeDasharray={`${newRevenuePercent}, 100`} />
                            </svg>
                             <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                                <span className="text-2xl font-bold text-foreground">${reportData.totalRevenue.toFixed(2)}</span>
                                <span className="text-xs text-muted-foreground">Total Revenue</span>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-center gap-3"><div className="w-4 h-4 rounded-full bg-blue-500"></div><div><p className="font-semibold text-foreground">New Customer Revenue</p><p className="text-lg font-bold text-muted-foreground">${reportData.newCustomerRevenue.toFixed(2)}</p></div></div>
                             <div className="flex items-center gap-3"><div className="w-4 h-4 rounded-full bg-green-500"></div><div><p className="font-semibold text-foreground">Repeat Customer Revenue</p><p className="text-lg font-bold text-muted-foreground">${reportData.repeatCustomerRevenue.toFixed(2)}</p></div></div>
                        </div>
                    </div>
                ) : (
                    <p className="text-center text-muted-foreground py-10">No revenue data available for this period.</p>
                )}
                </CardContent>
            </Card>
        </div>
    );
};

export default RetentionReport;