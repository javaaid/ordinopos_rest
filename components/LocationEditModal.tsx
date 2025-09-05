
import React, { useState, useEffect } from 'react';
import { Location } from '../types';
import { COUNTRIES, PIZZA_OPTIONS, BURGER_OPTIONS } from '../constants';
import TrashIcon from './icons/TrashIcon';
import { useAppContext } from '../contexts/AppContext';
import { useTranslations } from '../hooks/useTranslations';

interface LocationEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (location: Location) => void;
    location: Location | null;
}

const LocationEditModal: React.FC<LocationEditModalProps> = ({ isOpen, onClose, onSave, location }) => {
    const { settings } = useAppContext();
    const t = useTranslations(settings.language.staff);
    const [name, setName] = useState('');
    const [taxRates, setTaxRates] = useState<Array<{ id: number; name: string; rate: number }>>([]);
    const [invoiceFooterText, setInvoiceFooterText] = useState('');
    const [countryCode, setCountryCode] = useState('US');
    const [vatNumber, setVatNumber] = useState('');
    const [currency, setCurrency] = useState('$');
    const [address, setAddress] = useState('');
    const [phone, setPhone] = useState('');

    useEffect(() => {
        if (location) {
            setName(location.name);
            setTaxRates(Object.entries(location.taxRates).map(([name, rate], id) => ({ id, name, rate })));
            setInvoiceFooterText(location.invoiceFooterText);
            setCountryCode(location.countryCode || 'US');
            setVatNumber(location.vatNumber || '');
            setCurrency(location.currency || '$');
            setAddress(location.address || '');
            setPhone(location.phone || '');
        } else {
            setName('');
            setTaxRates([{ id: 0, name: t('standard'), rate: 0.10 }]);
            setInvoiceFooterText(t('thankYouBusiness'));
            setCountryCode('US');
            setVatNumber('');
            setCurrency('$');
            setAddress('');
            setPhone('');
        }
    }, [location, isOpen, t]);

    if (!isOpen) return null;

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) {
            alert("Location name is required.");
            return;
        }

        const taxRatesObject = taxRates.reduce((acc, { name, rate }) => {
            if(name.trim()) {
                acc[name.trim()] = rate;
            }
            return acc;
        }, {} as Record<string, number>);

        onSave({
            id: location?.id || `loc_${Date.now()}`,
            name,
            taxRates: taxRatesObject,
            invoiceFooterText,
            countryCode,
            currency,
            address,
            phone,
            vatNumber: countryCode === 'SA' ? vatNumber : undefined,
            pizzaBuilder: location?.pizzaBuilder || PIZZA_OPTIONS,
            burgerBuilder: location?.burgerBuilder || BURGER_OPTIONS,
        });
    };
    
    const handleTaxRateChange = (id: number, field: 'name' | 'rate', value: string) => {
        setTaxRates(prev => prev.map(taxRate => {
            if (taxRate.id === id) {
                if (field === 'rate') {
                    const rateValue = parseFloat(value) / 100;
                    return { ...taxRate, rate: isNaN(rateValue) ? 0 : rateValue };
                }
                return { ...taxRate, name: value };
            }
            return taxRate;
        }));
    };

    const handleAddNewTaxRate = () => {
        setTaxRates(prev => [...prev, { id: Date.now(), name: `New Tax ${prev.length + 1}`, rate: 0 }]);
    };

    const handleDeleteTaxRate = (id: number) => {
        if (taxRates.length <= 1) {
            alert('Cannot delete the last tax rate.');
            return;
        }
        setTaxRates(prev => prev.filter(taxRate => taxRate.id !== id));
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4">
            <div className="bg-card rounded-lg shadow-xl w-full max-w-lg border border-border">
                <form onSubmit={handleSave}>
                    <div className="p-6 border-b border-border">
                        <h2 className="text-2xl font-bold text-foreground text-start rtl:text-end">{location ? t('edit') : t('addNewLocation')}</h2>
                    </div>
                    <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto text-start rtl:text-end">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-muted-foreground mb-1">{t('locationName')}</label>
                                <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full bg-input p-2 rounded-md border border-border text-foreground" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-muted-foreground mb-1">{t('phoneNumber')}</label>
                                <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="w-full bg-input p-2 rounded-md border border-border text-foreground" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-muted-foreground mb-1">{t('address')}</label>
                            <input type="text" value={address} onChange={e => setAddress(e.target.value)} className="w-full bg-input p-2 rounded-md border border-border text-foreground" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <div>
                                <label className="block text-sm font-medium text-muted-foreground mb-1">{t('countryOfOperation')}</label>
                                <select value={countryCode} onChange={e => setCountryCode(e.target.value)} className="w-full bg-input p-2 rounded-md border border-border text-foreground">
                                    {COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}
                                </select>
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-muted-foreground mb-1">{t('currencySymbol')}</label>
                                <input type="text" value={currency} onChange={e => setCurrency(e.target.value)} className="w-full bg-input p-2 rounded-md border border-border text-foreground" maxLength={5} required />
                            </div>
                        </div>

                        {countryCode === 'SA' && (
                            <div>
                                <label className="block text-sm font-medium text-muted-foreground mb-1">VAT Number (for ZATCA)</label>
                                <input type="text" value={vatNumber} onChange={e => setVatNumber(e.target.value)} className="w-full bg-input p-2 rounded-md border border-border text-foreground" />
                            </div>
                        )}

                        <div>
                             <label className="block text-sm font-medium text-muted-foreground mb-1">{t('taxRates')}</label>
                             <div className="space-y-2">
                                 {taxRates.map(({ id, name, rate }) => (
                                    <div key={id} className="flex items-center gap-2">
                                        <input type="text" value={name} onChange={e => handleTaxRateChange(id, 'name', e.target.value)} className="w-1/2 bg-input p-1 rounded-md text-sm capitalize border border-border text-foreground"/>
                                        <input type="number" value={rate * 100} onChange={e => handleTaxRateChange(id, 'rate', e.target.value)} className="w-1/2 bg-input p-1 rounded-md text-sm border border-border text-foreground" step="0.01" />
                                        <span className="text-muted-foreground">%</span>
                                        <button type="button" onClick={() => handleDeleteTaxRate(id)} className="text-destructive hover:opacity-80"><TrashIcon className="w-4 h-4" /></button>
                                    </div>
                                 ))}
                            </div>
                             <button type="button" onClick={handleAddNewTaxRate} className="mt-2 text-sm text-primary hover:underline">{t('addNewTaxRateSmall')}</button>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-muted-foreground mb-1">{t('receiptFooterText')}</label>
                            <textarea value={invoiceFooterText} onChange={e => setInvoiceFooterText(e.target.value)} className="w-full bg-input p-2 rounded-md h-24 border border-border text-foreground"></textarea>
                        </div>
                    </div>
                    <div className="p-6 border-t border-border flex justify-end items-center space-x-4 bg-muted/50 rounded-b-lg">
                        <button type="button" onClick={onClose} className="px-6 py-2 rounded-md bg-secondary text-secondary-foreground font-semibold">{t('cancel')}</button>
                        <button type="submit" className="px-6 py-2 rounded-md bg-primary text-primary-foreground font-semibold hover:bg-primary/90">{t('save')}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LocationEditModal;
