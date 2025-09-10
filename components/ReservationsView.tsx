import React, { useState, useMemo } from 'react';
import { Reservation, Customer, ReservationStatus, ReservationSystem } from '../types';
import CalendarUserIcon from './icons/CalendarUserIcon';
import UserPlusIcon from './icons/UserPlusIcon';
import ArrowPathRoundedSquareIcon from './icons/ArrowPathRoundedSquareIcon';
import { useTranslations } from '../hooks/useTranslations';
import { useAppContext } from '../contexts/AppContext';

interface ReservationsViewProps {
    reservations: Reservation[];
    customers: Customer[];
    onAddReservation: () => void;
    onEditReservation: (reservation: Reservation) => void;
    onUpdateStatus: (reservationId: string, status: ReservationStatus) => void;
    onSeatParty: (reservation: Reservation) => void;
    reservationSystem: ReservationSystem;
    onSync: () => Promise<void>;
    lastSync: number | null;
}

const statusStyles: Record<ReservationStatus, { text: string, bg: string, text_color: string }> = {
    'pending': { text: 'Pending', bg: 'bg-blue-500/20', text_color: 'text-blue-400' },
    'seated': { text: 'Seated', bg: 'bg-green-500/20', text_color: 'text-green-400' },
    'cancelled': { text: 'Cancelled', bg: 'bg-slate-600/50', text_color: 'text-slate-400' },
    'no-show': { text: 'No-Show', bg: 'bg-red-500/20', text_color: 'text-red-400' },
};

const ReservationsView: React.FC<ReservationsViewProps> = ({ reservations, customers, onAddReservation, onEditReservation, onUpdateStatus, onSeatParty, reservationSystem, onSync, lastSync }) => {
    const { settings } = useAppContext();
    const t = useTranslations(settings.language.staff);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [isSyncing, setIsSyncing] = useState(false);

    const handleSync = async () => {
        setIsSyncing(true);
        await onSync();
        setIsSyncing(false);
    };

    const filteredReservations = useMemo(() => {
        const startOfDay = new Date(selectedDate);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(selectedDate);
        endOfDay.setHours(23, 59, 59, 999);
        
        return (reservations || [])
            .filter(r => r.reservationTime >= startOfDay.getTime() && r.reservationTime <= endOfDay.getTime())
            .sort((a, b) => a.reservationTime - b.reservationTime);
    }, [reservations, selectedDate]);
    
    const thClass = "px-4 py-3 text-start text-xs font-semibold text-muted-foreground uppercase tracking-wider";

    return (
        <div className="p-6 h-full flex flex-col">
            <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
                 <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                    <CalendarUserIcon className="w-8 h-8"/>
                    {t('reservations')}
                </h1>
                <div className="flex items-center gap-4">
                    {reservationSystem !== 'none' && (
                        <div className="flex items-center gap-2">
                             <p className="text-xs text-muted-foreground">
                                {lastSync ? `${t('lastSynced')}: ${new Date(lastSync).toLocaleTimeString()}` : t('notSynced')}
                             </p>
                             <button
                                onClick={handleSync}
                                disabled={isSyncing}
                                className="flex items-center gap-2 bg-secondary hover:bg-muted text-secondary-foreground font-bold py-2 px-3 rounded-lg text-sm disabled:cursor-wait"
                             >
                                <ArrowPathRoundedSquareIcon className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                                {isSyncing ? 'Syncing...' : t('syncNow')}
                             </button>
                        </div>
                    )}
                    <input 
                        type="date"
                        value={selectedDate}
                        onChange={e => setSelectedDate(e.target.value)}
                        className="bg-card border border-border rounded-md px-3 py-2 text-foreground font-semibold"
                    />
                    <button
                        onClick={onAddReservation}
                        className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-2 px-4 rounded-lg"
                    >
                        <UserPlusIcon className="w-5 h-5" />
                        {t('newReservation')}
                    </button>
                </div>
            </div>
            
            {reservationSystem === 'none' && (
                <div className="bg-yellow-500/10 text-yellow-400 p-3 rounded-lg text-sm mb-4 border border-yellow-500/20">
                    Connect to OpenTable or Google Reservations in <b>Settings &gt; Integrations</b> to automatically sync bookings.
                </div>
            )}

            <div className="flex-grow bg-card rounded-lg overflow-hidden flex flex-col border border-border">
                <div className="overflow-y-auto">
                    <table className="min-w-full divide-y divide-border">
                        <thead className="bg-muted/50 sticky top-0">
                            <tr>
                                <th className={thClass}>{t('time')}</th>
                                <th className={thClass}>{t('customers')}</th>
                                <th className={thClass}>{t('partySize')}</th>
                                <th className={thClass}>{t('status')}</th>
                                <th className={thClass}>{t('notes')}</th>
                                <th className={thClass}>{t('actions')}</th>
                            </tr>
                        </thead>
                         <tbody className="bg-card divide-y divide-border">
                           {filteredReservations.map(res => {
                               const customer = (customers || []).find(c => c.id === res.customerId);
                               const statusStyle = statusStyles[res.status];
                               const isPast = res.reservationTime < Date.now() && res.status === 'pending';
                               return (
                                   <tr key={res.id} className={`hover:bg-muted/50 ${isPast ? 'opacity-60' : ''}`}>
                                       <td className="px-4 py-3 font-semibold text-foreground">{new Date(res.reservationTime).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}</td>
                                       <td className="px-4 py-3 text-muted-foreground">{customer?.name || 'Unknown'}</td>
                                       <td className="px-4 py-3 text-muted-foreground">{res.partySize}</td>
                                       <td className="px-4 py-3">
                                           <span className={`px-2 py-1 text-xs font-bold rounded-full ${statusStyle.bg} ${statusStyle.text_color}`}>
                                               {statusStyle.text}
                                           </span>
                                       </td>
                                       <td className="px-4 py-3 text-xs text-muted-foreground max-w-xs truncate">{res.notes}</td>
                                       <td className="px-4 py-3">
                                            {res.status === 'pending' && (
                                                <div className="flex items-center gap-2">
                                                    <button onClick={() => onSeatParty(res)} className="bg-green-600 hover:bg-green-700 text-white font-semibold text-xs py-1 px-3 rounded-md">{t('seatParty')}</button>
                                                    <button onClick={() => onEditReservation(res)} className="text-primary hover:underline text-xs">{t('edit')}</button>
                                                    <button onClick={() => onUpdateStatus(res.id, 'cancelled')} className="text-muted-foreground hover:underline text-xs">{t('cancel')}</button>
                                                    <button onClick={() => onUpdateStatus(res.id, 'no-show')} className="text-destructive hover:underline text-xs">{t('noShow')}</button>
                                                </div>
                                            )}
                                       </td>
                                   </tr>
                               );
                           })}
                        </tbody>
                    </table>
                    {filteredReservations.length === 0 && (
                        <div className="text-center text-muted-foreground py-20">
                            <p>{t('noReservationsForDate').replace('{date}', new Date(selectedDate).toLocaleDateString())}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ReservationsView;