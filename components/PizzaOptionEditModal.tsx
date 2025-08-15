
import React, { useState, useEffect } from 'react';
import { Modal, ModalHeader, ModalTitle, ModalContent, ModalFooter } from './ui/Modal';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { PizzaSize, PizzaCrust, PizzaSauce, PizzaCheese, PizzaToppingItem } from '../types';

type PizzaOption = PizzaSize | PizzaCrust | PizzaSauce | PizzaCheese | PizzaToppingItem;

interface PizzaOptionEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (option: PizzaOption) => void;
  option: PizzaOption | null;
  optionType: string;
}

const PizzaOptionEditModal: React.FC<PizzaOptionEditModalProps> = ({ isOpen, onClose, onSave, option, optionType }) => {
    const [name, setName] = useState('');
    const [price, setPrice] = useState(0);

    useEffect(() => {
        if (option) {
            setName(option.name);
            setPrice(option.price);
        } else {
            setName('');
            setPrice(0);
        }
    }, [option, isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            id: option?.id || `${optionType.toLowerCase()}_${Date.now()}`,
            name,
            price,
        });
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <form onSubmit={handleSubmit}>
                <ModalHeader>
                    <ModalTitle>{option ? 'Edit' : 'Add'} {optionType}</ModalTitle>
                </ModalHeader>
                <ModalContent className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-1">Name</label>
                        <Input value={name} onChange={e => setName(e.target.value)} required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-1">Price</label>
                        <Input type="number" value={price} onChange={e => setPrice(parseFloat(e.target.value) || 0)} step="0.01" required />
                    </div>
                </ModalContent>
                <ModalFooter>
                    <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
                    <Button type="submit">Save</Button>
                </ModalFooter>
            </form>
        </Modal>
    );
};

export default PizzaOptionEditModal;
