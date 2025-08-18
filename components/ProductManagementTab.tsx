import React, { useState, useCallback, useEffect, useRef } from 'react';
import { MenuItem, Category } from '../types';
import PencilSquareIcon from './icons/PencilSquareIcon';
import TrashIcon from './icons/TrashIcon';
import DocumentDuplicateIcon from './icons/DocumentDuplicateIcon';
import { useDataContext, useAppContext } from '../contexts/AppContext';

interface ProductManagementTabProps {
    menuItems: MenuItem[];
    onEdit: (item: MenuItem) => void;
    onDelete: (id: number) => void;
    onDuplicate: (item: MenuItem) => void;
    selectedIds: Set<number>;
    setSelectedIds: React.Dispatch<React.SetStateAction<Set<number>>>;
}

const ProductManagementTab: React.FC<ProductManagementTabProps> = ({
    menuItems,
    onEdit,
    onDelete,
    onDuplicate,
    selectedIds,
    setSelectedIds
}) => {
    const { categories } = useDataContext();
    const { isAdvancedInventoryPluginActive } = useAppContext();
    
    const baseColumnWidths = [50, 250, 150, 120, 120, 150];
    const inventoryColumnWidths = [50, 250, 150, 120, 100, 120, 150];

    const [columnWidths, setColumnWidths] = useState(
        isAdvancedInventoryPluginActive ? inventoryColumnWidths : baseColumnWidths
    );
    const tableContainerRef = useRef<HTMLDivElement>(null);
    const resizingColumnIndex = useRef<number | null>(null);
    const startX = useRef(0);
    const startWidths = useRef<number[]>([]);

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedIds(new Set(menuItems.map(item => item.id)));
        } else {
            setSelectedIds(new Set());
        }
    };

    const handleSelectOne = (id: number) => {
        setSelectedIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
    };

    const isAllSelected = selectedIds.size > 0 && selectedIds.size === menuItems.length;
    const isIndeterminate = selectedIds.size > 0 && selectedIds.size < menuItems.length;
    
    const onMouseMove = useCallback((e: MouseEvent) => {
        if (resizingColumnIndex.current === null) return;
        const dx = e.clientX - startX.current;
        const newWidth = startWidths.current[resizingColumnIndex.current!] + dx;
        setColumnWidths(prevWidths => {
            const newWidths = [...prevWidths];
            newWidths[resizingColumnIndex.current!] = Math.max(80, newWidth); // Min width 80px
            return newWidths;
        });
    }, []);

    const onMouseUp = useCallback(() => {
        document.body.style.cursor = 'default';
        document.body.style.userSelect = 'auto';
        resizingColumnIndex.current = null;
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);
    }, [onMouseMove]);

    const onMouseDown = useCallback((index: number, e: React.MouseEvent) => {
        e.preventDefault();
        resizingColumnIndex.current = index;
        startX.current = e.clientX;
        startWidths.current = columnWidths;
        document.body.style.cursor = 'col-resize';
        document.body.style.userSelect = 'none';
        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
    }, [columnWidths, onMouseMove, onMouseUp]);
    
    useEffect(() => {
        return () => {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
        };
    }, [onMouseMove, onMouseUp]);

    const thClass = "px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider select-none";

    return (
        <div ref={tableContainerRef} className="flex-grow overflow-y-auto bg-card rounded-lg border border-border">
             <table className="min-w-full divide-y divide-border" style={{ tableLayout: 'fixed' }}>
                <colgroup>
                    {columnWidths.map((width, i) => <col key={i} style={{ width: `${width}px` }} />)}
                </colgroup>
                <thead className="bg-card sticky top-0 z-10 border-b border-border">
                    <tr>
                        <th className={`${thClass} relative`}>
                            <input
                                type="checkbox"
                                className="h-5 w-5 bg-background border-border text-primary focus:ring-primary rounded"
                                checked={isAllSelected}
                                ref={el => { if (el) el.indeterminate = isIndeterminate; }}
                                onChange={handleSelectAll}
                            />
                            <div onMouseDown={e => onMouseDown(0, e)} className="absolute top-0 right-0 w-1.5 h-full cursor-col-resize hover:bg-primary/50 transition-colors duration-200"/>
                        </th>
                        <th className={`${thClass} relative`}>Item Name<div onMouseDown={e => onMouseDown(1, e)} className="absolute top-0 right-0 w-1.5 h-full cursor-col-resize hover:bg-primary/50 transition-colors duration-200"/></th>
                        <th className={`${thClass} relative`}>Category<div onMouseDown={e => onMouseDown(2, e)} className="absolute top-0 right-0 w-1.5 h-full cursor-col-resize hover:bg-primary/50 transition-colors duration-200"/></th>
                        <th className={`${thClass} relative`}>Dine In Price<div onMouseDown={e => onMouseDown(3, e)} className="absolute top-0 right-0 w-1.5 h-full cursor-col-resize hover:bg-primary/50 transition-colors duration-200"/></th>
                        {isAdvancedInventoryPluginActive && <th className={`${thClass} relative`}>Stock<div onMouseDown={e => onMouseDown(4, e)} className="absolute top-0 right-0 w-1.5 h-full cursor-col-resize hover:bg-primary/50 transition-colors duration-200"/></th>}
                        <th className={`${thClass} relative`}>Status<div onMouseDown={e => onMouseDown(isAdvancedInventoryPluginActive ? 5 : 4, e)} className="absolute top-0 right-0 w-1.5 h-full cursor-col-resize hover:bg-primary/50 transition-colors duration-200"/></th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">Actions</th>
                    </tr>
                </thead>
                <tbody className="bg-card divide-y divide-border">
                    {menuItems.map((item: MenuItem) => {
                        const categoryName = categories.find((c: Category) => c.id === item.category)?.name || item.category;
                        return (
                            <tr key={item.id} className={selectedIds.has(item.id) ? 'bg-secondary' : ''}>
                                <td className="px-4 py-3">
                                    <input
                                        type="checkbox"
                                        className="h-5 w-5 bg-background border-border text-primary focus:ring-primary rounded"
                                        checked={selectedIds.has(item.id)}
                                        onChange={() => handleSelectOne(item.id)}
                                    />
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-foreground font-medium truncate">{item.name}</td>
                                <td className="px-4 py-3 whitespace-nowrap text-muted-foreground truncate">{categoryName}</td>
                                <td className="px-4 py-3 whitespace-nowrap text-green-500 dark:text-green-400 font-semibold truncate">${item.price.toFixed(2)}</td>
                                {isAdvancedInventoryPluginActive && <td className="px-4 py-3 whitespace-nowrap text-muted-foreground truncate">{item.stock ?? 'N/A'}</td>}
                                <td className="px-4 py-3 whitespace-nowrap">
                                    <span className={`px-2 py-1 text-xs font-bold rounded-full ${item.isActive !== false ? 'bg-green-500/20 text-green-400' : 'bg-muted text-muted-foreground'}`}>
                                        {item.isActive !== false ? 'Active' : 'Inactive'}
                                    </span>
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-right">
                                    <div className="flex gap-2 justify-end">
                                        <button onClick={() => onDuplicate(item)} className="p-1 text-indigo-500 hover:text-indigo-400" title="Duplicate"><DocumentDuplicateIcon className="w-5 h-5"/></button>
                                        <button onClick={() => onEdit(item)} className="p-1 text-primary hover:opacity-80" title="Edit"><PencilSquareIcon className="w-5 h-5"/></button>
                                        <button onClick={() => onDelete(item.id)} className="p-1 text-destructive hover:opacity-80" title="Delete"><TrashIcon className="w-5 h-5"/></button>
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};

export default ProductManagementTab;