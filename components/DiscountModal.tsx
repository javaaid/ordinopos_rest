import React from 'react';
import { ManualDiscount, AppliedDiscount, Promotion } from '../types';
import { Modal, ModalHeader, ModalTitle, ModalContent, ModalFooter } from './ui/Modal';
import { Button } from './ui/Button';

interface DiscountModalProps {
  isOpen: boolean;
  onClose: () => void;
  discounts: ManualDiscount[];
  promotions: Promotion[];
  onApplyDiscount: (discount: ManualDiscount) => void;
  onApplyPromotion: (promotion: Promotion) => void;
  onRemoveDiscount: () => void;
  currentDiscount: AppliedDiscount | null;
}

const DiscountModal: React.FC<DiscountModalProps> = ({ isOpen, onClose, discounts, promotions, onApplyDiscount, onApplyPromotion, onRemoveDiscount, currentDiscount }) => {
  
  const handleRemove = () => {
    onRemoveDiscount();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalHeader>
        <ModalTitle>Apply Discount</ModalTitle>
      </ModalHeader>
      <ModalContent>
        <div className="space-y-2">
          {(promotions || []).map(promo => {
            const promoValue = promo.type === 'percentage' ? `${promo.value * 100}% off`
              : promo.type === 'fixed' ? `$${promo.value.toFixed(2)} off`
              : 'BOGO';
            return (
              <Button
                key={promo.id}
                variant={currentDiscount?.name === promo.name ? 'default' : 'secondary'}
                className="w-full justify-between"
                onClick={() => onApplyPromotion(promo)}
              >
                <span>{promo.name}</span>
                <span>{promoValue}</span>
              </Button>
            );
          })}
          {(promotions || []).length > 0 && (discounts || []).length > 0 && <hr className="my-2 border-border" />}
          {(discounts || []).map(discount => (
            <Button
              key={discount.id}
              variant={currentDiscount?.name === discount.name ? 'default' : 'secondary'}
              className="w-full justify-between"
              onClick={() => onApplyDiscount(discount)}
            >
              <span>{discount.name}</span>
              <span>{discount.percentage * 100}%</span>
            </Button>
          ))}
        </div>
      </ModalContent>
      <ModalFooter>
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
        {currentDiscount && (
            <Button variant="destructive" onClick={handleRemove}>Remove Discount</Button>
        )}
      </ModalFooter>
    </Modal>
  );
};

export default DiscountModal;