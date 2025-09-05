import React, { useState, useEffect } from 'react';
import { useAppContext, useToastContext } from '../contexts/AppContext';
import { AppSettings, QROrderingSettings } from '../types';
import QrCodeIcon from './icons/QrCodeIcon';
import { Card, CardContent } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';

const QRCodeOrderingSettingsView: React.FC = () => {
    const { settings, setSettings, isQRCodePluginActive } = useAppContext();
    const { addToast } = useToastContext();
    const [localSettings, setLocalSettings] = useState<QROrderingSettings>(settings.qrOrdering);

    useEffect(() => {
        setLocalSettings(settings.qrOrdering);
    }, [settings.qrOrdering]);

    const handleSave = () => {
        setSettings((prev: AppSettings) => ({
            ...prev,
            qrOrdering: localSettings,
        }));
        addToast({ type: 'success', title: 'Settings Saved', message: 'QR Code Ordering settings have been updated.' });
    };

    const handleToggle = () => {
        setLocalSettings(prev => ({ ...prev, enabled: !prev.enabled }));
    };
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setLocalSettings(prev => ({ ...prev, [name]: value }));
    };

    if (!isQRCodePluginActive) {
        return (
            <div className="p-6">
                <p className="text-muted-foreground">The QR Code Ordering plugin is not active. Please enable it in the Plugins section to configure its settings.</p>
            </div>
        );
    }
    
    const SettingsSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
        <Card>
            <CardContent className="p-6">
                <h4 className="font-bold text-foreground mb-4">{title}</h4>
                <div className="space-y-4">{children}</div>
            </CardContent>
        </Card>
    );
    
    const ToggleRow: React.FC<{ label: string; enabled: boolean; onToggle: () => void; }> = ({ label, enabled, onToggle }) => (
        <label className="flex items-center justify-between p-3 rounded-lg bg-background cursor-pointer border border-border">
            <span className="font-medium text-foreground">{label}</span>
            <button
                type="button"
                onClick={onToggle}
                className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${enabled ? 'bg-primary' : 'bg-muted'}`}
            >
                <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${enabled ? 'translate-x-6' : 'translate-x-1'}`}/>
            </button>
        </label>
    );

    return (
        <div className="h-full flex flex-col p-6">
            <h3 className="text-xl font-bold text-foreground mb-2 flex items-center gap-2">
                <QrCodeIcon className="w-6 h-6" /> QR Code Ordering Settings
            </h3>
            <p className="text-sm text-muted-foreground mb-6">Configure the contactless ordering experience for your customers.</p>
            
            <div className="space-y-6 max-w-2xl overflow-y-auto pr-4">
                <SettingsSection title="General">
                    <ToggleRow label="Enable QR Code Ordering" enabled={localSettings.enabled} onToggle={handleToggle} />
                </SettingsSection>

                {localSettings.enabled && (
                    <SettingsSection title="QR Code Configuration">
                         <div>
                            <label className="block text-sm font-medium text-muted-foreground mb-1">Base URL for Ordering</label>
                            <Input name="baseUrl" value={localSettings.baseUrl} onChange={handleChange} placeholder="e.g., https://menu.myrestaurant.com" />
                            <p className="text-xs text-muted-foreground mt-1">
                                This is the web address where your menu is hosted. The generated QR codes will point to this URL with table and location info.
                                <br />
                                Example: <code>{localSettings.baseUrl || 'https://...'}?table=T1&location=loc_1</code>
                            </p>
                        </div>
                    </SettingsSection>
                )}
            </div>

            <div className="mt-auto pt-6 text-right">
                <Button onClick={handleSave}>
                    Save QR Code Settings
                </Button>
            </div>
        </div>
    );
};
export default QRCodeOrderingSettingsView;