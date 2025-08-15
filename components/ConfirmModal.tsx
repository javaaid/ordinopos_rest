
import React from 'react';
import { Modal, ModalHeader, ModalTitle, ModalContent, ModalFooter } from './ui/Modal';
import { Button } from './ui/Button';
import ExclamationTriangleIcon from './icons/ExclamationTriangleIcon';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  onConfirm: () => void;
  confirmText?: string;
  cancelText?: string;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  title,
  message,
  onConfirm,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-md">
      <ModalHeader>
        <div className="flex items-center gap-3">
            <div className="bg-destructive/10 p-2 rounded-full">
                <ExclamationTriangleIcon className="w-6 h-6 text-destructive" />
            </div>
            <ModalTitle>{title}</ModalTitle>
        </div>
      </ModalHeader>
      <ModalContent>
        <p className="text-muted-foreground">{message}</p>
      </ModalContent>
      <ModalFooter>
        <Button variant="ghost" onClick={onClose}>{cancelText}</Button>
        <Button variant="destructive" onClick={onConfirm}>{confirmText}</Button>
      </ModalFooter>
    </Modal>
  );
};

export default ConfirmModal;
