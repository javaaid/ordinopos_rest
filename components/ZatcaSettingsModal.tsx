
import React, { useState, useEffect } from 'react';
import { AppSettings, ZatcaSettings } from '../types';

interface ZatcaSettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    settings: AppSettings;
    onSave: (settings: AppSettings) => void;
}

const ZatcaSettingsModal: React.FC<ZatcaSettingsModalProps> = ({ isOpen, onClose, settings, onSave }) => {
    const [localSettings, setLocalSettings] = useState<ZatcaSettings>(settings.zatca);

    useEffect(() => {
        setLocalSettings(settings.zatca);
    }, [settings.zatca, isOpen]);
    
    if (!isOpen) return null;

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ ...settings, zatca: localSettings });
        onClose();
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setLocalSettings(prev => ({ ...prev, [name]: value }));
    };
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4">
            <div className="bg-card rounded-lg shadow-xl w-full max-w-lg border border-border">
                <form onSubmit={handleSave}>
                    <div className="p-6 border-b border-border">
                        <h2 className="text-2xl font-bold text-foreground">E-invoice (KSA) ZATCA Settings</h2>
                    </div>
                    <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
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
                        <div>
                            <label className="block text-sm font-medium text-muted-foreground mb-1">Production Certificate</label>
                            <textarea name="productionCert" value={localSettings.productionCert} onChange={handleChange} className="w-full bg-input p-2 rounded-md h-24 font-mono text-xs border border-border" placeholder="-----BEGIN CERTIFICATE----- ..."></textarea>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-muted-foreground mb-1">Production Certificate Signing Request (CSR)</label>
                            <textarea name="productionCSR" value={localSettings.productionCSR} onChange={handleChange} className="w-full bg-input p-2 rounded-md h-24 font-mono text-xs border border-border" placeholder="-----BEGIN CERTIFICATE REQUEST----- ..."></textarea>
                        </div>
                         <label className="flex items-center justify-between p-3 rounded-lg bg-secondary cursor-pointer">
                            <span className="font-medium text-foreground">Enable Sandbox Mode (for testing)</span>
                            <button
                                type="button"
                                onClick={() => setLocalSettings(prev => ({...prev, isSandbox: !prev.isSandbox}))}
                                className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${localSettings.isSandbox ? 'bg-primary' : 'bg-muted'}`}
                            >
                                <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${localSettings.isSandbox ? 'translate-x-6' : 'translate-x-1'}`}/>
                            </button>
                        </label>
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

export default ZatcaSettingsModal;