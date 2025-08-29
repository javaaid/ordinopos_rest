

import React from 'react';
import { Order, Location, AppSettings, CartItem, Employee } from '../../types';
import { getPriceForItem } from '../../utils/calculations';

interface TemplateProps {
    order: Order;
    location: Location;
    settings: AppSettings;
    employees: Employee[];
}

const ClassicA4Invoice: React.FC<TemplateProps> = ({ order, location, settings, employees }) => {
    const employeeName = (employees || []).find((e: any) => e.id === order.employeeId)?.name || 'N/A';
    const { currency } = location;

    const calculateLineItemTotal = (item: CartItem): number => {
        const itemBasePrice = getPriceForItem(item.menuItem, order.orderType);
        const modifiersTotal = item.selectedModifiers.reduce((acc, mod) => acc + mod.price, 0);
        return (itemBasePrice + modifiersTotal) * item.quantity;
    };

    return (
        <div className="bg-white text-black p-10 font-serif">
            <header className="text-center mb-10">
                <h1 className="text-4xl font-bold">{location.name}</h1>
                <p className="text-sm">{location.address} | {location.phone}</p>
            </header>
            
            <div className="w-full h-px bg-black mb-4"></div>
            <h2 className="text-2xl font-bold text-center mb-4">INVOICE</h2>
            <div className="w-full h-px bg-black mt-4 mb-8"></div>

            <section className="flex justify-between mb-10 text-sm">
                <div>
                    <p className="font-bold">INVOICE TO:</p>
                    <p>{order.customer?.name || 'Walk-in Customer'}</p>
                </div>
                <div className="text-right">
                    <p><span className="font-bold">Invoice #:</span> {order.invoiceNumber}</p>
                    <p><span className="font-bold">Date:</span> {new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
            </section>

            <section>
                <table className="w-full text-sm">
                    <thead>
                        <tr style={{ backgroundColor: '#eee' }}>
                            <th className="py-2 px-4 text-left font-bold text-black">Item</th>
                            <th className="py-2 px-4 text-center font-bold text-black">Quantity</th>
                            <th className="py-2 px-4 text-right font-bold text-black">Price</th>
                            <th className="py-2 px-4 text-right font-bold text-black">Amount</th>
                        </tr>
                    </thead>
                    <tbody className="text-black">
                        {order.cart.map(item => (
                            <tr key={item.cartId}>
                                <td className="py-2 px-4 border-b">{item.menuItem.name}</td>
                                <td className="py-2 px-4 text-center border-b">{item.quantity}</td>
                                <td className="py-2 px-4 text-right border-b">{currency}{getPriceForItem(item.menuItem, order.orderType).toFixed(2)}</td>
                                <td className="py-2 px-4 text-right border-b">{currency}{calculateLineItemTotal(item).toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </section>

             <section className="flex justify-end mt-8">
                <div className="w-1/2 text-sm">
                    <div className="flex justify-between py-1"><p>Subtotal:</p><p>{currency}{order.subtotal.toFixed(2)}</p></div>
                    {Object.entries(order.taxDetails).map(([name, value]) => (<div key={name} className="flex justify-between py-1"><p>{name}:</p><p>{currency}{Number(value).toFixed(2)}</p></div>))}
                    {order.appliedDiscount && (<div className="flex justify-between py-1"><p>Discount:</p><p>-{currency}{Number(order.appliedDiscount.amount).toFixed(2)}</p></div>)}
                    <div className="w-full h-px bg-black my-2"></div>
                    <div className="flex justify-between font-bold text-lg"><p>TOTAL:</p><p>{currency}{order.total.toFixed(2)}</p></div>
                </div>
            </section>

            <footer className="mt-20 text-center text-xs text-gray-500">
                <p>{location.invoiceFooterText}</p>
                <p className="mt-2">Powered by ordinopos.com</p>
            </footer>
        </div>
    );
};
export default ClassicA4Invoice;