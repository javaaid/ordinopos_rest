import React, { useState, useEffect } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { AppSettings, AdvancedPOSSettings, TranslationKey } from '../types';
import WrenchScrewdriverIcon from './icons/WrenchScrewdriverIcon';
import { Card, CardContent } from './ui/Card';
import { Button } from './ui/Button';
import { useTranslations } from '../hooks/useTranslations';

const AdvancedPOSSettingsView: React.FC = () => {
    const { settings, setSettings, addToast } = useAppContext();
    const t = useTranslations(settings.language.staff);

    if (!settings || !settings.advancedPOS) {
        return null; // or a loading spinner
    }
    
    const [localSettings, setLocalSettings] = useState<AdvancedPOSSettings>(settings.advancedPOS);

    useEffect(() => {
        setLocalSettings(settings.advancedPOS);
    }, [settings.advancedPOS]);

    const handleSave = () => {
        setSettings((prev: AppSettings) => ({
            ...prev,
            advancedPOS: localSettings,
        }));
        addToast({ type: 'success', title: 'Settings Saved', message: 'Advanced POS settings have been updated.' });
    };

    const handleToggle = (key: keyof AdvancedPOSSettings) => {
        setLocalSettings(prev => {
            const prevValue = prev[key as keyof typeof prev];
            const effectiveValue = key === 'enableTimeClock' ? (prevValue ?? true) : prevValue;
            return { ...prev, [key]: !effectiveValue };
        });
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type } = e.target;
        setLocalSettings(prev => ({ 
            ...prev, 
            [name]: type === 'number' ? parseInt(value, 10) || 0 : value 
        }));
    };

    const ToggleRow: React.FC<{ labelKey: TranslationKey; descKey: TranslationKey; enabled: boolean; onToggle?: () => void; }> = ({ labelKey, descKey, enabled, onToggle }) => (
        <div className="flex items-start justify-between py-3 text-start rtl:text-end">
            <div>
                <p className="font-medium text-foreground">{t(labelKey)}</p>
                <p className="text-xs text-muted-foreground">{t(descKey)}</p>
            </div>
            <button
                type="button"
                onClick={() => {
                    if (typeof onToggle === 'function') {
                        onToggle();
                    }
                }}
                className="relative inline-flex items-center h-6 rounded-full w-11 transition-colors flex-shrink-0 ms-4"
            >
                <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${enabled ? 'translate-x-6' : 'translate-x-0.5'}`}/>
            </button>
        </div>
    );

    const SettingsGroup: React.FC<{titleKey: TranslationKey; children: React.ReactNode}> = ({titleKey, children}) => (
        <Card>
            <CardContent className="p-4">
                <h4 className="text-sm font-bold text-primary mb-2 text-start rtl:text-end">{t(titleKey)}</h4>
                <div className="bg-background rounded-lg divide-y divide-border px-4">
                    {children}
                </div>
            </CardContent>
        </Card>
    );

    return (
        <div className="h-full flex flex-col">
            <header className="p-6 shrink-0 border-b border-border text-start rtl:text-end">
                <h3 className="text-xl font-bold text-foreground mb-2 flex items-center gap-2 rtl:flex-row-reverse">
                    <WrenchScrewdriverIcon className="w-6 h-6" /> {t('advpos_title')}
                </h3>
                <p className="text-sm text-muted-foreground">{t('advpos_description')}</p>
            </header>

            <main className="flex-grow overflow-y-auto p-6">
                <div className="space-y-6 max-w-4xl">
                    <SettingsGroup titleKey="advpos_ordering_group">
                        <div className="grid grid-cols-1 md:grid-cols-2 md:gap-x-8 md:divide-x md:divide-border rtl:divide-x-reverse">
                            <div className="md:pe-4 space-y-2 divide-y divide-border">
                                <ToggleRow labelKey="advpos_enableItemNumber_label" descKey="advpos_enableItemNumber_desc" enabled={localSettings.enableItemNumber} onToggle={() => handleToggle('enableItemNumber')} />
                                <ToggleRow labelKey="advpos_separateSameItems_label" descKey="advpos_separateSameItems_desc" enabled={localSettings.separateSameItems} onToggle={() => handleToggle('separateSameItems')} />
                                <ToggleRow labelKey="advpos_combineKitchenItems_label" descKey="advpos_combineKitchenItems_desc" enabled={localSettings.combineKitchenItems} onToggle={() => handleToggle('combineKitchenItems')} />
                                <ToggleRow labelKey="advpos_kitchenPrintFooter_label" descKey="advpos_kitchenPrintFooter_desc" enabled={localSettings.kitchenPrintFooter} onToggle={() => handleToggle('kitchenPrintFooter')} />
                                <ToggleRow labelKey="advpos_printReservedOrder_label" descKey="advpos_printReservedOrder_desc" enabled={localSettings.kitchenPrintReservedOrder} onToggle={() => handleToggle('kitchenPrintReservedOrder')} />
                                <ToggleRow labelKey="advpos_sortItemsInKitchen_label" descKey="advpos_sortItemsInKitchen_desc" enabled={localSettings.sortItemInKitchen} onToggle={() => handleToggle('sortItemInKitchen')} />
                            </div>
                            <div className="md:ps-4 space-y-2 divide-y divide-border">
                                <ToggleRow labelKey="advpos_sortModifiers_label" descKey="advpos_sortModifiers_desc" enabled={localSettings.sortModifier} onToggle={() => handleToggle('sortModifier')} />
                                <ToggleRow labelKey="advpos_sortOrderInKDS_label" descKey="advpos_sortOrderInKDS_desc" enabled={localSettings.sortOrderInKDS} onToggle={() => handleToggle('sortOrderInKDS')} />
                                <ToggleRow labelKey="advpos_printVoidedItems_label" descKey="advpos_printVoidedItems_desc" enabled={localSettings.printVoidOrderItem} onToggle={() => handleToggle('printVoidOrderItem')} />
                                <ToggleRow labelKey="advpos_printAfterSending_label" descKey="advpos_printAfterSending_desc" enabled={localSettings.printOrderAfterSending} onToggle={() => handleToggle('printOrderAfterSending')} />
                                <ToggleRow labelKey="advpos_quickPay_label" descKey="advpos_quickPay_desc" enabled={localSettings.quickPay} onToggle={() => handleToggle('quickPay')} />
                                <ToggleRow labelKey="advpos_useVoidReason_label" descKey="advpos_useVoidReason_desc" enabled={localSettings.useVoidReason} onToggle={() => handleToggle('useVoidReason')} />
                                <div className="flex items-center justify-between py-3 text-start rtl:text-end">
                                    <div>
                                        <p className="font-medium text-foreground">{t('advpos_defaultPrepTime_label')}</p>
                                        <p className="text-xs text-muted-foreground">{t('advpos_defaultPrepTime_desc')}</p>
                                    </div>
                                    <input 
                                        type="number" 
                                        name="defaultPrepTimeMinutes" 
                                        value={localSettings.defaultPrepTimeMinutes || 15} 
                                        onChange={handleChange} 
                                        className="w-24 bg-input p-1 rounded-md text-sm text-foreground border border-border mt-1 text-center"
                                        min="1"
                                    />
                                </div>
                            </div>
                        </div>
                    </SettingsGroup>

                    <SettingsGroup titleKey="advpos_paymentReceipt_group">
                        <div className="grid grid-cols-1 md:grid-cols-2 md:gap-x-8 md:divide-x md:divide-border rtl:divide-x-reverse">
                            <div className="md:pe-4 space-y-2 divide-y divide-border">
                                <ToggleRow labelKey="advpos_confirmPayment_label" descKey="advpos_confirmPayment_desc" enabled={localSettings.confirmPayment} onToggle={() => handleToggle('confirmPayment')} />
                                <ToggleRow labelKey="advpos_printReceiptAfterPayment_label" descKey="advpos_printReceiptAfterPayment_desc" enabled={localSettings.printReceiptAfterPayment} onToggle={() => handleToggle('printReceiptAfterPayment')} />
                                <ToggleRow labelKey="advpos_combineReceiptItems_label" descKey="advpos_combineReceiptItems_desc" enabled={localSettings.combineReceiptItem} onToggle={() => handleToggle('combineReceiptItem')} />
                                <ToggleRow labelKey="advpos_sortItemsOnReceipt_label" descKey="advpos_sortItemsOnReceipt_desc" enabled={localSettings.sortItemInReceipt} onToggle={() => handleToggle('sortItemInReceipt')} />
                            </div>
                            <div className="md:ps-4 space-y-2 divide-y divide-border">
                                <ToggleRow labelKey="advpos_showItemDiscount_label" descKey="advpos_showItemDiscount_desc" enabled={localSettings.showItemDiscount} onToggle={() => handleToggle('showItemDiscount')} />
                                <ToggleRow labelKey="advpos_showVoidedItems_label" descKey="advpos_showVoidedItems_desc" enabled={localSettings.showVoidOrderItem} onToggle={() => handleToggle('showVoidOrderItem')} />
                                <ToggleRow labelKey="advpos_emailReceipt_label" descKey="advpos_emailReceipt_desc" enabled={localSettings.emailReceipt} onToggle={() => handleToggle('emailReceipt')} />
                                <ToggleRow labelKey="advpos_showTaxOnReceipt_label" descKey="advpos_showTaxOnReceipt_desc" enabled={localSettings.showTaxOnReceipt} onToggle={() => handleToggle('showTaxOnReceipt')} />
                            </div>
                        </div>
                    </SettingsGroup>

                    <SettingsGroup titleKey="advpos_inventoryNotifications_group">
                        <ToggleRow labelKey="advpos_enableInventory_label" descKey="advpos_enableInventory_desc" enabled={localSettings.inventoryManagement} onToggle={() => handleToggle('inventoryManagement')} />
                        <ToggleRow labelKey="advpos_allowNegativeStock_label" descKey="advpos_allowNegativeStock_desc" enabled={localSettings.allowMinusQuantity} onToggle={() => handleToggle('allowMinusQuantity')} />
                        <ToggleRow labelKey="advpos_useInventoryPrint_label" descKey="advpos_useInventoryPrint_desc" enabled={localSettings.useInventoryPrint} onToggle={() => handleToggle('useInventoryPrint')} />
                        <div className="py-3 text-start rtl:text-end">
                            <ToggleRow labelKey="advpos_sendLowStockEmails_label" descKey="advpos_sendLowStockEmails_desc" enabled={localSettings.sendLowStockEmails} onToggle={() => handleToggle('sendLowStockEmails')} />
                            {localSettings.sendLowStockEmails && (
                                <div className="mt-2 ps-4">
                                    <label className="block text-xs font-medium text-muted-foreground mb-1">{t('advpos_lowStockRecipients_label')}</label>
                                    <input 
                                        type="text" 
                                        name="lowStockEmailRecipients" 
                                        value={localSettings.lowStockEmailRecipients || ''} 
                                        onChange={handleChange} 
                                        className="w-full bg-input p-1 rounded-md text-sm text-foreground border border-border mt-1"
                                        placeholder="manager@example.com, owner@example.com"
                                    />
                                </div>
                            )}
                        </div>
                    </SettingsGroup>
                    
                     <SettingsGroup titleKey="advpos_staffEndOfDay_group">
                        <ToggleRow labelKey="advpos_eodReport_label" descKey="advpos_eodReport_desc" enabled={localSettings.useEndOfDayReport} onToggle={() => handleToggle('useEndOfDayReport')} />
                        <ToggleRow labelKey="advpos_staffSalary_label" descKey="advpos_staffSalary_desc" enabled={localSettings.useStaffSalary} onToggle={() => handleToggle('useStaffSalary')} />
                        <ToggleRow labelKey="advpos_printCashInOut_label" descKey="advpos_printCashInOut_desc" enabled={localSettings.useCashInOutPrint} onToggle={() => handleToggle('useCashInOutPrint')} />
                        <ToggleRow labelKey="advpos_printWorkTime_label" descKey="advpos_printWorkTime_desc" enabled={localSettings.useWorkTimePrint} onToggle={() => handleToggle('useWorkTimePrint')} />
                        <ToggleRow labelKey="advpos_enableTimeClock_label" descKey="advpos_enableTimeClock_desc" enabled={localSettings.enableTimeClock ?? true} onToggle={() => handleToggle('enableTimeClock')} />
                        <ToggleRow labelKey="advpos_autoClockOut_label" descKey="advpos_autoClockOut_desc" enabled={localSettings.autoClockOut} onToggle={() => handleToggle('autoClockOut')} />
                        <ToggleRow labelKey="advpos_forcePinEntry_label" descKey="advpos_forcePinEntry_desc" enabled={localSettings.loginDoNotRememberPassword} onToggle={() => handleToggle('loginDoNotRememberPassword')} />
                    </SettingsGroup>
                </div>
            </main>
            
            <footer className="p-4 shrink-0 border-t border-border mt-auto bg-card text-end rtl:text-left">
                <Button onClick={handleSave}>{t('saveSettings')}</Button>
            </footer>
        </div>
    );
};
export default AdvancedPOSSettingsView;
