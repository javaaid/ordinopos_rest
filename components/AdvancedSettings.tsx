import React from 'react';
import ExclamationTriangleIcon from './icons/ExclamationTriangleIcon';
import BackupRestore from './BackupRestore';
import { ToastNotification } from '../types';
import { useToastContext, useAppContext } from '../contexts/AppContext';
import { useTranslations } from '../hooks/useTranslations';

const AdvancedSettings: React.FC = () => {
    const { addToast } = useToastContext();
    const { settings } = useAppContext();
    const t = useTranslations(settings.language.staff);

    const handleSuccess = (message: string) => {
        addToast({ type: 'success', title: 'Success', message });
    };

    const handleError = (message: string) => {
        addToast({ type: 'error', title: 'Error', message });
    };

    return (
        <div className="p-6 h-full flex flex-col text-start rtl:text-end">
            <h3 className="text-xl font-bold text-foreground mb-2 flex items-center gap-2 rtl:flex-row-reverse">
                <ExclamationTriangleIcon className="w-6 h-6" /> {t('advanced_title')}
            </h3>
            <p className="text-sm text-muted-foreground mb-6">{t('advanced_description')}</p>
            <div className="space-y-4">
                <div className="bg-secondary p-4 rounded-lg">
                    <p className="font-bold text-foreground mb-1">{t('advanced_partialRefunds_title')}</p>
                    <p className="text-muted-foreground">{t('advanced_partialRefunds_desc')}</p>
                    <p className="text-muted-foreground mt-1">{t('advanced_fullRefund_note')}</p>
                </div>
                <div className="bg-secondary p-4 rounded-lg">
                    <p className="font-bold text-foreground mb-1">{t('advanced_archiving_title')}</p>
                    <p className="text-muted-foreground">{t('advanced_archiving_desc')}</p>
                </div>
                <div className="bg-secondary p-4 rounded-lg">
                    <p className="font-bold text-foreground mb-1">{t('advanced_disasterRecovery_title')}</p>
                    <p className="text-muted-foreground">{t('advanced_disasterRecovery_desc')}</p>
                </div>
                <BackupRestore 
                    onSuccess={handleSuccess}
                    onError={handleError}
                />
            </div>
        </div>
    );
};

export default AdvancedSettings;
