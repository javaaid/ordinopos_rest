
import React, { useState } from 'react';
import { Printer, KitchenProfileType, KitchenPrintSettings } from '../types';
import { DEFAULT_KITCHEN_PRINT_SETTINGS, KITCHEN_PROFILE_NAMES } from '../constants';
import KitchenPrintSettingsView from './KitchenPrintSettingsView';
import ArrowLeftIcon from './icons/ArrowLeftIcon';
import { Button } from './ui/Button';

interface KitchenPrinterProfilesViewProps {
    printer: Printer;
    onBack: () => void;
    onSave: (printer: Printer) => void;
}

const KitchenPrinterProfilesView: React.FC<KitchenPrinterProfilesViewProps> = ({ printer, onBack, onSave }) => {
    const [editingProfile, setEditingProfile] = useState<KitchenProfileType | null>(null);
    const [printerData, setPrinterData] = useState<Printer>(printer);

    const handleSaveProfileSettings = (profileKey: KitchenProfileType, newSettings: KitchenPrintSettings) => {
        setPrinterData(prev => ({
            ...prev,
            kitchenProfiles: {
                ...prev.kitchenProfiles,
                [profileKey]: newSettings,
            }
        }));
        setEditingProfile(null);
    };

    if (editingProfile) {
        const profileSettings = printerData.kitchenProfiles?.[editingProfile] || DEFAULT_KITCHEN_PRINT_SETTINGS;
        const profileName = KITCHEN_PROFILE_NAMES[editingProfile];

        return (
            <KitchenPrintSettingsView
                settings={profileSettings}
                profileName={profileName}
                paperWidth={printerData.paperWidth || 80}
                onBack={() => setEditingProfile(null)}
                onSave={(newSettings) => handleSaveProfileSettings(editingProfile, newSettings as KitchenPrintSettings)}
            />
        );
    }
    
    const PROFILES_TO_SHOW: { id: KitchenProfileType, name: string }[] = [
        { id: 'kitchen_1', name: KITCHEN_PROFILE_NAMES['kitchen_1'] },
        { id: 'kitchen_2', name: KITCHEN_PROFILE_NAMES['kitchen_2'] },
        { id: 'kitchen_3', name: KITCHEN_PROFILE_NAMES['kitchen_3'] },
        { id: 'kitchen_4', name: KITCHEN_PROFILE_NAMES['kitchen_4'] },
        { id: 'kitchen_5', name: KITCHEN_PROFILE_NAMES['kitchen_5'] },
        { id: 'kitchen_6', name: KITCHEN_PROFILE_NAMES['kitchen_6'] },
        { id: 'bar', name: KITCHEN_PROFILE_NAMES['bar'] },
    ];

    return (
        <div className="h-full flex flex-col bg-background text-foreground">
            <header className="flex-shrink-0 bg-card p-3 flex justify-between items-center border-b border-border">
                <div className="flex items-center gap-4">
                    <button type="button" onClick={onBack} className="text-muted-foreground hover:text-foreground">
                        <ArrowLeftIcon className="w-6 h-6" />
                    </button>
                    <h2 className="text-lg font-bold">{printer.name} Profiles</h2>
                </div>
                <Button onClick={() => onSave(printerData)} className="px-8">Save Changes</Button>
            </header>
            <main className="flex-grow p-6 overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {PROFILES_TO_SHOW.map(profile => (
                        <button
                            key={profile.id}
                            onClick={() => setEditingProfile(profile.id)}
                            className="bg-card p-6 rounded-lg text-left hover:bg-muted transition-colors border border-border shadow-sm"
                        >
                            <h3 className="text-xl font-bold text-foreground">{profile.name}</h3>
                            <p className="text-sm text-muted-foreground mt-1">Configure print settings for this station.</p>
                        </button>
                    ))}
                </div>
            </main>
        </div>
    );
};

export default KitchenPrinterProfilesView;
