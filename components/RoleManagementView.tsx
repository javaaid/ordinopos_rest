


import React from 'react';
import { Role, Employee } from '../types';
import PencilSquareIcon from './icons/PencilSquareIcon';
import UserPlusIcon from './icons/UserPlusIcon';
import TrashIcon from './icons/TrashIcon';
import { useDataContext, useModalContext, useAppContext } from '../contexts/AppContext';
// FIX: Changed to a named import to resolve "Module has no default export" error.
import { ExportButtons } from './ExportButtons';
import { useTranslations } from '../hooks/useTranslations';

const RoleManagementView: React.FC = () => {
    const { roles, employees, handleSaveRole, handleDeleteRole } = useDataContext();
    const { openModal } = useModalContext();
    const { settings } = useAppContext();
    const t = useTranslations(settings.language.staff);

    const onEditRole = (role: Role) => openModal('roleEdit', { role, onSave: handleSaveRole });
    const onAddNewRole = () => openModal('roleEdit', { onSave: handleSaveRole });

    const defaultRoleIds = new Set(['role_admin', 'role_manager', 'role_chef', 'role_server', 'role_cashier']);
    
    const handleCsvExport = () => {
        const headers = ["ID", "Name", "User Count"];
        const rows = (roles || []).map((r: Role) => {
            const userCount = (employees || []).filter((e: Employee) => e.roleId === r.id).length;
            return [r.id, `"${r.name}"`, userCount].join(',');
        });
        const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
        const link = document.createElement("a");
        link.setAttribute("href", encodeURI(csvContent));
        link.setAttribute("download", "roles.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handlePrint = () => window.print();

    const thClass = "px-4 py-3 text-start rtl:text-end text-xs font-semibold text-muted-foreground uppercase tracking-wider";

    return (
        <div className="p-6 h-full flex flex-col">
            <div className="flex justify-between items-center mb-4 no-print">
                <h2 className="text-2xl font-bold text-foreground rtl:text-right">{t('manageRolesPermissions')}</h2>
                <div className="flex items-center gap-2">
                    <ExportButtons onCsvExport={handleCsvExport} onPrint={handlePrint} />
                    <button
                        onClick={onAddNewRole}
                        className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-2 px-4 rounded-lg"
                    >
                        <UserPlusIcon className="w-5 h-5" />
                        {t('addNewRole')}
                    </button>
                </div>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-3 flex-grow overflow-y-auto">
                {(roles || []).map((role: Role) => {
                    const userCount = (employees || []).filter((e: Employee) => e.roleId === role.id).length;
                    const isDefault = defaultRoleIds.has(role.id);
                    return (
                        <div key={role.id} className="bg-card border border-border p-4 rounded-lg">
                             <div className="flex justify-between items-start">
                                <div>
                                    <p className="font-bold text-foreground">{role.name}</p>
                                    <p className="text-sm text-muted-foreground">{userCount} user(s)</p>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => onEditRole(role)} className="p-2 text-primary hover:bg-secondary rounded-full"><PencilSquareIcon className="w-5 h-5" /></button>
                                    <button 
                                        onClick={() => handleDeleteRole(role.id)} 
                                        disabled={isDefault} 
                                        className="p-2 text-destructive hover:bg-secondary rounded-full disabled:text-muted disabled:cursor-not-allowed"
                                        title={isDefault ? 'Default roles cannot be deleted' : 'Delete Role'}
                                    ><TrashIcon className="w-5 h-5" /></button>
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
                            <th className={thClass}>{t('roleName')}</th>
                            <th className={thClass}>{t('users')}</th>
                            <th className="px-4 py-3 text-end rtl:text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider no-print">{t('actions')}</th>
                        </tr>
                    </thead>
                    <tbody className="bg-card divide-y divide-border">
                        {(roles || []).map((role: Role) => {
                            const userCount = (employees || []).filter((e: Employee) => e.roleId === role.id).length;
                            const isDefault = defaultRoleIds.has(role.id);
                            return (
                                <tr key={role.id} className="hover:bg-secondary">
                                    <td className="px-4 py-3 whitespace-nowrap text-foreground font-medium">{role.name}</td>
                                    <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">{userCount}</td>
                                    <td className="px-4 py-3 whitespace-nowrap text-end rtl:text-left no-print">
                                        <div className="flex gap-2 justify-end rtl:justify-start">
                                            <button onClick={() => onEditRole(role)} className="text-primary hover:opacity-80 p-1">
                                                <PencilSquareIcon className="w-5 h-5" />
                                            </button>
                                            <button 
                                                onClick={() => handleDeleteRole(role.id)} 
                                                disabled={isDefault} 
                                                className="text-destructive hover:opacity-80 p-1 disabled:text-muted disabled:cursor-not-allowed"
                                                title={isDefault ? 'Default roles cannot be deleted' : 'Delete Role'}
                                            >
                                                <TrashIcon className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default RoleManagementView;