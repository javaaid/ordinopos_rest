import React, { useState, useEffect } from 'react';
import { Order, OrderType } from '../types';
import CheckCircleIcon from './icons/CheckCircleIcon';
import { cn } from '../lib/utils';

interface OrderTicketProps {
  order: Order;
  onCompleteOrder: (orderId: string) => void;
  tableName?: string;
  onTogglePrepared: (orderId: string, cartId: string) => void;
}

const OrderTicket: React.FC<OrderTicketProps> = ({ order, onCompleteOrder, tableName, onTogglePrepared }) => {
  const [elapsedTime, setElapsedTime] = useState('');
  const [isLate, setIsLate] = useState(false);

  useEffect(() => {
    const updateTimer = () => {
      const now = Date.now();
      const diff = now - order.createdAt;
      const minutes = Math.floor(diff / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      setElapsedTime(`${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`);

      if (order.estimatedPrepTimeMinutes) {
          const elapsedMinutes = diff / 60000;
          setIsLate(elapsedMinutes > order.estimatedPrepTimeMinutes);
      }
    };
    
    updateTimer();
    const timerId = setInterval(updateTimer, 1000);

    return () => clearInterval(timerId);
  }, [order.createdAt, order.estimatedPrepTimeMinutes]);


  const togglePrepared = (cartId: string) => {
    onTogglePrepared(order.id, cartId);
  };

  const allItemsPrepared = (order.preparedCartItemIds?.length || 0) === (order.cart || []).length;

  const typeStyles: Record<OrderType, { border: string, bg: string }> = {
      'dine-in': { border: 'border-t-blue-500', bg: 'bg-blue-500' },
      'takeaway': { border: 'border-t-purple-500', bg: 'bg-purple-500' },
      'delivery': { border: 'border-t-amber-500', bg: 'bg-amber-500' },
      'kiosk': { border: 'border-t-indigo-500', bg: 'bg-indigo-500' },
      'tab': { border: 'border-t-teal-500', bg: 'bg-teal-500' },
  };

  const sourceTextColors: Record<string, string> = {
    'online': 'text-green-500',
    'uber-eats': 'text-green-500',
    'doordash': 'text-green-500',
    'kiosk': 'text-purple-500',
    'qr_ordering': 'text-cyan-500',
  }

  const sourceText: Record<string, string> = {
    'in-store': '',
    'online': 'Online Order',
    'uber-eats': 'Uber Eats',
    'doordash': 'DoorDash',
    'kiosk': 'Kiosk Order',
    'qr_ordering': 'QR Table Order'
  }

  const styles = typeStyles[order.orderType] || { border: 'border-t-transparent', bg: 'bg-gray-500' };
  const sourceColor = sourceTextColors[order.source];

  return (
    <div className={cn(
        'bg-card rounded-xl shadow-md p-4 flex flex-col h-full transition-all',
        isLate 
            ? 'border-4 border-destructive animate-pulse' 
            : `border-t-4 ${styles.border}`,
        order.isTraining ? 'border-dashed !border-yellow-500 !border-4' : ''
    )}>
      <header className="flex justify-between items-start pb-2 mb-2 border-b border-border">
        <div>
          <h2 className="text-xl font-bold text-foreground capitalize">
            {order.orderType === 'dine-in' && tableName ? tableName : order.orderType}
          </h2>
          <p className={`text-sm font-semibold ${sourceColor}`}>{sourceText[order.source] || ''}</p>
        </div>
        <div className="text-right">
            <p className="text-2xl font-mono font-bold text-foreground">{order.orderNumber}</p>
            <p className={cn("text-lg font-mono", isLate ? 'text-destructive font-bold' : 'text-muted-foreground')}>{elapsedTime}</p>
            {order.estimatedPrepTimeMinutes && (
                <p className="text-xs text-muted-foreground mt-1">
                    Est: {order.estimatedPrepTimeMinutes} min
                </p>
            )}
        </div>
      </header>
      <div className="flex-grow overflow-y-auto space-y-3 pr-2 -mr-2">
        {(order.cart || []).map(item => {
          const isPrepared = (order.preparedCartItemIds || []).includes(item.cartId);
          return (
            <div
              key={item.cartId}
              onClick={() => togglePrepared(item.cartId)}
              className={`p-2 rounded-lg cursor-pointer transition-all ${isPrepared ? 'bg-green-500/20 opacity-60' : 'bg-secondary'}`}
            >
              <p className={`font-bold text-lg text-foreground ${isPrepared ? 'line-through' : ''}`}>
                {item.quantity}x {item.menuItem.name}
              </p>
              {item.selectedModifiers.length > 0 && (
                <ul className={`pl-4 text-sm text-muted-foreground ${isPrepared ? 'line-through' : ''}`}>
                  {item.selectedModifiers.map(mod => <li key={mod.name}>+ {mod.name}</li>)}
                </ul>
              )}
            </div>
          );
        })}
      </div>
      <footer className="mt-4">
        <button
          onClick={() => onCompleteOrder(order.id)}
          disabled={!allItemsPrepared}
          className="w-full h-14 flex items-center justify-center gap-2 bg-primary text-primary-foreground font-bold text-xl rounded-lg hover:bg-primary/90 transition-colors disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed"
        >
            <CheckCircleIcon className="w-8 h-8"/>
            Complete
        </button>
      </footer>
    </div>
  );
};

export default OrderTicket;