
import React, { useState, useEffect } from 'react';
import { WaitlistEntry, WaitlistStatus } from '../types';
import UserPlusIcon from './icons/UserPlusIcon';

interface WaitlistViewProps {
    waitlist: WaitlistEntry[];
    onAddToWaitlist: () => void;
    onUpdateStatus: (id: string, status: WaitlistStatus) => void;
    onSeatParty: (id: string) => void;
}

const statusStyles: Record<WaitlistStatus, { bg: string, text: string }> = {
    'Waiting': { bg: 'bg-blue-500/20', text: 'text-blue-400' },
    'Notified': { bg: 'bg-yellow-500/20', text: 'text-yellow-400' },
    'Seated': { bg: 'bg-green-500/20', text: 'text-green-400' },
    'Removed': { bg: 'bg-slate-600/50', text: 'text-slate-400' },
};

const CountdownTimer: React.FC<{ notifiedAt: number }> = ({ notifiedAt }) => {
    const [timeLeft, setTimeLeft] = useState('');
    const NOTIFICATION_EXPIRY_MS = 5 * 60 * 1000;

    useEffect(() => {
        const updateTimer = () => {
            const now = Date.now();
            const elapsed = now - notifiedAt;
            const remaining = NOTIFICATION_EXPIRY_MS - elapsed;

            if (remaining <= 0) {
                setTimeLeft('00:00');
                clearInterval(intervalId);
            } else {
                const minutes = Math.floor(remaining / 60000);
                const seconds = Math.floor((remaining % 60000) / 1000);
                setTimeLeft(`${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`);
            }
        };

        const intervalId = setInterval(updateTimer, 1000);
        updateTimer();

        return () => clearInterval(intervalId);
    }, [notifiedAt]);

    return <span className="font-mono text-sm ml-2">({timeLeft})</span>;
};

const WaitlistView: React.FC<WaitlistViewProps> = ({ waitlist, onAddToWaitlist, onUpdateStatus, onSeatParty }) => {

    const thClass = "px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider";
    const activeWaitlist = (waitlist || []).filter(w => w.status === 'Waiting' || w.status === 'Notified');

    return (
        <div className="p-6 h-full flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-foreground">Waitlist</h1>
                <button
                    onClick={onAddToWaitlist}
                    className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-2 px-4 rounded-lg"
                >
                    <UserPlusIcon className="w-5 h-5" />
                    Add to Waitlist
                </button>
            </div>

            <div className="flex-grow bg-card rounded-lg overflow-hidden flex flex-col border border-border">
                <div className="overflow-y-auto">
                    <table className="min-w-full divide-y divide-border">
                        <thead className="bg-muted/50 sticky top-0">
                            <tr>
                                <th className={thClass}>Customer</th>
                                <th className={thClass}>Party Size</th>
                                <th className={thClass}>Quoted Wait</th>
                                <th className={thClass}>Status</th>
                                <th className={thClass}>Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-card divide-y divide-border">
                            {activeWaitlist.map(entry => {
                                const statusStyle = statusStyles[entry.status];
                                return (
                                    <tr key={entry.id} className="hover:bg-muted/50">
                                        <td className="px-4 py-3 text-foreground font-medium">{entry.customerName}</td>
                                        <td className="px-4 py-3 text-muted-foreground">{entry.partySize}</td>
                                        <td className="px-4 py-3 text-muted-foreground">{entry.quotedWaitTime} min</td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-1 text-xs font-bold rounded-full ${statusStyle.bg} ${statusStyle.text}`}>
                                                {entry.status}
                                                {entry.status === 'Notified' && entry.notifiedAt && <CountdownTimer notifiedAt={entry.notifiedAt} />}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                {entry.status === 'Waiting' && (
                                                    <button onClick={() => onUpdateStatus(entry.id, 'Notified')} className="bg-yellow-600 hover:bg-yellow-700 text-white font-semibold text-xs py-1 px-3 rounded-md">Notify</button>
                                                )}
                                                <button onClick={() => onSeatParty(entry.id)} className="bg-green-600 hover:bg-green-700 text-white font-semibold text-xs py-1 px-3 rounded-md">Seat Party</button>
                                                <button onClick={() => onUpdateStatus(entry.id, 'Removed')} className="text-destructive hover:underline text-xs">Remove</button>
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                    {activeWaitlist.length === 0 && (
                        <div className="text-center text-muted-foreground py-20">
                            <p>The waitlist is currently empty.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default WaitlistView;