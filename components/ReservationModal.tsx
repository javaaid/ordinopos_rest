
import React, { useState, useEffect } from 'react';
import { Reservation, Customer, Table } from '../types';
import UserPlusIcon from './icons/UserPlusIcon';
import { useAppContext } from '../contexts/AppContext';
import { useTranslations } from '../hooks/useTranslations';

interface ReservationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (reservation: Omit<Reservation, 'locationId'>) => void;
    reservation: Reservation | null;
    customers: Customer[];
    tables: Table[];
    onAddNewCustomer: () => void;
}

const ReservationModal: React.FC<ReservationModalProps> = ({ isOpen, onClose, onSave, reservation, customers, tables, onAddNewCustomer }) => {
    const { justAddedCustomer, onClearJustAddedCustomer, settings } = useAppContext();
    const t = useTranslations(settings.language.staff);
    const [customerId, setCustomerId] = useState('');
    const [partySize, setPartySize] = useState(2);
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [time, setTime] = useState('19:00');
    const [notes, setNotes] = useState('');
    const [customerSearch, setCustomerSearch] = useState('');
    const [tableId, setTableId] = useState('');
    
    useEffect(() => {
        if (reservation) {
            setCustomerId(reservation.customerId);
            setPartySize(reservation.partySize);
            setTableId(reservation.tableId);
            const resDate = new Date(reservation.reservationTime);
            setDate(resDate.toISOString().split('T')[0]);
            setTime(resDate.toTimeString().slice(0, 5));
            setNotes(reservation.notes || '');
            const customer = (customers || []).find(c => c.id === reservation.customerId);
            setCustomerSearch(customer?.name || '');
        } else {
            // Reset for new
            setCustomerId('');
            setPartySize(2);
            setTableId('');
            setDate(new Date().toISOString().split('T')[0]);
            setTime('19:00');
            setNotes('');
            setCustomerSearch('');
        }
    }, [reservation, customers]);
    
    useEffect(() => {
        if (justAddedCustomer) {
            setCustomerId(justAddedCustomer.id);
            setCustomerSearch(justAddedCustomer.name);
            onClearJustAddedCustomer();
        }
    }, [justAddedCustomer, onClearJustAddedCustomer]);

    if (!isOpen) return null;

    const filteredCustomers = customerSearch.length > 1
        ? (customers || []).filter(c => c.name.toLowerCase().includes(customerSearch.toLowerCase()))
        : [];
        
    const handleSelectCustomer = (customer: Customer) => {
        setCustomerId(customer.id);
        setCustomerSearch(customer.name);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!customerId || !tableId) {
            alert("Please select a customer and a table.");
            return;
        }

        const [hours, minutes] = time.split(':').map(Number);
        const reservationTime = new Date(date);
        reservationTime.setHours(hours, minutes, 0, 0);

        onSave({
            id: reservation?.id || `res_${Date.now()}`,
            customerId,
            tableId,
            partySize,
            reservationTime: reservationTime.getTime(),
            status: reservation?.status || 'pending',
            notes,
        });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4">
            <div className="bg-card rounded-lg shadow-xl w-full max-w-lg border border-border">
                <form onSubmit={handleSubmit}>
                    <div className="p-6 border-b border-border">
                        <h2 className="text-2xl font-bold text-foreground">{reservation ? t('editReservation') : t('newReservation')}</h2>
                    </div>
                    <div className="p-6 space-y-4">
                        <div className="relative">
                            <label className="block text-sm font-medium text-muted-foreground mb-1">{t('customers')}</label>
                            <div className="flex gap-2">
                                <input 
                                    type="text"
                                    value={customerSearch}
                                    onChange={e => {
                                        setCustomerSearch(e.target.value);
                                        if(customerId) setCustomerId(''); // Clear selection if user types again
                                    }}
                                    placeholder={t('searchByName')}
                                    className="w-full bg-input p-2 rounded-md border border-border text-foreground"
                                />
                                <button type="button" onClick={onAddNewCustomer} className="p-2 bg-secondary hover:bg-muted rounded-md shrink-0">
                                    <UserPlusIcon className="w-5 h-5 text-foreground" />
                                </button>
                            </div>
                            {filteredCustomers.length > 0 && customerId === '' && (
                                <ul className="absolute z-10 w-full mt-1 bg-popover border border-border rounded-lg shadow-lg max-h-40 overflow-y-auto">
                                    {filteredCustomers.map(c => (
                                        <li key={c.id} onClick={() => handleSelectCustomer(c)} className="p-2 hover:bg-primary/10 cursor-pointer">{c.name}</li>
                                    ))}
                                </ul>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-muted-foreground mb-1">{t('tables')}</label>
                            <select value={tableId} onChange={e => setTableId(e.target.value)} className="w-full bg-input p-2 rounded-md border border-border text-foreground" required>
                                <option value="" disabled>{t('selectAvailableTable')}</option>
                                {/* FIX: Renamed 't' to 'table' to avoid shadowing the translation function. */}
                                {(tables || []).filter(table => table.status === 'available' || (reservation && table.id === reservation.tableId)).map(table => (
                                    <option key={table.id} value={table.id}>{table.name} ({t('capacity')}: {table.capacity})</option>
                                ))}
                            </select>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-muted-foreground mb-1">{t('partySize')}</label>
                                <input type="number" value={partySize} onChange={e => setPartySize(parseInt(e.target.value))} className="w-full bg-input p-2 rounded-md border border-border text-foreground" min="1"/>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-muted-foreground mb-1">{t('date')}</label>
                                <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full bg-input p-2 rounded-md border border-border text-foreground"/>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-muted-foreground mb-1">{t('time')}</label>
                                <input type="time" value={time} onChange={e => setTime(e.target.value)} className="w-full bg-input p-2 rounded-md border border-border text-foreground"/>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-muted-foreground mb-1">{t('notes')} (Optional)</label>
                            <textarea value={notes} onChange={e => setNotes(e.target.value)} className="w-full bg-input p-2 rounded-md h-20 border border-border text-foreground" placeholder="e.g., Anniversary, allergy info..."></textarea>
                        </div>
                    </div>
                    <div className="p-6 border-t border-border flex justify-end items-center space-x-4">
                        <button type="button" onClick={onClose} className="px-6 py-2 rounded-md bg-secondary text-secondary-foreground">{t('cancel')}</button>
                        <button type="submit" className="px-6 py-2 rounded-md bg-primary text-primary-foreground">{t('saveReservation')}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ReservationModal;