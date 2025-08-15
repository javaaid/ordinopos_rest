

import React, { useState } from 'react';
import UserPlusIcon from './icons/UserPlusIcon';
import PencilSquareIcon from './icons/PencilSquareIcon';
import TrashIcon from './icons/TrashIcon';
import { useDataContext, useModalContext, useAppContext } from '../contexts/AppContext';
import ExportButtons from './ExportButtons';
import { Location } from '../types';
import { Select } from './ui/Select';

const TaxRatesView: React.FC = () => {
    const { locations, handleSaveTaxRate, handleDeleteTaxRate } = useDataContext();
    const { currentLocation, onLocationChange } = useAppContext();
    const { openModal } = useModalContext();

    const [selectedLocationId, setSelectedLocationId] = useState(currentLocation.id);

    const selectedLocation = locations.find((l: Location) => l.id === selectedLocationId) || currentLocation;
    const taxRates = selectedLocation.taxRates;

    const onAddNew = () => openModal('taxRateEdit', { 
        onSave: (name: string, rate: number, locationIds: string[]) => handleSaveTaxRate(name, rate, locationIds), 
        existingNames: Object.keys(taxRates),
        selectedLocationId: selectedLocationId
    });
    
    const onEdit = (name: string, rate: number) => openModal('taxRateEdit', { 
        taxRate: { name, rate }, 
        onSave: (newName: string, newRate: number, locationIds: string[], oldName?: string) => handleSaveTaxRate(newName, newRate, locationIds, oldName), 
        existingNames: Object.keys(taxRates),
        selectedLocationId: selectedLocationId
    });
    
    const handleCsvExport = () => {
        const headers = ["Location", "Tax Name", "Rate"];
        const rows = Object.entries(taxRates).map(([name, rate]) => [`"${selectedLocation.name}"`, `"${name}"`, rate].join(','));
        const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
        const link = document.createElement("a");
        link.setAttribute("href", encodeURI(csvContent));
        link.setAttribute("download", `tax_rates_${selectedLocation.name}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handlePrint = () => window.print();

    const thClass = "px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider";

    return (
        <div className="p-6 h-full flex flex-col">
            <div className="flex justify-between items-center mb-4 no-print flex-wrap gap-4">
                <div className="flex-grow">
                    <h2 className="text-2xl font-bold text-foreground">Manage Tax Rates</h2>
                    <p className="text-sm text-muted-foreground">Select a location to view and manage its tax rates.</p>
                </div>
                <div className="flex items-center gap-2">
                    <ExportButtons onCsvExport={handleCsvExport} onPrint={handlePrint} />
                    <button
                        onClick={onAddNew}
                        className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-2 px-4 rounded-lg"
                    >
                        <UserPlusIcon className="w-5 h-5" />
                        Add Tax Rate
                    </button>
                </div>
            </div>
            <div className="mb-4 max-w-sm no-print">
                <label className="block text-sm font-medium text-muted-foreground mb-1">Location</label>
                <Select value={selectedLocationId} onChange={e => setSelectedLocationId(e.target.value)}>
                    {locations.map((l: Location) => (
                        <option key={l.id} value={l.id}>{l.name}</option>
                    ))}
                </Select>
            </div>
            <div className="overflow-x-auto bg-card rounded-lg flex-grow border border-border printable-area">
                <table className="min-w-full divide-y divide-border">
                    <thead className="bg-muted/50 sticky top-0">
                        <tr>
                            <th className={thClass}>Tax Name</th>
                            <th className={thClass}>Rate (%)</th>
                            <th className={`${thClass} no-print`}>Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-card divide-y divide-border">
                        {Object.entries(taxRates).map(([name, rate]: [string, number]) => (
                            <tr key={name}>
                                <td className="px-4 py-3 whitespace-nowrap text-foreground font-medium">{name}</td>
                                <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">{(rate * 100).toFixed(2)}%</td>
                                <td className="px-4 py-3 whitespace-nowrap no-print">
                                    <div className="flex gap-4">
                                        <button onClick={() => onEdit(name, rate)} className="text-primary hover:opacity-80">
                                            <PencilSquareIcon className="w-5 h-5" />
                                        </button>
                                        <button onClick={() => handleDeleteTaxRate(name, selectedLocationId)} className="text-destructive hover:opacity-80">
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

export default TaxRatesView;