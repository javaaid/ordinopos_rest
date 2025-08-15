import React, { useState, useEffect, useRef } from 'react';
import { Order, Table, AppSettings } from '../types';
import OrderTicket from './OrderTicket';
import InformationCircleIcon from './icons/InformationCircleIcon';
import ChevronDownIcon from './icons/ChevronDownIcon';
import { hexToHsl } from '../lib/utils';
import ArrowsPointingOutIcon from './icons/ArrowsPointingOutIcon';
import ArrowsPointingInIcon from './icons/ArrowsPointingInIcon';
import { useAppContext } from '../contexts/AppContext';

const KDSView: React.FC = () => {
    const { isFullscreen, onToggleFullScreen } = useAppContext();
    const [isTipsOpen, setIsTipsOpen] = useState(false);
    const [orders, setOrders] = useState<Order[]>([]);
    const [tables, setTables] = useState<Table[]>([]);
    const [settings, setSettings] = useState<AppSettings | null>(null);
    const [currentLocationId, setCurrentLocationId] = useState<string | null>(null);
    const channelRef = useRef<BroadcastChannel | null>(null);

    useEffect(() => {
        const channel = new BroadcastChannel('ordino_pos_sync');
        channelRef.current = channel;

        const handleMessage = (event: MessageEvent) => {
            try {
                const { type, payload } = event.data;
                if (type === 'STATE_SYNC') {
                    if (payload.allOrders && Array.isArray(payload.allOrders)) setOrders(payload.allOrders);
                    if (payload.allTables && Array.isArray(payload.allTables)) setTables(payload.allTables);
                    if (payload.allSettings) setSettings(payload.allSettings);
                    if (payload.currentLocationId) setCurrentLocationId(payload.currentLocationId);
                } else if (type === 'ORDERS_UPDATE') {
                    if (payload && Array.isArray(payload)) {
                        setOrders(payload);
                    }
                } else if (type === 'SETTINGS_UPDATE') {
                    if (payload) setSettings(payload);
                }
            } catch (e) {
                console.error("KDS failed to handle message", e);
            }
        };

        channel.addEventListener('message', handleMessage);
        channel.postMessage({ type: 'REQUEST_STATE' });

        return () => {
            channel.removeEventListener('message', handleMessage);
            channel.close();
        };
    }, []);

    const onCompleteOrder = (orderId: string) => {
        channelRef.current?.postMessage({ type: 'COMPLETE_KDS_ORDER', payload: { orderId } });
    };

    const onTogglePrepared = (orderId: string, cartId: string) => {
        channelRef.current?.postMessage({ type: 'TOGGLE_PREPARED_ITEM', payload: { orderId, cartId } });
    };

    const pendingOrders = (orders || []).filter(o => o && o.status === 'kitchen' && (!currentLocationId || o.locationId === currentLocationId));

    return (
        <div className="p-4 sm:p-6 h-full flex flex-col bg-background relative">
            <header className="flex justify-between items-center mb-4 bg-card p-4 rounded-xl shadow-md border border-border">
                <h1 className="text-2xl font-bold text-foreground">Kitchen Display System</h1>
                <button onClick={onToggleFullScreen} className="p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground">
                    {isFullscreen ? <ArrowsPointingInIcon className="w-6 h-6"/> : <ArrowsPointingOutIcon className="w-6 h-6"/>}
                </button>
            </header>
            
            <div className="border border-border rounded-xl mb-4 bg-card shadow-md">
                <button 
                    onClick={() => setIsTipsOpen(p => !p)} 
                    className="w-full flex justify-between items-center p-3 text-start group"
                    aria-expanded={isTipsOpen}
                >
                    <h4 className="font-semibold text-sm text-primary flex items-center gap-2">
                        <InformationCircleIcon className="w-5 h-5" />
                        Kitchen Operations Tips
                    </h4>
                    <ChevronDownIcon className={`w-5 h-5 text-muted-foreground transition-transform group-hover:text-foreground ${isTipsOpen ? 'rotate-180' : ''}`} />
                </button>
                {isTipsOpen && (
                    <div className="px-3 pb-3 border-t border-border pt-3 space-y-3 text-xs">
                        <div>
                            <p className="font-bold text-foreground">Prep Time Tracking</p>
                            <p className="text-muted-foreground">Set expected prep times per item. The KDS can flag orders that are taking too long, helping you identify bottlenecks. Available in Pro.</p>
                        </div>
                        <div>
                            <p className="font-bold text-foreground">Ingredient-Level Alerts</p>
                            <p className="text-muted-foreground">Connect your inventory to receive real-time alerts on the KDS like "Only 10 slices of pepperoni left". Pro feature.</p>
                        </div>
                         <div>
                            <p className="font-bold text-foreground">Recipe Scaling</p>
                            <p className="text-muted-foreground">Access a digital recipe book that can auto-adjust ingredient quantities for bulk prep, reducing waste. Pro feature.</p>
                        </div>
                    </div>
                )}
            </div>

            {pendingOrders.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 flex-grow overflow-y-auto">
                    {pendingOrders.map(order => {
                        const table = order.tableId ? (tables || []).find(t => t.id === order.tableId) : undefined;
                        return (
                            <OrderTicket
                                key={order.id}
                                order={order}
                                onCompleteOrder={onCompleteOrder}
                                tableName={table?.name}
                                onTogglePrepared={onTogglePrepared}
                            />
                        );
                    })}
                </div>
            ) : (
                <div className="flex-grow flex justify-center items-center">
                    <div className="text-center text-muted-foreground">
                        <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-24 w-24 mb-4" fill="none" viewBox="0 0 24" stroke="currentColor" strokeWidth={1}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                        </svg>
                        <h2 className="text-2xl font-semibold text-foreground">All orders are complete!</h2>
                        <p className="text-muted-foreground">New orders will appear here automatically.</p>
                    </div>
                </div>
            )}
            <footer className="text-center text-xs text-muted-foreground/50 pt-4">
                powered by ordinopos.com
            </footer>
        </div>
    );
};

export default KDSView;