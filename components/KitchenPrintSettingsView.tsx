
import React, { useState, useEffect } from 'react';
import { KitchenPrintSettings, Order, Printer, KitchenProfileType, PrinterConnectionType } from '../types';
import ArrowLeftIcon from './icons/ArrowLeftIcon';
import { DEFAULT_KITCHEN_PRINT_SETTINGS } from '../constants';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Select } from './ui/Select';
import PingButton from './PingButton';

// Dummy data for kitchen preview
const DUMMY_KITCHEN_ORDER: Partial<Order> = {
    orderNumber: "001",
    invoiceNumber: "A-00001",
    createdAt: new Date("2025-07-31T13:41:14Z").getTime(),
    employeeId: 'emp_4',
    customer: { id: 'cust_1', name: 'John Doe', phone: '555-1234', email: 'john.d@example.com', address: '123 Main St', locationId: 'loc_1' },
    guestCount: 2,
    cart: [
        { cartId: '1', menuItem: { id: 9, name: 'Classic Cheeseburger', price: 15.99 } as any, quantity: 1, selectedModifiers: [{name: 'Well Done', price: 0}, {name: 'No Onions', price: 0}] },
        { cartId: '2', menuItem: { id: 28, name: 'Coca-Cola', price: 3.50 } as any, quantity: 2, selectedModifiers: [] },
    ],
    tableId: 't1'
};

const KitchenReceiptPreview: React.FC<{ settings: KitchenPrintSettings, paperWidth: number, profileName: string }> = ({ settings, paperWidth, profileName }) => {
    const textStyle: React.CSSProperties = {
        fontSize: `${settings.fontSize}rem`,
        lineHeight: 1.5,
    };

    const barcodeSeed = (DUMMY_KITCHEN_ORDER.invoiceNumber || "").split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const seededRandom = (seed: number) => {
        let x = Math.sin(seed) * 10000;
        return x - Math.floor(x);
    };
    
    return (
        <div style={textStyle} className="p-4 bg-white text-black font-mono w-full h-full">
            <div className="text-center font-bold text-lg">
                <p>*** {profileName.toUpperCase()} ***</p>
                {settings.headerLines.map((line, i) => line && <p key={i}>{line}</p>)}
            </div>
            <hr className="border-dashed border-black my-2" />
            <div>
                 {settings.showOrderNumber && <div className="flex justify-between font-bold"><span>Order:</span><span>{DUMMY_KITCHEN_ORDER.orderNumber}</span></div>}
                 {settings.showInvoiceNumber && <div className="flex justify-between"><span>Invoice:</span><span>{DUMMY_KITCHEN_ORDER.invoiceNumber}</span></div>}
                 {settings.showStaff && <div className="flex justify-between"><span>Staff:</span><span>Walter</span></div>}
                 {settings.showOrderTime && <div className="flex justify-between"><span>Time:</span><span>{new Date(DUMMY_KITCHEN_ORDER.createdAt!).toLocaleTimeString()}</span></div>}
                 {settings.showTable && DUMMY_KITCHEN_ORDER.tableId && <div className="flex justify-between font-bold"><span>Table:</span><span>Sun Room</span></div>}
                 {settings.showGuests && DUMMY_KITCHEN_ORDER.guestCount && <div className="flex justify-between"><span>Guests:</span><span>{DUMMY_KITCHEN_ORDER.guestCount}</span></div>}
                 {settings.showCustomer && DUMMY_KITCHEN_ORDER.customer && <div className="flex justify-between"><span>Customer:</span><span>{DUMMY_KITCHEN_ORDER.customer.name}</span></div>}
            </div>
            <hr className="border-dashed border-black my-2" />
            <div className="space-y-2">
                {DUMMY_KITCHEN_ORDER.cart?.map((item, index) => (
                    <div key={item.cartId}>
                        <div className="flex justify-between">
                            <p className="text-base font-bold whitespace-pre-wrap">{item.quantity}x {item.menuItem.name}</p>
                            {settings.showUnitPrice && <p className="text-base font-bold">${item.menuItem.price.toFixed(2)}</p>}
                        </div>
                        {settings.showKitchenNote && item.selectedModifiers.length > 0 && (
                            <p className="pl-4 text-xs whitespace-pre-wrap">
                                {item.selectedModifiers.map(m => `* ${m.name}`).join('\n')}
                            </p>
                        )}
                    </div>
                ))}
            </div>
            <hr className="border-dashed border-black my-2" />
            {settings.showTotalQuantity && (
                <div className="flex justify-between font-bold">
                    <span>Total Items:</span>
                    <span>{DUMMY_KITCHEN_ORDER.cart?.reduce((s, i) => s + i.quantity, 0)}</span>
                </div>
            )}
             {settings.showBarcode && DUMMY_KITCHEN_ORDER.invoiceNumber && (
                 <div className="flex flex-col items-center mt-2">
                    <div className="flex space-x-px h-8 w-4/5 items-end">
                        {DUMMY_KITCHEN_ORDER.invoiceNumber.repeat(5).split('').map((_, i) => (<div key={i} className="bg-black" style={{ width: `${seededRandom(barcodeSeed + i) * 1.5 + 0.5}px`, height: `${seededRandom(barcodeSeed - i) * 60 + 20}%` }}></div>))}
                    </div>
                    <p className="text-[8px] font-mono tracking-widest mt-1">{DUMMY_KITCHEN_ORDER.invoiceNumber}</p>
                </div>
            )}
            <div className="text-center mt-2">
                 {settings.footerLines.map((l, i) => l && <p key={i}>{l}</p>)}
            </div>
        </div>
    )
}

