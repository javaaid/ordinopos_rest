import React, { useMemo } from 'react';
import { CartItem, MenuItem } from '../types';
import MenuItemCard from './MenuItemCard';
import { useAppContext, useDataContext, usePOSContext, useModalContext } from '../contexts/AppContext';

const MenuGrid: React.FC = () => {
  const { menuItems, printers, kitchenDisplays, handleSaveProduct, handleSaveCategory } = useDataContext();
  const { cart, onUpdateQuantity, activeCategory, searchQuery, onSelectItem } = usePOSContext();
  const { openModal, closeModal } = useModalContext();
  const { justAddedCategoryId, onClearJustAddedCategoryId } = useAppContext();

  const filteredMenuItems = useMemo(() => {
    // This logic should ideally be in the context as well, but this is fine for now.
    let items = menuItems || []; // Assuming location filter is handled elsewhere or in a selector
    if (activeCategory !== 'all') {
        items = items.filter(item => item.category === activeCategory);
    }
    if (searchQuery) {
        items = items.filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    return items;
  }, [menuItems, activeCategory, searchQuery]);

  
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-1.5">
      {filteredMenuItems.map((item) => {
        const cartItemsForThisProduct = (cart || []).filter((ci: CartItem) => ci.menuItem.id === item.id);
        const cartQuantity = cartItemsForThisProduct.reduce((sum: number, i: CartItem) => sum + i.quantity, 0);
        const isOutOfStock = item.stopSaleAtZeroStock && typeof item.stock === 'number' && item.stock <= cartQuantity;

        return (
            <MenuItemCard 
                key={item.id} 
                item={item} 
                onSelectItem={onSelectItem}
                cartQuantity={cartQuantity}
                isOutOfStock={isOutOfStock}
            />
        )
      })}
    </div>
  );
};

export default MenuGrid;