

import React, { useState, useEffect } from 'react';
import { GenericDevice } from '../types';
import { Modal, ModalHeader, ModalTitle, ModalContent, ModalFooter } from './ui/Modal';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { Select } from './ui/Select';

interface GenericDeviceEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (device: GenericDevice) => void;
  device: GenericDevice;
}

const GenericDeviceEditModal: React.FC<GenericDeviceEditModalProps> = ({ isOpen, onClose, onSave, device }) => {
  const [name, setName] = useState('');
  const [status, setStatus] = useState<'connected' | 'disconnected'>('connected');

  useEffect(() => {
    if (device) {
      setName(device.name);
      setStatus(device.status);
    }
  }, [device]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...device, name, status });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <ModalHeader>
          <ModalTitle>Edit Device</ModalTitle>
        </ModalHeader>
        <ModalContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">Device Name</label>
            <Input value={name} onChange={e => setName(e.target.value)} required />
          </div>
           <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">Status</label>
            <Select value={status} onChange={e => setStatus(e.target.value as any)}>
                <option value="connected">Connected</option>
                <option value="disconnected">Disconnected</option>
            </Select>
          </div>
        </ModalContent>
        <ModalFooter>
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit">Save</Button>
        </ModalFooter>
      </form>
    </Modal>
  );
};

export default GenericDeviceEditModal;