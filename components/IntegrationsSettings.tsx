
import React, { useState, useEffect } from 'react';
import { AppSettings } from '../types';
import LinkIcon from './icons/LinkIcon';
import ShoppingBagIcon from './icons/ShoppingBagIcon';
import CubeTransparentIcon from './icons/CubeTransparentIcon';
import ProBadge from './ProBadge';
import { useAppContext, useToastContext } from '../contexts/AppContext';
import CurrencyExchangeIcon from './icons/CurrencyExchangeIcon';
import { useTranslations } from '../hooks/useTranslations';

const IntegrationsSettings: React.FC = () => {
    const { settings, setSettings, currentLocation } = useAppContext();
    const t = useTranslations(settings.language.staff);
    const { addToast } = useToastContext();
    const [localSettings, setLocalSettings] = useState<AppSettings>(settings);
    const [visibleApiInputs, setVisibleApiInputs] = useState<Record<string, boolean>>({});

    useEffect(() => {
        setLocalSettings(settings);
    }, [settings]);

    const handleApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const [category, key] = name.split('.');

        if (category === 'deliveryApps' || category === 'iotSensors') {
            setLocalSettings(prev => {
                const categoryState = prev[category as 'deliveryApps' | 'iotSensors'] as any;
                const appState = categoryState[key];
                
                const newAppState = {
                    ...appState,
                    apiKey: value
                };
                
                return {
                    ...prev,
                    [category]: {
                        ...categoryState,
                        [key]: newAppState
                    }
                };
            });
        } else {
            setLocalSettings(prev => ({ ...prev, [name]: value }));
        }
    };
    
    const handleDualCurrencyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const isNumber = e.target.type === 'number';
        setLocalSettings(prev => ({
            ...prev,
            dualCurrency: {
                ...prev.dualCurrency,
                [name]: isNumber ? parseFloat(value) || 0 : value,
            }
        }));
    };

    const handleDualCurrencyToggle = () => {
        setLocalSettings(p => ({
            ...p,
            dualCurrency: {
                ...p.dualCurrency,
                enabled: !p.dualCurrency.enabled
            }
        }))
    };
    
    const handleSave = () => {
        setSettings(localSettings);
        addToast({ type: 'success', title: 'Saved', message: 'Integration settings have been updated.' });
    };

    const deliveryIntegrations = [
        { id: 'uberEats' },
        { id: 'doordash' },
    ];
    
    const iotIntegrations = [
        { id: 'smartFridges' },
        { id: 'storageSensors' },
    ];

    return (
        <div className="p-6 h-full flex flex-col">
            <h3 className="text-xl font-bold text-foreground mb-2 flex items-center gap-2 rtl:flex-row-reverse">
                <LinkIcon className="w-6 h-6" /> {t('integrations_title')}
            </h3>
            <p className="text-sm text-muted-foreground mb-6 rtl:text-end">{t('integrations_description')}</p>
            
            <div className="space-y-8 overflow-y-auto pr-2 flex-grow">
                {/* Delivery */}
                <div>
                     <h4 className="font-bold text-foreground mb-2 flex items-center gap-2 rtl:flex-row-reverse"><ShoppingBagIcon className="w-5 h-5"/> {t('integrations_delivery_group')}</h4>
                    <div className="space-y-4">
                        {deliveryIntegrations.map(integration => {
                            const key = integration.id;
                            const hasKey = !!localSettings.deliveryApps[key]?.apiKey;
                            const isVisible = visibleApiInputs[key] || hasKey;

                            return (
                                <div key={integration.id} className="bg-secondary p-4 rounded-lg text-start rtl:text-end">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-bold text-foreground text-lg flex items-center gap-2 rtl:flex-row-reverse">
                                                {t(`integrations_${integration.id}_name` as any)}
                                                {hasKey && <span className="text-xs font-bold text-green-500 bg-green-500/20 px-2 py-0.5 rounded-full">{t('integrations_connected_badge')}</span>}
                                            </p>
                                            <p className="text-sm text-muted-foreground">{t(`integrations_${integration.id}_desc` as any)}</p>
                                        </div>
                                        <button onClick={() => setVisibleApiInputs(p => ({...p, [key]: !isVisible}))} className={`font-bold py-2 px-4 rounded-lg transition-colors text-sm ${isVisible ? 'bg-muted hover:bg-muted/80 text-muted-foreground' : 'bg-primary hover:bg-primary/90 text-primary-foreground'}`}>
                                            {isVisible ? t('integrations_hide_button') : t('integrations_connect_button')}
                                        </button>
                                    </div>
                                    {isVisible && (
                                        <div className="mt-4">
                                            <label className="text-xs font-semibold text-muted-foreground">{t('integrations_apiKey_label')}</label>
                                            <input type="password" name={`deliveryApps.${key}`} value={localSettings.deliveryApps[key]?.apiKey || ''} onChange={handleApiKeyChange} className="w-full bg-input border border-border rounded-md p-2 mt-1 text-foreground font-mono" />
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* IoT Sensors */}
                <div>
                    <h4 className="font-bold text-foreground mb-2 flex items-center gap-2 rtl:flex-row-reverse">
                        <CubeTransparentIcon className="w-5 h-5"/> {t('integrations_iot_group')} <ProBadge />
                    </h4>
                    <div className="space-y-4">
                        {iotIntegrations.map(integration => {
                            const key = integration.id;
                             const hasKey = !!localSettings.iotSensors[key]?.apiKey;
                            const isVisible = visibleApiInputs[key] || hasKey;
                            
                            return (
                                <div key={integration.id} className="bg-secondary p-4 rounded-lg text-start rtl:text-end">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-bold text-foreground text-lg flex items-center gap-2 rtl:flex-row-reverse">
                                                {t(`integrations_${integration.id}_name` as any)}
                                                {hasKey && <span className="text-xs font-bold text-green-500 bg-green-500/20 px-2 py-0.5 rounded-full">{t('integrations_connected_badge')}</span>}
                                            </p>
                                            <p className="text-sm text-muted-foreground">{t(`integrations_${integration.id}_desc` as any)}</p>
                                        </div>
                                        <button onClick={() => setVisibleApiInputs(p => ({...p, [key]: !isVisible}))} className={`font-bold py-2 px-4 rounded-lg transition-colors text-sm ${isVisible ? 'bg-muted hover:bg-muted/80 text-muted-foreground' : 'bg-primary hover:bg-primary/90 text-primary-foreground'}`}>
                                             {isVisible ? t('integrations_hide_button') : t('integrations_connect_button')}
                                        </button>
                                    </div>
                                     {isVisible && (
                                        <div className="mt-4">
                                            <label className="text-xs font-semibold text-muted-foreground">{t('integrations_apiKeyEndpoint_label')}</label>
                                            <input type="password" name={`iotSensors.${key}`} value={localSettings.iotSensors[key]?.apiKey || ''} onChange={handleApiKeyChange} className="w-full bg-input border border-border rounded-md p-2 mt-1 text-foreground font-mono" />
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                </div>
                
                <div>
                    <h4 className="font-bold text-foreground mb-2 flex items-center gap-2 rtl:flex-row-reverse"><CurrencyExchangeIcon className="w-5 h-5"/> {t('integrations_dualCurrency_group')} <ProBadge /></h4>
                    <div className="space-y-4">
                        <div className="bg-secondary p-4 rounded-lg text-start rtl:text-end">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-bold text-foreground text-lg flex items-center gap-2 rtl:flex-row-reverse">
                                        {t('integrations_dualCurrency_enable_label')}
                                    </p>
                                    <p className="text-sm text-muted-foreground">{t('integrations_dualCurrency_enable_desc')}</p>
                                </div>
                                <button
                                    onClick={handleDualCurrencyToggle}
                                    className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors flex-shrink-0 ${localSettings.dualCurrency.enabled ? 'bg-primary' : 'bg-muted'}`}
                                >
                                    <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${localSettings.dualCurrency.enabled ? 'translate-x-6' : 'translate-x-1'}`}/>
                                </button>
                            </div>

                            {localSettings.dualCurrency.enabled && (
                                <div className="mt-4 space-y-4 pt-4 border-t border-border animate-fade-in-down">
                                    <div>
                                        <label className="text-xs font-semibold text-muted-foreground">{t('integrations_dualCurrency_symbol_label')}</label>
                                        <input 
                                            type="text" 
                                            name="secondaryCurrency" 
                                            value={localSettings.dualCurrency.secondaryCurrency} 
                                            onChange={handleDualCurrencyChange} 
                                            className="w-full bg-input border border-border rounded-md p-2 mt-1 text-foreground"
                                            maxLength={5}
                                            placeholder="e.g., USD, €"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-muted-foreground">{t('integrations_dualCurrency_rate_label')} (1 {currentLocation.currency} = X Secondary)</label>
                                        <input 
                                            type="number" 
                                            name="exchangeRate" 
                                            value={localSettings.dualCurrency.exchangeRate} 
                                            onChange={handleDualCurrencyChange} 
                                            className="w-full bg-input border border-border rounded-md p-2 mt-1 text-foreground"
                                            step="0.0001"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

            </div>
            <div className="mt-auto pt-6 text-end rtl:text-left">
                <button onClick={handleSave} className="px-6 py-2 rounded-md bg-primary text-primary-foreground font-semibold hover:bg-primary/90">
                    {t('saveIntegrationSettings')}
                </button>
            </div>
        </div>
    );
};

export default IntegrationsSettings;
