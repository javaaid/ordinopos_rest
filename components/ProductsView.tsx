import React, { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import { MenuItem, Category, Printer, KitchenDisplay } from '../types';
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
import ExportButtons from './ExportButtons';


const ProductsView: React.FC = () => {
    const { 
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

    const { openModal, closeModal } = useModalContext();
    const { justAddedCategoryId, onClearJustAddedCategoryId } = useAppContext();

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
    
    const onAddNew = () => openModal('productEdit', { onSave: handleSaveProduct, onAddNewCategory: () => openModal('categoryEdit', { onSave: handleSaveCategory }), printers, kitchenDisplays, justAddedCategoryId, onClearJustAddedCategoryId });
    const onEdit = (item: MenuItem) => openModal('productEdit', { product: item, onSave: handleSaveProduct, onAddNewCategory: () => openModal('categoryEdit', { onSave: handleSaveCategory }), printers, kitchenDisplays, justAddedCategoryId, onClearJustAddedCategoryId });

    const handleDuplicate = (itemToDuplicate: MenuItem) => {
        const { id, ...rest } = itemToDuplicate;
        const newItemData = {
            ...rest,
            name: `${itemToDuplicate.name} (Copy)`,
        };
        handleSaveProduct(newItemData as MenuItem);
    };

    const handleExportToCSV = () => {
        const headers = ["Name", "Category", "Kitchen Name", "Barcode 1", "Price", "Takeout Price", "Delivery Price", "Member Price 1", "Member Price 2", "Member Price 3", "Cost", "Qty", "Warn Qty", "Stop Sale(QTY=0)", "Ask Price", "Ask Quantity", "Hide Name", "Kitchen Note(Must)", "Modifier Popup", "Discountable", "Scale", "Kitchen/Tab Printer", "Kitchen Display", "Background", "Sequence", "Enabled", "Image URL"];
        
        const rows = menuItems.map((item: MenuItem) => {
            const categoryName = categories.find((c: Category) => c.id === item.category)?.name || item.category;
            
            const escapeCSV = (val: any) => {
                if (val === undefined || val === null) return '';
                const str = String(val);
                if (str.includes(',') || str.includes('"') || str.includes('\n')) {
                    return `"${str.replace(/"/g, '""')}"`;
                }
                return str;
            };
            
            return [
                escapeCSV(item.name),
                escapeCSV(categoryName),
                escapeCSV(item.kitchenName),
                escapeCSV(item.barcode),
                item.price ?? 0,
                item.takeawayPrice ?? 0,
                item.deliveryPrice ?? 0,
                item.memberPrice1 ?? 0,
                item.memberPrice2 ?? 0,
                item.memberPrice3 ?? 0,
                item.cost ?? 0,
                item.stock ?? 0,
                item.warnQty ?? 0,
                !!item.stopSaleAtZeroStock,
                !!item.askPrice,
                !!item.askQuantity,
                !!item.hideName,
                !!item.promptForKitchenNote,
                !!item.alwaysShowModifiers,
                !!item.isDiscountable,
                !!item.useScale,
                escapeCSV(item.kitchenPrinterId),
                escapeCSV(item.kdsId),
                escapeCSV(item.color),
                item.displayOrder ?? '',
                item.isActive !== false,
                escapeCSV(item.imageUrl)
            ].join(',');
        });

        const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "products.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handlePrint = () => window.print();

    const handleFileImport = (event: Event) => {
        const target = event.target as HTMLInputElement;
        const file = target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target?.result as string;
            if (!text) return;
            
            const lines = text.split(/\r?\n/).filter(line => line.trim() !== '');
            if (lines.length < 2) {
                alert("CSV file is empty or has no data rows.");
                return;
            }

            const headerLine = lines[0];
            const cleanedHeaderLine = headerLine.charCodeAt(0) === 0xFEFF ? headerLine.substring(1) : headerLine;
            const headers = cleanedHeaderLine.split(',').map(h => h.trim().replace(/"/g, ''));
            
            const requiredHeaders = ["Name", "Price"];
            if (!requiredHeaders.every(h => headers.includes(h))) {
                alert(`CSV must contain at least the following headers: ${requiredHeaders.join(', ')}`);
                return;
            }

            const itemsToImport: Partial<MenuItem>[] = [];
            for (let i = 1; i < lines.length; i++) {
                const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
                const rowData: { [key: string]: string } = headers.reduce((obj, header, index) => {
                    obj[header] = values[index];
                    return obj;
                }, {} as { [key: string]: string });

                const toBoolean = (val: string) => val?.toLowerCase() === 'true' || val === '1';
                
                const item: Partial<MenuItem> = {
                    name: rowData["Name"],
                    category: rowData["Category"],
                    kitchenName: rowData["Kitchen Name"],
                    barcode: rowData["Barcode 1"],
                    price: parseFloat(rowData["Price"]) || 0,
                    takeawayPrice: parseFloat(rowData["Takeout Price"]) || undefined,
                    deliveryPrice: parseFloat(rowData["Delivery Price"]) || undefined,
                    memberPrice1: parseFloat(rowData["Member Price 1"]) || undefined,
                    memberPrice2: parseFloat(rowData["Member Price 2"]) || undefined,
                    memberPrice3: parseFloat(rowData["Member Price 3"]) || undefined,
                    cost: parseFloat(rowData["Cost"]) || undefined,
                    stock: parseFloat(rowData["Qty"]) || undefined,
                    warnQty: parseFloat(rowData["Warn Qty"]) || undefined,
                    stopSaleAtZeroStock: toBoolean(rowData["Stop Sale(QTY=0)"]),
                    askPrice: toBoolean(rowData["Ask Price"]),
                    askQuantity: toBoolean(rowData["Ask Quantity"]),
                    hideName: toBoolean(rowData["Hide Name"]),
                    promptForKitchenNote: toBoolean(rowData["Kitchen Note(Must)"]),
                    alwaysShowModifiers: toBoolean(rowData["Modifier Popup"]),
                    isDiscountable: toBoolean(rowData["Discountable"]),
                    useScale: toBoolean(rowData["Scale"]),
                    kitchenPrinterId: rowData["Kitchen/Tab Printer"],
                    kdsId: rowData["Kitchen Display"],
                    color: rowData["Background"],
                    displayOrder: parseInt(rowData["Sequence"]) || undefined,
                    isActive: toBoolean(rowData["Enabled"]),
                    imageUrl: rowData["Image URL"],
                };
                itemsToImport.push(item);
            }
            handleImportMenuItems(itemsToImport);
        };
        
        reader.readAsText(file);
        target.value = '';
    };

    const triggerImport = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.csv';
        input.onchange = handleFileImport;
        input.click();
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
                            placeholder="Search items..."
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
                        <option value="all">All Categories</option>
                        {categories.map((cat: Category) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                    </select>
                </div>
                <div className="flex gap-2 flex-wrap">
                    <Button onClick={handleBulkEdit} variant="outline" size="sm" className="flex items-center gap-2" disabled={selectedIds.size === 0}>
                        <PencilSquareIcon className="w-5 h-5" /> Bulk Edit ({selectedIds.size})
                    </Button>
                    <Button onClick={triggerImport} variant="outline" size="sm" className="flex items-center gap-2">
                        <ArrowUpTrayIcon className="w-5 h-5" /> Import
                    </Button>
                    <ExportButtons onCsvExport={handleExportToCSV} onPrint={handlePrint} />
                     <button onClick={() => setIsFullScreen(fs => !fs)} title={isFullScreen ? "Exit Full Screen" : "Enter Full Screen"} className="p-2 bg-secondary rounded-lg text-muted-foreground hover:text-foreground">
                        {isFullScreen ? <ArrowsPointingInIcon className="w-5 h-5" /> : <ArrowsPointingOutIcon className="w-5 h-5" />}
                    </button>
                    <button onClick={onAddNew} className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-2 px-3 rounded-lg text-sm">
                        <PlusIcon className="w-5 h-5" /> Add Item
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