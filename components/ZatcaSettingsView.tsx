import React, { useState, useEffect } from 'react';
import { ZatcaSettings } from '../types';
import QrCodeIcon from './icons/QrCodeIcon';
import { useAppContext, useDataContext, useToastContext } from '../contexts/AppContext';
import { useTranslations } from '../hooks/useTranslations';
import { Button } from './ui/Button';

const ZatcaSettingsView: React.FC = () => {
    const { settings } = useAppContext();
    const { handleSaveZatcaSettings } = useDataContext();
    const t = useTranslations(settings.language.staff);
    const { addToast } = useToastContext();
    const [localSettings, setLocalSettings] = useState<ZatcaSettings>(settings.zatca);

    useEffect(() => {
        setLocalSettings(settings.zatca);
    }, [settings.zatca]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        const isCheckbox = type === 'checkbox';
        const isNumber = type === 'number';
        
        if (isCheckbox) {
            setLocalSettings(prev => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
        } else {
            setLocalSettings(prev => ({ 
                ...prev, 
                [name]: isNumber ? parseInt(value, 10) : value 
            }));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleSaveZatcaSettings(localSettings);
        addToast({ type: 'success', title: 'Saved', message: 'ZATCA settings have been updated.' });
    };

    return (
        <form onSubmit={handleSubmit} className="p-6 h-full flex flex-col">
            <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-3 rtl:flex-row-reverse">
                <QrCodeIcon className="w-8 h-8"/>
                {t('zatca_title')}
            </h2>
            <p className="text-muted-foreground mb-6 max-w-2xl text-start rtl:text-end">
                {t('zatca_description')}
            </p>
            <div className="bg-secondary p-6 rounded-lg space-y-6 max-w-lg border border-border">
                <label className="flex items-center justify-between p-3 rounded-lg bg-background cursor-pointer border border-border">
                    <span className="font-medium text-foreground">{t('zatca_enable_label')}</span>
                    <button
                        type="button"
                        onClick={() => setLocalSettings(prev => ({...prev, enabled: !prev.enabled}))}
                        className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${localSettings.enabled ? 'bg-primary' : 'bg-muted'}`}
                    >
                        <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${localSettings.enabled ? 'translate-x-6' : 'translate-x-1'}`}/>
                    </button>
                </label>
                
                <div>
                    <label htmlFor="fatooraApiKey" className="block text-sm font-medium text-muted-foreground mb-1 text-start rtl:text-end">Fatoora API Key</label>
                    <input type="password" name="fatooraApiKey" id="fatooraApiKey" value={localSettings.fatooraApiKey} onChange={handleChange} className="w-full bg-input border border-border rounded-md p-2 font-mono" required/>
                </div>

                <label className="flex items-center justify-between p-3 rounded-lg bg-background cursor-pointer border border-border">
                    <span className="font-medium text-foreground">Enable Sandbox Mode (for testing)</span>
                     <button
                        type="button"
                        onClick={() => setLocalSettings(prev => ({...prev, isSandbox: !prev.isSandbox}))}
                        className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${localSettings.isSandbox ? 'bg-primary' : 'bg-muted'}`}
                    >
                        <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${localSettings.isSandbox ? 'translate-x-6' : 'translate-x-1'}`}/>
                    </button>
                </label>

                <div>
                    <label htmlFor="productionCert" className="block text-sm font-medium text-muted-foreground mb-1 text-start rtl:text-end">Production Certificate</label>
                    <textarea name="productionCert" id="productionCert" value={localSettings.productionCert} onChange={handleChange} className="w-full bg-input border border-border rounded-md p-2 font-mono text-xs h-24" placeholder="Paste certificate content here..."></textarea>
                </div>

                <div>
                    <label htmlFor="productionCSR" className="block text-sm font-medium text-muted-foreground mb-1 text-start rtl:text-end">Production Certificate Signing Request (CSR)</label>
                    <textarea name="productionCSR" id="productionCSR" value={localSettings.productionCSR} onChange={handleChange} className="w-full bg-input border border-border rounded-md p-2 font-mono text-xs h-24" placeholder="Paste CSR content here..."></textarea>
                </div>
                
                <div>
                    <label htmlFor="qrCodeSize" className="block text-sm font-medium text-muted-foreground mb-2 text-start rtl:text-end">{t('zatca_qrSize_label')}</label>
                    <div className="flex items-center gap-4">
                        <input
                            type="range"
                            id="qrCodeSize"
                            name="qrCodeSize"
                            min="64"
                            max="512"
                            step="8"
                            value={localSettings.qrCodeSize}
                            onChange={handleChange}
                            className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer"
                        />
                        <span className="font-mono text-foreground bg-input px-2 py-1 rounded-md">{localSettings.qrCodeSize}px</span>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2 text-start rtl:text-end">{t('zatca_qrPosition_label')}</label>
                    <div className="flex gap-4 rounded-lg bg-background p-1">
                         <button type="button" onClick={() => setLocalSettings(p=>({...p, qrCodePosition: 'top'}))} className={`flex-1 py-2 text-sm font-semibold rounded-md ${localSettings.qrCodePosition==='top' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}>{t('zatca_qrPosition_top')}</button>
                         <button type="button" onClick={() => setLocalSettings(p=>({...p, qrCodePosition: 'bottom'}))} className={`flex-1 py-2 text-sm font-semibold rounded-md ${localSettings.qrCodePosition==='bottom' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}>{t('zatca_qrPosition_bottom')}</button>
                    </div>
                </div>

                <div className="mt-6 pt-6 border-t border-border text-end rtl:text-left">
                    <Button type="submit">
                        {t('zatca_save_button')}
                    </Button>
                </div>
            </div>
        </form>
    );
};

export default ZatcaSettingsView;