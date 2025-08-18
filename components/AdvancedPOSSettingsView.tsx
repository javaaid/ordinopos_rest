import React, { useState, useEffect } from 'react';
import { useAppContext, useToastContext } from '../contexts/AppContext';
import { AppSettings, AdvancedPOSSettings } from '../types';
import WrenchScrewdriverIcon from './icons/WrenchScrewdriverIcon';
import { Card, CardContent } from './ui/Card';

const AdvancedPOSSettingsView: React.FC = () => {
    const { settings, setSettings } = useAppContext();
    const { addToast } = useToastContext();
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
        setLocalSettings(prev => ({ ...prev, [key]: !prev[key as keyof AdvancedPOSSettings] }));
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setLocalSettings(prev => ({ ...prev, [name]: value }));
    };

    const ToggleRow: React.FC<{ label: string; description: string; enabled: boolean; onToggle: () => void; }> = ({ label, description, enabled, onToggle }) => (
        <div className="flex items-start justify-between py-3">
            <div>
                <p className="font-medium text-foreground">{label}</p>
                <p className="text-xs text-muted-foreground">{description}</p>
            </div>
            <button
                type="button"
                onClick={onToggle}
                className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors flex-shrink-0 ${enabled ? 'bg-primary' : 'bg-muted'}`}
            >
                <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${enabled ? 'translate-x-6' : 'translate-x-1'}`}/>
            </button>
        </div>
    );

    const SettingsGroup: React.FC<{title: string; children: React.ReactNode}> = ({title, children}) => (
        <Card>
            <CardContent className="p-4">
                <h4 className="text-sm font-bold text-primary mb-2">{title}</h4>
                <div className="bg-background rounded-lg divide-y divide-border px-4">
                    {children}
                </div>
            </CardContent>
        </Card>
    );

    return (
        <div className="h-full flex flex-col">
            <h3 className="text-xl font-bold text-foreground mb-2 flex items-center gap-2">
                <WrenchScrewdriverIcon className="w-6 h-6" /> Advanced POS Settings
            </h3>
            <p className="text-sm text-muted-foreground mb-6">Fine-tune specific point-of-sale behaviors.</p>

            <div className="space-y-6 max-w-4xl overflow-y-auto pr-4 flex-grow">
                <SettingsGroup title="Ordering">
                    <div className="grid grid-cols-1 md:grid-cols-2 md:gap-x-8 md:divide-x md:divide-border">
                        <div className="md:pr-4 space-y-2 divide-y divide-border">
                            <ToggleRow label="Enable Item Number" description="Use numeric codes to add items to the cart." enabled={localSettings.enableItemNumber} onToggle={() => handleToggle('enableItemNumber')} />
                            <ToggleRow label="Separate Same Items" description="Add the same item as a new line instead of increasing quantity." enabled={localSettings.separateSameItems} onToggle={() => handleToggle('separateSameItems')} />
                            <ToggleRow label="Combine Kitchen Items" description="Combine identical items into a single line on kitchen tickets." enabled={localSettings.combineKitchenItems} onToggle={() => handleToggle('combineKitchenItems')} />
                            <ToggleRow label="Kitchen Print Footer" description="Print a footer on kitchen tickets." enabled={localSettings.kitchenPrintFooter} onToggle={() => handleToggle('kitchenPrintFooter')} />
                            <ToggleRow label="Print Reserved Order" description="Print tickets for reserved delivery/pickup orders immediately." enabled={localSettings.kitchenPrintReservedOrder} onToggle={() => handleToggle('kitchenPrintReservedOrder')} />
                            <ToggleRow label="Sort Items in Kitchen" description="Sort kitchen ticket items by category." enabled={localSettings.sortItemInKitchen} onToggle={() => handleToggle('sortItemInKitchen')} />
                        </div>
                        <div className="md:pl-4 space-y-2 divide-y divide-border">
                             <ToggleRow label="Sort Modifiers" description="Sort modifiers alphabetically on tickets." enabled={localSettings.sortModifier} onToggle={() => handleToggle('sortModifier')} />
                            <ToggleRow label="Sort Order in KDS" description="Sort orders on the KDS by time." enabled={localSettings.sortOrderInKDS} onToggle={() => handleToggle('sortOrderInKDS')} />
                            <ToggleRow label="Print Voided Items" description="Print a ticket to the kitchen when an item is voided." enabled={localSettings.printVoidOrderItem} onToggle={() => handleToggle('printVoidOrderItem')} />
                            <ToggleRow label="Print After Sending" description="Automatically print an order ticket after sending to kitchen." enabled={localSettings.printOrderAfterSending} onToggle={() => handleToggle('printOrderAfterSending')} />
                            <ToggleRow label="Quick Pay" description="Enable a quick pay button for cash transactions." enabled={localSettings.quickPay} onToggle={() => handleToggle('quickPay')} />
                            <ToggleRow label="Use Void Reason" description="Require a reason when voiding an item or order." enabled={localSettings.useVoidReason} onToggle={() => handleToggle('useVoidReason')} />
                        </div>
                    </div>
                </SettingsGroup>

                <SettingsGroup title="Payment & Receipt">
                    <div className="grid grid-cols-1 md:grid-cols-2 md:gap-x-8 md:divide-x md:divide-border">
                        <div className="md:pr-4 space-y-2 divide-y divide-border">
                            <ToggleRow label="Confirm Payment" description="Show a confirmation dialog before processing payments." enabled={localSettings.confirmPayment} onToggle={() => handleToggle('confirmPayment')} />
                            <ToggleRow label="Print Receipt after Payment" description="Automatically print a receipt after every successful payment." enabled={localSettings.printReceiptAfterPayment} onToggle={() => handleToggle('printReceiptAfterPayment')} />
                            <ToggleRow label="Combine Items on Receipt" description="Combine identical items into a single line on receipts." enabled={localSettings.combineReceiptItem} onToggle={() => handleToggle('combineReceiptItem')} />
                            <ToggleRow label="Sort Items on Receipt" description="Sort items by category on the customer receipt." enabled={localSettings.sortItemInReceipt} onToggle={() => handleToggle('sortItemInReceipt')} />
                        </div>
                         <div className="md:pl-4 space-y-2 divide-y divide-border">
                            <ToggleRow label="Show Item Discount" description="Display per-item discounts on the receipt." enabled={localSettings.showItemDiscount} onToggle={() => handleToggle('showItemDiscount')} />
                            <ToggleRow label="Show Voided Items" description="Display voided items on the receipt." enabled={localSettings.showVoidOrderItem} onToggle={() => handleToggle('showVoidOrderItem')} />
                            <ToggleRow label="Email Receipt" description="Enable the option to email receipts to customers." enabled={localSettings.emailReceipt} onToggle={() => handleToggle('emailReceipt')} />
                            <ToggleRow label="Show Tax Breakdown" description="Show detailed tax breakdown on receipts instead of a single total." enabled={localSettings.showTaxOnReceipt} onToggle={() => handleToggle('showTaxOnReceipt')} />
                        </div>
                    </div>
                </SettingsGroup>
                
                <SettingsGroup title="General & Security">
                     <div className="grid grid-cols-1 md:grid-cols-2 md:gap-x-8 md:divide-x md:divide-border">
                        <div className="md:pr-4 space-y-2 divide-y divide-border">
                            <ToggleRow label="Auto Clock Out" description="Automatically clock out staff after a period of inactivity." enabled={localSettings.autoClockOut} onToggle={() => handleToggle('autoClockOut')} />
                        </div>
                        <div className="md:pl-4 space-y-2 divide-y divide-border">
                            <ToggleRow label="Lock Till to Location" description="Prevents users from changing the active location on this device." enabled={localSettings.lockTillToLocation} onToggle={() => handleToggle('lockTillToLocation')} />
                            <ToggleRow label="Use AM/PM Time Format" description="Display time in 12-hour AM/PM format instead of 24-hour." enabled={localSettings.timeFormatAmPm} onToggle={() => handleToggle('timeFormatAmPm')} />
                            <div className="flex items-center justify-between py-3">
                                <div>
                                    <p className="font-medium text-foreground">Date Format</p>
                                </div>
                                <input type="text" name="dateFormat" value={localSettings.dateFormat} onChange={handleChange} className="w-1/2 bg-input p-1 rounded-md text-sm text-muted-foreground border border-border mt-1" />
                            </div>
                        </div>
                    </div>
                </SettingsGroup>
            </div>

            <div className="mt-auto pt-6 text-right">
                <button
                    onClick={handleSave}
                    className="px-6 py-2 rounded-md bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors shadow-lg"
                >
                    Save Advanced Settings
                </button>
            </div>
        </div>
    );
};

export default AdvancedPOSSettingsView;