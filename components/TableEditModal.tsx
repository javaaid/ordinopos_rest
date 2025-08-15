
import React, { useState, useEffect } from 'react';
import { Table } from '../types';

interface TableEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (table: Omit<Table, 'status' | 'orderId' | 'locationId' | 'x' | 'y'>, isNew: boolean) => void;
    onDelete: (tableId: string) => void;
    table: Omit<Table, 'x' | 'y' | 'status' | 'orderId'> | null;
    floors: string[];
    isOccupied: boolean;
    onAddFloor: (floorName: string) => boolean;
}

const TableEditModal: React.FC<TableEditModalProps> = ({ isOpen, onClose, onSave, onDelete, table, floors, isOccupied, onAddFloor }) => {
    const [name, setName] = useState('');
    const [capacity, setCapacity] = useState(4);
    const [shape, setShape] = useState<Table['shape']>('square');
    const [floor, setFloor] = useState('');
    const [newFloorName, setNewFloorName] = useState('');

    useEffect(() => {
        if (table) {
            setName(table.name);
            setCapacity(table.capacity);
            setShape(table.shape);
            setFloor(table.floor);
        } else {
            setName('');
            setCapacity(4);
            setShape('square');
            setFloor(floors[0] || '');
        }
        setNewFloorName('');
    }, [table, floors]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        let finalFloor = floor;
        if (floor === '__NEW__') {
            if (!newFloorName.trim()) {
                alert('Please enter a name for the new floor.');
                return;
            }
            const success = onAddFloor(newFloorName.trim());
            if (!success) return; 
            finalFloor = newFloorName.trim();
        }

        onSave({
            id: table?.id || `table_${Date.now()}`,
            name: name || `T${Math.floor(Math.random() * 100)}`,
            capacity,
            shape,
            floor: finalFloor,
        }, !table);
    };

    const handleDelete = () => {
        if (table && window.confirm(`Are you sure you want to delete table ${table.name}?`)) {
            onDelete(table.id);
        }
    };
    
    const handleFloorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        setFloor(value);
        if (value !== '__NEW__') {
            setNewFloorName('');
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4">
            <div className="bg-card rounded-lg shadow-xl w-full max-w-md border border-border">
                <form onSubmit={handleSubmit}>
                    <div className="p-6 border-b border-border">
                        <h2 className="text-2xl font-bold text-foreground">{table ? 'Edit Table' : 'Add New Table'}</h2>
                    </div>
                    <div className="p-6 space-y-4">
                        <div>
                            <label className="block text-sm text-muted-foreground mb-1">Table Name</label>
                            <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full bg-input p-2 rounded-md border border-border text-foreground" required />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm text-muted-foreground mb-1">Capacity</label>
                                <input type="number" value={capacity} onChange={e => setCapacity(parseInt(e.target.value))} className="w-full bg-input p-2 rounded-md border border-border text-foreground" min="1" required />
                            </div>
                            <div>
                                <label className="block text-sm text-muted-foreground mb-1">Shape</label>
                                <select value={shape} onChange={e => setShape(e.target.value as Table['shape'])} className="w-full bg-input p-2 rounded-md border border-border text-foreground">
                                    <option value="square">Square</option>
                                    <option value="round">Round</option>
                                    <option value="rectangle-h">Rectangle (H)</option>
                                    <option value="rectangle-v">Rectangle (V)</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm text-muted-foreground mb-1">Floor</label>
                            <select value={floor} onChange={handleFloorChange} className="w-full bg-input p-2 rounded-md border border-border text-foreground">
                                {floors.map(f => <option key={f} value={f}>{f}</option>)}
                                <option value="__NEW__">-- Add New Floor --</option>
                            </select>
                            {floor === '__NEW__' && (
                                <input
                                    type="text"
                                    value={newFloorName}
                                    onChange={e => setNewFloorName(e.target.value)}
                                    placeholder="Enter new floor name"
                                    className="mt-2 w-full bg-input p-2 rounded-md border border-border text-foreground"
                                />
                            )}
                        </div>
                    </div>
                    <div className="p-6 border-t border-border flex justify-between items-center">
                        <div>
                            {table && (
                                <button
                                    type="button"
                                    onClick={handleDelete}
                                    disabled={isOccupied}
                                    className="px-4 py-2 rounded-md bg-destructive text-destructive-foreground font-semibold hover:bg-destructive/90 disabled:bg-muted disabled:cursor-not-allowed"
                                    title={isOccupied ? "Cannot delete an occupied table" : ""}
                                >
                                    Delete
                                </button>
                            )}
                        </div>
                        <div className="flex gap-4">
                            <button type="button" onClick={onClose} className="px-6 py-2 rounded-md bg-secondary text-secondary-foreground font-semibold">Cancel</button>
                            <button type="submit" className="px-6 py-2 rounded-md bg-primary text-primary-foreground font-semibold">Save</button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default TableEditModal;