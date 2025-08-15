
import React from 'react';
import { Order, Table } from '../types';

interface ActiveTablesBarProps {
    tables: Table[];
    orders: Order[];
    onSelectTable: (table: Table) => void;
}

const ActiveTablesBar: React.FC<ActiveTablesBarProps> = ({ tables, orders, onSelectTable }) => {
    const activeTables = (tables || []).filter(t => t.status === 'occupied');

    return (
        <div className="pt-4 mt-4 border-t border-border">
            <h4 className="text-xs font-bold uppercase text-muted-foreground mb-2 px-1">Active Tables</h4>
            <div className="overflow-x-auto pb-2 scrollbar-hide">
                {activeTables.length === 0 ? (
                    <div className="flex items-center justify-center h-24">
                        <p className="text-muted-foreground">No active tables.</p>
                    </div>
                ) : (
                    <div className="flex space-x-3">
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
                )}
            </div>
             <style>{`.scrollbar-hide::-webkit-scrollbar { display: none; } .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }`}</style>
        </div>
    );
};

export default ActiveTablesBar;