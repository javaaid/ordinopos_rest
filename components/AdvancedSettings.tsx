
import React from 'react';
import ExclamationTriangleIcon from './icons/ExclamationTriangleIcon';
import BackupRestore from './BackupRestore';
import { ToastNotification } from '../types';
import { useToastContext } from '../contexts/AppContext';

const AdvancedSettings: React.FC = () => {
    const { addToast } = useToastContext();

    const handleSuccess = (message: string) => {
        addToast({ type: 'success', title: 'Success', message });
    };

    const handleError = (message: string) => {
        addToast({ type: 'error', title: 'Error', message });
    };

    return (
        <div className="p-6 h-full flex flex-col">
            <h3 className="text-xl font-bold text-foreground mb-2 flex items-center gap-2">
                <ExclamationTriangleIcon className="w-6 h-6" /> Advanced Settings
            </h3>
            <p className="text-sm text-muted-foreground mb-6">Manage critical system settings for compliance and data integrity.</p>
            <div className="space-y-4">
                <div className="bg-secondary p-4 rounded-lg">
                    <p className="font-bold text-foreground mb-1">Partial Refunds</p>
                    <p className="text-muted-foreground">To refund a specific item, open the order from the Order History, select the item, and initiate a refund. This is useful for when a customer is unhappy with a single dish but not the entire meal. Full order refunds should be approved by a manager.</p>
                </div>
                <div className="bg-secondary p-4 rounded-lg">
                    <p className="font-bold text-foreground mb-1">Order History Archiving</p>
                    <p className="text-muted-foreground">To comply with local tax laws and maintain system performance, order data older than 2 years is automatically archived. Archived data can be accessed from the main data export tool for tax purposes. Contact support for custom archiving rules.</p>
                </div>
                <div className="bg-secondary p-4 rounded-lg">
                    <p className="font-bold text-foreground mb-1">Disaster Recovery</p>
                    <p className="text-muted-foreground">The system automatically backs up all sales and operational data to both a secure cloud server and a local server (if configured) every hour. In case of a system failure, data can be restored from the last successful backup to minimize downtime.</p>
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
