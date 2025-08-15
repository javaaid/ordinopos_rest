import React, { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import { useDataContext, useModalContext } from '../contexts/AppContext';
import { KitchenNote } from '../types';
import PlusIcon from './icons/PlusIcon';
import PencilSquareIcon from './icons/PencilSquareIcon';
import TrashIcon from './icons/TrashIcon';
import DocumentDuplicateIcon from './icons/DocumentDuplicateIcon';
import { cn } from '../lib/utils';
import ArrowsPointingOutIcon from './icons/ArrowsPointingOutIcon';
import ArrowsPointingInIcon from './icons/ArrowsPointingInIcon';
import ExportButtons from './ExportButtons';

const KitchenNoteManagementTab: React.FC = () => {
    const { kitchenNotes, handleSaveKitchenNote, handleDeleteKitchenNote } = useDataContext();
    const { openModal, closeModal } = useModalContext();
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [columnWidths, setColumnWidths] = useState([600, 120]);
    const tableContainerRef = useRef<HTMLDivElement>(null);
    const resizingColumnIndex = useRef<number | null>(null);
    const startX = useRef(0);
    const startWidths = useRef<number[]>([]);

    const handleAddNew = () => {
        openModal('textInput', {
            title: 'Add Kitchen Note',
            label: 'Note Text',
            onSubmit: (note: string) => {
                handleSaveKitchenNote({ id: `kn_${Date.now()}`, note });
                closeModal();
            }
        });
    };

    const handleEdit = (note: KitchenNote) => {
        openModal('textInput', {
            title: 'Edit Kitchen Note',
            label: 'Note Text',
            initialValue: note.note,
            onSubmit: (newNote: string) => {
                handleSaveKitchenNote({ id: note.id, note: newNote });
                closeModal();
            }
        });
    };
    
    const handleDuplicate = (note: KitchenNote) => {
        handleSaveKitchenNote({ ...note, id: `kn_${Date.now()}`, note: `${note.note} (Copy)` });
    };

     const handleCsvExport = () => {
        const headers = ["ID", "Note"];
        const rows = (kitchenNotes || []).map((n: KitchenNote) => [n.id, `"${n.note}"`].join(','));
        const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
        const link = document.createElement("a");
        link.setAttribute("href", encodeURI(csvContent));
        link.setAttribute("download", "kitchen_notes.csv");
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
                <h3 className="text-xl font-bold text-foreground">Pre-defined Kitchen Notes</h3>
                <div className="flex items-center gap-2">
                    <ExportButtons onCsvExport={handleCsvExport} onPrint={handlePrint} />
                    <button onClick={handleAddNew} className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-2 px-3 rounded-lg text-sm">
                        <PlusIcon className="w-5 h-5" /> Add Note
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
                    </colgroup>
                    <thead className="bg-card sticky top-0 z-10 border-b border-border">
                        <tr>
                            <th className={`${thClass} relative`}>Note <div onMouseDown={e => onMouseDown(0, e)} className="absolute top-0 right-0 w-1.5 h-full cursor-col-resize hover:bg-primary/50"/></th>
                            <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider no-print">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-card divide-y divide-border">
                        {(kitchenNotes || []).map((note: KitchenNote) => (
                            <tr key={note.id}>
                                <td className="px-4 py-3 text-foreground font-medium truncate">{note.note}</td>
                                <td className="px-4 py-3 text-right no-print">
                                    <div className="flex gap-2 justify-end">
                                        <button onClick={() => handleDuplicate(note)} className="p-1 text-indigo-500 hover:text-indigo-400"><DocumentDuplicateIcon className="w-5 h-5"/></button>
                                        <button onClick={() => handleEdit(note)} className="p-1 text-blue-500 hover:text-blue-400"><PencilSquareIcon className="w-5 h-5"/></button>
                                        <button onClick={() => handleDeleteKitchenNote(note.id)} className="p-1 text-destructive hover:opacity-80"><TrashIcon className="w-5 h-5"/></button>
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

export default KitchenNoteManagementTab;
