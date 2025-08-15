import React, { useMemo } from 'react';
import { Order, KitchenPrintSettings, Table } from '../types';
import { useDataContext } from '../contexts/AppContext';

// Seedable random number generator for consistent barcodes
const seededRandom = (seed: number) => {
    let x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
};

export const KitchenReceiptContent: React.FC<{ order: Partial<Order>; isPrintable: boolean; settings: KitchenPrintSettings; profileName: string; }> = ({ order, isPrintable, settings, profileName }) => {
    const { tables, employees } = useDataContext();
    const table = order.tableId ? tables.find((t: Table) => t.id === order.tableId) : null;
    
    const employeeName = useMemo(() => {
        if (!order.employeeId) return 'SYSTEM';
        const employee = employees.find((e: any) => e.id === order.employeeId);
        return employee?.name?.split(' ')[0] || 'N/A';
    }, [order.employeeId, employees]);

    const barcodeSeed = useMemo(() => {
        if (!order.invoiceNumber) return 0;
        return order.invoiceNumber.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    }, [order.invoiceNumber]);

    return (
        <div className={`font-mono text-sm ${isPrintable ? 'bg-white text-black p-2' : 'bg-white p-4 rounded-md overflow-y-auto max-h-64 text-black text-xs'}`}>
            <h1 className={`font-bold text-center ${isPrintable ? 'text-lg' : 'text-sm'}`}>** {profileName.toUpperCase()} **</h1>
            {settings.headerLines.map((line, i) => line && <p key={i} className="text-center">{line}</p>)}
            {settings.showOrderNumber && <p className="text-center font-bold">Order #{order.orderNumber}</p>}
            {settings.showInvoiceNumber && <p className="text-center">Invoice: {order.invoiceNumber}</p>}
            {settings.showTable && table && <p className="text-center font-bold">Table: {table.name}</p>}
            {settings.showGuests && order.guestCount && <p className="text-center font-bold">Guests: {order.guestCount}</p>}
            {settings.showCustomer && order.customer && <p className="text-center">Customer: {order.customer.name}</p>}
            {settings.showStaff && <p className="text-center">Staff: {employeeName}</p>}
            {settings.showOrderTime && <p className="text-center text-xs">{new Date(order.createdAt!).toLocaleTimeString()}</p>}
            <hr className="border-dashed border-black my-2" />
            {(order.cart || []).map(item => (
                <div key={item.cartId} className="mb-2">
                    <div className="flex justify-between">
                        <p className={`${isPrintable ? 'text-base' : ''} font-bold whitespace-pre-wrap`}>{item.quantity}x {item.menuItem.name}</p>
                        {settings.showUnitPrice && <p className={`${isPrintable ? 'text-base' : ''} font-bold`}>${item.menuItem.price.toFixed(2)}</p>}
                    </div>
                    {settings.showKitchenNote && item.selectedModifiers.length > 0 && (
                        <p className="pl-4 text-xs whitespace-pre-wrap">
                            {item.selectedModifiers.map(m => `+ ${m.name}`).join('\n')}
                        </p>
                    )}
                </div>
            ))}
             <hr className="border-dashed border-black my-2" />
            {settings.showTotalQuantity && (
                <div className="flex justify-between font-bold">
                    <span>Total Items:</span>
                    <span>{(order.cart || []).reduce((s, i) => s + i.quantity, 0)}</span>
                </div>
            )}
            {settings.showBarcode && order.invoiceNumber && (
                 <div className="flex flex-col items-center mt-2">
                    <div className="flex space-x-px h-8 w-4/5 items-end">
                        {(order.invoiceNumber.repeat(5)).split('').map((_, i) => (<div key={i} className="bg-black" style={{ width: `${seededRandom(barcodeSeed + i) * 1.5 + 0.5}px`, height: `${seededRandom(barcodeSeed - i) * 60 + 20}%` }}></div>))}
                    </div>
                    <p className="text-[8px] font-mono tracking-widest mt-1">{order.invoiceNumber}</p>
                </div>
            )}
            <div className="text-center mt-2">
                 {settings.footerLines.map((l, i) => l && <p key={i}>{l}</p>)}
            </div>
        </div>
    );
};
