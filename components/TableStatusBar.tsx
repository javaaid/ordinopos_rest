import React from 'react';
import { Order, Table, Customer } from '../types';
import { useDataContext, usePOSContext } from '../contexts/AppContext';

interface TableStatusBarProps {
    orders: Order[];
    tables: Table[];
    customers: Customer[];
    onSelectTable: (table: Table) => void;
}

const TableStatusBar: React.FC<TableStatusBarProps> = ({ orders, tables, customers, onSelectTable }) => {
    const { handleSelectTab } = usePOSContext();
    
    const activeTables = (tables || []).filter(t => t.status === 'occupied');
    const openTabs = (orders || []).filter(o => o.status === 'partially-paid');

    if (activeTables.length === 0 && openTabs.length === 0) {
        return (
            <div className="text-muted-foreground text-sm text-center py-2 h-24 flex items-center justify-center">No active tables or open tabs.</div>
        );
    }

    return (
        <div className="flex flex-col gap-3">
             {openTabs.length > 0 && (
                <div>
                    <h4 className="text-xs font-bold uppercase text-muted-foreground mb-1 px-1">Open Tabs</h4>
                    <div className="flex space-x-3 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
                        {openTabs.map(tab => {
                             return (
                                <button 
                                    key={tab.id}
                                    onClick={() => handleSelectTab(tab.id)}
                                    className="flex-shrink-0 w-44 bg-card p-3 rounded-lg text-left hover:bg-muted transition-colors border border-border shadow-sm"
                                >
                                    <div className="flex justify-between items-center">
                                        <span className="font-bold text-foreground bg-primary/20 text-primary px-2 py-0.5 rounded-md text-sm">{tab.customer?.name?.split(' ')[0] || 'Tab'}</span>
                                    </div>
                                    <div className="mt-2">
                                        <p className="text-foreground text-xl font-bold mt-1">${tab.total.toFixed(2)}</p>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>
             )}

            {activeTables.length > 0 && (
                 <div>
                    <h4 className="text-xs font-bold uppercase text-muted-foreground mb-1 px-1">Active Tables</h4>
                    <div className="flex space-x-3 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
                        {activeTables.map(table => {
                            const order = (orders || []).find(o => o.tableId === table.id && (o.status === 'kitchen' || o.status === 'served'));
                            const customerType = table.customerName ? table.customerName.split(' ')[0] : 'Walk-in';
                            const status = order?.status || 'Ordering';
                            
                            return (
                                <button 
                                    key={table.id}
                                    onClick={() => onSelectTable(table)}
                                    className="flex-shrink-0 w-44 bg-card p-3 rounded-lg text-left hover:bg-muted transition-colors border border-border shadow-sm"
                                >
                                    <div className="flex justify-between items-center">
                                        <span className="font-bold text-destructive-foreground bg-destructive/80 px-2 py-0.5 rounded-md text-sm">{table.name}</span>
                                        <span className="text-muted-foreground text-sm">{customerType}</span>
                                    </div>
                                    <div className="mt-2">
                                        <span className="text-primary capitalize font-semibold text-sm">{status}</span>
                                        <p className="text-foreground text-xl font-bold mt-1">${order?.total.toFixed(2) ?? '0.00'}</p>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

export default TableStatusBar;