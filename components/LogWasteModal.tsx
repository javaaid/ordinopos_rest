
import React, { useState } from 'react';
import { Ingredient } from '../types';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Select } from './ui/Select';
import { Modal, ModalHeader, ModalTitle, ModalContent, ModalFooter } from './ui/Modal';

interface LogWasteModalProps {
  isOpen: boolean;
  onClose: () => void;
  ingredients: Ingredient[];
  onLogWaste: (data: { ingredientId: string, quantity: number, reason: string }) => void;
}

const LogWasteModal: React.FC<LogWasteModalProps> = ({ isOpen, onClose, ingredients, onLogWaste }) => {
  const [selectedItemId, setSelectedItemId] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [reason, setReason] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItemId || quantity <= 0 || reason.trim() === '') {
        alert("Please fill out all fields correctly.");
        return;
    }
    onLogWaste({ ingredientId: selectedItemId, quantity, reason });
    setSelectedItemId('');
    setQuantity(1);
    setReason('');
  };

  const availableItems = (ingredients || []).filter(item => item.stock > 0);

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
        <form onSubmit={handleSubmit}>
          <ModalHeader>
            <ModalTitle>Log Inventory Waste</ModalTitle>
          </ModalHeader>
          
          <ModalContent className="space-y-4">
            <div>
              <label htmlFor="waste-item" className="block text-sm font-medium text-muted-foreground mb-1">Select Ingredient</label>
              <Select 
                id="waste-item"
                value={selectedItemId}
                onChange={(e) => setSelectedItemId(e.target.value)}
                required
              >
                <option value="" disabled>Choose an ingredient...</option>
                {availableItems.map(item => (
                    <option key={item.id} value={item.id}>
                        {item.name} (In Stock: {item.stock} {item.unit})
                    </option>
                ))}
              </Select>
            </div>
             <div>
              <label htmlFor="waste-quantity" className="block text-sm font-medium text-muted-foreground mb-1">Quantity Wasted</label>
              <Input 
                type="number" 
                id="waste-quantity"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
                min="1"
                step="0.1"
                required
              />
            </div>
            <div>
              <label htmlFor="waste-reason" className="block text-sm font-medium text-muted-foreground mb-1">Reason</label>
              <Input 
                type="text" 
                id="waste-reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g. Spoiled, Expired, Dropped"
                required
              />
            </div>
          </ModalContent>

          <ModalFooter>
            <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
            <Button type="submit" variant="destructive">Log Waste</Button>
          </ModalFooter>
        </form>
    </Modal>
  );
};

export default LogWasteModal;
