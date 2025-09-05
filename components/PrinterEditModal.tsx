import React, { useState } from 'react';
import { Printer } from '../types';
import { Modal, ModalHeader, ModalTitle, ModalContent, ModalFooter } from './ui/Modal';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { Select } from './ui/Select';
import { DEFAULT_KITCHEN_PRINT_SETTINGS, DEFAULT_RECEIPT_SETTINGS } from '../constants';
import { useAppContext } from '../contexts/AppContext';
import { useTranslations } from '../hooks/useTranslations';

interface PrinterEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (printer: Printer) => void;
    printer: Printer | null; // Always null for this modal's new purpose
}

type NewPrinterType = 'receipt' | 'kitchen' | 'profile_hub';

const PrinterEditModal: React.FC<PrinterEditModalProps> = ({ isOpen, onClose, onSave }) => {
    const { settings } = useAppContext();
    const t = useTranslations(settings.language.staff);
    const [name, setName] = useState(t('newPrinter'));
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

    const descriptions: Record<NewPrinterType, string> = {
        receipt: t('printsReceipts'),
        kitchen: t('kitchenStationPrinterDesc'),
        profile_hub: t('kitchenProfileHubDesc'),
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <form onSubmit={handleSubmit}>
                <ModalHeader>
                    <ModalTitle>{t('addNewPrinter')}</ModalTitle>
                </ModalHeader>
                <ModalContent className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-1 text-start rtl:text-end">{t('printerName')}</label>
                        <Input value={name} onChange={e => setName(e.target.value)} required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-1 text-start rtl:text-end">{t('printerRole')}</label>
                        <Select value={printerType} onChange={e => setPrinterType(e.target.value as NewPrinterType)}>
                            <option value="receipt">{t('standardReceiptPrinter')}</option>
                            <option value="kitchen">{t('kitchenStationPrinter')}</option>
                            <option value="profile_hub">{t('kitchenProfileHub')}</option>
                        </Select>
                        <p className="text-xs text-muted-foreground mt-1 text-start rtl:text-end">
                            {descriptions[printerType]}
                        </p>
                    </div>
                </ModalContent>
                <ModalFooter>
                    <Button type="button" variant="ghost" onClick={onClose}>{t('cancel')}</Button>
                    <Button type="submit">{t('createAndConfigure')}</Button>
                </ModalFooter>
            </form>
        </Modal>
    );
};

export default PrinterEditModal;
