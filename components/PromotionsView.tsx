



import React, { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import { Promotion } from '../types';
import PlusIcon from './icons/PlusIcon';
import PencilSquareIcon from './icons/PencilSquareIcon';
import TrashIcon from './icons/TrashIcon';
import { useDataContext, useModalContext, useToastContext, useAppContext } from '../contexts/AppContext';
import { useTranslations } from '../hooks/useTranslations';
import { cn } from '../lib/utils';
import ArrowsPointingOutIcon from './icons/ArrowsPointingOutIcon';
import ArrowsPointingInIcon from './icons/ArrowsPointingInIcon';
import { ExportButtons } from './ExportButtons';
import { exportToCsv } from '../lib/utils';

const PromotionsView: React.FC = () => {
    const { promotions, handleDeletePromotion, handleSavePromotion } = useDataContext();
    const { openModal } = useModalContext();
    const { addToast } = useToastContext();
    const { settings } = useAppContext();
    const t = useTranslations(settings.language.staff);
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [columnWidths, setColumnWidths] = useState([300, 200, 200, 120, 120]);
    const tableContainerRef = useRef<HTMLDivElement>(null);
    const resizingColumnIndex = useRef<number | null>(null);
    const startX = useRef(0);
    const startWidths = useRef<number[]>([]);

    const handleAddNew = () => {
        openModal('promotionEdit', { onSave: handleSavePromotion });
    };

    const handleEdit = (promotion: Promotion) => {
        openModal('promotionEdit', { promotion, onSave: handleSavePromotion });
    };

    const handleToggleActive = (promotion: Promotion) => {
        handleSavePromotion({ ...promotion, isActive: !promotion.isActive });
    };
    
    const handleCsvExport = (filename: string = 'promotions.csv') => {
        const headers = ["ID", "Name", "Type", "Value", "Active"];
        const rows = (promotions || []).map((p: Promotion) => [p.id, p.name, p.type, p.value, p.isActive]);
        exportToCsv(headers, rows, filename);
        addToast({ type: 'success', title: 'Export Successful', message: `Exported ${rows.length} promotions.` });
    };

    const handlePrint = () => window.print();

    const onMouseMove = useCallback((e: MouseEvent) => {
        if (resizingColumnIndex.current === null) return;
        const dx = e.clientX - startX.current;
        const newWidth = startWidths.current[resizingColumnIndex.current] + dx;
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
                <h2 className="text-2xl font-bold text-foreground">{t('managePromotions')}</h2>
                 <div className="flex items-center gap-2">
                    <ExportButtons onCsvExport={handleCsvExport} onPrint={handlePrint} />
                    <button
                        onClick={handleAddNew}
                        className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-2 px-4 rounded-lg"
                    >
                        <PlusIcon className="w-5 h-5" />
                        {t('addPromotion')}
                    </button>
                    <button onClick={() => setIsFullScreen(fs => !fs)} title={isFullScreen ? "Exit Full Screen" : "Enter Full Screen"} className="p-2 bg-secondary rounded-lg text-muted-foreground hover:text-foreground">
                        {isFullScreen ? <ArrowsPointingInIcon className="w-5 h-5" /> : <ArrowsPointingOutIcon className="w-5 h-5" />}
                    </button>
                </div>
            </div>
            <div ref={tableContainerRef} className="overflow-auto bg-card rounded-lg flex-grow border border-border printable-area">
                <table className="min-w-full divide-y divide-border" style={{ tableLayout: 'fixed' }}>
                    <colgroup>
                        {columnWidths.map((width, i) => <col key={i} style={{ width: `${width}px` }} />)}
                        <col style={{ width: `120px` }} />
                    </colgroup>
                    <thead className="bg-card sticky top-0 z-10 border-b border-border">
                        <tr>
                            <th className={`${thClass} relative`}>Name<div onMouseDown={e => onMouseDown(0, e)} className="absolute top-0 right-0 w-1.5 h-full cursor-col-resize hover:bg-primary/50"/></th>
                            <th className={`${thClass} relative`}>Discount<div onMouseDown={e => onMouseDown(1, e)} className="absolute top-0 right-0 w-1.5 h-full cursor-col-resize hover:bg-primary/50"/></th>
                            <th className={`${thClass} relative`}>Schedule<div onMouseDown={e => onMouseDown(2, e)} className="absolute top-0 right-0 w-1.5 h-full cursor-col-resize hover:bg-primary/50"/></th>
                            <th className={`${thClass} relative`}>Status<div onMouseDown={e => onMouseDown(3, e)} className="absolute top-0 right-0 w-1.5 h-full cursor-col-resize hover:bg-primary/50"/></th>
                            <th className="px-4 py-3 text-end text-xs font-semibold text-muted-foreground uppercase tracking-wider no-print">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-card divide-y divide-border">
                        {(promotions || []).map((promo: Promotion) => (
                            <tr key={promo.id}>
                                <td className="px-4 py-3 whitespace-nowrap text-foreground font-medium truncate">{promo.name}</td>
                                <td className="px-4 py-3 whitespace-nowrap text-muted-foreground truncate">
                                    {promo.type === 'percentage' ? `${promo.value * 100}% off` : (promo.type === 'bogo' ? 'BOGO' : `$${promo.value.toFixed(2)} off`)}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-muted-foreground text-sm truncate">
                                    {promo.startTime} - {promo.endTime}
                                </td>
                                 <td className="px-4 py-3">
                                    <button
                                        onClick={() => handleToggleActive(promo)}
                                        className={`px-2 py-0.5 text-xs font-semibold rounded-full ${promo.isActive ? 'bg-green-500 text-white' : 'bg-muted text-muted-foreground'}`}
                                    >
                                        {promo.isActive ? 'Active' : 'Inactive'}
                                    </button>
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-end no-print">
                                    <div className="flex gap-4 justify-end">
                                        <button onClick={() => handleEdit(promo)} className="text-primary hover:opacity-80">
                                            <PencilSquareIcon className="w-5 h-5" />
                                        </button>
                                        <button onClick={() => handleDeletePromotion(promo.id)} className="text-destructive hover:opacity-80">
                                            <TrashIcon className="w-5 h-5" />
                                        </button>
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

export default PromotionsView;