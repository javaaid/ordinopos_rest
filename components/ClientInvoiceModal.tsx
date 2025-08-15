
import React from 'react';
import { Order, Customer } from '../types';
import PrinterIcon from './icons/PrinterIcon';

interface ClientInvoiceModalProps {
    isOpen: boolean;
    onClose: () => void;
    customer: Customer;
    orders: Order[];
    onPrint: () => void;
}

const ClientInvoiceModal: React.FC<ClientInvoiceModalProps> = ({ isOpen, onClose, customer, orders, onPrint }) => {
    if (!isOpen) return null;

    const totalDue = orders.reduce((sum, order) => sum + order.balanceDue, 0);

    return (
        <div className="fixed inset-0 bg-background/70 flex justify-center items-center z-50 p-4 no-print">
            <div className="bg-card rounded-lg shadow-xl w-full max-w-2xl flex flex-col max-h-[90vh] border border-border">
                <div className="p-6 border-b border-border">
                    <h2 className="text-2xl font-bold text-foreground">Client Invoice</h2>
                    <p className="text-muted-foreground">For: {customer.name}</p>
                </div>
                
                <div className="p-6 overflow-y-auto">
                    <div className="bg-secondary rounded-lg border border-border">
                        <table className="min-w-full">
                             <thead className="border-b border-border">
                                <tr>
                                    <th className="p-3 text-left text-xs font-semibold text-muted-foreground uppercase">Date</th>
                                    <th className="p-3 text-left text-xs font-semibold text-muted-foreground uppercase">Order ID</th>
                                    <th className="p-3 text-left text-xs font-semibold text-muted-foreground uppercase">Late Fee</th>
                                    <th className="p-3 text-right text-xs font-semibold text-muted-foreground uppercase">Amount Due</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {orders.map(order => (
                                    <tr key={order.id}>
                                        <td className="p-3 text-sm text-muted-foreground">{new Date(order.createdAt).toLocaleDateString()}</td>
                                        <td className="p-3 text-sm font-mono text-foreground">#{order.id.slice(-6)}</td>
                                        <td className={`p-3 text-sm font-mono ${order.lateFee ? 'text-destructive' : 'text-muted-foreground'}`}>{order.lateFee ? `$${order.lateFee.toFixed(2)}` : '-'}</td>
                                        <td className="p-3 text-sm font-mono text-right text-foreground">${order.balanceDue.toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="p-6 border-t border-border mt-auto flex justify-between items-center">
                    <div>
                        <span className="text-muted-foreground">Total Due:</span>
                        <p className="text-3xl font-bold text-primary">${totalDue.toFixed(2)}</p>
                    </div>
                    <div className="flex gap-4">
                        <button onClick={onClose} className="px-6 py-2 rounded-md bg-secondary text-secondary-foreground font-semibold hover:bg-muted">Close</button>
                        <button onClick={onPrint} className="flex items-center gap-2 px-6 py-2 rounded-md bg-primary text-primary-foreground font-semibold hover:bg-primary/90">
                            <PrinterIcon className="w-5 h-5"/> Print
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ClientInvoiceModal;
