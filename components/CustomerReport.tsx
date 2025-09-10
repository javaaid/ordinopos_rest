


import React, { useState, useMemo } from 'react';
import { Order, Customer, Location } from '../types';

interface CustomerReportProps {
    orders: Order[];
    customers: Customer[];
    locations: Location[];
    currentLocationId: string;
}

interface ReportItem {
    id: string;
    name: string;
    orderCount: number;
    totalSpent: number;
    avgSpend: number;
    lastOrderDate: number;
    locationId: string;
}

type SortKey = 'name' | 'orderCount' | 'totalSpent' | 'avgSpend' | 'lastOrderDate';
type SortDirection = 'asc' | 'desc';

const CustomerReport: React.FC<CustomerReportProps> = ({ orders, customers, locations, currentLocationId }) => {
    const [sortKey, setSortKey] = useState<SortKey>('totalSpent');
    const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

    const reportData = useMemo<ReportItem[]>(() => {
        const customerMap = new Map<string, ReportItem>();
        const validOrders = (orders || []).filter(o => o.status !== 'refunded');

        (customers || []).forEach(customer => {
            customerMap.set(customer.id, {
                id: customer.id,
                name: customer.name,
                orderCount: 0,
                totalSpent: 0,
                avgSpend: 0,
                lastOrderDate: 0,
                locationId: customer.locationId,
            });
        });

        validOrders.forEach(order => {
            if (order.customer) {
                const stat = customerMap.get(order.customer.id);
                if (stat) {
                    stat.orderCount += 1;
                    stat.totalSpent += order.total;
                    if (order.createdAt > stat.lastOrderDate) {
                        stat.lastOrderDate = order.createdAt;
                    }
                }
            }
        });
        
        const data = Array.from(customerMap.values());
        data.forEach(stat => {
            if (stat.orderCount > 0) {
                stat.avgSpend = stat.totalSpent / stat.orderCount;
            }
        });
        
        return data.filter(d => d.orderCount > 0); // Only show customers with orders
    }, [orders, customers]);

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
    
    const thClass = "px-4 py-3 text-start text-xs font-semibold text-muted-foreground uppercase tracking-wider cursor-pointer";
    const isAllLocationsView = currentLocationId === 'all_locations';

    return (
        <div className="w-full">
            <h2 className="text-2xl font-bold text-foreground mb-2">Customer Spending Habits</h2>
            <p className="text-sm text-muted-foreground mb-6">Identify frequent buyers, VIP customers, and analyze spending patterns.</p>
            <div className="overflow-x-auto bg-card rounded-lg border border-border">
                <table className="min-w-full divide-y divide-border">
                    <thead className="bg-muted/50">
                        <tr>
                            <th className={thClass} onClick={() => handleSort('name')}>
                                Customer <SortIndicator for_key="name" />
                            </th>
                            {isAllLocationsView && <th className={thClass}>Location</th>}
                            <th className={thClass} onClick={() => handleSort('orderCount')}>
                                Total Orders <SortIndicator for_key="orderCount" />
                            </th>
                            <th className={thClass} onClick={() => handleSort('totalSpent')}>
                                Total Spent <SortIndicator for_key="totalSpent" />
                            </th>
                            <th className="px-4 py-3 text-start text-xs font-semibold text-muted-foreground uppercase tracking-wider cursor-pointer" onClick={() => handleSort('avgSpend')}>
                                Avg. Spend <SortIndicator for_key="avgSpend" />
                            </th>
                            <th className="px-4 py-3 text-start text-xs font-semibold text-muted-foreground uppercase tracking-wider cursor-pointer" onClick={() => handleSort('lastOrderDate')}>
                                Last Order <SortIndicator for_key="lastOrderDate" />
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-card divide-y divide-border">
                        {sortedData.map(customer => (
                            <tr key={customer.id} className="hover:bg-muted/50 transition-colors">
                                <td className="px-4 py-3 whitespace-nowrap text-foreground font-medium">{customer.name}</td>
                                {isAllLocationsView && <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">{(locations || []).find(l => l.id === customer.locationId)?.name}</td>}
                                <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">{customer.orderCount}</td>
                                <td className="px-4 py-3 whitespace-nowrap text-green-500 dark:text-green-400 font-semibold">${customer.totalSpent.toFixed(2)}</td>
                                <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">${customer.avgSpend.toFixed(2)}</td>
                                <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
                                    {new Date(customer.lastOrderDate).toLocaleDateString()}
                                </td>
                            </tr>
                        ))}
                         {sortedData.length === 0 && (
                            <tr>
                                <td colSpan={isAllLocationsView ? 6 : 5} className="text-center text-muted-foreground py-10">
                                    No customer order data available for this period.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default CustomerReport;
