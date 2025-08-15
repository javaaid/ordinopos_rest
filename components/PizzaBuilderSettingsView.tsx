
import React, { useState, useEffect } from 'react';
import { useAppContext, useModalContext, useDataContext } from '../contexts/AppContext';
import { PizzaBuilderSettings, PizzaSize, PizzaCrust, PizzaSauce, PizzaCheese, PizzaToppingItem } from '../types';
import { Button } from './ui/Button';
import PlusIcon from './icons/PlusIcon';
import PencilSquareIcon from './icons/PencilSquareIcon';
import TrashIcon from './icons/TrashIcon';

type PizzaOption = PizzaSize | PizzaCrust | PizzaSauce | PizzaCheese | PizzaToppingItem;
type OptionType = 'sizes' | 'crusts' | 'sauces' | 'cheeses' | 'toppings';

const PizzaBuilderSettingsView: React.FC = () => {
    const { currentLocation } = useAppContext();
    const { handleSaveLocation } = useDataContext();
    const { openModal, closeModal } = useModalContext();
    const [localSettings, setLocalSettings] = useState<PizzaBuilderSettings>(currentLocation.pizzaBuilder);

    useEffect(() => {
        setLocalSettings(currentLocation.pizzaBuilder);
    }, [currentLocation]);

    const handleSave = () => {
        handleSaveLocation({ ...currentLocation, pizzaBuilder: localSettings }, false);
        alert('Pizza Builder settings saved!');
    };

    const handleEditOption = (type: OptionType, option: PizzaOption) => {
        openModal('pizzaOptionEdit', {
            option,
            optionType: type.slice(0, -1), // e.g., 'sizes' -> 'size'
            onSave: (updatedOption: PizzaOption) => {
                setLocalSettings(prev => ({
                    ...prev,
                    [type]: prev[type].map(o => o.id === updatedOption.id ? updatedOption : o),
                }));
                closeModal();
            }
        });
    };

    const handleAddOption = (type: OptionType) => {
        openModal('pizzaOptionEdit', {
            option: null,
            optionType: type.slice(0, -1),
            onSave: (newOption: PizzaOption) => {
                setLocalSettings(prev => ({
                    ...prev,
                    [type]: [...prev[type], newOption],
                }));
                closeModal();
            }
        });
    };
    
    const handleDeleteOption = (type: OptionType, optionId: string) => {
        if (window.confirm('Are you sure you want to delete this option?')) {
            setLocalSettings(prev => ({
                ...prev,
                [type]: prev[type].filter(o => o.id !== optionId),
            }));
        }
    };

    const renderSection = (title: string, type: OptionType, options: PizzaOption[]) => (
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
            <h3 className="text-xl font-bold text-foreground">Pizza Builder Settings</h3>
            <p className="text-sm text-muted-foreground mb-6">Customize all available options for the "Build Your Own Pizza" item for <span className="font-bold">{currentLocation.name}</span>.</p>

            <div className="flex-grow grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-y-auto pr-2">
                {renderSection('Sizes', 'sizes', localSettings.sizes)}
                {renderSection('Crusts', 'crusts', localSettings.crusts)}
                {renderSection('Sauces', 'sauces', localSettings.sauces)}
                {renderSection('Cheeses', 'cheeses', localSettings.cheeses)}
                <div className="lg:col-span-2">
                    {renderSection('Toppings', 'toppings', localSettings.toppings)}
                </div>
            </div>
            
            <div className="mt-auto pt-6 text-right">
                <Button onClick={handleSave} size="lg">
                    Save Pizza Settings
                </Button>
            </div>
        </div>
    );
};

export default PizzaBuilderSettingsView;