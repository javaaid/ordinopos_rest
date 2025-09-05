
import React, { useState, useEffect } from 'react';
import { useAppContext, useModalContext, useDataContext } from '../contexts/AppContext';
import { PizzaBuilderSettings, PizzaSize, PizzaCrust, PizzaSauce, PizzaCheese, PizzaToppingItem, TranslationKey } from '../types';
import { Button } from './ui/Button';
import PlusIcon from './icons/PlusIcon';
import PencilSquareIcon from './icons/PencilSquareIcon';
import TrashIcon from './icons/TrashIcon';
import { useTranslations } from '../hooks/useTranslations';
import { PIZZA_OPTIONS } from '../constants';

type PizzaOption = PizzaSize | PizzaCrust | PizzaSauce | PizzaCheese | PizzaToppingItem;
type OptionType = 'sizes' | 'crusts' | 'sauces' | 'cheeses' | 'toppings';

const PizzaBuilderSettingsView: React.FC = () => {
    const { currentLocation, settings } = useAppContext();
    const t = useTranslations(settings.language.staff);
    const { handleSaveLocation } = useDataContext();
    const { openModal, closeModal, addToast } = useModalContext();

    const [localSettings, setLocalSettings] = useState<PizzaBuilderSettings>(() => {
        // This safely merges default options with any stored settings to prevent crashes.
        const defaultOpts = PIZZA_OPTIONS;
        const savedOpts = currentLocation.pizzaBuilder || {};
        return {
            sizes: savedOpts.sizes?.length ? savedOpts.sizes : defaultOpts.sizes,
            crusts: savedOpts.crusts?.length ? savedOpts.crusts : defaultOpts.crusts,
            sauces: savedOpts.sauces?.length ? savedOpts.sauces : defaultOpts.sauces,
            cheeses: savedOpts.cheeses?.length ? savedOpts.cheeses : defaultOpts.cheeses,
            toppings: savedOpts.toppings?.length ? savedOpts.toppings : defaultOpts.toppings,
        };
    });

    useEffect(() => {
        const defaultOpts = PIZZA_OPTIONS;
        const savedOpts = currentLocation.pizzaBuilder || {};
        setLocalSettings({
            sizes: savedOpts.sizes?.length ? savedOpts.sizes : defaultOpts.sizes,
            crusts: savedOpts.crusts?.length ? savedOpts.crusts : defaultOpts.crusts,
            sauces: savedOpts.sauces?.length ? savedOpts.sauces : defaultOpts.sauces,
            cheeses: savedOpts.cheeses?.length ? savedOpts.cheeses : defaultOpts.cheeses,
            toppings: savedOpts.toppings?.length ? savedOpts.toppings : defaultOpts.toppings,
        });
    }, [currentLocation]);

    const handleSave = () => {
        handleSaveLocation({ ...currentLocation, pizzaBuilder: localSettings }, false);
        addToast({ type: 'success', title: 'Settings Saved', message: 'Pizza Builder settings have been updated.' });
    };

    const handleSaveOption = (type: OptionType, updatedOption: PizzaOption) => {
        setLocalSettings(prev => {
            const items = prev[type] as PizzaOption[];
            const existingIndex = items.findIndex(o => o.id === updatedOption.id);
            if (existingIndex > -1) {
                const newItems = [...items];
                newItems[existingIndex] = updatedOption;
                return { ...prev, [type]: newItems };
            } else {
                return { ...prev, [type]: [...items, updatedOption] };
            }
        });
        closeModal();
    };

    const handleEditOption = (type: OptionType, option: PizzaOption) => {
        openModal('pizzaOptionEdit', {
            option,
            optionType: type.slice(0, -1),
            onSave: (updatedOption: PizzaOption) => handleSaveOption(type, updatedOption),
        });
    };

    const handleAddOption = (type: OptionType) => {
        openModal('pizzaOptionEdit', {
            option: null,
            optionType: type.slice(0, -1),
            onSave: (newOption: PizzaOption) => handleSaveOption(type, newOption),
        });
    };

    const handleDeleteOption = (type: OptionType, optionId: string) => {
        if (window.confirm('Are you sure you want to delete this option?')) {
            setLocalSettings(prev => ({
                ...prev,
                [type]: (prev[type] as PizzaOption[]).filter(o => o.id !== optionId),
            }));
        }
    };

    const renderSection = (titleKey: TranslationKey, type: OptionType, options: PizzaOption[]) => (
        <div className="bg-secondary p-4 rounded-lg">
            <div className="flex justify-between items-center mb-3">
                <h4 className="font-bold text-foreground text-start rtl:text-end">{t(titleKey)}</h4>
                <Button size="sm" onClick={() => handleAddOption(type)} className="flex items-center gap-1">
                    <PlusIcon className="w-4 h-4" /> {t('add')}
                </Button>
            </div>
            <div className="space-y-2">
                {(options || []).map(option => (
                    <div key={option.id} className="bg-background p-2 rounded-md flex justify-between items-center border border-border text-start rtl:text-end">
                        <div>
                            <span className="font-medium text-foreground">{option.name}</span>
                            <span className="text-sm text-muted-foreground ms-2">+${option.price.toFixed(2)}</span>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => handleEditOption(type, option)} className="p-1 text-primary hover:opacity-80"><PencilSquareIcon className="w-4 h-4" /></button>
                            <button onClick={() => handleDeleteOption(type, option.id)} className="p-1 text-destructive hover:opacity-80"><TrashIcon className="w-4 h-4" /></button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
    
    return (
        <div className="p-6 h-full flex flex-col text-start">
            <h3 className="text-xl font-bold text-foreground rtl:text-end">{t('pizzaBuilderSettings')}</h3>
            <p className="text-sm text-muted-foreground mb-6 rtl:text-end">
                {t('pizzaBuilderSettingsDescription').replace('{locationName}', currentLocation.name)}
            </p>

            <div className="flex-grow grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-y-auto pr-2">
                {renderSection('sizes', 'sizes', localSettings.sizes)}
                {renderSection('crusts', 'crusts', localSettings.crusts)}
                {renderSection('sauces', 'sauces', localSettings.sauces)}
                {renderSection('cheeses', 'cheeses', localSettings.cheeses)}
                <div className="lg:col-span-2">
                    {renderSection('toppings', 'toppings', localSettings.toppings)}
                </div>
            </div>
            
            <div className="mt-auto pt-6 text-end">
                <Button onClick={handleSave} size="lg">
                    {t('savePizzaSettings')}
                </Button>
            </div>
        </div>
    );
};

export default PizzaBuilderSettingsView;
