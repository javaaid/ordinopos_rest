
import React, { useState, useEffect } from 'react';
import { PaymentType } from '../types';

interface PaymentTypeEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (paymentType: PaymentType) => void;
    paymentType: PaymentType | null;
}

const PaymentTypeEditModal: React.FC<PaymentTypeEditModalProps> = ({ isOpen, onClose, onSave, paymentType }) => {
    const [name, setName] = useState('');
    const [isEnabled, setIsEnabled] = useState(true);

    useEffect(() => {
        if (paymentType) {
            setName(paymentType.name);
            setIsEnabled(paymentType.isEnabled);
        } else {
            setName('');
            setIsEnabled(true);
        }
    }, [paymentType]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) {
            alert("Name is required.");
            return;
        }
        onSave({
            id: paymentType?.id || `pt_${Date.now()}`,
            name,
            isEnabled,
        });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4">
            <div className="bg-card rounded-lg shadow-xl w-full max-w-md border border-border">
                <form onSubmit={handleSubmit}>
                    <div className="p-6 border-b border-border">
                        <h2 className="text-2xl font-bold text-foreground">{paymentType ? 'Edit Payment Type' : 'Add Payment Type'}</h2>
                    </div>
                    <div className="p-6 space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-muted-foreground mb-1">Payment Method Name</label>
                            <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full bg-input p-2 rounded-md border border-border text-foreground" required />
                        </div>
                        <label className="flex items-center justify-between p-3 rounded-lg bg-secondary cursor-pointer">
                            <span className="font-medium text-foreground">Enabled</span>
                            <button
                                type="button"
                                onClick={() => setIsEnabled(prev => !prev)}
                                className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${isEnabled ? 'bg-primary' : 'bg-muted'}`}
                            >
                                <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${isEnabled ? 'translate-x-6' : 'translate-x-1'}`}/>
                            </button>
                        </label>
                    </div>
                    <div className="p-6 border-t border-border flex justify-end items-center space-x-4">
                        <button type="button" onClick={onClose} className="px-6 py-2 rounded-md bg-secondary text-secondary-foreground font-semibold">Cancel</button>
                        <button type="submit" className="px-6 py-2 rounded-md bg-primary text-primary-foreground font-semibold">Save</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PaymentTypeEditModal;