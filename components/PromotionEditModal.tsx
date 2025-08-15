


import React, { useState, useEffect } from 'react';
import { Promotion, PromotionType } from '../types';
import { useDataContext } from '../contexts/AppContext';
import { Modal, ModalHeader, ModalTitle, ModalContent, ModalFooter } from './ui/Modal';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { Select } from './ui/Select';

interface PromotionEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (promotion: Promotion) => void;
    promotion: Promotion | null;
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const PromotionEditModal: React.FC<PromotionEditModalProps> = ({ isOpen, onClose, onSave, promotion }) => {
    const { categories, menuItems } = useDataContext();
    const [name, setName] = useState('');
    const [type, setType] = useState<PromotionType>('percentage');
    const [value, setValue] = useState(0);
    const [startTime, setStartTime] = useState('00:00');
    const [endTime, setEndTime] = useState('23:59');
    const [daysOfWeek, setDaysOfWeek] = useState<number[]>([]);
    const [applicableCategoryIds, setApplicableCategoryIds] = useState<string[]>([]);
    const [applicableProductIds, setApplicableProductIds] = useState<number[]>([]);
    const [isActive, setIsActive] = useState(true);

    useEffect(() => {
        if (promotion) {
            setName(promotion.name);
            setType(promotion.type);
            setValue(promotion.type === 'percentage' ? promotion.value * 100 : promotion.value);
            setStartTime(promotion.startTime);
            setEndTime(promotion.endTime);
            setDaysOfWeek(promotion.daysOfWeek);
            setApplicableCategoryIds(promotion.applicableCategoryIds);
            setApplicableProductIds(promotion.applicableProductIds);
            setIsActive(promotion.isActive);
        } else {
            setName('');
            setType('percentage');
            setValue(10);
            setStartTime('16:00');
            setEndTime('18:00');
            setDaysOfWeek([1, 2, 3, 4, 5]);
            setApplicableCategoryIds([]);
            setApplicableProductIds([]);
            setIsActive(true);
        }
    }, [promotion, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            id: promotion?.id || `promo_${Date.now()}`,
            name,
            type,
            value: type === 'percentage' ? value / 100 : value,
            startTime,
            endTime,
            daysOfWeek,
            applicableCategoryIds,
            applicableProductIds,
            isActive,
        });
        onClose();
    };

    const handleDayToggle = (dayIndex: number) => {
        setDaysOfWeek(prev => prev.includes(dayIndex) ? prev.filter(d => d !== dayIndex) : [...prev, dayIndex].sort());
    };
    
    const handleCategoryToggle = (catId: string) => {
        setApplicableCategoryIds(prev => prev.includes(catId) ? prev.filter(id => id !== catId) : [...prev, catId]);
    };
    
    const handleProductToggle = (productId: number) => {
        setApplicableProductIds(prev => prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} className="max-w-2xl">
            <form onSubmit={handleSubmit}>
                <ModalHeader>
                    <ModalTitle>{promotion ? 'Edit Promotion' : 'Add New Promotion'}</ModalTitle>
                </ModalHeader>
                <ModalContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <label className="block text-sm text-muted-foreground mb-1">Promotion Name</label>
                            <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g., Happy Hour Wings" required />
                        </div>
                        <div>
                            <label className="block text-sm text-muted-foreground mb-1">Type</label>
                            <Select value={type} onChange={e => setType(e.target.value as any)}>
                                <option value="percentage">Percentage Discount</option>
                                <option value="fixed">Fixed Amount Discount</option>
                                <option value="bogo">Buy One Get One Free</option>
                            </Select>
                        </div>
                        <div>
                            <label className="block text-sm text-muted-foreground mb-1">Value ({type === 'percentage' ? '%' : '$'})</label>
                            <Input type="number" value={value} onChange={e => setValue(parseFloat(e.target.value))} step="0.01" required />
                        </div>
                        <div>
                            <label className="block text-sm text-muted-foreground mb-1">Start Time</label>
                            <Input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} />
                        </div>
                         <div>
                            <label className="block text-sm text-muted-foreground mb-1">End Time</label>
                            <Input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm text-muted-foreground mb-2">Days of the Week</label>
                            <div className="flex gap-1 flex-wrap">
                                {DAYS.map((day, index) => (
                                    <button
                                        type="button"
                                        key={day}
                                        onClick={() => handleDayToggle(index)}
                                        className={`w-10 h-10 rounded-md font-semibold text-xs ${daysOfWeek.includes(index) ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}
                                    >{day}</button>
                                ))}
                            </div>
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm text-muted-foreground mb-2">Applicable Categories</label>
                            <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto bg-background p-2 rounded-md border">
                                {categories.map((cat: any) => (
                                    <button
                                        type="button"
                                        key={cat.id}
                                        onClick={() => handleCategoryToggle(cat.id)}
                                        className={`px-3 py-1 rounded-full font-semibold text-xs ${applicableCategoryIds.includes(cat.id) ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}
                                    >{cat.name}</button>
                                ))}
                            </div>
                             <p className="text-xs text-muted-foreground mt-1">Leave empty to apply to all items that meet product criteria.</p>
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm text-muted-foreground mb-2">Applicable Products</label>
                            <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto bg-background p-2 rounded-md border">
                                {menuItems.map((item: any) => (
                                    <button
                                        type="button"
                                        key={item.id}
                                        onClick={() => handleProductToggle(item.id)}
                                        className={`px-3 py-1 rounded-full font-semibold text-xs ${applicableProductIds.includes(item.id) ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}
                                    >{item.name}</button>
                                ))}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">Leave empty to apply to all items that meet category criteria.</p>
                        </div>
                    </div>
                </ModalContent>
                <ModalFooter className="justify-between">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={isActive} onChange={e => setIsActive(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
                        <span>Active</span>
                    </label>
                    <div className="flex gap-2">
                        <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
                        <Button type="submit">Save Promotion</Button>
                    </div>
                </ModalFooter>
            </form>
        </Modal>
    );
};

export default PromotionEditModal;
