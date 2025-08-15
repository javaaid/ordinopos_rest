import React, { useState } from 'react';
import { Modal, ModalHeader, ModalTitle, ModalContent, ModalFooter } from './ui/Modal';
import { Input } from './ui/Input';
import { Button } from './ui/Button';

interface TextInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  label: string;
  initialValue?: string;
  onSubmit: (value: string) => void;
}

const TextInputModal: React.FC<TextInputModalProps> = ({ isOpen, onClose, title, label, initialValue = '', onSubmit }) => {
  const [value, setValue] = useState(initialValue);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim()) {
      onSubmit(value.trim());
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <ModalHeader>
          <ModalTitle>{title}</ModalTitle>
        </ModalHeader>
        <ModalContent>
          <label htmlFor="text-input" className="text-sm font-medium text-muted-foreground">{label}</label>
          <Input
            id="text-input"
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="mt-2"
            autoFocus
          />
        </ModalContent>
        <ModalFooter>
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit">Save</Button>
        </ModalFooter>
      </form>
    </Modal>
  );
};

export default TextInputModal;
