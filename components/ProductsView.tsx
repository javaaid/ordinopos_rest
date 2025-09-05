import React, { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import { MenuItem, Category, Printer, KitchenDisplay, RecipeItem } from '../types';
import { useDataContext, useModalContext, useAppContext } from '../contexts/AppContext';
import SearchIcon from './icons/SearchIcon';
import PlusIcon from './icons/PlusIcon';
import ArrowUpTrayIcon from './icons/ArrowUpTrayIcon';
import ArrowsPointingOutIcon from './icons/ArrowsPointingOutIcon';
import ArrowsPointingInIcon from './icons/ArrowsPointingInIcon';
import { cn } from '../lib/utils';
import ProductManagementTab from './ProductManagementTab';
import { Button } from './ui/Button';
import PencilSquareIcon from './icons/PencilSquareIcon';
// FIX: Changed to a named import to resolve "Module has no default export" error.
import { ExportButtons } from './ExportButtons';
import { exportToCsv } from '../lib/utils';
import { useTranslations } from '../hooks/useTranslations';


const ProductsView: React.FC = () => {
    const { 
        settings,
        menuItems, 
        categories,
        printers,
        kitchenDisplays,
        handleSaveProduct, 
        handleDeleteProduct,
        handleSaveCategory,
        handleImportMenuItems,
        handleBulkUpdateProducts,
    } = useDataContext();
    const t = useTranslations(settings.language.staff);

    const { openModal, closeModal, addToast } = useModalContext();
    const { justAddedCategoryId, onClearJustAddedCategoryId } = useAppContext();
    const importInputRef = useRef<HTMLInputElement>(null);

    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('all');
    
    const [isFullScreen, setIsFullScreen] = useState(false);

    const filteredItems = useMemo(() => {
        return (menuItems || [])
            .filter((item: MenuItem) => filterCategory === 'all' || item.category === filterCategory)
            .filter((item: MenuItem) => item.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [menuItems, searchTerm, filterCategory]);

    const handleBulkAction = (action: 'activate' | 'deactivate' | 'delete') => {
        // onBulkAction(action, Array.from(selectedIds));
        alert(`Bulk action '${action}' is not yet implemented.`);
        setSelectedIds(new Set());
    };
    
    const onAddNew = () => openModal('productEdit', { 
        onSave: (product: MenuItem, recipe: RecipeItem[]) => handleSaveProduct(product, true, recipe), 
        onAddNewCategory: () => openModal('categoryEdit', { onSave: (cat: Category) => {
            const newCat = { ...cat, id: cat.id || cat.name.toLowerCase().replace(/\s+/g, '_') };
            handleSaveCategory(newCat, true);
        }}), 
        printers, 
        kitchenDisplays, 
        justAddedCategoryId, 
        onClearJustAddedCategoryId 
    });
    const onEdit = (item: MenuItem) => openModal('productEdit', { 
        product: item, 
        onSave: (product: MenuItem, recipe: RecipeItem[]) => handleSaveProduct(product, false, recipe), 
        onAddNewCategory: () => openModal('categoryEdit', { onSave: (cat: Category) => {
            const newCat = { ...cat, id: cat.id || cat.name.toLowerCase().replace(/\s+/g, '_') };
            handleSaveCategory(newCat, true);
        } }), 
        printers, 
        kitchenDisplays, 
        justAddedCategoryId, 
        onClearJustAddedCategoryId 
    });

    const handleDuplicate = (itemToDuplicate: MenuItem) => {
        const { id, ...rest } = itemToDuplicate;
        const newItemData = {
            ...rest,
            name: `${itemToDuplicate.name} (Copy)`,
        };
        handleSaveProduct(newItemData as MenuItem, true, null);
    };

    const handleExportToCSV = (filename: string = 'products.csv') => {
        const headers = ["Name", "Category", "Kitchen Name", "Barcode 1", "Price", "Takeout Price", "Delivery Price", "Member Price 1", "Member Price 2", "Member Price 3", "Cost", "Qty", "Warn Qty", "Stop Sale(QTY=0)", "Ask Price", "Ask Quantity", "Hide Name", "Kitchen Note(Must)", "Modifier Popup", "Discountable", "Scale", "Kitchen/Tab Printer", "Kitchen Display", "Background", "Sequence", "Enabled", "Image URL"];
        
        const rows = menuItems.map((item: MenuItem) => {
            const categoryName = categories.find((c: Category) => c.id === item.category)?.name || item.category;
            
            return [
                item.name, categoryName, item.kitchenName, item.barcodes?.[0], item.price, item.takeawayPrice, item.deliveryPrice, item.memberPrice1, item.memberPrice2, item.memberPrice3, item.cost, item.stock, item.warnQty, !!item.stopSaleAtZeroStock, !!item.askPrice, !!item.askQuantity, !!item.hideName, !!item.promptForKitchenNote, !!item.alwaysShowModifiers, !!item.isDiscountable, !!item.useScale, item.kitchenPrinterId, item.kdsId, item.color, item.displayOrder, item.isActive !== false, item.imageUrl
            ];
        });

        exportToCsv(headers, rows, filename);
        addToast({ type: 'success', title: 'Export Successful', message: `Exported ${rows.length} products.` });
    };

    const handlePrint = () => {
        window.print();
    };

    const handleFileImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (e) => {
            const text = e.target?.result as string;
            if (text) {
                await handleImportMenuItems(text);
            } else {
                 addToast({ type: 'error', title: 'Import Failed', message: 'Could not read the file.' });
            }
        };
        reader.readAsText(file);
        if (importInputRef.current) {
            importInputRef.current.value = '';
        }
    };

    const triggerImport = () => {
        importInputRef.current?.click();
    };

    const handleBulkEdit = () => {
        openModal('productBulkEdit', {
            selectedIds: Array.from(selectedIds),
            onSave: (updates: Partial<MenuItem>) => {
                handleBulkUpdateProducts(Array.from(selectedIds), updates);
                setSelectedIds(new Set());
                closeModal();
            },
        });
    };

    return (
        <div className={cn("flex flex-col h-full p-6", isFullScreen && "fixed inset-0 z-50 bg-card")}>
            <div className="flex justify-between items-center mb-4 flex-wrap gap-4 no-print">
                <div className="flex gap-4 flex-grow">
                    <div className="relative flex-grow max-w-xs">
                        <SearchIcon className="w-5 h-5 text-muted-foreground absolute start-3 top-1/2 -translate-y-1/2 pointer-events-none"/>
                        <input 
                            type="search" 
                            placeholder={t('search_items')}
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full bg-secondary rounded-lg ps-10 pe-4 py-2 text-foreground border border-border focus:border-primary focus:ring-0"
                        />
                    </div>
                    <select
                        value={filterCategory}
                        onChange={e => setFilterCategory(e.target.value)}
                        className="bg-secondary rounded-lg px-4 py-2 text-foreground border border-border focus:border-primary focus:ring-0"
                    >
                        <option value="all">{t('all')}</option>
                        {categories.map((cat: Category) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                    </select>
                </div>
                <div className="flex gap-2 flex-wrap">
                    <Button onClick={handleBulkEdit} variant="outline" size="sm" className="flex items-center gap-2" disabled={selectedIds.size === 0}>
                        <PencilSquareIcon className="w-5 h-5" /> {t('bulkEditN').replace('{count}', String(selectedIds.size))}
                    </Button>
                    <input type="file" ref={importInputRef} onChange={handleFileImport} className="hidden" accept=".csv" />
                    <Button onClick={triggerImport} variant="outline" size="sm" className="flex items-center gap-2">
                        <ArrowUpTrayIcon className="w-5 h-5" /> {t('import')} {t('csv')}
                    </Button>
                    <ExportButtons onCsvExport={handleExportToCSV} onPrint={handlePrint} />
                     <button onClick={() => setIsFullScreen(fs => !fs)} title={isFullScreen ? "Exit Full Screen" : "Enter Full Screen"} className="p-2 bg-secondary rounded-lg text-muted-foreground hover:text-foreground">
                        {isFullScreen ? <ArrowsPointingInIcon className="w-5 h-5" /> : <ArrowsPointingOutIcon className="w-5 h-5" />}
                    </button>
                    <button onClick={onAddNew} className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-2 px-3 rounded-lg text-sm">
                        <PlusIcon className="w-5 h-5" /> {t('addItem')}
                    </button>
                </div>
            </div>
            <ProductManagementTab
                menuItems={filteredItems}
                onEdit={onEdit}
                onDelete={handleDeleteProduct}
                onDuplicate={handleDuplicate}
                selectedIds={selectedIds}
                setSelectedIds={setSelectedIds}
            />
        </div>
    );
};

export default ProductsView;