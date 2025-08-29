

import React, { useState, useEffect } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { AppSettings, AdvancedPOSSettings } from '../types';
import WrenchScrewdriverIcon from './icons/WrenchScrewdriverIcon';
import { Card, CardContent } from './ui/Card';
import { Button } from './ui/Button';

const AdvancedPOSSettingsView: React.FC = () => {
    const { settings, setSettings, addToast } = useAppContext();

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

    const ToggleRow: React.FC<{ label: string; description: string; enabled: boolean; onToggle?: () => void; }> = ({ label, description, enabled, onToggle }) => (
        <div className="flex items-start justify-between py-3">
            <div>
                <p className="font-medium text-foreground">{label}</p>
                <p className="text-xs text-muted-foreground">{description}</p>
            </div>
            <button
                type="button"
                onClick={() => {
                    if (typeof onToggle === 'function') {
                        onToggle();
                    } else {
                        console.error(`onToggle prop is not a function for ToggleRow with label: "${label}"`);
                    }
                }}
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
            <header className="p-6 shrink-0 border-b border-border">
                <h3 className="text-xl font-bold text-foreground mb-2 flex items-center gap-2">
                    <WrenchScrewdriverIcon className="w-6 h-6" /> Advanced POS Settings
                </h3>
                <p className="text-sm text-muted-foreground">Fine-tune specific point-of-sale behaviors.</p>
            </header>

            <main className="flex-grow overflow-y-auto p-6">
                <div className="space-y-6 max-w-4xl">
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
                                <div className="flex items-center justify-between py-3">
                                    <div>
                                        <p className="font-medium text-foreground">Default Estimated Preparation Time</p>
                                        <p className="text-xs text-muted-foreground">Sets the default prep time in minutes for KDS tickets.</p>
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
                                <ToggleRow label="Show Tax on Receipt" description="Show a tax breakdown on the receipt." enabled={localSettings.showTaxOnReceipt} onToggle={() => handleToggle('showTaxOnReceipt')} />
                            </div>
                        </div>
                    </SettingsGroup>

                    <SettingsGroup title="Inventory & Notifications">
                        <ToggleRow label="Enable Inventory Management" description="Deduct stock for items with recipes or direct stock values." enabled={localSettings.inventoryManagement} onToggle={() => handleToggle('inventoryManagement')} />
                        <ToggleRow label="Allow Negative Quantity" description="Allow selling items even when stock is at or below zero." enabled={localSettings.allowMinusQuantity} onToggle={() => handleToggle('allowMinusQuantity')} />
                        <ToggleRow label="Use Inventory Print" description="Print inventory-related reports." enabled={localSettings.useInventoryPrint} onToggle={() => handleToggle('useInventoryPrint')} />
                        <div className="py-3">
                            <ToggleRow label="Send Low Stock Emails" description="Send an email alert when items reach their reorder threshold." enabled={localSettings.sendLowStockEmails} onToggle={() => handleToggle('sendLowStockEmails')} />
                            {localSettings.sendLowStockEmails && (
                                <div className="mt-2 pl-4">
                                    <label className="block text-xs font-medium text-muted-foreground mb-1">Email Recipients</label>
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
                    
                     <SettingsGroup title="Staff & End of Day">
                        <ToggleRow label="Use End of Day Report" description="Enable the end-of-day process." enabled={localSettings.useEndOfDayReport} onToggle={() => handleToggle('useEndOfDayReport')} />
                        <ToggleRow label="Use Staff Salary" description="Enable staff salary management features." enabled={localSettings.useStaffSalary} onToggle={() => handleToggle('useStaffSalary')} />
                        <ToggleRow label="Print Cash In/Out" description="Print a slip when cash is added or removed from the till." enabled={localSettings.useCashInOutPrint} onToggle={() => handleToggle('useCashInOutPrint')} />
                        <ToggleRow label="Print Work Time" description="Print a slip with work hours at clock-out." enabled={localSettings.useWorkTimePrint} onToggle={() => handleToggle('useWorkTimePrint')} />
                        <ToggleRow label="Enable Time Clock" description="Globally enable or disable the time clock feature." enabled={localSettings.enableTimeClock ?? true} onToggle={() => handleToggle('enableTimeClock')} />
                        <ToggleRow label="Auto Clock-Out" description="Automatically clock out staff at the end of the business day." enabled={localSettings.autoClockOut} onToggle={() => handleToggle('autoClockOut')} />
                        <ToggleRow label="Do Not Remember Password on Login" description="Force PIN entry every time instead of staying logged in." enabled={localSettings.loginDoNotRememberPassword} onToggle={() => handleToggle('loginDoNotRememberPassword')} />
                    </SettingsGroup>
                </div>
            </main>
            
            <footer className="p-4 shrink-0 border-t border-border mt-auto bg-card text-right">
                <Button onClick={handleSave}>Save Advanced Settings</Button>
            </footer>
        </div>
    );
};
export default AdvancedPOSSettingsView;