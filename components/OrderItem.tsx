import React from 'react';
import { CartItem, MenuItem, OrderType, Customer } from '../types';
import TrashIcon from './icons/TrashIcon';
import PlusIcon from './icons/PlusIcon';
import MinusIcon from './icons/MinusIcon';
import { getPriceForItem } from '../utils/calculations';

interface OrderItemProps {
  cartItem: CartItem;
  onRemoveItem: (cartId: string) => void;
  onUpdateCartQuantity: (cartId: string, newQuantity: number) => void;
  orderType: OrderType;
  customer: Customer | null;
}

const calculateItemTotal = (item: CartItem, orderType: OrderType, customer: Customer | null): number => {
    const itemBasePrice = item.priceOverride ?? getPriceForItem(item.menuItem, orderType, customer);
    const modifiersTotal = item.selectedModifiers.reduce((acc, mod) => acc + mod.price, 0);
    return (itemBasePrice + modifiersTotal) * item.quantity;
}

const OrderItem: React.FC<OrderItemProps> = ({ cartItem, onRemoveItem, onUpdateCartQuantity, orderType, customer }) => {
  return (
    <div className="flex items-center p-1.5 bg-accent rounded-md gap-2">
      <div className="flex-grow">
        <p className="font-bold text-xs text-foreground leading-tight">{cartItem.menuItem.name}</p>
        <div className="flex items-center gap-1.5 mt-0.5">
            <button onClick={() => onUpdateCartQuantity(cartItem.cartId, cartItem.quantity - 1)} className="p-0.5 text-muted-foreground bg-background rounded-full hover:bg-muted border border-border">
                <MinusIcon className="w-2.5 h-2.5"/>
            </button>
            <span className="text-xs font-bold w-4 text-center text-foreground">{cartItem.quantity}</span>
            <button onClick={() => onUpdateCartQuantity(cartItem.cartId, cartItem.quantity + 1)} className="p-0.5 text-muted-foreground bg-background rounded-full hover:bg-muted border border-border">
                <PlusIcon className="w-2.5 h-2.5"/>
            </button>
        </div>
        {cartItem.selectedModifiers.length > 0 && (
           <p className="text-xs text-muted-foreground truncate mt-1">
             + {cartItem.selectedModifiers.map(m => m.name).join(', ')}
           </p>
        )}
        {cartItem.kitchenNote && (
            <p className="text-xs text-yellow-600 italic mt-1">
                Note: {cartItem.kitchenNote}
            </p>
        )}
      </div>
      <div className="font-bold text-xs text-foreground text-end flex-shrink-0">
        ${calculateItemTotal(cartItem, orderType, customer).toFixed(2)}
      </div>
      <button onClick={() => onRemoveItem(cartItem.cartId)} className="p-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full transition-colors flex-shrink-0">
          <TrashIcon className="w-3.5 h-3.5"/>
      </button>
    </div>
  );
};

export default OrderItem;