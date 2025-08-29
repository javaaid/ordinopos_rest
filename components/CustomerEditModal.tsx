import React, { useState, useEffect } from 'react';
import { Customer } from '../types';
import { Select } from './ui/Select';
import { COUNTRIES } from '../constants';


interface CustomerEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (customer: Customer, isNew: boolean) => void;
    customer: Customer | null;
}

const CustomerEditModal: React.FC<CustomerEditModalProps> = ({ isOpen, onClose, onSave, customer }) => {
    const [formData, setFormData] = useState<Partial<Omit<Customer, 'id' | 'locationId'>>>({
        name: '', phone: '', email: '', address: '', zipCode: '', country: 'US', allergies: '', notes: '', membershipTier: undefined, membershipId: '',
    });

    useEffect(() => {
        if (customer) {
            setFormData({
                name: customer.name,
                phone: customer.phone,
                email: customer.email,
                address: customer.address,
                zipCode: customer.zipCode || '',
                country: customer.country || 'US',
                allergies: customer.allergies || '',
                notes: customer.notes || '',
                membershipTier: customer.membershipTier,
                membershipId: customer.membershipId || `CUST-${Date.now()}`,
            });
        } else {
            setFormData({ name: '', phone: '', email: '', address: '', zipCode: '', country: 'US', allergies: '', notes: '', membershipTier: undefined, membershipId: `CUST-${Date.now()}` });
        }
    }, [customer, isOpen]);

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name?.trim()) {
            alert("Customer name is required.");
            return;
        }

        const customerData: Customer = {
            id: customer?.id || `cust_${Date.now()}`,
            locationId: customer?.locationId || '', // This should be handled in App.tsx
            ...formData,
            name: formData.name!,
            phone: formData.phone!,
            email: formData.email!,
            address: formData.address!,
            membershipId: formData.membershipId,
            membershipTier: formData.membershipTier ? parseInt(String(formData.membershipTier), 10) as (1 | 2 | 3) : undefined,
        };
        
        onSave(customerData, !customer);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-[60] p-4">
            <div className="bg-card rounded-lg shadow-xl w-full max-w-lg border border-border">
                <form onSubmit={handleSubmit}>
                    <div className="p-6 border-b border-border">
                        <h2 className="text-2xl font-bold text-foreground">{customer ? 'Edit Customer' : 'Add New Customer'}</h2>
                    </div>
                    <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-muted-foreground mb-1">Full Name</label>
                                <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full bg-input p-2 rounded-md border border-border text-foreground" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-muted-foreground mb-1">Phone Number</label>
                                <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full bg-input p-2 rounded-md border border-border text-foreground" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-muted-foreground mb-1">Email Address</label>
                            <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full bg-input p-2 rounded-md border border-border text-foreground" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-muted-foreground mb-1">Membership ID</label>
                            <input type="text" name="membershipId" value={formData.membershipId} className="w-full bg-input p-2 rounded-md border border-border text-muted-foreground font-mono" readOnly />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-muted-foreground mb-1">Address</label>
                            <input type="text" name="address" value={formData.address} onChange={handleChange} className="w-full bg-input p-2 rounded-md border border-border text-foreground" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <div>
                                <label className="block text-sm font-medium text-muted-foreground mb-1">Zip Code</label>
                                <input type="text" name="zipCode" value={formData.zipCode} onChange={handleChange} className="w-full bg-input p-2 rounded-md border border-border text-foreground" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-muted-foreground mb-1">Country</label>
                                <select name="country" value={formData.country} onChange={handleChange} className="w-full bg-input p-2 rounded-md border border-border text-foreground">
                                    {COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}
                                </select>
                            </div>
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-muted-foreground mb-1">Membership Tier</label>
                            <Select name="membershipTier" value={formData.membershipTier || ''} onChange={handleChange}>
                                <option value="">No Membership</option>
                                <option value="1">Tier 1</option>
                                <option value="2">Tier 2</option>
                                <option value="3">Tier 3</option>
                            </Select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-muted-foreground mb-1">Known Allergies</label>
                            <input type="text" name="allergies" value={formData.allergies} onChange={handleChange} placeholder="e.g., Peanuts, Shellfish" className="w-full bg-input p-2 rounded-md border border-border text-foreground" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-muted-foreground mb-1">Notes</label>
                            <textarea name="notes" value={formData.notes} onChange={handleChange} className="w-full bg-input p-2 rounded-md h-24 border border-border text-foreground" placeholder="e.g., VIP, Prefers window seat..."></textarea>
                        </div>
                    </div>
                    <div className="p-6 border-t border-border flex justify-end items-center space-x-4">
                        <button type="button" onClick={onClose} className="px-6 py-2 rounded-md bg-secondary text-secondary-foreground font-semibold">Cancel</button>
                        <button type="submit" className="px-6 py-2 rounded-md bg-primary text-primary-foreground font-semibold">Save Customer</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CustomerEditModal;