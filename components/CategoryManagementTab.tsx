import React, { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import { Category } from '../types';
import PencilSquareIcon from './icons/PencilSquareIcon';
import TrashIcon from './icons/TrashIcon';
import UserPlusIcon from './icons/UserPlusIcon';
import SearchIcon from './icons/SearchIcon';
import { cn } from '../lib/utils';
import ArrowsPointingOutIcon from './icons/ArrowsPointingOutIcon';
import ArrowsPointingInIcon from './icons/ArrowsPointingInIcon';
import ExportButtons from './ExportButtons';

interface CategoryManagementTabProps {
    categories: Category[];
    onAddNew: () => void;
    onEdit: (category: Category) => void;
    onDelete: (categoryId: string) => void;
}

const CategoryManagementTab: React.FC<CategoryManagementTabProps> = ({ categories, onAddNew, onEdit, onDelete }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [columnWidths, setColumnWidths] = useState([400, 200, 150]);
    const tableContainerRef = useRef<HTMLDivElement>(null);

    const resizingColumnIndex = useRef<number | null>(null);
    const startX = useRef(0);
    const startWidths = useRef<number[]>([]);

    const filteredCategories = useMemo(() => {
        const cats = categories || [];
        if (!searchTerm) return cats;
        return cats.filter(category =>
            category.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [categories, searchTerm]);

    const handleCsvExport = () => {
        const headers = ["ID", "Name", "Item Count"];
        const rows = filteredCategories.map(cat => [cat.id, `"${cat.name}"`, cat.itemCount].join(','));
        const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
        const link = document.createElement("a");
        link.setAttribute("href", encodeURI(csvContent));
        link.setAttribute("download", "categories.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handlePrint = () => {
        window.print();
    };

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
        // Cleanup listener on component unmount
        return () => {
             window.removeEventListener('mousemove', onMouseMove);
             window.removeEventListener('mouseup', onMouseUp);
        };
    }, [onMouseMove, onMouseUp]);

    const thClass = "px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider select-none";

    return (
        <div className={cn("flex flex-col h-full", isFullScreen && "fixed inset-0 z-50 bg-card p-6")}>
            <div className="flex justify-between items-center mb-4 gap-4 flex-shrink-0 flex-wrap no-print">
                <div className="flex items-center gap-2">
                     <div className="relative flex-grow max-w-xs">
                        <SearchIcon className="w-5 h-5 text-muted-foreground absolute start-3 top-1/2 -translate-y-1/2 pointer-events-none"/>
                        <input
                            type="search"
                            placeholder="Search categories..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full bg-secondary rounded-lg ps-10 pe-4 py-2 text-foreground border border-border focus:border-primary focus:ring-0"
                        />
                    </div>
                     <ExportButtons onCsvExport={handleCsvExport} onPrint={handlePrint} />
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                    <button onClick={onAddNew} className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-2 px-3 rounded-lg text-sm">
                        <UserPlusIcon className="w-5 h-5" /> Add New Category
                    </button>
                    <button onClick={() => setIsFullScreen(fs => !fs)} title={isFullScreen ? "Exit Full Screen" : "Enter Full Screen"} className="p-2 bg-secondary rounded-lg text-muted-foreground hover:text-foreground">
                        {isFullScreen ? <ArrowsPointingInIcon className="w-5 h-5" /> : <ArrowsPointingOutIcon className="w-5 h-5" />}
                    </button>
                </div>
            </div>
            <div ref={tableContainerRef} className="overflow-auto bg-card rounded-lg flex-grow border border-border printable-area">
                <table className="w-full divide-y divide-border" style={{ tableLayout: 'fixed' }}>
                    <colgroup>
                        <col style={{ width: `${columnWidths[0]}px` }} />
                        <col style={{ width: `${columnWidths[1]}px` }} />
                        <col style={{ width: `${columnWidths[2]}px` }} />
                    </colgroup>
                    <thead className="bg-card sticky top-0 z-10 border-b border-border">
                        <tr>
                            <th className={`${thClass} relative`}>
                                Category Name
                                <div onMouseDown={e => onMouseDown(0, e)} className="absolute top-0 right-0 w-1.5 h-full cursor-col-resize hover:bg-primary/50 transition-colors duration-200"/>
                            </th>
                            <th className={`${thClass} relative`}>
                                Item Count
                                <div onMouseDown={e => onMouseDown(1, e)} className="absolute top-0 right-0 w-1.5 h-full cursor-col-resize hover:bg-primary/50 transition-colors duration-200"/>
                            </th>
                            <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider no-print">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-card divide-y divide-border">
                        {filteredCategories.map(category => (
                            <tr key={category.id}>
                                <td className="px-4 py-3 whitespace-nowrap text-foreground font-medium truncate">{category.name}</td>
                                <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">{category.itemCount}</td>
                                <td className="px-4 py-3 whitespace-nowrap text-right no-print">
                                    <div className="flex gap-2 justify-end">
                                        <button onClick={() => onEdit(category)} className="p-1 text-primary hover:opacity-80">
                                            <PencilSquareIcon className="w-5 h-5" />
                                        </button>
                                        <button onClick={() => onDelete(category.id)} className="p-1 text-destructive hover:opacity-80">
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

export default CategoryManagementTab;
