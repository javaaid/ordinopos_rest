
import React, { useState, useEffect } from 'react';
import { AppSettings, DualCurrencySettings } from '../types';

interface DualCurrencySettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    settings: AppSettings;
    onSave: (settings: AppSettings) => void;
}

const DualCurrencySettingsModal: React.FC<DualCurrencySettingsModalProps> = ({ isOpen, onClose, settings, onSave }) => {
    const [localSettings, setLocalSettings] = useState<DualCurrencySettings>(settings.dualCurrency);

    useEffect(() => {
        setLocalSettings(settings.dualCurrency);
    }, [settings.dualCurrency, isOpen]);

    if (!isOpen) return null;

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ ...settings, dualCurrency: localSettings });
        onClose();
    };
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setLocalSettings(prev => ({...prev, [name]: name === 'exchangeRate' ? parseFloat(value) : value }));
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4">
            <div className="bg-card rounded-lg shadow-xl w-full max-w-md border border-border">
                <form onSubmit={handleSave}>
                    <div className="p-6 border-b border-border">
                        <h2 className="text-2xl font-bold text-foreground">Dual Currency Settings</h2>
                    </div>
                    <div className="p-6 space-y-4">
                        <label className="flex items-center justify-between p-3 rounded-lg bg-secondary cursor-pointer">
                            <span className="font-medium text-foreground">Enable Secondary Currency</span>
                            <button
                                type="button"
                                onClick={() => setLocalSettings(prev => ({...prev, enabled: !prev.enabled}))}
                                className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${localSettings.enabled ? 'bg-primary' : 'bg-muted'}`}
                            >
                                <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${localSettings.enabled ? 'translate-x-6' : 'translate-x-1'}`}/>
                            </button>
                        </label>
                        <div>
                            <label className="block text-sm font-medium text-muted-foreground mb-1">Secondary Currency (e.g., USD, EUR)</label>
                            <input type="text" name="secondaryCurrency" value={localSettings.secondaryCurrency} onChange={handleChange} className="w-full bg-input p-2 rounded-md border border-border" maxLength={3} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-muted-foreground mb-1">Exchange Rate (1 Primary = X Secondary)</label>
                            <input type="number" name="exchangeRate" value={localSettings.exchangeRate} onChange={handleChange} className="w-full bg-input p-2 rounded-md border border-border" step="0.0001" />
                        </div>
                    </div>
                    <div className="p-6 border-t border-border flex justify-end items-center space-x-4">
                        <button type="button" onClick={onClose} className="px-6 py-2 rounded-md bg-secondary text-secondary-foreground font-semibold">Cancel</button>
                        <button type="submit" className="px-6 py-2 rounded-md bg-primary text-primary-foreground font-semibold">Save Settings</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default DualCurrencySettingsModal;