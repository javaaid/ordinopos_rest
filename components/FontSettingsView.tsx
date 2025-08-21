import React, { useState, useEffect } from 'react';
import { useAppContext, useToastContext } from '../contexts/AppContext';
import { AppSettings, FontSettings } from '../types';
import { Button } from './ui/Button';

const FontSettingsView: React.FC = () => {
    const { settings, setSettings } = useAppContext();
    const { addToast } = useToastContext();
    const [localSettings, setLocalSettings] = useState<FontSettings>(settings.fontSettings);

    useEffect(() => {
        setLocalSettings(settings.fontSettings);
    }, [settings.fontSettings]);

    const handleSave = () => {
        setSettings((prev: AppSettings) => ({
            ...prev,
            fontSettings: localSettings,
        }));
        addToast({ type: 'success', title: 'Settings Saved', message: 'Font settings have been updated.' });
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setLocalSettings(prev => ({ ...prev, [name]: parseInt(value, 10) }));
    };

    const FontSlider: React.FC<{ name: keyof FontSettings, label: string }> = ({ name, label }) => (
        <div>
            <label htmlFor={name} className="flex justify-between items-center text-sm font-medium text-muted-foreground mb-1">
                <span>{label}</span>
                <span className="font-mono bg-background px-2 py-0.5 rounded text-foreground">{localSettings[name]}px</span>
            </label>
            <input
                type="range"
                id={name}
                name={name}
                min="12"
                max="24"
                step="1"
                value={localSettings[name]}
                onChange={handleChange}
                className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer"
            />
        </div>
    );

    return (
        <div className="p-6 h-full flex flex-col">
            <h3 className="text-xl font-bold text-foreground">Font Settings</h3>
            <p className="text-sm text-muted-foreground mb-6">Adjust font sizes for better readability across the application.</p>
            
            <div className="space-y-6 max-w-md">
                <div className="bg-secondary p-6 rounded-lg space-y-4">
                    <FontSlider name="baseSize" label="Base Font Size" />
                    <FontSlider name="menuItemName" label="Menu Item Name Size" />
                    <FontSlider name="menuItemPrice" label="Menu Item Price Size" />
                    <FontSlider name="orderSummaryItem" label="Order Summary Item Size" />
                    <FontSlider name="orderSummaryTotal" label="Order Summary Total Size" />
                    <FontSlider name="categoryTabs" label="Category Tabs Size" />
                </div>
            </div>

            <div className="mt-auto pt-6 text-right">
                <Button onClick={handleSave}>
                    Save Font Settings
                </Button>
            </div>
        </div>
    );
};

export default FontSettingsView;