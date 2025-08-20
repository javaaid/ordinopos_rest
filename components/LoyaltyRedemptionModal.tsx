import React, { useState, useMemo } from 'react';
import { Customer } from '../types';
import { Modal, ModalHeader, ModalTitle, ModalContent, ModalFooter } from './ui/Modal';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { useTranslations } from '../hooks/useTranslations';
import { useAppContext } from '../contexts/AppContext';

interface LoyaltyRedemptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: Customer;
  orderTotal: number;
  onApplyPoints: (points: number) => void;
}

const LoyaltyRedemptionModal: React.FC<LoyaltyRedemptionModalProps> = ({ isOpen, onClose, customer, orderTotal, onApplyPoints }) => {
    const { settings } = useAppContext();
    const t = useTranslations(settings.language.staff);
    
    const { redemptionRate } = settings.loyalty;
    const customerPoints = customer.loyaltyPoints || 0;
    const maxRedeemableValue = Math.min(customerPoints / redemptionRate, orderTotal);
    const maxRedeemablePoints = Math.floor(maxRedeemableValue * redemptionRate);

    const [pointsToRedeem, setPointsToRedeem] = useState(maxRedeemablePoints);

    const redeemValue = (pointsToRedeem / redemptionRate).toFixed(2);

    const handlePointsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = parseInt(e.target.value, 10);
        if (isNaN(value)) {
            value = 0;
        }
        setPointsToRedeem(Math.max(0, Math.min(maxRedeemablePoints, value)));
    };

    const handleApply = () => {
        onApplyPoints(pointsToRedeem);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalHeader>
                <ModalTitle>{t('redeem_points')} for {customer.name}</ModalTitle>
            </ModalHeader>
            <ModalContent>
                <div className="text-center bg-secondary p-4 rounded-lg mb-4">
                    <p className="text-sm text-muted-foreground">{t('points_balance')}</p>
                    <p className="text-4xl font-bold text-primary">{customerPoints}</p>
                    <p className="text-sm text-muted-foreground">≈ ${ (customerPoints / redemptionRate).toFixed(2) }</p>
                </div>
                <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">{t('points_to_redeem')}</label>
                    <Input
                        type="number"
                        value={pointsToRedeem}
                        onChange={handlePointsChange}
                        max={maxRedeemablePoints}
                        min="0"
                        className="text-center text-lg h-12"
                    />
                    <input
                        type="range"
                        value={pointsToRedeem}
                        onChange={handlePointsChange}
                        max={maxRedeemablePoints}
                        min="0"
                        className="w-full mt-2"
                    />
                </div>
                <p className="text-center text-lg mt-4">
                    This will apply a <span className="font-bold text-green-500">${redeemValue}</span> discount to the order.
                </p>
            </ModalContent>
            <ModalFooter>
                <Button variant="ghost" onClick={onClose}>Cancel</Button>
                <Button onClick={handleApply}>{t('apply_points')}</Button>
            </ModalFooter>
        </Modal>
    );
};

export default LoyaltyRedemptionModal;