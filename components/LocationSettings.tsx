

import React from 'react';
import { Location } from '../types';
import BuildingStorefrontIcon from './icons/BuildingStorefrontIcon';
import UserPlusIcon from './icons/UserPlusIcon';
import PencilSquareIcon from './icons/PencilSquareIcon';
import TrashIcon from './icons/TrashIcon';
import { useDataContext, useModalContext, useAppContext } from '../contexts/AppContext';
import { useTranslations } from '../hooks/useTranslations';

const LocationSettings: React.FC = () => {
    const { locations, handleSaveLocation, handleDeleteLocation } = useDataContext();
    const { openModal } = useModalContext();
    const { settings } = useAppContext();
    const t = useTranslations(settings.language.staff);

    const onAddNew = () => openModal('locationEdit', { onSave: (loc: Location) => handleSaveLocation(loc, true) });
    const onEdit = (location: Location) => openModal('locationEdit', { location, onSave: (loc: Location) => handleSaveLocation(loc, false) });

    const thClass = "px-4 py-3 text-start rtl:text-end text-xs font-semibold text-muted-foreground uppercase tracking-wider";

    return (
        <div className="p-6 h-full flex flex-col">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-foreground flex items-center gap-2 rtl:text-right">
                    <BuildingStorefrontIcon className="w-6 h-6"/> {t('manageLocations')}
                </h3>
                <button
                    onClick={onAddNew}
                    className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-2 px-4 rounded-lg"
                >
                    <UserPlusIcon className="w-5 h-5" />
                    {t('addLocation')}
                </button>
            </div>
            <div className="overflow-x-auto bg-card rounded-lg flex-grow border border-border">
                <table className="min-w-full divide-y divide-border">
                    <thead className="bg-muted/50 sticky top-0">
                        <tr>
                            <th className={thClass}>{t('name')}</th>
                            <th className={thClass}>{t('tax_rates')}</th>
                            <th className="px-4 py-3 text-end rtl:text-start text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t('actions')}</th>
                        </tr>
                    </thead>
                    <tbody className="bg-card divide-y divide-border">
                        {locations.map((location: Location) => (
                            <tr key={location.id}>
                                <td className="px-4 py-3 text-foreground font-medium">{location.name}</td>
                                <td className="px-4 py-3 text-muted-foreground font-mono text-xs">
                                    {Object.entries(location.taxRates).map(([name, rate]) => `${name}: ${Number(rate)*100}%`).join(', ')}
                                </td>
                                <td className="px-4 py-3 text-end rtl:text-start">
                                    <div className="flex gap-2 justify-end rtl:justify-start">
                                        <button onClick={() => onEdit(location)} className="p-1 text-primary hover:opacity-80"><PencilSquareIcon className="w-5 h-5"/></button>
                                        <button onClick={() => handleDeleteLocation(location.id)} className="p-1 text-destructive hover:opacity-80"><TrashIcon className="w-5 h-5"/></button>
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

export default LocationSettings;