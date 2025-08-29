

import React from 'react';
import { Order, Location, AppSettings, CartItem, Employee } from '../../types';
import { getPriceForItem } from '../../utils/calculations';

interface TemplateProps {
    order: Order;
    location: Location;
    settings: AppSettings;
    employees: Employee[];
}

const ModernA4Invoice: React.FC<TemplateProps> = ({ order, location, settings, employees }) => {
    const employeeName = (employees || []).find((e: any) => e.id === order.employeeId)?.name || 'N/A';
    const { currency } = location;

    const calculateLineItemTotal = (item: CartItem): number => {
        const itemBasePrice = getPriceForItem(item.menuItem, order.orderType);
        const modifiersTotal = item.selectedModifiers.reduce((acc, mod) => acc + mod.price, 0);
        return (itemBasePrice + modifiersTotal) * item.quantity;
    };

    return (
        <div className="bg-white text-black p-10 font-sans">
            <header style={{ borderTop: `8px solid ${settings.theme.primary}` }} className="pb-8 mb-8">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        {settings.receipt.logoUrl && <img src={settings.receipt.logoUrl} alt="Logo" className="h-20 w-auto" />}
                        <div>
                            <h1 className="text-3xl font-bold">{location.name}</h1>
                            <p className="text-xs text-gray-600">{location.address}</p>
                            <p className="text-xs text-gray-600">{location.phone}</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <h2 className="text-4xl font-light uppercase tracking-widest text-gray-600">Invoice</h2>
                        <p className="text-sm font-semibold mt-2">#{order.invoiceNumber}</p>
                    </div>
                </div>
            </header>

            <section className="flex justify-between mb-10 text-sm">
                <div>
                    <p className="text-gray-600 font-bold">Billed To</p>
                    <p className="text-black">{order.customer?.name || 'Walk-in Customer'}</p>
                    <p className="text-black">{order.customer?.address}</p>
                </div>
                <div className="text-right">
                    <p><span className="text-gray-600 font-bold">Date of Issue:</span> {new Date(order.createdAt).toLocaleDateString()}</p>
                    <p><span className="text-gray-600 font-bold">Order #:</span> {order.orderNumber}</p>
                    <p><span className="text-gray-600 font-bold">Served by:</span> {employeeName}</p>
                </div>
            </section>

            <section>
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b-2 border-gray-300 text-left text-black">
                            <th className="py-3 font-semibold">Description</th>
                            <th className="py-3 font-semibold text-center">Qty</th>
                            <th className="py-3 font-semibold text-right">Unit Price</th>
                            <th className="py-3 font-semibold text-right">Total</th>
                        </tr>
                    </thead>
                    <tbody className="text-black">
                        {order.cart.map(item => (
                            <tr key={item.cartId} className="border-b border-gray-200">
                                <td className="py-3">{item.menuItem.name}</td>
                                <td className="py-3 text-center">{item.quantity}</td>
                                <td className="py-3 text-right">{currency}{getPriceForItem(item.menuItem, order.orderType).toFixed(2)}</td>
                                <td className="py-3 text-right">{currency}{calculateLineItemTotal(item).toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </section>

            <section className="flex justify-end mt-8">
                <div className="w-1/2 text-sm">
                    <div className="flex justify-between py-2 border-b border-gray-200">
                        <span className="text-gray-600">Subtotal</span>
                        <span className="font-semibold text-black">{currency}{order.subtotal.toFixed(2)}</span>
                    </div>
                    {Object.entries(order.taxDetails).map(([name, value]) => (
                        <div key={name} className="flex justify-between py-2 border-b border-gray-200">
                            <span className="text-gray-600">{name}</span>
                            <span className="font-semibold text-black">{currency}{Number(value).toFixed(2)}</span>
                        </div>
                    ))}
                    {order.appliedDiscount && (
                        <div className="flex justify-between py-2 border-b border-gray-200">
                            <span className="text-gray-600">Discount ({order.appliedDiscount.name})</span>
                            <span className="font-semibold text-black">-{currency}{Number(order.appliedDiscount.amount).toFixed(2)}</span>
                        </div>
                    )}
                    <div style={{ backgroundColor: `${settings.theme.primary}1A`, color: settings.theme.primary }} className="flex justify-between py-3 px-4 rounded-lg mt-4">
                        <span className="font-bold text-lg">Amount Due</span>
                        <span className="font-bold text-lg">{currency}{order.total.toFixed(2)}</span>
                    </div>
                </div>
            </section>

            <footer className="mt-20 text-center text-xs text-gray-500">
                <p>{location.invoiceFooterText}</p>
                <p className="mt-2">Powered by ordinopos.com</p>
            </footer>
        </div>
    );
};
export default ModernA4Invoice;