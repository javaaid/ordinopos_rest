

import React, { useState, useEffect } from 'react';
import { Modal, ModalContent } from './ui/Modal';
import { PaymentProvider } from '../types';
import CheckCircleIcon from './icons/CheckCircleIcon';

interface LivePaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  provider: PaymentProvider;
  terminalId: string;
  onApprove: () => void;
  onDecline: () => void;
}

const providerLogos: Record<PaymentProvider, string> = {
    stripe: 'https://stripe.com/img/v3/home/twitter.png',
    adyen: 'https://www.adyen.com/dam/images/social/adyen-social-image.jpg',
    square: 'https://images.ctfassets.net/2d5q1td6cyxq/5sRBFcQoJ7L4d26zYR4s2Q/532993510e14a77313f8216445b23d53/square-logo.png',
    none: ''
};

const LivePaymentModal: React.FC<LivePaymentModalProps> = ({ isOpen, onClose, amount, provider, terminalId, onApprove, onDecline }) => {
    const [step, setStep] = useState(0);
    const steps = [
        `Connecting to ${provider}...`,
        `Pinging terminal ${terminalId}...`,
        'Please tap, insert, or swipe card...',
        'Processing...'
    ];

    // Reset step count when modal opens
    useEffect(() => {
        if (isOpen) {
            setStep(0);
        }
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen) return;

        if (step < steps.length) {
            // This is the processing animation part
            const timer = setTimeout(() => {
                setStep(s => s + 1);
            }, 1500);
            return () => clearTimeout(timer);
        } else if (step === steps.length) {
            // We've finished the animation, show "Success" and then approve
            const successTimer = setTimeout(() => {
                onApprove(); // This will trigger the success flow in PaymentModal
            }, 1200); // Show success for a moment before closing
            return () => clearTimeout(successTimer);
        }
    }, [isOpen, step, steps.length, onApprove]);

    const renderContent = () => {
        if (step >= steps.length) {
            // We've finished processing, show a success indicator
            return (
                 <div className="text-center flex flex-col items-center">
                    <CheckCircleIcon className="w-12 h-12 text-green-500 mb-4 animate-fade-in" />
                    <p className="text-xl font-semibold text-foreground animate-fade-in">Payment Approved</p>
                </div>
            )
        }
        
        return (
            <div className="text-center">
                <div className="animate-pulse flex flex-col items-center">
                    <svg className="animate-spin h-10 w-10 text-primary mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="text-lg font-semibold text-foreground">{steps[step]}</p>
                </div>
            </div>
        )
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} className="max-w-md">
            <ModalContent className="p-8">
                 <div className="text-center mb-6">
                    {provider !== 'none' && <img src={providerLogos[provider]} alt={provider} className="h-10 w-auto mx-auto mb-2 object-contain" />}
                    <p className="text-5xl font-bold text-primary">${amount.toFixed(2)}</p>
                </div>
                {renderContent()}
            </ModalContent>
        </Modal>
    );
};

export default LivePaymentModal;