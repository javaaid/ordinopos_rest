import React, { useMemo } from 'react';
import { AuditLogEntry } from '../types';
import ClipboardDocumentCheckIcon from './icons/ClipboardDocumentCheckIcon';
import { useDataContext, useAppContext } from '../contexts/AppContext';
import { useTranslations } from '../hooks/useTranslations';

const UserActivityReport: React.FC = () => {
    const { auditLog, settings } = useDataContext();
    const t = useTranslations(settings.language.staff);

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
        <div className="w-full max-w-2xl mx-auto text-start rtl:text-end">
            <h2 className="text-2xl font-bold text-foreground mb-2 flex items-center gap-3 rtl:flex-row-reverse">
                <ClipboardDocumentCheckIcon className="w-8 h-8"/>
                {t('activity_title')}
            </h2>
            <p className="text-sm text-muted-foreground mb-6">{t('activity_description')}</p>
            
            <div className="bg-secondary/50 p-6 rounded-lg divide-y divide-border">
                <div className={statItemClass}>
                    <span className={statLabelClass}>{t('activity_newUsers')}</span>
                    <span className={statValueClass}>{reportStats.newUsers}</span>
                </div>
                <div className={statItemClass}>
                    <span className={statLabelClass}>{t('activity_editedUsers')}</span>
                    <span className={statValueClass}>{reportStats.editedUsers}</span>
                </div>
                <div className={statItemClass}>
                    <span className={statLabelClass}>{t('activity_editedRoles')}</span>
                    <span className={statValueClass}>{reportStats.editedRoles}</span>
                </div>
                 <div className={statItemClass}>
                    <span className={statLabelClass}>{t('activity_failedLogins')}</span>
                    <span className={`${statValueClass} text-muted-foreground`}>0 <em className="text-xs not-italic">{t('activity_notTracked')}</em></span>
                </div>
            </div>

            <div className="mt-8">
                <h3 className="text-lg font-semibold text-foreground mb-4">{t('activity_recentActivity')}</h3>
                <div className="space-y-2 text-sm">
                    {(auditLog || []).slice(0, 10).map(log => (
                        <div key={log.id} className="bg-secondary/30 p-3 rounded-md flex justify-between items-center">
                            <div>
                                <p className="font-semibold text-foreground">{log.action === "Logged in" ? t('loggedInByAdmin') : log.action}</p>
                                <p className="text-xs text-muted-foreground">{t('activity_by')} {log.employeeName}</p>
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
