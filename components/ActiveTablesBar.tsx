import React from 'react';
import { Order, Table } from '../types';
import { useDataContext, usePOSContext } from '../contexts/AppContext';

interface ActiveTablesBarProps {
    onSelectTable: (table: Table) => void;
}

const ActiveTablesBar: React.FC<ActiveTablesBarProps> = ({ onSelectTable }) => {
    const { orders, tables } = useDataContext();
    const { handleSelectTab } = usePOSContext();
    
    const activeTables = (tables || []).filter(t => t.status === 'occupied');
    const openTabs = (orders || []).filter(o => o.status === 'partially-paid');

    if (activeTables.length === 0 && openTabs.length === 0) {
        return null;
    }

    return (
        <div className="flex-shrink-0 py-2 space-y-4">
             {openTabs.length > 0 && (
                <div>
                    <h4 className="text-xs font-bold uppercase text-muted-foreground mb-2 px-1">Open Tabs</h4>
                    <div className="flex space-x-3 overflow-x-auto pb-2 scrollbar-hide">
                        {openTabs.map(tab => (
                             <button 
                                key={tab.id}
                                onClick={() => handleSelectTab(tab.id)}
                                className="flex-shrink-0 w-48 bg-card p-3 rounded-xl text-left hover:bg-muted transition-colors border border-border shadow-sm"
                            >
                                <div className="flex justify-between items-center">
                                    <span className="font-bold text-foreground bg-primary/20 text-primary px-2 py-0.5 rounded-md text-sm truncate">{tab.customer?.name || 'Tab'}</span>
                                </div>
                                <div className="mt-2">
                                    <p className="text-foreground text-2xl font-bold mt-1">${tab.total.toFixed(2)}</p>
                                    <p className="text-xs text-muted-foreground">{tab.cart.length} items</p>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
             )}

            {activeTables.length > 0 && (
                 <div>
                    <h4 className="text-xs font-bold uppercase text-muted-foreground mb-2 px-1">Active Tables</h4>
                    <div className="flex space-x-3 overflow-x-auto pb-2 scrollbar-hide">
                        {activeTables.map(table => {
                            const order = (orders || []).find(o => o.tableId === table.id && (o.status === 'kitchen' || o.status === 'served'));
                            const customerName = table.customerName || 'Walk-in';
                            const status = order?.status || 'Ordering';
                            
                            return (
                                <button 
                                    key={table.id}
                                    onClick={() => onSelectTable(table)}
                                    className="flex-shrink-0 w-48 bg-card p-3 rounded-xl text-left hover:bg-muted transition-colors border border-border shadow-sm"
                                >
                                    <div className="flex justify-between items-center">
                                        <span className="font-bold text-destructive-foreground bg-destructive/80 px-2 py-0.5 rounded-md text-sm">{table.name}</span>
                                        <span className="text-muted-foreground text-sm truncate">{customerName}</span>
                                    </div>
                                    <div className="mt-2">
                                        <span className="text-primary capitalize font-semibold text-sm">{status}</span>
                                        <p className="text-foreground text-2xl font-bold mt-1">${order?.total.toFixed(2) ?? '0.00'}</p>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
            <style>{`.scrollbar-hide::-webkit-scrollbar { display: none; } .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }`}</style>
        </div>
    );
};

export default ActiveTablesBar;
