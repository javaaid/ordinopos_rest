import React from 'react';
import { PurchaseOrder, Supplier } from '../types';
import ClipboardDocumentListIcon from './icons/ClipboardDocumentListIcon';
import { useDataContext, useModalContext } from '../contexts/AppContext';

const statusStyles: Record<PurchaseOrder['status'], { text: string, bg: string, text_color: string }> = {
    'draft': { text: 'Draft', bg: 'bg-muted', text_color: 'text-muted-foreground' },
    'sent': { text: 'Sent', bg: 'bg-primary/20', text_color: 'text-primary' },
    'fulfilled': { text: 'Fulfilled', bg: 'bg-green-500/20', text_color: 'text-green-500' },
};

const PurchaseOrdersView: React.FC = () => {
    const { purchaseOrders, suppliers, handleSavePurchaseOrder } = useDataContext();
    const { openModal } = useModalContext();

    const onAddNew = () => openModal('purchaseOrder', { onSave: handleSavePurchaseOrder });
    const onView = (po: PurchaseOrder) => openModal('purchaseOrder', { po, onSave: handleSavePurchaseOrder });
    
    const thClass = "px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider";

    return (
        <div className="p-6 h-full flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-foreground flex items-center gap-3">
                    Purchase Orders
                </h2>
                <button 
                    onClick={onAddNew}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-2 px-4 rounded-lg transition-colors"
                >
                    Create PO
                </button>
            </div>

            <div className="flex-grow bg-card rounded-lg overflow-hidden flex flex-col border border-border">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-border">
                        <thead className="bg-muted/50 sticky top-0">
                            <tr>
                                <th className={thClass}>PO Number</th>
                                <th className={thClass}>Date Created</th>
                                <th className={thClass}>Supplier</th>
                                <th className={thClass}>Total Cost</th>
                                <th className={thClass}>Status</th>
                                <th className={thClass}>Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-card divide-y divide-border">
                            {purchaseOrders.map((po: PurchaseOrder) => {
                                const supplier = (suppliers || []).find((s: Supplier) => s.id === po.supplierId);
                                const statusStyle = statusStyles[po.status];
                                return (
                                    <tr key={po.id} className="hover:bg-muted/50">
                                        <td className="px-4 py-3 font-mono text-foreground">#{po.id.slice(-6)}</td>
                                        <td className="px-4 py-3 text-muted-foreground">{new Date(po.createdAt).toLocaleDateString()}</td>
                                        <td className="px-4 py-3 text-muted-foreground">{supplier?.name || 'N/A'}</td>
                                        <td className="px-4 py-3 font-semibold text-primary">${po.totalCost.toFixed(2)}</td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-1 text-xs font-bold rounded-full ${statusStyle.bg} ${statusStyle.text_color}`}>
                                                {statusStyle.text}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <button onClick={() => onView(po)} className="text-primary hover:underline text-sm">
                                                View/Edit
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                    {purchaseOrders.length === 0 && (
                        <div className="text-center text-muted-foreground py-20">
                            <p>No purchase orders found.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PurchaseOrdersView;