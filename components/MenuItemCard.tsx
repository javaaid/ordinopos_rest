import React from 'react';
import { MenuItem } from '../types';
import PlusIcon from './icons/PlusIcon';

interface MenuItemCardProps {
  item: MenuItem;
  cartQuantity: number;
  onSelectItem: (item: MenuItem) => void;
  isOutOfStock: boolean;
  onContextMenu: (event: React.MouseEvent) => void;
}

const MenuItemCard: React.FC<MenuItemCardProps> = ({ item, cartQuantity, onSelectItem, isOutOfStock, onContextMenu }) => {
  
  const handleAction = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isOutOfStock) return;
    onSelectItem(item);
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    onContextMenu(e);
  };

  const isInCart = cartQuantity > 0;
  
  const cardStyleWithImage: React.CSSProperties | undefined = item.imageUrl ? {
      backgroundImage: `linear-gradient(rgba(0,0,0,0.1), rgba(0,0,0,0.4)), url(${item.imageUrl})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
  } : undefined;

  const cardStyleWithColor: React.CSSProperties | undefined = item.color ? {
      backgroundColor: item.color
  } : undefined;
  
  const hasImage = !!item.imageUrl;
  const hasColor = !!item.color;
  const textColorClass = (hasImage || hasColor) ? 'text-white' : 'text-card-foreground';

  return (
    <div
      onClick={handleAction}
      onContextMenu={handleContextMenu}
      style={hasImage ? cardStyleWithImage : cardStyleWithColor}
      className={`rounded-lg overflow-hidden flex flex-col justify-end p-1.5 h-24 relative transition-all duration-200 group shadow-md
        ${!hasImage && !hasColor ? 'bg-card border border-border' : ''}
        ${isOutOfStock ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:ring-2 ring-primary'} 
        ${isInCart ? 'ring-2 ring-primary' : ''}`}
    >
        {isInCart && (
            <div className="absolute top-1 end-1 bg-primary text-primary-foreground rounded-full h-5 w-5 flex items-center justify-center text-xs font-bold border-2 border-card">
                {cartQuantity}
            </div>
        )}

      <div className="flex justify-between items-end gap-1 z-10">
        <div className={textColorClass}>
            <h3 className="font-medium leading-tight text-xs">{item.name}</h3>
            <p className="font-semibold text-sm">${item.price.toFixed(2)}</p>
        </div>
        
        <button
            onClick={handleAction}
            disabled={isOutOfStock}
            className="bg-card/50 backdrop-blur-sm w-7 h-7 rounded-full flex items-center justify-center hover:bg-card/75 transition-colors disabled:opacity-50 text-card-foreground flex-shrink-0"
        >
            <PlusIcon className="w-4 h-4"/>
        </button>
      </div>
    </div>
  );
};

export default MenuItemCard;