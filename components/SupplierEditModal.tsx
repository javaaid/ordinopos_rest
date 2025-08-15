
import React, { useState, useEffect } from 'react';
import { Supplier } from '../types';

interface SupplierEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (supplier: Supplier) => void;
    supplier: Supplier | null;
}

const SupplierEditModal: React.FC<SupplierEditModalProps> = ({ isOpen, onClose, onSave, supplier }) => {
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [address, setAddress] = useState('');

    useEffect(() => {
        if (supplier) {
            setName(supplier.name);
            setPhone(supplier.phone || '');
            setEmail(supplier.email || '');
            setAddress(supplier.address || '');
        } else {
            setName('');
            setPhone('');
            setEmail('');
            setAddress('');
        }
    }, [supplier, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) {
            alert("Supplier name cannot be empty.");
            return;
        }
        onSave({
            id: supplier?.id || `sup_${Date.now()}`,
            name: name.trim(),
            phone: phone.trim(),
            email: email.trim(),
            address: address.trim(),
        });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4">
            <div className="bg-card rounded-lg shadow-xl w-full max-w-md border border-border">
                <form onSubmit={handleSubmit}>
                    <div className="p-6 border-b border-border">
                        <h2 className="text-2xl font-bold text-foreground">{supplier ? 'Edit Supplier' : 'Add New Supplier'}</h2>
                    </div>
                    <div className="p-6 space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-muted-foreground mb-1">Supplier Name</label>
                            <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full bg-input p-2 rounded-md border border-border text-foreground" required />
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-muted-foreground mb-1">Phone</label>
                            <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="w-full bg-input p-2 rounded-md border border-border text-foreground" />
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-muted-foreground mb-1">Email</label>
                            <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-input p-2 rounded-md border border-border text-foreground" />
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-muted-foreground mb-1">Address</label>
                            <input type="text" value={address} onChange={e => setAddress(e.target.value)} className="w-full bg-input p-2 rounded-md border border-border text-foreground" />
                        </div>
                    </div>
                    <div className="p-6 border-t border-border flex justify-end items-center space-x-4">
                        <button type="button" onClick={onClose} className="px-6 py-2 rounded-md bg-secondary text-secondary-foreground font-semibold hover:bg-muted">Cancel</button>
                        <button type="submit" className="px-6 py-2 rounded-md bg-primary text-primary-foreground font-semibold hover:bg-primary/90">Save Supplier</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SupplierEditModal;