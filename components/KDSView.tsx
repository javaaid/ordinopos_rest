import React, { useMemo } from 'react';
import { Order, Table } from '../types';
import OrderTicket from './OrderTicket';
import { useAppContext } from '../contexts/AppContext';
import { Modal, ModalHeader, ModalTitle, ModalContent, ModalFooter } from './ui/Modal';
import { Button } from './ui/Button';
import { ordinoLogoBase64 } from '../assets/logo';
import ChefHatIcon from './icons/ChefHatIcon';

export const KDSModal: React.FC<{ isOpen: boolean, onClose: () => void }> = ({ isOpen, onClose }) => {
    const { orders, tables, currentLocationId, onCompleteKdsOrder, onTogglePreparedItem } = useAppContext();

    const pendingOrders = useMemo(() => {
        return (orders || []).filter((o: Order) => o && o.status === 'kitchen' && o.locationId === currentLocationId);
    }, [orders, currentLocationId]);

    return (
        <Modal isOpen={isOpen} onClose={onClose} className="max-w-full h-full !rounded-none">
            <div className="p-4 sm:p-6 h-full flex flex-col bg-background relative">
                <header className="flex justify-between items-center mb-4 bg-card p-4 rounded-xl shadow-md border border-border">
                    <div className="flex items-center gap-4">
                        <img src={ordinoLogoBase64} alt="Logo" className="h-8 w-auto" />
                        <div>
                            <h1 className="text-2xl font-bold text-foreground">Kitchen Display System</h1>
                            <p className="text-sm text-muted-foreground">Fast • Reliable • Smart POS</p>
                        </div>
                    </div>
                </header>

                {pendingOrders.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 flex-grow overflow-y-auto">
                        {pendingOrders.map(order => {
                            const table = order.tableId ? (tables || []).find((t: Table) => t.id === order.tableId) : undefined;
                            return (
                                <OrderTicket
                                    key={order.id}
                                    order={order}
                                    onCompleteOrder={onCompleteKdsOrder}
                                    tableName={table?.name}
                                    onTogglePrepared={onTogglePreparedItem}
                                />
                            );
                        })}
                    </div>
                ) : (
                    <div className="flex-grow flex justify-center items-center">
                        <div className="text-center text-muted-foreground">
                            <ChefHatIcon className="mx-auto h-24 w-24 mb-4 text-muted-foreground/50" />
                            <h2 className="text-2xl font-semibold text-foreground">All Caught Up!</h2>
                            <p className="mt-2">No pending orders in the kitchen.</p>
                        </div>
                    </div>
                )}
                 <div className="pt-4 mt-4 border-t border-border">
                    <Button onClick={onClose} size="lg" className="w-full">Close</Button>
                </div>
            </div>
        </Modal>
    );
};