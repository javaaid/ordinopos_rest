

import React from 'react';
import { Order, Location, AppSettings, CartItem, Employee } from '../../types';
import { getPriceForItem, generateZatcaQRCode } from '../../utils/calculations';
import QRCode from 'react-qr-code';

interface TemplateProps {
    order: Order;
    location: Location;
    settings: AppSettings;
    employees: Employee[];
}

const BilingualText: React.FC<{ en: string; ar: string; className?: string }> = ({ en, ar, className }) => (
    <div className={`flex justify-between items-baseline ${className}`}>
        <span className="text-left flex-1">{en}</span>
        <span className="font-['Amiri'] text-right flex-1">{ar}</span>
    </div>
);

const ZatcaA4Invoice: React.FC<TemplateProps> = ({ order, location, settings, employees }) => {
    const employeeName = (employees || []).find((e: any) => e.id === order.employeeId)?.name || 'N/A';
    
    const isSaudiOrder = location.countryCode === 'SA' && !!location.vatNumber && settings.zatca.enabled;
    const currency = isSaudiOrder ? 'SAR' : location.currency;

    const showZatcaQR = isSaudiOrder && order.balanceDue <= 0;
    const zatcaQRData = showZatcaQR ? generateZatcaQRCode(order, location) : '';

    const calculateLineItemTotal = (item: CartItem): number => {
        const itemBasePrice = getPriceForItem(item.menuItem, order.orderType);
        const modifiersTotal = item.selectedModifiers.reduce((acc, mod) => acc + mod.price, 0);
        return (itemBasePrice + modifiersTotal) * item.quantity;
    };

    return (
        <div dir="rtl" className="bg-white text-black p-10 font-sans">
            <link href="https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&display=swap" rel="stylesheet" />

            <header className="flex justify-between items-start pb-8 mb-4 border-b">
                <div className="w-full">
                    <BilingualText en={location.name} ar={location.name} className="text-2xl font-bold" />
                    <p className="text-xs text-gray-600 text-left">{location.address}</p>
                    <BilingualText en={`Tax No.: ${location.vatNumber}`} ar={`الرقم الضريبي: ${location.vatNumber}`} className="text-xs text-gray-600" />
                </div>
            </header>
             <div className="flex justify-center my-4">
                {showZatcaQR && zatcaQRData && <QRCode value={zatcaQRData} size={100} level="L" />}
            </div>
            
            <div className="text-center mb-8">
                <h1 className="text-2xl font-bold font-['Amiri']">فاتورة ضريبية مبسطة</h1>
                <h2 className="text-lg font-bold tracking-wider">SIMPLIFIED TAX INVOICE</h2>
            </div>
            
            <section className="flex justify-between mb-8 text-sm">
                <div>
                    <p className="font-bold text-gray-600 text-right"><span className="font-['Amiri']">فاتورة إلى</span> / Billed To</p>
                    <p className="text-right">{order.customer?.name || 'Walk-in Customer'}</p>
                </div>
                <div className="text-left">
                    <p><span className="font-['Amiri']">رقم الفاتورة</span> / <span className="font-bold text-gray-600">Invoice #</span>: {order.invoiceNumber}</p>
                    <p><span className="font-['Amiri']">التاريخ</span> / <span className="font-bold text-gray-600">Date</span>: {new Date(order.createdAt).toISOString().slice(0, 10)}</p>
                </div>
            </section>
            
            <section>
                <table className="w-full text-sm">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="p-2 text-left text-black font-bold">Item</th>
                            <th className="p-2 text-center text-black font-bold">Qty</th>
                            <th className="p-2 text-right text-black font-bold">Price</th>
                            <th className="p-2 text-right text-black font-bold">Total</th>
                            <th className="p-2 text-right text-black font-bold font-['Amiri']">الصنف</th>
                        </tr>
                    </thead>
                    <tbody className="text-black">
                        {order.cart.map(item => (
                            <tr key={item.cartId} className="border-b">
                                <td className="p-2 text-left">{item.menuItem.name}</td>
                                <td className="p-2 text-center">{item.quantity}</td>
                                <td className="p-2 text-right">{currency} {getPriceForItem(item.menuItem, order.orderType).toFixed(2)}</td>
                                <td className="p-2 text-right">{currency} {calculateLineItemTotal(item).toFixed(2)}</td>
                                <td className="p-2 text-right font-['Amiri']">{item.menuItem.name}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </section>

            <section className="flex justify-start mt-8">
                <div className="w-1/2 text-sm space-y-2">
                    <BilingualText en="Total (Excluding VAT)" ar="الإجمالي (غير شامل ضريبة القيمة المضافة)" />
                    <p className="text-left">{currency} {order.subtotal.toFixed(2)}</p>
                    <BilingualText en="Total VAT (15%)" ar="مجموع ضريبة القيمة المضافة" />
                    <p className="text-left">{currency} {order.tax.toFixed(2)}</p>
                    <div className="w-full h-px bg-black my-2"></div>
                    <BilingualText en="Total Amount Due" ar="المبلغ الإجمالي المستحق" className="font-bold text-lg" />
                    <p className="text-left font-bold text-lg">{currency} {order.total.toFixed(2)}</p>
                </div>
            </section>
            <footer className="mt-20 text-center text-xs text-gray-500">
                <p>Powered by ordinopos.com</p>
            </footer>
        </div>
    );
};
export default ZatcaA4Invoice;