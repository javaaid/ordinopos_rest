import React, { useState, useEffect } from 'react';
import { useAppContext, useToastContext, useDataContext } from '../contexts/AppContext';
import { AppSettings, POSPreferences, OrderType, PaymentType, TranslationKey } from '../types';
import Cog6ToothIcon from './icons/Cog6ToothIcon';
import { useTranslations } from '../hooks/useTranslations';

const PreferencesSettingsView: React.FC = () => {
    const { settings, setSettings } = useAppContext();
    const t = useTranslations(settings.language.staff);
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

    const actionOptions: {value: 'order' | 'tables' | 'login', labelKey: TranslationKey}[] = [
        { value: 'order', labelKey: 'prefs_action_option_order' },
        { value: 'tables', labelKey: 'prefs_action_option_tables' },
        { value: 'login', labelKey: 'prefs_action_option_login' },
    ];

    const orderTypeOptions: {value: OrderType, labelKey: TranslationKey}[] = [
        { value: 'dine-in', labelKey: 'dine_in' },
        { value: 'takeaway', labelKey: 'take_away' },
        { value: 'delivery', labelKey: 'delivery' },
    ]

    const ToggleRow: React.FC<{ labelKey: TranslationKey; enabled: boolean; onToggle?: () => void; }> = ({ labelKey, enabled, onToggle }) => (
        <label className="flex items-center justify-between p-3 rounded-lg bg-secondary cursor-pointer border border-border">
            <span className="font-medium text-foreground">{t(labelKey)}</span>
            <button
                type="button"
                onClick={() => {
                    if (typeof onToggle === 'function') {
                        onToggle();
                    }
                }}
                className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${enabled ? 'bg-primary' : 'bg-muted'}`}
            >
                <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${enabled ? 'translate-x-6' : 'translate-x-1'}`}/>
            </button>
        </label>
    );

    return (
        <div className="h-full flex flex-col p-6">
            <div className="text-start rtl:text-end">
                <h3 className="text-xl font-bold text-foreground mb-2 flex items-center gap-2 rtl:flex-row-reverse">
                    <Cog6ToothIcon className="w-6 h-6" /> {t('prefs_title')}
                </h3>
                <p className="text-sm text-muted-foreground mb-6">{t('prefs_description')}</p>
            </div>


            <div className="space-y-6 max-w-2xl overflow-y-auto pr-4">
                <div className="bg-card p-6 rounded-lg space-y-4 border border-border text-start rtl:text-end">
                    <div>
                        <label htmlFor="actionAfterSendOrder" className="block text-sm font-medium text-muted-foreground mb-1">{t('prefs_actionAfterSend_label')}</label>
                        <select
                            id="actionAfterSendOrder"
                            name="actionAfterSendOrder"
                            value={localSettings.actionAfterSendOrder}
                            onChange={handleChange}
                            className="w-full bg-input p-2 rounded-md border border-border"
                        >
                            {actionOptions.map(opt => <option key={opt.value} value={opt.value}>{t(opt.labelKey)}</option>)}
                        </select>
                        <p className="text-xs text-muted-foreground mt-1">{t('prefs_actionAfterSend_desc')}</p>
                    </div>
                    <div>
                        <label htmlFor="actionAfterPayment" className="block text-sm font-medium text-muted-foreground mb-1">{t('prefs_actionAfterPayment_label')}</label>
                        <select
                            id="actionAfterPayment"
                            name="actionAfterPayment"
                            value={localSettings.actionAfterPayment}
                            onChange={handleChange}
                            className="w-full bg-input p-2 rounded-md border border-border"
                        >
                            {actionOptions.map(opt => <option key={opt.value} value={opt.value}>{t(opt.labelKey)}</option>)}
                        </select>
                         <p className="text-xs text-muted-foreground mt-1">{t('prefs_actionAfterPayment_desc')}</p>
                    </div>
                     <div>
                        <label htmlFor="defaultPaymentMethod" className="block text-sm font-medium text-muted-foreground mb-1">{t('prefs_defaultPayment_label')}</label>
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
                        <label htmlFor="defaultOrderType" className="block text-sm font-medium text-muted-foreground mb-1">{t('prefs_defaultOrderType_label')}</label>
                        <select
                            id="defaultOrderType"
                            name="defaultOrderType"
                            value={localSettings.defaultOrderType}
                            onChange={handleChange}
                            className="w-full bg-input p-2 rounded-md border border-border"
                        >
                            {orderTypeOptions.map(opt => <option key={opt.value} value={opt.value}>{t(opt.labelKey)}</option>)}
                        </select>
                    </div>
                    <ToggleRow labelKey="prefs_enableOrderNotes_label" enabled={localSettings.enableOrderNotes} onToggle={() => handleToggle('enableOrderNotes')} />
                    <ToggleRow labelKey="prefs_enableKitchenPrint_label" enabled={localSettings.enableKitchenPrint} onToggle={() => handleToggle('enableKitchenPrint')} />
                    <ToggleRow labelKey="prefs_enableOrderHold_label" enabled={localSettings.enableOrderHold} onToggle={() => handleToggle('enableOrderHold')} />
                    <ToggleRow labelKey="prefs_resetOrderNumberDaily_label" enabled={localSettings.resetOrderNumberDaily} onToggle={() => handleToggle('resetOrderNumberDaily')} />
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

export default PreferencesSettingsView;
