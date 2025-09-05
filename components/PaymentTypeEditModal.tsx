
import React, { useState, useEffect } from 'react';
import { PaymentType } from '../types';
import { useAppContext } from '../contexts/AppContext';
import { useTranslations } from '../hooks/useTranslations';
import { Modal, ModalHeader, ModalTitle, ModalContent, ModalFooter } from './ui/Modal';
import { Input } from './ui/Input';
import { Button } from './ui/Button';

interface PaymentTypeEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (paymentType: PaymentType) => void;
    paymentType: PaymentType | null;
}

const PaymentTypeEditModal: React.FC<PaymentTypeEditModalProps> = ({ isOpen, onClose, onSave, paymentType }) => {
    const { settings } = useAppContext();
    const t = useTranslations(settings.language.staff);
    const [name, setName] = useState('');
    const [isEnabled, setIsEnabled] = useState(true);

    useEffect(() => {
        if (paymentType) {
            setName(paymentType.name);
            setIsEnabled(paymentType.isEnabled);
        } else {
            setName('');
            setIsEnabled(true);
        }
    }, [paymentType, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) {
            alert("Name is required.");
            return;
        }
        onSave({
            id: paymentType?.id || `pt_${Date.now()}`,
            name,
            isEnabled,
        });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4">
            <div className="bg-card rounded-lg shadow-xl w-full max-w-md border border-border">
                <form onSubmit={handleSubmit}>
                    <div className="p-6 border-b border-border">
                        <h2 className="text-2xl font-bold text-foreground text-start rtl:text-end">{paymentType ? t('edit') : t('addPaymentType')}</h2>
                    </div>
                    <div className="p-6 space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-muted-foreground mb-1 text-start rtl:text-end">{t('paymentMethodName')}</label>
                            <Input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full bg-input p-2 rounded-md border border-border text-foreground rtl:text-right" required />
                        </div>
                        <label className="flex items-center justify-between p-3 rounded-lg bg-secondary cursor-pointer">
                            <span className="font-medium text-foreground">{t('enabled')}</span>
                            <button
                                type="button"
                                onClick={() => setIsEnabled(prev => !prev)}
                                className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${isEnabled ? 'bg-primary' : 'bg-muted'}`}
                            >
                                <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${isEnabled ? 'translate-x-6' : 'translate-x-1'}`}/>
                            </button>
                        </label>
                    </div>
                    <div className="p-6 border-t border-border flex justify-end items-center space-x-4">
                        <Button type="button" variant="ghost" onClick={onClose}>{t('cancel')}</Button>
                        <Button type="submit">{t('save')}</Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PaymentTypeEditModal;
