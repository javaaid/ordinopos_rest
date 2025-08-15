import React, { useState, useEffect } from 'react';
import { Table } from '../types';
import ClockIcon from './icons/ClockIcon';
import UsersIcon from './icons/UsersIcon';
import QrCodeIcon from './icons/QrCodeIcon';

interface TableCardProps {
    table: Table;
    onSelect: (table: Table) => void;
    isEditMode: boolean;
    isQRCodePluginActive: boolean;
    onGenerateQRCode: (table: Table) => void;
}

const formatTimeElapsed = (startTime?: number): string => {
    if (!startTime) return '00:00';
    const now = Date.now();
    const diff = now - startTime;
    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
};

const TableCard: React.FC<TableCardProps> = ({ table, onSelect, isEditMode, isQRCodePluginActive, onGenerateQRCode }) => {
    const [timeElapsed, setTimeElapsed] = useState(() => formatTimeElapsed(table.occupiedSince));

    useEffect(() => {
        if (table.status === 'occupied' && table.occupiedSince) {
            const timerId = setInterval(() => {
                setTimeElapsed(formatTimeElapsed(table.occupiedSince));
            }, 60000); // Update every minute
            return () => clearInterval(timerId);
        }
    }, [table.status, table.occupiedSince]);

    const statusClasses = {
        available: {
            bg: 'bg-green-500/10 hover:bg-green-500/20',
            border: 'border-green-500/30',
            text: 'text-green-600 dark:text-green-500',
        },
        occupied: {
            bg: 'bg-destructive/10 hover:bg-destructive/20',
            border: 'border-destructive/50',
            text: 'text-destructive',
        },
        reserved: {
            bg: 'bg-primary/10 hover:bg-primary/20',
            border: 'border-primary/50',
            text: 'text-primary',
        },
    };

    const styles = statusClasses[table.status];

    const handleSelect = (e: React.MouseEvent) => {
        e.stopPropagation();
        onSelect(table);
    };
    
    const handleGenerateQR = (e: React.MouseEvent) => {
        e.stopPropagation();
        onGenerateQRCode(table);
    };

    return (
        <button
            onClick={handleSelect}
            className={`p-3 rounded-3xl flex flex-col justify-between h-28 border transition-all duration-200 shadow-md relative ${styles.bg} ${styles.border} ${isEditMode ? 'animate-pulse' : ''}`}
        >
            <div className="flex justify-between items-start">
                <span className="font-bold text-lg text-foreground">{table.name}</span>
                <div className="flex items-center gap-1 text-muted-foreground">
                    <UsersIcon className="w-4 h-4"/>
                    <span className="text-sm font-semibold">{table.capacity}</span>
                </div>
            </div>
            {table.customerName && <p className="text-sm font-semibold text-foreground text-left truncate">{table.customerName}</p>}
            <div className="flex justify-between items-end">
                <span className={`text-sm font-semibold capitalize ${styles.text}`}>{table.status}</span>
                {table.status === 'occupied' && (
                    <div className="flex items-center gap-1 text-muted-foreground">
                         <ClockIcon className="w-4 h-4"/>
                        <span className="text-sm font-mono">{timeElapsed}</span>
                    </div>
                )}
                 {table.status === 'reserved' && table.reservationTime && (
                     <div className="flex items-center gap-1 text-muted-foreground">
                        <ClockIcon className="w-4 h-4"/>
                        <span className="text-sm font-semibold">{new Date(table.reservationTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                )}
            </div>
            {isQRCodePluginActive && isEditMode && (
                <button onClick={handleGenerateQR} className="absolute -top-2 -right-2 p-1.5 bg-card border border-border rounded-full text-muted-foreground hover:bg-primary hover:text-primary-foreground shadow-lg">
                    <QrCodeIcon className="w-5 h-5" />
                </button>
            )}
        </button>
    );
};

export default TableCard;