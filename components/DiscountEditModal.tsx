


import React, { useState, useEffect } from 'react';
import { ManualDiscount } from '../types';
import { Modal, ModalHeader, ModalTitle, ModalContent, ModalFooter } from './ui/Modal';
import { Input } from './ui/Input';
import { Button } from './ui/Button';

interface DiscountEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (discount: ManualDiscount) => void;
  discount: ManualDiscount | null;
}

const DiscountEditModal: React.FC<DiscountEditModalProps> = ({ isOpen, onClose, onSave, discount }) => {
    const [name, setName] = useState('');
    const [percentage, setPercentage] = useState(0);

    useEffect(() => {
        if (discount) {
            setName(discount.name);
            setPercentage(discount.percentage * 100);
        } else {
            setName('');
            setPercentage(10); // Default to 10% for new discounts
        }
    }, [discount, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            id: discount?.id || `md_${Date.now()}`,
            name,
            percentage: percentage / 100,
        });
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <form onSubmit={handleSubmit}>
                <ModalHeader>
                    <ModalTitle>{discount ? 'Edit Discount' : 'Add New Discount'}</ModalTitle>
                </ModalHeader>
                <ModalContent className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-1">Discount Name</label>
                        <Input value={name} onChange={e => setName(e.target.value)} required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-1">Percentage (%)</label>
                        <Input type="number" value={percentage} onChange={e => setPercentage(parseFloat(e.target.value))} min="0" max="100" step="0.01" required />
                    </div>
                </ModalContent>
                <ModalFooter>
                    <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
                    <Button type="submit">Save Discount</Button>
                </ModalFooter>
            </form>
        </Modal>
    );
};

export default DiscountEditModal;
