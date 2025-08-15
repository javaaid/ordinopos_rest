import React from 'react';
import { Customer, Order, CartItem } from '../types';
import { usePOSContext, useModalContext, useDataContext } from '../contexts/AppContext';
import { Modal, ModalHeader, ModalTitle, ModalContent, ModalFooter } from './ui/Modal';
import { Button } from './ui/Button';
import PhoneIcon from './icons/PhoneIcon';
import UserIcon from './icons/UserIcon';
import MapPinIcon from './icons/MapPinIcon';
import PencilIcon from './icons/PencilIcon';
import ArrowPathIcon from './icons/ArrowPathIcon';
import UserPlusIcon from './icons/UserPlusIcon';

interface CallerIDModalProps {
  isOpen: boolean;
  onClose: () => void;
  phoneNumber: string;
  customer: Customer | null;
  lastOrder: Order | null;
}

const CallerIDModal: React.FC<CallerIDModalProps> = ({ isOpen, onClose, phoneNumber, customer, lastOrder }) => {
    const { setSelectedCustomer, onNewSaleClick, setCart } = usePOSContext();
    const { openModal, closeModal } = useModalContext();
    const { handleSaveCustomer } = useDataContext();

    const handleStartNewOrder = () => {
        onNewSaleClick();
        if(customer) setSelectedCustomer(customer);
        onClose();
    };

    const handleReorder = () => {
        if (lastOrder) {
            onNewSaleClick();
            if(customer) setSelectedCustomer(customer);
            setCart(lastOrder.cart);
            onClose();
        }
    };
    
    const handleCreateCustomer = () => {
        onClose();
        const newCustomerData: Partial<Customer> = { phone: phoneNumber };
        openModal('customerEdit', { 
            customer: newCustomerData, 
            onSave: (savedCustomer: Customer, isNew: boolean) => {
                handleSaveCustomer(savedCustomer, isNew);
                setSelectedCustomer(savedCustomer);
                closeModal();
            } 
        });
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} className="max-w-lg">
            <ModalHeader>
                <div className="flex items-center gap-3">
                    <div className="bg-primary/10 text-primary p-3 rounded-full">
                        <PhoneIcon className="w-6 h-6" />
                    </div>
                    <div>
                        <ModalTitle>Incoming Call</ModalTitle>
                        <p className="text-2xl font-semibold text-foreground font-mono">{phoneNumber}</p>
                    </div>
                </div>
            </ModalHeader>
            <ModalContent>
                {customer ? (
                    <div className="space-y-4">
                        <div className="bg-secondary p-4 rounded-lg">
                            <h3 className="text-lg font-bold text-foreground flex items-center gap-2"><UserIcon className="w-5 h-5"/> {customer.name}</h3>
                            <p className="text-muted-foreground flex items-center gap-2 mt-1"><MapPinIcon className="w-4 h-4"/> {customer.address}</p>
                            {customer.notes && <p className="text-sm mt-2 p-2 bg-background rounded-md">{customer.notes}</p>}
                        </div>
                        {lastOrder && (
                            <div>
                                <h4 className="font-bold text-muted-foreground mb-2">Last Order ({new Date(lastOrder.createdAt).toLocaleDateString()})</h4>
                                <div className="bg-secondary p-4 rounded-lg space-y-2 max-h-40 overflow-y-auto">
                                    {lastOrder.cart.map(item => (
                                        <div key={item.cartId} className="flex justify-between items-center text-sm">
                                            <span className="text-foreground">{item.quantity}x {item.menuItem.name}</span>
                                            <span className="text-muted-foreground font-mono">${(item.menuItem.price * item.quantity).toFixed(2)}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="text-center py-8">
                        <h3 className="text-2xl font-semibold text-foreground">Unknown Caller</h3>
                        <p className="text-muted-foreground mt-1">This phone number is not in your customer list.</p>
                    </div>
                )}
            </ModalContent>
            <ModalFooter className="flex-col !items-stretch gap-2">
                {customer ? (
                    <>
                        <Button onClick={handleStartNewOrder} size="lg" className="w-full">
                            <PencilIcon className="w-5 h-5 mr-2" /> Start New Order
                        </Button>
                        <Button onClick={handleReorder} size="lg" variant="secondary" disabled={!lastOrder} className="w-full">
                            <ArrowPathIcon className="w-5 h-5 mr-2" /> Reorder Last Order
                        </Button>
                    </>
                ) : (
                    <Button onClick={handleCreateCustomer} size="lg" className="w-full">
                        <UserPlusIcon className="w-5 h-5 mr-2" /> Create New Customer
                    </Button>
                )}
            </ModalFooter>
        </Modal>
    );
};

export default CallerIDModal;
