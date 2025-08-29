
import React from 'react';
import { HeldOrder } from '../types';
import { Modal, ModalHeader, ModalTitle, ModalContent, ModalFooter } from './ui/Modal';
import { Button } from './ui/Button';

interface HeldOrdersModalProps {
    isOpen: boolean;
    onClose: () => void;
    heldOrders: HeldOrder[];
    onReopenOrder: (id: string) => void;
    onDeleteHeldOrder: (id: string) => void;
}

const HeldOrdersModal: React.FC<HeldOrdersModalProps> = ({ isOpen, onClose, heldOrders, onReopenOrder, onDeleteHeldOrder }) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} className="max-w-2xl">
            <ModalHeader>
                <ModalTitle>Held Orders</ModalTitle>
            </ModalHeader>
            <ModalContent>
                {heldOrders.length > 0 ? (
                    <div className="space-y-3">
                        {heldOrders.map(order => (
                            <div key={order.id} className="bg-secondary p-3 rounded-lg flex justify-between items-center">
                                <div>
                                    <p className="font-semibold text-foreground">
                                        {order.table?.name || order.customer?.name || 'Walk-in'}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        {new Date(order.timestamp).toLocaleTimeString()} - {order.cart.length} item(s) - by {order.employeeName}
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    <Button size="sm" onClick={() => onReopenOrder(order.id)}>Re-open</Button>
                                    <Button size="sm" variant="destructive" onClick={() => onDeleteHeldOrder(order.id)}>Delete</Button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-muted-foreground text-center py-8">No orders are currently on hold.</p>
                )}
            </ModalContent>
            <ModalFooter>
                <Button variant="ghost" onClick={onClose}>Close</Button>
            </ModalFooter>
        </Modal>
    );
};

export default HeldOrdersModal;
