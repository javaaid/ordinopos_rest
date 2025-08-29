
import React, { useState, useEffect } from 'react';
import { useAppContext, useToastContext } from '../contexts/AppContext';
import { AppSettings, TabSettings } from '../types';
import CreditCardIcon from './icons/CreditCardIcon';
import { Card, CardContent } from './ui/Card';

const TabSettingsView: React.FC = () => {
    const { settings, setSettings } = useAppContext();
    const { addToast } = useToastContext();
    const [localSettings, setLocalSettings] = useState<TabSettings>(settings.tab);

    const handleSave = () => {
        setSettings((prev: AppSettings) => ({
            ...prev,
            tab: localSettings,
        }));
        addToast({ type: 'success', title: 'Settings Saved', message: 'Tab settings have been updated.' });
    };
    
    const handleEnabledToggle = () => {
        setLocalSettings(prev => ({ ...prev, enabled: !prev.enabled }));
    };
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setLocalSettings(prev => ({ ...prev, [name]: value }));
    };

    const SettingsSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
        <Card>
            <CardContent className="p-6">
                <h4 className="font-bold text-foreground mb-4">{title}</h4>
                <div className="space-y-4">{children}</div>
            </CardContent>
        </Card>
    );
    
    const ToggleRow: React.FC<{ label: string; enabled: boolean; onToggle?: () => void; }> = ({ label, enabled, onToggle }) => (
        <label className="flex items-center justify-between p-3 rounded-lg bg-background cursor-pointer border border-border">
            <span className="font-medium text-foreground">{label}</span>
            <button
                type="button"
                onClick={() => {
                    if (typeof onToggle === 'function') {
                        onToggle();
                    } else {
                        console.error(`onToggle prop is not a function for ToggleRow with label: "${label}"`);
                    }
                }}
                className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${enabled ? 'bg-primary' : 'bg-muted'}`}
            >
                <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${enabled ? 'translate-x-6' : 'translate-x-1'}`}/>
            </button>
        </label>
    );

    return (
        <div className="h-full flex flex-col">
            <h3 className="text-xl font-bold text-foreground mb-2 flex items-center gap-2">
                <CreditCardIcon className="w-6 h-6" /> Tab Settings
            </h3>
            <p className="text-sm text-muted-foreground mb-6">Allow customers to open a running tab.</p>
            
            <div className="space-y-6 max-w-2xl overflow-y-auto pr-4">
                <SettingsSection title="General">
                    <ToggleRow label="Enable Tabs" enabled={localSettings.enabled} onToggle={handleEnabledToggle} />
                    <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-1">Custom Name</label>
                        <input name="customName" value={localSettings.customName} onChange={handleChange} className="w-full bg-input p-2 rounded-md border border-border" placeholder="e.g., Bar Tab" />
                        <p className="text-xs text-muted-foreground mt-1">This name will be used on the POS and receipts.</p>
                    </div>
                </SettingsSection>
            </div>

            <div className="mt-auto pt-6 text-right">
                <button
                    onClick={handleSave}
                    className="px-6 py-2 rounded-md bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors shadow-lg"
                >
                    Save Tab Settings
                </button>
            </div>
        </div>
    );
};
export default TabSettingsView;