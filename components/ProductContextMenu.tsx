import React from 'react';
import { MenuItem } from '../types';
import PencilSquareIcon from './icons/PencilSquareIcon';

interface ProductContextMenuProps {
    item: MenuItem;
    x: number;
    y: number;
    onClose: () => void;
    onEdit: () => void;
}

const ProductContextMenu: React.FC<ProductContextMenuProps> = ({ item, x, y, onClose, onEdit }) => {
    const handleEdit = (e: React.MouseEvent) => {
        e.stopPropagation();
        onEdit();
    };

    return (
        <div
            className="fixed bg-popover rounded-lg shadow-2xl border border-border p-1 z-50 text-popover-foreground animate-fade-in-down"
            style={{ top: y, left: x }}
            onClick={(e) => e.stopPropagation()}
            onContextMenu={(e) => e.preventDefault()}
        >
            <ul className="text-sm">
                <li>
                    <button
                        onClick={handleEdit}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-md hover:bg-muted"
                    >
                        <PencilSquareIcon className="w-4 h-4" />
                        Edit {item.name}
                    </button>
                </li>
            </ul>
        </div>
    );
};

export default ProductContextMenu;