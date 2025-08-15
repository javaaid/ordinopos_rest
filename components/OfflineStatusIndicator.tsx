
import React from 'react';
import WifiIcon from './icons/WifiIcon';
import WifiSlashIcon from './icons/WifiSlashIcon';
import CloudArrowUpIcon from './icons/CloudArrowUpIcon';

interface OfflineStatusIndicatorProps {
    isOffline: boolean;
    isSyncing: boolean;
    queueLength: number;
}

const OfflineStatusIndicator: React.FC<OfflineStatusIndicatorProps> = ({ isOffline, isSyncing, queueLength }) => {
    if (isSyncing) {
        return (
            <div className="flex items-center gap-2 text-sm font-semibold text-blue-300 bg-blue-500/20 px-3 py-1 rounded-full">
                <CloudArrowUpIcon className="w-5 h-5 animate-pulse" />
                Syncing...
            </div>
        );
    }

    if (isOffline) {
        return (
            <div className="flex items-center gap-2 text-sm font-semibold text-red-300 bg-red-500/20 px-3 py-1 rounded-full">
                <WifiSlashIcon className="w-5 h-5" />
                Offline ({queueLength})
            </div>
        );
    }

    return (
        <div className="flex items-center gap-2 text-sm font-semibold text-green-300">
            <WifiIcon className="w-5 h-5" />
            Connected
        </div>
    );
};

export default OfflineStatusIndicator;
