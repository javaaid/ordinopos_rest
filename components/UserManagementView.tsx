import React from 'react';
import { Employee, Role, Location } from '../types';
import MegaphoneIcon from './icons/MegaphoneIcon';
import TrashIcon from './icons/TrashIcon';
import UserPlusIcon from './icons/UserPlusIcon';
import PencilSquareIcon from './icons/PencilSquareIcon';
import { useModalContext, useDataContext, useToastContext, useAppContext } from '../contexts/AppContext';
import { cn } from '../lib/utils';
import ArrowsPointingOutIcon from './icons/ArrowsPointingOutIcon';
import ArrowsPointingInIcon from './icons/ArrowsPointingInIcon';
// FIX: Changed to a named import to resolve "Module has no default export" error.
import { ExportButtons } from './ExportButtons';
import { exportToCsv } from '../lib/utils';
import { useTranslations } from '../hooks/useTranslations';

const UserManagementView: React.FC = () => {
    const { employees, roles, locations, handleDeleteUser, handleSaveUser, onSuggestRole, settings } = useDataContext();
    const t = useTranslations(settings.language.staff);
    const { openModal } = useModalContext();
    const { addToast } = useToastContext();

    const onAddNewUser = () => openModal('userEdit', { onSave: handleSaveUser, onSuggestRole });
    const onEditUser = (user: Employee) => openModal('userEdit', { user, onSave: handleSaveUser, onSuggestRole });

    const handleCsvExport = (filename: string = 'users.csv') => {
        const headers = ["ID", "Name", "Role", "Location"];
        const rows = (employees || []).map((user: Employee) => {
            const role = (roles || []).find((r: Role) => r.id === user.roleId)?.name || 'N/A';
            const location = (locations || []).find((l: Location) => l.id === user.locationId)?.name || 'N/A';
            return [user.id, user.name, role, location];
        });
        exportToCsv(headers, rows, filename);
        addToast({ type: 'success', title: 'Export Successful', message: `Exported ${rows.length} users.` });
    };

    const handlePrint = () => window.print();

    const thClass = "px-4 py-3 text-left rtl:text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider";

    return (
        <div className="p-6 h-full flex flex-col">
            <div className="flex justify-between items-center mb-4 no-print">
                <h2 className="text-2xl font-bold text-foreground rtl:text-right">{t('manageUsers')}</h2>
                 <div className="flex items-center gap-2">
                    <ExportButtons onCsvExport={handleCsvExport} onPrint={handlePrint} />
                    <button
                        onClick={onAddNewUser}
                        className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-2 px-4 rounded-lg transition-colors shadow-md"
                    >
                        <UserPlusIcon className="w-5 h-5"/>
                        {t('addUser')}
                    </button>
                </div>
            </div>
            {/* Mobile Card View */}
            <div className="md:hidden space-y-3 flex-grow overflow-y-auto">
                {employees.map((user: Employee) => {
                    const role = (roles || []).find((r: Role) => r.id === user.roleId);
                    return (
                        <div key={user.id} className="bg-card border border-border p-4 rounded-lg">
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-3">
                                    <img src={user.avatar} alt={user.name} className="w-12 h-12 rounded-full object-cover" />
                                    <div>
                                        <p className="font-bold text-foreground">{user.name}</p>
                                        <p className="text-sm text-muted-foreground">{role?.name}</p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => onEditUser(user)} className="p-2 text-primary hover:bg-secondary rounded-full"><PencilSquareIcon className="w-5 h-5"/></button>
                                    <button onClick={() => handleDeleteUser(user.id)} className="p-2 text-destructive hover:bg-secondary rounded-full"><TrashIcon className="w-5 h-5"/></button>
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto bg-card rounded-lg flex-grow border border-border printable-area">
                <table className="min-w-full divide-y divide-border">
                    <thead className="bg-muted/50 sticky top-0">
                        <tr>
                            <th className={thClass}>{t('name')}</th>
                            <th className={thClass}>{t('role')}</th>
                            <th className={thClass}>{t('location')}</th>
                            <th className="px-4 py-3 text-right rtl:text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider no-print">{t('actions')}</th>
                        </tr>
                    </thead>
                    <tbody className="bg-card divide-y divide-border">
                        {employees.map((user: Employee) => {
                            const role = (roles || []).find((r: Role) => r.id === user.roleId);
                            const location = (locations || []).find((l: Location) => l.id === user.locationId);
                            return (
                                <tr key={user.id} className="hover:bg-muted/50">
                                    <td className="px-4 py-3 whitespace-nowrap text-foreground font-medium flex items-center gap-3">
                                        <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full object-cover"/>
                                        {user.name}
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">{role?.name || 'N/A'}</td>
                                    <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">{location?.name || 'N/A'}</td>
                                    <td className="px-4 py-3 whitespace-nowrap text-right rtl:text-left no-print">
                                        <div className="flex gap-2 justify-end rtl:justify-start">
                                            <button onClick={() => onEditUser(user)} className="p-1 text-primary hover:opacity-80">
                                                <PencilSquareIcon className="w-5 h-5" />
                                            </button>
                                             <button onClick={() => handleDeleteUser(user.id)} className="text-destructive hover:opacity-80 p-1">
                                                <TrashIcon className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default UserManagementView;