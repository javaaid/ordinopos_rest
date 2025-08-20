

import React from 'react';
import { Order, Location, AppSettings, CartItem } from '../../types';
import { getPriceForItem, generateZatcaQRCode } from '../../utils/calculations';
import { useDataContext } from '../../contexts/AppContext';
import QRCode from 'react-qr-code';

interface TemplateProps {
    format: 'thermal' | 'a4';
    order: Order;
    location: Location;
    settings: AppSettings;
}

const BilingualText: React.FC<{ en: string; ar: string; className?: string }> = ({ en, ar, className }) => (
    <div className={`flex justify-between items-baseline ${className}`}>
        <span>{en}</span>
        <span className="font-['Amiri']">{ar}</span>
    </div>
);

// Seedable random number generator for consistent barcodes
const seededRandom = (seed: number) => {
    let x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
};

// --- Standard Template ---
const StandardTemplate: React.FC<TemplateProps> = ({ format, order, location, settings }) => {
    const { employees } = useDataContext();
    const employeeName = employees.find((e: any) => e.id === order.employeeId)?.name?.split(' ')[0] || 'Admin';
    const { currency } = location;
    const line = '-'.repeat(42);
    
    const calculateLineItemTotal = (item: CartItem): number => {
        const itemBasePrice = getPriceForItem(item.menuItem, order.orderType);
        const modifiersTotal = item.selectedModifiers.reduce((acc, mod) => acc + mod.price, 0);
        return (itemBasePrice + modifiersTotal) * item.quantity;
    };

    if (format === 'a4') {
        return <div className="p-8">Standard A4 Invoice coming soon.</div>; // Placeholder for A4
    }

    // Thermal Format
    return (
        <div className="font-mono bg-white text-black p-2 text-xs">
            <div className="text-center mb-2">
                {settings.receipt.logoUrl && <img src={settings.receipt.logoUrl} alt="Logo" className="mx-auto h-16 w-auto mb-2" />}
                <h2 className="text-lg font-bold">{location.name}</h2>
            </div>
            <p className="whitespace-pre">{line}</p>
            <div className="text-xs">
                <div className="flex justify-between"><span>Invoice:</span><span>{order.invoiceNumber}</span></div>
                <div className="flex justify-between"><span>Date:</span><span>{new Date(order.createdAt).toLocaleString()}</span></div>
                <div className="flex justify-between"><span>Staff:</span><span>{employeeName}</span></div>
            </div>
            <p className="whitespace-pre">{line}</p>
            <div className="my-1">
                {order.cart.map(item => (
                    <div key={item.cartId} className="mb-1">
                        <p>{item.quantity}x {item.menuItem.name}</p>
                        <div className="flex justify-between">
                            <span>@{currency}{getPriceForItem(item.menuItem, order.orderType).toFixed(2)}</span>
                            <span className="font-semibold">{currency}{calculateLineItemTotal(item).toFixed(2)}</span>
                        </div>
                    </div>
                ))}
            </div>
            <p className="whitespace-pre">{line}</p>
            <div className="text-xs space-y-0.5">
                <div className="flex justify-between"><span>Subtotal:</span><span>{currency}{order.subtotal.toFixed(2)}</span></div>
                {settings.advancedPOS.showTaxOnReceipt && order.taxDetails ? (
                    Object.entries(order.taxDetails).map(([name, value]) => (
                        <div key={name} className="flex justify-between">
                            <span>{name}</span>
                            <span>{currency}{Number(value).toFixed(2)}</span>
                        </div>
                    ))
                ) : (
                    <div className="flex justify-between"><span>Tax:</span><span>{currency}{order.tax.toFixed(2)}</span></div>
                )}
                <div className="flex justify-between font-bold text-base mt-1"><span>TOTAL:</span><span>{currency}{order.total.toFixed(2)}</span></div>
            </div>
             <div className="text-xs text-center mt-2"><p>{settings.receipt.promoMessage}</p></div>
             <div className="text-center text-[8px] mt-2"><p>Powered by ordinopos.com</p></div>
        </div>
    );
};

