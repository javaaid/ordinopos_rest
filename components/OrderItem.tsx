
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
    if (item.priceOverride) {
        return item.priceOverride * item.quantity;
    }
    const itemBasePrice = getPriceForItem(item.menuItem, orderType, customer);
    const modifiersTotal = item.selectedModifiers.reduce((acc, mod) => acc + mod.price, 0);
    return (itemBasePrice + modifiersTotal) * item.quantity;
}

const OrderItem: React.FC<OrderItemProps> = ({ cartItem, onRemoveItem, onUpdateCartQuantity, orderType, customer }) => {
  const handleQuantityChange = (delta: number) => {
    const newQuantity = cartItem.quantity + delta;
    onUpdateCartQuantity(cartItem.cartId, newQuantity);
  };
  
  const handleManualQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuantity = parseInt(e.target.value, 10);
    if (!isNaN(newQuantity)) {
        onUpdateCartQuantity(cartItem.cartId, newQuantity);
    }
  }
  
  const renderPizzaConfig = () => {
    if (!cartItem.pizzaConfiguration) return null;
    const { size, crust, toppings } = cartItem.pizzaConfiguration;
    const toppingNames = toppings.map(t => `${t.name} (${t.placement})`).join(', ');
    return (
      <p className="text-xs text-muted-foreground truncate mt-1">
        {size.name}, {crust.name}, {toppingNames}
      </p>
    )
  }

  const renderBurgerConfig = () => {
      if (!cartItem.burgerConfiguration) return null;
      const { bun, patty, cheese, toppings, sauces, extras } = cartItem.burgerConfiguration;
      const allAddons = [...toppings, ...sauces, ...extras].map(a => a.name).join(', ');
      return (
          <p className="text-xs text-muted-foreground truncate mt-1">
              {bun.name}, {patty.name}, {cheese?.name}, {allAddons}
          </p>
      );
  };

  return (
    <div className="flex items-center p-1.5 bg-accent rounded-md gap-2 text-sm">
      <div className="flex-grow">
        <p className="font-bold text-foreground leading-tight text-sm">{cartItem.menuItem.name}</p>
        <div className="flex items-center gap-1.5 mt-0.5">
            <button onClick={() => handleQuantityChange(-1)} className="p-0.5 text-muted-foreground bg-background rounded-full hover:bg-muted border border-border">
                <MinusIcon className="w-3 h-3"/>
            </button>
            <input 
              type="number" 
              value={cartItem.quantity} 
              onChange={handleManualQuantityChange}
              className="font-bold w-8 text-center text-foreground bg-transparent border-none focus:ring-0 p-0 text-sm"
              aria-label={`Quantity for ${cartItem.menuItem.name}`}
            />
            <button onClick={() => handleQuantityChange(1)} className="p-0.5 text-muted-foreground bg-background rounded-full hover:bg-muted border border-border">
                <PlusIcon className="w-3 h-3"/>
            </button>
        </div>
        {cartItem.selectedModifiers.length > 0 && (
           <p className="text-xs text-muted-foreground truncate mt-1">
             + {cartItem.selectedModifiers.map(m => m.name).join(', ')}
           </p>
        )}
        {renderPizzaConfig()}
        {renderBurgerConfig()}
        {cartItem.kitchenNote && (
            <p className="text-xs text-yellow-600 italic mt-1">
                Note: {cartItem.kitchenNote}
            </p>
        )}
      </div>
      <div className="font-bold text-foreground text-end flex-shrink-0 text-sm">
        ${calculateItemTotal(cartItem, orderType, customer).toFixed(2)}
      </div>
      <button onClick={() => onRemoveItem(cartItem.cartId)} className="p-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full transition-colors flex-shrink-0">
          <TrashIcon className="w-4 h-4"/>
      </button>
    </div>
  );
};

export default OrderItem;