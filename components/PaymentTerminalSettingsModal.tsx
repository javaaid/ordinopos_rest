
import React, { useState, useEffect } from 'react';
import { Modal, ModalHeader, ModalTitle, ModalDescription, ModalContent, ModalFooter } from './ui/Modal';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { AppSettings, PaymentProvider } from '../types';
import { Select } from './ui/Select';

interface PaymentTerminalSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onSave: (newSettings: Partial<AppSettings>) => void;
}

const PaymentTerminalSettingsModal: React.FC<PaymentTerminalSettingsModalProps> = ({ isOpen, onClose, settings, onSave }) => {
    const [provider, setProvider] = useState<PaymentProvider>('none');
    const [secretKey, setSecretKey] = useState('');
    const [terminalId, setTerminalId] = useState('');

    useEffect(() => {
        if (isOpen) {
            setProvider(settings.paymentProvider || 'none');
            setSecretKey(settings.paymentTerminalSecretKey || '');
            setTerminalId(settings.terminalId || '');
        }
    }, [isOpen, settings]);
    
    const handleSave = () => {
        onSave({
            paymentProvider: provider,
            paymentTerminalSecretKey: secretKey,
            terminalId: terminalId,
        });
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalHeader>
                <ModalTitle>Advanced Card Payments</ModalTitle>
                <ModalDescription>Configure your physical payment terminal.</ModalDescription>
            </ModalHeader>
            <ModalContent className="space-y-4">
                <div>
                    <label htmlFor="payment-provider" className="block text-sm font-medium text-muted-foreground mb-1">Payment Provider</label>
                    <Select id="payment-provider" value={provider} onChange={(e) => setProvider(e.target.value as PaymentProvider)}>
                        <option value="none" disabled>Select a provider...</option>
                        <option value="stripe">Stripe</option>
                        <option value="adyen">Adyen</option>
                        <option value="square">Square</option>
                    </Select>
                </div>

                <div>
                    <label htmlFor="payment-secret-key" className="block text-sm font-medium text-muted-foreground mb-1">Secret Key</label>
                    <Input 
                        id="payment-secret-key"
                        type="password"
                        value={secretKey}
                        onChange={(e) => setSecretKey(e.target.value)}
                        placeholder="e.g., sk_test_..."
                    />
                    <p className="text-xs text-muted-foreground mt-1">This is your private API key from the provider's dashboard.</p>
                </div>
                
                <div>
                    <label htmlFor="terminal-id" className="block text-sm font-medium text-muted-foreground mb-1">Terminal ID</label>
                    <Input 
                        id="terminal-id"
                        type="text"
                        value={terminalId}
                        onChange={(e) => setTerminalId(e.target.value)}
                        placeholder="e.g., tmr_..."
                    />
                    <p className="text-xs text-muted-foreground mt-1">The unique ID or serial number of your physical terminal.</p>
                </div>
            </ModalContent>
            <ModalFooter>
                <Button variant="ghost" onClick={onClose}>Cancel</Button>
                <Button onClick={handleSave}>Save Settings</Button>
            </ModalFooter>
        </Modal>
    );
};

export default PaymentTerminalSettingsModal;