// --- Compact Template ---
const CompactTemplate: React.FC<TemplateProps> = ({ format, order, location, settings }) => {
     if (format === 'a4') {
        return <div className="p-8">Compact A4 Invoice coming soon.</div>;
    }
    // Thermal Format
    return (
        <div className="font-mono bg-white text-black p-1 text-[10px] leading-tight">
             <div className="text-center mb-1">
                <h2 className="text-base font-bold">{location.name}</h2>
                <p>{new Date(order.createdAt).toLocaleString()}</p>
            </div>
            <hr className="border-dashed border-black my-1" />
             {order.cart.map(item => (
                <div key={item.cartId} className="flex justify-between">
                    <span>{item.quantity} {item.menuItem.name}</span>
                    <span>${(item.menuItem.price * item.quantity).toFixed(2)}</span>
                </div>
            ))}
            <hr className="border-dashed border-black my-1" />
            <div className="flex justify-between"><p>Subtotal</p><p>${order.subtotal.toFixed(2)}</p></div>
            <div className="flex justify-between"><p>Tax</p><p>${order.tax.toFixed(2)}</p></div>
            <div className="flex justify-between font-bold text-base"><p>Total</p><p>${order.total.toFixed(2)}</p></div>
            <p className="text-center text-[8px] mt-1">{settings.receipt.promoMessage}</p>
            <p className="text-center text-[8px] mt-1">Powered by ordinopos.com</p>
        </div>
    );
};

// --- ZATCA Bilingual Template ---
const ZatcaBilingualTemplate: React.FC<TemplateProps> = ({ format, order, location, settings }) => {
    const isSaudiOrder = location.countryCode === 'SA' && !!location.vatNumber && settings.zatca.enabled;
    const showZatcaQR = isSaudiOrder && order.balanceDue <= 0;
    const zatcaQRData = showZatcaQR ? generateZatcaQRCode(order, location) : '';
    const currency = isSaudiOrder ? 'SAR' : location.currency;

    if (format === 'a4') {
        // This component is for THERMAL receipts. A4 is handled elsewhere.
        // We render a simple placeholder for preview consistency if called incorrectly.
        return <div className="p-8">A4 preview is handled by a different component.</div>;
    }

    // Thermal ZATCA Receipt
     return (
        <div dir="rtl" className="font-mono bg-white text-black p-2 text-xs font-['Amiri']">
            <link href="https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&display=swap" rel="stylesheet" />
            <div className="text-center mb-2">
                <h2 className="text-lg font-bold">{location.name}</h2>
                <p>{location.address}</p>
                <p>Tax No: {location.vatNumber}</p>
                <p className="font-bold mt-1">فاتورة ضريبية مبسطة</p>
                <p className="font-sans text-[10px]">Simplified Tax Invoice</p>
            </div>
            <hr className="border-dashed border-black my-1" />
            <div className="flex justify-between"><span>{order.invoiceNumber}</span><span>:رقم الفاتورة</span></div>
            <div className="flex justify-between"><span>{new Date(order.createdAt).toLocaleString()}</span><span>:التاريخ</span></div>
            <hr className="border-dashed border-black my-1" />
            <div className="text-center font-bold">Items / الأصناف</div>
            {order.cart.map(item => (
                <div key={item.cartId} className="text-right">
                    <p>{item.quantity}x {item.menuItem.name}</p>
                    <div className="flex justify-between"><span>{currency} {(item.menuItem.price * item.quantity).toFixed(2)}</span><span>السعر</span></div>
                </div>
            ))}
             <hr className="border-dashed border-black my-1" />
            <div className="flex justify-between"><span>{currency} {order.subtotal.toFixed(2)}</span><span>المجموع الفرعي</span></div>
            <div className="flex justify-between"><span>{currency} {order.tax.toFixed(2)}</span><span>ضريبة القيمة المضافة (15%)</span></div>
            <div className="flex justify-between font-bold text-base"><span>{currency} {order.total.toFixed(2)}</span><span>الإجمالي</span></div>
             {showZatcaQR && zatcaQRData && (<div className="flex flex-col items-center mt-2"><QRCode value={zatcaQRData} size={settings.zatca.qrCodeSize} level="L" /></div>)}
             <div className="text-center text-xs mt-2"><p className="font-sans">Powered by ordinopos.com</p></div>
        </div>
    );
};

const templates: Record<string, React.FC<TemplateProps>> = {
    standard: StandardTemplate,
    compact: CompactTemplate,
    zatca_bilingual: ZatcaBilingualTemplate,
};

const TemplateRenderer: React.FC<TemplateProps> = (props) => {
    const templateId = props.settings.receipt.template || 'standard';
    const Component = templates[templateId] || StandardTemplate;
    return <Component {...props} />;
};

export default TemplateRenderer;