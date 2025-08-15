
import React, { useState, useEffect } from 'react';
import { AppSettings, AccountingSoftware, ReservationSystem, IoTSensorIntegrations, DualCurrencySettings } from '../types';
import LinkIcon from './icons/LinkIcon';
import ShoppingBagIcon from './icons/ShoppingBagIcon';
import AccountingIcon from './icons/AccountingIcon';
import CalendarUserIcon from './icons/CalendarUserIcon';
import CubeTransparentIcon from './icons/CubeTransparentIcon';
import ProBadge from './ProBadge';
import { useAppContext, useToastContext } from '../contexts/AppContext';
import CurrencyExchangeIcon from './icons/CurrencyExchangeIcon';

const IntegrationsSettings: React.FC = () => {
    const { settings, setSettings, currentLocation } = useAppContext();
    const { addToast } = useToastContext();
    const [localSettings, setLocalSettings] = useState<AppSettings>(settings);
    const [visibleApiInputs, setVisibleApiInputs] = useState<Record<string, boolean>>({});

    useEffect(() => {
        setLocalSettings(settings);
    }, [settings]);

    const handleToggle = (category: 'deliveryApps' | 'iotSensors', key: string) => {
        setLocalSettings(prev => {
            const categoryState = prev[category] as any;
            const appState = categoryState[key];
            const newAppState = {
                ...appState,
                enabled: !appState.enabled,
                apiKey: appState.enabled ? '' : appState.apiKey, // if it was enabled, clear key.
            };

            return {
                ...prev,
                [category]: {
                    ...categoryState,
                    [key]: newAppState,
                },
            };
        });
        setVisibleApiInputs(prev => ({ ...prev, [key]: !prev[key] }));
    };


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
        { id: 'uberEats', name: 'Uber Eats', description: 'Pull in orders directly to your KDS.' },
        { id: 'doordash', name: 'DoorDash', description: 'Eliminate manual entry for DoorDash orders.' },
    ];
    
    const iotIntegrations = [
        { id: 'smartFridges', name: 'Smart Fridges', description: 'Update dairy and meat stock levels automatically.' },
        { id: 'storageSensors', name: 'Storage Sensors', description: 'Track dry goods with smart weight sensors.' },
    ];

    return (
        <div className="p-6 h-full flex flex-col">
            <h3 className="text-xl font-bold text-foreground mb-2 flex items-center gap-2">
                <LinkIcon className="w-6 h-6" /> App Integrations
            </h3>
            <p className="text-sm text-muted-foreground mb-6">Connect ordino Pos to your other business tools.</p>
            
            <div className="space-y-8 overflow-y-auto pr-2 flex-grow">
                {/* Delivery */}
                <div>
                     <h4 className="font-bold text-foreground mb-2 flex items-center gap-2"><ShoppingBagIcon className="w-5 h-5"/> Food Delivery Apps</h4>
                    <div className="space-y-4">
                        {deliveryIntegrations.map(integration => {
                            const key = integration.id as keyof typeof localSettings.deliveryApps;
                            const hasKey = !!localSettings.deliveryApps[key].apiKey;
                            const isVisible = visibleApiInputs[key] || hasKey;

                            return (
                                <div key={integration.id} className="bg-secondary p-4 rounded-lg">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-bold text-foreground text-lg flex items-center gap-2">
                                                {integration.name}
                                                {hasKey && <span className="text-xs font-bold text-green-500 bg-green-500/20 px-2 py-0.5 rounded-full">Connected</span>}
                                            </p>
                                            <p className="text-sm text-muted-foreground">{integration.description}</p>
                                        </div>
                                        <button onClick={() => setVisibleApiInputs(p => ({...p, [key]: !isVisible}))} className={`font-bold py-2 px-4 rounded-lg transition-colors text-sm ${isVisible ? 'bg-muted hover:bg-muted/80 text-muted-foreground' : 'bg-primary hover:bg-primary/90 text-primary-foreground'}`}>
                                            {isVisible ? 'Hide' : 'Connect'}
                                        </button>
                                    </div>
                                    {isVisible && (
                                        <div className="mt-4">
                                            <label className="text-xs font-semibold text-muted-foreground">API Key</label>
                                            <input type="password" name={`deliveryApps.${key}`} value={localSettings.deliveryApps[key].apiKey} onChange={handleApiKeyChange} className="w-full bg-input border border-border rounded-md p-2 mt-1 text-foreground font-mono" />
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* IoT Sensors */}
                <div>
                    <h4 className="font-bold text-foreground mb-2 flex items-center gap-2">
                        <CubeTransparentIcon className="w-5 h-5"/> IoT Sensors <ProBadge />
                    </h4>
                    <div className="space-y-4">
                        {iotIntegrations.map(integration => {
                            const key = integration.id as keyof typeof localSettings.iotSensors;
                             const hasKey = !!localSettings.iotSensors[key].apiKey;
                            const isVisible = visibleApiInputs[key] || hasKey;
                            
                            return (
                                <div key={integration.id} className="bg-secondary p-4 rounded-lg">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-bold text-foreground text-lg flex items-center gap-2">
                                                {integration.name}
                                                {hasKey && <span className="text-xs font-bold text-green-500 bg-green-500/20 px-2 py-0.5 rounded-full">Connected</span>}
                                            </p>
                                            <p className="text-sm text-muted-foreground">{integration.description}</p>
                                        </div>
                                        <button onClick={() => setVisibleApiInputs(p => ({...p, [key]: !isVisible}))} className={`font-bold py-2 px-4 rounded-lg transition-colors text-sm ${isVisible ? 'bg-muted hover:bg-muted/80 text-muted-foreground' : 'bg-primary hover:bg-primary/90 text-primary-foreground'}`}>
                                             {isVisible ? 'Hide' : 'Connect'}
                                        </button>
                                    </div>
                                     {isVisible && (
                                        <div className="mt-4">
                                            <label className="text-xs font-semibold text-muted-foreground">API Key / Endpoint</label>
                                            <input type="password" name={`iotSensors.${key}`} value={localSettings.iotSensors[key].apiKey} onChange={handleApiKeyChange} className="w-full bg-input border border-border rounded-md p-2 mt-1 text-foreground font-mono" />
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                </div>
                
                <div>
                    <h4 className="font-bold text-foreground mb-2 flex items-center gap-2"><CurrencyExchangeIcon className="w-5 h-5"/> Dual Currency Display <ProBadge /></h4>
                    <div className="space-y-4">
                        <div className="bg-secondary p-4 rounded-lg">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-bold text-foreground text-lg flex items-center gap-2">
                                        Enable Secondary Currency
                                    </p>
                                    <p className="text-sm text-muted-foreground">Display a converted total on receipts and payment screens.</p>
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
                                        <label className="text-xs font-semibold text-muted-foreground">Secondary Currency Symbol</label>
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
                                        <label className="text-xs font-semibold text-muted-foreground">Exchange Rate (1 {currentLocation.currency} = X Secondary)</label>
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
            <div className="mt-auto pt-6 text-right">
                <button onClick={handleSave} className="px-6 py-2 rounded-md bg-primary text-primary-foreground font-semibold hover:bg-primary/90">
                    Save Integration Settings
                </button>
            </div>
        </div>
    );
};

export default IntegrationsSettings;
