import React, { useState } from 'react';
import CategoryManagementTab from './CategoryManagementTab';
import ModifierManagementTab from './ModifierManagementTab';
import { useAppContext } from '../contexts/AppContext';
import PromotionsView from './PromotionsView';
import KitchenNoteManagementTab from './KitchenNoteManagementTab';
import VoidReasonManagementTab from './VoidReasonManagementTab';
import DiscountManagementTab from './DiscountManagementTab';
import GratuityManagementTab from './GratuityManagementTab';
import SurchargeManagementTab from './SurchargeManagementTab';
import NumberingSettingsView from './NumberingSettingsView';
import ProductsView from './ProductsView';

type MenuTab = 'Categories' | 'Products' | 'Modifiers' | 'Promotions' | 'Kitchen Notes' | 'Void Reasons' | 'Discounts' | 'Gratuity' | 'Surcharges';

const MenuSettingsView: React.FC = () => {
    const { settings } = useAppContext();
    const [activeTab, setActiveTab] = useState<MenuTab>('Products');

    const tabs: MenuTab[] = [
        'Products', 'Categories', 'Modifiers', 'Promotions', 'Kitchen Notes', 'Void Reasons', 
        'Discounts', 'Gratuity', 'Surcharges'
    ];

    const tabButtonClass = (tab: MenuTab) =>
        `px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
            activeTab === tab
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground hover:bg-muted'
        }`;

    const renderContent = () => {
        switch (activeTab) {
            case 'Products': return <ProductsView />;
            case 'Categories': return <CategoryManagementTab />;
            case 'Modifiers': return <ModifierManagementTab />;
            case 'Promotions': return <PromotionsView />;
            case 'Discounts': return <DiscountManagementTab />;
            case 'Kitchen Notes': return <KitchenNoteManagementTab />;
            case 'Void Reasons': return <VoidReasonManagementTab />;
            case 'Gratuity': return <div className="p-6"><GratuityManagementTab /></div>;
            case 'Surcharges': return <SurchargeManagementTab />;
            default: return null;
        }
    };

    return (
        <div className="h-full flex flex-col">
             <div className="p-6 border-b border-border shrink-0">
                 <h2 className="text-2xl font-bold text-foreground mb-4">Menu Management</h2>
                <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide">
                    {tabs.map(tab => (
                        <button key={tab} onClick={() => setActiveTab(tab)} className={tabButtonClass(tab)}>
                            {tab}
                        </button>
                    ))}
                </div>
            </div>
            <div className="flex-grow overflow-hidden">
                {renderContent()}
            </div>
            <style>{`.scrollbar-hide::-webkit-scrollbar { display: none; } .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }`}</style>
        </div>
    );
};

export default MenuSettingsView;
