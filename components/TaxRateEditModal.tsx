
import React, { useState, useEffect } from 'react';
import { useDataContext, useAppContext } from '../contexts/AppContext';
import { useTranslations } from '../hooks/useTranslations';
import { Location } from '../types';
import { Modal, ModalHeader, ModalTitle, ModalContent, ModalFooter } from './ui/Modal';
import { Input } from './ui/Input';
import { Button } from './ui/Button';

interface TaxRateEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (name: string, rate: number, locationIds: string[], originalName?: string) => void;
    taxRate: { name: string, rate: number } | null;
    existingNames: string[];
    selectedLocationId?: string; // The location we are viewing in TaxRatesView
}

const TaxRateEditModal: React.FC<TaxRateEditModalProps> = ({ isOpen, onClose, onSave, taxRate, existingNames, selectedLocationId }) => {
    const { locations, settings } = useDataContext();
    const t = useTranslations(settings.language.staff);
    const [name, setName] = useState('');
    const [rate, setRate] = useState(0);
    const [error, setError] = useState('');
    const [selectedLocationIds, setSelectedLocationIds] = useState<Set<string>>(new Set());

    useEffect(() => {
        if (isOpen) {
            if (taxRate) { // Editing
                setName(taxRate.name);
                setRate(taxRate.rate * 100);
                if (selectedLocationId) {
                    setSelectedLocationIds(new Set([selectedLocationId]));
                }
            } else { // Adding
                setName('');
                setRate(0);
                if (selectedLocationId) {
                    setSelectedLocationIds(new Set([selectedLocationId]));
                } else {
                    setSelectedLocationIds(new Set());
                }
            }
            setError('');
        }
    }, [taxRate, isOpen, selectedLocationId]);
    
    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        const trimmedName = name.trim();

        if (!trimmedName) {
            setError('Tax name cannot be empty.');
            return;
        }

        const isNameDuplicate = taxRate ? false : existingNames
            .some(n => n.toLowerCase() === trimmedName.toLowerCase());

        if (isNameDuplicate) {
            setError('A tax rate with this name already exists in the selected location.');
            return;
        }

        if (isNaN(rate) || rate < 0) {
            setError('Rate must be a positive number.');
            return;
        }

        onSave(trimmedName, rate / 100, Array.from(selectedLocationIds), taxRate?.name);
    };

    const handleLocationToggle = (locationId: string) => {
        setSelectedLocationIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(locationId)) {
                newSet.delete(locationId);
            } else {
                newSet.add(locationId);
            }
            return newSet;
        });
    };
    
    const handleSelectAllLocations = (checked: boolean) => {
        if (checked) {
            setSelectedLocationIds(new Set(locations.map((l: Location) => l.id)));
        } else {
            setSelectedLocationIds(new Set());
        }
    };

    const isAllSelected = locations.length > 0 && selectedLocationIds.size === locations.length;


    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4">
            <div className="bg-card rounded-lg shadow-xl w-full max-w-md border border-border">
                <form onSubmit={handleSubmit}>
                    <div className="p-6 border-b border-border">
                        <h2 className="text-2xl font-bold text-foreground text-start rtl:text-end">{taxRate ? t('edit') : t('addNewTaxRate')}</h2>
                    </div>
                    <div className="p-6 space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-muted-foreground mb-1 text-start rtl:text-end">{t('taxName')}</label>
                            <Input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full bg-input p-2 rounded-md border border-border focus:ring-primary focus:border-primary text-foreground" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-muted-foreground mb-1 text-start rtl:text-end">{t('ratePercent')}</label>
                            <Input type="number" value={rate} onChange={e => setRate(parseFloat(e.target.value) || 0)} className="w-full bg-input p-2 rounded-md border border-border focus:ring-primary focus:border-primary text-foreground" step="0.01" min="0" required />
                        </div>
                        {!taxRate && locations.length > 1 && (
                            <div>
                                <label className="block text-sm font-medium text-muted-foreground mb-1 text-start rtl:text-end">{t('applyToLocations')}</label>
                                <div className="max-h-32 overflow-y-auto bg-secondary p-2 rounded-md space-y-1 border border-border">
                                    <label className="flex items-center gap-2 p-1.5 rounded hover:bg-muted cursor-pointer text-start rtl:text-right">
                                        <input type="checkbox" checked={isAllSelected} onChange={e => handleSelectAllLocations(e.target.checked)} className="h-4 w-4 rounded border-border text-primary focus:ring-primary" />
                                        {t('allLocations')}
                                    </label>
                                    {locations.map((loc: Location) => (
                                        <label key={loc.id} className="flex items-center gap-2 p-1.5 rounded hover:bg-muted cursor-pointer">
                                            <input type="checkbox" checked={selectedLocationIds.has(loc.id)} onChange={() => handleLocationToggle(loc.id)} className="h-4 w-4 rounded border-border text-primary focus:ring-primary" />
                                            {loc.name}
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )}
                        {error && <p className="text-destructive text-sm">{error}</p>}
                    </div>
                    <div className="p-6 border-t border-border flex justify-end items-center space-x-4">
                        <button type="button" onClick={onClose} className="px-6 py-2 rounded-md bg-secondary text-secondary-foreground font-semibold hover:bg-muted">{t('cancel')}</button>
                        <button type="submit" className="px-6 py-2 rounded-md bg-primary text-primary-foreground font-semibold hover:bg-primary/90">{t('saveTaxRate')}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default TaxRateEditModal;
