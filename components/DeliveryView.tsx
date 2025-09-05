import React from 'react';
import { Order, Driver } from '../types';
import DeliveryOrderCard from './DeliveryOrderCard';
import ArrowPathRoundedSquareIcon from './icons/ArrowPathRoundedSquareIcon';
import { useDataContext, useAppContext } from '../contexts/AppContext';
import { useTranslations } from '../hooks/useTranslations';

const IncomingOrderCard: React.FC<{ order: Order; onAccept: (id: string) => void }> = ({ order, onAccept }) => {
    const { settings } = useAppContext();
    const t = useTranslations(settings.language.staff);
    return (
        <div className="bg-secondary rounded-lg shadow-md p-4 animate-fade-in-down border border-border">
            <div className="flex justify-between items-start border-b border-border pb-3 mb-3">
                <div>
                    <h3 className="font-bold text-foreground">Order #{order.id.slice(-6)}</h3>
                    <p className="text-sm text-muted-foreground">{order.customer?.name}</p>
                    <p className="text-xs text-muted-foreground capitalize">{order.source.replace('-', ' ')}</p>
                </div>
                <div className="text-end flex-shrink-0">
                    <p className="font-bold text-lg text-foreground">${order.total.toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground">{order.cart.length} item(s)</p>
                </div>
            </div>
            <button
                onClick={() => onAccept(order.id)}
                className="w-full bg-green-600 text-white font-bold py-2 rounded-md hover:bg-green-700 transition-colors"
            >
                {t('acceptAndSendToKitchen')}
            </button>
        </div>
    );
};

const DeliveryView: React.FC = () => {
    const { orders, drivers, onAssignDriver, onCompleteDelivery, onSyncDeliveryOrders, onAcceptDeliveryOrder } = useDataContext();
    const { settings } = useAppContext();
    const t = useTranslations(settings.language.staff);

    const incomingOrders = (orders || []).filter(o => (o.source === 'uber-eats' || o.source === 'doordash') && o.status === 'pending');
    const preparingOrders = (orders || []).filter(o => o.orderType === 'delivery' && o.status === 'kitchen');
    const readyForDelivery = (orders || []).filter(o => o.orderType === 'delivery' && o.status === 'completed');
    const outForDelivery = (orders || []).filter(o => o.status === 'out-for-delivery');
    const availableDrivers = (drivers || []).filter(d => d.status === 'available');

    return (
        <div className="p-6 h-full flex flex-col bg-background">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-foreground">{t('deliveryManagement')}</h1>
                <button
                    onClick={onSyncDeliveryOrders}
                    className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-2 px-4 rounded-lg transition-colors"
                >
                    <ArrowPathRoundedSquareIcon className="w-5 h-5"/>
                    {t('syncDeliveryOrders')}
                </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 flex-grow overflow-hidden">
                {/* Incoming Column */}
                <div className="bg-card rounded-lg p-4 flex flex-col border border-border">
                    <h2 className="text-xl font-bold text-cyan-500 mb-4 sticky top-0 bg-card pb-2">{t('incoming')} ({incomingOrders.length})</h2>
                    <div className="flex-grow overflow-y-auto space-y-4 pe-2 -me-2">
                        {incomingOrders.length > 0 ? (
                            incomingOrders.map(order => (
                                <IncomingOrderCard key={order.id} order={order} onAccept={onAcceptDeliveryOrder} />
                            ))
                        ) : (
                            <div className="text-center text-muted-foreground py-10">
                                <p>{t('noNewDeliveryOrders')}</p>
                                <p className="text-xs">{t('clickSync')}</p>
                            </div>
                        )}
                    </div>
                </div>
                
                 {/* Preparing Column */}
                <div className="bg-card rounded-lg p-4 flex flex-col border border-border">
                    <h2 className="text-xl font-bold text-orange-500 mb-4 sticky top-0 bg-card pb-2">{t('preparing')} ({preparingOrders.length})</h2>
                    <div className="flex-grow overflow-y-auto space-y-4 pe-2 -me-2">
                        {preparingOrders.length > 0 ? (
                             preparingOrders.map(order => (
                                <DeliveryOrderCard
                                    key={order.id}
                                    order={order}
                                    drivers={drivers}
                                    onCompleteDelivery={onCompleteDelivery}
                                />
                            ))
                        ) : (
                            <div className="text-center text-muted-foreground py-10">
                                <p>{t('noOrdersBeingPrepared')}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Ready for Delivery Column */}
                <div className="bg-card rounded-lg p-4 flex flex-col border border-border">
                    <h2 className="text-xl font-bold text-amber-500 mb-4 sticky top-0 bg-card pb-2">{t('readyForDelivery')} ({readyForDelivery.length})</h2>
                    <div className="flex-grow overflow-y-auto space-y-4 pe-2 -me-2">
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
                                <p>{t('noOrdersWaitingDriver')}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Out for Delivery Column */}
                <div className="bg-card rounded-lg p-4 flex flex-col border border-border">
                    <h2 className="text-xl font-bold text-green-500 mb-4 sticky top-0 bg-card pb-2">{t('outForDelivery')} ({outForDelivery.length})</h2>
                    <div className="flex-grow overflow-y-auto space-y-4 pe-2 -me-2">
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
                                <p>{t('noOrdersOutForDelivery')}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DeliveryView;