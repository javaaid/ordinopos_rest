import React, { useState } from 'react';
import { Modal, ModalHeader, ModalTitle, ModalContent, ModalFooter } from './ui/Modal';
import { Input } from './ui/Input';
import { Button } from './ui/Button';

interface NumberInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  label: string;
  onConfirm: (value: number) => void;
  initialValue?: number;
}

const NumberInputModal: React.FC<NumberInputModalProps> = ({ isOpen, onClose, title, label, onConfirm, initialValue = '' }) => {
  const [value, setValue] = useState(String(initialValue));

  const handleConfirm = () => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      onConfirm(numValue);
      onClose();
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleConfirm();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalHeader>
        <ModalTitle>{title}</ModalTitle>
      </ModalHeader>
      <ModalContent>
        <label htmlFor="number-input" className="text-sm font-medium text-muted-foreground">{label}</label>
        <Input
          id="number-input"
          type="number"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="mt-2 text-lg"
          autoFocus
          onFocus={(e) => e.target.select()}
          onKeyDown={handleKeyDown}
        />
      </ModalContent>
      <ModalFooter>
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
        <Button onClick={handleConfirm}>Confirm</Button>
      </ModalFooter>
    </Modal>
  );
};

export default NumberInputModal;