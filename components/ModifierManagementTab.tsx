
import React, { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import { useDataContext, useModalContext } from '../contexts/AppContext';
import { ModifierGroup, MenuItem } from '../types';
import PlusIcon from './icons/PlusIcon';
import PencilSquareIcon from './icons/PencilSquareIcon';
import TrashIcon from './icons/TrashIcon';
import SearchIcon from './icons/SearchIcon';
import { cn } from '../lib/utils';
import ArrowsPointingOutIcon from './icons/ArrowsPointingOutIcon';
import ArrowsPointingInIcon from './icons/ArrowsPointingInIcon';
import ExportButtons from './ExportButtons';

const ModifierManagementTab: React.FC = () => {
    const { modifierGroups, menuItems, handleDeleteModifierGroup } = useDataContext();
    const { openModal } = useModalContext();
    const [searchTerm, setSearchTerm] = useState('');
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [columnWidths, setColumnWidths] = useState([250, 150, 150, 150, 120]);
    const tableContainerRef = useRef<HTMLDivElement>(null);
    const resizingColumnIndex = useRef<number | null>(null);
    const startX = useRef(0);
    const startWidths = useRef<number[]>([]);

    const filteredModifierGroups = useMemo(() => {
        const groups = modifierGroups || [];
        if (!searchTerm) return groups;
        return groups.filter((group: ModifierGroup) =>
            group.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [modifierGroups, searchTerm]);

    const handleAddNew = () => {
        openModal('modifierGroupEdit', { modifierGroup: null });
    };

    const handleEdit = (group: ModifierGroup) => {
        openModal('modifierGroupEdit', { modifierGroup: group });
    };

    const itemsUsingGroup = (groupId: string): number => {
        return (menuItems || []).filter((item: MenuItem) => item.modifierGroupIds?.includes(groupId)).length;
    };

    const handleCsvExport = () => {
        const headers = ["ID", "Name", "Options Count", "Allow Multiple", "Is Required"];
        const rows = filteredModifierGroups.map((g: ModifierGroup) => [g.id, `"${g.name}"`, g.options.length, g.allowMultiple, !!g.isRequired].join(','));
        const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
        const link = document.createElement("a");
        link.setAttribute("href", encodeURI(csvContent));
        link.setAttribute("download", "modifier_groups.csv");
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
        <div className={cn("flex flex-col h-full", isFullScreen && "fixed inset-0 z-50 bg-card p-6")}>
            <div className="flex justify-between items-center mb-4 gap-4 no-print">
                 <div className="relative flex-grow max-w-xs">
                    <SearchIcon className="w-5 h-5 text-muted-foreground absolute start-3 top-1/2 -translate-y-1/2 pointer-events-none"/>
                    <input
                        type="search"
                        placeholder="Search modifier groups..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full bg-secondary rounded-lg ps-10 pe-4 py-2 text-foreground border border-border focus:border-primary focus:ring-0"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <ExportButtons onCsvExport={handleCsvExport} onPrint={handlePrint} />
                    <button onClick={handleAddNew} className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-2 px-3 rounded-lg text-sm">
                        <PlusIcon className="w-5 h-5" /> Add New Modifier Group
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
                    </colgroup>
                    <thead className="bg-card sticky top-0 z-10 border-b border-border">
                        <tr>
                            <th className={`${thClass} relative`}>Group Name<div onMouseDown={e => onMouseDown(0, e)} className="absolute top-0 right-0 w-1.5 h-full cursor-col-resize hover:bg-primary/50"/></th>
                            <th className={`${thClass} relative`}>Options<div onMouseDown={e => onMouseDown(1, e)} className="absolute top-0 right-0 w-1.5 h-full cursor-col-resize hover:bg-primary/50"/></th>
                            <th className={`${thClass} relative`}>Rules<div onMouseDown={e => onMouseDown(2, e)} className="absolute top-0 right-0 w-1.5 h-full cursor-col-resize hover:bg-primary/50"/></th>
                            <th className={`${thClass} relative`}>Applied to<div onMouseDown={e => onMouseDown(3, e)} className="absolute top-0 right-0 w-1.5 h-full cursor-col-resize hover:bg-primary/50"/></th>
                            <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider no-print">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-card divide-y divide-border">
                        {filteredModifierGroups.map((group: ModifierGroup) => (
                            <tr key={group.id}>
                                <td className="px-4 py-3 whitespace-nowrap text-foreground font-medium truncate">{group.name}</td>
                                <td className="px-4 py-3 whitespace-nowrap text-muted-foreground text-xs truncate">{group.options.length} options</td>
                                <td className="px-4 py-3 whitespace-nowrap text-muted-foreground text-xs truncate">
                                    {group.allowMultiple && <span className="mr-2">Multi-select</span>}
                                    {group.isRequired && <span>Required</span>}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-muted-foreground text-sm truncate">{itemsUsingGroup(group.id)} item(s)</td>
                                <td className="px-4 py-3 whitespace-nowrap text-right no-print">
                                    <div className="flex gap-2 justify-end">
                                        <button onClick={() => handleEdit(group)} className="p-1 text-primary hover:opacity-80">
                                            <PencilSquareIcon className="w-5 h-5" />
                                        </button>
                                        <button onClick={() => handleDeleteModifierGroup(group.id)} className="p-1 text-destructive hover:opacity-80">
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

export default ModifierManagementTab;
