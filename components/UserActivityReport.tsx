
import React, { useMemo } from 'react';
import { AuditLogEntry } from '../types';
import ClipboardDocumentCheckIcon from './icons/ClipboardDocumentCheckIcon';
import { useDataContext } from '../contexts/AppContext';

const UserActivityReport: React.FC = () => {
    const { auditLog } = useDataContext();

    const reportStats = useMemo(() => {
        const safeAuditLog = auditLog || [];
        const newUsers = safeAuditLog.filter(l => l.action.startsWith('Created new user')).length;
        const editedUsers = safeAuditLog.filter(l => l.action.startsWith('Edited user')).length;
        const editedRoles = safeAuditLog.filter(l => l.action.startsWith('Updated permissions for role')).length;
        
        return { newUsers, editedUsers, editedRoles };
    }, [auditLog]);

    const statItemClass = "flex items-center justify-between py-4";
    const statLabelClass = "text-md text-muted-foreground";
    const statValueClass = "text-xl font-bold text-foreground";

    return (
        <div className="w-full max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-foreground mb-2 flex items-center gap-3">
                <ClipboardDocumentCheckIcon className="w-8 h-8"/>
                User Management Log
            </h2>
            <p className="text-sm text-muted-foreground mb-6">A summary of administrative actions related to users and roles.</p>
            
            <div className="bg-secondary/50 p-6 rounded-lg divide-y divide-border">
                <div className={statItemClass}>
                    <span className={statLabelClass}>New Users Created</span>
                    <span className={statValueClass}>{reportStats.newUsers}</span>
                </div>
                <div className={statItemClass}>
                    <span className={statLabelClass}>User Profiles Edited</span>
                    <span className={statValueClass}>{reportStats.editedUsers}</span>
                </div>
                <div className={statItemClass}>
                    <span className={statLabelClass}>Role Permissions Updated</span>
                    <span className={statValueClass}>{reportStats.editedRoles}</span>
                </div>
                 <div className={statItemClass}>
                    <span className={statLabelClass}>Failed Logins</span>
                    <span className={statValueClass + " text-muted-foreground"}>0 <em className="text-xs not-italic">(Not tracked)</em></span>
                </div>
            </div>

            <div className="mt-8">
                <h3 className="text-lg font-semibold text-foreground mb-4">Recent Activity</h3>
                <div className="space-y-2 text-sm">
                    {(auditLog || []).slice(0, 10).map(log => (
                        <div key={log.id} className="bg-secondary/30 p-3 rounded-md flex justify-between items-center">
                            <div>
                                <p className="font-semibold text-foreground">{log.action}</p>
                                <p className="text-xs text-muted-foreground">by {log.employeeName}</p>
                            </div>
                            <p className="text-xs text-muted-foreground">{new Date(log.timestamp).toLocaleString()}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default UserActivityReport;
