
import React, { useMemo } from 'react';
import { Role, PermissionSet } from '../types';
import ShieldCheckIcon from './icons/ShieldCheckIcon';

interface RolePermissionReportProps {
    roles: Role[];
}

const RolePermissionReport: React.FC<RolePermissionReportProps> = ({ roles }) => {

    const getPermissionSummary = (permissions: PermissionSet): string[] => {
        const summary: string[] = [];
        if (permissions.canManageUsersAndRoles) summary.push("Full administrative access.");
        else {
            if (permissions.viewPOS) summary.push("Can access POS terminal.");
            if (permissions.viewReports && permissions.canViewAllReports) summary.push("Can view all financial reports.");
            else if (permissions.viewReports && permissions.canViewInventoryReport) summary.push("Can only view inventory reports.");
            else if (!permissions.viewReports) summary.push("Cannot view any reports.");

            if (permissions.canPerformManagerFunctions) summary.push("Can access manager functions (e.g., training mode).");
        }
        if (summary.length === 0) return ["No specific permissions assigned."];
        return summary;
    };

    return (
        <div className="w-full max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-foreground mb-2 flex items-center gap-3">
                <ShieldCheckIcon className="w-8 h-8"/>
                Role Permission Summary
            </h2>
            <p className="text-sm text-muted-foreground mb-6">An overview of the default permissions for each user role.</p>

            <div className="space-y-4">
                {roles.map(role => (
                    <div key={role.id} className="bg-secondary p-4 rounded-lg border border-border">
                        <h3 className="font-bold text-lg text-foreground border-b border-border pb-2 mb-2">{role.name}</h3>
                        <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                           {getPermissionSummary(role.permissions).map((permission, index) => (
                               <li key={index}>{permission}</li>
                           ))}
                        </ul>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default RolePermissionReport;