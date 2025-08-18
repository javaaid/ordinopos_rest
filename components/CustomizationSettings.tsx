
import React, { useState, useEffect } from 'react';
import { AppSettings, ReceiptSettings, ThemeSettings, LanguageSettings, Language, NotificationSettings, ReceiptTemplateId, InvoiceTemplateId } from '../types';
import SwatchIcon from './icons/SwatchIcon';
import ProBadge from './ProBadge';
import { useAppContext, useToastContext } from '../contexts/AppContext';

const presets: Record<string, ThemeSettings> = {
    dark: { primary: '#0ea5e9', background: '#0f172a', surface: '#1e293b', textBase: '#f8fafc', textMuted: '#94a3b8' },
    ocean: { primary: '#3b82f6', background: '#0c1f43', surface: '#15326c', textBase: '#e0f2fe', textMuted: '#a5c9f4' },
};

const Toggle: React.FC<{ label: string; enabled: boolean; onToggle: () => void; disabled?: boolean }> = ({ label, enabled, onToggle, disabled = false }) => (
    <label className={`flex items-center justify-between p-3 rounded-lg bg-secondary ${disabled ? 'opacity-50' : 'cursor-pointer'}`}>
        <span className="font-medium text-foreground">{label}</span>
        <button
            type="button"
            onClick={onToggle}
            disabled={disabled}
            className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${enabled ? 'bg-primary' : 'bg-muted'}`}
        >
            <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${enabled ? 'translate-x-6' : 'translate-x-1'}`}/>
        </button>
    </label>
);

