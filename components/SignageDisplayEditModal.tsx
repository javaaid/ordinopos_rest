import React, { useState, useEffect } from 'react';
import { SignageDisplay } from '../types';
import { Modal, ModalHeader, ModalTitle, ModalContent, ModalFooter } from './ui/Modal';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { Select } from './ui/Select';

interface SignageDisplayEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (display: SignageDisplay) => void;
  display: SignageDisplay | null;
}

const SignageDisplayEditModal: React.FC<SignageDisplayEditModalProps> = ({ isOpen, onClose, onSave, display }) => {
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
                    <ModalTitle>{display ? 'Edit Display' : 'Add New Display'}</ModalTitle>
                </ModalHeader>
                <ModalContent className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-1">Display Name</label>
                        <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g., Main Entrance TV" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-1">Status</label>
                        <Select value={status} onChange={e => setStatus(e.target.value as any)}>
                            <option value="online">Online</option>
                            <option value="offline">Offline</option>
                        </Select>
                    </div>
                </ModalContent>
                <ModalFooter>
                    <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
                    <Button type="submit">Save Display</Button>
                </ModalFooter>
            </form>
        </Modal>
    );
};

export default SignageDisplayEditModal;
