
import React, { useState, useEffect, useMemo } from 'react';
import { Printer, PrinterReceiptSettings, Order, Location, PrinterConnectionType, KitchenPrintSettings, KitchenProfileType, PrintJob } from '../types';
import ArrowLeftIcon from './icons/ArrowLeftIcon';
import { DEFAULT_RECEIPT_SETTINGS, DEFAULT_KITCHEN_PRINT_SETTINGS } from '../constants';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Select } from './ui/Select';
import PingButton from './PingButton';
import { useAppContext } from '../contexts/AppContext';

// Dummy data for previews
const DUMMY_ORDER: Partial<Order> = {
    invoiceNumber: "A-00001", orderNumber: "001", createdAt: new Date("2025-07-31T13:41:14Z").getTime(),
    customer: { id: 'cust_1', name: 'John Doe', phone: '555-1234', email: 'john.d@example.com', address: '123 Main St', locationId: 'loc_1' },
    employeeId: 'emp_4', guestCount: 2,
    cart: [
        { cartId: '1', menuItem: { id: 9, name: 'Classic Cheeseburger', price: 15.99 } as any, quantity: 1, selectedModifiers: [{name: 'Well Done', price: 0}, {name: 'No Onions', price: 0}] },
        { cartId: '2', menuItem: { id: 28, name: 'Coca-Cola', price: 3.50 } as any, quantity: 2, selectedModifiers: [] },
        { cartId: '3', menuItem: { id: 99, name: 'Ketchup Packet', price: 0 } as any, quantity: 1, selectedModifiers: [] },
    ],
    subtotal: 22.99, tax: 2.30, total: 25.29, payments: [{ method: 'Cash', amount: 30.00, timestamp: Date.now() }], tableId: 't1'
};

const DUMMY_LOCATION: Partial<Location> = { name: "Company Name", address: "123 Main Street\nAnytown, USA 12345", phone: "(555) 123-4567", currency: '$' };

interface PrinterSettingsViewProps {
    printer: Printer | null;
    onBack: () => void;
    onSave: (printer: Printer) => void;
}

// Seedable random number generator for consistent barcodes
const seededRandom = (seed: number) => {
    let x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
};

