




import React, { useState, useMemo } from 'react';
import { MenuItem, Category, Promotion, Printer, KitchenDisplay } from '../types';
import ProductManagementTab from './ProductManagementTab';
import UserPlusIcon from './icons/UserPlusIcon';
import ArrowUpTrayIcon from './icons/ArrowUpTrayIcon';
import CategoryManagementTab from './CategoryManagementTab';
import ModifierManagementTab from './ModifierManagementTab';
import SearchIcon from './icons/SearchIcon';
import { useDataContext, useModalContext, useAppContext } from '../contexts/AppContext';
import PromotionsView from './PromotionsView';
import KitchenNoteManagementTab from './KitchenNoteManagementTab';
import VoidReasonManagementTab from './VoidReasonManagementTab';
import DiscountManagementTab from './DiscountManagementTab';
import GratuityManagementTab from './GratuityManagementTab';
import SurchargeManagementTab from './SurchargeManagementTab';
import InvoiceOrderSequenceTab from './InvoiceOrderSequenceTab';
import ProductsView from './ProductsView';

type MenuTab = 'Category' | 'Items' | 'Modifier' | 'Promotions' | 'Kitchen Note' | 'Void Reason' | 'Discount' | 'Gratuity' | 'Surcharge' | 'Invoice/Order Sequence';

const MenuSettingsView: React.FC = () => {
    const { 
        menuItems, 
        categories,
        promotions, 
        printers,
        kitchenDisplays,
        handleSaveProduct, 
        handleDeleteProduct,
        handleSaveCategory,
        handleDeleteCategory,
    } = useDataContext();

    const { openModal, closeModal } = useModalContext();
    const { justAddedCategoryId, onClearJustAddedCategoryId } = useAppContext();

    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
    const [activeTab, setActiveTab] = useState<MenuTab>('Category');
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('all');

    const filteredItems = useMemo(() => {
        return menuItems
            .filter((item: MenuItem) => filterCategory === 'all' || item.category === filterCategory)
            .filter((item: MenuItem) => item.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [menuItems, searchTerm, filterCategory]);

    const handleBulkAction = (action: 'activate' | 'deactivate' | 'delete') => {
        // onBulkAction(action, Array.from(selectedIds));
        alert(`Bulk action '${action}' is not yet implemented.`);
        setSelectedIds(new Set());
    };
    
    const onAddNew = () => openModal('productEdit', { onSave: handleSaveProduct, onAddNewCategory: () => openModal('categoryEdit', { onSave: handleSaveCategory }), printers, kitchenDisplays, justAddedCategoryId, onClearJustAddedCategoryId });
    const onEdit = (item: MenuItem) => openModal('productEdit', { product: item, onSave: handleSaveProduct, onAddNewCategory: () => openModal('categoryEdit', { onSave: handleSaveCategory }), printers, kitchenDisplays, justAddedCategoryId, onClearJustAddedCategoryId });

    const handleDuplicate = (itemToDuplicate: MenuItem) => {
        const newItemData = JSON.parse(JSON.stringify(itemToDuplicate));
        newItemData.name = `${newItemData.name} (Copy)`;
        delete newItemData.id; // Remove ID to create a new item
        handleSaveProduct(newItemData);
    };

    const tabs: MenuTab[] = [
        'Category', 'Items', 'Modifier', 'Promotions', 'Kitchen Note', 'Void Reason', 
        'Discount', 'Gratuity', 
        'Surcharge', 'Invoice/Order Sequence'
    ];

    const tabButtonClass = (tab: MenuTab) =>
        `px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
            activeTab === tab
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground hover:bg-muted'
        }`;

    const renderContent = () => {
        switch (activeTab) {
            case 'Items':
                return <ProductsView />;
            case 'Category':
                return (
                    <div className="p-6 h-full">
                        <CategoryManagementTab 
                            categories={categories}
                            onAddNew={() => openModal('categoryEdit', { onSave: handleSaveCategory })}
                            onEdit={(cat) => openModal('categoryEdit', { category: cat, onSave: handleSaveCategory })}
                            onDelete={handleDeleteCategory}
                        />
                    </div>
                );
            case 'Modifier':
                 return (
                    <div className="p-6 h-full">
                        <ModifierManagementTab />
                    </div>
                );
            case 'Promotions':
                return <PromotionsView />;
            case 'Discount':
                return <DiscountManagementTab />;
            case 'Kitchen Note':
                return <KitchenNoteManagementTab />;
            case 'Void Reason':
                return <VoidReasonManagementTab />;
            case 'Gratuity':
                return <GratuityManagementTab />;
            case 'Surcharge':
                return <SurchargeManagementTab />;
            case 'Invoice/Order Sequence':
                return <InvoiceOrderSequenceTab />;
            default:
                return null;
        }
    };

    return (
        <div className="h-full flex flex-col">
             <div className="p-6 border-b border-border shrink-0">
                 <h2 className="text-2xl font-bold text-foreground mb-4">Menu Settings</h2>
                <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide">
                    {tabs.map(tab => (
                        <button key={tab} onClick={() => setActiveTab(tab)} className={tabButtonClass(tab)}>
                            {tab}
                        </button>
                    ))}
                </div>
            </div>
            <div className="flex-grow overflow-hidden">
                {renderContent()}
            </div>
        </div>
    );
};

export default MenuSettingsView;
