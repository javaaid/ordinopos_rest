
import React, { useState, useEffect } from 'react';
import { Employee, Role, Location, AIRoleSuggestion } from '../types';
import SparklesIcon from './icons/SparklesIcon';
import KeyIcon from './icons/KeyIcon';
import InformationCircleIcon from './icons/InformationCircleIcon';
import { useDataContext } from '../contexts/AppContext';
import { Modal, ModalHeader, ModalTitle, ModalContent, ModalFooter } from './ui/Modal';
import { Input } from './ui/Input';
import { Select } from './ui/Select';
import { Button } from './ui/Button';

interface UserEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (employee: Employee, isNew: boolean) => void;
    user: Employee | null;
    onSuggestRole: (jobTitle: string) => Promise<AIRoleSuggestion | null>;
}

const UserEditModal: React.FC<UserEditModalProps> = ({ isOpen, onClose, onSave, user, onSuggestRole }) => {
    const { roles, locations } = useDataContext();
    const [name, setName] = useState('');
    const [pin, setPin] = useState('');
    const [roleId, setRoleId] = useState('');
    const [locationId, setLocationId] = useState('');
    const [jobTitle, setJobTitle] = useState('');
    const [isSuggesting, setIsSuggesting] = useState(false);
    const [suggestionReason, setSuggestionReason] = useState('');

    useEffect(() => {
        if (isOpen) {
            if (user) {
                setName(user.name);
                setPin(user.pin);
                setRoleId(user.roleId);
                setLocationId(user.locationId);
                setJobTitle(''); // Clear title when editing
                setSuggestionReason('');
            } else {
                // Defaults for a new user
                setName('');
                setPin('');
                setRoleId(roles.length > 0 ? roles.find((r: Role) => r.name === 'Cashier')?.id || roles[0].id : '');
                setLocationId(locations.length > 0 ? locations[0].id : '');
            }
        }
    }, [user, roles, locations, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!/^\d{6}$/.test(pin)) {
            alert("PIN must be exactly 6 digits.");
            return;
        }
        if (!name || !pin || !roleId || !locationId) {
            alert("All fields are required.");
            return;
        }
        
        const isNew = !user;
        const employeeData: Employee = {
            id: user?.id || `emp_${Date.now()}`,
            name,
            pin,
            roleId,
            locationId,
            shiftStatus: user?.shiftStatus || 'clocked-out',
            shifts: user?.shifts || [],
            avatar: user?.avatar || 'https://randomuser.me/api/portraits/men/1.jpg',
        };
        
        onSave(employeeData, isNew);
    };

    const handleSuggestRole = async () => {
        if (!jobTitle) {
            alert("Please enter a job title first.");
            return;
        }
        setIsSuggesting(true);
        setSuggestionReason('');
        const result = await onSuggestRole(jobTitle);
        if (result && roles.find((r: Role) => r.id === result.suggestedRoleId)) {
            setRoleId(result.suggestedRoleId);
            setSuggestionReason(result.reason);
        } else {
            alert("Could not suggest a role. Please select one manually.");
        }
        setIsSuggesting(false);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <form onSubmit={handleSubmit}>
                <ModalHeader>
                    <ModalTitle>{user ? 'Edit User' : 'Add New User'}</ModalTitle>
                </ModalHeader>
                <ModalContent>
                    <div className="space-y-4">
                        {!user && (
                            <div className="bg-secondary/50 p-3 rounded-lg">
                                <label className="block text-sm font-medium text-muted-foreground mb-1">Job Title (for AI)</label>
                                <div className="flex flex-wrap gap-2">
                                     <Input type="text" value={jobTitle} onChange={e => setJobTitle(e.target.value)} placeholder="e.g., Pizza Chef, Server" className="flex-grow min-w-[180px]" />
                                     <Button
                                        type="button"
                                        onClick={handleSuggestRole}
                                        disabled={isSuggesting}
                                        className="flex items-center justify-center gap-2 shadow-md flex-grow sm:flex-grow-0"
                                     >
                                        <SparklesIcon className="w-5 h-5"/>
                                        {isSuggesting ? 'Thinking...' : 'Suggest Role'}
                                     </Button>
                                </div>
                                {suggestionReason && (
                                    <p className="text-xs text-muted-foreground mt-2 flex gap-1.5"><InformationCircleIcon className="w-4 h-4 flex-shrink-0"/> {suggestionReason}</p>
                                )}
                            </div>
                        )}
                        <div>
                            <label className="block text-sm font-medium text-muted-foreground mb-1">Full Name</label>
                            <Input type="text" value={name} onChange={e => setName(e.target.value)} required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-muted-foreground mb-1">6-Digit PIN</label>
                            <div className="relative">
                                <KeyIcon className="w-5 h-5 absolute start-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"/>
                                <Input 
                                    type="password" 
                                    value={pin} 
                                    onChange={e => setPin(e.target.value.replace(/\D/g, ''))} 
                                    maxLength={6} 
                                    pattern="[0-9]{6}"
                                    title="PIN must be exactly 6 digits."
                                    className="ps-10 tracking-widest" 
                                    required 
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-muted-foreground mb-1">Role</label>
                            <Select value={roleId} onChange={e => setRoleId(e.target.value)} required>
                                {roles.map((r: Role) => <option key={r.id} value={r.id}>{r.name}</option>)}
                            </Select>
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-muted-foreground mb-1">Location</label>
                            <Select value={locationId} onChange={e => setLocationId(e.target.value)} required>
                                {locations.map((l: Location) => <option key={l.id} value={l.id}>{l.name}</option>)}
                            </Select>
                        </div>
                    </div>
                </ModalContent>
                <ModalFooter>
                    <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
                    <Button type="submit">Save User</Button>
                </ModalFooter>
            </form>
        </Modal>
    );
};

export default UserEditModal;
