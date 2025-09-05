import React, { useState, useEffect } from 'react';
import { useAppContext, useDataContext, useToastContext, useModalContext } from '../contexts/AppContext';
import { AppSettings, DeviceSettings, Printer, KitchenDisplay, CustomerDisplay, GenericDevice } from '../types';
import ServerStackIcon from './icons/ServerStackIcon';
import { Button } from './ui/Button';
import { Select } from './ui/Select';
import { Input } from './ui/Input';
import QuestionMarkCircleIcon from './icons/QuestionMarkCircleIcon';
import PingButton from './PingButton';
import { useTranslations } from '../hooks/useTranslations';

const DeviceSettingsView: React.FC = () => {
    const { settings, setSettings } = useAppContext();
    const t = useTranslations(settings.language.staff);
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
         <div className="text-start rtl:text-end">
            <label className="block text-sm font-medium text-muted-foreground mb-1">{label}</label>
            <Select name={id} value={localSettings[id] || ''} onChange={handleChange}>
                <option value="">-- Not Assigned --</option>
                {(availablePrinters || []).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </Select>
        </div>
    );
    
    const renderDeviceSelect = (id: keyof DeviceSettings, label: string, availableDevices: any[]) => (
         <div className="text-start rtl:text-end">
            <label className="block text-sm font-medium text-muted-foreground mb-1">{label}</label>
            <Select name={id} value={localSettings[id] || ''} onChange={handleChange}>
                <option value="">-- Not Assigned --</option>
                {(availableDevices || []).map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </Select>
        </div>
    );

    return (
         <div className="h-full flex flex-col p-6">
             <h3 className="text-xl font-bold text-foreground mb-2 flex items-center gap-2 rtl:text-right">
                <ServerStackIcon className="w-6 h-6" /> {t('devices_title')}
            </h3>
            <p className="text-sm text-muted-foreground mb-6 rtl:text-right">{t('devices_description')}</p>
            <div className="space-y-6 max-w-2xl overflow-y-auto pr-2">
                <div className="bg-card p-6 rounded-lg space-y-4 border border-border">
                    <h4 className="font-bold text-foreground rtl:text-right">{t('devices_printers_group')}</h4>
                    {renderPrinterSelect('receiptPrinterId', t('devices_defaultReceiptPrinter_label'), printers)}
                    {renderPrinterSelect('kitchenPrinterId', t('devices_defaultKitchenPrinter_label'), printers)}
                    {renderPrinterSelect('kioskPrinterId', t('devices_kioskReceiptPrinter_label'), printers)}
                    {renderPrinterSelect('barPrinterId', t('devices_defaultBarPrinter_label'), printers)}
                    {renderPrinterSelect('reportPrinterId', t('devices_defaultReportPrinter_label'), (printers || []).filter(p => p.type === 'a4'))}
                </div>
                 <div className="bg-card p-6 rounded-lg space-y-4 border border-border">
                     <h4 className="font-bold text-foreground rtl:text-right">{t('devices_displaysHardware_group')}</h4>
                     {renderDeviceSelect('customerDisplayId', t('devices_cfd_label'), customerDisplays)}
                     {renderDeviceSelect('kitchenDisplayId', t('devices_kds_label'), kitchenDisplays)}
                     {renderDeviceSelect('scaleId', t('devices_scale_label'), scales)}
                 </div>
                 <div className="bg-card p-6 rounded-lg space-y-4 border border-border">
                     <h4 className="font-bold text-foreground rtl:text-right">{t('devices_printServer_group')}</h4>
                     <div className="text-start rtl:text-end">
                        <label htmlFor="printServerUrl" className="block text-sm font-medium text-muted-foreground mb-1">{t('devices_printServerUrl_label')}</label>
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
                        <p className="text-xs text-muted-foreground mt-1">{t('devices_printServerUrl_desc')}</p>
                     </div>
                 </div>
            </div>
            <div className="mt-auto pt-6 text-end rtl:text-left">
                <Button onClick={handleSave}>{t('saveSettings')}</Button>
            </div>
         </div>
    );
};

export default DeviceSettingsView;
