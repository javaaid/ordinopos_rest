
import React, { useState, useEffect } from 'react';
import { Table } from '../types';
import ClockIcon from './icons/ClockIcon';
import UsersIcon from './icons/UsersIcon';
import QrCodeIcon from './icons/QrCodeIcon';
import { cn } from '../lib/utils';
import { useAppContext } from '../contexts/AppContext';
import { useTranslations } from '../hooks/useTranslations';

interface TableCardProps {
    table: Table;
    onSelect: (table: Table) => void;
    isEditMode: boolean;
    isQRCodePluginActive: boolean;
    onGenerateQRCode: (table: Table) => void;
    isDragging: boolean;
    isDragOver: boolean;
    onDragStart: (e: React.DragEvent) => void;
    onDragOver: (e: React.DragEvent) => void;
    onDragLeave: (e: React.DragEvent) => void;
    onDrop: (e: React.DragEvent) => void;
    onDragEnd: (e: React.DragEvent) => void;
}

const formatTimeElapsed = (startTime?: number): string => {
    if (!startTime) return '00:00';
    const now = Date.now();
    const diff = now - startTime;
    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
};

const TableCard: React.FC<TableCardProps> = ({ table, onSelect, isEditMode, isQRCodePluginActive, onGenerateQRCode, isDragging, isDragOver, onDragStart, onDragOver, onDragLeave, onDrop, onDragEnd }) => {
    const { settings } = useAppContext();
    const t = useTranslations(settings.language.staff);
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
            bg: 'bg-green-100 dark:bg-green-900/30 hover:bg-green-200/80 dark:hover:bg-green-900/50',
            border: 'border-green-400 dark:border-green-700',
            text: 'text-green-700 dark:text-green-300',
            headerBg: 'bg-green-200 dark:bg-green-800/50',
            headerText: 'text-green-800 dark:text-green-200',
        },
        occupied: {
            bg: 'bg-red-100 dark:bg-red-900/30 hover:bg-red-200/80 dark:hover:bg-red-900/50',
            border: 'border-red-400 dark:border-red-700',
            text: 'text-red-700 dark:text-red-300',
            headerBg: 'bg-red-200 dark:bg-red-800/50',
            headerText: 'text-red-800 dark:text-red-200',
        },
        reserved: {
            bg: 'bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200/80 dark:hover:bg-blue-900/50',
            border: 'border-blue-400 dark:border-blue-700',
            text: 'text-blue-700 dark:text-blue-300',
            headerBg: 'bg-blue-200 dark:bg-blue-800/50',
            headerText: 'text-blue-800 dark:text-blue-200',
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
    
    const isDraggable = table.status === 'occupied' && !isEditMode;
    const isDroppable = table.status === 'available' && !isEditMode;

    return (
        <button
            onClick={handleSelect}
            draggable={isDraggable}
            onDragStart={isDraggable ? onDragStart : undefined}
            onDragOver={isDroppable ? onDragOver : undefined}
            onDragLeave={isDroppable ? onDragLeave : undefined}
            onDrop={isDroppable ? onDrop : undefined}
            onDragEnd={isDraggable ? onDragEnd : undefined}
            className={cn(
                'rounded-2xl flex flex-col h-32 border-2 transition-all duration-200 shadow-md relative focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary',
                styles.bg,
                styles.border,
                isEditMode ? 'animate-pulse cursor-pointer' : (isDraggable ? 'cursor-grab' : 'cursor-pointer'),
                isDragging && 'opacity-30',
                isDragOver && 'ring-4 ring-primary ring-offset-2'
            )}
        >
            <div className={cn('flex justify-between items-center p-2 rounded-t-xl', styles.headerBg)}>
                <span className={cn('font-bold text-lg', styles.headerText)}>{table.name}</span>
                <div className={cn('flex items-center gap-1 text-sm font-semibold', styles.headerText)}>
                    <UsersIcon className="w-4 h-4"/>
                    <span>{table.capacity}</span>
                </div>
            </div>
            <div className="flex-grow flex flex-col justify-center items-center p-2 text-center">
                {table.status === 'occupied' && (
                    <>
                        <p className="text-sm font-semibold text-foreground truncate w-full">{table.customerName}</p>
                        <div className="flex items-center gap-1 text-muted-foreground mt-1">
                            <ClockIcon className="w-4 h-4"/>
                            <span className="text-sm font-mono">{timeElapsed}</span>
                        </div>
                    </>
                )}
                {table.status === 'reserved' && (
                    <>
                        <p className="text-sm font-semibold text-foreground truncate w-full">{table.customerName || 'Reserved'}</p>
                        <div className="flex items-center gap-1 text-muted-foreground mt-1">
                            <ClockIcon className="w-4 h-4"/>
                            <span className="text-sm font-semibold">{table.reservationTime ? new Date(table.reservationTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</span>
                        </div>
                    </>
                )}
                {table.status === 'available' && (
                    <p className={cn('text-lg font-bold', styles.text)}>{t('available')}</p>
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
