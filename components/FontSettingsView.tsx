import React, { useState, useEffect } from 'react';
import { useAppContext, useToastContext } from '../contexts/AppContext';
import { AppSettings, FontSettings, TranslationKey } from '../types';
import { Button } from './ui/Button';
import { useTranslations } from '../hooks/useTranslations';

const FontSettingsView: React.FC = () => {
    const { settings, setSettings } = useAppContext();
    const t = useTranslations(settings.language.staff);
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

    const FontSlider: React.FC<{ name: keyof FontSettings, labelKey: TranslationKey }> = ({ name, labelKey }) => (
        <div className="text-start rtl:text-end">
            <label htmlFor={name} className="flex justify-between items-center text-sm font-medium text-muted-foreground mb-1">
                <span>{t(labelKey)}</span>
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
            <div className="text-start rtl:text-end">
                <h3 className="text-xl font-bold text-foreground">{t('fonts_title')}</h3>
                <p className="text-sm text-muted-foreground mb-6">{t('fonts_description')}</p>
            </div>
            
            <div className="space-y-6 max-w-md">
                <div className="bg-secondary p-6 rounded-lg space-y-4">
                    <FontSlider name="baseSize" labelKey="fonts_base_label" />
                    <FontSlider name="menuItemName" labelKey="fonts_menuItemName_label" />
                    <FontSlider name="menuItemPrice" labelKey="fonts_menuItemPrice_label" />
                    <FontSlider name="orderSummaryItem" labelKey="fonts_orderSummaryItem_label" />
                    <FontSlider name="orderSummaryTotal" labelKey="fonts_orderSummaryTotal_label" />
                    <FontSlider name="categoryTabs" labelKey="fonts_categoryTabs_label" />
                </div>
            </div>

            <div className="mt-auto pt-6 text-end rtl:text-left">
                <Button onClick={handleSave}>
                    {t('saveSettings')}
                </Button>
            </div>
        </div>
    );
};

export default FontSettingsView;
