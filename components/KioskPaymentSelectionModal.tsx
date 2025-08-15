import React from 'react';
import { Modal, ModalHeader, ModalTitle, ModalContent, ModalFooter } from './ui/Modal';
import { Button } from './ui/Button';
import CreditCardIcon from './icons/CreditCardIcon';
import ApplePayIcon from './icons/ApplePayIcon';
import MadaIcon from './icons/MadaIcon';

interface KioskPaymentSelectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (method: string) => void;
}

const KioskPaymentSelectionModal: React.FC<KioskPaymentSelectionModalProps> = ({ isOpen, onClose, onSelect }) => {
    const paymentMethods = [
        { name: 'Card', icon: CreditCardIcon, id: 'card' },
        { name: 'Apple Pay', icon: ApplePayIcon, id: 'applepay' },
        { name: 'Mada', icon: MadaIcon, id: 'mada' }
    ];

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalHeader>
                <ModalTitle>Choose Payment Method</ModalTitle>
            </ModalHeader>
            <ModalContent className="grid grid-cols-1 gap-4">
                {paymentMethods.map(method => {
                    const Icon = method.icon;
                    return (
                        <Button
                            key={method.id}
                            onClick={() => onSelect(method.id)}
                            className="h-20 text-xl justify-start p-4"
                            variant="secondary"
                        >
                            <Icon className="w-12 h-auto mr-4" />
                            {method.name}
                        </Button>
                    );
                })}
            </ModalContent>
            <ModalFooter>
                <Button variant="ghost" onClick={onClose}>Cancel</Button>
            </ModalFooter>
        </Modal>
    );
};

export default KioskPaymentSelectionModal;
