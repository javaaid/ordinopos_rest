
import React, { useState, useEffect } from 'react';
import { useAppContext, useToastContext, useDataContext } from '../contexts/AppContext';
import { AppSettings, DeliverySettings, DeliveryZone, Surcharge } from '../types';
import TruckIcon from './icons/TruckIcon';
import TrashIcon from './icons/TrashIcon';
import { Card, CardContent } from './ui/Card';
import { useTranslations } from '../hooks/useTranslations';

const DeliverySettingsView: React.FC = () => {
    const { settings, setSettings } = useAppContext();
    const t = useTranslations(settings.language.staff);
    const { surcharges } = useDataContext();
    const { addToast } = useToastContext();
    const [localSettings, setLocalSettings] = useState<DeliverySettings>(settings.delivery);

    // Safeguard for outdated settings from localStorage to prevent crashes
    useEffect(() => {
        if (!localSettings.zones) {
            setLocalSettings(prev => ({ ...prev, zones: [] }));
        }
    }, [localSettings.zones]);

    const handleSave = () => {
        setSettings((prev: AppSettings) => ({
            ...prev,
            delivery: localSettings,
        }));
        addToast({ type: 'success', title: 'Settings Saved', message: 'Delivery settings have been updated.' });
    };

    const handleEnabledToggle = () => {
        setLocalSettings(prev => ({ ...prev, enabled: !prev.enabled }));
    };

    const handleSurchargeEnabledToggle = () => {
        setLocalSettings(prev => ({
            ...prev,
            surcharge: { ...prev.surcharge, enabled: !prev.surcharge.enabled },
        }));
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>, parentKey?: 'surcharge') => {
        const { name, value, type } = e.target;
        const processedValue = type === 'number' ? parseFloat(value) : value;
        setLocalSettings(prev => {
            if (parentKey) {
                const parent = prev[parentKey] as any;
                return { ...prev, [parentKey]: { ...parent, [name]: processedValue } };
            }
            return { ...prev, [name]: processedValue };
        });
    };

    const handleZoneChange = (index: number, field: 'name' | 'fee', value: string) => {
        setLocalSettings(prev => {
            const newZones = (prev.zones || []).map((zone, i) => {
                if (i !== index) {
                    return zone;
                }
    
                if (field === 'name') {
                    return { ...zone, name: value };
                }
    
                if (field === 'fee') {
                    // Ensure value is a number before setting. Handle empty string case.
                    const newFee = parseFloat(value);
                    return { ...zone, fee: isNaN(newFee) ? 0 : newFee };
                }
    
                return zone;
            });
            return { ...prev, zones: newZones };
        });
    };

    const addZone = () => {
        // FIX: Added missing 'geojson' property to satisfy the DeliveryZone type.
        const newZone: DeliveryZone = { id: `zone_${Date.now()}`, name: 'New Zone', fee: 0, geojson: null };
        setLocalSettings(prev => ({ ...prev, zones: [...(prev.zones || []), newZone] }));
    };

    const removeZone = (index: number) => {
        setLocalSettings(prev => ({ ...prev, zones: (prev.zones || []).filter((_, i) => i !== index) }));
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
                <TruckIcon className="w-6 h-6" /> {t('deliverySettings')}
            </h3>
            <p className="text-sm text-muted-foreground mb-6 rtl:text-end">{t('deliverySettingsDescription')}</p>
            
            <div className="space-y-6 max-w-2xl overflow-y-auto pr-4">
                <SettingsSection title={t('general')}>
                    <ToggleRow label={t('enableDelivery')} enabled={localSettings.enabled} onToggle={handleEnabledToggle} />
                </SettingsSection>

                {localSettings.enabled && (
                    <>
                        <SettingsSection title={t('deliveryZonesAndFees')}>
                            <div className="space-y-2">
                                {(localSettings.zones || []).map((zone, index) => (
                                    <div key={zone.id} className="grid grid-cols-12 gap-2 items-center">
                                        <input value={zone.name} onChange={(e) => handleZoneChange(index, 'name', e.target.value)} className="col-span-6 bg-input p-2 rounded-md border border-border" placeholder={t('zoneName')} />
                                        <input type="number" value={zone.fee} onChange={(e) => handleZoneChange(index, 'fee', e.target.value)} className="col-span-4 bg-input p-2 rounded-md border border-border" placeholder={t('fee')} step="0.01" min="0" />
                                        <div className="col-span-2 text-end rtl:text-start">
                                            <button onClick={() => removeZone(index)} className="p-2 text-destructive hover:opacity-80"><TrashIcon className="w-5 h-5"/></button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <button onClick={addZone} className="text-sm font-semibold text-primary hover:underline">{t('addDeliveryZone')}</button>
                        </SettingsSection>
                        
                        <SettingsSection title={t('surcharge')}>
                            <ToggleRow label={t('enableDeliverySurcharge')} enabled={localSettings.surcharge.enabled} onToggle={handleSurchargeEnabledToggle} />
                            {localSettings.surcharge.enabled && (
                                <div>
                                    <label className="block text-sm font-medium text-muted-foreground mb-1">{t('selectSurcharge')}</label>
                                    <select name="surchargeId" value={localSettings.surcharge.surchargeId || ''} onChange={(e) => handleChange(e, 'surcharge')} className="w-full bg-input p-2 rounded-md border border-border">
                                        <option value="">-- Select a Surcharge --</option>
                                        {surcharges.map((s: Surcharge) => (
                                            <option key={s.id} value={s.id}>{s.name} ({s.type === 'percentage' ? `${s.value}%` : `$${s.value.toFixed(2)}`})</option>
                                        ))}
                                    </select>
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
                    {t('saveDeliverySettings')}
                </button>
            </div>
        </div>
    );
};
export default DeliverySettingsView;