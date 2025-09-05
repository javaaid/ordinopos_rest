

import React, { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import { useDataContext, useModalContext, useToastContext, useAppContext } from '../contexts/AppContext';
import { useTranslations } from '../hooks/useTranslations';
import { ManualDiscount } from '../types';
import PlusIcon from './icons/PlusIcon';
import PencilSquareIcon from './icons/PencilSquareIcon';
import TrashIcon from './icons/TrashIcon';
import DocumentDuplicateIcon from './icons/DocumentDuplicateIcon';
import { cn } from '../lib/utils';
import ArrowsPointingOutIcon from './icons/ArrowsPointingOutIcon';
import ArrowsPointingInIcon from './icons/ArrowsPointingInIcon';
// FIX: Changed to a named import to resolve "Module has no default export" error.
import { ExportButtons } from './ExportButtons';
import { exportToCsv } from '../lib/utils';

const DiscountManagementTab: React.FC = () => {
    const { manualDiscounts, handleSaveManualDiscount, handleDeleteManualDiscount } = useDataContext();
    const { openModal, closeModal } = useModalContext();
    const { addToast } = useToastContext();
    const { settings } = useAppContext();
    const t = useTranslations(settings.language.staff);
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [columnWidths, setColumnWidths] = useState([400, 200, 120]);
    const tableContainerRef = useRef<HTMLDivElement>(null);
    const resizingColumnIndex = useRef<number | null>(null);
    const startX = useRef(0);
    const startWidths = useRef<number[]>([]);

    const handleAddNew = () => {
        openModal('discountEdit', {
            discount: null,
            onSave: (discount: ManualDiscount) => {
                handleSaveManualDiscount(discount);
                closeModal();
            }
        });
    };

    const handleEdit = (discount: ManualDiscount) => {
        openModal('discountEdit', {
            discount,
            onSave: (discount: ManualDiscount) => {
                handleSaveManualDiscount(discount);
                closeModal();
            }
        });
    };
    
    const handleDuplicate = (discount: ManualDiscount) => {
        handleSaveManualDiscount({ ...discount, id: `md_${Date.now()}`, name: `${discount.name} (Copy)` });
    };
    
    const handleCsvExport = (filename: string = 'manual_discounts.csv') => {
        const headers = ["ID", "Name", "Percentage"];
        const rows = (manualDiscounts || []).map((d: ManualDiscount) => [d.id, d.name, d.percentage]);
        exportToCsv(headers, rows, filename);
        addToast({ type: 'success', title: 'Export Successful', message: `Exported ${rows.length} discounts.` });
    };

    const handlePrint = () => window.print();

    const onMouseMove = useCallback((e: MouseEvent) => {
        if (resizingColumnIndex.current === null) return;
        const dx = e.clientX - startX.current;
        const newWidth = startWidths.current[resizingColumnIndex.current!] + dx;
        setColumnWidths(prevWidths => {
            const newWidths = [...prevWidths];
            newWidths[resizingColumnIndex.current!] = Math.max(100, newWidth);
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

    const thClass = "px-4 py-3 text-start text-xs font-semibold text-muted-foreground uppercase tracking-wider";

    return (
        <div className={cn("p-6 h-full flex flex-col", isFullScreen && "fixed inset-0 z-50 bg-card")}>
            <div className="flex justify-between items-center mb-4 no-print">
                <h3 className="text-xl font-bold text-foreground">{t('manualDiscounts')}</h3>
                <div className="flex items-center gap-2">
                    <ExportButtons onCsvExport={handleCsvExport} onPrint={handlePrint} />
                    <button onClick={handleAddNew} className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-2 px-3 rounded-lg text-sm">
                        <PlusIcon className="w-5 h-5" /> {t('addDiscount')}
                    </button>
                    <button onClick={() => setIsFullScreen(fs => !fs)} title={isFullScreen ? "Exit Full Screen" : "Enter Full Screen"} className="p-2 bg-secondary rounded-lg text-muted-foreground hover:text-foreground">
                        {isFullScreen ? <ArrowsPointingInIcon className="w-5 h-5" /> : <ArrowsPointingOutIcon className="w-5 h-5" />}
                    </button>
                </div>
            </div>
            <div ref={tableContainerRef} className="overflow-auto bg-card rounded-lg flex-grow border border-border printable-area">
                <table className="min-w-full divide-y divide-border" style={{ tableLayout: 'fixed' }}>
                    <colgroup>
                        <col style={{ width: `${columnWidths[0]}px` }} />
                        <col style={{ width: `${columnWidths[1]}px` }} />
                        <col style={{ width: `${columnWidths[2]}px` }} />
                    </colgroup>
                    <thead className="bg-card sticky top-0 z-10 border-b border-border">
                        <tr>
                            <th className={`${thClass} relative`}>Discount Name <div onMouseDown={e => onMouseDown(0, e)} className="absolute top-0 right-0 w-1.5 h-full cursor-col-resize hover:bg-primary/50"/></th>
                            <th className={`${thClass} relative`}>Percentage <div onMouseDown={e => onMouseDown(1, e)} className="absolute top-0 right-0 w-1.5 h-full cursor-col-resize hover:bg-primary/50"/></th>
                            <th className="px-4 py-3 text-end text-xs font-semibold text-muted-foreground uppercase tracking-wider no-print">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-card divide-y divide-border">
                        {(manualDiscounts || []).map((discount: ManualDiscount) => (
                            <tr key={discount.id}>
                                <td className="px-4 py-3 text-foreground font-medium truncate">{discount.name}</td>
                                <td className="px-4 py-3 text-muted-foreground truncate">{(discount.percentage * 100).toFixed(2)}%</td>
                                <td className="px-4 py-3 text-end no-print">
                                    <div className="flex gap-2 justify-end">
                                        <button onClick={() => handleDuplicate(discount)} className="p-1 text-indigo-500 hover:text-indigo-400"><DocumentDuplicateIcon className="w-5 h-5"/></button>
                                        <button onClick={() => handleEdit(discount)} className="p-1 text-blue-500 hover:text-blue-400"><PencilSquareIcon className="w-5 h-5"/></button>
                                        <button onClick={() => handleDeleteManualDiscount(discount.id)} className="p-1 text-destructive hover:opacity-80"><TrashIcon className="w-5 h-5"/></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default DiscountManagementTab;