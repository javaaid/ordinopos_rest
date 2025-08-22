
import React, { useMemo } from 'react';
import { CartItem, MenuItem } from '../types';
import MenuItemCard from './MenuItemCard';
import { useAppContext } from '../contexts/AppContext';
import { isItemOutOfStock } from '../utils/calculations';

const MenuGrid: React.FC = () => {
  const { 
    menuItems, 
    ingredients, 
    recipes, 
    handleSaveProduct, 
    printers, 
    kitchenDisplays, 
    handleSaveCategory,
    cart, 
    activeCategory, 
    searchQuery, 
    onSelectItem,
    isAdvancedInventoryPluginActive, 
    justAddedCategoryId, 
    onClearJustAddedCategoryId,
    openModal, 
    closeModal 
  } = useAppContext();

  const filteredMenuItems = useMemo(() => {
    let items = menuItems || [];
    if (activeCategory !== 'all') {
        items = items.filter(item => item.category === activeCategory);
    }
    if (searchQuery) {
        items = items.filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    return items;
  }, [menuItems, activeCategory, searchQuery]);
  
  const onEdit = (item: MenuItem) => {
    openModal('productEdit', {
      product: item,
      onSave: (product: MenuItem, recipe: any) => handleSaveProduct(product, false, recipe),
      onAddNewCategory: () => openModal('categoryEdit', { onSave: (cat: any) => handleSaveCategory(cat, true) }),
      printers,
      kitchenDisplays,
      justAddedCategoryId,
      onClearJustAddedCategoryId
    });
  };

  const handleContextMenu = (e: React.MouseEvent, item: MenuItem) => {
    e.preventDefault();
    openModal('productContextMenu', {
      item,
      x: e.clientX,
      y: e.clientY,
      onEdit: () => {
        closeModal();
        onEdit(item);
      },
      onClose: closeModal,
    });
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-1.5">
      {filteredMenuItems.map((item) => {
        const cartItemsForThisProduct = (cart || []).filter((ci: CartItem) => ci.menuItem.id === item.id);
        const cartQuantity = cartItemsForThisProduct.reduce((sum: number, i: CartItem) => sum + i.quantity, 0);
        const isOutOfStock = isAdvancedInventoryPluginActive && isItemOutOfStock(item, cart, ingredients, recipes);

        return (
            <MenuItemCard 
                key={item.id} 
                item={item} 
                onSelectItem={onSelectItem}
                cartQuantity={cartQuantity}
                isOutOfStock={isOutOfStock}
                onContextMenu={(e) => handleContextMenu(e, item)}
            />
        )
      })}
    </div>
  );
};

export default MenuGrid;