const ReceiptPreview: React.FC<{ settings: PrinterReceiptSettings, paperWidth: number }> = ({ settings, paperWidth }) => {
    const { currency } = DUMMY_LOCATION;
    const line = '-'.repeat(paperWidth === 48 ? 32 : 42);
    const textStyle: React.CSSProperties = { fontSize: `${settings.fontSize}rem`, lineHeight: 1.5, };
    const employeeName = 'Sally';
    const table = { name: 'T1' };
    
    const barcodeSeed = useMemo(() => {
      return (DUMMY_ORDER.invoiceNumber || "").split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    }, []);

    const cartToDisplay = useMemo(() => {
        if (settings.showZeroPriceItems) {
            return DUMMY_ORDER.cart || [];
        }
        return (DUMMY_ORDER.cart || []).filter(item => {
            const lineItemTotal = (item.menuItem.price * item.quantity) + item.selectedModifiers.reduce((acc, mod) => acc + mod.price, 0);
            return lineItemTotal > 0;
        });
    }, [settings.showZeroPriceItems, DUMMY_ORDER.cart]);

    return (
        <div style={textStyle} className="p-4 bg-white text-black font-mono text-xs w-full h-full">
            <div className="text-center mb-2">
                {settings.headerLogoUrl && <img src={settings.headerLogoUrl} alt="Header Logo" className="mx-auto h-12 w-auto object-contain mb-2" />}
                {settings.headerLines.map((line, i) => line && <p key={i}>{line}</p>)}
            </div>
            <p className="whitespace-pre">{line}</p>
            <div className="text-xs">
                {settings.showInvoiceNumber && <div className="flex justify-between"><span>Invoice:</span><span>{DUMMY_ORDER.invoiceNumber}</span></div>}
                <div className="flex justify-between"><span>Date:</span><span>{new Date(DUMMY_ORDER.createdAt!).toLocaleDateString()}</span></div>
                {settings.showOrderTime && <div className="flex justify-between"><span>Time:</span><span>{new Date(DUMMY_ORDER.createdAt!).toLocaleTimeString()}</span></div>}
                {settings.showStaff && <div className="flex justify-between"><span>Staff:</span><span>{employeeName}</span></div>}
                {settings.showOrderNumber && <div className="flex justify-between"><span>Order:</span><span>{DUMMY_ORDER.orderNumber}</span></div>}
                {settings.showTable && DUMMY_ORDER.tableId && <div className="flex justify-between"><span>Table:</span><span>{table.name}</span></div>}
                {settings.showGuests && DUMMY_ORDER.guestCount && <div className="flex justify-between"><span>Guests:</span><span>{DUMMY_ORDER.guestCount}</span></div>}
                {settings.showCustomer && DUMMY_ORDER.customer && <p>Customer: {DUMMY_ORDER.customer.name}</p>}
            </div>
            <p className="whitespace-pre">{line}</p>
            <div className="my-1">
                {cartToDisplay.map((item, index) => {
                    const lineItemTotal = (item.menuItem.price + item.selectedModifiers.reduce((acc, mod) => acc + mod.price, 0)) * item.quantity;
                    const quantityText = settings.showItemQuantity ? `${item.quantity}x ` : '';
                    return (
                        <div key={item.cartId} className="mb-1">
                            <p>
                                {settings.showItemIndex && `${index + 1}. `}
                                {settings.showQuantityBeforeItem && quantityText}
                                {item.menuItem.name}
                            </p>
                            <div className="flex justify-between">
                                <span>
                                    {!settings.showQuantityBeforeItem && quantityText}
                                    {settings.showUnitPrice && `${currency}${item.menuItem.price.toFixed(2)}`}
                                </span>
                                <span className="font-semibold">{currency}{lineItemTotal.toFixed(2)}</span>
                            </div>
                            {settings.showKitchenNote && item.selectedModifiers.length > 0 && (
                                <p className="pl-4 text-xs italic text-gray-600">
                                    {item.selectedModifiers.map(m => `+ ${m.name}`).join(', ')}
                                </p>
                            )}
                        </div>
                    );
                })}
            </div>
            <p className="whitespace-pre">{line}</p>
            <div className="text-xs space-y-0.5">
                {settings.showTotalQuantity && <div className="flex justify-between"><span>Total Items:</span><span>{DUMMY_ORDER.cart?.reduce((s, i) => s + i.quantity, 0)}</span></div>}
                <div className="flex justify-between"><span>Subtotal:</span><span>{currency}{DUMMY_ORDER.subtotal?.toFixed(2)}</span></div>
                <div className="flex justify-between"><span>Tax:</span><span>{currency}{DUMMY_ORDER.tax?.toFixed(2)}</span></div>
                <div className="flex justify-between font-bold text-base mt-1"><span>TOTAL:</span><span>{currency}{DUMMY_ORDER.total?.toFixed(2)}</span></div>
            </div>
            <p className="whitespace-pre">{line}</p>
            <div className="text-xs">
                {DUMMY_ORDER.payments?.map((p, i) => (<div key={i} className="flex justify-between"><span>{p.method}:</span><span>{currency}{p.amount.toFixed(2)}</span></div>))}
                <div className="flex justify-between"><span>Change:</span><span>{currency}{(30.00 - DUMMY_ORDER.total!).toFixed(2)}</span></div>
            </div>
            
            {settings.showBarcode && DUMMY_ORDER.invoiceNumber && (
                <div className="flex flex-col items-center mt-2">
                    <div className="flex space-x-px h-12 items-stretch">
                        {(DUMMY_ORDER.invoiceNumber.repeat(5)).split('').map((_, i) => (<div key={i} className="bg-black" style={{ width: `${seededRandom(barcodeSeed + i) * 2 + 0.5}px` }}></div>))}
                    </div>
                    <p className="text-xs font-mono tracking-widest mt-1">{DUMMY_ORDER.invoiceNumber}</p>
                </div>
            )}

            {settings.showTipGuide && (
                <div className="text-center text-xs mt-2">
                    <p className="font-bold">Tip Guide:</p>
                    <div className="flex justify-center gap-2">
                        <span>15%: {currency}{(DUMMY_ORDER.total! * 0.15).toFixed(2)}</span>
                        <span>18%: {currency}{(DUMMY_ORDER.total! * 0.18).toFixed(2)}</span>
                        <span>20%: {currency}{(DUMMY_ORDER.total! * 0.20).toFixed(2)}</span>
                    </div>
                </div>
            )}
            <div className="text-xs text-center mt-2">
                {settings.footerLines.map((line, i) => line && <p key={i}>{line}</p>)}
                {settings.footerLogoUrl && <img src={settings.footerLogoUrl} alt="Footer Logo" className="mx-auto h-8 w-auto object-contain mt-2" />}
            </div>
        </div>
    );
};

