import React, { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import { useDataContext, useModalContext } from '../contexts/AppContext';
import { Surcharge } from '../types';
import PlusIcon from './icons/PlusIcon';
import PencilSquareIcon from './icons/PencilSquareIcon';
import TrashIcon from './icons/TrashIcon';
import DocumentDuplicateIcon from './icons/DocumentDuplicateIcon';
import { cn } from '../lib/utils';
import ArrowsPointingOutIcon from './icons/ArrowsPointingOutIcon';
import ArrowsPointingInIcon from './icons/ArrowsPointingInIcon';
import ExportButtons from './ExportButtons';

const SurchargeManagementTab: React.FC = () => {
    const { surcharges, handleSaveSurcharge, handleDeleteSurcharge } = useDataContext();
    const { openModal, closeModal } = useModalContext();
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [columnWidths, setColumnWidths] = useState([300, 150, 150, 120]);
    const tableContainerRef = useRef<HTMLDivElement>(null);
    const resizingColumnIndex = useRef<number | null>(null);
    const startX = useRef(0);
    const startWidths = useRef<number[]>([]);

    const handleAddNew = () => {
        openModal('surchargeEdit', {
            surcharge: null,
            onSave: (surcharge: Surcharge) => {
                handleSaveSurcharge(surcharge);
                closeModal();
            }
        });
    };

    const handleEdit = (surcharge: Surcharge) => {
        openModal('surchargeEdit', {
            surcharge,
            onSave: (surcharge: Surcharge) => {
                handleSaveSurcharge(surcharge);
                closeModal();
            }
        });
    };

    const handleDuplicate = (surcharge: Surcharge) => {
        handleSaveSurcharge({ ...surcharge, id: `sur_${Date.now()}`, name: `${surcharge.name} (Copy)` });
    };

    const handleCsvExport = () => {
        const headers = ["ID", "Name", "Type", "Value"];
        const rows = (surcharges || []).map((s: Surcharge) => [s.id, `"${s.name}"`, s.type, s.value].join(','));
        const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
        const link = document.createElement("a");
        link.setAttribute("href", encodeURI(csvContent));
        link.setAttribute("download", "surcharges.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
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

    const thClass = "px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider";

    return (
        <div className={cn("p-6 h-full flex flex-col", isFullScreen && "fixed inset-0 z-50 bg-card")}>
            <div className="flex justify-between items-center mb-4 no-print">
                <h3 className="text-xl font-bold text-foreground">Surcharges</h3>
                <div className="flex items-center gap-2">
                    <ExportButtons onCsvExport={handleCsvExport} onPrint={handlePrint} />
                    <button onClick={handleAddNew} className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-2 px-3 rounded-lg text-sm">
                        <PlusIcon className="w-5 h-5" /> Add Surcharge
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
                        <col style={{ width: `${columnWidths[3]}px` }} />
                    </colgroup>
                    <thead className="bg-card sticky top-0 z-10 border-b border-border">
                        <tr>
                            <th className={`${thClass} relative`}>Surcharge Name <div onMouseDown={e => onMouseDown(0, e)} className="absolute top-0 right-0 w-1.5 h-full cursor-col-resize hover:bg-primary/50"/></th>
                            <th className={`${thClass} relative`}>Type <div onMouseDown={e => onMouseDown(1, e)} className="absolute top-0 right-0 w-1.5 h-full cursor-col-resize hover:bg-primary/50"/></th>
                            <th className={`${thClass} relative`}>Value <div onMouseDown={e => onMouseDown(2, e)} className="absolute top-0 right-0 w-1.5 h-full cursor-col-resize hover:bg-primary/50"/></th>
                            <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider no-print">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-card divide-y divide-border">
                        {(surcharges || []).map((surcharge: Surcharge) => (
                            <tr key={surcharge.id}>
                                <td className="px-4 py-3 text-foreground font-medium truncate">{surcharge.name}</td>
                                <td className="px-4 py-3 text-muted-foreground capitalize truncate">{surcharge.type}</td>
                                <td className="px-4 py-3 text-muted-foreground truncate">
                                    {surcharge.type === 'percentage' ? `${surcharge.value}%` : `$${surcharge.value.toFixed(2)}`}
                                </td>
                                <td className="px-4 py-3 text-right no-print">
                                    <div className="flex gap-2 justify-end">
                                        <button onClick={() => handleDuplicate(surcharge)} className="p-1 text-indigo-500 hover:text-indigo-400"><DocumentDuplicateIcon className="w-5 h-5"/></button>
                                        <button onClick={() => handleEdit(surcharge)} className="p-1 text-blue-500 hover:text-blue-400"><PencilSquareIcon className="w-5 h-5"/></button>
                                        <button onClick={() => handleDeleteSurcharge(surcharge.id)} className="p-1 text-destructive hover:opacity-80"><TrashIcon className="w-5 h-5"/></button>
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

export default SurchargeManagementTab;
