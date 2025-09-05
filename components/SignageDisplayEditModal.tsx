
import React, { useState, useEffect } from 'react';
import { SignageDisplay } from '../types';
import { Modal, ModalHeader, ModalTitle, ModalContent, ModalFooter } from './ui/Modal';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { Select } from './ui/Select';
import { useAppContext } from '../contexts/AppContext';
import { useTranslations } from '../hooks/useTranslations';

interface SignageDisplayEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (display: SignageDisplay) => void;
  display: SignageDisplay | null;
}

const SignageDisplayEditModal: React.FC<SignageDisplayEditModalProps> = ({ isOpen, onClose, onSave, display }) => {
    const { settings } = useAppContext();
    const t = useTranslations(settings.language.staff);
    const [name, setName] = useState('');
    const [status, setStatus] = useState<'online' | 'offline'>('online');

    useEffect(() => {
        if (display) {
            setName(display.name);
            setStatus(display.status);
        } else {
            setName('');
            setStatus('online');
        }
    }, [display, isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            id: display?.id || `disp_${Date.now()}`,
            name,
            status,
        });
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <form onSubmit={handleSubmit}>
                <ModalHeader>
                    <ModalTitle>{display ? t('edit') : t('addNewDisplay')}</ModalTitle>
                </ModalHeader>
                <ModalContent className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-1 text-start rtl:text-end">{t('displayName')}</label>
                        <Input value={name} onChange={e => setName(e.target.value)} placeholder={t('displayExample')} required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-1 text-start rtl:text-end">{t('status')}</label>
                        <Select value={status} onChange={e => setStatus(e.target.value as any)}>
                            <option value="online">{t('online')}</option>
                            <option value="offline">{t('offline')}</option>
                        </Select>
                    </div>
                </ModalContent>
                <ModalFooter>
                    <Button type="button" variant="ghost" onClick={onClose}>{t('cancel')}</Button>
                    <Button type="submit">{t('saveDisplay')}</Button>
                </ModalFooter>
            </form>
        </Modal>
    );
};

export default SignageDisplayEditModal;
