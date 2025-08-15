
import React, { useState, useEffect } from 'react';
import { KitchenDisplay } from '../types';
import { Modal, ModalHeader, ModalTitle, ModalContent, ModalFooter } from './ui/Modal';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { Select } from './ui/Select';
import InformationCircleIcon from './icons/InformationCircleIcon';
import PingButton from './PingButton';

interface KitchenDisplayEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (display: KitchenDisplay) => void;
  device: KitchenDisplay;
}

const KitchenDisplayEditModal: React.FC<KitchenDisplayEditModalProps> = ({ isOpen, onClose, onSave, device }) => {
  const [formData, setFormData] = useState<KitchenDisplay>(device);
  
  useEffect(() => {
    if (isOpen) {
      setFormData(device);
    }
  }, [device, isOpen]);

  const handleToggle = (key: keyof KitchenDisplay) => {
    setFormData(prev => ({ ...prev, [key]: !prev[key as keyof KitchenDisplay] }));
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const ToggleRow: React.FC<{ label: string; enabled: boolean; onToggle: () => void; }> = ({ label, enabled, onToggle }) => (
    <label className="flex items-center justify-between p-3 rounded-lg bg-secondary cursor-pointer">
        <span className="font-medium text-foreground">{label}</span>
        <button
            type="button"
            onClick={onToggle}
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
          <ModalTitle>Configure Kitchen Display</ModalTitle>
        </ModalHeader>
        <ModalContent className="space-y-4">
          <div className="bg-secondary/50 p-3 rounded-lg flex items-start gap-2 text-sm text-muted-foreground">
            <InformationCircleIcon className="w-5 h-5 mt-0.5 shrink-0" />
            <p>Select a connection type. Use 'Network' for a separate device like a tablet on your Wi-Fi. Use 'Local Display' for a second monitor connected to this POS terminal.</p>
          </div>

          <ToggleRow label="Enable this Kitchen Display" enabled={formData.isEnabled} onToggle={() => handleToggle('isEnabled')} />
          
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">Display Name</label>
            <Input name="name" value={formData.name} onChange={handleChange} required />
          </div>

          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">Connection Type</label>
            <Select name="connectionType" value={formData.connectionType} onChange={handleChange}>
                <option value="network">Network (IP Address)</option>
                <option value="local">Local Display (This Device)</option>
            </Select>
          </div>

          {formData.connectionType === 'network' && (
            <div className="animate-fade-in-down">
                <label className="block text-sm font-medium text-muted-foreground mb-1">IP Address</label>
                <div className="flex gap-2">
                    <Input name="ipAddress" value={formData.ipAddress || ''} onChange={handleChange} placeholder="e.g., 192.168.1.201" />
                    <PingButton ipAddress={formData.ipAddress} />
                </div>
            </div>
          )}
        </ModalContent>
        <ModalFooter>
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit">Save Changes</Button>
        </ModalFooter>
      </form>
    </Modal>
  );
};

export default KitchenDisplayEditModal;
