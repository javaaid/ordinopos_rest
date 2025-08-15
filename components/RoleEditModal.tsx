
import React, { useState, useEffect } from 'react';
import { Role, PermissionSet } from '../types';
import { Modal, ModalHeader, ModalTitle, ModalContent, ModalFooter } from './ui/Modal';
import { Input } from './ui/Input';
import { Button } from './ui/Button';

interface RoleEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (role: Role) => void;
    role: Role | null; // Can be null for a new role
}

const permissionLabels: Record<keyof PermissionSet, string> = {
    viewDashboard: "Access Manager Dashboard",
    viewPOS: "Access Point of Sale (POS)",
    viewFloorPlan: "Access Floor Plan & Table Management",
    viewKDS: "Access Kitchen Display System (KDS)",
    viewDelivery: "Access Delivery Management",
    viewPurchasing: "Access Purchase Orders (Pro)",
    viewCustomers: "Access Customer Management",
    viewReports: "Access Reports Main View",
    viewSettings: "Access System Settings",
    viewHistory: "Access Order History",
    viewTimeClock: "Access Time Clock & Scheduling (Pro)",
    viewReservations: "Access Reservations Management",
    viewWaitlist: "Access Waitlist Management",
    canViewAllReports: "View All Financial & Sales Reports",
    canViewInventoryReport: "View Inventory-Only Reports",
    canPerformManagerFunctions: "Perform Manager Functions (Training, CFD, etc.)",
    canManageUsersAndRoles: "Manage Users and Roles",
    canApproveRefunds: "Approve or Deny Refunds",
    viewOrderNumberDisplay: "Access Order Number Display Screen",
};

const defaultPermissions: PermissionSet = {
    viewDashboard: false, viewPOS: true, viewFloorPlan: false, viewKDS: false, viewDelivery: false, viewPurchasing: false, viewCustomers: false, viewReports: false, viewSettings: false, viewHistory: true, viewTimeClock: true, viewReservations: false, viewWaitlist: false,
    canViewAllReports: false, canViewInventoryReport: false,
    canPerformManagerFunctions: false, canManageUsersAndRoles: false, canApproveRefunds: false,
    viewOrderNumberDisplay: false,
};

const RoleEditModal: React.FC<RoleEditModalProps> = ({ isOpen, onClose, onSave, role }) => {
    const [name, setName] = useState('');
    const [localPermissions, setLocalPermissions] = useState<PermissionSet>(defaultPermissions);
    const isNewRole = !role;
    const isRoleAdmin = role?.name === 'Admin';

    useEffect(() => {
        if (role) {
            setName(role.name);
            setLocalPermissions(role.permissions);
        } else {
            setName('');
            setLocalPermissions(defaultPermissions);
        }
    }, [role, isOpen]);
    
    if (!isOpen) return null;

    const handlePermissionChange = (permissionKey: keyof PermissionSet, checked: boolean) => {
        setLocalPermissions(prev => ({
            ...prev,
            [permissionKey]: checked
        }));
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(isNewRole && !name.trim()) {
            alert("Role name cannot be empty.");
            return;
        }

        const roleData: Role = {
            id: role?.id || `role_${Date.now()}`,
            name: name.trim(),
            permissions: localPermissions
        };

        onSave(roleData);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} className="max-w-lg">
            <form onSubmit={handleSubmit}>
                <ModalHeader>
                    <ModalTitle>{isNewRole ? 'Add New Role' : `Edit Role: ${role.name}`}</ModalTitle>
                    {isRoleAdmin && <p className="text-muted-foreground">Note: The 'Admin' role cannot be restricted.</p>}
                </ModalHeader>
                <ModalContent>
                    {isNewRole && (
                         <div className="mb-4">
                            <label className="block text-sm font-medium text-muted-foreground mb-1">Role Name</label>
                            <Input type="text" value={name} onChange={e => setName(e.target.value)} required />
                        </div>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2">
                        {(Object.keys(permissionLabels) as Array<keyof PermissionSet>).map(key => {
                            const pKey = key as keyof PermissionSet;
                            return (
                                <label key={pKey} className="flex items-center p-2 rounded-lg bg-secondary hover:bg-muted transition-colors cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={localPermissions[pKey]}
                                        onChange={e => handlePermissionChange(pKey, e.target.checked)}
                                        disabled={isRoleAdmin}
                                        className="h-4 w-4 bg-background border-border text-primary focus:ring-primary rounded disabled:opacity-50"
                                    />
                                    <span className={`ml-2 text-sm text-foreground ${isRoleAdmin ? 'text-muted-foreground' : ''}`}>
                                        {permissionLabels[pKey]}
                                    </span>
                                </label>
                            )
                        })}
                    </div>
                </ModalContent>
                <ModalFooter>
                    <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
                    <Button type="submit" disabled={isRoleAdmin}>Save</Button>
                </ModalFooter>
            </form>
        </Modal>
    );
};

export default RoleEditModal;
