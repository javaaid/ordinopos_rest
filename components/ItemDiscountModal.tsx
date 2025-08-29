
import React from 'react';
import { CartItem, ManualDiscount } from '../types';
import { Modal, ModalHeader, ModalTitle, ModalContent, ModalFooter } from './ui/Modal';
import { Button } from './ui/Button';

interface ItemDiscountModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItem: CartItem;
  discounts: ManualDiscount[];
  onApply: (cartId: string, discount: ManualDiscount | null) => void;
}

const ItemDiscountModal: React.FC<ItemDiscountModalProps> = ({ isOpen, onClose, cartItem, discounts, onApply }) => {
  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalHeader>
        <ModalTitle>Apply Discount to {cartItem.menuItem.name}</ModalTitle>
      </ModalHeader>
      <ModalContent>
        <div className="space-y-2">
          {discounts.map(discount => (
            <Button
              key={discount.id}
              variant={cartItem.appliedManualDiscount?.id === discount.id ? 'default' : 'secondary'}
              className="w-full justify-between"
              onClick={() => onApply(cartItem.cartId, discount)}
            >
              <span>{discount.name}</span>
              <span>{discount.percentage * 100}%</span>
            </Button>
          ))}
        </div>
      </ModalContent>
      <ModalFooter>
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
        {cartItem.appliedManualDiscount && (
            <Button variant="destructive" onClick={() => onApply(cartItem.cartId, null)}>Remove Discount</Button>
        )}
      </ModalFooter>
    </Modal>
  );
};

export default ItemDiscountModal;