interface KitchenPrintSettingsViewProps {
    printer?: Printer;
    settings?: KitchenPrintSettings;
    profileName?: string;
    paperWidth?: number;
    onBack: () => void;
    onSave: (data: Printer | KitchenPrintSettings) => void;
}

const Toggle: React.FC<{ label: string; enabled: boolean; onToggle: () => void; }> = ({ label, enabled, onToggle }) => (
    <label className="flex items-center justify-between p-2 rounded-md bg-background cursor-pointer border border-border">
        <span className="text-sm font-medium text-secondary-foreground">{label}</span>
        <button
            type="button"
            onClick={onToggle}
            className={`relative inline-flex items-center h-5 w-9 transition-colors rounded-full ${enabled ? 'bg-primary' : 'bg-muted'}`}
        >
            <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${enabled ? 'translate-x-5' : 'translate-x-0.5'}`}/>
        </button>
    </label>
);

const KitchenPrintSettingsView: React.FC<KitchenPrintSettingsViewProps> = ({ printer, settings, profileName, paperWidth, onBack, onSave }) => {
    const isProfileOnly = !!settings;
    const [activeTab, setActiveTab] = useState<'connection' | 'layout'>(isProfileOnly ? 'layout' : 'connection');
    const [formData, setFormData] = useState<Partial<Printer>>(printer || {});
    const [profileData, setProfileData] = useState<KitchenPrintSettings>(settings || DEFAULT_KITCHEN_PRINT_SETTINGS);
    
    useEffect(() => {
        if (printer) setFormData(printer);
        if (settings) setProfileData(settings);
    }, [printer, settings]);

    const profileKey = printer ? Object.keys(printer.kitchenProfiles || {})[0] as KitchenProfileType : undefined;
    const currentSettings = isProfileOnly ? profileData : (formData as Printer).kitchenProfiles?.[profileKey!] || DEFAULT_KITCHEN_PRINT_SETTINGS;
    
    const handleBaseChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const isNum = type === 'number';

        setFormData(prev => {
            const newState = { ...prev, [name]: isNum ? parseInt(value) : value };
            if (name === 'connection' && value !== 'ESC/POS Printer Wifi/Lan') {
                newState.port = undefined;
            }
             if (name === 'connection' && value === 'ESC/POS Printer Wifi/Lan') {
                newState.port = newState.port || 9100;
            }
            return newState;
        });
    };

    const handleLayoutChange = (updates: Partial<KitchenPrintSettings>) => {
        if (isProfileOnly) {
            setProfileData(prev => ({ ...prev, ...updates }));
        } else {
            setFormData(prev => ({
                ...prev,
                kitchenProfiles: {
                    ...prev.kitchenProfiles,
                    [profileKey!]: {
                        ...(prev.kitchenProfiles?.[profileKey!] || DEFAULT_KITCHEN_PRINT_SETTINGS),
                        ...updates,
                    },
                },
            }));
        }
    };
    
    const handleLineChange = (type: 'headerLines' | 'footerLines', index: number, value: string) => {
        const currentLines = currentSettings[type] || [];
        const newLines = [...currentLines];
        newLines[index] = value;
        handleLayoutChange({ [type]: newLines });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(isProfileOnly ? profileData : formData as Printer);
    };

    const handleToggle = (key: keyof KitchenPrintSettings) => {
        handleLayoutChange({ [key]: !currentSettings[key as keyof KitchenPrintSettings] });
    };

    const renderConnectionTab = () => (
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-semibold text-foreground mb-1">Printer Name</label>
                <Input name="name" value={(formData as Printer).name || ''} onChange={handleBaseChange} required />
            </div>
            <div>
                <label className="block text-sm font-semibold text-foreground mb-1">Connection Type</label>
                <Select name="connection" value={(formData as Printer).connection || ''} onChange={handleBaseChange}>
                    <option value="ESC/POS Printer Wifi/Lan">Wifi/Lan</option>
                    <option value="Bluetooth">Bluetooth</option>
                    <option value="USB">USB</option>
                </Select>
            </div>
            {(formData as Printer).connection === 'ESC/POS Printer Wifi/Lan' ? (
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-semibold text-foreground mb-1">IP Address</label>
                        <Input name="ipAddress" value={(formData as Printer).ipAddress || ''} onChange={handleBaseChange} placeholder="192.168.1.100" />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-foreground mb-1">Port</label>
                        <Input type="number" name="port" value={(formData as Printer).port || ''} onChange={handleBaseChange} placeholder="9100" />
                    </div>
                     <div className="col-span-2">
                        <PingButton />
                    </div>
                </div>
            ) : (
                 <div>
                    <label className="block text-sm font-semibold text-foreground mb-1">Device Address / ID</label>
                    <Input name="ipAddress" value={(formData as Printer).ipAddress || ''} onChange={handleBaseChange} placeholder={(formData as Printer).connection === 'Bluetooth' ? "e.g., 00:1A:2B:3C:4D:5E" : "e.g., /dev/usb/lp0"} />
                </div>
            )}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-semibold text-foreground mb-1">Paper Width (mm)</label>
                    <Select name="paperWidth" value={(formData as Printer).paperWidth || 80} onChange={handleBaseChange}>
                        <option value={48}>48mm</option>
                        <option value={58}>58mm</option>
                        <option value={80}>80mm</option>
                    </Select>
                </div>
                 <div>
                    <label className="block text-sm font-semibold text-foreground mb-1">Printer Type</label>
                    <Select name="type" value={(formData as Printer).type || 'thermal'} onChange={handleBaseChange}>
                        <option value="thermal">Thermal</option>
                        <option value="a4">A4</option>
                    </Select>
                </div>
            </div>
            <div>
                <label className="block text-sm font-semibold text-foreground mb-1">Status</label>
                <Select name="status" value={(formData as Printer).status || 'connected'} onChange={handleBaseChange}>
                    <option value="connected">Connected</option>
                    <option value="disconnected">Disconnected</option>
                </Select>
            </div>
        </div>
    );
    
    const renderLayoutTab = () => {
        const headerLines = [...(currentSettings.headerLines || []), ...Array(6).fill('')].slice(0, 6);
        const footerLines = [...(currentSettings.footerLines || []), ...Array(6).fill('')].slice(0, 6);
        return (
            <div className="space-y-6">
                <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">Content Options</label>
                    <div className="grid grid-cols-2 gap-2">
                        {Object.keys(currentSettings).filter(k => k.startsWith('show')).map(key => (
                           <Toggle key={key} label={key.replace('show', '').replace(/([A-Z])/g, ' $1').trim()} enabled={!!currentSettings[key as keyof typeof currentSettings]} onToggle={() => handleToggle(key as keyof KitchenPrintSettings)} />
                        ))}
                    </div>
                </div>
                 <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">Margins (in mm)</label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-muted-foreground mb-1">Top</label>
                            <Input type="number" value={currentSettings.marginTop} onChange={e => handleLayoutChange({ marginTop: parseInt(e.target.value) || 0 })} />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-muted-foreground mb-1">Bottom</label>
                            <Input type="number" value={currentSettings.marginBottom} onChange={e => handleLayoutChange({ marginBottom: parseInt(e.target.value) || 0 })} />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-muted-foreground mb-1">Left</label>
                            <Input type="number" value={currentSettings.marginLeft} onChange={e => handleLayoutChange({ marginLeft: parseInt(e.target.value) || 0 })} />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-muted-foreground mb-1">Right</label>
                            <Input type="number" value={currentSettings.marginRight} onChange={e => handleLayoutChange({ marginRight: parseInt(e.target.value) || 0 })} />
                        </div>
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">Header Lines</label>
                    <div className="space-y-2">{headerLines.map((line, i) => <Input key={i} placeholder={`Header Line ${i+1}`} value={line} onChange={e => handleLineChange('headerLines', i, e.target.value)} />)}</div>
                </div>
                <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">Footer Lines</label>
                    <div className="space-y-2">{footerLines.map((line, i) => <Input key={i} placeholder={`Footer Line ${i+1}`} value={line} onChange={e => handleLineChange('footerLines', i, e.target.value)} />)}</div>
                </div>
            </div>
        )
    };

    return (
        <form onSubmit={handleSubmit} className="h-full flex flex-col bg-background text-foreground">
             <header className="flex-shrink-0 bg-card p-3 flex justify-between items-center border-b border-border">
                <div className="flex items-center gap-4">
                    <button type="button" onClick={onBack} className="text-muted-foreground hover:text-foreground">
                        <ArrowLeftIcon className="w-6 h-6" />
                    </button>
                    <h2 className="text-lg font-bold">{isProfileOnly ? `${profileName} Settings` : `${(formData as Printer).name} Settings`}</h2>
                </div>
                 <Button type="submit" className="px-8">Save</Button>
            </header>
            
            <div className="flex-grow flex p-6 gap-6 overflow-hidden">
                <div className="w-full md:w-1/2 lg:w-2/5 flex flex-col">
                     <div className="flex border-b border-border mb-4">
                        {!isProfileOnly && <button type="button" onClick={() => setActiveTab('connection')} className={`py-2 px-4 text-sm font-semibold ${activeTab === 'connection' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground'}`}>Connection</button>}
                        <button type="button" onClick={() => setActiveTab('layout')} className={`py-2 px-4 text-sm font-semibold ${activeTab === 'layout' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground'}`}>Layout</button>
                    </div>
                     <div className="overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-800">
                        {activeTab === 'connection' && !isProfileOnly && renderConnectionTab()}
                        {activeTab === 'layout' && renderLayoutTab()}
                    </div>
                </div>

                <div className="hidden md:block md:w-1/2 lg:w-3/5 bg-slate-800 p-4 rounded-lg shadow-inner">
                    <div className="w-[300px] mx-auto overflow-y-auto h-full scrollbar-hide">
                        <KitchenReceiptPreview settings={currentSettings} paperWidth={(formData as Printer).paperWidth || paperWidth || 80} profileName={profileName || (formData as Printer).name || 'Printer'} />
                    </div>
                </div>
            </div>
            <style>{`.scrollbar-hide::-webkit-scrollbar { display: none; } .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }`}</style>
        </form>
    );
};

export default KitchenPrintSettingsView;
