import React, { useState } from 'react';
import { Order, Driver } from '../types';

interface DeliveryOrderCardProps {
    order: Order;
    drivers: Driver[];
    availableDrivers?: Driver[];
    onAssignDriver?: (orderId: string, driverId: string) => void;
    onCompleteDelivery: (orderId: string) => void;
}

const DeliveryOrderCard: React.FC<DeliveryOrderCardProps> = ({ order, drivers, availableDrivers, onAssignDriver, onCompleteDelivery }) => {
    const [selectedDriver, setSelectedDriver] = useState<string>('');
    
    const customer = order.customer;
    const driver = order.driverId ? drivers.find(d => d.id === order.driverId) : null;

    const handleAssign = () => {
        if(selectedDriver && onAssignDriver){
            onAssignDriver(order.id, selectedDriver);
        }
    }

    return (
        <div className="bg-card rounded-lg shadow-md p-4 border border-border">
            <div className="flex justify-between items-start border-b border-border pb-3 mb-3">
                <div>
                    <h3 className="font-bold text-foreground">Order #{order.id.slice(-6)}</h3>
                    <p className="text-sm text-muted-foreground">{customer?.name}</p>
                    <p className="text-xs text-muted-foreground">{customer?.address}</p>
                </div>
                <div className="text-right flex-shrink-0">
                    <p className="font-bold text-lg text-foreground">${order.total.toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground">{order.cart.length} item(s)</p>
                </div>
            </div>

            <ul className="text-sm space-y-1 mb-4">
            {order.cart.map(item => (
                <li key={item.cartId} className="flex justify-between text-muted-foreground">
                    <span>{item.quantity}x {item.menuItem.name}</span>
                </li>
            ))}
            </ul>

            {order.status === 'completed' && onAssignDriver && availableDrivers && (
                <div className="flex gap-2 items-center">
                    <select
                        value={selectedDriver}
                        onChange={(e) => setSelectedDriver(e.target.value)}
                        className="w-full bg-background border border-border rounded-md px-3 py-2 text-foreground focus:ring-primary focus:border-primary"
                    >
                        <option value="" disabled>Assign a driver...</option>
                        {availableDrivers.map(d => (
                            <option key={d.id} value={d.id}>{d.name}</option>
                        ))}
                    </select>
                    <button
                        onClick={handleAssign}
                        disabled={!selectedDriver}
                        className="bg-primary text-primary-foreground font-semibold py-2 px-4 rounded-md hover:bg-primary/90 disabled:bg-muted disabled:cursor-not-allowed transition-colors flex-shrink-0"
                    >
                        Assign
                    </button>
                </div>
            )}

            {order.status === 'out-for-delivery' && (
                <div className="flex flex-col gap-2">
                    <p className="text-sm text-muted-foreground">
                        Assigned to: <span className="font-bold text-foreground">{driver?.name || '...'}</span>
                    </p>
                    <button
                        onClick={() => onCompleteDelivery(order.id)}
                        className="w-full bg-green-600 text-white font-bold py-2 rounded-md hover:bg-green-700 transition-colors"
                    >
                        Mark as Delivered
                    </button>
                </div>
            )}
        </div>
    );
};

export default DeliveryOrderCard;