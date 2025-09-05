import React, { useState, useEffect } from 'react';
import { useAppContext, useToastContext } from '../contexts/AppContext';
import { useTranslations } from '../hooks/useTranslations';
import { TranslationKey } from '../types';

const GratuityManagementTab: React.FC = () => {
    const { settings, setSettings } = useAppContext();
    const { addToast } = useToastContext();
    const t = useTranslations(settings.language.staff);
    const [options, setOptions] = useState([0, 0, 0, 0]);

    useEffect(() => {
        setOptions(settings.orderSettings.gratuityOptions || [0, 0, 0, 0]);
    }, [settings.orderSettings.gratuityOptions]);

    const handleOptionChange = (index: number, value: string) => {
        const newOptions = [...options];
        newOptions[index] = parseFloat(value) || 0;
        setOptions(newOptions);
    };

    const handleSave = () => {
        setSettings((prev: any) => ({
            ...prev,
            orderSettings: {
                ...prev.orderSettings,
                gratuityOptions: options,
            },
        }));
        addToast({ type: 'success', title: 'Settings Saved', message: 'Gratuity options have been updated.' });
    };
    
    const optionLabels: TranslationKey[] = ['option1', 'option2', 'option3', 'option4'];

    return (
        <div className="text-start rtl:text-end">
            <h3 className="text-xl font-bold text-foreground">{t('gratuitySettings')}</h3>
            <p className="text-muted-foreground mt-2 mb-6">
                {t('gratuitySettingsDescription')}
            </p>
            <div className="bg-secondary p-6 rounded-lg max-w-md space-y-4 border border-border">
                <div className="grid grid-cols-2 gap-4">
                    {[0, 1, 2, 3].map(index => (
                        <div key={index}>
                            <label className="block text-sm font-medium text-muted-foreground mb-1">{t(optionLabels[index])}</label>
                            <input
                                type="number"
                                value={options[index]}
                                onChange={e => handleOptionChange(index, e.target.value)}
                                className="w-full bg-input p-2 rounded-md border border-border focus:ring-primary focus:border-primary text-foreground"
                                min="0"
                            />
                        </div>
                    ))}
                </div>
                <div className="pt-4 text-end">
                    <button
                        onClick={handleSave}
                        className="px-6 py-2 rounded-md bg-primary text-primary-foreground font-semibold hover:bg-primary/90"
                    >
                        {t('saveGratuitySettings')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default GratuityManagementTab;