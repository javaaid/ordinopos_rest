


import React, { useState, useEffect } from 'react';
import { ModifierGroup, ModifierOption } from '../types';
import { Modal, ModalHeader, ModalTitle, ModalContent, ModalFooter } from './ui/Modal';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import TrashIcon from './icons/TrashIcon';
import PlusIcon from './icons/PlusIcon';
import { useDataContext } from '../contexts/AppContext';

interface ModifierGroupEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  modifierGroup: ModifierGroup | null;
}

const ModifierGroupEditModal: React.FC<ModifierGroupEditModalProps> = ({ isOpen, onClose, modifierGroup }) => {
    const { handleSaveModifierGroup } = useDataContext();
    const [name, setName] = useState('');
    const [options, setOptions] = useState<ModifierOption[]>([{ name: '', price: 0 }]);
    const [allowMultiple, setAllowMultiple] = useState(false);
    const [isRequired, setIsRequired] = useState(false);

    useEffect(() => {
        if (modifierGroup) {
            setName(modifierGroup.name);
            setOptions(modifierGroup.options);
            setAllowMultiple(modifierGroup.allowMultiple);
            setIsRequired(modifierGroup.isRequired || false);
        } else {
            setName('');
            setOptions([{ name: '', price: 0 }]);
            setAllowMultiple(false);
            setIsRequired(false);
        }
    }, [modifierGroup, isOpen]);

    const handleOptionChange = (index: number, field: keyof ModifierOption, value: string | number) => {
        const newOptions = [...options];
        (newOptions[index] as any)[field] = field === 'price' ? parseFloat(value as string) || 0 : value;
        setOptions(newOptions);
    };

    const addOption = () => {
        setOptions([...options, { name: '', price: 0 }]);
    };

    const removeOption = (index: number) => {
        if (options.length > 1) {
            setOptions(options.filter((_, i) => i !== index));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const newGroup: ModifierGroup = {
            id: modifierGroup?.id || `mg_${Date.now()}`,
            name,
            options,
            allowMultiple,
            isRequired,
        };
        handleSaveModifierGroup(newGroup);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} className="max-w-xl">
            <form onSubmit={handleSubmit}>
                <ModalHeader>
                    <ModalTitle>{modifierGroup ? 'Edit' : 'Add'} Modifier Group</ModalTitle>
                </ModalHeader>
                <ModalContent>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-muted-foreground mb-1">Group Name</label>
                            <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g., Add-ons, Sauces" required />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-muted-foreground mb-2">Options</label>
                            <div className="space-y-2">
                                {options.map((option, index) => (
                                    <div key={index} className="flex items-center gap-2">
                                        <Input
                                            value={option.name}
                                            onChange={e => handleOptionChange(index, 'name', e.target.value)}
                                            placeholder="Option Name (e.g., Bacon)"
                                            className="flex-grow"
                                            required
                                        />
                                        <Input
                                            type="number"
                                            value={option.price}
                                            onChange={e => handleOptionChange(index, 'price', e.target.value)}
                                            placeholder="Price"
                                            className="w-28"
                                            step="0.01"
                                        />
                                        <Button type="button" variant="ghost" size="icon" onClick={() => removeOption(index)} disabled={options.length <= 1}>
                                            <TrashIcon className="w-5 h-5" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                             <Button type="button" variant="outline" size="sm" onClick={addOption} className="mt-2 flex items-center gap-2">
                                <PlusIcon className="w-4 h-4" /> Add Option
                            </Button>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-muted-foreground mb-2">Rules</label>
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 p-2 bg-secondary rounded-md cursor-pointer">
                                    <input type="checkbox" checked={allowMultiple} onChange={e => setAllowMultiple(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
                                    <span>Allow multiple selections</span>
                                </label>
                                 <label className="flex items-center gap-2 p-2 bg-secondary rounded-md cursor-pointer">
                                    <input type="checkbox" checked={isRequired} onChange={e => setIsRequired(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
                                    <span>This modifier is required</span>
                                </label>
                            </div>
                        </div>

                    </div>
                </ModalContent>
                <ModalFooter>
                    <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
                    <Button type="submit">Save Group</Button>
                </ModalFooter>
            </form>
        </Modal>
    );
};

export default ModifierGroupEditModal;
