

import React, { useState } from 'react';
import { AccountingSoftware } from '../types';
import ArrowPathRoundedSquareIcon from './icons/ArrowPathRoundedSquareIcon';
import LinkIcon from './icons/LinkIcon';
import { useDataContext, useAppContext } from '../contexts/AppContext';
import { useTranslations } from '../hooks/useTranslations';

const AccountingView: React.FC = () => {
    const { settings } = useAppContext();
    const t = useTranslations(settings.language.staff);
    const { lastAccountingSync, handleSyncAccounting } = useDataContext();
    const [isSyncing, setIsSyncing] = useState(false);

    const software = settings.accountingSoftware;

    const handleSync = async () => {
        setIsSyncing(true);
        await handleSyncAccounting();
        setIsSyncing(false);
    };

    if (software === 'none') {
        return (
            <div className="p-6 h-full flex flex-col items-center justify-center text-center">
                <LinkIcon className="w-16 h-16 text-muted-foreground mb-4" />
                <h3 className="text-2xl font-bold text-foreground rtl:text-right">{t('noAccountingConnected')}</h3>
                <p className="text-muted-foreground mt-2 rtl:text-right">{t('connectAccounting')}</p>
            </div>
        );
    }
    
    return (
        <div className="p-6 h-full flex flex-col">
            <h2 className="text-2xl font-bold text-foreground mb-4 rtl:text-right">Accounting Sync: {software === 'quickbooks' ? 'QuickBooks' : 'Xero'}</h2>
            <div className="bg-secondary p-6 rounded-lg flex flex-col items-center text-center">
                <p className="text-muted-foreground mb-1 rtl:text-right">Last sync status:</p>
                <p className="text-lg font-semibold text-foreground mb-6 rtl:text-right">
                    {lastAccountingSync ? `Successfully synced at ${new Date(lastAccountingSync).toLocaleTimeString()}` : 'Not synced yet.'}
                </p>
                <button
                    onClick={handleSync}
                    disabled={isSyncing}
                    className="flex items-center gap-2 bg-green-700 hover:bg-green-800 text-white font-bold py-3 px-6 rounded-lg transition-colors disabled:bg-muted disabled:cursor-wait"
                >
                    <ArrowPathRoundedSquareIcon className={`w-5 h-5 ${isSyncing ? 'animate-spin' : ''}`} />
                    {isSyncing ? 'Syncing...' : 'Sync Now'}
                </button>
            </div>
        </div>
    );
};

export default AccountingView;