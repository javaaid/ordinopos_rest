import React, { useState, useRef, useEffect } from 'react';
import { Modal, ModalHeader, ModalTitle, ModalContent, ModalFooter } from './ui/Modal';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import BarcodeScannerIcon from './icons/BarcodeScannerIcon';

interface BarcodeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (barcode: string) => void;
}

const BarcodeScannerModal: React.FC<BarcodeScannerModalProps> = ({ isOpen, onClose, onScan }) => {
  const [barcode, setBarcode] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setBarcode('');
      // Use a short timeout to ensure the input is rendered and visible before focusing
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (barcode.trim()) {
      onScan(barcode.trim());
      // Optionally close the modal after a successful scan
      // onClose(); 
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-md">
      <form onSubmit={handleSubmit}>
        <ModalHeader>
          <ModalTitle>Scan Barcode</ModalTitle>
        </ModalHeader>
        <ModalContent className="text-center">
          <BarcodeScannerIcon className="w-24 h-24 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground mb-4">
            Place barcode in front of camera, or type it below. (Scanning is simulated)
          </p>
          <Input
            ref={inputRef}
            value={barcode}
            onChange={(e) => setBarcode(e.target.value)}
            placeholder="Enter barcode..."
            className="text-center font-mono tracking-widest text-lg h-12"
          />
        </ModalContent>
        <ModalFooter>
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit">Submit</Button>
        </ModalFooter>
      </form>
    </Modal>
  );
};

export default BarcodeScannerModal;