const TemplatePreview: React.FC<{ title: string; description: string; isSelected: boolean; onClick: () => void; children: React.ReactNode }> = ({ title, description, isSelected, onClick, children }) => (
    <div
        onClick={onClick}
        className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${isSelected ? 'border-primary bg-primary/10 shadow-md' : 'border-border bg-background hover:border-muted-foreground'}`}
    >
        <div className="w-full h-24 bg-muted/50 rounded-md mb-3 overflow-hidden flex items-center justify-center p-2">
            {children}
        </div>
        <h5 className="font-bold text-foreground">{title}</h5>
        <p className="text-xs text-muted-foreground">{description}</p>
    </div>
);


const CustomizationSettings: React.FC = () => {
    const { settings, setSettings } = useAppContext();
    const { addToast } = useToastContext();
    const [localSettings, setLocalSettings] = useState<AppSettings>(settings);

    useEffect(() => {
        setLocalSettings(settings);
    }, [settings]);

    const handleReceiptChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setLocalSettings(prev => ({ ...prev, receipt: { ...prev.receipt, [name]: value } }));
    };
    
    const handleTemplateChange = (templateId: ReceiptTemplateId) => {
        setLocalSettings(prev => ({ ...prev, receipt: { ...prev.receipt, template: templateId } }));
    };

    const handleInvoiceTemplateChange = (templateId: InvoiceTemplateId) => {
        setLocalSettings(prev => ({ ...prev, invoice: { ...prev.invoice, template: templateId } }));
    };

    const handleThemeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setLocalSettings(prev => ({ ...prev, theme: { ...prev.theme, [name]: value } }));
    };

    const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target;
        setLocalSettings(prev => ({ ...prev, language: { ...prev.language, [name]: value as Language } }));
    };
    
    const handleNotificationChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setLocalSettings(prev => ({
            ...prev,
            notificationSettings: {
                ...prev.notificationSettings,
                [name]: name === 'duration' ? parseFloat(value) : value,
            },
        }));
    };

    const handleSave = () => {
        setSettings(localSettings);
        addToast({ type: 'success', title: 'Saved', message: 'Customization settings have been updated.' });
    };

    return (
        <div className="p-6 h-full flex flex-col">
            <div className="shrink-0">
                <h3 className="text-xl font-bold text-foreground mb-2 flex items-center gap-2">
                    <SwatchIcon className="w-6 h-6" /> White-Label & Customization
                </h3>
                <p className="text-sm text-muted-foreground mb-6">Tailor the look and feel of the POS to match your brand identity.</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 flex-grow overflow-y-auto pr-4">
                {/* Left Column */}
                <div className="lg:col-span-3 space-y-6">
                    {/* Receipt Template */}
                    <div className="bg-secondary p-4 rounded-lg">
                        <h4 className="font-bold text-foreground mb-4">Receipt Template</h4>
                        <p className="text-sm text-muted-foreground mb-4">Select a template for printed and PDF thermal receipts.</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                            <TemplatePreview 
                                title="Standard" 
                                description="Clean, modern English layout." 
                                isSelected={localSettings.receipt.template === 'standard'} 
                                onClick={() => handleTemplateChange('standard')}
                            >
                                <div className="w-16 h-20 bg-white p-1 font-mono text-black text-[5px] leading-tight flex flex-col justify-between"><div>**COMPANY**<br/>- - - -<br/>Item.....$10</div><div className="font-bold">TOTAL..$11</div></div>
                            </TemplatePreview>
                            <TemplatePreview 
                                title="Compact" 
                                description="Minimal, space-saving English design." 
                                isSelected={localSettings.receipt.template === 'compact'} 
                                onClick={() => handleTemplateChange('compact')}
                            >
                                <div className="w-16 h-20 bg-white p-1 font-mono text-black text-[5px] leading-tight flex flex-col justify-between"><div>Item...$10<br/>Item...$15</div><div className="font-bold">TOTAL $27.50</div></div>
                            </TemplatePreview>
                            <TemplatePreview 
                                title="Bilingual (ZATCA)" 
                                description="For Saudi Arabia. English & Arabic." 
                                isSelected={localSettings.receipt.template === 'zatca_bilingual'} 
                                onClick={() => handleTemplateChange('zatca_bilingual')}
                            >
                                <div className="w-16 h-20 bg-white p-1 font-mono text-black text-[4px] leading-tight flex flex-col justify-between"><div>فاتورة<br/>INVOICE<br/>- - -<br/>الصنف/Item</div><div className="text-center">QR</div></div>
                            </TemplatePreview>
                        </div>
                    </div>

                    <div className="bg-secondary p-4 rounded-lg">
                        <h4 className="font-bold text-foreground mb-4">A4 Invoice Template</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                            <TemplatePreview 
                                title="Modern" 
                                description="Clean, contemporary design with a color accent." 
                                isSelected={localSettings.invoice.template === 'modern'} 
                                onClick={() => handleInvoiceTemplateChange('modern')}
                            >
                                <div className="w-16 h-20 bg-white p-1 text-black text-[4px] leading-tight flex flex-col border-t-4 border-blue-500">
                                    <div className="font-bold">INVOICE</div>
                                    <div className="mt-2">Item 1.....$10</div>
                                    <div>Item 2.....$15</div>
                                    <div className="mt-auto text-right font-bold">Total: $25</div>
                                </div>
                            </TemplatePreview>
                            <TemplatePreview 
                                title="Classic" 
                                description="Traditional, formal layout." 
                                isSelected={localSettings.invoice.template === 'classic'} 
                                onClick={() => handleInvoiceTemplateChange('classic')}
                            >
                                <div className="w-16 h-20 bg-white p-1 text-black text-[4px] leading-tight flex flex-col border border-gray-400">
                                    <div className="text-center font-bold">INVOICE</div>
                                    <div className="mt-2 border-t border-b border-gray-400">Item 1.....$10</div>
                                    <div>Item 2.....$15</div>
                                    <div className="mt-auto text-right font-bold border-t border-gray-400">Total: $25</div>
                                </div>
                            </TemplatePreview>
                            <TemplatePreview 
                                title="Bilingual (ZATCA)" 
                                description="For Saudi Arabia. English & Arabic." 
                                isSelected={localSettings.invoice.template === 'zatca_bilingual'} 
                                onClick={() => handleInvoiceTemplateChange('zatca_bilingual')}
                            >
                                <div className="w-16 h-20 bg-white p-1 font-mono text-black text-[4px] leading-tight flex flex-col justify-between">
                                    <div>فاتورة<br/>INVOICE<br/>- - -<br/>الصنف/Item</div>
                                    <div className="text-center">QR</div>
                                </div>
                            </TemplatePreview>
                        </div>
                    </div>

                    <div className="bg-secondary p-4 rounded-lg">
                        <h4 className="font-bold text-foreground mb-2">Receipt Branding</h4>
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="logoUrl" className="block text-sm font-medium text-muted-foreground mb-1">Logo URL</label>
                                <input type="text" id="logoUrl" name="logoUrl" value={localSettings.receipt.logoUrl} onChange={handleReceiptChange} className="w-full bg-input border border-border rounded-md px-3 py-2 text-foreground" />
                            </div>
                            <div>
                                <label htmlFor="promoMessage" className="block text-sm font-medium text-muted-foreground mb-1">Promotional Message</label>
                                <textarea id="promoMessage" name="promoMessage" value={localSettings.receipt.promoMessage} onChange={handleReceiptChange} className="w-full bg-input border border-border rounded-md px-3 py-2 text-foreground h-20"></textarea>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-secondary p-4 rounded-lg">
                        <h4 className="font-bold text-foreground mb-2 flex items-center gap-2">UI Theme & Colors <ProBadge /></h4>
                        <p className="text-sm text-muted-foreground mb-4">Choose a preset or create your own custom theme.</p>
                        <div className="flex gap-2 mb-4">
                            <button onClick={() => setLocalSettings(prev => ({...prev, theme: presets.dark}))} className="text-xs font-semibold px-3 py-1 rounded-md bg-muted hover:bg-muted/80">Default Dark</button>
                            <button onClick={() => setLocalSettings(prev => ({...prev, theme: presets.ocean}))} className="text-xs font-semibold px-3 py-1 rounded-md bg-muted hover:bg-muted/80">Ocean Blue</button>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            {Object.entries(localSettings.theme).map(([key, value]) => (
                                <div key={key}>
                                    <label className="block text-sm font-medium text-muted-foreground mb-1 capitalize">{key.replace(/([A-Z])/g, ' $1')}</label>
                                    <input type="color" name={key} value={value} onChange={handleThemeChange} className="w-full h-10 bg-input p-1 rounded-md border border-border" />
                                </div>
                            ))}
                        </div>
                    </div>
                    
                    <div className="bg-secondary p-4 rounded-lg">
                        <h4 className="font-bold text-foreground mb-2">Multi-Language Support</h4>
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="staff-language" className="block text-sm font-medium text-muted-foreground mb-1">Staff-Facing Language</label>
                                <select id="staff-language" name="staff" value={localSettings.language.staff} onChange={handleLanguageChange} className="w-full bg-input border border-border rounded-md px-3 py-2 text-foreground">
                                    <option value="en">English</option>
                                    <option value="es">Español</option>
                                    <option value="ar">العربية (Arabic)</option>
                                </select>
                            </div>
                            <div>
                                <label htmlFor="customer-language" className="block text-sm font-medium text-muted-foreground mb-1">Customer-Facing Language</label>
                                <select id="customer-language" name="customer" value={localSettings.language.customer} onChange={handleLanguageChange} className="w-full bg-input border border-border rounded-md px-3 py-2 text-foreground">
                                    <option value="en">English</option>
                                    <option value="es">Español</option>
                                    <option value="ar">العربية (Arabic)</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="bg-secondary p-4 rounded-lg">
                        <h4 className="font-bold text-foreground mb-2">Notification Settings</h4>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-muted-foreground mb-1">Theme</label>
                                <select name="theme" value={localSettings.notificationSettings.theme} onChange={handleNotificationChange} className="w-full bg-input border border-border rounded-md px-3 py-2 text-foreground">
                                    <option value="dark">Dark</option>
                                    <option value="transparent">Transparent</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-auto pt-6 text-right shrink-0">
                <button
                    onClick={handleSave}
                    className="px-6 py-2 rounded-md bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors shadow-lg"
                >
                    Save Customizations
                </button>
            </div>
        </div>
    );
};

export default CustomizationSettings;
