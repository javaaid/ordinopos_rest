
import React from 'react';
import { Ingredient } from '../types';
import UserPlusIcon from './icons/UserPlusIcon';
import PencilSquareIcon from './icons/PencilSquareIcon';
import TrashIcon from './icons/TrashIcon';
import { useDataContext, useModalContext } from '../contexts/AppContext';

const IngredientsView: React.FC = () => {
    const { ingredients, handleSaveIngredient, handleDeleteIngredient } = useDataContext();
    const { openModal } = useModalContext();

    const onAddNew = () => openModal('ingredientEdit', { onSave: (ing: Ingredient) => handleSaveIngredient(ing, true) });
    const onEdit = (ingredient: Ingredient) => openModal('ingredientEdit', { ingredient, onSave: (ing: Ingredient) => handleSaveIngredient(ing, false) });
    
    const thClass = "px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider";

    return (
        <div className="p-6 h-full flex flex-col">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-foreground">Manage Ingredients</h2>
                <button
                    onClick={onAddNew}
                    className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-2 px-4 rounded-lg transition-colors shadow-md"
                >
                    <UserPlusIcon className="w-5 h-5" />
                    Add Ingredient
                </button>
            </div>
            <div className="overflow-x-auto bg-card rounded-lg flex-grow border border-border">
                <table className="min-w-full divide-y divide-border">
                    <thead className="bg-muted/50 sticky top-0">
                        <tr>
                            <th className={thClass}>Name</th>
                            <th className={thClass}>Stock</th>
                            <th className={thClass}>Unit Cost</th>
                            <th className={thClass}>On-Hand Value</th>
                            <th className={thClass}>Reorder At</th>
                            <th className={thClass}>Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-card divide-y divide-border">
                        {ingredients.map(item => (
                            <tr key={item.id} className="hover:bg-muted/50">
                                <td className="px-4 py-3 whitespace-nowrap text-foreground font-medium">{item.name}</td>
                                <td className="px-4 py-3 whitespace-nowrap text-muted-foreground font-mono">{item.stock} {item.unit}</td>
                                <td className="px-4 py-3 whitespace-nowrap text-muted-foreground font-mono">${item.costPerUnit.toFixed(4)}</td>
                                <td className="px-4 py-3 whitespace-nowrap text-green-500 dark:text-green-400 font-semibold font-mono">${(item.stock * item.costPerUnit).toFixed(2)}</td>
                                <td className="px-4 py-3 whitespace-nowrap text-muted-foreground font-mono">{item.reorderThreshold} {item.unit}</td>
                                <td className="px-4 py-3 whitespace-nowrap">
                                    <div className="flex gap-4">
                                        <button onClick={() => onEdit(item)} className="text-primary hover:opacity-80 flex items-center gap-1 text-sm">
                                            <PencilSquareIcon className="w-5 h-5" />
                                        </button>
                                        <button onClick={() => handleDeleteIngredient(item.id)} className="text-destructive hover:opacity-80 flex items-center gap-1 text-sm">
                                            <TrashIcon className="w-5 h-5" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default IngredientsView;
