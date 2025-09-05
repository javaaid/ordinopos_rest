
import React, { useState, useEffect } from 'react';
import { CustomerDisplay } from '../types';
import { Modal, ModalHeader, ModalTitle, ModalContent, ModalFooter } from './ui/Modal';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import SearchIcon from './icons/SearchIcon';
import InformationCircleIcon from './icons/InformationCircleIcon';
import PingButton from './PingButton';

interface CustomerDisplayEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (display: CustomerDisplay) => void;
  device: CustomerDisplay;
}

const CustomerDisplayEditModal: React.FC<CustomerDisplayEditModalProps> = ({ isOpen, onClose, onSave, device }) => {
  const [formData, setFormData] = useState<CustomerDisplay>(device);

  useEffect(() => {
    if (isOpen) {
      setFormData(device);
    }
  }, [device, isOpen]);

  const handleToggle = (key: keyof CustomerDisplay) => {
    setFormData(prev => ({ ...prev, [key]: !prev[key as keyof CustomerDisplay] }));
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const ToggleRow: React.FC<{ label: string; enabled: boolean; onToggle?: () => void; }> = ({ label, enabled, onToggle }) => (
    <label className="flex items-center justify-between p-3 rounded-lg bg-secondary cursor-pointer">
        <span className="font-medium text-foreground">{label}</span>
        <button
            type="button"
            onClick={() => {
                if (typeof onToggle === 'function') {
                    onToggle();
                }
            }}
            className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${enabled ? 'bg-primary' : 'bg-muted'}`}
        >
            <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${enabled ? 'translate-x-6' : 'translate-x-1'}`}/>
        </button>
    </label>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <ModalHeader>
          <ModalTitle>Configure Customer Display</ModalTitle>
        </ModalHeader>
        <ModalContent className="space-y-4">
          <div className="bg-secondary/50 p-3 rounded-lg flex items-start gap-2 text-sm text-muted-foreground">
            <InformationCircleIcon className="w-5 h-5 mt-0.5 shrink-0" />
            <p>Assign a static IP address to your Customer Facing Display (CFD) and enter it below. Use the test button to verify connectivity.</p>
          </div>

          <ToggleRow label="Enable this Customer Display" enabled={formData.isEnabled} onToggle={() => handleToggle('isEnabled')} />
          
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">Display Name</label>
            <Input name="name" value={formData.name} onChange={handleChange} required />
          </div>

          <div>
             <label className="block text-sm font-medium text-muted-foreground mb-1">IP Address</label>
             <div className="flex gap-2">
                <Input name="ipAddress" value={formData.ipAddress || ''} onChange={handleChange} placeholder="e.g., 192.168.1.210" />
                <PingButton ipAddress={formData.ipAddress} />
             </div>
          </div>
        </ModalContent>
        <ModalFooter>
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit">Save Changes</Button>
        </ModalFooter>
      </form>
    </Modal>
  );
};

export default CustomerDisplayEditModal;