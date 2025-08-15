import React, { useState, useMemo, useEffect } from 'react';
import { CartItem, Customer, OrderType, Employee, AppliedDiscount, Language, Table, Location, Order, AppSettings, AIResponse, AISettings, Promotion } from '../types';
import OrderItem from './OrderItem';
import UserCircleIcon from './icons/UserCircleIcon';
import { calculateOrderTotals } from '../utils/calculations';
import SparklesIcon from './icons/SparklesIcon';
import AISuggestions from './AISuggestions';
import { useAppContext, useDataContext, usePOSContext, useModalContext } from '../contexts/AppContext';
import { Button } from './ui/Button';
import TrashIcon from './icons/TrashIcon';
import PauseIcon from './icons/PauseIcon';
import PlusCircleIcon from './icons/PlusCircleIcon';
import ChefHatIcon from './icons/ChefHatIcon';
import CreditCardIcon from './icons/CreditCardIcon';
import CurrencyDollarIcon from './icons/CurrencyDollarIcon';
import ClipboardDocumentListIcon from './icons/ClipboardDocumentListIcon';
import UserIcon from './icons/UserIcon';
import { useTranslations } from '../hooks/useTranslations';
import ShoppingBagIcon from './icons/ShoppingBagIcon';

export default function OrderSummary() {
  const { settings, currentEmployee, currentLocation } = useAppContext();
  
  if (!settings) {
    return null; // or a loading component
  }

  const { tables, orders, customers, handleSaveCustomer, manualDiscounts, employees } = useDataContext();
  const { 
    cart, onRemoveItem, onUpdateCartQuantity, currentTable, setCurrentTable: onSetCurrentTable, 
    selectedCustomer, setSelectedCustomer, onNewSaleClick, onVoidOrder, 
    appliedDiscount, appliedPromotion,
    aiUpsellSuggestions, isSuggestingUpsell, handleGetUpsellSuggestions, onSelectUpsellSuggestion,
    handleHoldOrder, availablePromotions,
    activeOrderToSettle, handleInitiateSettlePayment,
    handleSendToKitchen, handleSettleBill,
    orderType, setOrderType, handleApplyManualDiscount, handleRemoveDiscount, handleApplyPromotion,
    selectedStaff, setSelectedStaff,
    activeTab, handleSaveTab, handleSettleTab,
    handleInitiatePayment
  } = usePOSContext();
  const { openModal, closeModal } = useModalContext();
  const t = useTranslations(settings.language.staff);
  
  const isSettlingOrder = !!activeOrderToSettle;
  
  useEffect(() => {
    if (isSettlingOrder) {
      setOrderType(activeOrderToSettle.orderType);
    } else if (currentTable) {
      setOrderType('dine-in');
    } else if (activeTab) {
      setOrderType('tab');
    } else {
      // Fallback to default when no context is set
      setOrderType(settings.preferences.defaultOrderType);
    }
  }, [isSettlingOrder, currentTable, activeTab, settings.preferences.defaultOrderType, activeOrderToSettle, setOrderType]);
  
  const pendingTableOrders = useMemo(() => {
    if (!currentTable) return [];
    return (orders || []).filter((o: Order) => o.tableId === currentTable.id && (['kitchen', 'served'].includes(o.status)));
  }, [orders, currentTable]);

  const sentItems = useMemo(() => {
    if (activeTab) return activeTab.cart || [];
    return pendingTableOrders.flatMap((o: Order) => o.cart || []);
  }, [pendingTableOrders, activeTab]);
  
  const allItemsForBill = isSettlingOrder && activeOrderToSettle ? (activeOrderToSettle.cart || []) : [...sentItems, ...(cart || [])];

  const { subtotal, tax, total, taxDetails, discountAmount, finalAppliedDiscount } = useMemo(() => 
    calculateOrderTotals(allItemsForBill, currentLocation, appliedDiscount, appliedPromotion, orderType, settings, selectedCustomer),
  [allItemsForBill, currentLocation, appliedDiscount, appliedPromotion, orderType, settings, selectedCustomer]);
  
  const handleSelectCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    closeModal();
  };

  const handleAddNewCustomer = () => {
      openModal('customerEdit', { 
        onSave: (customer: Customer, isNew: boolean) => {
            handleSaveCustomer(customer, isNew);
            if (isNew) {
              setSelectedCustomer(customer);
            }
            closeModal();
        },
    });
  };
  
  const handleAddDiscountClick = () => {
      openModal('discount', { 
          discounts: manualDiscounts, 
          promotions: availablePromotions,
          onApplyDiscount: handleApplyManualDiscount,
          onApplyPromotion: handleApplyPromotion,
          onRemoveDiscount: handleRemoveDiscount,
          currentDiscount: finalAppliedDiscount
      });
  };

  const availableTablesByFloor = useMemo(() => {
    const locationTables = (tables || []).filter((t: Table) => t.locationId === currentLocation.id);
    const availableTables = locationTables.filter((t: Table) => t.status === 'available');
    const locationFloors = [...new Set(availableTables.map(t => t.floor))].sort();

    const grouped: { [floor: string]: Table[] } = {};
    for (const floor of locationFloors) {
        if (typeof floor === 'string' && floor) {
          grouped[floor] = availableTables.filter((t: Table) => t.floor === floor);
        }
    }
    return grouped;
  }, [tables, currentLocation]);

  const handleTableSelection = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const tableId = e.target.value;
    const selected = (tables || []).find((t: Table) => t.id === tableId);
    if (selected) {
        onSetCurrentTable(selected);
    }
  };
  
  const handleSelectStaff = (employee: Employee) => {
    setSelectedStaff(employee);
  };

  const handleChooseStaff = () => {
    const availableEmployees = (employees || []).filter((e: Employee) => e.locationId === currentLocation.id);
    openModal('chooseStaff', {
        employees: availableEmployees,
        onSelectStaff: handleSelectStaff,
        selectedStaffId: selectedStaff?.id,
    });
  };

  const showStaffSelection = settings.dineIn.enabled && settings.dineIn.enableStaffSelection;
  const { currency, ai: aiSettings, language } = settings;

  const OrderTypeButton = ({ type, label }: { type: OrderType; label: string }) => (
    <button
        onClick={() => { if(type !== 'dine-in') onSetCurrentTable(null); setOrderType(type); }}
        disabled={isSettlingOrder}
        className={`py-1.5 rounded-md font-bold text-xs transition-colors w-full ${
            orderType === type
            ? 'bg-primary text-primary-foreground'
            : 'bg-accent text-accent-foreground hover:bg-muted'
        }`}
    >
        {label}
    </button>
  );

  const renderActionButtons = () => {
    const buttonBaseClass = "w-full h-10 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-transform duration-200 hover:scale-105 hover:shadow-lg";
    const isCartEmpty = (cart || []).length === 0;

    if (isSettlingOrder) {
        return (
            <Button className={`${buttonBaseClass}`} onClick={handleInitiateSettlePayment} disabled={allItemsForBill.length === 0}>
                <CreditCardIcon className="w-5 h-5"/> {t('settle_payment')}
            </Button>
        );
    }

    switch (orderType) {
        case 'takeaway':
        case 'delivery':
            const needsCustomer = orderType === 'delivery' && !selectedCustomer;
            const tooltip = needsCustomer ? t('delivery_needs_customer') : '';
            return (
                <Button onClick={() => handleInitiatePayment(orderType)} disabled={isCartEmpty || needsCustomer} title={tooltip} className={`${buttonBaseClass}`}>
                    <ShoppingBagIcon className="w-5 h-5" /> {t('place_order')}
                </Button>
            );
        case 'tab':
            const needsCustomerForTab = !selectedCustomer;
            const tabTooltip = needsCustomerForTab ? t('tab_needs_customer') : '';
            return (
                 <div className="flex gap-2">
                    <Button onClick={handleSaveTab} disabled={(isCartEmpty && !activeTab) || needsCustomerForTab} title={tabTooltip} className={`${buttonBaseClass}`} variant="outline">
                        <ClipboardDocumentListIcon className="w-5 h-5" /> {activeTab ? t('add_to_tab') : t('open_tab')}
                    </Button>
                    {activeTab && (
                        <Button onClick={handleSettleTab} disabled={needsCustomerForTab} title={tabTooltip} className={`${buttonBaseClass}`}>
                            <CreditCardIcon className="w-5 h-5" /> {t('settle_tab')}
                        </Button>
                    )}
                </div>
            );
        case 'dine-in':
        default:
            const isSendToKitchenDisabled = isCartEmpty || !currentTable;
            const isSettleBillDisabled = (sentItems.length === 0 && isCartEmpty) || !currentTable;
             return (
                <div className="flex gap-2">
                    <Button onClick={() => handleSendToKitchen(orderType)} disabled={isSendToKitchenDisabled} className={`${buttonBaseClass} bg-orange-500 hover:bg-orange-600 text-white`}>
                        <ChefHatIcon className="w-5 h-5"/> {t('send_to_kitchen')}
                    </Button>
                    <Button onClick={handleSettleBill} disabled={isSettleBillDisabled} className={`${buttonBaseClass}`}>
                        <CreditCardIcon className="w-5 h-5" /> {t('settle_bill')}
                    </Button>
                </div>
            );
    }
  };

  return (
    <div className="bg-card rounded-xl shadow-md flex flex-col h-full border border-border">
      <div className="p-1.5 border-b border-border bg-card">
        <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 overflow-hidden">
                 <Button onClick={() => openModal('customerSelect', { customers, onSelectCustomer: handleSelectCustomer, onAddNewCustomer: handleAddNewCustomer })} className="rounded-full h-7 w-7 bg-primary/10 text-primary hover:bg-primary/20 flex-shrink-0">
                    <UserCircleIcon className="w-4 h-4"/>
                </Button>
                <div className="overflow-hidden">
                     <p className="font-bold text-foreground text-xs truncate">{selectedCustomer ? selectedCustomer.name : t('walk_in_customer')}</p>
                     <p className="text-xs text-muted-foreground">{selectedCustomer ? t('member') : t('guest')}</p>
                </div>
                 {showStaffSelection && (
                    <>
                        <div className="w-px h-5 bg-border mx-1"></div>
                        <Button onClick={handleChooseStaff} className="rounded-full h-7 w-7 bg-primary/10 text-primary hover:bg-primary/20 flex-shrink-0">
                            <UserIcon className="w-4 h-4" />
                        </Button>
                        <div className="overflow-hidden">
                            <p className="font-bold text-foreground text-xs truncate">{selectedStaff ? selectedStaff.name : t('choose_staff')}</p>
                            <p className="text-xs text-muted-foreground">{t('serving')}</p>
                        </div>
                    </>
                )}
            </div>
            <div className="flex items-center gap-0.5">
                <Button onClick={handleGetUpsellSuggestions} disabled={(cart || []).length === 0 || isSuggestingUpsell || !aiSettings.enableAIFeatures || !aiSettings.enableUpsell} size="icon" variant="ghost" title={t('ai_upsell')} className="text-muted-foreground hover:text-primary h-7 w-7"><SparklesIcon className={`w-4 h-4 ${isSuggestingUpsell ? 'animate-spin' : ''}`} /></Button>
                <Button onClick={handleHoldOrder} disabled={(cart || []).length === 0 || isSettlingOrder} size="icon" variant="ghost" title={t('hold_order')} className="text-muted-foreground hover:text-primary h-7 w-7"><PauseIcon className="w-4 h-4"/></Button>
                <Button onClick={onVoidOrder} disabled={(cart || []).length === 0 && sentItems.length === 0 && !isSettlingOrder} size="icon" variant="ghost" title={t('void_order')} className="text-muted-foreground hover:text-destructive h-7 w-7"><TrashIcon className="w-4 h-4"/></Button>
                <Button onClick={onNewSaleClick} size="icon" variant="ghost" title={t('new_sale')} className="text-muted-foreground hover:text-primary h-7 w-7"><PlusCircleIcon className="w-4 h-4"/></Button>
            </div>
        </div>
      </div>
      <div className="p-1.5 space-y-1.5">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <span>{isSettlingOrder ? `${t('settling')}: ${currentTable?.name || activeOrderToSettle?.customer?.name || activeTab?.customer?.name}` : (currentTable ? currentTable.name : (activeTab ? `${t('on_tab')}: ${activeTab.customer?.name}` : t('new_order')))}</span>
              {(currentTable || activeTab) && !isSettlingOrder && (<Button variant="link" size="sm" className="p-0 h-auto text-xs" onClick={() => onSetCurrentTable(null)}>({t('change')})</Button>)}
          </h2>

          {!isSettlingOrder && orderType === 'dine-in' && !currentTable && (
              <div className="animate-fade-in-down">
                  <select
                      id="table-select" onChange={handleTableSelection} value=""
                      className="w-full bg-accent border border-border rounded-lg px-3 py-1.5 text-foreground focus:ring-primary focus:border-primary font-semibold text-sm"
                  >
                      <option value="" disabled>{t('select_table')}</option>
                      {Object.entries(availableTablesByFloor).map(([floor, tablesInFloor]) => {
                          if (tablesInFloor.length === 0) return null;
                          return (
                              <optgroup key={floor} label={floor}>
                                  {tablesInFloor.map(table => (
                                      <option key={table.id} value={table.id}>{table.name} (seats {table.capacity})</option>
                                  ))}
                              </optgroup>
                          )
                      })}
                  </select>
              </div>
          )}
          
           {!isSettlingOrder && (
             <div className="grid grid-cols-4 gap-1.5">
                <OrderTypeButton type="dine-in" label={t('dine_in')} />
                {settings.takeAway.enabled && <OrderTypeButton type="takeaway" label={t('take_away')} />}
                {settings.delivery.enabled && <OrderTypeButton type="delivery" label={t('delivery')} />}
                {settings.tab.enabled && <OrderTypeButton type="tab" label={t('tab')} />}
            </div>
           )}
      </div>
      
      <div className="flex-grow overflow-y-auto p-1.5 space-y-1.5 bg-background">
        {allItemsForBill.length === 0 ? (
          <div className="flex-grow flex flex-col justify-center items-center text-muted-foreground p-4 h-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mb-2" fill="none" viewBox="0 0 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <p className="text-center font-medium text-sm">{t('your_cart_is_empty')}</p>
          </div>
        ) : (
          <>
            {(cart || []).length > 0 && (
              <div>
                <h3 className="text-xs font-bold uppercase text-muted-foreground mb-1.5 pt-1.5">
                  {t('new_items')}
                </h3>
                <div className="space-y-1.5">
                  {(cart || []).map((item) => <OrderItem key={item.cartId} cartItem={item} onRemoveItem={onRemoveItem} onUpdateCartQuantity={onUpdateCartQuantity} orderType={orderType} customer={selectedCustomer} />)}
                </div>
              </div>
            )}
            {sentItems.length > 0 && !isSettlingOrder && (
              <div>
                <h3 className="text-xs font-bold uppercase text-muted-foreground mb-1.5 mt-2">{t('running_tab')}</h3>
                <div className="space-y-1.5 opacity-70 pointer-events-none">
                  {sentItems.map((item) => <OrderItem key={item.cartId} cartItem={item} onRemoveItem={() => {}} onUpdateCartQuantity={() => {}} orderType={orderType} customer={selectedCustomer} />)}
                </div>
              </div>
            )}
            {isSettlingOrder && activeOrderToSettle && (
                 <div>
                    <h3 className="text-xs font-bold uppercase text-muted-foreground mb-1.5 mt-2">{t('items_on_bill')}</h3>
                     <div className="space-y-1.5 opacity-70 pointer-events-none">
                        {(activeOrderToSettle.cart || []).map((item) => <OrderItem key={item.cartId} cartItem={item} onRemoveItem={() => {}} onUpdateCartQuantity={() => {}} orderType={orderType} customer={selectedCustomer}/>)}
                    </div>
                </div>
            )}
          </>
        )}
      </div>
      
      <div className="p-1.5 border-t border-border bg-card mt-auto space-y-1.5">
        <AISuggestions suggestions={aiUpsellSuggestions} isLoading={isSuggestingUpsell} onSelectSuggestion={onSelectUpsellSuggestion} language={language.staff} />
        
        <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('subtotal')}</span>
              <span className="font-medium text-foreground">{currency}{subtotal.toFixed(2)}</span>
            </div>
            {Object.entries(taxDetails).map(([name, value]) => (
              <div key={name} className="flex justify-between">
                <span className="text-muted-foreground">{name}</span>
                <span className="font-medium text-foreground">{currency}{value.toFixed(2)}</span>
              </div>
            ))}
            {discountAmount > 0 ? (
              <div className="flex justify-between text-primary">
                <button onClick={handleAddDiscountClick} className="text-primary hover:underline font-semibold">
                  {t('discount')} ({finalAppliedDiscount?.name})
                </button>
                <span className="font-medium">-{currency}{discountAmount.toFixed(2)}</span>
              </div>
            ) : (
                <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('discount')}</span>
                    <button onClick={handleAddDiscountClick} className="text-primary font-semibold hover:underline text-xs">
                        {t('apply_discount')}
                    </button>
                </div>
            )}
            <div className="flex justify-between items-center pt-1 mt-1 border-t border-border">
                <span className="text-sm font-bold text-foreground">{t('total')}</span>
                <div className="text-right">
                    <span className="text-lg font-bold text-primary">{currency}{total.toFixed(2)}</span>
                    {settings.dualCurrency.enabled && (
                        <p className="text-xs text-muted-foreground font-mono">
                            ≈ {settings.dualCurrency.secondaryCurrency} {(total * settings.dualCurrency.exchangeRate).toFixed(2)}
                        </p>
                    )}
                </div>
            </div>
        </div>
        
        {renderActionButtons()}
      </div>
    </div>
  );
}