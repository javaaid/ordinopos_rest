

import React from 'react';
import { Order, Driver } from '../types';
import DeliveryOrderCard from './DeliveryOrderCard';
import ArrowPathRoundedSquareIcon from './icons/ArrowPathRoundedSquareIcon';
import { useDataContext } from '../contexts/AppContext';

const IncomingOrderCard: React.FC<{ order: Order; onAccept: (id: string) => void }> = ({ order, onAccept }) => {
    return (
        <div className="bg-secondary rounded-lg shadow-md p-4 animate-fade-in-down border border-border">
            <div className="flex justify-between items-start border-b border-border pb-3 mb-3">
                <div>
                    <h3 className="font-bold text-foreground">Order #{order.id.slice(-6)}</h3>
                    <p className="text-sm text-muted-foreground">{order.customer?.name}</p>
                    <p className="text-xs text-muted-foreground capitalize">{order.source.replace('-', ' ')}</p>
                </div>
                <div className="text-right flex-shrink-0">
                    <p className="font-bold text-lg text-foreground">${order.total.toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground">{order.cart.length} item(s)</p>
                </div>
            </div>
            <button
                onClick={() => onAccept(order.id)}
                className="w-full bg-green-600 text-white font-bold py-2 rounded-md hover:bg-green-700 transition-colors"
            >
                Accept & Send to Kitchen
            </button>
        </div>
    );
};

const DeliveryView: React.FC = () => {
    const { orders, drivers, onAssignDriver, onCompleteDelivery, onSyncDeliveryOrders, onAcceptDeliveryOrder } = useDataContext();

    const incomingOrders = (orders || []).filter(o => (o.source === 'uber-eats' || o.source === 'doordash') && o.status === 'pending');
    const readyForDelivery = (orders || []).filter(o => o.orderType === 'delivery' && o.status === 'completed');
    const outForDelivery = (orders || []).filter(o => o.status === 'out-for-delivery');
    const availableDrivers = (drivers || []).filter(d => d.status === 'available');

    return (
        <div className="p-6 h-full flex flex-col bg-background">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-foreground">Delivery Management</h1>
                <button
                    onClick={onSyncDeliveryOrders}
                    className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-2 px-4 rounded-lg transition-colors"
                >
                    <ArrowPathRoundedSquareIcon className="w-5 h-5"/>
                    Sync Delivery Orders
                </button>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-grow overflow-hidden">
                {/* Incoming Column */}
                <div className="bg-card rounded-lg p-4 flex flex-col border border-border">
                    <h2 className="text-xl font-bold text-cyan-500 mb-4 sticky top-0 bg-card pb-2">Incoming ({incomingOrders.length})</h2>
                    <div className="flex-grow overflow-y-auto space-y-4 pr-2 -mr-2">
                        {incomingOrders.length > 0 ? (
                            incomingOrders.map(order => (
                                <IncomingOrderCard key={order.id} order={order} onAccept={onAcceptDeliveryOrder} />
                            ))
                        ) : (
                            <div className="text-center text-muted-foreground py-10">
                                <p>No new delivery orders.</p>
                                <p className="text-xs">Click "Sync" to check again.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Ready for Delivery Column */}
                <div className="bg-card rounded-lg p-4 flex flex-col border border-border">
                    <h2 className="text-xl font-bold text-amber-500 mb-4 sticky top-0 bg-card pb-2">Ready for Delivery ({readyForDelivery.length})</h2>
                    <div className="flex-grow overflow-y-auto space-y-4 pr-2 -mr-2">
                        {readyForDelivery.length > 0 ? (
                             readyForDelivery.map(order => (
                                <DeliveryOrderCard
                                    key={order.id}
                                    order={order}
                                    drivers={drivers}
                                    availableDrivers={availableDrivers}
                                    onAssignDriver={onAssignDriver}
                                    onCompleteDelivery={onCompleteDelivery}
                                />
                            ))
                        ) : (
                            <div className="text-center text-muted-foreground py-10">
                                <p>No orders are waiting for a driver.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Out for Delivery Column */}
                <div className="bg-card rounded-lg p-4 flex flex-col border border-border">
                    <h2 className="text-xl font-bold text-green-500 mb-4 sticky top-0 bg-card pb-2">Out for Delivery ({outForDelivery.length})</h2>
                    <div className="flex-grow overflow-y-auto space-y-4 pr-2 -mr-2">
                         {outForDelivery.length > 0 ? (
                             outForDelivery.map(order => (
                                <DeliveryOrderCard
                                    key={order.id}
                                    order={order}
                                    drivers={drivers}
                                    onCompleteDelivery={onCompleteDelivery}
                                />
                            ))
                        ) : (
                             <div className="text-center text-muted-foreground py-10">
                                <p>No orders are currently out for delivery.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DeliveryView;
