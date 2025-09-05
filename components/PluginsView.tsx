

import React from 'react';
import { AppPlugin, AppSettings } from '../types';
import PlusIcon from './icons/PlusIcon';
import CogIcon from './icons/CogIcon';
import { useDataContext, useModalContext, useToastContext, useAppContext } from '../contexts/AppContext';
import { useTranslations } from '../hooks/useTranslations';

const TRIAL_DAYS = 30;

const PluginCard: React.FC<{ plugin: AppPlugin, onToggle: (id: string) => void, onActivate: (plugin: AppPlugin) => void, onConfigure: (id: string) => void }> = ({ plugin, onToggle, onActivate, onConfigure }) => {
    const isEnabled = plugin.status === 'enabled' || plugin.status === 'trial';
    const canBeToggled = plugin.id !== 'plugins-viewer'; // The manager itself cannot be disabled.
    
    let statusText: string;
    let statusColor: string;
    let subtext: string | null = null;
    
    const now = Date.now();

    switch (plugin.status) {
        case 'enabled':
            statusText = 'Active';
            statusColor = 'bg-green-500 text-white';
            break;
        case 'trial':
            const trialExpires = (plugin.trialStartDate || 0) + TRIAL_DAYS * 24 * 60 * 60 * 1000;
            const daysLeftTrial = Math.max(0, (trialExpires - now) / (1000 * 60 * 60 * 24)).toFixed(0);
            statusText = 'Active';
            statusColor = 'bg-green-500 text-white';
            subtext = `Trial expires in ${daysLeftTrial} day(s).`;
            break;
        case 'expired':
            statusText = 'Expired';
            statusColor = 'bg-red-500 text-white';
            subtext = 'Trial has expired.';
            break;
        default:
            statusText = 'Inactive';
            statusColor = 'bg-muted text-muted-foreground';
    }

    if (plugin.status === 'enabled' && plugin.activationDate && plugin.licenseDurationDays) {
        const licenseExpires = plugin.activationDate + plugin.licenseDurationDays * 24 * 60 * 60 * 1000;
        const daysLeftLicense = Math.max(0, (licenseExpires - now) / (1000 * 60 * 60 * 24)).toFixed(0);
        subtext = `License expires in ${daysLeftLicense} day(s).`;
    }

    const canConfigure = isEnabled && (plugin.isFree || plugin.id === 'payment-terminal');

    return (
        <div className="bg-card border border-border rounded-lg p-4 flex flex-col justify-between text-start rtl:text-right">
            <div>
                <div className="flex justify-between items-start">
                    <div>
                        <h4 className="font-bold text-foreground">{plugin.name}</h4>
                        <div className="flex items-center gap-2 mt-1">
                             <span className={`px-2 py-0.5 text-xs font-semibold rounded ${statusColor}`}>{statusText}</span>
                             <span className="text-xs text-muted-foreground">v{plugin.version}</span>
                        </div>
                    </div>
                     <button
                        onClick={() => canBeToggled && onToggle(plugin.id)}
                        disabled={!canBeToggled}
                        className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors flex-shrink-0 ${isEnabled ? 'bg-primary' : 'bg-muted'} ${!canBeToggled ? 'cursor-not-allowed opacity-50' : ''}`}
                        title={!canBeToggled ? "The Plugin Manager cannot be disabled." : ""}
                    >
                        <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${isEnabled ? 'translate-x-6' : 'translate-x-1'}`}/>
                    </button>
                </div>
                <p className="text-sm text-muted-foreground mt-2">{plugin.description}</p>
            </div>
            <div className="mt-4 flex justify-between items-center">
                <div>
                    {plugin.isFree ? (
                        <span className="text-sm font-semibold text-green-500">Free to use</span>
                    ) : (
                        <span className="text-sm font-semibold text-yellow-500">{subtext}</span>
                    )}
                </div>
                <div>
                    {canConfigure && (
                        <button onClick={() => onConfigure(plugin.id)} className="text-xs font-semibold text-muted-foreground hover:text-foreground flex items-center gap-1">
                            <CogIcon className="w-4 h-4" /> Configure
                        </button>
                    )}
                    {!plugin.isFree && plugin.status !== 'enabled' && plugin.status !== 'trial' && (
                         <button onClick={() => onActivate(plugin)} className="text-xs font-semibold text-primary hover:underline">
                            Activate License
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

const PluginsView: React.FC = () => {
    const { plugins, handleTogglePlugin, handleActivatePlugin, settings, setSettings } = useAppContext();
    const { addToast } = useToastContext();
    const { openModal } = useModalContext();
    const t = useTranslations(settings.language.staff);

    const onConfigure = (pluginId: string) => {
        if (pluginId === 'payment-terminal') {
            openModal('paymentTerminalSettings', {
                settings: settings,
                onSave: (newSettings: Partial<AppSettings>) => {
                    setSettings((prev: AppSettings) => ({ ...prev, ...newSettings }));
                    addToast({ type: 'success', title: 'Settings Saved', message: 'Payment terminal settings have been updated.' });
                }
            });
        } else {
            addToast({ type: 'info', title: 'No Configuration', message: 'This plugin has no configurable settings.' });
        }
    };
    
    const onActivate = (plugin: AppPlugin) => openModal('activation', { plugin, onActivate: handleActivatePlugin });
    
    const freePlugins = (plugins || []).filter((p: AppPlugin) => p.isFree);
    const paidPlugins = (plugins || []).filter((p: AppPlugin) => !p.isFree);
    
    const handleFabClick = () => {
        alert('This feature will allow browsing and installing new plugins from the marketplace in a future update.');
    };

    return (
        <div className="p-6 h-full flex flex-col rounded-lg">
            <div className="flex justify-between items-center mb-6">
                <div className="rtl:text-right">
                    <h2 className="text-2xl font-bold text-foreground">{t('plugins')}</h2>
                    <p className="text-muted-foreground">{t('pluginsDescription')}</p>
                </div>
                 <button onClick={handleFabClick} className="bg-primary text-primary-foreground p-3 rounded-full shadow-lg hover:bg-primary/90">
                    <PlusIcon className="w-6 h-6"/>
                </button>
            </div>
            
            <div className="overflow-y-auto space-y-8">
                <div>
                    <h3 className="text-xl font-semibold text-foreground mb-4 rtl:text-right">Management</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {freePlugins.map(plugin => <PluginCard key={plugin.id} plugin={plugin} onToggle={handleTogglePlugin} onActivate={onActivate} onConfigure={onConfigure} />)}
                    </div>
                </div>
                <div>
                    <h3 className="text-xl font-semibold text-foreground mb-4 rtl:text-right">Paid Plugins</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {paidPlugins.map(plugin => <PluginCard key={plugin.id} plugin={plugin} onToggle={handleTogglePlugin} onActivate={onActivate} onConfigure={onConfigure} />)}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PluginsView;