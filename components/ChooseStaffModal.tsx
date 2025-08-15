import React, { useState, useMemo } from 'react';
import { Employee } from '../types';
import { Modal, ModalHeader, ModalTitle, ModalContent, ModalFooter } from './ui/Modal';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import SearchIcon from './icons/SearchIcon';

interface ChooseStaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  employees: Employee[];
  onSelectStaff: (employee: Employee) => void;
  selectedStaffId?: string;
}

const ChooseStaffModal: React.FC<ChooseStaffModalProps> = ({ isOpen, onClose, employees, onSelectStaff, selectedStaffId }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredEmployees = useMemo(() => {
    if (!searchQuery.trim()) {
      return employees;
    }
    const lowerQuery = searchQuery.toLowerCase();
    return employees.filter(e => e.name.toLowerCase().includes(lowerQuery));
  }, [employees, searchQuery]);

  const handleSelect = (employee: Employee) => {
    onSelectStaff(employee);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-3xl">
      <ModalHeader>
        <ModalTitle>Choose Staff</ModalTitle>
      </ModalHeader>
      <ModalContent className="p-0">
        <div className="p-4 border-b border-border">
            <div className="relative">
                <SearchIcon className="w-5 h-5 text-muted-foreground absolute start-3 top-1/2 -translate-y-1/2 pointer-events-none"/>
                <Input
                    type="search"
                    placeholder="Search staff members..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="ps-10"
                />
            </div>
        </div>
        <div className="p-6 max-h-[60vh] overflow-y-auto">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {filteredEmployees.map(employee => (
                    <button
                        key={employee.id}
                        onClick={() => handleSelect(employee)}
                        className={`p-3 rounded-lg text-center transition-colors border-2 ${selectedStaffId === employee.id ? 'border-primary bg-primary/10' : 'border-border bg-secondary hover:border-muted-foreground'}`}
                    >
                        <img src={employee.avatar} alt={employee.name} className="w-20 h-20 rounded-full mx-auto mb-2 border-4 border-card" />
                        <p className="font-semibold text-foreground text-sm">{employee.name}</p>
                    </button>
                ))}
            </div>
        </div>
      </ModalContent>
      <ModalFooter>
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
      </ModalFooter>
    </Modal>
  );
};

export default ChooseStaffModal;
