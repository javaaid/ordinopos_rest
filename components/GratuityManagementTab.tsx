


import React, { useState, useEffect } from 'react';
import { useAppContext, useToastContext } from '../contexts/AppContext';

const GratuityManagementTab: React.FC = () => {
    const { settings, setSettings } = useAppContext();
    const { addToast } = useToastContext();
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

    return (
        <div>
            <h3 className="text-xl font-bold text-foreground">Gratuity Settings</h3>
            <p className="text-muted-foreground mt-2 mb-6">
                Set up to four preset gratuity percentages for quick selection on the payment screen.
            </p>
            <div className="bg-secondary p-6 rounded-lg max-w-md space-y-4 border border-border">
                <div className="grid grid-cols-2 gap-4">
                    {[0, 1, 2, 3].map(index => (
                        <div key={index}>
                            <label className="block text-sm font-medium text-muted-foreground mb-1">Option {index + 1} (%)</label>
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
                <div className="pt-4 text-right">
                    <button
                        onClick={handleSave}
                        className="px-6 py-2 rounded-md bg-primary text-primary-foreground font-semibold hover:bg-primary/90"
                    >
                        Save Gratuity Settings
                    </button>
                </div>
            </div>
        </div>
    );
};

export default GratuityManagementTab;
