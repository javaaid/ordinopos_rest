import React, { useState, useMemo } from 'react';
import { useDataContext } from '../contexts/AppContext';
import { CallLogEntry, Customer } from '../types';
import PhoneIcon from './icons/PhoneIcon';

const CallLogView: React.FC = () => {
    const { callLog, customers, orders } = useDataContext();
    const [searchTerm, setSearchTerm] = useState('');

    const filteredLog = useMemo(() => {
        return (callLog || []).filter((entry: CallLogEntry) => {
            const customer = entry.customerId ? customers.find((c: Customer) => c.id === entry.customerId) : null;
            const lowerSearch = searchTerm.toLowerCase();
            return (
                entry.phoneNumber.includes(lowerSearch) ||
                (customer && customer.name.toLowerCase().includes(lowerSearch))
            );
        });
    }, [callLog, customers, searchTerm]);
    
    const thClass = "px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider";

    return (
        <div className="p-6 h-full flex flex-col">
            <h2 className="text-2xl font-bold text-foreground mb-2 flex items-center gap-3">
                <PhoneIcon className="w-6 h-6"/> Call Log
            </h2>
            <p className="text-sm text-muted-foreground mb-4">History of all incoming calls detected by the system.</p>
            
            <div className="mb-4">
                <input
                    type="search"
                    placeholder="Search by phone number or customer name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full max-w-sm bg-secondary border border-border rounded-md px-3 py-2 text-foreground focus:ring-primary focus:border-primary"
                />
            </div>

            <div className="flex-grow bg-card rounded-lg overflow-hidden flex flex-col border border-border">
                <div className="overflow-y-auto">
                    <table className="min-w-full divide-y divide-border">
                        <thead className="bg-muted/50 sticky top-0">
                            <tr>
                                <th className={thClass}>Date & Time</th>
                                <th className={thClass}>Phone Number</th>
                                <th className={thClass}>Customer</th>
                                <th className={thClass}>Status</th>
                            </tr>
                        </thead>
                        <tbody className="bg-card divide-y divide-border">
                            {filteredLog.map((entry: CallLogEntry) => {
                                const customer = entry.customerId ? customers.find((c: Customer) => c.id === entry.customerId) : null;
                                const order = entry.orderId ? orders.find((o: any) => o.id === entry.orderId) : null;
                                const status = order ? 'Order Placed' : 'No Order';
                                
                                return (
                                    <tr key={entry.id}>
                                        <td className="px-4 py-3 text-muted-foreground">{new Date(entry.timestamp).toLocaleString()}</td>
                                        <td className="px-4 py-3 font-mono text-foreground">{entry.phoneNumber}</td>
                                        <td className="px-4 py-3 text-muted-foreground">{customer?.name || 'Unknown'}</td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-1 text-xs font-bold rounded-full ${order ? 'bg-green-500/20 text-green-400' : 'bg-muted text-muted-foreground'}`}>
                                                {status}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default CallLogView;