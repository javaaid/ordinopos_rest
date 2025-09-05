import React, { useState, useEffect, useCallback } from 'react';
import { Reservation, Customer, ReservationStatus, WaitlistEntry, WaitlistStatus, Table, ReservationSystem } from '../types';
import TableCard from './TableCard';
import ReservationsView from './ReservationsView';
import WaitlistView from './WaitlistView';
import PencilIcon from './icons/PencilIcon';
import PlusIcon from './icons/PlusIcon';
import { useAppContext, useDataContext, usePOSContext } from '../contexts/AppContext';
import { useTranslations } from '../hooks/useTranslations';

type TableViewTab = 'floor' | 'reservations' | 'waitlist';

const TableServicesView: React.FC = () => {
    const { settings, isReservationPluginActive, isWaitlistPluginActive, isQRCodePluginActive, setView, handleTransferTable } = useAppContext();
    const t = useTranslations(settings.language.staff);
    const { 
        tables, floors, reservations, customers, waitlist, 
        onEditTable, onAddFloor, onRenameFloor, onDeleteFloor, 
        onAddReservation, onEditReservation, onUpdateReservationStatus, onSeatReservationParty, 
        onAddToWaitlist, onUpdateWaitlistStatus, onSeatWaitlistParty,
        onSyncReservations, lastReservationSync, onSuggestWaitTime
    } = useDataContext();
    const { setCurrentTable: onSelectTableContext } = usePOSContext();
    const { openModal } = useAppContext();


    const [activeTab, setActiveTab] = useState<TableViewTab>('waitlist');
    const [activeFloor, setActiveFloor] = useState((floors && floors.length > 0) ? floors[0] : 'Main Floor');
    const [isEditMode, setIsEditMode] = useState(false);
    
    const [draggedTableId, setDraggedTableId] = useState<string | null>(null);
    const [dragOverTableId, setDragOverTableId] = useState<string | null>(null);

    const onGenerateQRCode = (table: Table) => {
        openModal('qrCode', { table, baseUrl: settings.qrOrdering.baseUrl });
    };


    useEffect(() => {
        if (floors && floors.length > 0) {
            if (!floors.includes(activeFloor)) {
                setActiveFloor(floors[0]);
            }
        } else if (activeFloor !== 'Main Floor') {
             setActiveFloor('Main Floor');
        }
    }, [floors, activeFloor]);
    
    const tabButtonClass = (tab: TableViewTab) => `py-3 px-4 text-sm font-semibold transition-colors ${activeTab === tab ? 'border-b-2 border-primary text-foreground' : 'text-muted-foreground hover:text-foreground'}`;
    const floorButtonClass = (floor: string) => `py-2 px-4 text-sm font-semibold rounded-lg transition-colors ${activeFloor === floor ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground hover:bg-muted'}`;

    const tablesForFloor = (tables || []).filter((t: Table) => t.floor === activeFloor);

    const handleTableSelect = (table: Table) => {
        if (isEditMode) {
            onEditTable(table);
        } else {
            onSelectTableContext(table);
            setView('pos');
        }
    };

    // Drag and Drop Handlers
    const handleDragStart = useCallback((e: React.DragEvent, table: Table) => {
        setDraggedTableId(table.id);
        e.dataTransfer.setData('text/plain', table.id);
        e.dataTransfer.effectAllowed = 'move';
    }, []);

    const handleDragOver = useCallback((e: React.DragEvent, table: Table) => {
        e.preventDefault();
        if (table.status === 'available' && table.id !== draggedTableId) {
            setDragOverTableId(table.id);
            e.dataTransfer.dropEffect = 'move';
        } else {
             e.dataTransfer.dropEffect = 'none';
        }
    }, [draggedTableId]);

    const handleDragLeave = useCallback(() => {
        setDragOverTableId(null);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent, targetTable: Table) => {
        e.preventDefault();
        const sourceTableId = e.dataTransfer.getData('text/plain');
        if (sourceTableId && sourceTableId !== targetTable.id && targetTable.status === 'available') {
            handleTransferTable(sourceTableId, targetTable.id);
        }
        setDraggedTableId(null);
        setDragOverTableId(null);
    }, [handleTransferTable]);

    const handleDragEnd = useCallback(() => {
        setDraggedTableId(null);
        setDragOverTableId(null);
    }, []);


    const renderFloorPlan = () => (
        <div className="p-6 h-full flex flex-col">
             <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
                <div className="bg-card p-1 rounded-xl flex items-center gap-2 self-start flex-wrap border border-border">
                    {(floors || []).map((floor: string) => <button key={floor} onClick={() => setActiveFloor(floor)} className={floorButtonClass(floor)}>{floor}</button>)}
                </div>
                <div className="flex items-center gap-2">
                     {isEditMode && (
                        <div className="flex items-center gap-2 animate-fade-in-down">
                            <button onClick={onAddFloor} className="bg-green-500/20 text-green-400 hover:bg-green-500/40 text-xs font-semibold py-1 px-2 rounded">{t('addFloor')}</button>
                            <button onClick={() => onRenameFloor(activeFloor)} className="bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/40 text-xs font-semibold py-1 px-2 rounded">{t('rename')}</button>
                            <button onClick={() => onDeleteFloor(activeFloor)} className="bg-red-500/20 text-red-400 hover:bg-red-500/40 text-xs font-semibold py-1 px-2 rounded" disabled={(floors || []).length <= 1}>{t('delete')}</button>
                            <div className="h-4 w-px bg-border mx-2"></div>
                            <button onClick={() => onEditTable(null)} className="flex items-center gap-1 bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-3 rounded-lg text-sm"><PlusIcon className="w-4 h-4" /> {t('addTable')}</button>
                        </div>
                    )}
                    <button 
                        onClick={() => setIsEditMode(prev => !prev)}
                        className={`flex items-center gap-2 font-semibold py-2 px-4 rounded-lg text-sm transition-colors ${ isEditMode ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground hover:bg-muted'}`}>
                        <PencilIcon className="w-4 h-4" />
                        {isEditMode ? t('finishEditing') : t('editFloor')}
                    </button>
                </div>
            </div>
            <div className="flex-grow grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 overflow-y-auto">
                {tablesForFloor.map((table: Table) => (
                    <TableCard 
                        key={table.id} 
                        table={table} 
                        onSelect={handleTableSelect}
                        isEditMode={isEditMode}
                        isQRCodePluginActive={isQRCodePluginActive}
                        onGenerateQRCode={onGenerateQRCode}
                        isDragging={draggedTableId === table.id}
                        isDragOver={dragOverTableId === table.id}
                        onDragStart={(e) => handleDragStart(e, table)}
                        onDragOver={(e) => handleDragOver(e, table)}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, table)}
                        onDragEnd={handleDragEnd}
                    />
                ))}
            </div>
        </div>
    );

    return (
        <div className="h-full flex flex-col rounded-2xl bg-background">
            <div className="flex gap-4 border-b border-border px-6">
                <button onClick={() => setActiveTab('floor')} className={tabButtonClass('floor')}>{t('floorplan')}</button>
                {isReservationPluginActive && <button onClick={() => setActiveTab('reservations')} className={tabButtonClass('reservations')}>{t('reservations')}</button>}
                {isWaitlistPluginActive && <button onClick={() => setActiveTab('waitlist')} className={tabButtonClass('waitlist')}>{t('waitingList')}</button>}
            </div>

            <div className="flex-grow overflow-hidden">
                {activeTab === 'floor' && renderFloorPlan()}
                {activeTab === 'reservations' && isReservationPluginActive && <ReservationsView 
                    reservations={reservations}
                    customers={customers}
                    onAddReservation={onAddReservation}
                    onEditReservation={onEditReservation}
                    onUpdateStatus={onUpdateReservationStatus}
                    onSeatParty={onSeatReservationParty}
                    reservationSystem={settings.reservationSystem}
                    onSync={onSyncReservations}
                    lastSync={lastReservationSync}
                />}
                {activeTab === 'waitlist' && isWaitlistPluginActive && <WaitlistView 
                    waitlist={waitlist}
                    onAddToWaitlist={onAddToWaitlist}
                    onUpdateStatus={onUpdateWaitlistStatus}
                    onSeatParty={onSeatWaitlistParty}
                />}
            </div>
        </div>
    );
};

export default TableServicesView;