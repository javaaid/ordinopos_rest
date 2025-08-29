

import React, { useMemo, useEffect, useState } from 'react';
import { CartItem, MenuItem } from '../types';
import MenuItemCard from './MenuItemCard';
import { useAppContext } from '../contexts/AppContext';
import { isItemOutOfStock } from '../utils/calculations';
import { GoogleGenAI } from '@google/genai';

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

  const [generatingImages, setGeneratingImages] = useState<Set<number>>(new Set());

  useEffect(() => {
    const generateMissingImages = async () => {
      if (!process.env.API_KEY || !menuItems) return;
      
      // Find items that need an image and are not already being processed
      const itemsToUpdate = menuItems.filter((item: MenuItem) => !item.imageUrl && !generatingImages.has(item.id));
      
      if (itemsToUpdate.length === 0) return;
      
      // Mark all these items as being processed
      setGeneratingImages(prev => new Set([...prev, ...itemsToUpdate.map(i => i.id)]));
      
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const updatePromises = itemsToUpdate.map(async (item) => {
        try {
          const prompt = `A delicious, photorealistic image of ${item.name}, a popular dish in the ${item.category} category. The food is presented beautifully on a clean plate, ready to be served in a restaurant. High quality food photography.`;
          
          const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: prompt,
            config: {
              numberOfImages: 1,
              outputMimeType: 'image/jpeg',
              aspectRatio: '1:1',
            },
          });

          if (response.generatedImages?.[0]?.image?.imageBytes) {
            const base64ImageBytes = response.generatedImages[0].image.imageBytes;
            const imageUrl = `data:image/jpeg;base64,${base64ImageBytes}`;
            // This will trigger a re-render for each successful image generation.
            handleSaveProduct({ ...item, imageUrl }, false);
          }
        } catch (error) {
          console.error(`Failed to generate image for ${item.name}:`, error);
          // If one fails, we remove it from the set so it can be retried on a subsequent render.
          setGeneratingImages(prev => {
            const newSet = new Set(prev);
            newSet.delete(item.id);
            return newSet;
          });
        }
      });
      
      await Promise.all(updatePromises);
    };

    generateMissingImages();
  }, [menuItems, handleSaveProduct, generatingImages]);

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

  const handleOpenPizzaBuilder = (item: MenuItem) => {
    openModal('pizzaBuilder', { item });
  };

  const handleOpenBurgerBuilder = (item: MenuItem) => {
    openModal('burgerBuilder', { item });
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
                onOpenPizzaBuilder={handleOpenPizzaBuilder}
                onOpenBurgerBuilder={handleOpenBurgerBuilder}
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