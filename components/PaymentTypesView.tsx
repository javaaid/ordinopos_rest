

import React from 'react';
import { PaymentType } from '../types';
import UserPlusIcon from './icons/UserPlusIcon';
import PencilSquareIcon from './icons/PencilSquareIcon';
import TrashIcon from './icons/TrashIcon';
import { useDataContext, useModalContext } from '../contexts/AppContext';

const PaymentTypesView: React.FC = () => {
    const { paymentTypes, handleSavePaymentType, handleDeletePaymentType } = useDataContext();
    const { openModal } = useModalContext();

    const onAddNew = () => openModal('paymentTypeEdit', { onSave: handleSavePaymentType });
    const onEdit = (paymentType: PaymentType) => openModal('paymentTypeEdit', { paymentType, onSave: handleSavePaymentType });

    const thClass = "px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider";

    return (
        <div className="p-6 h-full flex flex-col">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-foreground">Manage Payment Types</h2>
                <button
                    onClick={onAddNew}
                    className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-2 px-4 rounded-lg"
                >
                    <UserPlusIcon className="w-5 h-5" />
                    Add Payment Type
                </button>
            </div>
            <div className="overflow-x-auto bg-card rounded-lg flex-grow border border-border">
                <table className="min-w-full divide-y divide-border">
                    <thead className="bg-muted/50 sticky top-0">
                        <tr>
                            <th className={thClass}>Name</th>
                            <th className={thClass}>Status</th>
                            <th className={thClass}>Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-card divide-y divide-border">
                        {paymentTypes.map((pt) => (
                            <tr key={pt.id}>
                                <td className="px-4 py-3 whitespace-nowrap text-foreground font-medium">{pt.name}</td>
                                <td className="px-4 py-3 whitespace-nowrap">
                                    <span className={`px-2 py-1 text-xs font-bold rounded-full ${pt.isEnabled ? 'bg-green-500/20 text-green-300' : 'bg-muted text-muted-foreground'}`}>
                                        {pt.isEnabled ? 'Enabled' : 'Disabled'}
                                    </span>
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap">
                                    <div className="flex gap-4">
                                        <button onClick={() => onEdit(pt)} className="text-primary hover:opacity-80">
                                            <PencilSquareIcon className="w-5 h-5" />
                                        </button>
                                        <button onClick={() => handleDeletePaymentType(pt.id)} className="text-destructive hover:opacity-80">
                                            <TrashIcon className="w-5 h-5" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default PaymentTypesView;