const KitchenReceiptPreview: React.FC<{ settings: KitchenPrintSettings, paperWidth: number, profileName: string }> = ({ settings, paperWidth, profileName }) => {
    const textStyle: React.CSSProperties = { fontSize: `${settings.fontSize}rem`, lineHeight: 1.5, };
    const employeeName = 'Walter';
    const table = { name: 'Sun Room' };

    return (
        <div style={textStyle} className="p-4 bg-white text-black font-mono w-full h-full">
            <div className="text-center font-bold text-lg">
                <p>*** {profileName.toUpperCase()} ***</p>
                {settings.headerLines.map((line, i) => line && <p key={i}>{line}</p>)}
            </div>
            <hr className="border-dashed border-black my-2" />
            <div>
                 {settings.showOrderNumber && <div className="flex justify-between font-bold"><span>Order:</span><span>{DUMMY_ORDER.orderNumber}</span></div>}
                 {settings.showInvoiceNumber && <div className="flex justify-between"><span>Invoice:</span><span>{DUMMY_ORDER.invoiceNumber}</span></div>}
                 {settings.showStaff && <div className="flex justify-between"><span>Staff:</span><span>{employeeName}</span></div>}
                 {settings.showOrderTime && <div className="flex justify-between"><span>Time:</span><span>{new Date(DUMMY_ORDER.createdAt!).toLocaleTimeString()}</span></div>}
                 {settings.showTable && DUMMY_ORDER.tableId && <div className="flex justify-between font-bold"><span>Table:</span><span>{table.name}</span></div>}
                 {settings.showGuests && DUMMY_ORDER.guestCount && <div className="flex justify-between"><span>Guests:</span><span>{DUMMY_ORDER.guestCount}</span></div>}
                 {settings.showCustomer && DUMMY_ORDER.customer && <div className="flex justify-between"><span>Customer:</span><span>{DUMMY_ORDER.customer.name}</span></div>}
            </div>
            <hr className="border-dashed border-black my-2" />
            <div className="space-y-2">
                {DUMMY_ORDER.cart?.map((item, index) => (
                    <div key={item.cartId}>
                        <div className="flex justify-between">
                            <p className="text-base font-bold whitespace-pre-wrap">{item.quantity}x {item.menuItem.name}</p>
                            {settings.showUnitPrice && <p className="text-base font-bold">${item.menuItem.price.toFixed(2)}</p>}
                        </div>
                        {settings.showKitchenNote && item.selectedModifiers.length > 0 && (
                            <p className="pl-4 text-xs whitespace-pre-wrap">
                                {item.selectedModifiers.map(m => `+ ${m.name}`).join('\n')}
                            </p>
                        )}
                    </div>
                ))}
            </div>
            <hr className="border-dashed border-black my-2" />
            {settings.showTotalQuantity && (
                <div className="flex justify-between font-bold">
                    <span>Total Items:</span>
                    <span>{DUMMY_ORDER.cart?.reduce((s, i) => s + i.quantity, 0)}</span>
                </div>
            )}
        </div>
    )
}

