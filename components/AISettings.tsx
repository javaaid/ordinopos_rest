
import React, { useState, useEffect } from 'react';
import { AppSettings, AISettings as AISettingsType } from '../types';
import ProBadge from './ProBadge';
import InformationCircleIcon from './icons/InformationCircleIcon';
import { useAppContext, useToastContext } from '../contexts/AppContext';

const Toggle: React.FC<{ label: string; enabled: boolean; onToggle: () => void; disabled?: boolean }> = ({ label, enabled, onToggle, disabled = false }) => (
    <label className={`flex items-center justify-between p-3 rounded-lg bg-secondary ${disabled ? 'opacity-50' : 'cursor-pointer'}`}>
        <span className="font-medium text-foreground">{label}</span>
        <button
            type="button"
            onClick={onToggle}
            disabled={disabled}
            className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${enabled ? 'bg-primary' : 'bg-muted'}`}
        >
            <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${enabled ? 'translate-x-6' : 'translate-x-1'}`}/>
        </button>
    </label>
);

const AISettings: React.FC = () => {
    const { settings, setSettings } = useAppContext();
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
            <h2 className="text-2xl font-bold text-foreground mb-4">AI Settings</h2>
            <p className="text-muted-foreground mb-6 max-w-2xl">
                Configure generative AI features powered by the Gemini API. These features can help with upselling, customer displays, and data analysis. An API key must be configured in the environment for these features to work.
            </p>

            <div className="space-y-6 max-w-lg">
                <div className="bg-secondary p-4 rounded-lg">
                    <h4 className="font-bold text-foreground mb-2">API Status</h4>
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                           <span className="text-muted-foreground">Gemini API Key</span>
                           <div className="group relative">
                                <InformationCircleIcon className="w-4 h-4 text-muted-foreground/50 cursor-help" />
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 bg-popover text-popover-foreground text-xs rounded-md p-2 border border-border opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                    The API Key is securely managed through an environment variable on the server and cannot be changed here.
                                </div>
                           </div>
                        </div>
                        <span className={`font-semibold px-2 py-1 rounded-full text-xs ${apiKeyStatus === 'Configured' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                            {apiKeyStatus}
                        </span>
                    </div>
                </div>

                <div className="bg-secondary p-4 rounded-lg">
                    <h4 className="font-bold text-foreground mb-4">Feature Controls</h4>
                    <div className="space-y-4">
                        <Toggle
                            label="Enable All AI Features"
                            enabled={localAiSettings.enableAIFeatures}
                            onToggle={() => handleToggle('enableAIFeatures')}
                        />
                        <div className={`pl-6 border-l-2 border-border space-y-4 transition-opacity ${!localAiSettings.enableAIFeatures ? 'opacity-50' : ''}`}>
                            <Toggle
                                label="AI Upsell Suggestions"
                                enabled={localAiSettings.enableUpsell}
                                onToggle={() => handleToggle('enableUpsell')}
                                disabled={!localAiSettings.enableAIFeatures}
                            />
                            <Toggle
                                label="Customer Facing Display (CFD) Suggestions"
                                enabled={localAiSettings.enableCFDSuggestions}
                                onToggle={() => handleToggle('enableCFDSuggestions')}
                                disabled={!localAiSettings.enableAIFeatures}
                            />
                            <Toggle
                                label="AI-Powered Report Analysis"
                                enabled={localAiSettings.enableReportAnalysis}
                                onToggle={() => handleToggle('enableReportAnalysis')}
                                disabled={!localAiSettings.enableAIFeatures}
                            />
                        </div>
                    </div>
                </div>

                <div className="text-right">
                    <button onClick={handleSave} className="px-6 py-2 rounded-md bg-primary text-primary-foreground font-semibold hover:bg-primary/90">
                        Save AI Settings
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AISettings;
