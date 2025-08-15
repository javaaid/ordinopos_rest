
import React, { useState, useMemo } from 'react';
import { Order, PaymentMethod, AppSettings, PaymentType } from '../types';
import BanknotesIcon from './icons/BanknotesIcon';
import DocumentTextIcon from './icons/DocumentTextIcon';
import ArrowPathRoundedSquareIcon from './icons/ArrowPathRoundedSquareIcon';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Input } from './ui/Input';
import { Button } from './ui/Button';

interface FinancialsReportProps {
    orders: Order[];
    settings: AppSettings;
    lastQuickBooksSync: number | null;
    onSyncToQuickBooks: () => Promise<void>;
    allPaymentTypes: PaymentType[];
}

const FinancialsReport: React.FC<FinancialsReportProps> = ({ orders, settings, lastQuickBooksSync, onSyncToQuickBooks, allPaymentTypes }) => {

    const [openingFloat, setOpeningFloat] = useState('0.00');
    const [endingCash, setEndingCash] = useState('0.00');
    const [isSyncing, setIsSyncing] = useState(false);

    const reportSummary = useMemo(() => {
        const safeOrders = orders || [];
        const nonRefundedOrders = safeOrders.filter(o => o.status !== 'refunded');
        
        const grossSales = nonRefundedOrders.reduce((sum, o) => sum + o.subtotal, 0);
        const discounts = nonRefundedOrders.reduce((sum, o) => sum + (o.appliedDiscount?.amount || 0), 0);
        const netSales = grossSales - discounts;
        const taxes = nonRefundedOrders.reduce((sum, o) => sum + o.tax, 0);
        const refunds = safeOrders.reduce((sum, o) => sum + (o.refundedAmount || 0), 0);
        const totalCollections = netSales + taxes - refunds;

        const paymentBreakdown = new Map<PaymentMethod, { total: number; count: number }>();
        (allPaymentTypes || []).forEach(pt => paymentBreakdown.set(pt.name, { total: 0, count: 0 }));

        safeOrders.forEach(order => {
            if(order.status !== 'refunded') {
                order.payments.forEach(payment => {
                    const breakdown = paymentBreakdown.get(payment.method);
                    if (breakdown) {
                        breakdown.total += payment.amount;
                        breakdown.count += 1;
                    } else {
                        paymentBreakdown.set(payment.method, { total: payment.amount, count: 1 });
                    }
                });
            }
        });
        
        safeOrders.forEach(order => {
            if(order.refundedAmount && order.refundedAmount > 0) {
                const originalPaymentMethod = order.payments[0]?.method;
                if(originalPaymentMethod) {
                    const breakdown = paymentBreakdown.get(originalPaymentMethod);
                    if(breakdown) {
                        breakdown.total -= order.refundedAmount;
                    }
                }
            }
        });


        return { grossSales, discounts, netSales, taxes, refunds, totalCollections, paymentBreakdown };
    }, [orders, allPaymentTypes]);


    const handleNumericInputChange = (setter: React.Dispatch<React.SetStateAction<string>>) => (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (/^\d*\.?\d{0,2}$/.test(value)) {
            setter(value);
        }
    };
    
    const handleSyncClick = async () => {
        setIsSyncing(true);
        await onSyncToQuickBooks();
        setIsSyncing(false);
    };

    const cashRefunds = (orders || []).reduce((sum, o) => {
        if (o.refundedAmount && o.payments[0]?.method === 'Cash') {
            return sum + o.refundedAmount;
        }
        return sum;
    }, 0);
    
    const openingFloatNum = parseFloat(openingFloat) || 0;
    const endingCashNum = parseFloat(endingCash) || 0;
    const cashSales = reportSummary.paymentBreakdown.get('Cash')?.total || 0;
    const expectedCash = openingFloatNum + cashSales;
    const difference = endingCashNum - expectedCash;
    
    const summaryItemClass = "flex justify-between items-center py-3 px-4";
    const summaryLabelClass = "text-sm text-muted-foreground";
    const summaryValueClass = "text-md font-semibold text-foreground";

    const { accountingSoftware } = settings;
    const syncButtonText = accountingSoftware === 'none' 
        ? 'Connect Accounting Software' 
        : `Sync to ${accountingSoftware.charAt(0).toUpperCase() + accountingSoftware.slice(1)}`;

    return (
        <div className="w-full">
            <h2 className="text-2xl font-bold text-foreground mb-6">Financial Reports</h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                <div className="lg:col-span-2 space-y-6">
                    <Card>
                         <CardHeader className="flex flex-row justify-between items-center">
                             <CardTitle className="flex items-center gap-2">
                                 <DocumentTextIcon className="w-6 h-6" />
                                 Sales Summary
                            </CardTitle>
                            <div className="flex items-center gap-4">
                                {lastQuickBooksSync && accountingSoftware !== 'none' && (
                                    <p className="text-xs text-muted-foreground">Last synced: {new Date(lastQuickBooksSync).toLocaleTimeString()}</p>
                                )}
                                <Button
                                    onClick={handleSyncClick}
                                    disabled={isSyncing || accountingSoftware === 'none'}
                                    title={accountingSoftware === 'none' ? 'Go to Settings > Integrations to connect.' : ''}
                                    size="sm"
                                >
                                    <ArrowPathRoundedSquareIcon className={`w-5 h-5 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
                                    {isSyncing ? 'Syncing...' : syncButtonText}
                                </Button>
                            </div>
                         </CardHeader>
                        <CardContent className="p-0">
                            <div className="divide-y divide-border">
                                <div className={summaryItemClass}><span className={summaryLabelClass}>Gross Sales</span><span className={summaryValueClass}>${reportSummary.grossSales.toFixed(2)}</span></div>
                                <div className={summaryItemClass}><span className={summaryLabelClass}>Discounts</span><span className={`${summaryValueClass} text-destructive`}>-${reportSummary.discounts.toFixed(2)}</span></div>
                                <div className={`${summaryItemClass} bg-muted/50`}><span className={`${summaryLabelClass} font-bold`}>Net Sales</span><span className={`${summaryValueClass} font-bold`}>${reportSummary.netSales.toFixed(2)}</span></div>
                                <div className={summaryItemClass}><span className={summaryLabelClass}>Taxes</span><span className={summaryValueClass}>${reportSummary.taxes.toFixed(2)}</span></div>
                                <div className={summaryItemClass}><span className={summaryLabelClass}>Refunds</span><span className={`${summaryValueClass} text-destructive`}>-${reportSummary.refunds.toFixed(2)}</span></div>
                                <div className={`${summaryItemClass} bg-muted border-t-2 border-border`}><span className={`${summaryLabelClass} font-bold text-lg`}>Total Collections</span><span className={`${summaryValueClass} text-xl font-bold text-green-600 dark:text-green-500`}>${reportSummary.totalCollections.toFixed(2)}</span></div>
                            </div>
                        </CardContent>
                    </Card>
                     <Card>
                         <CardHeader><CardTitle>Payment Methods</CardTitle></CardHeader>
                          <CardContent className="p-0">
                            <div className="divide-y divide-border">
                                {Array.from(reportSummary.paymentBreakdown.entries()).map(([method, data]) => (
                                    <div key={method} className={summaryItemClass}>
                                        <span className={summaryLabelClass + " capitalize"}>{method} ({data.count} transactions)</span>
                                        <span className={summaryValueClass}>${data.total.toFixed(2)}</span>
                                    </div>
                                ))}
                            </div>
                          </CardContent>
                     </Card>
                </div>

                <Card>
                    <CardHeader><CardTitle className="flex items-center gap-2"><BanknotesIcon className="w-6 h-6" />Cash Drawer</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <label className="text-sm font-medium text-muted-foreground">Opening Float</label>
                            <div className="relative mt-1">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"><span className="text-muted-foreground sm:text-sm">$</span></div>
                                <Input type="text" value={openingFloat} onChange={handleNumericInputChange(setOpeningFloat)} className="pl-7"/>
                            </div>
                        </div>
                        <div className={summaryItemClass}><span className={summaryLabelClass}>+ Cash Payments</span><span className={summaryValueClass}>${(reportSummary.paymentBreakdown.get('Cash')?.total || 0).toFixed(2)}</span></div>
                         <div className={summaryItemClass}><span className={summaryLabelClass}>- Cash Refunds</span><span className={`${summaryValueClass} text-destructive`}>-${cashRefunds.toFixed(2)}</span></div>
                        <hr className="border-border"/>
                         <div className={`${summaryItemClass} bg-muted/50 rounded-md`}><span className={`${summaryLabelClass} font-bold`}>Expected in Drawer</span><span className={`${summaryValueClass} font-bold`}>${expectedCash.toFixed(2)}</span></div>
                        <div>
                            <label className="text-sm font-medium text-muted-foreground">Actual Cash Counted</label>
                             <div className="relative mt-1">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"><span className="text-muted-foreground sm:text-sm">$</span></div>
                                <Input type="text" value={endingCash} onChange={handleNumericInputChange(setEndingCash)} className="pl-7"/>
                            </div>
                        </div>
                        <hr className="border-border"/>
                        <div className={`p-3 rounded-md text-center ${difference === 0 ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                            <p className={`text-sm font-bold ${difference === 0 ? 'text-green-600' : 'text-destructive'}`}>
                                {difference === 0 ? 'Drawer Balanced' : (difference > 0 ? 'Over' : 'Short')}
                            </p>
                            <p className={`text-2xl font-bold ${difference === 0 ? 'text-green-600' : 'text-destructive'}`}>
                                ${Math.abs(difference).toFixed(2)}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default FinancialsReport;
