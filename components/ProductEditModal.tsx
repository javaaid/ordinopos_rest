import React, { useState, useEffect, KeyboardEvent } from 'react';
import { MenuItem, Category, ModifierGroup, KitchenNote, Printer, KitchenDisplay, RecipeItem, Ingredient } from '../types';
import { useDataContext, useAppContext } from '../contexts/AppContext';
import { Modal, ModalHeader, ModalTitle, ModalContent, ModalFooter } from './ui/Modal';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { Textarea } from './ui/Textarea';
import { Select } from './ui/Select';
import TrashIcon from './icons/TrashIcon';
import { cn } from '../lib/utils';
import ArrowPathIcon from './icons/ArrowPathIcon';
import PlusIcon from './icons/PlusIcon';
import XMarkIcon from './icons/XMarkIcon';
import { useTranslations } from '../hooks/useTranslations';

interface MenuItemEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (menuItem: MenuItem, recipe: RecipeItem[]) => void;
  product: MenuItem | null;
  onAddNewCategory: () => void;
  justAddedCategoryId?: string | null;
  onClearJustAddedCategoryId?: () => void;
}

type Tab = 'General' | 'Pricing' | 'Inventory' | 'Recipe' | 'Advanced';

const Toggle: React.FC<{ label: string; enabled: boolean; onToggle?: () => void; disabled?: boolean }> = ({ label, enabled, onToggle, disabled = false }) => (
    <label className={cn("flex items-center justify-between p-2 rounded-md bg-secondary", disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer")}>
        <span className="text-sm font-medium text-secondary-foreground text-start rtl:text-end">{label}</span>
        <button
            type="button"
            onClick={() => {
                if (typeof onToggle === 'function') {
                    onToggle();
                }
            }}
            disabled={disabled}
            className={`relative inline-flex items-center h-5 w-9 transition-colors rounded-full ${enabled ? 'bg-primary' : 'bg-muted'}`}
        >
            <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${enabled ? 'translate-x-5' : 'translate-x-0.5'}`}/>
        </button>
    </label>
);


const MenuItemEditModal: React.FC<MenuItemEditModalProps> = ({ isOpen, onClose, onSave, product, onAddNewCategory, justAddedCategoryId, onClearJustAddedCategoryId }) => {
    const { categories, modifierGroups, kitchenNotes, printers, kitchenDisplays, ingredients, recipes, settings } = useDataContext();
    const t = useTranslations(settings.language.staff);
    const { isAdvancedInventoryPluginActive } = useAppContext();
    const [activeTab, setActiveTab] = useState<Tab>('General');
    const [formData, setFormData] = useState<Partial<MenuItem>>({});
    const [recipeItems, setRecipeItems] = useState<RecipeItem[]>([]);
    const [barcodeInput, setBarcodeInput] = useState('');

    useEffect(() => {
        if (isOpen) {
            const initialRecipe = product ? recipes[product.id] || [] : [];
            const cleanedRecipe = initialRecipe.filter(recipeItem =>
                ingredients.find((ing: Ingredient) => ing.id === recipeItem.ingredientId)
            );

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
                setRecipeItems(cleanedRecipe);
            } else {
                setFormData({
                    name: '', price: 0, category: categories[0]?.id || '', isActive: true, isVeg: false, isDiscountable: true, displayImage: false, askPrice: false, stopSaleAtZeroStock: false, hideName: false, askQuantity: false, useScale: false, alwaysShowModifiers: false, promptForKitchenNote: false, locationIds: [], taxCategory: 'Standard', kdsId: 'kds_1', kitchenPrinterId: 'kp1', memberPrice1: undefined, memberPrice2: undefined, memberPrice3: undefined, barcodes: [],
                });
                setRecipeItems([]);
            }
             setBarcodeInput('');
        }
    }, [product, categories, isOpen, recipes, ingredients]);

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
        onSave(formData as MenuItem, recipeItems);
        onClose();
    };

    const addBarcode = (barcode: string) => {
        const cleanedBarcode = barcode.trim();
        if (cleanedBarcode && !(formData.barcodes || []).includes(cleanedBarcode)) {
            setFormData(prev => ({ ...prev, barcodes: [...(prev.barcodes || []), cleanedBarcode] }));
        }
        setBarcodeInput('');
    };

    const handleBarcodeKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            addBarcode(barcodeInput);
        }
    };

    const removeBarcode = (index: number) => {
        setFormData(prev => ({ ...prev, barcodes: (prev.barcodes || []).filter((_, i) => i !== index) }));
    };

    const generateBarcode = () => {
        // Generate a random 12-digit number for EAN-13
        const randomNumber = Math.floor(100000000000 + Math.random() * 900000000000).toString();
        // Calculate EAN-13 check digit
        let sum = 0;
        for (let i = 0; i < 12; i++) {
            sum += parseInt(randomNumber[i], 10) * (i % 2 === 0 ? 1 : 3);
        }
        const checkDigit = (10 - (sum % 10)) % 10;
        const newBarcode = randomNumber + checkDigit;
        addBarcode(newBarcode);
    };
    
    const renderGeneralTab = () => (
        <div className="space-y-4 text-start rtl:text-end">
            <Input name="name" value={formData.name || ''} onChange={handleChange} placeholder={t('productName')} required />
            <div className="flex gap-2">
                <Select name="category" value={formData.category} onChange={handleChange} className="flex-grow" required>
                    <option value="" disabled>Select a Category</option>
                    {categories.map((cat: Category) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                </Select>
                <Button type="button" variant="outline" onClick={onAddNewCategory}>{t('new')}</Button>
            </div>
            <Input name="course" value={formData.course || ''} onChange={handleChange} placeholder={t('course')} />
            <Input name="kitchenName" value={formData.kitchenName || ''} onChange={handleChange} placeholder={t('kitchenName')} />
             <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">{t('barcodes')}</label>
                 <div className="flex items-center flex-wrap gap-2 p-2 bg-input border border-border rounded-md">
                     {(formData.barcodes || []).map((barcode, index) => (
                        <div key={index} className="flex items-center gap-1.5 bg-secondary text-secondary-foreground text-sm font-mono px-2 py-1 rounded">
                            <span>{barcode}</span>
                            <button type="button" onClick={() => removeBarcode(index)} className="text-muted-foreground hover:text-foreground">
                                <XMarkIcon className="w-3 h-3"/>
                            </button>
                        </div>
                    ))}
                     <input
                        type="text"
                        value={barcodeInput}
                        onChange={(e) => setBarcodeInput(e.target.value)}
                        onKeyDown={handleBarcodeKeyDown}
                        placeholder={t('addBarcode')}
                        className="bg-transparent outline-none flex-grow text-sm"
                    />
                 </div>
                 <div className="flex items-center gap-2 mt-2">
                     <Button type="button" variant="outline" size="sm" onClick={generateBarcode} className="flex items-center gap-2">
                        <ArrowPathIcon className="w-4 h-4" /> {t('generateEAN13')}
                    </Button>
                </div>
            </div>
            <Input name="imageUrl" value={formData.imageUrl || ''} onChange={handleChange} placeholder={t('imageUrl')} />
             <div>
                <label className="text-xs text-muted-foreground">{t('displayOrder')}</label>
                <Input type="number" name="displayOrder" value={formData.displayOrder ?? ''} onChange={handleNumberChange} placeholder={t('displayOrderExample')} />
            </div>
             <div className="grid grid-cols-3 gap-2">
                <Toggle label={t('active')} enabled={!!formData.isActive} onToggle={() => setFormData(p => ({...p, isActive: !p.isActive}))} />
                <Toggle label={t('isVeg')} enabled={!!formData.isVeg} onToggle={() => setFormData(p => ({...p, isVeg: !p.isVeg}))} />
                <Toggle label={t('displayImageOnPOS')} enabled={!!formData.displayImage} onToggle={() => setFormData(p => ({...p, displayImage: !p.displayImage}))} />
            </div>
        </div>
    );
    
    const renderPricingTab = () => (
        <div className="space-y-4 text-start rtl:text-end">
            <div className="grid grid-cols-2 gap-4">
                <div><label className="text-xs text-muted-foreground">{t('dineInPrice')}</label><Input type="number" name="price" value={formData.price ?? ''} onChange={handleNumberChange} required /></div>
                <div><label className="text-xs text-muted-foreground">{t('takeOutPrice')}</label><Input type="number" name="takeawayPrice" value={formData.takeawayPrice ?? ''} onChange={handleNumberChange} /></div>
                <div><label className="text-xs text-muted-foreground">{t('deliveryPrice')}</label><Input type="number" name="deliveryPrice" value={formData.deliveryPrice ?? ''} onChange={handleNumberChange} /></div>
                <div><label className="text-xs text-muted-foreground">{t('cost')}</label><Input type="number" name="cost" value={formData.cost ?? ''} onChange={handleNumberChange} /></div>
            </div>
             <div className="pt-4 border-t border-border mt-4">
                <h4 className="font-bold text-foreground mb-2">{t('memberPricing')}</h4>
                <div className="grid grid-cols-3 gap-4">
                    <div><label className="text-xs text-muted-foreground">{t('memberPrice1')}</label><Input type="number" name="memberPrice1" value={formData.memberPrice1 ?? ''} onChange={handleNumberChange} /></div>
                    <div><label className="text-xs text-muted-foreground">{t('memberPrice2')}</label><Input type="number" name="memberPrice2" value={formData.memberPrice2 ?? ''} onChange={handleNumberChange} /></div>
                    <div><label className="text-xs text-muted-foreground">{t('memberPrice3')}</label><Input type="number" name="memberPrice3" value={formData.memberPrice3 ?? ''} onChange={handleNumberChange} /></div>
                </div>
            </div>
             <Toggle label={t('askPriceOnSale')} enabled={!!formData.askPrice} onToggle={() => setFormData(p => ({...p, askPrice: !p.askPrice}))} />
        </div>
    );

    const hasRecipe = recipeItems.length > 0;
    
    const renderInventoryTab = () => (
            <div className="space-y-4 text-start rtl:text-end">
                 {hasRecipe ? (
                    <p className="text-sm text-yellow-600 p-3 bg-yellow-500/10 rounded-md border border-yellow-500/20">
                        <strong>{t('inventoryManagedByRecipe')}</strong><br/>
                        {t('inventoryManagedByRecipeDesc')}
                    </p>
                ) : (
                    <p className="text-sm text-muted-foreground p-2 bg-blue-500/10 rounded-md border border-blue-500/20">
                        {t('directStockManagementInfo')}
                    </p>
                )}

                 <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-xs text-muted-foreground">{t('stock')}</label>
                        <Input 
                            type="number" 
                            name="stock" 
                            value={formData.stock ?? ''} 
                            onChange={handleNumberChange}
                        />
                    </div>
                    <div>
                        <label className="text-xs text-muted-foreground">{t('warnQty')}</label>
                        <Input 
                            type="number" 
                            name="warnQty" 
                            value={formData.warnQty ?? ''} 
                            onChange={handleNumberChange}
                        />
                    </div>
                </div>
                <Toggle 
                    label={t('stopSaleAtZeroStock')}
                    enabled={!!formData.stopSaleAtZeroStock} 
                    onToggle={() => setFormData(p => ({...p, stopSaleAtZeroStock: !p.stopSaleAtZeroStock}))} 
                />
            </div>
        );
    
    const renderRecipeTab = () => {
        const handleAddIngredient = (ingredientId: string) => {
            if (ingredientId && !recipeItems.some(item => item.ingredientId === ingredientId)) {
                setRecipeItems(prev => [...prev, { ingredientId, quantity: 1 }]);
            }
        };

        const handleRemoveIngredient = (ingredientId: string) => {
            setRecipeItems(prev => prev.filter(item => item.ingredientId !== ingredientId));
        };

        const handleQuantityChange = (ingredientId: string, quantity: number) => {
            setRecipeItems(prev => prev.map(item => item.ingredientId === ingredientId ? { ...item, quantity } : item));
        };

        return (
            <div className="space-y-4 text-start rtl:text-end">
                <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">{t('addIngredientToRecipe')}</label>
                    <Select onChange={e => handleAddIngredient(e.target.value)} value="">
                        <option value="" disabled>{t('selectAnIngredient')}</option>
                        {ingredients.map((ing: Ingredient) => (
                            <option key={ing.id} value={ing.id}>{ing.name} ({ing.unit})</option>
                        ))}
                    </Select>
                </div>
                <div className="space-y-2 max-h-60 overflow-y-auto p-2 bg-background rounded-md border">
                    {recipeItems.map(item => {
                        const ingredient = ingredients.find((i: Ingredient) => i.id === item.ingredientId);
                        if (!ingredient) return null;
                        return (
                            <div key={item.ingredientId} className="flex items-center gap-2 p-2 bg-secondary rounded">
                                <span className="flex-grow font-medium">{ingredient.name}</span>
                                <Input
                                    type="number"
                                    value={item.quantity}
                                    onChange={e => handleQuantityChange(item.ingredientId, parseFloat(e.target.value) || 0)}
                                    className="w-24"
                                    step="0.01"
                                />
                                <span className="text-sm text-muted-foreground w-8">{ingredient.unit}</span>
                                <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveIngredient(item.ingredientId)}>
                                    <TrashIcon className="w-4 h-4 text-destructive" />
                                </Button>
                            </div>
                        );
                    })}
                </div>
                {recipeItems.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">{t('noIngredientsInRecipe')}</p>
                )}
            </div>
        );
    };

    const renderAdvancedTab = () => (
        <div className="space-y-4 text-start rtl:text-end">
            <div className="grid grid-cols-2 gap-2">
                <Toggle label={t('discountable')} enabled={!!formData.isDiscountable} onToggle={() => setFormData(p => ({...p, isDiscountable: !p.isDiscountable}))} />
                <Toggle label={t('hideNameOnBill')} enabled={!!formData.hideName} onToggle={() => setFormData(p => ({...p, hideName: !p.hideName}))} />
                <Toggle label={t('askForQuantity')} enabled={!!formData.askQuantity} onToggle={() => setFormData(p => ({...p, askQuantity: !p.askQuantity}))} />
                <Toggle label={t('useWeighingScale')} enabled={!!formData.useScale} onToggle={() => setFormData(p => ({...p, useScale: !p.useScale}))} />
                <Toggle label={t('alwaysShowModifiers')} enabled={!!formData.alwaysShowModifiers} onToggle={() => setFormData(p => ({...p, alwaysShowModifiers: !p.alwaysShowModifiers}))} />
                <Toggle label={t('promptForKitchenNote')} enabled={!!formData.promptForKitchenNote} onToggle={() => setFormData(p => ({...p, promptForKitchenNote: !p.promptForKitchenNote}))} />
            </div>
            <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">{t('modifiers')}</label>
                <div className="max-h-32 overflow-y-auto bg-secondary p-2 rounded-md space-y-1">
                    {modifierGroups.map((group: ModifierGroup) => (
                        <label key={group.id} className="flex items-center gap-2 p-1.5 rounded hover:bg-muted">
                            <input type="checkbox" checked={formData.modifierGroupIds?.includes(group.id)} onChange={() => handleModifierToggle(group.id)} />
                            {group.name}
                        </label>
                    ))}
                </div>
            </div>
             <div><label className="text-xs text-muted-foreground">{t('kitchenNote')}</label><Textarea name="kitchenNote" value={formData.kitchenNote || ''} onChange={handleChange} /></div>
            <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="text-xs text-muted-foreground">{t('kitchenPrinter')}</label>
                    <Select name="kitchenPrinterId" value={formData.kitchenPrinterId || ''} onChange={handleChange}>
                        <option value="">Default</option>
                        {printers.map((p: Printer) => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </Select>
                 </div>
                 <div>
                    <label className="text-xs text-muted-foreground">{t('kitchenDisplay')}</label>
                     <Select name="kdsId" value={formData.kdsId || ''} onChange={handleChange}>
                        <option value="">Default</option>
                        {kitchenDisplays.map((kds: KitchenDisplay) => <option key={kds.id} value={kds.id}>{kds.name}</option>)}
                    </Select>
                 </div>
            </div>
        </div>
    );
    
    const isInventoryTabDisabled = !isAdvancedInventoryPluginActive;
    const inventoryTooltip = !isAdvancedInventoryPluginActive
      ? "Enable the 'Advanced Inventory' plugin to manage stock."
      : undefined;
  
    const isRecipeTabDisabled = !isAdvancedInventoryPluginActive;
    const recipeTooltip = !isAdvancedInventoryPluginActive
      ? "Enable the 'Advanced Inventory' plugin to manage recipes."
      : undefined;

    const tabs: { name: Tab; label: string; content: () => React.ReactNode; disabled?: boolean; tooltip?: string; }[] = [
        { name: 'General', label: t('general'), content: renderGeneralTab },
        { name: 'Pricing', label: t('pricing'), content: renderPricingTab },
        { 
            name: 'Inventory', 
            label: t('inventory'),
            content: renderInventoryTab, 
            disabled: isInventoryTabDisabled,
            tooltip: inventoryTooltip,
        },
        { 
            name: 'Recipe',
            label: t('recipe'),
            content: renderRecipeTab,
            disabled: isRecipeTabDisabled,
            tooltip: recipeTooltip,
        },
        { name: 'Advanced', label: t('advanced'), content: renderAdvancedTab },
    ];


    return (
        <Modal isOpen={isOpen} onClose={onClose} className="max-w-2xl">
            <form onSubmit={handleSubmit}>
                <ModalHeader>
                    <ModalTitle>{product ? t('editProduct') : t('addNewProduct')}</ModalTitle>
                </ModalHeader>
                <ModalContent className="p-0">
                    <div className="border-b border-border flex">
                        {tabs.map(tab => (
                            <button
                                type="button"
                                key={tab.name}
                                onClick={() => !tab.disabled && setActiveTab(tab.name)}
                                title={tab.tooltip}
                                className={cn(
                                    'px-4 py-3 text-sm font-semibold -mb-px border-b-2',
                                    activeTab === tab.name 
                                        ? 'border-primary text-primary' 
                                        : 'border-transparent text-muted-foreground',
                                    tab.disabled 
                                        ? 'cursor-not-allowed opacity-50' 
                                        : 'hover:text-foreground'
                                )}
                                disabled={tab.disabled}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                    <div className="p-6">{tabs.find(t => t.name === activeTab)?.content()}</div>
                </ModalContent>
                <ModalFooter>
                    <Button type="button" variant="ghost" onClick={onClose}>{t('cancel')}</Button>
                    <Button type="submit">{t('saveProduct')}</Button>
                </ModalFooter>
            </form>
        </Modal>
    );
};

export default MenuItemEditModal;