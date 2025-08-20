
import React, { useState, useMemo } from 'react';
import { Customer } from '../types';
import SearchIcon from './icons/SearchIcon';
import UserPlusIcon from './icons/UserPlusIcon';

interface CustomerSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  customers: Customer[];
  onSelectCustomer: (customer: Customer) => void;
  onAddNewCustomer: () => void;
}

const CustomerSelectModal: React.FC<CustomerSelectModalProps> = ({ isOpen, onClose, customers, onSelectCustomer, onAddNewCustomer }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCustomers = useMemo(() => {
    if (!searchQuery.trim()) {
      return customers;
    }
    const lowerQuery = searchQuery.toLowerCase();
    return customers.filter(c => 
        c.name.toLowerCase().includes(lowerQuery) ||
        c.phone.includes(lowerQuery)
    );
  }, [customers, searchQuery]);

  if (!isOpen) return null;

  const handleAddNew = () => {
    onClose();
    onAddNewCustomer();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4">
      <div className="bg-card rounded-lg shadow-xl w-full max-w-lg max-h-[80vh] flex flex-col border border-border">
        <div className="p-4 border-b border-border">
          <h2 className="text-xl font-bold text-foreground">Select Customer</h2>
        </div>
        <div className="p-4">
            <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <SearchIcon className="h-5 w-5 text-muted-foreground" />
                </div>
                <input
                    type="search"
                    placeholder="Search by name or phone..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="block w-full rounded-lg border-2 border-border bg-background py-2.5 pl-10 pr-4 text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-inset focus:ring-primary"
                />
            </div>
        </div>
        <div className="flex-grow overflow-y-auto p-4 space-y-2">
            {filteredCustomers.map(customer => (
                <div 
                    key={customer.id} 
                    onClick={() => onSelectCustomer(customer)}
                    className="p-3 rounded-lg hover:bg-muted cursor-pointer"
                >
                    <p className="font-semibold text-foreground">{customer.name}</p>
                    <p className="text-sm text-muted-foreground">{customer.phone} - {customer.address}</p>
                </div>
            ))}
        </div>
        <div className="p-4 border-t border-border flex justify-between items-center">
            <button
                onClick={handleAddNew}
                className="flex items-center gap-2 bg-green-500/20 text-green-500 font-bold py-2 px-4 rounded-lg text-sm"
            >
                <UserPlusIcon className="w-5 h-5"/> Add New Customer
            </button>
            <button onClick={onClose} className="px-6 py-2 rounded-md bg-secondary text-secondary-foreground font-semibold">
                Close
            </button>
        </div>
      </div>
    </div>
  );
};

export default CustomerSelectModal;
