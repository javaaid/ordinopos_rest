import React, { useState, useEffect } from 'react';
import { useAppContext, useModalContext, useDataContext } from '../contexts/AppContext';
import { BurgerBuilderSettings, BurgerBun, BurgerPatty, BurgerCheese, BurgerToppingItem, BurgerSauce, BurgerExtras } from '../types';
import { Button } from './ui/Button';
import PlusIcon from './icons/PlusIcon';
import PencilSquareIcon from './icons/PencilSquareIcon';
import TrashIcon from './icons/TrashIcon';

type BurgerOption = BurgerBun | BurgerPatty | BurgerCheese | BurgerToppingItem | BurgerSauce | BurgerExtras;
type OptionType = 'buns' | 'patties' | 'cheeses' | 'toppings' | 'sauces' | 'extras';

const BurgerBuilderSettingsView: React.FC = () => {
    const { currentLocation } = useAppContext();
    const { handleSaveLocation } = useDataContext();
    const { openModal, closeModal } = useModalContext();
    const [localSettings, setLocalSettings] = useState<BurgerBuilderSettings>(currentLocation.burgerBuilder);

    useEffect(() => {
        setLocalSettings(currentLocation.burgerBuilder);
    }, [currentLocation]);

    const handleSave = () => {
        handleSaveLocation({ ...currentLocation, burgerBuilder: localSettings }, false);
        alert('Burger Builder settings saved!');
    };
    
    // A generic handler for all option types
    const handleSaveOption = (type: OptionType, updatedOption: BurgerOption) => {
        setLocalSettings(prev => {
            const items = prev[type] as BurgerOption[];
            const existingIndex = items.findIndex(o => o.id === updatedOption.id);
            if (existingIndex > -1) {
                // Update existing
                const newItems = [...items];
                newItems[existingIndex] = updatedOption;
                return { ...prev, [type]: newItems };
            } else {
                // Add new
                return { ...prev, [type]: [...items, updatedOption] };
            }
        });
        closeModal();
    };

    const handleEditOption = (type: OptionType, option: BurgerOption) => {
        openModal('burgerOptionEdit', {
            option,
            optionType: type.slice(0, -1),
            onSave: (updatedOption: BurgerOption) => handleSaveOption(type, updatedOption),
        });
    };

    const handleAddOption = (type: OptionType) => {
        openModal('burgerOptionEdit', {
            option: null,
            optionType: type.slice(0, -1),
            onSave: (newOption: BurgerOption) => handleSaveOption(type, newOption),
        });
    };
    
    const handleDeleteOption = (type: OptionType, optionId: string) => {
        if (window.confirm('Are you sure you want to delete this option?')) {
            setLocalSettings(prev => ({
                ...prev,
                [type]: (prev[type] as BurgerOption[]).filter(o => o.id !== optionId),
            }));
        }
    };

    const renderSection = (title: string, type: OptionType, options: BurgerOption[]) => (
        <div className="bg-secondary p-4 rounded-lg">
            <div className="flex justify-between items-center mb-3">
                <h4 className="font-bold text-foreground">{title}</h4>
                <Button size="sm" onClick={() => handleAddOption(type)} className="flex items-center gap-1">
                    <PlusIcon className="w-4 h-4" /> Add
                </Button>
            </div>
            <div className="space-y-2">
                {options.map(option => (
                    <div key={option.id} className="bg-background p-2 rounded-md flex justify-between items-center border border-border">
                        <div>
                            <span className="font-medium text-foreground">{option.name}</span>
                            <span className="text-sm text-muted-foreground ml-2">+${option.price.toFixed(2)}</span>
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
        <div className="p-6 h-full flex flex-col">
            <h3 className="text-xl font-bold text-foreground">Burger Builder Settings</h3>
            <p className="text-sm text-muted-foreground mb-6">Customize all available options for the "Build Your Own Burger" item for <span className="font-bold">{currentLocation.name}</span>.</p>

            <div className="flex-grow grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-y-auto pr-2">
                {renderSection('Buns', 'buns', localSettings.buns)}
                {renderSection('Patties', 'patties', localSettings.patties)}
                {renderSection('Cheeses', 'cheeses', localSettings.cheeses)}
                {renderSection('Sauces', 'sauces', localSettings.sauces)}
                {renderSection('Extras', 'extras', localSettings.extras)}
                <div className="lg:col-span-1">
                    {renderSection('Toppings', 'toppings', localSettings.toppings)}
                </div>
            </div>
            
            <div className="mt-auto pt-6 text-right">
                <Button onClick={handleSave} size="lg">
                    Save Burger Settings
                </Button>
            </div>
        </div>
    );
};

export default BurgerBuilderSettingsView;