const Toggle: React.FC<{ label: string; enabled: boolean; onToggle: () => void; }> = ({ label, enabled, onToggle }) => (
    <label className="flex items-center justify-between p-2 rounded-md bg-background cursor-pointer border border-border">
        <span className="text-sm font-medium text-secondary-foreground">{label}</span>
        <button type="button" onClick={onToggle} className={`relative inline-flex items-center h-5 w-9 transition-colors rounded-full ${enabled ? 'bg-primary' : 'bg-muted'}`}>
            <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${enabled ? 'translate-x-5' : 'translate-x-0.5'}`}/>
        </button>
    </label>
);


const PrinterSettingsView: React.FC<PrinterSettingsViewProps> = ({ printer, onBack, onSave }) => {
    const { addPrintJobs } = useAppContext();
    const [activeTab, setActiveTab] = useState<'connection' | 'layout'>('connection');
    const [formData, setFormData] = useState<Partial<Printer>>({});
    
    useEffect(() => {
        if (printer) {
            setFormData({
                ...printer,
                receiptSettings: printer.receiptSettings ? { ...DEFAULT_RECEIPT_SETTINGS, ...printer.receiptSettings } : undefined,
            });
        } else {
            setFormData({
                status: 'connected', name: 'New Receipt Printer', connection: 'ESC/POS Printer Wifi/Lan', type: 'thermal', ipAddress: '192.168.1.100', port: 9100, paperWidth: 48, hasDrawer: true,
                receiptSettings: DEFAULT_RECEIPT_SETTINGS
            });
        }
    }, [printer]);

    const isKitchenPrinter = useMemo(() => formData.receiptSettings == null && !!formData.kitchenProfiles, [formData]);

    const currentSettings = useMemo(() => {
        // A printer is either a receipt printer or a kitchen printer.
        // The presence of `receiptSettings` is the definitive check.
        if (formData.receiptSettings != null) {
            return { ...DEFAULT_RECEIPT_SETTINGS, ...formData.receiptSettings };
        }
        
        // Otherwise, assume it's a kitchen printer.
        if (formData.kitchenProfiles) {
            const profileKey = Object.keys(formData.kitchenProfiles)[0] as KitchenProfileType | undefined;
            // This handles cases where profileKey is undefined (empty profiles object) or the profile itself is null.
            const profileSettings = profileKey ? formData.kitchenProfiles[profileKey] : null;
            return { ...DEFAULT_KITCHEN_PRINT_SETTINGS, ...(profileSettings || {}) };
        }
    
        // Ultimate fallback for new/undefined printers
        return DEFAULT_RECEIPT_SETTINGS;
    }, [formData]);

    const handleBaseChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const isNum = type === 'number';

        setFormData(prev => {
            const newState = { ...prev, [name]: isNum ? parseInt(value) : value };
            if (name === 'connection' && value !== 'ESC/POS Printer Wifi/Lan') newState.port = undefined;
            if (name === 'connection' && value === 'ESC/POS Printer Wifi/Lan') newState.port = newState.port || 9100;
            return newState;
        });
    };
    
    const handleLayoutChange = (updates: Partial<PrinterReceiptSettings | KitchenPrintSettings>) => {
        if (formData.receiptSettings) {
            setFormData(prev => ({ ...prev, receiptSettings: { ...(prev.receiptSettings || DEFAULT_RECEIPT_SETTINGS), ...updates } }));
        } else if (formData.kitchenProfiles) {
            const profileKey = Object.keys(formData.kitchenProfiles)[0] as KitchenProfileType;
            if (profileKey) {
                setFormData(prev => ({
                    ...prev,
                    kitchenProfiles: {
                        ...prev.kitchenProfiles,
                        [profileKey]: { ...(prev.kitchenProfiles?.[profileKey] || DEFAULT_KITCHEN_PRINT_SETTINGS), ...updates }
                    }
                }));
            }
        }
    };

    const handleLineChange = (type: 'headerLines' | 'footerLines', index: number, value: string) => {
        const currentLines = currentSettings?.[type] || [];
        const newLines = [...currentLines];
        newLines[index] = value;
        handleLayoutChange({ [type]: newLines });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData as Printer);
    };

    const handleToggle = (key: keyof PrinterReceiptSettings | keyof KitchenPrintSettings) => {
        handleLayoutChange({ [key]: !currentSettings[key as keyof typeof currentSettings] });
    };

    const handleTestPrint = () => {
        if (isKitchenPrinter) {
            const newJob: Omit<PrintJob, 'id' | 'timestamp' | 'status'> = {
                component: 'KitchenReceiptContent',
                props: { order: DUMMY_ORDER, isPrintable: true, settings: currentSettings, profileName: formData.name || 'Test' }
            };
            addPrintJobs([newJob]);
        } else {
             const newJob: Omit<PrintJob, 'id' | 'timestamp' | 'status'> = {
                component: 'TemplateRenderer',
                props: {
                    order: DUMMY_ORDER,
                    location: DUMMY_LOCATION,
                    settings: { receipt: formData.receiptSettings }, // Simplified for test
                    format: 'thermal',
                    receiptSettings: formData.receiptSettings,
                }
            };
            addPrintJobs([newJob]);
        }
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'headerLogoUrl' | 'footerLogoUrl') => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) { // 2MB limit
                alert('File is too large. Please select an image under 2MB.');
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                handleLayoutChange({ [type]: reader.result as string });
            };
            reader.readAsDataURL(file);
        }
    };
    
    const renderConnectionTab = () => (
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-semibold text-foreground mb-1">Printer Name</label>
                <Input name="name" value={formData.name || ''} onChange={handleBaseChange} required />
            </div>
            <div>
                <label className="block text-sm font-semibold text-foreground mb-1">Connection Type</label>
                <Select name="connection" value={formData.connection || ''} onChange={handleBaseChange}>
                    <option value="ESC/POS Printer Wifi/Lan">Wifi/Lan</option>
                    <option value="Bluetooth">Bluetooth</option>
                    <option value="USB">USB</option>
                    <option value="PDF Printer">PDF Printer</option>
                </Select>
            </div>
            {formData.connection === 'ESC/POS Printer Wifi/Lan' && (
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-semibold text-foreground mb-1">IP Address</label>
                        <Input name="ipAddress" value={formData.ipAddress || ''} onChange={handleBaseChange} placeholder="192.168.1.100" />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-foreground mb-1">Port</label>
                        <Input type="number" name="port" value={formData.port || ''} onChange={handleBaseChange} placeholder="9100" />
                    </div>
                     <div className="col-span-2"><PingButton ipAddress={formData.ipAddress}/></div>
                </div>
            )}
            <div>
                <label className="block text-sm font-semibold text-foreground mb-1">Paper Width (mm)</label>
                <Select name="paperWidth" value={formData.paperWidth || 80} onChange={handleBaseChange}>
                    <option value={48}>48mm</option>
                    <option value={58}>58mm</option>
                    <option value={80}>80mm</option>
                </Select>
            </div>
             <Toggle label="Has Cash Drawer" enabled={!!formData.hasDrawer} onToggle={() => setFormData(p => ({ ...p, hasDrawer: !p.hasDrawer }))} />
        </div>
    );
    
    const renderLayoutTab = () => {
        if (!currentSettings) return <p>No layout settings available for this printer type.</p>;

        const headerLines = [...(currentSettings.headerLines || []), ...Array(6).fill('')].slice(0, 6);
        const footerLines = [...(currentSettings.footerLines || []), ...Array(6).fill('')].slice(0, 6);
        
        return (
            <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                    <div><label className="block text-sm font-semibold text-foreground mb-1">Font Size</label><Input type="number" step="0.1" value={currentSettings.fontSize} onChange={e => handleLayoutChange({ fontSize: parseFloat(e.target.value) || 1 })} /></div>
                    <div><label className="block text-sm font-semibold text-foreground mb-1">Copies</label><Input type="number" value={currentSettings.copies} onChange={e => handleLayoutChange({ copies: parseInt(e.target.value) || 1 })} /></div>
                </div>
                 <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">Content Options</label>
                    <div className="grid grid-cols-2 gap-2">
                        {Object.keys(currentSettings).filter(k => k.startsWith('show')).map(key => (
                           <Toggle key={key} label={key.replace('show', '').replace(/([A-Z])/g, ' $1').trim()} enabled={!!currentSettings[key as keyof typeof currentSettings]} onToggle={() => handleToggle(key as keyof typeof currentSettings)} />
                        ))}
                    </div>
                </div>
                {!isKitchenPrinter && (
                    <div className="pt-4 border-t border-border">
                        <label className="block text-sm font-semibold text-foreground mb-2">Header Logo</label>
                        {(currentSettings as PrinterReceiptSettings).headerLogoUrl && (
                            <div className="mb-2 p-2 bg-background rounded border border-border flex justify-center">
                                <img src={(currentSettings as PrinterReceiptSettings).headerLogoUrl!} alt="Header Preview" className="h-12 w-auto object-contain" />
                            </div>
                        )}
                        <div className="flex items-center gap-2 mt-1">
                            <Input 
                                placeholder="Paste image URL or browse..." 
                                value={(currentSettings as PrinterReceiptSettings).headerLogoUrl || ''} 
                                onChange={e => handleLayoutChange({ headerLogoUrl: e.target.value })} 
                            />
                            <Button asChild variant="outline" size="sm" className="shrink-0">
                                <label className="cursor-pointer">
                                    Browse
                                    <input type="file" accept="image/png, image/jpeg, image/gif" className="hidden" onChange={e => handleImageUpload(e, 'headerLogoUrl')} />
                                </label>
                            </Button>
                            {(currentSettings as PrinterReceiptSettings).headerLogoUrl && (
                                <Button variant="ghost" size="sm" onClick={() => handleLayoutChange({ headerLogoUrl: '' })}>Clear</Button>
                            )}
                        </div>
                    </div>
                )}
                 <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">Header Lines</label>
                    <div className="space-y-2">{headerLines.map((line, i) => <Input key={i} placeholder={`Header Line ${i+1}`} value={line} onChange={e => handleLineChange('headerLines', i, e.target.value)} />)}</div>
                </div>
                <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">Footer Lines</label>
                    <div className="space-y-2">{footerLines.map((line, i) => <Input key={i} placeholder={`Footer Line ${i+1}`} value={line} onChange={e => handleLineChange('footerLines', i, e.target.value)} />)}</div>
                </div>
                 {!isKitchenPrinter && (
                    <div className="pt-4 border-t border-border">
                        <label className="block text-sm font-semibold text-foreground mb-2">Footer Logo</label>
                        {(currentSettings as PrinterReceiptSettings).footerLogoUrl && (
                            <div className="mb-2 p-2 bg-background rounded border border-border flex justify-center">
                                <img src={(currentSettings as PrinterReceiptSettings).footerLogoUrl!} alt="Footer Preview" className="h-12 w-auto object-contain" />
                            </div>
                        )}
                        <div className="flex items-center gap-2 mt-1">
                            <Input 
                                placeholder="Paste image URL or browse..." 
                                value={(currentSettings as PrinterReceiptSettings).footerLogoUrl || ''} 
                                onChange={e => handleLayoutChange({ footerLogoUrl: e.target.value })} 
                            />
                            <Button asChild variant="outline" size="sm" className="shrink-0">
                                <label className="cursor-pointer">
                                    Browse
                                    <input type="file" accept="image/png, image/jpeg, image/gif" className="hidden" onChange={e => handleImageUpload(e, 'footerLogoUrl')} />
                                </label>
                            </Button>
                            {(currentSettings as PrinterReceiptSettings).footerLogoUrl && (
                                <Button variant="ghost" size="sm" onClick={() => handleLayoutChange({ footerLogoUrl: '' })}>Clear</Button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <form onSubmit={handleSubmit} className="h-full flex flex-col bg-background text-foreground">
            <header className="flex-shrink-0 bg-card p-3 flex justify-between items-center border-b border-border">
                <div className="flex items-center gap-4">
                    <button type="button" onClick={onBack} className="text-muted-foreground hover:text-foreground">
                        <ArrowLeftIcon className="w-6 h-6" />
                    </button>
                    <h2 className="text-lg font-bold">{formData.name || 'New Printer'}</h2>
                </div>
                <div className="flex items-center gap-2">
                    <Button type="button" variant="outline" onClick={handleTestPrint}>Test Print</Button>
                    <Button type="submit" className="px-8">Save</Button>
                </div>
            </header>
            <div className="flex-grow flex p-6 gap-6 overflow-hidden">
                <div className="w-full md:w-1/2 lg:w-2/5 flex flex-col">
                    <div className="flex border-b border-border mb-4">
                        <button type="button" onClick={() => setActiveTab('connection')} className={`py-2 px-4 text-sm font-semibold ${activeTab === 'connection' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground'}`}>Connection</button>
                        <button type="button" onClick={() => setActiveTab('layout')} className={`py-2 px-4 text-sm font-semibold ${activeTab === 'layout' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground'}`}>Layout</button>
                    </div>
                    <div className="overflow-y-auto pr-4">
                        {activeTab === 'connection' && renderConnectionTab()}
                        {activeTab === 'layout' && renderLayoutTab()}
                    </div>
                </div>
                <div className="hidden md:block md:w-1/2 lg:w-3/5 bg-slate-800 p-4 rounded-lg shadow-inner">
                    <div className="w-[300px] mx-auto overflow-y-auto h-full scrollbar-hide">
                       {isKitchenPrinter ? (
                           <KitchenReceiptPreview settings={currentSettings as KitchenPrintSettings} paperWidth={formData.paperWidth || 80} profileName={formData.name || 'Test'} />
                       ) : (
                           <ReceiptPreview settings={currentSettings as PrinterReceiptSettings} paperWidth={formData.paperWidth || 48} />
                       )}
                    </div>
                </div>
            </div>
        </form>
    );
};

export default PrinterSettingsView;