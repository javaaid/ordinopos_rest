
import React, { useState } from 'react';
import { Printer } from '../types';
import { Modal, ModalHeader, ModalTitle, ModalContent, ModalFooter } from './ui/Modal';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { Select } from './ui/Select';
import { DEFAULT_KITCHEN_PRINT_SETTINGS, DEFAULT_RECEIPT_SETTINGS } from '../constants';

interface PrinterEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (printer: Printer) => void;
    printer: Printer | null; // Always null for this modal's new purpose
}

type NewPrinterType = 'receipt' | 'kitchen' | 'profile_hub';

const PrinterEditModal: React.FC<PrinterEditModalProps> = ({ isOpen, onClose, onSave }) => {
    const [name, setName] = useState('New Printer');
    const [printerType, setPrinterType] = useState<NewPrinterType>('receipt');

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        let newPrinter: Partial<Printer> = {
            id: `p_${Date.now()}`,
            name,
            type: 'thermal',
            connection: 'PDF Printer',
            isEnabled: true,
            status: 'connected',
            paperWidth: 80,
            hasDrawer: false,
        };

        if (printerType === 'receipt') {
            newPrinter.receiptSettings = DEFAULT_RECEIPT_SETTINGS;
            newPrinter.hasDrawer = true;
        } else if (printerType === 'kitchen') {
            newPrinter.kitchenProfiles = { kitchen_1: DEFAULT_KITCHEN_PRINT_SETTINGS };
        } else if (printerType === 'profile_hub') {
            newPrinter.isProfileHub = true;
            newPrinter.kitchenProfiles = {}; // Hub is just a container
        }
        
        onSave(newPrinter as Printer);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <form onSubmit={handleSubmit}>
                <ModalHeader>
                    <ModalTitle>Add New Printer</ModalTitle>
                </ModalHeader>
                <ModalContent className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-1">Printer Name</label>
                        <Input value={name} onChange={e => setName(e.target.value)} required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-1">Printer Role</label>
                        <Select value={printerType} onChange={e => setPrinterType(e.target.value as NewPrinterType)}>
                            <option value="receipt">Standard Receipt/Order Printer</option>
                            <option value="kitchen">Single Kitchen Station Printer</option>
                            <option value="profile_hub">Kitchen Profile Hub (for multiple stations)</option>
                        </Select>
                        <p className="text-xs text-muted-foreground mt-1">
                            {printerType === 'receipt' && 'Prints customer receipts and simple order tickets.'}
                            {printerType === 'kitchen' && 'A dedicated printer for a single station like "Kitchen" or "Bar".'}
                            {printerType === 'profile_hub' && 'A single printer that can print tickets for multiple stations (e.g., Kitchen 1, Kitchen 2, Bar).'}
                        </p>
                    </div>
                </ModalContent>
                <ModalFooter>
                    <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
                    <Button type="submit">Create and Configure</Button>
                </ModalFooter>
            </form>
        </Modal>
    );
};

export default PrinterEditModal;
