
import React, { useState } from 'react';
import { MenuItem, Printer, KitchenDisplay } from '../types';
import { useDataContext } from '../contexts/AppContext';
import { Modal, ModalHeader, ModalTitle, ModalContent, ModalFooter } from './ui/Modal';
import { Button } from './ui/Button';
import { Select } from './ui/Select';

interface ProductBulkEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (updates: Partial<MenuItem>) => void;
  selectedIds: number[];
}

const ProductBulkEditModal: React.FC<ProductBulkEditModalProps> = ({ isOpen, onClose, onSave, selectedIds }) => {
    const { printers, kitchenDisplays } = useDataContext();

    const [isActive, setIsActive] = useState<string>('no_change'); // 'no_change', 'true', 'false'
    const [kitchenPrinterId, setKitchenPrinterId] = useState<string>('no_change'); // 'no_change', '', or a printer ID
    const [kdsId, setKdsId] = useState<string>('no_change'); // 'no_change', '', or a kds ID

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const updates: Partial<MenuItem> = {};
        if (isActive !== 'no_change') {
            updates.isActive = isActive === 'true';
        }
        if (kitchenPrinterId !== 'no_change') {
            updates.kitchenPrinterId = kitchenPrinterId;
        }
        if (kdsId !== 'no_change') {
            updates.kdsId = kdsId;
        }

        if (Object.keys(updates).length > 0) {
            onSave(updates);
        } else {
            onClose();
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <form onSubmit={handleSubmit}>
                <ModalHeader>
                    <ModalTitle>Bulk Edit {selectedIds.length} Products</ModalTitle>
                </ModalHeader>
                <ModalContent className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-1">Status</label>
                        <Select value={isActive} onChange={e => setIsActive(e.target.value)}>
                            <option value="no_change">-- No Change --</option>
                            <option value="true">Active</option>
                            <option value="false">Inactive</option>
                        </Select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-1">Kitchen Printer</label>
                        <Select value={kitchenPrinterId} onChange={e => setKitchenPrinterId(e.target.value)}>
                            <option value="no_change">-- No Change --</option>
                            <option value="">Default Printer</option>
                            {printers.map((p: Printer) => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </Select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-muted-foreground mb-1">Kitchen Display (KDS)</label>
                        <Select value={kdsId} onChange={e => setKdsId(e.target.value)}>
                            <option value="no_change">-- No Change --</option>
                            <option value="">Default KDS</option>
                            {kitchenDisplays.map((kds: KitchenDisplay) => <option key={kds.id} value={kds.id}>{kds.name}</option>)}
                        </Select>
                    </div>
                </ModalContent>
                <ModalFooter>
                    <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
                    <Button type="submit">Apply Changes</Button>
                </ModalFooter>
            </form>
        </Modal>
    );
};

export default ProductBulkEditModal;
