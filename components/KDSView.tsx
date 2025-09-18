
import React, { useState, useEffect, useMemo } from 'react';
import { Order, Table } from '../types';
import OrderTicket from './OrderTicket';
import { Modal, ModalHeader, ModalTitle, ModalContent, ModalFooter } from './ui/Modal';
import { Button } from './ui/Button';
import { ordinoLogoBase64 } from '../assets/logo';
import ChefHatIcon from './icons/ChefHatIcon';

const channel = new BroadcastChannel('ordino_pos_sync');

export const KDSModal: React.FC<{ isOpen: boolean, onClose: () => void }> = ({ isOpen, onClose }) => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [tables, setTables] = useState<Table[]>([]);
    const [currentLocationId, setCurrentLocationId] = useState<string | null>(null);

    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            if (event.data.type === 'STATE_SYNC') {
                const { payload } = event.data;
                setOrders(payload.allOrders || []);
                setTables(payload.allTables || []);
                setCurrentLocationId(payload.currentLocationId);
            }
        };
        channel.addEventListener('message', handleMessage);
        
        // Request initial state when component mounts
        channel.postMessage({ type: 'REQUEST_STATE' });

        // Cleanup listener on unmount
        return () => channel.removeEventListener('message', handleMessage);
    }, []);

    const onCompleteKdsOrder = (orderId: string) => {
        channel.postMessage({ type: 'KDS_ORDER_COMPLETE', payload: { orderId } });
    };

    const onTogglePreparedItem = (orderId: string, cartId: string) => {
        channel.postMessage({ type: 'KDS_ITEM_TOGGLE_PREPARED', payload: { orderId, cartId } });
    };

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
