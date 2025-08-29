

import React, { useState, useEffect } from 'react';
import { useAppContext, useDataContext, useToastContext, useModalContext } from '../contexts/AppContext';
import { AppSettings, DeviceSettings, Printer, KitchenDisplay, CustomerDisplay, GenericDevice } from '../types';
import ServerStackIcon from './icons/ServerStackIcon';
import { Button } from './ui/Button';
import { Select } from './ui/Select';
import { Input } from './ui/Input';
import QuestionMarkCircleIcon from './icons/QuestionMarkCircleIcon';
import PingButton from './PingButton';

const DeviceSettingsView: React.FC = () => {
    const { settings, setSettings } = useAppContext();
    const { printers, kitchenDisplays, customerDisplays, scales } = useDataContext();
    const { addToast } = useToastContext();
    const { openModal } = useModalContext();
    const [localSettings, setLocalSettings] = useState<DeviceSettings>(settings.devices);

    useEffect(() => {
        setLocalSettings(settings.devices);
    }, [settings.devices]);

    const handleSave = () => {
        setSettings((prev: AppSettings) => ({
            ...prev,
            devices: localSettings,
        }));
        addToast({ type: 'success', title: 'Settings Saved', message: 'Device assignments have been updated.' });
    };

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
        const { name, value } = e.target;
        setLocalSettings(prev => ({ ...prev, [name]: value || null }));
    };

    const renderPrinterSelect = (id: keyof DeviceSettings, label: string, availablePrinters: Printer[]) => (
         <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">{label}</label>
            <Select name={id} value={localSettings[id] || ''} onChange={handleChange}>
                <option value="">-- Not Assigned --</option>
                {(availablePrinters || []).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </Select>
        </div>
    );
    
    const renderDeviceSelect = (id: keyof DeviceSettings, label: string, availableDevices: any[]) => (
         <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">{label}</label>
            <Select name={id} value={localSettings[id] || ''} onChange={handleChange}>
                <option value="">-- Not Assigned --</option>
                {(availableDevices || []).map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </Select>
        </div>
    );

    return (
         <div className="h-full flex flex-col p-6">
             <h3 className="text-xl font-bold text-foreground mb-2 flex items-center gap-2">
                <ServerStackIcon className="w-6 h-6" /> Device Assignment
            </h3>
            <p className="text-sm text-muted-foreground mb-6">Assign default devices for different functions. Manage the devices themselves under the main "Printers" settings tab.</p>
            <div className="space-y-6 max-w-2xl overflow-y-auto pr-2">
                <div className="bg-card p-6 rounded-lg space-y-4 border border-border">
                    <h4 className="font-bold text-foreground">Printers</h4>
                    {renderPrinterSelect('receiptPrinterId', 'Default Receipt Printer', printers)}
                    {renderPrinterSelect('kitchenPrinterId', 'Default Kitchen Printer', printers)}
                    {renderPrinterSelect('kioskPrinterId', 'Kiosk Receipt Printer', printers)}
                    {renderPrinterSelect('barPrinterId', 'Default Bar Printer', printers)}
                    {renderPrinterSelect('reportPrinterId', 'Default Report Printer (A4)', (printers || []).filter(p => p.type === 'a4'))}
                </div>
                 <div className="bg-card p-6 rounded-lg space-y-4 border border-border">
                     <h4 className="font-bold text-foreground">Displays & Other Hardware</h4>
                     {renderDeviceSelect('customerDisplayId', 'Customer Facing Display (CFD)', customerDisplays)}
                     {renderDeviceSelect('kitchenDisplayId', 'Kitchen Display (KDS)', kitchenDisplays)}
                     {renderDeviceSelect('scaleId', 'Weighing Scale', scales)}
                 </div>
                 <div className="bg-card p-6 rounded-lg space-y-4 border border-border">
                     <h4 className="font-bold text-foreground">Print Server</h4>
                     <div>
                        <label htmlFor="printServerUrl" className="block text-sm font-medium text-muted-foreground mb-1">Print Server URL</label>
                        <div className="flex items-center gap-2">
                            <Input 
                                id="printServerUrl"
                                name="printServerUrl" 
                                value={localSettings.printServerUrl || ''} 
                                onChange={handleChange} 
                                placeholder="http://localhost:5000"
                            />
                             <PingButton ipAddress={localSettings.printServerUrl} />
                             <Button type="button" variant="ghost" size="icon" onClick={() => openModal('printServerGuide')} title="Open Print Server Guide">
                                <QuestionMarkCircleIcon className="w-6 h-6" />
                            </Button>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">The local URL of your print server application.</p>
                     </div>
                 </div>
            </div>
            <div className="mt-auto pt-6 text-right">
                <Button onClick={handleSave}>Save Device Settings</Button>
            </div>
         </div>
    );
};

export default DeviceSettingsView;