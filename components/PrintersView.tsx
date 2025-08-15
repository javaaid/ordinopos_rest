
import React, { useState } from 'react';
import { Printer } from '../types';
import { useDataContext, useModalContext, useAppContext, useToastContext } from '../contexts/AppContext';
import PlusIcon from './icons/PlusIcon';
import PencilSquareIcon from './icons/PencilSquareIcon';
import TrashIcon from './icons/TrashIcon';
import { Button } from './ui/Button';
import PrinterSettingsView from './PrinterSettingsView';
import KitchenPrinterProfilesView from './KitchenPrinterProfilesView';
import SignalIcon from './icons/SignalIcon';

const PrintersView: React.FC = () => {
    const { printers, handleSavePrinter, handleDeletePrinter } = useDataContext();
    const { settings } = useAppContext();
    const { addToast } = useToastContext();
    const { openModal, closeModal } = useModalContext();
    const [editingPrinter, setEditingPrinter] = useState<Printer | null>(null);

    const handleEdit = (printer: Printer) => {
        setEditingPrinter(printer);
    };

    const handleAddNew = () => {
        openModal('printerEdit', { 
            printer: null,
            onSave: (p: Printer) => { 
                handleSavePrinter(p); 
                closeModal(); 
            } 
        });
    };
    
    const handleSave = (printer: Printer) => {
        handleSavePrinter(printer);
        setEditingPrinter(null);
    };

    const handleBack = () => {
        setEditingPrinter(null);
    };

    const handleDiscoverPrinters = async () => {
        addToast({ type: 'info', title: 'Discovery Started', message: 'Simulating search for printers on the network...' });
        
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Simulated list of printers that could be found
        const discoveredPrinterNames = [
            "Epson TM-T88VI (192.168.1.50)",
            "Star TSP100 (192.168.1.51)",
            "Generic USB Thermal Printer"
        ];

        const existingNames = new Set((printers || []).map((p: Printer) => p.name));
        const newPrinters = discoveredPrinterNames.filter((name: string) => !existingNames.has(name));

        if (newPrinters.length > 0) {
            newPrinters.forEach((name: string) => {
                const newPrinter: Printer = {
                    id: `p_${Date.now()}_${Math.random()}`,
                    name,
                    type: 'thermal',
                    connection: name.includes('USB') ? 'USB' : 'Print Server',
                    isEnabled: true,
                    status: 'connected',
                    paperWidth: 80,
                    isDefault: false,
                    ipAddress: name.includes('(') ? name.substring(name.indexOf('(') + 1, name.indexOf(')')) : undefined
                };
                handleSavePrinter(newPrinter);
            });
            addToast({ type: 'success', title: 'Discovery Successful', message: `Added ${newPrinters.length} new printer(s).` });
        } else {
            addToast({ type: 'info', title: 'No New Printers', message: 'All discovered printers are already configured.' });
        }
    };

    if (editingPrinter) {
        if (editingPrinter.isProfileHub) {
            return <KitchenPrinterProfilesView printer={editingPrinter} onBack={handleBack} onSave={handleSave} />;
        }
        return <PrinterSettingsView printer={editingPrinter} onBack={handleBack} onSave={handleSave} />;
    }

    const thClass = "px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider";

    return (
        <div className="p-6 h-full flex flex-col">
            <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
                <h2 className="text-2xl font-bold text-foreground">Manage Printers</h2>
                <div className="flex items-center gap-2">
                     <Button variant="outline" onClick={handleDiscoverPrinters} className="flex items-center gap-2">
                        <SignalIcon className="w-5 h-5" /> Discover Printers
                    </Button>
                    <Button onClick={handleAddNew} className="flex items-center gap-2">
                        <PlusIcon className="w-5 h-5" /> Add Printer
                    </Button>
                </div>
            </div>
            <div className="overflow-x-auto bg-card rounded-lg flex-grow border border-border">
                <table className="min-w-full divide-y divide-border">
                    <thead className="bg-muted/50">
                        <tr>
                            <th className={thClass}>Name</th>
                            <th className={thClass}>Type</th>
                            <th className={thClass}>Connection</th>
                            <th className={thClass}>IP Address / ID</th>
                            <th className={thClass}>Status</th>
                            <th className={thClass}>Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-card divide-y divide-border">
                        {(printers || []).map((p: Printer) => (
                            <tr key={p.id} className="hover:bg-muted/50">
                                <td className="px-4 py-3 font-medium text-foreground">{p.name}</td>
                                <td className="px-4 py-3 capitalize text-muted-foreground">{p.type}</td>
                                <td className="px-4 py-3 text-muted-foreground">{p.connection}</td>
                                <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{p.ipAddress || 'N/A'}</td>
                                <td className="px-4 py-3">
                                    <span className={`px-2 py-1 text-xs font-bold rounded-full ${p.status === 'connected' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                        {p.status}
                                    </span>
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex gap-4">
                                        <button onClick={() => handleEdit(p)} className="text-primary hover:opacity-80"><PencilSquareIcon className="w-5 h-5"/></button>
                                        <button onClick={() => handleDeletePrinter(p.id)} className="text-destructive hover:opacity-80"><TrashIcon className="w-5 h-5"/></button>
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

export default PrintersView;
