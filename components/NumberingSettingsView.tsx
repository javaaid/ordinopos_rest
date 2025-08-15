
import React, { useState, useEffect } from 'react';
import { useAppContext, useToastContext } from '../contexts/AppContext';
import { AppSettings, OrderSettings, OrderType } from '../types';

const NumberingSettingsView: React.FC = () => {
    const { settings, setSettings } = useAppContext();
    const { addToast } = useToastContext();
    const [localSettings, setLocalSettings] = useState<Partial<OrderSettings>>({});

    useEffect(() => {
        setLocalSettings(settings.orderSettings);
    }, [settings.orderSettings]);
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type } = e.target;
        setLocalSettings(prev => ({
            ...prev,
            [name]: type === 'number' ? parseInt(value, 10) : value,
        }));
    };
    
    const handleSave = () => {
        setSettings((prev: any) => ({
            ...prev,
            orderSettings: {
                ...prev.orderSettings,
                ...localSettings,
            },
        }));
        addToast({ type: 'success', title: 'Settings Saved', message: 'Numbering settings have been updated.' });
    };

    const exampleInvoice = `${localSettings.invoicePrefix || ''}${localSettings.nextInvoiceNumber || '0000'}${localSettings.invoiceSuffix || ''}`;

    if (!localSettings.nextDailyOrderNumber) return null; // Guard against old state shape

    return (
        <div className="h-full flex flex-col">
            <h3 className="text-xl font-bold text-foreground">Numbering Settings</h3>
            <p className="text-muted-foreground mt-2 mb-6">
                Customize the numbering format for your invoices and daily orders for each service type.
            </p>
            <div className="space-y-8 max-w-2xl flex-grow overflow-y-auto pr-2">
                <div className="bg-secondary p-6 rounded-lg">
                    <h4 className="font-bold text-foreground mb-4">Invoice Number Sequence</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-muted-foreground mb-1">Prefix</label>
                            <input name="invoicePrefix" value={localSettings.invoicePrefix || ''} onChange={handleChange} className="w-full bg-input p-2 rounded-md border border-border" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-muted-foreground mb-1">Next Number</label>
                            <input type="number" name="nextInvoiceNumber" value={localSettings.nextInvoiceNumber || ''} onChange={handleChange} className="w-full bg-input p-2 rounded-md border border-border" min="1"/>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-muted-foreground mb-1">Suffix</label>
                            <input name="invoiceSuffix" value={localSettings.invoiceSuffix || ''} onChange={handleChange} className="w-full bg-input p-2 rounded-md border border-border" />
                        </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">Example: <span className="font-mono bg-background px-1 py-0.5 rounded">{exampleInvoice}</span></p>
                </div>

                <div className="bg-secondary p-6 rounded-lg">
                    <h4 className="font-bold text-foreground mb-4">Daily Order Number Sequence</h4>
                    <p className="text-muted-foreground text-sm mb-4">Set the *next* order number. This sequence is used for all order types and resets to 1 automatically each day.</p>
                     <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-1">Next Order Number</label>
                        <input 
                            type="number"
                            name="nextDailyOrderNumber"
                            value={localSettings.nextDailyOrderNumber || ''}
                            onChange={handleChange}
                            className="w-full bg-input p-2 rounded-md max-w-xs border border-border" 
                            min="1"
                        />
                    </div>
                </div>
                
            </div>
             <div className="pt-6 text-right mt-auto">
                <button
                    onClick={handleSave}
                    className="px-6 py-2 rounded-md bg-primary text-primary-foreground font-semibold hover:bg-primary/90"
                >
                    Save Numbering Settings
                </button>
            </div>
        </div>
    );
};

export default NumberingSettingsView;