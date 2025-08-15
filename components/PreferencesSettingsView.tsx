
import React, { useState, useEffect } from 'react';
import { useAppContext, useToastContext, useDataContext } from '../contexts/AppContext';
import { AppSettings, POSPreferences, OrderType, PaymentType } from '../types';
import Cog6ToothIcon from './icons/Cog6ToothIcon';

const PreferencesSettingsView: React.FC = () => {
    const { settings, setSettings } = useAppContext();
    const { paymentTypes } = useDataContext();
    const { addToast } = useToastContext();
    const [localSettings, setLocalSettings] = useState<POSPreferences>(settings.preferences);

    useEffect(() => {
        setLocalSettings(settings.preferences);
    }, [settings.preferences]);

    const handleSave = () => {
        setSettings((prev: AppSettings) => ({
            ...prev,
            preferences: {
                ...prev.preferences,
                ...localSettings,
            },
        }));
        addToast({ type: 'success', title: 'Settings Saved', message: 'POS preferences have been updated.' });
    };

    const handleToggle = (key: keyof POSPreferences) => {
        setLocalSettings(prev => ({ ...prev, [key]: !prev[key as keyof POSPreferences] }));
    };

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target;
        setLocalSettings(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const actionOptions = [
        { value: 'order', label: 'Keep on Ordering Screen' },
        { value: 'tables', label: 'Go to Tables / Floor Plan' },
        { value: 'login', label: 'Go to Login Screen' },
    ];

    const ToggleRow: React.FC<{ label: string; enabled: boolean; onToggle: () => void; }> = ({ label, enabled, onToggle }) => (
        <label className="flex items-center justify-between p-3 rounded-lg bg-secondary cursor-pointer border border-border">
            <span className="font-medium text-foreground">{label}</span>
            <button
                type="button"
                onClick={onToggle}
                className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${enabled ? 'bg-primary' : 'bg-muted'}`}
            >
                <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${enabled ? 'translate-x-6' : 'translate-x-1'}`}/>
            </button>
        </label>
    );

    return (
        <div className="h-full flex flex-col">
            <h3 className="text-xl font-bold text-foreground mb-2 flex items-center gap-2">
                <Cog6ToothIcon className="w-6 h-6" /> POS Preferences
            </h3>
            <p className="text-sm text-muted-foreground mb-6">Customize the POS workflow to match your operational needs.</p>

            <div className="space-y-6 max-w-2xl overflow-y-auto pr-4">
                <div className="bg-card p-6 rounded-lg space-y-4 border border-border">
                    <div>
                        <label htmlFor="actionAfterSendOrder" className="block text-sm font-medium text-muted-foreground mb-1">Action After Sending an Order</label>
                        <select
                            id="actionAfterSendOrder"
                            name="actionAfterSendOrder"
                            value={localSettings.actionAfterSendOrder}
                            onChange={handleChange}
                            className="w-full bg-input p-2 rounded-md border border-border"
                        >
                            {actionOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                        </select>
                        <p className="text-xs text-muted-foreground mt-1">Choose what screen the POS shows after sending an order to the kitchen.</p>
                    </div>
                    <div>
                        <label htmlFor="actionAfterPayment" className="block text-sm font-medium text-muted-foreground mb-1">Action After Taking a Payment</label>
                        <select
                            id="actionAfterPayment"
                            name="actionAfterPayment"
                            value={localSettings.actionAfterPayment}
                            onChange={handleChange}
                            className="w-full bg-input p-2 rounded-md border border-border"
                        >
                            {actionOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                        </select>
                         <p className="text-xs text-muted-foreground mt-1">Choose what screen the POS shows after successfully completing a transaction.</p>
                    </div>
                     <div>
                        <label htmlFor="defaultPaymentMethod" className="block text-sm font-medium text-muted-foreground mb-1">Default Payment Method</label>
                        <select
                            id="defaultPaymentMethod"
                            name="defaultPaymentMethod"
                            value={localSettings.defaultPaymentMethod}
                            onChange={handleChange}
                            className="w-full bg-input p-2 rounded-md border border-border"
                        >
                            {paymentTypes.map((pt: PaymentType) => <option key={pt.id} value={pt.name}>{pt.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="defaultOrderType" className="block text-sm font-medium text-muted-foreground mb-1">Default Order Type</label>
                        <select
                            id="defaultOrderType"
                            name="defaultOrderType"
                            value={localSettings.defaultOrderType}
                            onChange={handleChange}
                            className="w-full bg-input p-2 rounded-md border border-border"
                        >
                            <option value="dine-in">Dine In</option>
                            <option value="takeaway">Take Away</option>
                            <option value="delivery">Delivery</option>
                        </select>
                    </div>
                    <ToggleRow label="Enable Order Notes" enabled={localSettings.enableOrderNotes} onToggle={() => handleToggle('enableOrderNotes')} />
                    <ToggleRow label="Enable Kitchen Print on Send" enabled={localSettings.enableKitchenPrint} onToggle={() => handleToggle('enableKitchenPrint')} />
                    <ToggleRow label="Enable Order Hold Button" enabled={localSettings.enableOrderHold} onToggle={() => handleToggle('enableOrderHold')} />
                    <ToggleRow label="Reset Order Number Daily" enabled={localSettings.resetOrderNumberDaily} onToggle={() => handleToggle('resetOrderNumberDaily')} />
                </div>
            </div>

            <div className="mt-auto pt-6 text-right">
                <button
                    onClick={handleSave}
                    className="px-6 py-2 rounded-md bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors shadow-lg"
                >
                    Save Preferences
                </button>
            </div>
        </div>
    );
};

export default PreferencesSettingsView;