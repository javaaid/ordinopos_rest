
import React, { useState } from 'react';
import { Modal, ModalHeader, ModalTitle, ModalContent, ModalFooter } from './ui/Modal';
import { Button } from './ui/Button';
import { Textarea } from './ui/Textarea';

interface PromotionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSend: (message: string) => void;
  recipientCount: number;
}

const PromotionModal: React.FC<PromotionModalProps> = ({ isOpen, onClose, onSend, recipientCount }) => {
  const [message, setMessage] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() === '') {
        alert("Message cannot be empty.");
        return;
    }
    onSend(message);
    setMessage('');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
        <form onSubmit={handleSubmit}>
          <ModalHeader>
            <ModalTitle>Send Promotion</ModalTitle>
            <p className="text-muted-foreground">Sending to {recipientCount} customer(s).</p>
          </ModalHeader>
          
          <ModalContent>
            <label htmlFor="promo-message" className="block text-sm font-medium text-muted-foreground mb-2">Message</label>
            <Textarea 
              id="promo-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="e.g. Get 20% off all pizzas this weekend! Show this message to redeem."
              required
              className="h-40"
            />
          </ModalContent>

          <ModalFooter>
            <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
            <Button type="submit">Send to {recipientCount}</Button>
          </ModalFooter>
        </form>
    </Modal>
  );
};

export default PromotionModal;