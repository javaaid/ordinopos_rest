
import React, { useState } from 'react';
import { useDataContext } from '../contexts/AppContext';
import { Modal, ModalHeader, ModalTitle, ModalContent, ModalFooter } from './ui/Modal';
import { Button } from './ui/Button';

interface VoidOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
}

const VoidOrderModal: React.FC<VoidOrderModalProps> = ({ isOpen, onClose, onConfirm }) => {
  const { voidReasons } = useDataContext();
  const [selectedReason, setSelectedReason] = useState('');

  const handleConfirm = () => {
    if (selectedReason) {
      onConfirm(selectedReason);
    } else {
      alert('Please select a reason for voiding the order.');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-md">
      <ModalHeader>
        <ModalTitle>Void Order</ModalTitle>
      </ModalHeader>
      <ModalContent>
        <p className="text-muted-foreground mb-4">Please select a reason for voiding this order.</p>
        <div className="space-y-2">
          {voidReasons.map((reason: any) => (
            <button
              key={reason.id}
              onClick={() => setSelectedReason(reason.reason)}
              className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                selectedReason === reason.reason
                  ? 'bg-primary/20 border-primary'
                  : 'bg-secondary border-border hover:border-muted-foreground'
              }`}
            >
              <span className="font-semibold text-foreground">{reason.reason}</span>
            </button>
          ))}
        </div>
      </ModalContent>
      <ModalFooter>
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
        <Button variant="destructive" onClick={handleConfirm} disabled={!selectedReason}>
          Confirm Void
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default VoidOrderModal;