import React, { useState, useEffect } from 'react';
import { MenuItem, Category, ModifierGroup, KitchenNote, Printer, KitchenDisplay } from '../types';
import { useDataContext, useAppContext } from '../contexts/AppContext';
import { Modal, ModalHeader, ModalTitle, ModalContent, ModalFooter } from './ui/Modal';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { Textarea } from './ui/Textarea';
import { Select } from './ui/Select';

interface MenuItemEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (menuItem: MenuItem) => void;
  product: MenuItem | null; // Renamed from product to menuItem for clarity
  onAddNewCategory: () => void;
  justAddedCategoryId?: string | null;
  onClearJustAddedCategoryId?: () => void;
}

type Tab = 'General' | 'Pricing' | 'Inventory' | 'Advanced';

const Toggle: React.FC<{ label: string; enabled: boolean; onToggle: () => void; }> = ({ label, enabled, onToggle }) => (
    <label className="flex items-center justify-between p-2 rounded-md bg-secondary cursor-pointer">
        <span className="text-sm font-medium text-secondary-foreground">{label}</span>
        <button
            type="button"
            onClick={onToggle}
            className={`relative inline-flex items-center h-5 w-9 transition-colors rounded-full ${enabled ? 'bg-primary' : 'bg-muted'}`}
        >
            <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${enabled ? 'translate-x-5' : 'translate-x-0.5'}`}/>
        </button>
    </label>
);


const MenuItemEditModal: React.FC<MenuItemEditModalProps> = ({ isOpen, onClose, onSave, product, onAddNewCategory, justAddedCategoryId, onClearJustAddedCategoryId }) => {
    const { categories, modifierGroups, kitchenNotes, printers, kitchenDisplays } = useDataContext();
    const [activeTab, setActiveTab] = useState<Tab>('General');
    const [formData, setFormData] = useState<Partial<MenuItem>>({});

    useEffect(() => {
        if (product) {
            setFormData({
                ...product,
                isActive: product.isActive !== false,
                isVeg: !!product.isVeg,
                displayImage: !!product.displayImage,
                askPrice: !!product.askPrice,
                stopSaleAtZeroStock: !!product.stopSaleAtZeroStock,
                isDiscountable: product.isDiscountable !== false,
                hideName: !!product.hideName,
                askQuantity: !!product.askQuantity,
                useScale: !!product.useScale,
                alwaysShowModifiers: !!product.alwaysShowModifiers,
                promptForKitchenNote: !!product.promptForKitchenNote,
            });
        } else {
            // Defaults for a new item
            setFormData({
                name: '',
                price: 0,
                category: categories[0]?.id || '',
                isActive: true,
                isVeg: false,
                isDiscountable: true,
                displayImage: false,
                askPrice: false,
                stopSaleAtZeroStock: false,
                hideName: false,
                askQuantity: false,
                useScale: false,
                alwaysShowModifiers: false,
                promptForKitchenNote: false,
                locationIds: [], // Should be handled on save
                taxCategory: 'Standard',
                kdsId: 'kds_1',
                kitchenPrinterId: 'kp1',
                memberPrice1: undefined,
                memberPrice2: undefined,
                memberPrice3: undefined,
            });
        }
    }, [product, categories, isOpen]);

    useEffect(() => {
        if (isOpen && justAddedCategoryId && onClearJustAddedCategoryId) {
            setFormData(prev => ({ ...prev, category: justAddedCategoryId }));
            onClearJustAddedCategoryId();
        }
    }, [isOpen, justAddedCategoryId, onClearJustAddedCategoryId]);


    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const isCheckbox = type === 'checkbox';
        const checked = isCheckbox ? (e.target as HTMLInputElement).checked : undefined;
        setFormData(prev => ({ ...prev, [name]: isCheckbox ? checked : value }));
    };
    
    const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value === '' ? undefined : parseFloat(value) }));
    };
    
    const handleModifierToggle = (groupId: string) => {
        setFormData(prev => {
            const currentIds = prev.modifierGroupIds || [];
            if (currentIds.includes(groupId)) {
                return { ...prev, modifierGroupIds: currentIds.filter(id => id !== groupId) };
            } else {
                return { ...prev, modifierGroupIds: [...currentIds, groupId] };
            }
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData as MenuItem);
        onClose();
    };

    const renderGeneralTab = () => (
        <div className="space-y-4">
            <Input name="name" value={formData.name || ''} onChange={handleChange} placeholder="Product Name" required />
            <div className="flex gap-2">
                <Select name="category" value={formData.category} onChange={handleChange} className="flex-grow" required>
                    <option value="" disabled>Select a Category</option>
                    {categories.map((cat: Category) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                </Select>
                <Button type="button" variant="outline" onClick={onAddNewCategory}>New</Button>
            </div>
            <Input name="course" value={formData.course || ''} onChange={handleChange} placeholder="Course (e.g., Appetizer, Main)" />
            <Input name="kitchenName" value={formData.kitchenName || ''} onChange={handleChange} placeholder="Kitchen Name (for KDS/printers)" />
            <Input name="barcode" value={formData.barcode || ''} onChange={handleChange} placeholder="Barcode Number" />
            <Input name="imageUrl" value={formData.imageUrl || ''} onChange={handleChange} placeholder="Image URL" />
             <div>
                <label className="text-xs text-muted-foreground">Display Order</label>
                <Input type="number" name="displayOrder" value={formData.displayOrder ?? ''} onChange={handleNumberChange} placeholder="e.g., 1, 2, 3... for sorting" />
            </div>
             <div className="grid grid-cols-3 gap-2">
                <Toggle label="Active" enabled={!!formData.isActive} onToggle={() => setFormData(p => ({...p, isActive: !p.isActive}))} />
                <Toggle label="Is Veg" enabled={!!formData.isVeg} onToggle={() => setFormData(p => ({...p, isVeg: !p.isVeg}))} />
                <Toggle label="Display Image on POS" enabled={!!formData.displayImage} onToggle={() => setFormData(p => ({...p, displayImage: !p.displayImage}))} />
            </div>
        </div>
    );
    
    const renderPricingTab = () => (
        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div><label className="text-xs text-muted-foreground">Dine In Price</label><Input type="number" name="price" value={formData.price ?? ''} onChange={handleNumberChange} required /></div>
                <div><label className="text-xs text-muted-foreground">Take Out Price</label><Input type="number" name="takeawayPrice" value={formData.takeawayPrice ?? ''} onChange={handleNumberChange} /></div>
                <div><label className="text-xs text-muted-foreground">Delivery Price</label><Input type="number" name="deliveryPrice" value={formData.deliveryPrice ?? ''} onChange={handleNumberChange} /></div>
                <div><label className="text-xs text-muted-foreground">Cost</label><Input type="number" name="cost" value={formData.cost ?? ''} onChange={handleNumberChange} /></div>
            </div>
             <div className="pt-4 border-t border-border mt-4">
                <h4 className="font-bold text-foreground mb-2">Member Pricing</h4>
                <div className="grid grid-cols-3 gap-4">
                    <div><label className="text-xs text-muted-foreground">Member Price 1</label><Input type="number" name="memberPrice1" value={formData.memberPrice1 ?? ''} onChange={handleNumberChange} /></div>
                    <div><label className="text-xs text-muted-foreground">Member Price 2</label><Input type="number" name="memberPrice2" value={formData.memberPrice2 ?? ''} onChange={handleNumberChange} /></div>
                    <div><label className="text-xs text-muted-foreground">Member Price 3</label><Input type="number" name="memberPrice3" value={formData.memberPrice3 ?? ''} onChange={handleNumberChange} /></div>
                </div>
            </div>
             <Toggle label="Ask for price on sale" enabled={!!formData.askPrice} onToggle={() => setFormData(p => ({...p, askPrice: !p.askPrice}))} />
        </div>
    );

    const renderInventoryTab = () => (
        <div className="space-y-4">
             <div className="grid grid-cols-2 gap-4">
                <div><label className="text-xs text-muted-foreground">Stock</label><Input type="number" name="stock" value={formData.stock ?? ''} onChange={handleNumberChange} /></div>
                <div><label className="text-xs text-muted-foreground">Warn Qty</label><Input type="number" name="warnQty" value={formData.warnQty ?? ''} onChange={handleNumberChange} /></div>
            </div>
            <Toggle label="Stop sale at zero stock" enabled={!!formData.stopSaleAtZeroStock} onToggle={() => setFormData(p => ({...p, stopSaleAtZeroStock: !p.stopSaleAtZeroStock}))} />
        </div>
    );

    const renderAdvancedTab = () => (
        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
                <Toggle label="Discountable" enabled={!!formData.isDiscountable} onToggle={() => setFormData(p => ({...p, isDiscountable: !p.isDiscountable}))} />
                <Toggle label="Hide Name on Bill" enabled={!!formData.hideName} onToggle={() => setFormData(p => ({...p, hideName: !p.hideName}))} />
                <Toggle label="Ask for Quantity" enabled={!!formData.askQuantity} onToggle={() => setFormData(p => ({...p, askQuantity: !p.askQuantity}))} />
                <Toggle label="Use Weighing Scale" enabled={!!formData.useScale} onToggle={() => setFormData(p => ({...p, useScale: !p.useScale}))} />
                <Toggle label="Always Show Modifiers" enabled={!!formData.alwaysShowModifiers} onToggle={() => setFormData(p => ({...p, alwaysShowModifiers: !p.alwaysShowModifiers}))} />
                <Toggle label="Prompt for Kitchen Note" enabled={!!formData.promptForKitchenNote} onToggle={() => setFormData(p => ({...p, promptForKitchenNote: !p.promptForKitchenNote}))} />
            </div>
            <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Modifiers</label>
                <div className="max-h-32 overflow-y-auto bg-secondary p-2 rounded-md space-y-1">
                    {modifierGroups.map((group: ModifierGroup) => (
                        <label key={group.id} className="flex items-center gap-2 p-1.5 rounded hover:bg-muted">
                            <input type="checkbox" checked={formData.modifierGroupIds?.includes(group.id)} onChange={() => handleModifierToggle(group.id)} />
                            {group.name}
                        </label>
                    ))}
                </div>
            </div>
             <div><label className="text-xs text-muted-foreground">Kitchen Note</label><Textarea name="kitchenNote" value={formData.kitchenNote || ''} onChange={handleChange} /></div>
            <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="text-xs text-muted-foreground">Kitchen Printer</label>
                    <Select name="kitchenPrinterId" value={formData.kitchenPrinterId || ''} onChange={handleChange}>
                        <option value="">Default</option>
                        {printers.map((p: Printer) => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </Select>
                 </div>
                 <div>
                    <label className="text-xs text-muted-foreground">Kitchen Display (KDS)</label>
                     <Select name="kdsId" value={formData.kdsId || ''} onChange={handleChange}>
                        <option value="">Default</option>
                        {kitchenDisplays.map((kds: KitchenDisplay) => <option key={kds.id} value={kds.id}>{kds.name}</option>)}
                    </Select>
                 </div>
            </div>
        </div>
    );

    const tabs: { name: Tab; content: () => React.ReactNode; }[] = [
        { name: 'General', content: renderGeneralTab },
        { name: 'Pricing', content: renderPricingTab },
        { name: 'Inventory', content: renderInventoryTab },
        { name: 'Advanced', content: renderAdvancedTab },
    ];

    return (
        <Modal isOpen={isOpen} onClose={onClose} className="max-w-2xl">
            <form onSubmit={handleSubmit}>
                <ModalHeader>
                    <ModalTitle>{product ? 'Edit Product' : 'Add New Product'}</ModalTitle>
                </ModalHeader>
                <ModalContent className="p-0">
                    <div className="border-b border-border flex">
                        {tabs.map(tab => (
                            <button
                                type="button"
                                key={tab.name}
                                onClick={() => setActiveTab(tab.name)}
                                className={`px-4 py-3 text-sm font-semibold -mb-px border-b-2 ${activeTab === tab.name ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
                            >
                                {tab.name}
                            </button>
                        ))}
                    </div>
                    <div className="p-6">{tabs.find(t => t.name === activeTab)?.content()}</div>
                </ModalContent>
                <ModalFooter>
                    <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
                    <Button type="submit">Save Product</Button>
                </ModalFooter>
            </form>
        </Modal>
    );
};

export default MenuItemEditModal;