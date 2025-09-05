
import React, { useState, useEffect } from 'react';
import { useAppContext, useToastContext } from '../contexts/AppContext';
import { AppSettings, DineInSettings } from '../types';
import UsersIcon from './icons/UsersIcon';
import { Card, CardContent } from './ui/Card';
import { useTranslations } from '../hooks/useTranslations';

const DineInSettingsView: React.FC = () => {
    const { settings, setSettings } = useAppContext();
    const t = useTranslations(settings.language.staff);
    const { addToast } = useToastContext();
    const [localSettings, setLocalSettings] = useState<DineInSettings>(settings.dineIn);

    const handleSave = () => {
        setSettings((prev: AppSettings) => ({
            ...prev,
            dineIn: localSettings,
        }));
        addToast({ type: 'success', title: 'Settings Saved', message: 'Dine-In settings have been updated.' });
    };

    const handleEnabledToggle = () => {
        setLocalSettings(prev => ({ ...prev, enabled: !prev.enabled }));
    };
    const handleStaffSelectionToggle = () => {
        setLocalSettings(prev => ({ ...prev, enableStaffSelection: !prev.enableStaffSelection }));
    };
    const handleSurchargeEnabledToggle = () => {
        setLocalSettings(prev => ({ ...prev, surcharge: { ...prev.surcharge, enabled: !prev.surcharge.enabled } }));
    };
    const handleMinChargeEnabledToggle = () => {
        setLocalSettings(prev => ({ ...prev, minCharge: { ...prev.minCharge, enabled: !prev.minCharge.enabled } }));
    };
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>, parentKey?: 'surcharge' | 'minCharge') => {
        const { name, value, type } = e.target;
        const processedValue = type === 'number' ? parseFloat(value) : value;
        setLocalSettings(prev => {
            if (parentKey) {
                 const parent = prev[parentKey];
                return { ...prev, [parentKey]: { ...parent, [name]: processedValue } };
            }
            return { ...prev, [name]: processedValue };
        });
    };

    const SettingsSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
        <Card>
            <CardContent className="p-6">
                <h4 className="font-bold text-foreground mb-4 text-start rtl:text-end">{title}</h4>
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
                    }
                }}
                className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${enabled ? 'bg-primary' : 'bg-muted'}`}
            >
                <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${enabled ? 'translate-x-6' : 'translate-x-1'}`}/>
            </button>
        </label>
    );

    return (
        <div className="h-full flex flex-col text-start">
            <h3 className="text-xl font-bold text-foreground mb-2 flex items-center gap-2 rtl:flex-row-reverse">
                <UsersIcon className="w-6 h-6" /> {t('dineInSettings')}
            </h3>
            <p className="text-sm text-muted-foreground mb-6 rtl:text-end">{t('dineInSettingsDescription')}</p>
            
            <div className="space-y-6 max-w-2xl overflow-y-auto pr-4">
                <SettingsSection title={t('general')}>
                    <ToggleRow label={t('enableDineIn')} enabled={localSettings.enabled} onToggle={handleEnabledToggle} />
                </SettingsSection>
                
                {localSettings.enabled && (
                    <>
                        <SettingsSection title={t('guestManagement')}>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-muted-foreground mb-1">{t('defaultGuests')}</label>
                                    <input type="number" name="defaultGuests" value={localSettings.defaultGuests} onChange={handleChange} className="w-full bg-input p-2 rounded-md border border-border" min="1" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-muted-foreground mb-1">{t('maxGuests')}</label>
                                    <input type="number" name="maxGuests" value={localSettings.maxGuests} onChange={handleChange} className="w-full bg-input p-2 rounded-md border border-border" min="1" />
                                </div>
                            </div>
                            <ToggleRow label={t('chooseStaffStart')} enabled={localSettings.enableStaffSelection} onToggle={handleStaffSelectionToggle} />
                        </SettingsSection>

                        <SettingsSection title={t('minimumCharge')}>
                            <ToggleRow label={t('enableMinimumCharge')} enabled={localSettings.minCharge.enabled} onToggle={handleMinChargeEnabledToggle} />
                            {localSettings.minCharge.enabled && (
                                <div>
                                    <label className="block text-sm font-medium text-muted-foreground mb-1">{t('minimumAmount')}</label>
                                    <input type="number" name="amount" value={localSettings.minCharge.amount} onChange={(e) => handleChange(e, 'minCharge')} className="w-full bg-input p-2 rounded-md border border-border" step="0.01" min="0" />
                                </div>
                            )}
                        </SettingsSection>
                        
                         <SettingsSection title={t('surcharge')}>
                            <ToggleRow label={t('enableDineInSurcharge')} enabled={localSettings.surcharge.enabled} onToggle={handleSurchargeEnabledToggle} />
                             {localSettings.surcharge.enabled && (
                                <div className="grid grid-cols-3 gap-4">
                                     <div>
                                        <label className="block text-sm font-medium text-muted-foreground mb-1">{t('surchargeName')}</label>
                                        <input name="name" value={localSettings.surcharge.name} onChange={(e) => handleChange(e, 'surcharge')} className="w-full bg-input p-2 rounded-md border border-border" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-muted-foreground mb-1">{t('type')}</label>
                                        <select name="type" value={localSettings.surcharge.type} onChange={(e) => handleChange(e, 'surcharge')} className="w-full bg-input p-2 rounded-md border border-border">
                                            <option value="fixed">Fixed Amount</option>
                                            <option value="percentage">Percentage</option>
                                        </select>
                                    </div>
                                     <div>
                                        <label className="block text-sm font-medium text-muted-foreground mb-1">{t('value')}</label>
                                        <input type="number" name="value" value={localSettings.surcharge.value} onChange={(e) => handleChange(e, 'surcharge')} className="w-full bg-input p-2 rounded-md border border-border" step="0.01" min="0" />
                                    </div>
                                </div>
                            )}
                        </SettingsSection>
                    </>
                )}
            </div>

            <div className="mt-auto pt-6 text-end">
                <button
                    onClick={handleSave}
                    className="px-6 py-2 rounded-md bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors shadow-lg"
                >
                    {t('saveDineInSettings')}
                </button>
            </div>
        </div>
    );
};
export default DineInSettingsView;