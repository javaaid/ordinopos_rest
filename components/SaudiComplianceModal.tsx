
import React, { useState, useEffect } from 'react';
import { AppSettings, ZatcaSettings } from '../types';

interface SaudiComplianceModalProps {
    isOpen: boolean;
    onClose: () => void;
    settings: ZatcaSettings;
    onSave: (settings: ZatcaSettings) => void;
}

const SaudiComplianceModal: React.FC<SaudiComplianceModalProps> = ({ isOpen, onClose, settings, onSave }) => {
    const [localSettings, setLocalSettings] = useState<ZatcaSettings>(settings);

    useEffect(() => {
        setLocalSettings(settings);
    }, [settings, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(localSettings);
        onClose();
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setLocalSettings(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4">
            <div className="bg-card rounded-lg shadow-xl w-full max-w-md border border-border">
                <form onSubmit={handleSubmit}>
                    <div className="p-6 border-b border-border">
                        <h2 className="text-2xl font-bold text-foreground">Saudi Compliance Settings</h2>
                    </div>
                    <div className="p-6 space-y-4">
                        <div>
                            <label htmlFor="fatoora-api-key" className="block text-sm font-medium text-muted-foreground mb-1">Fatoora API Key</label>
                            <input
                                type="text"
                                id="fatoora-api-key"
                                name="fatooraApiKey"
                                value={localSettings.fatooraApiKey}
                                onChange={handleChange}
                                className="w-full bg-input border border-border rounded-md px-3 py-2 text-foreground"
                                placeholder="Enter your Fatoora API Key"
                            />
                        </div>
                        <div>
                            <label className="flex items-center justify-between p-3 rounded-lg bg-secondary cursor-pointer">
                                <span className="font-medium text-foreground">Enable ZATCA E-Invoicing (QR Code)</span>
                                <button
                                    type="button"
                                    onClick={() => setLocalSettings(prev => ({...prev, enabled: !prev.enabled}))}
                                    className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${localSettings.enabled ? 'bg-primary' : 'bg-muted'}`}
                                >
                                    <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${localSettings.enabled ? 'translate-x-6' : 'translate-x-1'}`}/>
                                </button>
                            </label>
                        </div>
                    </div>
                    <div className="p-6 border-t border-border flex justify-end items-center space-x-4">
                        <button type="button" onClick={onClose} className="px-6 py-2 rounded-md bg-secondary text-secondary-foreground font-semibold hover:bg-muted">Cancel</button>
                        <button type="submit" className="px-6 py-2 rounded-md bg-primary text-primary-foreground font-semibold hover:bg-primary/90">Save Settings</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SaudiComplianceModal;