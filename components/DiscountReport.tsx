
import React, { useMemo } from 'react';
import { Order } from '../types';
import ReceiptPercentIcon from './icons/ReceiptPercentIcon';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/Card';

interface DiscountReportProps {
    orders: Order[];
}

interface BreakdownItem {
    name: string;
    count: number;
    total: number;
}

const DiscountReport: React.FC<DiscountReportProps> = ({ orders }) => {

    const reportData = useMemo(() => {
        const safeOrders = orders || [];
        const discountedOrders = safeOrders.filter(o => o.appliedDiscount);
        const totalDiscountValue = discountedOrders.reduce((sum, o) => sum + (o.appliedDiscount?.amount || 0), 0);
        
        const breakdownMap = new Map<string, BreakdownItem>();

        discountedOrders.forEach(order => {
            if (order.appliedDiscount) {
                const name = order.appliedDiscount.name;
                const current = breakdownMap.get(name) || { name, count: 0, total: 0 };
                current.count += 1;
                current.total += order.appliedDiscount.amount;
                breakdownMap.set(name, current);
            }
        });

        return {
            totalDiscountedOrders: discountedOrders.length,
            totalOrders: safeOrders.length,
            totalDiscountValue,
            breakdown: Array.from(breakdownMap.values()).sort((a,b) => b.total - a.total),
        };
    }, [orders]);
    
    const thClass = "px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider";

    return (
        <div className="w-full">
            <h2 className="text-2xl font-bold text-foreground mb-2 flex items-center gap-3">
                <ReceiptPercentIcon className="w-8 h-8"/>
                Discount & Promotion Report
            </h2>
            <p className="text-sm text-muted-foreground mb-6">Analyze the impact of discounts and promotions on sales.</p>
            
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card>
                    <CardHeader><CardDescription>Total Discounted Value</CardDescription><CardTitle className="text-destructive">${reportData.totalDiscountValue.toFixed(2)}</CardTitle></CardHeader>
                </Card>
                <Card>
                    <CardHeader><CardDescription>Orders with Discounts</CardDescription><CardTitle>{reportData.totalDiscountedOrders}</CardTitle></CardHeader>
                </Card>
                 <Card>
                    <CardHeader><CardDescription>% of Orders with Discount</CardDescription>
                    <CardTitle>
                        {reportData.totalOrders > 0 
                            ? `${((reportData.totalDiscountedOrders / reportData.totalOrders) * 100).toFixed(1)}%`
                            : '0.0%'
                        }
                    </CardTitle>
                    </CardHeader>
                </Card>
            </div>

            <h3 className="text-xl font-bold text-foreground mb-4">Discount Breakdown</h3>
            <div className="overflow-x-auto bg-card rounded-lg border border-border">
                <table className="min-w-full divide-y divide-border">
                    <thead className="bg-muted/50">
                        <tr>
                            <th className={thClass}>Discount/Promotion Name</th>
                            <th className={thClass}>Times Used</th>
                            <th className={thClass}>Total Value Discounted</th>
                        </tr>
                    </thead>
                    <tbody className="bg-card divide-y divide-border">
                        {reportData.breakdown.map(item => (
                            <tr key={item.name} className="hover:bg-muted/50 transition-colors">
                                <td className="px-4 py-3 whitespace-nowrap text-foreground font-medium">{item.name}</td>
                                <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">{item.count}</td>
                                <td className="px-4 py-3 whitespace-nowrap text-destructive font-semibold">${item.total.toFixed(2)}</td>
                            </tr>
                        ))}
                        {reportData.breakdown.length === 0 && (
                            <tr>
                                <td colSpan={3} className="text-center text-muted-foreground p-10">
                                    No discounts were applied in this period.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default DiscountReport;
