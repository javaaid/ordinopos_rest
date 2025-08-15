
import React, { useState, useEffect } from 'react';
import { ZatcaSettings } from '../types';
import QrCodeIcon from './icons/QrCodeIcon';
import { useAppContext, useDataContext, useToastContext } from '../contexts/AppContext';

const ZatcaSettingsView: React.FC = () => {
    const { settings } = useAppContext();
    const { handleSaveZatcaSettings } = useDataContext();
    const { addToast } = useToastContext();
    const [localSettings, setLocalSettings] = useState<ZatcaSettings>(settings.zatca);

    useEffect(() => {
        setLocalSettings(settings.zatca);
    }, [settings.zatca]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const isCheckbox = type === 'checkbox';
        const isNumber = type === 'number';
        setLocalSettings(prev => ({ 
            ...prev, 
            [name]: isCheckbox ? (e.target as HTMLInputElement).checked : (isNumber ? parseInt(value, 10) : value) 
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleSaveZatcaSettings(localSettings);
        addToast({ type: 'success', title: 'Saved', message: 'ZATCA settings have been updated.' });
    };

    return (
        <form onSubmit={handleSubmit} className="p-6 h-full flex flex-col">
            <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-3">
                <QrCodeIcon className="w-8 h-8"/>
                ZATCA E-Invoicing (KSA) Settings
            </h2>
            <p className="text-muted-foreground mb-6">
                Configure settings for ZATCA-compliant QR codes on simplified tax invoices for your Saudi Arabian locations.
            </p>
            <div className="bg-secondary p-6 rounded-lg space-y-6 max-w-lg border border-border">
                <label className="flex items-center justify-between p-3 rounded-lg bg-background cursor-pointer">
                    <span className="font-medium text-foreground">Enable ZATCA QR Code</span>
                    <button
                        type="button"
                        onClick={() => setLocalSettings(prev => ({...prev, enabled: !prev.enabled}))}
                        className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${localSettings.enabled ? 'bg-primary' : 'bg-muted'}`}
                    >
                        <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${localSettings.enabled ? 'translate-x-6' : 'translate-x-1'}`}/>
                    </button>
                </label>
                
                <div>
                    <label htmlFor="qrCodeSize" className="block text-sm font-medium text-muted-foreground mb-2">QR Code Size on Receipt</label>
                    <div className="flex items-center gap-4">
                        <input
                            type="range"
                            id="qrCodeSize"
                            name="qrCodeSize"
                            min="64"
                            max="256"
                            step="8"
                            value={localSettings.qrCodeSize}
                            onChange={handleChange}
                            className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer"
                        />
                        <span className="font-mono text-foreground bg-input px-2 py-1 rounded-md">{localSettings.qrCodeSize}px</span>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">QR Code Position</label>
                    <div className="flex gap-4 rounded-lg bg-background p-1">
                         <button type="button" onClick={() => setLocalSettings(p=>({...p, qrCodePosition: 'top'}))} className={`flex-1 py-2 text-sm font-semibold rounded-md ${localSettings.qrCodePosition==='top' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}>Top of Receipt</button>
                         <button type="button" onClick={() => setLocalSettings(p=>({...p, qrCodePosition: 'bottom'}))} className={`flex-1 py-2 text-sm font-semibold rounded-md ${localSettings.qrCodePosition==='bottom' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}>Bottom of Receipt</button>
                    </div>
                </div>

                <div className="mt-6 pt-6 border-t border-border text-right">
                    <button
                        type="submit"
                        className="px-6 py-2 rounded-md bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors"
                    >
                        Save Settings
                    </button>
                </div>
            </div>
        </form>
    );
};

export default ZatcaSettingsView;