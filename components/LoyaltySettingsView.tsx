
import React, { useState, useEffect } from 'react';
import { useAppContext, useToastContext } from '../contexts/AppContext';
import { AppSettings, LoyaltySettings } from '../types';
import StarIcon from './icons/StarIcon';
import { Card, CardContent } from './ui/Card';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { useTranslations } from '../hooks/useTranslations';

const LoyaltySettingsView: React.FC = () => {
    const { settings, setSettings } = useAppContext();
    const t = useTranslations(settings.language.staff);
    const { addToast } = useToastContext();
    const [localSettings, setLocalSettings] = useState<LoyaltySettings>(settings.loyalty);

    useEffect(() => {
        setLocalSettings(settings.loyalty);
    }, [settings.loyalty]);

    const handleSave = () => {
        setSettings((prev: AppSettings) => ({
            ...prev,
            loyalty: localSettings,
        }));
        addToast({ type: 'success', title: 'Settings Saved', message: 'Loyalty program settings have been updated.' });
    };

    const handleToggle = () => {
        setLocalSettings(prev => ({ ...prev, enabled: !prev.enabled }));
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setLocalSettings(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
    };

    const ToggleRow: React.FC<{ label: string; enabled: boolean; onToggle?: () => void; }> = ({ label, enabled, onToggle }) => (
        <label className="flex items-center justify-between p-3 rounded-lg bg-background cursor-pointer border border-border">
            <span className="font-medium text-foreground">{label}</span>
            <button
                type="button"
                onClick={() => {
                    if (typeof onToggle === 'function') {
                        onToggle();
                    }
                }}
                className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${enabled ? 'bg-primary' : 'bg-muted'}`}
            >
                <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${enabled ? 'translate-x-6' : 'translate-x-1'}`}/>
            </button>
        </label>
    );

    return (
        <div className="p-6 h-full flex flex-col">
            <h3 className="text-xl font-bold text-foreground mb-2 flex items-center gap-2 rtl:text-right">
                <StarIcon className="w-6 h-6" /> {t('loyaltyProgram')}
            </h3>
            <p className="text-sm text-muted-foreground mb-6 rtl:text-right">{t('loyaltyDescription')}</p>
            
            <div className="space-y-6 max-w-2xl">
                <Card>
                    <CardContent className="p-6">
                        <div className="space-y-4">
                            <ToggleRow label={t('enableLoyaltyProgram')} enabled={localSettings.enabled} onToggle={handleToggle} />
                            
                            {localSettings.enabled && (
                                <div className="space-y-4 pt-4 border-t border-border">
                                    <div>
                                        <label className="block text-sm font-medium text-muted-foreground mb-1 rtl:text-right">{t('pointsEarnedPerDollar')}</label>
                                        <Input type="number" name="pointsPerDollar" value={localSettings.pointsPerDollar} onChange={handleChange} min="0" step="0.1" />
                                        <p className="text-xs text-muted-foreground mt-1 rtl:text-right">{t('pointsEarnedDescription')}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-muted-foreground mb-1 rtl:text-right">{t('redemptionRate')}</label>
                                        <Input type="number" name="redemptionRate" value={localSettings.redemptionRate} onChange={handleChange} min="1" step="1" />
                                        <p className="text-xs text-muted-foreground mt-1 rtl:text-right">{t('redemptionDescription')}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="mt-auto pt-6 text-end rtl:text-left">
                <Button onClick={handleSave}>{t('saveLoyaltySettings')}</Button>
            </div>
        </div>
    );
};

export default LoyaltySettingsView;