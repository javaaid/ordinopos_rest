import React, { useState, useEffect } from 'react';
import { AppSettings, PrinterReceiptSettings, LanguageSettings, Language, NotificationSettings, ReceiptTemplateId, InvoiceTemplateId, ReceiptSettings, TranslationKey } from '../types';
import SwatchIcon from './icons/SwatchIcon';
import ProBadge from './ProBadge';
import { useAppContext, useToastContext } from '../contexts/AppContext';
import { useTranslations } from '../hooks/useTranslations';

const TemplatePreview: React.FC<{ title: string; description: string; isSelected: boolean; onClick: () => void; children: React.ReactNode }> = ({ title, description, isSelected, onClick, children }) => (
    <div
        onClick={onClick}
        className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${isSelected ? 'border-primary bg-primary/10 shadow-md' : 'border-border bg-background hover:border-muted-foreground'}`}
    >
        <div className="w-full h-24 bg-muted/50 rounded-md mb-3 overflow-hidden flex items-center justify-center p-2">
            {children}
        </div>
        <h5 className="font-bold text-foreground">{title}</h5>
        <p className="text-xs text-muted-foreground">{description}</p>
    </div>
);


const CustomizationSettings: React.FC = () => {
    const { settings, setSettings } = useAppContext();
    const t = useTranslations(settings.language.staff);
    const { addToast } = useToastContext();
    const [localSettings, setLocalSettings] = useState<AppSettings>(settings);

    useEffect(() => {
        setLocalSettings(settings);
    }, [settings]);

    const handleReceiptChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setLocalSettings(prev => ({ ...prev, receipt: { ...prev.receipt, [name]: value } }));
    };
    
    const handleTemplateChange = (templateId: ReceiptTemplateId) => {
        setLocalSettings(prev => ({ ...prev, receipt: { ...prev.receipt, template: templateId } }));
    };

    const handleInvoiceTemplateChange = (templateId: InvoiceTemplateId) => {
        setLocalSettings(prev => ({ ...prev, invoice: { ...prev.invoice, template: templateId } }));
    };

    const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target;
        setLocalSettings(prev => ({ ...prev, language: { ...prev.language, [name]: value as Language } }));
    };
    
    const handleNotificationChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setLocalSettings(prev => ({
            ...prev,
            notificationSettings: {
                ...prev.notificationSettings,
                [name]: name === 'duration' ? parseFloat(value) : value,
            },
        }));
    };

    const handleSave = () => {
        setSettings(localSettings);
        addToast({ type: 'success', title: 'Saved', message: 'Customization settings have been updated.' });
    };

    return (
        <div className="p-6 h-full flex flex-col">
            <div className="shrink-0 text-start rtl:text-end">
                <h3 className="text-xl font-bold text-foreground mb-2 flex items-center gap-2 rtl:flex-row-reverse">
                    <SwatchIcon className="w-6 h-6" /> {t('customize_title')}
                </h3>
                <p className="text-sm text-muted-foreground mb-6">{t('customize_description')}</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 flex-grow overflow-y-auto pr-4">
                {/* Left Column */}
                <div className="lg:col-span-3 space-y-6 text-start rtl:text-end">
                    {/* Receipt Template */}
                    <div className="bg-secondary p-4 rounded-lg">
                        <h4 className="font-bold text-foreground mb-4">{t('customize_receiptTemplate_group')}</h4>
                        <p className="text-sm text-muted-foreground mb-4">{t('customize_receiptTemplate_desc')}</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                            <TemplatePreview 
                                title={t('customize_template_standard_title')}
                                description={t('customize_template_standard_desc')}
                                isSelected={localSettings.receipt.template === 'standard'} 
                                onClick={() => handleTemplateChange('standard')}
                            >
                                <div className="w-16 h-20 bg-white p-1 font-mono text-black text-[5px] leading-tight flex flex-col justify-between"><div>**COMPANY**<br/>- - - -<br/>Item.....$10</div><div className="font-bold">TOTAL..$11</div></div>
                            </TemplatePreview>
                            <TemplatePreview 
                                title={t('customize_template_compact_title')}
                                description={t('customize_template_compact_desc')} 
                                isSelected={localSettings.receipt.template === 'compact'} 
                                onClick={() => handleTemplateChange('compact')}
                            >
                                <div className="w-16 h-20 bg-white p-1 font-mono text-black text-[5px] leading-tight flex flex-col justify-between"><div>Item...$10<br/>Item...$15</div><div className="font-bold">TOTAL $27.50</div></div>
                            </TemplatePreview>
                            <TemplatePreview 
                                title={t('customize_template_bilingual_title')}
                                description={t('customize_template_bilingual_desc')}
                                isSelected={localSettings.receipt.template === 'zatca_bilingual'} 
                                onClick={() => handleTemplateChange('zatca_bilingual')}
                            >
                                <div className="w-16 h-20 bg-white p-1 font-mono text-black text-[4px] leading-tight flex flex-col justify-between"><div>فاتورة<br/>INVOICE<br/>- - -<br/>الصنف/Item</div><div className="text-center">QR</div></div>
                            </TemplatePreview>
                        </div>
                    </div>

                    <div className="bg-secondary p-4 rounded-lg">
                        <h4 className="font-bold text-foreground mb-4">{t('customize_invoiceTemplate_group')}</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                            <TemplatePreview 
                                title={t('customize_invoiceTemplate_modern_title')}
                                description={t('customize_invoiceTemplate_modern_desc')}
                                isSelected={localSettings.invoice.template === 'modern'} 
                                onClick={() => handleInvoiceTemplateChange('modern')}
                            >
                                <div className="w-16 h-20 bg-white p-1 text-black text-[4px] leading-tight flex flex-col border-t-4 border-blue-500">
                                    <div className="font-bold">INVOICE</div>
                                    <div className="mt-2">Item 1.....$10</div>
                                    <div>Item 2.....$15</div>
                                    <div className="mt-auto text-right font-bold">Total: $25</div>
                                </div>
                            </TemplatePreview>
                            <TemplatePreview 
                                title={t('customize_invoiceTemplate_classic_title')}
                                description={t('customize_invoiceTemplate_classic_desc')}
                                isSelected={localSettings.invoice.template === 'classic'} 
                                onClick={() => handleInvoiceTemplateChange('classic')}
                            >
                                <div className="w-16 h-20 bg-white p-1 text-black text-[4px] leading-tight flex flex-col border border-gray-400">
                                    <div className="text-center font-bold">INVOICE</div>
                                    <div className="mt-2 border-t border-b border-gray-400">Item 1.....$10</div>
                                    <div>Item 2.....$15</div>
                                    <div className="mt-auto text-right font-bold border-t border-gray-400">Total: $25</div>
                                </div>
                            </TemplatePreview>
                            <TemplatePreview 
                                title={t('customize_template_bilingual_title')}
                                description={t('customize_template_bilingual_desc')}
                                isSelected={localSettings.invoice.template === 'zatca_bilingual'} 
                                onClick={() => handleInvoiceTemplateChange('zatca_bilingual')}
                            >
                                <div className="w-16 h-20 bg-white p-1 font-mono text-black text-[4px] leading-tight flex flex-col justify-between">
                                    <div>فاتورة<br/>INVOICE<br/>- - -<br/>الصنف/Item</div>
                                    <div className="text-center">QR</div>
                                </div>
                            </TemplatePreview>
                        </div>
                    </div>

                    <div className="bg-secondary p-4 rounded-lg">
                        <h4 className="font-bold text-foreground mb-2">{t('customize_receiptBranding_group')}</h4>
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="logoUrl" className="block text-sm font-medium text-muted-foreground mb-1">{t('customize_logoUrl_label')}</label>
                                <input type="text" id="logoUrl" name="logoUrl" value={localSettings.receipt.logoUrl} onChange={handleReceiptChange} className="w-full bg-input border border-border rounded-md px-3 py-2 text-foreground" />
                            </div>
                            <div>
                                <label htmlFor="promoMessage" className="block text-sm font-medium text-muted-foreground mb-1">{t('customize_promoMessage_label')}</label>
                                <textarea id="promoMessage" name="promoMessage" value={localSettings.receipt.promoMessage} onChange={handleReceiptChange} className="w-full bg-input border border-border rounded-md px-3 py-2 text-foreground h-20"></textarea>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column */}
                <div className="lg:col-span-2 space-y-6 text-start rtl:text-end">
                    
                    <div className="bg-secondary p-4 rounded-lg">
                        <h4 className="font-bold text-foreground mb-2">{t('customize_language_group')}</h4>
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="staff-language" className="block text-sm font-medium text-muted-foreground mb-1">{t('customize_staffLang_label')}</label>
                                <select id="staff-language" name="staff" value={localSettings.language.staff} onChange={handleLanguageChange} className="w-full bg-input border border-border rounded-md px-3 py-2 text-foreground">
                                    <option value="en">English</option>
                                    <option value="es">Español</option>
                                    <option value="ar">العربية (Arabic)</option>
                                </select>
                            </div>
                            <div>
                                <label htmlFor="customer-language" className="block text-sm font-medium text-muted-foreground mb-1">{t('customize_customerLang_label')}</label>
                                <select id="customer-language" name="customer" value={localSettings.language.customer} onChange={handleLanguageChange} className="w-full bg-input border border-border rounded-md px-3 py-2 text-foreground">
                                    <option value="en">English</option>
                                    <option value="es">Español</option>
                                    <option value="ar">العربية (Arabic)</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="bg-secondary p-4 rounded-lg">
                        <h4 className="font-bold text-foreground mb-2">{t('customize_notifications_group')}</h4>
                        <div className="space-y-4">
                             <div>
                                <label htmlFor="duration" className="block text-sm font-medium text-muted-foreground mb-1">{t('customize_notifDuration_label')}</label>
                                <input type="number" id="duration" name="duration" value={localSettings.notificationSettings.duration} onChange={handleNotificationChange} className="w-full bg-input border border-border rounded-md px-3 py-2 text-foreground" min="1" max="30" />
                            </div>
                            <div>
                                <label htmlFor="position" className="block text-sm font-medium text-muted-foreground mb-1">{t('customize_notifPosition_label')}</label>
                                <select id="position" name="position" value={localSettings.notificationSettings.position} onChange={handleNotificationChange} className="w-full bg-input border border-border rounded-md px-3 py-2 text-foreground">
                                    <option value="top-right">{t('customize_notifPosition_tr')}</option>
                                    <option value="top-left">{t('customize_notifPosition_tl')}</option>
                                    <option value="bottom-right">{t('customize_notifPosition_br')}</option>
                                    <option value="bottom-left">{t('customize_notifPosition_bl')}</option>
                                </select>
                            </div>
                             <div>
                                <label htmlFor="theme" className="block text-sm font-medium text-muted-foreground mb-1">{t('customize_notifTheme_label')}</label>
                                <select id="theme" name="theme" value={localSettings.notificationSettings.theme} onChange={handleNotificationChange} className="w-full bg-input border border-border rounded-md px-3 py-2 text-foreground">
                                    <option value="dark">{t('customize_notifTheme_dark')}</option>
                                    <option value="transparent">{t('customize_notifTheme_transparent')}</option>
                                </select>
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            <div className="mt-auto pt-6 text-end rtl:text-left">
                <button
                    onClick={handleSave}
                    className="px-6 py-2 rounded-md bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors shadow-lg"
                >
                    {t('saveSettings')}
                </button>
            </div>
        </div>
    );
};
export default CustomizationSettings;