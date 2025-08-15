


import React, { useState, useEffect } from 'react';
import { Surcharge } from '../types';
import { Modal, ModalHeader, ModalTitle, ModalContent, ModalFooter } from './ui/Modal';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { Select } from './ui/Select';

interface SurchargeEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (surcharge: Surcharge) => void;
  surcharge: Surcharge | null;
}

const SurchargeEditModal: React.FC<SurchargeEditModalProps> = ({ isOpen, onClose, onSave, surcharge }) => {
    const [name, setName] = useState('');
    const [type, setType] = useState<'percentage' | 'fixed'>('percentage');
    const [value, setValue] = useState(0);

    useEffect(() => {
        if (surcharge) {
            setName(surcharge.name);
            setType(surcharge.type);
            setValue(surcharge.value);
        } else {
            setName('');
            setType('percentage');
            setValue(5); // Default to 5%
        }
    }, [surcharge, isOpen]);

    if (!isOpen) return null;

    const handleTypeChange = (newType: 'percentage' | 'fixed') => {
        setType(newType);
        // If it's a new surcharge, update the default value when type changes
        if (!surcharge) {
            setValue(newType === 'percentage' ? 5 : 1);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            id: surcharge?.id || `sur_${Date.now()}`,
            name,
            type,
            value,
        });
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <form onSubmit={handleSubmit}>
                <ModalHeader>
                    <ModalTitle>{surcharge ? 'Edit Surcharge' : 'Add New Surcharge'}</ModalTitle>
                </ModalHeader>
                <ModalContent className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-1">Surcharge Name</label>
                        <Input value={name} onChange={e => setName(e.target.value)} required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-muted-foreground mb-1">Type</label>
                            <Select value={type} onChange={e => handleTypeChange(e.target.value as any)}>
                                <option value="percentage">Percentage</option>
                                <option value="fixed">Fixed Amount</option>
                            </Select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-muted-foreground mb-1">
                                {type === 'percentage' ? 'Percentage (%)' : 'Amount ($)'}
                            </label>
                            <Input type="number" value={value} onChange={e => setValue(parseFloat(e.target.value))} min="0" step="0.01" required />
                        </div>
                    </div>
                </ModalContent>
                <ModalFooter>
                    <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
                    <Button type="submit">Save Surcharge</Button>
                </ModalFooter>
            </form>
        </Modal>
    );
};

export default SurchargeEditModal;
