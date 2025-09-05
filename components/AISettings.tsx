
import React, { useState, useEffect } from 'react';
import { AppSettings, AISettings as AISettingsType } from '../types';
import InformationCircleIcon from './icons/InformationCircleIcon';
import { useAppContext, useToastContext } from '../contexts/AppContext';
import { useTranslations } from '../hooks/useTranslations';
import CpuChipIcon from './icons/CpuChipIcon';

const Toggle: React.FC<{ label: string; enabled: boolean; onToggle?: () => void; disabled?: boolean }> = ({ label, enabled, onToggle, disabled = false }) => (
    <label className={`flex items-center justify-between p-3 rounded-lg bg-secondary ${disabled ? 'opacity-50' : 'cursor-pointer'}`}>
        <span className="font-medium text-foreground">{label}</span>
        <button
            type="button"
            onClick={() => {
                if (typeof onToggle === 'function') {
                    onToggle();
                }
            }}
            disabled={disabled}
            className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${enabled ? 'bg-primary' : 'bg-muted'}`}
        >
            <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${enabled ? 'translate-x-6' : 'translate-x-1'}`}/>
        </button>
    </label>
);

const AISettings: React.FC = () => {
    const { settings, setSettings } = useAppContext();
    const t = useTranslations(settings.language.staff);
    const { addToast } = useToastContext();
    const [localAiSettings, setLocalAiSettings] = useState<AISettingsType>(settings.ai);

    useEffect(() => {
        setLocalAiSettings(settings.ai);
    }, [settings.ai]);

    const handleToggle = (key: keyof AISettingsType) => {
        setLocalAiSettings(prev => ({ ...prev, [key]: !prev[key as keyof AISettingsType] }));
    };

    const handleSave = () => {
        setSettings({ ...settings, ai: localAiSettings });
        addToast({ type: 'success', title: 'Saved', message: 'AI Settings have been updated.' });
    };

    const apiKeyStatus = process.env.API_KEY ? 'Configured' : 'Not Configured';

    return (
        <div className="p-6 h-full flex flex-col">
            <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-3 rtl:flex-row-reverse">
                <CpuChipIcon className="w-6 h-6" /> {t('ai_title')}
            </h2>
            <p className="text-muted-foreground mb-6 max-w-2xl text-start rtl:text-end">
                {t('ai_description')}
            </p>

            <div className="space-y-6 max-w-lg">
                <div className="bg-secondary p-4 rounded-lg">
                    <h4 className="font-bold text-foreground mb-2 text-start rtl:text-end">{t('ai_apiStatus_group')}</h4>
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                           <span className="text-muted-foreground">{t('ai_apiKey_label')}</span>
                           <div className="group relative">
                                <InformationCircleIcon className="w-4 h-4 text-muted-foreground/50 cursor-help" />
                                <div className="absolute bottom-full start-1/2 -translate-x-1/2 mb-2 w-64 bg-popover text-popover-foreground text-xs rounded-md p-2 border border-border opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                    {t('ai_apiKey_help')}
                                </div>
                           </div>
                        </div>
                        <span className={`font-semibold px-2 py-1 rounded-full text-xs ${apiKeyStatus === 'Configured' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                            {t(apiKeyStatus === 'Configured' ? 'ai_apiKeyStatus_configured' : 'ai_apiKeyStatus_notConfigured')}
                        </span>
                    </div>
                </div>

                <div className="bg-secondary p-4 rounded-lg">
                    <h4 className="font-bold text-foreground mb-4 text-start rtl:text-end">{t('ai_featureControls_group')}</h4>
                    <div className="space-y-4">
                        <Toggle
                            label={t('ai_enableAll_label')}
                            enabled={localAiSettings.enableAIFeatures}
                            onToggle={() => handleToggle('enableAIFeatures')}
                        />
                        <div className={`ps-6 border-s-2 border-border space-y-4 transition-opacity ${!localAiSettings.enableAIFeatures ? 'opacity-50' : ''}`}>
                            <Toggle
                                label={t('ai_enableUpsell_label')}
                                enabled={localAiSettings.enableUpsell}
                                onToggle={() => handleToggle('enableUpsell')}
                                disabled={!localAiSettings.enableAIFeatures}
                            />
                            <Toggle
                                label={t('ai_enableCFDSuggestions_label')}
                                enabled={localAiSettings.enableCFDSuggestions}
                                onToggle={() => handleToggle('enableCFDSuggestions')}
                                disabled={!localAiSettings.enableAIFeatures}
                            />
                            <Toggle
                                label={t('ai_enableReportAnalysis_label')}
                                enabled={localAiSettings.enableReportAnalysis}
                                onToggle={() => handleToggle('enableReportAnalysis')}
                                disabled={!localAiSettings.enableAIFeatures}
                            />
                        </div>
                    </div>
                </div>

                <div className="text-end rtl:text-left">
                    <button onClick={handleSave} className="px-6 py-2 rounded-md bg-primary text-primary-foreground font-semibold hover:bg-primary/90">
                        {t('ai_save_button')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AISettings;
