
import React from 'react';
import { Modal, ModalHeader, ModalTitle, ModalContent, ModalFooter } from './ui/Modal';
import { Button } from './ui/Button';

interface CardPaymentSimulationModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  onApprove: () => void;
  onDecline: () => void;
}

const CardPaymentSimulationModal: React.FC<CardPaymentSimulationModalProps> = ({ isOpen, onClose, amount, onApprove, onDecline }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalHeader>
        <ModalTitle>Card Terminal Simulation</ModalTitle>
      </ModalHeader>
      <ModalContent className="text-center">
        <p className="text-muted-foreground">Charge amount:</p>
        <p className="text-4xl font-bold text-primary">${amount.toFixed(2)}</p>
        <p className="text-sm text-muted-foreground mt-4">This is a simulation. Please select the outcome of the transaction.</p>
      </ModalContent>
      <ModalFooter>
        <Button variant="destructive" onClick={onDecline} className="flex-grow">
          Decline Payment
        </Button>
        <Button onClick={onApprove} className="flex-grow">
          Approve Payment
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default CardPaymentSimulationModal;
